<template>
    <div class="frame-flow-tree">
        <div class="product-select-box" v-if="productNumber">
            <span>表示名：</span>
            <input type="text" :value="productName(currentProductIndex)" @change="onChangedProductName" />
            <span>製品名：</span>
            <select ref="productSelect" @change="onChangedProductId">
                <option value :selected="!productId">-- 製品選択 --</option>
                <option v-for="option in options" :key="option"
                    :class="{category: isCategoryOption(option)}"
                    :disabled="isCategoryOption(option)"
                    :value="option" :selected="productId == option">
                    {{ (isCategoryOption(option)) ? option : materialName(option) }}
                </option>
            </select>
        </div>
        <div class="flow-view-box" v-if="productNumber">
            <FlowView v-if="isSpecifiedProductId" :product-index="currentProductIndex"></FlowView>
        </div>
    </div>
</template>


<script setup lang="ts">

import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useFlowStore } from '@/stores/flow_store'
import { useImageStore } from '@/stores/image_store';

// 子コンポーネント ---------------------------------------------

import FlowView from '@/components/FlowView.vue'

// 外部連携 -----------------------------------------------------

// 内部定義 -----------------------------------------------------

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 製作フローストア */
const flowStore = useFlowStore();

/** 画像ストア */
const imageStore = useImageStore();

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------

/** 製品数 */
const productNumber = computed((): number => {
    return flowStore.productNumber;
});

/** 製品（表示）名 */
const productName = computed(() => (index: number): string => {
    return flowStore.productName(index);
});

/** 現在選択中の製品インデックス */
const currentProductIndex = computed((): number => {
    return flowStore.currentProductIndex;
});

/** 現在選択中の製品インデックスの製品（素材）ID */
const productId = computed((): string => {
    return flowStore.productId(currentProductIndex.value);
});

/** 製品選択プルダウンの選択肢 */
const options = computed((): Array<string> => {
    const productMaterialIds = configStore.productMaterialIds;
    const categoryIds = configStore.materialCategoryIds;
    let options: Array<string> = [];
    categoryIds.forEach((categoryId: string) => {
        // 入力素材のあるレシピを持つ素材IDリストから対象カテゴリのものを取得
        const categoryMaterialIds = productMaterialIds.filter((materialId: string) => {
            return configStore.materialCategory(materialId) == categoryId;
        });
        // 対象の素材が１つも見つからないカテゴリばスキップ
        if (!categoryMaterialIds.length) return;
        // 選択肢に追加
        const categoryName = configStore.materialCategoryName(categoryId);
        options.push('■ ' + categoryName);
        options = options.concat(categoryMaterialIds);
    });
    return options;
});

/** 製品（素材）選択プルダウンのカテゴリ枠か */
const isCategoryOption = computed(() => (option: string) => {
    return option.startsWith('■');
});
/** 素材名 */
const materialName = computed(() => (materialId: string) => {
    return configStore.materialName(materialId);
});
/** 製品の素材IDが指定されているか */
const isSpecifiedProductId = computed((): boolean => {
    const materialId = flowStore.flowOnPath(flowStore.currentProductIndex)?.materialId;
    return !!materialId;
},);

// Actions -----------------------------------------------------

/** 製品（表示）名変更時 */
const onChangedProductName = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    // 製品（表示）名更新
    flowStore.setProductName(currentProductIndex.value, event.target.value);
};

/** 製品（素材）ID変更時 */
const onChangedProductId = (event: Event) => {
    if (!(event.target instanceof HTMLSelectElement)) return;
    // 製品（素材）ID更新
    flowStore.setMaterialId(currentProductIndex.value, [], event.target.value);
};

// サイクル -----------------------------------------------------


</script>

<style src="@/to_dark_theme.css" scoped />

<style scoped>

input, select {
    min-width: 5em;
}
.frame-flow-tree {
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    background: var(--dark-bg-color);
}
.product-select-box {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
}
.product-select-box span {
    white-space: nowrap;
}
.product-select-box input,
.product-select-box select {
    flex:1;
}
.product-select-box select option.category {
    background: orange;
    color: black;
    font-weight: bold;
    font-size: 1.2em;
}
.flow-view-box {
    flex: 1;
    margin-top: 40px;
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 8px;
    background-image:
        linear-gradient(
            0deg, transparent 31px,
            gray 32px),
        linear-gradient(
            90deg, transparent 31px,
            gray 32px);
    background-color: dimgray;
    background-size: 32px 32px;
}

</style>