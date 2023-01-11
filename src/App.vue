<template>
    <div id="frame">
        <header>
            <span class="title">Satisfactory 制作フロー シミュレーター</span>
            <a href="https://store.steampowered.com/app/526870/Satisfactory/" class="link-icon" title="Steamストア - Satisfactory" target="_blank">
                <fa :icon="{ prefix: 'fab', iconName: 'steam' }" />
            </a>
            <a href="https://twitter.com/kanamechanlover" class="link-icon" title="Twitter - @kanamechanlover" target="_blank">
                <fa :icon="{ prefix: 'fab', iconName: 'twitter' }" />
            </a>
            <a href="https://github.com/kanamechanlover" class="link-icon" title="Github - kanamechanlover" target="_blank">
                <fa :icon="{ prefix: 'fab', iconName: 'github' }" />
            </a>
        </header>
        <div id="main">
            <div id="flow-tree-box">
                <FlowTree></FlowTree>
            </div>
            <div id="total-data-box">
                <MaterialTable></MaterialTable>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, toRefs, reactive } from 'vue'
import { MaterialTable } from './defines/types/material_table';

/** プロパティを定義 */
const Props = {
};

/** 内部で扱うメンバ変数を定義 */
interface Data {
};

/** テンプレート参照する定義 */
interface Refs {
    frame: Ref<HTMLElement|null>,
}

export default defineComponent({
    props: Props,
    setup(props) {
        const state = reactive<Data>({});
        const refs: Refs = {
            frame: ref(null),
        };
        // computed
        // this の代わりに state
        const computes = {};
        // methods
        // this の代わりに state
        const methods = {};
        return {
            ...props,
            ...toRefs(state),
            ...refs,
            ...computes,
            ...methods,
        };
    },
    components: { MaterialTable }
});
</script>

<style src="@/to_dark_theme.css" scoped />

<style scoped>
* {
    box-sizing: border-box;
}
#frame {
    flex: 1;
    display: flex;
    flex-direction: column;
}
header {
    display: flex;
    align-items: center;
    background-color: orange;
    padding: 4px 8px;
    font-weight: bold;
    color: maroon;
    overflow-y: hidden;
    border-bottom: 1px solid var(--dark-bg-color);
    gap: 4px;
}
header .title {
    flex: 1;
    font-size: 1.2em;
    text-align: left;
}
#main {
    flex: 1;
    display: flex;
    overflow: hidden;
}
#flow-tree-box {
    flex: 1;
    border-right: 1px solid gray;
        background-image:
            linear-gradient(
                0deg, transparent 31px,
                gray 32px),
            linear-gradient(
                90deg, transparent 31px,
                gray 32px);
        background-color: dimgray;
        background-size: 32px 32px;
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 8px;
}
#total-data-box {
    background: var(--dark-bg-color);
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 8px;
    min-width: 120px;
}
a.link-icon {
    color: white;
}
a.link-icon svg.fa-steam:hover {
    color: rgb(15, 34, 110);
}
a.link-icon svg.fa-twitter:hover {
    color: rgb(29, 155, 240);
}
a.link-icon svg.fa-github:hover {
    color: black;
}

</style>