<template>
    <div class="flow-tree-frame">
        <div class="product-select-box" v-if="productNumber">
            <span>表示名：</span>
            <input type="text" :value="productName(currentProductIndex)"
                @change="onChangedProductName" :title="tooltips.ProductShowNameInput" />
            <button class="name-set-button" @click="setMaterialName"
                    :title="tooltips.ProductNameSetButton">
                <fa :icon="['fas', 'arrow-left']" />
            </button>
            <span>製品名：</span>
            <CustomDropdown ref="productSelector" class="product-material-dropdown">
                <template #toggle>
                    <div class="product-dropdown-toggle" :title="tooltips.ProductNameSelect">
                        <img :src="productImage" v-if="productImage" />
                        <span>{{ productMaterialName }}</span>
                    </div>
                </template>
                <MaterialSelectContent
                    noselecting-text="-- 製品選択 --" @select="onChangeProductId">
                </MaterialSelectContent>
            </CustomDropdown>
        </div>
        <div class="flow-view-box" v-if="productNumber">
            <FlowView v-if="isSpecifiedProductId" :product-index="currentProductIndex"></FlowView>
        </div>
        <div v-show="constructingFlow" class="constructing">製作フロー構築中</div>
    </div>
</template>


<script setup lang="ts">

import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useFlowStore } from '@/stores/flow_store'
import { useImageStore } from '@/stores/image_store';

// 子コンポーネント ---------------------------------------------

import FlowView from '@/components/FlowView.vue'
import CustomDropdown from './generic/CustomDropdown.vue';
import MaterialSelectContent from '@/components/MaterialSelectContent.vue'

// 外部連携 -----------------------------------------------------

// 内部定義 -----------------------------------------------------

// ツールチップ文言一覧
const tooltips = {
    ProductShowNameInput: '製品を表す任意の表示名を指定します。製品一覧の表示に影響します。',
    ProductNameSetButton: '現在選択中の製品名を表示名に指定します。',
    ProductNameSelect: 'シミュレートする製品を選択します。',
} as const;

// 製品（素材）未選択時のテキスト
const noselectingText = '-- 製品選択 --';

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 製作フローストア */
const flowStore = useFlowStore();

/** 画像ストア */
const imageStore = useImageStore();

/** 構築中フラグ */
const constructingFlow = ref(false);

/** 製品選択ドロップダウン */
const productSelector = ref<typeof CustomDropdown|undefined>(undefined);

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
const productMaterialId = computed((): string => {
    return flowStore.productMaterialId(currentProductIndex.value);
});
/** 現在選択中の製品インデックスの製品（素材）名 */
const productMaterialName = computed((): string => {
    if (!productMaterialId.value) return noselectingText;
    return configStore.materialName(productMaterialId.value);
});

/** 製品（素材）画像 */
const productImage = computed((): string => {
    return imageStore.getData(productMaterialId.value);
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
/** 製品（表示）名に製品（素材）名を設定する */
const setMaterialName = () => {
    if (productMaterialId.value == '') return; // 製品が選択されていない場合は何もしない
    const newName = configStore.materialName(productMaterialId.value);
    flowStore.setProductName(currentProductIndex.value, newName);
};

/** 製品（素材）ID変更時　※重い処理になる為、非同期で実行する */
const onChangeProductId = (productId: string) => {
    // 構築中フラグを立てる
    constructingFlow.value = true;
    // 画面更新の為に次の Tick にて実施
    setTimeout(() => {
        // 製品（素材）ID更新
        flowStore.setMaterialId(currentProductIndex.value, [], productId);
        // 構築が終了したらフラグを落とす
        constructingFlow.value = false;
    }, 0);
    // 製品選択ドロップダウンを閉じる
    productSelector.value?.close();
};

// サイクル -----------------------------------------------------


</script>

<style scoped>

input, select {
    min-width: 5em;
}
.flow-tree-frame {
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    background: var(--dark-bg-color);
    position: relative;
}
.product-select-box {
    position: absolute;
    left: 0px;
    top: 0px;
    width: calc(100% - 15px); /* 100% だとスクロールバー分ずれる為 */
    height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0px 8px;
}
.product-select-box span {
    white-space: nowrap;
}
.product-select-box button {
    padding: 2px 4px;
    line-height: 1em;
}
.product-select-box img {
    width: 1em;
    height: 1em;
}
.product-select-box input {
    flex:1;
    padding: 1px 4px;
    line-height: 1em;
    font-size: 0.9em;
}
.product-select-box input:hover {
    border-color: var(--dark-light-color);
}
.product-select-box .product-material-dropdown {
    flex: 1;
    font-size: 0.9em;
    line-height: 0.9em;
}
.product-select-box .product-dropdown-toggle {
    display:flex;
    align-items: center;
    border: 1px solid var(--dark-main-color);
    border-radius: 4px;
    padding: 2px 4px;
    line-height: 1em;
    user-select: none;
    gap: 4px;
}
.product-select-box .product-dropdown-toggle:hover {
    border: 1px solid var(--dark-light-color);
}
.product-select-box .product-dropdown-toggle::after {
    display: block;
    width: 1em;
    height: 1em;
    content: ">";
    font-weight: bold;
    position: absolute;
    top: 50%;
    right: 0px;
    transform: rotate(90deg) translateX(-50%) translateY(4px);
}
.flow-view-box {
    flex: 1;
    margin-top: 32px;
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

.constructing {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: black;
    opacity: 0.8;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 1.5em;
}
.constructing > * {
    opacity: 1;
}

</style>