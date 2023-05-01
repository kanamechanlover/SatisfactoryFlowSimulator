<template>
    <div class="material-select-content-frame">
        <div class="dropdown-container">
            <div class="option selectable" @click="onClickNoselect()">{{ props.noselectingText }}</div>
            <div v-for="(material, index) in materialIdAndNames" :key="index"
                    class="option" @click="onClick(index)" :class="{selectable: material.id}">
                <div class="option-image" v-if="material.id">
                    <img :src="materialImg(material.id)" />
                </div>
                <div class="option-text">
                    {{ material.name }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useImageStore } from '@/stores/image_store'

// 子コンポーネント ---------------------------------------------

// 外部連携 -----------------------------------------------------

const props = defineProps({
    /** 未選択時のテキスト */
    noselectingText: {
        type: String,
        default: '',
    },
});

const emits = defineEmits<{
    (e: 'select', value: string): void, // 選択肢クリック時（値はレシピID）
}>();

// 内部定義 -----------------------------------------------------

/** IDと名前のセット */
interface IdAndName {
    /** ID */
    id: string,
    /** 名前 */
    name: string,
}

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 画像ストア */
const imageStore = useImageStore();

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------

/**
 * 素材ID&素材名リスト
 */
const materialIdAndNames = computed((): Array<IdAndName> => {
    let result = new Array<IdAndName>();
    configStore.materialCategoryIds.forEach((categoryId: string) => {
        // カテゴリ名を追加（id を空にした時はカテゴリ名として処理
        result.push({id: '', name: configStore.materialCategoryName(categoryId)});
        // カテゴリ内の素材を追加
        const materials = configStore.materialIds.filter((id: string) => {
            return configStore.materialCategory(id) == categoryId;
        }).map((id: string) => {
            return {id: id, name: configStore.materialName(id)};
        });
        result = result.concat(materials);
    });
    return result;
});

/**
 * 素材の画像を取得
 * @param materialId [in] 素材ID
 */
const materialImg = computed(() => (materialId: string) => {
    return imageStore.getData(materialId);
});

// Actions -----------------------------------------------------

/**
 * 選択肢クリック時
 * @param index [in] 選択肢のインデックス
 */
const onClick = (index: number) => {
    if (!materialIdAndNames.value?.at(index)) return; // イレギュラー
    // カテゴリ(id='')をクリック時は何もしない
    if (!materialIdAndNames.value[index].id) return;
    // 選択されたレシピIDを親に伝達
    const materialId = materialIdAndNames.value[index].id;
    emits('select', materialId);
}

/** 未選択用の選択肢をクリック時 */
const onClickNoselect = () => {
    // 空を親に伝達
    emits('select', '');
};

// サイクル -----------------------------------------------------

</script>

<style scoped>
.material-select-content-frame {
    display: flex;
    max-height: 80vh;
    background: var(--dark-bg-color);
    padding: 8px 0px 8px 8px;
    border: 1px solid var(--dark-light-color);
    border-radius: 8px;
}
.dropdown-container {
    display: flex;
    overflow: hidden scroll;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    opacity: 0.9;
    position: relative;
}
.dropdown-container .option {
    display: flex;
    padding: 4px;
    color: var(--dark-text-color);
    opacity: 1;
    user-select: none;
    gap: 4px;
}
.dropdown-container .option.selectable {
    cursor: pointer;
}
.dropdown-container .option.selectable:hover {
    background: var(--symbolic-color);
    border-radius: 4px;
    border-bottom-color: transparent;
}
.dropdown-container .option:not(.selectable) {
    background: var(--symbolic-pale-color);
    color: black;
    font-weight: bold;
    padding: 8px 4px;
    border-radius: 4px;
}
.dropdown-container .option:not(.selectable)::before {
    content: "■";
}
.dropdown-container .option .option-image {
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 1.2em;
}
.dropdown-container .option .option-image img {
    width: 1em;
    height: 1em;
}
.dropdown-container .option .option-text {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
</style>