// Google Analytics のイベント管理
import { event } from 'vue-gtag'
import Logger from '@/logics/logger'

/**
 * Google Analytics イベント定義
 */
export const GAEvents = {
    Visit: 'Visit'
};

/**
 * イベント発火
 * @param eventName イベント名
 */
export function invokeGAEvent(eventName: string) {
    event(eventName);
    Logger.log(`Invoked google analytics event : '${eventName}'`);
};