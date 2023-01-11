<template>
    <div class="frame">
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
                    <select @change="onChangedRecipe" v-if="existsRecipe">
                        <option v-for="recipe in recipeList" :key="recipe" :selected="recipe === recipeName">
                            {{ recipe }}
                        </option>
                    </select>
                </div>
                <div class="byproduct-box" v-if="byproductName">
                    <span>副産物：{{ byproductName }} {{ byproductNeeds }} /分</span>
                    <img :src="byproductImg" :title="byproductName" />
                </div>
            </div>
        </div>
        <ul class="input-material-box">
            <li v-for="material in materialFlows" :key="material.materialId">
                <FlowView :flow-path="materialFlowPath(material)"></FlowView>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed, inject, watchEffect } from 'vue'
import { FlowPath, Flow } from '@/defines/types/flow'
import { useFlowStore } from '@/stores/flow_store'
import { useConfigStore } from '@/stores/config_store'
import { CeilDigit } from '@/logics/primitives'


/** プロパティを定義 */
const Props = {
    /** 制作フローパス */
    flowPath: {
        type: String,
        default: '',
    }
};

/** テンプレート参照する定義 */
interface Refs {
    frame: Ref<HTMLElement|null>,
}

export default defineComponent({
    name: 'flow-view',
    props: Props,
    setup(props) {
        const flowStore = useFlowStore();
        const configStore = useConfigStore();
        const flowPath = ref(new FlowPath(props.flowPath));
        const getFlow = computed(() => {
            return flowStore.flowOnPath(flowPath.value);
        });
        const refs: Refs = {
            frame: ref(null),
        };

        // 素材画像パス
        const materialImgPath = (id: string) => {
            return '/public/assets/materials/' + id + '.png';
        }
        // 設備画像パス
        const machineImgPath = (id: string) => {
            return '/public/assets/icons/' + id + '.svg';
        }

        // computed
        const computes = {
            flow: getFlow,
            existsRecipe: computed((): boolean => {
                if (!getFlow.value?.materialId) return false;
                return configStore.recipeNamesHasOutputMaterialId(getFlow.value?.materialId).length > 0;
            }),
            /** 素材名 */
            materialName: computed((): string => {
                if (!getFlow.value?.materialId) return '';
                return configStore.materialName(getFlow.value?.materialId);
            }),
            /** 素材画像 */
            materialImg: computed((): string => {
                if (!getFlow.value?.materialId) return '';
                return materialImgPath(getFlow.value?.materialId);
            }),
            /** レシピ名 */
            recipeName: computed((): string => {
                if (!getFlow.value?.recipeId) return '';
                return getFlow.value?.recipeId;
            }),
            /** レシピ名リスト */
            recipeList: computed((): Array<string> => {
                if (!getFlow.value?.materialId) return [];
                return configStore.recipeNamesHasOutputMaterialId(getFlow.value?.materialId);
            }),
            /** 生産レート(%) */
            needsRate: computed((): number => {
                if (!getFlow.value?.needsRate) return 100;
                return getFlow.value?.needsRate * 100;
            }),
            /** 設備ID */
            machineId: computed((): string => {
                if (!getFlow.value?.machineId) return '';
                return getFlow.value?.machineId;
            }),
            /** 設備画像 */
            machineSvg: computed((): string => {
                if (!getFlow.value?.machineId) {
                    // 設備が無い場合は手採取用のアイコンにする
                    return machineImgPath('hand');
                }
                return machineImgPath(getFlow.value?.machineId);
            }),
            /** 設備名 */
            machineName: computed((): string => {
                if (!getFlow.value?.machineId) {
                    // 設備が無い場合は手採取用のアイコンにする
                    return '手採取';
                }
                return configStore.machineName(getFlow.value?.machineId);
            }),
            /** ルートフローか */
            isRootFlow: computed((): boolean => {
                if (!getFlow.value?.isRootFlow) return false;
                return getFlow.value?.isRootFlow;
            }),
            /** 必要数 */
            needs: computed((): number => {
                if (!getFlow.value?.needs) return 0;
                return CeilDigit(getFlow.value?.needs, 6);
            }),
            /** 必要数の入力タイプ（ルートフローだけ数値として入力可能） */
            needsInputType: computed((): string => {
                return (getFlow.value?.isRootFlow) ? 'number': 'text';
            }),
            /** 入力素材の制作フロー */
            materialFlows: computed((): Array<Flow> => {
                if (!getFlow.value?.materialFlows) return [];
                return getFlow.value?.materialFlows;
            }),
            /** 副産物名 */
            byproductName: computed((): string => {
                const byproductId = getFlow.value?.byproductId;
                if (!byproductId) return '';
                const name = configStore.materialName(byproductId);
                return name;
            }),
            /** 副産物の生産数 */
            byproductNeeds: computed((): string => {
                if (!getFlow.value?.byproductNeeds) return '';
                return CeilDigit(getFlow.value?.byproductNeeds, 6).toString();
            }),
            /** 副産物の画像 */
            byproductImg: computed((): string => {
                if (!getFlow.value?.byproductId) return '';
                return materialImgPath(getFlow.value?.byproductId);
            }),
        };

        // methods
        const methods = {
            /** 入力素材のパスを取得 */
            materialFlowPath: (flow: Flow) => {
                if (!props.flowPath.length) return flow.materialId;
                return [props.flowPath, flow.materialId].join(',');
            },
            /** 素材の必要数が変更された時のコールバック */
            onChangedRecipe: (event: Event) => {
                if (!(event.target instanceof HTMLSelectElement)) return;
                // 制作フローストア更新
                flowStore.setRecipeId(new FlowPath(props.flowPath), event.target.value);
            },
            /** 素材の必要数が変更された時のコールバック */
            onChangedMaterialNeeds: (event: Event) => {
                if (!(event.target instanceof HTMLInputElement)) return;
                // 制作フローストア更新
                flowStore.setNeeds(new FlowPath(props.flowPath), parseFloat(event.target.value));
            },
        };

        return {
            ...props,
            ...refs,
            ...computes,
            ...methods,
        };
    },
});
</script>

<style src="@/to_dark_theme.css" scoped />

<style scoped>
.frame {
    width: 100%;
    display: flex;
    flex-direction: column;
    color: white;
}
.main-box {
    display: flex;
    background: orange;
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
    background: orange;
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
    color: orange;
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
    background: orange;
}
.main-box .info-box .recipe-box select option:hover {
    background-color: linear-gradient(bisque, bisque);
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
    left: calc(-1em - 6px);
    top: 50%;
    transform: translateY(-50%);
    width: 1em;
    height: 1em;
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