<template>
    <div class="material-select-frame">
        <img v-if="machinePortPath" :src="machinePortPath" :title="machinePortName" />
        <select :title="materialName" :selectedIndex="selectedIndex"
            @change="changeValue" :class="{ error: props.isError }">
            <option>-</option>
            <option v-for="(material, index) in materials" :key="index" :value="material.id">
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
    modelValue: String,
    /** 選択肢として表示する素材の状態 */
    type: String,
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

/** 素材IDリスト */
const materials = ref([] as ConfigMaterialList);

/** 最後に選択していた項目のインデックス */
const latestSelectedIndex = ref(IndexNone);

// 内部関数 -----------------------------------------------------


// Getters -----------------------------------------------------

/** 選択中のインデックス */
const selectedIndex = computed((): number => {
    if (props.modelValue === undefined) return 0; // イレギュラー
    if (materials.value === undefined) return 0; // イレギュラー
    return latestSelectedIndex.value; 
});

/** 設備入出力ポートタイプの画像へのパスを取得 */
const machinePortPath = computed(() => {
    if (props.type === undefined) return '';
    return imageStore.getData(props.type);
});
/** 設備入出力ポートタイプの表示名を取得 */
const machinePortName = computed(() => {
    if (props.type === undefined) return '';
    return MachinePortType.getName(props.type);
});
/** 素材名 */
const materialName = computed((): string => {
    if (props.modelValue === undefined) return '';
    const material = materials.value.find((material) => material.id == props.modelValue);
    return (material) ? material.name : '';
});

// Actions -----------------------------------------------------

/** props の値が更新された際の反映 */
const applyPropsSelect = () => {
    const index = materials.value.findIndex((material) => material.id == props.modelValue);
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

/**
 * 指定の素材の状態のリストに変換
 * @param list [in] 元のリスト
 */
const filterByMaterialType = (list: ConfigMaterialList) => {
    return list.filter((material: ConfigMaterial) => {
        return MaterialState[material.state].Port === props.type;
    });
}
/**
 * リストを素材の状態でフィルタリング
 * @param list [in] 元のリスト
 */
const cloneCopyMaterials = (list: ConfigMaterialList) => {
    // 一旦全てクローンを取得
    const allMaterials = list.map((material) => material.clone());
    if (!props.type) {
        // 指定が無ければ全て
        return allMaterials;
    }
    // 指定があればフィルタリングする
    return filterByMaterialType(allMaterials);
};

/** ストアから最新の素材IDリストを取得 */
const getMaterials = () => {
    // 最新の素材IDリストを取得
    materials.value = cloneCopyMaterials(configStore.config.materials);
    // props の値を反映
    applyPropsSelect();
};

/** 選択されている素材ID変更通知 */
const changeValue = (event: Event) => {
    const value = getEventValue(event);
    emits('update:modelValue', (value == '-') ? '' : value); // 選択肢「-」は無しの意味なので空にする
};

// サイクル -----------------------------------------------------

// データの結びつけ完了時に情報を最新化
onMounted(getMaterials);


// 監視 --------------------------------------------------------

// props の値が更新されたら
watch(() => props.modelValue, applyPropsSelect);

configStore.$subscribe(() => {
    // 更新が終わったタイミングでストアの値で内部情報を更新
    if(configStore.isUpdating) return;

    // 新旧のリストを取得
    const oldList = cloneCopyMaterials(materials.value).map((v, i) => ({i, v}));
    const newList = cloneCopyMaterials(configStore.config.materials).map((v, i) => ({i, v}));
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
    getMaterials();
});

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