class DRapor_Satislar extends DGrupluPanelRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'SATISLAR' } static get aciklama() { return 'Satışlar' } static get altRaporClassPrefix() { return 'DAltRapor_Satislar' }
}
class DAltRapor_Satislar_Main extends DAltRapor_TreeGridGruplu {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Satislar } get width() { return 'var(--full)' }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e, {grup, toplam, kaPrefixes} = result;
		result.sortAttr = 'Column1'; kaPrefixes.push('stok', 'grup', 'cari', 'tip', 'bolge', 'il');
		$.extend(grup, {
			YILAY: { ka: new CKodVeAdi({ kod: 'YILAY', aciklama: 'Dönem' }), colDefs: [new GridKolon({ belirtec: 'Column1', text: 'Dönem', genislikCh: 13, filterType: 'checkedlist' })] },
			STGRP: { ka: new CKodVeAdi({ kod: 'STGRP', aciklama: 'Stok Grup' }), colDefs: [new GridKolon({ belirtec: 'grup', text: 'Stok Grup', maxWidth: 350, filterType: 'checkedlist' })] },
			STOK: { ka: new CKodVeAdi({ kod: 'STOK', aciklama: 'Stok' }), colDefs: [new GridKolon({ belirtec: 'stok', text: 'Stok', maxWidth: 600, filterType: 'input' })] },
			CRTIP: { ka: new CKodVeAdi({ kod: 'CRTIP', aciklama: 'Cari Tip' }), colDefs: [new GridKolon({ belirtec: 'tip', text: 'Tip', maxWidth: 250, filterType: 'checkedlist' })] },
			CRBOLGE: { ka: new CKodVeAdi({ kod: 'CRBOL', aciklama: 'Bölge' }), colDefs: [new GridKolon({ belirtec: 'bolge', text: 'Bölge', maxWidth: 300, filterType: 'input' })] },
			CARI: { ka: new CKodVeAdi({ kod: 'CARI', aciklama: 'Cari' }), colDefs: [new GridKolon({ belirtec: 'cari', text: 'Cari', maxWidth: 600, filterType: 'input' })] },
			CRIL: { ka: new CKodVeAdi({ kod: 'CRIL', aciklama: 'Cari İl' }), colDefs: [new GridKolon({ belirtec: 'il', text: 'İl', maxWidth: 100, filterType: 'checkedlist' })] }
		});
		$.extend(toplam, {
			miktar: { ka: new CKodVeAdi({ kod: 'miktar', aciklama: 'Miktar' }), colDefs: [new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 13, filterType: 'numberinput' }).tipDecimal()] },
			ciro: { ka: new CKodVeAdi({ kod: 'ciro', aciklama: 'Ciro' }), colDefs: [new GridKolon({ belirtec: 'ciro', text: 'Ciro', genislikCh: 17, filterType: 'numberinput' }).tipDecimal_bedel() ] }
		})
	}
	async loadServerDataInternal(e) {
		const {secilenler} = this, {attrSet} = secilenler, {maxRow} = e; let query = await app.sqlExecTekilDeger({
			query: 'SELECT dbo.tic_satisKomutu(@argDonemBasi, @argDonemSonu, @argGruplama)', params: [
				{ name: '@argDonemBasi', type: 'datetime', value: dateToString(new Date(1, 1, today().getFullYear())) },
				{ name: '@argDonemSonu', type: 'datetime', value: dateToString(today()) },
				{ name: '@argGruplama', type: 'structured', typeName: 'type_strIdList', value: Object.keys(attrSet).map(id => ({ id })) }
			]
		});
		const recs = query ? await app.sqlExecSelect({ query, maxRow }) : null; return recs
	}
}
class __DAltRapor_Satislar_Chart extends DAltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Satislar }
	static get kod() { return 'x1' } static get aciklama() { return 'Chart' }
	get width() { return `calc(var(--full) - ${DAltRapor_Satislar_Main.width})` } get height() { return '300px' }
	subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e); const parentBuilder = e.builder; parentBuilder.addForm('chart').setLayout(e => this.getLayout(e)).addStyle_fullWH() }
	getLayout(e) { return $('<h3>.. Chart buraya ...</h3>') }
}
