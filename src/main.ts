

// Vue3 アプリ作成
import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App);

// Pinia 作成
import { createPinia } from 'pinia'
const pinia = createPinia();
app.use(pinia);

// Awesome Font を使用する準備
// - コア
import { library } from '@fortawesome/fontawesome-svg-core'
// - コンポーネント
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// - Solid スタイルのアイコン登録
import {
    faCube, faDroplet, faPenToSquare, faArrowUpRightFromSquare, faWrench,
    faTrashCan, faArrowLeft
} from '@fortawesome/free-solid-svg-icons'
library.add(
    faCube, faDroplet, faPenToSquare, faArrowUpRightFromSquare, faWrench,
    faTrashCan, faArrowLeft
);
// - Bland スタイルのアイコン
import {
    faTwitter, faGithub, faSteam
} from '@fortawesome/free-brands-svg-icons'
library.add(faTwitter, faGithub, faSteam);
// - コンポーネント登録
app.component('fa', FontAwesomeIcon);

// 全体から参照する設定ストアはここで宣言して実体を作っておく
import { useConfigStore } from '@/stores/config_store'
const configStore = useConfigStore();
import ConfigData from '@/defines/config/config.json'
configStore.setup(ConfigData);

// 画像ストア実体生成
import { useImageStore } from '@/stores/image_store'
const imageStore = useImageStore();
// 初期化、初回読み込み
imageStore.initialize();

// 最後にマウント
app.mount('#app');