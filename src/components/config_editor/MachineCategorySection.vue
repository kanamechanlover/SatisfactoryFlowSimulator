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
                    <input type="text" :value="category.id"
                        :class="{ error: idError(index), warning: hasDuplicateId(index) }"
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

import { computed, ref, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { CategoryList } from '@/defines/types/config'
import { getDuplicates } from '@/logics/primitives'

// 子コンポーネント ---------------------------------------------

// 基本定義 -----------------------------------------------------

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 設備カテゴリIDリスト */
const categories = ref([] as CategoryList);

/** 重複IDを持つ要素のインデックスリスト */
const duplicatedIndexes = ref([] as Array<number>);

// 内部関数 -----------------------------------------------------

/**
 * 内部レシピ更新時
 * @param index [in] インデックス
 * @return 処理開始の成否（true: 成功）
 */
const applyCategoryData = (index: number): boolean => {
    // 設定ストアに変更を通知
    return configStore.setMachineCategory(index, categories.value[index]);
};

/** 重複IDを持つ要素のインデックスリストを取得 */
const getDuplicateIndexes = () => {
    const categoryIds = categories.value.map((v) => v.id);
    const duplicatedIds = getDuplicates(categoryIds);
    let indexes = [] as Array<number>;
    duplicatedIds.forEach((id) => {
        indexes.concat(
            categories.value.filter((v) => v.id == id).map((_, i) => i)
        );
    });
    duplicatedIndexes.value = indexes.sort();
};

// Getters -----------------------------------------------------

/** 設備カテゴリ参照数 */
const referenceMachineCategory = computed(() => {
    return (id: string): number => {
        const machines = configStore.config.machines.filter((machine) => machine.category == id);
        return machines.length;
    };
});

/** 設備カテゴリIDエラー */
const idError = computed(() => (index: number): boolean => {
    if (index < 0 || index > categories.value.length) return true; // イレギュラー
    return categories.value[index].idError();
});
/** 設備カテゴリ名エラー */
const nameError = computed(() => (index: number): boolean => {
    if (index < 0 || index > categories.value.length) return true; // イレギュラー
    return categories.value[index].nameError();
});

/** ID重複チェック */
const hasDuplicateId = computed(() => (index: number): boolean => {
    if (index === undefined || !categories.value[index]) return false; // イレギュラー
    return duplicatedIndexes.value.indexOf(index) !== -1;
});

// Actions -----------------------------------------------------

/** ストアから最新の設備カテゴリリストを取得 */
const getCategories = () => {
    // 設備カテゴリリスト取得
    categories.value = configStore.config.machineCategories.map((category) => category.clone());
    // 重複IDを持つインデックスを取得
    getDuplicateIndexes();
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
    const target = event.target as HTMLInputElement;
    const oldId = categories.value[index].id;
    categories.value[index].id = target.value;
    const succeeded = applyCategoryData(index);
    if (!succeeded) {
        // 更新に失敗したら元に戻す
        categories.value[index].id = oldId;
    }
}

/** 
 * 設備カテゴリ名変更
 * @param index [in] インデックス
 * @param event [in] イベントデータ
 */
const changeCategoryName = (index: number, event: Event) => {
    if (!event?.target) return;
    const target = event.target as HTMLInputElement;
    const oldName = categories.value[index].name;
    categories.value[index].name = target.value;
    const succeeded = applyCategoryData(index);
    if (!succeeded) {
        // 更新に失敗したら元に戻す
        categories.value[index].name = oldName;
    }
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