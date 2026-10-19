class GidenEIslemListePart extends EIslemListeBasePart {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'gidenEIslemListe' }
	static get filtreSinif() { return GidenEIslemFiltre }
	static get gidenmi() { return true }
	
	constructor(e = {}) {
		super(e)
		this.title = e.title ?? 'Giden e-İşlem Listesi' ?? ''
	}
	runDevam(e = {}) {
		super.runDevam(e)
		let { dbName } = config.session
		let { kural } = app.params.eIslem ?? {}
		let { sadeceAdi2mi } = kural?.shAdi ?? {}
		if (!sadeceAdi2mi && dbName?.toUpperCase().includes('BAKERMAN')) {
			delay(1000).then(() => {
				hConfirm(
					`<b>BAKERMAN</b> veritabanı için e-İşlem Parametresi <b class="red">Stok Adı Gösterim</b> kuralı <u class="bold royalblue">2. Adı</u> olarak işaretlenmelidir`,
					'UYARI'
				)
			})
		}
	}
	islemTuslariDuzenle(e = {}) {
		super.islemTuslariDuzenle(e)
		let { liste, part: { sagButonIdSet } } = e
		let removeIdSet = asSet('kolonFiltre')
		liste = e.liste = liste.filter(({ id }) => !removeIdSet[id])
		liste.unshift(...[
			{ id: 'eIslemGonder', toolTip: 'e-İşlem GÖNDER', handler: _e => this.eIslemGonderIstendi({ ...e, ..._e }) },
			{ id: 'eIslemIzle', toolTip: 'e-İşlem İzle', handler: _e => this.eIslemIzleIstendi({ ...e, ..._e, toplu: false }) },
			{ id: 'eIslemYazdir', text: 'YZDR', toolTip: 'e-İşlem Yazdır', handler: _e => this.eIslemIzleIstendi({ ...e, ..._e, toplu: true }) },
			{ id: 'eIslemSorgu', toolTip: 'e-İşlem Durum Sorgula', handler: _e => this.eIslemSorguIstendi({ ...e, ..._e }) },
			{ id: 'eIslemXMLOlustur', toolTip: 'e-İşlem XML Oluştur', handler: _e => this.eIslemXMLOlusturIstendi({ ...e, ..._e }) },
			{ id: 'eIslemIptal', toolTip: 'e-İşlem İPTAL', handler: _e => this.eIslemIptalIstendi({ ...e, ..._e }) },
			{ id: 'eIslemXMLKaldir', toolTip: 'XML Kaldır', handler: _e => this.eIslemXMLKaldirIstendi({ ...e, ..._e }) }
		])
		liste.push({
			id: 'gonderildiDurumAyarla', text: 'GND', toolTip: 'Gönderim Durum Ayarla',
			handler: _e => this.gonderildiDurumAyarlaIstendi({ ...e, ..._e })
		})
		extend(sagButonIdSet, asSet([
			'eIslemGonder', 'eIslemIzle', 'eIslemYazdir', 'eIslemSorgu',
			'eIslemXMLOlustur', 'eIslemIptal', 'eIslemXMLKaldir'
		]))
	}
	get defaultTabloKolonlari() {
		let cssDuzenleyici = (e = {}) => {
			let { ekCSS, duzenleyici } = e
			return ((sender, rowIndex, belirtec, value, rec) => {
				let res = [belirtec]
				let { eIslTip, onayDurum, uuid, imzaTS, gonderimTS } = rec
				if (!empty(ekCSS))
					res.push(...makeArray(ekCSS))
				if (eIslTip != null)
					res.push(`eIslTip-${eIslTip}`)
				if (efatonaydurumu != null)
					res.push(`akibet-${onayDurum}`)
				if (imzaTS)
					res.push('imzali')
				if (gonderimTS)
					res.push('gonderildi')
				if (uuid)
					res.push('hasUUID')
				
				if (duzenleyici) {
					let args = { ...e, sender, rowIndex, belirtec, value, rec, result: res }
					duzenleyici.call(this, args)
					res = args.result
				}
				
				return res.join(' ')
			})
		}
		
		let colDefs = [
			...super.defaultTabloKolonlari,
			gridKolon('eIslTipText', 'e-İşlem', 13),
			gridKolon('belgeTipText', 'Belge<br/>Tipi', 15),
			gridKolon('tarih', 'Tarih', 13).date(),
			gridKolon('fisNox', 'Belge<br/>No', 21),
			gridKolon('akibetText', 'Akıbet', 13),
			gridKolon('mustText', 'Müşteri', 50),
			gridKolon('efImzaTS', 'XML Oluş.<br/>Zamanı', 13),
			gridKolon('efGonderimTS', 'Gönderim<br/>Zamanı', 13),
			gridKolon('sonucBedel', 'Sonuç<br/>Bedel', 19),
			gridKolon('dvKodText', 'Dv.', 5),
			gridKolon('efUUIDText', 'UUID<br/>(ETTN)', 40)
		]
		;colDefs.forEach(cd => {
			cd.setCellClassName(args => cssDuzenleyici(args))
			if (!cd.filterType)
				cd.checkedList()
		})
		
		return colDefs
	}
	
	loadServerData_veriDuzenle(e) {
		super.loadServerData_veriDuzenle(...arguments)
		let { recs } = e
		let { secimler: sec } = this
		
		let tSec_eIslTip = new EIslemTip()
		let tSec_akibet = new EIslemOnayDurum()
		
		for (let r of recs) {
			let eIslTip = r.eIslTip ||= 'A'
			let { onayDurum } = r
			extend(r, {
				eIslTipText: tSec_eIslTip.kaDict[eIslTip]?.aciklama || eIslTip,
				belgeTipText: sec.class.getBelgeTipText({ rec: r }),
				akibetText: tSec_akibet.kaDict[onayDurum]?.aciklama || onayDurum,
				mustText: `(<b>${r.mustKod}</b>) ${r.mustUnvan}`,
				efUUIDText: r.uuid || r.zorunluUUID,
				dvKodText: r.dvKod || 'TL'
			})
		}
	}
	
	async gonderildiDurumAyarlaIstendi(e = {}) {
		let parentPart = this, { eConf } = this
		let islemAdi = 'Gönderildi Durum Ayarla'
		let recs = await this.getSecilenSatirlar({ islemAdi }) ?? {}
		if (empty(recs))
			return

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
			let sayaclar = recs.map(r => r.fisSayac)
			let tsClause = (
				action == 'X' ? 'COALESCE(efimzats, GETDATE())'.sqlConst() :
				action == 'T' ? ts :
				null
			)
			
			let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
			upd.fromAdd(table)
			wh.inDizi(sayaclar, 'fisSayac')
			set.degerAta(tsClause, 'efgonderimts')
			toplu.add(upd)
		}
		if (empty(toplu.liste))
			return

		await toplu.execute()
		this.tazele()
	}
	
	async eIslemGonderIstendi(e = {}) {
		let parentPart = this, { eConf } = this
		let islemAdi = 'e-İşlem Gönder'
		let recs = e.recs ?? await this.getSecilenSatirlar_mesajli({ islemAdi })
		if (empty(recs))
			return
		
		let { event: { ctrlKey: ctrl } = {} } = e
		if (ctrl)
			await this.eIslemXMLKaldirIstendi({ ...e, recs })
		
		try {
			extend(_e, { eConf, callback: new EIslemAkibet_Callback({ islemAdi }) })
			this.showProgress(_e)
			
			let sayaclar = asSet(recs.map(r => r.fisSayac))
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
				recs = _e.recs = listePart.boundRecs
					.filter(r => sayaclar[r.fisSayac])
			}
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
		let { toplu, silent, event: { ctrlKey: ctrl } = {} } = e
		let mesajli = !silent
		let recs = await this.getSecilenSatirlar({ islemAdi, mesajli }) ?? {}
		if (empty(recs))
			return

		let parentPart = this, { eConf } = this
		if (ctrl)
			await this.eIslemXMLKaldirIstendi({ ...e, silent: true, internal: true, recs })
		
		try {
			let args = { ...e, islemAdi, recs, eConf, toplu, silent, callback: new EIslemAkibet_Callback({ islemAdi }) }
			this.showProgress(args)

			// args.tip2Table2Sayaclar = EYonetici.getTip2Table2Sayaclar(recs)
			await EYonetici.eIslemXMLOlustur({ ...args, silent: true, internal: true })
			await EYonetici.eIslemIzle(args)
		}
		finally { this.uiIslemiSonrasi({ silent: true }) }
	}
	async eIslemSorguIstendi(e = {}) {
		let islemAdi = 'e-İşlem Sorgu'
		let { toplu, silent, event: { ctrlKey: ctrl } = {} } = e
		let mesajli = !silent
		let recs = await this.getSecilenSatirlar({ islemAdi, mesajli }) ?? {}
		if (empty(recs))
			return

		let parentPart = this, { eConf } = this
		try {
			let args = { ...e, islemAdi, recs, eConf, toplu, silent, callback: new EIslemAkibet_Callback({ islemAdi }) }

			if (ctrl) {
				islemAdi = args.islemAdi = 'e-İşlem UUID Değiştir'
				args.araMesaj = `<span class="bold royalblue">${islemAdi}</span> işlemi`
				if (recs.length != 1)
					throw { isError: true, errorText: 'UUID değişimi için tek satır seçilmelidir' }
				
				let rec = recs[0]
				let { uuid, _table: table, fisSayac: sayac } = rec
				uuid = uuid?.toLowerCase() ?? ''
				let newUUID = (await jqxPrompt({ etiket: 'Yeni UUID değerini giriniz', title: 'UUID Değiştir', value: uuid }))?.trim()?.toLowerCase()
				if (!newUUID || uuid == newUUID)
					return
				
				if (!isGUID(newUUID))
					throw { isError: true, errorText: `<b class=firebrick>${newUUID}</b> değeri geçerli bir UUID değildir` }
				
				this.showProgress(args)
				;{
					let upd = new MQIliskiliUpdate(), { set, where: wh } = upd
					upd.fromAdd(table)
					wh.degerAta(sayac, 'fisSayac')
					set.degerAta(newUUID, 'efatuuid')
					set.add(
						`efimzats = NULL`,
						`efgonderimts = NULL`,
						`efatonaydurumu = ''`,
						`zorunluguidstr = ''`
					)
					await app.sqlExecNone(upd)
				}
			}
			else
				this.showProgress(args)
			
			await EYonetici.eIslemSorgula(args)
		}
		finally { this.uiIslemiSonrasi({ silent: true }) }
	}
	async eIslemXMLOlusturIstendi(e = {}) {
		let islemAdi = 'e-İşlem XML Oluştur'
		let { toplu, silent, event: { ctrlKey: ctrl } = {} } = e
		let mesajli = !silent
		let recs = await this.getSecilenSatirlar({ islemAdi, mesajli }) ?? {}
		if (empty(recs))
			return

		let parentPart = this, { eConf } = this
		if (ctrl)
			await this.eIslemXMLKaldirIstendi({ ...e, silent: true, internal: true, recs })
		
		try {
			let args = { ...e, islemAdi, recs, eConf, toplu, silent, callback: new EIslemAkibet_Callback({ islemAdi }) }
			this.showProgress(args)
			await EYonetici.eIslemXMLOlustur(args)
		}
		finally { this.uiIslemiSonrasi({ silent: true }) }
	}
	async eIslemIptalIstendi(e = {}) {
		let islemAdi = 'e-İşlem İPTAL'
		let { toplu, silent, event: { ctrlKey: ctrl } = {} } = e
		let mesajli = !silent
		let recs = await this.getSecilenSatirlar({ islemAdi, mesajli }) ?? {}
		if (empty(recs))
			return

		let parentPart = this, { eConf } = this
		try {
			let args = { ...e, islemAdi, recs, eConf, toplu, silent, callback: new EIslemAkibet_Callback({ islemAdi }) }
			this.showProgress(args)
			await EYonetici.eIslemIptal(args)
		}
		catch (ex) {
			//console.error(ex)
			throw ex
		}
		finally { this.uiIslemiSonrasi({ silent: true }) }
	}
	async eIslemXMLKaldirIstendi(e = {}) {
		let islemAdi = 'e-İşlem XML Kaldır'
		let { toplu, silent, event: { ctrlKey: ctrl } = {} } = e
		let mesajli = !(silent || ctrl)
		let recs = await this.getSecilenSatirlar({ islemAdi, mesajli }) ?? {}
		if (empty(recs))
			return

		let parentPart = this, { eConf } = this
		try {
			let args = { ...e, islemAdi, recs, eConf, toplu, callback: new EIslemAkibet_Callback({ islemAdi }) }
			this.showProgress(args)
			await EYonetici.eIslemXMLKaldir(args)
		}
		catch (ex) {
			//console.error(ex)
			throw ex
		}
		finally { this.uiIslemiSonrasi({ silent: true }) }
	}
}


/*
	let part = await GidenEIslemListePart.listele(), sec = part.secimler;
	sec.tarih.basi = today();
	part.grid.on('bindingcomplete', evt => { debugger })
*/
