<template>
    <div class="material-table-frame">
        <div class="show-mode-box">
            <span class="show-mode-text">{{ showModeText }}</span>
            <CustomDropdown>
                <template #toggle>
                    <span class="batch-recipe-list-button" :title="tooltips.BatchRecipeListButton">
                        <fa :icon="['fas', 'clipboard']"></fa>
                    </span>
                </template>
                <div class="batch-recipe-list-dropdown-container">
                    <div class="header">レシピ一括設定リスト</div>
                    <table class="batch-recipe-list-table">
                        <tr>
                            <th>素材名</th>
                            <th>レシピ名</th>
                        </tr>
                        <tr v-for="materialId in batchRecipeMaterialIds" :key="materialId">
                            <td>
                                <img :src="materialImg(materialId)" />
                                <span>{{ materialName(materialId) }}</span>
                            </td>
                            <td>{{ recipeName(batchRecipeId(materialId)) }}</td>
                        </tr>
                    </table>
                </div>
            </CustomDropdown>
            <button @click="toggleShowMode" :title="showModeButtonTooltip">{{ showModeButtonText }}</button>
        </div>
        <div class="select-wrapper" v-if="isShowSingleMode">
            <img :src="productImage(productIndexOnSingle - 1)"
                v-show="productImage(productIndexOnSingle - 1)"
                :title="productMaterialName(productIndexOnSingle - 1)" />
            <select @change="onChangeShowProduct">
                <option value="Total" :selected="isShowingTotal">総数</option>
                <option v-for="(option, index) in showProductOptions" :key="index"
                    :selected="index + 1 === productIndexOnSingle" :value="index">
                    {{ option }}
                </option>
            </select>
            <span v-if="!isShowingTotal">{{ productNeeds }} /分</span>
        </div>
        <div class="tables" ref="tableBox">
            <div class="product-box">
                <hr />
                <h2>必要素材 集計</h2>
                <hr />
                <table class="product-table">
                    <tr class="header" v-if="isShowSingleMode">
                        <th class="material-name-column">素材名</th>
                        <th>必要数(/分)</th>
                    </tr>
                    <tr class="header" v-if="isShowAllMode">
                        <th rowspan="2" class="material-name-column">素材名</th>
                        <th :colspan="productNumber + 1">必要数(/分)</th>
                    </tr>
                    <tr class="header" v-if="isShowAllMode">
                        <th>総数</th>
                        <th v-for="(_, index) in productNumber" :key="index"
                                :title="productHeaderTipText(index)">
                            <div class="product-name-header">
                                <img :src="productImg(index)" v-if="productImg(index)" />
                                <span class="text-container">
                                    <span class="name">{{ productName(index) }}</span>
                                    <span class="needs">{{ productNeedsAt(index) }} /分</span>
                                </span>
                            </div>
                        </th>
                    </tr>
                    <tr v-for="row in categorisedTable" :key="((row.isCategoryRow) ? 'Category' : '') + row.id">
                        <td class="material-name-cell" :class="{category: row.isCategoryRow}"
                                :colspan="productColspanNum(row.isCategoryRow)">
                            <div class="material-name-box">
                                <img :src="materialImg(row.id)" v-if="!row.isCategoryRow && materialImg(row.id)" />
                                <span v-if="row.isCategoryRow" class="category-name">
                                    {{ materialCategoryName(row.id) }}
                                </span>
                                <span v-if="!row.isCategoryRow" class="material-name" :title="materialName(row.id)">
                                    {{ materialName(row.id) }}
                                </span>
                                <span v-if="isMaterialBatchedSetRecipe(row.id) && !row.isCategoryRow"
                                        class="batch-recipe-icon" @click="onClickBatchRecipeIcon(row.id)"
                                        :title="tooltips.BatchRecipeIcon + recipeName(batchRecipeId(row.id))">
                                    <fa :icon="['fas', 'clipboard']"></fa>
                                </span>
                                <CustomDropdown v-if="!row.isCategoryRow && recipeIdsForMaterial(row.id).length > 1"
                                        :limit-element="tableBox" ref="batchRecipeDropdowns">
                                    <template #toggle>
                                        <span class="batch-recipe-button" :title="tooltips.BatchRecipeButton">
                                            <fa :icon="['fas', 'clipboard']"></fa>
                                        </span>
                                    </template>
                                    <RecipeSelectContent :material-id="row.id"
                                        @select="(recipeId: string) => onChangeBatchRecipe(row.id, recipeId) ">
                                    </RecipeSelectContent>
                                </CustomDropdown>
                            </div>
                        </td>
                        <td class="material-needs-cell" :class="{'not-use': !isUseProductCell(row.id, index)}"
                                v-for="(_, index) in ((row.isCategoryRow) ? [] : showingProductIndexes)" :key="index">
                            {{ productTableNumber(row.id, index) }}
                        </td>
                    </tr>
                </table>
            </div>
            <div class="byproduct-box">
                <hr />
                <h2>副産物生産数 集計</h2>
                <hr />
                <table class="product-table">
                    <tr class="header" v-if="isShowSingleMode">
                        <th class="material-name-column">副産物名</th>
                        <th>必要数(/分)</th>
                    </tr>
                    <tr class="header" v-if="isShowAllMode">
                        <th rowspan="2" class="material-name-column">副産物名</th>
                        <th :colspan="productNumber + 1">必要数(/分)</th>
                    </tr>
                    <tr class="header" v-if="isShowAllMode">
                        <th>総数</th>
                        <th v-for="(_, index) in productNumber" :key="index"
                                :title="productHeaderTipText(index)">
                            <div class="product-name-header">
                                <img :src="productImg(index)" v-if="productImg(index)" />
                                <span class="text-container">
                                    <span class="name">{{ productName(index) }}</span>
                                    <span class="needs">{{ productNeedsAt(index) }} /分</span>
                                </span>
                            </div>
                        </th>
                    </tr>
                    <tr v-for="materialId in byproductMaterialIds" :key="materialId">
                        <td class="material-name-cell">
                            <div class="material-name-box">
                                <img :src="materialImg(materialId)" v-if="materialImg(materialId)" />
                                <span>{{ materialName(materialId) }}</span>
                            </div>
                        </td>
                        <td class="material-needs-cell" :class="{'not-use': !isUseByproductCell(materialId, index)}"
                                v-for="(_, index) in showingProductIndexes" :key="index">
                            {{ byproductTableNumber(materialId, index) }}
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { MaterialTableShowMode, useFlowStore } from '@/stores/flow_store'
import { useImageStore } from '@/stores/image_store'
import { ConfigRecipe } from '@/defines/types/config'
import { RoundDigit } from '@/logics/primitives'

// 子コンポーネント ---------------------------------------------

import CustomDropdown from '@/components/generic/CustomDropdown.vue'
import RecipeSelectContent from '@/components/RecipeSelectContent.vue'

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

/** 表示モードテキスト */
const ShowModeText = {
    [MaterialTableShowMode.All]: "集計結果（一覧表示）",
    [MaterialTableShowMode.Single]: "集計結果（個別表示）",
} as {[key: string]: string};

/** 表示モード切り替えボタンのテキスト */
const ShowModeButtonText = {
    [MaterialTableShowMode.All]: "個別表示に戻る",
    [MaterialTableShowMode.Single]: "一覧",
} as {[key: string]: string};

// ツールチップ文言一覧
const tooltips = {
    ShowModeToAll: '表示モードを「一覧表示」に切り替えます。',
    ShowModeToSingle: '表示モードを「個別表示」に切り替えます。',
    BatchRecipeIcon: 'レシピ一括設定が有効になっている素材です。\nクリックすると無効になります。\n現在のレシピ：',
    BatchRecipeButton: 'この素材のレシピを一括で設定します。',
    BatchRecipeListButton: '現在有効になっているレシピ一括設定リストを表示します。'
} as const;

/** 表示モード切り替えボタンのツールチップ */
const ShowModeButtonTooltip = {
    [MaterialTableShowMode.All]: tooltips.ShowModeToSingle,
    [MaterialTableShowMode.Single]: tooltips.ShowModeToAll,
} as {[key: string]: string};

/** 不使用セルの代替テキスト */
const NotUseCellText = "-";

/** 表示する小数点以下の桁数 */
const UnderDigitNumber = 6;

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 製作フローストア取得 */
const flowStore = useFlowStore();

/** 画像ストア */
const imageStore = useImageStore();

/** 個別表示モード時に表示する製品インデックス（0 は総数）*/
const productIndexOnSingle = ref(0);

/** ドロップダウンの制限領域に使用する要素 */
const tableBox = ref<HTMLElement|undefined>(undefined);

/** ドロップダウンコンポーネント */
const batchRecipeDropdowns = ref<Array<HTMLElement>|undefined>(undefined);

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------

/** 個別表示モードか */
const isShowSingleMode = computed((): boolean => {
    return flowStore.isSingleShowMode;
});
/** 一覧表示モードか */
const isShowAllMode = computed((): boolean => {
    return flowStore.isAllShowMode;
});
/** 表示モードのテキスト */
const showModeText = computed((): string => {
    return ShowModeText[flowStore.materialTableShowMode];
});
/** 表示モード切り替えボタンのテキスト */
const showModeButtonText = computed((): string => {
    return ShowModeButtonText[flowStore.materialTableShowMode];
});
/** 表示モード切り替えボタンのツールチップ */
const showModeButtonTooltip = computed((): string => {
    return ShowModeButtonTooltip[flowStore.materialTableShowMode];
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
        return [...Array(productNumber.value + 1).keys()];
    }
    if (isShowSingleMode.value) {
        // 個別表示モード時は、現在選択中の製品のみ表示
        return [productIndexOnSingle.value];
    }
    return [];
});
/** 総数表示中か */
const isShowingTotal = computed((): boolean => {
    return productIndexOnSingle.value == 0;
});

/** 製品（素材）ID */
const productId = computed(() => (index: number): string => {
    return flowStore.productMaterialId(index);
});
/** 製品（素材）画像 */
const productImage = computed(() => (index: number): string => {
    return imageStore.getData(productId.value(index));
});
/** 製品（素材）名 */
const productMaterialName = computed(() => (index: number): string => {
    return configStore.materialName(productId.value(index));
});

/** 製品名 */
const productName = computed(() => (index: number): string => {
    return flowStore.productName(index);
});
/** 製品数 */
const productNumber = computed((): number => {
    return flowStore.productNumber;
});
/** 製品列数（総数列含む） */
const productColspanNum = computed(() => (isCategoryRow: boolean): number => {
    const isSingle = isShowSingleMode.value;
    const isAll = isShowAllMode.value;
    const productNum = productNumber.value;
    // カテゴリ行でなければ結合しない
    if (!isCategoryRow) return 1;
    // カテゴリ行なら表示モードによって分岐
    if (isSingle) return 2; // 個別表示なら常に2セル結合
    else if (isAll) return productNum + 2; // 一覧表示なら製品数＋総数＋素材名
    // イレギュラー
    return 1;
})

/** 一覧表示時の製品ヘッダのツールチップ */
const productHeaderTipText = computed(() => (index: number): string => {
    const name1 = productName.value(index);
    const name2 = productMaterialName.value(index);
    const needs = productNeedsAt.value(index);
    return [
        '製品名: ' + name1,
        '製品（素材）名: ' + ((name2) ? name2 : '指定無し'),
        '生産量: ' + needs + '/分',
    ].join('\n');
});

/** 素材IDリスト */
const productMaterialIds = computed((): Array<string> => {
    return flowStore.productTable.getAllMaterials();
});

/** 副産物IDリスト */
const byproductMaterialIds = computed((): Array<string> => {
    const materialIds = flowStore.byproductTable.getAllMaterials();
    // 表示数が 0 のものは除外
    const existMaterialIds = materialIds.filter((materialId: string) => {
        return showingProductIndexes.value.some((index: number) => {
            return flowStore.byproductTable.getNumber(materialId, index) > 0;
        });
    });
    return existMaterialIds;
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
        // 表示数が 0 のものは除外
        const existMaterialIds = materialIds.filter((materialId: string) => {
            return showingProductIndexes.value.some((index: number) => {
                return flowStore.productTable.getNumber(materialId, index) > 0;
            });
        });
        // カテゴリに素材が１つでもあればテーブルに追加
        if (existMaterialIds.length > 0) {
            table.push(new CategorisedRow(categoryId, true));
            table = table.concat(existMaterialIds.map((materialId: string) => new CategorisedRow(materialId, false)));
        }
    });
    return table;
});

/** 素材画像 */
const materialImg = computed(() => (materialId: string) => {
    if (!materialId) return '';
    return imageStore.getData(materialId);
});

/** 製品画像 */
const productImg = computed(() => (index: number): string => {
    if (index < 0 && index < productNumber.value) return '';
    const productId = flowStore.productMaterialId(index);
    return imageStore.getData(productId);
});

/**
 * 素材テーブルセルが使用値か
 * @param materialId [in] 素材ID
 * @param index [in] 製品インデックス
 * @retval true : 使用セル
 * @retval false : 不使用セル
 */
const isUseProductCell = computed(() => (materialId: string, index: number): boolean => {
    const value = productTableNumber.value(materialId, index);
    return value != NotUseCellText;
});

/**
 * 副産物テーブルセルが使用値か
 * @param materialId [in] 素材ID
 * @param index [in] 製品インデックス
 * @retval true : 使用セル
 * @retval false : 不使用セル
 */
const isUseByproductCell = computed(() => (materialId: string, index: number): boolean => {
    const value = byproductTableNumber.value(materialId, index);
    return value != NotUseCellText;
});

/**
 * 素材テーブルセルの値取得
 * @param materialId [in] 素材ID
 * @param index [in] 製品インデックス
 * @retval NotUseCellText : 不使用セル
 */
const productTableNumber = computed(() => (materialId: string, index: number): string => {
    // インデックスが総数以外で、製品名の指定が無い場合は代替テキストを表示
    if (index > 0 && !flowStore.isSpecifiedProductId(index - 1)) return NotUseCellText;
    // セルの値を取得
    const value = flowStore.productTable.getNumber(materialId, index);
    // 値が 0 の場合は関係のない値の為代替テキストを表示
    if (!value) return NotUseCellText;
    // 小数点以下 6 桁までに丸める
    return RoundDigit(value, UnderDigitNumber).toString();
});
/**
 * 副産物テーブルセルの値取得
 * @param materialId [in] 素材ID
 * @param index [in] 製品インデックス
 * @retval NotUseCellText : 不使用セル
 */
const byproductTableNumber = computed(() => (materialId: string, index: number): string => {
    // インデックスが総数以外で、製品名の指定が無い場合は代替テキストを表示
    if (index > 0 && !flowStore.isSpecifiedProductId(index - 1)) return NotUseCellText;
    // セルの値を取得
    const value = flowStore.byproductTable.getNumber(materialId, index);
    // 値が 0 の場合は関係のない値の為代替テキストを表示
    if (!value) return NotUseCellText;
    // 小数点以下 6 桁までに丸める
    return RoundDigit(value, 6).toString();
});

/** 素材名取得 */
const materialName = computed(() => (materialId: string): string => {
    return configStore.materialName(materialId);
});

/** 素材のカテゴリ名取得 */
const materialCategoryName = computed(() => (materialId: string): string => {
    return configStore.materialCategoryName(materialId);
});

/**
 * 製品生産量取得
 */
const productNeeds = computed((): string => {
    return productNeedsAt.value(productIndexOnSingle.value - 1);
});
/**
 * 製品生産量取得
 * @param index [in] 製品インデックス
 */
const productNeedsAt = computed(() => (index: number): string => {
    const needs = flowStore.productNeeds(index);
    return RoundDigit(needs, UnderDigitNumber).toString();
});

/**
 * レシピ一括設定されている素材か
 */
const isMaterialBatchedSetRecipe = computed(() => (materialId: string): boolean => {
    return flowStore.hasBatchRecipe(materialId);
});

/**
 * レシピ一括設定の素材IDリスト
 */
const batchRecipeMaterialIds = computed((): Array<string> => {
    return flowStore.batchRecipeMaterialIds;
});

/**
 * レシピ一括設定されている素材のレシピIDを取得
 * @param materialId [in] 素材名
 * @return レシピID
 */
const batchRecipeId = computed(() => (materialId: string): string => {
    return flowStore.batchRecipeId(materialId);
});

/**
 * 出力に指定素材を持つレシピIDリストを取得
 * @param materialId [in] 素材ID
 * @return 素材IDリスト
 * @note 基本レシピは先頭に配置される
 */
const recipeIdsForMaterial = computed(() => (materialId: string): Array<string> => {
    // 対象のレシピIDリスト取得
    const list = configStore.recipesHasOutputMaterialId(materialId).map((recipe: ConfigRecipe) => recipe.id);
    // 基本レシピだけは先頭に配置
    const defaultRecipeId = configStore.defaultRecipeId(materialId);
    return [defaultRecipeId].concat(list.filter((id: string) => id != defaultRecipeId));
});

/**
 * レシピ名取得
 * @param recipeId [in] レシピID
 * @return レシピ名
 */
const recipeName = computed(() => (recipeId: string): string => {
    return configStore.recipeName(recipeId);
});

/**
 * 指定素材のデフォルトレシピか
 * @param materialId [in] 素材ID
 * @param recipeId [in] レシピID
 * @return デフォルトレシピなら true
 */
const isDefaultRecipe = computed(() => (materialId: string, recipeId: string) => {
    return configStore.defaultRecipeId(materialId) == recipeId;
});

// Actions -----------------------------------------------------

/** 表示モード切り替え */
const toggleShowMode = () => {
    if (flowStore.isAllShowMode) {
        flowStore.toSingleShowMode();
    }
    else {
        flowStore.toAllShowMode();
    }
};

/** 個別表示時に表示する製品（素材）変更 */
const onChangeShowProduct = (event: Event) => {
    if (!(event.target instanceof HTMLSelectElement)) return;
    const target = event.target as HTMLSelectElement;
    productIndexOnSingle.value = target.selectedIndex;
}

/**
 * レシピ一括設定のレシピ変更時
 * @param materialId [in] 素材ID
 * @param recipeId [in] レシピID
 */
const onChangeBatchRecipe = (materialId: string, recipeId: string) => {
    if (isDefaultRecipe.value(materialId, recipeId)) {
        // デフォルトレシピに変更された場合は追加では無く削除する
        console.log('Remove ' + materialId + ' because it\'s the default recipe.')
        flowStore.removeBatchRecipe(materialId);
    }
    else {
        // 一括設定リストに追加
        console.log('Add ' + materialId + '(' + recipeId + ')')
        flowStore.addBatchRecipe(materialId, recipeId);
    }
    console.log(flowStore.batchRecipeMap);
    // 一括設定
    console.log('Batch');
    flowStore.batchRecipeChange(materialId);

    // ドロップダウンを閉じる
    // Note: 開いているものだけ閉じたかったが、実装が少し複雑になるので全部閉じる
    batchRecipeDropdowns.value?.forEach((dropdown: any) => {
        dropdown.close();
    });
};

/**
 * レシピ一括設定の解除
 * @param materialId [in] 素材ID
 */
const onClickBatchRecipeIcon = (materialId: string) => {
    console.log('Remove ' + materialId);
    flowStore.removeBatchRecipe(materialId);
    console.log(flowStore.batchRecipeMap);
};

// サイクル -----------------------------------------------------

</script>

<style scoped>
.material-table-frame {
    width: 100%;
    height: 100%;
    color: white;
    white-space: nowrap;
    line-height: 1.2em;
    display: flex;
    flex-direction: column;
}

.show-mode-box {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 4px;
}
.show-mode-box .show-mode-text {
    flex: 1;
    text-align: left;
    font-weight: bold;
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

.select-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 8px;
}
.select-wrapper img {
    width: 1em;
    height: 1em;
}
.select-wrapper select {
    flex: 1;
}
.select-wrapper span {
    font-size: 0.8em;
}

.tables {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: scroll;
}

.product-box {
    width: 100%;
}
h2 {
    margin: 0px;
}
table.product-table {
    width: 100%;
    border-spacing: 4px;
    margin-bottom: 8px;
    font-size: 0.8em;
    line-height: 1em;
    table-layout: fixed;
}
table.product-table th {
    background: var(--symbolic-color);
    border-radius: 4px;
    padding: 4px 8px;
    text-align: center;
}
table.product-table th.material-name-column {
    text-align: left;
    min-width: 50px;
}
table.product-table .product-name-header {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}
table.product-table .product-name-header img {
    width: 1.8em;
    height: 1.8em;
}
table.product-table .product-name-header .text-container {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    text-align: left;
}
table.product-table .product-name-header .text-container .name {
    overflow: hidden;
    text-overflow: ellipsis;
}
table.product-table .product-name-header .text-container .needs {
    overflow: hidden;
    color: var(--dark-bg-color);
    font-size: 0.9em;
}
table.product-table td {
    padding: 4px;
    border-radius: 4px;
    line-height: 1.1em;
}
table.product-table td div {
    display: flex;
    align-items: center;
    justify-content: center;
}
table.product-table td.material-name-cell {
    font-weight: bold;
}
table.product-table td.material-name-cell:not(.category) {
    color: black;
    background: var(--symbolic-pale-color);
}

table.product-table td.material-needs-cell {
    color: black;
    background: var(--dark-light-color);
}
table.product-table td.material-needs-cell.not-use {
    background: var(--dark-main-color);
    color: white;
}
table.product-table td div.material-name-box {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
}
table.product-table td div.material-name-box img {
    width: 1em;
    height: 1em;
}
table.product-table td div.material-name-box span.material-name {
    flex: 1;
}
table.product-table td div.material-name-box span.material-name {
    flex: 1;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: left;
}
table.product-table td div.material-name-box .batch-recipe-icon {
    color: var(--dark-text-color);
    position: relative;
}
table.product-table td div.material-name-box .batch-recipe-icon:hover::before {
    content: "x";
    font-size: 1.2em;
    color: red;
    position: absolute;
    left: 50%;
    top: 50%;
    font-weight: bold;
    transform: translateX(-50%) translateY(-50%);
}
table.product-table td div.material-name-box .batch-recipe-button {
    font-size: 0.8em;
    color: var(--dark-text-color);
    mix-blend-mode: overlay;
    border: 1px solid var(--dark-text-color);
    border-radius: 4px;
    padding: 2px 4px;
    position: relative;
}
table.product-table td div.material-name-box .batch-recipe-button:hover {
    background: var(--dark-text-color);
    color: var(--dark-main-color);
}

.batch-recipe-list-dropdown-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    background: var(--dark-bg-color);
    padding: 8px;
    border: 1px solid var(--dark-light-color);
    border-radius: 8px;
    opacity: 0.9;
}

.batch-recipe-list-dropdown-container .header {
    font-size: 0.8em;
}
.batch-recipe-list-dropdown-container table.batch-recipe-list-table {
    font-size: 0.8em;
}
.batch-recipe-list-dropdown-container table.batch-recipe-list-table th,
.batch-recipe-list-dropdown-container table.batch-recipe-list-table td {
    border-radius: 4px;
    padding: 4px;
    line-height: 0.8em;
    text-align: left;
}
.batch-recipe-list-dropdown-container table.batch-recipe-list-table th {
    background: var(--symbolic-color);
    color: var(--dark-text-color);
}
.batch-recipe-list-dropdown-container table.batch-recipe-list-table td:nth-child(1) {
    background: var(--symbolic-pale-color);
    color: black;
    display: flex;
    align-items: center;
    gap: 4px;
}
.batch-recipe-list-dropdown-container table.batch-recipe-list-table td:nth-child(2) {
    background: var(--dark-light-color);
    color: black;
}
.batch-recipe-list-dropdown-container table.batch-recipe-list-table img {
    width: 1em;
    height: 1em;
}

hr {
  border: 0;
  height: 1px;
  background-image: -webkit-linear-gradient(left, transparent, var(--symbolic-color), transparent);
  /* Chrome にて何故か最後のものが有効になっていたので、一旦消す
  background-image: -moz-linear-gradient(left, transparent, var(--symbolic-color), transparent);
  background-image: -ms-linear-gradient(left, transparent, var(--symbolic-color), transparent);
  background-image: -o-linear-gradient(left, transparent, var(--symbolic-color), transparent);
  */
}
</style>