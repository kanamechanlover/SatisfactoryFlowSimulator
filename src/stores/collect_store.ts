import { defineStore } from 'pinia'
import { useConfigStore } from '@/stores/config_store'
import { useFlowStore } from '@/stores/flow_store'
import { Flow } from '@/defines/types/flow'
import { MaterialTable } from '@/defines/types/material_table'
import Logger from '@/logics/logger'

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
    /** 集計結果の表示モード */
    materialTableShowMode: string;
    constructor() {
        this.productTable = new MaterialTable();
        this.byproductTable = new MaterialTable();
        this.materialTableShowMode = MaterialTableShowMode.Single;
    }
};

export const useCollectStore = defineStore('collect', {
    state: () => {
        return {
            /** 集計結果 */
            summary: new Summary(),
            /** 設定ストア */
            configStore: useConfigStore(),
            /** 製作フローストア */
            flowStore: useFlowStore(),
        };
    },
    getters: {
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
         * 現在の製作フローを元に集計テーブルを更新
         */
        updateTable() {
            // テーブル更新
            this.summary.productTable.clear();
            this.summary.byproductTable.clear();
            this.flowStore.productIds.forEach((productId: string, index: number) => {
                // 製品名取得
                const productName = this.flowStore.productName(index);
                // テーブルに列追加
                this.summary.productTable.addHeader(productName);
                this.summary.byproductTable.addHeader(productName);

                // ルートに素材の指定が無い（ツリーが空）なら集計不要
                const rootFlow = this.flowStore.flowOnPath(index);
                if (!rootFlow) return;

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

                // 副産物はルートフローからも取得する
                //（ルートのは一番上に配置する為先に取得しておく）
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
            Logger.log('[collectStore] updated.');
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