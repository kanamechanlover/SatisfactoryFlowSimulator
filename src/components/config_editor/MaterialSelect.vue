<template>
    <div class="frame">
        <svg :src="machinePortPath" :title="machinePortName"></svg>
        <select @change="$emit('update:modelValue', getEventValue($event))" :title="materialName">
            <option :selected="!modelValue">-</option>
            <option v-for="(material, index) in materials" :key="index" :value="material.id"
                :selected="modelValue == material.id">
                <img :src="materialImgPath(material.id)" />
                {{ material.name }}
            </option>
        </select>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { getEventValue } from '@/logics/event_data'
import { ConfigMaterialList, ConfigMaterial, MachinePortType } from '@/defines/types/config';
import { machineIconPath, materialImgPath } from '@/logics/access_path'

/** プロパティを定義 */
const Props = {
    /** 現在の値 */
    modelValue: String,
    /** 選択肢として表示する素材の状態 */
    type: String,
};

export default defineComponent({
    name: 'material-select',
    props: Props,
    emits: ['update:modelValue'],
    setup(props) {
        const configStore = useConfigStore();

        // computed
        const computes = {
            /** 素材 */
            materials: computed((): ConfigMaterialList => {
                return configStore.config.materials.filter((material: ConfigMaterial) => {
                    return material.state == props.type;
                });
            }),
            getEventValue,
            /** 設備入出力口タイプの画像へのパスを取得 */
            machinePortPath: computed(() => {
                if (props.type === undefined) return '';
                return machineIconPath(props.type);
            }),
            /** 設備入出力口タイプの表示名を取得 */
            machinePortName: computed(() => {
                if (props.type === undefined) return '';
                return MachinePortType.getName(props.type);
            }),
            materialImgPath,
            /** 素材名 */
            materialName: computed((): string => {
                const material = configStore.config.materials.find((material) => material.id == props.modelValue);
                return (material) ? material.name : ''; 
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
<style src="@/components/config_editor/config_editor.css" scoped />

<style scoped>
div.frame {
    display: flex;
    align-items: center;
}
svg {
    margin-right: 2px;
    width: 20px;
    height: 20px;
    color: white;
}
select {
    flex: 1;
    width: 100%;
}
option {
    text-align: left;
}
img {
    width: 20px;
    height: 20px;
}
</style>