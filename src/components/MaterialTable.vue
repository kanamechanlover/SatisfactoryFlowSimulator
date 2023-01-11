<template>
    <div class="frame">
        <div class="prodcut-box">
            <h2>必要素材 集計</h2>
            <table>
                <tr class="header">
                    <th>素材名</th>
                    <th>必要数(/分)</th>
                </tr>
                <tr v-for="row in categorisedTable" :key="row.id">
                    <td :colspan="(row.isCategoryRow) ? 2 : 1" :class="{category: row.isCategoryRow}">
                        <div class="material-name-box">
                            <img :src="materialImg(row.id)" v-if="!row.isCategoryRow" />
                            <span>
                                {{ (row.isCategoryRow) ? configStore.materialCategoryName(row.id) : configStore.materialName(row.id) }}
                            </span>
                        </div>
                    </td>
                    <td v-for="product in ((row.isCategoryRow) ? [] : products)" :key="product">
                        {{ productTotal(row.id, product) }}
                    </td>
                </tr>
            </table>
        </div>
        <hr />
        <div class="byproduct-box">
            <h2>副産物生産数　集計</h2>
            <table>
                <tr class="header">
                    <th>副産物名</th>
                    <th>生産数(/分)</th>
                </tr>
                <tr v-for="materialId in byproductTable.materials" :key="materialId">
                    <td>
                        <div class="material-name-box">
                            <img :src="materialImg(materialId)" />
                            <span>{{ configStore.materialName(materialId) }}</span>
                        </div>
                    </td>
                    <td v-for="product in products" :key="product">
                        {{ byproductProductTotal(materialId, product) }}
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed, inject, watchEffect } from 'vue'
import { Flow } from '@/defines/types/flow'
import { useFlowStore } from '@/stores/flow_store'
import { useConfigStore } from '@/stores/config_store'
import { MaterialTable } from '@/defines/types/material_table'
import { CeilDigit } from '@/logics/primitives'
import { config } from 'process'


/** プロパティを定義 */
const Props = {};

/** テンプレート参照する定義 */
interface Refs {
    frame: Ref<HTMLElement|null>,
}

/** カテゴリ名行を含めた表示用クラス */
class CategorisedRow {
    /** ID（isCategoryRow=true 時はカテゴリID、false 時は素材ID */
    public id: string;
    /** カテゴリ名行か */
    public isCategoryRow: boolean;
    constructor(id: string, isCategoryRow: boolean) {
        this.id = id;
        this.isCategoryRow = isCategoryRow;
    }
};

export default defineComponent({
    name: 'material-table',
    props: Props,
    setup(props) {
        // テーブルデータ定義
        const productTable = ref(new MaterialTable());
        const byproductTable = ref(new MaterialTable());
        // 制作フローストア取得
        const flowStore = useFlowStore();
        // 設定ストア取得
        const configStore = useConfigStore();
        // 更新処理定義
        const update = () => {
            // 製品IDリスト
            const products = flowStore.products;
            // テーブル更新
            productTable.value.clear();
            byproductTable.value.clear();
            products.forEach((product: string) => {
                // 制作フローから再帰的にテーブル情報取得する関数定義
                const collectMaterialNeeds = (flow: Flow) => {
                    // 製品IDとその必要数を追加
                    const materialId = flow.materialId;
                    const needs = flow.needs;
                    productTable.value.add(materialId, product, needs);
                    // 生産の際に生成される副産物を追加
                    const byproductId = flow.byproductId;
                    if (byproductId) {
                        const byproductNeeds = flow.byproductNeeds;
                        byproductTable.value.add(byproductId, product, byproductNeeds);
                    }
                    flow.materialIds.forEach((materialId: string) => {
                        const materialFlow = flow.getMaterialFlow(materialId);
                        if (materialFlow) collectMaterialNeeds(materialFlow);
                    });
                };
                // 副産物はルートフローからも取得する
                const rootFlow = flowStore.flowOnPath();
                if (!rootFlow) return; // ルートに素材の指定が無い（ツリーが空）なら場合は
                const byproductId = rootFlow.byproductId;
                if (byproductId) {
                    const byproductNeeds = rootFlow.byproductNeeds;
                    byproductTable.value.add(byproductId, product, byproductNeeds);
                }
                // ルートフローの入力素材から再帰的に走査
                rootFlow.materialIds.forEach((materialId: string) => {
                    const flow = rootFlow.getMaterialFlow(materialId);
                    if (flow) collectMaterialNeeds(flow);
                });
            });
        };
        // 更新処理初回実行
        update();
        // 制作フローが更新されたら呼び出されるようにする
        flowStore.$subscribe(update);

        const refs: Refs = {
            frame: ref(null),
        };

        // computed
        const computes = {
            products: computed((): Array<string> => {
                return flowStore.products;
            }),
            /** カテゴリ分けしたテーブル */
            categorisedTable: computed((): Array<CategorisedRow> => {
                const categoryIds = configStore.materialCategoryIds;
                let table:Array<CategorisedRow> = [];
                categoryIds.forEach((categoryId: string) => {
                    // カテゴリに属する素材IDリストを取得
                    const materialIds = productTable.value.materials.filter((materialId: string) => {
                        return configStore.materialCategory(materialId) == categoryId;
                    });
                    // カテゴリに素材が１つでもあればテーブルに追加
                    if (materialIds.length > 0) {
                        table.push(new CategorisedRow(categoryId, true));
                        table = table.concat(materialIds.map((materialId: string) => new CategorisedRow(materialId, false)));
                    }
                });
                return table;
            }),
        };

        // methods
        const methods = {
            /** 製品毎の総数 */
            productTotal(materialId: string, product: string): string {
                const value = productTable.value.getProductTotal(materialId, product);
                return CeilDigit(value, 6).toString();
            },
            /** 製品毎の副産物の総数 */
            byproductProductTotal(materialId: string, product: string): string {
                const value = byproductTable.value.getProductTotal(materialId, product);
                return CeilDigit(value, 6).toString();
            },
            /** 素材画像 */
            materialImg: computed(() => (materialId: string) => {
                if (!materialId) return '';
                return '/public/assets/materials/' + materialId + '.png';
            }),
        };

        return {
            productTable: productTable,
            byproductTable: byproductTable,
            configStore,
            ...props,
            ...refs,
            ...computes,
            ...methods,
        };
    },
});
</script>

<style src="@/to_dark_theme.css" scoped />

<style scoped>
.frame {
    width: 100%;
    color: white;
}
.product-box {
    width: 100%;
}
h2 {
    margin: 0px;
}
table {
    width: 100%;
    border-spacing: 4px;
    margin-bottom: 8px;
}
th {
    background: orange;
    border-radius: 4px;
    padding: 0px 8px;
}
th:nth-child(1) {
    text-align: left;
}
td {
    padding: 0px 8px;
    border-radius: 4px;
}
td div {
    display: flex;
    align-items: center;
    justify-content: center;
}
td:nth-child(1) {
    font-weight: bold;
}
td:nth-child(1):not(.category) {
    color: black;
    background: burlywood;
}
td:not(:nth-child(1)) {
    color: black;
    background: white;
}
td:nth-child(1):not(.category) div {
    justify-content: left;
}
td div.material-name-box {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
}
td div.material-name-box img {
    width: 1em;
    height: 1em;
}
hr {
  border: 0; 
  height: 1px; 
  background-image: -webkit-linear-gradient(left, transparent, orange, transparent);
  background-image: -moz-linear-gradient(left, transparent, orange, transparent);
  background-image: -ms-linear-gradient(left, transparent, orange, transparent);
  background-image: -o-linear-gradient(left, transparent, orange, transparent); 
}
</style>