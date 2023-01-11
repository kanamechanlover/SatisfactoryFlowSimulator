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