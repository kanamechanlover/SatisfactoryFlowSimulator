/// 製作フロークラス
/// レシピIDを階層構造で持ち、必要に応じて
var flow = new class Flow {
    /// 必要数のデフォルト値
    static DefaultNeeds = -1;
    /// <string> アイテムID
    #itemId;
    /// <float> 必要数
    #needs;
    /// <string> レシピID
    #recipeId;
    /// <Flow[]> 素材リスト
    #materialList;
    /// <string> 副産物のアイテムID
    #byproductItemId;
    /// <double> 副産物の生産数
    #byproductNeeds;
    /// <string> マシンID
    #machineId;
    /// <Flow> 親階層のフロー(親が無い場合は null)
    #parentFlow;

    /// コンストラクタ
    /// @param [in] _parent <Flow> 親階層のフロー
    constructor(_parent = null) {
        /// メンバ初期化
        this.#itemId = null;
        this.#needs = Flow.DefaultNeeds;
        this.#recipeId = null;
        this.#materialList = [];
        this.#byproductItemId = null;
        this.#byproductNeeds = 0;
        this.#machineId = '';
        this.#parentFlow = _parent;
    }

    /// アイテムIDとレシピIDを指定
    /// レシピID省略時はデフォルトレシピがセットされる
    /// @param [in] _itemId <string> アイテムID
    /// @param [in] _recipeId <string> レシピID
    setItem(_itemId = null, _recipeId = null) {
        if (_itemId === null) return;
        // アイテムIDを設定
        let itemId = _itemId;
        // レシピを設定
        let recipeId = null;
        if (_recipeId === null) {
            // 引数の指定が無ければデフォルトレシピを設定
            recipeId = config.getDefaultRecipeId(_itemId);
        }
        else {
            // 引数で指定が有ればそのまま設定
            recipeId = _recipeId;
        }
        // レシピに変更が無ければ変更なし
        if (this.#itemId == itemId && this.#recipeId == recipeId) {
            return;
        }
        // メンバ変数更新
        this.#itemId = (itemId) ? itemId : null;
        this.#recipeId = (itemId) ? recipeId: null;
        // 自身含め再帰的に更新
        this.updateRecipe();
    }

    /// 必要数を設定
    /// @param [in] _needs <double> 必要数
    setNeeds(_needs) {
        this.#needs = _needs;
        this.updateNeeds();
    }

    /// アイテムID
    /// @return <string> アイテムID
    getItemId() {
        return this.#itemId;
    }

    /// 必要数
    /// @return <double> 必要数
    getNeeds() {
        return this.#needs;
    }

    /// レシピID
    /// @return <string> レシピID
    getRecipeId() {
        return this.#recipeId;
    }

    /// 素材リスト
    /// @return <Flow[]> 素材リスト
    /// @note 戻り値は参照渡しの為、参照目的であれば const で受け取ること。
    getMaterialList() {
        return this.#materialList;
    }
    /// 副産物があるか
    /// @return <boolean> 副産物の有無（true: 有）
    hasByproduct() {
        return this.#byproductItemId !== null;
    }
    /// 副産物と生産数を取得
    /// @return <[string, double]> 副産物のアイテムID、必要数
    /// @note ex: [item, needs] = flow.getByproduct();
    getByproduct() {
        return [this.#byproductItemId, this.#byproductNeeds];
    }
    /// マシンID
    /// @return <string> マシンID
    getMachineId() {
        return this.#machineId;
    }
    /// 親のフローがあるか
    /// @return <boolean> true:ある
    hasParentFlow() {
        return this.#parentFlow !== null;
    }

    // ---- 内部メソッド ----

    /// 自身含めレシピを更新（素材側のレシピはデフォルトを使用）
    updateRecipe() {
        // 自身のレシピ情報取得
        const recipe = config.getRecipe(this.#recipeId);
        if (!recipe) return;
        // レシピの副産物アイテムIDと必要数を取得
        const byproduct = Object.keys(recipe.Output).filter((_itemId) => {
            return this.#itemId != _itemId;
        });
        if (byproduct.length) {
            // 副産物があれば設定
            this.#byproductItemId = byproduct[0];
        }
        else {
            // 副産物が無ければ初期化
            this.#byproductItemId = null;
            this.#byproductNeeds = 0;
        }
        // 必要数をレシピの 100% 稼働時の生産量にする
        if (!this.hasParentFlow()) {
            const productRate = 60 / recipe.ProductTime;
            const recipeRate = recipe.Output[this.#itemId] * productRate;
            this.#needs = recipeRate;
        }
        
        // マシンIDを取得
        this.#machineId = recipe.Machine[0];
        // 素材毎にフロー作成
        this.#materialList = [];
        Object.keys(recipe.Input).forEach((_itemId) => {
            // 素材用のフロー作成
            const flow = new Flow(this);
            flow.setItem(_itemId);
            this.#materialList.push(flow);
        });
        // 必要数の計算
        this.updateNeeds();
    }

    /// 自身含めレシピを更新
    updateNeeds() {
        // 自身のレシピ情報取得
        const recipe = config.getRecipe(this.#recipeId);
        if (!recipe) return;
        // 必要数の割合を計算
        const productRate = 60 / recipe.ProductTime;
        const recipeRate = recipe.Output[this.#itemId] * productRate;
        const needsRate = this.#needs / recipeRate;
        // 副産物の生産数を計算
        if (this.#byproductItemId) {
            const baseNeeds = recipe.Output[this.#byproductItemId];
            this.#byproductNeeds = baseNeeds * productRate * needsRate;
        }
        // 素材毎に計算
        this.#materialList.forEach((_materialFlow) => {
            const itemId = _materialFlow.getItemId();
            // 必要数を計算
            const materialNeeds = recipe.Input[itemId];
            const needs = materialNeeds * productRate * needsRate;
            // 素材用の計算
            _materialFlow.setNeeds(needs);
        });
    }
};
