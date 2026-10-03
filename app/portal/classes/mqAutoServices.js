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
		if (!MQLogin.current?.yetkiVarmi('sil'))
			return false
		
		let { current: l } = MQLogin
		if (l.adminmi)
			return true
		
		return l.bayimi && l.yetkiVarmi('aktivasyonSil')
	}
	static get delimName() { return '.' }
	static get services() {
		let { _services: res } = this
		if (res == null) {
			res = this._services = [
				['skyws', 'SkyWS (SSL)', 'skywsmi', {
					localPort: 9200,
					compress: false, enc: false
				}],
				['skywsX', 'SkyWS (Açıktan)', 'skywsXmi', {
					localPort: 8200,
					compress: false, enc: true
				}],
				['sql', 'SQL Server', 'sqlmi', {
					localPort: 1433,
					compress: true, enc: true
				}],
				['vioWS', 'ESKİ Vio WebServis', 'vioWSmi', {
					localPort: 8083,
					compress: true, enc: true
				}],
				['hfs', 'HFS (Http File Server)', 'hfsmi', {
					localPort: 80,
					compress: true, enc: true
				}],
				['pavo', 'PAVO', 'pavomu', {
					localPort: 4567,
					compress: true, enc: false
				}]
			].filter(Boolean).map(r => new CKodAdiVeEkBilgi(r))
		}
		return res
	}
	static get kod2Service() {
		let { _kod2Service: res } = this
		if (res == null) {
			let { services } = this
			res = this._kod2Service = fromEntries(
				services.map(r => [ r.kod, r ]))
		}
		return res
	}
	static get port2Service() {
		let { _port2Service: res } = this
		if (res == null) {
			let { services } = this
			res = this._port2Service = fromEntries(
				services.map(r => [ r.ekBilgi?.localPort, r ]))
		}
		return res
	}

	constructor(e = {}) {
		super(e)
		this.remoteProxy = e.remoteProxy ?? {}
		this.frp = e.frp ?? []
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

		let { dev } = config
		let { adminmi } = MQLogin.current ?? {}
		let { services, kod2Service } = this
		let { islem, inst = {}, tanimPart = e.sender, tanimFormBuilder: tanimForm } = e
		tanimForm.addStyle_fullWH()

		let yeniVeyaKopyami = islem == 'yeni' || islem == 'kopya'
		;{
			let mfSinif = MQLogin_Musteri, { sinifAdi: etiket } = mfSinif
			tanimForm.addSimpleComboBox('mustKod', etiket, etiket)
				.setMFSinif(MQLogin_Musteri)
				.etiketGosterim_yok()
				.addStyle_wh(800, 60)
				[yeniVeyaKopyami ? 'editable' : 'readOnly']()

			etiket = 'Müşteri/Server Belirteci'
			tanimForm.addTextInput('mustAlias', etiket)
				.setPlaceHolder(etiket)
				.etiketGosterim_yok()
				.addStyle_wh(400, 60)
				// [yeniVeyaKopyami || !inst.mustAlias ? 'editable' : 'readOnly']()
		}

		this.formBuilder_addTabPanel(e)
		let { tabPanel } = e
		;{
			let width_sag = 290
			let tabPage = tabPanel.addTab('frp', 'FRP')
				.yanYana()
			;{
				let form = tabPage.addFormWithParent('list').altAlta()
					.addStyle_fullWH(`calc(var(--full) - ${width_sag + 50}px)`)
				form.addBaslik(null, 'FRP Tanımları')
				form.addGridliGiris('frp')
					.setTabloKolonlari([
						gridKolon('service', 'Servis', 35).checkedList()
							.degisince(({ rowIndex, gridRec: r, value: v, setCellValue }) => {
								let ka = kod2Service[r.service] ?? {}
								let { kod: name, ekBilgi } = ka
								let { localPort, compress, enc } = ekBilgi ?? {}
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
						gridKolon('remoteAccess', 'Erişim?', 10).checkedList().tipBool(),
						gridKolon('localIP', 'Yerel IP', 15).checkedList(),
						gridKolon('name', 'Belirteç', 30).checkedList(),
						gridKolon('remotePort', 'Cloud Port', 13).checkedList().number().sifirGosterme()
					])
					.setSource(() =>
						inst.frp ?? [])
					/*.widgetArgsDuzenleIslemi(({ args }) => {
						extend(args, { editMode: 'click' })
					})*/
					.onAfterRun(({ builder: { part } }) =>
						tanimPart.grid_frpDefs = part)
					.addStyle_fullWH(null, 530)
					.addCSS('dock-bottom')
			}

			;{
				let form = tabPage.addFormWithParent('acl').altAlta()
					.addStyle_fullWH(width_sag)
				form.addBaslik(undefined, 'Firewall Yetkilendirmesi')
				
				form.addCheckBox('aclEnabled', 'Aktif?')
				form.addGridliGiris('addresses')
					.setTabloKolonlari([ gridKolon('value', 'İzinli IPler', 20).input() ])
					.setSource(() => {
						let addresses = inst.addresses ?? []
						return addresses
							.filter(Boolean)
							.map(value => ({ value }))
					})
					.veriDegisinceIslemi(({ sender: gridPart }) => {
						let { boundRecs: recs } = gridPart
						inst.addresses = recs
							.map(r => r.value)
							.filter(Boolean)
					})
					.onAfterRun(({ builder: { part } }) =>
						tanimPart.grid_frpAcl_addresses = part)
					.addStyle_fullWH(null, 500)
			}
		}
		
		;{
			let tabPage = tabPanel.addTab('remoteProxy', 'Sky Proxy')
				.altAlta()
				.setAltInst(inst.remoteProxy)
			tabPage.addBaslik(undefined, 'Sky Proxy')

			;{
				let form = tabPage.addFormWithParent().yanYana()
					.addStyle(`$elementCSS { padding: 10px 20px !important }`)
				form.addCheckBox('enabled', 'Aktif?')
					.degisince(({ builder: { altInst: r } }) => {
						if (r.enabled && !r.key) {
							let { fbd_remoteProxy_key: fbd } = tanimPart
							fbd.value = r.key = generateKey()
						}
					})
					.onAfterRun(({ builder: fbd }) =>
						tanimPart.fbd_remoteProxy_enabled = fbd)
				form.addButton('sil')
					.addStyle_wh(50, 50)
					.addStyle(`$elementCSS { margin: -13px 0 0 20px !important; backdrop-filter: unset !important }`)
					.onClick(({ builder: { altInst: r } }) => {
						let { fbd_remoteProxy_key: fbd } = tanimPart
						fbd.value = r.key = null
					})
			}
			tabPage.addTextInput('key', 'Anahtar/Şifre')			
				.setPlaceHolder('Anahtar/Şifre')
				.etiketGosterim_yok()
				.setMaxLength(50)
				[dev && adminmi ? 'editable' : 'readOnly']()
				.degisince(({ builder: fbd, builder: { altInst: r } }) => 
					fbd.value = r.key = r.key || null)
				.onAfterRun(({ builder: fbd }) =>
					tanimPart.fbd_remoteProxy_key = fbd)
				.addStyle_wh(300, 80)
				.addCSS('center')
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
	yaz(e) { return this.kaydet({ islem: 'yeni', ...e }) }
	degistir(e) { return this.yaz({ islem: 'degistir', eskiInst: e }) }
	sil(e) { return this.yaz({ islem: 'sil', ...e }) }
	varmi(e) { return !empty(this.rec) }
	async yukle(e) { return await super.yukle(e) }
	async tekilOku({ islem, _rec: rec }) {
		let { mustKod } = this
		if (!rec && mustKod)
			rec = await app.wsAutoServices({ mustKod })
		return rec
	}
	async kaydet({ islem } = {}) {
		let throwIf = msg => {
			if (msg)
				throw error(msg)
		}
		
		let { mustKod } = this
		if (!mustKod)
			throw error('<b class=firebrick>Müşteri</b> belirtilmelidir')
		
		throwIf(await MQLogin_Musteri.bosVeyaKodYoksaMesaj(mustKod))

		let silmi = islem == 'sil'
		let data = silmi ? {} : this.hostVars(e)
		if (!data)
			throw error('Kaydedilecek bilgi belirlenemedi')
		
		deleteKeys(data, ...[
			'mustKod', 'mustUnvan', '_p',
			'uid', 'uniqueid', 'boundindex', 'visibleindex',
			...keys(data).filter(k => k[0] == '_')
		])

		let args = { mustKod, data }
		if (silmi)
			args.delete = true
		
		return await app.wsUpdateAutoServices(args)
	}
	keyHostVarsDuzenle({ hv }) {
		hv.mustKod = this.mustKod
	}
	keySetValues({ rec }) {
		this.mustKod = rec.mustKod
	}
	hostVarsDuzenle({ hv }) {
		let { dev } = config
		let { adminmi } = MQLogin.current ?? {}
		let { delimName: sep, services, kod2Service, port2Service } = this.class
		let { mustAlias: als, frp, aclEnabled, addresses: aclAddresses, remoteProxy } = this
		
		let frpList = [], frpAcl = {}
		let aclPorts = []
		for (let { service, name, localPort, localIP, remotePort, remoteAccess } of frp ?? []) {
			let sd = kod2Service[service] ?? {}
			if (name && !name.includes(sep))
				name = [als, name].filter(Boolean).join(sep)
			else if (!name)
				name = [als, `${sd.kod}-${localPort}`].filter(Boolean).join(sep)
			
			if (!name)
				continue

			if (!localPort && service)
				localPort = sd.ekBilgi?.localPort
			if (!localPort)
				continue
			
			let r = {
				service, name,
				local: { port: localPort }
			}
			if (localIP)
				r.local.ip = localIP
			if (remotePort)
				r.remote = { port: remotePort }
			
			frpList.push(r)
			if (remoteAccess)
				aclPorts.push(remotePort || name)
		}
		extend(frpAcl, {
			enabled: aclEnabled,
			ports: aclPorts,
			addresses: aclAddresses
		})
		
		let rec = {
			frp: {
				list: frpList,
				acl: frpAcl
			}
		}
		;{
			let rp = remoteProxy
			if (!empty(rp)) {
				if (rp.enabled && !rp.key && !(dev && adminmi))
					throw error(`<b class=royalblue>Sky Proxy</b> etkin iken <b class=firebrick>Anahtar bilgisi</b> belirtilmelidir`)
				let cfg = rec.config ??= {}
				cfg.remoteProxy = rp
			}
		}
		
		extend(hv, rec)
	}
	setValues({ rec = {} }) {
		let { delimName: sep, services, kod2Service, port2Service } = this.class
		let { mustAlias: als = this.mustAlias, config: cfg } = rec
		let { remoteProxy } = cfg ?? {}
		
		let orjAcl = rec.frp?.acl ?? {}
		let enabledPorts = asSet(orjAcl.ports ?? orjAcl.port ?? [])
		let addresses = orjAcl?.addresses ?? orjAcl?.address ?? orjAcl.ips ?? orjAcl.ip ?? []
		let aclEnabled = orjAcl?.enabled && !empty(enabledPorts)

		let frp = []
		for (let r of rec.frp?.list ?? []) {
			let { service, name, local, remote } = r
			let { port: localPort } = local ?? {}
			if (!localPort)
				continue

			service ||= port2Service[localPort]?.kod
			let sd = kod2Service[service] ?? {}
			
			let { port: remotePort } = remote ?? {}
			let orjName = name
			als ||= name?.split?.(sep)?.[0]?.trim() ?? ''
			name = name
				? ( name.includes(sep) ? name.split(sep).slice(1).join(sep) : name )
				: `${sd.kod}-${localPort}`
			
			frp.push({
				service, name,
				localPort, remotePort,
				remoteAccess: ( enabledPorts[remotePort] ?? enabledPorts[orjName] ) ?? false
			})
		}

		remoteProxy ??= {}
		extend(this, {
			mustAlias: als,
			aclEnabled, addresses,
			frp, remoteProxy
		})
	}
}
