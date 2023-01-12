/// 特定のパスへの参照の際の補助関数群

/**
 * 設備アイコンへのパスを取得
 * @param iconName アイコン名（拡張子無し）
 * @return ファイルパス
 */
export const machineIconPath = function(iconName: string): string {
    return import.meta.env.BASE_URL + './assets/icons/' + iconName + '.svg';
}

/**
 * 素材画像へのパスを取得
 * @param iconName アイコン名（拡張子無し）
 * @return ファイルパス
 */
export const materialImgPath = function(materialId: string): string {
    return import.meta.env.BASE_URL + './assets/materials/' + materialId + '.png';
}