import { defineStore } from 'pinia'
import { useConfigStore } from '@/stores/config_store'
import { Flow, FlowPath } from '@/defines/types/flow'
import { MaterialTable } from '@/defines/types/material_table'
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

/** 集計結果の表示モード */
export const MaterialTableShowMode = {
    /** 一覧表示 */
    All: 'All',
    /** 個別表示 */
    Single: 'Single',
} as const;

/** 集計情報クラス */
class Summary {
    /** 素材集計結果 */
    productTable: MaterialTable;
    /** 副産物集計結果 */
    byproductTable: MaterialTable;
    /** 収集結果の表示モード */
    materialTableShowMode: string;
    constructor() {
        this.productTable = new MaterialTable();
        this.byproductTable = new MaterialTable();
        this.materialTableShowMode = MaterialTableShowMode.Single;
    }
};

export const useFlowStore = defineStore('flow', {
    state: () => {
        return {
            /** 製品リスト */
            products: new Array<Production>(),
            /** 選択中の製品のインデックス */
            selectingProductIndex: 0,
            /** 集計結果 */
            summary: new Summary(),
            /** 設定ストア */
            config: useConfigStore(),
            /** 次作成する製品のサフィックス */
            nextProductNumber: 1,
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
         * 指定位置の製品（表示）名取得
         * @param productIndex [in] 製品インデックス
         * @return 製品（表示）名
         * @note インデックスが範囲外なら空文字列を返す
         */
        productId(state) {
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
                return state.products[index].flow.materialId != '';
            };
        },
        /** 素材集計テーブルを取得 */
        productTable(state) {
            return state.summary.productTable;
        },
        /** 副産物集計テーブルを取得 */
        byproductTable(state) {
            return state.summary.byproductTable;
        },
        /** 集計結果の表示モードが「一覧表示」か */
        isAllShowMode(state): boolean {
            return state.summary.materialTableShowMode == MaterialTableShowMode.All;
        },
        /** 集計結果の表示モードが「個別表示」か */
        isSingleShowMode(state): boolean {
            return state.summary.materialTableShowMode == MaterialTableShowMode.Single;
        },
        /** 集計結果の表示モード */
        materialTableShowMode(state): string {
            return state.summary.materialTableShowMode;
        },
    },
    actions: {
        /**
         * 製品追加
         * @param name [in] 製品名
         * @param id [in] 製品（素材）ID
         */
        addProduct(name: string = '', id: string = '') {
            let productName = (name != '') ? name : "製品" + this.nextProductNumber;
            this.products.push(new Production(productName, id));
            this.nextProductNumber++;
        },
        /**
         * 製品削除
         * @param index [in] 製品インデックス
         */
        removeProduct(index: number) {
            this.products.splice(index, 1);
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
        },
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
            flow.recipeId = this.config.defaultRecipeId(materialId);
            // 必要数をレシピのデフォルトに変更（this.updateFlow にて実施）
            flow.needs = 0;
            // 変更による影響を反映
            this.updateFlow(flow, true);
            // 集計結果にも反映
            this.updateTable();
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
            // 集計結果にも反映
            this.updateTable();
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
            // 集計結果にも反映
            this.updateTable();
        },
        /**
         * 現在の設定でフロー更新
         * @param flow [in] 製作フロー
         * @param changedRecipe [in] レシピ変更の有無
         * @note 再帰処理あり
         */
        updateFlow(flow: Flow, changedRecipe: boolean) {
            // 入出力素材を取得
            const inputs = this.config.recipeInput(flow.recipeId);
            const outputs = this.config.recipeOutput(flow.recipeId);
            if (!inputs || !outputs) {
                Logger.warn('対象のレシピ無し: ' + flow.recipeId, 'FlowStore.updateFlow');
                return;
            }
            // 必要数が未設定の場合はデフォルトの分間レートを設定
            const needsOfRecipe = outputs.find((v) => v !== undefined && v.id == flow.materialId)?.number;
            if (needsOfRecipe === undefined) return; // イレギュラー
            const productTime = this.config.recipeProductTime(flow.recipeId);
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
                const byproductId = outputs.find((v) => v !== undefined && v.id != flow.materialId)?.id;
                flow.byproductId = (byproductId) ? byproductId : '';
            }
            const byproductNeeds = () => {
                const needs = outputs.find((v) => v !== undefined && v.id == flow.byproductId)?.number;
                return (needs) ? toMinute(needs) * flow.needsRate : 0;
            };
            flow.byproductNeeds = (flow.byproductId) ? byproductNeeds() : 0;
    
            // レシピの素材リスト
            if (changedRecipe) {
                // レシピの変更が有れば素材リストの製作フローを作り直す
                flow.materialFlows = [];
                inputs.forEach((input) => {
                    const needs = input.number;
                    if (needs === undefined) return; // イレギュラー
                    const materialFlow = new Flow(flow);
                    materialFlow.materialId = input.id;
                    materialFlow.recipeId = this.config.defaultRecipeId(input.id);
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
        /**
         * 現在の製作フローを元に集計テーブルを更新
         */
        updateTable() {
            // テーブル更新
            this.summary.productTable.clear();
            this.summary.byproductTable.clear();
            this.products.forEach((product, index: number) => {
                // テーブルに列追加
                this.summary.productTable.addHeader(product.name);
                this.summary.byproductTable.addHeader(product.name);
                // 製作フローから再帰的にテーブル情報取得する関数定義
                const collectMaterialNeeds = (flow: Flow) => {
                    // 製品IDとその必要数を追加
                    this.summary.productTable.addNumber(flow.materialId, index, flow.needs);
                    // 生産の際に生成される副産物を追加
                    if (flow.byproductId) {
                        this.summary.byproductTable.addNumber(flow.byproductId, index, flow.byproductNeeds);
                    }
                    flow.materialIds.forEach((materialId: string) => {
                        const materialFlow = flow.getMaterialFlow(materialId);
                        if (materialFlow) collectMaterialNeeds(materialFlow);
                    });
                };
                // ルートに素材の指定が無い（ツリーが空）なら集計不要
                if (!product.flow) return;

                // 副産物はルートフローからも取得する
                const rootFlow = product.flow;
                const byproductId = rootFlow.byproductId;
                if (byproductId) {
                    const byproductNeeds = rootFlow.byproductNeeds;
                    this.summary.byproductTable.addNumber(byproductId, index, byproductNeeds);
                }
                // ルートフローの入力素材から再帰的に走査
                rootFlow.materialIds.forEach((materialId: string) => {
                    const flow = rootFlow.getMaterialFlow(materialId);
                    if (flow) collectMaterialNeeds(flow);
                });
            });
        },
        /** 集計結果の表示モードを「一覧表示」に切り替え */
        toAllShowMode() {
            this.summary.materialTableShowMode = MaterialTableShowMode.All;
        },
        /** 集計結果の表示モードを「個別表示」に切り替え */
        toSingleShowMode() {
            this.summary.materialTableShowMode = MaterialTableShowMode.Single;
        },
    }
});

