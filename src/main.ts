

// Vue3 アプリ作成
import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App);

// Awesome Font を使用する準備
// - コア
import { library } from '@fortawesome/fontawesome-svg-core'
// - コンポーネント
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// - Solid スタイルのアイコン登録
import {
    faCube, faDroplet, faPenToSquare, faArrowUpRightFromSquare, faWrench,
    faTrashCan, faArrowLeft, faArrowRight, faClipboard,
} from '@fortawesome/free-solid-svg-icons'
library.add(
    faCube, faDroplet, faPenToSquare, faArrowUpRightFromSquare, faWrench,
    faTrashCan, faArrowLeft, faArrowRight, faClipboard,
);
// - Bland スタイルのアイコン
import {
    faTwitter, faGithub, faSteam
} from '@fortawesome/free-brands-svg-icons'
library.add(faTwitter, faGithub, faSteam);
// - コンポーネント登録
app.component('fa', FontAwesomeIcon);

// スクロールバーの幅を計算しておく
import { calcScrollbarWidth } from '@/logics/primitives';
calcScrollbarWidth();

// ストア初期化
import pinia from '@/stores/initialize';
app.use(pinia);

/*// デバッグ用：製品追加
import { useFlowStore } from "@/stores/flow_store";
const flowStore = useFlowStore();
flowStore.addProduct('自律制御ユニット', 'AdaptiveControlUnit');
flowStore.addProduct('組立指揮システム', 'AssemblyDirectorSystem');
flowStore.addProduct('磁界発生装置', 'MagneticFieldGenerator');
flowStore.addProduct('熱推進型ロケット', 'ThermalPropulsionRocket');
*/

// 最後にマウント
app.mount('#app');