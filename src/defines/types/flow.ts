/** 
 * 製作フローパス型
 * （Vue3 の props を経由する為文字列変換できるようにする）
 */
export class FlowPath extends Array<string> {
    /** @param data [in] 配列または文字列（カンマ区切り） */
    constructor(data:FlowPath|Array<string>|string = []) {
        if (typeof data === 'string') {
            const splittedData:Array<string> = (data === '') ? [] : data.split(',');
            super(...splittedData);
        }
        else {
            super(...data);
        }
    }
    /** 文字列に変換 */
    override toString(): string {
        return super.join(',');
    }
}

/** 製作フロークラス */
export class Flow {
    /** 素材ID */
    public materialId: string = '';
    /** 必要数 */
    public needs: number = 0.0;
    /** レシピID */
    public recipeId: string = '';
    /** レシピのデフォルトの生産数 */
    public recipeMaterialNeeds: Array<number> = [];
    /** レシピの生産数に対する必要数の倍率 */
    public needsRate: number = 0.0;
    /** レシピの素材リスト */
    public materialFlows: Array<Flow> = [];
    /** 副産物の素材ID */
    public byproductId: string = '';
    /** 副産物の生産数 */
    public byproductNeeds: number = 0.0;
    /** マシンID */
    public machineId: string = '';
    /** 親階層のフロー(親が無い場合は null) */
    public parentFlow: Flow | null = null;
    /** フローパス(ルートから辿った素材IDの配列) */
    public path: FlowPath = [];

    /**
     * コンストラクタ
     * @param parent [in] 親階層のフロー
     */
    public constructor(parent: Flow | null = null) {
        // 親階層のフロー設定
        this.parentFlow = parent;
    }
    /**
     * 指定の素材IDの製作フローを取得
     * @param materialId 素材ID
     */
    public get materialIds(): Array<string> {
        return this.materialFlows.map((flow) => flow.materialId);
    }
    /**
     * 指定の素材IDの製作フローを取得
     * @param materialId 素材ID
     */
    public getMaterialFlow(materialId:string): Flow | null {
        const foundFlow = this.materialFlows.find((flow) => {
            return flow.materialId == materialId;
        });
        return (foundFlow) ? foundFlow : null;
    }
    /**
     * ルートのフローか
     * @return true: ルートのフロー
     */
    public get isRootFlow(): boolean {
        return !this.parentFlow;
    }
};