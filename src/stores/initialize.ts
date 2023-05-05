// ストア関連の初期化処理群

// Pinia 作成
import { createPinia } from 'pinia'
const pinia = createPinia();
export default pinia;

// 全体から参照する設定ストアはここで宣言して実体を作っておく
import { useConfigStore } from '@/stores/config_store'
const configStore = useConfigStore(pinia);
import ConfigData from '@/defines/config/config.json'
configStore.setup(ConfigData);

// 画像ストア実体生成
import { useImageStore } from '@/stores/image_store'
const imageStore = useImageStore(pinia);
// 初期化、初回読み込み
imageStore.initialize();

// 製作フローストアに製品を１つ追加しておく
import { useFlowStore } from '@/stores/flow_store'
const flowStore = useFlowStore(pinia);
flowStore.addProduct();

// 集計結果ストアの初期化
import { useCollectStore } from '@/stores/collect_store'
const collectStore = useCollectStore(pinia);
flowStore.$onAction(({ name, after }) => {
    // 製作フローが更新されたら自身も更新する
    if (name === 'updated') {
        after(() => {
            collectStore.updateTable();
        });
    }
});