<template>
    <div class="material-category-section-frame">
        <p>
            このセクションでは素材に付与するカテゴリを定義します。<br />
            右の「-」で設備削除、下部の「＋」で設備追加できます。
        </p>
        <table>
            <tr>
                <th class="no">No</th>
                <th>素材カテゴリID</th>
                <th>素材カテゴリ名</th>
                <th class="reference">参照数</th>
                <th class="delete"></th>
            </tr>
            <tr v-for="(category, index) in categories" :key="index">
                <td>{{ index + 1 }}</td>
                <td>
                    <input type="text" :value="category.id" :class="{ error: idError(index) }"
                        @change="changeCategoryId(index, $event)" />
                </td>
                <td>
                    <input type="text" :value="category.name" :class="{ error: nameError(index) }"
                        @change="changeCategoryName(index, $event)" />
                </td>
                <td>{{ referenceMaterialCategory(category.id) }}</td>
                <td><button @click="deleteMaterialCategory(index)" title="削除">-</button></td>
            </tr>
        </table>
        <div class="additional-box">
            <button class="additional-button" @click="addMaterialCategory" title="追加">＋</button>
        </div>
    </div>
</template>

<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { CategoryList } from '@/defines/types/config'

// 子コンポーネント ---------------------------------------------

// 基本定義 -----------------------------------------------------


// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 素材カテゴリIDリスト */
const categories = ref([] as CategoryList);

// 内部関数 -----------------------------------------------------

/**
 * 内部レシピ更新時
 * @param index [in] インデックス
 */
const applyCategoryData = function(index: number) {
    configStore.setMaterialCategory(index, categories.value[index]);
};

// Getters -----------------------------------------------------

/** ストアから最新の設備カテゴリIDリストを取得 */
const getCategories = () => {
    categories.value = configStore.config.materialCategories.map((category) => category.clone());
};

/** 素材カテゴリ参照数 */
const referenceMaterialCategory = computed(() => {
    return (id: string): number => {
        const material = configStore.config.materials.filter((material) => material.category == id);
        return material.length;
    };
});

/** 素材カテゴリIDエラー */
const idError = computed(() => (index: number): boolean => {
    if (index < 0 || index > categories.value.length) return true; // イレギュラー
    return categories.value[index].idError();
});
/** 素材カテゴリ名エラー */
const nameError = computed(() => (index: number): boolean => {
    if (index < 0 || index > categories.value.length) return true; // イレギュラー
    return categories.value[index].nameError();
});

// Actions -----------------------------------------------------

/** 素材カテゴリ追加 */
const addMaterialCategory = () => {
    configStore.addMaterialCategory();
};

/** 素材カテゴリ削除 */
const deleteMaterialCategory = (index: number) => {
    configStore.deleteMaterialCategory(index);
};


/** 
 * 素材カテゴリID変更
 * @param index [in] インデックス
 * @param event [in] イベントデータ
 */
const changeCategoryId = (index: number, event: Event) => {
    if (!event?.target) return;
    categories.value[index].id = (event.target as HTMLInputElement).value;
    applyCategoryData(index);
}

/** 
 * 素材カテゴリ名変更
 * @param index [in] インデックス
 * @param event [in] イベントデータ
 */
const changeCategoryName = (index: number, event: Event) => {
    if (!event?.target) return;
    categories.value[index].name = (event.target as HTMLInputElement).value;
    applyCategoryData(index);
}

// サイクル -----------------------------------------------------

onMounted(() => {
    getCategories();
});

// 監視 --------------------------------------------------------

configStore.$subscribe(() => {
    // 更新が終わったらタイミングでストアの値で内部情報を更新
    if(configStore.isUpdating) return;
    getCategories();
});

</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
table {
    width: 100%;
}
</style>