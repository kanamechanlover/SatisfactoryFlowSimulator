<template>
    <div class="config-editor-frame" ref="frame">
        <div class="updating" v-show="isConfigUpdating">設定更新中</div>
        <div class="header">
            <span class="title">設定エディタ</span>
            <button class="close-button" @click="closeWindow">x</button>
        </div>
        <div class="main">
            <suspense>
                <template #fallback>
                    <div class="loading-box">設定読み込み中...</div>
                </template>
                <template #default>
                    <div class="sections">
                        <p>
                            この画面では本ツールの内部設定を確認・変更できます。<br />
                            <span class="accent">エクスポート</span> ボタンでローカルの設定ファイルを書き出し、
                            <span class="accent">インポート</span> ボタンでローカルの設定ファイルを読み込めます。<br />
                            セクション毎に展開・格納を切り替えられます。
                        </p>
                        <section class="io-box">
                            <!-- ファイル選択ダイアログ表示用ボタン -->
                            <button @click="onClickImportFile" title="ローカルの設定ファイルを選択します">インポート</button>
                            <button @click="onClickExportFile" title="ローカルに設定ファイルを書き出します">エクスポート</button>
                        </section>
                        <hr />
                        <ConfigEditorSection section-name="画像データ"
                            :item-count="sectionNumbers.image">
                            <ImageSection></ImageSection>
                        </ConfigEditorSection>
                        <ConfigEditorSection section-name="バージョン" :has-error="versionError">
                            <p>任意のバージョン名を付けることができます。バージョン名はページ上部のツール名の隣に表示されます。</p>
                            <input type="text" :value="config.version" @change="changeVersion" :class="{ error: versionError }" />
                        </ConfigEditorSection>
                        <ConfigEditorSection section-name="設備カテゴリ"
                            :item-count="sectionNumbers.machineCategories"
                            :has-error="machineCategoriesError">
                            <MachineCategorySection></MachineCategorySection>
                        </ConfigEditorSection>
                        <ConfigEditorSection section-name="素材カテゴリ"
                            :item-count="sectionNumbers.materialCategories"
                            :has-error="materialCategoriesError">
                            <MaterialCategorySection></MaterialCategorySection>
                        </ConfigEditorSection>
                        <ConfigEditorSection section-name="設備"
                            :item-count="sectionNumbers.machines"
                            :has-error="machinesError">
                            <ConfigMachineSection></ConfigMachineSection>
                        </ConfigEditorSection>
                        <ConfigEditorSection section-name="素材"
                            :item-count="sectionNumbers.materials"
                            :has-error="materialsError">
                            <MaterialSection></MaterialSection>
                        </ConfigEditorSection>
                        <ConfigEditorSection section-name="レシピ"
                            :item-count="sectionNumbers.recipes"
                            :has-error="recipesError">
                            <ConfigRecipeSection></ConfigRecipeSection>
                        </ConfigEditorSection>
                        <!-- 設定ファイル読み込み時のファイル選択ダイアログ表示用フォーム -->
                        <input class="hide" ref="importFilePicker" type="file" accept=".json" @change="onSelectedImportFile" />
                    </div>
                </template>
            </suspense>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useImageStore } from '@/stores/image_store'
import { Config } from '@/defines/types/config'
import Axios from 'axios'
import Logger from '@/logics/logger'

// 子コンポーネント ---------------------------------------------

import ImageSection from '@/components/config_editor/ImageSection.vue'
import ConfigEditorSection from '@/components/config_editor/ConfigEditorSection.vue'
import MachineCategorySection from '@/components/config_editor/MachineCategorySection.vue'
import MaterialCategorySection from '@/components/config_editor/MaterialCategorySection.vue'
import ConfigMachineSection from '@/components/config_editor/ConfigMachineSection.vue'
import MaterialSection from '@/components/config_editor/MaterialSection.vue'
import ConfigRecipeSection from '@/components/config_editor/ConfigRecipeSection.vue'

// 基本定義 -----------------------------------------------------

/** プロパティを定義 */

// エミット
const emits = defineEmits<{
    (e: 'close'): void
}>();

/** 各セクションの要素数セット */
interface SectionNumbers {
    /** 画像データ */
    image: number;
    /** 設備カテゴリ */
    machineCategories: number;
    /** 素材カテゴリ */
    materialCategories: number;
    /** 設備 */
    machines: number;
    /** 素材 */
    materials: number;
    /** レシピ */
    recipes: number;
};

// 内部変数 -----------------------------------------------------

/** 設定ストア */
const configStore = useConfigStore();

/** 画像ストア */
const imageStore = useImageStore();

/** ファイル選択ダイアログ表示用参照要素 */
const frame = ref(null);
const importFilePicker = ref<InstanceType<typeof HTMLInputElement> | null>(null);

// 内部関数 -----------------------------------------------------

// Getters -----------------------------------------------------

/** 設定取得 */
const config = computed((): Config => configStore.config);

/** 各セクションの要素数を取得 */
const sectionNumbers = computed((): SectionNumbers => {
    return {
        image: imageStore.imageNumber,
        machineCategories: configStore.config.machineCategories.length,
        materialCategories: configStore.config.materialCategories.length,
        machines: configStore.config.machines.length,
        materials: configStore.config.materials.length,
        recipes: configStore.config.recipes.length,
    };
});

/** 設定ストア更新中 */
const isConfigUpdating = computed((): boolean => {
    return configStore.isUpdating;
});

/** 設定バージョンエラー */
const versionError = computed((): boolean => {
    return configStore.config.versionError();
});
/** 設備カテゴリエラー */
const machineCategoriesError = computed((): boolean => {
    return configStore.config.machineCategoriesError();
});
/** 素材カテゴリエラー */
const materialCategoriesError = computed((): boolean => {
    return configStore.config.materialCategoriesError();
});
/** 設備エラー */
const machinesError = computed((): boolean => {
    return configStore.config.machinesError();
});
/** 素材エラー */
const materialsError = computed((): boolean => {
    return configStore.config.materialsError();
});
/** レシピエラー */
const recipesError = computed((): boolean => {
    return configStore.config.recipesError();
});

// Actions -----------------------------------------------------

/** インポートボタンクリック時 */
const onClickImportFile = () => {
    // ファイル選択ダイアログ表示
    importFilePicker.value?.click();
}
/** エクスポートボタンクリック時 */
const onClickExportFile = () => {
    // シリアライズ
    Logger.log('config data serializing...');
    const data = configStore.config.serialize();
    const text = JSON.stringify(data, null, 4);
    // 書き出し
    if (!frame.value) return; // イレギュラー
    const frameElement = (frame.value as HTMLDivElement);
    Logger.log('config file exporting...');
    const blob = new Blob([text], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sfsconfig.json';
    frameElement.appendChild(link);
    link.click();
    frameElement.removeChild(link);
    URL.revokeObjectURL(link.href);
}

/** 設定ファイルをインポート */
const onSelectedImportFile = () => {
    if (!importFilePicker.value || !importFilePicker.value.files) return; // イレギュラー
    const selectedFilePath = importFilePicker.value.files[0];
    if (selectedFilePath === undefined) return; // イレギュラー
    // ファイル読み込み
    const blob = URL.createObjectURL(selectedFilePath);
    console.log(selectedFilePath);
    Axios.get(blob).then((responce: any) => {
        Logger.log(responce.data);
        if (!responce.data) {
            alert('Error: ファイルの中身がありません。');
            return;
        }
        // 設定ストアに反映
        configStore.setup(responce.data);
        // 通知
        alert('Succeeded: 設定に反映しました。');
    }).catch(Logger.error);
    // 後処理
    importFilePicker.value.value = '';
}

/** 設定エディタを閉じる */
const closeWindow = () => {
    if (configStore.config.existError()) {
        // 設定のエラーが出ている場合は本当に閉じてよいか確認し、キャンセルされたら閉じない
        const confirmText = [
            '設定にエラーがまだ残っています。',
            'このまま閉じる場合、本ツールの動作は保障されません。',
        ].join('\n');
        if (!confirm(confirmText)) return;
    }
    emits("close");
};

/**
 * バージョン変更
 */
const changeVersion = (event: Event) => {
    if (!event?.target) return; // イレギュラー
    const value = (event.target as HTMLInputElement).value;
    configStore.changeVersion(value);
};

</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
.config-editor-frame {
    width: 100%;
    height: 100%;
    background: var(--dark-bg-color);
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid black;
    border-radius: 8px;
}
.updating {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background: var(--dark-bg-color);
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.8;
    z-index: 1;
    font-size: 5em;
    color: var(--dark-accent-color);
}
.header {
    position: relative;
    height: 24px;
    font-weight: bold;
    color: white;
    background: black;
    border-radius: 8px 8px 0px 0px;
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
.sections {
    width: 100%;
}
.loading-box {
    width: 100%;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3em;
    font-weight: bold;
}
.main section.io-box {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
}

.main hr {
    border-style: dashed;
}
</style>