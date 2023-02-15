/** 素材毎に扱う情報 */
export class MaterialRow {
    /** 素材の総数 */
    private total: number;
    /** 製品毎の合計値 */
    private products: Map<string, number>;
    public constructor() {
        this.total = 0;
        this.products = new Map<string, number>();
    }
    /** 
     * 素材の総数を取得
     * @return 総数
     */
    public getTotal(): number {
        return this.total;
    }
    /**
     * 製品毎の合計値を取得
     * @param productMaterialId [in] 製品ID
     * @return 製品毎の合計値
     */
    public getProductTotal(productMaterialId: string): number {
        const value = this.products.get(productMaterialId);
        return (value) ? value : 0;
    }
    /**
     * 製品の値に加算
     * @param productMaterialId 製品ID
     * @param value 加算値
     */
    public addProductTotal(productMaterialId: string, value: number) {
        // 現在の値を取得
        const hasProduct = this.products.has(productMaterialId);
        const current = (hasProduct) ? this.products.get(productMaterialId) : 0;
        // 加算して再格納
        const added = ((current) ? current : 0) + value;
        this.products.set(productMaterialId, added);
        // 総数を更新
        const values: number[] = [...this.products.values()];
        this.total = values.reduce((t,v) => t + v);
    }
};

/** 素材一覧テーブル */
export class MaterialTable {
    private table: Map<string, MaterialRow>;
    public constructor() {
        this.table = new Map<string, MaterialRow>();
    }
    /** テーブルをクリア */
    public clear() {
        this.table.clear();
    }
    /**
     * 素材ID一覧取得
     * @return 素材Id一覧
     */
    public get materials() : Array<string> {
        return [...this.table.keys()];
    };
    /**
     * 総数を取得
     * @param materialId 素材ID
     * @return 総数
     */
    public getTotal(materialId: string): number {
        const row = this.table.get(materialId);
        if (!row) return 0;
        return row.getTotal();
    }
    /**
     * 総数を取得
     * @param materialId 素材ID
     * @param product 製品ID
     * @return 総数
     */
    public getProductTotal(materialId: string, product: string): number {
        const row = this.table.get(materialId);
        if (!row) return 0;
        return row.getProductTotal(product);
    }
    /**
     * テーブルに追加（既に値があれば加算）
     * @param materialId 素材ID
     * @param product 製品ID
     * @param value 加算値
     */
    public add(materialId: string, product: string, value: number) {
        if (!this.table.has(materialId)) {
            // まだ無ければ作る
            this.table.set(materialId, new MaterialRow());
        }
        // 対象の行を取得
        let row = this.table.get(materialId);
        if (!row) return;
        // 値を更新
        row.addProductTotal(product, value);
        this.table.set(materialId, row);
    }
}