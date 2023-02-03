<template>
    <select @change="changeValue" :class="{ error: props.isError }" :selectedIndex="selectedIndex">
        <option>-</option>
        <option v-for="(category, index) in categories" :key="index" :value="category.id">
            {{ category.name }}
        </option>
    </select>
</template>

<script setup lang="ts">

import { ref, computed, watch, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { getEventValue } from '@/logics/event_data'
import { CategoryList } from '@/defines/types/config'


// 子コンポーネント ---------------------------------------------


// 基本定義 -----------------------------------------------------

/** プロパティを定義 */
const props = defineProps({
    /** 現在の値 */
    modelValue: String,
    modelModifiers: {
        default: () => ({}),
    },
    /** エラー表示フラグ */
    isError: {
        type: Boolean,
        default: false,
    },
});

/** エミットを定義 */
const emits = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>();

/** 未選択状態時のインデックス値 */
const IndexNone = -1;

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 素材カテゴリリスト */
const categories = ref([] as CategoryList);

/** 最後に選択していた項目のインデックス */
const latestSelectedIndex = ref(IndexNone);

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------

/** 選択中のインデックス */
const selectedIndex = computed((): number => {
    if (props.modelValue === undefined) return 0; // イレギュラー
    if (categories.value === undefined) return 0; // イレギュラー
    return latestSelectedIndex.value; 
});

// Actions -----------------------------------------------------

/** props の値が更新された際の反映 */
const applyPropsSelect = () => {
    const index = categories.value.findIndex((category) => category.id == props.modelValue);
    if (index >= 0) {
        // 指定の設備カテゴリIDがリストにあれば選択
        latestSelectedIndex.value = index + 1; // 0 は選択無し「-」の為 +1 しておく
        return;
    }
    if (latestSelectedIndex.value == IndexNone) {
        // 未選択なら選択無し「-」にする
        latestSelectedIndex.value = 0;
    }
};

/** ストアから最新の設備カテゴリIDリストを取得 */
const getCategories = () => {
    // 最新値のクローン取得
    categories.value = configStore.config.materialCategories.map((category) => category.clone());
    // props の値を反映
    applyPropsSelect();
};

/** 選択されている素材カテゴリID変更通知 */
const changeValue = (event: Event) => {
    const value = getEventValue(event);
    emits('update:modelValue', (value == '-') ? '' : value); // 選択肢「-」は無しの意味なので空にする
};

// サイクル -----------------------------------------------------

onMounted(getCategories);

// 監視 --------------------------------------------------------

// props の値が更新されたら
watch(() => props.modelValue, applyPropsSelect);

configStore.$subscribe(() => {
    // 更新が終わったらタイミングでストアの値で内部情報を更新
    if(configStore.isUpdating) return;

    // 新旧のリストを取得
    const oldList = categories.value.map((v, i) => ({i, v}));
    const newList = configStore.config.materialCategories.map((v, i) => ({i, v}));
    // お互いに存在しない要素を抽出
    const oldDiff = oldList.filter((v1) => !newList.some((v2) => v1.v.id == v2.v.id));
    const newDiff = newList.filter((v1) => !oldList.some((v2) => v1.v.id == v2.v.id));
    // 現在の選択要素に影響があるかチェック
    const currentIndex = latestSelectedIndex.value; // 現在選択中のインデックス
    if (oldDiff.length < newDiff.length) {
        // 追加の場合、現在選択中のインデックスより前ならインデックスをずらす
        const lowerIndexNumber = newDiff.filter((v) => v.i < currentIndex ).length;
        latestSelectedIndex.value += lowerIndexNumber;
    }
    else if (oldDiff.length > newDiff.length) {
        // 削除の場合
        if (oldDiff.some((v) => v.i == currentIndex)) {
            // 現在選択中の要素が削除されたら選択無しにする
            latestSelectedIndex.value = 0
        }
        else {
            // 現在選択中のインデックスより前ならインデックスをずらす
            const lowerIndexNumber = oldDiff.filter((v) => v.i < currentIndex ).length;
            latestSelectedIndex.value -= lowerIndexNumber;
        }
    }
    else {
        // 更新の場合、選択中のインデックスは変わらないので変更なし
    }

    // リストを更新
    getCategories();
});
</script>


<style src="@/to_dark_theme.css" scoped />

<style scoped>

</style>