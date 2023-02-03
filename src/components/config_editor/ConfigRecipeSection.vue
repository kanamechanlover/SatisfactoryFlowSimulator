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
            <ConfigRecipeSearch ref="search" @change="updateRecipeList"></ConfigRecipeSearch>
            <div class="result-counter">
                <span>表示中のレシピ数：{{ recipeIndexList.length }}</span>
            </div>
        </div>
        <ConfigRecipeView v-for="index in recipeIndexList" :key="uniqueKey(index)" :index="index" @delete="deleteRecipe"></ConfigRecipeView>
        <div class="additional-box">
            <button class="additional-button" @click="addRecipe" title="追加">＋</button>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, computed, onMounted, watch } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { ConfigRecipe, ConfigRecipeMaterial, ConfigRecipeList } from '@/defines/types/config'
import ConfigRecipeSearch, { SearchCondition } from './ConfigRecipeSearch.vue'
import Logger from '@/logics/logger'


// 子コンポーネント ---------------------------------------------

import ConfigRecipeView from '@/components/config_editor/ConfigRecipeView.vue'

// 基本定義 -----------------------------------------------------

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** レシピリスト */
const recipes = ref([] as ConfigRecipeList);

/** 検索結果としてのレシピIDリスト */
const recipeIndexList = ref([] as Array<number>);

/** 検索条件コンポーネントへの参照 */
const search = ref<InstanceType<typeof ConfigRecipeSearch> | null>(null);

// 内部関数 -----------------------------------------------------

// Getters -----------------------------------------------------

/** ユニークキー */
const uniqueKey = computed(() => (index: number): number|undefined => {
    if (index === undefined || !configStore.config.recipes[index]) return; // イレギュラー
    return configStore.config.recipes[index].uniqueKey;
});

// Actions -----------------------------------------------------

/** レシピ切り替え */
const getRecipes = () => {
    recipes.value = configStore.config.recipes.map((recipe) => recipe.clone());
    const condition = (search.value) ? search.value.searchCondition : null;
    updateRecipeList(condition);
};

/** レシピ追加 */
const addRecipe = () => {
    Logger.log('adding', 'addRecipe');
    configStore.addRecipe();
    const condition = (search.value) ? search.value.searchCondition : null;
    updateRecipeList(condition);
    Logger.log('added', 'addRecipe');
};

/** レシピ削除 */
const deleteRecipe = (index: number) => {
    if (index >= recipes.value.length) return; // イレギュラー
    Logger.log('deleting', 'deleteRecipe');
    configStore.deleteRecipe(index);
    const condition = (search.value) ? search.value.searchCondition : null;
    updateRecipeList(condition);
    Logger.log('deleted', 'deleteRecipe');
};

/** フィルタ済みレシピリスト */
const updateRecipeList = (condition: SearchCondition|null = null) => {
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
    margin-bottom: 8px;
}
.search-box {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    border: 1px solid var(--dark-main-color);
    margin-bottom: 8px;
}
</style>