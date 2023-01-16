<template>
    <select @change="$emit('update:modelValue', getEventValue($event))">
        <option v-for="[stateId, value] in Object.entries(materialState)" :value="stateId"
            :selected="modelValue == stateId">
            {{ value.Name }}
        </option>
    </select>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { MaterialState, MaterialStateType } from '@/defines/types/config'
import { getEventValue } from '@/logics/event_data'


/** プロパティを定義 */
const Props = {
    /** 現在の値 */
    modelValue: String,
    modelModifiers: {
        default: () => ({}),
    }
};

export default defineComponent({
    name: 'material-state-select',
    props: Props,
    emits: ['update:modelValue'],
    setup(props) {

        // computed
        const computes = {
            /** 素材の状態 */
            materialState: computed((): MaterialStateType => {
                return MaterialState;
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