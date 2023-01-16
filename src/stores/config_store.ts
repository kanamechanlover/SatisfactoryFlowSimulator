import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import {
    Config,
    MachinePortType,
    MaterialState,
    RecipeMaterialList,
    ConfigMaterial,
    ConfigRecipe,
    RecipeList
} from '@/defines/types/config';


export const useConfigStore = defineStore('config', {
    state: () => {
        return {
            config: new Config()
        };
    },
    getters: {
        /** 設定をそのまま取得 */
        rowConfig(state): Config {
            return state.config;
        },
        /** 設定のバージョンを取得 */
        version(state): string {
            return state.config.version;
        },
        /** レシピデータ取得 */
        recipe(state) {
            return (recipeName: string): ConfigRecipe|undefined => {
                if (!recipeName) return undefined;
                return state.config.recipes.find((recipe: ConfigRecipe) => {
                    return recipe.name == recipeName;
                });
            };
        },
        /** 設備のカテゴリIDリストを取得 */
        machineCategoryIds(state): string[] {
            return state.config.machineCategories.map((category) => category.id);
        },
        /** 設備のカテゴリ名リストを取得 */
        machineCategoryNames(state): string[] {
            return state.config.machineCategories.map((category) => category.name);
        },
        /** 素材のカテゴリIDリストを取得 */
        materialCategoryIds(state): string[] {
            return state.config.materialCategories.map((category) => category.id);
        },
        /** 素材のカテゴリ名リストを取得 */
        materialCategoryNames(state): string[] {
            return state.config.materialCategories.map((category) => category.name);
        },
        /** 素材IDリストを取得 */
        materialIds(state) {
            return state.config.materials.map((material) => material.id);
        },
        /**
         * 素材のカテゴリ名を取得
         * @param [in] categoryId カテゴリID
         */
        materialCategoryName(state) {
            return (categoryId: string): string => {
                const category = state.config.materialCategories.find((category) => category.id === categoryId);
                return (category) ? category.name : '';
            }
        },
        /** 設備IDリストを取得 */
        machineIds(state): Array<string> {
            return state.config.machines.map((machine) => machine.id);
        },
        /** レシピ名リスト取得 */
        recipeNames(state): Array<string> {
            return state.config.recipes.map((recipe: ConfigRecipe) => recipe.name);
        },
        /**
         * 指定設備で使用できるレシピ名リストを取得
         * @param [in] machineId 設備ID
         * @returns レシピ名リスト
         */
        recipeNameForMachine(state) {
            return (machineId: string): Array<string> => {
                return state.config.recipes.filter((recipe: ConfigRecipe) => {
                    return machineId == recipe.machineId;
                }).map((recipe: ConfigRecipe) => recipe.name);
            };
        },
        /**
         * 指定設備カテゴリで使用できるレシピ名リストを取得
         * @param [in] categoryId 設備カテゴリID
         * @returns レシピ名リスト
         */
        recipeNameListForMachineCategory(state) {
            return (categoryId: string): Array<string> => {
                return (state.config.recipes.map((recipe: ConfigRecipe) => {
                    return [recipe.name, recipe.machineId]; // どのレシピか分かるようにレシピ名も入れる
                })).filter((data) => {
                    const recipeName = data[0];
                    const machineId = data[1];
                    const machine = state.config.machines.find((machine) => machine.category == categoryId);
                    return machine !== undefined;
                }).map((data) => data[0]);
            };
        },
        /**
         * 設備名取得
         * @param [in] id 設備ID
         * @returns 設備名
         */
        machineName(state) {
            return (id: string): string =>  {
                const machine = state.config.machines.find((machine) => machine.id == id)
                if (machine === undefined) return '';
                return machine.name;
            };
        },
        /**
         * 設備の入力口数取得
         * @param [in] id 設備ID
         * @returns 設備の入力口数
         */
        machineInputPortNumber(state) {
            return (id: string): number =>  {
                const machine = state.config.machines.find((machine) => machine.id == id)
                if (machine === undefined) return 0;
                return machine.inputNumber.conveyor + machine.inputNumber.pipe;
            };
        },
        /**
         * 設備の出力口数取得
         * @param [in] id 設備ID
         * @returns 設備の出力口数
         */
        machineOutputPortNumber(state) {
            return (id: string): number =>  {
                const machine = state.config.machines.find((machine) => machine.id == id)
                if (machine === undefined) return 0;
                return machine.outputNumber.conveyor + machine.outputNumber.pipe;
            };
        },
        /**
         * 設備の入力口のタイプ取得
         * @param [in] id 設備ID
         * @returns 設備の入力口のタイプ（例：'Conveyor'）
         */
        machineInputPortType(state) {
            return (id: string, index: number): string =>  {
                const machine = state.config.machines.find((machine) => machine.id == id)
                if (machine === undefined) return '';
                const conveyorNumber = machine.inputNumber.conveyor;
                const pipeNumber = machine.inputNumber.pipe;
                if (index <= conveyorNumber) return MachinePortType.Conveyor;
                if (index <= conveyorNumber + pipeNumber) return MachinePortType.Pipe;
                return '';
            };
        },
        /**
         * 設備の出力口のタイプ取得
         * @param [in] id 設備ID
         * @returns 設備の入力口のタイプ（例：'Conveyor'）
         */
        machineOutputPortType(state) {
            return (id: string, index: number): string =>  {
                const machine = state.config.machines.find((machine) => machine.id == id)
                if (machine === undefined) return '';
                const conveyorNumber = machine.outputNumber.conveyor;
                const pipeNumber = machine.outputNumber.pipe;
                if (index <= conveyorNumber) return MachinePortType.Conveyor;
                if (index <= conveyorNumber + pipeNumber) return MachinePortType.Pipe;
                return '';
            };
        },
        /**
         * 素材名取得
         * @param [in] id 素材ID
         * @returns 素材名
         */
        materialName(state) {
            return (id: string): string =>  {
                const material = state.config.materials.find((material) => material.id == id)
                return (material) ? material.name : '';
            };
        },
        /**
         * 素材の状態を取得
         * @param [in] id 素材ID
         * @returns Solid | Fluid | Gas 無ければ 空文字列
         */
        materialState(state) {
            return (id: string): string =>  {
                const material = state.config.materials.find((material) => material.id == id)
                return (material) ? material.state : '';
            };
        },
        /**
         * 固体素材か
         * @param [in] id 素材ID
         * @returns true: 固体素材、false それ以外または素材IDが無い
         */
        isSolidMaterial(state) {
            return (id: string): boolean =>  {
                const material = state.config.materials.find((material) => material.id === id)
                return (material) ? material.state == 'Solid' : false;
            };
        },
        /**
         * 液体素材か
         * @param [in] id 素材ID
         * @returns true: 液体素材、false それ以外または素材IDが無い
         */
        isFluidMaterial(state) {
            return (id: string): boolean =>  {
                const material = state.config.materials.find((material) => material.id === id)
                return (material) ? material.state == 'Fluid' : false;
            };
        },
        /**
         * 気体素材か
         * @param [in] id 素材ID
         * @returns true: 気体素材、false それ以外または素材IDが無い
         */
        isGasMaterial(state) {
            return (id: string): boolean =>  {
                const material = state.config.materials.find((material) => material.id === id)
                return (material) ? material.state == 'Gas' : false;
            };
        },
        /**
         * 素材の単位を取得
         * @param [in] id 素材ID
         * @returns 素材の単位（'個' | '㎥'）、素材IDが無ければ空文字列
         */
        materialUnit(state) {
            return (id: string): string =>  {
                const material = state.config.materials.find((material) => material.id === id)
                if (!material) return '';
                return MaterialState[material.state].Unit;
            };
        },
        /**
         * 素材のカテゴリIDを取得
         * @param id 素材ID
         * @return カテゴリID
         */
        materialCategory(state) {
            return (id: string): string =>  {
                const material = state.config.materials.find((material) => material.id === id)
                return (material) ? material.category : '';
            };
        },
        /**
         * レシピを使用可能な設備IDを取得
         * @param [in] recipeName レシピ名
         * @returns レシピを使用可能な設備ID
         */
        machineIdForRecipe(state) {
            return (recipeName: string): string => {
                const recipe = this.recipe(recipeName);
                if (recipe === undefined) return '';
                return recipe.machineId;
            };
        },
        /**
         * レシピの入力素材リスト取得
         * @param [in] recipeName レシピ名
         * @returns レシピの入力素材リスト
         */
        recipeInput(state) {
            return (recipeName: string): RecipeMaterialList => {
                const recipe = this.recipe(recipeName);
                if (recipe === undefined) return [];
                return recipe.input;
            };
        },
        /**
         * レシピの出力素材リスト取得
         * @param [in] recipeName レシピ名
         * @returns レシピの出力素材リスト
         */
        recipeOutput(state) {
            return (recipeName: string): RecipeMaterialList => {
                const recipe = this.recipe(recipeName);
                if (recipe === undefined) return [];
                return recipe.output;
            };
        },
        /**
         * レシピの制作時間取得
         * @param [in] recipeName レシピ名
         * @returns レシピの制作時間
         */
        productTime(state) {
            return (recipeName: string): number => {
                const recipe = this.recipe(recipeName);
                if (recipe === undefined) return 0;
                return recipe.productTime;
            };
        },
        /**
         * 出力に指定の素材IDを持つレシピ名を取得
         * @param [in] materialId 素材ID
         * @returns レシピ名リスト
         */
        recipeNamesHasOutputMaterialId(state) {
            return (materialId: string): Array<string> => {
                return state.config.recipes.filter((recipe: ConfigRecipe) => {
                    return recipe.output.find((v) => v && v.id == materialId) !== undefined;
                }).map((recipe: ConfigRecipe) => recipe.name);
            };
        },
        /**
         * デフォルトのレシピ名を取得
         * @param [in] materialId 素材ID
         * @returns レシピ名（見つからなければ空文字列）
         * @note デフォルトレシピ判定方法
         *       1. 素材名と同名レシピがあれば最優先、
         *       2.「代替」と付くレシピは除外した上で、
         *          - 単体生産レシピなら優先選択
         *          - 生産対象に指定素材があれば選択
        */
        defaultRecipeId(state) {
            return (materialId:string): string => {
                // レシピ名が素材名と同じものを探す
                const materialName = this.materialName(materialId);
                const foundRecipes:RecipeList = state.config.recipes.filter((recipe: ConfigRecipe) => {
                    return recipe.name === materialName
                });
                if (foundRecipes.length) return foundRecipes[0].name;
                // 制作物IDが素材IDと同じものを探す
                const recipeList = this.recipeNamesHasOutputMaterialId(materialId);
                if (recipeList.length == 1 ) return recipeList[0];
                // レシピが複数ある場合はさらにフィルタして１つにする
                // - レシピ名に「代替」と付くものは除外
                const nonAlternativeRecipeList = recipeList.filter((recipeName) => {
                    return !recipeName.startsWith('代替');
                });
                // 1. 副産物の無い単体生産レシピがあれば優先
                const sigleProductRecipeList = nonAlternativeRecipeList.filter((recipeName) => {
                    return this.recipeOutput(recipeName).filter((v) => v).length == 1;
                });
                if (sigleProductRecipeList.length > 0) return sigleProductRecipeList[0];
                // 2. 生産対象に指定素材があればそれを選択
                const byproductRecipeList = nonAlternativeRecipeList.filter((recipeName) => {
                    return this.recipeOutput(recipeName).find((v) => v && v.id == materialId);
                });
                if (byproductRecipeList.length > 0) return byproductRecipeList[0];
                return '';
            };
        },
        /**
         * レシピのデフォルトの生産数を取得
         * @param [in] recipeId レシピID
         * @param [in] materialId 素材ID
         * @return 指定素材の生産数（/分）
         */
        defaultProductNumber(state) {
            return (recipeId: string, materialId: string): number => {
                const recipe: ConfigRecipe|undefined = this.recipe(recipeId);
                if (!recipe) return 0; // レシピ無し
                // １回あたりの生産数
                const single = recipe.output.find((v) => v.id == materialId);
                if (!single) return 0; // 指定素材がレシピに無し
                // 分間の生産レート
                const ratePerMinute = 60 / recipe.productTime;
                return single.number * ratePerMinute;
            };
        },
        /**
         * 入力素材を持つレシピリスト取得
         * @return レシピリスト
         */
        recipesWithInput(state): Array<ConfigRecipe> {
            return state.config.recipes.filter((recipe: ConfigRecipe) => {
                return recipe.input.some((v) => v);
            });
        },
        /**
         * 入力素材のあるレシピを持つ素材IDリストを取得
         * @return 素材IDリスト
         */
        productMaterialIds(state): Array<string> {
            // 入力素材のあるレシピを取得
            const recipesWithInput = this.recipesWithInput;
            return state.config.materials.filter((material: ConfigMaterial) => {
                return recipesWithInput.some((recipe: ConfigRecipe) => {
                    return recipe.output.some((v) => v && v.id == material.id);
                });
            }).map((v) => v.id);
        },
    },
    actions: {
        setup(data: any) {
            this.rowConfig.deserialize(data);
        }
    }
});
