/// 副産物テーブルの表示

function updateByproductTable() {
    const $table = $('table.byproduct-table');
    // テーブルを一旦クリア
    $('tr:not(.th)', $table).remove();
    // 製作フローの持つ全素材を走査
    let data = {}; // アイテムID > 必要数
    const collectMaterials = (_flow) => {
        if (_flow.hasByproduct()) {
            const [itemId, needs] = _flow.getByproduct();
            if (!Object.keys(data).includes(itemId)) {
                data[itemId] = 0;
            }
            data[itemId] += needs;
        }
        _flow.getMaterialList().forEach((_materialFlow) => {
            collectMaterials(_materialFlow);
        });
    }
    collectMaterials(flow);
    // テーブル構築
    Object.keys(data).forEach((_itemId) => {
        // 行を追加
        const $tr = $(createElement('tr'));
        $table.append($tr);
        // セルを追加
        const itemName = config.getItemName(_itemId);
        const $tdName = $(createElement('td', '', itemName));
        $tr.append($tdName);
        const $tdNeeds = $(createElement('td','', data[_itemId].toString()));
        $tr.append($tdNeeds);
    });
}