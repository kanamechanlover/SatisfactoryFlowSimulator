<template>
    <section>
        <h1 @click="toggle">
            <span class="toggle" :class="{collapse: isCollapsed}">▼</span>
            <span>{{ props.sectionName }}</span>
            <span v-if="props.itemCount > 0">{{ ' (' + props.itemCount + ')' }}</span>
            <span v-if="props.hasError" class="section-error">エラー有り</span>
        </h1>
        <div class="section-body" v-show="isOpened">
            <slot></slot>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 子コンポーネント ---------------------------------------------


// 基本定義 -----------------------------------------------------

/** プロパティを定義 */

/** プロパティを定義 */
const props = defineProps({
    /** ヘッダ部に表示する文字列 */
    sectionName: {
        type: String,
        required: true,
        default: '',
    },
    /** ヘッダ部のカッコ内に表示する数値 */
    itemCount: {
        type: Number,
        default: -1,
    },
    /** エラー有無 */
    hasError: {
        type: Boolean,
        default: false,
    },
});

// 内部変数 -----------------------------------------------------

const collapsed = ref(true);

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------

/** 格納状態か */
const isCollapsed = computed((): boolean => {
    return collapsed.value;
});
/** 展開状態か */
const isOpened = computed((): boolean => {
    return !collapsed.value;
});

// Actions -----------------------------------------------------

/** 展開・格納状況をトグル */
const toggle = () => {
    collapsed.value = !collapsed.value;
}

// サイクル -----------------------------------------------------


</script>

<style src="@/to_dark_theme.css" scoped />

<style scoped>
section {
    position: relative;
}
section h1 {
    position: relative;
    font-size: 1em;
    line-height: 1em;
    margin: 8px 8px;
    padding: 4px;
    border: 1px solid white;
    border-radius: 8px;
    user-select: none;
}
section h1 span.toggle {
    position:absolute;
    top: 50%;
    left: 8px;
    transform: translateY(-50%);
    transition: 0.5s;
    transform-origin: center;
}
section h1 span.toggle.collapse {
    transform: translateY(-50%) rotateZ(-90deg);
}
section h1:hover {
    cursor: pointer;
    background: orange;
}
.section-body {
    display: flex;
    flex-direction: column;
    padding: 0px 8px;
    padding-bottom: 16px;
}

.section-error {
    color: red;
    font-size: 0.6em;
    margin-left: 8px;
    line-height: 1em;
}

</style>