<template>
    <select @change="changeValue" :class="{ error: props.isError }">
        <option>-</option>
        <option v-for="[stateId, value] in Object.entries(MaterialState)" :value="stateId"
            :selected="props.modelValue == stateId">
            {{ value.Name }}
        </option>
    </select>
</template>


<script setup lang="ts">

import { MaterialState } from '@/defines/types/config'
import { getEventValue } from '@/logics/event_data'


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

// 内部変数 -----------------------------------------------------

// 内部関数 -----------------------------------------------------

// Getters -----------------------------------------------------

// Actions -----------------------------------------------------

/** 選択されている素材の状態変更通知 */
const changeValue = (event: Event) => {
    const value = getEventValue(event);
    emits('update:modelValue', (value == '-') ? '' : value); // 選択肢「-」は無しの意味なので空にする
};

// サイクル -----------------------------------------------------

</script>

<style src="@/to_dark_theme.css" scoped />

<style scoped>

</style>