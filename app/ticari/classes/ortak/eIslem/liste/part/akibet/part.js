class EIslemAkibetPart extends MasterListePart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'eIslemAkibet' }
	constructor(e) { e = e || {}; super(e); $.extend(this, { eConf: e.eConf ?? MQEConf.instance }); this.title = e.title == null ? ( 'e-İşlem Akıbet' ) : e.title || ''; }

	gridArgsDuzenleDevam(e) {
		super.gridArgsDuzenleDevam(e); const {args, tabloKolonlari} = e;
		$.extend(args, { columnsHeight: 30, rowsHeight: 60, showGroupsHeader: true, showFilterRow: true, filterMode: 'default', virtualMode: false, selectionMode: 'checkbox' })
		if (tabloKolonlari) {
			for (const colDef of tabloKolonlari) {
				const {cellClassName} = colDef; colDef.cellClassName = this.gridKolon_getCSSDuzenleyici({
					duzenleyici: (sender, rowIndex, belirtec, value, rec, result) => {
						if (cellClassName) { const _result = getFuncValue.call(this, cellClassName, sender, rowIndex, belirtec, value, rec, result); if (_result != null) { result = _result } }
						return result
					}
				})
			}
		}
	}
	get defaultTabloKolonlari() {
		return $.merge(super.defaultTabloKolonlari, [
			new GridKolon({ belirtec: 'islemZamaniText', text: 'İşlem Zamanı', genislikCh: 11 }),
			new GridKolon({ belirtec: 'basariliText', text: 'Başarılı?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'uuid', text: 'UUID', genislikCh: 38 }),
			new GridKolon({ belirtec: 'eIslTipText', text: 'e-İşl. Tip', genislikCh: 11 }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'fisNox', text: 'Belge No', genislikCh: 20 }),
			new GridKolon({ belirtec: 'code', text: 'Durum', genislikCh: 10 }),
			new GridKolon({ belirtec: 'message', text: 'Açıklama', genislikCh: 90, maxWidth: 2000 }),
			new GridKolon({ belirtec: 'detail', text: 'Detay Bilgi', genislikCh: 50, maxWidth: 2000 })
		])
	}
	gridVeriYuklendi(e) { const {gridWidget} = e; setTimeout(() => gridWidget.clearselection(), 10); super.gridVeriYuklendi(e) }
	gridKolon_getCSSDuzenleyici(e) {
		e = e || {}; const {ekCSS, duzenleyici} = e;
		return ((sender, rowIndex, belirtec, value, rec) => {
			let result = [];
			if (rec.isError) { if (belirtec == 'basariliText' || belirtec == 'code' || belirtec == 'message') result.push('bg-lightred-transparent') }
			result.push(`eIslTip-${rec.efAyrimTipi}`);
			if (duzenleyici) {
				const _e = $.extend({}, e, { sender: sender, rowIndex: rowIndex, belirtec: belirtec, value: value, rec: rec, result: result });
				let _result = getFuncValue.call(this, duzenleyici, sender, rowIndex, belirtec, value, rec, result);
				if (_result != null) { if (!$.isArray(_result)) { _result = _result.split(' ') } result.push(..._result) }
			}
			return $.isArray(result) ? result.join(' ') : (result || '')
		})
	}
}
