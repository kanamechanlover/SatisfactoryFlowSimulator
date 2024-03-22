

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
    faTrashCan, faArrowLeft, faArrowRight, faClipboard, faListUl,
} from '@fortawesome/free-solid-svg-icons'
library.add(
    faCube, faDroplet, faPenToSquare, faArrowUpRightFromSquare, faWrench,
    faTrashCan, faArrowLeft, faArrowRight, faClipboard, faListUl,
);
// - Bland スタイルのアイコン
import {
    faTwitter, faGithub, faSteam
} from '@fortawesome/free-brands-svg-icons'
library.add(faTwitter, faGithub, faSteam);
// - コンポーネント登録
app.component('fa', FontAwesomeIcon);

// Google Analytics
import VueGTag from 'vue-gtag'
app.use(
    VueGTag,
    {
        config: {
            id: 'G-EJFZ9HF6BB'
        }
    }
);

// スクロールバーの幅を計算しておく
import { calcScrollbarWidth } from '@/logics/primitives';
calcScrollbarWidth();

// ストア初期化
import pinia from '@/stores/initialize';
app.use(pinia);

// 最後にマウント
app.mount('#app');