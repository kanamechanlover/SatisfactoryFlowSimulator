<template>
    <div class="material-section-frame">
        <p>
            このセクションでは素材を定義します。<br />
            右の「-」で設備削除、下部の「＋」で設備追加できます。
        </p>
        <table>
            <tr>
                <th class="no">No</th>
                <th>素材ID</th>
                <th>素材名</th>
                <th class="icon"></th>
                <th class="state">状態</th>
                <th>カテゴリ</th>
                <th class="reference">参照数</th>
                <th class="delete"></th>
            </tr>
            <tr v-for="(material, index) in materials" :key="index">
                <td>{{ index + 1 }}</td>
                <td>
                    <input type="text" :value="material.id"
                        @change="changeId(index, $event)" :class="{ error: idError(index) }" />
                    </td>
                <td>
                    <input type="text" :value="material.name"
                        @change="changeName(index, $event)" :class="{ error: nameError(index) }" />
                </td>
                <td>
                    <img v-if="imageStore.getData(material.id)"
                        :src="imageStore.getData(material.id)"
                        :title="imageStore.getData(material.id)" />
                </td>
                <td>
                    <MaterialStateSelect :modelValue="material.state"
                        @update:modelValue="changeState(index, $event)" :isError="stateError(index)">
                    </MaterialStateSelect>
                </td>
                <td>
                    <CategorySelect
                        :value="material.category" :categories="categories"
                        @update:modelValue="changeCategory(index, $event)" :isError="categoryError(index)">
                    </CategorySelect>
                </td>
                <td>{{ referenceMaterial(material.id) }}</td>
                <td><button @click="deleteMaterial(index)" title="削除">-</button></td>
            </tr>
        </table>
        <div class="additional-box">
            <button class="additional-button" @click="addMaterial" title="追加">＋</button>
        </div>
    </div>
</template>

<script setup lang="ts">

import { computed, ref, watch, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useImageStore } from '@/stores/image_store';
import { ConfigMaterialList, CategoryList } from '@/defines/types/config'

// 子コンポーネント ---------------------------------------------

import CategorySelect from '@/components/config_editor/CategorySelect.vue';
import MaterialStateSelect from '@/components/config_editor/MaterialStateSelect.vue';

// 外部連携 -----------------------------------------------------

// 内部定義 -----------------------------------------------------

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 画像ストア */
const imageStore = useImageStore();

/** 素材リスト */
const materials = ref([] as ConfigMaterialList);

/** 素材カテゴリリスト */
const categories = ref([] as CategoryList);

// 内部関数 -----------------------------------------------------

/** 内部レシピ更新時 */
const applyMaterialData = function(index: number) {
    configStore.setMaterial(index, materials.value[index]);
};

// Getters -----------------------------------------------------

/** 素材参照数 */
const referenceMaterial = computed(() => {
    return (materialId: string): number => {
        const recipes = configStore.config.recipes.filter((recipe) => {
            const includeInput = recipe.input.map((v) => v).some((v) => v.id == materialId);
            const includeOutput = recipe.output.map((v) => v).some((v) => v.id == materialId);
            return includeInput || includeOutput;
        });
        return recipes.length;
    };
});

/** 素材IDエラー */
const idError = computed(() => (index: number): boolean => {
    return materials.value[index].hasIdError();
});
/** 素材名エラー */
const nameError = computed(() => (index: number): boolean => {
    return materials.value[index].hasNameError();
});
/** 素材の状態エラー */
const stateError = computed(() => (index: number): boolean => {
    return materials.value[index].hasStateError();
});
/** カテゴリIDエラー */
const categoryError = computed(() => (index: number): boolean => {
    return materials.value[index].hasCategoryError();
});

// Actions -----------------------------------------------------

/** ストアから最新の素材リストを取得 */
const getMaterials = () => {
    materials.value = configStore.config.materials.map((material) => material.clone());
    categories.value = configStore.config.materialCategories.map((category) => category.clone());
};


/** 素材追加 */
const addMaterial = () => {
    configStore.addMaterial();
};
/** 素材削除 */
const deleteMaterial = (index: number) => {
    configStore.deleteMaterial(index);
};
/** 
 * 素材ID変更
 * @param index [in] インデックス
 * @param event [in] イベントデータ
 */
const changeId = (index: number, event: Event) => {
    if (!event?.target) return;
    materials.value[index].id = (event.target as HTMLInputElement).value;
    applyMaterialData(index);
};

/** 
 * 素材名変更
 * @param index [in] インデックス
 * @param event [in] イベントデータ
 */
const changeName = (index: number, event: Event) => {
    if (!event?.target) return;
    materials.value[index].name = (event.target as HTMLInputElement).value;
    applyMaterialData(index);
};

/** 
 * 素材の状態変更
 * @param index [in] インデックス
 * @param state [in] 変更後の値
 */
const changeState = (index: number, state: string) => {
    materials.value[index].state = state;
    applyMaterialData(index);
};

/** 
 * 素材の状態変更
 * @param index [in] インデックス
 * @param categoryId [in] 変更後の値
 */
const changeCategory = (index: number, categoryId: string) => {
    materials.value[index].category = categoryId;
    applyMaterialData(index);
};


// サイクル -----------------------------------------------------

onMounted(() => {
    getMaterials();
});

// 監視 --------------------------------------------------------

configStore.$subscribe(() => {
    // 更新が終わったらタイミングでストアの値で内部情報を更新
    if(configStore.isUpdating) return;
    getMaterials();
});


</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
table {
    width: 100%;
}
th.icon {
    width: 30px;
}
th.state {
    width: 5em;
}
</style>