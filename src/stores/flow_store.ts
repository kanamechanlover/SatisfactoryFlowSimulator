import { defineStore } from 'pinia'
import { useConfigStore } from '@/stores/config_store'
import { usePresetStore } from './preset_store';
import { Flow, FlowPath } from '@/defines/types/flow'
import Logger from '@/logics/logger'

/** 製品情報クラス */
class Production {
    /** 表示名 */
    name: string;
    /** ルートの製作フロー */
    flow: Flow;
    /** 初期化 */
    constructor(name: string, productId: string = '', flow: Flow | null = null) {
        this.name = name;
        this.flow = (flow) ? flow : new Flow();
        if (productId) this.flow.materialId = productId;
    };
};

export const useFlowStore = defineStore('flow', {
    state: () => {
        return {
            /** 製品リスト */
            products: new Array<Production>(),
            /** 選択中の製品のインデックス */
            selectingProductIndex: 0,
            /** 設定ストア */
            configStore: useConfigStore(),
            /** プリセットストア */
            presetStore: usePresetStore(),
            /** 次作成する製品のサフィックス */
            nextProductNumber: 1,
            /** レシピ一括設定素材マップ */
            batchRecipeMap: new Map<string, string>(),
        };
    },
    getters: {
        /** 製品数取得 */
        productNumber(state): number {
            return state.products.length;
        },
        /**
         * 指定位置の製品（表示）名取得
         * @param productIndex [in] 製品インデックス
         * @return 製品（表示）名
         * @note インデックスが範囲外なら空文字列を返す
         */
        productName(state) {
            return (productIndex: number): string => {
                const product = state.products[productIndex];
                return (product) ? product.name : '';
            };
        },
        /**
         * 指定位置の製品（素材）ID取得
         * @param productIndex [in] 製品インデックス
         * @return 製品（素材）ID
         * @note インデックスが範囲外なら空文字列を返す
         */
        productMaterialId(state) {
            return (productIndex: number): string => {
                const product = state.products[productIndex];
                return (product) ? product.flow.materialId : '';
            };
        },
        /**
         * 製品IDリスト取得
         */
        productIds(state): Array<string> {
            return state.products.map((v) => v.flow.materialId);
        },
        /**
         * 選択中の製品のインデックス取得
         */
        currentProductIndex(state): number {
            return state.selectingProductIndex;
        },
        /**
         * 指定インデックスの製品の生産量
         * @param index [in] 製品インデックス
         */
        productNeeds(state) {
            return (index: number): number => {
                const flow = this.flowOnPath(index);
                return (flow) ? flow.needs : 0;
            };
        },
        /**
         * 指定パスにある製作フロー取得
         * @param index [in] 製品インデックス
         * @param path [in] フローパス
         * @return 製作フロー（指定パスが見つからなかったら null）
         */
        flowOnPath(state) {
            return (index: number, path: FlowPath = []): Flow | null => {
                // 指定位置の製品情報を取得
                const product = state.products[index];
                if (!product) return null; // 位置指定ミス
                // パスが空ならルートの製作フローを返す
                if (!path.length) return product.flow;
                // パスがあればパスを辿り切る
                let flow: Flow | null = product.flow;
                for (let i = 0; i < path.length; i++) {
                    const materialId = path[i];
                    flow = flow.getMaterialFlow(materialId);
                    // パスに製作フローが無ければ終了
                    if (!flow) break;
                }
                return flow;
            };
        },
        /** 指定位置の製品の素材IDが指定されているか */
        isSpecifiedProductId(state) {
            return (index: number): boolean => {
                if (index < 0 || index >= state.products.length) return false; // オーバーフロー
                return state.products[index].flow.materialId != '';
            };
        },
        /** レシピ一括設定にある素材か */
        hasBatchRecipe(state) {
            return (materialId: string): boolean => {
                return state.batchRecipeMap.has(materialId);
            };
        },
        /** レシピ一括設定にある素材IDリスト */
        batchRecipeMaterialIds(state): Array<string> {
            return [...state.batchRecipeMap.keys()];
        },
        /**
         * レシピ一括設定素材のレシピIDを取得
         * @param materialId [in] 素材ID
         * @return レシピID（レシピ一括設定素材マップに無ければ空文字列）
         */
        batchRecipeId(state) {
            return (materialId: string): string => {
                const recipeId = state.batchRecipeMap.get(materialId);
                return (recipeId) ? recipeId : "";
            };
        },
    },
    actions: {
        /** イベント管理用メソッド */

        /**
         * 更新が完了時に呼び出し
         * @note 更新された時にこの関数を呼び出すようにする。
         * @note store.$onAction で更新が完了したことを検知する為に定義
         */
        updated() {
            Logger.log('[flowStore] updated.');
        },

        /** 製品リスト操作用メソッド */

        /**
         * 製品追加
         * @param name [in] 製品名
         * @param id [in] 製品（素材）ID
         */
        addProduct(name: string = '', id: string = '') {
            let productName = (name != '') ? name : "製品" + this.nextProductNumber;
            this.products.push(new Production(productName, id));
            this.nextProductNumber++;
            if (id) {
                // 製品（素材）ID が指定されている場合は中身の構築も合わせて行う
                this.setMaterialId(this.products.length - 1, new FlowPath(), id);
            }
            // 更新完了
            this.updated();
        },
        /**
         * 製品削除
         * @param index [in] 製品インデックス
         */
        removeProduct(index: number) {
            this.products.splice(index, 1);
            // 更新完了
            this.updated();
        },
        /**
         * 選択中の製品のインデックス変更
         * @param index [in] 変更後のインデックス
         */
        setProductIndex(index: number) {
            this.selectingProductIndex = index;
        },
        /**
         * 製品（表示）名変更
         * @param index [in] 製品インデックス
         * @param name [in] 変更後の製品（表示）名
         */
        setProductName(index: number, name: string) {
            if (!this.products[index]) return;
            this.products[index].name = name;
            // 更新完了
            this.updated();
        },

        /**
         * 製品プリセット反映
         * @param tierName [in] ティア名
         * @param presetName [in] プリセット名
         */
        applyProductPreset(tierName: string, presetName: string) {
            const productNames = this.presetStore.productNames(tierName, presetName);
            const productIds = this.presetStore.productIds(tierName, presetName);
            // 製品リストをクリア
            this.products = [];
            // プリセットの製品リストを構築
            productIds.forEach((id, index) => {
                // 製品と製作フロー構築
                const name = productNames[index];
                const production = new Production(name, id);
                // 対象の製作フローのレシピをデフォルトに変更
                production.flow.recipeId = this.configStore.defaultRecipeId(id);
                // 必要数をレシピのデフォルトに変更（this.updateFlow にて実施）
                production.flow.needs = 0;
                // 変更による影響を反映
                this.updateFlow(production.flow, true);
                // 構築した製品データを追加
                this.products.push(production);
            });
            // 更新完了
            this.updated();
        },

        /** 製作フロー操作用メソッド */

        /**
         * 素材を変更（レシピ、必要数も併せてデフォルトに更新）
         * @param index [in] 製品インデックス
         * @param path [in] 変更する製作フローパス
         * @param materialId [in] 変更後の素材ID
         */
        setMaterialId(index: number, path: FlowPath, materialId: string) {
            // 製品取得
            if (!this.products[index]) {
                Logger.warn('無効な製品インデックスが指定されました。' + index, 'FlowStore.setMaterialId');
                return;
            }
            // 対象の製作フロー取得
            const flow = this.flowOnPath(index, path);
            // 指定パスにフローが無ければログを出して何もしない
            if (!flow) {
                Logger.warn('指定パスが存在しませんでした。' + path, 'FlowStore.setMaterialId');
                return;
            }
            // 対象の製作フローの素材を変更
            flow.materialId = materialId;
            // 対象の製作フローのレシピをデフォルトに変更
            flow.recipeId = this.configStore.defaultRecipeId(materialId);
            // 必要数をレシピのデフォルトに変更（this.updateFlow にて実施）
            flow.needs = 0;
            // 変更による影響を反映
            this.updateFlow(flow, true);
            // 更新完了
            this.updated();
        },
        /**
         * レシピを変更
         * @param index [in] 製品インデックス
         * @param path [in] 変更する製作フローパス
         * @param recipeId [in] 変更後のレシピID
         */
        setRecipeId(index: number, path: FlowPath, recipeId: string) {
            // 製品取得
            if (!this.products[index]) {
                Logger.warn('無効な製品インデックスが指定されました。' + index, 'FlowStore.setRecipeId');
                return;
            }
            // 対象の製作フロー取得
            const flow = this.flowOnPath(index, path);
            // 指定パスにフローが無ければログを出して何もしない
            if (!flow) {
                Logger.warn('指定パスが存在しませんでした。' + path, 'FlowStore.setRecipeId');
                return;
            }
            // 対象の製作フローのレシピを変更
            flow.recipeId = recipeId;
            // 変更による影響を反映
            this.updateFlow(flow, true);
            // 更新完了
            this.updated();
        },
        /**
         * 必要数（/分）を変更
         * @param index [in] 製品インデックス
         * @param path [in] 変更する製作フローパス
         * @param needs [in] 変更後の必要数（/分）
         */
        setNeeds(index: number, path: FlowPath, needs: number) {
            // 製品取得
            if (!this.products[index]) {
                Logger.warn('無効な製品インデックスが指定されました。' + index, 'FlowStore.setNeeds');
                return;
            }
            // 対象の製作フロー取得
            const flow = this.flowOnPath(index, path);
            // 指定パスにフローが無ければログを出して何もしない
            if (!flow) {
                Logger.warn('指定パスが存在しませんでした。' + path, 'FlowStore.setRecipeId');
                return;
            }
            // 必要数を変更
            flow.needs = needs;
            // 変更による影響を反映
            this.updateFlow(flow, false);
            // 更新完了
            this.updated();
        },
        /**
         * 現在の設定でフロー更新
         * @param flow [in] 製作フロー
         * @param changedRecipe [in] レシピ変更の有無
         * @note 再帰処理あり
         */
        updateFlow(flow: Flow, changedRecipe: boolean) {
            // 入出力素材を取得
            const inputs = this.configStore.recipeInput(flow.recipeId);
            const outputs = this.configStore.recipeOutput(flow.recipeId);
            if (!inputs || !outputs) {
                Logger.warn('対象のレシピ無し: ' + flow.recipeId, 'FlowStore.updateFlow');
                return;
            }
            // 必要数が未設定の場合はデフォルトの分間レートを設定
            const needsOfRecipe = outputs.find((v) => v !== undefined && v.id == flow.materialId)?.number;
            if (needsOfRecipe === undefined) return; // イレギュラー
            const productTime = this.configStore.recipeProductTime(flow.recipeId);
            const toMinute = (v: number) => v * (60 / productTime);
            const makePerMinute = toMinute(needsOfRecipe);
            if (!flow.needs) {
                flow.needs = makePerMinute;
            }
            // レシピの生産数に対する必要数の倍率
            flow.needsRate = flow.needs / makePerMinute;
            // レシピを使用するマシンID
            if (changedRecipe) {
                flow.machineId = this.configStore.machineIdForRecipe(flow.recipeId);
            }

            // 副産物があれば素材IDと生産数
            if (changedRecipe) {
                const byproductId = outputs.find((v) => v !== undefined && v.id != flow.materialId)?.id;
                flow.byproductId = (byproductId) ? byproductId : '';
            }
            const byproductNeeds = () => {
                const needs = outputs.find((v) => v !== undefined && v.id == flow.byproductId)?.number;
                return (needs) ? toMinute(needs) * flow.needsRate : 0;
            };
            flow.byproductNeeds = (flow.byproductId) ? byproductNeeds() : 0;

            // レシピ一括設定のレシピIDの取得処理
            const getRecipe = (materialId: string): string => {
                // レシピ一括設定に指定されていればそのレシピIDを使用する
                if (this.batchRecipeMap.has(materialId)) {
                    const batchedRecipeId = this.batchRecipeMap.get(materialId);
                    if (!batchedRecipeId) return ''; // イレギュラー（undefined を除外する為）
                    return batchedRecipeId;
                }
                // 指定が無ければデフォルトのレシピIDを返す
                return this.configStore.defaultRecipeId(materialId);
            };

            // レシピの素材リスト
            if (changedRecipe) {
                // レシピの変更が有れば素材リストの製作フローを作り直す
                flow.materialFlows = [];
                inputs.forEach((input) => {
                    const needs = input.number;
                    if (needs === undefined) return; // イレギュラー
                    const materialFlow = new Flow(flow);
                    materialFlow.materialId = input.id;
                    materialFlow.recipeId = getRecipe(input.id);
                    materialFlow.needs = toMinute(needs * flow.needsRate);
                    materialFlow.path = flow.path.concat([input.id]);
                    flow.materialFlows.push(materialFlow);
                    this.updateFlow(materialFlow, changedRecipe);
                });
            }
            else {
                // レシピの変更が無ければ必要数を再帰的に更新
                flow.materialFlows.forEach((materialFlow: Flow, index: number) => {
                    const materialId = materialFlow.materialId;
                    const needs = inputs.find((v) => v !== undefined && v.id == materialId)?.number;
                    if (needs === undefined) return; // イレギュラー
                    materialFlow.needs = toMinute(needs * flow.needsRate);
                    this.updateFlow(materialFlow, changedRecipe);
                });
            }
        },

        /** レシピ一括設定操作用メソッド */

        /**
         * レシピ一括設定追加
         * @param materialId [in] 素材ID
         * @param recipeId [in] レシピID
         * @note 既に設定されていればレシピID更新
         */
        addBatchRecipe(materialId: string, recipeId: string) {
            this.batchRecipeMap.set(materialId, recipeId);
        },
        /**
         * レシピ一括設定削除
         * @param materialId [in] 素材ID
         * @note 無ければ何もしない
         */
        removeBatchRecipe(materialId: string) {
            this.batchRecipeMap.delete(materialId);
        },
        /**
         * レシピ一括変更
         * @param materialId [in] 素材ID
         */
        batchRecipeChange(materialId: string) {
            // 変更後のレシピ取得（レシピが無い場合はデフォルトレシピへの変更とする）
            const tempRecipeId = this.batchRecipeMap.get(materialId);
            const recipeId = (tempRecipeId) ? tempRecipeId : this.configStore.defaultRecipeId(materialId);
            // 製品毎に再帰的に変更
            this.products.forEach((product: Production) => {
                const batch = (flow: Flow) => {
                    // 入力素材を順次チェック
                    flow.materialFlows.forEach((materialFlow: Flow) => {
                        // 対象の素材のレシピが変更後のレシピと異なる場合だけ変更
                        if (materialFlow.materialId == materialId && materialFlow.recipeId != recipeId) {
                            // 対象の製作フローのレシピを変更
                            materialFlow.recipeId = recipeId;
                            // 変更による影響を反映
                            this.updateFlow(materialFlow, true);
                            // 再帰的に次の子は見ない
                            return;
                        }
                        // 再帰的に次の子へ
                        batch(materialFlow);
                    });
                };
                batch(product.flow);
            });
            // 更新完了
            this.updated();
        },
    }
});

