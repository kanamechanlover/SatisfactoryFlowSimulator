import { defineStore } from 'pinia'
import { PresetData } from '@/defines/types/preset'

export const usePresetStore = defineStore('preset', {
    state: () => {
        return {
            /** ファイルから読み込んだプリセットデータ */
            presetData: new PresetData(),
        };
    },
    getters: {
        /** ティア名リスト取得 */
        tierNames(state): Array<string> {
            return state.presetData.tierNames();
        },
        /**
         * プリセット名リスト取得
         * @param tierName [in] ティア名
         * @return プリセット名リスト（ティア名が無ければ空配列を返す）
         */
        presetNames(state) {
            return (tierName: string): Array<string> => {
                return state.presetData.presetNames(tierName);
            };
        },
        /**
         * 製品（表示）名リスト取得
         * @param tierName [in] ティア名
         * @param presetName [in] プリセット名
         * @return 製品（表示）名リスト（ティア名、プリセット名が無ければ空配列を返す）
         */
        productNames(state) {
            return (tierName: string, presetName: string): Array<string> => {
                return state.presetData.productNames(tierName, presetName);
            };
        },
        /**
         * 製品（素材）IDリスト取得
         * @param tierName [in] ティア名
         * @param presetName [in] プリセット名
         * @return 製品（素材）IDリスト（ティア名、プリセット名が無ければ空配列を返す）
         */
        productIds(state) {
            return (tierName: string, presetName: string): Array<string> => {
                return state.presetData.productIds(tierName, presetName);
            };
        },
    },
    actions: {
        /** プリセット構築処理 */
        setup(data: any) {
            this.presetData.deserialize(data);
        },
    }
});