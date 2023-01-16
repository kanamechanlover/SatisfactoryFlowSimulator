<template>
    <div></div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

/** プロパティを定義 */
const Props = {
};

export default defineComponent({
    name: '',
    props: Props,
    setup(props) {
        // computed
        const computes = {
        };

        // methods
        const methods = {
        };

        return {
            ...props,
            ...computes,
            ...methods,
        };
    },
});
</script>

<style scoped>
</style>