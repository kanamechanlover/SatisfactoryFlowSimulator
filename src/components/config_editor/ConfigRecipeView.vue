<template>
    <div class="config-recipe-view-frame">
        <div class="index">
            <span>{{ index + 1 }}</span>
        </div>
        <div class="content">
            <!-- 閲覧モード（コンパクト表示） -->
            <div class="view-mode-box" v-if="!editMode">
                <!-- トグルボタン -->
                <div class="toggle-box">
                    <div class="toggle-button" @click="toEditMode()" title="編集モードに切り替え" :class="{ error: existError }">
                        <fa :icon="['fas', 'pen-to-square']" />
                    </div>
                </div>
                <div class="title-box">
                    <div class="recipe-name-box" :class="{ error: nameError }">
                        <span>{{ recipeName }}</span>
                    </div>
                    <div class="machine-name-box" :class="{ error: machineIdError }">
                        <img v-if="machineImage" :src="machineImage" :title="machineName" />
                        <span>{{ machineName }}</span>
                    </div>
                </div>
                <div class="recipe-detail-box">
                    <div class="material-box" v-for="(material, inputIndex) in validMaterialInputs" :key="'input' + inputIndex">
                        <img :src="imageStore.getData(material.id)" :title="materialName(material.id)" :alt="materialName(material.id)" />
                        <div class="number">{{ material.number }}</div>
                    </div>
                    <div class="arrow">▶</div>
                    <div class="material-box" v-for="(material, outputIndex) in validMaterialOutputs" :key="'output' + outputIndex">
                        <img :src="imageStore.getData(material.id)" :title="materialName(material.id)" :alt="materialName(material.id)" />
                        <div class="number">{{ material.number }}</div>
                    </div>
                </div>
                <div class="product-time-box">
                    <div class="product-time">{{ productTime }}</div>
                    <div class="unit">秒</div>
                </div>
            </div>
            <!-- 編集モード -->
            <div class="edit-mode-box" v-if="editMode">
                <!-- トグルボタン -->
                <div class="toggle-box">
                    <div class="toggle-button" @click="toViewMode()" title="閲覧モード（コンパクト表示）に切り替え">
                        <fa :icon="['fas', 'arrow-up-right-from-square']" />
                    </div>
                </div>
                <div class="grid">
                    <div class="label">レシピ名</div>
                    <div class="recipe-name-box">
                        <input type="text" :value="recipeName" :title="recipeName"
                            @change="changeRecipeName" :class="{ error: nameError }" />
                    </div>
                    <div class="label">設備</div>
                    <div class="machine-id-box">
                        <MachineSelect :modelValue="machineId"
                            @update:modelValue="changeMachineId"
                            :isError="machineIdError">
                        </MachineSelect>
                    </div>
                    <div class="label input-label">入力素材</div>
                    <div class="input-material-box" :class="'input' + inputIndex"
                        v-for="inputIndex of ConfigRecipe.InputMax" :key="'input' + inputIndex">
                        <MaterialSelect v-if="machineInputPortNumber > inputIndex - 1"
                            :modelValue="materialInputId(inputIndex - 1)" :type="machineInputType(inputIndex - 1)"
                            @update:modelValue="changeInputMaterialId(inputIndex - 1, $event)"
                            :isError="inputError">
                        </MaterialSelect>
                        <input v-if="machineInputPortNumber > inputIndex - 1" type="number" min="0"
                            :value="materialInputNumber(inputIndex - 1)" @change="changeInputMaterialNumber(inputIndex - 1, $event)"
                            :class="{ error: inputNumberError(inputIndex - 1), hide: !materialInputNumberShow(inputIndex - 1) }" />
                    </div>
                    <div class="label output-label">出力素材</div>
                    <div class="output-material-box" :class="'output' + outputIndex"
                        v-for="outputIndex of ConfigRecipe.OutputMax" :key="'output' + outputIndex">
                        <MaterialSelect v-if="machineOutputPortNumber > outputIndex - 1"
                            :modelValue="materialOutputId(outputIndex - 1)" :type="machineOutputType(outputIndex - 1)"
                            @update:modelValue="changeOutputMaterialId(outputIndex - 1, $event)"
                            :isError="outputError">
                        </MaterialSelect>
                        <input v-if="machineOutputPortNumber > outputIndex - 1" type="number" min="0"
                            :value="materialOutputNumber(outputIndex - 1)" @change="changeOutputMaterialNumber(outputIndex - 1, $event)"
                            :class="{ error: outputNumberError(outputIndex - 1), hide: !materialOutputNumberShow(outputIndex - 1) }" />
                    </div>
                    <div class="label product-time-label">製造時間</div>
                    <div class="product-time-box">
                        <input type="number" :class="{ error: productTimeError }"
                            :value="productTime" @change="changeProductTime" />
                        <span>秒</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="delete-box" @click="deleteRecipe()" title="削除">
            <span>-</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useImageStore } from '@/stores/image_store';
import {
    ConfigRecipe, ConfigRecipeMaterial, MachinePortType, MaterialState
} from '@/defines/types/config'

// 子コンポーネント ---------------------------------------------


// 基本定義 -----------------------------------------------------

/** プロパティを定義 */
const props = defineProps({
    index: {
        type: Number,
        default: 0,
    },
});

/** エミット定義 */
const emits = defineEmits<{
    (e: 'delete', value: number): void // レシピ削除（value は props.index）
}>();

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 画像ストア */
const imageStore = useImageStore();

/** レシピデータ（内部用） */
const recipe = ref(new ConfigRecipe());

/** 編集モードフラグ（展開：編集モード、格納：閲覧モード（コンパクト表示）） */
const editMode = ref(false);

// 内部関数 -----------------------------------------------------

/** 
 * 設備の入出力口に合わせて配置を変更
 * ※固体はコンベア枠へ、液体気体はパイプ枠へ
 */
const relocateIOMaterial = () => {
    // 設備の入出力口のタイプに合わせて再配置
    // 引数 io は参照渡し
    const relocate = (io: Array<ConfigRecipeMaterial>, portNumber: Array<number>) => {
        let currentIndex = 0;
        const validIO: Array<ConfigRecipeMaterial> = io.filter((v) => v);
        MachinePortType.Types.forEach((type: string, index: number) => {
            const typePortNumber = portNumber[index];
            const typeMaterials = validIO.filter((material: ConfigRecipeMaterial) => {
                const state = configStore.materialState(material.id);
                if (!state) return false; // 設定エラー
                return MaterialState[state].Port == type;
            });
            for (let i = 0; i < typePortNumber; i++) {
                if (typeMaterials[i]) {
                    io[currentIndex + i] = typeMaterials[i];
                }
                else if (io[currentIndex + i]) {
                    // undefined を値として直接設定はできないので値がある場合だけ削除する
                    delete io[currentIndex + i];
                }
            }
            currentIndex += typePortNumber;
        });
    };
    // 設備のタイプ別入力口数取得
    const inputTypeNumbers = MachinePortType.Types.map((type: string): number => {
        return configStore.machineInputPortNumberWithType(recipe.value.machineId, type);
    });
    relocate(recipe.value.input, inputTypeNumbers);
    // 設備のタイプ別出力口数取得
    const outputTypeNumbers = MachinePortType.Types.map((type: string): number => {
        return configStore.machineOutputPortNumberWithType(recipe.value.machineId, type);
    });
    relocate(recipe.value.output, outputTypeNumbers);
};

/** レシピ切り替え */
const getRecipe = () => {
    recipe.value.assign(configStore.config.recipes[props.index]);
    relocateIOMaterial();
};

/** 内部レシピ更新時 */
const applyRecipeData = () => {
    configStore.setRecipe(props.index, recipe.value);
};

// Getters -----------------------------------------------------

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
    const name = configStore.machineName(recipe.value.machineId);
    return (name) ? name : '設備無し';
});
/** 設備アイコン */
const machineImage = computed((): string => {
    const data = imageStore.getData(recipe.value.machineId);
    return (data) ? data : '';
});
/** 制作時間 */
const productTime = computed((): number => {
    return recipe.value.productTime;
});
/** 有効な入力素材リスト */
const validMaterialInputs = computed((): ConfigRecipeMaterial[] => {
    if (!recipe.value) return [];
    return recipe.value.input.filter((v) => v);
});
/** 有効な出力素材リスト */
const validMaterialOutputs = computed((): ConfigRecipeMaterial[] => {
    if (!recipe.value) return [];
    return recipe.value.output.filter((v) => v);
});
/** 素材名 */
const materialName = computed(() => (materialId: string): string => {
    return configStore.materialName(materialId);
});
/** 入力素材ID */
const materialInputId = computed(() => (index: number): string => {
    if (recipe.value?.input[index]?.id === undefined) return '';
    return recipe.value.input[index].id;
});
/** 入力素材数枠表示フラグ */
const materialInputNumberShow = computed(() => (index: number): boolean => {
    if (recipe.value?.input[index]?.id === undefined) return false;
    return recipe.value.input[index].id !== '';
});
/** 入力素材数 */
const materialInputNumber = computed(() => (index: number): number|'' => {
    if (recipe.value?.input[index]?.number === undefined) return '';
    return recipe.value.input[index].number;
});
/** 出力素材ID */
const materialOutputId = computed(() => (index: number): string => {
    if (props.index == 44) {
        console.log(recipe.value);
        console.log(recipe.value?.output[index]?.id);
    }
    if (recipe.value?.output[index]?.id === undefined) return '';
    return recipe.value.output[index].id;
});
/** 出力素材数枠表示フラグ */
const materialOutputNumberShow = computed(() => (index: number): boolean => {
    if (recipe.value?.output[index]?.id === undefined) return false;
    return recipe.value.output[index].id !== '';
});
/** 出力素材数 */
const materialOutputNumber = computed(() => (index: number): number|'' => {
    if (recipe.value?.output[index]?.number === undefined) return '';
    return recipe.value.output[index].number;
});

/** 設備の入力口数 */
const machineInputPortNumber = computed((): number => {
    return configStore.machineInputPortNumber(recipe.value.machineId);
});
/** 設備の出力口数 */
const machineOutputPortNumber = computed((): number => {
    return configStore.machineOutputPortNumber(recipe.value.machineId);
});
/** 設備の入力口のタイプ */
const machineInputType = computed(() => (index: number): string => {
    const portNumber = configStore.machineInputPortNumber(recipe.value.machineId);
    if (index >= portNumber) return '';
    return configStore.machineInputPortType(recipe.value.machineId, index);
});
/** 設備の出力口のタイプ */
const machineOutputType = computed(() => (index: number): string => {
    const portNumber = configStore.machineOutputPortNumber(recipe.value.machineId);
    if (index >= portNumber) return '';
    return configStore.machineOutputPortType(recipe.value.machineId, index);
});

/** レシピ名エラー */
const nameError = computed((): boolean => {
    return recipe.value.nameError();
});
/** 入力素材エラー */
const inputError = computed((): boolean => {
    const machine = configStore.config.machines.find((m) => m.id == recipe.value.machineId);
    if (!machine) return true;
    return recipe.value.inputError(machine, configStore.config.materials);
});
/** 入力素材数エラー */
const inputNumberError = computed(() => (index: number): boolean => {
    if (index < 0 || index >= recipe.value?.input.length) return true; // イレギュラー
    if (!recipe.value.input[index]) return false; // 設備の口数以上ならエラー無し
    return recipe.value.input[index].numberError();
});
/** 出力素材エラー */
const outputError = computed((): boolean => {
    const machine = configStore.config.machines.find((m) => m.id == recipe.value.machineId);
    if (!machine) return true;
    return recipe.value.outputError(machine, configStore.config.materials);
});
/** 出力素材数エラー */
const outputNumberError = computed(() => (index: number): boolean => {
    if (index < 0 || index >= recipe.value?.output.length) return true; // イレギュラー
    if (!recipe.value.output[index]) return false; // 設備の口数以上ならエラー無し
    return recipe.value.output[index].numberError();
});
/** 製作時間エラー */
const productTimeError = computed((): boolean => {
    return recipe.value.productTimeError();
});
/** 対象の設備エラー */
const machineIdError = computed((): boolean => {
    return recipe.value.machineIdError();
});
/** 何かしらエラーあり */
const existError = computed((): boolean => {
    const machine = configStore.config.machines.find((m) => m.id == recipe.value.machineId);
    if (!machine) return true;
    return recipe.value.existError(machine, configStore.config.materials);
});

// Actions -----------------------------------------------------

/** 編集モードに切り替え */
const toEditMode = () => {
    editMode.value = true;
}
/** 閲覧モード（コンパクト表示）に切り替え */
const toViewMode = () => {
    editMode.value = false;
}

/** レシピ削除 */
const deleteRecipe = () => {
    emits('delete', props.index);
};
/** レシピ名更新 */
const changeRecipeName = (event: Event) => {
    if (event?.target === undefined) return;
    recipe.value.name = (event.target as HTMLInputElement).value;
    applyRecipeData();
};
/** 設備ID更新 */
const changeMachineId = (value: string) => {
    recipe.value.machineId = value;
    // 入出力口数に変化があれば補正（target は参照渡し）
    const update = (target: Array<ConfigRecipeMaterial>, portNumber: number, maxNumber: number) => {
        for (let i = 0; i < maxNumber; i++) {
            if (i < portNumber && target[i] === undefined) {
                // 枠が不足していれば作成
                target[i] = new ConfigRecipeMaterial();
            }
            else if (i >= portNumber && target[i] !== undefined) {
                // 枠が多ければ削除
                delete target[i];
            }
        }
    }
    // 入力口数に変化があれば補正
    const inputNumber = configStore.machineInputPortNumber(recipe.value.machineId);
    update(recipe.value.input, inputNumber, ConfigRecipe.InputMax);
    // 出力口数に変化があれば補正
    const outputNumber = configStore.machineOutputPortNumber(recipe.value.machineId);
    update(recipe.value.output, outputNumber, ConfigRecipe.OutputMax);

    // 入出力口のタイプも合わせる
    relocateIOMaterial();

    applyRecipeData();
};
/** 製作時間更新 */
const changeProductTime = (event: Event) => {
    if (event?.target === undefined) return;
    recipe.value.productTime = Number((event.target as HTMLInputElement).value);
    applyRecipeData();
};
/** 入力素材ID更新 */
const changeInputMaterialId = (index: number, value: string) => {
    if (index < 0 || index >= recipe.value.input.length) return;
    if (!recipe.value.input[index]) {
        // 入力素材の枠がデータ上確保されていない場合は作成する
        recipe.value.input[index] = new ConfigRecipeMaterial();
    }
    recipe.value.input[index].id = value;
    if (!value) {
        // 素材IDが無い場合は必要数もリセット
        recipe.value.input[index].number = 0;
    }
    applyRecipeData();
};
/** 入力素材数更新 */
const changeInputMaterialNumber = (index: number, event: Event) => {
    if (event?.target === undefined) return;
    if (index < 0 || index >= recipe.value.input.length) return;
    if (!recipe.value.input[index]) {
        // 入力素材の枠がデータ上確保されていない場合は作成する
        recipe.value.input[index] = new ConfigRecipeMaterial();
    }
    recipe.value.input[index].number = Number((event.target as HTMLInputElement).value);
    applyRecipeData();
};
/** 出力素材ID更新 */
const changeOutputMaterialId = (index: number, value: string) => {
    if (index < 0 || index >= recipe.value.output.length) return;
    if (!recipe.value.output[index]) {
        // 出力素材の枠がデータ上確保されていない場合は作成する
        recipe.value.output[index] = new ConfigRecipeMaterial();
    }
    recipe.value.output[index].id = value;
    if (!value) {
        // 素材IDが無い場合は必要数もリセット
        recipe.value.input[index].number = 0;
    }
    applyRecipeData();
};
/** 出力素材数更新 */
const changeOutputMaterialNumber = (index: number, event: Event) => {
    if (event?.target === undefined) return;
    if (index < 0 || index >= recipe.value.output.length) return;
    if (!recipe.value.output[index]) {
        // 出力素材の枠がデータ上確保されていない場合は作成する
        recipe.value.output[index] = new ConfigRecipeMaterial();
    }
    recipe.value.output[index].number = Number((event.target as HTMLInputElement).value);
    applyRecipeData();
};

// サイクル -----------------------------------------------------

onMounted(() => {
    getRecipe();
});

// 監視 --------------------------------------------------------

// レシピインデックスの変更を検出
watch(() => props.index, () => {
    // ストアの値で内部情報を更新
    getRecipe();
});

// ストアの更新後を検知
configStore.$subscribe(() => {
    // 更新が終わったらタイミングでストアの値で内部情報を更新
    if(configStore.isUpdating) return;
    getRecipe();
});



</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
.config-recipe-view-frame {
    width: 100%;
    display: flex;
    background: var(--dark-main-color);
    font-size: 0.8em;
    line-height: 1.2em;
    border-top: 1px solid var(--dark-main-color);
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
    border-bottom: 1px solid var(--dark-main-color);
    border-radius: 8px;
    margin-bottom: 8px;
    user-select: none;
}
.index {
    width: 2.4em;
    background: var(--dark-main-color);
    border-radius: 4px 0px 0px 4px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.content {
    flex: 1;
    display: flex;
    border-radius: 4px;
    background: var(--dark-bg-color);
}
/* トグルボタン */
.toggle-box {
    width: 2em;
    display: flex;
    justify-content: center;
    padding: 4px;
    margin-left: 4px;
}
.toggle-box .toggle-button {
    background: var(--dark-main-color);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 2em;
    border-radius: 4px;
    cursor: pointer;
    padding: 0px 4px;
}
.toggle-box .toggle-button:hover {
    background: var(--dark-accent-color);
}

/* 閲覧モード（コンパクト表示）用 */
.view-mode-box {
    flex: 1;
    display: flex;
    padding: 2px 8px 2px 0px;
    gap: 8px;
}
.view-mode-box .title-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-right: 3px solid var(--dark-main-color);
    padding-right: 4px;
}
.view-mode-box .title-box .recipe-name-box {
    flex: 1;
    text-align: left;
    font-size: 1.2em;
    line-height: 1.2em;
    font-weight: bold;
    user-select: text;
}
.view-mode-box .title-box .machine-name-box {
    text-align: left;
    display: flex;
    align-items: center;
    gap: 4px;
}
.view-mode-box .title-box .machine-name-box.error {
    border-radius: 4px;
    padding-left: 4px;
}
.view-mode-box .title-box .machine-name-box img {
    aspect-ratio: 1;
    height: 1em;
    mix-blend-mode: screen;
}
.view-mode-box .recipe-detail-box {
    flex: 1;
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 8px;
}
.view-mode-box .recipe-detail-box .material-box {
    border: 1px solid var(--dark-main-color);
    border-radius: 4px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}
.view-mode-box .recipe-detail-box .material-box img {
    aspect-ratio: 1;
    height: 2.5em;
}
.view-mode-box .recipe-detail-box .material-box .number {
    position: absolute;
    right: 0px;
    bottom: 0px;
    border-radius: 2px;
    background: var(--dark-main-color);
    font-size: 0.8em;
    line-height: 1em;
    padding: 1px 4px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.view-mode-box .recipe-detail-box .arrow {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;

}
.view-mode-box .product-time-box {
    display: flex;
    align-items: center;
    width: 4em;
    gap: 0.5em;
}
.view-mode-box .product-time-box .product-time {
    background: var(--dark-main-color);
    width: 2.5em;
    padding: 8px 0px;
    border-radius: 8px;
}
.delete-box {
    font-weight: bold;
    background: tomato;
    border-radius: 4px 8px 8px 4px;
    cursor: pointer;
    width: 2em;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 2px 2px 2px 4px;
}
.delete-box:hover {
    font-weight: bold;
    background: red;
}

/* 編集モード用 */
.edit-mode-box {
    flex: 1;
    display: flex;
    padding-right: 4px;
}
.edit-mode-box .grid {
    flex: 1;
    display: grid;
    grid-template-columns: 5em 1fr 5em 1fr;
    grid-template-rows: repeat(5, 1.5em);
    grid-template-areas:
        ". recipe-name . machine"
        "input-label input1 output-label output1"
        "input-label input2 output-label output2"
        "input-label input3 . ."
        "input-label input4 product-time-label product-time";
    grid-gap: 4px;
    margin: 4px;
}
.edit-mode-box .grid .label {
    display: flex;
    justify-content: center;
    align-items: center;
    border-right: 3px solid var(--dark-main-color)
}
.edit-mode-box .grid .recipe-name-box {
    grid-area: recipe-name;
    display: flex;
}
.edit-mode-box .grid .recipe-name-box > * {
    flex: 1;
}
.edit-mode-box .grid .machine-id-box {
    grid-area: machine;
    display: flex;
}
.edit-mode-box .grid .machine-id-box > * {
    flex: 1;
}
.edit-mode-box .grid .input-label {
    grid-area: input-label;
}
.edit-mode-box .grid .input-material-box {
    display: flex;
    gap: 4px;
}
.edit-mode-box .grid .input1 {
    grid-area: input1;
}
.edit-mode-box .grid .input2 {
    grid-area: input2;
}
.edit-mode-box .grid .input3 {
    grid-area: input3;
}
.edit-mode-box .grid .input4 {
    grid-area: input4;
}
.edit-mode-box .grid .input-material-box > *:nth-child(1) {
    flex: 1;
    min-width: 0;
}
.edit-mode-box .grid .input-material-box > *:nth-child(2) {
    width: 3em;
}
.edit-mode-box .grid .output-label {
    grid-area: output-label;
}
.edit-mode-box .grid .output-material-box {
    display: flex;
    gap: 4px;
}
.edit-mode-box .grid .output1 {
    grid-area: output1;
}
.edit-mode-box .grid .output2 {
    grid-area: output2;
}
.edit-mode-box .grid .output-material-box > *:nth-child(1) {
    flex: 1;
    min-width: 0;
}
.edit-mode-box .grid .output-material-box > *:nth-child(2) {
    width: 3em;
}
.edit-mode-box .grid .product-time-label {
    grid-area: product-time-label;
}
.edit-mode-box .grid .product-time-box {
    grid-area: product-time;
    display: flex;
    justify-content: start;
    gap: 4px;
}
.edit-mode-box .grid .product-time-box input {
    width: 4em;
}
</style>