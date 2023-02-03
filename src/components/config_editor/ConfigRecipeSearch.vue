<template>
    <table class="search-table">
        <tr>
            <th  colspan="6">レシピ検索条件</th>
        </tr>
        <tr>
            <th>レシピ名</th>
            <td width="40%">
                <input type="text" v-model="searchCondition.recipeName" />
            </td>
            <th>設備</th>
            <td width="40%">
                <MachineSelect v-model="searchCondition.machineId"></MachineSelect>
            </td>
            <td class="apply-box" rowspan="2" @click="applyRecipeSearch" width="10%">検索</td>
            <td class="reset-box" rowspan="2" @click="resetRecipeSearch">リセット</td>
        </tr>
        <tr>
            <th>入力素材</th>
            <td>
                <MaterialSelect v-model="searchCondition.inputMaterialId"></MaterialSelect>
            </td>
            <th>出力素材</th>
            <td>
                <MaterialSelect v-model="searchCondition.outputMaterialId"></MaterialSelect>
            </td>
        </tr>
    </table>
</template>

<script setup lang="ts">

import { ref } from 'vue'


// 子コンポーネント ---------------------------------------------


// 基本定義 -----------------------------------------------------

// エミット
const emits = defineEmits<{
    (e: 'change', value: SearchCondition): void
}>();


/** 検索条件 */
const searchCondition = ref({
    recipeName: '',
    machineId: '',
    inputMaterialId: '',
    outputMaterialId: '',
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
    searchCondition.value.recipeName = '';
    searchCondition.value.machineId = '';
    searchCondition.value.inputMaterialId = '';
    searchCondition.value.outputMaterialId = '';
    changeConditions();
};

// サイクル -----------------------------------------------------


</script>

<script lang="ts">

/** 検索条件 */
export interface SearchCondition {
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
table.search-table {
    width: 100%;
    border-spacing: 4px;
    table-layout: auto;
}

th {
    padding-bottom: 4px;
}

.apply-box {
    background: var(--dark-main-color);
    border: 1px solid var(--dark-accent-color);
    border-radius: 4px;
    user-select: none;
}
.apply-box:hover {
    background: var(--dark-accent-color);
    cursor: pointer;
}

.reset-box {
    background: var(--dark-main-color);
    border: 1px solid var(--dark-accent-color);
    border-radius: 4px;
    user-select: none;
}
.reset-box:hover {
    background: var(--dark-accent-color);
    cursor: pointer;
}
</style>