<template>
    <div class="frame">
        <div class="header">
            <span class="title">設定エディタ</span>
            <button class="close-button" @click="closeWindow">x</button>
        </div>
        <div class="main">
            <section class="io-box">
                <button>インポート</button>
                <button>エクスポート</button>
            </section>
            <hr />
            <ConfigEditorSection section-name="バージョン">
                <input type="text" v-model="config.version" />
            </ConfigEditorSection>
            <ConfigEditorSection section-name="設備カテゴリ" :item-count="config.machineCategories.length">
                <table>
                    <tr>
                        <th>No</th>
                        <th width="*">設備カテゴリID</th>
                        <th width="*">設備カテゴリ名</th>
                        <th>参照数</th>
                        <th></th>
                    </tr>
                    <tr v-for="(category, index) in config.machineCategories" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <input type="text" v-model="category.id" />
                        </td>
                        <td>
                            <input type="text" v-model="category.name" />
                        </td>
                        <td>{{ referenceMachineCategory(category.id) }}</td>
                        <td><button @click="deleteMachineCategory(index)" title="削除">-</button></td>
                    </tr>
                </table>
                <div class="additional-box">
                    <button class="additional-button" @click="addMachineCategory" title="追加">＋</button>
                </div>
            </ConfigEditorSection>
            <ConfigEditorSection section-name="素材カテゴリ" :item-count="config.materialCategories.length">
                <table>
                    <tr>
                        <th>No</th>
                        <th width="*">素材カテゴリID</th>
                        <th width="*">素材カテゴリ名</th>
                        <th>参照数</th>
                        <th></th>
                    </tr>
                    <tr v-for="(category, index) in config.materialCategories" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <input type="text" v-model="category.id" />
                        </td>
                        <td>
                            <input type="text" v-model="category.name" />
                        </td>
                        <td>{{ referenceMaterialCategory(category.id) }}</td>
                        <td><button @click="deleteMaterialCategory(index)" title="削除">-</button></td>
                    </tr>
                </table>
                <div class="additional-box">
                    <button class="additional-button" @click="addMaterialCategory" title="追加">＋</button>
                </div>
            </ConfigEditorSection>
            <ConfigEditorSection section-name="設備" :item-count="config.machines.length">
                <table v-for="(machine, index) in config.machines" :key="index">
                    <tr class="adjustment">
                        <td class="index" rowspan="5">{{ index + 1 }}</td>
                        <td></td>
                        <td width="35%"></td>
                        <td></td>
                        <td width="1*"></td>
                        <td width="1*"></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <th>設備ID</th>
                        <td>
                            <input type="text" v-model="machine.id" />
                        </td>
                        <th>設備名</th>
                        <td colspan="2">
                            <input type="text" v-model="machine.name" />
                        </td>
                        <th>参照数</th>
                        <td class="delete-box" rowspan="4"><button @click="deleteMachine(index)" title="削除">-</button></td>
                    </tr>
                    <tr>
                        <th>ティア</th>
                        <td>
                            <input type="number" v-model="machine.tier" />
                        </td>
                        <td><img :src="machineIconPath(machine.id)" :title="machineIconPath(machine.id)" /></td>
                        <th>コンベア</th>
                        <th>パイプ</th>
                        <td rowspan="3">{{ referenceMachine(machine.id) }}</td>
                    </tr>
                    <tr>
                        <th>カテゴリ</th>
                        <td>
                            <MachineCategorySelect v-model="machine.category"></MachineCategorySelect>
                        </td>
                        <th>入力口数</th>
                        <td>
                            <input type="number" v-model="machine.inputNumber.conveyor" />
                        </td>
                        <td>
                            <input type="number" v-model="machine.inputNumber.pipe" />
                        </td>
                    </tr>
                    <tr>
                        <th>電力</th>
                        <td>
                            <input type="number" v-model="machine.power" />
                        </td>
                        <th>出力口数</th>
                        <td>
                            <input type="number" v-model="machine.outputNumber.conveyor" />
                        </td>
                        <td>
                            <input type="number" v-model="machine.outputNumber.pipe" />
                        </td>
                    </tr>
                </table>
                <div class="additional-box">
                    <button class="additional-button" @click="addMachine" title="追加">＋</button>
                </div>
            </ConfigEditorSection>
            <ConfigEditorSection section-name="素材" :item-count="config.materials.length">
                <table>
                    <tr>
                        <th>No</th>
                        <th width="*">素材ID</th>
                        <th width="*">素材名</th>
                        <th></th>
                        <th width="*">状態</th>
                        <th width="*">カテゴリID</th>
                        <th>参照数</th>
                        <th></th>
                    </tr>
                    <tr v-for="(material, index) in config.materials" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <input type="text" v-model="material.id" />
                            </td>
                        <td>
                            <input type="text" v-model="material.name" />
                        </td>
                        <td>
                            <img :src="materialImgPath(material.id)" :title="materialImgPath(material.id)" />
                        </td>
                        <td>
                            <MaterialStateSelect v-model="material.state"></MaterialStateSelect>
                        </td>
                        <td>
                            <MaterialCategorySelect v-model="material.category"></MaterialCategorySelect>
                        </td>
                        <td>{{ referenceMaterial(material.id) }}</td>
                        <td><button @click="deleteMaterial(index)" title="削除">-</button></td>
                    </tr>
                </table>
                <div class="additional-box">
                    <button class="additional-button" @click="addMaterial" title="追加">＋</button>
                </div>
            </ConfigEditorSection>
            <ConfigEditorSection section-name="レシピ" :item-count="config.machines.length">
                <ConfigRecipe v-for="(recipe, index) in config.recipes" :key="recipe.name" :index="index"></ConfigRecipe>
                <div class="additional-box">
                    <button class="additional-button" @click="addMachine" title="追加">＋</button>
                </div>
            </ConfigEditorSection>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { Config, ConfigCategory, ConfigMachine, MaterialState, ConfigMaterial } from '@/defines/types/config'
import { machineIconPath, materialImgPath } from '@/logics/access_path'
import ConfigEditorMaterialState from './MaterialStateSelect.vue';


/** プロパティを定義 */
const Props = {
};

/** テンプレート参照する定義 */
interface Refs {
    frame: Ref<HTMLElement|null>,
}

export default defineComponent({
    name: "config-editor",
    props: Props,
    setup(props, context) {
        const configStore = useConfigStore();
        const refs: Refs = {
            frame: ref(null),
        };

        const getMaterial = (materialId: string): ConfigMaterial|undefined => {
            return configStore.config.materials.find((material) => material.id == materialId);
        };

        // computed
        const computes = {
            config: computed((): Config => {
                return configStore.config;
            }),
            /** 設備カテゴリ参照数 */
            referenceMachineCategory: computed(() => {
                return (id: string): number => {
                    const machines = configStore.config.machines.filter((machine) => machine.category == id);
                    return machines.length;
                };
            }),
            /** 素材カテゴリ参照数 */
            referenceMaterialCategory: computed(() => {
                return (id: string): number => {
                    const material = configStore.config.materials.filter((material) => material.category == id);
                    return material.length;
                };
            }),
            /** 設備アイコンパス */
            machineIconPath: computed(() => {
                return (id: string): string => {
                    return machineIconPath(id);
                };
            }),
            /** 素材画像パス */
            materialImgPath: computed(() => {
                return (id: string): string => {
                    return materialImgPath(id);
                };
            }),
            /** 設備の参照数 */
            referenceMachine: computed(() => {
                return (machineId: string): number => {
                    const recipes = configStore.config.recipes.filter((recipe) => {
                        return recipe.machineId == machineId;
                    });
                    return recipes.length;
                };
            }),
            /** 素材の状態 */
            materialState: computed((): any => {
                return MaterialState;
            }),
            /** 素材参照数 */
            referenceMaterial: computed(() => {
                return (materialId: string): number => {
                    const recipes = configStore.config.recipes.filter((recipe) => {
                        const includeInput = Object.keys(recipe.input).includes(materialId);
                        const includeOutput = Object.keys(recipe.output).includes(materialId);
                        return includeInput || includeOutput;
                    });
                    return recipes.length;
                }
            }),
        };
        // methods
        const methods = {
            /** 設定エディタを閉じる */
            closeWindow: () => {
                context.emit("close");
            },
            /** バージョン更新 */
            changeVersion: (value: string) => {
                configStore.config.version = value;
            },
            /** 設備カテゴリID更新 */
            changeMachineCategory: (index: number, id: string, name: string) => {
                const category = configStore.config.machineCategories[index];
                if (!category)
                    return; // インデックスオーバーしている場合は何もしない（できない）
                if (category.id != id && id !== undefined) {
                    configStore.config.machineCategories[index].id = id;
                }
                if (category.name != name && name !== undefined) {
                    configStore.config.machineCategories[index].name = name;
                }
            },
            /** 設備カテゴリ削除 */
            deleteMachineCategory: (index: number) => {
                configStore.config.machineCategories.splice(index, 1);
            },
            /** 設備カテゴリ追加 */
            addMachineCategory: () => {
                configStore.config.machineCategories.push(new ConfigCategory);
            },
            /** 素材カテゴリ削除 */
            deleteMaterialCategory: (index: number) => {
                configStore.config.materialCategories.splice(index, 1);
            },
            /** 素材カテゴリ追加 */
            addMaterialCategory: () => {
                configStore.config.materialCategories.push(new ConfigCategory);
            },
            /** 設備削除 */
            deleteMachine: (index: number) => {
                configStore.config.machines.splice(index, 1);
            },
            /** 設備追加 */
            addMachine: () => {
                configStore.config.machines.push(new ConfigMachine());
            },
            /** 素材追加 */
            addMaterial: () => {
                configStore.config.materials.push(new ConfigMaterial());
            },
            /** 素材削除 */
            deleteMaterial: (index: number) => {
                configStore.config.materials.splice(index, 1);
            },
        };
        return {
            ...props,
            ...refs,
            ...computes,
            ...methods,
        };
    },
    components: { ConfigEditorMaterialState }
});
</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
.frame {
    width: 100%;
    height: 100%;
    background: var(--dark-bg-color);
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid black;
    border-radius: 8px;
}
.header {
    position: relative;
    height: 24px;
    font-weight: bold;
    color: white;
    background: black;
}
.header .close-button {
    height: 20px;
    padding: 0px 8px;
    border: 1px solid black;
    background: white;
    color: black;
    position: absolute;
    top: 50%;
    right: 4px;
    transform: translateY(-50%);
}
.header .close-button:hover {
    background: orange;
}

.main {
    flex: 1;
    padding: 4px;
    overflow-x: hidden;
    overflow-y: scroll;
}
.main section.io-box {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
}
.main section .additional-box {
    text-align: center;
}

.main hr {
    border-style: dashed;
}
</style>