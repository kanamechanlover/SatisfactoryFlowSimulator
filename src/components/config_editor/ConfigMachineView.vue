<template>
    <div class="config-machine-view-frame">
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
                    <div class="machine-id-box" :class="{ error: idError, 'warning-section': props.hasDuplicate }">
                        <span>{{ machine.id }}</span>
                    </div>
                    <div class="machine-name-box" :class="{ error: nameError }">
                        <span>{{ machine.name }}</span>
                    </div>
                </div>
                <div class="machine-detail-box">
                    <div class="detail tier">
                        <span class="label">ティア</span>
                        <span class="value" :class="{ error: tierError }">{{ tierName }}</span>
                    </div>
                    <div class="detail category">
                        <span class="label">カテゴリ</span>
                        <span class="value" :class="{ error: categoryError }">{{ categoryName }}</span>
                    </div>
                    <div class="detail power">
                        <span class="label">電力</span>
                        <span class="value">
                            <span>{{ machine.power }} <span class="unit">MW</span></span>
                        </span>
                    </div>
                    <div class="detail">
                        <span class="label">入力口数</span>
                        <span class="value">
                            <img :src="imageStore.getData(MachinePortType.Conveyor)" />
                            <span>{{ machine.inputNumber.conveyor }}</span>
                            <img :src="imageStore.getData(MachinePortType.Pipe)" />
                            <span>{{ machine.inputNumber.pipe }}</span>
                        </span>
                    </div>
                    <div class="detail">
                        <span class="label">出力口数</span>
                        <span class="value">
                            <img :src="imageStore.getData(MachinePortType.Conveyor)" />
                            <span>{{ machine.outputNumber.conveyor }}</span>
                            <img :src="imageStore.getData(MachinePortType.Pipe)" />
                            <span>{{ machine.outputNumber.pipe }}</span>
                        </span>
                    </div>
                    <div class="detail icon">
                        <span class="value">
                            <img v-if="machineIconData" :src="machineIconData"
                                :class="{ error: iconError }" :title="machineIconUrl" />
                        </span>
                    </div>
                </div>
                <div class="reference-box">
                    <span class="label">参照数</span>
                    <span class="value">{{ referenceMachine(machine.id) }}</span>
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
                    <div class="label machine-id-label right">設備ID</div>
                    <div class="machine-id-box">
                        <input type="text" :class="{ error: idError, 'warning': props.hasDuplicate }"
                            :value="machine.id" @change="changeMachineId" />
                    </div>
                    <div class="label machine-name-label right">設備名</div>
                    <div class="machine-name-box">
                        <input type="text" :class="{ error: nameError }"
                            :value="machine.name" @change="changeMachineName" />
                    </div>
                    <div class="label machine-tier-label right">ティア</div>
                    <div class="machine-tier-box">
                        <input type="number" :value="machine.tier"
                            @change="changeMachineTier" min="-2"
                            :class="{ error: tierError }"
                            :title="'ティア : ' + tierName" />
                    </div>
                    <div class="label machine-category-label right">カテゴリ</div>
                    <div class="machine-category-box">
                        <CategorySelect :modelValue="machine.category"
                            :categories="categories" :isError="categoryError"
                            @update:modelValue="changeMachineCategory">
                        </CategorySelect>
                    </div>
                    <div class="label machine-power-label right">電力</div>
                    <div class="machine-power-box">
                        <input type="number" :value="machine.power"
                            @change="changeMachinePower" min="-2" />
                        <span>MW</span>
                    </div>
                    <div class="label machine-conveyor-label right">
                        <img :src="imageStore.getData(MachinePortType.Conveyor)" />
                    </div>
                    <div class="label machine-pipe-label right">
                        <img :src="imageStore.getData(MachinePortType.Pipe)" />
                    </div>
                    <div class="label machine-input-label bottom">入力口数</div>
                    <div class="input-number machine-input-conveyor">
                        <input type="number" :value="machine.inputNumber.conveyor"
                            @change="changeMachineInputConveyorNumber" min="0" />
                    </div>
                    <div class="input-number machine-input-pipe">
                        <input type="number" :value="machine.inputNumber.pipe"
                            @change="changeMachineInputPipeNumber" min="0" />
                    </div>
                    <div class="label machine-output-label bottom">出力口数</div>
                    <div class="input-number machine-output-conveyor">
                        <input type="number" :value="machine.outputNumber.conveyor"
                            @change="changeMachineOutputConveyorNumber" min="0" />
                    </div>
                    <div class="input-number machine-output-pipe">
                        <input type="number" :value="machine.outputNumber.pipe"
                            @change="changeMachineOutputPipeNumber" min="0" />
                    </div>
                    <div class="label machine-icon-label">
                        <img v-if="machineIconData" :src="machineIconData"
                            :class="{ error: iconError }" :title="machineIconUrl" />
                    </div>
                    <div class="label reference-label bottom">参照数</div>
                    <div class="reference-box">
                        <span>{{ referenceMachine(machine.id) }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="delete-box" @click="deleteMachine()" title="削除">
            <span>-</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useImageStore } from '@/stores/image_store';
import {
    ConfigMachine, MachinePortType, MachineTier, ConfigCategory
} from '@/defines/types/config'

// 子コンポーネント ---------------------------------------------

import CategorySelect from '@/components/config_editor/CategorySelect.vue'

// 外部連携 -----------------------------------------------------

const props = defineProps({
    /** 設備インデックス */
    index: {
        type: Number,
        default: 0,
        required: true,
    },
    /** 設備データ */
    machine: {
        type: ConfigMachine,
        default: new ConfigMachine(),
        required: true,
    },
    /** 設備カテゴリリスト */
    categories: {
        type: Array<ConfigCategory>,
        default: new ConfigMachine(),
        required: true,
    },
    /** 重複する要素の有無 */
    hasDuplicate: {
        type: Boolean,
        default: false,
    },
});

// 内部定義 -----------------------------------------------------

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
 * @param machine [in] 更新後の設備データ
 * @return 処理開始の成否（true: 成功）
 */
const applyMachineData = (machine: ConfigMachine): boolean => {
    // ストア更新
    return configStore.setMachine(props.index, machine);
};

/**
 * 設備削除
 * @return 処理開始の成否（true: 成功）
 */
const deleteMachine = (): boolean => {
    return configStore.deleteMachine(props.index);
};

// Getters -----------------------------------------------------

/** 設備の参照数 */
const referenceMachine = computed(() => {
    return (machineId: string): number => {
        const recipes = configStore.config.recipes.filter((recipe) => {
            return recipe.machineId == machineId;
        });
        return recipes.length;
    };
});

/** ティアのマイナス値変換 */
const tierName = computed((): string => {
    return MachineTier.getTierName(props.machine.tier);
});

/** カテゴリ名 */
const categoryName = computed((): string => {
    return configStore.machineCategoryName(props.machine.category);
});

/** 設備アイコンデータ */
const machineIconData = computed((): string => {
    return imageStore.getData(props.machine.id);
});

/** 設備アイコンURL */
const machineIconUrl = computed((): string => {
    return imageStore.getUrl(props.machine.id);
});

/** 設備IDエラー */
const idError = computed((): boolean => {
    return props.machine.hasIdError();
});
/** 設備名エラー */
const nameError = computed((): boolean => {
    return props.machine.hasNameError();
});
/** カテゴリIDエラー */
const categoryError = computed((): boolean => {
    return props.machine.hasCategoryError();
});
/** 開放されるティア数エラー */
const tierError = computed((): boolean => {
    return props.machine.hasTierError();
});
/** 設備アイコンエラー */
const iconError = computed((): boolean => {
    return !imageStore.hasImage(props.machine.id);
})
/** 何かしらエラーあり */
const existError = computed((): boolean => {
    return props.machine.hasError();
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

/** 設備ID変更 */
const changeMachineId = (event: Event) => {
    if (!event?.target) return;
    const target = event.target as HTMLInputElement;
    const machine = props.machine.clone();
    machine.id = target.value;
    // ストア更新
    const succeeded = applyMachineData(machine);
    if (!succeeded) {
        // 失敗したらフォームの値を元に戻す
        target.value = props.machine.id;
    }
};

/** 設備名変更 */
const changeMachineName = (event: Event) => {
    if (!event?.target) return;
    const target = event.target as HTMLInputElement;
    const machine = props.machine.clone();
    machine.name = target.value;
    // ストア更新
    const succeeded = applyMachineData(machine);
    if (!succeeded) {
        // 失敗したらフォームの値を元に戻す
        target.value = props.machine.name;
    }
};
/** 設備のティア変更 */
const changeMachineTier = (event: Event) => {
    if (!event?.target) return;
    const target = event.target as HTMLInputElement;
    const machine = props.machine.clone();
    machine.tier = Number(target.value);
    // ストア更新
    const succeeded = applyMachineData(machine);
    if (!succeeded) {
        // 失敗したらフォームの値を元に戻す
        target.value = props.machine.tier.toString();
    }
};
/** 設備カテゴリ変更 */
const changeMachineCategory = (categoryName: string) => {
    const machine = props.machine.clone();
    machine.category = categoryName;
    // ストア更新
    applyMachineData(machine);
};
/** 設備の入力コンベア数変更 */
const changeMachineInputConveyorNumber = (event: Event) => {
    if (!event?.target) return;
    const target = event.target as HTMLInputElement;
    const machine = props.machine.clone();
    machine.inputNumber.conveyor = Number(target.value);
    // ストア更新
    const succeeded = applyMachineData(machine);
    if (!succeeded) {
        // 失敗したらフォームの値を元に戻す
        target.value = props.machine.inputNumber.conveyor.toString();
    }
};
/** 設備の入力パイプ数変更 */
const changeMachineInputPipeNumber = (event: Event) => {
    if (!event?.target) return;
    const target = event.target as HTMLInputElement;
    const machine = props.machine.clone();
    machine.inputNumber.pipe = Number(target.value);
    // ストア更新
    const succeeded = applyMachineData(machine);
    if (!succeeded) {
        // 失敗したらフォームの値を元に戻す
        target.value = props.machine.inputNumber.pipe.toString();
    }
};
/** 設備の出力コンベア数変更 */
const changeMachineOutputConveyorNumber = (event: Event) => {
    if (!event?.target) return;
    const target = event.target as HTMLInputElement;
    const machine = props.machine.clone();
    machine.outputNumber.conveyor = Number(target.value);
    // ストア更新
    const succeeded = applyMachineData(machine);
    if (!succeeded) {
        // 失敗したらフォームの値を元に戻す
        target.value = props.machine.outputNumber.conveyor.toString();
    }
};
/** 設備の出力パイプ数変更 */
const changeMachineOutputPipeNumber = (event: Event) => {
    if (!event?.target) return;
    const target = event.target as HTMLInputElement;
    const machine = props.machine.clone();
    machine.outputNumber.pipe = Number(target.value);
    // ストア更新
    const succeeded = applyMachineData(machine);
    if (!succeeded) {
        // 失敗したらフォームの値を元に戻す
        target.value = props.machine.outputNumber.pipe.toString();
    }
};
/** 設備の電力変更 */
const changeMachinePower = (event: Event) => {
    if (!event?.target) return;
    const target = event.target as HTMLInputElement;
    const machine = props.machine.clone();
    machine.power = Number(target.value);
    // ストア更新
    const succeeded = applyMachineData(machine);
    if (!succeeded) {
        // 失敗したらフォームの値を元に戻す
        target.value = props.machine.power.toString();
    }
};

// サイクル -----------------------------------------------------

// 監視 --------------------------------------------------------


</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
.config-machine-view-frame {
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
    gap: 4px;
}
.view-mode-box .label {
    padding-bottom: 4px;
}
.view-mode-box .value {
    border-radius: 4px;
    border: 1px solid var(--dark-main-color);
    background: var(--dark-main-color);
    padding: 2px 8px;
    min-width: 4em;
    height: 1.5em;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
}
.view-mode-box .title-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-right: 3px solid var(--dark-main-color);
    overflow-wrap: break-word;
    word-wrap: break-word;
    max-width: 13.5em;
}
.view-mode-box .title-box .machine-id-box {
    flex: 1;
    text-align: left;
    font-size: 1.2em;
    line-height: 1.2em;
    font-weight: bold;
    user-select: text;
    display: flex;
    align-items: center;
    margin-right: 4px;
    border-radius: 4px;
}
.view-mode-box .title-box .machine-name-box {
    text-align: left;
}
.view-mode-box .machine-detail-box {
    flex: 1;
    display: flex;
    justify-content: space-between;
    gap: 4px;
}
.view-mode-box .machine-detail-box .detail {
    flex: 1;
    display: flex;
    flex-direction: column;
}
.view-mode-box .machine-detail-box .detail .label {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}
.view-mode-box .machine-detail-box .detail.tier {
    flex: 0.5;
}
.view-mode-box .machine-detail-box .detail.tier .value {
    min-width: 2em;
}
.view-mode-box .machine-detail-box .detail.category .value {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.view-mode-box .machine-detail-box .detail img {
    aspect-ratio: 1;
    height: 1.5em;
    mix-blend-mode: screen;
}
.view-mode-box .machine-detail-box .detail.power {
    flex: 0.8
}
.view-mode-box .machine-detail-box .detail.power .value {
    min-width: 3em;
    display: flex;
    justify-content: center;
    align-items: flex-end;
}
.view-mode-box .machine-detail-box .detail .unit {
    font-size: 0.5em;
}
.view-mode-box .machine-detail-box .detail.icon {
    flex: 0.5;
    flex-direction: row;
    align-items: stretch;
}
.view-mode-box .machine-detail-box .detail.icon .value {
    min-width: 1.5em;
    height: auto;
    width: 100%;
    padding: 2px;
    align-items: flex-end;
}
.view-mode-box .machine-detail-box .detail.icon .value img {
    height: unset;
    width: 32px;
    height: 32px;
    mix-blend-mode: normal;
}

.view-mode-box .reference-box {
    display: flex;
    flex-direction: column;
    border-left: 3px solid var(--dark-main-color);
    padding-left: 8px;
}
.view-mode-box .reference-box .label {
    flex: 1;
    min-width: 2em;
    display: flex;
    justify-content: center;
    align-items: center;
}
.view-mode-box .reference-box .value {
    min-width: 2em;
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
    grid-template-columns: 5em 2fr 5em 1fr 1fr 3em;
    grid-template-rows: repeat(4, 1.5em);
    grid-template-areas:
        "label1 machine-id label2 machine-name machine-name icon-machine"
        "label3 tier . label6 label7 icon-machine"
        "label4 category icon-conveyor input-conveyor output-conveyor label8"
        "label5 power icon-pipe input-pipe output-pipe reference";
    grid-gap: 4px;
    margin: 4px;
}
.edit-mode-box .grid .label {
    display: flex;
    justify-content: center;
    align-items: center;
}
.edit-mode-box .grid .label.right {
    border-right: 3px solid var(--dark-main-color)
}
.edit-mode-box .grid .label.bottom {
    border-bottom: 3px solid var(--dark-main-color)
}
/* 設備ID */
.edit-mode-box .grid .machine-id-label {
    grid-area: label1;
}
.edit-mode-box .grid .machine-id-box {
    grid-area: machine-id;
}
/* 設備名 */
.edit-mode-box .grid .machine-name-label {
    grid-area: label2;
}
.edit-mode-box .grid .machine-name-box {
    grid-area: machine-name;
}
/* ティア */
.edit-mode-box .grid .machine-tier-label {
    grid-area: label3;
}
.edit-mode-box .grid .machine-tier-box {
    grid-area: tier;
}
/* 設備カテゴリ */
.edit-mode-box .grid .machine-category-label {
    grid-area: label4;
}
.edit-mode-box .grid .machine-category-box {
    grid-area: category;
    display: flex;
}
.edit-mode-box .grid .machine-category-box select {
    flex: 1;
    border-radius: 4px;
    text-align: center;
}
/* 電力 */
.edit-mode-box .grid .machine-power-label {
    grid-area: label5;
}
.edit-mode-box .grid .machine-power-box {
    grid-area: power;
    display: flex;
    gap: 4px;
    align-items: center;
}
.edit-mode-box .grid .machine-category-box input {
    flex: 1;
}
/* 入力口数 */
.edit-mode-box .grid .machine-input-label {
    grid-area: label6;
}
.edit-mode-box .grid .machine-input-conveyor {
    grid-area: input-conveyor;
}
.edit-mode-box .grid .machine-input-pipe {
    grid-area: input-pipe;
}
/* 出力口数 */
.edit-mode-box .grid .machine-output-label {
    grid-area: label7;
}
.edit-mode-box .grid .machine-output-conveyor {
    grid-area: output-conveyor;
}
.edit-mode-box .grid .machine-output-pipe {
    grid-area: output-pipe;
}
/* コンベアアイコン */
.edit-mode-box .grid .machine-conveyor-label {
    grid-area: icon-conveyor;
}
/* パイプアイコン */
.edit-mode-box .grid .machine-pipe-label {
    grid-area: icon-pipe;
}
/* アイコン内の画像 */
.edit-mode-box .grid .machine-conveyor-label img,
.edit-mode-box .grid .machine-pipe-label img {
    aspect-ratio: 1;
    height: 100%;
    mix-blend-mode: screen;
}
/* 設備アイコン */
.edit-mode-box .grid .machine-icon-label {
    grid-area: icon-machine;
}
.edit-mode-box .grid .machine-icon-label img {
    aspect-ratio: 1;
    width: 32px;
    height: 32px;
    border: 3px solid var(--dark-main-color);
    border-radius: 4px;
}
/* 参照数 */
.edit-mode-box .grid .reference-label {
    grid-area: label8;
}
.edit-mode-box .grid .reference-box {
    grid-area: reference;
}
</style>