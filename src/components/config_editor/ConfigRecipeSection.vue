<template>
    <div class="config-recipe-section-frame">
        <p>
            このセクションでは制作レシピを定義します。<br />
            <span class="accent"><fa :icon="['fas', 'pen-to-square']" /></span> ボタンで設定を変更できます。
            <span class="accent"><fa :icon="['fas', 'arrow-up-right-from-square']" /></span> ボタンで閲覧モードに戻せます。<br />
            各素材の数は１回の製造（消費）分の数を設定します。（製造時間と併せて毎分の素材消費・生産数を計算するのに使います）<br />
            右の「-」で設備削除、下部の「＋」で設備追加できます。<br />
            レシピの検索・ソートはできますが、設定エラーが発生している項目は常に表示されます。
        </p>
        <div class="search-box">
            <ConfigRecipeSearch ref="search" @change="applySearchCondition"
                    :machines="machines" :materials="materials">
                <div class="result-counter">
                    <span class="label">表示中のレシピ数</span>
                    <span class="value">{{ recipeIndexList.length }}</span>
                </div>
            </ConfigRecipeSearch>
        </div>
        <ConfigRecipeView v-for="index in recipeIndexList" :key="uniqueKey(index)" ref="view"
            :index="index" :recipe="recipe(index)" :machine="machine(index)"
            :machines="machines" :materials="materials"
            :has-duplicate="hasDuplicateId(index)" @delete="deleteRecipe">
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

import ConfigRecipeSearch, { SearchCondition, SortOrder } from './ConfigRecipeSearch.vue'
import ConfigRecipeView from '@/components/config_editor/ConfigRecipeView.vue'

// 外部連携 -----------------------------------------------------

// 内部定義 -----------------------------------------------------

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** レシピリスト */
const recipes = ref([] as ConfigRecipeList);

/** 設備リスト */
const machines = ref([] as ConfigMachineList);

/** 素材リスト */
const materials = ref([] as ConfigMaterialList);

/**
 * 検索結果としてのレシピIDリスト
 * ※設定変更により即座に一覧から消えないように更新タイミングを絞っている
 * - onMount 時に更新
 * - レシピ追加・削除時に更新
 * - レシピ検索の「リストに反映」操作時に更新
 * - 設定インポート時に反映
 */
const recipeIndexList = ref([] as Array<number>);

/** 検索条件コンポーネントへの参照 */
const search = ref<InstanceType<typeof ConfigRecipeSearch> | null>(null);

/** 重複IDを持つ要素のインデックスリスト */
const duplicatedIndexes = ref([] as Array<number>);

/** ref: レシピ要素（表示状態の変更等で使用） */
const view = ref([] as Array<typeof ConfigRecipeView>);

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
    // 重複IDを持つインデックスを取得
    getDuplicateIndexes();
};

/** レシピ追加 */
const addRecipe = () => {
    // 設定ストアに反映
    const index = configStore.addRecipe();
    // フィルタ済のリストに加える
    recipeIndexList.value.push(index);
};
/** レシピ削除 */
const deleteRecipe = (index: number) => {
    // フィルタ済のリストにあれば削除
    const deletedList = recipeIndexList.value.filter((v) => v != index);
    // 削除されたレシピ以降のインデックスがずれるので補正
    deletedList.forEach((v, i, a) => {
        if (v > index) a[i]--;
    });
    recipeIndexList.value = deletedList;
};

/** 全て閲覧モード（コンパクト表示）にする */
const allClose = () => {
    view.value.forEach((v) => {
        v.toViewMode();
    });
};

/** レシピとインデックスのセット */
type ConfigRecipeItem = {v: ConfigRecipe, i: number};

/**
 * レシピリストフィルタ
 * @param list [in,out] レシピリスト
 * @param condition [in] 検索条件
 * @return フィルタ後のレシピリスト
 */
const filterRecipeList = (list: Array<ConfigRecipeItem>, condition: SearchCondition): Array<ConfigRecipeItem> => {
    return list.filter((data) => {
        const recipe = data.v as ConfigRecipe;
        // エラー持ちは強制表示
        const machine = machines.value.find((v) => v.id == recipe.machineId);
        const hasError = !machine || recipe.existError(machine, materials.value);
        if (hasError) return true;

        // レシピ名検索
        const includesId = (condition.recipeId) ? recipe.id.indexOf(condition.recipeId) != -1 : true;
        // レシピ名検索
        const includesName = (condition.recipeName) ? recipe.name.indexOf(condition.recipeName) != -1 : true;
        // 設備検索
        const machineMatch = (condition.machineId) ? recipe.machineId == condition.machineId : true;
        // 素材検索（入出力いずれかに指定素材が入っているか）
        const materialMatch = (condition.materialId) ? recipe.input.some((material: ConfigRecipeMaterial) => {
            return material.id == condition.materialId;
        }) || recipe.output.some((material: ConfigRecipeMaterial) => {
            return material.id == condition.materialId;
        }) : true;
        // 入力素材検索
        const inputMatch = (condition.inputMaterialId) ? recipe.input.some((material: ConfigRecipeMaterial) => {
            return material.id == condition.inputMaterialId;
        }) : true;
        // 出力素材検索
        const outputMatch = (condition.outputMaterialId) ? recipe.output.some((material: ConfigRecipeMaterial) => {
            return material.id == condition.outputMaterialId;
        }) : true;

        // 全て AND 検索
        return includesId && includesName && machineMatch && materialMatch && inputMatch && outputMatch;
    });
}

/**
 * レシピリストソート
 * @param list [in] レシピリスト
 * @param condition [in] 検索条件
 * @return ソート後のレシピリスト
 */
const sortRecipeList = (list: Array<ConfigRecipeItem>, condition: SearchCondition): Array<ConfigRecipeItem> => {
    type CompareValueFunc = (item: ConfigRecipeItem) => string|number;
    const compareValue = { // 比較する値取得関数
        /** レシピID */
        'RecipeId': (item: ConfigRecipeItem): string => {
            // 通常の文字列比較
            return item.v.id;
        },
        /** レシピ名 */
        'RecipeName': (item: ConfigRecipeItem): string => {
            // 通常の文字列比較
            return item.v.name;
        },
        /** 設備 */
        'MachineId': (item: ConfigRecipeItem): number => {
            // 設備の並び順
            return machines.value.findIndex((v) => v.id == item.v.machineId);
        },
        /** 入力素材 */
        'InputMaterialId': (item: ConfigRecipeItem): number => {
            // １つ目の素材の並び順
            const validMaterials = item.v.input.filter((v) => v && v.id);
            if (validMaterials.length == 0) return materials.value.length; // 有効な素材が無い場合は末尾に配置
            const materialId = validMaterials[0].id;
            return materials.value.findIndex((v) => v.id == materialId);
        },
        /** 出力素材 */
        'OutputMaterialId': (item: ConfigRecipeItem): number => {
            // １つ目の素材の並び順
            const validMaterials = item.v.output.filter((v) => v && v.id);
            if (validMaterials.length == 0) return materials.value.length; // 有効な素材が無い場合は末尾に配置
            const materialId = validMaterials[0].id;
            return materials.value.findIndex((v) => v.id == materialId);
        },
    } as {[key: string]: CompareValueFunc};

    // ソート対象でなければリストに何も手を加えない
    if (!(condition.sortFunc in compareValue)) return list;

    // ソート関数を定義
    const compareValueFunc = compareValue[condition.sortFunc];
    const compareFunctions = {
        /** 昇順 */
        [SortOrder.Ascending]: (v1: any, v2: any) => {
            return (v1 > v2) ? 1 : (v1 < v2) ? -1 : 0;
        },
        /** 降順 */
        [SortOrder.Descending]: (v1: any, v2: any) => {
            return (v1 < v2) ? 1 : (v1 > v2) ? -1 : 0;
        },
    } as {[key: string]: Function};
    const compareFunc = (item1: ConfigRecipeItem, item2: ConfigRecipeItem): number => {
        const s1 = compareValueFunc(item1);
        const s2 = compareValueFunc(item2);
        return compareFunctions[condition.sortOrder](s1, s2);
    };
    // リストをソート
    return list.slice().sort(compareFunc);
};

/** フィルタ済みレシピリスト更新 */
const updateFilteredRecipeList = (condition: SearchCondition|null = null) => {
    // 条件の指定が無ければそのまま
    if (!condition) {
        recipeIndexList.value = recipes.value.map((_, i) => i);
        return;
    }
    // レシピとインデックスのセットのリストに変換
    let list = recipes.value.map((v,i): ConfigRecipeItem => { return {v, i}});

    // 条件ごとにフィルタリング
    list = filterRecipeList(list, condition);

    // ソート機能
    list = sortRecipeList(list, condition);

    // インデックスだけにして設定
    recipeIndexList.value = list.map((v) => v.i) as Array<number>;
};

const applySearchCondition = (condition: SearchCondition|null = null) => {
    // レシピリスト更新
    updateFilteredRecipeList(condition);

    // 全てのレシピを閲覧モード（コンパクト表示）に
    allClose();
}

/** 設定ファイルのインポートが完了した時 */
const onImportedConfig = () => {
    // レシピリスト更新
    updateFilteredRecipeList();
};

// 公開設定 -----------------------------------------------------

defineExpose({onImportedConfig});

// サイクル -----------------------------------------------------

// マウント時
onMounted(() => {
    // 内部保持している情報更新
    getRecipes();
    // 表示するレシピ更新
    updateFilteredRecipeList();
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
.search-box {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    border: 1px solid var(--dark-main-color);
    margin-bottom: 8px;
}

.search-box .label {
    width: 4em;
    display: flex;
    justify-content: center;
    align-items: center;
}
.search-box .result-counter {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 4px;
    gap: 8px;
}
.search-box .result-counter .label {
    width: fit-content;
}
.search-box .result-counter .value {
    background: var(--dark-main-color);
    border: 1px solid var(--dark-main-color);
    border-radius: 4px;
    padding: 4px 8px;
}
</style>