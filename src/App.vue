<template>
    <div id="frame">
        <header>
            <span class="title">
                Satisfactory 製作フロー シミュレーター
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
            <button class="config-edit-button" @click="showConfigEditor" title="設定エディタを開きます。">設定</button>
        </header>
        <div id="main">
            <div id="product-tab-box">
                <ProductTab></ProductTab>
            </div>
            <div id="flow-tree-box">
                <FlowTree></FlowTree>
            </div>
            <div id="total-data-box">
                <!--<Teleport to="#material-table-box">-->
                    <MaterialTable></MaterialTable>
                <!--</Teleport>-->
            </div>
        </div>
        <div id="modal-bg" v-if="showingConfigEditor">
            <div id="config-editor-box">
                <ConfigEditor @close="closeConfigEditor"></ConfigEditor>
            </div>
        </div>
        <!--
        <div id="modal-bg" v-if="showingMaterialTableAll">
            <div id="material-table-box">
                <-- 集計結果の表示モードが「一覧表示」の時ここに teleport させる --
            </div>
        </div>
        -->
        <div id="loading" v-if="firstLoading">
            <span>読み込み中...(あと {{ imageStore.loadingFileNumber }})</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted, nextTick } from 'vue'
import { useConfigStore } from './stores/config_store'
import { useImageStore } from './stores/image_store'
import { useFlowStore } from './stores/flow_store'
import Logger from '@/logics/logger'

// 子コンポーネント ---------------------------------------------

import ProductTab from '@/components/ProductTab.vue'
import FlowTree from '@/components/FlowTree.vue'
import MaterialTable from '@/components/MaterialTable.vue'
import ConfigEditor from '@/components/config_editor/ConfigEditor.vue'

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 画像ストア */
const imageStore = useImageStore();

/** 製作フローストア */
const flowStore = useFlowStore();

/** デバッグ用：設定エディタ表示状況 */
const showingConfigEditor = ref(false);

/** 初回ロード中フラグ */
const firstLoading = ref(true);

/** 要素がマウントされたか（teleport 要素のエラー解消） */
const isMounted = ref(false);

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------

/** 設定バージョン */
const version = computed((): string => {
    return configStore.version;
});

/** 集計結果の表示モードが「一覧表示」か */
const showingMaterialTableAll = computed((): boolean => {
    return flowStore.isAllShowMode;
});

// Actions -----------------------------------------------------

/** 設定エディタ表示 */
const showConfigEditor = () => {
    Logger.log('showed ConfigEditor.');
    showingConfigEditor.value = true;
};
/** 設定エディタ非表示 */
const closeConfigEditor = () => {
    Logger.log('closed ConfigEditor.');
    showingConfigEditor.value = false;
};

// サイクル -----------------------------------------------------

// ページ離脱時のメモリ解放などの処理を登録
// ただし、ページ更新時は発火されないので画像ストアで何とかする
onBeforeUnmount(() => {
    // 画像データをクリア
    imageStore.clear();
});

// マウント完了時
onMounted(() => {
    // 1 tick 待って表示
    nextTick(() => {
        isMounted.value = true;
    });
});

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

<style src="@/style.css" />
<style src="@/to_dark_theme.css" />

<style scoped>
* {
    box-sizing: border-box;
}
#frame {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
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
#product-tab-box {
    width: 300px;
    min-width: 200px;
    display: flex;
    border-right: 1px solid gray;
}
#flow-tree-box {
    flex: 1;
    min-width: 480px;
    display: flex;
    border-right: 1px solid gray;
}
#total-data-box {
    width: 300px;
    min-width: 200px;
    background: var(--dark-bg-color);
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 8px;
    min-width: 200px;
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

#modal-bg {
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

#material-table-box {
    opacity: 1;
    width: 80%;
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