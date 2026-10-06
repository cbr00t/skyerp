class KontorYonetimPart extends SimplePart {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'kontorYonetim' }
	static get kodListeTipi() { return 'KNT' }
	static get sinifAdi() { return 'Kontör Yönetim' }
	static get title() { return this.sinifAdi }
	static get isWindow() { return true }
	static get islemTuslariVarmi() { return true }
	get selectedRecs() { return this.getSelectedRecs('har') }
	get selectedRec() { return this.selectedRecs[0] ?? null }
	get isDestroyed() { return !!this._destroyed || !!this.part?.isDestroyed }
	getSelectedRecs(id) {
		let p = this.grids[id], w = p?.gridWidget
		// GridPart son tıklanan hücreyi de seçilmiş sayabilir; burada gerçek satır seçimi gerekir.
		return w ? w.getselectedrowindexes().map(i => w.getrowdata(i)).filter(Boolean) : p?.selectedRecs ?? []
	}

	constructor(e = {}) {
		super(e)
		extend(this, {
			grids: {}, mustKod: e.mustKod ?? this.mustKod ?? '',
			tip: e.tip ?? '', durum: e.durum ?? 'tumu',
			ozetFisIDListe: [], filtreTokens: []
		})
	}
	rfbDuzenle() {
		super.rfbDuzenle(...arguments)
		let { rfb, content, islemTuslari } = this
		rfb.addCSS('kontor-yonetim-root').addStyle(this.getStyle())
			.setWndArgs({ width: Math.min(1440, window.innerWidth - 20), height: Math.min(900, window.innerHeight - 20) })
		islemTuslari.setButonlarIlk([{ id: 'tazele', handler: () => this.tazele() }]).addStyle_wh(null, 44)
		content.setLayout($('<div/>')).addCSS('kontor-shell')
		content.addForm('baslik').addCSS('kontor-baslik')
			.setLayout($(`<div>
				<div><span class="kontor-eyebrow">SKY PORTAL</span><h2>Kontör Yönetimi</h2></div>
				<span class="kontor-bilgi" aria-live="polite">Müşteri, kontör tipi ve satış durumuna göre inceleyin</span>
			</div>`))

		let form = content.addFormWithParent('araclar').yanYana().addCSS('kontor-toolbar')
		for (let [id, text, css] of [
			['faturalastir', 'Faturalaştır', 'kontor-primary'],
			['yeni', 'Yeni Satış', ''], ['degistir', 'Değiştir', ''], ['sil', 'Sil', 'kontor-danger']
		]) {
			form.addButton(id, text).etiketGosterim_yok().addCSS(css)
				.onClick(() => this.islemYap({ islem: id }))
				.onAfterRun(({ builder }) => this.builders[id] = builder)
		}
		form.addButton('secimTemizle', 'Seçimi Temizle').etiketGosterim_yok()
			.onClick(() => this.secimTemizle())
			.onAfterRun(({ builder }) => this.builders.secimTemizle = builder)

		form = content.addFormWithParent('filtreler').yanYana().addCSS('kontor-filtreler')
		form.addSimpleComboBox('mustKod', 'Müşteri', 'Tüm müşteriler / Müşteri seçin')
			.setMFSinif(MQLogin_Musteri).setValue(this.mustKod).addCSS('kontor-musteri')
			.ozelQueryDuzenleIslemi(({ stm, aliasVeNokta, mfSinif }) => {
				for (let sent of stm) {
					MQLogin.current.yetkiClauseDuzenle({
						sent,
						clauses: {
							musteri: aliasVeNokta + mfSinif.kodSaha,
							bayi: `${aliasVeNokta}bayikod`
						}
					})
				}
			})
			.degisince(({ type, events, value }) => {
				if (type && type != 'batch')
					return
				let v = (events?.at(-1)?.value ?? value ?? '').toString().trimEnd()
				if (v == this._sonMustKod)
					return
				this._sonMustKod = this.mustKod = v
				this.tazele({ action: 'change' })
			})
			.onAfterRun(({ builder: { part } }) => {
				this.ddMustKod = part
				this._sonMustKod = this.mustKod
				part.layout.children('button#liste').text('⌄')
					.attr({ title: 'Müşteri seç', 'aria-label': 'Müşteri listesini aç' })
			})
		form.addSelect('durum', 'ERP Durumu', this.durum, [
			{ kod: 'tumu', aciklama: 'Tümü' },
			{ kod: 'bekleyen', aciklama: 'Bekleyenler' },
			{ kod: 'tamamlanan', aciklama: 'ERP İşlenenler' }
		]).addCSS('kontor-durum')
			.degisince(({ value }) => {
				this.durum = value
				this.harSecimTemizle()
				this.grids.har?.tazele()
			})
			.onAfterRun(({ builder: { input } }) => input.val(this.durum))
		form.addSelect('tip', 'Kontör Tipi', this.tip, [
			{ kod: '', aciklama: 'Tüm kontör tipleri' },
			...KontorTipBasit.kaListe
				.map(({ kod, aciklama }) =>
					({ kod, aciklama: this.duzMetin(aciklama) }))
		]).addCSS('kontor-tip')
			.degisince(({ value }) => {
				this.tip = value
				this.tazele({ action: 'change' })
			})
			.onAfterRun(({ builder: { input } }) => input.val(this.tip))
		form.addForm('bulForm')
			.addCSS('kontor-arama no-expand')
			.setLayout($(
				`<label>
					<span>Hızlı Bul</span>
					<input class="input" type="search" placeholder="Müşteri, tip veya belge ara…" aria-label="Hızlı Bul">
				</label>`
			))
			.onAfterRun(({ builder }) => {
				let part = builder.part = this.bulPart = new FiltreFormPart({
					layout: builder.layout, parentPart: this.part,
					degisince: ({ tokens }) => {
						this.filtreTokens = tokens ?? []
						this.tazele({ action: 'search' })
					}
				})
				part.run()
				part.input.on('input.kontorYonetim', () => {
					clearTimeout(this._timer_arama)
					this._timer_arama = setTimeout(() => part.input.trigger('change'), 250)
				})
			})

		let fbd_grids = content.addFormWithParent('subContent').addCSS('kontor-grids')
		for (let [id, text] of [['ozet', 'KONTÖR ÖZETİ'], ['har', 'KONTÖR SATIŞLARI']]) {
			fbd_grids.addGridliGosterici(id).addCSS(`kontor-grid kontor-grid-${id}`)
				.rowNumberOlmasin().notAdaptive().noEmptyRow().animate()
				.setTabloKolonlari([gridKolon('_text', text).noSql().setCellClassName('kontor-card-cell')])
				.setSource(() => this[`getData_${id}`]())
				.widgetArgsDuzenleIslemi(({ args }) => extend(args, {
					rowsHeight: id == 'ozet' ? 174 : 150, columnsHeight: 36,
					selectionMode: 'multiplerows', enableHover: true, enableTooltips: false,
					columnsResize: false, columnsMenu: false, groupable: false,
					filterable: false, sortable: false, showGroupsHeader: false, enableBrowserSelection: true
				}))
				.veriYukleninceIslemi(({ builder }) => this.gridVeriYuklendi({ id, part: builder.part }))
				.onAfterRun(({ builder: { part } }) => {
					this.grids[id] = part
					// Arama HTML etiketleri yerine kullanıcıya görünen alanlarda yapılır.
					part._hizliBulFiltreAttrListe = ['mustKod', 'mustUnvan', 'tipAdi', 'fisNox', 'fatDurumAdi', 'durumAdi', 'miktar']
					part.filtreTokens = this.filtreTokens
					part.grid.on('rowselect.kontorYonetim rowunselect.kontorYonetim', () => {
						if (this._secimDuzenleniyor || part._restoringSelection)
							return
						if (id == 'ozet') {
							clearTimeout(this._timer_ozetSecim)
							this._timer_ozetSecim = setTimeout(() => this.ozetSecimDegisti(), 20)
						}
						else
							this.butonlariGuncelle()
					})
					if (id == 'har')
						part.grid.on('cellclick.kontorYonetim', evt => this.harHucreTiklandi({ event: evt }))
				})
		}
	}
	afterRun() {
		super.afterRun(...arguments)
		this.part?.kapaninca(() => this.destroyPart())
		let root = this.rfb?.layout?.[0]
		if (root && globalThis.ResizeObserver) {
			this._resizeObserver = new ResizeObserver(() => {
				clearTimeout(this._timer_resize)
				this._timer_resize = setTimeout(() => this.gridBoyutlariniGuncelle(), 50)
			})
			this._resizeObserver.observe(root)
		}
		this.gridBoyutlariniGuncelle()
		this.butonlariGuncelle()
	}
	destroyPart() {
		if (this._destroyed)
			return
		this._destroyed = true
		this._resizeObserver?.disconnect()
		for (let key of ['arama', 'ozetSecim', 'resize'])
			clearTimeout(this[`_timer_${key}`])
		for (let p of values(this.grids))
			p.grid?.off('.kontorYonetim')
		clearTimeout(this.bulPart?.timer_change)
	}
	gridVeriYuklendi({ id, part }) {
		let { gridWidget: w } = part
		this._secimDuzenleniyor = true
		let restoring = part._restoringSelection
		part._restoringSelection = true
		part._selectionVersion = (part._selectionVersion ?? 0) + 1
		try {
			w.clearselection()
			part._selectedRows = {}
			if (id == 'ozet') {
				let onceki = this.ozetFisIDListe.join('|'), secilen = new Set(this.ozetFisIDListe.map(String))
				let recs = w.getboundrows().filter(r => secilen.has(String(r.fisID)))
				this.ozetFisIDListe = recs.map(r => r.fisID)
				for (let r of recs)
					w.selectrow(r.boundindex)
				if (onceki != this.ozetFisIDListe.join('|')) {
					this.harSecimTemizle()
					this.grids.har?.tazele()
				}
			}
		}
		finally { part._restoringSelection = restoring; this._secimDuzenleniyor = false }
		this.butonlariGuncelle()
	}
	ozetSecimDegisti() {
		if (this.isDestroyed)
			return
		let fisIDListe = [...new Set(this.getSelectedRecs('ozet').map(r => r.fisID))]
		if (fisIDListe.join('|') == this.ozetFisIDListe.join('|'))
			return
		this.ozetFisIDListe = fisIDListe
		this.harSecimTemizle()
		this.grids.har?.tazele()
		this.butonlariGuncelle()
	}
	gridBoyutlariniGuncelle() {
		if (this.isDestroyed)
			return
		for (let [id, { grid, gridWidget: w }] of entries(this.grids)) {
			if (!w || !grid?.length)
				continue
			let height = id == 'ozet' ? 174 : grid.width() < 480 ? 210 : 150
			if (w.rowsheight != height)
				grid.jqxGrid({ rowsheight: height })
			w.refresh()
		}
	}
	secimTemizle() {
		clearTimeout(this._timer_ozetSecim)
		this._secimDuzenleniyor = true
		try {
			this.ozetFisIDListe = []
			this.gridSecimTemizle('ozet')
			this.harSecimTemizle()
		}
		finally { this._secimDuzenleniyor = false }
		this.grids.har?.tazele()
	}
	harSecimTemizle() {
		this.gridSecimTemizle('har')
		this.butonlariGuncelle()
	}
	gridSecimTemizle(id) {
		let p = this.grids[id]
		if (p) {
			let restoring = p._restoringSelection
			p._restoringSelection = true
			p._selectionVersion = (p._selectionVersion ?? 0) + 1
			try { p.gridWidget?.clearselection() }
			finally { p._restoringSelection = restoring }
			p._selectedRows = {}
		}
	}
	
	tazele({ action } = {}) {
		if (this.isDestroyed)
			return
		this._veriSurum = (this._veriSurum ?? 0) + 1
		if (action == 'change' || action == 'search') {
			clearTimeout(this._timer_ozetSecim)
			this.ozetFisIDListe = []
		}
		this.harSecimTemizle()
		for (let p of values(this.grids)) {
			p.filtreTokens = this.filtreTokens
			p.tazele()
		}
	}

	// MQKontor / MQKontorDetay ile aynı yetki kuralları; doğrudan çağrılar da denetlenir.
	yetkiVarmi(islem) {
		let l = MQLogin.current
		if (!l)
			return false
		switch (islem) {
			case 'yeni': return (l.adminmi || l.bayimi) && l.yetkiVarmi('degistir')
			case 'degistir': return l.yetkiVarmi('degistir')
			case 'sil': return l.yetkiVarmi('sil') || l.sefmi
			case 'faturalastir': return (l.adminmi || l.sefmi) && l.yetkiVarmi('degistir')
		}
		return false
	}
	yetkiKontrol(islem) {
		if (this.yetkiVarmi(islem))
			return true
		hConfirm('Bu işlem için yetkiniz yok', 'Kontör Yönetimi')
		return false
	}
	butonlariGuncelle() {
		let { selectedRecs: recs, builders, _islem } = this
		for (let islem of ['yeni', 'degistir', 'sil', 'faturalastir']) {
			let b = builders[islem]
			if (!b?.input?.length)
				continue
			let yetki = this.yetkiVarmi(islem), secimUygun = islem == 'yeni' || (islem == 'degistir' ? recs.length == 1 : !!recs.length)
			b.layout.toggleClass('jqx-hidden', !yetki)
			setButonEnabled(b.input, yetki && secimUygun && !_islem)
		}
		let b = builders.secimTemizle
		if (b?.input?.length)
			setButonEnabled(b.input, !!(recs.length || this.ozetFisIDListe.length) && !_islem)
		this.content?.layout?.find('.kontor-bilgi').text(
			`${this.ozetFisIDListe.length ? `${this.ozetFisIDListe.length} özet seçili · ` : ''}${recs.length} satış seçili`
		)
	}
	async islemYap({ islem, rec } = {}) {
		if (this._islem || this.isDestroyed)
			return false
		this._islem = islem
		this.butonlariGuncelle()
		try { return await this[islem]({ rec }) }
		catch (ex) { cerr(ex); hConfirm(getErrorText(ex), 'Kontör Yönetimi'); return false }
		finally { delete this._islem; this.butonlariGuncelle() }
	}
	harHucreTiklandi({ event: evt }) {
		let { args = {} } = evt
		let target = args.originalEvent?.target ?? evt.originalEvent?.target
		let button = $(target).closest('button[data-islem]')
		if (!button.length || button.prop('disabled'))
			return
		let rec = this.grids.har?.gridWidget?.getrowdata(args.rowindex)
		if (!rec)
			return
		let islem = button.attr('data-islem')
		if (!(islem == 'degistir' || islem == 'sil'))
			return
		args.originalEvent?.preventDefault()
		return this.islemYap({ islem, rec })
	}
	async yeni() {
		if (!this.yetkiKontrol('yeni'))
			return false
		let { mustKod, tip, selectedRec: rec } = this
		mustKod ||= rec?.mustKod || this.getSelectedRecs('ozet')[0]?.mustKod
		let mfSinif = (tip && new KontorTip(tip).ekBilgi) || MQKontor
		return await mfSinif.kontor_yeniIstendi({ parentPart: this, mustKod, kontorSayi: 1 })
	}
	async degistir({ rec } = {}) {
		if (!this.yetkiKontrol('degistir'))
			return false
		if (!rec) {
			if (this.selectedRecs.length != 1) {
				hConfirm('Değiştirilecek tek bir satış kaydı seçilmelidir', 'Kontör Düzenle')
				return false
			}
			rec = this.selectedRec
		}
		if (rec.id == null || rec.fisID == null) {
			hConfirm('Düzenlenecek kaydın başlık veya detay sayacı eksik', 'Kontör Düzenle')
			return false
		}
		let mfSinif = new KontorTip(rec.tip).ekBilgi
		if (!mfSinif) {
			hConfirm('Bu kontör tipi için düzenleme sınıfı bulunamadı', 'Kontör Düzenle')
			return false
		}
		// Kartın alanları yeterli değildir; fiyat/VKN/ayrım dahil tam detay okunur.
		let sent = this.getSent_ortak(), { where: wh, sahalar } = sent
		wh.degerAta(rec.id, 'har.kaysayac').degerAta(rec.fisID, 'fis.kaysayac').degerAta('A', 'har.ahtipi')
		sahalar.add('har.*', 'fis.mustkod', 'fis.tip')
		let detayRec = (await new MQStm({ sent }).execSelect())?.[0]
		if (!detayRec) {
			hConfirm('Kayıt bulunamadı veya erişim yetkiniz değişti. Liste yenileniyor.', 'Kontör Düzenle')
			this.tazele()
			return false
		}
		return await mfSinif.detaySinif.kontor_degistirIstendi({
			sender: this, parentPart: this, mfSinif, rec: detayRec,
			parentRec: { kaysayac: detayRec.fissayac, mustkod: detayRec.mustkod, tip: detayRec.tip }
		})
	}
	async sil({ rec } = {}) {
		if (!this.yetkiKontrol('sil'))
			return false
		let islemAdi = 'Kontör SİL', recs = rec ? [rec] : this.selectedRecs
		if (!recs.length) {
			hConfirm('Silinecek kayıtlar seçilmelidir', islemAdi)
			return false
		}
		let fisID2Recs = {}
		for (let r of recs) {
			if (r.fisID == null || r.id == null)
				throw { isError: true, errorText: 'Silinecek kaydın başlık veya detay sayacı eksik' }
			;(fisID2Recs[r.fisID] ??= []).push(r)
		}
		if (!await ehConfirm(`Seçilen <b>${recs.length} adet Kontör</b> kaydı <b class=firebrick>SİLİNSİN Mİ?</b>`, islemAdi))
			return false
		try {
			for (let [fisSayac, liste] of entries(fisID2Recs)) {
				let mfSinif = new KontorTip(liste[0].tip).ekBilgi
				let detaySinif = mfSinif?.detaySinif ?? MQKontorDetay
				let sayacListe = [...new Set(liste.map(r => r.id))]
				if (await detaySinif.kontor_sil({ islemAdi, fisSayac, sayacListe }) === false)
					return false
			}
			return true
		}
		finally { this.tazele() }
	}
	async faturalastir() {
		if (!this.yetkiKontrol('faturalastir'))
			return false
		let islemAdi = 'Faturalaştır', { selectedRecs: recs } = this
		if (!recs.length) {
			hConfirm('Faturalaştırılacak kayıtlar seçilmelidir', islemAdi)
			return false
		}
		let tip2FisIDSet = {}, desteklenmeyen = new Set()
		for (let r of recs) {
			let cls = new KontorTip(r.tip).ekBilgi
			if (!cls?.faturalastirmaYapilirmi) {
				desteklenmeyen.add(this.duzMetin(cls?.sinifAdi ?? new KontorTip(r.tip).aciklama ?? r.tip))
				continue
			}
			if (r.fisID == null)
				throw { isError: true, errorText: 'Faturalaştırılacak kaydın başlık sayacı eksik' }
			;(tip2FisIDSet[r.tip] ??= new Set()).add(r.fisID)
		}
		if (desteklenmeyen.size)
			wConfirm(`Bazı kontör tipleri desteklenmiyor: ${[...desteklenmeyen].map(v => this.html(v)).join(', ')}`, islemAdi)
		let count = values(tip2FisIDSet).reduce((n, s) => n + s.size, 0)
		if (!count)
			return false
		if (!await ehConfirm(
			`<div>Seçilen <b>${count} kontör başlığının</b> tüm tamamlanmamış satışları faturalaştırılacak.</div>
			 <div class="bold mt-2">Devam edilsin mi?</div>`, islemAdi
		))
			return false
		try {
			for (let [tip, fisIDSet] of entries(tip2FisIDSet)) {
				let cls = new KontorTip(tip).ekBilgi
				if (await cls.kontor_topluFaturalastirIstendi({
					part: this, silent: false, noConfirm: true, tumFisler: [],
					recs: [...fisIDSet].map(fissayac => ({ fissayac }))
				}) === false)
					return false
			}
			return true
		}
		finally { hideProgress(); this.tazele() }
	}

	getSent_ortak({ ozetmi = false } = {}) {
		let { mustKod, tip } = this, { current: login } = MQLogin
		if (!login)
			throw { isError: true, errorText: 'Kontör bilgileri için oturum açılmalıdır' }
		let sent = new MQSent(), { where: wh } = sent
		if (ozetmi)
			sent.fromAdd('muskontor fis').leftJoin('fis', 'muskontordetay har', 'har.fissayac = fis.kaysayac')
		else
			sent.fromAdd('muskontordetay har').innerJoin('har', 'muskontor fis', 'har.fissayac = fis.kaysayac')
		sent.innerJoin('fis', 'musteri mus', 'fis.mustkod = mus.kod').leftJoin('mus', 'bayi bay', 'mus.bayikod = bay.kod')
		if (mustKod)
			wh.degerAta(mustKod, 'fis.mustkod')
		if (tip)
			wh.degerAta(tip, 'fis.tip')
		login.yetkiClauseDuzenle({ sent, clauses: { musteri: 'fis.mustkod', bayi: 'mus.bayikod', anaBayi: 'bay.anabayikod' } })
		return sent
	}
	getDataKey(id) {
		return toJSONStr([
			this._veriSurum ?? 0, this.mustKod, this.tip,
			...(id == 'har' ? [this.durum, this.ozetFisIDListe] : [])
		])
	}
	async getData_ozet() {
		let dataKey = this.getDataKey('ozet')
		let sent = this.getSent_ortak({ ozetmi: true })
		sent.sahalar.add(
			'fis.kaysayac fisID', 'fis.tip', 'fis.mustkod mustKod', 'mus.aciklama mustUnvan',
			`COALESCE(SUM(case when har.ahtipi = 'A' then har.kontorsayi else 0 end), 0) topAlinan`,
			`COALESCE(SUM(case when har.ahtipi <> 'A' then har.kontorsayi else 0 end), 0) topHarcanan`,
			`COALESCE(SUM(case when har.ahtipi = 'A' then har.kontorsayi else 0 - har.kontorsayi end), 0) topKalan`
		)
		sent.groupByOlustur()
		let recs = await new MQStm({ sent, orderBy: ['mustUnvan', 'tip', 'fisID'] }).execSelect() ?? []
		if (this.isDestroyed)
			return []
		if (dataKey != this.getDataKey('ozet'))
			return await this.getData_ozet()
		return recs.map(r => {
			r.tipAdi = this.duzMetin(KontorTip.kaDict[r.tip]?.aciklama ?? r.tip)
			r._text = this.getLayout_ozet(r)
			return r
		})
	}
	async getData_har() {
		let dataKey = this.getDataKey('har')
		let { durum, ozetFisIDListe } = this, sent = this.getSent_ortak()
		let { where: wh, sahalar } = sent
		wh.degerAta('A', 'har.ahtipi')
		if (durum == 'bekleyen')
			wh.degerAta(0, 'har.btamamlandi')
		else if (durum == 'tamamlanan')
			wh.add('har.btamamlandi <> 0')
		if (ozetFisIDListe.length)
			wh.inDizi(ozetFisIDListe, 'fis.kaysayac')
		sahalar.addWithAlias('har',
			'kaysayac id', 'tarih', 'fisnox fisNox', 'kontorsayi miktar', 'btamamlandi tamamlandi', 'fatdurum fatDurum'
		).addWithAlias('fis', 'kaysayac fisID', 'tip', 'mustkod mustKod').add('mus.aciklama mustUnvan')
		let recs = await new MQStm({ sent, orderBy: ['tamamlandi', 'tarih DESC', 'id DESC'] }).execSelect() ?? []
		if (this.isDestroyed)
			return []
		if (dataKey != this.getDataKey('har'))
			return await this.getData_har()
		return recs.map(r => {
			r.tamamlandi = asBool(r.tamamlandi)
			r.tipAdi = this.duzMetin(KontorTip.kaDict[r.tip]?.aciklama ?? r.tip)
			r.fatDurumAdi = this.duzMetin(KontorFatDurum.kaDict[r.fatDurum || ' ']?.aciklama ?? r.fatDurum)
			r.durumAdi = r.tamamlandi ? 'Tamamlandı' : 'Bekliyor'
			r._text = this.getLayout_har(r)
			return r
		})
	}
	html(v) { return escapeHTML((v ?? '').toString()) }
	duzMetin(v) { return (v ?? '').toString().replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() }
	getLayout_ozet(r) {
		let h = v => this.html(v), n = v => h(numberToString(v ?? 0))
		return `<article class="kontor-card kontor-ozet-card">
			<div class="kontor-card-heading"><b>${h(r.tipAdi)}</b><span class="kontor-kod">${h(r.mustKod)}</span></div>
			<div class="kontor-unvan" title="${h(r.mustUnvan)}">${h(r.mustUnvan)}</div>
			<div class="kontor-bakiye ${r.topKalan < 0 ? 'kontor-negatif' : ''}"><b>${n(r.topKalan)}</b><span>Kalan kontör</span></div>
			<div class="kontor-toplamlar">
				<span class="alinan">Toplam alınan <b>${n(r.topAlinan)}</b></span>
				<span class="harcanan">Harcanan <b>${n(r.topHarcanan)}</b></span>
			</div>
		</article>`
	}
	getLayout_har(r) {
		let h = v => this.html(v)
		let buttons = [['degistir', 'Değiştir', '✎'], ['sil', 'Sil', '×']]
			.filter(([id]) => this.yetkiVarmi(id))
			.map(([id, text, icon]) => `<button type="button" data-islem="${id}" title="${text}" aria-label="${text}">${icon}</button>`).join('')
		return `<article class="kontor-card kontor-har-card ${r.tamamlandi ? 'kontor-tamamlandi' : ''}">
			<div class="kontor-card-main">
				<div class="kontor-card-heading"><b>${h(r.tipAdi)}</b><span class="kontor-durum-badge">${h(r.durumAdi)}</span></div>
				${this.mustKod ? '' : `<div class="kontor-unvan" title="${h(r.mustUnvan)}">${h(r.mustUnvan)} <span class="kontor-kod">${h(r.mustKod)}</span></div>`}
				<div class="kontor-belge"><b>${h(asDateAndToKisaString(r.tarih))}</b><span>${h(r.fisNox)}</span></div>
			</div>
			<div class="kontor-miktar"><div><b>${h(numberToString(r.miktar))}</b> kontör</div><span>${h(r.fatDurumAdi)}</span></div>
			<div class="kontor-cell-buttons">${buttons}</div>
		</article>`
	}
	getStyle() {
		return `
		$elementCSS { --kontor-border: #dce5ef; container-type: inline-size; font-family: 'Segoe UI', Arial, sans-serif }
		$elementCSS .kontor-shell { position: absolute; inset: 0 0 0; width: 100% !important; height: auto !important; display: flex !important; flex-direction: column; gap: 12px; padding: 18px; box-sizing: border-box; background: #f4f7fb; overflow: auto }
		$elementCSS .kontor-shell .formBuilder-element { box-sizing: border-box }
		$elementCSS .kontor-shell > div { margin: 0 !important; flex-shrink: 0; float: none !important; padding-inline-end: 0 }
		$elementCSS .kontor-baslik { display: flex; align-items: center; justify-content: space-between; gap: 14px }
		$elementCSS .kontor-eyebrow { color: #71839b; font-size: 10px; letter-spacing: 1.5px }
		$elementCSS h2 { margin: 3px 0 0; font-size: 23px; color: #20334c }
		$elementCSS .kontor-bilgi { position: relative; top: -1rem; right: 8rem; font-size: 90%; color: #697c93 }
		$elementCSS .kontor-toolbar { display: flex !important; flex-wrap: wrap; align-items: center; gap: 8px; height: auto !important }
		$elementCSS .kontor-toolbar > div { width: auto !important; height: auto !important; margin: 0 !important; float: none !important }
		$elementCSS .kontor-toolbar button { min-width: 84px; height: 42px !important; margin: 0 !important; padding: 0 16px !important; border: 1px solid var(--kontor-border); border-radius: 8px; background: white; color: #334d6c; font: inherit; font-size: 13px; cursor: pointer }
		$elementCSS .kontor-toolbar button:is(#yeni, #degistir, #sil) { background-image: none !important; background-color: white !important }
		$elementCSS .kontor-toolbar .kontor-primary button { background: #247a5d !important; border-color: #247a5d; color: white }
		$elementCSS .kontor-toolbar .kontor-danger button { color: #ac3947 }
		$elementCSS button:disabled { opacity: .45; cursor: default }
		$elementCSS :is(button, input, select):focus-visible { outline: 2px solid #467fc7; outline-offset: 2px }
		$elementCSS .kontor-filtreler { display: flex !important; flex-wrap: wrap; align-items: flex-end; gap: 12px; height: auto !important; padding: 12px; border: 1px solid var(--kontor-border); border-radius: 10px; background: white }
		$elementCSS .kontor-filtreler > div, $elementCSS .kontor-filtreler > label { float: none !important; margin: 0 !important; min-width: 0 }
		$elementCSS .kontor-filtreler label, $elementCSS .kontor-arama > span { font-size: 12px; color: #697c93 }
		$elementCSS .kontor-musteri { flex: 2 1 270px; width: auto !important; height: auto !important; display: flex; flex-direction: column; gap: 5px; padding: 0; position: relative }
		$elementCSS .kontor-musteri > input { padding-right: 42px !important }
		$elementCSS .kontor-musteri > button#liste { position: absolute !important; left: auto !important; right: 8px !important; top: auto !important; bottom: 5px; width: 30px; height: 30px; padding: 0 !important; opacity: .7; border: 0; background: transparent; border-radius: 6px; font-size: 20px }
		$elementCSS .kontor-durum { flex: 1 1 150px; width: auto !important }
		$elementCSS .kontor-tip { flex: 1 1 180px; width: auto !important }
		$elementCSS .kontor-arama { flex: 2 1 150px; width: auto !important; display: flex; flex-direction: column; gap: 5px }
		$elementCSS .kontor-filtreler :is(input, select) { width: 100% !important; height: 40px !important; padding: 8px 10px; border: 1px solid var(--kontor-border); border-radius: 7px; background: white; color: #20334c; box-sizing: border-box; font: inherit; font-size: 13px }
		$elementCSS .kontor-grids { flex: 1 0 340px !important; min-height: 340px; width: 100% !important; display: grid !important; grid-template-columns: minmax(260px, 330px) minmax(0, 1fr); gap: 14px; height: auto !important }
		$elementCSS .kontor-grids > .kontor-grid { position: relative; margin: 0 !important; padding: 0; width: 100% !important; height: 100% !important; min-width: 0; float: none !important }
		$elementCSS .kontor-grid > .grid { width: 100% !important; height: 100% !important; border: 1px solid var(--kontor-border); border-radius: 9px; box-sizing: border-box }
		$elementCSS .kontor-card-cell > div { padding: 0 !important; margin: 0 !important; height: 100%; overflow: hidden }
		$elementCSS .kontor-card { height: calc(100% - 12px); margin: 5px; padding: 10px 13px; box-sizing: border-box; white-space: normal; overflow: hidden; border: 1px solid var(--kontor-border); border-radius: 8px; background: white; color: #314763; font-size: 13px }
		$elementCSS .jqx-grid-cell-selected .kontor-card { border-color: #5589ca; background: #eef5ff }
		$elementCSS .kontor-card-heading { display: flex; justify-content: space-between; align-items: center; gap: 8px; min-width: 0 }
		$elementCSS .kontor-card-heading > b { color: #684fa0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
		$elementCSS .kontor-kod { color: #71839b; font-size: 11px; overflow-wrap: anywhere }
		$elementCSS .kontor-unvan { margin: 6px 0; font-size: 12px; color: #47698e; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere }
		$elementCSS .kontor-ozet-card .kontor-unvan { -webkit-line-clamp: 1 }
		$elementCSS .kontor-bakiye { display: flex; align-items: baseline; gap: 9px; margin: 10px 0; color: #247a5d }
		$elementCSS .kontor-bakiye b { font-size: 27px }
		$elementCSS .kontor-bakiye span { font-size: 11px }
		$elementCSS .kontor-negatif { color: #b43d4f }
		$elementCSS .kontor-toplamlar { display: flex; justify-content: space-between; gap: 10px; border-top: 1px solid #e7edf5; padding-top: 8px; font-size: 11px; color: #71839b }
		$elementCSS .kontor-toplamlar span { display: flex; flex-direction: column; gap: 3px }
		$elementCSS .kontor-toplamlar b { color: #314763; font-size: 14px }
		$elementCSS .kontor-toplamlar .harcanan > b { color: firebrick }
		$elementCSS .kontor-har-card { display: grid; grid-template-columns: minmax(0, 1fr) 145px 36px; align-items: center; gap: 14px }
		$elementCSS .kontor-card-main { min-width: 0 }
		$elementCSS .kontor-durum-badge { flex: 0 0 auto; font-size: 10px; color: #9d651f; background: #fff2dd; padding: 4px 7px; border-radius: 6px }
		$elementCSS .kontor-tamamlandi .kontor-durum-badge { color: #247a5d; background: #e5f3ec }
		$elementCSS .kontor-belge { display: flex; flex-wrap: wrap; gap: 8px; color: #71839b; font-size: 12px; overflow-wrap: anywhere }
		$elementCSS .kontor-belge b { color: #3e6f9c }
		$elementCSS .kontor-miktar { text-align: right; color: #247a5d; font-size: 12px }
		$elementCSS .kontor-miktar b { font-size: 23px }
		$elementCSS .kontor-miktar > span { display: block; margin-top: 5px; color: #71839b; font-size: 11px }
		$elementCSS .kontor-cell-buttons { display: flex; flex-direction: column; gap: 8px }
		$elementCSS .kontor-cell-buttons button { width: 34px; height: 34px; padding: 0; border: 1px solid var(--kontor-border); border-radius: 7px; background: #f5f8fc; color: #527399; font-size: 20px; cursor: pointer }
		$elementCSS .kontor-cell-buttons button[data-islem=sil] { color: #b43d4f }
		@container (max-width: 850px) {
			$elementCSS .kontor-grids { grid-template-columns: 1fr; flex-basis: 760px !important; grid-template-rows: 300px minmax(440px, 1fr) }
			$elementCSS .kontor-baslik { align-items: flex-start; flex-direction: column; gap: 6px }
		}
		@container (max-width: 500px) {
			$elementCSS .kontor-shell { padding: 10px; gap: 10px }
			$elementCSS h2 { font-size: 20px }
			$elementCSS .kontor-filtreler { padding: 10px; gap: 10px }
			$elementCSS .kontor-musteri, $elementCSS .kontor-arama { flex-basis: 100% }
			$elementCSS .kontor-durum, $elementCSS .kontor-tip { flex: 1 1 120px }
			$elementCSS .kontor-toolbar button { min-width: 70px; padding: 0 10px !important; font-size: 12px }
		}
		$elementCSS .kontor-grid-har { container-type: inline-size }
		@container (max-width: 480px) {
			$elementCSS .kontor-har-card { grid-template-columns: minmax(0, 1fr) 36px; gap: 8px }
			$elementCSS .kontor-card-main { grid-column: 1; grid-row: 1 }
			$elementCSS .kontor-miktar { grid-column: 1; grid-row: 2; text-align: left }
			$elementCSS .kontor-cell-buttons { grid-column: 2; grid-row: 1 / span 2 }
		}`
	}
}
