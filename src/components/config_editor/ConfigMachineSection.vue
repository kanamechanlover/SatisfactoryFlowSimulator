<template>
    <div class="config-machine-section-frame">
        <p>
            このセクションでは設備を定義します。
            <span class="accent"><fa :icon="['fas', 'pen-to-square']" /></span> ボタンで設定を変更できます。
            <span class="accent"><fa :icon="['fas', 'arrow-up-right-from-square']" /></span> ボタンで閲覧モードに戻せます。<br />
            ティアは <span class="accent">0</span> ~ <span class="accent">8</span> がマイルストーンのティア、
            <span class="accent">-1</span> が MAM、<span class="accent">-2</span> が Awesome Shop に該当します。<br />
            右の「-」で設備削除、下部の「＋」で設備追加できます。
        </p>
        <ConfigMachineView v-for="index in machineIndexList" :key="uniqueKey(index)" :index="index" @delete="deleteMachine"></ConfigMachineView>
        <div class="additional-box">
            <button class="additional-button" @click="addMachine" title="追加">＋</button>
        </div>
    </div>
</template>

<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { ConfigMachineList } from '@/defines/types/config'

// 子コンポーネント ---------------------------------------------

import ConfigMachineView from '@/components/config_editor/ConfigMachineView.vue'

// 基本定義 -----------------------------------------------------


// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 設備リスト */
const machines = ref([] as ConfigMachineList);

// 内部関数 -----------------------------------------------------

// Getters -----------------------------------------------------

/** 設備のインデックスリスト */
const machineIndexList = computed((): Array<number> => {
    return machines.value.map((_, i) => i);
});

/** ユニークキー */
const uniqueKey = computed(() => (index: number): number|undefined => {
    if (index === undefined || !machines.value[index]) return; // イレギュラー
    return machines.value[index].uniqueKey;
});

// Actions -----------------------------------------------------

/** 設備切り替え */
const getMachines = () => {
    machines.value = configStore.config.machines.map((machine) => machine.clone());
};

/** 設備追加 */
const addMachine = () => {
    configStore.addMachine();
};

/** 設備削除 */
const deleteMachine = (index: number) => {
    if (index >= machines.value.length) return; // イレギュラー
    configStore.deleteMachine(index);
};


// サイクル -----------------------------------------------------

// マウント時
onMounted(() => {
    getMachines();
});

// 監視 --------------------------------------------------------

configStore.$subscribe(() => {
    // 更新が終わったらタイミングでストアの値で内部情報を更新
    if(configStore.isUpdating) return;
    getMachines();
});

</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
</style>