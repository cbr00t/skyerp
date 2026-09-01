class GidenEIslemListePart extends EIslemListeBasePart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'gidenEIslemListe' } static get filtreSinif() { return GidenEIslemFiltre }
	constructor(e) { e ??= {}; super(e); this.title = e.title == null ? ( 'Giden e-İşlem Listesi' ) : e.title || '' }
	runDevam(e) {
		e ??= {}; super.runDevam(e);
		let {dbName} = config.session, {kural} = app.params.eIslem, {sadeceAdi2mi} = kural?.shAdi ?? {};
		if (!sadeceAdi2mi && dbName?.toUpperCase().includes('BAKERMAN')) { setTimeout(() => hConfirm(`<b>BAKERMAN</b> veritabanı için e-İşlem Parametresi <b class="red">Stok Adı Gösterim</b> kuralı <u class="bold royalblue">2. Adı</u> olarak işaretlenmelidir`, 'UYARI'), 1000) }
	}
	islemTuslariDuzenle(e) {
		super.islemTuslariDuzenle(e)
		let { liste, part } = e
		liste.push({
			id: 'gonderildiDurumAyarla',
			text: 'GND',
			toolTip: 'Gönderim Durum Ayarla',
			handler: e => this.gonderildiDurumAyarlaIstendi(e)
		})
		liste.unshift(
			{ id: 'eIslemGonder', toolTip: 'e-İşlem GÖNDER', handler: e => this.eIslemGonderIstendi(e) },
			{ id: 'eIslemIzle', toolTip: 'e-İşlem İzle', handler: e => this.eIslemIzleIstendi(e) },
			{ id: 'eIslemSorgu', toolTip: 'e-İşlem Durum Sorgula', handler: e => this.eIslemSorguIstendi(e) },
			{ id: 'eIslemXMLOlustur', toolTip: 'e-İşlem XML Oluştur', handler: e => this.eIslemXMLOlusturIstendi(e) },
			{ id: 'eIslemIptal', toolTip: 'e-İşlem İPTAL', handler: e => this.eIslemIptalIstendi(e) },
			{ id: 'xmlKaldir', toolTip: 'XML Kaldır', handler: e => this.xmlKaldirIstendi(e) }
		)
		extend(part.sagButonIdSet, asSet(['eIslemGonder', 'eIslemIzle', 'eIslemSorgu', 'eIslemXMLOlustur', 'eIslemIptal', 'xmlKaldir']))
	}
	get defaultTabloKolonlari() {
		let getCSSDuzenleyici = e => {
			e ??= {}; let {ekCSS, duzenleyici} = e;
			return ((sender, rowIndex, belirtec, value, rec) => {
				let result = [belirtec]; let {efayrimtipi, efatonaydurumu, efatuuid, efimzats, efgonderimts} = rec;
				if (!$.isEmptyObject(ekCSS)) { let _liste = $.isArray(ekCSS) ? ekCSS : [ekCSS]; result.push(..._liste) }
				if (efayrimtipi != null) { result.push(`eIslTip-${efayrimtipi}`) }
				if (efatonaydurumu != null) { result.push(`akibet-${efatonaydurumu}`) }
				if (efimzats) { result.push('imzali') }
				if (efgonderimts) { result.push('gonderildi') }
				if (efatuuid) { result.push('hasUUID') }
				if (duzenleyici) { let _e = extend({}, e, { sender, rowIndex, belirtec, value, rec, result }); getFuncValue.call(this, duzenleyici, _e); result = _e.result }
				return result.join(' ')
			})
		};
		return $.merge(super.defaultTabloKolonlari, [
			new GridKolon({ belirtec: 'eIslTipText', text: 'e-İşlem', genislikCh: 11, filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'belgeTipText', text: 'Belge<br/>Tipi', filterType: 'checkedlist', genislikCh: 13, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 11, filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }).tipDate(),
			new GridKolon({ belirtec: 'fisnox', text: 'Belge<br/>No', genislikCh: 18, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'akibetText', text: 'Akıbet', genislikCh: 12, filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'mustText', text: 'Müşteri', filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'efimzats', text: 'XML Oluş.<br/>Zamanı', genislikCh: 11, filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'efgonderimts', text: 'Gönderim<br/>Zamanı', genislikCh: 11, filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'sonucbedel', text: 'Sonuç<br/>Bedel', genislikCh: 17, cellClassName: getCSSDuzenleyici() }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'dvKodText', text: 'Dv.', genislikCh: 5, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'efUUIDText', text: 'UUID<br/>(ETTN)', genislikCh: 34, cellClassName: getCSSDuzenleyici() })
		])
	}
	loadServerData_veriDuzenle(e) {
		super.loadServerData_veriDuzenle(e)
		let tSec_eIslTip = new EIslemTip()
		let tSec_akibet = new EIslemOnayDurum()
		let { secimler: sec } = this
		let { recs } = e
		for (let rec of recs) {
			let efAyrimTipi = rec.efayrimtipi ||= 'A'
			let { efatonaydurumu: efOnayDurumu } = rec
			extend(rec, {
				eIslTipText: tSec_eIslTip.kaDict[efAyrimTipi]?.aciklama || efAyrimTipi,
				belgeTipText: sec.class.getBelgeTipText({ rec }),
				akibetText: tSec_akibet.kaDict[efOnayDurumu]?.aciklama || efOnayDurumu,
				mustText: `(<b>${rec.mustkod}</b>) ${rec.birunvan}`,
				efUUIDText: rec.efatuuid || rec.zorunluguidstr,
				dvKodText: rec.dvkod || 'TL'
			})
		}
	}
	async gonderildiDurumAyarlaIstendi(e = {}) {
		let { eConf } = this
		let islemAdi = 'Gönderildi Durum Ayarla'
		let { recs } = await this.getSecilenSatirlar({ islemAdi }) ?? {}

		let defAction = recs[0].efgonderimts ? '' : 'X'
		let _now = now()
		
		let inst = {
			action: defAction,
			tarih: dateToString(_now),
			saat: timeToString(_now)
		}
		let rfb
		;{
			rfb = new RootFormBuilder()
				.setInst(inst)
				.addStyle(
					`$elementCSS { padding: 10px !important }
					 $elementCSS > div:not(:first-child) { margin-top: 20px !important }`
				)
			;{
				let form = rfb.addFormWithParent().yanYana()
				form.addDiv()
					.setValue(`Seçilen ${recs.length} için Gönderildi Durumunu`)
					.etiketGosterim_yok()
				rfb.addSelect('action', ' ')
					.setSource([
						new CKodVeAdi(['X', 'İmza Zamanına Göre Ayarla']),
						new CKodVeAdi(['T', 'Alttaki Tarih için ayarla']),
						new CKodVeAdi(['', 'GönderilMEdi'])
					])
					.degisince(({ builder: { parentBuilder: { id2Builder } } }) =>
						id2Builder._ts.updateVisible())
					.onAfterRun(({ builder: { input } }) =>
						delay(1).then(() =>
							input.val(inst.action))
					)
					.addStyle_wh(400)
			}
			;{
				let form = rfb.addFormWithParent('_ts').yanYana()
					.setVisibleKosulu(() =>
						inst.action?.trimEnd() ? true : 'jqx-hidden')
				form.addDateInput('tarih', 'Gönderim Tarih')
				form.addTimeInput('saat', 'Saat')
			}
		}
		rfb.run()

		let wnd, res
		let pr = defer()
		let close = res => {
			wnd.jqxWindow('destroy')
			pr.resolve(res)
		}
		
		wnd = createJQXWindow({
			content: rfb.layout,
			title: islemAdi,
			args: {
				isModal: true,
				width: 500, height: 300,
				closeButtonAction: 'close'
			},
			buttons: {
				TAMAM: () => close(true),
				VAZGEÇ: () => close(false)
			}
		})
		wnd.on('close', close)

		try { res = await pr } catch (ex) { }
		if (!res)
			return

		let { action, tarih, saat } = inst
		if (action == null)
			return

		let ts = asDate(tarih ?? today().clone().clearTime())
		if (saat)
			ts.setTime(saat)
		
		let ps2Recs = {}
		;recs.forEach(r => {
			let { pstip: ps } = r
			;(ps2Recs[ps] ??= [])
				.push(r)
		})

		let toplu = new MQToplu().withTrn()
		for (let [ps, recs] of entries(ps2Recs)) {
			let table = EYonetici.getPS2Table(ps)
			let sayaclar = recs.map(r => r.kaysayac)
			let tsClause = (
				action == 'X' ? 'COALESCE(efimzats, GETDATE())'.sqlConst() :
				action == 'T' ? ts :
				null
			)
			
			let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
			upd.fromAdd(table)
			wh.inDizi(sayaclar, 'kaysayac')
			set.degerAta(tsClause, 'efgonderimts')
			toplu.add(upd)
		}
		if (empty(toplu.liste))
			return

		await toplu.execute()
		this.tazele()
	}
	async eIslemGonderIstendi(e = {}) {
		let { eConf } = this
		let islemAdi = 'e-İşlem Gönder'
		let _e = await this.getSecilenSatirlar_mesajli({ islemAdi }) ?? {}
		let { recs } = _e
		if (!recs)
			return
		
		let { event: { ctrlKey: ctrl } = {} } = e
		if (ctrl)
			await this.xmlKaldirIstendi({ ...e, recs })
		try {
			extend(_e, { eConf, callback: new EIslemAkibet_Callback({ islemAdi }) })
			this.showProgress(_e)
			await EYonetici.eIslemGonder(_e)
		}
		catch (ex) {
			_e.error = ex
			// hConfirm(getErrorText(ex), islemAdi)
			console.error(ex)
			throw ex
		}
		finally { this.uiIslemiSonrasi(_e) }
	}
	async eIslemIzleIstendi(e = {}) {
		let islemAdi = 'e-İşlem İZLE'
		let _e = await this.getSecilenSatirlar_mesajli({ islemAdi }) ?? {}
		let { recs, sender: listePart } = _e
		if (!recs)
			return

		let { eConf } = this
		let { event: { ctrlKey: ctrl } = {} } = e
		if (ctrl)
			await this.xmlKaldirIstendi({ ...e, silent: true, recs })
		
		try {
			extend(_e, { eConf, callback: new EIslemAkibet_Callback({ islemAdi }) })
			this.showProgress(_e)
			await EYonetici.eIslemXMLOlustur({ ..._e, internal: true })
			;{
				let pr = promise(resolve => {
					let { veriYukleninceBlock: handler } = listePart
					listePart.veriYuklenince((...args) => {
						listePart.veriYuklenince(handler)
						handler?.call(this, ...args)
						resolve()
					})
				})
				await this.tazele()
				await pr
				recs = _e.recs = ( await this.getSecilenSatirlar({ islemAdi }) )?.recs
			}
			await EYonetici.eIslemIzle(_e)
		}
		catch (ex) {
			_e.error = ex
			// hConfirm(getErrorText(ex), islemAdi)
			console.error(ex)
			throw ex
		}
		finally { this.uiIslemiSonrasi({ ..._e, silent: true }) }
	}
	async eIslemSorguIstendi(e = {}) {
		let {eConf} = this, islemAdi = 'e-İşlem Sorgu'
		let {silent, event: { ctrlKey: ctrl } = {}} = e
		let mesajli = !(silent || ctrl)
		let _e = await this.getSecilenSatirlar({ islemAdi, mesajli }) || {}
		let {recs} = _e
		if (!recs)
			return
		try {
			extend(_e, { eConf, callback: new EIslemAkibet_Callback({ islemAdi }) })
			if (ctrl) {
				islemAdi = _e.islemAdi = 'e-İşlem UUID Değiştir'
				_e.araMesaj = `<span class="bold royalblue">${islemAdi}</span> işlemi`
				if (recs.length != 1)
					throw { isError: true, errorText: 'UUID değişimi için tek satır seçilmelidir' }
				let rec = recs[0], {efatuuid: uuid, pstip: psTip, kaysayac: sayac} = rec
				uuid = uuid?.toLowerCase() ?? ''
				let newUUID = (await jqxPrompt({ etiket: 'Yeni UUID değerini giriniz', title: 'UUID Değiştir', value: uuid }))?.trim()?.toLowerCase()
				if (!newUUID)
					return
				if (uuid == newUUID)
					return
				if (!isGUID(newUUID))
					throw { isError: true, errorText: `<b class=firebrick>${newUUID}</b> değeri geçerli bir UUID değildir` }
				this.showProgress(_e)
				let table = EYonetici.getPS2Table(psTip)
				let upd = new MQIliskiliUpdate(), {set, where: wh} = upd
				upd.fromAdd(table)
				wh.degerAta(sayac, 'kaysayac')
				set.degerAta(newUUID, 'efatuuid')
				set.add(`efimzats = NULL`, `efgonderimts = NULL`, `efatonaydurumu = ''`, `zorunluguidstr = ''`)
				await app.sqlExecNone(upd)
				EYonetici.eIslemSorgula(_e).finally(() =>
					this.tazele())
				return
			}
			this.showProgress(_e)
			await EYonetici.eIslemSorgula(_e)
		}
		catch (ex) {
			_e.error = ex
			// hConfirm(getErrorText(ex), islemAdi)
			console.error(ex)
			throw ex
		}
		finally { this.uiIslemiSonrasi(_e) }
	}
	async eIslemXMLOlusturIstendi(e = {}) {
		let {eConf} = this, islemAdi = 'e-İşlem XML Oluştur'
		let _e = await this.getSecilenSatirlar_mesajli({ islemAdi }) || {}
		let {recs} = _e
		if (!recs)
			return
		let {event: { ctrlKey: ctrl } = {}} = e
		if (ctrl)
			await this.xmlKaldirIstendi({ ...e, silent: true, recs })
		try {
			extend(_e, { eConf, callback: new EIslemAkibet_Callback({ islemAdi }) })
			this.showProgress(_e)
			await EYonetici.eIslemXMLOlustur(_e)
		}
		catch (ex) {
			_e.error = ex
			// hConfirm(getErrorText(ex), islemAdi)
			console.error(ex)
			throw ex
		}
		finally { this.uiIslemiSonrasi(_e) }
	}
	async eIslemIptalIstendi(e = {}) {
		let {eConf} = this, islemAdi = 'e-İşlem İPTAL'
		let _e = await this.getSecilenSatirlar_mesajli({ islemAdi }) || {}
		let {recs} = _e
		if (!recs)
			return
		try {
			extend(_e, { eConf, callback: new EIslemAkibet_Callback({ islemAdi }) })
			this.showProgress(_e)
			await EYonetici.eIslemIptal(_e)
		}
		catch (ex) {
			_e.error = ex
			// hConfirm(getErrorText(ex), islemAdi)
			console.error(ex)
			throw ex
		}
		finally { this.uiIslemiSonrasi(_e) }
	}
	async xmlKaldirIstendi(e = {}) {
		let islemAdi = 'e-İşlem XML Kaldır'
		let {eConf} = this, {silent, recs} = e, _e = { ...e, sender: this }
		if (!recs) {
			extend(_e, await this.getSecilenSatirlar({ islemAdi, mesajli: !silent }) || {})
			recs = _e.recs
		}
		try {
			let callback = silent ? null : new EIslemAkibet_Callback({ islemAdi })
			extend(_e, { eConf, callback })
			this.showProgress(_e)
			await EYonetici.xmlKaldir(_e)
		}
		catch (ex) {
			_e.error = ex
			if (!silent) {
				// hConfirm(getErrorText(ex), islemAdi)
				console.error(ex)
				throw ex
			}
		}
		finally { this.uiIslemiSonrasi(_e) }
	}
}


/*
	let part = await GidenEIslemListePart.listele(), sec = part.secimler;
	sec.tarih.basi = today();
	part.grid.on('bindingcomplete', evt => { debugger })
*/
