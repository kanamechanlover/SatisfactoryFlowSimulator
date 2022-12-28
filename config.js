/// 設定クラス
/// json ファイルから情報を取得し、参照できるようにする
config = new class Config {
    /// 読み込む json ファイルパス
    static get ConfigFilePath() {
        return './assets/config/config.json'
    };
    /// 読込済みフラグ
    #loaded;
    /// 設定データ
    #data;
    /// コンストラクタ
    constructor() {
        // メンバ初期化
        this.#loaded = false;
        this.#data = null;
    }
    /// 設定ファイル読込
    /// 読込完了時、引数の関数を呼ぶ
    /// @param [in] _callback <function> 読込完了時のコールバック関数
    load(_callback) {
        // 読込
        console.log('[Config.load] loading...');
        $.getJSON(Config.ConfigFilePath).done((_data) => {
            // 読込完了
            console.log('[Config.load] loaded.');
            this.#loaded = true;
            this.#data = _data;
            // 読込完了時のコールバック呼び出し
            if (_callback) {
                _callback(_data);
            }
        }).fail(() => {
            // 読込失敗
            console.warn('[Config.load] 読込に失敗しました。');
            // 読込完了時と同様にコールバック呼び出し
            // 成否は Config.isLoaded 関数で判定
            if (_callback) {
                _callback();
            }
        });
    }
    /// 設定ファイル読込済みフラグ取得
    isLoaded() {
        return this.#loaded;
    }
    
    /// アイテムのデフォルトレシピIDを取得
    /// ※デフォルトのレシピはアイテムと同名になる（例外あり）
    /// @param [in] _itemId <string> アイテムID
    /// @return <string> レシピID（見つからなければ null）
    getDefaultRecipeId(_itemId = null) {
        if (!_itemId) {
            return null;
        }
        // アイテム名を取得
        const itemName = this.#data.Materials[_itemId].Name;
        // アイテム名と同名のレシピを取得
        let recipe = this.#data.Recipes.find((_recipe) => {
            return _recipe.Name == itemName;
        });
        // 水や鉱物等はレシピ名に設備名が付いている為、出力アイテムで判定
        if (!recipe) {
            recipe = this.#data.Recipes.find((_recipe) => {
                return !_recipe.Name.startsWith('代替')
                    && Object.keys(_recipe.Output).length == 1
                    && Object.keys(_recipe.Output).includes(_itemId)
            });
        }
        return (recipe) ? recipe.Name : null;
    }

    // アイテム名取得
    // @param [in] _itemId <string> アイテムID（見つからない場合は null）
    // @return <string> アイテム名
    getItemName(_itemId = null) {
        if (_itemId === null) return null;
        const material = this.#data.Materials[_itemId];
        if (!material) return null;
        return material.Name;
    }
    /// 指定カテゴリの素材IDリスト取得
    /// @param [in] _categoryId <string> カテゴリID
    /// @return <string[]> 素材IDリスト
    getItemIdByCategory(_categoryId) {
        return Object.keys(this.#data.Materials).filter((_itemId) => {
            return this.#data.Materials[_itemId].Category == _categoryId;
        });
    }
    /// カテゴリIDリスト取得
    /// @return <string[]> カテゴリIDリスト
    getCategoryIdList() {
        return Object.keys(this.#data.Categories);
    }
    /// カテゴリ名取得
    /// @param [in] _categoryId <string> カテゴリID
    /// @return <string> カテゴリ名(見つからない場合 null)
    getCategoryName(_categoryId) {
        if (!Object.keys(this.#data.Categories).includes(_categoryId)) return null;
        return this.#data.Categories[_categoryId];
    }
    /// アイテムのカテゴリID取得
    /// @param [in] _itemId <string> アイテムID
    /// @return <string> カテゴリID（アイテムIDが見つからなければ null）
    getCategoryIdByItemId(_itemId) {
        if (!Object.keys(this.#data.Materials).includes(_itemId)) return null;
        return this.#data.Materials[_itemId].Category;
    }

    /// レシピを取得
    /// @param [in] _recipeId <string> レシピID
    /// @return <object> レシピ
    getRecipe(_recipeId) {
        const recipe = this.#data.Recipes.find((_recipe) => _recipe.Name == _recipeId);
        return (recipe) ? Object.assign({}, recipe) : null; // 非リテラルは参照渡しなのでクローンを返す
    }
    /// レシピ名を取得
    /// @param [in] _recipeId <string> レシピID
    /// @return <string> レシピ名
    getRecipeName(_recipeId) {
        const recipe = this.getRecipe(_recipeId);
        return (recipe) ? recipe.Name : null;
    }

    /// アイテムの製作レシピリストを取得
    /// @param [in] _itemId <string> アイテムID
    /// @return <object[]> レシピリスト
    getRecipesByItemId(_itemId) {
        return this.#data.Recipes.filter((_recipe) => {
            return Object.keys(_recipe.Output).includes(_itemId);
        }).concat(); // 非リテラルは参照渡しなのでクローンを返す
    }

    /// 設備名を取得
    /// @param [in] _machineId <string> 設備ID
    /// @return <string> 設備名（設備IDが見つからない場合は null）
    getMachineName(_machineId) {
        if (!_machineId) return null;
        return this.#data.Machines[_machineId].Name;
    }

    /// 指定のアイテムを作成するレシピ名リストを取得
    /// @param [in] _itemId <string> アイテムID
    /// @return <string[]> レシピ名リスト
    getRecipeNameList(_itemId) {
        const recipes = this.#data.Recipes.filter((_recipe) => {
            return Object.keys(_recipe.Output).includes(_itemId);
        });
        return recipes.map(((_recipe) => _recipe.Name));
    }

    /// アイテムの製作レシピがあるか
    /// @param [in] _itemId アイテムID
    /// @return <boolean> true: ある
    hasItemInOutput(_itemId) {
        return this.#data.Recipes.some((_recipe) => {
            Object.keys(_recipe.Output).includes(_itemId);
        });
    }

    /// アイテムの製作レシピに入力素材があるか
    /// @param [in] _itemId アイテムID
    /// @return <boolean> true: ある
    hasInputForItem(_itemId) {
        return recipes.some((_recipe) => {
            const hasRecipe = Object.keys(_recipe.Output).includes(_itemId);
            const hasInput = !!Object.keys(_recipe.Input).length;
            return hasRecipe && hasInput;
        });
    }
};
