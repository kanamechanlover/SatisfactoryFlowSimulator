import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import {
    Config,
    ConfigCategory,
    MachinePortType,
    MaterialState,
    RecipeMaterialList,
    ConfigRecipeMaterial,
    ConfigMachine,
    ConfigMaterial,
    ConfigRecipe,
    ConfigRecipeList
} from '@/defines/types/config';
import Logger from '@/logics/logger'
import logger from '@/logics/logger';

export const useConfigStore = defineStore('config', {
    state: () => {
        return {
            /** 設定本体 */
            config: new Config(),
            /** ユニークキー */
            uniqueKey: 0,
            /** 更新中フラグ */
            updating: false,
            /**
             * 非同期実行中の処理数
             * - Promise に実行中の処理追加はできないので作成
             */
            processingNumber: 0,
        };
    },
    getters: {
        /** 設定をそのまま取得 */
        rowConfig(state): Config {
            return state.config;
        },
        /** 更新中フラグ */
        isUpdating(state): boolean {
            return state.updating;
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
        /** 設備のカテゴリ名を取得 */
        machineCategoryName(state) {
            return (categoryId: string): string => {
                const machineCategory = state.config.machineCategories.find((v) => v.id == categoryId);
                return (machineCategory) ? machineCategory.name : '';
            };
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
         * @param categoryId [in] カテゴリID
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
         * @param machineId [in] 設備ID
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
         * @param categoryId [in] 設備カテゴリID
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
         * @param id [in] 設備ID
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
         * 設備の入力ポート数取得
         * @param id [in] 設備ID
         * @returns 設備の入力ポート数
         */
        machineInputPortNumber(state) {
            return (id: string): number =>  {
                const machine = state.config.machines.find((machine) => machine.id == id)
                if (machine === undefined) return 0;
                return machine.inputNumber.conveyor + machine.inputNumber.pipe;
            };
        },
        /**
         * 設備の入力ポート数（タイプ指定）取得
         * @param id [in] 設備ID
         * @param type [in] 入力ポートタイプ（MachinePortType で指定）
         * @return 入力ポート数
         */
        machineInputPortNumberWithType(state) {
            return (id: string, type: string): number =>  {
                const machine = state.config.machines.find((machine) => machine.id == id)
                if (machine === undefined) return 0;
                return machine.inputNumber.getWithType(type);
            };
        },
        /**
         * 設備の出力ポート数取得
         * @param id [in] 設備ID
         * @returns 設備の出力ポート数
         */
        machineOutputPortNumber(state) {
            return (id: string): number =>  {
                const machine = state.config.machines.find((machine) => machine.id == id)
                if (machine === undefined) return 0;
                return machine.outputNumber.conveyor + machine.outputNumber.pipe;
            };
        },
        /**
         * 設備の出力ポート数（タイプ指定）取得
         * @param id [in] 設備ID
         * @param type [in] 出力ポートタイプ（MachinePortType で指定）
         * @return 出力ポート数
         */
        machineOutputPortNumberWithType(state) {
            return (id: string, type: string): number =>  {
                const machine = state.config.machines.find((machine) => machine.id == id)
                if (machine === undefined) return 0;
                return machine.outputNumber.getWithType(type);
            };
        },
        /**
         * 設備の入力ポートのタイプ取得
         * @param id [in] 設備ID
         * @returns 設備の入力ポートのタイプ（例：'Conveyor'）
         */
        machineInputPortType(state) {
            return (id: string, index: number): string =>  {
                const machine = state.config.machines.find((machine) => machine.id == id)
                if (machine === undefined) return '';
                const conveyorNumber = machine.inputNumber.conveyor;
                const pipeNumber = machine.inputNumber.pipe;
                if (index < conveyorNumber) return MachinePortType.Conveyor;
                if (index < conveyorNumber + pipeNumber) return MachinePortType.Pipe;
                return '';
            };
        },
        /**
         * 設備の出力ポートのタイプ取得
         * @param id [in] 設備ID
         * @returns 設備の入力ポートのタイプ（例：'Conveyor'）
         */
        machineOutputPortType(state) {
            return (id: string, index: number): string =>  {
                const machine = state.config.machines.find((machine) => machine.id == id)
                if (machine === undefined) return '';
                const conveyorNumber = machine.outputNumber.conveyor;
                const pipeNumber = machine.outputNumber.pipe;
                if (index < conveyorNumber) return MachinePortType.Conveyor;
                if (index < conveyorNumber + pipeNumber) return MachinePortType.Pipe;
                return '';
            };
        },
        /**
         * 素材名取得
         * @param id [in] 素材ID
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
         * @param id [in] 素材ID
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
         * @param id [in] 素材ID
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
         * @param id [in] 素材ID
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
         * @param id [in] 素材ID
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
         * @param id [in] 素材ID
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
         * @param recipeName [in] レシピ名
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
         * @param recipeName [in] レシピ名
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
         * @param recipeName [in] レシピ名
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
         * @param recipeName [in] レシピ名
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
         * @param materialId [in] 素材ID
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
         * @param materialId [in] 素材ID
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
                const foundRecipes:ConfigRecipeList = state.config.recipes.filter((recipe: ConfigRecipe) => {
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
         * @param recipeId [in] レシピID
         * @param materialId [in] 素材ID
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
        /** 更新開始 */
        beginUpdate() {
            // １つ目のプロセス開始時は更新中フラグを立てる
            if (this.processingNumber == 0) this.updating = true;
            // 実行中のプロセスに１つ追加
            this.processingNumber++;
        },
        /** 更新終了 */
        endUpdate() {
            if (this.processingNumber == 0) {
                // 更新開始と終了の数が合わないイレギュラー
                Logger.error('更新開始より終了の数が多い.', 'ConfigStore.endUpdate');
                return;
            }
            // 実行中のプロセスの１つ完了
            this.processingNumber--;
            // 最後のプロセスなら更新中フラグを落とす
            if (this.processingNumber == 0) this.updating = false;
        },
        /** 全設定処理 */
        setup(data: any) {
            this.beginUpdate();
            // 設定ファイルを元に設定構築
            this.config.deserialize(data);
            // レシピの入出力素材は、素材の状態（固体、液体、気体）でソートしておく
            const order = Object.keys(MaterialState);
            const wrap = (material: ConfigRecipeMaterial) => {
                const state = this.materialState(material.id);
                const value = order.indexOf(state);
                return { material: material, value: (value != -1) ? value: 0};
            };
            const unwrap = (v: any) => v.material;
            const compare = (a: any,b: any) => {
                if (a.value > b.value) return 1;
                if (a.value < b.value) return -1;
                return 0;
            };
            this.config.recipes.forEach((recipe: ConfigRecipe, index: number, array: ConfigRecipeList) => {
                if (recipe.input.length > 1) { // 2つ以上ある場合は順番をソート
                    array[index].input = recipe.input.map(wrap).sort(compare).map(unwrap);
                }
                if (recipe.output.length > 1) { // 2つ以上ある場合は順番をソート
                    array[index].output = recipe.output.map(wrap).sort(compare).map(unwrap);
                }
            });
            this.uniqueKey = this.config.setUniqueKey(this.uniqueKey);
            this.endUpdate();
        },

        // 以降設定エディタ用関数 ----------------------------------
        
        /**
         * 設定値更新を非同期で処理
         * @param func [in] 非同期で処理する関数（引数：reject）
         * @param onError [in] 処理に失敗した時に処理する関数（引数：data）
         * @note Promise を使用する為、引数 reject, data の意味はそちらを参照。
         * @note ここでは１つ処理をしたら終わりにしているので、resolve は func で使わない
         */
        process(func: Function, onError: Function|null = null) {
            this.beginUpdate();
            const promise = new Promise((resolve, reject) => {
                resolve(func(reject));
            }).finally(() => {
                this.endUpdate();
            });
            if (onError) {
                // 第2引数の指定があれば処理失敗時に呼び出す
                promise.catch((data) => onError(data));
            }
            else {
                // 指定が無ければデフォルトの処理を設定
                promise.catch((data) => {
                    Logger.error('設定変更に失敗');
                    Logger.error(data);
                });
            }
        },

        /**
         * バージョン変更
         * @param value [in] バージョン名
         */
        changeVersion(value: string) {
            this.process(() => {
                this.config.version = value;
                Logger.log('Changed version.', 'changeVersion');
            });
        },

        /** 設備カテゴリ追加 */ 
        addMachineCategory() {
            this.process(() => {
                let item = new ConfigCategory()
                item.uniqueKey = this.uniqueKey++;
                this.config.machineCategories.push(item);
                Logger.log('Added machine category.', 'addMachineCategory');
            });
        },
        /** 設備カテゴリ更新 */
        setMachineCategory(index: number, value: ConfigCategory) {
            if (index < 0 || index >= this.config.machineCategories.length) return; // イレギュラー
            this.process(() => {
                const oldValue = this.config.machineCategories[index].clone();
                this.config.machineCategories[index].assign(value);
                Logger.log(`Changed machine category at.${index} id.${oldValue.id}`, 'setMachineCategory');
                // 影響
                const newValue = this.config.machineCategories[index];
                this.effectMachineCategory(oldValue, newValue);
            });
        },
        /** 設備カテゴリ削除 */
        deleteMachineCategory(index: number) {
            if (index < 0 || index >= this.config.machineCategories.length) return; // イレギュラー
            this.process(() => {
                const oldValue = this.config.machineCategories.splice(index, 1)[0];
                Logger.log(`Deleted machine category at.${index} id.${oldValue.id}`, 'deleteMachineCategory');
                // 影響
                const newValue = new ConfigCategory();
                this.effectMachineCategory(oldValue, newValue);
            });
        },
        /**
         * 設備カテゴリ変更による影響（内部用）
         * @param oldValue [in] 変更前の値
         * @param newValue [in] 変更後の値
         */
        effectMachineCategory(oldValue: ConfigCategory, newValue: ConfigCategory) {
            // 素材への影響
            this.config.machines.map((v, i) => ({i, v})).filter((machine) => {
                return machine.v.category == oldValue.id;
            }).forEach((machine) => {
                machine.v.category = newValue.id;
                Logger.log(`Effected to machine at.${machine.i} id.${machine.v.id}`);
            });
        },

        /** 素材カテゴリ追加 */
        addMaterialCategory() {
            this.beginUpdate();
            let item = new ConfigCategory()
            item.uniqueKey = this.uniqueKey++;
            this.config.materialCategories.push(item);
            Logger.log('Added material category.', 'addMaterialCategory');
            this.endUpdate();
        },
        /** 素材カテゴリ更新 */
        setMaterialCategory(index: number, value: ConfigCategory) {
            if (index < 0 || index >= this.config.materialCategories.length) return; // イレギュラー
            this.process(() => {
                const oldValue = this.config.materialCategories[index].clone();
                this.config.materialCategories[index].assign(value);
                Logger.log(`Changed material category at.${index} id.${oldValue.id}`, 'setMaterialCategory');
                // 影響
                const newValue = this.config.materialCategories[index];
                this.effectMaterialCategory(oldValue, newValue);
            });
        },
        /** 素材カテゴリ削除 */
        deleteMaterialCategory(index: number) {
            if (index < 0 || index >= this.config.materialCategories.length) return; // イレギュラー
            this.process(() => {
                const oldValue = this.config.materialCategories.splice(index, 1)[0];
                Logger.log(`Deleted material category at.${index} id.${oldValue.id}`, 'deleteMaterialCategory');
                // 影響
                const newValue = new ConfigCategory();
                this.effectMaterialCategory(oldValue, newValue);
            });
        },
        /** 
         * 素材カテゴリ変更による影響（内部用）
         * @param oldValue [in] 変更前の値
         * @param newValue [in] 変更後の値
          */
        effectMaterialCategory(oldValue: ConfigCategory, newValue: ConfigCategory) {
            // 素材への影響
            this.config.materials.map((v, i) => ({i, v})).filter((material) => {
                return material.v.category == oldValue.id;
            }).forEach((material) => {
                material.v.category = newValue.id;
                Logger.log(`Effected to material at.${material.i} id.${material.v.id}`);
            });
        },

        /** 設備追加 */
        addMachine() {
            this.process(() => {
                let item = new ConfigMachine()
                item.uniqueKey = this.uniqueKey++;
                this.config.machines.push(item);
                Logger.log('Added machine.', 'addMachine');
            });
        },
        /** 設備更新 */
        setMachine(index: number, value: ConfigMachine) {
            if (index < 0 || index >= this.config.machines.length) return;
            this.process(() => {
                const oldValue = this.config.machines[index].clone();
                this.config.machines[index].assign(value);
                Logger.log(`Changed machine at.${index} id.${oldValue.id}`, 'setMachine');
                // 影響
                const newValue = this.config.machines[index];
                this.effectMachine(oldValue, newValue);
            });
        },
        /** 設備削除 */
        deleteMachine(index: number) {
            if (index < 0 || index >= this.config.machines.length) return; // イレギュラー
            this.process(() => {
                const oldValue = this.config.machines.splice(index, 1)[0];
                Logger.log(`Deleted machine at.${index} id.${oldValue.id}`, 'deleteMachine');
                // 影響
                const newValue = new ConfigMachine();
                this.effectMachine(oldValue, newValue);
            });
        },
        /**
         * 設備変更による影響（内部用）
         * @param oldValue [in] 変更前の値
         * @param newValue [in] 変更後の値
          */
        effectMachine(oldValue: ConfigMachine, newValue: ConfigMachine) {
            // レシピへの影響
            this.config.recipes.map((v, i) => ({i, v})).filter((recipe) => {
                return recipe.v.machineId == oldValue.id;
            }).forEach((recipe) => {
                recipe.v.machineId = newValue.id;
                Logger.log(`Effected to recipe at.${recipe.i} name.${recipe.v.name}`);
            });
        },

        /** 素材追加 */
        addMaterial() {
            this.process(() => {
                let item = new ConfigMaterial();
                item.uniqueKey = this.uniqueKey++;
                this.config.materials.push(item);
                Logger.log('Added material.', 'addMaterial');
            });
        },
        /** 素材更新 */
        setMaterial(index: number, value: ConfigMaterial) {
            if (index < 0 || index >= this.config.materials.length) return;
            this.process(() => {
                const oldValue = this.config.materials[index].clone();
                this.config.materials[index].assign(value);
                Logger.log(`Changed material at.${index} id.${oldValue.id}`, 'setMaterial');
                // 影響
                const newValue = this.config.materials[index];
                this.effectMaterial(oldValue, newValue);
            });
        },
        /** 素材削除 */
        deleteMaterial(index: number) {
            if (index < 0 || index >= this.config.materials.length) return;
            this.process(() => {
                const oldValue = this.config.materials.splice(index, 1)[0];
                Logger.log(`Deleted material at.${index} id.${oldValue.id}`, 'deleteMaterial');
                // 影響
                const newValue = new ConfigMaterial();
                this.effectMaterial(oldValue, newValue);
            });
        },
        /**
         * 設備変更による影響（内部用）
         * @param oldValue [in] 変更前の値
         * @param newValue [in] 変更後の値
          */
        effectMaterial(oldValue: ConfigMaterial, newValue: ConfigMaterial) {
            // レシピへの影響
            this.config.recipes.map((v, i) => ({i, v})).filter((recipe) => {
                return (recipe.v.input.some((v) => v.id == oldValue.id)
                    ||  recipe.v.output.some((v) => v.id == oldValue.id));
            }).forEach((recipe) => {
                recipe.v.input.forEach((v) => {
                    if (v.id == oldValue.id) {
                        v.id = newValue.id;
                        Logger.log(`Effected to input of recipe at.${recipe.i} name.${recipe.v.name}`);
                    }
                });
                recipe.v.output.forEach((v) => {
                    if (v.id == oldValue.id) {
                        v.id = newValue.id;
                        Logger.log(`Effected to output of recipe at.${recipe.i} name.${recipe.v.name}`);
                    }
                });
            });
        },

        /** レシピ追加 */
        addRecipe() {
            this.process(() => {
                let item = new ConfigRecipe()
                item.uniqueKey = this.uniqueKey++;
                this.config.recipes.push(item);
                Logger.log('Added recipe.', 'addRecipe');
            });
        },
        /** 素材更新 */
        setRecipe(index: number, value: ConfigRecipe) {
            this.process(() => {
                if (index < 0 || index >= this.config.recipes.length) return;
                const oldValue = this.config.recipes[index].clone();
                this.config.recipes[index].assign(value);
                Logger.log(`Changed recipe at.${index} name.${oldValue.name}`, 'setRecipe');
            });
        },
        /** 素材削除 */
        deleteRecipe(index: number) {
            if (index < 0 || index >= this.config.recipes.length) return;
            this.process(() => {
                const oldValue = this.config.recipes.splice(index, 1)[0];
                Logger.log(`Deleted recipe at.${index} name.${oldValue.name}`, 'deleteRecipe');
            });
        },
    }
});
