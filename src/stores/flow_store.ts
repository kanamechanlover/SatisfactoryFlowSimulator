import { defineStore } from 'pinia'
import { useConfigStore } from '@/stores/config_store'
import { Flow, FlowPath } from '@/defines/types/flow'

export const useFlowStore = defineStore('flow', {
    state: () => {
        return {
            /** ルートフロー */
            root: new Flow(),
            /** 設定ストア */
            config: useConfigStore(),
        };
    },
    getters: {
        /**
         * 製品IDリスト取得
         */
        products(state): string[] {
            if(!state.root.materialId) return [];
            return [state.root.materialId];
        },
        /**
         * 指定パスにある製作フロー取得
         * @param [in] path フローパス
         * @return 製作フロー（指定パスが見つからなかったら null）
         */
        flowOnPath(state) {
            return (path: FlowPath = []): Flow | null => {
                let flow: Flow | null = state.root;
                // パスが空ならルートの製作フローを返す
                if (!path.length) return flow;
                // パスがあればパスを辿り切る
                for (let i = 0; i < path.length; i++) {
                    const materialId = path[i];
                    flow = flow.getMaterialFlow(materialId);
                    // パスに製作フローが無ければ終了
                    if (!flow) break;
                }
                return flow;
            };
        },
    },
    actions: {
        /**
         * 現在の設定でフロー更新
         * @param [in] flow 製作フロー
         * @param [in] changedRecipe レシピ変更の有無
         * @note 再帰処理あり
         */
        updateFlow(flow: Flow, changedRecipe: boolean) {
            // 必要数が未設定の場合はデフォルトの分間レートを設定
            const output = this.config.recipeOutput(flow.recipeId);
            const needsOfRecipe = output[flow.materialId];
            const productTime = this.config.productTime(flow.recipeId);
            const toMinute = (v: number) => v * (60 / productTime);
            const makePerMinute = toMinute(needsOfRecipe);
            if (!flow.needs) {
                flow.needs = makePerMinute;
            }
            // レシピの生産数に対する必要数の倍率
            flow.needsRate = flow.needs / makePerMinute;
            // レシピを使用するマシンID
            if (changedRecipe) {
                flow.machineId = this.config.machineIdForRecipe(flow.recipeId);
            }
            // 副産物があれば素材IDと生産数
            if (changedRecipe) {
                const otherOutput = Object.keys(output);
                const byproductId = otherOutput.find((id) => id != flow.materialId);
                flow.byproductId = (byproductId) ? byproductId : '';
            }
            flow.byproductNeeds = (flow.byproductId) ? toMinute(output[flow.byproductId]) * flow.needsRate : 0;
    
            // レシピの素材リスト
            const materials = this.config.recipeInput(flow.recipeId);
            if (changedRecipe) {
                // レシピの変更が有れば素材リストの製作フローを作り直す
                flow.materialFlows = [];
                Object.keys(materials).forEach((id) => {
                    const needs = materials[id];
                    const materialFlow = new Flow(flow);
                    materialFlow.materialId = id;
                    materialFlow.recipeId = this.config.defaultRecipeId(id);
                    materialFlow.needs = toMinute(needs * flow.needsRate);
                    materialFlow.path = flow.path.concat([id]);
                    flow.materialFlows.push(materialFlow);
                    this.updateFlow(materialFlow, changedRecipe);
                });
            }
            else {
                // レシピの変更が無ければ必要数を再帰的に更新
                flow.materialFlows.forEach((materialFlow: Flow, index: number) => {
                    const materialId = materialFlow.materialId;
                    const needs = materials[materialId];
                    materialFlow.needs = needs * flow.needsRate;
                    this.updateFlow(materialFlow, changedRecipe);
                });
            }
        },
        /**
         * 素材を変更（レシピ、必要数も併せてデフォルトに更新）
         * @param [in] path 変更する製作フローパス
         * @param [in] materialId 変更後の素材ID
         */
        setMaterialId(path: FlowPath, materialId: string) {
            // 対象の製作フロー取得
            const flow = this.flowOnPath(path);
            // 指定パスにフローが無ければログを出して何もしない
            if (!flow) {
                console.warn('[FlowStore.setMaterialId] 指定パスが存在しませんでした。' + path);
                return;
            }
            // 対象の製作フローの素材を変更
            flow.materialId = materialId;
            // 対象の製作フローのレシピをデフォルトに変更
            flow.recipeId = this.config.defaultRecipeId(materialId);
            // 必要数をレシピのデフォルトに変更（this.updateFlow にて実施）
            flow.needs = 0;
            // 変更による影響を反映
            this.updateFlow(flow, true);
        },
        /**
         * レシピを変更
         * @param [in] path 変更する製作フローパス
         * @param [in] recipeId 変更後のレシピID
         */
        setRecipeId(path: FlowPath, recipeId: string) {
            // 対象の製作フロー取得
            const flow = this.flowOnPath(path);
            // 指定パスにフローが無ければログを出して何もしない
            if (!flow) {
                console.warn('[FlowStore.setRecipeId] 指定パスが存在しませんでした。' + path);
                return;
            }
            // 対象の製作フローのレシピを変更
            flow.recipeId = recipeId;
            // 変更による影響を反映
            this.updateFlow(flow, true);
        },
        /**
         * 必要数を変更
         * @param [in] path 変更する製作フローパス
         * @param [in] needs 変更後の必要数
         */
        setNeeds(path: FlowPath, needs: number) {
            // 対象の製作フロー取得
            const flow = this.flowOnPath(path);
            // 指定パスにフローが無ければログを出して何もしない
            if (!flow) {
                console.warn('[FlowStore.setRecipeId] 指定パスが存在しませんでした。' + path);
                return;
            }
            // 必要数を変更
            flow.needs = needs;
            // 変更による影響を反映
            this.updateFlow(flow, false);
        },
    }
});

