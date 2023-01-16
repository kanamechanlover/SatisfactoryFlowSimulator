<template>
    <section>
        <h1 @click="toggle">
            <span class="toggle" :class="{collapse: isCollapsed}">▼</span>
            <span>{{ sectionName }}</span>
            <span v-if="itemCount > 0">{{ ' (' + itemCount + ')' }}</span>
        </h1>
        <div class="section-body" v-show="isOpened">
            <slot></slot>
        </div>
    </section>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from 'vue'


/** プロパティを定義 */
const Props = {
    /** ヘッダ部に表示する文字列 */
    sectionName: {
        type: String,
        required: true,
        default: '',
    },
    /** ヘッダ部のカッコ内に表示する数値 */
    itemCount: {
        type: Number,
        default: -1,
    }
};

export default defineComponent({
    name: 'config-editor-section',
    props: Props,
    setup(props) {
        const collapsed = ref(true);

        // computed
        const computes = {
            /** 格納状態か */
            isCollapsed: computed((): boolean => {
                return collapsed.value;
            }),
            /** 展開状態か */
            isOpened: computed((): boolean => {
                return !collapsed.value;
            }),
        };

        // methods
        const methods = {
            /** 展開・格納状況をトグル */
            toggle: () => {
                collapsed.value = !collapsed.value;
            }
        };

        return {
            ...props,
            ...computes,
            ...methods,
        };
    },
});
</script>

<style src="@/to_dark_theme.css" scoped />

<style scoped>
section {
    position: relative;
}
section h1 {
    position: relative;
    font-size: 1em;
    line-height: 1em;
    margin: 8px 8px;
    padding: 4px;
    border: 1px solid white;
    border-radius: 8px;
    user-select: none;
}
section h1 span.toggle {
    position:absolute;
    top: 50%;
    left: 8px;
    transform: translateY(-50%);
    transition: 0.5s;
    transform-origin: center;
}
section h1 span.toggle.collapse {
    transform: translateY(-50%) rotateZ(-90deg);
}
section h1:hover {
    cursor: pointer;
    border-radius: 4px;
    background: orange;
}
.section-body {
    display: flex;
    flex-direction: column;
    padding: 0px 8px;
    padding-bottom: 16px;
}

</style>