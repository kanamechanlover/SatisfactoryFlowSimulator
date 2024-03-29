<template>
    <div class="product-tab-frame" :class="{compact: compactShowMode}">
        <div class="product-tab-add-box">
            <button v-show="!compactShowMode" class="add-button"
                    @click="addProduct" :title="tooltips.AddProduct">
                ＋製品追加
            </button>
            <CustomDropdown ref="presetSelect" v-show="!compactShowMode">
                <template #toggle>
                    <button class="preset-button" :title="tooltips.PresetButton">
                        <fa :icon="['fas', 'list-ul']" />
                    </button>
                </template>
                <div class="preset-content">
                    <PresetSelectContent @select="onSelectPreset"></PresetSelectContent>
                </div>
            </CustomDropdown>
            <button class="show-mode-button" :class="{compact: compactShowMode}"
                    @click="toggleShowMode" :title="tooltips.ToggleShowMode">
                <fa v-show="!compactShowMode" :icon="['fas', 'arrow-left']" />
                |
                <fa v-show="compactShowMode" :icon="['fas', 'arrow-right']" />
            </button>
        </div>
        <div class="product-tab-item-box">
            <div class="product-tab-item" v-for="index in productNumber" :key="index"
                    :class="{ selected: currentProductIndex == index - 1 }"
                    :title="productName(index - 1)"
                    @click="changeProductIndex(index - 1)">
                <span class="tab-index">{{ index }}</span>
                <span class="tab-img" :title="productMaterialName(index - 1)">
                    <img :src="productMaterialImage(index - 1)" v-if="productMaterialImage(index - 1)" />
                </span>
                <span class="tab-name" v-if="!compactShowMode">{{ productName(index - 1) }}</span>
                <button v-if="!compactShowMode" @click="removeProduct(index - 1)" :title="tooltips.RemoveProduct">
                    <fa :icon="['fas', 'trash-can']" />
                </button>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">

import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useFlowStore } from '@/stores/flow_store'
import { useImageStore } from '@/stores/image_store';
import Logger from '@/logics/logger';

// 子コンポーネント ---------------------------------------------

import CustomDropdown from '@/components/generic/CustomDropdown.vue';
import PresetSelectContent from '@/components/PresetSelectContent.vue';

// 外部連携 -----------------------------------------------------

// 内部定義 -----------------------------------------------------

// ツールチップ文言一覧
const tooltips = {
    ToggleShowMode: '通常表示とコンパクト表示を切り替えます。',
    AddProduct: 'シミュレートする製品の製作フローを増やします。',
    RemoveProduct: 'シミュレートする製品を削除します。',
    PresetButton: '製品リストのプリセットを読み込みます。'
} as const;

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 製作フローストア */
const flowStore = useFlowStore();

/** 画像ストア */
const imageStore = useImageStore();

/** 表示モード（true: コンパクト表示, false: 通常表示） */
const compactShowMode = ref(false);

/** プリセット選択ドロップダウン */
const presetSelect  = ref<typeof CustomDropdown|undefined>(undefined);

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

/** 製品の素材画像URL */
const productMaterialImage = computed(() => (index: number) => {
    const materialId = flowStore.productMaterialId(index);
    return (materialId) ? imageStore.getData(materialId) : "";
});

/** 指定位置の製品（素材）名 */
const productMaterialName = computed(() => (index: number) => {
    const materialId = flowStore.productMaterialId(index);
    return configStore.materialName(materialId);
});

// Actions -----------------------------------------------------

/** 製品追加 */
const addProduct = () => {
    // ストアに製品追加
    flowStore.addProduct();
    // 追加した製品を選択状態にする
    flowStore.setProductIndex(productNumber.value - 1);
};
/** 指定位置の製品削除 */
const removeProduct = (index: number) => {
    flowStore.removeProduct(index);
};
/** 製品インデックス変更 */
const changeProductIndex = (index: number) => {
    flowStore.setProductIndex(index);
};

/** 表示モード切り替え */
const toggleShowMode = () => {
    compactShowMode.value = !compactShowMode.value;
};

/**
 * プリセット選択時
 * @param tierName [in] ティア名
 * @param presetName [in] プリセット名
 */
const onSelectPreset = (tierName: string, presetName: string) => {
    Logger.log('Selected preset.');
    console.log(tierName);
    console.log(presetName);

    // プリセット反映
    flowStore.applyProductPreset(tierName, presetName);

    // プリセット選択ドロップダウンを閉じる
    presetSelect.value?.close();
};

// サイクル -----------------------------------------------------


</script>

<style scoped>
.product-tab-frame {
    width: 300px;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
    background: var(--dark-deep-color);
}
.product-tab-frame.compact {
    width: auto;
    min-width: initial;
}

.product-tab-add-box {
    padding: 4px;
    display: flex;
    gap: 4px;
}
.product-tab-add-box button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px auto;
    background: var(--dark-main-color);
    border: 2px solid transparent;
    font-weight: bold;
    padding: 0px 4px;
    height: 1.5em;
}
.product-tab-add-box button.preset-button {
    padding: 0px 1em;
}
.product-tab-add-box button.add-button {
    flex: 1;
}
.product-tab-add-box button.show-mode-button.compact {
    flex: 1;
}
.product-tab-add-box button:hover {
    background: var(--dark-accent-color);
}
.preset-content {
    max-height: 100%;
}

.product-tab-item-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-gutter: stable;
}
.product-tab-item {
    padding: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid transparent;
}

.product-tab-item:hover {
    background: var(--dark-bg-color);
}
.product-tab-item.selected {
    background: var(--dark-bg-color);
    border-radius: 4px;
    border: 1px solid var(--dark-accent-color);
}
.product-tab-item span.tab-index {
    width: 1.8em;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--dark-main-color);
    border-radius: 4px;
    font-size: 0.8em;
    font-weight: bold;
}
.product-tab-item .tab-img {
    width: 1.8em;
    height: 1.8em;
    background: var(--dark-bg-color);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    font-size: 0.8em;
}
.product-tab-item .tab-img img {
    width: 1.5em;
    height: 1.5em;
}
.product-tab-item span.tab-name {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.product-tab-item button {
    width: 1.8em;
    height: 1.8em;
    line-height: 1em;
    border-radius: 4px;
    background: var(--dark-main-color);
    color: var(--dark-bg-color);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.6em 0.8em;
    font-size: 0.8em;
}
.product-tab-item button:hover {
    border-color: transparent;
    background: var(--dark-accent-color);
    color: firebrick;
}

</style>