

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
// - 使用するアイコン
import {
    faCube, faDroplet, faPenToSquare, faArrowUpRightFromSquare, faWrench
} from '@fortawesome/free-solid-svg-icons'
import {
    faTwitter, faGithub, faSteam
} from '@fortawesome/free-brands-svg-icons'
library.add(faCube, faDroplet, faPenToSquare, faArrowUpRightFromSquare, faWrench);
library.add(faTwitter, faGithub, faSteam);
app.component('fa', FontAwesomeIcon);

// 全体から参照する設定ストアはここで宣言して実体を作っておく
import { useConfigStore } from '@/stores/config_store'
const configStore = useConfigStore();
import ConfigData from '@/defines/config/config.json'
configStore.setup(ConfigData);

// 共通のスタイルを指定
import './style.css'

import { useImageStore } from '@/stores/image_store'
const imageStore = useImageStore();
import DefaultImageUrls from '@/defines/config/assets.json'
for(const key in DefaultImageUrls) {
    const path = (DefaultImageUrls as {[key: string]: string})[key];
    imageStore.add(key, path);
}

// ページ離脱時のメモリ解放などの処理を登録
window.addEventListener('beforeunload', () => {
    // 画像データをクリア
    imageStore.clear();
});

// 最後にマウント
app.mount('#app');