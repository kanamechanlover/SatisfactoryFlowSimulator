import { createApp } from 'vue'
import './style.css'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useConfigStore } from '@/stores/config_store'

// 設定ファイル読み込み
import ConfigData from '@/defines/config/config.json'

// Awesome Font を使用する準備
// - コア
import { library } from '@fortawesome/fontawesome-svg-core'
// - コンポーネント
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// - 使用するアイコン
import { faCube, faDroplet } from '@fortawesome/free-solid-svg-icons'
import { faTwitter, faGithub, faSteam } from '@fortawesome/free-brands-svg-icons'
library.add(faCube, faDroplet, faTwitter, faGithub, faSteam);


// アプリケーションの初期化
const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.component('fa', FontAwesomeIcon);
app.mount('#app');

// 全体から参照する設定ストアはここで定義しておく
const configStore = useConfigStore();
configStore.setup(ConfigData);

console.log(pinia);

