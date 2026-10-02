class MQAutoServices extends MQCogul {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'MCFG' }
	static get sinifAdi() { return 'Müşteri Servis Yönetimi' }
	static get tanimUISinif() { return MQKod.tanimUISinif }
	static get tumKolonlarGosterilirmi() { return true }
	static get kolonFiltreKullanilirmi() { return false }
	static get raporKullanilirmi() { return false }
	static get gridHeight_bosluk() { return 20 }
	static get tanimlanabilirmi() {
		if (!MQLogin.current?.yetkiVarmi('tanimla'))
			return false
		
		let { current: l } = MQLogin
		if (l.adminmi)
			return true
		
		return l.bayimi && l.yetkiVarmi('aktivasyonYap')
	}
	static get silinebilirmi() {
		if (MQLogin.current?.yetkiVarmi('sil'))
			return false
		
		let { current: l } = MQLogin
		if (l.adminmi)
			return true
		
		return l.bayimi && l.yetkiVarmi('aktivasyonSil')
	}

	constructor(e = {}) {
		super(e)
		this.rec = e.rec ?? {}
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			mustKod: new PInstStr(),
			mustAlias: new PInstStr()
		})
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e)
		let { islem, inst = {}, tanimPart = e.sender, tanimFormBuilder: tanimForm } = e
		let { rec = {} } = inst
		tanimForm.addStyle_fullWH()

		let services = [
			['skyws', 'SkyWS (SSL)', 'skywsmi', {
				update: {
					local: { port: 9200 },
					compress: false, enc: false
				}
			}],
			['skywsX', 'SkyWS (Açıktan)', 'skywsXmi', {
				update: {
					local: { port: 8200 },
					compress: false, enc: true
				}
			}],
			['sql', 'SQL Server', 'sqlmi', {
				update: {
					local: { port: 1433 },
					compress: true, enc: true
				}
			}],
			['vioWS', 'ESKİ Vio WebServis', 'vioWSmi', {
				update: {
					local: { port: 8083 },
					compress: true, enc: true
				}
			}],
			['hfs', 'HFS (Http File Server)', 'hfsmi', {
				update: {
					local: { port: 80 },
					compress: true, enc: true
				}
			}],
			['pavo', 'PAVO', 'pavomu', {
				update: {
					local: { port: 4567 },
					compress: true, enc: false
				}
			}]
		].filter(Boolean).map(r => new CKodAdiVeEkBilgi(r))
		let kod2Service = fromEntries(
			services.map(r => [r.kod, r]))
		let port2Service = fromEntries(
			services
				.map(r => [
					r.ekBilgi?.update?.local?.port,
					r
				])
				.filter(([k, v]) => k)
		)
		
		let yeniVeyaKopyami = islem == 'yeni' || islem == 'kopya'
		;{
			let mfSinif = MQLogin_Musteri, { sinifAdi: etiket } = mfSinif
			tanimForm.addSimpleComboBox('mustKod', etiket, etiket)
				.etiketGosterim_yok()
				.addStyle_wh(800, 60)
				[yeniVeyaKopyami ? 'editable' : 'readOnly']()

			etiket = 'Müşteri/Server Belirteci'
			tanimForm.addTextInput('mustAlias', etiket)
				.setPlaceHolder(etiket)
				.etiketGosterim_yok()
				.addStyle_wh(400, 60)
				[yeniVeyaKopyami ? 'editable' : 'readOnly']()
		}

		this.formBuilder_addTabPanel(e)
		let { tabPanel } = e
		;{
			let tabPage = tabPanel.addTab('frp', 'FRP')
				.yanYana()

			;{
				let form = tabPage.addFormWithParent('list').altAlta()
					.addStyle_fullWH('59%')
				form.addBaslik(null, 'FRP Tanımları')
				form.addGridliGiris('grid')
					.setTabloKolonlari([
						gridKolon('service', 'Servis', 35).checkedList()
							.degisince(({ rowIndex, gridRec: r, value: v, setCellValue }) => {
								let ka = kod2Service[r.service] ?? {}
								let { kod: name, ekBilgi: { update } = {} } = ka
								let { local: { port: localPort = {} }, compress, enc } = update ?? {}
								if (name)
									setCellValue({ rowIndex, belirtec: 'name', value: name })
								if (localPort)
									setCellValue({ rowIndex, belirtec: 'localPort', value: localPort })
								if (compress != null)
									setCellValue({ rowIndex, belirtec: 'compress', value: compress })
								if (enc != null)
									setCellValue({ rowIndex, belirtec: 'enc', value: enc })
							})
							.tipTekSecim({ kaListe: services })
							.listedenSecilemez()
							.kodsuz(),
						gridKolon('localPort', 'Yerel Port', 13).checkedList().number().sifirGosterme(),
						gridKolon('compress', 'Sıkıştır?', 10).tipBool(),
						gridKolon('enc', 'Şifrele?', 10).tipBool(),
						gridKolon('remotePort', 'Cloud Port', 13).checkedList().number().sifirGosterme(),
						gridKolon('name', 'Belirteç', 25).checkedList()
					])
					.setSource(async _e => {
						let { mustAlias: als } = this
						let { list } = rec.frp
						return list.map(r => {
							let { service, name, local: { port: localPort = {} }, remote: { port: remotePort = {} } } = r
							service ||= port2Service[localPort]?.aciklama
							name ||= `${als}.${service.name}-${localPort}`
							return {
								service, name,
								localPort, remotePort
							}
						})
					})
					/*.widgetArgsDuzenleIslemi(({ args }) => {
						extend(args, { editMode: 'click' })
					})*/
					.onAfterRun(({ builder: { part } }) =>
						tanimPart.grid_frpDefs = part)
					.addStyle_fullWH(null, 'unset')
					.addCSS('dock-bottom')
			}

			;{
				let form = tabPage.addFormWithParent('acl').altAlta()
					.addStyle_fullWH('39%')
				form.addBaslik(undefined, 'Firewall Yetkilendirmesi')
				
				form.addCheckBox('enabled', 'Aktif?')
				form.addGridliGiris('ports')
					.setTabloKolonlari([ gridKolon('value', 'İzinli Servis/Port', 25).input() ])
					.setSource(async _e => {
						return []
					})
					.onAfterRun(({ builder: { part } }) =>
						tanimPart.grid_frpAcl_ports = part)
					.addStyle_fullWH(null, 300)
				form.addGridliGiris('addresses')
					.setTabloKolonlari([ gridKolon('value', 'İzinli IPler', 25).input() ])
					.setSource(async _e => {
						return []
					})
					.onAfterRun(({ builder: { part } }) =>
						tanimPart.grid_frpAcl_addresses = part)
					.addStyle_fullWH(null, 200)
			}
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(...[
			...this.getKAKolonlar(
				gridKolon('mustKod', 'Müşteri', 18).noSql().checkedList(),
				gridKolon('mustUnvan', 'Müşteri Ünvan', 50).noSql().checkedList()
			)
		])
	}
	static async loadServerDataDogrudan({ gridPart }) {
		let m2Defs = await app.wsAutoServices() ?? {}
		let m_k2a = await MQLogin_Musteri.getGloKod2Adi()
		let recs = []
		for (let [mustKod, defs] of entries(m2Defs)) {
			let mustUnvan = m_k2a[mustKod]
			let r = { ...defs, mustKod, mustUnvan }
			recs.push(r)
		}
		
		return recs
	}
	yaz(e) { return this.kaydet(e) }
	degistir(e) { return this.yaz(e) }
	sil(e) { this.rec = {}; return this.yaz(e) }
	varmi(e) { return !empty(this.rec) }
	async yukle(e) { return await super.yukle(e) }
	async tekilOku({ islem, _rec: rec }) {
		let { mustKod } = this
		if (!rec && mustKod)
			rec = await app.wsAutoServices({ mustKod })
		return rec
	}
	async kaydet(e) {
		let throwIf = msg => {
			if (msg)
				throw error(msg)
		}
		
		let { mustKod, rec } = this
		if (!rec)
			throw error('Kaydedilecek bilgi belirlenemedi')

		if (!mustKod)
			throw error('<b class=firebrick>Müşteri</b> belirtilmelidir')

		throwIf(await MQLogin_Musteri.bosVeyaKodYoksaMesaj(mustKod))
		
		let data = { ...rec }
		deleteKeys(data, ...[
			'mustKod', 'mustUnvan', '_p',
			'uid', 'uniqueid', 'boundindex', 'visibleindex',
			...keys(data).filter(k => k[0] == '_')
		])
		
		return await app.wsUpdateAutoServices({ mustKod, data })
	}
	keyHostVars({ hv }) {
		mergeInto(this, hv, 'mustKod')
	}
	keySetValues({ rec }) {
		mergeInto(rec, this, 'mustKod')
	}
	hostVars({ hv }) {
		let { rec } = this
		if (rec)
			extend(hv, rec)
	}
	setValues({ rec }) {
		extend(this, { rec })
	}
}
