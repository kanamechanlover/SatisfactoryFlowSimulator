// ローカルストレージアクセス


// ページをリロードした際に beforeunload イベントが起らない為、次回訪問時に削除できるようにする。

const objectUrlStrageKey = 'sfs-object-urls';

/**
 * ローカルストレージに画像のオブジェクトURLを登録
 * @param urls [in] 画像のオブジェクトURLのリスト
 */
export function writeObjectUrls(urls: Array<string>) {
    localStorage.setItem(objectUrlStrageKey, urls.toString());
}

/**
 * ローカルストレージに画像のオブジェクトURLが登録されているか
 * @return 登録されているか（true: 登録されている）
*/
export function hasObjectUrls() {
    return localStorage.getItem(objectUrlStrageKey) !== null;
};

/**
 * ローカルストレージから前回登録された画像のオブジェクトURL を取得
 * @return 画像のオブジェクトURL（登録されていなければ空文字列）
*/
export function readObjectUrls(): Array<string> {
    const urls = localStorage.getItem(objectUrlStrageKey);
    return (urls) ? urls.split(',') : []; // カンマ区切り文字列としてで入っているので配列化
};

/** ローカルストレージから前回登録された画像のオブジェクトURLを削除 */
export function removeObjectUrls() {
    localStorage.removeItem(objectUrlStrageKey);
};