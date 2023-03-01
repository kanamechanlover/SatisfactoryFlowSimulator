<template>
    <div class="image-section-frame">
        <p>
            このセクションでは登録されている画像とその ID を確認できます。<br />
            （このセクションの内容はエクスポートされる設定ファイルに含まれません。）<br />
            下部の「＋」ボタンからローカル画像ファイルもアップロードできます。<br />
            ファイル名（拡張子無し）がそのまま画像 ID になります。<br />
            アップロードしたファイル名（拡張子無し）と同名の ID が既にある場合は上書きされます。<br />
            アップロードしたファイルには <span class="accent"><fa :icon="['fas', 'wrench']" /></span> 
            のマークが付きます。
        </p>
        <div class="image-list-box">
            <div class="flex-box" v-for="imageId in imageIds" :key="imageId">
                <div class="item-box">
                    <div class="image-box">
                        <img :src="data(imageId)" :title="url(imageId)" />
                    </div>
                    <span class="id">{{ imageId }}</span>
                    <span class="customized" v-if="customized(imageId)" title="編集済">
                        <fa :icon="['fas', 'wrench']" />
                    </span>
                </div>
            </div>
        </div>
        <!-- ファイル追加時のファイル選択ダイアログ表示用フォーム -->
        <input ref="filePicker" class="hide" type="file" accept="image/*" @change="onSelectedAddFile" multiple />
        <div class="additional-box">
            <button class="additional-button" @click="addImage" title="追加">＋</button>
        </div>
    </div>
</template>

<script setup lang="ts">

import { computed, ref } from 'vue'
import { useImageStore } from '@/stores/image_store'
import { sortCaseInsensitive } from '@/logics/primitives'

// 子コンポーネント ---------------------------------------------

// 外部連携 -----------------------------------------------------

// 内部定義 -----------------------------------------------------

// 内部変数 -----------------------------------------------------

/** ファイル追加時のファイル選択ダイアログ表示用フォーム */
const filePicker = ref<InstanceType<typeof HTMLInputElement> | null>(null);

/** 設定ストア */
const imageStore = useImageStore();

// 内部関数 -----------------------------------------------------

// Getters -----------------------------------------------------

/** 画像IDリスト */
const imageIds = computed((): Array<string> => {
    // A-Z(大文字小文字区別なし)ソート
    return sortCaseInsensitive(Object.keys(imageStore.imageDataList));
});

/** 
 * 画像の URL
 * @param imageId [in] 画像ID
 */
const url = computed(() => (imageId: string): string => {
    if (!imageStore.hasImage(imageId)) return '';
    return imageStore.getUrl(imageId);
});
/** 
 * 画像のデータ（オブジェクトURL）
 * @param imageId [in] 画像ID
 */
const data = computed(() => (imageId: string): string => {
    if (!imageStore.hasImage(imageId)) return '';
    return imageStore.getData(imageId);
});

/**
 * カスタマイズフラグ
 */
const customized = computed(() => (imageId: string): boolean => {
    if (!imageStore.hasImage(imageId)) return false;
    return imageStore.isCustomized(imageId);
});

// Actions -----------------------------------------------------

/** 追加ボタンが押されたらファイル選択ダイアログ表示 */
const addImage = () => {
    // ファイル選択ダイアログ表示
    if (!filePicker.value) return; // イレギュラー
    filePicker.value.click();
}

/** ファイル選択されたらストアに追加 */
const onSelectedAddFile = () => {
    if (!filePicker.value || !filePicker.value.files) return; // イレギュラー
    const files = filePicker.value.files;
    imageStore.addFromLocal(files);
    // 選択状態をクリア
    filePicker.value.value = '';
};

// サイクル -----------------------------------------------------


// 監視 --------------------------------------------------------


</script>

<style src="@/to_dark_theme.css" scoped />
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
.image-section-frame {
    width: 100%;
    display: flex;
    flex-direction: column;
}
.image-list-box {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
}
.image-list-box .flex-box {
    flex: 0 0 25%;
    display: flex;
    flex-wrap: wrap;
    padding: 4px;
}
.image-list-box .flex-box .item-box {
    flex: 1;
    display: flex;
    align-items: center;
    border: 1px solid var(--dark-main-color);
    background: var(--dark-main-color);
    border-radius: 8px;
    font-size: 0.75em;
    line-height: 1.2em;
    overflow-wrap: anywhere;
    padding: 2px;
    position: relative;
}
.image-list-box .flex-box .item-box .image-box {
    display: flex;
    background: var(--dark-bg-color);
    border-radius: 8px;
    padding: 4px;
    height: 50px;
}
.image-list-box .flex-box .item-box .image-box img {
    aspect-ratio: 1;
    height: 100%;
}
.image-list-box .flex-box .item-box .id {
    flex: 1;
    padding: 8px;
    text-align: left;
    font-weight: bold;
}
.image-list-box .flex-box .item-box .customized {
    position: absolute;
    right: 4px;
    bottom: 4px;
    width: 16px;
    height: 16px;
    color: white;
}

</style>