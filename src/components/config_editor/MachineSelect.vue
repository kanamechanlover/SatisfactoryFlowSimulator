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
import { useImageStore } from '@/stores/image_store';
import { getEventValue } from '@/logics/event_data'
import { ConfigMachine } from '@/defines/types/config';


// 子コンポーネント ---------------------------------------------


// 外部連携 -----------------------------------------------------

/** プロパティを定義 */
const props = defineProps({
    /** 現在の値(v-model用) */
    modelValue: {
        type: String,
        default: '',
    },
    /** 設備リスト */
    machines: {
        type: Array<ConfigMachine>,
        default: [] as Array<ConfigMachine>,
        required: true,
    },
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

// 内部定義 -----------------------------------------------------

/** 未選択状態時のインデックス値 */
const IndexNone = -1;

// 内部変数 -----------------------------------------------------

/** 画像ストア */
const imageStore = useImageStore();

/** 最後に選択していた項目のインデックス */
const latestSelectedIndex = ref(IndexNone);

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------

/** 選択中のインデックス */
const selectedIndex = computed((): number => {
    return latestSelectedIndex.value; 
});

/** 設備の画像へのパスを取得 */
const machineImage = computed(() => {
    if (props.modelValue === undefined) return '';
    return imageStore.getData(props.modelValue);
});
/** 設備名 */
const machineName = computed((): string => {
    const machine = props.machines.at(latestSelectedIndex.value);
    if (machine === undefined) return ''; // イレギュラー
    return machine.name;
});

// Actions -----------------------------------------------------

/** props の値が更新された際の反映 */
const applyPropsSelect = () => {
    if (!props.modelValue) {
        // 親から伝搬されている設備IDが空なら問答無用で選択無し「-」にする
        latestSelectedIndex.value = 0;
        return;
    }
    const index = props.machines.findIndex((machine) => machine.id == props.modelValue);
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

/** 選択されている設備ID変更通知 */
const changeValue = (event: Event) => {
    const value = getEventValue(event);
    emits('update:modelValue', (value == '-') ? '' : value); // 選択肢「-」は無しの意味なので空にする
};

// サイクル -----------------------------------------------------

// データの結びつけ完了時に情報を最新化
onMounted(applyPropsSelect);

// 監視 --------------------------------------------------------

// props の値が更新されたら
watch(() => props.modelValue, applyPropsSelect);

</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
.machine-select-frame {
    display: flex;
    align-items: center;
    max-width: 100%;
    gap: 4px;
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