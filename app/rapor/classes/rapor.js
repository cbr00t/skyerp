class Rapor_Satislar extends MQRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get secimSinif() { return null }
	static get kod() { return 'SATISLAR' } static get aciklama() { return 'Satışlar' }
	static get gruplamaKAListe() {
		let result = this._gruplamaKAListe; if (result == null) {
			result = this._gruplamaKAListe = [
				new CKodVeAdi({ kod: 'YILAY', aciklama: 'Dönem' }),
				new CKodVeAdi({ kod: 'STOK', aciklama: 'Stok' }), new CKodVeAdi({ kod: 'STGRP', aciklama: 'Stok Grup' }),
				new CKodVeAdi({ kod: 'CARI', aciklama: 'Cari' }), new CKodVeAdi({ kod: 'CRBOL', aciklama: 'Cari Bölge' }),
				new CKodVeAdi({ kod: 'CRTIP', aciklama: 'Cari Tip' }), new CKodVeAdi({ kod: 'CRIL', aciklama: 'Cari İl' })
			]
		}
		return result
	}
	/*static secimlerDuzenle(e) {
		const sec = e.secimler; sec.secimTopluEkle({
			secim1: new SecimOzellik({ etiket: 'Seçim 1' }),
			secim2: new SecimOzellik({ etiket: 'Seçim 2' })
		});
		sec.whereBlockEkle(e => { const sec = e.secimler, wh = e.where })
	}*/
	static listeEkrani_init(e) { super.listeEkrani_init(e); const gridPart = e.sender; gridPart.tekil(); $.extend(gridPart, { gruplamalar: {} }) }
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); const gridPart = e.sender, rfb = e.rootBuilder;
		const fbd_islemTuslari_sol = rfb.addForm('islemTuslari_sol').setLayout(e => e.builder.rootPart.islemTuslariPart.sol).addCSS('flex-row').setAltInst(e => e.builder.rootPart);
		fbd_islemTuslari_sol.addButton('gruplamalarSec', 'Gruplamalar').setInst(null).onClick(_e => this.gruplamalarIstendi({ ...e, ..._e })).addStyle_wh(150)
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); const {args} = e }
	static orjBaslikListesi_groupsDuzenle(e) {
		super.orjBaslikListesi_groupsDuzenle(e); const gridPart = e.gridPart ?? e.sender, {gridWidget} = gridPart, colDefs = this.orjBaslikListesi, {liste} = e; let {gruplamalar} = gridPart;
		if ($.isEmptyObject(gruplamalar)) { gruplamalar = asSet(this.gruplamaKAListe.map(x => x.kod)) } const allowGrupSet = asSet(['STGRP', 'CRIL', 'CRTIP', 'CRBOL']);
		const tip2Belirtecler = {}; let count = 0; for (const colDef of colDefs) {
			const {belirtec} = colDef, grup = colDef.userData?.grup;
			if (grup != null && allowGrupSet[grup] && gruplamalar[grup]) { (tip2Belirtecler[grup] = tip2Belirtecler[grup] || []).push(belirtec); if (++count == 2) { break } }
		}
		for (const belirtecler of Object.values(tip2Belirtecler)) { if (belirtecler?.length) { liste.push(belirtecler[1] || belirtecler[0]) } }
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'Column1', text: 'Dönem', genislikCh: 10, userData: { grup: 'YILAY' } }),
			new GridKolon({ belirtec: 'stokkod', text: 'Stok', genislikCh: 16, userData: { grup: 'STOK' } }),
			new GridKolon({ belirtec: 'stokadi', text: 'Stok Adı', genislikCh: 40, userData: { grup: 'STOK' } }),
			new GridKolon({ belirtec: 'grupkod', text: 'Stok Grup', genislikCh: 16, userData: { grup: 'STGRP' } }),
			new GridKolon({ belirtec: 'grupadi', text: 'Grup Adı', genislikCh: 25, userData: { grup: 'STGRP' } }),
			new GridKolon({ belirtec: 'carikod', text: 'Cari', genislikCh: 16, userData: { grup: 'CARI' } }),
			new GridKolon({ belirtec: 'cariadi', text: 'Cari Ünvan', genislikCh: 50, userData: { grup: 'CARI' } }),
			new GridKolon({ belirtec: 'tipkod', text: 'Tip', genislikCh: 5, userData: { grup: 'CRTIP' } }),
			new GridKolon({ belirtec: 'tipadi', text: 'Tip Adı', genislikCh: 23 , userData: { grup: 'CRTIP' } }),
			new GridKolon({ belirtec: 'bolgekod', text: 'Bölge', genislikCh: 5, userData: { grup: 'CRBOL' } }),
			new GridKolon({ belirtec: 'bolgeadi', text: 'Bölge Adı', genislikCh: 18, userData: { grup: 'CRBOL' } }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 5, userData: { grup: 'CRIL' } }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 16, userData: { grup: 'CRIL' } }),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 8 }).tipDecimal(),
			new GridKolon({ belirtec: 'ciro', text: 'Ciro', genislikCh: 16 }).tipDecimal_bedel()
		].filter(x => !!x))
	}
	static async loadServerData(e) {
		const gridPart = e.gridPart ?? e.sender; let {gruplamalar} = gridPart; if ($.isEmptyObject(gruplamalar)) { gruplamalar = asSet(this.gruplamaKAListe.map(x => x.kod)) }
		let query = await app.sqlExecTekilDeger({
			query: 'SELECT dbo.tic_satisKomutu(@argDonemBasi, @argDonemSonu, @argGruplama)', params: [
				{ name: '@argDonemBasi', type: 'datetime', value: dateToString(new Date(1, 1, today().getFullYear())) },
				{ name: '@argDonemSonu', type: 'datetime', value: dateToString(today()) },
				{ name: '@argGruplama', type: 'structured', typeName: 'type_strIdList', value: Object.keys(gruplamalar).map(id => ({ id })) }
			]
		});
		let recs = query ? await app.sqlExecSelect(query) : []; return recs
	}
	static gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); const gridPart = e.gridPart ?? e.sender, {gridWidget} = gridPart, colDefs = this.orjBaslikListesi; let {gruplamalar, _lastGruplamalar} = gridPart;
		if ($.isEmptyObject(gruplamalar)) { gruplamalar = asSet(this.gruplamaKAListe.map(x => x.kod)) }
		let anahGruplamalar = Object.keys(gruplamalar).join(delimWS), anahLastGruplamalar = _lastGruplamalar ? Object.keys(_lastGruplamalar).join(delimWS) : null;
		if (anahLastGruplamalar == null || anahGruplamalar != anahLastGruplamalar) {
			let tabloKolonlari = colDefs.filter(colDef => { const grup = colDef.userData?.grup; return grup == null || !!gruplamalar[grup] });
			gridPart.updateColumns({ tabloKolonlari }); _lastGruplamalar = gridPart._lastGruplamalar = $.extend({}, gruplamalar)
		}
	}
	static gruplamalarIstendi(e) {
		const {builder} = e, gridPart = e.gridPart ?? builder.rootPart, {gruplamaKAListe} = this, {gruplamalar} = gridPart;
		let wRFB = new RootFormBuilder('gruplamalar').addCSS('part');
		wRFB.addIslemTuslari('islemTuslari').setTip('tamam').setId2Handler({ tamam: e => wnd.jqxWindow('close') })
			.addStyle(e => `$elementCSS .butonlar.part > .sol { z-index: -1; background-color: unset !important; background: transparent !important }`);
		let fbd_content = wRFB.addFormWithParent('content').yanYana()
			.addStyle(e => `$elementCSS { position: relative; top: 10px; z-index: 100 } $elementCSS > button { margin: 0 0 10px 10px }
			$elementCSS > button.jqx-fill-state-normal { background-color: whitesmoke !important } $elementCSS > button.jqx-fill-state-pressed { background-color: royalblue !important }`);
		for (const {kod, aciklama} of gruplamaKAListe) {
			let btn = fbd_content.addForm(kod).setLayout(e => {
				const {builder} = e, {id} = builder; return builder.input = $(`<button id="${id}">${aciklama}</button>`).jqxToggleButton({ theme, width: '45%', height: 50, toggled: gruplamalar[id] })
			});
			btn.onAfterRun(e => e.builder.input.on('click', evt => this.gruplamalar_butonTiklandi({ ...e, evt, id: evt.currentTarget.id, gridPart, gruplamalar })) )
		}
		let wnd = createJQXWindow({ title: 'Gruplamalar', args: { isModal: true, width: 500, height: 500, closeButtonAction: 'close' } });
		wnd.on('close', evt => { wnd.jqxWindow('destroy'); gridPart.tazele() });
		wnd.prop('id', 'gruplamalar'); wnd.addClass('part');
		let parent = wnd.find('div > .subContent'); wRFB.setParent(parent); wRFB.run()
	}
	static gruplamalar_butonTiklandi(e) {
		const {id, evt, gruplamalar} = e, target = $(evt.currentTarget), flag = target.jqxToggleButton('toggled');
		if (flag) { gruplamalar[id] = true } else { delete gruplamalar[id] }
	}
}
