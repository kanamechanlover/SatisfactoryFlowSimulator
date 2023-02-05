<template>
    <div class="config-recipe-section-frame">
        <p>
            このセクションでは制作レシピを定義します。<br />
            <span class="accent"><fa :icon="['fas', 'pen-to-square']" /></span> ボタンで設定を変更できます。
            <span class="accent"><fa :icon="['fas', 'arrow-up-right-from-square']" /></span> ボタンで閲覧モードに戻せます。<br />
            各素材の数は１回の製造（消費）分の数を設定します。（製造時間と併せて毎分の素材消費・生産数を計算します。）<br />
            右の「-」で設備削除、下部の「＋」で設備追加できます。
        </p>
        <div class="search-box">
            <ConfigRecipeSearch ref="search" @change="updateFilteredRecipeList"
                :machines="machines" :materials="materials"></ConfigRecipeSearch>
            <div class="result-counter">
                <span>表示中のレシピ数：{{ recipeIndexList.length }}</span>
            </div>
        </div>
        <ConfigRecipeView v-for="index in recipeIndexList" :key="uniqueKey(index)"
            :index="index" :recipe="recipe(index)" :machine="machine(index)"
            :machines="machines" :materials="materials"
            :has-duplicate="hasDuplicateId(index)">
        </ConfigRecipeView>
        <div class="additional-box">
            <button class="additional-button" @click="addRecipe" title="追加">＋</button>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, computed, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import {
    ConfigRecipe, ConfigRecipeMaterial, ConfigRecipeList,
    ConfigMachineList, ConfigMaterialList, ConfigMachine
} from '@/defines/types/config'
import { getDuplicates } from '@/logics/primitives'


// 子コンポーネント ---------------------------------------------

import ConfigRecipeSearch, { SearchCondition } from './ConfigRecipeSearch.vue'
import ConfigRecipeView from '@/components/config_editor/ConfigRecipeView.vue'

// 基本定義 -----------------------------------------------------

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** レシピリスト */
const recipes = ref([] as ConfigRecipeList);

/** 設備リスト */
const machines = ref([] as ConfigMachineList);

/** 素材リスト */
const materials = ref([] as ConfigMaterialList);

/** 検索結果としてのレシピIDリスト */
const recipeIndexList = ref([] as Array<number>);

/** 検索条件コンポーネントへの参照 */
const search = ref<InstanceType<typeof ConfigRecipeSearch> | null>(null);

/** 重複IDを持つ要素のインデックスリスト */
const duplicatedIndexes = ref([] as Array<number>);

// 内部関数 -----------------------------------------------------


/** 重複IDを持つ要素のインデックスリストを取得 */
const getDuplicateIndexes = () => {
    // 重複IDを持つ要素を取得
    const recipeIds = recipes.value.map((v) => v.id);
    const duplicatedIds = getDuplicates(recipeIds);
    // 重複IDを持つ要素のインデックスを取得
    let indexes = [] as Array<number>;
    duplicatedIds.forEach((recipeId) => {
        indexes = indexes.concat(
            recipes.value
                .map((v, i) => { return {i, v}; })
                .filter((data) => data.v.id == recipeId)
                .map((data) => data.i)
        );
    });
    duplicatedIndexes.value = indexes.sort();
};

// Getters -----------------------------------------------------

/** ユニークキー */
const uniqueKey = computed(() => (index: number): number|undefined => {
    if (index === undefined || !recipes.value[index]) return; // イレギュラー
    return recipes.value[index].uniqueKey;
});

/**
 * レシピデータ取得
 * @param index [in] レシピインデックス
 * @return レシピデータ（見つからない場合は undefined）
 */
const recipe = computed(() => (index: number): ConfigRecipe|undefined => {
    if (index < 0 || index >= recipes.value.length) return undefined;
    return recipes.value[index];
});

/**
 * レシピの持つ設備データ取得
 * @param index [in] レシピインデックス
 * @return 設備データ（見つからない場合は undefined）
 */
const machine = computed(() => (index: number): ConfigMachine|undefined => {
    if (index < 0 || index >= recipes.value.length) return undefined;
    const machineId = recipes.value[index].machineId;
    const machineData = machines.value.find((v) => v.id == machineId);
    return (machineData) ? machineData : undefined;
});

/** ID重複チェック */
const hasDuplicateId = computed(() => (index: number): boolean => {
    if (index === undefined || !recipes.value[index]) return false; // イレギュラー
    return duplicatedIndexes.value.indexOf(index) !== -1;
});

// Actions -----------------------------------------------------

/** レシピ切り替え */
const getRecipes = () => {
    // 各設定の最新値の複製を取得
    recipes.value = configStore.config.recipes.map((recipe) => recipe.clone());
    machines.value = configStore.config.machines.map((machine) => machine.clone());
    materials.value = configStore.config.materials.map((material) => material.clone());
    // フィルタ済みレシピリスト
    const condition = (search.value) ? search.value.searchCondition : null;
    updateFilteredRecipeList(condition);
    // 重複IDを持つインデックスを取得
    getDuplicateIndexes();
};

/** レシピ追加 */
const addRecipe = () => {
    configStore.addRecipe();
    const condition = (search.value) ? search.value.searchCondition : null;
    updateFilteredRecipeList(condition);
};

/** フィルタ済みレシピリスト */
const updateFilteredRecipeList = (condition: SearchCondition|null = null) => {
    if (!condition) {
        recipeIndexList.value = recipes.value.map((_, i) => i);
        return;
    }
    let list = recipes.value.map((v,i) => [v,i]);
    list = list.filter((data) => {
        const recipe = data[0] as ConfigRecipe;
        // レシピ名検索
        const includesName = (condition.recipeName) ? recipe.name.indexOf(condition.recipeName) != -1 : true;
        // 設備検索
        const machineMatch = (condition.machineId) ? recipe.machineId == condition.machineId : true;
        // 入力素材検索
        const inputMatch = (condition.inputMaterialId) ? recipe.input.some((material: ConfigRecipeMaterial) => {
            return material.id == condition.inputMaterialId;
        }) : true;
        // 入力素材検索
        const outputMatch = (condition.outputMaterialId) ? recipe.output.some((material: ConfigRecipeMaterial) => {
            return material.id == condition.outputMaterialId;
        }) : true;
        // 全て AND 検索
        return includesName && machineMatch && inputMatch && outputMatch;
    });
    recipeIndexList.value = list.map((v) => v[1]) as Array<number>;
};

// サイクル -----------------------------------------------------

// マウント時
onMounted(() => {
    getRecipes();
});

// 監視 --------------------------------------------------------

configStore.$subscribe(() => {
    // 更新が終わったらタイミングでストアの値で内部情報を更新
    if(configStore.isUpdating) return;
    getRecipes();
});


</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>

.config-recipe-section-frame {
    flex: 1;
    flex-direction: column;
}
.result-counter {
    font-size: 0.8em;
    line-height: 1em;
    padding: 8px 0px;
    margin: 0px 4px;
    border-top: 1px solid var(--dark-main-color)
}
.search-box {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    border: 1px solid var(--dark-main-color);
    margin-bottom: 8px;
}
</style>