/** 汎用的な定義群 */

/** 方向 */
export const Direction = {
    Up: 'Up', // 上
    Down: 'Down', // 下
    Left: 'Left', // 左
    Right: 'Right', // 右
};

/** 位置 */
export class Vector2 {
    /** x座標 */
    x: number;
    /** y座標 */
    y: number;
    /** 初期化 */
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    };
};

/** 位置と大きさ */
export class Rect {
    /** x座標 */
    x: number;
    /** y座標 */
    y: number;
    /** 横幅 */
    width: number;
    /** 高さ */
    height: number;
    /** 初期化 */
    constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    };
};