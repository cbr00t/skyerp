class MQSablon extends MQDetayliGUIDVeAdiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Şablon' } static get tip() { return null }
	static get kod() { return this.tip } static get aciklama() { return null }
	static get kodListeTipi() { return 'SABLON' } static get tableAlias() { return 'sab' } static get detaySinif() { return MQSablonDetay }
	static get tip2Sinif() {
		let result = this._tip2Sinif; if (result == null) {
			result = {}; const {subClasses} = this; for (const cls of subClasses) { const {araSeviyemi, tip} = cls; if (!araSeviyemi && tip) { result[tip] = cls } }
			this._tip2Sinif = result
		}
		return result
   }
	static getClass(e) { const tip = typeof e == 'object' ? e.tip : e; return this.tip2Sinif[tip] }
	static newFor(e) { if (typeof e != 'object') { e = { tip: e } } const cls = this.getClass(e); return cls ? new cls(e) : null }
}
class MQSablonDetay extends MQDetayGUID { static { window[this.name] = this; this._key2Class[this.name] = this } }

class MQSablonCPT extends MQSablon {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'CPT Şablon' }
	static get tip() { return 'cpt' } static get aciklama() { return 'CPT' } static get kodListeTipi() { return 'SABCPT' } static get table() { return 'esecptsablon' }
	static get detaySinif() { return MQSablonCPTDetay } static get gridKontrolcuSinif() { return MQSablonCPTGridci } get resimSayisi() { return this.detaylar?.length }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			resimArasiSn: new PInstNum('resimarasisn'), gecerliResimSeq: new PInstNum({ rowAttr: 'gecerliresimseq', init: e => 1 }),
			grupTekrarSayisi: new PInstNum({ rowAttr: 'gruptekrarsayisi', init: e => 1 })
		})
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(
			/*new GridKolon({ belirtec: 'resimsayisi', text: 'Resim Sayısı', genislikCh: 13, filterType: 'checkedlist', sql: `(select count(*) from esecptsablondetay where id = id)` }),*/
			new GridKolon({ belirtec: 'resimarasisn', text: 'Resim Arası (sn)', genislikCh: 13, filterType: 'checkedlist' }).tipNumerik(),
			new GridKolon({ belirtec: 'gruptekrarsayisi', text: 'Grup Tekrar Sayısı', genislikCh: 13, filterType: 'checkedlist' }).tipNumerik(),
			new GridKolon({ belirtec: 'gecerliresimseq', text: 'Geçerli Resim No', genislikCh: 13, filterType: 'checkedlist' }).tipNumerik()
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e) /* const {sent} = e, alias = this.tableAlias, {detayTable} = this;
		sent.leftJoin({ alias, from: `${detayTable} har`, on: `${alias}.id = har.id` })
		sent.sahalar.add('COUNT(har.*) resimsayisi'); sent.groupByOlustur() ?? */
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const {tabPage_genel, kaForm} = e, {aciklama: fbd_aciklama} = kaForm?.id2Builder;
		fbd_aciklama?.addStyle_wh('calc(var(--full) - 450px)'); let form = kaForm.yanYana();
		form.addNumberInput('resimArasiSn', 'Resim Arası (sn)').addStyle_wh(130); form.addNumberInput('grupTekrarSayisi', 'Grup Tekrar').addStyle_wh(130); 
		form.addNumberInput('gecerliResimSeq', 'Geçerli Resim No').addStyle_wh(150)
	}
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { resimsayisi: this.resimSayisi }) }
}
class MQSablonCPTDetay extends MQSablonDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'esecptsablondetay' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { resimLink: new PInstStr('resimlink') }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); const {args} = e; $.extend(args, { rowsHeight: 100 }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(
			new GridKolon({
				belirtec: 'resim', text: 'Resim', genislikCh: 30, cellsRenderer: (colDef, rowIndex, columnField, _value, html, jqxCol, rec) => {
					const {resimlink: value} = rec; if (!value) { return html }
					let parts = value ? value.split('=') : null, ext, resimmi = true;
					if (parts?.length) {
						let ind = parts.findIndex(part => part?.toLowerCase()?.endsWith('ext'));
						if (ind != -1) { ext = parts[ind + 1]?.trim()?.toLowerCase(); resimmi = !!fileExtSet_image[ext] }
					}
					if (value) {
						html = resimmi
							? `<div class="full-wh" style="background-repeat: no-repeat; background-size: contain; background-image: url(${value})"/>`
							: `<iframe class="full-wh" style="border: none; margin: 0; padding: 0; background-size: contain; pointer-events: none"
									src="${value}" onerror="this.remove()"></iframe>`
					}
					return html
				}
			}).noSql().tipResim()
		)
	}
}
class MQSablonCPTGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	gridArgsDuzenle(e) { super.gridArgsDuzenle(e); const {args} = e; $.extend(args, { rowsHeight: 100 }) }
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e); e.tabloKolonlari.push(
			new GridKolon({ belirtec: 'resimLink' }).hidden(),
			new GridKolon({ belirtec: 'resimSec', text: ' ', genislikCh: 10 }).readOnly().tipButton()
				.setValue('Yükle').onClick(_e => setTimeout((e, _e) => this.resimSecIstendi({ ...e, ..._e }), 1, e, _e)),
			new GridKolon({ belirtec: 'resimGoster', text: ' ', genislikCh: 10 }).readOnly().tipButton()
				.setValue('Göster').onClick(_e => setTimeout((e, _e) => this.resimGosterIstendi({ ...e, ..._e }), 1, e, _e)),
			new GridKolon({ belirtec: 'resimSil', text: ' ', genislikCh: 10 }).readOnly().tipButton()
				.setValue(`<span class="bold red">SİL</span>`).onClick(_e => setTimeout((e, _e) => this.resimSilIstendi({ ...e, ..._e }), 1, e, _e)),
			new GridKolon({
				belirtec: 'resim', text: 'Resim', genislikCh: 30, cellsRenderer: (colDef, rowIndex, columnField, _value, html, jqxCol, rec) => {
					const {resimLink} = rec; if (!resimLink) { return html }
					let value = rec.resimLink, parts = value ? value.split('=') : null, ext, resimmi = true;
					if (parts?.length) {
						let ind = parts.findIndex(part => part?.toLowerCase()?.endsWith('ext'));
						if (ind != -1) { ext = parts[ind + 1]?.trim()?.toLowerCase(); resimmi = !!fileExtSet_image[ext] }
					}
					if (value) {
						html = resimmi
							? `<div class="full-wh" style="background-repeat: no-repeat; background-size: contain; background-image: url(${value})"/>`
							: `<iframe class="full-wh" style="border: none; margin: 0; padding: 0; background-size: contain; pointer-events: none"
									src="${value}" onerror="this.remove()"></iframe>`
					}
					return html
				}
			}).readOnly().tipResim()
		)
	}
	fis2Grid(e) {
		let result = super.fis2Grid(e); if (!result) { return result } const {fis} = e; if (!fis) { return false }
		let recs = e.recs = e.recs || []; const {gridDetaySinif} = fis.class;
		for (let i = 0; i < 5; i++) { recs.push(gridDetaySinif ? new gridDetaySinif() : {}) }
		return true
	}
	resimSecIstendi(e) {
		const islemAdi = 'Resim Yükle', {rec, rowIndex, gridWidget} = e;
		try {
			let elm = $(`<input type="file" capture accept="image/*, application/pdf, video/*">`).appendTo('body'); elm.addClass('jqx-hidden');
			elm.on('change', async evt => {
				try {
					const file = evt.target.files[0]; let fileName = file.name.replaceAll(' ', '_'), ext = fileName.split('.').slice(-1)[0] ?? '';
					const resimId = ext ? fileName.slice(0, -(ext.length + 1)) : fileName, data = file ? new Uint8Array(await file.arrayBuffer()) : null; if (!data?.length) { return }
					const result = await app.wsResimDataKaydet({ resimId, ext, data }); if (!result?.result) { throw { isError: true, errorText: 'Resim Kayıt Sorunu' } }
					gridWidget.setcellvalue(rowIndex, 'resimLink', `${app.getWSUrlBase()}/resimData/?id=${resimId}&ext=${ext}`); gridWidget.render()
				}
				catch (ex) { hConfirm(getErrorText(ex), islemAdi); throw ex }
				finally { $(evt.target).remove() }
			}); elm.click()
		}
		catch (ex) { if (ex instanceof DOMException) { return } hConfirm(getErrorText(ex), islemAdi); throw ex }
	}
	resimGosterIstendi(e) {
		const islemAdi = 'Resim Göster', {rec, rowIndex, gridWidget} = e, {resimLink} = rec || {}; if (!resimLink) { return }
		try { let urlListe = [resimLink]; new ESEResimWindowPart({ urlListe }).run() } catch (ex) { hConfirm(getErrorText(ex), islemAdi); throw ex }
	}
	resimSilIstendi(e) {
		const islemAdi = 'Resim SİL', {rec, rowIndex, gridWidget} = e;
		gridWidget.setcellvalue(rowIndex, 'resimLink', ''); gridWidget.render()
	}
}
class MQSablonESE extends MQSablon {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'ESE Şablon' }
	static get tip() { return 'ese' } static get aciklama() { return 'ESE' } static get kodListeTipi() { return 'SABESE' } static get table() { return 'eseesesablon' }
	static get detaySinif() { return MQSablonESEDetay } static get gridKontrolcuSinif() { return MQSablonESEGridci }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { secenekSayisi: new PInstNum('seceneksayisi') }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(new GridKolon({ belirtec: 'seceneksayisi', text: 'Seçenek Sayısı', genislikCh: 13, filterType: 'checkedlist' }).tipNumerik())
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const {tabPage_genel} = e; let form = tabPage_genel.addFormWithParent().yanYana(2)
		/*form.addNumberInput('secenekSayisi', 'Seçenek Sayısı').setMin(0).setMax(MQSablonESEYanit.maxSecenekSayisi).addStyle_wh(130)*/
	}
}
class MQSablonESEDetay extends MQSablonDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'eseesesablondetay' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { soru: new PInstStr('soru'), yanitId: new PInstGuid('yanitid') }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); const {args} = e; $.extend(args, { rowsHeight: 50 }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(...[
			new GridKolon({ belirtec: 'soru', text: 'Soru', genislikCh: 50 }),
			/*(config.dev ? new GridKolon({ belirtec: 'yanitid', text: 'Yanit ID', genislikCh: 50 }) : null),*/
			new GridKolon({ belirtec: 'yanitadi', text: 'Yanit Adı', genislikCh: 50, filterType: 'checkedlist', sql: 'ynt.aciklama' })
		].filter(x => !!x))
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, alias = this.tableAlias;
		sent.leftJoin({ alias, from: 'eseeseyanit ynt', on: `${alias}.yanitid = ynt.id` })
		sent.sahalar.add('ynt.aciklama yanitadi')
	}
	setValues(e) { super.setValues(e); const {rec} = e; $.extend(this, { yanitAdi: rec.yanitadi }) }
}
class MQSablonESEGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	gridArgsDuzenle(e) { super.gridArgsDuzenle(e); const {args} = e; $.extend(args, { rowsHeight: 50 }) }
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e); e.tabloKolonlari.push(
			new GridKolon({ belirtec: 'soru', text: 'Soru', genislikCh: 50 }).tipString(512),
			...MQSablonESEYanit.getGridKolonlar({ belirtec: 'yanit', kodAttr: 'yanitId', argsDuzenle: e => e.kolonGrup.kodsuz() })
			/*new GridKolon({ belirtec: 'yanitId', text: 'Yanıt', genislikCh: 20 }).tipTekSecim({ kodsuz: true, source: e => MQSablonESEYanit.loadServerData(e) })*/
		)
	}
}

class MQSablonESEYanit extends MQGuidVeAdiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'ESE Yanıt' } static get maxSecenekSayisi() { return 5 }
	static get kodListeTipi() { return 'ESEYANIT' } static get table() { return 'eseeseyanit' } static get tableAlias() { return 'ynt' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e, {maxSecenekSayisi} = this;
		for (let i = 1; i <= maxSecenekSayisi; i++) { const key = `secenek${i}`; pTanim[key] = new PInstStr(key) }
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e, {maxSecenekSayisi} = this;
		for (let i = 1; i <= maxSecenekSayisi; i++) { liste.push(new GridKolon({ belirtec: `secenek${i}`, text: `Seçenek ${i}`, genislikCh: 50 })) }
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPanel, tabPage_genel} = e, {maxSecenekSayisi} = this;
		let form = tabPage_genel.addFormWithParent().altAlta();
		for (let i = 1; i <= maxSecenekSayisi; i++) { form.addTextInput(`secenek${i}`, `Seçenek ${i}`).setMaxLength(50) }
	}
}