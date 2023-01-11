/**
 * ツールの設定を受け取る型定義
 */

/** 
 * 素材の状態
 */
export const MaterialStateName = {
    /** 固体 */
    Solid: '固体',
    /** 液体 */
    Fluid: '液体',
    /** 気体 */
    Gas: '気体',
} as const
/** 素材の状態のID */
export type MaterialState = keyof typeof MaterialStateName
/**
 * 素材の状態毎の表示単位
 */
export const MaterialStateUnit = {
    /** 固体 */
    Solid: '個',
    /** 液体 */
    Fluid: '㎥',
    /** 気体 */
    Gas: '㎥',
} as const
export type MateriStateUnitType = keyof typeof MaterialStateUnit

/**
 * 資源の純度
 */
export const ResourcePurityName = {
    Impure: '低純度',
    Normal: '中純度',
    Pure: '高純度'
} as const
/** 資源の純度のID */
export type ResourcePurity = keyof typeof ResourcePurityName

/**
 * 資源の純度による採取量倍率
 */
export const ResourceMagnification = {
    /** 低純度 */
    Impure: 0.5,
    /** 中純度 */
    Normal: 1.0,
    /** 高純度 */
    Pure: 2.0
} as const

/**
 * 設備の素材搬入出口
 */
export class ConfigMachinePort {
    /** 固形口数 */
    solid: number = 0;
    /** 液体口数 */
    fluid: number = 0;

    /** コンストラクタ */
    constructor(data: any | null = null) {
        if (data) this.deserialize(data);
    };
    /** シリアライズ ※今のところ使用する予定無し */
    serialize(): any {
        return {
            Solid: this.solid,
            Fluid: this.fluid,
        };
    };
    /** デシリアライズ */
    deserialize(data: any) {
        this.solid = data.Solid;
        this.fluid = data.Fluid;
    }
}

/**
 * 設備設定
 */
export class ConfigMachine {
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
    /** シリアライズ ※今のところ使用する予定無し */
    serialize(): any {
        return {
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
        this.name = data.Name;
        this.category = data.Category;
        this.inputNumber.deserialize(data.InputNumber);
        this.outputNumber.deserialize(data.OutputNumber);
        this.power = data.Power;
        this.tier = data.Tier;
    };
}

/**
 * 素材
 */
export class ConfigMaterial {
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
    /** シリアライズ ※今のところ使用する予定無し */
    serialize(): any {
        return {
            Name: this.name,
            State: this.state,
            Category: this.category,
        };
    };
    /** デシリアライズ */
    deserialize(data: any) {
        this.name = data.Name;
        this.state = data.State;
        this.category = data.Category;
    };
}

/**
 * レシピ
 */
export class ConfigRecipe {
    /** レシピ名 */
    name: string = '';
    /** 素材 key=素材ID、value=入力素材数 */
    input: any = {};
    /** 成果物 key=素材ID、value=出力素材数 */
    output: any = {};
    /** 製作時間(秒) */
    productTime: number = 0;
    /** 対象の設備 */
    machineId: Array<string> = new Array<string>();

    /** コンストラクタ */
    constructor(data: any | null = null) {
        if (data) this.deserialize(data);
    };
    /** シリアライズ ※今のところ使用する予定無し */
    serialize(): any {
        return {
            Name: this.name,
            Input: this.input,
            Output: this.output,
            ProductTime: this.productTime,
            Machine: this.machineId,
        };
    };
    /** デシリアライズ */
    deserialize(data: any) {
        this.name = data.Name;
        this.input = data.Input;
        this.output = data.Output;
        this.productTime = data.ProductTime;
        this.machineId = data.Machine;
    };
}
/** レシピリスト */
export type RecipeList = Array<ConfigRecipe>;

/** ルート */
export class Config {
    /** 設備のカテゴリ名 */
    machineCategoryNames: any = {};
    /** 素材のカテゴリ名 */
    materialCategoryNames: any = {};
    /** 資源ノードから採取できる素材 */
    resources: string[] = [];
    /** 設備 key=(string)設備ID, value=(ConfigMachine) */
    machines: any = {};
    /** 素材 key=(string)素材ID, value=(ConfigMaterial) */
    materials: any = {};
    /** レシピ Array<ConfigRecipe> */
    recipes: RecipeList = [];

    /** コンストラクタ */
    constructor(data: any | null = null) {
        if (data) this.deserialize(data);
    };
    /** シリアライズ ※今のところ使用する予定無し */
    serialize(): any {
        return {
            MachineCategories: this.machineCategoryNames,
            MaterialCategories: this.materialCategoryNames,
            Resources: this.resources,
            Machines: Object.fromEntries(
                Object.keys(this.machines).map((key) => {
                    return [key, this.machines[key].serialize()];
                })
            ),
            Materials: Object.fromEntries(
                Object.keys(this.materials).map((key) => {
                    return [key, this.materials[key].serialize()];
                })
            ),
            Recipes: this.recipes.map((v) => v.serialize())
        };
    };
    /** デシリアライズ */
    deserialize(data: any) {
        this.machineCategoryNames = data.MachineCategories;
        this.materialCategoryNames = data.MaterialCategories;
        this.resources = data.Resources;
        this.machines = {};
        Object.keys(data.Machines).forEach((key: string) => {
            this.machines[key] = new ConfigMachine();
            this.machines[key].deserialize(data.Machines[key])
        });
        this.materials = {};
        Object.keys(data.Materials).forEach((key: string) => {
            this.materials[key] = new ConfigMaterial();
            this.materials[key].deserialize(data.Materials[key])
        });
        this.recipes = [];
        data.Recipes.forEach((v: any) => {
            this.recipes.push(new ConfigRecipe(v));
        });
    }
}