import { defineStore } from 'pinia'
import {
    Config,
    ConfigCategory,
    MaterialState,
    RecipeMaterialList,
    ConfigMachine,
    ConfigMaterial,
    ConfigRecipe,
} from '@/defines/types/config';
import Logger from '@/logics/logger'

/**
 * 設定ストア
 * - 設定データを管理する
 * - 設定値変更中は updating フラグを true にしておく（変更した設定の反映タイミング制御の為）
 * - 更新処理自体は非同期で行うが、Promise は途中で処理追加ができない為、
 *   実行中の処理の数をカウントして 0 になったタイミングで updating フラグを false にする。
 */
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
        /** 更新中フラグ */
        isUpdating(state): boolean {
            return state.updating;
        },

        /* ------------------------------------------------
        - 設定のバージョン
        ------------------------------------------------ */

        /** 設定のバージョンを取得 */
        version(state): string {
            return state.config.version;
        },

        /* ------------------------------------------------
        - 設定カテゴリ
        ------------------------------------------------ */

        /** 設備のカテゴリIDリストを取得 */
        machineCategoryIds(state): Array<string> {
            return state.config.machineCategories.map((category) => category.id);
        },

        /** 設備のカテゴリ名を取得 */
        machineCategoryName(state) {
            return (categoryId: string): string => {
                const machineCategory = state.config.machineCategories.find((v) => v.id == categoryId);
                return (machineCategory) ? machineCategory.name : '';
            };
        },

        /* ------------------------------------------------
        - 素材カテゴリ
        ------------------------------------------------ */

        /** 素材のカテゴリIDリストを取得 */
        materialCategoryIds(state): Array<string> {
            return state.config.materialCategories.map((category) => category.id);
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

        /* ------------------------------------------------
        - 設備
        ------------------------------------------------ */

        /** 設備IDリストを取得 */
        machineIds(state): Array<string> {
            return state.config.machines.map((machine) => machine.id);
        },

        /**
         * 設備名取得
         * @param machineId [in] 設備ID
         * @returns 設備名
         */
        machineName(state) {
            return (machineId: string): string =>  {
                const machine = state.config.machines.find((machine) => machine.id == machineId)
                if (machine === undefined) return '';
                return machine.name;
            };
        },

        /**
         * 設備の入力ポート数取得
         * @param machineId [in] 設備ID
         * @returns 設備の入力ポート数
         */
        machineInputPortNumber(state) {
            return (machineId: string): number =>  {
                const machine = state.config.machines.find((machine) => machine.id == machineId)
                if (machine === undefined) return 0;
                return machine.inputNumber.conveyor + machine.inputNumber.pipe;
            };
        },

        /**
         * 設備の入力ポート数（タイプ指定）取得
         * @param machineId [in] 設備ID
         * @param portType [in] 入力ポートタイプ（MachinePortType で指定）
         * @return 入力ポート数
         */
        machineInputPortNumberWithType(state) {
            return (machineId: string, portType: string): number =>  {
                const machine = state.config.machines.find((machine) => machine.id == machineId)
                if (machine === undefined) return 0;
                return machine.inputNumber.getNumberWithType(portType);
            };
        },

        /**
         * 設備の出力ポート数取得
         * @param machineId [in] 設備ID
         * @returns 設備の出力ポート数
         */
        machineOutputPortNumber(state) {
            return (machineId: string): number =>  {
                const machine = state.config.machines.find((machine) => machine.id == machineId)
                if (machine === undefined) return 0;
                return machine.outputNumber.conveyor + machine.outputNumber.pipe;
            };
        },

        /**
         * 設備の出力ポート数（タイプ指定）取得
         * @param machineId [in] 設備ID
         * @param type [in] 出力ポートタイプ（MachinePortType で指定）
         * @return 出力ポート数
         */
        machineOutputPortNumberWithType(state) {
            return (machineId: string, type: string): number =>  {
                const machine = state.config.machines.find((machine) => machine.id == machineId)
                if (machine === undefined) return 0;
                return machine.outputNumber.getNumberWithType(type);
            };
        },

        /* ------------------------------------------------
        - 素材
        ------------------------------------------------ */

        /** 素材IDリストを取得 */
        materialIds(state): Array<string> {
            return state.config.materials.map((material) => material.id);
        },

        /**
         * 素材名取得
         * @param materialId [in] 素材ID
         * @returns 素材名
         */
        materialName(state) {
            return (materialId: string): string =>  {
                const material = state.config.materials.find((material) => material.id == materialId)
                return (material) ? material.name : '';
            };
        },

        /**
         * 素材の状態を取得
         * @param materialId [in] 素材ID
         * @returns Solid | Fluid | Gas 無ければ 空文字列
         */
        materialState(state) {
            return (materialId: string): string =>  {
                const material = state.config.materials.find((material) => material.id == materialId)
                return (material) ? material.state : '';
            };
        },

        /**
         * 素材の単位を取得
         * @param materialId [in] 素材ID
         * @returns 素材の単位（'個' | '㎥'）、素材IDが無ければ空文字列
         */
        materialUnit(state) {
            return (materialId: string): string =>  {
                const material = state.config.materials.find((material) => material.id === materialId)
                if (!material) return '';
                return MaterialState[material.state].Unit;
            };
        },

        /**
         * 素材のカテゴリIDを取得
         * @param materialId 素材ID
         * @return カテゴリID
         */
        materialCategory(state) {
            return (materialId: string): string =>  {
                const material = state.config.materials.find((material) => material.id === materialId)
                return (material) ? material.category : '';
            };
        },

        /* ------------------------------------------------
        - レシピ
        ------------------------------------------------ */

        /** レシピIDリスト取得 */
        recipeIds(state): Array<string> {
            return state.config.recipes.map((recipe: ConfigRecipe) => recipe.id);
        },

        /** レシピデータ取得 */
        recipe(state) {
            return (recipeId: string): ConfigRecipe|undefined => {
                if (!recipeId) return undefined;
                return state.config.recipes.find((recipe: ConfigRecipe) => {
                    return recipe.id == recipeId;
                });
            };
        },

        /**
         * 指定設備で使用できるレシピIDリストを取得
         * @param machineId [in] 設備ID
         * @returns レシピIDリスト
         */
        recipeIdForMachine(state) {
            return (machineId: string): Array<string> => {
                return state.config.recipes.filter((recipe: ConfigRecipe) => {
                    return machineId == recipe.machineId;
                }).map((recipe: ConfigRecipe) => recipe.id);
            };
        },

        /**
         * レシピを使用可能な設備IDを取得
         * @param recipeId [in] レシピId
         * @returns レシピを使用可能な設備ID
         */
        machineIdForRecipe(state) {
            return (recipeId: string): string => {
                const recipe = this.recipe(recipeId);
                if (recipe === undefined) return '';
                return recipe.machineId;
            };
        },

        /**
         * レシピの入力素材リスト取得
         * @param recipeId [in] レシピID
         * @returns レシピの入力素材リスト
         */
        recipeInput(state) {
            return (recipeId: string): RecipeMaterialList => {
                const recipe = this.recipe(recipeId);
                if (recipe === undefined) return [];
                return recipe.input;
            };
        },

        /**
         * レシピの出力素材リスト取得
         * @param recipeId [in] レシピID
         * @returns レシピの出力素材リスト
         */
        recipeOutput(state) {
            return (recipeId: string): RecipeMaterialList => {
                const recipe = this.recipe(recipeId);
                if (recipe === undefined) return [];
                return recipe.output;
            };
        },

        /**
         * レシピの製作時間取得
         * @param recipeId [in] レシピID
         * @returns レシピの製作時間
         */
        recipeProductTime(state) {
            return (recipeId: string): number => {
                const recipe = this.recipe(recipeId);
                if (recipe === undefined) return 0;
                return recipe.productTime;
            };
        },

        /**
         * 出力に指定の素材IDを持つレシピを取得
         * @param materialId [in] 素材ID
         * @returns レシピリスト
         */
        recipesHasOutputMaterialId(state) {
            return (materialId: string): Array<ConfigRecipe> => {
                return state.config.recipes.filter((recipe: ConfigRecipe) => {
                    return recipe.output.find((v) => v && v.id == materialId) !== undefined;
                }).map((recipe: ConfigRecipe) => recipe);
            };
        },

        /**
         * デフォルトのレシピIDを取得
         * @param materialId [in] 素材ID
         * @returns レシピID（見つからなければ空文字列）
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
                const foundRecipes = state.config.recipes.filter((recipe: ConfigRecipe) => {
                    return recipe.name === materialName
                });
                if (foundRecipes.length > 0) return foundRecipes[0].id;
                // 製作物IDが素材IDと同じものを探す
                const recipes = this.recipesHasOutputMaterialId(materialId);
                if (recipes.length == 1) return recipes[0].id;
                // レシピが複数ある場合はさらにフィルタして１つにする
                // - レシピ名に「代替」と付くものは除外
                const nonAlternativeRecipeList = recipes.filter((recipe) => {
                    return !recipe.name.startsWith('代替');
                });
                // 1. 副産物の無い単体生産レシピがあれば優先
                const sigleProductRecipeList = nonAlternativeRecipeList.filter((recipe) => {
                    return recipe.output.filter((v) => v).length == 1;
                });
                if (sigleProductRecipeList.length > 0) return sigleProductRecipeList[0].id;
                // 2. 生産対象に指定素材があればそれを選択
                const byproductRecipeList = nonAlternativeRecipeList.filter((recipe) => {
                    return recipe.output.find((v) => v && v.id == materialId);
                });
                if (byproductRecipeList.length > 0) return byproductRecipeList[0].id;
                return '';
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

        /* ------------------------------------------------
        - 制御系
        ------------------------------------------------ */

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
            this.uniqueKey = this.config.setUniqueKey(this.uniqueKey);
            this.endUpdate();
        },

        // 以降設定エディタ用関数 ----------------------------------
        
        /**
         * 設定値更新を非同期で処理
         * @param func [in] 非同期で処理する関数（引数：reject）
         * @param onError [in] 処理に失敗した時に処理する関数（引数：data）※省略可
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

        /* ------------------------------------------------
        - 設定のバージョン
        ------------------------------------------------ */

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

        /* ------------------------------------------------
        - 設備カテゴリリスト
        ------------------------------------------------ */

        /** 設備カテゴリ追加 */ 
        addMachineCategory() {
            this.process(() => {
                let item = new ConfigCategory()
                item.uniqueKey = this.uniqueKey++;
                this.config.machineCategories.push(item);
                Logger.log('Added machine category.', 'ConfigStore.addMachineCategory');
            });
        },

        /** 
         * 設備カテゴリ更新
         * @param index [in] インデックス
         * @param value [in] 変更後の値
         * @return 処理開始の成否（true: 成功）
         */
        setMachineCategory(index: number, value: ConfigCategory): boolean {
            if (index < 0 || index >= this.config.machineCategories.length) return false; // イレギュラー
            // ID重複チェック
            const oldId = this.config.machineCategories[index].id;
            const newId = value.id;
            if (oldId != newId) {
                // ID の変更がある場合だけ重複チェック
                if (this.config.machineCategories.some((v, i) => i !== index && v.id == newId)) {
                    // 重複がある場合は変更を拒否
                    return false;
                }
            }
            // 処理開始
            this.process(() => {
                const oldValue = this.config.machineCategories[index].clone();
                this.config.machineCategories[index].assign(value);
                Logger.log(
                    `Changed machine category at.${index} id.${oldValue.id}`,
                    'ConfigStore.setMachineCategory');
                // 影響
                const newValue = this.config.machineCategories[index];
                this.effectMachineCategory(oldValue, newValue);
            });
            // 処理開始成功
            return true;
        },

        /**
         * 設備カテゴリ削除
         * @param index [in] インデックス
         * @return 処理開始の成否（true: 成功）
         */
        deleteMachineCategory(index: number): boolean {
            if (index < 0 || index >= this.config.machineCategories.length) return false; // イレギュラー
            this.process(() => {
                const oldValue = this.config.machineCategories.splice(index, 1)[0];
                Logger.log(
                    `Deleted machine category at.${index} id.${oldValue.id}`,
                    'ConfigStore.deleteMachineCategory');
                // 影響
                const newValue = new ConfigCategory();
                this.effectMachineCategory(oldValue, newValue);
            });
            return true;
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

        /* ------------------------------------------------
        - 素材カテゴリリスト
        ------------------------------------------------ */

        /** 素材カテゴリ追加 */
        addMaterialCategory() {
            this.beginUpdate();
            let item = new ConfigCategory()
            item.uniqueKey = this.uniqueKey++;
            this.config.materialCategories.push(item);
            Logger.log('Added material category.', 'ConfigStore.addMaterialCategory');
            this.endUpdate();
        },

        /**
         * 素材カテゴリ更新
         * @param index [in] インデックス
         * @param value [in] 変更後の値
         * @return 処理開始の成否（true: 成功）
         */
        setMaterialCategory(index: number, value: ConfigCategory): boolean {
            if (index < 0 || index >= this.config.materialCategories.length) return false; // イレギュラー
            // ID重複チェック
            const oldId = this.config.materialCategories[index].id;
            const newId = value.id;
            if (oldId != newId) {
                // ID の変更がある場合だけ重複チェック
                if (this.config.materialCategories.some((v, i) => i !== index && v.id == newId)) {
                    // 重複がある場合は変更を拒否
                    return false;
                }
            }
            // 処理開始
            this.process(() => {
                const oldValue = this.config.materialCategories[index].clone();
                this.config.materialCategories[index].assign(value);
                Logger.log(
                    `Changed material category at.${index} id.${oldValue.id}`,
                    'ConfigStore.setMaterialCategory');
                // 影響
                const newValue = this.config.materialCategories[index];
                this.effectMaterialCategory(oldValue, newValue);
            });
            // 処理開始成功
            return true;
        },

        /**
         * 素材カテゴリ削除
         * @param index [in] インデックス
         * @return 処理開始の成否（true: 成功）
         */
        deleteMaterialCategory(index: number): boolean {
            if (index < 0 || index >= this.config.materialCategories.length) return false; // イレギュラー
            this.process(() => {
                const oldValue = this.config.materialCategories.splice(index, 1)[0];
                Logger.log(
                    `Deleted material category at.${index} id.${oldValue.id}`,
                    'ConfigStore.deleteMaterialCategory');
                // 影響
                const newValue = new ConfigCategory();
                this.effectMaterialCategory(oldValue, newValue);
            });
            return true;
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
                Logger.log('Added machine.', 'ConfigStore.addMachine');
            });
        },

        /* ------------------------------------------------
        - 設備リスト
        ------------------------------------------------ */
        
        /**
         * 設備更新
         * @param index [in] インデックス
         * @param value [in] 変更後の値
         * @return 処理開始の成否（true: 成功）
         */
        setMachine(index: number, value: ConfigMachine): boolean {
            if (index < 0 || index >= this.config.machines.length) return false;
            // ID重複チェック
            const oldId = this.config.machines[index].id;
            const newId = value.id;
            if (oldId != newId) {
                // ID の変更がある場合だけ重複チェック
                if (this.config.machines.some((v, i) => i !== index && v.id == newId)) {
                    // 重複がある場合は変更を拒否
                    return false;
                }
            }
            // 処理開始
            this.process(() => {
                const oldValue = this.config.machines[index].clone();
                this.config.machines[index].assign(value);
                Logger.log(
                    `Changed machine at.${index} id.${oldValue.id}`,
                    'ConfigStore.setMachine');
                // 影響
                const newValue = this.config.machines[index];
                this.effectMachine(oldValue, newValue);
            });
            // 処理開始成功
            return true;
        },
        /**
         * 設備削除
         * @param index [in] インデックス
         * @return 処理開始の成否（true: 成功）
         */
        deleteMachine(index: number): boolean {
            if (index < 0 || index >= this.config.machines.length) return false; // イレギュラー
            this.process(() => {
                const oldValue = this.config.machines.splice(index, 1)[0];
                Logger.log(
                    `Deleted machine at.${index} id.${oldValue.id}`,
                    'ConfigStore.deleteMachine');
                // 影響
                const newValue = new ConfigMachine();
                this.effectMachine(oldValue, newValue);
            });
            return true;
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
                Logger.log(`Effected to recipe at.${recipe.i} id.${recipe.v.id}`);
            });
        },

        /* ------------------------------------------------
        - 素材リスト
        ------------------------------------------------ */

        /** 素材追加 */
        addMaterial() {
            this.process(() => {
                let item = new ConfigMaterial();
                item.uniqueKey = this.uniqueKey++;
                this.config.materials.push(item);
                Logger.log('Added material.', 'ConfigStore.addMaterial');
            });
        },

        /**
         * 素材更新
         * @param index [in] インデックス
         * @param value [in] 変更後の値
         * @return 処理開始の成否（true: 成功）
         */
        setMaterial(index: number, value: ConfigMaterial): boolean {
            if (index < 0 || index >= this.config.materials.length) return false;
            // ID重複チェック
            const oldId = this.config.materials[index].id;
            const newId = value.id;
            if (oldId != newId) {
                // ID の変更がある場合だけ重複チェック
                if (this.config.materials.some((v, i) => i !== index && v.id == newId)) {
                    // 重複がある場合は変更を拒否
                    return false;
                }
            }
            // 処理開始
            this.process(() => {
                const oldValue = this.config.materials[index].clone();
                this.config.materials[index].assign(value);
                Logger.log(
                    `Changed material at.${index} id.${oldValue.id}`,
                    'ConfigStore.setMaterial');
                // 影響
                const newValue = this.config.materials[index];
                this.effectMaterial(oldValue, newValue);
            });
            // 処理開始成功
            return true;
        },

        /**
         * 素材削除
         * @param index [in] インデックス
         * @return 処理開始の成否（true: 成功）
         */
        deleteMaterial(index: number): boolean {
            if (index < 0 || index >= this.config.materials.length) return false;
            this.process(() => {
                const oldValue = this.config.materials.splice(index, 1)[0];
                Logger.log(
                    `Deleted material at.${index} id.${oldValue.id}`,
                    'ConfigStore.deleteMaterial');
                // 影響
                const newValue = new ConfigMaterial();
                this.effectMaterial(oldValue, newValue);
            });
            return true;
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
                        Logger.log(`Effected to input of recipe at.${recipe.i} id.${recipe.v.id}`);
                    }
                });
                recipe.v.output.forEach((v) => {
                    if (v.id == oldValue.id) {
                        v.id = newValue.id;
                        Logger.log(`Effected to output of recipe at.${recipe.i} id.${recipe.v.id}`);
                    }
                });
            });
        },

        /* ------------------------------------------------
        - レシピリスト
        ------------------------------------------------ */

        /**
         * レシピ追加
         * @return 追加後のレシピのインデックス
         */
        addRecipe(): number {
            const index = this.config.recipes.length;
            this.process(() => {
                let item = new ConfigRecipe()
                item.uniqueKey = this.uniqueKey++;
                this.config.recipes.push(item);
                Logger.log('Added recipe.', 'ConfigStore.addRecipe');
            });
            return index;
        },

        /**
         * 素材更新
         * @param index [in] インデックス
         * @param value [in] 変更後の値
         * @return 処理開始の成否（true: 成功）
         */
        setRecipe(index: number, value: ConfigRecipe): boolean {
            if (index < 0 || index >= this.config.recipes.length) return false;
            // レシピID重複チェック
            const oldId = this.config.recipes[index].id;
            const newId = value.id;
            if (oldId != newId) {
                // レシピIDの変更がある場合だけ重複チェック
                if (this.config.recipes.some((v, i) => i !== index && v.id == newId)) {
                    // 重複がある場合は変更を拒否
                    return false;
                }
            }
            // 処理開始
            this.process(() => {
                if (index < 0 || index >= this.config.recipes.length) return;
                const oldValue = this.config.recipes[index].clone();
                this.config.recipes[index].assign(value);
                Logger.log(
                    `Changed recipe at.${index} id.${oldValue.id}`,
                    'ConfigStore.setRecipe');
            });
            // 処理開始成功
            return true;
        },

        /** 
         * 素材削除
         * @param index [in] インデックス
         * @return 処理開始の成否（true: 成功）
         */
        deleteRecipe(index: number): boolean {
            if (index < 0 || index >= this.config.recipes.length) return false;
            this.process(() => {
                const oldValue = this.config.recipes.splice(index, 1)[0];
                Logger.log(
                    `Deleted recipe at.${index} id.${oldValue.id}`,
                    'ConfigStore.deleteRecipe');
            });
            return true;
        },
    }
});
