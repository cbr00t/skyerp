class DRapor_Satislar extends DGrupluPanelRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'SATISLAR' } static get aciklama() { return 'Satışlar' } static get altRaporClassPrefix() { return 'DAltRapor_Satislar' }
}
class DAltRapor_Satislar_Main extends DAltRapor_TreeGridGruplu {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Satislar } get width() { return 'var(--full)' }
	static get kaPrefixes() { return [...(super.kaPrefixes || []), 'stok', 'grup', 'cari', 'tip', 'bolge', 'il'] } static get sortAttr() { return 'Column1' }
	static get gridGrupAttrListe() { return [...(super.gridGrupAttrListe || []), 'YILAY', 'STGRP', 'CRIL', 'CRTIP', 'CRBOL'] }
	static get gruplama2IcerikCols() { return ({ STOK: ['miktar', 'ciro'], STGRP: ['miktar', 'ciro'], CARI: ['ciro'], CRIL: ['ciro'], CRTIP: ['ciro'], CRBOL: ['ciro'] }) }
	static get gruplamaKAListe() {
		return [...(super.gruplamaKAListe || []),
			new CKodVeAdi({ kod: 'YILAY', aciklama: 'Dönem' }),
			new CKodVeAdi({ kod: 'STOK', aciklama: 'Stok' }), new CKodVeAdi({ kod: 'STGRP', aciklama: 'Stok Grup' }),
			new CKodVeAdi({ kod: 'CARI', aciklama: 'Cari' }), new CKodVeAdi({ kod: 'CRBOL', aciklama: 'Bölge' }),
			new CKodVeAdi({ kod: 'CRTIP', aciklama: 'Cari Tip' }), new CKodVeAdi({ kod: 'CRIL', aciklama: 'İl' })
		]
	}
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'Column1', text: 'Dönem', genislikCh: 13, filterType: 'checkedlist', userData: { grup: 'YILAY' } }),
			new GridKolon({ belirtec: 'grup', text: 'Stok Grup', maxWidth: 300, filterType: 'checkedlist', userData: { grup: 'STGRP' } }),
			new GridKolon({ belirtec: 'stok', text: 'Stok', minWidth: 400, filterType: 'input', userData: { grup: 'STOK' } }),
			new GridKolon({ belirtec: 'tip', text: 'Tip', maxWidth: 250, filterType: 'checkedlist', userData: { grup: 'CRTIP' } }),
			new GridKolon({ belirtec: 'cari', text: 'Cari', minWidth: 400, filterType: 'input', userData: { grup: 'CARI' } }),
			new GridKolon({ belirtec: 'bolge', text: 'Bölge', maxWidth: 300, filterType: 'input', userData: { grup: 'CRBOL' } }),
			new GridKolon({ belirtec: 'il', text: 'İl', maxWidth: 180, filterType: 'checkedlist', userData: { grup: 'CRIL' } }),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 13, filterType: 'numberinput', aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal(),
			new GridKolon({ belirtec: 'ciro', text: 'Ciro', genislikCh: 17, filterType: 'numberinput', aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel()
		)
	}
	async loadServerDataInternal(e) {
		const {gruplamalar} = e; let query = await app.sqlExecTekilDeger({
			query: 'SELECT dbo.tic_satisKomutu(@argDonemBasi, @argDonemSonu, @argGruplama)', params: [
				{ name: '@argDonemBasi', type: 'datetime', value: dateToString(new Date(1, 1, today().getFullYear())) },
				{ name: '@argDonemSonu', type: 'datetime', value: dateToString(today()) },
				{ name: '@argGruplama', type: 'structured', typeName: 'type_strIdList', value: gruplamalar.map(id => ({ id })) }
			]
		});
		const recs = query ? await app.sqlExecSelect({ query, maxRow: 100 }) : null; return recs
	}
}
class __DAltRapor_Satislar_Chart extends DAltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Satislar }
	static get kod() { return 'x1' } static get aciklama() { return 'Chart' }
	get width() { return `calc(var(--full) - ${DAltRapor_Satislar_Main.width})` } get height() { return '300px' }
	subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e); const parentBuilder = e.builder; parentBuilder.addForm('chart').setLayout(e => this.getLayout(e)).addStyle_fullWH() }
	getLayout(e) { return $('<h3>.. Chart buraya ...</h3>') }
}
