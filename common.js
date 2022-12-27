/// 要素生成
/// @param [in] _tag <string> タグ名
/// @param [in] _class <string> クラス名（複数指定時は半角スペース区切り）
/// @param [in] _text <string> 中に入れるテキスト
function createElement(_tag, _class = '', _text = '') {
    const element = document.createElement(_tag);
    if (_class) {
        element.className = _class;
    }
    if (_text) {
        element.innerText = _text;
    }
    return element;
}