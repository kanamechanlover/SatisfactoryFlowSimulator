<template>
    <select @change="$emit('update:modelValue', getEventValue($event))">
        <option v-for="(category, index) in categories" :key="index" :value="category.id"
            :selected="modelValue == category.id">
            {{ category.name }}
        </option>
    </select>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { getEventValue } from '@/logics/event_data'
import { CategoryList } from '@/defines/types/config';


/** プロパティを定義 */
const Props = {
    /** 現在の値 */
    modelValue: String,
    modelModifiers: {
        default: () => ({}),
    }
};

export default defineComponent({
    name: 'material-category-select',
    props: Props,
    emits: ['update:modelValue'],
    setup(props) {
        const configStore = useConfigStore();

        // computed
        const computes = {
            /** 素材カテゴリ */
            categories: computed((): CategoryList => {
                return configStore.config.materialCategories;
            }),
            getEventValue: getEventValue,
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

<style src="@/to_dark_theme.css" scoped />

<style scoped>

</style>