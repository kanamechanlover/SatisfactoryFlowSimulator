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
import { getEventValue } from '@/logics/event_data'
import { ConfigCategory } from '@/defines/types/config'


// 子コンポーネント ---------------------------------------------


// 基本定義 -----------------------------------------------------

/** プロパティを定義 */
const props = defineProps({
    /** 現在の値(v-model用) */
    modelValue: {
        type: String,
        default: '',
    },
    /** 設備カテゴリリスト */
    categories: {
        type: Array<ConfigCategory>,
        default: [] as Array<ConfigCategory>,
        require: true,
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

/** 最後に選択していた項目のインデックス */
const latestSelectedIndex = ref(IndexNone);

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------

/** 選択中のインデックス */
const selectedIndex = computed((): number => {
    return latestSelectedIndex.value; 
});

// Actions -----------------------------------------------------

/** props の値が更新された際の反映 */
const applyPropsSelect = () => {
    const index = props.categories.findIndex((category) => category.id == props.modelValue);
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

/** 選択されている設備カテゴリID変更通知 */
const changeValue = (event: Event) => {
    const value = getEventValue(event);
    emits('update:modelValue', (value == '-') ? '' : value); // 選択肢「-」は無しの意味なので空にする
};

// サイクル -----------------------------------------------------

onMounted(applyPropsSelect);

// 監視 --------------------------------------------------------

// props の値が更新されたら
watch(() => props.modelValue, applyPropsSelect);

</script>


<style src="@/to_dark_theme.css" scoped />

<style scoped>

</style>