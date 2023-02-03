// ログ出力管理

export const datetime = (): string => {
    const now = new Date();
    return `${
        now.getFullYear()
    }/${
        String(now.getMonth() + 1).padStart(2, '0')
    }/${
        String(now.getDate()).padStart(2, '0')
    } ${
        String(now.getHours()).padStart(2, '0')
    }:${
        String(now.getMinutes()).padStart(2, '0')
    }:${
        String(now.getSeconds()).padStart(2, '0')
    }`;
};

/**
 * ログ出力
 * @param message [in] メッセージまたは任意のデータ
 * @param place [in] 発生場所
 * @note フォーマット："現在時刻 [発生場所] メッセージ"
 */
export const log = (message: any, place: string = '') => {
    console.log([
        datetime(),
        (place) ? `[${place}]` : '',
        message
    ].join(' '));
};

/**
 * 警告ログ出力
 * @param message [in] メッセージまたは任意のデータ
 * @param place [in] 発生場所
 * @note フォーマット："現在時刻 [発生場所] メッセージ"
 */
export const warn = (message: any, place: string = '') => {
    console.warn([
        datetime(),
        (place) ? `[${place}]` : '',
        message
    ].join(' '));
};
/**
 * エラーログ出力
 * @param message [in] メッセージまたは任意のデータ
 * @param place [in] 発生場所
 * @note フォーマット："現在時刻 [発生場所] メッセージ"
 */
export const error = (message: any, place: string = '') => {
    console.error([
        datetime(),
        (place) ? `[${place}]` : '',
        message
    ].join(' '));
};

/** デフォルトオブジェクト（import Logger from '...'） */
export default {
    log, warn, error,
};