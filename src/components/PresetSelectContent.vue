<template>
    <div class="preset-select-content-frame">
        <div class="content-header">
            <span>製品リストのプリセット選択</span>
        </div>
        <div class="content-box">
            <div v-for="(tierName, tierIndex) in tierNames" :key="'tier' + tierIndex" class="content-item">
                <CustomAccordion :is-auto-close="true">
                    <template #header>
                        <div class="tier-header" :title="tooltips.TierSelect">{{ tierName }}</div>
                    </template>
                    <div class="presets-box">
                        <div class="preset-item-box" :key="'preset' + presetIndex"
                                @click="onPresetClick(tierName, presetName)"
                                v-for="(presetName, presetIndex) in presetNames(tierName)">
                            <div class="preset-item" :title="tooltips.PresetSelect">
                                <span class="preset-name">{{ presetName }}</span>
                                <span class="preset-product-item" :key="'product' + productIndex" :title="name"
                                        v-for="({ name, id }, productIndex) in productSet(tierName, presetName)">
                                    <img :src="materialImage(id)"/>
                                </span>
                            </div>
                            <hr v-if="presetIndex < presetNames(tierName).length - 1" />
                        </div>
                    </div>
                </CustomAccordion>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">

import { ref, computed } from 'vue'
import { useImageStore } from '@/stores/image_store';
import { usePresetStore } from '@/stores/preset_store';

// 子コンポーネント ---------------------------------------------

import CustomAccordion from './generic/CustomAccordion.vue';

// 外部連携 -----------------------------------------------------

const emits = defineEmits<{
    (e: 'select', tierName: string, presetName: string): void, // 選択肢クリック時
}>();

// 内部定義 -----------------------------------------------------

// ツールチップ文言一覧
const tooltips = {
    TierSelect: 'クリックでティア内のプリセット表示をトグルします。',
    PresetSelect: 'クリックでプリセットを製品リストに反映します。',
} as const;

/** 製品情報のセット */
type ProductSet = {
    /** 製品（表示）名 */
    name: string,
    /** 製品（素材）ID */
    id: string,
};

// 内部変数 -----------------------------------------------------

/** 画像ストア */
const imageStore = useImageStore();

/** プリセットストア */
const presetStore = usePresetStore();

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------

/** プリセット機能のティア名リスト取得 */
const tierNames = computed((): Array<string> => {
    return presetStore.tierNames;
});

/**
 * プリセット機能のプリセット名リスト取得
 */
const presetNames = computed(() => (tierName: string): Array<string> => {
    return presetStore.presetNames(tierName);
});

/**
 * プリセット機能の製品情報のセットを取得
 * @param tierName [in] ティア名
 * @param presetName [in] プリセット名
 */
const productSet = computed(() => (tierName: string, presetName: string): Array<ProductSet> => {
    const productNames = presetStore.productNames(tierName, presetName);
    const productIds = presetStore.productIds(tierName, presetName);
    return productIds.map((_, index) => {
        return {
            name: productNames[index],
            id: productIds[index],
        } as ProductSet;
    });
});

/**
 * 素材画像
 * @param materialId [in] 素材ID
 */
const materialImage = computed(() => (materialId: string) => {
    return imageStore.getData(materialId);
});

// Actions -----------------------------------------------------

/**
 * 選択肢クリック時
 * @param index [in] 選択肢のインデックス
 */
 const onPresetClick = (tierName: string, presetName: string) => {
    // 選択されたレシピIDを親に伝達
    emits('select', tierName, presetName);
}

// サイクル -----------------------------------------------------


</script>

<style scoped>
.preset-select-content-frame {
    display: flex;
    flex-direction: column;
    position: fixed;
    gap: 4px;
    user-select: none;
    background: var(--dark-bg-color);
    border: 1px solid var(--dark-light-color);
    border-radius: 8px;
    padding: 4px;
    max-width: 100vw;
    max-height: 100vh;
    white-space: nowrap;
}

.content-box {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.content-header {
    padding: 4px;
    text-align: left;
}

.tier-header {
    text-align: left;
    cursor: pointer;
    background: var(--dark-main-color);
    border-radius: 8px;
    padding: 4px 32px 4px 8px;
    margin: 0px 4px 4px 0px;
    position: relative;
}

.tier-header::after {
    display: block;
    width: 1em;
    height: 1em;
    content: ">";
    font-weight: bold;
    position: absolute;
    top: 50%;
    right: 0px;
    transform: translate(-50%, -50%) rotate(90deg);
    text-align: center;
    line-height: 1em;
}

.presets-box {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px;
}

.preset-item-box hr {
    margin: 4px 0px 0px 0px;
    border: none;
    background: var(--dark-light-color);
    height: 1px;
}

.preset-item {
    display: flex;
    gap: 4px;
    border-radius: 8px;
    padding: 2px;
    cursor: pointer;
}
.preset-item:hover {
    background: var(--dark-main-color);
}

.preset-name {
    flex: 1;
    padding-left: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.preset-product-item {
    display: flex;
    justify-content: center;
    align-items: center;
}

.preset-product-item img {
    width: 1.5em;
    height: 1.5em;
}

</style>