/**
 * ツールの設定を受け取る型定義
 */

/** 設備の入出力口のタイプ */
export class MachinePortType {
    /** コンベア */
    static readonly Conveyor: string = 'Conveyor';
    /** パイプ */
    static readonly Pipe: string = 'Pipe';
    /**
     * 表示名を取得
     * @param [in] type タイプ
     * @return 表示名（一致しない場合は空文字列）
     */
    static getName(type: string): string {
        const names = {
            [MachinePortType.Conveyor]: 'コンベア',
            [MachinePortType.Pipe]: 'パイプ',
        };
        if (!Object.keys(type).includes(type)) return '';
        return names[type];
    }
};

/** 素材の状態の情報 */
export class MaterialStateData {
    /** 表示名 */
    Name: String = '';
    /** 単位 */
    Unit: String = '';
    /** 対応する設備の入出力口のタイプ */
    Port: String = ''

    constructor(name: string, unit: string, port: string) {
        this.Name = name;
        this.Unit = unit;
        this.Port = port;
    }
};

/** 
 * 素材の状態
 * Name: 表示名
 * Unit: 単位
 */
export const MaterialState: any = {
    /** 固体 */
    Solid: new MaterialStateData('固体', '個', MachinePortType.Conveyor),
    /** 液体 */
    Fluid: new MaterialStateData('液体', '㎥', MachinePortType.Pipe),
    /** 気体 */
    Gas: new MaterialStateData('気体', '㎥', MachinePortType.Pipe),
};
export type MaterialStateType = { [key: string]: MaterialStateData };

/**
 * 資源の純度
 * Name: 表示名
 * Mag: 倍率（60/分に対する割合になる）
 */
export const ResourcePurity: any = {
    Impure: {
        Name: '低純度',
        Mag: 0.5,
    },
    Normal: {
        Name: '中純度',
        Mag: 1.0,
    },
    Pure: {
        Name: '高純度',
        Mag: 2.0,
    },
}

/**
 * 設備の素材搬入出口
 */
export class ConfigMachinePort {
    /** 固形口数 */
    conveyor: number = 0;
    /** 液体口数 */
    pipe: number = 0;

    /** コンストラクタ */
    constructor(data: any | null = null) {
        if (data) this.deserialize(data);
    };
    /** 代入 */
    assign(target: ConfigMachinePort) {
        if (!target) return;
        this.conveyor = target.Conveyor;
        this.pipe = target.Pipe;
    };
    /** シリアライズ ※今のところ使用する予定無し */
    serialize(): any {
        return {
            Conveyor: this.conveyor,
            Pipe: this.pipe,
        };
    };
    /** デシリアライズ */
    deserialize(data: any) {
        this.conveyor = data.Conveyor;
        this.pipe = data.Pipe;
    }
}

/**
 * カテゴリ
 */
export class ConfigCategory {
    /** 設備ID */
    id: string = '';
    /** 設備名 */
    name: string = '';
    /** コンストラクタ */
    constructor(data: any | null = null) {
        if (data) this.deserialize(data);
    };
    /** 代入 */
    assign(target: ConfigCategory) {
        if (!target) return;
        this.id = target.id;
        this.name = target.name;
    };
    /** シリアライズ ※今のところ使用する予定無し */
    serialize(): any {
        return {
            Id: this.id,
            Name: this.name,
        };
    };
    /** デシリアライズ */
    deserialize(data: any) {
        this.id = data.Id;
        this.name = data.Name;
    };
}
/** カテゴリリスト */
export type CategoryList = Array<ConfigCategory>;

/**
 * 設備設定
 */
export class ConfigMachine {
    /** 設備ID */
    id: string = '';
    /** 設備名 */
    name: string = '';
    /** カテゴリ名 */
    category: string = '';
    /** 入力口数 */
    inputNumber: ConfigMachinePort = new ConfigMachinePort();
    /** 出力口数 */
    outputNumber: ConfigMachinePort = new ConfigMachinePort();
    /** 電力 */
    power: number = 0;
    /** 開放されるティア数 */
    tier: number = 0;

    /** コンストラクタ */
    constructor(data: any | null = null) {
        if (data) this.deserialize(data);
    };
    /** 代入 */
    assign(target: ConfigMachine) {
        if (!target) return;
        this.id = target.id;
        this.name = target.name;
        this.category = target.category;
        this.inputNumber.assign(target.inputNumber);
        this.outputNumber.assign(target.outputNumber);
        this.power = target.power;
        this.tier = target.tier;
    };
    /** シリアライズ ※今のところ使用する予定無し */
    serialize(): any {
        return {
            Id: this.id,
            Name: this.name,
            Category: this.category,
            InputNumber: this.inputNumber.serialize(),
            OutputNumber: this.outputNumber.serialize(),
            Power: this.power,
            Tier: this.tier,
        };
    };
    /** デシリアライズ */
    deserialize(data: any) {
        this.id = data.Id;
        this.name = data.Name;
        this.category = data.Category;
        this.inputNumber.deserialize(data.InputNumber);
        this.outputNumber.deserialize(data.OutputNumber);
        this.power = data.Power;
        this.tier = data.Tier;
    };
}
/** 設備リスト */
export type ConfigMachineList = Array<ConfigMachine>;

/**
 * 素材
 */
export class ConfigMaterial {
    /** 設備ID */
    id: string = '';
    /** 素材名 */
    name: string = '';
    /** 素材の状態（MaterialState で指定） */
    state: string = '';
    /** カテゴリID */
    category: string = '';

    /** コンストラクタ */
    constructor(data: any | null = null) {
        if (data) this.deserialize(data);
    };
    /** 代入 */
    assign(target: ConfigMaterial) {
        if (!target) return;
        this.id = target.id;
        this.name = target.name;
        this.state = target.state;
        this.category = target.category;
    };
    /** シリアライズ ※今のところ使用する予定無し */
    serialize(): any {
        return {
            Id: this.id,
            Name: this.name,
            State: this.state,
            Category: this.category,
        };
    };
    /** デシリアライズ */
    deserialize(data: any) {
        this.id = data.Id;
        this.name = data.Name;
        this.state = data.State;
        this.category = data.Category;
    };
}
/** 素材リスト */
export type ConfigMaterialList = Array<ConfigMaterial>;

/**
 * 入出力素材
 */
export class ConfigRecipeMaterial {
    /** 素材ID */
    id: string = '';
    /** 素材数 */
    number: number = 0;
    /** コンストラクタ */
    constructor(data: any | null = null) {
        if (data) this.deserialize(data);
    };
    /** 代入 */
    assign(target: ConfigRecipeMaterial) {
        if (!target) return;
        this.id = target.id;
        this.number = target.number;
    };
    /** シリアライズ ※今のところ使用する予定無し */
    serialize(): any {
        return {
            Id: this.id,
            Number: this.number,
        };
    };
    /** デシリアライズ */
    deserialize(data: any) {
        this.id = data.Id;
        this.number = data.Number;
    };
}
export type RecipeMaterialList = Array<ConfigRecipeMaterial>;

/**
 * レシピ
 */
export class ConfigRecipe {
    /** 入力素材の最大数 */
    static InputMax = 4;
    /** 出力素材の最大数 */
    static OutputMax = 2;
    /** レシピ名 */
    name: string = '';
    /** 素材 (素材IDと必要数) */
    input: RecipeMaterialList = new Array<ConfigRecipeMaterial>(ConfigRecipe.InputMax);
    /** 成果物 (素材IDと必要数) */
    output: RecipeMaterialList = new Array<ConfigRecipeMaterial>(ConfigRecipe.OutputMax);
    /** 製作時間 (秒) */
    productTime: number = 0;
    /** 対象の設備 */
    machineId: string = '';

    /** コンストラクタ */
    constructor(data: any | null = null) {
        if (data) this.deserialize(data);
    };
    /** 代入 */
    assign(target: ConfigRecipe) {
        if (!target) return;
        this.name = target.name;
        this.input = new Array<ConfigRecipeMaterial>(ConfigRecipe.InputMax);
        const inputNumber = target.input.filter((v) => v).length;
        target.input.filter((v) => v).forEach((v: any, i: number) => {
            if (this.input[i] === undefined) this.input[i] = new ConfigRecipeMaterial();
            this.input[i].assign(v);
        });
        this.output = new Array<ConfigRecipeMaterial>(ConfigRecipe.OutputMax);
        target.output.filter((v) => v).forEach((v: any, i: number) => {
            if (this.output[i] === undefined) this.output[i] = new ConfigRecipeMaterial();
            this.output[i].assign(v);
        });
        this.productTime = target.productTime;
        this.machineId = target.machineId;
    };
    /** シリアライズ ※今のところ使用する予定無し */
    serialize(): any {
        return {
            Name: this.name,
            // 入出力素材は最大数分枠を確保しているので値が入っていない部分は出力しない
            Input: this.input.filter((v) => v).map((v) => v.serialize()),
            Output: this.output.filter((v) => v).map((v) => v.serialize()),
            ProductTime: this.productTime,
            Machine: this.machineId,
        };
    };
    /** デシリアライズ */
    deserialize(data: any) {
        this.name = data.Name;
        this.input = new Array<ConfigRecipeMaterial>(ConfigRecipe.InputMax);
        data.Input.filter((v) => v).forEach((v: any, i: number) => {
            this.input[i] = new ConfigRecipeMaterial(v);
        });
        this.output = new Array<ConfigRecipeMaterial>(ConfigRecipe.OutputMax);
        data.Output.filter((v) => v).forEach((v: any, i: number) => {
            this.output[i] = new ConfigRecipeMaterial(v);
        });
        this.productTime = data.ProductTime;
        this.machineId = data.Machine;
    };
}
/** レシピリスト */
export type RecipeList = Array<ConfigRecipe>;

/** ルート */
export class Config {
    /** 設定のバージョン */
    version: string = '';
    /** 設備のカテゴリ */
    machineCategories: CategoryList = [];
    /** 素材のカテゴリ */
    materialCategories: CategoryList = [];
    /** 設備リスト */
    machines: ConfigMachineList = [];
    /** 素材リスト */
    materials: ConfigMaterialList = [];
    /** レシピ */
    recipes: RecipeList = [];

    /** コンストラクタ */
    constructor(data: any | null = null) {
        if (data) this.deserialize(data);
    };
    /** シリアライズ ※今のところ使用する予定無し */
    serialize(): any {
        return {
            Version: this.version,
            MachineCategories: this.machineCategories,
            MaterialCategories: this.materialCategories,
            Machines: this.machines.map((v) => v.serialize()),
            Materials: this.materials.map((v) => v.serialize()),
            Recipes: this.recipes.map((v) => v.serialize())
        };
    };
    /** デシリアライズ */
    deserialize(data: any) {
        this.version = data.Version;
        this.machineCategories = [];
        data.MachineCategories.forEach((v: any) => {
            this.machineCategories.push(new ConfigCategory(v));
        });
        this.materialCategories = [];
        data.MaterialCategories.forEach((v: any) => {
            this.materialCategories.push(new ConfigCategory(v));
        });
        this.machines = [];
        data.Machines.forEach((v: any) => {
            this.machines.push(new ConfigMachine(v));
        });
        this.materials = [];
        data.Materials.forEach((v: any) => {
            this.materials.push(new ConfigMaterial(v));
        });
        this.recipes = [];
        data.Recipes.forEach((v: any) => {
            this.recipes.push(new ConfigRecipe(v));
        });
    }
}