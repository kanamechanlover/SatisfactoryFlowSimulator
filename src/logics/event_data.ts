
/** 有効な input 要素のイベントか判定 */
export function isValidInputEvent(event: Event): boolean {
    const { target } = event;
    return (target instanceof HTMLInputElement);
};
/** 有効な select 要素のイベントか判定 */
export function isValidSelectEvent(event: Event): boolean {
    const { target } = event;
    return (target instanceof HTMLSelectElement);
};

/** 要素のイベント後の値を取得 */
export function getEventValue(event: Event): any {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
        return (target as HTMLInputElement).value;
    }
    if (target instanceof HTMLSelectElement) {
        return (target as HTMLSelectElement).value;
    }
    return null;
};