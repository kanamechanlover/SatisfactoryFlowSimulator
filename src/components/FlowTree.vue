<template>
    <div class="frame">
        <div class="product-select-box">
            <span>製品名：</span>
            <select @change="onProductChange">
                <option value>-- 製品選択 --</option>
                <option v-for="option in options" :key="option"
                    :class="{category: isCategoryOption(option)}"
                    :disabled="isCategoryOption(option)"
                    :value="option">
                    {{ (isCategoryOption(option)) ? option : materialName(option) }}
                </option>
            </select>
        </div>
        <div class="flow-view-box">
            <FlowView v-if="currentProducts.length > 0"></FlowView>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from 'vue'
import { useConfigStore } from '@/stores/config_store'
import { useFlowStore } from '@/stores/flow_store'


/** プロパティを定義 */
const Props = {
    /** 制作フローパス */
    flowPath: {
        type: String,
        default: '',
    }
};

/** テンプレート参照する定義 */
interface Refs {
    frame: Ref<HTMLElement|null>,
}

export default defineComponent({
    name: 'flow-view',
    props: Props,
    setup(props) {
        const configStore = useConfigStore();
        const flowStore = useFlowStore();
        const refs: Refs = {
            frame: ref(null),
        };

        // computed
        const computes = {
            options: computed(() => {
                const productMaterialIds = configStore.productMaterialIds;
                const categoryIds = configStore.materialCategoryIds;
                let options: string[] = [];
                categoryIds.forEach((categoryId: string) => {
                    // 入力素材のあるレシピを持つ素材IDリストから対象カテゴリのものを取得
                    const categoryMaterialIds = productMaterialIds.filter((materialId: string) => {
                        return configStore.materialCategory(materialId) == categoryId;
                    });
                    // 対象の素材が１つも見つからないカテゴリばスキップ
                    if (!categoryMaterialIds.length) return;
                    // 選択肢に追加
                    const categoryName = configStore.materialCategoryName(categoryId);
                    options.push('■ ' + categoryName);
                    options = options.concat(categoryMaterialIds);
                });
                return options;
            }),
            isCategoryOption: computed(() => (option: string) => {
                return option.startsWith('■');
            }),
            materialName: computed(() => (materialId: string) => {
                return configStore.materialName(materialId);
            }),
            currentProducts: computed((): string[] => {
                return flowStore.products;
            }),
        };

        // methods
        const methods = {
            onProductChange: (event: Event) => {
                if (!(event.target instanceof HTMLSelectElement)) return;
                flowStore.setMaterialId([], event.target.value);
            },
        };

        return {
            ...props,
            ...refs,
            ...computes,
            ...methods,
        };
    },
});
</script>

<style src="@/to_dark_theme.css" scoped />

<style scoped>
.frame {
    width: 100%;
    display: flex;
    flex-direction: column;
}
.product-select-box {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}
.product-select-box select {
    flex:1;
}
.product-select-box select option.category {
    background: orange;
    color: black;
    font-weight: bold;
    font-size: 1.2em;
}
</style>