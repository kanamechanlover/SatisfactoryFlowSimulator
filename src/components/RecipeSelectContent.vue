<template>
    <div class="recipe-select-content-frame">
        <div class="dropdown-container">
            <div v-for="(recipeId, index) in recipeIds" :key="recipeId"
                    class="option" @click="onClick(index)">
                <div class="option-header">
                    <span class="default-recipe-icon" v-if="isDefaultRecipe(recipeId)">基本</span>
                    <span>{{ recipeName(recipeId) }}</span>
                </div>
                <div class="option-content">
                    <RecipeView :recipe-id="recipeId"></RecipeView>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'

// 子コンポーネント ---------------------------------------------

import RecipeView from '@/components/RecipeView.vue'

// 外部連携 -----------------------------------------------------

const props = defineProps({
    /** 対象の素材ID */
    materialId: {
        type: String,
        default: '',
    }
});

const emits = defineEmits<{
    (e: 'select', value: string): void, // 選択肢クリック時（値はレシピID）
}>();

// 内部定義 -----------------------------------------------------

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------

/**
 * 対象の素材を作成するレシピリスト
 * @note 基本レシピだけは先頭に配置する
 */
const recipeIds = computed((): Array<string> => {
    const ids = configStore.recipeIdForMaterial(props.materialId);
    // 基本レシピだけは先頭に配置
    const defaultRecipeId = configStore.defaultRecipeId(props.materialId);
    return [defaultRecipeId].concat(ids.filter((id: string) => id != defaultRecipeId));
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
 * @param recipeId [in] レシピID
 * @return デフォルトレシピなら true
 */
const isDefaultRecipe = computed(() => (recipeId: string) => {
    return configStore.defaultRecipeId(props.materialId) == recipeId;
});

// Actions -----------------------------------------------------

/**
 * 選択肢クリック時
 * @param index [in] 選択肢のインデックス
 */
const onClick = (index: number) => {
    // 選択されたレシピIDを親に伝達
    const recipeId = recipeIds.value[index];
    emits('select', recipeId);
}

// サイクル -----------------------------------------------------

</script>

<style scoped>

.dropdown-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    background: var(--dark-bg-color);
    padding: 8px;
    border: 1px solid var(--dark-light-color);
    border-radius: 8px;
    opacity: 0.9;
    position: relative;
}
.dropdown-container .option {
    display: flex;
    flex-direction: column;
    align-items: start;
    cursor: pointer;
    padding: 2px 4px;
    color: var(--dark-text-color);
    opacity: 1;
    user-select: none;
    gap: 4px;
}
.dropdown-container .option:hover {
    background: var(--symbolic-color);
    border-radius: 4px;
    border-bottom-color: transparent;
}
.dropdown-container .option .option-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    line-height: 1.2em;
}
.dropdown-container .option .option-content {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.dropdown-container .option .default-recipe-icon {
    border: 1px solid var(--dark-text-color);
    border-radius: 4px;
    padding: 4px;
    margin-right: 4px;
    line-height: 1em;
}
</style>