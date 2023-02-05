<template>
    <div class="config-recipe-search-frame">
        <div class="header">レシピ検索条件</div>
        <div class="search-box">
            <div class="item-box recipe-id-box">
                <span class="label">レシピID</span>
                <input class="value" type="text" v-model="searchCondition.recipeId" />
            </div>
            <div class="item-box input-material-box">
                <span class="label">入力素材</span>
                <MachineSelect class="value" v-model="searchCondition.inputMaterialId" :machines="props.materials"></MachineSelect>
            </div>
            <div class="item-box recipe-name-box">
                <span class="label">レシピ名</span>
                <input class="value" type="text" v-model="searchCondition.recipeName" />
            </div>
            <div class="item-box output-material-box">
                <span class="label">出力素材</span>
                <MachineSelect class="value" v-model="searchCondition.outputMaterialId" :machines="props.materials"></MachineSelect>
            </div>
            <div class="item-box machine-box">
                <span class="label">設備</span>
                <MachineSelect class="value" v-model="searchCondition.machineId" :machines="props.machines"></MachineSelect>
            </div>
            <div class="item-box button-box">
                <div class="value apply-button" @click="applyRecipeSearch">検索</div>
                <div class="value reset-button" @click="resetRecipeSearch">リセット</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, watch } from 'vue'
import { ConfigMachine, ConfigMaterial } from '@/defines/types/config'


// 子コンポーネント ---------------------------------------------


// 基本定義 -----------------------------------------------------

/** プロパティを定義 */
const props = defineProps({
    /** 設備リスト */
    machines: {
        type: Array<ConfigMachine>,
        default: [] as Array<ConfigMachine>,
        require: true,
    },
    /** 素材リスト */
    materials: {
        type: Array<ConfigMaterial>,
        default: [] as Array<ConfigMaterial>,
        require: true,
    },
});

// エミット
const emits = defineEmits<{
    (e: 'change', value: SearchCondition): void
}>();


/**
 * 検索条件
 * - 各値、空文字列の場合は検索条件から除外
 */
const searchCondition = ref({
    recipeId: '', // レシピID
    recipeName: '', // レシピ名
    machineId: '', // 設備ID
    inputMaterialId: '', // 入力素材ID
    outputMaterialId: '', // 出力素材ID
} as SearchCondition);
defineExpose({searchCondition}); // 公開設定

// 内部変数 -----------------------------------------------------


// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------


// Actions -----------------------------------------------------

/** 検索条件変更を通知 */
const changeConditions = () => {
    emits('change', searchCondition.value);
};

/** 検索条件適用 */
const applyRecipeSearch = () => {
    changeConditions();
}

/** レシピの検索条件をリセット */
const resetRecipeSearch = () => {
    // 各条件をリセット
    searchCondition.value.recipeId = '';
    searchCondition.value.recipeName = '';
    searchCondition.value.machineId = '';
    searchCondition.value.inputMaterialId = '';
    searchCondition.value.outputMaterialId = '';
    // 変更を親に伝搬
    changeConditions();
};
/** レシピの検索条件を更新 */
const updateSearchConditions = () => {
    let changed = false;
    const condition = searchCondition.value;
    // recipeId はリストを持たないので不要
    // recipeName はリストを持たないので不要
    // 設備ID
    if (condition.machineId && 
            !props.machines.find((v) => v.id == condition.machineId)) {
        searchCondition.value.machineId = '';
        changed = true;
    }
    // 入力素材ID
    if (condition.inputMaterialId &&
            !props.materials.find((v) => v.id == condition.inputMaterialId)) {
        searchCondition.value.inputMaterialId = '';
        changed = true;
    }
    // 出力素材ID
    if (condition.outputMaterialId &&
            !props.materials.find((v) => v.id == condition.outputMaterialId)) {
        searchCondition.value.outputMaterialId = '';
        changed = true;
    }
    // 変更があれば親に伝達
    if (changed) {
        changeConditions();
    }
};

// サイクル -----------------------------------------------------


// 監視 --------------------------------------------------------

// props の値が更新されたら値が最新かチェックして更新（ID変更等の影響反映の為）
watch(() => props.machines, updateSearchConditions);
watch(() => props.materials, updateSearchConditions);

</script>

<script lang="ts">

/** 検索条件 */
export interface SearchCondition {
    /** レシピID */
    recipeId: string;
    /** レシピ名 */
    recipeName: string;
    /** 設備ID */
    machineId: string;
    /** 入力素材ID */
    inputMaterialId: string;
    /** 出力素材ID */
    outputMaterialId: string;
};
</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
.config-recipe-search-frame {
    width: 100%;
    display: flex;
    flex-direction: column;
}

header {
    display: flex;
    justify-content: center;
    align-items: center;
}
.search-box {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    font-size: 0.8em;
    line-height: 1em;
}

.item-box {
    flex: 50%;
    display: flex;
    flex-wrap: wrap;
    padding: 4px;
    gap: 4px;
    align-items: center;
}
.item-box .label {
    width: 4em;
}
.item-box .value {
    flex: 1;
    font-size: 0.8em;
    height: 19px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.apply-button {
    background: var(--dark-main-color);
    border: 1px solid var(--dark-accent-color);
    border-radius: 4px;
    user-select: none;
}
.apply-button:hover {
    background: var(--dark-accent-color);
    cursor: pointer;
}

.reset-button {
    background: var(--dark-main-color);
    border: 1px solid var(--dark-accent-color);
    border-radius: 4px;
    user-select: none;
}
.reset-button:hover {
    background: var(--dark-accent-color);
    cursor: pointer;
}
</style>