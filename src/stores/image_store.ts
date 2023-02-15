import { defineStore } from 'pinia'
import axios from 'axios'
import { hasObjectUrls, readObjectUrls, writeObjectUrls, removeObjectUrls } from '@/logics/local_strage';

/** 画像データ */
export class ImageData {
    /** 画像URL */
    url: string = '';
    /** データ参照用のオブジェクトURL（実データはキャッシュ） */
    objectUrl: string = '';
    /** カスタマイズフラグ */
    customized: boolean = false;
};

export type ImageDataList = { [key: string]: ImageData };

export const useImageStore = defineStore('image', {
    state: () => {
        return {
            /** 画像データ（key=画像ID, value=ImageData） */
            imageDataList: {} as ImageDataList,
            /** 読み込み中のファイル数 */
            loadingFileNum: 0,
            /** Axios インスタンス */
            axiosInstance: axios.create({
                /** ベースURL */
                baseURL: import.meta.env.BASE_URL,
                /** 全て Blob データとして取得 */
                responseType: 'blob',
            }),
            /** 読み込みに失敗したファイルリスト */
            failedFileList: [] as Array<string>,
        };
    },
    getters: {
        /**
         * 読み込み中か
         */
        isLoading(state): boolean {
            return state.loadingFileNum > 0;
        },
        /**
         * 現在の読み込み中のファイル数
         */
        loadingFileNumber(state): number {
            return state.loadingFileNum;
        },
        /** 
         * 現在登録されている画像数
         */
        imageNumber(state): number {
            return Object.keys(state.imageDataList).length;
        },
        /**
         * 指定画像があるか
         * @param imageId [in] 画像ID
         * @return 画像の有無
         */
        hasImage(state) {
            return (imageId: string): boolean => {
                return state.imageDataList[imageId] !== undefined;
            };
        },
        /**
         * 画像のURL取得
         * @param imageId [in] 画像ID
         */
        getUrl(state) {
            return (imageId: string): string => {
                // 存在しないデータの場合は空文字列
                if (!state.imageDataList[imageId]) return '';
                // URLを返す
                return state.imageDataList[imageId].url;
            };
        },
        /**
         * 画像のデータ取得
         * @param imageId [in] 画像ID
         */
        getData(state) {
            return (imageId: string): string => {
                // 存在しないデータの場合は空文字列
                if (!state.imageDataList[imageId]) return '';
                // オブジェクトURLを返す
                return state.imageDataList[imageId].objectUrl;
            };
        },
        /**
         * 画像がデフォルトから変更されたものか
         * @param imageId [in] 画像ID
         */
        isCustomized(state) {
            return (imageId: string): boolean => {
                // 存在しないデータの場合は変更なし
                if (!state.imageDataList[imageId]) return false;
                // カスタマイズフラグを返す
                return state.imageDataList[imageId].customized;
            };
        },
    },
    actions: {
        /** 環境を綺麗にする */
        initialize() {
            // ストレージをクリーン
            this.cleanStorage();
        },
        /** 
         * 読み込み成功時の処理
         * @param imageId [in] 画像ID
         * @param path [in] ルートからの相対パス
         * @param objectUrl [in] レスポンスデータ
         * @param customized [in] ローカルから読み込んだもの（デフォルトのデータではない）か
         */
        onSuccessful(imageId: string, path: string, objectUrl: string, customized: boolean = false) {
            // 格納用データを用意
            const imageData = new ImageData();
            imageData.url = path;
            imageData.objectUrl = objectUrl;
            // 既存のキーであればカスタマイズフラグを立てる
            if (customized) {
                imageData.customized = true;
            }
            // 参照できるようにリストへ格納
            this.imageDataList[imageId] = imageData;
            // 読み込み完了したので、読み込み中ファイル数を減らす
            this.loadingFileNum--;
            // 全て読み終えたらストレージに書き込み
            if (this.loadingFileNum == 0) {
                this.updateStorage();
                // 読み込みに失敗したファイルを表示
                if (this.failedFileList.length > 0) {
                    this.showFailedAlert();
                    this.failedFileList = [] as Array<string>;
                }
            }
        },
        /**
         * 単体読み込み
         * @param imageId [in] 画像ID
         * @param path [in] ルートからの相対パス
         */
        add(imageId: string, path: string) {
            // 読み込み処理開始
            this.axiosInstance.get(path).then((res) => {
                // オブジェクトURL作成（データはキャッシュ上に配置される）
                const objectUrl = URL.createObjectURL(res.data);
                this.onSuccessful(imageId, path, objectUrl);
            }).catch(() => {
                // 失敗時は失敗したファイルリストに追加
                this.failedFileList.push(imageId);
                this.loadingFileNum--;
            });
            // 読み込み中ファイル数を増やす
            this.loadingFileNum++;
        },
        /**
         * ローカルファイルを読込
         * @param files [in] ファイル選択ダイアログで選択されたファイルリスト
         */
        addFromLocal(fileList: FileList) {
            // ファイルリストを配列に変換
            const files = Array.from(fileList);
            files.forEach((file: File) => {
                const path = file.name;
                const imageId = path.split('.').slice(0, -1).join('.');
                const reader = new FileReader();
                reader.onload = () => {
                    this.onSuccessful(imageId, path, reader.result as string, true);
                };
                reader.onerror = () => {
                    this.failedFileList.push(imageId);
                    this.loadingFileNum--;
                };
                reader.readAsDataURL(file);
                this.loadingFileNum++;
            })
            // 読み込み中ファイル数を増やす
        },
        /**
         * クリア（ページ離脱時にも呼ぶこと）
         */
        clear() {
            // データをキャッシュからメモリ解放
            for (const key in this.imageDataList) {
                URL.revokeObjectURL(this.imageDataList[key].objectUrl);
            }
            // データを空にする
            this.imageDataList = {} as ImageDataList;
            this.failedFileList = [] as Array<string>;
            // ローカルストレージに登録されていたらクリアしておく
            this.cleanStorage();
        },

        /** 読み込み失敗アラート表示 */
        showFailedAlert() {
            alert(
                '以下のファイルの読み込みに失敗しました。\n' +
                this.failedFileList.join('\n')
            );
        },

        // reload 時のメモリリーク回避の為の処置 -------------------------------

        /** ローカルストレージの内容を更新 */
        updateStorage() {
            const urls = Object.keys(this.imageDataList).map((key: string): string => {
                return this.imageDataList[key].objectUrl;
            });
            writeObjectUrls(urls);
        },
        /** ローカルストレージの内容を削除 */
        cleanStorage() {
            // ストレージに登録されていなければ何もしない
            if (!hasObjectUrls()) return;

            // ストレージから URL リストを取得して解放
            const urls = readObjectUrls();
            urls.forEach((url: string) => {
                URL.revokeObjectURL(url);
            });
            
            // ストレージクリア
            removeObjectUrls();
        }
    },
});

