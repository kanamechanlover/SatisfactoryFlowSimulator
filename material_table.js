/// 素材テーブルの表示

function updateMaterialTable() {
    const $table = $('table.material-table');
    // テーブルを一旦クリア
    $('tr:not(.th)', $table).remove();
    // 製作フローの持つ全素材を走査
    let data = {}; // カテゴリID > アイテムID > 必要数
    const collectMaterials = (_flow) => {
        const itemId = _flow.getItemId();
        const needs = _flow.getNeeds();
        const categoryId = config.getCategoryIdByItemId(itemId);
        if (!Object.keys(data).includes(categoryId)) {
            data[categoryId] = {};
        }
        if (!Object.keys(data[categoryId]).includes(itemId)) {
            data[categoryId][itemId] = 0;
        }
        data[categoryId][itemId] += needs;
        _flow.getMaterialList().forEach((_materialFlow) => {
            collectMaterials(_materialFlow);
        });
    }
    collectMaterials(flow);
    // テーブル構築
    Object.keys(data).forEach((_categoryId) => {
        // 行を追加
        const $trCategory = $(createElement('tr'));
        $table.append($trCategory);
        // カテゴリ名のセルを追加
        const categoryName = config.getCategoryName(_categoryId);
        const $tdCategoryName = $(createElement('td', 'category', categoryName));
        $tdCategoryName.attr('colspan', '2');
        $trCategory.append($tdCategoryName);
        Object.keys(data[_categoryId]).forEach((_itemId) => {
            // 行を追加
            const $tr = $(createElement('tr'));
            $table.append($tr);
            // セルを追加
            const itemName = config.getItemName(_itemId);
            const $tdName = $(createElement('td', '', itemName));
            $tr.append($tdName);
            const $tdNeeds = $(createElement('td','', data[_categoryId][_itemId].toString()));
            $tr.append($tdNeeds);
        });
    });
}