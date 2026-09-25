/*
 * OnayciPart — SkyERP / SimplePart
 * Kaynak: app/onayci/classes/mqOnayci.js
 * Kullanım: OnayciPart.listeEkraniAc() veya new OnayciPart().run().
 * Onaycı uygulamasının mevcut prereq bağımlılıkları (MQProforma, MQEConf,
 * SQL sınıfları, FormBuilder, JQX, XSLT yardımcıları) korunmalıdır.
 * CSS bu dosyaya dahildir. Sunucu/şema değişikliği gerektirmez.
 */
class OnayciPart extends SimplePart {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'onayci' }
	static get title() { return 'Onay İşlemleri' }
	static get sinifAdi() { return this.title }
	static get kodListeTipi() { return 'ONAYCI' }
	static get islemTuslariVarmi() { return false }

	get table2Yapi() { return this.class.table2Yapi }
	get tip2Yapi() { return this.class.tip2Yapi }
	get id2RecData() { return this._id2RecData ??= Object.create(null) }
	get isDestroyed() { return !!this._destroyed || !!this.part?.isDestroyed }

	get rowsHeight() {
		let width = this.rfb?.layout?.width?.() || window.innerWidth || 1200
		return (
			width < 680 ? 330 :
			width < 1050 ? 232 :
			218
		)
	}

	get selectedRecs() {
		return (this.gridPart?.selectedRecs ?? []).filter(Boolean)
			.map(r => this.recs.find(rec => this.recordKey(rec) == this.recordKey(r)))
			.filter(Boolean)
	}

	get proformaKullanilir() {
		return !!app.params.alim?.kullanim?.gelenProformaIslemleri
	}

	get hepsiniGoster() { return this.durum != 'bekleyen' }
	get onayDurum() { return ({ onayli: 'O', red: 'R' })[this.durum] || '' }

	static get table2Yapi() {
		let { _table2Yapi: result } = this
		if (result == null) {
			result = this._table2Yapi = {
				efgecicialfatfis: {
					idVarmi: true,
					harTable: 'efgecicialfatdetay',
					tipler: {
						GeciciAlimEFat: { tipText: 'Gecici Alım e-İşlem' }
					},
					fisBaglantiDuzenle: ({ alias, clauses }) =>
						clauses.push(`${alias}.efbelge IN ('', 'E')`),
					clauses: {
						oncelik: '1',
						eIslTip: ({ alias }) => `${alias}.efbelge`,
						uuid: ({ alias }) => `${alias}.efuuid`,
						mustKod: ({ alias }) => `${alias}.mustkod`,
						mustUnvan: ({ alias }) => `${alias}.efmustunvan`,
						tarih: ({ alias }) => `${alias}.tarih`,
						fisNox: ({ alias }) => `${alias}.effatnox`,
						bedel: ({ alias }) => `${alias}.efsonuc`,
						anlDurum: ({ alias }) => `${alias}.alimanlasmafisdurumu`
					}
				},
				sipfis: {
					harTable: ['sipstok', 'siphizmet'],
					tipler: {
						AlimSip: { tipText: 'Alım Sipariş' },
						SatisSip: { tipText: 'Satış Sipariş' }
					},
					fisBaglantiDuzenle: ({ alias, clauses }) =>
						clauses.push(`${alias}.silindi = ''`, `${alias}.ozeltip = ''`),
					clauses: {
						oncelik: '2',
						eIslTip: ({ alias }) => `${alias}.efayrimtipi`,
						uuid: ({ alias }) => `${alias}.efatuuid`,
						mustKod: ({ alias }) => `${alias}.must`,
						mustUnvan: 'fis_carmst.birunvan',
						tarih: ({ alias }) => `${alias}.tarih`,
						fisNox: ({ alias }) => `${alias}.fisnox`,
						bedel: ({ alias }) => `${alias}.net`,
						ekBilgi: ({ alias }) => `${alias}.cariaciklama`
					}
				}
			}
			for (let [table, item] of entries(result))
				item.table = table
		}
		return result
	}

	static get tip2Yapi() {
		let { _tip2Yapi: result } = this
		if (result == null) {
			let { table2Yapi } = this
			result = this._tip2Yapi = {}
			for (let item of values(table2Yapi)) {
				let { tipler } = item
				if (empty(tipler))
					continue
				for (let [tip, subItem] of entries(tipler)) {
					let newItem = { ...item, ...subItem }
					delete newItem.tipler
					result[tip] = newItem
				}
			}
		}
		return result
	}

	constructor(e = {}) {
		super(e)
		let secs = Number(e.otoTazeleSecs ?? qs.otoTazele ?? qs.otoTazeleSecs)
		extend(this, {
			durum: e.onayDurum == 'O' ? 'onayli' : e.onayDurum == 'R' ? 'red' : e.hepsiniGoster ? 'tumu' : 'bekleyen',
			arama: '',
			recs: [],
			otoTazeleDisabled: !!qs.otoTazeleYok,
			otoTazeleSecs: Number.isFinite(secs) && secs > 0 ? secs : null,
			serviceProc_delaySecs: Math.max(Number(qs.serviceProc_delaySecs) || 10, 2),
			_previewTokens: new Set()
		})
	}

	recordKey(r) { return toJSONStr([r._db, r.onayId, Number(r.onayNo)]) }
	documentKey(r) { return toJSONStr([r._db, r._table, r.onayId]) }

	rfbDuzenle() {
		super.rfbDuzenle(...arguments)
		let { rfb, content, rowsHeight, class: { partName } } = this

		rfb.setId(partName)
			.addStyle_fullWH()
			.addStyle(this.getStyle())
			.addCSS('onayci-root')

		content.setLayout($('<div/>'))
			.addCSS('ony-shell')
			.addStyle_fullWH()

		let header = content.addForm('header').addCSS('ony-header')
			.setLayout($(
				`<div>
					<div class="ony-heading">
						<div>
							<span class="ony-eyebrow">BELGE ONAY MERKEZİ</span>
							<h2>Onay İşlemleri</h2>
						</div>
						<div class="ony-toolbar">
							<button type="button" data-action="approve" class="ony-primary">${this.icon('check')} Onayla</button>
							<button type="button" data-action="reject" class="ony-danger">${this.icon('reject')} Reddet</button>
							<button type="button" data-action="view">${this.icon('eye')} Belge</button>
							<button type="button" data-action="detail">${this.icon('file')} Detay / Anlaşma</button>
							${this.proformaKullanilir ? `<button type="button" data-action="proforma">${this.icon('folder')} Proforma</button>` : ''}
							<button type="button" data-action="refresh" title="Yenile" aria-label="Yenile">${this.icon('refresh')}</button>
						</div>
					</div>
					<div class="ony-controls">
						<div class="ony-tabs" role="group" aria-label="Durum filtresi">${[
							['bekleyen', '<span class=orangered>Bekleyen</span>'],
							['onayli', `<span style="color: #239e78">Onaylı</span>`],
							['red', `<span style="color: #ed5265">Reddedilen</span>`],
							['tumu', 'Tümü']
						].map(([id, text]) =>
							`<button type="button" data-filter="${id}" aria-pressed="${id == this.durum}">
								${text}
							</button>`).join('')}</div>
						<input class="ony-search" type="search" placeholder="Belge, firma veya kullanıcı ara…" aria-label="Belge ara">
					</div>
					<div class="ony-summary" aria-live="polite">Yükleniyor…</div>
				</div>`
			))
			.onAfterRun(({ builder: { layout } }) => {
				this.header = layout

				layout.on('click.onayci', 'button[data-action]', evt => {
					let action = evt.currentTarget.dataset.action
					if (action == 'refresh')
						this.tazele()
					else
						this.actionIstendi({ action })
				})

				layout.on('click.onayci', 'button[data-filter]', evt => {
					this.durum = evt.currentTarget.dataset.filter
					this.tazele()
				})

				layout.on('input.onayci', '.ony-search', evt => {
					this.arama = evt.currentTarget.value
					clearTimeout(this._timer_arama)
					this._timer_arama = setTimeout(() => this.tazele({ local: true }), 180)
				})
			})

		this.fbd_grid = content.addGridliGosterici('grid')
			.rowNumberOlmasin().noAnimate().noEmptyRow()
			.setTabloKolonlari([
				gridKolon('_text', 'Onay İşlemleri')
					.setCellClassName('ony-card-cell')
					.noSql()
			])
			.setSource(() => this.loadGridData())
			.widgetArgsDuzenleIslemi(({ args }) => {
				extend(args, {
					showGroupsHeader: false, showStatusBar: false,
					groupable: false, columnsMenu: false,
					columnsHeight: 0, rowsHeight,
					adaptive: false, selectionMode: 'checkbox',
					sortable: false, filterable: false,
					pageable: false, virtualmode: false,
					enableHover: true, enableTooltips: false
				})
			})
			.veriYukleninceIslemi(() => {
				this.gridPart?.gridWidget?.clearselection()
				this.headerGuncelle()
			})
			.onAfterRun(({ builder: { part } }) => {
				this.gridPart = part
				part.grid.on('rowselect.onayci rowunselect.onayci', () => this.headerGuncelle())
				part.grid.on('click.onayci', '.ony-card button[data-action]', evt => {
					evt.preventDefault()
					evt.stopPropagation()
					let target = evt.currentTarget
					let id = $(target).closest('.ony-card').attr('data-id')
					let rec = this.recs.find(r => this.recordKey(r) == id)
					if (rec)
						this.actionIstendi({ action: target.dataset.action, recs: [rec] })
				})
			})
			.addCSS('ony-grid')
	}

	afterRun() {
		super.afterRun(...arguments)
		let { part, rfb, gridPart } = this
		let { gridWidget: w } = gridPart ?? {}

		app.enterKioskMode()
		$('body').addClass('allow-nav')
		part.kapaninca(() => this.destroyPart())

		let root = rfb.layout?.[0]
		if (root && globalThis.ResizeObserver) {
			this._resizeObserver = new ResizeObserver(() => {
				let { gridWidget: w, grid } = this.gridPart ?? {}
				let { rowsHeight: height } = this
				if (!this.isDestroyed && w && w.rowsheight != height)
					grid.jqxGrid({ rowsheight: height })
			})
			this._resizeObserver.observe(root)
		}

		if (config.service)
			this.startServiceProc()
		else {
			this._timer_ntfy = setTimeout(() => this.registerNTFY(), 5_000)
			this.otoTazele_startTimer()
		}

		try { window.Notification?.requestPermission()?.catch?.(() => {}) }
		catch (ex) { console.debug(ex) }

		if (!qs.tamEkranYok) {
			this._timer_fullscreen = setTimeout(() => {
				if (this.isDestroyed || document.fullscreenElement)
					return
				try { promise(requestFullScreen()).catch(() => {}) }
				catch (ex) { console.debug(ex) }
			}, 100)
		}
	}

	close(e) {
		this.destroyPart()
		return super.close(e)
	}

	destroyPart() {
		app.exitKioskMode()
		if (this._destroyed)
			return
		this._destroyed = true

		for (let key of ['arama', 'ntfy', 'fullscreen', 'serviceProc', 'otoTazele', 'pending'])
			clearTimeout(this[`_timer_${key}`])

		this._resizeObserver?.disconnect()
		this.header?.off('.onayci')
		this.gridPart?.grid?.off('.onayci')
		this.unregisterNTFY()

		for (let token of this._previewTokens)
			this.class._previewCallbacks?.delete(token)
		this._previewTokens.clear()
	}

	tazele({ local = false } = {}) {
		if (this.isDestroyed)
			return
		if (this._gridLoading || this._taskBusy) {
			this._refreshPending = true
			return
		}
		this._localRefresh = local
		this.gridPart?.gridWidget?.clearselection()
		this.gridPart?.tazele()
	}

	async loadGridData() {
		if (this.isDestroyed)
			return []

		this._gridLoading = true
		this.headerGuncelle()
		try {
			if (!this._localRefresh || !this._loaded) {
				let recs = await this.loadServerData()
				if (this.isDestroyed)
					return []
				this.recs = recs
				this._loaded = true
				this._lastLoadError = null
			}
			return this.filteredRecs()
		}
		catch (ex) {
			this._lastLoadError = getErrorText(ex)
			// JQX callback tamamlanmalı; aksi halde ilk yükleme hatasında Yenile kilitlenir.
			return this.filteredRecs()
		}
		finally {
			this._localRefresh = this._gridLoading = false
			this.headerGuncelle()
			if (this._refreshPending && !this.isDestroyed) {
				this._refreshPending = false
				this._timer_pending = setTimeout(() => this.tazele(), 100)
			}
		}
	}

	filteredRecs() {
		let { recs, arama, tip2Yapi } = this
		let filtreTokens = arama.trim().split(/\s+/).filter(Boolean)
		if (!filtreTokens.length)
			return recs
	
		let culture = 'tr-TR'
		return recs.filter(r => {
			let values = [
				r._db, r.tip, tip2Yapi[r.tip]?.tipText,
				r.mustKod, r.mustUnvan, r.fisNox, r.ekBilgi,
				r.onayRedNedeni, r.onceText, r.irsNox,
				r.onceUser, r.sonraUser,
				app.user2Adi?.[r.onceUser], app.user2Adi?.[r.sonraUser],
				r.tarih, r.bedel
			]
				.map(v => isObject(v) ? toJSONStr(v) : v?.toString())
				.filter(Boolean)
	
			for (let token of filtreTokens) {
				let uygunmu = false
				for (let v of values) {
					if (
						v.toUpperCase().includes(token.toUpperCase()) ||
						v.toLocaleUpperCase(culture).includes(token.toLocaleUpperCase(culture))
					) {
						uygunmu = true
						break
					}
				}
				if (!uygunmu)
					return false
			}
			return true
		})
	}

	headerGuncelle() {
		let { header } = this
		if (!header?.length || this.isDestroyed)
			return

		let selected = this.selectedRecs
		let busy = !!(this._gridLoading || this._taskBusy)

		header.find('[data-filter]').each((i, el) => {
			$(el)
				.attr('aria-pressed', el.dataset.filter == this.durum)
				.prop('disabled', busy)
		})
		header.find('[data-action]').prop('disabled', busy || !selected.length)
		header.find('[data-action="refresh"]').prop('disabled', busy)
		header.find('[data-action="approve"], [data-action="reject"]')
			.prop('disabled', busy || !selected.some(r => r.onayNo && (config.dev || !r.onayDurum)))

		this.gridPart?.grid?.find('.ony-card button').prop('disabled', busy)

		header.find('.ony-summary').html(
			this._lastLoadError ? `Yüklenemedi: ${this._lastLoadError}` :
			this._gridLoading ? 'Belgeler yükleniyor…' :
			this._taskBusy ? 'İşlem sürüyor…' :
			`${this.filteredRecs().length} belge · ${selected.length} seçili${this.recs.length ? '' : ' · Bu filtrede belge bulunamadı'}`
		)
	}

	async actionIstendi({ action, recs = this.selectedRecs } = {}) {
		if (this.isDestroyed || this._taskBusy || this._gridLoading)
			return false

		if (action == 'approve' || action == 'reject')
			return this.onayRedIstendi({ state: action == 'approve', recs })

		if (!recs.length) {
			hConfirm('Bir satır seçilmelidir', this.title)
			return false
		}

		try {
			let e = { sender: this.gridPart, recs }
			switch (action) {
				case 'view': return await this.izleIstendi(e)
				case 'detail': return await this.belgeDetayiGosterIstendi(e)
				case 'proforma': return await this.proformalariGosterIstendi(e)
			}
		}
		catch (ex) {
			hConfirm(getErrorText(ex), this.title)
			return false
		}
	}

	async onayRedIstendi(e = {}) {
		if (this.isDestroyed || this._taskBusy || this._gridLoading)
			return false

		this._taskBusy = true
		this.headerGuncelle()
		try {
			return await this._onayRedIstendi({
				...e,
				sender: this.gridPart ?? e.sender
			})
		}
		catch (ex) {
			if (ex?.rc != 'userClose')
				hConfirm(getErrorText(ex), 'Onay / Red')
			return false
		}
		finally {
			this._taskBusy = false
			this.headerGuncelle()
			if (this._refreshPending) {
				this._refreshPending = false
				this.tazele()
			}
		}
	}

	static getHTML({ rec }) {
		let esc = v => OnayciPart.prototype.escapeHTML(v)
		return `<div style="display:flex;flex-wrap:wrap;gap:5px 12px;color:#40536e;font:13px 'Segoe UI',Arial">
			<b>${esc(rec.mustUnvan)}</b><span>${esc(rec.fisNox)}</span>
			<span>${esc(dateKisaString(asDate(rec.tarih)))}</span>
			<span>${esc(rec._db)} · Onay ${esc(rec.onayNo)}</span>
			<b>${esc(bedelToString(rec.bedel))}</b></div>`
	}

	getHTML({ rec: r }) {
		let esc = v => this.escapeHTML(v), users = app.user2Adi ?? {}
		let state = r.onayDurum == 'O' ? 'onayli' : r.onayDurum == 'R' ? 'red' : 'bekleyen'
		let status = ({
			onayli: 'Onaylandı',
			red: 'Reddedildi',
			bekleyen: 'Onay bekliyor'
		})[state]

		let date = v => {
			let d = asDate(v)
			return d && !isNaN(d.getTime()) ? d.toLocaleDateString('tr-TR') : '—'
		}
		let time = r.onayTS ? asDate(r.onayTS)?.toLocaleString('tr-TR') : ''
		let button = (action, label, icon) =>
			`<button type="button" data-action="${action}" title="${label}" aria-label="${label}">${this.icon(icon)}</button>`

		let reason = r.onayRedNedeni || r.onceText || ''
		let flags = [
			r.irsNox ? `<span class="${r.irsVarmi ? 'ony-tag' : 'ony-tag ony-warning'}">İrs: ${esc(r.irsNox)}${r.irsVarmi ? '' : ' · aktarılmamış'}</span>` : '',
			r.anlDurum ? '<span class="ony-tag">Anlaşmalı</span>' : '',
			r.proformaId ? '<span class="ony-tag ony-proforma">Proforma bağlı</span>' : ''
		].join('')

		return (
			`<article class="ony-card ony-${state}" data-id="${esc(this.recordKey(r))}">
				<div class="ony-main"><div class="ony-type-icon">${this.icon('file')}</div><div class="ony-description">
					<div class="ony-type">${esc(this.tip2Yapi[r.tip]?.tipText || r.tip)} <span>${esc(r._db)}</span></div>
					<h3 title="${esc(r.mustUnvan)}">${esc(r.mustUnvan || 'Cari unvanı yok')}</h3>
					<div class="ony-reference" title="${esc(r.ekBilgi)}">${esc(r.fisNox)}${r.ekBilgi ? ' · ' + esc(r.ekBilgi) : ''}</div>
					<div class="ony-flags">${flags}</div>
				</div></div>
				<div class="ony-date">${this.icon('calendar')}<div><span>${esc(date(r.tarih))}</span>
					<strong>${esc(bedelToString(r.bedel))}</strong><small>Belge tutarı</small></div></div>
				<div class="ony-info"><div class="ony-status">${this.icon(state == 'bekleyen' ? 'clock' : state == 'red' ? 'reject' : 'check')}
					<div>
						<strong>${status}</strong><small>${esc(r.onayNo)}. onay kademesi${time ? ' · ' + esc(time) : ''}</small></div>
					</div>
					<div class="ony-approvers">
						<span title="${esc(users[r.onceUser] || r.onceUser)}">Önceki: <b>${esc(users[r.onceUser] || r.onceUser || '—')}</b></span>
						<span title="${esc(users[r.sonraUser] || r.sonraUser)}">Sonraki: <b>${esc(users[r.sonraUser] || r.sonraUser || '—')}</b></span>
					</div>
					${reason ? `<div class="ony-note" title="${esc(reason)}">${r.onayRedNedeni ? 'Neden' : 'Önceki not'}: ${esc(reason)}</div>` : ''}
				</div>
				<div class="ony-actions">
					${button('view', 'Belgeyi görüntüle', 'eye')}
					${button('detail', 'Detay / Anlaşma', 'file')}
					${this.proformaKullanilir ? button('proforma', 'Proformalar', 'folder') : ''}
					${/*config.dev ||*/ !r.onayDurum ? (
						button('approve', 'Onayla', 'check') +
						button('reject', 'Reddet', 'reject')
					) : ''}
				</div>
			</article>`
		)
	}

	getKAKolonlar(colKod, colAdi) {
		let result = [colKod, colAdi].filter(Boolean)
		if (!isMiniDevice() || result.length < 2)
			return result

		colKod.hidden()
		colAdi.setCellsRenderer((col, row, field, value, html, jqxCol, rec) =>
			changeTagContent(html,
				`${this.escapeHTML(value)} <span class="royalblue">${this.escapeHTML(rec[colKod.belirtec])}</span>`
			)
		)
		return result
	}

	escapeHTML(value) {
		return String(value ?? '').replace(
			/[&<>"']/g,
			c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
		)
	}

	icon(id) {
		let path = {
			reject: '<path d="m6 6 12 12M6 18 18 6"/>',
			eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
			folder: '<path d="M3 7V4h7l2 3h9v13H3Z"/>',
			calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-14 4h3m4 0h3"/>',
			clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
			plus: '<path d="M12 5v14M5 12h14"/>',
			check: '<path d="m5 12 4 4L19 6"/>',
			release: '<path d="M10 5H5v14h5m4-14 6 7-6 7m-6-7h12"/>',
			refresh: '<path d="M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 3M5 15a8 8 0 0 0 13 3"/>',
			car: '<path d="m5 9 2-5h10l2 5M4 10h16v8H4zm2 8v2m12-2v2M7 13h2m6 0h2"/>',
			file: '<path d="M14 3H5v18h14V8zm0 0v5h5M8 12h8m-8 4h6"/>'
		}[id] || '<circle cx="12" cy="12" r="9"/>'

		return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`
	}

	getStyle() {
		return `$elementCSS { --ony-border: #dce5ef; color: #24334a; background: #f3f6fa; font-family: 'Segoe UI', Arial, sans-serif; overflow: hidden }
		$elementCSS .ony-shell { position: absolute; inset: 0; padding: 0 !important; display: flex !important; flex-direction: column; container-type: inline-size }
		$elementCSS .ony-header { flex: 0 0 auto; padding: 22px 26px 12px; box-sizing: border-box; width: 100% }
		$elementCSS .ony-heading, $elementCSS .ony-controls, $elementCSS .ony-toolbar, $elementCSS .ony-tabs { display: flex; align-items: center; gap: 10px }
		$elementCSS .ony-heading { justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap }
		$elementCSS .ony-eyebrow { color: #7b8ca4; font-size: 10px; font-weight: 700; letter-spacing: 2px }
		$elementCSS h2 { margin: 4px 0 0; font-size: 25px; font-weight: 650; color: #1e2b40 }
		$elementCSS button { cursor: pointer; font-family: inherit }
		$elementCSS button:disabled { opacity: .45; cursor: default }
		$elementCSS button:focus-visible, $elementCSS input:focus-visible { outline: 2px solid #2472d8; outline-offset: 2px }
		$elementCSS svg { width: 20px; height: 20px; flex: 0 0 auto; vertical-align: middle }
		$elementCSS .ony-toolbar button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 1px solid #d6dfeb; border-radius: 9px; background: white; padding: 9px 13px; color: #40536e; font-weight: 600; font-size: 13px }
		$elementCSS .ony-toolbar .ony-primary { background: #206bd0; border-color: #206bd0; color: white }
		$elementCSS .ony-controls { flex-wrap: wrap }
		$elementCSS .ony-tabs { gap: 4px; padding: 4px; border: 1px solid #dce5ef; border-radius: 10px; background: #eaf0f7 }
		$elementCSS .ony-tabs button { border: 0; border-radius: 7px; padding: 8px 11px; background: transparent; color: #5d6c80; font-size: 12px; font-weight: 600 }
		$elementCSS .ony-tabs button[aria-pressed=true] { background: white; color: #165daf; box-shadow: 0 1px 4px #22334a16 }
		$elementCSS [data-count] { margin-left: 5px; opacity: .75 }
		$elementCSS .ony-closed { display: flex; align-items: center; gap: 6px; color: #62738c; font-size: 12px; white-space: nowrap }
		$elementCSS .ony-search { margin-left: auto; min-width: 140px; width: 210px; border: 1px solid #dce5ef; border-radius: 9px; padding: 10px 12px; font: inherit; font-size: 12px; background: white }
		$elementCSS .ony-summary { margin-top: 12px; color: #76869a; font-size: 12px; min-height: 16px }
		$elementCSS .ony-grid { flex: 1 1 0; min-height: 0; width: calc(100% - 36px) !important; margin: 0 18px 18px; position: relative }
		$elementCSS .ony-grid > .grid { height: 100% !important; width: 100% !important; border: 0; background: transparent }
		$elementCSS .ony-grid .jqx-grid-content, $elementCSS .ony-grid .jqx-grid-cell { background: #f3f6fa; border-color: transparent !important }
		$elementCSS .ony-grid .jqx-grid-cell-selected { background: #e5eefc !important }
		$elementCSS .ony-grid .ony-card-cell > div { margin: 0 !important; padding: 0 !important; height: 100%; overflow: hidden }
		$elementCSS .ony-card { --ony-accent: #239e78; box-sizing: border-box; height: calc(100% - 12px); margin: 3px 10px 9px 4px; padding: 0px 20px 10px 18px; display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(170px, .8fr) minmax(260px, 1.15fr) 32px; align-items: center; gap: 18px; background: white; border: 1px solid var(--ony-border); border-left: 5px solid var(--ony-accent); border-radius: 11px; box-shadow: 0 3px 8px #20314f08; white-space: normal; font-family: 'Segoe UI', Arial, sans-serif }
		$elementCSS .ony-red { --ony-accent: #ed5265 }
		$elementCSS .ony-bekleyen { --ony-accent: #e9a23b }
		$elementCSS .ony-kapandi { --ony-accent: #9aa7b7 }
		$elementCSS .ony-main { display: flex; align-items: center; gap: 15px; min-width: 0 }
		$elementCSS .ony-type-icon { display: grid; place-items: center; flex: 0 0 54px; height: 54px; border-radius: 18px; color: #3678c9; background: #eaf3ff }
		$elementCSS .ony-type-icon svg { width: 27px; height: 27px }
		$elementCSS .ony-description { min-width: 0 }
		$elementCSS .ony-type { color: #1d72d1; font-weight: 700; font-size: 11px; margin-bottom: 7px }
		$elementCSS .ony-type span { color: #8a98aa; font-weight: 500; margin-left: 4px }
		$elementCSS h3 { color: #263348; font-size: 17px; font-weight: 650; margin: 0 0 7px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
		$elementCSS .ony-reference { font-size: 12px; line-height: 1.5; color: #63758f; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere }
		$elementCSS .ony-plate { display: inline-block; border: 1px solid #c9d7e8; border-left: 5px solid #206bd0; border-radius: 4px; padding: 2px 8px; font-weight: 650; letter-spacing: 1px }
		$elementCSS .ony-note { font-size: 11px; color: #8894a5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 4px }
		$elementCSS .ony-date { display: flex; align-items: center; gap: 12px; border-left: 1px solid #e5ebf3; padding-left: 20px; color: #71839c; min-height: 84px }
		$elementCSS .ony-date span, $elementCSS .ony-date small { display: block; font-size: 12px }
		$elementCSS .ony-date strong { display: block; color: #3d506d; font-size: 17px; margin: 6px 0 }
		$elementCSS .ony-info { border-left: 1px solid #e5ebf3; padding-left: 18px; min-width: 0 }
		$elementCSS .ony-status { display: flex; align-items: center; gap: 11px; padding: 12px; border-radius: 9px; background: #eaf7f1; color: #198162 }
		$elementCSS .ony-status strong { font-size: 14px; display: block }
		$elementCSS .ony-status small { font-size: 11px; display: block; opacity: .8; margin-top: 4px }
		$elementCSS .ony-red .ony-status { color: #c23349; background: #fff0f2 }
		$elementCSS .ony-bekleyen .ony-status { color: #a26b15; background: #fff6e7 }
		$elementCSS .ony-kapandi .ony-status { color: #69798f; background: #f0f3f7 }
		$elementCSS .ony-people { display: flex; gap: 5px; align-items: center; margin-top: 10px; min-height: 28px }
		$elementCSS .ony-people > span:first-child { color: #7c8aa0; font-size: 11px; margin-right: 5px }
		$elementCSS .ony-avatar { display: inline-flex; align-items: center; justify-content: center; width: 27px; height: 27px; border-radius: 50%; color: white; background: #3479c9; font-weight: 600; font-size: 10px; flex-shrink: 0 }
		$elementCSS .ony-owner { background: #253f65; box-shadow: 0 0 0 2px #c7d9f0 }
		$elementCSS .ony-extra { color: #5c7290; background: #eaf0f8 }
		$elementCSS .ony-people button, $elementCSS .ony-actions button { display: inline-grid; place-items: center; border: 0; background: #f0f4fa; color: #59718e; border-radius: 8px; width: 29px; height: 29px; padding: 5px }
		$elementCSS .ony-people button { border-radius: 50% }
		$elementCSS .ony-actions { display: flex; flex-direction: column; gap: 4px }
		$elementCSS .ony-actions button:hover, $elementCSS .ony-people button:hover { color: #1764bf; background: #dfedff }
		$elementCSS .ony-toolbar .ony-primary { background: #168565; border-color: #168565 }
		$elementCSS .ony-toolbar .ony-danger { color: #c23349; background: #fff0f2; border-color: #f0c9d0 }
		$elementCSS .ony-approvers { display: flex; flex-wrap: wrap; gap: 5px 12px; font-size: 11px; color: #71839c; margin-top: 10px }
		$elementCSS .ony-approvers span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
		$elementCSS .ony-flags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 6px }
		$elementCSS .ony-tag { font-size: 10px; padding: 3px 5px; background: #eaf7f1; color: #198162; border-radius: 4px }
		$elementCSS .ony-warning { color: #c23349; background: #fff0f2 }
		$elementCSS .ony-proforma { color: #7752b8; background: #f3ecff }
		$elementCSS .ony-actions [data-action=approve] { color: #198162; background: #eaf7f1 }
		$elementCSS .ony-actions [data-action=reject] { color: #c23349; background: #fff0f2 }
		@container (max-width: 1049px) {
			$elementCSS .ony-card { grid-template-columns: minmax(0, 1fr) minmax(250px, .9fr) 30px; gap: 12px; padding: 16px }
			$elementCSS .ony-main { grid-column: 1; grid-row: 1 }
			$elementCSS .ony-date { grid-column: 1; grid-row: 2; min-height: 0; border: 0; padding-left: 69px }
			$elementCSS .ony-date svg, $elementCSS .ony-date small { display: none }
			$elementCSS .ony-date strong { display: inline; font-size: 14px; margin-left: 8px }
			$elementCSS .ony-date span { display: inline }
			$elementCSS .ony-info { grid-column: 2; grid-row: 1 / 3 }
			$elementCSS .ony-actions { grid-column: 3; grid-row: 1 / 3 }
		}
		@container (max-width: 679px) {
			$elementCSS .ony-header { padding: 15px 12px 10px }
			$elementCSS .ony-heading { gap: 12px; margin-bottom: 12px }
			$elementCSS .ony-toolbar { gap: 5px; flex-wrap: wrap }
			$elementCSS .ony-toolbar button { padding: 8px; font-size: 11px }
			$elementCSS .ony-search { margin-left: 0; flex: 1; width: 130px }
			$elementCSS .ony-tabs { gap: 0 }
			$elementCSS .ony-tabs button { padding: 8px; font-size: 11px }
			$elementCSS .ony-grid { width: calc(100% - 12px) !important; margin: 0 6px 8px }
			$elementCSS .ony-card { grid-template-columns: minmax(0, 1fr) 30px; grid-template-rows: auto auto auto; gap: 8px; padding: 14px 12px; margin-right: 5px }
			$elementCSS .ony-type-icon { flex-basis: 38px; height: 42px; border-radius: 12px }
			$elementCSS .ony-main { gap: 10px }
			$elementCSS h3 { font-size: 14px }
			$elementCSS .ony-date { padding-left: 48px }
			$elementCSS .ony-info { grid-column: 1 / 3; grid-row: 3; border: 0; padding: 0 }
			$elementCSS .ony-actions { grid-column: 2; grid-row: 1 / 3 }
			$elementCSS .ony-status { padding: 9px }
		}`
	}

	async loadServerData(e = {}) {
		await app._promise_ilkBilgiler

		let gridPart = this
		let sqlNull = 'NULL', sqlEmpty = `''`
		let { encUser, user } = config.session
		let { onayNo: aktifOnayNo, onayMax, params: { alim, proforma } } = app
		let { gelenProformaIslemleri: proformaKullanilir } = alim.kullanim
		let { ay: buAy, yil2: buKisaYil } = today()
		let { hepsiniGoster, onayDurum } = gridPart

		let _cache = await (async () => {
			let kisaYilSet = {}, tip2Kurallar = {}, firmaParam = {}, dbSet = {}
			;{
				let { onayYili } = app.params?.ortak ?? {}
				kisaYilSet[onayYili || buKisaYil] = true
				if (buAy == 1)
					kisaYilSet[buKisaYil - 1] = true
			}

			let kurallar = []
			;{
				let sent = new MQSent(), { where: wh, sahalar } = sent
				sent
					.fromAdd('ORTAK..firmabilgi fbil')
					.innerJoin('fbil', 'ORTAK..firmatipbilgi ftip', 'fbil.id = ftip.firmaid')
					.innerJoin('ftip', 'ORTAK..onaybildirim fis', 'ftip.id = fis.firmatipid')
					.innerJoin('fis', 'ORTAK..islemonayci har', 'fis.id = har.fisid')
				wh.degerAta(encUser, 'har.xuserkod')
				sahalar.add(...[
					'fis.id', 'fbil.firmaadi firmaAdi', 'ftip.tip',
					`(case when COALESCE(fis.onayno, 0) = 0 then 1 else fis.onayno end) onayNo`,
					'har.onaylimiti onayLimiti', `fbil.paramjson paramJSON`
				])
				kurallar = await sent.execSelect()
			}

			let allDBNames = await app.wsDBListe()
			let ignoreProgBelirtecSet = asSet(['BR', 'MH', 'IS', 'AK'])
			allDBNames = allDBNames.filter(_ =>
				!ignoreProgBelirtecSet[_.substr(0, 2)] &&
				kisaYilSet[asInteger(_.substr(2, 2))]
			)

			for (let rec of kurallar) {
				let { tip, firmaAdi, paramJSON: par } = rec
				;(tip2Kurallar[tip] ??= []).push(rec)

				if (par && empty(firmaParam)) {
					try {
						par = JSON.parse(par)
						if (!empty(par))
							firmaParam = par
					}
					catch (ex) { console.error(ex) }
				}

				for (let db of allDBNames) {
					let db_firmaAdi = db.substr(4)
					if (db_firmaAdi == firmaAdi)
						dbSet[db] = true
				}
			}

			;{
				// Eksik tablolu DB'leri listeden at.
				let dbListe = keys(dbSet)
				for (let db of dbListe) {
					let res = await app.setCurrentDBAndDo({
						db,
						block: () => app.sqlHasColumn(`${db}..webonay`, 'id')
					})
					if (!res)
						delete dbSet[db]
				}
			}

			return { kurallar, tip2Kurallar, firmaParam, dbSet }
		})()

		mergeInto(_cache, app, 'kurallar', 'tip2Kurallar', 'firmaParam', 'dbSet')

		let { table2Yapi, tip2Yapi } = this
		let { dbSet } = app
		let orderBy = ['onayDurumText', '_db', 'oncelik']
		let stm = new MQStm({ orderBy }), { with: $with } = stm

		for (let db in dbSet) {
			let uni = new MQUnionAll()
			let basi = aktifOnayNo || 1
			let sonu = aktifOnayNo || onayMax

			for (let i = basi; i <= sonu; i++) {
				let ilkmi = i == 1, sonmu = i == onayMax
				let sent = new MQSent(), { where: wh, sahalar } = sent

				;{
					sent.fromAdd(`${db}..webonay ony`)
					wh.degerAta(user, `ony.w${i}onayuser`)

					if (hepsiniGoster) {
						if (onayDurum)
							wh.degerAta(onayDurum, `ony.w${i}onaydurum`)
					}
					else
						wh.degerAta('', `ony.w${i}onaydurum`)

					if (!ilkmi) {
						wh
							.degerAta('O', `ony.w${i - 1}onaydurum`)
							.notDegerAta('X', `ony.w${i - 1}sonradurumu`)
					}
				}

				;{
					let cl = {
						once: {
							text: ilkmi ? sqlEmpty : `ony.w${i - 1}onayredtext`,
							user: ilkmi ? sqlEmpty : `ony.w${i - 1}onayuser`
						},
						sonra: {
							user: sonmu ? sqlEmpty : `ony.w${i + 1}onayuser`
						}
					}
					sahalar
						.addWithAlias('ony', ...[
							'asiltablo _table', 'adimtipi tip', 'id onayId',
							'adimsayac sayac', 'adimid id',
							`w${i}onaydurum onayDurum`,
							`w${i}onayredts onayTS`,
							`w${i}onayredtext onayRedNedeni`
						])
						.add(...[
							`${i.sqlServerDegeri()} onayNo`,
							`${cl.once.text} onceText`,
							`${cl.once.user} onceUser`,
							`${cl.sonra.user} sonraUser`
						])

					if (proformaKullanilir)
						sahalar.add(`ony.proformaid proformaId`)
				}

				uni.add(sent)
			}

			if (!empty(uni.liste))
				$with.add(uni.asTmpTable(`${db}_onayci`))
		}

		if (empty($with.liste))
			return []

		let saha2Table2Clause = {}
		for (let [table, tableYapi] of entries(table2Yapi)) {
			let alias = `fis_${table}`
			let { clauses = {} } = tableYapi

			for (let [saha, clause] of entries(clauses)) {
				if (isFunction(clause))
					clause = await clause.call(this, { ...e, ...tableYapi, table, saha, alias })

				if (clause) {
					let t2c = saha2Table2Clause[saha] ??= {}
					t2c[table] = clause
				}
			}
		}

		;{
			let uni = stm.sent = new MQUnionAll()
			for (let db in dbSet) {
				let dbClause = db.sqlServerDegeri()
				let sent = new MQSent(), { where: wh, sahalar } = sent

				sent.fromAdd(`${db}_onayci ony`)

				for (let [table, tableYapi] of entries(table2Yapi)) {
					let { idVarmi, fisBaglantiDuzenle } = tableYapi
					let alias = `fis_${table}`
					let idSaha_ony = idVarmi ? 'id' : 'sayac'
					let idSaha_asil = idVarmi ? 'id' : 'kaysayac'
					let _e = {
						...e, table, tableYapi,
						sent, alias,
						clauses: [
							`ony._table = ${table.sqlServerDegeri()}`,
							`ony.${idSaha_ony} = ${alias}.${idSaha_asil}`
						]
					}
					await fisBaglantiDuzenle?.call?.(this, _e)
					sent.leftJoin('ony', `${db}..${table} ${alias}`, _e.clauses)
				}

				let { mustKod: table2MustKodClause } = saha2Table2Clause
				if (!empty(table2MustKodClause)) {
					let $case = new MQCase().setClause('ony._table')
					for (let [table, clause] of entries(table2MustKodClause))
						$case.when(table.sqlServerDegeri(), clause)
					$case.else(sqlNull)

					sent.leftJoin(
						'ony', `${db}..carmst fis_carmst`,
						`${$case} = fis_carmst.must`
					)
				}

				;{
					sahalar
						.add(`${dbClause} _db`)
						.addWithAlias('ony', ...[
							'_table', 'tip', 'onayId', 'sayac', 'id', 'onayNo', 'onayDurum',
							'onayTS', 'onayRedNedeni', 'onceText', 'onceUser', 'sonraUser',
							(proformaKullanilir ? 'proformaId' : null)
						].filter(Boolean))
						.add(
							`${new MQCase()
								.when(
									`ony.onayDurum = ${sqlEmpty}`,
									`<span class=forestgreen>Cevap Bekleyenler</span>`.sqlServerDegeri()
								)
								.else(`<span class=orangered>Cevaplananlar</span>`.sqlServerDegeri())
							} onayDurumText`
						)
				}

				for (let [saha, table2Clause] of entries(saha2Table2Clause)) {
					let $case = new MQCase().setClause('ony._table')
					for (let [table, clause] of entries(table2Clause)) {
						let alias = `fis_${table}`
						if (isFunction(clause))
							clause = clause.call(this, { ...e, saha, table, sent, alias })
						if (clause)
							$case.when(table.sqlServerDegeri(), clause)
					}
					if (!empty($case.liste)) {
						$case.else(sqlNull)
						sahalar.add(`${$case} ${saha}`)
					}
				}

				;{
					let or = new MQOrClause()
					for (let [table, tableYapi] of entries(table2Yapi)) {
						let { idVarmi } = tableYapi
						let alias = `fis_${table}`
						let keySaha = idVarmi ? 'id' : 'kaysayac'
						or.add(
							new MQAndClause()
								.degerAta(table, 'ony._table')
								.add(`${alias}.${keySaha} IS NOT NULL`)
						)
					}
					wh.add(or)
				}

				sent.groupByOlustur()
				uni.add(sent)
			}
		}

		let recs = await stm.execSelect()
		let db2GecAlimSayacListe = {}
		;recs.forEach(({ _db: db, tip, eIslTip, sayac }) => {
			if (tip == 'GeciciAlimEFat' && eIslTip != 'IR')
				(db2GecAlimSayacListe[db] ??= []).push(sayac)
		})

		let db2Sayac2RecDurum = {}
		if (!empty(db2GecAlimSayacListe)) {
			let promises = []
			for (let [db, gecAlimSayacListe] of entries(db2GecAlimSayacListe)) {
				let sent = new MQSent(), { where: wh, sahalar } = sent
				sent
					.fromAdd(`${db}..efgecicialfatirs irs`)
					.innerJoin('irs', `${db}..efgecicialfatfis fis`, 'irs.fissayac = fis.kaysayac')
					.leftJoin(
						'fis', `${db}..carmst car`,
						`fis.vkno = (case when car.sahismi = '' then car.vnumara else car.tckimlikno end)`
					)
					.leftJoin('car', `${db}..piffis virs`, [
						`virs.piftipi = 'I'`, `virs.almsat = 'A'`, `virs.iade = ''`,
						'car.must = virs.must', 'irs.irsseri = virs.seri',
						'irs.irsnoyil = virs.noyil', 'irs.irsno = virs.no'
					])
				wh.inDizi(gecAlimSayacListe, 'irs.fissayac')
				sahalar.add('irs.fissayac sayac', 'irs.efirsnobilgi nox', 'COUNT(virs.kaysayac) sayi')
				sent.groupByOlustur()

				promises.push(promise(async () => {
					let byId = db2Sayac2RecDurum[db] = {}
					for (let r of await sent.execSelect()) {
						let d = byId[r.sayac] ??= { irsNox: '', irsVarmi: true }
						d.irsNox = [d.irsNox, r.nox].filter(Boolean).join(', ')
						d.irsVarmi &&= !!r.sayi
					}
					return null
				}))
			}

			if (!empty(promises))
				await promiseAll(promises)
		}

		;recs.forEach(rec => {
			let { id, _db: db, tip, sayac, onayNo } = rec
			let durum = db2Sayac2RecDurum[db]?.[sayac]
			if (durum)
				extend(rec, durum)

			let item = tip2Yapi[tip]
			if (item) {
				let { tipText } = item
				if (onayNo) {
					tipText += [
						' ',
						`<span class="etiket darkgray"> | </span>`,
						`<span class="etiket gray">Onay: </span>`,
						`<span class="veri bold orangered">${String(onayNo)}</span>`
					].join('')
				}
				extend(rec, { tipText })
			}
		})

		let user2Adi = app.user2Adi ??= {}
		;{
			let eksikUserSet = new Set()
			;recs
				.flatMap(r => [r.onceUser, r.sonraUser])
				.filter(u => u && user2Adi[u] === undefined)
				.forEach(u => eksikUserSet.add(u))

			if (!empty(eksikUserSet)) {
				await promiseAll(
					arrayFrom(eksikUserSet).map(user =>
						Session.getSessionBasit({ user }).then(s =>
							user2Adi[user] = s?.userDesc ?? null)
					)
				)
			}
		}

		let { id2RecData } = this
		for (let rec of recs) {
			let d = id2RecData[this.documentKey(rec)]
			if (d)
				extend(rec, d)
			rec._text = await this.getHTML({ rec })
		}

		return recs
	}

	async _onayRedIstendi({ sender: gridPart, state: onaymi, recs, rec }) {
		gridPart ??= this.gridPart ?? {}
		recs ??= makeArray(rec)

		let { dev } = config
		let kisaIslemAdi = `${onaymi ? 'ONAY' : 'RED'}`
		let islemAdi = `${kisaIslemAdi} İşlemi`
		let styledIslemAdi = `${onaymi ? '<b class=forestgreen>ONAY</b>' : '<b class=orangered>RED</b>'} İşlemi`
		let { progressManager: pm } = self
		let hasPM = !!pm

		try {
			let { boundRecs: allRecs, gridWidget: w } = gridPart
			if (empty(recs))
				recs = this.selectedRecs

			recs = [...new Map(recs.map(r => [
				this.recordKey(r),
				this.recs.find(x => this.recordKey(x) == this.recordKey(r)) ?? r
			])).values()]

			recs = recs.filter(rec => rec.onayNo && (dev || !rec.onayDurum))
			if (empty(recs)) {
				hConfirm('Cevaplanacak uygun belge bulunamadı', islemAdi)
				return false
			}

			let aktarilmamisIrsaliyeSayi = recs.filter(_ => _.irsNox && !_.irsVarmi).length
			if (aktarilmamisIrsaliyeSayi) {
				try {
					let rdlg = await ehConfirm(
						`<b class=firebrick>${aktarilmamisIrsaliyeSayi}</b> adet belgenin İrsaliye bağlantısı, Alım İrsaliye kısmında yok.<br/><br/>` +
						`Yine de devam edilsin mi?`,
						styledIslemAdi
					)
					if (!rdlg)
						return false
				}
				catch (ex) {
					if (ex.rc != 'userClose')
						throw ex
					return false
				}
			}

			let { web = {} } = app.params
			let parKeys = [
				'onayNedenIstenir',
				'redNedenIstenir',
				'nedenZorunludur',
				'onayRedEminmisinizIstenir'
			]
			let fl = fromEntries(parKeys.map(k => [k, null]))
			let { firmaParam: par = {} } = app
			for (let k in fl)
				fl[k] ||= asBoolQ(par[k]) ?? asBoolQ(web[`onayci_${k}`])

			let { params: { alim } } = app
			let { gelenProformaIslemleri: proforma } = alim.kullanim
			let proIdVarmi = proforma && onaymi ? recs.some(r => r.proformaId) : null

			let nedenIstenir = (
				proIdVarmi || (
					(onaymi ? fl.onayNedenIstenir : fl.redNedenIstenir) ??
					!onaymi
				)
			)
			let nedenZorunludur = fl.nedenZorunludur ?? !onaymi
			let confirmIstenir = fl.onayRedEminmisinizIstenir ?? true

			let inst = { sonrakineOnayGitmesin: false }
			let nedenText

			if (nedenIstenir) {
				nedenText = await jqxPrompt({
					inst,
					etiket: `${styledIslemAdi} Nedeni giriniz`,
					duzenle: ({ rfb, fbd_value: fbd }) => {
						fbd.setMaxLength(40)
						if (proIdVarmi) {
							let { parentBuilder: form } = fbd
							rfb.addCheckBox('sonrakineOnayGitmesin', 'Sonrakine Onay Gitmesin')
								.addCSS('relative')
								.addStyle(
									`$elementCSS { top: 53px; left: 10px }
									 $elementCSS input:checked + label { color: firebrick !important }`
								)
						}
					}
				})

				nedenText = nedenText?.trim()
				if (nedenText == null)
					return false

				if (nedenZorunludur && !nedenText) {
					hConfirm(`<b>${kisaIslemAdi} Nedeni</b> belirtilmelidir`, islemAdi)
					return false
				}
			}
			else if (confirmIstenir) {
				let middleText = onaymi ?
					`<b class=forestgreen>ONAYLAMAK</b>` :
					`<b class=firebrick>REDDETMEK</b>`

				let rdlg = await ehConfirm(
					`<b class=royalblue>${recs.length}</b> adet kaydı ${middleText} istediğinize emin misiniz?`,
					styledIslemAdi
				)
				if (!rdlg)
					return false
			}

			if (this.isDestroyed)
				return false

			let { sonrakineOnayGitmesin } = inst

			// Bir proformanın durdurma kararı diğer belgelere taşınmamalıdır.
			let toplu = this.buildApprovalBatch({
				recs, onaymi, nedenText, sonrakineOnayGitmesin
			})
			await toplu.execute()

			for (let r of recs) {
				r.onayDurum = onaymi ? 'O' : 'R'
				r.onayRedNedeni = nedenText || ''
				delete this.id2RecData[this.documentKey(r)]
			}

			w?.clearselection()
			this._refreshPending = true

			// Yalnızca commit başarılıysa sonraki onaycıya haber verilir.
			let notificationErrors = await this.notifyNextApprovers({
				recs, onaymi, sonrakineOnayGitmesin
			})

			let middleText = onaymi ? 'ONAYLANDI' : 'REDDEDİLDİ'
			window[onaymi ? 'eConfirm' : 'wConfirm']({
				content: `${recs.length} adet kayıt ${middleText}!${notificationErrors.length ? '<br>İşlem kaydedildi; bazı bildirimler gönderilemedi.' : ''}`,
				title: islemAdi,
				autotimeout: 4000
			})

			return true
		}
		finally {
			if (!hasPM) {
				pm?.progressEnd()
				setTimeout(() => hideProgress(), 500)
			}
		}
	}

	buildApprovalBatch({ recs, onaymi, nedenText, sonrakineOnayGitmesin }) {
		let toplu = new MQToplu().withTrn()
		let ts = now()
		let groups = new Map()

		for (let r of recs) {
			let stage = Number(r.onayNo)
			let maxStage = this.getOnayMax(r)

			if (
				!app.dbSet?.[r._db] ||
				!this.table2Yapi[r._table] ||
				!r.onayId ||
				!Number.isInteger(stage) ||
				stage < 1 ||
				stage > app.onayMax ||
				!maxStage
			) {
				throw {
					isError: true,
					errorText: 'Belgenin şirket, tablo veya onay kuralı doğrulanamadı. Listeyi yenileyiniz.'
				}
			}

			let key = JSON.stringify([
				r._db,
				stage,
				this.proformaKullanilir ? r.proformaId || '' : ''
			])

			if (!groups.has(key))
				groups.set(key, [])
			groups.get(key).push(r)
		}

		for (let rows of groups.values()) {
			let { _db: db, onayNo: stage, proformaId } = rows[0]
			stage = Number(stage)

			let stop = !!(this.proformaKullanilir && proformaId && sonrakineOnayGitmesin)
			let upd = new MQIliskiliUpdate({
				from: `${db}..webonay`,
				where: { inDizi: rows.map(r => r.onayId), saha: 'id' },
				set: [
					{ degerAta: onaymi ? 'O' : 'R', saha: `w${stage}onaydurum` },
					{ degerAta: ts, saha: `w${stage}onayredts` },
					{ degerAta: nedenText || '', saha: `w${stage}onayredtext` },
					this.proformaKullanilir ?
						{ degerAta: proformaId || null, saha: 'proformaid' } : null,
					this.proformaKullanilir && proformaId ?
						{ degerAta: stop ? 'X' : '', saha: `w${stage}sonradurumu` } : null
				].filter(Boolean)
			})

			if (stop) {
				for (let i = stage + 1; i < app.onayMax; i++)
					upd.set.degerAta('X', `w${i}sonradurumu`)
			}

			// Liste açıkken başka bir işlem cevaplamışsa tüm batch geri alınır.
			upd.where.degerAta(config.session.user, `w${stage}onayuser`)
			if (!config.dev)
				upd.where.degerAta('', `w${stage}onaydurum`)
			if (stage > 1) {
				upd.where
					.degerAta('O', `w${stage - 1}onaydurum`)
					.notDegerAta('X', `w${stage - 1}sonradurumu`)
			}

			toplu.add(upd)
			toplu.add(
				`IF @@ROWCOUNT <> ${rows.length} BEGIN; THROW 50001, N'Belgenin onay durumu değişti. Listeyi yenileyiniz.', 1; END;`
			)

			let finalByTable = new Map()
			for (let r of rows) {
				if (!stop && stage < this.getOnayMax(r))
					continue
				if (!finalByTable.has(r._table))
					finalByTable.set(r._table, [])
				finalByTable.get(r._table).push(r.sayac)
			}

			for (let [table, ids] of finalByTable) {
				toplu.add(new MQIliskiliUpdate({
					from: `${db}..${table}`,
					where: { inDizi: ids, saha: 'kaysayac' },
					set: { degerAta: onaymi ? '' : 'RD', saha: 'wonay' }
				}))
			}
		}

		return toplu
	}

	async notifyNextApprovers({ recs, onaymi, sonrakineOnayGitmesin }) {
		let errors = []
		let onayBilgiSet = new Set()
		let aktifOnayNo = Number(app.onayNo) || 1

		if (!onaymi)
			return errors

		for (let r of recs) {
			let stopped = this.proformaKullanilir && r.proformaId && sonrakineOnayGitmesin
			if (!stopped && r.sonraUser && Number(r.onayNo) < this.getOnayMax(r))
				onayBilgiSet.add([r.sonraUser, r.onayNo].join(delimWS))
		}

		let { session: { user: buUser } = {} } = config
		for (let _ of onayBilgiSet) {
			try {
				let [user, onayNo] = _.split(delimWS)
				onayNo = (Number(onayNo) || aktifOnayNo) + 1
				let onayNoStr = String(onayNo)

				let inNewWindow = true
				let tempQS = { ...qs, inNewWindow, onayNo }

				;{
					let { ws } = config
					if (ws) {
						let { url: wsURL } = ws
						mergeInto(ws, tempQS, 'host', 'port', 'ssl')
						if (wsURL)
							tempQS.wsURL = wsURL
					}
					if (tempQS.ssl == null)
						delete tempQS.ssl
				}

				;{
					let { _: encVal } = tempQS
					let v = encVal ? Base64.decode(encVal) : null
					if (v) {
						try { v = JSON.parse(v) }
						catch (ex) { v = readQSDict(v) }
						if (v)
							extend(tempQS, v)
					}

					deleteKeys(tempQS, '#', '_', 'session', 'sessionID', 'user', 'pass', 'sql')
					extend(tempQS, { onayNo, inNewWindow: true })

					tempQS.loginTipi = Session.DefaultLoginTipi
					let { pass } = await Session.getSessionBasit({ user }) ?? {}
					if (pass) {
						if (pass.length != md5Length)
							pass = md5(pass)
						extend(tempQS, { user, pass })
					}

					let { wsSQL: sql } = app
					if (!empty(sql))
						tempQS.sql = toJSONStr(sql)
				}

				let _qs = {}
				;['dev', 'newWindow', 'inNewWindow'].forEach(k => {
					if (k in tempQS) {
						_qs[k] = tempQS[k]
						delete tempQS[k]
					}
				})
				if (!empty(tempQS))
					_qs._ = Base64.encode($.param(tempQS))

				deleteKeys(
					_qs, '#', 'session', 'sessionID', 'user', 'pass',
					'host', 'port', 'url', 'wsURL', 'sql'
				)

				let { session, class: { DefaultWSHostName_SkyServer: cloudHost } } = config
				let topic = [...app.ntfyTopic]
				let seqId, priority = 5
				let icon = `https://${cloudHost}:90/skyerp/images/sky_logo.png`

				;{
					if (user != buUser) {
						let i = topic.indexOf(buUser)
						if (i > -1)
							topic[i] = user
					}

					let tags = ['hourglass', '_new', user, onayNoStr]
					let title = 'VIO Onay İşlemleri'
					let message = 'Onay bekleyen yeni belgeler var'
					let actions = []

					if (_qs) {
						let { origin, pathname: path } = location
						origin = origin
							.replace('http://localhost:81', `https://${cloudHost}:90`)
							.replace('https://localhost:90', `https://${cloudHost}:90`)

						let url = `${origin}${path}?${$.param(_qs)}`
						actions.push({
							action: 'view',
							label: `Onay Portalını Aç (${onayNo})`,
							url
						})
					}

					seqId = newGUID()
					await ntfy({ topic, seqId, priority, tags, title, message, icon, actions })
				}
			}
			catch (ex) {
				errors.push(ex)
				console.error(ex)
			}
		}

		return errors
	}

	async belgeDetayiGosterIstendi({ sender: gridPart, recs: orjRecs }) {
		let e = { ...arguments[0] }
		let islemAdi = 'Belge Detayı Göster'

		orjRecs ??= gridPart?.selectedRecs
		if (empty(orjRecs)) {
			hConfirm('Bir satır seçilmelidir', islemAdi)
			return
		}

		let { progressManager: pm } = self
		let hasPM = !!pm
		if (!hasPM) {
			pm = showProgress('Belge Gösterimi hazırlanıyor...', islemAdi, true, () => e.aborted = true)
			pm.setProgressMax(orjRecs?.length * 4)
		}

		let { tip2Yapi } = this
		try {
			let mini = isMiniDevice()
			for (let rec of orjRecs) {
				let _e = {
					...e,
					rec,
					recs: [rec],
					temps: {},
					anlasmami: true
				}
				await this.izleIstendi(_e)
				pm?.progressStep()
			}

			if (!hasPM) {
				pm?.progressEnd()
				setTimeout(() => hideProgress(), 500)
			}
		}
		catch (ex) {
			hideProgress()
			throw ex
		}
	}

	async izleIstendi({ sender: gridPart, recs, rec, anlasmami, temps = {} }) {
		let orj_e = arguments[0]
		let e = { ...orj_e }
		let islemAdi = 'Belge İçerik Göster'

		recs ??= (rec ? [rec] : null) ?? gridPart.selectedRecs
		recs = recs.filter(r => r?.tip)

		let { progressManager: pm } = self
		let hasPM = !!pm
		if (hasPM)
			pm.setAbortBlock?.(() => orj_e.aborted = true)
		else {
			pm = showProgress('Belge İçeriği hazırlanıyor...', islemAdi, true, () => orj_e.aborted = true)
			pm.setProgressMax(recs.length * 3)
		}

		let mini = isMiniDevice()
		let errors = [], eDocs = [], eDocCount = 0

		try {
			let eConf, { tip2Yapi } = this
			for (let rec of recs) {
				let { tip } = rec

				if (tip == '_AlimAnlasma')
					tip = rec.tip = 'GeciciAlimEFat'

				let geciciEFatmi = tip == 'GeciciAlimEFat'
				if (!anlasmami && geciciEFatmi) {
					let { uuid, eIslTip } = rec
					if (!uuid)
						continue

					if (eConf === undefined)
						eConf = await MQEConf.getInstance() ?? null

					eIslTip ||= 'E'
					let gelenmi = tip == 'GeciciAlimEFat'
					let eIslAltBolum = eConf.getAnaBolumFor({ eIslTip })
						?.trimEnd()
						?.replaceAll('\\', '/')
					let subDirName = gelenmi ? 'ALINAN' : 'IMZALI'
					let relPath = [eIslAltBolum, subDirName].filter(_ => _).join('/')
					let xmlDosyaAdi = `${uuid}.xml`
					let remoteFile = [relPath, xmlDosyaAdi].filter(_ => _).join('/')

					if (orj_e.aborted)
						break

					if (self.XSLTProcessor === undefined) {
						if (!hasPM)
							showProgress('XSLT İşleyicisi modülü yükleniyor...')
						try { await loadLib_xslt() }
						catch (ex) { cerr(ex) }
						finally {
							if (!hasPM)
								hideProgress()
						}
						self.XSLTProcessor ??= null
					}

					let xsltProcessor
					try { xsltProcessor = new XSLTProcessor() }
					catch (ex) { cerr(ex) }

					try {
						if (orj_e.aborted)
							break

						let xmlData
						try {
							xmlData = await app.wsDownloadAsStream({
								remoteFile,
								localFile: xmlDosyaAdi
							})
						}
						catch (ex) { cerr(ex) }

						pm?.progressStep()
						if (!xmlData) {
							throw {
								isError: true,
								rc: 'noXML',
								errorText: [
									`<div style=""><b class=orangered>${relPath}</b> <span class=lightgray>içinde:</span></div>`,
									`<div style="padding-left: 30px"><b class=royalblue>${uuid}</b> UUID için e-İşlem Belge İçeriği (XML) bilgisi belirlenemedi</div>`,
									`</ul>`
								].filter(Boolean).join('\n')
							}
						}

						let xml = $.parseXML(xmlData)

						// UBL belgelerinde cac:/cbc: önekleri değişebilir; localName üzerinden oku.
						let elements = (elm, name) =>
							Array.from(elm.getElementsByTagNameNS('*', name))
						let first = (elm, name) => elements(elm, name)[0]
						let docRefs = elements(xml.documentElement, 'AdditionalDocumentReference')

						let xsltData
						;{
							let subName = 'EmbeddedDocumentBinaryObject'
							let xbinDocs = docRefs.filter(elm =>
								first(elm, subName) && (
									first(elm, subName)?.getAttribute('filename')?.toLowerCase()?.includes('.xslt') ||
									first(elm, 'DocumentType')?.innerHTML?.toUpperCase() == 'XSLT' ||
									first(elm, 'DocumentTypeCode')?.innerHTML?.toUpperCase() == 'XSLT' ||
									first(elm, 'ID')?.innerHTML?.toUpperCase() == 'XSLT'
								)
							)

							if (empty(xbinDocs))
								xbinDocs = docRefs.filter(elm => first(elm, subName))

							if (!empty(xbinDocs)) {
								xbinDocs = xbinDocs
									.map(x => first(x, subName))
									.filter(x =>
										x?.getAttribute('filename')?.toLowerCase()?.endsWith('.xslt') ||
										['application/xml', 'text/xml', 'application/xslt+xml']
											.includes(x?.getAttribute('mimeCode')?.toLowerCase())
									)
							}

							xsltData = (
								xbinDocs.find(elm =>
									elm.getAttribute('filename')?.toLowerCase()?.includes('.xslt')) ??
								xbinDocs?.at(-1)
							)?.textContent
						}

						if (!xsltData) {
							throw {
								isError: true,
								rc: 'noXSLT',
								errorText: 'XSLT (e-İşlem Görüntü) bilgisi belirlenemedi'
							}
						}

						if (Base64.isValid(xsltData))
							xsltData = Base64.decode(xsltData)

						if (orj_e.aborted)
							break

						let eDoc, source = xsltProcessor
						try {
							let xslt = $.parseXML(xsltData)
							xsltProcessor?.importStylesheet(xslt)
							eDoc = xsltProcessor?.transformToFragment(xml, document)
						}
						catch (ex) { cerr(ex) }

						if (orj_e.aborted)
							break

						if (!eDoc) {
							xsltProcessor = 'api'
							let xmlURL = remoteFile
							let html = await app.wsXSLTTransformAsStream({
								data: { xmlURL, xsltData }
							})
							if (html)
								eDoc = $(html)
						}

						if (!eDoc) {
							throw {
								isError: true,
								rc: 'xsltTransform',
								errorText: 'XSLT Görüntüsü oluşturulamadı',
								source
							}
						}

						let container = $(`<div/>`).append(eDoc)
						eDocCount++
						eDocs.push({ eDoc: container, rec })
						pm?.progressStep(2)
					}
					catch (ex) {
						pm?.progressStep(3)

						let errorText, { statusText } = ex
						let [code] = statusText?.split(delimWS) ?? []

						if (!statusText) {
							let isObj = isObject(ex)
							code = isObj ? ex.rc ?? ex.code : null
							errorText = ex.errorText ?? ex.toString()
						}

						code = code?.toLowerCase() ?? ''
						if (code == 'filenotfoundexception')
							errorText = `XML Dosyası bulunamadı: [<b class=firebrick>${remoteFile}</b>]`

						errors.push(errorText)
					}
				}
				else {
					let { tip, tipText, _db: db, sayac, fisNox, colDefs, source } = rec
					let headerHTML = this.class.getHTML({ rec })

					colDefs ??= e.colDefs
					source ??= e.source

					let _e = { ...e, rec, tip, sayac }
					deleteKeys(_e, 'colDefs', 'source')

					let getSource = async () => {
						let _recs = isFunction(source) ?
							await source?.call(this, _e) :
							source

						if (_recs === undefined) {
							let { table: orjTable, harTable: harTables } = tip2Yapi[tip] ?? {}
							if (!(orjTable && sayac))
								return null

							if (isString(harTables))
								harTables = harTables ? harTables.split(delimWS) : null

							if (empty(harTables))
								return null

							let table = `${db}..${orjTable}`
							let getStm = {
								efat() {
									let harTable = `${db}..${harTables[0]}`
									let sent = new MQSent(), { where: wh, sahalar } = sent

									sent
										.fisHareket(table, harTable, true)
										.innerJoin('har', `${db}..stkmst stk`, 'har.stokkod = stk.kod')
										.innerJoin('har', `${db}..hizmst hiz`, 'har.hizmetkod = hiz.kod')

									if (anlasmami) {
										sent
											.leftJoin(
												'har', `${db}..alimanlasma anl`, [
													`fis.mustkod <> ''`,
													`fis.mustkod = anl.must`,
													`anl.almsat = 'A'`,
													`anl.devredisi = ''`,
													`fis.tarih >= anl.tarihb`,
													`fis.tarih <= anl.tarihs`,
													`( (har.shtip = '' AND anl.ayrimkod = '') OR (har.shtip = 'H' AND anl.ayrimkod = 'HZ'))`
												]
											)
											.leftJoin(
												'anl', `${db}..anlastarife adet`, [
													`anl.kaysayac = adet.anlassayac`,
													`(
														(anl.ayrimkod = '' AND har.stokkod = adet.stokkod) OR
														(anl.ayrimkod = 'HZ' and har.hizmetkod = adet.fasonhizmetkod)
													)`
												]
											)
									}

									wh.degerAta(sayac, 'fis.kaysayac')
									sahalar.add(
										'har.kaysayac sayac',
										'har.seq',
										`(case har.shtip when 'H' then har.hizmetkod when 'D' then har.demkod else har.stokkod end) shKod`,
										`dbo.emptycoalesce(
											(case har.shtip when 'H' then hiz.aciklama when 'D' then NULL else stk.aciklama end),
											har.efstokadi
										) shAdi`,
										'har.miktar',
										'stk.brm',
										'har.bedel',
										'fis.dvkod dvKod',
										`har.fiyat`,
										'har.iskorantext iskOranText'
									)

									if (anlasmami) {
										sahalar.add(
											'har.alimanlasmadurumu anlDurum',
											'adet.ozelfiyat ozelFiyat',
											'adet.iskorantext anlOranText'
										)
									}

									return new MQStm({ sent, orderBy: ['seq'] })
								},

								diger() {
									let uni = new MQUnionAll()
									for (let orjHarTable of harTables) {
										let hizmetmi = orjHarTable.endsWith('hizmet')
										let mstAlias = hizmetmi ? 'hiz' : 'stk'
										let harTable = `${db}..${orjHarTable}`

										let sent = new MQSent(), { where: wh, sahalar } = sent
										sent.fisHareket(table, harTable, true)

										if (hizmetmi) {
											sent.innerJoin(
												'har',
												`${db}..hizmst ${mstAlias}`,
												`har.hizmetkod = ${mstAlias}.kod`
											)
										}
										else {
											sent.innerJoin(
												'har',
												`${db}..stkmst ${mstAlias}`,
												`har.stokkod = ${mstAlias}.kod`
											)
										}

										wh.fisSilindiEkle()
										wh.degerAta(sayac, 'fis.kaysayac')
										sahalar.add(
											'har.kaysayac sayac',
											'har.seq',
											`${hizmetmi ? 'har.hizmetkod' : 'har.stokkod'} shKod`,
											`${hizmetmi ? `${mstAlias}.aciklama` : `${mstAlias}.aciklama`} shAdi`,
											'har.miktar',
											`${mstAlias}.brm`,
											'har.bedel',
											'fis.dvkod dvKod',
											`har.belgefiyat fiyat`,
											'har.iskorantext iskOranText'
										)

										uni.add(sent)
									}

									return new MQStm({ sent: uni, orderBy: ['seq'] })
								}
							}

							let stm = geciciEFatmi ? getStm.efat() : getStm.diger()
							_recs = stm ? await stm.execSelect() : null

							_recs?.forEach(r => {
								let { fiyat, miktar, brm, bedel, dvKod, iskOranText, anlDurum, ozelFiyat, anlOranText } = r
								r.brm ||= brm = 'AD'
								r.dvKod ||= dvKod = 'TL'
								;['Kod', 'Adi'].forEach(pf => {
									let kt = `sh${pf}`
									if (!r[kt])
										r[kt] = r[`stok${pf}`] || r[`hizmet${pf}`]
								})
								
								let { shKod, shAdi } = r
								r.shText = (
									`<div style="padding: 0 10px; line-height: 25px">
										<div class="bold float-left">${shAdi || ''}</div>
										<div class="gray float-right mt-2">${shKod || ''}</div>
									</div>`
								)
								r.miktarText = (
									`<div style="padding: 10px; line-height: 25px">
										<div class="bold float-left blue">${numberToString(miktar)}</div>
										<div class="gray float-right">${brm}</div>
									</div>`
								)
								r.iskOranText = (
									iskOranText
										? `<span class="firebrick">%${iskOranText}</span>`
										: ''
								)
								r.bedelStr ||= (
									`<div style="padding: 10px; line-height: 25px">
										<div class="float-left fs-90 royalblue">
											<span class="lightgray">FY: </span>
											<span>${fiyatToString(fiyat)}</span>
										</div>
										<div class="float-right mt-1 fs-100 bold forestgreen">
											<span class="lightgray"> </span>
											<span>${bedelToString(bedel)} ${dvKod}</span>
										</div>
									</div>`
								)

								r.anlKosulStr = (
									anlDurum ? (
										`<div class="fs-110 mt-1 bold center forestgreen" style="padding: 5px; box-shadow: 0 0 2px 1px forestgreen">
											Uygun
										</div>`
									) :
									ozelFiyat ? [
										`<div>`,
											`<div class="float-left fs-90 bold royalblue">
												<span class="lightgray"> </span>
												<span>${fiyatToString(ozelFiyat)} ${dvKod}</span>
											</div>`,
											(anlOranText ?
												`<div class="float-right mt-1 fs-85 orangered">
													<span class="lightgray">İS: </span>
													<span>%${anlOranText}</span>
												</div>` : null),
										`</div>`
									].filter(Boolean).join(' ') : ''
								)
								r.anlUygun = anlDurum
							})
						}

						return _recs
					}

					pm?.progressStep()
					if (orj_e.aborted)
						break

					let _colDefs = isFunction(colDefs) ?
						await colDefs.call?.(this, _e) :
						colDefs

					if (!_colDefs) {
						let cellClassName = (colDef, rowIndex, belirtec, value, r) => {
							let result = [belirtec]
							let { _css } = r ?? {}
							if (_css)
								result.push(...makeArray(_css))
							return result
						}

						_colDefs = [
							gridKolon('shText', 'Ürün/Hiz. Adı'),
							gridKolon('anlUygun', 'Anl?', 5).tipBool(),
							gridKolon('miktarText', 'Miktar', 8),
							gridKolon('iskOranText', 'İskonto', 5),
							gridKolon('bedelStr', 'Bedel', 19),
							gridKolon('anlKosulStr', 'Anl. Koşul', 15)
						]

						;_colDefs.forEach(cd => {
							let { cellClassName: handler } = cd
							cd.cellClassName = (...rest) => {
								let result = cellClassName(...rest)
								result.push(...makeArray(handler?.call(this, ...rest)))
								return result.join(' ')
							}
						})
					}

					tipText ||= 'Belge'
					if (orj_e.aborted)
						break

					let gridPart
					let rfb = new RootFormBuilder()
						.addCSS('MQOnayci part')
						.addStyle_fullWH()
						.addStyle(`$elementCSS { --header-height: 80px }`)
						.asWindow(`${tipText} İzle: [<span class=orangered>${fisNox}</span>]`)

					;{
						rfb.addIslemTuslari('islemTuslari')
							.setEkSagButonlar('onay', 'red', 'tazele', 'vazgec')
							.setButonlarIlk([
								{
									id: 'onay',
									text: ' ✅ ',
									toolTip: 'Onay',
									handler: _e => this.onayRedIstendi({
										..._e,
										sender: this.gridPart,
										recs: [rec],
										state: true
									})
								},
								{
									id: 'red',
									text: ' 🚫 ',
									toolTip: 'RED',
									handler: _e => this.onayRedIstendi({
										..._e,
										sender: this.gridPart,
										recs: [rec],
										state: false
									})
								},
								{
									id: 'tazele',
									toolTip: 'Tazele',
									handler: _e => gridPart.tazele()
								},
								{
									id: 'vazgec',
									toolTip: 'Vazgeç',
									handler: ({ builder: { rootPart } }) => rootPart.close()
								}
							])
							.addCSS('islemTuslari absolute')
							.addStyle_wh(4000, 'var(--header-height)')
							.addStyle(
								`$elementCSS { right: 5px }
								 $elementCSS > div .sol { display: none !important; z-index: -1 !important }
								 $elementCSS > div .sag { --width-sag: 380px !important; background: transparent !important; z-index: 1001 !important }`
							)
					}

					;{
						rfb.addForm('header')
							.setLayout(({ builder: { parent } }) => $(
								`<div>` + headerHTML + `</div>`
							))
							.addCSS('relative fs-95 bold')
							.addStyle(
								`$elementCSS {
									width: calc(var(--full) - 330px) !important;
									height: var(--header-height) !important;
									margin: 0 !important;
									overflow-y: auto !important;
									z-index: 1002 !important
								}`
							)
					}

					;{
						rfb.addGridliGosterici('grid')
							.addCSS('dock-bottom')
							.addStyle_fullWH(null, 'calc(var(--full) - 90px)')
							.addStyle(`$elementCSS [role = columnheader] { }`)
							.widgetArgsDuzenleIslemi(({ args }) =>
								extend(args, {
									columnsMenu: false, adaptive: false,
									groupable: false, filterable: false,
									showGroupsHeader: false, showStatusBar: false,
									rowsHeight: 60, columnsHeight: 0,
									selectionMode: 'none',
									enableHover: true, enableTooltips: false
								})
							)
							.rowNumberOlmasin()
							.setTabloKolonlari(_colDefs)
							.setSource(_e => getSource({ ...e, ..._e }))
							.onAfterRun(({ builder: { part, rootPart } }) =>
								gridPart = rootPart.gridPart = part)
							.veriYukleninceIslemi(({ recs }) => {
								let { gridWidget: w } = gridPart
								let anlasmami = temps?.belgeAnlasma == 'A'
								;['miktar'].forEach(k =>
									w[anlasmami ? 'hidecolumn' : 'showcolumn'](k))
							})
					}

					if (orj_e.aborted)
						break

					rfb.run()
					pm?.progressStep()
				}
			}

			if (!orj_e.aborted && eDocCount) {
				for (let { eDoc, rec } of eDocs) {
					let token = newGUID()
					this._previewTokens.add(token)

					;(this.class._previewCallbacks ??= new Map()).set(token, state =>
						this.onayRedIstendi({
							sender: this.gridPart,
							recs: [rec],
							state
						})
					)

					let html = `
						<html lang="tr">
						<head>
							<meta charset="utf-8" />
							<title>e-İşlem Çıktısı</title>
							<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=yes" />
							<style>
								.islemTuslari {
									display: flex; flex-direction: row;
									position: fixed; top: 30px; right: 200px;
									gap: 30px; z-index: 1001
								}
								.islemTuslari > button {
									font-size: 400% !important;
									width: 100px; height: 80px;
									border-radius: 20px;
									background-size: contain;
									background-position: center;
									background-repeat: no-repeat
								}
							</style>
						</head>
						<body>
							<div class="islemTuslari">
								<button id="onay" title="Onay"> ✅ </button>
								<button id="red" title="red"> 🚫 </button>
							</div>

							${eDoc[0].innerHTML}

							<script>
								let token = ${JSON.stringify(token)}
								let btns = Object.fromEntries(
									['onay', 'red']
										.map(k => [k, document.getElementById(k)])
								)

								function onayRed(state) {
									Object.values(btns).forEach(b =>
										b.setAttribute('disabled', ''))

									const wnd = opener
									wnd.setTimeout(() =>
										wnd.OnayciPart._previewCallbacks?.get(token)?.(state))
									close()
								}

								btns.onay.addEventListener('click', evt => onayRed(true))
								btns.red.addEventListener('click', evt => onayRed(false))
							</script>
						</body>
						</html>
					`

					let url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
					openNewWindow(url)
					setTimeout(() => URL.revokeObjectURL(url), 10_000)
				}
			}

			if (!orj_e.aborted && errors.length) {
				let errorText = `<ul>${errors.map(_ => `<li class="mt-1">${_}</li>`).join(CrLf)}</ul>`
				hConfirm(errorText, islemAdi)
				console.error(errorText)
			}

			if (!hasPM) {
				pm?.progressEnd()
				setTimeout(() => hideProgress(), 500)
			}
		}
		catch (ex) {
			hideProgress()
			throw ex
		}
	}

	async proformalariGosterIstendi({ sender: gridPart, recs: orjRecs }) {
		let e = { ...arguments[0] }
		let islemAdi = 'Proforma Göster'

		let { params: { alim, proforma } } = app
		let { gelenProformaIslemleri: proformaKullanilir } = alim.kullanim
		let { anaBolum: proformaAnaBolum } = proforma

		if (!proformaKullanilir) {
			hConfirm(
				`<b>Proforma</b> kullanımı <u>Alım Genel</u> parametrelerinden açılmalıdır`,
				islemAdi
			)
			return
		}
		if (!proformaAnaBolum) {
			hConfirm(
				`<u>Proforma</u> parametrelerindeki <b>Proforma Ana Bölüm</b> belirsizdir`,
				islemAdi
			)
			return
		}

		orjRecs ??= gridPart?.selectedRecs
		if (empty(orjRecs)) {
			hConfirm('Gösterilecek Proforma yok', islemAdi)
			return
		}

		let mustKodArr = keys(asSet(
			orjRecs.map(r => r.mustKod).filter(Boolean)
		))
		if (empty(mustKodArr)) {
			hConfirm('Gösterilecek Uygun Proforma yok', islemAdi)
			return
		}

		let { progressManager: pm } = self
		let hasPM = !!pm
		let { tip2Yapi } = this

		try {
			for (let rec of orjRecs) {
				MQProforma.listeEkraniAc({
					tekil: false,
					args: { parentRec: rec },
					veriYuklenince: ({ gridWidget: w }) => {
						let { proformaId: id } = rec
						if (id) {
							let { gridPart: p } = w
							let recs = p?.boundRecs ?? w.getboundrows()
							let i = recs.findIndex(r => r.id == id) ?? -1
							if (i > -1) {
								w.selectrow(i)
								w.ensurerowvisible(i)
							}
						}
					},
					secince: async ({ recs }) => {
						let islemAdi = 'Proforma'
						let pr = this.recs.find(r =>
							this.recordKey(r) == this.recordKey(rec)) ?? rec
						let { onayDurum } = pr
						let { dev } = config

						if (!dev && onayDurum) {
							let onayRedText = onayDurum == 'R' ?
								`<span class="bold firebrick">RED</span>` :
								`<span class="bold forestgreen">ONAY</span>`

							hConfirm(
								`Bu belgeye ${onayRedText} cevabı verilmiş ve işlem yapılamaz`,
								islemAdi
							)
							return false
						}

						let { id2RecData } = this
						if (this.isDestroyed || this._taskBusy)
							return false

						let rd = id2RecData[this.documentKey(rec)] ??= {}
						if (empty(recs)) {
							if (
								!await ehConfirm('Belgede Proforma ataması olmayacak, emin misiniz?', islemAdi) ||
								this.isDestroyed ||
								this._taskBusy
							)
								return false

							pr.proformaId = rd.proformaId = null
							delay(10).then(() => this.tazele())
							return true
						}

						if (recs.length != 1) {
							hConfirm('Belgeye Atanacak sadece 1 satır seçilebilir', islemAdi)
							return false
						}

						pr.proformaId = rd.proformaId = recs[0].id
						delay(10).then(() => this.tazele())
						return true
					}
				})

				await delay(10)
				pm?.progressStep()
			}

			if (!hasPM) {
				pm?.progressEnd()
				setTimeout(() => hideProgress(), 500)
			}
		}
		catch (ex) {
			hideProgress()
			throw ex
		}
	}

	getOnayMax(...recs) {
		return Math.max(0, ...recs.flatMap(r =>
			(app.tip2Kurallar?.[r.tip ?? r._tip] ?? [])
				.filter(k => k.firmaAdi == String(r._db ?? r.db ?? '').slice(4))
				.map(k => Number(k.onayNo) || 1)
		))
	}

	startServiceProc() {
		this.stopServiceProc()
		if (this.isDestroyed || !this.serviceProc_delaySecs)
			return

		this._timer_serviceProc = setTimeout(async () => {
			try { await this.serviceProc() }
			catch (ex) { console.error(ex) }
			finally { this.startServiceProc() }
		}, this.serviceProc_delaySecs * 1_000)
	}

	stopServiceProc() {
		clearTimeout(this._timer_serviceProc)
		this._timer_serviceProc = null
	}

	async serviceProc() {
		await app._promise_ilkBilgiler
		if (this.isDestroyed || this._taskBusy)
			return false

		let recs = await this.loadServerData()
		let prev = this._servicePrevRecs
		if (this.isDestroyed)
			return false

		this._servicePrevRecs = recs
		if (prev && recs.length > prev.length)
			await ntfy({ topic: app.ntfyTopic, priority: 1, tags: ['_new'] })

		return true
	}

	async registerNTFY() {
		if (this.isDestroyed || this.ws_ntfy || this._ntfyConnecting)
			return

		this._ntfyConnecting = true
		try {
			await app._promise_ilkBilgiler
			if (!app.portalMustKod)
				await app.wsGetMustKod()

			if (this.isDestroyed || !app.portalMustKod || this.ws_ntfy)
				return

			let topic = makeArray(app.ntfyTopic).filter(Boolean).join('-')
			let url = [app.ntfyWSUrl.replace(/\/$/, ''), topic, 'sse'].join('/')
			let ws = this.ws_ntfy = new EventSource(url)

			ws.onmessage = ({ data }) => {
				if (this.isDestroyed || ws != this.ws_ntfy)
					return

				try {
					let { tags = [], message: msg } = JSON.parse(data || '{}')
					if (!tags.includes('_new'))
						return

					this.tazele()
					if (msg != null && msg != 'triggered') {
						let title = this.class.title
						let body = msg == '.' ? 'Onay bekleyen yeni belgeler var' : msg
						notify({ title, body })

						if (!isTouchDevice() && window.Notification?.permission == 'granted')
							new Notification(title, { body })
					}
				}
				catch (ex) { console.error(ex) }
			}

			// EventSource geçici hatalarda kendi bağlantısını yeniden kurar.
			ws.onerror = () => {
				if (
					this.isDestroyed ||
					ws != this.ws_ntfy ||
					ws.readyState != EventSource.CLOSED
				)
					return

				this.unregisterNTFY()
				this._timer_ntfy = setTimeout(() => this.registerNTFY(), 2_000)
			}
		}
		catch (ex) { console.error(ex) }
		finally { this._ntfyConnecting = false }
	}

	unregisterNTFY() {
		clearTimeout(this._timer_ntfy)
		let ws = this.ws_ntfy
		this.ws_ntfy = null

		if (ws) {
			ws.onmessage = ws.onopen = ws.onerror = null
			ws.close()
		}
	}

	otoTazele_startTimer() {
		this.otoTazele_stopTimer()
		let { otoTazeleSecs } = this
		if (this.isDestroyed || this.otoTazeleDisabled || !otoTazeleSecs)
			return

		this._timer_otoTazele = setTimeout(() => {
			try {
				if (!this._taskBusy && !this._gridLoading)
					this.tazele()
			}
			finally { this.otoTazele_startTimer() }
		}, otoTazeleSecs * 1_000)
	}

	otoTazele_stopTimer() {
		clearTimeout(this._timer_otoTazele)
		this._timer_otoTazele = null
	}
}
