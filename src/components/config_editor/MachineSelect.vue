<template>
    <select @change="$emit('update:modelValue', getEventValue($event))" :title="machineName">
        <option v-for="(machine, index) in machines" :key="index" :value="machine.id"
            :selected="modelValue == machine.id">
            <img :src="machineIconPath(machine.id)" />
            {{ machine.name }}
        </option>
    </select>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { getEventValue } from '@/logics/event_data'
import { ConfigMachineList, ConfigMachine } from '@/defines/types/config';
import { machineIconPath } from '@/logics/access_path'
import { config } from 'process';

/** プロパティを定義 */
const Props = {
    /** 現在の値(v-model用) */
    modelValue: String,
    modelModifiers: {
        default: () => ({}),
    },
};

export default defineComponent({
    name: 'material-select',
    props: Props,
    emits: ['update:modelValue', 'update:bindValue'],
    setup(props) {
        const configStore = useConfigStore();

        // computed
        const computes = {
            /** 設備 */
            machines: computed((): ConfigMachineList => {
                return configStore.config.machines;
            }),
            getEventValue: getEventValue,
            machineIconPath: machineIconPath,
            machineName: computed((): string => {
                if (props.modelValue === undefined) return '';
                return configStore.machineName(props.modelValue);
            }),
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
option {
    text-align: left;
}
img {
    width: 20px;
    height: 20px;
}
</style>