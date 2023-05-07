<template>
    <div class="custom-accordion-frame" ref="frame">
        <div class="header-box" @click="toggle" ref="toggleButton">
            <slot name="header" />
        </div>
        <div class="body-box" v-show="isOpenedDropdown">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, onMounted, onBeforeUnmount } from 'vue'

// 子コンポーネント ---------------------------------------------


// 外部連携 -----------------------------------------------------

/** プロパティを定義 */
const props = defineProps({
    /** コンポーネント部以外クリックで閉じるか */
    isAutoClose: {
        type: Boolean,
        default: false,
    },
});

const emits = defineEmits<{
    (e: 'opened'): void, // ボディ部が開いた
    (e: 'closed'): void, // ボディ部が閉じた
}>();

// 内部定義 -----------------------------------------------------


// 内部変数 -----------------------------------------------------

/** ルート要素 */
const frame = ref<HTMLElement|null>(null);

/** トグルボタン要素 */
const toggleButton = ref<HTMLElement|null>(null);

/** ボディ部開閉フラグ（true: 開、false：閉） */
const isOpenedDropdown = ref<Boolean>(false);

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------


// Actions -----------------------------------------------------

/** ボディ部開閉切り替え */
const toggle = () => {
    if (isOpenedDropdown.value) {
        close(); // ボディ部を閉じる（非表示にする）
    }
    else {
        open(); // ボディ部を開く（表示する）
    }
};
/** ボディ部を開く */
const open = () => {
    isOpenedDropdown.value = true;
    // コンポーネント外クリック時のイベント追加
    if (props.isAutoClose) {
        document.addEventListener('click', onClickedOutside);
    }
    // 通知
    emits('opened');
}
/** ボディ部を開く */
const close = () => {
    isOpenedDropdown.value = false;
    // コンポーネント外クリック時のイベント削除
    document.removeEventListener('click', onClickedOutside);
    // 通知
    emits('closed');
}

/**
 * トグルボタンとボディ部ボックス以外がクリックされた時に閉じるようにする
 */
const onClickedOutside = (e: MouseEvent) => {
    // このコンポーネント下に無い要素なら閉じる
    if (!(e.target instanceof Node) || !frame.value) return;
    if (frame.value.contains(e.target)) return;
    close();
};

// 公開設定 -----------------------------------------------------

defineExpose({toggle, open, close});


// サイクル -----------------------------------------------------

// マウント時
onMounted(() => {
    document.addEventListener('click', onClickedOutside);
});

// マウント時
onBeforeUnmount(() => {
    document.removeEventListener('click', onClickedOutside);
});

</script>

<style scoped>

</style>