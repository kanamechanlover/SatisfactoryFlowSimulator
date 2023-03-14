<template>
    <div class="config-recipe-search-frame">
        <div class="contents">
            <div class="search-box">
                <div class="header">レシピ検索条件</div>
                <div class="search-condition-box">
                    <div class="item-box recipe-id-box" :title="tooltips.SearchRecipeId">
                        <span class="label">レシピID</span>
                        <input class="value" type="text" v-model="searchCondition.recipeId" />
                    </div>
                    <div class="item-box material-box" :title="tooltips.SearchMaterial">
                        <span class="label">素材</span>
                        <MaterialSelect class="value"
                            v-model="searchCondition.materialId" :materials="props.materials">
                        </MaterialSelect>
                    </div>
                    <div class="item-box recipe-name-box" :title="tooltips.SearchRecipeName">
                        <span class="label">レシピ名</span>
                        <input class="value" type="text" v-model="searchCondition.recipeName" />
                    </div>
                    <div class="item-box input-material-box" :title="tooltips.SearchInputMaterial">
                        <span class="label">入力素材</span>
                        <MaterialSelect class="value"
                            v-model="searchCondition.inputMaterialId" :materials="props.materials">
                        </MaterialSelect>
                    </div>
                    <div class="item-box machine-box" :title="tooltips.SearchMachineId">
                        <span class="label">設備</span>
                        <MachineSelect class="value"
                            v-model="searchCondition.machineId" :machines="props.machines">
                        </MachineSelect>
                    </div>
                    <div class="item-box output-material-box" :title="tooltips.SearchOutputMaterial">
                        <span class="label">出力素材</span>
                        <MaterialSelect class="value"
                            v-model="searchCondition.outputMaterialId" :materials="props.materials">
                        </MaterialSelect>
                    </div>
                </div>
            </div>
            <div class="separator-v"></div>
            <div class="sort-box">
                <span class="header">ソート</span>
                <div class="sort-func-box">
                    <span class="sort-func-select">
                        <select :title="tooltips.SortFunction"
                                :value="searchCondition.sortFunc" @change="changeSortFunc" select>
                            <option v-for="(SortFunc, index) in SortFunctons" :key="index" :value="SortFunc.id">
                                {{ SortFunc.name }}
                            </option>
                        </select>
                    </span>
                    <span class="sort-order-item" :title="tooltips.SortAscending"
                            @click="changeSortOrder(SortOrder.Ascending)">
                        <input class="sort-order" type="radio" name="sort-order" :disabled="sortFuncIsNone"
                            :checked="searchCondition.sortOrder == SortOrder.Ascending" />
                        <span class="radio-text" >昇順</span>
                    </span>
                    <span class="sort-order-item" :title="tooltips.SortDescending"
                            @click="changeSortOrder(SortOrder.Descending)">
                        <input class="sort-order" type="radio" name="sort-order" :disabled="sortFuncIsNone"
                            :checked="searchCondition.sortOrder == SortOrder.Descending" />
                        <span class="radio-text">降順</span>
                    </span>
                </div>
            </div>
        </div>
        <div class="separator-h"></div>
        <div class="footer">
            <slot></slot>
            <div class="button apply-button" @click="changeConditions" :title="tooltips.Apply">リストに反映</div>
            <div class="button reset-button" @click="resetRecipeSearch" :title="tooltips.Reset">リセット</div>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, computed, watch, onMounted } from 'vue'
import { ConfigMachine, ConfigMaterial } from '@/defines/types/config'
import { getEventValue } from '@/logics/event_data'


// 子コンポーネント ---------------------------------------------

import MaterialSelect from '@/components/config_editor/MaterialSelect.vue';
import MachineSelect from '@/components/config_editor/MachineSelect.vue';


// 外部連携 -----------------------------------------------------

const props = defineProps({
    /** 設備リスト */
    machines: {
        type: Array<ConfigMachine>,
        default: [] as Array<ConfigMachine>,
        required: true,
    },
    /** 素材リスト */
    materials: {
        type: Array<ConfigMaterial>,
        default: [] as Array<ConfigMaterial>,
        required: true,
    },
});

const emits = defineEmits<{
    (e: 'change', value: SearchCondition): void
}>();

// 内部定義 -----------------------------------------------------

/**
 * 検索条件
 * - 各値、空文字列の場合は検索条件から除外
 * - 現在値を emit すると親側でも同じものを持つ必要が出てくるので外部から参照できるようにする
 */
 const searchCondition = ref({
    recipeId: '', // レシピID
    recipeName: '', // レシピ名
    machineId: '', // 設備ID
    materialId: '', // 素材ID
    inputMaterialId: '', // 入力素材ID
    outputMaterialId: '', // 出力素材ID
    sortFunc: '', // ソート関数
    sortOrder: '', // ソート順序
} as SearchCondition);

/** ソート関数情報 */
interface SortFunction {
    /** ソート関数 */
    id: string;
    /** ソート関数名 */
    name: string;
};

/** ソート関数リスト */
const SortFunctons = [
    { id: 'None', name: 'なし' },
    { id: 'RecipeId', name: 'レシピID' },
    { id: 'RecipeName', name: 'レシピ名' },
    { id: 'MachineId', name: '設備' },
    { id: 'InputMaterialId', name: '入力素材' },
    { id: 'OutputMaterialId', name: '出力素材' },
] as Array<SortFunction>;

// ツールチップ文言一覧
const tooltips = {
    SearchRecipeId: 'レシピIDに指定のワードを含むレシピを表示します。',
    SearchRecipeName: 'レシピ名に指定のワードを含むを表示します。',
    SearchMachineId: '選択した設備を使うレシピを表示します。',
    SearchMaterial: '選択した素材を入出力いずれかに持つレシピを表示します。',
    SearchInputMaterial: '選択した素材を入力に持つレシピを表示します。',
    SearchOutputMaterial: '選択した素材を出力に持つレシピを表示します。',
    SortFunction: 'ソートの際参照する設定値を選択します。',
    SortAscending: '昇順でソートします。',
    SortDescending: '降順でソートします。',
    Apply: '現在の検索条件とソート設定をリストに反映します。',
    Reset: '現在の検索条件とソート設定をクリアします。'
} as const;

// 内部変数 -----------------------------------------------------

// 内部関数 -----------------------------------------------------

// Getters -----------------------------------------------------

const sortFuncIsNone = computed((): boolean => {
    return searchCondition.value.sortFunc == SortFunctons[0].id;
});

// Actions -----------------------------------------------------

/** 検索条件適用 */
const applyConditions = () => {
    emits('change', searchCondition.value);
}

/** 検索条件変更を通知 */
const changeConditions = () => {
    applyConditions();
};


/** レシピの検索条件をリセット */
const resetRecipeSearch = () => {
    // 各条件をリセット
    searchCondition.value.recipeId = '';
    searchCondition.value.recipeName = '';
    searchCondition.value.machineId = '';
    searchCondition.value.materialId = '';
    searchCondition.value.inputMaterialId = '';
    searchCondition.value.outputMaterialId = '';
    searchCondition.value.sortFunc = SortFunctons[0].id;
    searchCondition.value.sortOrder = SortOrder.Ascending;

    // 変更を親に伝搬
    applyConditions();
};

/** レシピの検索条件を更新（参照しているID変更等の影響反映の為） */
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
        applyConditions();
    }
};

/** レシピのソート関数を切り替え */
const changeSortFunc = (event: Event) => {
    if (!getEventValue(event)) return;
    const target = event.target as HTMLInputElement;
    searchCondition.value.sortFunc = target.value;
};

/** ソート順序更新 */
const changeSortOrder = (sortOrderId: string) => {
    if (sortFuncIsNone.value) return; // ソート関数が無しの場合は何もしない
    searchCondition.value.sortOrder = sortOrderId;
};

// 公開設定 -----------------------------------------------------

defineExpose({searchCondition});

// サイクル -----------------------------------------------------

onMounted(() => {
    // デフォルトのソートIDを設定
    searchCondition.value.sortFunc = SortFunctons[0].id;
    searchCondition.value.sortOrder = SortOrder.Ascending;
});

// 監視 --------------------------------------------------------

// props の値が更新されたら値が最新かチェックして更新（ID変更等の影響反映の為）
watch(() => props.machines, updateSearchConditions);
watch(() => props.materials, updateSearchConditions);

</script>

<script lang="ts">

/** ソート順序 */
export const SortOrder = {
    /** 昇順 */
    Ascending: 'ascending',
    /** 降順 */
    Descending: 'descending',
} as const;

/** 検索条件 */
export interface SearchCondition {
    /** レシピID */
    recipeId: string;
    /** レシピ名 */
    recipeName: string;
    /** 設備ID */
    machineId: string;
    /** 素材ID */
    materialId: string;
    /** 入力素材ID */
    inputMaterialId: string;
    /** 出力素材ID */
    outputMaterialId: string;
    /** ソート関数 */
    sortFunc: string;
    /** ソート順序 */
    sortOrder: string;
};
</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
.config-recipe-search-frame {
    width: 100%;
    display: flex;
    flex-direction: column;
    white-space: nowrap; /* 改行無し */
    font-size: 0.8em;
    line-height: 1em;
}

select {
    border-radius: 4px;
}

.header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0px 4px;
}

.contents {
    flex: 1;
    display: flex;
    gap: 4px;
    padding: 8px;
}

/* レシピ検索 */

.search-box {
    flex: 5;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px;
}

.search-box .search-condition-box {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    line-height: 1em;
}

.search-box .item-box {
    flex: 50%;
    display: flex;
    flex-wrap: wrap;
    padding: 4px;
    gap: 4px;
    align-items: center;
}
.search-box .item-box .label {
    width: 4em;
}
.search-box .item-box .value {
    flex: 1;
    height: 19px;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 区切り線用要素 */
.separator-v {
    width: 1px;
    background: var(--dark-main-color);
}
.separator-h {
    height: 1px;
    background: var(--dark-main-color);
}

/* ソート関数 */
.sort-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-wrap: nowrap;
    padding: 4px;
    gap: 4px;
}
.sort-box .sort-func-box {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.sort-box .sort-func-box .sort-func-select {
    text-align: center;
    padding: 4px;
}
.sort-box .sort-func-box .sort-func-select select {
    text-align: center;
    width: 100%;
}
.sort-box .sort-order-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
}
.sort-box .sort-order-item .sort-order {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    padding: 0px;
    width: 1em;
    cursor: pointer;
}
.sort-box .sort-order-item .radio-text{
    flex-wrap: nowrap;
    cursor: pointer;
    user-select: none;
    margin-right: 8px;
}

.footer {
    display: flex;
    line-height: 0.8em;
    align-items: center;
    margin: 4px 8px;
    gap: 8px;
    height: 2em;
}
.footer .label {
    width: 4em;
    display: flex;
    justify-content: center;
    align-items: center;
}
.footer .result-counter {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 4px;
    gap: 8px;
}
.footer .result-counter .label {
    width: fit-content;
}
.footer .result-counter .value {
    background: var(--dark-main-color);
    border: 1px solid var(--dark-main-color);
    border-radius: 4px;
    padding: 4px 8px;
}

.footer .button {
    background: var(--dark-main-color);
    border: 1px solid var(--dark-accent-color);
    cursor: pointer;
    padding: 4px;
}
.footer .button:hover {
    background: var(--dark-accent-color);
}

.footer .apply-button {
    border-radius: 4px;
    user-select: none;
    width: 10em;
}

.footer .reset-button {
    background: var(--dark-main-color);
    border: 1px solid var(--dark-accent-color);
    border-radius: 4px;
    user-select: none;
}
</style>