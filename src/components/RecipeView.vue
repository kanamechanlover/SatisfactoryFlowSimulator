<template>
    <div class="recipe-view-frame">
        <div class="machine-box">
            <div class="machine-img-box">
                <img v-if="machineImage" :src="machineImage" :title="machineName" />
            </div>
        </div>
        <div class="recipe-detail-box">
            <div class="material-box" v-for="inputIndex in [...Array(machineInputPortNumber).keys()]"
                :key="'input' + inputIndex" :class="{
                    conveyor: machineInputTypeIsConveyor(inputIndex),
                    pipe: machineInputTypeIsPipe(inputIndex),
            }" :title="materialInputTooltip(inputIndex)">
                <img v-if="inputMaterialImage(inputIndex)"
                    :src="inputMaterialImage(inputIndex)"
                    :alt="inputMaterialName(inputIndex)" />
                <div v-if="materialInputNumber(inputIndex)" class="number">
                    {{ materialInputNumber(inputIndex) }}
                </div>
            </div>
            <div class="arrow">▶</div>
            <div class="material-box" v-for="outputIndex in [...Array(machineOutputPortNumber).keys()]"
                :key="'output' + outputIndex" :class="{
                    conveyor: machineOutputTypeIsConveyor(outputIndex),
                    pipe: machineOutputTypeIsPipe(outputIndex),
            }" :title="materialOutputTooltip(outputIndex)">
                <img v-if="outputMaterialImage(outputIndex)"
                    :src="outputMaterialImage(outputIndex)"
                    :alt="outputMaterialName(outputIndex)" />
                <div v-if="materialOutputNumber(outputIndex)" class="number">
                    {{ materialOutputNumber(outputIndex) }}
                </div>
            </div>
            <div class="product-time">{{ productTime }}</div>
            <div class="unit">秒</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useImageStore } from '@/stores/image_store';
import {
    ConfigMachine, ConfigMaterial, ConfigRecipe,
    ConfigRecipeMaterial, MachinePortType,
} from '@/defines/types/config'

// 子コンポーネント ---------------------------------------------

// 外部連携 -----------------------------------------------------

const props = defineProps({
    /** レシピインデックス（エミット用） */
    recipeId: {
        type: String,
        default: '',
    },
});

// 内部定義 -----------------------------------------------------


// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 画像ストア */
const imageStore = useImageStore();

// 内部関数 -----------------------------------------------------

/**
 * 分間の数値を表す文字列
 * @param num 値
 * @param time １回の製作時間(秒)
 * @return 分間の数値を表す文字列
 */
const toPerMinute = (num: number, time: number): string => {
    // ゼロ除算回避
    if (!time) return '0';
    // 分間の数値に変換
    const perMinute = num * (60 / time);
    return `${perMinute} /分`; // 単位を付けて返す
};

// Getters -----------------------------------------------------

const recipe = computed((): ConfigRecipe => {
    const tempRecipe = configStore.recipe(props.recipeId);
    return (tempRecipe) ? tempRecipe : new ConfigRecipe();
});

/** レシピ名 */
const recipeName = computed((): string => {
    return recipe.value.name;
});
/** 設備ID */
const machineId = computed((): string => {
    return recipe.value.machineId;
});
/** 設備名 */
const machineName = computed((): string => {
    const name = configStore.machineName(machineId.value);
    return (name) ? name : '設備無し';
});
/** 設備アイコン */
const machineImage = computed((): string => {
    const data = imageStore.getData(machineId.value);
    return (data) ? data : '';
});
/** 製作時間 */
const productTime = computed((): number => {
    return recipe.value.productTime;
});
/** 素材名 */
const materialName = computed(() => (materialId: string): string => {
    return configStore.materialName(materialId);
});
/** 入力素材ID */
const materialInputId = computed(() => (index: number): string => {
    const inputs = recipe.value.input;
    if (!inputs || index < 0 || index >= inputs.length || !inputs[index]) return ''; // イレギュラー
    return inputs[index].id;
});
/** 入力素材名 */
const inputMaterialName = computed(() => (index: number): string => {
    const inputs = recipe.value.input;
    if (!inputs || index < 0 || index >= inputs.length || !inputs[index]) return ''; // イレギュラー
    return materialName.value(inputs[index].id);
});
/** 出力素材名 */
const outputMaterialName = computed(() => (index: number): string => {
    const outputs = recipe.value.output;
    if (!outputs || index < 0 || index >= outputs.length || !outputs[index]) return ''; // イレギュラー
    return materialName.value(outputs[index].id);
});
/** 入力素材数枠表示フラグ */
const materialInputNumberShow = computed(() => (index: number): boolean => {
    const inputs = recipe.value.input;
    if (!inputs || index < 0 || index >= inputs.length || !inputs[index]) return false; // イレギュラー
    return !!inputs[index] || inputs[index].id !== '';
});
/** 入力素材毎の必要数 */
const materialInputNumber = computed(() => (index: number): number => {
    const inputs = recipe.value.input;
    if (!inputs || index < 0 || index >= inputs.length || !inputs[index]) return 0; // イレギュラー
    return inputs[index].number;
});
/** 出力素材ID */
const materialOutputId = computed(() => (index: number): string => {
    const outputs = recipe.value.output;
    if (!outputs || index < 0 || index >= outputs.length || !outputs[index]) return ''; // イレギュラー
    return outputs[index].id;
});
/** 出力素材数枠表示フラグ */
const materialOutputNumberShow = computed(() => (index: number): boolean => {
    const outputs = recipe.value.output;
    if (!outputs || index < 0 || index >= outputs.length || !outputs[index]) return false; // イレギュラー
    return outputs[index].id !== '';
});
/** 出力素材毎の生産数 */
const materialOutputNumber = computed(() => (index: number): number => {
    const outputs = recipe.value.output;
    if (!outputs || index < 0 || index >= outputs.length || !outputs[index]) return 0; // イレギュラー
    return outputs[index].number;
});
/** 素材のツールチップ */
const materialTooltip = computed(() => (materialId: string, needs: number): string => {
    if (!materialId || !needs) return ''; // 素材無し、または数量が 0
    const materialName = configStore.materialName(materialId);
    const perMinuteText = toPerMinute(needs, productTime.value);
    return `${materialName} ${needs.toString()} (${perMinuteText})`;
});
/** 入力素材のツールチップ */
const materialInputTooltip = computed(() => (index: number): string => {
    const inputs = recipe.value.input;
    if (!inputs || index < 0 || index >= inputs.length || !inputs[index]) return ''; // 枠外チェック
    return materialTooltip.value(inputs[index].id, inputs[index].number);
});
/** 出力素材のツールチップ */
const materialOutputTooltip = computed(() => (index: number): string => {
    const outputs = recipe.value.output;
    if (!outputs || index < 0 || index >= outputs.length || !outputs[index]) return ''; // イレギュラー
    return materialTooltip.value(outputs[index].id, outputs[index].number);
});
/** 入力素材画像 */
const inputMaterialImage = computed(() => (index: number): string => {
    const inputs = recipe.value.input;
    if (!inputs || index < 0 || index >= inputs.length || !inputs[index]) return ''; // イレギュラー
    return imageStore.getData(inputs[index].id);
});
/** 入力素材画像 */
const outputMaterialImage = computed(() => (index: number): string => {
    const outputs = recipe.value.output;
    if (!outputs || index < 0 || index >= outputs.length || !outputs[index]) return ''; // イレギュラー
    return imageStore.getData(outputs[index].id);
});

/** 設備の入力ポート数 */
const machineInputPortNumber = computed((): number => {
    return configStore.machineInputPortNumber(machineId.value);
});
/** 設備の出力ポート数 */
const machineOutputPortNumber = computed((): number => {
    return configStore.machineOutputPortNumber(machineId.value);
});

/** 設備の入力ポートタイプ */
const machineInputType = computed(() => (index: number): string => {
    if (index < 0 || index >= machineInputPortNumber.value) return ''; // イレギュラー
    return configStore.machineInputPortType(machineId.value, index);
});
/** 設備の入力ポートがコンベアか（枠外なら false） */
const machineInputTypeIsConveyor = computed(() => (index: number): boolean => {
    return machineInputType.value(index) == MachinePortType.Conveyor;
});
/** 設備の入力ポートがパイプか（枠外なら false） */
const machineInputTypeIsPipe = computed(() => (index: number): boolean => {
    return machineInputType.value(index) == MachinePortType.Pipe;
});
/** 設備の出力ポートタイプ */
const machineOutputType = computed(() => (index: number): string => {
    if (index < 0 || index >= machineOutputPortNumber.value) return ''; // イレギュラー
    return configStore.machineOutputPortType(machineId.value, index);
});
/** 設備の出力ポートがコンベアか（枠外なら false） */
const machineOutputTypeIsConveyor = computed(() => (index: number): boolean => {
    return machineOutputType.value(index) == MachinePortType.Conveyor;
});
/** 設備の入力ポートがパイプか（枠外なら false） */
const machineOutputTypeIsPipe = computed(() => (index: number): boolean => {
    return machineOutputType.value(index) == MachinePortType.Pipe;
});
/** 設備入力ポートタイプの画像へのパスを取得 */
const machineInputPortPath = computed(() => (index: number)  => {
    const portType = machineInputType.value(index);
    return imageStore.getData(portType);
});
/** 設備出力ポートタイプの画像へのパスを取得 */
const machineOutputPortPath = computed(() => (index: number) => {
    const portType = machineOutputType.value(index);
    return imageStore.getData(portType);
});
/** 設備入出力ポートタイプの表示名を取得 */
const machineInputPortName = computed(() => (index: number) => {
    const portType = machineInputType.value(index);
    return MachinePortType.getName(portType);
});
/** 設備入出力ポートタイプの表示名を取得 */
const machineOutputPortName = computed(() => (index: number) => {
    const portType = machineOutputType.value(index);
    return MachinePortType.getName(portType);
});


// Actions -----------------------------------------------------


// 公開設定 -----------------------------------------------------

// サイクル -----------------------------------------------------

// 監視 --------------------------------------------------------

</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
.recipe-view-frame {
    display: flex;
    line-height: 1.2em;
    user-select: none;
    gap: 4px;
}
.recipe-view-frame img {
    width: 2em;
    height: 2em;
}
.machine-box {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2px;
    border: 1px solid var(--dark-main-color);
    border-radius: 4px;
}
.machine-box .machine-img-box {
    text-align: left;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    padding: 2px;
}
.machine-box .machine-img-box img {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    mix-blend-mode: screen;
}
.recipe-detail-box {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    border: 1px solid var(--dark-main-color);
    border-radius: 4px;
    padding: 2px;
}
.recipe-detail-box .material-box {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2px;
    min-width: calc(2em + 6px);
    min-height: calc(2em + 6px);
}
.recipe-detail-box .material-box.conveyor {
    border: 1px solid var(--dark-main-color);
    border-radius: 4px;
}
.recipe-detail-box .material-box.pipe {
    border: 1px solid var(--dark-main-color);
    border-radius: 50%;
}
.recipe-detail-box .material-box .number {
    position: absolute;
    right: 0px;
    bottom: 0px;
    border-radius: 2px;
    font-size: 0.8em;
    line-height: 1em;
    padding: 1px 4px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.recipe-detail-box .arrow {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;

}
.product-time-box {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0px 8px;
}
.product-time-box .product-time {
    padding: 8px 0px;
    border-radius: 8px;
}
</style>