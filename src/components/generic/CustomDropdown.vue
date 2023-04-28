<template>
    <div class="custom-dropdown-frame" ref="frame">
        <div class="toggle-box" @click="toggle" ref="toggleButton">
            <slot name="toggle" />
        </div>
        <div class="dropdown-box" v-show="isOpenedDropdown" ref="dropdownBox">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Direction, Vector2 } from '@/defines/types/generic'
import { scrollbarWidth, visibledHorizontalScrollbar, visibledVerticalScrollbar } from '@/logics/primitives'

// 子コンポーネント ---------------------------------------------


// 外部連携 -----------------------------------------------------

/** プロパティを定義 */
const props = defineProps({
    /** 表示方向 */
    showDirection: {
        type: String,
        default: Direction.Down,
        validator: (value: string) => {
            return Object.values(Direction).indexOf(value) !== -1;
        },
    },
    /** 表示領域の制限範囲となるDOM要素 */
    limitElement: {
        type: HTMLElement,
        default: undefined,
    }
});

// 内部定義 -----------------------------------------------------


// 内部変数 -----------------------------------------------------

/** ルート要素 */
const frame = ref<HTMLElement|null>(null);

/** トグルボタン要素 */
const toggleButton = ref<HTMLElement|null>(null);

/** ドロップダウン要素 */
const dropdownBox = ref<HTMLElement|null>(null);

/** ドロップダウン開閉フラグ（true: 開、false：閉） */
const isOpenedDropdown = ref<Boolean>(false);

/** ドロップダウン部の表示x位置 */
const dropdownPos = reactive<Vector2>(new Vector2());

// 内部関数 -----------------------------------------------------

/** ドロップダウン部の表示位置を計算 */
const updateDropdownPosition = () => {
    if (!toggleButton.value || !dropdownBox.value) return 0;
    // 制限領域のサイズ取得
    const existHScrollbar = visibledHorizontalScrollbar(props.limitElement);
    const existVScrollbar = visibledVerticalScrollbar(props.limitElement);
    const limitElement = (props.limitElement) ? props.limitElement : document.documentElement;
    const limitRect = limitElement.getBoundingClientRect();
    const limitWidth = limitRect.width - ((existHScrollbar) ? scrollbarWidth : 0);
    const limitHeight = limitRect.height - ((existVScrollbar) ? scrollbarWidth : 0);
    // トグルボタン部のサイズ取得
    const toggleRect = toggleButton.value.getBoundingClientRect();
    // ドロップダウン部のサイズ取得
    const dropdownWidth = dropdownBox.value.clientWidth;
    const dropdownHeight = dropdownBox.value.clientHeight;
    // 表示方向によって位置を算出
    const valueTable = {
        [Direction.Up]: new Vector2(0, -dropdownHeight),
        [Direction.Down]: new Vector2(0, toggleRect.height),
        [Direction.Left]: new Vector2(-dropdownWidth, 0),
        [Direction.Right]: new Vector2(toggleRect.width, 0),
    }
    let x = valueTable[props.showDirection].x;
    let y = valueTable[props.showDirection].y;
    // ドロップダウン部が画面外にはみ出す場合は位置を補正
    if (dropdownWidth > limitWidth) {
        // 横幅が制限領域より大きい場合は左端を合わせて右端ははみ出させておく
        x = limitRect.x - toggleRect.x;
    }
    else if (toggleRect.x < limitRect.x) {
        // トグルボタンのx位置がマイナスなら左端に揃える
        x = limitRect.x;
    }
    else {
        // 右端にはみ出す場合は制限領域の右端に揃える
        const toggleOffsetX = toggleRect.x - limitRect.x; // 制限領域内のトグルボタン部のx位置
        const diffX = toggleOffsetX + x + dropdownWidth - limitWidth;
        if (diffX > 0) {
            x -= diffX;
        }
    }
    if (dropdownHeight > limitHeight) {
        // 高さが制限領域より大きい場合は左端を合わせて右端ははみ出させておく
        y = limitRect.y - toggleRect.y;
    }
    else if (toggleRect.y < limitRect.y) {
        y = limitRect.y; // トグルボタンのy位置がマイナスなら制限領域の上端に揃える
    }
    else {
        const toggleOffsetY = toggleRect.y - limitRect.y; // 制限領域内のトグルボタン部のy位置
        const diffY = toggleOffsetY + y + dropdownHeight - limitHeight;
        if (diffY > 0) {
            y -= diffY; // 下端にはみ出す場合は下端に揃える
        }
    }
    dropdownPos.x = x;
    dropdownPos.y = y;
};

// Getters -----------------------------------------------------


// Actions -----------------------------------------------------

/** ドロップダウン開閉切り替え */
const toggle = () => {
    if (isOpenedDropdown.value) {
        close(); // ドロップダウンを閉じる（非表示にする）
    }
    else {
        open(); // ドロップダウンを開く（表示する）
    }
};
/** ドロップダウンを開く */
const open = () => {
    isOpenedDropdown.value = true;
    // 表示位置を更新（開いた瞬間は表示状態が更新されていない為、次の tick で行う）
    nextTick(updateDropdownPosition);
    // コンポーネント外クリック時のイベント追加
    document.addEventListener('click', onClickedOutside);
}
/** ドロップダウンを開く */
const close = () => {
    isOpenedDropdown.value = false;
    // コンポーネント外クリック時のイベント削除
    document.removeEventListener('click', onClickedOutside);
}

/**
 * トグルボタンとドロップダウンボックス以外がクリックされた時に閉じるようにする
 */
const onClickedOutside = (e: MouseEvent) => {
    // このコンポーネント下に無い要素なら閉じる
    if (!(e.target instanceof Node) || !frame.value) return;
    if (frame.value.contains(e.target)) return;
    close();
};


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
.custom-dropdown-frame {
    position: relative;
}

.toggle-box {
    z-index: 1;
}

.dropdown-box {
    position: absolute;
    left: v-bind('dropdownPos.x + "px"');
    top: v-bind('dropdownPos.y + "px"');
    z-index: 2;
}
</style>