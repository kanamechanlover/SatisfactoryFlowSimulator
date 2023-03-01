<template>
    <div class="frame">
        <div class="product-select-box">
            <span>製品名：</span>
            <select @change="onProductChange">
                <option value>-- 製品選択 --</option>
                <option v-for="option in options" :key="option"
                    :class="{category: isCategoryOption(option)}"
                    :disabled="isCategoryOption(option)"
                    :value="option">
                    {{ (isCategoryOption(option)) ? option : materialName(option) }}
                </option>
            </select>
        </div>
        <div class="flow-view-box">
            <FlowView v-if="currentProducts.length > 0"></FlowView>
        </div>
    </div>
</template>


<script setup lang="ts">

import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useFlowStore } from '@/stores/flow_store'

// 子コンポーネント ---------------------------------------------

import FlowView from '@/components/FlowView.vue'

// 外部連携 -----------------------------------------------------

// 内部定義 -----------------------------------------------------

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 制作フローストア */
const flowStore = useFlowStore();

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------

const options = computed(() => {
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
const isCategoryOption = computed(() => (option: string) => {
    return option.startsWith('■');
});
const materialName = computed(() => (materialId: string) => {
    return configStore.materialName(materialId);
});
const currentProducts = computed((): Array<string> => {
    return flowStore.products;
});

// Actions -----------------------------------------------------

const onProductChange = (event: Event) => {
    if (!(event.target instanceof HTMLSelectElement)) return;
    flowStore.setMaterialId([], event.target.value);
};

// サイクル -----------------------------------------------------


</script>

<style src="@/to_dark_theme.css" scoped />

<style scoped>
.frame {
    width: 100%;
    display: flex;
    flex-direction: column;
}
.product-select-box {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}
.product-select-box select {
    flex:1;
}
.product-select-box select option.category {
    background: orange;
    color: black;
    font-weight: bold;
    font-size: 1.2em;
}
</style>