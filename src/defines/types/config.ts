/**
 * ツールの設定を受け取る型定義
 */

import { getDuplicates } from '@/logics/primitives'

/** 現在のフォーマットバージョン */
const CurrentFormat = '1.0';

/** 設備の入出力ポートのタイプ */
export class MachinePortType {
    /** コンベア */
    static readonly Conveyor: string = 'Conveyor';
    /** パイプ */
    static readonly Pipe: string = 'Pipe';
    /** タイプ一覧 */
    static readonly Types: Array<string> = [
        MachinePortType.Conveyor,
        MachinePortType.Pipe,
    ]
    /**
     * 表示名を取得
     * @param type [in] タイプ
     * @return 表示名（一致しない場合は空文字列）
     */
    static getName(type: string): string {
        const names = {
            [MachinePortType.Conveyor]: 'コンベア',
            [MachinePortType.Pipe]: 'パイプ',
        };
        if (!Object.keys(names).includes(type)) return '';
        return names[type];
    }
};

/**
 * 素材の状態の情報
 */
export class MaterialStateData {
    /** 表示名 */
    Name: string = '';
    /** 単位 */
    Unit: string = '';
    /** 対応する設備の入出力ポートのタイプ */
    Port: string = '';

    constructor(name: string, unit: string, port: string) {
        this.Name = name;
        this.Unit = unit;
        this.Port = port;
    }
};

/** 
 * 素材の状態
 */
export const MaterialState: {[key:string]: MaterialStateData} = {
    /** 固体 */
    Solid: new MaterialStateData('固体', '個', MachinePortType.Conveyor),
    /** 液体 */
    Fluid: new MaterialStateData('液体', '㎥', MachinePortType.Pipe),
    /** 気体 */
    Gas: new MaterialStateData('気体', '㎥', MachinePortType.Pipe),
};
/**
 * 素材の状態の逆引き（ポートのタイプから素材の状態を取得）
 * @param portType [in] 入出力ポートタイプ
 * @return 指定のポートタイプを持つ素材の状態名リスト
 */
export const PortTypeFromMaterialState = (portType: string): string[] => {
    return Object.keys(MaterialState).filter((state: string) => {
        return MaterialState[state].Port == portType;
    });
};

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
 * 設備ティア名対応表
 */
export const MachineTier = class {
    /** 対応表 */
    static readonly Table: {[key:string]: number} = {
        /** MAM で解放 */
        MAM: -1,
        /** AWESOME ショップ で解放 */
        Shop: -2,
    };
    /**
     * ティア名取得
     * @param tier [in] ティア値
     * @return ティア名またはティア値そのまま
     */
    static getTierName(tier: number): string {
        for (const tierName in MachineTier.Table) {
            if (tier == MachineTier.Table[tierName]) return tierName;
        }
        return tier.toString();
    }
};

/**
 * 設備の素材搬入出力ポート
 */
export class ConfigMachinePort {
    /** 固形ポート数 */
    conveyor: number = 0;
    /** 液体ポート数 */
    pipe: number = 0;

    /** コンストラクタ */
    constructor(data: any | null = null) {
        if (data) this.deserialize(data);
    };
    /** タイプ別取得 */
    getWithType(type: string) {
        if (type == MachinePortType.Conveyor) return this.conveyor;
        if (type == MachinePortType.Pipe) return this.pipe;
        return 0;
    };
    /** 代入 */
    assign(target: ConfigMachinePort) {
        if (!target) return;
        this.conveyor = target.conveyor;
        this.pipe = target.pipe;
    };
    /**
     * 指定位置のポートのタイプ取得
     * @param id [in] 設備ID
     * @returns 設備の入力ポートのタイプ（例：'Conveyor'）
     */
    portType(index: number): string {
        if (index < 0) return '';
        if (index < this.conveyor) return MachinePortType.Conveyor;
        if (index < this.conveyor + this.pipe) return MachinePortType.Pipe;
        return '';
    };
    /** 全形状のポート数合計 */
    totalPortNumber(): number {
        return this.conveyor + this.pipe;
    };
    /** 固形ポート数のエラー */
    conveyorError(): boolean {
        return this.conveyor < 0;
    };
    /** 液体ポート数のエラー */
    pipeError(): boolean {
        return this.pipe < 0;
    };
    /** エラーチェック */
    existError(): boolean {
        return this.conveyorError() || this.pipeError();
    };
    /** シリアライズ */
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
    };
    /** 複製 */
    clone(): ConfigMachinePort {
        const value = new ConfigMachinePort();
        value.assign(this);
        return value;
    };
}

/**
 * カテゴリ
 */
export class ConfigCategory {
    /** 設備ID */
    id: string = '';
    /** 設備名 */
    name: string = '';
    /** ユニークキー(表示用) */
    uniqueKey: number = 0;

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
    /** カテゴリIDエラー */
    idError(): boolean {
        return !this.id;
    };
    /** カテゴリ名エラー */
    nameError(): boolean {
        return !this.name;
    };
    /** エラーチェック */
    existError(): boolean {
        return (this.idError() || this.nameError());
    };
    /** シリアライズ */
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
    /** 複製 */
    clone(): ConfigCategory {
        const value = new ConfigCategory();
        value.assign(this);
        return value;
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
    /** カテゴリID */
    category: string = '';
    /** 入力ポート数 */
    inputNumber: ConfigMachinePort = new ConfigMachinePort();
    /** 出力ポート数 */
    outputNumber: ConfigMachinePort = new ConfigMachinePort();
    /** 電力 */
    power: number = 0;
    /** 開放されるティア数（-1: MAM、-2: SHOP） */
    tier: number = 0;
    /** ユニークキー(表示用) */
    uniqueKey: number = 0;

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
    /** 設備IDエラー */
    idError(): boolean {
        return !this.id;
    };
    /** 設備名エラー */
    nameError(): boolean {
        return !this.name;
    };
    /** カテゴリIDエラー */
    categoryError(): boolean {
        return !this.category;
    };
    /** 開放されるティア数エラー */
    tierError(): boolean {
        return this.tier < -2;
    };
    /** エラーチェック */
    existError(): boolean {
        return (this.idError()
            ||  this.nameError()
            ||  this.categoryError()
            ||  this.tierError()
            ||  this.inputNumber.existError()
            ||  this.outputNumber.existError());
    };
    /** シリアライズ */
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
    /** 複製 */
    clone(): ConfigMachine {
        const value = new ConfigMachine();
        value.assign(this);
        return value;
    };
}
/** 設備リスト */
export type ConfigMachineList = Array<ConfigMachine>;

/**
 * 素材
 */
export class ConfigMaterial {
    /** 素材ID */
    id: string = '';
    /** 素材名 */
    name: string = '';
    /** 素材の状態（MaterialState で指定） */
    state: string = '';
    /** カテゴリID */
    category: string = '';
    /** ユニークキー(表示用) */
    uniqueKey: number = 0;

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
    /** 素材IDエラー */
    idError(): boolean {
        return !this.id;
    };
    /** 素材名エラー */
    nameError(): boolean {
        return !this.name;
    };
    /** 素材の状態エラー */
    stateError(): boolean {
        return !this.state;
    };
    /** カテゴリIDエラー */
    categoryError(): boolean {
        return !this.category;
    };
    /** エラーチェック */
    existError(): boolean {
        return (this.idError()
            ||  this.nameError()
            ||  this.stateError()
            ||  this.categoryError());
    };
    /** シリアライズ */
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
    /** 複製 */
    clone(): ConfigMaterial {
        const value = new ConfigMaterial();
        value.assign(this);
        return value;
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
    /** 素材数エラー */
    numberError(): boolean {
        return (this.number < 0 || (this.id != '' && this.number == 0) );
    };
    /** 素材数エラー */
    existError(): boolean {
        return this.numberError();
    };
    /** シリアライズ */
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
    /** 複製 */
    clone(): ConfigRecipeMaterial {
        const value = new ConfigRecipeMaterial();
        value.assign(this);
        return value;
    };
};
export type RecipeMaterialList = Array<ConfigRecipeMaterial>;

/**
 * レシピ
 */
export class ConfigRecipe {
    /** 入力素材の最大数 */
    static InputMax = 4;
    /** 出力素材の最大数 */
    static OutputMax = 2;
    /** レシピID */
    id: string = '';
    /** レシピ名 */
    name: string = '';
    /** 素材 (素材IDと必要数) */
    input: RecipeMaterialList = new Array<ConfigRecipeMaterial>(ConfigRecipe.InputMax);
    /** 成果物 (素材IDと必要数) */
    output: RecipeMaterialList = new Array<ConfigRecipeMaterial>(ConfigRecipe.OutputMax);
    /** 製作時間 (秒) */
    productTime: number = 1;
    /** 対象の設備 */
    machineId: string = '';
    /** ユニークキー(表示用) */
    uniqueKey: number = 0;

    /** コンストラクタ */
    constructor(data: any | null = null, 
                machines: Array<ConfigMachine> | null = null,
                materials: Array<ConfigMaterial> | null = null) {
        if (data) this.deserialize(data, machines, materials);
    };
    /** 代入 */
    assign(target: ConfigRecipe) {
        if (!target) return;
        this.id = target.id
        this.name = target.name;
        this.input = new Array<ConfigRecipeMaterial>(ConfigRecipe.InputMax);
        target.input.forEach((v: any, i: number) => {
            if (v === undefined) return;
            this.input[i] = new ConfigRecipeMaterial();
            this.input[i].assign(v);
        });
        this.output = new Array<ConfigRecipeMaterial>(ConfigRecipe.OutputMax);
        target.output.forEach((v: any, i: number) => {
            if (v === undefined) return;
            this.output[i] = new ConfigRecipeMaterial();
            this.output[i].assign(v);
        });
        this.productTime = target.productTime;
        this.machineId = target.machineId;
    };
    /** レシピIDエラー */
    idError(): boolean {
        return !this.id;
    };
    /** レシピ名エラー */
    nameError(): boolean {
        return !this.name;
    };
    /**
     * 入力素材エラー
     * @param machine [in] 設備データ
     * @param materials [in] 素材リスト
     */
    inputError(machine: ConfigMachine, materials: Array<ConfigMaterial>): boolean {
        // 有効な入力素材を取得
        const validInput = this.input.map((v) => v);
        const existValidMaterial = (validInput.length > 0);
        // 設備の入力ポート数を取得
        const conveyorPortNum = machine.inputNumber.conveyor;
        const pipePortNum = machine.inputNumber.pipe;
        // ポートタイプ別の素材IDリストを取得
        const conveyorMaterialIds = materials
            .filter((material) => material.state in PortTypeFromMaterialState(MachinePortType.Conveyor))
            .map((v) => v.id);
        const pipeMaterialIds = materials
            .filter((material) => material.state in PortTypeFromMaterialState(MachinePortType.Pipe))
            .map((v) => v.id);
        // ポートタイプ別と合計の素材数を取得
        const conveyorMaterialNum = validInput.filter((v) => v.id != '' && v.id in conveyorMaterialIds).length;
        const pipeMaterialNum = validInput.filter((v) => v.id != '' && v.id in pipeMaterialIds).length;
        // 入力ポート数より指定素材数の方が多いか
        const overConveyorMaterialNum = (conveyorMaterialNum > conveyorPortNum);
        const overPipeMaterialNum = (pipeMaterialNum > pipePortNum);
        // エラー判定（１つ以上のポートがあり、いずれかのタイプのポートに入る素材数がオーバーしていたらエラー）
        return existValidMaterial && (overConveyorMaterialNum || overPipeMaterialNum);
    };
    /**
     * 出力素材エラー（設備の出力ポートがあり素材指定が無い場合エラー）
     * @param machine [in] 設備データ
     * @param materials [in] 素材リスト
     */
    outputError(machine: ConfigMachine, materials: Array<ConfigMaterial>): boolean {
        // 有効な入力素材を取得
        const validOutput = this.output.map((v) => v);
        const existValidMaterial = (validOutput.length > 0);
        // 設備の入力ポート数を取得
        const conveyorPortNum = machine.outputNumber.conveyor;
        const pipePortNum = machine.outputNumber.pipe;
        // ポートタイプ別の素材IDリストを取得
        const conveyorMaterialIds = materials
            .filter((material) => material.state in PortTypeFromMaterialState(MachinePortType.Conveyor))
            .map((v) => v.id);
        const pipeMaterialIds = materials
            .filter((material) => material.state in PortTypeFromMaterialState(MachinePortType.Pipe))
            .map((v) => v.id);
        // ポートタイプ別と合計の素材数を取得
        const conveyorMaterialNum = validOutput.filter((v) => v.id != '' && v.id in conveyorMaterialIds).length;
        const pipeMaterialNum = validOutput.filter((v) => v.id != '' && v.id in pipeMaterialIds).length;
        // 入力ポート数より指定素材数の方が多いか
        const overConveyorMaterialNum = (conveyorMaterialNum > conveyorPortNum);
        const overPipeMaterialNum = (pipeMaterialNum > pipePortNum);
        // エラー判定（１つ以上のポートがあり、いずれかのタイプのポートに入る素材数がオーバーしていたらエラー）
        return existValidMaterial && (overConveyorMaterialNum || overPipeMaterialNum);
    };
    /** 製作時間エラー */
    productTimeError(): boolean {
        return this.productTime <= 0; // 0 もありえないのでエラー
    };
    /** 対象の設備エラー */
    machineIdError(): boolean {
        return !this.machineId;
    };
    /** エラーチェック */
    existError(machine: ConfigMachine, materials: Array<ConfigMaterial>): boolean {
        return (this.idError()
            || this.nameError()
            || this.inputError(machine, materials)
            || this.input.some((v) => v.existError())
            || this.outputError(machine, materials)
            || this.output.some((v) => v.existError())
            || this.productTimeError()
            || this.machineIdError());
    };
    /** シリアライズ */
    serialize(): any {
        return {
            Id: this.id,
            Name: this.name,
            // 入出力素材は最大数分枠を確保しているので値が入っていない部分は出力しない
            Input: this.input.filter((v) => v).map((v) => v.serialize()),
            Output: this.output.filter((v) => v).map((v) => v.serialize()),
            ProductTime: this.productTime,
            Machine: this.machineId,
        };
    };
    /** デシリアライズ */
    deserialize(data: any | null = null, 
                machines: Array<ConfigMachine> | null = null,
                materials: Array<ConfigMaterial> | null = null) {
        this.id = data.Id;
        this.name = data.Name;
        this.productTime = data.ProductTime;
        this.machineId = data.Machine;
        this.input = new Array<ConfigRecipeMaterial>(ConfigRecipe.InputMax);
        data.Input?.forEach((v: any, i: number) => {
            this.input[i] = new ConfigRecipeMaterial(v);
        });
        this.output = new Array<ConfigRecipeMaterial>(ConfigRecipe.OutputMax);
        data.Output?.forEach((v: any, i: number) => {
            this.output[i] = new ConfigRecipeMaterial(v);
        });
        
        // 入出力素材は設備のポートタイプに併せて位置調整が必要な為特殊処理する
        // ただし、素材リストが無いまたは設備データ取得に失敗した（存在しない設備IDが指定されている）場合はそのまま入れる）
        const machine = machines?.find((v) => v.id == this.machineId);
        if (machine === undefined || materials === null) return;
        this.relocateIOMaterial(machine, materials);
    };
    /** 複製 */
    clone(): ConfigRecipe {
        const value = new ConfigRecipe();
        value.assign(this);
        return value;
    };
    
    /** 
     * 設備の入出力ポートに合わせて配置を変更
     * ※固体はコンベア枠の位置へ、液体気体はパイプ枠の位置へ
     */
    relocateIOMaterial(machine: ConfigMachine, materials: Array<ConfigMaterial>) {
        // 設備の入出力ポートのタイプに合わせて再配置
        // param io [in,out] レシピの素材リスト
        // param portNumber [in] 設備のタイプ別ポート数（MachinePortType.Types の順）
        const relocate = (io: Array<ConfigRecipeMaterial>, portNumber: Array<number>) => {
            let currentIndex = 0;
            const validIO: Array<ConfigRecipeMaterial> = io.filter((v) => v);
            MachinePortType.Types.forEach((type: string, index: number) => {
                const typePortNumber = portNumber[index];
                const typeMaterials = validIO.filter((recipeMaterial: ConfigRecipeMaterial) => {
                    
                    const state = materials.find((v) => v.id == recipeMaterial.id)?.state;
                    if (!state) return false; // 設定エラー
                    return MaterialState[state].Port == type;
                });
                for (let i = 0; i < typePortNumber; i++) {
                    if (typeMaterials[i]) {
                        io[currentIndex + i] = typeMaterials[i];
                    }
                    else if (io[currentIndex + i]) {
                        // undefined を値として直接設定はできないので値がある場合だけ削除する
                        delete io[currentIndex + i];
                    }
                }
                currentIndex += typePortNumber;
            });
        };
        // 設備のタイプ別ポート数取得（MachinePortType.Types の順）
        const portNumberByType = (machinePort: ConfigMachinePort): Array<number> => {
            return MachinePortType.Types.map((type: string): number => {
                return machinePort.getWithType(type);
            });
        }
        // 入力素材再配置
        relocate(this.input, portNumberByType(machine.inputNumber));
        // 出力素材再配置
        relocate(this.output, portNumberByType(machine.outputNumber));
    };
};
/** レシピリスト */
export type ConfigRecipeList = Array<ConfigRecipe>;

/** ルート */
export class Config {
    /** 設定のバージョン */
    version: string = '';
    /** 設備カテゴリ */
    machineCategories: CategoryList = [];
    /** 素材カテゴリ */
    materialCategories: CategoryList = [];
    /** 設備リスト */
    machines: ConfigMachineList = [];
    /** 素材リスト */
    materials: ConfigMaterialList = [];
    /** レシピ */
    recipes: ConfigRecipeList = [];

    /** コンストラクタ */
    constructor(data: any | null = null) {
        if (data) this.deserialize(data);
    };
    /** 代入 */
    assign(target: Config) {
        if (!target) return;
        this.version = target.version;
        this.machineCategories = new Array<ConfigCategory>(target.machineCategories.length);
        target.machineCategories.forEach((v: any, i: number) => {
            this.machineCategories[i] = new ConfigCategory();
            this.machineCategories[i].assign(v);
        });
        this.materialCategories = new Array<ConfigCategory>(target.materialCategories.length);
        target.materialCategories.filter((v) => v).forEach((v: any, i: number) => {
            this.materialCategories[i] = new ConfigCategory();
            this.materialCategories[i].assign(v);
        });
        this.machines = new Array<ConfigMachine>(target.machines.length);
        target.machines.filter((v) => v).forEach((v: any, i: number) => {
            this.machines[i] = new ConfigMachine();
            this.machines[i].assign(v);
        });
        this.materials = new Array<ConfigMaterial>(target.materials.length);
        target.materials.filter((v) => v).forEach((v: any, i: number) => {
            this.materials[i] = new ConfigMaterial();
            this.materials[i].assign(v);
        });
        this.recipes = new Array<ConfigRecipe>(target.recipes.length);
        target.recipes.filter((v) => v).forEach((v: any, i: number) => {
            this.recipes[i] = new ConfigRecipe();
            this.recipes[i].assign(v);
        });
    };
    /** バージョンエラー */
    versionError(): boolean {
        return !this.version;
    };
    /** 設備カテゴリエラー */
    hasMachineCategoriesError(): boolean {
        return this.machineCategories.some((v) => v.existError());
    };
    /** 素材カテゴリエラー */
    hasMaterialCategoriesError(): boolean {
        return this.materialCategories.some((v) => v.existError());
    };
    /** 設備エラー */
    hsdMachinesError(): boolean {
        return this.machines.some((v) => v.existError());
    };
    /** 素材エラー */
    hasMaterialsError(): boolean {
        return this.materials.some((v) => v.existError());
    };
    /** レシピエラー */
    hasRecipesError(): boolean {
        return this.recipes.some((v) => {
            const machine = this.machines.find((m) => m.id == v.machineId);
            if (!machine) return true;
            return v.existError(machine, this.materials);
        });
    };
    /** 設備カテゴリID重複 */
    duplicateMachineCategoryIds(): Array<string> {
        const ids = this.machineCategories.map((v) => v.id);
        return getDuplicates(ids);
    };
    /** 素材カテゴリID重複 */
    duplicateMaterialCategoryIds(): Array<string> {
        const ids = this.materialCategories.map((v) => v.id);
        return getDuplicates(ids);
    };
    /** 設備ID重複 */
    duplicateMachineIds(): Array<string> {
        const ids = this.machines.map((v) => v.id);
        return getDuplicates(ids);
    };
    /** 素材ID重複 */
    duplicateMaterialIds(): Array<string> {
        const ids = this.materials.map((v) => v.id);
        return getDuplicates(ids);
    };
    /** レシピID重複 */
    duplicateRecipeIds(): Array<string> {
        const ids = this.recipes.map((v) => v.id);
        return getDuplicates(ids);
    };
    /** エラーチェック */
    existError(): boolean {
        return (this.versionError()
            || this.hasMachineCategoriesError()
            || this.hasMaterialCategoriesError()
            || this.hsdMachinesError()
            || this.hasMaterialsError()
            || this.hasRecipesError());
    };
    /** シリアライズ */
    serialize(): any {
        return {
            Format: CurrentFormat,
            Version: this.version,
            MachineCategories: this.machineCategories.map((v) => v.serialize()),
            MaterialCategories: this.materialCategories.map((v) => v.serialize()),
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
            this.recipes.push(new ConfigRecipe(v, this.machines, this.materials));
        });
    };
    /** 複製 */
    clone(): Config {
        const value = new Config();
        value.assign(this);
        return value;
    };
    /**
     * ユニークキー設定
     * @note リストレンダリング時にアイテム毎のユニーク値を指定する為に設定する。
     * @param key [in] 現在のユニークキー
     * @return 設定完了後の次のユニークキー
     */
    setUniqueKey(uniqueKey: number): number {
        let key = uniqueKey;
        const setKey = (v: any) => {
            v.uniqueKey = key++;
        };
        this.machineCategories.forEach(setKey);
        this.materialCategories.forEach(setKey);
        this.machines.forEach(setKey);
        this.recipes.forEach(setKey);
        return key;
    };
};