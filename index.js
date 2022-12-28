// エントリポイント
$(document).ready(function() {
    console.log('document loaded.');
    // 設定読込
    config.load((_data) => {
        console.log('loaded:', config.isLoaded());
        console.log(_data);

        // 製品名の選択肢を設定
        const $productItemSelect = $('select.product-item-select');
        // - デフォルトの選択肢を追加
        const $defaultOption = $(createElement('option', '', '-- 製品選択 --'));
        $defaultOption.attr('value', '')
        $productItemSelect.append($defaultOption);
        // - カテゴリ毎にアイテム追加
        const categoryIdList = config.getCategoryIdList();
        categoryIdList.forEach((_categoryId) => {
            // カテゴリに属するアイテムIDを取得
            const itemIdList = config.getItemIdByCategory(_categoryId);
            // 入力素材が無いレシピしかないアイテム（手で取るもの）を除外
            const selectableItemIdList = itemIdList.filter((_itemId) => {
                const hasItemInOutput = config.hasItemInOutput(_itemId);
                const hasInputForItem = config.hasInputForItem(_itemId);
                return hasItemInOutput && hasInputForItem;
            })
            // アイテムが存在すればカテゴリ単位で選択肢に追加
            if (selectableItemIdList.length) {
                // カテゴリ名の選択肢追加
                const categoryName = config.getCategoryName(_categoryId);
                const categoryOption = $(createElement('option', '', '■ ' + categoryName));
                categoryOption.addClass('category');
                categoryOption.attr('disabled', true);
                $productItemSelect.append(categoryOption);
                // カテゴリに属するアイテムの選択肢を追加
                selectableItemIdList.forEach((_itemId) => {
                    const itemName = config.getItemName(_itemId);
                    const option = $(createElement('option', '', itemName));
                    option.attr('value', _itemId);
                    $productItemSelect.append(option);
                });
            }
        });
        // - イベント設定
        $productItemSelect.on('change', () => {
            const selectedItemId = $productItemSelect.val();
            flow.setItem(selectedItemId);
            updateFlowView();
            updateMaterialTable();
            updateByproductTable();
        })
    });
});