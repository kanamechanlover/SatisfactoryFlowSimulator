<template>
    <div class="frame-flow-view">
        <div class="main-box">
            <div class="machine-box">
                <img :src="machineSvg" :title="`${machineName} ${needsRate}%`" />
                <div class="needs-rate" v-if="existsRecipe">{{ Math.floor(needsRate) }}%</div>
            </div>
            <div class="material-img-box">
                <img :src="materialImg" :title="materialName" />
            </div>
            <div class="info-box">
                <div class="material-box">
                    <div class="material-name">
                        {{ materialName }}
                    </div>
                    <div class="material-needs">
                        <input :type="needsInputType" :value="needs" @change="onChangedMaterialNeeds" :readonly="!isRootFlow" :tabindex="(isRootFlow) ? 0: -1" />
                        <span>/分</span>
                    </div>
                </div>
                <div class="recipe-box">
                    <span v-if="existsRecipe">レシピ：</span>
                    <span class="single-recipe-text" v-if="isSingleRecipe" :title="tooltips.SingleRecipe">
                        {{ recipeName }}
                    </span>
                    <CustomDropdown ref="recipeSelector" v-if="!isSingleRecipe">
                        <template #toggle>
                            <div class="recipe-dropdown-toggle" :title="tooltips.RecipeSelect">
                                <span>{{ recipeName }}</span>
                            </div>
                        </template>
                        <RecipeSelectContent :material-id="materialId"
                            @select="onChangeRecipe">
                        </RecipeSelectContent>
                    </CustomDropdown>
                </div>
                <div class="byproduct-box" v-if="byproductName">
                    <span>副産物：{{ byproductName }} {{ byproductNeeds }} /分</span>
                    <img :src="byproductImg" :title="byproductName" />
                </div>
            </div>
        </div>
        <ul class="input-material-box">
            <li v-for="material in materialFlows" :key="material.materialId">
                <FlowView :flow-path="materialFlowPath(material)" :product-index="props.productIndex"></FlowView>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">

import { ref, computed } from 'vue'
import { useFlowStore } from '@/stores/flow_store'
import { useConfigStore } from '@/stores/config_store'
import { useImageStore } from '@/stores/image_store'
import { FlowPath, Flow } from '@/defines/types/flow'
import { ConfigRecipe } from '@/defines/types/config'
import { RoundDigit } from '@/logics/primitives'

// 子コンポーネント ---------------------------------------------

import CustomDropdown from '@/components/generic/CustomDropdown.vue'
import RecipeSelectContent from '@/components/RecipeSelectContent.vue'

// 外部連携 -----------------------------------------------------

/** プロパティを定義 */
const props = defineProps({
    /** 製品インデックス */
    productIndex: {
        type: Number,
        default: 0,
    },
    /** 製作フローパス */
    flowPath: {
        type: String,
        default: '',
    }
});

// 内部定義 -----------------------------------------------------

// ツールチップ文言一覧
const tooltips = {
    RecipeSelect: 'この素材の製作レシピを選択します',
    SingleRecipe: 'この素材を製作する代替レシピはありません。',
} as const;

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 製作フローストア */
const flowStore = useFlowStore();

/** 画像ストア */
const imageStore = useImageStore();

/** 製作フローパス */
const flowPath = ref(new FlowPath(props.flowPath));

/** レシピ選択ドロップダウン */
const recipeSelector = ref<typeof CustomDropdown|undefined>(undefined);

// 内部関数 -----------------------------------------------------

const getFlow = computed(() => {
    return flowStore.flowOnPath(props.productIndex, flowPath.value);
});

/**
 * 値を小数点以下6桁までの文字列に丸める
 * @param value [in] 元の値
 * @return 丸めた値の文字列
 */
 const CielDigitToString = (value: number): string => {
    const ceiledValue = RoundDigit(value, 6);
    const isMinimalError = ceiledValue - Math.floor(ceiledValue) <= 0.000001; // 0.000001 以下はさらに丸める
    return (isMinimalError) ? Math.floor(ceiledValue).toString() : ceiledValue.toString();
};

// Getters -----------------------------------------------------

const existsRecipe = computed((): boolean => {
    if (!getFlow.value?.materialId) return false;
    return configStore.recipesHasOutputMaterialId(getFlow.value.materialId).length > 0;
});
/** 素材ID */
const materialId = computed((): string => {
    if (!getFlow.value?.materialId) return '';
    return getFlow.value.materialId;
});
/** 素材名 */
const materialName = computed((): string => {
    if (!getFlow.value?.materialId) return '';
    return configStore.materialName(getFlow.value.materialId);
});
/** 素材画像 */
const materialImg = computed((): string => {
    if (!getFlow.value?.materialId) return '';
    return imageStore.getData(getFlow.value.materialId);
});
/** レシピID */
const recipeId = computed((): string => {
    if (!getFlow.value?.recipeId) return '';
    return getFlow.value?.recipeId;
});
/** レシピ名 */
const recipeName = computed((): string => {
    if (!getFlow.value?.recipeId) return '';
    return configStore.recipeName(getFlow.value.recipeId);
});
/** レシピが一つしかない素材か */
const isSingleRecipe = computed((): boolean => {
    if (!getFlow.value?.materialId) return false;
    const recipes = configStore.recipesHasOutputMaterialId(getFlow.value.materialId);
    return recipes.length == 1;
});
/** 生産レート(%) */
const needsRate = computed((): number => {
    if (!getFlow.value?.needsRate) return 100;
    return getFlow.value.needsRate * 100;
});
/** 設備ID */
const machineId = computed((): string => {
    if (!getFlow.value?.machineId) return '';
    return getFlow.value.machineId;
});
/** 設備画像 */
const machineSvg = computed((): string => {
    if (!getFlow.value?.machineId) {
        // 設備が無い場合は手採取用のアイコンにする
        return imageStore.getData('Hand');
    }
    return imageStore.getData(getFlow.value.machineId);
});
/** 設備名 */
const machineName = computed((): string => {
    if (!getFlow.value?.machineId) {
        // 設備が無い場合は手採取用のアイコンにする
        return '手採取';
    }
    return configStore.machineName(getFlow.value.machineId);
});
/** ルートフローか */
const isRootFlow = computed((): boolean => {
    if (!getFlow.value?.isRootFlow) return false;
    return getFlow.value.isRootFlow;
});
/** 必要数 */
const needs = computed((): string => {
    if (!getFlow.value?.needs) return "0";
    return CielDigitToString(getFlow.value.needs);
});
/** 必要数の入力タイプ（ルートフローだけ数値として入力可能） */
const needsInputType = computed((): string => {
    return (getFlow.value?.isRootFlow) ? 'number': 'text';
});
/** 入力素材の製作フロー */
const materialFlows = computed((): Array<Flow> => {
    if (!getFlow.value?.materialFlows) return [];
    return getFlow.value.materialFlows;
});
/** 副産物名 */
const byproductName = computed((): string => {
    const byproductId = getFlow.value?.byproductId;
    if (!byproductId) return '';
    const name = configStore.materialName(byproductId);
    return name;
});
/** 副産物の生産数 */
const byproductNeeds = computed((): string => {
    if (!getFlow.value?.byproductNeeds) return '';
    return CielDigitToString(getFlow.value.byproductNeeds);
});
/** 副産物の画像 */
const byproductImg = computed((): string => {
    if (!getFlow.value?.byproductId) return '';
    return imageStore.getData(getFlow.value.byproductId);
});

// Actions -----------------------------------------------------

/** 入力素材のパスを取得 */
const materialFlowPath = (flow: Flow) => {
    if (!props.flowPath.length) return flow.materialId;
    return [props.flowPath, flow.materialId].join(',');
};
/** 素材の必要数が変更された時のコールバック */
const onChangeRecipe = (recipeId: string) => {
    // 製作フローストア更新
    flowStore.setRecipeId(props.productIndex, new FlowPath(props.flowPath), recipeId);
    // レシピ選択ドロップダウンを閉じる
    if (recipeSelector.value) {
        recipeSelector.value.close();
    }
};
/** 素材の必要数が変更された時のコールバック */
const onChangedMaterialNeeds = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    // 製作フローストア更新
    flowStore.setNeeds(props.productIndex, new FlowPath(props.flowPath), parseFloat(event.target.value));
};

// サイクル -----------------------------------------------------


</script>

<style scoped>
input, select {
    min-width: 5em;
}
.frame-flow-view {
    width: 100%;
    display: flex;
    flex-direction: column;
    color: white;
    white-space: nowrap;
}
.main-box {
    display: flex;
    background: var(--symbolic-color);
    border: 1px solid wheat;
    border-radius: 8px;
    padding: 4px;
    gap: 4px;
}
.main-box .machine-box {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid white;
    border-radius: 4px;
    position: relative;
    width: 2em;
    height: 2em;
    min-width: 2em;
}
.main-box .machine-box img {
    mix-blend-mode: screen;
    border-radius: 4px;
    width: 100%;
    height: 100%;
}
.main-box .needs-rate {
    position: absolute;
    top: -0.5em;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.5em;
    font-weight: bold;
    color: white;
    line-height: 1em;
    background: var(--symbolic-color);
    border-radius: 4px;
    padding: 0px 1px;
}
.main-box .material-img-box {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid white;
    border-radius: 4px;
    width: 2em;
    height: 2em;
    min-width: 2em;
}
.main-box .material-img-box img {
    border-radius: 4px;
    width: 100%;
    height: 100%;
}
.main-box .info-box {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    gap: 2px;
}
.main-box .info-box .material-box {
    display: flex;
    align-items: left;
    justify-content: center;
    font-size: 0.7em;
    line-height: 1em;
    gap: 4px;
}
.main-box .info-box .material-box .material-name {
    font-weight: bold;
    background: white;
    color: var(--symbolic-color);
    border-radius: 4px;
    padding: 4px;
}
.main-box .info-box .material-box .material-needs {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}
.main-box .info-box .material-box .material-needs input {
    display: table-cell;
    border: none;
    border-bottom: 1px solid gray;
    background: transparent;
    max-width: 5em;
    min-width: 1em;
    height: 1em;
    text-align: right;
    white-space: nowrap;
    padding: 0px 4px;
}
.main-box .info-box .material-box .material-needs input[readonly] {
    border-bottom: none;
    pointer-events: none;
}
.main-box .info-box .recipe-box {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7em;
    line-height: 0.8em;
}
.main-box .info-box .recipe-box select {
    border: none;
    border-bottom: 1px solid gray;
    background: transparent;
    font-size: 1em;
}
.main-box .info-box .recipe-box select option {
    background: var(--symbolic-color);
}
.main-box .info-box .recipe-box select option:hover {
    background-color: linear-gradient(bisque, bisque);
}
.main-box .info-box .recipe-box .single-recipe-text {
    border: 1px solid var(--dark-light-color);
    border-radius: 4px;
    line-height: 1em;
    padding: 2px 4px;
    cursor: pointer;
}
.main-box .info-box .recipe-box .recipe-dropdown-toggle {
    border: 1px solid var(--dark-light-color);
    border-radius: 4px;
    padding: 2px 24px 2px 4px;
    line-height: 1em;
    cursor: pointer;
    position: relative;
}
.main-box .info-box .recipe-box .recipe-dropdown-toggle::after {
    display: block;
    width: 1em;
    height: 1em;
    content: ">";
    font-weight: bold;
    position: absolute;
    top: 50%;
    right: 0px;
    transform: rotate(90deg) translateX(-50%) translateY(4px);
}
.main-box .info-box .byproduct-box {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7em;
    line-height: 0.8em;
    margin-top: 2px;
    position: relative;
}
.main-box .info-box .byproduct-box img {
    position: absolute;
    left: calc(-1.2em - 6px);
    bottom: -1px;
    width: 1.2em;
    height: 1.2em;
    border: 1px solid white;
    border-radius: 4px;
}

ul.input-material-box {
    list-style: none;
    padding-left: 32px;
    margin: 0px;
    margin-top: 4px;
    position: relative;
}
ul.input-material-box::before {
    content: "";
    position: absolute;
    left: 12px;
    top: 0px;
    height: calc(100% - 4px);
    width: 1px;
    background: white;
}
</style>