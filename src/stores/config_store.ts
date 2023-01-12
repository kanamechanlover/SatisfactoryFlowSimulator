import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import {
    Config,
    MaterialState,
    MaterialStateUnit,
    ConfigRecipe,
    MateriStateUnitType,
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
                return state.config.recipes.find((recipe: ConfigRecipe) => {
                    return recipe.name == recipeName;
                });
            };
        },
        /** 設備のカテゴリIDリストを取得 */
        machineCategoryIds(state): string[] {
            return Object.keys(state.config.machineCategoryNames);
        },
        /** 設備のカテゴリ名リストを取得 */
        machineCategoryNames(state): string[] {
            return Object.values(state.config.machineCategoryNames);
        },
        /** 素材のカテゴリIDリストを取得 */
        materialCategoryIds(state): string[] {
            return Object.keys(state.config.materialCategoryNames);
        },
        /** 素材のカテゴリ名リストを取得 */
        materialCategoryNames(state): string[] {
            return Object.values(state.config.materialCategoryNames);
        },
        /**
         * 素材のカテゴリ名を取得
         * @param [in] categoryId カテゴリID
         */
        materialCategoryName(state) {
            return (categoryId: string): string => {
                if (!Object.keys(state.config.materialCategoryNames).includes(categoryId)) return '';
                return state.config.materialCategoryNames[categoryId];
            }
        },
        /** 資源素材リストを取得 */
        resources(state): string[] {
            return state.config.resources;
        },
        /** 設備IDリストを取得 */
        machineIdList(state): Array<string> {
            return Object.keys(state.config.machines);
        },
        /** レシピ名リスト取得 */
        recipeNameList(state): Array<string> {
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
                    return machineId in recipe.machineId;
                }).map((recipe: ConfigRecipe) => recipe.name);
            };
        },
        /**
         * 指定設備カテゴリで使用できるレシピ名リストを取得
         * @param [in] categoryId 設備ID
         * @returns レシピ名リスト
         */
        recipeNameListForMachineCategory(state) {
            return (categoryId: string): Array<string> => {
                return (state.config.recipes.map((recipe: ConfigRecipe) => {
                    return [recipe.name, recipe.machineId]; // どのレシピか分かるようにレシピ名も入れる
                }) as Array<Array<string>>).filter((data) => {
                    return state.config.machines[data[1]].category == categoryId;
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
                if (!(id in state.config.machines)) return '';
                return state.config.machines[id].name;
            };
        },
        /**
         * 素材名取得
         * @param [in] id 素材ID
         * @returns 素材名
         */
        materialName(state) {
            return (id: string): string => {
                if (!(id in state.config.materials)) return '';
                return state.config.materials[id].name;
            };
        },
        /**
         * 素材の状態を取得
         * @param [in] id 素材ID
         * @returns Solid | Fluid | Gas 無ければ 空文字列
         */
        materialState(state) {
            return (id: string): MaterialState | string => {
                if (!(id in state.config.materials)) return '';
                return state.config.materials[id].state;
            };
        },
        /**
         * 固体素材か
         * @param [in] id 素材ID
         * @returns true: 固体素材、false それ以外または素材IDが無い
         */
        isSolidMaterial(state) {
            return (id: string): boolean => {
                if (!(id in state.config.materials)) return false;
                return state.config.materials[id].state == 'Solid';
            };
        },
        /**
         * 液体素材か
         * @param [in] id 素材ID
         * @returns true: 液体素材、false それ以外または素材IDが無い
         */
        isFluidMaterial(state) {
            return (id: string): boolean => {
                if (!(id in state.config.materials)) return false;
                return state.config.materials[id].state == 'Fluid';
            };
        },
        /**
         * 気体素材か
         * @param [in] id 素材ID
         * @returns true: 気体素材、false それ以外または素材IDが無い
         */
        isGasMaterial(state) {
            return (id: string): boolean => {
                if (!(id in state.config.materials)) return false;
                return state.config.materials[id].state == 'Gas';
            };
        },
        /**
         * 素材の単位を取得
         * @param [in] id 素材ID
         * @returns 素材の単位（'個' | '㎥'）、素材IDが無ければ空文字列
         */
        materialUnit(state) {
            return (id: string): string => {
                if (!(id in state.config.materials)) return '';
                const materialState = state.config.materials[id].state as MateriStateUnitType;
                return MaterialStateUnit[materialState];
            };
        },
        /**
         * 素材のカテゴリIDを取得
         * @param id 素材ID
         * @return カテゴリID
         */
        materialCategory(state) {
            return (id: string): string => {
                if (!(id in state.config.materials)) return '';
                return state.config.materials[id].category;
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
                return recipe.machineId[0];
            };
        },
        /**
         * レシピの入力素材リスト取得
         * @param [in] recipeName レシピ名
         * @returns レシピの入力素材リスト key=素材ID、value=必要数
         */
        recipeInput(state) {
            return (recipeName: string): any => {
                const recipe = this.recipe(recipeName);
                if (recipe === undefined) return {};
                return recipe.input;
            };
        },
        /**
         * レシピの出力素材リスト取得
         * @param [in] recipeName レシピ名
         * @returns レシピの出力素材リスト key=素材ID、value=必要数
         */
        recipeOutput(state) {
            return (recipeName: string): any => {
                const recipe = this.recipe(recipeName);
                if (recipe === undefined) return {};
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
                    return Object.keys(recipe.output).indexOf(materialId) != -1;
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
                    return Object.keys(this.recipeOutput(recipeName)).length == 1;
                });
                if (sigleProductRecipeList.length > 0) return sigleProductRecipeList[0];
                // 2. 生産対象に指定素材があればそれを選択
                const byproductRecipeList = nonAlternativeRecipeList.filter((recipeName) => {
                    return Object.keys(this.recipeOutput(recipeName)).includes(materialId);
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
                const single = recipe.output[materialId];
                if (!single) return 0; // 指定素材がレシピに無し
                // 分間の生産レート
                const ratePerMinute = 60 / recipe.productTime;
                return single * ratePerMinute;
            };
        },
        /**
         * 入力素材のあるレシピを持つ素材IDリストを取得
         * @return 素材IDリスト
         */
        productMaterialIds(state): Array<string> {
            return Object.keys(state.config.materials).filter((materialId: string) => {
                // 入力素材のあるレシピを持つか調査
                return state.config.recipes.find((recipe: ConfigRecipe) => {
                    const inputIds = Object.keys(recipe.input);
                    const outputIds = Object.keys(recipe.output);
                    return outputIds.includes(materialId) && inputIds.length > 0;
                });
            });
        },
    },
    actions: {
        setup(data: any) {
            this.rowConfig.deserialize(data);
        }
    }
});