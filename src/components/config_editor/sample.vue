<template>
    <div></div>
</template>

<script setup lang="ts">

import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'

// 子コンポーネント ---------------------------------------------


// 基本定義 -----------------------------------------------------

/** プロパティを定義 */
const props = defineProps({
});

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------


// Actions -----------------------------------------------------


// サイクル -----------------------------------------------------


</script>

<style src="@/to_dark_theme.css" scoped />

<style scoped>
</style>