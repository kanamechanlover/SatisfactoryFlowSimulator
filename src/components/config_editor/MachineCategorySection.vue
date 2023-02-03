<template>
    <div class="machine-category-section-frame">
        <p>
            このセクションでは設備に付与するカテゴリを定義します。<br />
            右の「-」で設備削除、下部の「＋」で設備追加できます。
        </p>
        <table>
            <tr>
                <th class="no">No</th>
                <th>設備カテゴリID</th>
                <th>設備カテゴリ名</th>
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
                <td>{{ referenceMachineCategory(category.id) }}</td>
                <td><button @click="deleteMachineCategory(index)" title="削除">-</button></td>
            </tr>
        </table>
        <div class="additional-box">
            <button class="additional-button" @click="addMachineCategory" title="追加">＋</button>
        </div>
    </div>
</template>

<script setup lang="ts">

import { computed, ref, watch, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { CategoryList } from '@/defines/types/config'

// 子コンポーネント ---------------------------------------------

// 基本定義 -----------------------------------------------------


// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 設備カテゴリIDリスト */
const categories = ref([] as CategoryList);

// 内部関数 -----------------------------------------------------

/**
 * 内部レシピ更新時
 * @param index [in] インデックス
 */
const applyCategoryData = function(index: number) {
    configStore.setMachineCategory(index, categories.value[index]);
};

// Getters -----------------------------------------------------

/** 設備カテゴリ参照数 */
const referenceMachineCategory = computed(() => {
    return (id: string): number => {
        const machines = configStore.config.machines.filter((machine) => machine.category == id);
        return machines.length;
    };
});

/** 設備IDエラー */
const idError = computed(() => (index: number): boolean => {
    if (index < 0 || index > categories.value.length) return true; // イレギュラー
    return categories.value[index].idError();
});
/** 設備名エラー */
const nameError = computed(() => (index: number): boolean => {
    if (index < 0 || index > categories.value.length) return true; // イレギュラー
    return categories.value[index].nameError();
});

// Actions -----------------------------------------------------

/** ストアから最新の設備カテゴリIDリストを取得 */
const getCategories = () => {
    categories.value = configStore.config.machineCategories.map((category) => category.clone());
};

/** 設備カテゴリ追加 */
const addMachineCategory = () => {
    configStore.addMachineCategory();
};

/** 設備カテゴリ削除 */
const deleteMachineCategory = (index: number) => {
    configStore.deleteMachineCategory(index);
};

/** 
 * 設備カテゴリID変更
 * @param index [in] インデックス
 * @param event [in] イベントデータ
 */
const changeCategoryId = (index: number, event: Event) => {
    if (!event?.target) return;
    categories.value[index].id = (event.target as HTMLInputElement).value;
    applyCategoryData(index);
}

/** 
 * 設備カテゴリ名変更
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