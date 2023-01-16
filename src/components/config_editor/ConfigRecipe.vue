<template>
    <table>
        <tr class="adjustment">
            <td class="index" rowspan="5">{{ index + 1 }}</td>
            <td></td>
            <td width="30%"></td>
            <td></td>
            <td width="20%"></td>
            <td></td>
            <td></td>
            <td width="20%"></td>
            <td></td>
            <td class="delete-box" rowspan="5" @click="deleteRecipe()" title="削除">
                <span>-</span>
            </td>
        </tr>
        <tr>
            <th rowspan="2">レシピ名</th>
            <td rowspan="2">
                <input type="text" :value="recipeName" @input="changeRecipeName" :title="recipeName" />
            </td>
            <th rowspan="4">入力<br />素材</th>
            <td>
                <MaterialSelect v-if="machineInputPortNumber > 0"
                    :modelValue="materialInputId(0)" :type="machineInputType(0)"
                    @update:modelValue="changeInputMaterialId(0, $event)">
                </MaterialSelect>
            </td>
            <td>
                <input v-if="machineInputPortNumber > 0" type="number"
                    :value="materialInputNumber(0)"
                    @input="changeInputMaterialNumber(0, $event)" />
            </td>
            <th rowspan="4">出力<br />素材</th>
            <td>
                <MaterialSelect v-if="machineOutputPortNumber > 0"
                    :modelValue="materialOutputId(0)" :type="machineOutputType(0)"
                    @update:modelValue="changeOutputMaterialId(0, $event)">
                </MaterialSelect>
            </td>
            <td>
                <input v-if="machineOutputPortNumber > 0" type="number"
                    :value="materialOutputNumber(0)"
                    @input="changeOutputMaterialNumber(0, $event)" />
            </td>
        </tr>
        <tr>
            <td>
                <MaterialSelect v-if="machineInputPortNumber > 1"
                    :modelValue="materialInputId(1)" :type="machineInputType(1)"
                    @update:modelValue="changeInputMaterialId(1, $event)">
                </MaterialSelect>
            </td>
            <td>
                <input v-if="machineInputPortNumber > 1" type="number"
                    :value="materialInputNumber(1)"
                    @input="changeInputMaterialNumber(1, $event)" />
            </td>
            <td>
                <MaterialSelect v-if="machineOutputPortNumber > 1"
                    :modelValue="materialOutputId(1)" :type="machineOutputType(1)"
                    @update:modelValue="changeOutputMaterialId(1, $event)">
                </MaterialSelect>
            </td>
            <td>
                <input v-if="machineOutputPortNumber > 1" type="number"
                    :value="materialOutputNumber(1)"
                    @input="changeOutputMaterialNumber(1, $event)" />
            </td>
        </tr>
        <tr>
            <th>設備</th>
            <td>
                <MachineSelect :modelValue="machineId"
                    @update:modelValue="changeMachineId">
                </MachineSelect>
            </td>
            <td>
                <MaterialSelect v-if="machineInputPortNumber > 2"
                    :modelValue="materialInputId(2)" :type="machineInputType(2)"
                    @update:modelValue="changeInputMaterialId(2, $event)">
                </MaterialSelect>
            </td>
            <td>
                <input v-if="machineInputPortNumber > 2" type="number"
                    :value="materialInputNumber(2)"
                    @input="changeInputMaterialNumber(2, $event)" />
            </td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>製造時間</th>
            <td>
                <input type="number" :value="productTime"
                    @input="changeProductTime" />
            </td>
            <td>
                <MaterialSelect v-if="machineInputPortNumber > 3"
                    :modelValue="materialInputId(3)" :type="machineInputType(3)"
                    @update:modelValue="changeInputMaterialId(3, $event)">
                </MaterialSelect>
            </td>
            <td>
                <input v-if="machineInputPortNumber > 3" type="number"
                    :value="materialInputNumber(3)"
                    @input="changeInputMaterialNumber(3, $event)" />
            </td>
            <td></td>
            <td></td>
        </tr>
    </table>
</template>

<script setup lang="ts">
import { defineProps, ref, computed, watch } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { ConfigRecipe, ConfigRecipeMaterial } from '@/defines/types/config'

/** プロパティを定義 */
const props = defineProps({
    index: {
        type: Number,
        default: 0,
    },
});

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** レシピデータ（内部用） */
const recipe = ref(new ConfigRecipe());

// 内部関数 -----------------------------------------------------

/** レシピ切り替え */
const changeRecipe = () => {
    recipe.value.assign(configStore.config.recipes[props.index]);
};
changeRecipe();

/** 内部レシピ更新時 */
const applyRecipeData = () => {
    configStore.config.recipes[props.index].assign(recipe.value);
};

// Getters -----------------------------------------------------

/** レシピ名 */
const recipeName = computed(() => {
    return recipe.value.name;
});
/** 設備ID */
const machineId = computed(() => {
    return recipe.value.machineId;
});
/** 制作時間 */
const productTime = computed(() => {
    return recipe.value.productTime;
});
/** 入力素材ID */
const materialInputId = computed(() => {
    return (index: number): string => {
        if (recipe.value?.input[index]?.id === undefined) return '';
        return recipe.value.input[index].id;
    };
});
/** 入力素材数 */
const materialInputNumber = computed(() => {
    return (index: number): number => {
        if (recipe.value?.input[index]?.number === undefined) return 0;
        return recipe.value.input[index].number;
    };
});
/** 出力素材ID */
const materialOutputId = computed(() => {
    return (index: number): string => {
        if (recipe.value?.output[index]?.id === undefined) return '';
        return recipe.value.output[index].id;
    };
});
/** 出力素材数 */
const materialOutputNumber = computed(() => {
    return (index: number): number => {
        if (recipe.value?.output[index]?.number === undefined) return 0;
        return recipe.value.output[index].number;
    };
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
const machineInputType = computed(() => {
    return (index: number): string => {
        const portNumber = configStore.machineInputPortNumber(recipe.value.machineId);
        if (index >= portNumber) return '';
        return configStore.machineInputPortType(recipe.value.machineId, index);
    };
});
/** 設備の出力口のタイプ */
const machineOutputType = computed(() => {
    return (index: number): string => {
        const portNumber = configStore.machineOutputPortNumber(recipe.value.machineId);
        if (index >= portNumber) return '';
        return configStore.machineOutputPortType(recipe.value.machineId, index);
    };
});

// Actions -----------------------------------------------------

/** レシピ削除 */
const deleteRecipe = () => {
    configStore.config.recipes.splice(props.index, 1);
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
    // 入力口数に変化があれば補正
    const inputNumber = configStore.machineInputPortNumber(recipe.value.machineId);
    for (let i = 0; i < ConfigRecipe.InputMax; i++) {
        if (i < inputNumber && recipe.value.input[i] === undefined) {
            // 枠が不足していれば作成
            recipe.value.input[i] = new ConfigRecipeMaterial();
        }
        else if (i >= inputNumber && recipe.value.input[i] !== undefined) {
            // 枠が多ければ削除
            delete recipe.value.input[i];
        }
    }
    // 出力口数に変化があれば補正
    const outputNumber = configStore.machineOutputPortNumber(recipe.value.machineId);
    for (let i = 0; i < ConfigRecipe.OutputMax; i++) {
        if (i < outputNumber && recipe.value.output[i] === undefined) {
            // 枠が不足していれば作成
            recipe.value.output[i] = new ConfigRecipeMaterial();
        }
        else if (i >= outputNumber && recipe.value.output[i] !== undefined) {
            // 枠が多ければ削除
            delete recipe.value.output[i];
        }
    }
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
    recipe.value.input[index].id = value;
    applyRecipeData();
};
/** 入力素材数更新 */
const changeInputMaterialNumber = (index: number, event: Event) => {
    if (event?.target === undefined) return;
    recipe.value.input[index].number = Number((event.target as HTMLInputElement).value);
    applyRecipeData();
};
/** 出力素材ID更新 */
const changeOutputMaterialId = (index: number, value: string) => {
    recipe.value.output[index].id = value;
    applyRecipeData();
};
/** 出力素材数更新 */
const changeOutputMaterialNumber = (index: number, event: Event) => {
    if (event?.target === undefined) return;
    recipe.value.output[index].number = Number((event.target as HTMLInputElement).value);
    applyRecipeData();
};

// サイクル -----------------------------------------------------


</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
th {
    user-select: none;
}
.index {
    border-radius: 4px 0px 0px 4px;
}
.delete-box {
    font-weight: bold;
    background: tomato;
    border-radius: 0px 4px 4px 0px;
    user-select: none;
    cursor: pointer;
}
.delete-box:hover {
    font-weight: bold;
    background: red;
    border-radius: 0px 4px 4px 0px;
}
</style>