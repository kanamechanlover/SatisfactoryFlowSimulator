/** 集計結果テーブル */
export class MaterialTable {
    /** テーブルのヘッダ名リスト */
    private headers: Array<string>;
    /** 素材IDを行ヘッダとする集計結果テーブル */
    private table: Map<string, Array<number>>;
    public constructor() {
        this.headers = [];
        this.table = new Map<string, Array<number>>();
    };
    /** テーブルをクリア */
    public clear() {
        this.headers = [];
        this.table.clear();
    };
    /**
     * テーブルのヘッダ名リストを取得
     * @return ヘッダ名リスト
     */
    public getHeaderNames(): Array<string> {
        return this.headers;
    };
    /**
     * テーブル上の素材IDリスト
     * @returns 素材IDリスト
     */
    public getAllMaterials(): Array<string> {
        return [...this.table.keys()];
    };
    /**
     * 指定素材の指定位置（列）にある製品の値を取得
     * @param materialId 素材ID（行のキーとなっている文字列）
     * @param index 製品インデックス(0 は総数列、1~ 製品)
     * @returns 数量
     */
    public getNumber(materialId: string, index: number): number {
        //if (!this.table.has(materialId)) return 0; // 存在しない素材IDの場合は 0
        const row = this.table.get(materialId);
        return (row) ? row[index] : 0;
    };
    /**
     * ヘッダ追加
     * @param headerName [in] ヘッダ名
     */
    public addHeader(headerName: string) {
        // ヘッダ追加
        this.headers.push(headerName);
        // テーブルの値にも列追加
        this.table.forEach((v) => {
            v.push(0);
        });
    };
    /**
     * テーブルに追加（既に値があれば加算）
     * @param materialId 素材ID
     * @param index 製品インデックス
     * @param value 加算値
     */
    public addNumber(materialId: string, index: number, value: number) {
        // キーとしている素材IDがまだ無ければ作っておく
        if (!this.table.has(materialId)) {
            this.table.set(materialId, (new Array<number>(this.headers.length)).fill(0));
        }
        // 対象の行を取得
        let columns = this.table.get(materialId);
        if (!columns) return;
        // 値を更新
        const current = columns[index + 1];
        // 加算して再格納
        const added = ((current) ? current : 0) + value;
        columns[index + 1] = added;
        // 総数を更新
        columns[0] = columns[0] + value;
    }
}