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
        <ConfigMachineView v-for="index in machineIndexList" :key="uniqueKey(index)"
            :index="index" :machine="machine(index)" :categories="categories"
            :hasDuplicate="hasDuplicateId(index)">
        </ConfigMachineView>
        <div class="additional-box">
            <button class="additional-button" @click="addMachine" title="追加">＋</button>
        </div>
    </div>
</template>

<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { ConfigMachineList, ConfigMachine, CategoryList } from '@/defines/types/config'
import { getDuplicates } from '@/logics/primitives'

// 子コンポーネント ---------------------------------------------

import ConfigMachineView from '@/components/config_editor/ConfigMachineView.vue'

// 基本定義 -----------------------------------------------------


// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 設備リスト */
const machines = ref([] as ConfigMachineList);

/** 設備カテゴリリスト */
const categories = ref([] as CategoryList);

/** 重複IDを持つ要素のインデックスリスト */
const duplicatedIndexes = ref([] as Array<number>);

// 内部関数 -----------------------------------------------------

/** 重複IDを持つ要素のインデックスリストを取得 */
const getDuplicateIndexes = () => {
    // 重複IDを持つ要素を取得
    const machineIds = machines.value.map((v) => v.id);
    const duplicatedIds = getDuplicates(machineIds);
    // 重複IDを持つ要素のインデックスを取得
    let indexes = [] as Array<number>;
    duplicatedIds.forEach((id) => {
        indexes = indexes.concat(
            machines.value
                .map((v, i) => { return {i, v}; })
                .filter((data) => data.v.id == id)
                .map((data) => data.i)
        );
    });
    duplicatedIndexes.value = indexes.sort();
};

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

/** 設備データ */
const machine = computed(() => (index: number): ConfigMachine => {
    if (index === undefined || !machines.value[index]) return new ConfigMachine(); // イレギュラー
    return machines.value[index];
});

/** ID重複チェック */
const hasDuplicateId = computed(() => (index: number): boolean => {
    if (index === undefined || !machines.value[index]) return false; // イレギュラー
    return duplicatedIndexes.value.indexOf(index) !== -1
});

// Actions -----------------------------------------------------

/** 設備切り替え */
const getMachines = () => {
    // 各設定の最新値の複製を取得
    machines.value = configStore.config.machines.map((machine) => machine.clone());
    categories.value = configStore.config.machineCategories.map((category) => category.clone());
    // 重複IDを持つインデックスを取得
    getDuplicateIndexes();
};

/** 設備追加 */
const addMachine = () => {
    configStore.addMachine();
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