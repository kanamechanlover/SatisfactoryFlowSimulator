<template>
    <div class="frame-material-table">
        <div class="show-mode-box">
            <span>表示製品</span>
            <select @change="onChangeShowProduct" v-if="isShowSingleMode">
                <option value="Total" :selected="productIndexOnSingle == 'Total'">総数</option>
                <option v-for="(option, index) in showProductOptions" :key="index"
                    :selected="index.toString() === productIndexOnSingle" :value="index">
                    {{ option }}
                </option>
            </select>
            <button>{{ showModeButtonText }}</button>
        </div>
        <div class="prodcut-box">
            <h2>必要素材 集計</h2>
            <table>
                <tr class="header" v-if="isShowSingleMode">
                    <th>素材名</th>
                    <th>必要数(/分)</th>
                </tr>
                <tr class="header" v-if="isShowAllMode">
                    <th rowspan="2">素材名</th>
                    <th :colspan="productNumber + 1">必要数(/分)</th>
                </tr>
                <tr class="header" v-if="isShowAllMode">
                    <th>総数</th>
                    <th v-for="(_, index) in productNumber" :key="index">
                        {{ productName(index) }}
                    </th>
                </tr>
                <tr v-for="row in categorisedTable" :key="row.id">
                    <td class="material-name-cell" :class="{category: row.isCategoryRow}"
                            :colspan="(row.isCategoryRow) ? 2 : 1">
                        <div class="material-name-box">
                            <img :src="materialImg(row.id)" v-if="!row.isCategoryRow" />
                            <span>
                                {{ (row.isCategoryRow) ? materialCategoryName(row.id) : materialName(row.id) }}
                            </span>
                        </div>
                    </td>
                    <td class="material-needs-cell" v-for="(_, index) in ((row.isCategoryRow) ? [] : showingProductIndexes)" :key="index">
                        {{ productTableNumber(row.id, index) }}
                    </td>
                </tr>
            </table>
        </div>
        <hr />
        <div class="byproduct-box">
            <h2>副産物生産数 集計</h2>
            <table>
                <tr class="header">
                    <th>副産物名</th>
                    <th>生産数(/分)</th>
                </tr>
                <tr v-for="materialId in byproductMaterialIds" :key="materialId">
                    <td class="material-name-cell">
                        <div class="material-name-box">
                            <img :src="materialImg(materialId)" />
                            <span>{{ materialName(materialId) }}</span>
                        </div>
                    </td>
                    <td class="material-needs-cell" v-for="(_, index) in showingProductIndexes" :key="index">
                        {{ byproductTableNumber(materialId, index) }}
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useFlowStore } from '@/stores/flow_store'
import { useImageStore } from '@/stores/image_store'
import { CeilDigit } from '@/logics/primitives'

// 子コンポーネント ---------------------------------------------


// 内部定義 -----------------------------------------------------

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

/** 表示モード（値はボタンの表示テキスト） */
const ShowMode = {
    /** 一覧表示 */
    All: {
        Id: 'All',
        Button: '個別表示に戻す',
    },
    /** 個別表示 */
    Single: {
        Id: 'Single',
        Button: '一覧',
    },
} as const;

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 製作フローストア取得 */
const flowStore = useFlowStore();

/** 画像ストア */
const imageStore = useImageStore();

/** 一覧表示モードフラグ（true: 一覧表示 */
const showMode = ref(ShowMode.Single.Id as string);

/** 個別表示モード時に表示する製品インデックス（総数の時は "Total"）*/
const productIndexOnSingle = ref('Total');

// 内部関数 -----------------------------------------------------

// Getters -----------------------------------------------------

/** 個別表示モードか */
const isShowSingleMode = computed((): boolean => {
    return showMode.value == ShowMode.Single.Id;
});
/** 一覧表示モードか */
const isShowAllMode = computed((): boolean => {
    return showMode.value == ShowMode.All.Id;
});
/** 表示モード切り替えボタンの表示テキスト */
const showModeButtonText = computed((): string => {
    if (isShowAllMode.value)
        return ShowMode.All.Button;
    if (isShowSingleMode.value)
        return ShowMode.Single.Button;
    return "";
});
/** 製品（素材）名リスト */
const showProductOptions = computed(() => {
    return [...Array(productNumber.value).keys()].map((i) => {
        return flowStore.productName(i)
    });
});
/** 現在表示中の製品インデックスリスト */
const showingProductIndexes = computed((): Array<number> => {
    if (isShowAllMode.value) {
        // 一覧表示モード時は、総数を含めた全ての製品を表示
        return [...Array(productNumber.value).keys()];
    }
    if (isShowSingleMode.value) {
        // 個別表示モード時は、現在選択中の製品のみ表示
        if (productIndexOnSingle.value == "Total")
            return [0];
        else
            return [Number(productIndexOnSingle.value)];
    }
    return [];
});
/** 製品（素材）名 */
const productName = computed(() => (index: number): string => {
    return flowStore.productName(index);
});

/** 製品リスト */
const productIds = computed((): Array<string> => {
    return flowStore.productIds;
});
/** 製品数 */
const productNumber = computed((): number => {
    return flowStore.productNumber;
});

/** 素材IDリスト */
const productMaterialIds = computed((): Array<string> => {
    return flowStore.productTable.getAllMaterials();
});

/** 副産物IDリスト */
const byproductMaterialIds = computed((): Array<string> => {
    return flowStore.byproductTable.getAllMaterials();
});

/** カテゴリ分けしたテーブル */
const categorisedTable = computed((): Array<CategorisedRow> => {
    const categoryIds = configStore.materialCategoryIds;
    let table:Array<CategorisedRow> = [];
    categoryIds.forEach((categoryId: string) => {
        // カテゴリに属する素材IDリストを取得
        const materialIds = productMaterialIds.value.filter((materialId: string) => {
            return configStore.materialCategory(materialId) == categoryId;
        });
        // カテゴリに素材が１つでもあればテーブルに追加
        if (materialIds.length > 0) {
            table.push(new CategorisedRow(categoryId, true));
            table = table.concat(materialIds.map((materialId: string) => new CategorisedRow(materialId, false)));
        }
    });
    return table;
});

/** 素材画像 */
const materialImg = computed(() => (materialId: string) => {
    if (!materialId) return '';
    return imageStore.getData(materialId);
});

/** 素材テーブルセルの値取得 */
const productTableNumber = computed(() => (materialId: string, index: number): string => {
    const value = flowStore.productTable.getNumber(materialId, index);
    const ceiledValue = CeilDigit(value, 6);
    const isMinimalError = ceiledValue - Math.floor(ceiledValue) <= 0.000001; // 0.000001 以下はさらに丸める
    return (isMinimalError) ? Math.floor(ceiledValue).toString() : ceiledValue.toString();
});
/** 副産物テーブルセルの値取得 */
const byproductTableNumber = computed(() => (materialId: string, index: number): string => {
    const value = flowStore.byproductTable.getNumber(materialId, index);
    const ceiledValue = CeilDigit(value, 6);
    const isMinimalError = ceiledValue - Math.floor(ceiledValue) <= 0.000001; // 0.000001 以下はさらに丸める
    return (isMinimalError) ? Math.floor(ceiledValue).toString() : ceiledValue.toString();
});

/** 素材名取得 */
const materialName = computed(() => (materialId: string): string => {
    return configStore.materialName(materialId);
});

/** 素材のカテゴリ名取得 */
const materialCategoryName = computed(() => (materialId: string): string => {
    return configStore.materialCategoryName(materialId);
});

// Actions -----------------------------------------------------

/** 一覧表示モードへ */
const toShowAllMode = () => {
    showMode.value = ShowMode.All.Id;
};
/** 個別表示モードへ */
const toNormalMode = () => {
    showMode.value = ShowMode.Single.Id;
};

/** 個別表示時に表示する製品（素材）変更 */
const onChangeShowProduct = (event: Event) => {
    if (!(event.target instanceof HTMLSelectElement)) return;

}

// サイクル -----------------------------------------------------


</script>

<style src="@/to_dark_theme.css" scoped />

<style scoped>
.frame-material-table {
    width: 100%;
    color: white;
    white-space: nowrap;
}

.show-mode-box {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 4px;
}
.show-mode-box span {
}
.show-mode-box select {
    flex: 1;
}
.show-mode-box button {
    font-size: 0.8em;
    padding: 0px 4px;
}
.show-mode-box button:hover {
    background: var(--dark-main-color);
    border: 1px solid transparent;
    padding: 0px 4px;
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
    font-size: 0.8em;
    line-height: 1em;
    table-layout: fixed;
}
th {
    background: orange;
    border-radius: 4px;
    padding: 4px 8px;
}
th:nth-child(1) {
    text-align: left;
}
th:nth-child(2) {
    width: 7em;
}
td {
    padding: 4px 8px;
    border-radius: 4px;
}
td div {
    display: flex;
    align-items: center;
    justify-content: center;
}
td.material-name-cell {
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
}
td.material-name-cell:not(.category) {
    color: black;
    background: burlywood;
}
td.material-name-cell:not(.category) div {
    justify-content: left;
}

td.material-needs-cell {
    color: black;
    background: white;
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