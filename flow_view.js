/// 製作フロー表示更新
function updateFlowView() {
    const $viewBox = $('ul.tree > li');
    // 一旦要素の中身を空にする
    $viewBox.empty();
    // フローと同じ構成を構築
    const createElements = (_$target, _targetFlow) => {
        if (!_targetFlow.getItemId()) return;
        // アイテム枠
        const $spanBox = $(createElement('span', 'item-box'));
        _$target.append($spanBox);
        // 設備名取得
        let machineId = _targetFlow.getMachineId();
        let machineName = config.getMachineName(machineId);
        const isHandRecipe = !machineId;
        if (isHandRecipe) {
            // 設備が無い場合は手で採取するものなので置き換える
            machineId = 'Hand';
            machineName = '手';
        }
        const $imgMachine = $(createElement('img'));
        $imgMachine.attr('src', '/assets/icon/' + machineId + '.svg');
        $imgMachine.attr('title', machineName);
        $spanBox.append($imgMachine);
        // アイテム情報枠
        const $spanInfoBox = $(createElement('span', 'item-info-box'));
        $spanBox.append($spanInfoBox);
        // アイテム情報枠（アイテム・必要数段）
        const $spanNeedsBox = $(createElement('span', 'item-needs-box'));
        $spanInfoBox.append($spanNeedsBox);
        const itemId = _targetFlow.getItemId();
        {
            // アイテム名設定
            const itemName = config.getItemName(itemId);
            const spanName = createElement('span', 'item-name', itemName);
            $spanNeedsBox.append(spanName);
            // 必要数設定
            const needs = _targetFlow.getNeeds();
            const $inputNeeds = $(createElement('input', 'item-needs'));
            $inputNeeds.attr('type', 'text');
            $inputNeeds.attr('value', needs);
            if (_targetFlow.hasParentFlow()) {
                // ルートのフロー以外は必要数を変更できないようにする
                $inputNeeds.attr('disabled', 'true');
            }
            $inputNeeds.on('change', (event) => {
                // 値変更時にフローの更新処理呼び出し
                console.log('changed needs.');
                const newValue = parseFloat(event.target.value);
                _targetFlow.setNeeds(newValue);
                updateFlowView();
                updateMaterialTable();
            });
            $spanNeedsBox.append($inputNeeds);
            // 必要数単位テキスト設定
            const spanNeedsUnit = createElement(
                'span', 'item-needs-unit', '/分');
            $spanNeedsBox.append(spanNeedsUnit);
        }
        // アイテム情報枠（レシピ段）
        if (isHandRecipe) {
            // 手で採取するものはレシピも素材もないのでここまで
            return;
        }
        const $spanRecipeBox = $(createElement('span', 'item-recipe-box'));
        $spanInfoBox.append($spanRecipeBox);
        {
            // レシピ名項目
            const spanRecipeNameCaption = createElement('span', '', 'レシピ：');
            $spanRecipeBox.append(spanRecipeNameCaption);
            // レシピ名
            const recipeName = config.getRecipeName(_targetFlow.getRecipeId());
            const $selectRecipe = $(createElement('select', 'item-recipe-combobox'));
            const recipeNameList = config.getRecipeNameList(itemId);
            recipeNameList.forEach((_recipeName) => {
                const option = $(createElement('option', '', _recipeName));
                if (_recipeName == recipeName) {
                    option.attr('selected', true);
                }
                $selectRecipe.append(option);
            });
            $selectRecipe.on('change', (event) => {
                // 値変更時にフローの更新処理呼び出し
                console.log('changed needs.');
                const newValue = event.target.value;
                _targetFlow.setItem(itemId, newValue);
                updateFlowView();
                updateMaterialTable();
                updateByproductTable();
            });
            $spanRecipeBox.append($selectRecipe);
        }
        // アイテム情報枠（副産物段）
        if (_targetFlow.hasByproduct()) {
            const $spanByproductBox = $(createElement('span', 'item-byproduct-box'));
            $spanInfoBox.append($spanByproductBox);
            {
                // 副産物ラベル
                const spanByproductCaption = createElement('span', 'item-byproduct-label', '副産物：');
                $spanByproductBox.append(spanByproductCaption);
                // 副産物名
                const [byproductId, byproductNeeds] = _targetFlow.getByproduct();
                const byproductName = config.getItemName(byproductId);
                const spanByproductName = createElement('span', 'item-byproduct-name', byproductName);
                $spanByproductBox.append(spanByproductName);
                // 生産数
                const spanByproductNeeds = createElement('span', 'item-byproduct-needs', byproductNeeds);
                $spanByproductBox.append(spanByproductNeeds);
                // 生産数単位
                const spanByproductNeedsUnit = createElement('span', 'item-byproduct-needs-unit', '/分');
                $spanByproductBox.append(spanByproductNeedsUnit);
            }
        }
        
        // 素材毎に再帰構築
        const $ul = $(document.createElement('ul'));
        const materialList = _targetFlow.getMaterialList();
        materialList.forEach((_flow) => {
            const li = document.createElement('li');
            $ul.append(li);
            createElements($(li), _flow);
        })
        _$target.append($ul);
        
        // 素材非表示ボタン
        if (materialList.length) {
            const $spanHideButton = $(createElement('span', 'hide-button', '×'));
            $spanHideButton.click(() => {
                $ul.css('display', 'none');
            });
            $ul.append($spanHideButton);
        }
    };
    createElements($viewBox, flow);
}