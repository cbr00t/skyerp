class Rapor_Satislar extends PanelRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get secimSinif() { return null }
	static get kod() { return 'SATISLAR' } static get aciklama() { return 'Satışlar' }
	altRaporlarDuzenle(e) { super.altRaporlarDuzenle(e); this.add(AltRapor_Satislar_Main, AltRapor_Satislar_X1, AltRapor_Satislar_X2) }
	islemTuslariArgsDuzenle(e) {
		super.islemTuslariArgsDuzenle(e); const {liste} = e;
		liste.push({ id: 'gruplamalar', text: 'Gruplamalar', handler: _e => this.id2AltRapor.main.gruplamalarIstendi({ ...e, ..._e }), args: { width: 150 } })
	}
}
class AltRapor_Satislar_Main extends AltRapor_Gridli {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return Rapor_Satislar }
	static get kod() { return 'main' } static get aciklama() { return this.raporClass.aciklama } get width() { return '75%' } get height() { return 'var(--full)' }
	static get gruplamaKAListe() {
		let result = this._gruplamaKAListe; if (result == null) {
			result = this._gruplamaKAListe = [
				new CKodVeAdi({ kod: 'YILAY', aciklama: 'Dönem' }),
				new CKodVeAdi({ kod: 'STOK', aciklama: 'Stok' }), new CKodVeAdi({ kod: 'STGRP', aciklama: 'Stok Grup' }),
				new CKodVeAdi({ kod: 'CARI', aciklama: 'Cari' }), new CKodVeAdi({ kod: 'CRBOL', aciklama: 'Bölge' }),
				new CKodVeAdi({ kod: 'CRTIP', aciklama: 'Cari Tip' }), new CKodVeAdi({ kod: 'CRIL', aciklama: 'İl' })
			]
		}
		return result
	}
	static get allowGrupSet() { let result = this._allowGrupSet; if (result == null) { result = this._allowGrupSet = asSet(['STGRP', 'CRIL', 'CRTIP', 'CRBOL']) } return result }
	gridArgsDuzenle(e) { super.gridArgsDuzenle(e); const {args} = e; $.extend(args, { /* showStatusBar: true, showGroupAggregates: true , compact: true */ }) }
	onGridInit(e) { super.onGridInit(e); const {gridPart} = this; gridPart.gruplamalar = {} }
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'Column1', text: 'Dönem', genislikCh: 8, userData: { grup: 'YILAY' } }),
			new GridKolon({ belirtec: 'grup', text: 'Stok Grup', maxWidth: 200, userData: { grup: 'STGRP' } }),
			new GridKolon({ belirtec: 'stok', text: 'Stok', minWidth: 500, userData: { grup: 'STOK' } }),
			new GridKolon({ belirtec: 'tip', text: 'Tip', maxWidth: 150, userData: { grup: 'CRTIP' } }),
			new GridKolon({ belirtec: 'cari', text: 'Cari', minWidth: 500, userData: { grup: 'CARI' } }),
			new GridKolon({ belirtec: 'bolge', text: 'Bölge', maxWidth: 200, userData: { grup: 'CRBOL' } }),
			new GridKolon({ belirtec: 'il', text: 'İl', maxWidth: 150, userData: { grup: 'CRIL' } }),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 9, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal(),
			new GridKolon({ belirtec: 'ciro', text: 'Ciro', genislikCh: 16, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel()
		)
	}
	async loadServerData(e) {
		super.loadServerData(e); const {gridPart} = this; let {gruplamalar} = gridPart;
		/*if ($.isEmptyObject(gruplamalar)) { gruplamalar = asSet(this.class.gruplamaKAListe.map(x => x.kod)) } */
		if ($.isEmptyObject(gruplamalar)) { return [] }
		let query = await app.sqlExecTekilDeger({
			query: 'SELECT dbo.tic_satisKomutu(@argDonemBasi, @argDonemSonu, @argGruplama)', params: [
				{ name: '@argDonemBasi', type: 'datetime', value: dateToString(new Date(1, 1, today().getFullYear())) },
				{ name: '@argDonemSonu', type: 'datetime', value: dateToString(today()) },
				{ name: '@argGruplama', type: 'structured', typeName: 'type_strIdList', value: Object.keys(gruplamalar).map(id => ({ id })) }
			]
		});
		let recs = query ? await app.sqlExecSelect(query) : [];
		const fixKA = (rec, prefix) => {
			let value = rec[prefix + 'kod']; if (value !== undefined) {
				rec[prefix] = value ? `<b>(${rec[prefix + 'kod'] || ''})</b> ${rec[prefix + 'adi'] || ''}` : '';
				delete rec[prefix + 'kod']; delete rec[prefix + 'adi']
			}
		}, kaPrefixes = ['stok', 'grup', 'cari', 'tip', 'bolge', 'il'];
		for (const rec of recs) { for (const prefix of kaPrefixes) { fixKA(rec, prefix) } }
		return recs.sort((a, b) => { a = a.Column1 || 0; b = b.Column1 || 0; return a > b ? -1 : a < b ? 1 : 0 })
	}
	gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); const {fbd_grid, gridPart} = this, {grid, gridWidget} = this; let {_lastGruplamalar} = gridPart;
		let {gruplamalar} = gridPart, gruplamaVarmi = !$.isEmptyObject(gruplamalar), colDefs = fbd_grid.tabloKolonlari; const {allowGrupSet, gruplamaKAListe} = this.class;
		/*if ($.isEmptyObject(gruplamalar)) { gruplamalar = asSet(gruplamaKAListe.map(x => x.kod)) }*/
		fbd_grid.rootBuilder.layout.find('.islemTuslari > div button#gruplamalar')[gruplamaVarmi ? 'removeClass' : 'addClass']('anim-gruplamalar-highlight');
		if (!gruplamaVarmi) {
			if (!this._gruplamalarGosterildiFlag) { this.gruplamalarIstendi(e) }
			return
		}
		const tip2Belirtecler = {}; let count = 0; for (const colDef of colDefs) {
			const {belirtec} = colDef, grup = colDef.userData?.grup;
			if (grup != null && allowGrupSet[grup] && gruplamalar[grup]) { (tip2Belirtecler[grup] = tip2Belirtecler[grup] || []).push(belirtec); if (++count == 1) { break } }
		}
		let anahGruplamalar = Object.keys(gruplamalar).join(delimWS), anahLastGruplamalar = _lastGruplamalar ? Object.keys(_lastGruplamalar).join(delimWS) : null;
		if (anahLastGruplamalar == null || anahGruplamalar != anahLastGruplamalar) {
			let tabloKolonlari = colDefs.filter(colDef => { const grup = colDef.userData?.grup; return grup == null || !!gruplamalar[grup] });
			try { gridPart.updateColumns({ tabloKolonlari }) } catch (ex) { console.error(ex) }
			_lastGruplamalar = gridPart._lastGruplamalar = $.extend({}, gruplamalar)
		}
		try { gridWidget[gruplamalar.STOK || gruplamalar.STGRP ? 'showcolumn' : 'hidecolumn']('miktar') } catch (ex) { console.error(ex) }
		const groups = []; if (Object.keys(gruplamalar).length >= 2) {
			for (const belirtecler of Object.values(tip2Belirtecler)) { if (belirtecler?.length) { const belirtec = belirtecler[1] || belirtecler[0]; groups.push(belirtec) } }
		}
		if (groups.length) { grid.jqxGrid('groups', groups) }
		/*if (groups.length) { for (const belirtec of groups) { gridWidget.hidecolumn(belirtec) } }*/
	}
	gruplamalarIstendi(e) {
		const {gridPart} = this, {gruplamalar} = gridPart, {gruplamaKAListe} = this.class;
		let wRFB = new RootFormBuilder('gruplamalar').addCSS('part');
		wRFB.addIslemTuslari('islemTuslari').setTip('tamam').setId2Handler({ tamam: e => wnd.jqxWindow('close') })
			.addStyle(e => `$elementCSS .butonlar.part > .sol { z-index: -1; background-color: unset !important; background: transparent !important }`);
		let fbd_content = wRFB.addFormWithParent('content').yanYana()
			.addStyle(e => `$elementCSS { position: relative; top: 10px; z-index: 100 } $elementCSS > button { margin: 0 0 10px 10px }
			$elementCSS > button.jqx-fill-state-normal { background-color: whitesmoke !important } $elementCSS > button.jqx-fill-state-pressed { background-color: royalblue !important }`);
		for (const {kod, aciklama} of gruplamaKAListe) {
			let btn = fbd_content.addForm(kod).setLayout(e => {
				const {builder} = e, {id} = builder;
				return builder.input = $(`<button id="${id}">${aciklama}</button>`).jqxToggleButton({ theme, width: '45%', height: 50, toggled: gruplamalar[id] })
			});
			btn.onAfterRun(e => e.builder.input.on('click', evt => this.gruplamalar_butonTiklandi({ ...e, evt, id: evt.currentTarget.id, gridPart, gruplamalar })) )
		}
		let wnd = createJQXWindow({ title: 'Gruplamalar', args: { isModal: true, width: 500, height: 430, closeButtonAction: 'close' } });
		wnd.on('close', evt => { wnd.jqxWindow('destroy'); this.tazele(); $('body').removeClass('bg-modal') });
		wnd.prop('id', 'gruplamalar'); wnd.addClass('part'); $('body').addClass('bg-modal');
		let parent = wnd.find('div > .subContent'); wRFB.setParent(parent); wRFB.run(); this._gruplamalarGosterildiFlag = true
	}
	gruplamalar_butonTiklandi(e) {
		const {id, evt, gruplamalar} = e, target = $(evt.currentTarget), flag = target.jqxToggleButton('toggled');
		if (flag) { gruplamalar[id] = true } else { delete gruplamalar[id] }
	}
}
class AltRapor_Satislar_X1 extends AltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return Rapor_Satislar }
	static get kod() { return 'x1' } static get aciklama() { return 'Chart' }
	get width() { return `calc(var(--full) - ${AltRapor_Satislar_Main.width})` } get height() { return '300px' }
	subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e); const parentBuilder = e.builder; parentBuilder.addForm('chart').setLayout(e => this.getLayout(e)).addStyle_fullWH() }
	getLayout(e) { return $('<h3>.. Chart buraya ...</h3>') }
}
class AltRapor_Satislar_X2 extends AltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return Rapor_Satislar }
	static get kod() { return 'x2' } static get aciklama() { return 'Diagram' }
	get width() { return `calc(var(--full) - ${AltRapor_Satislar_Main.width})` } get height() { return '300px' }
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
