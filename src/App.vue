<template>
    <div id="frame">
        <header>
            <span class="title">
                Satisfactory 制作フロー シミュレーター
                <span class="version">( {{ version }} )</span>
            </span>
            <a href="https://store.steampowered.com/app/526870/Satisfactory/" class="link-icon" title="Steamストア - Satisfactory" target="_blank">
                <fa :icon="['fab', 'steam']" />
            </a>
            <a href="https://twitter.com/kanamechanlover" class="link-icon" title="Twitter - @kanamechanlover" target="_blank">
                <fa :icon="['fab', 'twitter']" />
            </a>
            <a href="https://github.com/kanamechanlover" class="link-icon" title="Github - kanamechanlover" target="_blank">
                <fa :icon="['fab', 'github']" />
            </a>
            <button class="config-edit-button" @click="showConfigEditor">設定</button>
        </header>
        <div id="main">
            <div id="flow-tree-box">
                <FlowTree></FlowTree>
            </div>
            <div id="total-data-box">
                <MaterialTable></MaterialTable>
            </div>
        </div>
        <div id="config-editor-bg" v-if="showingConfigEditor">
            <div id="config-editor-box">
                <ConfigEditor @close="closeConfigEditor"></ConfigEditor>
            </div>
        </div>
        <div id="loading" v-if="firstLoading">
            <span>読み込み中...(あと {{ imageStore.loadingFileNumber }})</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useConfigStore } from './stores/config_store'
import { useImageStore } from './stores/image_store'
import Logger from '@/logics/logger'

// 子コンポーネント ---------------------------------------------

import FlowTree from '@/components/FlowTree.vue'
import MaterialTable from '@/components/MaterialTable.vue'
import ConfigEditor from '@/components/config_editor/ConfigEditor.vue'

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 画像ストア */
const imageStore = useImageStore();

/** デバッグ用：設定エディタ表示状況 */
const showingConfigEditor = ref(false);

/** 初回ロード中フラグ */
const firstLoading = ref(true);

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------

/** 設定バージョン */
const version = computed((): string => {
    return configStore.version;
});

// Actions -----------------------------------------------------

const showConfigEditor = () => {
    Logger.log('showed ConfigEditor.');
    showingConfigEditor.value = true;
};
const closeConfigEditor = () => {
    Logger.log('closed ConfigEditor.');
    showingConfigEditor.value = false;
};

// サイクル -----------------------------------------------------


// 監視 ---------------------------------------------------------

// 画像ストアの変更を監視
const unsub = imageStore.$subscribe((m, s) => {
    // 読み込みが完了したら初回読み込み状態を解除する
    if (firstLoading.value && s.loadingFileNum == 0) {
        firstLoading.value = false;
        unsub(); // この判定は初回のみ使う為、検知したら監視終了
    }
});

</script>

<style src="@/to_dark_theme.css" scoped />

<style scoped>
* {
    box-sizing: border-box;
}
#frame {
    flex: 1;
    display: flex;
    flex-direction: column;
}
header {
    display: flex;
    align-items: center;
    background-color: orange;
    padding: 4px 8px;
    font-weight: bold;
    color: maroon;
    overflow-y: hidden;
    border-bottom: 1px solid var(--dark-bg-color);
    gap: 4px;
}
header .title {
    flex: 1;
    font-size: 1.2em;
    text-align: left;
}
header .version {
    font-size: 0.8em;
    color: var(--dark-bg-color);
}
#main {
    flex: 1;
    display: flex;
    overflow: hidden;
}
#flow-tree-box {
    flex: 1;
    border-right: 1px solid gray;
        background-image:
            linear-gradient(
                0deg, transparent 31px,
                gray 32px),
            linear-gradient(
                90deg, transparent 31px,
                gray 32px);
        background-color: dimgray;
        background-size: 32px 32px;
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 8px;
}
#total-data-box {
    background: var(--dark-bg-color);
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 8px;
    min-width: 120px;
}
a.link-icon {
    color: white;
}
a.link-icon svg.fa-steam:hover {
    color: rgb(15, 34, 110);
}
a.link-icon svg.fa-twitter:hover {
    color: rgb(29, 155, 240);
}
a.link-icon svg.fa-github:hover {
    color: black;
}
button.config-edit-button {
    padding: 0px 8px;
    font-size: 0.8em;
    background: var(--dark-bg-color);
}
button.config-edit-button:hover {
    background: var(--dark-main-color);
}

#config-editor-bg {
    width: 100%;
    height: 100%;
    position: absolute;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
#config-editor-box {
    opacity: 1;
    width: 800px;
    height: 90%;
}

#loading {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
}
#loading span {
    font-size: 2em;
}

</style>