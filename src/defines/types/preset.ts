// プリセット機能で使用するクラス構成

/** 製品情報 */
export class PresetProduct {
    /** 製品（表示）名 */
    name: string;
    /** 製品（素材）ID */
    productId: string;
    /**
     * 初期化
     * @param name [in] 製品（表示）名
     * @param productId [in] 製品（素材）ID
     */
    constructor(name: string = '', productId: string = '') {
        this.name = name;
        this.productId = productId;
    }
    /**
     * デシリアライズ
     * @param data [in] json データ
     */
    deserialize(data: any) {
        this.name = (data.Name) ? data.Name : '';
        this.productId = (data.ProductId) ? data.ProductId : '';
    }
};

/** プリセット情報 */
export class PresetInfo {
    /** プリセット名 */
    name: string;
    /** 製品リスト */
    products: Array<PresetProduct>;
    /**
     * 初期化
     * @param name [in] プリセット名
     * @param products [in] 製品リスト
     */
    constructor(name: string = '', products: Array<PresetProduct> = []) {
        this.name = name;
        this.products = products;
    }
    /**
     * デシリアライズ
     * @param data [in] json データ
     */
    deserialize(data: any) {
        // プリセット名取得
        this.name = (data.Name) ? data.Name : '';
        // リストのフォーマットチェック
        if (!data.Products || !data.Products.length) return;
        // リスト再構築の為一旦クリア
        this.products = [];
        // リストアイテム毎にデシリアライズ
        data.Products.forEach((product: any) => {
            const element = new PresetProduct();
            element.deserialize(product);
            this.products.push(element)
        });
    }
    /** 製品（表示）名リスト取得 */
    productNames(): Array<string> {
        return this.products.map((product: PresetProduct) => product.name);
    }
    /** 製品（素材）IDリスト取得 */
    productIds(): Array<string> {
        return this.products.map((product: PresetProduct) => product.productId);
    }
};

/** ティア情報 */
export class TierInfo {
    /** ティア名 */
    name: string;
    /** プリセットリスト */
    presets: Array<PresetInfo>;
    /**
     * 初期化
     * @param name [in] プリセット名
     * @param presets [in] プリセットリスト
     */
    constructor(name: string = '', presets: Array<PresetInfo> = []) {
        this.name = name;
        this.presets = presets;
    }
    /**
     * デシリアライズ
     * @param data [in] json データ
     */
    deserialize(data: any) {
        // プリセット名取得
        this.name = (data.Name) ? data.Name : '';
        // リストのフォーマットチェック
        if (!data.Presets || !data.Presets.length) return;
        // リスト再構築の為一旦クリア
        this.presets = [];
        // リストアイテム毎にデシリアライズ
        data.Presets.forEach((preset: any) => {
            const element = new PresetInfo();
            element.deserialize(preset);
            this.presets.push(element)
        });
    }
    /** プリセット名リスト取得 */
    presetNames(): Array<string> {
        return this.presets.map((preset: PresetInfo) => preset.name);
    }
    /** 製品（表示）名リスト取得 */
    productNames(presetName: string): Array<string> {
        // 対象のプリセット取得
        const preset = this.presets.find((p) => p.name == presetName);
        // プリセットから製品（表示）名リスト取得
        return (preset) ? preset.productNames() : [];
    }
    /** 製品（素材）IDリスト取得 */
    productIds(presetName: string): Array<string> {
        // 対象のプリセット取得
        const preset = this.presets.find((p) => p.name == presetName);
        // プリセットから製品（素材）IDリスト取得
        return (preset) ? preset.productIds() : [];
    }
};

/** プリセットのルート */
export class PresetData {
    /** ティアリスト */
    tiers: Array<TierInfo>;
    /**
     * 初期化
     * @param name [in] ティアリスト
     */
    constructor(tiers: Array<TierInfo> = []) {
        this.tiers = tiers;
    }
    /**
     * デシリアライズ
     * @param data [in] json データ
     */
    deserialize(data: any) {
        // リストのフォーマットチェック
        if (!data.Tiers || !data.Tiers.length) return;
        // リスト再構築の為一旦クリア
        this.tiers = [];
        // リストアイテム毎にデシリアライズ
        data.Tiers.forEach((tier: any) => {
            const element = new TierInfo();
            element.deserialize(tier);
            this.tiers.push(element)
        });
    }
    /** ティア名リスト取得 */
    tierNames(): Array<string> {
        return this.tiers.map((tier: TierInfo) => tier.name);
    }
    /**
     * プリセット名リスト取得
     * @param tierName [in] ティア名
     * @return プリセット名リスト（ティア名が無ければ空配列を返す）
     */
    presetNames(tierName: string): Array<string> {
        const tier = this.tiers.find((t) => t.name == tierName);
        return (tier) ? tier.presetNames() : [];
    }
    /**
     * 製品（表示）名リスト取得
     * @param tierName [in] ティア名
     * @param presetName [in] プリセット名
     * @return 製品（表示）名リスト（ティア名、プリセット名が無ければ空配列を返す）
     */
    productNames(tierName: string, presetName: string): Array<string> {
        // 対象のティア取得
        const tier = this.tiers.find((t) => t.name == tierName);
        // 対象のプリセットから製品（表示）名リスト取得
        return (tier) ? tier.productNames(presetName) : [];
    }
    /**
     * 製品（素材）IDリスト取得
     * @param tierName [in] ティア名
     * @param presetName [in] プリセット名
     * @return 製品（素材）IDリスト（ティア名、プリセット名が無ければ空配列を返す）
     */
    productIds(tierName: string, presetName: string): Array<string> {
        // 対象のティア取得
        const tier = this.tiers.find((t) => t.name == tierName);
        // 対象のプリセットから製品（素材）IDリスト取得
        return (tier) ? tier.productIds(presetName) : [];
    }
};