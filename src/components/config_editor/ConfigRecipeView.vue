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
                    <div class="recipe-id-box" :class="{ error: idError, warning: hasDuplicate }">
                        <span>{{ recipeId }}</span>
                    </div>
                    <div class="recipe-name-box" :class="{ error: nameError }">
                        <span>{{ recipeName }}</span>
                    </div>
                </div>
                <div class="machine-box">
                    <div class="machine-img-box" :class="{ error: machineIdError }">
                        <img v-if="machineImage" :src="machineImage" :title="machineName" />
                    </div>
                </div>
                <div class="recipe-detail-box">
                    <div class="material-box" v-for="(material, inputIndex) in props.recipe.input"
                        :key="'input' + inputIndex" :class="{
                            conveyor: machineInputTypeIsConveyor(inputIndex),
                            pipe: machineInputTypeIsPipe(inputIndex),
                    }" :title="materialTooltip(material)">
                        <img v-if="material" :src="imageStore.getData(material.id)" :alt="materialName(material.id)" />
                        <div v-if="material" class="number">{{ material.number }}</div>
                    </div>
                    <div class="arrow">▶</div>
                    <div class="material-box" v-for="(material, outputIndex) in props.recipe.output"
                        :key="'output' + outputIndex" :class="{
                            conveyor: machineOutputTypeIsConveyor(outputIndex),
                            pipe: machineOutputTypeIsPipe(outputIndex),
                    }" :title="materialTooltip(material)">
                        <img v-if="material" :src="imageStore.getData(material.id)" :alt="materialName(material.id)" />
                        <div v-if="material" class="number">{{ material.number }}</div>
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
                    <div class="label">レシピID</div>
                    <div class="recipe-id-box">
                        <input type="text" :value="recipeId" :title="recipeId"
                            @change="changeRecipeId" :class="{ error: idError, warning: hasDuplicate }" />
                    </div>
                    <div class="label">レシピ名</div>
                    <div class="recipe-name-box">
                        <input type="text" :value="recipeName" :title="recipeName"
                            @change="changeRecipeName" :class="{ error: nameError }" />
                    </div>
                    <div class="label machine-label">設備</div>
                    <div class="machine-id-box">
                        <MachineSelect
                            :modelValue="machineId" :machines="machines" :isError="machineIdError"
                            @update:modelValue="changeMachineId">
                        </MachineSelect>
                    </div>
                    <div class="label input-label">入力素材</div>
                    <div class="input-material-box" :class="'input' + inputIndex"
                        v-for="inputIndex of ConfigRecipe.InputMax" :key="'input' + inputIndex">
                        <MaterialSelect v-if="machineInputPortNumber > inputIndex - 1"
                            :modelValue="materialInputId(inputIndex - 1)"
                            :type="machineInputType(inputIndex - 1)"
                            :materials="materials" :isError="inputError"
                            @update:modelValue="changeInputMaterialId(inputIndex - 1, $event)">
                        </MaterialSelect>
                        <input v-if="machineInputPortNumber > inputIndex - 1" type="number" min="0"
                            :title="materialInputNumber(inputIndex - 1).toString()"
                            :value="materialInputNumber(inputIndex - 1)"
                            @change="changeInputMaterialNumber(inputIndex - 1, $event)"
                            :class="{
                                error: inputNumberError(inputIndex - 1),
                                hide: !materialInputNumberShow(inputIndex - 1) }"
                            />
                    </div>
                    <div class="label output-label">出力素材</div>
                    <div class="output-material-box" :class="'output' + outputIndex"
                        v-for="outputIndex of ConfigRecipe.OutputMax" :key="'output' + outputIndex">
                        <MaterialSelect v-if="machineOutputPortNumber > outputIndex - 1"
                            :modelValue="materialOutputId(outputIndex - 1)"
                            :type="machineOutputType(outputIndex - 1)"
                            :materials="materials" :isError="outputError"
                            @update:modelValue="changeOutputMaterialId(outputIndex - 1, $event)">
                        </MaterialSelect>
                        <input v-if="machineOutputPortNumber > outputIndex - 1" type="number" min="0"
                            :title="materialOutputNumber(outputIndex - 1).toString()"
                            :value="materialOutputNumber(outputIndex - 1)"
                            @change="changeOutputMaterialNumber(outputIndex - 1, $event)"
                            :class="{
                                error: outputNumberError(outputIndex - 1),
                                hide: !materialOutputNumberShow(outputIndex - 1) }"
                            />
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
import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useImageStore } from '@/stores/image_store';
import {
    ConfigMachine, ConfigMaterial, ConfigRecipe, ConfigRecipeMaterial, MachinePortType, MaterialState
} from '@/defines/types/config'
import { machine } from 'os';

// 子コンポーネント ---------------------------------------------


// 外部連携 -----------------------------------------------------

const props = defineProps({
    /** レシピインデックス（エミット用） */
    index: {
        type: Number,
        default: 0,
        required: true,
    },
    /** レシピデータ */
    recipe: {
        type: ConfigRecipe,
        default: new ConfigRecipe(),
        required: true,
    },
    /** レシピで現在指定している設備データ */
    machine: {
        type: ConfigMachine,
        default: new ConfigMachine(),
        required: true,
    },
    /** 設備リスト */
    machines: {
        type: Array<ConfigMachine>,
        default: [] as Array<ConfigMachine>,
        required: true,
    },
    /** 素材リスト */
    materials: {
        type: Array<ConfigMaterial>,
        default: [] as Array<ConfigMaterial>,
        required: true,
    },
    /** 重複する要素の有無 */
    hasDuplicate: {
        type: Boolean,
        default: false,
    },
});

// 内部定義 -----------------------------------------------------

const emits = defineEmits<{
    (e: 'delete', index: number): void // 削除した旨を親に伝える（設定ストアの反映後）
}>();

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 画像ストア */
const imageStore = useImageStore();

/** 編集モードフラグ（展開：編集モード、格納：閲覧モード（コンパクト表示）） */
const editMode = ref(false);

// 内部関数 -----------------------------------------------------

/**
 * レシピ更新時
 * @param recipe [in] 更新後のレシピデータ
 * @return 処理開始の成否（true: 成功）
 */
const applyRecipeData = (recipe: ConfigRecipe): boolean => {
    // ストア更新
    return configStore.setRecipe(props.index, recipe);
};

/**
 * レシピ削除時
 * @return 処理開始の成否（true: 成功）
 */
const deleteRecipe = (): boolean => {
    const succeeded = configStore.deleteRecipe(props.index);
    emits('delete', props.index); // 削除したことを親に通知しておく
    return succeeded;
};

/**
 * 分間の数値を表す文字列
 * @param num 値
 * @return 分間の数値を表す文字列
 */
const toPerMinute = (num: number): string => {
    // 生産時間に異常値が入っているとエラーになる為除外
    if (!props.recipe || props.recipe.productTime <= 0) return num.toString();
    // 分間の数値に変換
    const perMinute = num * (60 / props.recipe.productTime);
    return `${perMinute} /分`; // 単位を付けて返す
};

// Getters -----------------------------------------------------

/** レシピ名 */
const recipeId = computed((): string => {
    return props.recipe.id;
});
/** レシピ名 */
const recipeName = computed((): string => {
    return props.recipe.name;
});
/** 設備ID */
const machineId = computed((): string => {
    return props.recipe.machineId;
});
/** 設備名 */
const machineName = computed((): string => {
    const name = configStore.machineName(props.recipe.machineId);
    return (name) ? name : '設備無し';
});
/** 設備アイコン */
const machineImage = computed((): string => {
    const data = imageStore.getData(props.recipe.machineId);
    return (data) ? data : '';
});
/** 制作時間 */
const productTime = computed((): number => {
    return props.recipe.productTime;
});
/** 素材名 */
const materialName = computed(() => (materialId: string): string => {
    return configStore.materialName(materialId);
});
/** 入力素材ID */
const materialInputId = computed(() => (index: number): string => {
    if (index < 0 || props.recipe.input[index] === undefined) return ''; // イレギュラー
    return props.recipe.input[index].id;
});
/** 入力素材数枠表示フラグ */
const materialInputNumberShow = computed(() => (index: number): boolean => {
    if (index < 0 || props.recipe.input[index] === undefined) return false; // イレギュラー
    return props.recipe.input[index].id !== '';
});
/** 入力素材数 */
const materialInputNumber = computed(() => (index: number): number => {
    if (index < 0 || props.recipe.input[index] === undefined) return 0; // イレギュラー
    return props.recipe.input[index].number;
});
/** 出力素材ID */
const materialOutputId = computed(() => (index: number): string => {
    if (index < 0 || props.recipe.output[index] === undefined) return ''; // イレギュラー
    return props.recipe.output[index].id;
});
/** 出力素材数枠表示フラグ */
const materialOutputNumberShow = computed(() => (index: number): boolean => {
    if (index < 0 || props.recipe.output[index] === undefined) return false; // イレギュラー
    return props.recipe.output[index].id !== '';
});
/** 出力素材数 */
const materialOutputNumber = computed(() => (index: number): number => {
    if (index < 0 || props.recipe.output[index] === undefined) return 0; // イレギュラー
    return props.recipe.output[index].number;
});
/** 素材のツールチップ */
const materialTooltip = computed(() => (material: ConfigRecipeMaterial): string => {
    if (!material) return '';
    const perMinuteText = toPerMinute(material.number);
    return `${material.number.toString()} (${perMinuteText})`;
});

/** 設備の入力ポート数 */
const machineInputPortNumber = computed((): number => {
    return props.machine.inputNumber.totalPortNumber();
});
/** 設備の出力ポート数 */
const machineOutputPortNumber = computed((): number => {
    return props.machine.outputNumber.totalPortNumber();
});
/** 設備の入力ポートタイプ */
const machineInputType = computed(() => (index: number): string => {
    return props.machine.inputNumber.portType(index);
});
/** 設備の入力ポートがコンベアか（枠外なら false） */
const machineInputTypeIsConveyor = computed(() => (index: number): boolean => {
    return props.machine.inputNumber.portType(index) == MachinePortType.Conveyor;
});
/** 設備の入力ポートがパイプか（枠外なら false） */
const machineInputTypeIsPipe = computed(() => (index: number): boolean => {
    return props.machine.inputNumber.portType(index) == MachinePortType.Pipe;
});
/** 設備の出力ポートタイプ */
const machineOutputType = computed(() => (index: number): string => {
    return props.machine.outputNumber.portType(index);
});
/** 設備の出力ポートがコンベアか（枠外なら false） */
const machineOutputTypeIsConveyor = computed(() => (index: number): boolean => {
    return props.machine.outputNumber.portType(index) == MachinePortType.Conveyor;
});
/** 設備の入力ポートがパイプか（枠外なら false） */
const machineOutputTypeIsPipe = computed(() => (index: number): boolean => {
    return props.machine.outputNumber.portType(index) == MachinePortType.Pipe;
});

/** レシピIDエラー */
const idError = computed((): boolean => {
    return props.recipe.idError();
});
/** レシピ名エラー */
const nameError = computed((): boolean => {
    return props.recipe.nameError();
});
/** 入力素材エラー */
const inputError = computed((): boolean => {
    return props.recipe.inputError(props.machine, props.materials);
});
/** 入力素材数エラー */
const inputNumberError = computed(() => (index: number): boolean => {
    if (index < 0 || index >= props.recipe.input.length) return true; // イレギュラー
    if (props.recipe.input[index] === undefined) return false; // 設備の口数以上ならエラー無し
    return props.recipe.input[index].numberError();
});
/** 出力素材エラー */
const outputError = computed((): boolean => {
    return props.recipe.outputError(props.machine, props.materials);
});
/** 出力素材数エラー */
const outputNumberError = computed(() => (index: number): boolean => {
    if (index < 0 || index >= props.recipe.output.length) return true; // イレギュラー
    if (props.recipe.output[index] === undefined) return false; // 設備の口数以上ならエラー無し
    return props.recipe.output[index].numberError();
});
/** 製作時間エラー */
const productTimeError = computed((): boolean => {
    return props.recipe.productTimeError();
});
/** 対象の設備エラー */
const machineIdError = computed((): boolean => {
    return props.recipe.machineIdError();
});
/** 何かしらエラーあり */
const existError = computed((): boolean => {
    return props.recipe.existError(props.machine, props.materials);
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
/** レシピID更新 */
const changeRecipeId = (event: Event) => {
    if (event?.target === undefined) return;
    const target = event.target as HTMLInputElement;
    const recipe = props.recipe.clone();
    recipe.id = target.value;
    // ストア更新
    const succeeded = applyRecipeData(recipe);
    if (!succeeded) {
        // 失敗したらフォームの値を元に戻す
        target.value = props.recipe.id;
    }
};
/** レシピ名更新 */
const changeRecipeName = (event: Event) => {
    if (event?.target === undefined) return;
    const target = event.target as HTMLInputElement;
    const recipe = props.recipe.clone();
    recipe.name = target.value;
    // ストア更新
    const succeeded = applyRecipeData(recipe);
    if (!succeeded) {
        // 失敗したらフォームの値を元に戻す
        target.value = props.recipe.name;
    }
};
/** 設備ID更新 */
const changeMachineId = (value: string) => {
    const recipe = props.recipe.clone();
    recipe.machineId = value;
    // 入出力ポート数に変化があれば補正
    // param target [in,out] 補正対象のレシピ素材リスト
    // param portNumber [in] 設備のポート数
    // param maxNum [in] 設備のポート数の最大値
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
    // 入力ポート数に変化があれば補正
    const inputNumber = props.machine.inputNumber.totalPortNumber();
    update(recipe.input, inputNumber, ConfigRecipe.InputMax);
    // 出力ポート数に変化があれば補正
    const outputNumber = props.machine.outputNumber.totalPortNumber();
    update(recipe.output, outputNumber, ConfigRecipe.OutputMax);

    // 入出力ポートのタイプも合わせる
    recipe.relocateIOMaterial(props.machine, props.materials);

    // ストア更新(失敗時の補正不要)
    applyRecipeData(recipe);
};
/** 製作時間更新 */
const changeProductTime = (event: Event) => {
    if (event?.target === undefined) return;
    const target = event.target as HTMLInputElement;
    const recipe = props.recipe.clone();
    recipe.productTime = Number(target.value);
    // ストア更新
    const succeeded = applyRecipeData(recipe);
    if (!succeeded) {
        // 失敗したらフォームの値を元に戻す
        target.value = props.recipe.productTime.toString();
    }
};
/** 入力素材ID更新 */
const changeInputMaterialId = (index: number, value: string) => {
    if (index < 0 || index >= props.recipe.input.length) return; // イレギュラー
    const recipe = props.recipe.clone();
    if (!recipe.input[index]) {
        // 入力素材の枠がデータ上確保されていない場合は作成する
        recipe.input[index] = new ConfigRecipeMaterial();
    }
    recipe.input[index].id = value;
    if (!value) {
        // 素材IDが無い場合は必要数もリセット
        recipe.input[index].number = 0;
    }
    // ストア更新
    applyRecipeData(recipe);
};
/** 入力素材数更新 */
const changeInputMaterialNumber = (index: number, event: Event) => {
    if (event?.target === undefined) return;
    if (index < 0 || index >= props.recipe.input.length) return; // イレギュラー
    const target = event.target as HTMLInputElement;
    const recipe = props.recipe.clone();
    if (!recipe.input[index]) {
        // 入力素材の枠がデータ上確保されていない場合は作成する
        recipe.input[index] = new ConfigRecipeMaterial();
    }
    recipe.input[index].number = Number(target.value);
    // ストア更新
    const succeeded = applyRecipeData(recipe);
    if (!succeeded) {
        // 失敗したらフォームの値を元に戻す
        target.value = props.recipe.input[index].number.toString();
    }
};
/** 出力素材ID更新 */
const changeOutputMaterialId = (index: number, value: string) => {
    if (index < 0 || index >= props.recipe.output.length) return; // イレギュラー
    const recipe = props.recipe.clone();
    if (!recipe.output[index]) {
        // 出力素材の枠がデータ上確保されていない場合は作成する
        recipe.output[index] = new ConfigRecipeMaterial();
    }
    recipe.output[index].id = value;
    if (!value) {
        // 素材IDが無い場合は必要数もリセット
        recipe.input[index].number = 0;
    }
    // ストア更新
    applyRecipeData(recipe);
};
/** 出力素材数更新 */
const changeOutputMaterialNumber = (index: number, event: Event) => {
    if (event?.target === undefined) return;
    if (index < 0 || index >= props.recipe.output.length) return;
    const target = event.target as HTMLInputElement;
    const recipe = props.recipe.clone();
    if (!recipe.output[index]) {
        // 出力素材の枠がデータ上確保されていない場合は作成する
        recipe.output[index] = new ConfigRecipeMaterial();
    }
    recipe.output[index].number = Number(target.value);
    // ストア更新
    const succeeded = applyRecipeData(recipe);
    if (!succeeded) {
        // 失敗したらフォームの値を元に戻す
        target.value = props.recipe.output[index].number.toString();
    }
};

// 公開設定 -----------------------------------------------------

defineExpose({toEditMode, toViewMode});

// サイクル -----------------------------------------------------

// 監視 --------------------------------------------------------

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
    gap: 6px;
}
.view-mode-box .title-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-right: 4px;
}
.view-mode-box .title-box .recipe-id-box {
    flex: 1;
    text-align: left;
    font-size: 0.9em;
    font-weight: bold;
    user-select: text;
    border-radius: 4px;
    padding: 0px 2px;
}
.view-mode-box .title-box .recipe-name-box {
    flex: 1;
    text-align: left;
    font-size: 1.2em;
    line-height: 1.2em;
    font-weight: bold;
    user-select: text;
    border-radius: 4px;
    padding: 0px 2px;
}

.view-mode-box .machine-box {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 6px;
    border-right: 3px solid var(--dark-main-color);
}
.view-mode-box .machine-box .machine-img-box {
    text-align: left;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    padding: 1px 2px;
    aspect-ratio: 1;
    width: calc(2.5em + 2px);
}
.view-mode-box .machine-box .machine-img-box.error {
    border-radius: 4px;
    padding-left: 4px;
}
.view-mode-box .machine-box .machine-img-box img {
    border: 1px solid var(--dark-main-color);
    border-radius: 4px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    aspect-ratio: 1;
    height: calc(2.5em + 2px);
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
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    aspect-ratio: 1;
    height: calc(2.5em + 2px);
}
.view-mode-box .recipe-detail-box .material-box.conveyor {
    border: 1px solid var(--dark-main-color);
    border-radius: 4px;
}
.view-mode-box .recipe-detail-box .material-box.pipe {
    border: 1px solid var(--dark-main-color);
    border-radius: 50%;
}
.view-mode-box .recipe-detail-box .material-box img {
    aspect-ratio: 1;
    height: 100%;
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
        ". recipe-id . recipe-name"
        "input-label input1 machine-label machine"
        "input-label input2 product-time-label product-time"
        "input-label input3 output-label output1"
        "input-label input4 output-label output2";
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
.edit-mode-box .grid .machine-label {
    grid-area: machine-label;
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
    width: 4em;
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
    width: 4em;
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