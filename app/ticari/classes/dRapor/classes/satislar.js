class DRapor_Satislar extends DGrupluPanelRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'SAxTISLAR' } static get aciklama() { return 'Satışlar' } static get altRaporClassPrefix() { return 'DAltRapor_Satislar' }
}
class __DAltRapor_Satislar_Main extends DAltRapor_GridGruplu {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Satislar } static get kod() { return 'main' }
	static get sortAttr() { return 'Column1' } static get gridGrupAttrListe() { return [...(super.gridGrupAttrListe || []), 'YILAY', 'STGRP', 'CRIL', 'CRTIP', 'CRBOL'] }
	static get kaPrefixes() { return [...(super.kaPrefixes || []), 'stok', 'grup', 'cari', 'tip', 'bolge', 'il'] }
	static get gruplamaKAListe() {
		return [...(super.gruplamaKAListe || []),
			new CKodVeAdi({ kod: 'YILAY', aciklama: 'Dönem' }),
			new CKodVeAdi({ kod: 'STOK', aciklama: 'Stok' }), new CKodVeAdi({ kod: 'STGRP', aciklama: 'Stok Grup' }),
			new CKodVeAdi({ kod: 'CARI', aciklama: 'Cari' }), new CKodVeAdi({ kod: 'CRBOL', aciklama: 'Bölge' }),
			new CKodVeAdi({ kod: 'CRTIP', aciklama: 'Cari Tip' }), new CKodVeAdi({ kod: 'CRIL', aciklama: 'İl' })
		]
	}
	static get gruplama2IcerikCols() { return ({ STOK: ['miktar', 'ciro'], STGRP: ['miktar', 'ciro'], CARI: ['ciro'], CRIL: ['ciro'], CRTIP: ['ciro'], CRBOL: ['ciro'] }) }
	gridArgsDuzenle(e) { super.gridArgsDuzenle(e); const {args} = e; $.extend(args, { /* showStatusBar: true, showGroupAggregates: true , compact: true */ }) }
	onGridInit(e) { super.onGridInit(e); const {gridPart} = this; gridPart.gruplamalar = {} }
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
		super.loadServerDataInternal(e); let query = await app.sqlExecTekilDeger({
			query: 'SELECT dbo.tic_satisKomutu(@argDonemBasi, @argDonemSonu, @argGruplama)', params: [
				{ name: '@argDonemBasi', type: 'datetime', value: dateToString(new Date(1, 1, today().getFullYear())) },
				{ name: '@argDonemSonu', type: 'datetime', value: dateToString(today()) },
				{ name: '@argGruplama', type: 'structured', typeName: 'type_strIdList', value: Object.keys(e.gruplamalar).map(id => ({ id })) }
			]
		});
		return query ? await app.sqlExecSelect(query) : null
	}
}
class DAltRapor_Satislar_Chart extends DAltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Satislar }
	static get kod() { return 'x1' } static get aciklama() { return 'Chart' }
	get width() { return `calc(var(--full) - ${DAltRapor_Satislar_Main.width})` } get height() { return '300px' }
	subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e); const parentBuilder = e.builder; parentBuilder.addForm('chart').setLayout(e => this.getLayout(e)).addStyle_fullWH() }
	getLayout(e) { return $('<h3>.. Chart buraya ...</h3>') }
}
class __iptal__DAltRapor_Satislar_Diagram extends DAltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Satislar }
	static get kod() { return 'x2' } static get aciklama() { return 'Diagram' }
	get width() { return `calc(var(--full) - ${DAltRapor_Satislar_Main.width})` } get height() { return '300px' }
	subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e); const parentBuilder = e.builder; parentBuilder.addForm('diagram').setLayout(e => this.getLayout(e)).addStyle_fullWH() }
	getLayout(e) {
		const html = `<pre class="mermaid">graph LR
			 A[13,032] --> |Accept John's Offer| B[12,000]
			 A ==> |Reject John's Offer |C(($13,032))
			 C --> |Offer from Vanessa 0.6| D[$14,000]
			 D ==> |Accept Vanessa's Offer| E[$14,000]
			 D --> |Reject Vanessa's Offer| F(($11,580))
			 C --> |No Offer from Vanessa 0.4| G(($11,580))
			 G --> |Salary 1 0.05| H[$21,600]
			 G --> |Salary 2 0.25| I[$16,800]
			 G --> |Salary 3 0.40| J[$12,800]
			 G --> |Salary 4 0.25| K[$6,000]
			 G --> |Salary 5 0.05| L[$0]
			 F --> |Salary 1 0.05| M[$21,600]
			 F --> |Salary 2 0.25| N[$16,800]
			 F --> |Salary 3 0.40| O[$12,800]
			 F --> |Salary 4 0.25| P[$6,000]
			 F --> |Salary 5 0.05| Q[$0]
		</pre>`;
		const iframe = $(`<iframe class="full-wh" style="border: none"></iframe>`); iframe[0].srcdoc =
		`<html>
			<head>
				<meta charset="utf-8"><meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=yes, shrink-to-fit=yes" />
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.1/mermaid.css" /><script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.1/mermaid.min.js"></script>
				<style>html { width: 350%; height: 300% }</style>
			</head>
			<body>${html}</body>
		</html>`; return iframe
	}
}

class DAltRapor_Satislar_Main extends DAltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Satislar } static get kod() { return 'main' } get width() { return '85%' } get height() { return 'var(--full)' }
	static get kaPrefixes() { return [...(super.kaPrefixes || []), 'stok', 'grup', 'cari', 'tip', 'bolge', 'il'] } static get sortAttr() { return 'grup' }
	static get gruplamaKAListe() {
		return [...(super.gruplamaKAListe || []),
			new CKodVeAdi({ kod: 'YILAY', aciklama: 'Dönem' }),
			new CKodVeAdi({ kod: 'STOK', aciklama: 'Stok' }), new CKodVeAdi({ kod: 'STGRP', aciklama: 'Stok Grup' }),
			new CKodVeAdi({ kod: 'CARI', aciklama: 'Cari' }), new CKodVeAdi({ kod: 'CRBOL', aciklama: 'Bölge' }),
			new CKodVeAdi({ kod: 'CRTIP', aciklama: 'Cari Tip' }), new CKodVeAdi({ kod: 'CRIL', aciklama: 'İl' })
		]
	}
	onBuildEk(e) {
		super.onBuildEk(e); const {parentBuilder} = this, {layout} = parentBuilder;
		parentBuilder.addForm(`<div class="grid part full-wh"/>`)
			.onAfterRun(async e => {
				const {builder} = e, gridPart = this.gridPart = builder.part = {}, grid = gridPart.grid = builder.layout, {gruplamaKAListe} = this.class;
				const gruplamalar = this._gruplamalar = gruplamaKAListe.map(ka => ka.kod);
				let _e = { liste: [] }; this.tabloKolonlariDuzenle(_e); const colDefs = _e.liste;
				for (const colDef of colDefs) { colDef.gridPart = gridPart; for (const key of ['tip', 'cellsRenderer', 'cellClassName', 'cellValueChanging']) { delete colDef[key] } }
				const columns = colDefs.filter(colDef => colDef.belirtec != 'grup').flatMap(colDef => colDef.jqxColumns), source = await this.getDataAdapter(e)
				const localization = localizationObj, width = '99.7%', height = width, autoRowHeight = true, autoShowLoadElement = true, altRows = true, showAggregates = true, showSubAggregates = true, aggregatesHeight = 55, columnsResize = true, columnsReorder = true, sortable = true, filterable = true;
				let offset = 0; grid.jqxTreeGrid({
					theme, localization, width, height, autoRowHeight, autoShowLoadElement, altRows, showAggregates, showSubAggregates, aggregatesHeight,
					columnsResize, columnsReorder, sortable, filterable, columns, source
				});
				gridPart.gridWidget = grid.jqxTreeGrid('getInstance');
				/*grid.on('bindingComplete', event => {
					const {gridWidget} = gridPart; clearTimeout(gridWidget._timer_bindingComplete);
					gridWidget._timer_bindingComplete = setTimeout(() => { try { this.gridVeriYuklendi({ ...event, e }) } finally { delete gridWidget._timer_bindingComplete } }, 100)
				})*/
			})
	}
	async tazele(e) {
		await super.tazele(e); const {grid} = this.gridPart || {}; if (!grid) { return }
		const da = await this.getDataAdapter(e); if (!da) { return } grid.jqxTreeGrid('source', da)
	}
	gridVeriYuklendi(e) {
		const {grid, gridWidget} = this.gridPart, {boundRecs, recs} = e;
		// debugger
	}
	tabloKolonlariDuzenle(e) {
		const {liste} = e; liste.push(
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
	async getDataAdapter(e) {
		const recs = await this.loadServerData(e), tRec = recs[0] || {}, key_id = 'id', key_items = 'records';
		return new $.jqx.dataAdapter({
			__hierarchy: { keyDataField: { name: key_id }, parentDataField: { name: 'parentId' } }, hierarchy: { root: key_items }, dataType: 'array', localData: recs,
			dataFields: Object.keys(tRec).map(name => ({ name, type: typeof tRec[name] == 'object' ? 'array' : (typeof tRec[name] || 'string') })),
		}, { autoBind: false, loadComplete: (boundRecs, recs) => setTimeout(() => this.gridVeriYuklendi({ ...e, boundRecs, recs }), 10) });
	}
	async loadServerData(e) {
		let gruplamalar = this._gruplamalar; if (gruplamalar && !$.isArray(gruplamalar)) { gruplamalar = Object.values(gruplamalar) }
		let query = await app.sqlExecTekilDeger({
			query: 'SELECT dbo.tic_satisKomutu(@argDonemBasi, @argDonemSonu, @argGruplama)', params: [
				{ name: '@argDonemBasi', type: 'datetime', value: dateToString(new Date(1, 1, today().getFullYear())) },
				{ name: '@argDonemSonu', type: 'datetime', value: dateToString(today()) },
				{ name: '@argGruplama', type: 'structured', typeName: 'type_strIdList', value: gruplamalar.map(id => ({ id })) }
			]
		});
		let recs = query ? await app.sqlExecSelect({ query, maxRow: 100 }) : null; if ($.isEmptyObject(recs)) { return recs }
		const {gridPart} = this, {kaPrefixes} = this.class, fixKA = (rec, prefix) => {
			if (rec == null) { return } const kod = rec[prefix + 'kod'], adi = rec[prefix + 'adi'];
			if (kod !== undefined) {
				rec[prefix] = kod ? `<b>(${kod ?? ''})</b> ${adi ?? ''}` : '';
				delete rec[prefix + 'kod']; delete rec[prefix + 'adi']
			}
		};
		let id = 1; for (const rec of recs) { for (const prefix of kaPrefixes) { fixKA(rec, prefix) } rec.id = id++ }
		const {sortAttr} = this.class; if (sortAttr) { recs.sort((a, b) => { a = a[sortAttr] || 0; b = b[sortAttr] || 0; return a > b ? -1 : a < b ? 1 : 0 }) }
		const grup2Recs = {}; for (const rec of recs) { const {grup} = rec, subRecs = grup2Recs[grup] = grup2Recs[grup] || []; subRecs.push(rec) }
		recs = []; for (const [grup, subRecs] of Object.entries(grup2Recs)) {
			const rec_grup = { id: id++, stok: grup, records: [] }; recs.push(rec_grup);
			for (const subRec of subRecs) { rec_grup.records.push(subRec) }
		}
		return recs
	}
}
