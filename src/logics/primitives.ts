/// Map<string, string> 型を Object 型に変換
export const mapToObjectForString = (map:Map<string, string>):Object =>
    [...map].reduce((l,[k,v]) => Object.assign(l, {[k]:v}), {});

/// Object 型を Map<string, string> 型に変換
export const objectToMapForString = (object:Object):Map<String, String> =>
    new Map<string, string>(Object.entries(object));

/** 小数点以下を指定の桁で切り上げる */
export const RoundDigit = (value: number, digit: number): number => {
    const factor = 10 ** digit;
    const roundedValue = Math.round(value * factor) / factor;
    return Number(roundedValue.toFixed(digit)); // toFixed で 18.00、Number で 18
}

/**
 * 大文字小文字を区別せずに昇順ソートする
 * @param array [in] ソート対象の配列
 * @param func [in] 比較値取得関数（省略時はリテラル値の配列として扱う）
 * @note func には、例えば [{a: 1, b: 2},...] が持つ a の値で比較したい場合 (v, i) => v.a を渡す
 * @note 比較値が文字列(String)でない場合は通常の昇順ソートと同じ
 * @note 配列内の要素によって型が異なる場合は動作保証対象外
 */
export const sortCaseInsensitive = (array: Array<any>, func: Function | null = null): Array<any> => {
    if (array.length < 2) return array; // ２つ以上要素が無いとソートできないのでそのまま返す
    const compare = (v1: any, v2: any): number => {
        if (v1 > v2) return 1;
        if (v1 < v2) return -1;
        return 0;
    };
    if (func !== null) {
        // 第2引数があればその関数で比較値を取得しながらソート
        if (typeof func(array[0]) == 'string') {
            // 文字列の場合は小文字に変換してからソート
            return array.sort((v1: any, v2: any): number => {
                return compare(func(v1)?.toLowerCase(), func(v2)?.toLowerCase());
            });
        } else {
            // 文字列以外ならそのままソート
            return array.sort((v1: any, v2: any): number => {
                return compare(func(v1), func(v2));
            });
        }
    }
    // リテラル値が入っているものとしてソート
    if (typeof array[0] == 'string') {
        // 文字列の場合は小文字に変換してからソート
        return array.sort((v1: string, v2: string): number => {
            return compare(v1?.toLowerCase(), v2?.toLowerCase());
        });
    }
    // 文字列以外なら通常の昇順ソート
    return array.sort();
}

/**
 * 重複する値の有無チェック
 * @param list [in] 対象の配列
 * @return 重複の有無（true: 重複あり）
 */
export const existDuplicate = (list: Array<any>): boolean => {
    return list.length != (new Set(list)).size;
};
/**
 * 重複する値の有無チェック
 * @param list [in] 対象の配列
 * @return 重複の有無（true: 重複あり）
 */
export const getDuplicates = (list: Array<any>): Array<any> => {
    return list.filter((v,i,s) => s.indexOf(v) === i && s.lastIndexOf(v) !== i);
};

/**
 * スクロールバーが表示されているか（水平）
 * @param element [in] 対象のDOM要素
 */
export const visibledHorizontalScrollbar = (element: HTMLElement|undefined): boolean => {
    if (!element) return false;
    return element.clientWidth != element.offsetWidth;
};

/**
 * スクロールバーが表示されているか（垂直）
 * @param element [in] 対象のDOM要素
 */
export const visibledVerticalScrollbar = (element: HTMLElement|undefined): boolean => {
    if (!element) return false;
    return element.clientHeight != element.offsetHeight;
};


/** スクロールバーの幅（一度判定すれば変わることはないのでグローバル変数にしておく）
 */
export var scrollbarWidth = 0;
/**
 * スクロールバーの幅を計算
 * @note グローバル変数 scrollbarWidth に結果を格納する為、一度だけ呼び出せば良い）
 */
export const calcScrollbarWidth = () => {
    // スクロールバー付き要素を追加
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
    // 中に要素追加
    const inner = document.createElement('div');
    outer.appendChild(inner);
    // 差を計算
    scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
    // 後始末
    document.body.removeChild(outer);
};