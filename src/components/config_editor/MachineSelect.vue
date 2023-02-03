<template>
    <div class="machine-select-frame">
        <img v-if="machineImage" :src="machineImage" :title="machineName" />
        <select :title="machineName" :selectedIndex="selectedIndex"
            @change="changeValue" :class="{ error: props.isError }">
            <option>-</option>
            <option v-for="(machine, index) in machines" :key="index" :value="machine.id">
                {{ machine.name }}
            </option>
        </select>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useImageStore } from '@/stores/image_store';
import { getEventValue } from '@/logics/event_data'
import { ConfigMachineList } from '@/defines/types/config';


// 子コンポーネント ---------------------------------------------


// 基本定義 -----------------------------------------------------

/** プロパティを定義 */
const props = defineProps({
    /** 現在の値(v-model用) */
    modelValue: String,
    /** エラー表示フラグ */
    isError: {
        type: Boolean,
        default: false,
    },
});

// エミット
const emits = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>();

/** 未選択状態時のインデックス値 */
const IndexNone = -1;

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 画像ストア */
const imageStore = useImageStore();

/** 設備IDリスト */
const machines = ref([] as ConfigMachineList);

/** 最後に選択していた項目のインデックス */
const latestSelectedIndex = ref(IndexNone);

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------

/** 選択中のインデックス */
const selectedIndex = computed((): number => {
    if (props.modelValue === undefined) return 0; // イレギュラー
    if (machines.value === undefined) return 0; // イレギュラー
    return latestSelectedIndex.value; 
});

/** 設備の画像へのパスを取得 */
const machineImage = computed(() => {
    if (props.modelValue === undefined) return '';
    return imageStore.getData(props.modelValue);
});
/** 設備名 */
const machineName = computed((): string => {
    const machine = machines.value?.at(latestSelectedIndex.value);
    if (machine === undefined) return ''; // イレギュラー
    return configStore.machineName(machine.id);
});

// Actions -----------------------------------------------------

/** props の値が更新された際の反映 */
const applyPropsSelect = () => {
    const index = machines.value.findIndex((machine) => machine.id == props.modelValue);
    if (index >= 0) {
        // 指定の設備IDがリストにあれば選択
        latestSelectedIndex.value = index + 1; // 0 は選択無し「-」の為 +1 しておく
        return;
    }
    if (latestSelectedIndex.value == IndexNone) {
        // 未選択なら選択無し「-」にする
        latestSelectedIndex.value = 0;
    }
};

/** ストアから最新の設備カテゴリIDリストを取得 */
const getMachines = () => {
    // 最新値のクローン取得
    machines.value = configStore.config.machines.map((machine) => machine.clone());
    // props の値を反映
    applyPropsSelect();
};

/** 選択されている設備ID変更通知 */
const changeValue = (event: Event) => {
    const value = getEventValue(event);
    emits('update:modelValue', (value == '-') ? '' : value); // 選択肢「-」は無しの意味なので空にする
};

// サイクル -----------------------------------------------------

// データの結びつけ完了時に情報を最新化
onMounted(getMachines);

// 監視 --------------------------------------------------------

// props の値が更新されたら
watch(() => props.modelValue, applyPropsSelect);

configStore.$subscribe(() => {
    // 更新が終わったタイミングでストアの値で内部情報を更新
    if(configStore.isUpdating) return;

    // 新旧のリストを取得
    const oldList = machines.value.map((v, i) => ({i, v}));
    const newList = configStore.config.machines.map((v, i) => ({i, v}));
    // お互いに存在しない要素を抽出
    const oldDiff = oldList.filter((v1) => !newList.some((v2) => v1.v.id == v2.v.id));
    const newDiff = newList.filter((v1) => !oldList.some((v2) => v1.v.id == v2.v.id));
    // 現在の選択要素に影響があるかチェック
    const currentIndex = latestSelectedIndex.value; // 現在選択中のインデックス
    if (oldDiff.length < newDiff.length) {
        // 追加の場合、現在選択中のインデックスより前ならインデックスをずらす
        const lowerIndexNumber = newDiff.filter((v) => v.i < currentIndex ).length;
        latestSelectedIndex.value += lowerIndexNumber;
    }
    else if (oldDiff.length > newDiff.length) {
        // 削除の場合
        if (oldDiff.some((v) => v.i == currentIndex)) {
            // 現在選択中の要素が削除されたら選択無しにする
            latestSelectedIndex.value = 0
        }
        else {
            // 現在選択中のインデックスより前ならインデックスをずらす
            const lowerIndexNumber = oldDiff.filter((v) => v.i < currentIndex ).length;
            latestSelectedIndex.value -= lowerIndexNumber;
        }
    }
    else {
        // 更新の場合、選択中のインデックスは変わらないので変更なし
    }

    // リストを更新
    getMachines();
});

</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
.machine-select-frame {
    display: flex;
    align-items: center;
    max-width: 100%;
}
select {
    border-radius: 4px;
    width: 1em;
    flex: 1;
}
option {
    text-align: left;
    padding-left: 24px;
    min-width: 0px;
}
img {
    width: 20px;
    height: 20px;
    mix-blend-mode: screen;}
</style>