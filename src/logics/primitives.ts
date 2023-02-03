/// Map<string, string> 型を Object 型に変換
export const mapToObjectForString = (map:Map<string, string>):Object =>
    [...map].reduce((l,[k,v]) => Object.assign(l, {[k]:v}), {});

/// Object 型を Map<string, string> 型に変換
export const objectToMapForString = (object:Object):Map<String, String> =>
    new Map<string, string>(Object.entries(object));

/** 小数点以下を指定の桁で切り上げる */
export const CeilDigit = (value: number, digit: number): number => {
    return Math.ceil(value * 10**digit) / 10**digit;
}

/**
 * 大文字小文字を区別せずに昇順ソートする
 * @param array [in] ソート対象の配列
 * @param func [in] 比較値取得関数（省略時はリテラル値の配列として扱う）
 * @note func には、例えば [{a: 1, b: 2},...] が持つ a の値で比較したい場合 (v, i) => v.a を渡す
 * @note 比較値が文字列(String)でない場合は通常の昇順ソートと同じ
 * @note 配列内の要素によって型が異なる場合は動作保証対象外
 */
export const sortCaseInsensitive = (array: any[], func: Function | null = null): any[] => {
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