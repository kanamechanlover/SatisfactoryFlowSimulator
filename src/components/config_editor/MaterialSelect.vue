<template>
    <div class="material-select-frame">
        <img v-if="machinePortPath" :src="machinePortPath" :title="machinePortName" />
        <select :title="materialName" :selectedIndex="selectedIndex"
            @change="changeValue" :class="{ error: props.isError }">
            <option>-</option>
            <option v-for="(material, index) in filteredMaterials" :key="index" :value="material.id">
                {{ material.name }}
            </option>
        </select>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useImageStore } from '@/stores/image_store';
import { getEventValue } from '@/logics/event_data'
import { MaterialState, ConfigMaterial, MachinePortType, ConfigMaterialList } from '@/defines/types/config';


// 子コンポーネント ---------------------------------------------


// 基本定義 -----------------------------------------------------

/** プロパティを定義 */
const props = defineProps({
    /** 現在の値(v-model用) */
    modelValue: {
        type: String,
        default: '',
    },
    /** 選択肢として表示する素材の状態 */
    type: {
        type: String,
        default: '',
        require: true,
    },
    /** 素材リスト */
    materials: {
        type: Array<ConfigMaterial>,
        default: [] as Array<ConfigMaterial>,
        require: true,
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

/** 指定の素材の状態のリスト */
const filteredMaterials = computed((): Array<ConfigMaterial> => {
    if (!props.type) return props.materials;
    return props.materials.filter((material: ConfigMaterial) => {
        if (!(material.state in MaterialState)) return true;
        return MaterialState[material.state].Port === props.type;
    });
})

/** 設備入出力ポートタイプの画像へのパスを取得 */
const machinePortPath = computed(() => {
    return imageStore.getData(props.type);
});
/** 設備入出力ポートタイプの表示名を取得 */
const machinePortName = computed(() => {
    return MachinePortType.getName(props.type);
});
/** 素材名 */
const materialName = computed((): string => {
    const material = props.materials.find((material) => material.id == props.modelValue);
    return (material) ? material.name : '';
});

// Actions -----------------------------------------------------

/** props の値が更新された際の反映 */
const applyPropsSelect = () => {
    const index = filteredMaterials.value.findIndex((material) => material.id == props.modelValue);
    if (index >= 0) {
        // 指定の素材IDがリストにあれば選択
        latestSelectedIndex.value = index + 1; // 0 は選択無し「-」の為 +1 しておく
        return;
    }
    if (latestSelectedIndex.value == IndexNone) {
        // 未選択なら選択無し「-」にする
        latestSelectedIndex.value = 0;
    }
};


/** 選択されている素材ID変更通知 */
const changeValue = (event: Event) => {
    const value = getEventValue(event);
    emits('update:modelValue', (value == '-') ? '' : value); // 選択肢「-」は無しの意味なので空にする
};

// サイクル -----------------------------------------------------

onMounted(applyPropsSelect);

// 監視 --------------------------------------------------------

watch(() => props.modelValue, applyPropsSelect);

</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
.material-select-frame {
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
    mix-blend-mode: screen;
}
</style>