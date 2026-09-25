class HatirlaticiPart extends SimplePart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'hatirlatici' }
	static get title() { return 'Hatırlatıcı' }
	static get islemTuslariVarmi() { return false }
	static get kodListeTipi() { return 'HATIRLATICI' }
	static get sinifAdi() { return this.title }
	static get table() { return 'hbelgehatirlatici' }
	static get tableAlias() { return 'htr' }
	static listeEkraniAc(e = {}) { return this.run(e) }
	get table() { return this.class.table }
	get isDestroyed() { return !!this._destroyed || !!this.part?.isDestroyed }
	get rowsHeight() {
		let { layout } = this.rfb ?? {}
		let width = layout?.width?.() || window.innerWidth || 1200
		return (
			width < 680 ? 298 :
			width < 1050 ? 210 :
			166
		)
	}
	get selectedRecs() {
		let { gridPart: p } = this
		return p?.selectedRecs?.filter(Boolean) ?? []
		//let w = this.gridPart?.gridWidget
		//return (w?.getselectedrowindexes() ?? []).map(i => w.getrowdata(i)).filter(Boolean)
	}

	constructor(e = {}) {
		super(e)
		let secs = Number(e.otoTazeleSecs ?? qs.otoTazele ?? qs.otoTazeleSecs)
		extend(this, {
			hepsiniGoster: e.hepsiniGoster ?? false, durum: 'tumu', arama: '', recs: [],
			otoTazeleDisabled: !!qs.otoTazeleYok,
			otoTazeleSecs: Number.isFinite(secs) && secs > 0 ? secs : null,
			serviceProc_delaySecs: Math.max(Number(qs.serviceProc_delaySecs) || 10, 2)
		})
	}
	rfbDuzenle() {
		super.rfbDuzenle(...arguments)
		let { rfb, content, rowsHeight, class: { partName } } = this
		
		rfb.setId(partName)
			.addStyle_fullWH()
			.addStyle(this.getStyle())
			
			.addCSS('hatirlatici-root')
		content.setLayout($('<div/>'))
			.addCSS('hat-shell')
			.addStyle_fullWH()
		
		let header = content.addForm('header').addCSS('hat-header')
			.setLayout($(
				`<div>
					<div class="hat-heading">
						<div>
							<span class="hat-eyebrow">İŞ TAKİBİ</span>
							<h2>Hatırlatıcılar</h2>
						</div>
						<div class="hat-toolbar">
							<button type="button" data-action="assign">${this.icon('plus')} Görevi Al</button>
							<button type="button" data-action="release">${this.icon('release')} Bırak</button>
							<button type="button" data-action="done" class="hat-primary">${this.icon('check')} Tamamla</button>
							<button type="button" data-action="refresh" title="Yenile" aria-label="Yenile">${this.icon('refresh')}</button>
						</div>
					</div>
					<div class="hat-controls">
						<div class="hat-tabs" role="group" aria-label="Durum filtresi">${[
							['tumu', 'Tümü'],
							['gecikmis', '<span class=firebrick>Gecikmiş</span>'],
							['yaklasiyor', '<span class=orangered>Yaklaşıyor</span>'],
							['normal', '<span class=forestgreen>Normal</span>']
						].map(([id, text]) =>
							`<button type="button" data-filter="${id}" aria-pressed="${id == 'tumu'}">
								${text}
								<span data-count="${id}">0</span>
							</button>`).join('')}</div>
						<label class="hat-closed"><input type="checkbox" data-field="hepsiniGoster"> Kapananlar dahil</label>
						<input class="hat-search" type="search" placeholder="Hatırlatıcı ara…" aria-label="Hatırlatıcı ara">
					</div>
					<div class="hat-summary" aria-live="polite">Yükleniyor…</div>
				</div>`
			))
			.onAfterRun(({ builder: { layout } }) => {
				this.header = layout
				layout.find('input[data-field="hepsiniGoster"]')
					.prop('checked', this.hepsiniGoster)
				layout.on('click.hatirlatici', 'button[data-action]', evt => {
					let action = evt.currentTarget.dataset.action
					if (action == 'refresh') this.tazele()
					else this.setTaskState({ state: action })
				})
				layout.on('click.hatirlatici', 'button[data-filter]', evt => {
					this.durum = evt.currentTarget.dataset.filter
					this.tazele({ local: true })
				})
				layout.on('change.hatirlatici', 'input[data-field="hepsiniGoster"]', evt => {
					this.hepsiniGoster = evt.currentTarget.checked
					this.tazele()
				})
				layout.on('input.hatirlatici', '.hat-search', evt => {
					this.arama = evt.currentTarget.value
					clearTimeout(this._timer_arama)
					this._timer_arama = setTimeout(() => this.tazele({ local: true }), 180)
				})
			})
		this.fbd_grid = content.addGridliGosterici('grid')
			.rowNumberOlmasin().noAnimate().noEmptyRow()
			.setTabloKolonlari([
				gridKolon('_text', 'Hatırlatıcılar')
					.setCellClassName('hat-card-cell')
					.noSql()
			])
			.setSource(() => this.loadGridData())
			.widgetArgsDuzenleIslemi(({ args }) => {
				extend(args, {
					showGroupsHeader: false, groupable: false,
					columnsMenu: false, showStatusBar: false,
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
				part.grid.on('rowselect.hatirlatici rowunselect.hatirlatici', () => this.headerGuncelle())
				part.grid.on('click.hatirlatici', '.hat-card button[data-action]', evt => {
					evt.preventDefault(); evt.stopPropagation()
					let target = evt.currentTarget
					let id = $(target).closest('.hat-card').attr('data-id')
					let rec = this.recs.find(r => String(r.id) == id)
					if (rec) this.setTaskState({ state: target.dataset.action, recs: [rec] })
				})
			})
			.addCSS('hat-grid')
	}
	afterRun() {
		super.afterRun(...arguments)
		let { part, rfb, gridPart } = this
		let { gridWidget: w } = gridPart ?? {}
		
		part.kapaninca(() =>
			this.destroyPart())
		
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
		if (this._destroyed) return
		this._destroyed = true
		for (let key of ['arama', 'ntfy', 'fullscreen', 'serviceProc', 'otoTazele', 'pending'])
			clearTimeout(this[`_timer_${key}`])
		this._resizeObserver?.disconnect()
		this.header?.off('.hatirlatici')
		this.gridPart?.grid?.off('.hatirlatici')
		this.unregisterNTFY()
	}
	tazele({ local = false } = {}) {
		if (this.isDestroyed) return
		if (this._gridLoading || this._taskBusy) {
			this._refreshPending = true
			return
		}
		this._localRefresh = local
		this.gridPart?.gridWidget?.clearselection()
		this.gridPart?.tazele()
	}
	async loadGridData() {
		if (this.isDestroyed) return []
		this._gridLoading = true
		this.headerGuncelle()
		try {
			if (!this._localRefresh || !this._loaded) {
				let recs = await this.loadServerData()
				if (this.isDestroyed) return []
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
		let { durum, arama, recs } = this
		let { user2Adi } = app
		let filtreTokens = arama.trim().split(/\s+/).filter(Boolean)
		let culture = 'tr-TR'
	
		return recs.filter(r => {
			if (durum != 'tumu' && this.durumBelirle(r) != durum)
				return false
	
			if (!filtreTokens.length)
				return true
	
			let values = [
				r.tipAdi, r.referans, r.kayitTipi, r.kapanisNotu,
				...(r.users ?? []).map(u => user2Adi?.[u] || u),
				r.sonTarih, r.kapanmaTarihi, r.yenilenmeSuresi, r.kalanGun,
				r._statusText
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
		let { header, recs, _gridLoading, _taskBusy } = this
		if (!header?.length || this.isDestroyed)
			return
		
		let counts = { tumu: recs.length, gecikmis: 0, yaklasiyor: 0, normal: 0, kapandi: 0 }
		for (let rec of recs)
			counts[this.durumBelirle(rec)]++
		for (let [id, count] of entries(counts))
			header.find(`[data-count="${id}"]`).text(count)
		
		header.find('[data-filter]').each((i, elm) =>
			$(elm).attr('aria-pressed', elm.dataset.filter == this.durum))

		let { selectedRecs } = this
		let { length: selected } = selectedRecs, busy = _gridLoading || _taskBusy
		header.find('[data-action="assign"], [data-action="release"], [data-action="done"]').prop('disabled', busy || !selected)
		header.find('[data-action="refresh"]').prop('disabled', !!busy)
		header.find('.hat-summary').text(
			_taskBusy ? 'İşlem yapılıyor…' : _gridLoading ? 'Hatırlatıcılar yükleniyor…' :
			this._lastLoadError ? `Yüklenemedi: ${this._lastLoadError}` :
			`${this.filteredRecs().length} hatırlatıcı${selected ? ` · ${selected} seçili` : ''}${counts.kapandi ? ` · ${counts.kapandi} kapanan` : ''}`
		)
	}
	durumBelirle({ kapandi, kalanGun }) {
		return (
			kapandi ? 'kapandi' :
			kalanGun == null ? 'normal' :
			kalanGun < 0 ? 'gecikmis' :
			kalanGun <= 7 ? 'yaklasiyor' : 'normal'
		)
	}
	escapeHTML(value) {
		return String(value ?? '').replace(
			/[&<>"']/g,
			c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
		)
	}
	icon(id) {
		let path = {
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
	getHTML({ rec }) {
		let esc = v => this.escapeHTML(v)
		let { id, kayitTipi, tipAdi, referans, kapandi, kalanGun, sonTarih, kapanmaTarihi, kapanisNotu, kesinUser } = rec
		let durum = this.durumBelirle(rec), { user: buUser } = config.session ?? {}
		let users = [...new Set([kesinUser, ...(rec.users ?? [])].filter(Boolean))]
		let dateText = (value, options) => {
			let dt = value instanceof Date ? value : new Date(value)
			return value && !isNaN(dt) ? dt.toLocaleDateString('tr-TR', options) : '—'
		}
		let sonText = dateText(sonTarih, { day: '2-digit', month: 'short', year: 'numeric' })
		let status = rec._statusText = (
			kapandi ? 'Tamamlandı' : kalanGun == null ? 'Tarih belirtilmemiş' :
			kalanGun < 0 ? `${Math.abs(kalanGun)} gün gecikti` :
			kalanGun == 0 ? 'Bugün son gün' : `${kalanGun} gün kaldı`
		)
		let note = kapandi ? `Kapanış: ${dateText(kapanmaTarihi)}` : sonTarih ? `${dateText(sonTarih)} son tarih` : 'Son tarih bekleniyor'
		let avatars = users.slice(0, 3).map(u => {
			let name = app.user2Adi?.[u] || u
			let letters = name.trim().split(/\s+/).slice(0, 2).map(s => Array.from(s)[0]).join('').toLocaleUpperCase('tr-TR')
			return `<span class="hat-avatar ${u == kesinUser ? 'hat-owner' : ''}" title="${esc(name)}${u == kesinUser ? ' · Görevi aldı' : ''}">${esc(letters)}</span>`
		}).join('')
		if (users.length > 3) avatars += `<span class="hat-avatar hat-extra" title="${esc(users.slice(3).map(u => app.user2Adi?.[u] || u).join(', '))}">+${users.length - 3}</span>`
		let button = (action, label, icon) => `<button type="button" data-action="${action}" title="${label}" aria-label="${label}">${this.icon(icon)}</button>`
		let available = !kapandi && (!kesinUser || kesinUser == buUser)
		return `<article class="hat-card hat-${durum}" data-id="${esc(id)}">
			<div class="hat-main"><span class="hat-type-icon">${this.icon(kayitTipi == 'ARC' ? 'car' : 'file')}</span>
				<div class="hat-description"><div class="hat-type">[${esc(kayitTipi || 'DİĞER')}] <span>Hatırlatıcı</span></div>
					<h3 title="${esc(tipAdi)}">${esc(tipAdi || 'Hatırlatıcı')}</h3>
					<div class="hat-reference ${kayitTipi == 'ARC' ? 'hat-plate' : ''}" title="${esc(referans)}">${esc(referans)}</div>
					${kapandi && kapanisNotu ? `<div class="hat-note" title="${esc(kapanisNotu)}">${esc(kapanisNotu)}</div>` : ''}
				</div>
			</div>
			<div class="hat-date">${this.icon('calendar')}<div><span>Son tarih</span><strong>${esc(sonText)}</strong><small>${esc(dateText(sonTarih, { weekday: 'long' }))}</small></div></div>
			<div class="hat-info"><div class="hat-status">${this.icon(kapandi ? 'check' : 'clock')}<div><strong>${esc(status)}</strong><small>${esc(note)}</small></div></div>
				<div class="hat-people"><span>${kesinUser ? 'Görev sahibi' : 'Sorumlular'}</span>${avatars}${available && !kesinUser ? button('assign', 'Görevi Al', 'plus') : ''}</div>
			</div>
			<div class="hat-actions">${available ? (kesinUser == buUser ? button('release', 'Görevi Bırak', 'release') : '') + button('done', 'Tamamla', 'check') : ''}</div>
		</article>`
	}
	getStyle() {
		return `$elementCSS { --hat-border: #dce5ef; color: #24334a; background: #f3f6fa; font-family: 'Segoe UI', Arial, sans-serif; overflow: hidden }
		$elementCSS .hat-shell { position: absolute; inset: 0; padding: 0 !important; display: flex !important; flex-direction: column; container-type: inline-size }
		$elementCSS .hat-header { flex: 0 0 auto; padding: 22px 26px 12px; box-sizing: border-box; width: 100% }
		$elementCSS .hat-heading, $elementCSS .hat-controls, $elementCSS .hat-toolbar, $elementCSS .hat-tabs { display: flex; align-items: center; gap: 10px }
		$elementCSS .hat-heading { justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap }
		$elementCSS .hat-eyebrow { color: #7b8ca4; font-size: 10px; font-weight: 700; letter-spacing: 2px }
		$elementCSS h2 { margin: 4px 0 0; font-size: 25px; font-weight: 650; color: #1e2b40 }
		$elementCSS button { cursor: pointer; font-family: inherit }
		$elementCSS button:disabled { opacity: .45; cursor: default }
		$elementCSS button:focus-visible, $elementCSS input:focus-visible { outline: 2px solid #2472d8; outline-offset: 2px }
		$elementCSS svg { width: 20px; height: 20px; flex: 0 0 auto; vertical-align: middle }
		$elementCSS .hat-toolbar button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 1px solid #d6dfeb; border-radius: 9px; background: white; padding: 9px 13px; color: #40536e; font-weight: 600; font-size: 13px }
		$elementCSS .hat-toolbar .hat-primary { background: #206bd0; border-color: #206bd0; color: white }
		$elementCSS .hat-controls { flex-wrap: wrap }
		$elementCSS .hat-tabs { gap: 4px; padding: 4px; border: 1px solid #dce5ef; border-radius: 10px; background: #eaf0f7 }
		$elementCSS .hat-tabs button { border: 0; border-radius: 7px; padding: 8px 11px; background: transparent; color: #5d6c80; font-size: 12px; font-weight: 600 }
		$elementCSS .hat-tabs button[aria-pressed=true] { background: white; color: #165daf; box-shadow: 0 1px 4px #22334a16 }
		$elementCSS [data-count] { margin-left: 5px; opacity: .75 }
		$elementCSS .hat-closed { display: flex; align-items: center; gap: 6px; color: #62738c; font-size: 12px; white-space: nowrap }
		$elementCSS .hat-search { margin-left: auto; min-width: 140px; width: 210px; border: 1px solid #dce5ef; border-radius: 9px; padding: 10px 12px; font: inherit; font-size: 12px; background: white }
		$elementCSS .hat-summary { margin-top: 12px; color: #76869a; font-size: 12px; min-height: 16px }
		$elementCSS .hat-grid { flex: 1 1 0; min-height: 0; width: calc(100% - 36px) !important; margin: 0 18px 18px; position: relative }
		$elementCSS .hat-grid > .grid { height: 100% !important; width: 100% !important; border: 0; background: transparent }
		$elementCSS .hat-grid .jqx-grid-content, $elementCSS .hat-grid .jqx-grid-cell { background: #f3f6fa; border-color: transparent !important }
		$elementCSS .hat-grid .jqx-grid-cell-selected { background: #e5eefc !important }
		$elementCSS .hat-grid .hat-card-cell > div { margin: 0 !important; padding: 0 !important; height: 100%; overflow: hidden }
		$elementCSS .hat-card { --hat-accent: #239e78; box-sizing: border-box; height: calc(100% - 12px); margin: 3px 10px 9px 4px; padding: 20px 20px 20px 18px; display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(170px, .8fr) minmax(260px, 1.15fr) 32px; align-items: center; gap: 18px; background: white; border: 1px solid var(--hat-border); border-left: 5px solid var(--hat-accent); border-radius: 11px; box-shadow: 0 3px 8px #20314f08; white-space: normal; font-family: 'Segoe UI', Arial, sans-serif }
		$elementCSS .hat-gecikmis { --hat-accent: #ed5265 }
		$elementCSS .hat-yaklasiyor { --hat-accent: #e9a23b }
		$elementCSS .hat-kapandi { --hat-accent: #9aa7b7 }
		$elementCSS .hat-main { display: flex; align-items: center; gap: 15px; min-width: 0 }
		$elementCSS .hat-type-icon { display: grid; place-items: center; flex: 0 0 54px; height: 54px; border-radius: 18px; color: #3678c9; background: #eaf3ff }
		$elementCSS .hat-type-icon svg { width: 27px; height: 27px }
		$elementCSS .hat-description { min-width: 0 }
		$elementCSS .hat-type { color: #1d72d1; font-weight: 700; font-size: 11px; margin-bottom: 7px }
		$elementCSS .hat-type span { color: #8a98aa; font-weight: 500; margin-left: 4px }
		$elementCSS h3 { color: #263348; font-size: 17px; font-weight: 650; margin: 0 0 7px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
		$elementCSS .hat-reference { font-size: 12px; line-height: 1.5; color: #63758f; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere }
		$elementCSS .hat-plate { display: inline-block; border: 1px solid #c9d7e8; border-left: 5px solid #206bd0; border-radius: 4px; padding: 2px 8px; font-weight: 650; letter-spacing: 1px }
		$elementCSS .hat-note { font-size: 11px; color: #8894a5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 4px }
		$elementCSS .hat-date { display: flex; align-items: center; gap: 12px; border-left: 1px solid #e5ebf3; padding-left: 20px; color: #71839c; min-height: 84px }
		$elementCSS .hat-date span, $elementCSS .hat-date small { display: block; font-size: 12px }
		$elementCSS .hat-date strong { display: block; color: #3d506d; font-size: 17px; margin: 6px 0 }
		$elementCSS .hat-info { border-left: 1px solid #e5ebf3; padding-left: 18px; min-width: 0 }
		$elementCSS .hat-status { display: flex; align-items: center; gap: 11px; padding: 12px; border-radius: 9px; background: #eaf7f1; color: #198162 }
		$elementCSS .hat-status strong { font-size: 14px; display: block }
		$elementCSS .hat-status small { font-size: 11px; display: block; opacity: .8; margin-top: 4px }
		$elementCSS .hat-gecikmis .hat-status { color: #c23349; background: #fff0f2 }
		$elementCSS .hat-yaklasiyor .hat-status { color: #a26b15; background: #fff6e7 }
		$elementCSS .hat-kapandi .hat-status { color: #69798f; background: #f0f3f7 }
		$elementCSS .hat-people { display: flex; gap: 5px; align-items: center; margin-top: 10px; min-height: 28px }
		$elementCSS .hat-people > span:first-child { color: #7c8aa0; font-size: 11px; margin-right: 5px }
		$elementCSS .hat-avatar { display: inline-flex; align-items: center; justify-content: center; width: 27px; height: 27px; border-radius: 50%; color: white; background: #3479c9; font-weight: 600; font-size: 10px; flex-shrink: 0 }
		$elementCSS .hat-owner { background: #253f65; box-shadow: 0 0 0 2px #c7d9f0 }
		$elementCSS .hat-extra { color: #5c7290; background: #eaf0f8 }
		$elementCSS .hat-people button, $elementCSS .hat-actions button { display: inline-grid; place-items: center; border: 0; background: #f0f4fa; color: #59718e; border-radius: 8px; width: 29px; height: 29px; padding: 5px }
		$elementCSS .hat-people button { border-radius: 50% }
		$elementCSS .hat-actions { display: flex; flex-direction: column; gap: 9px }
		$elementCSS .hat-actions button:hover, $elementCSS .hat-people button:hover { color: #1764bf; background: #dfedff }
		@container (max-width: 1049px) {
			$elementCSS .hat-card { grid-template-columns: minmax(0, 1fr) minmax(250px, .9fr) 30px; gap: 12px; padding: 16px }
			$elementCSS .hat-main { grid-column: 1; grid-row: 1 }
			$elementCSS .hat-date { grid-column: 1; grid-row: 2; min-height: 0; border: 0; padding-left: 69px }
			$elementCSS .hat-date svg, $elementCSS .hat-date small { display: none }
			$elementCSS .hat-date strong { display: inline; font-size: 14px; margin-left: 8px }
			$elementCSS .hat-date span { display: inline }
			$elementCSS .hat-info { grid-column: 2; grid-row: 1 / 3 }
			$elementCSS .hat-actions { grid-column: 3; grid-row: 1 / 3 }
		}
		@container (max-width: 679px) {
			$elementCSS .hat-header { padding: 15px 12px 10px }
			$elementCSS .hat-heading { gap: 12px; margin-bottom: 12px }
			$elementCSS .hat-toolbar { gap: 5px; flex-wrap: wrap }
			$elementCSS .hat-toolbar button { padding: 8px; font-size: 11px }
			$elementCSS .hat-search { margin-left: 0; flex: 1; width: 130px }
			$elementCSS .hat-tabs { gap: 0 }
			$elementCSS .hat-tabs button { padding: 8px; font-size: 11px }
			$elementCSS .hat-grid { width: calc(100% - 12px) !important; margin: 0 6px 8px }
			$elementCSS .hat-card { grid-template-columns: minmax(0, 1fr) 30px; grid-template-rows: auto auto auto; gap: 8px; padding: 14px 12px; margin-right: 5px }
			$elementCSS .hat-type-icon { flex-basis: 38px; height: 42px; border-radius: 12px }
			$elementCSS .hat-main { gap: 10px }
			$elementCSS h3 { font-size: 14px }
			$elementCSS .hat-date { padding-left: 48px }
			$elementCSS .hat-info { grid-column: 1 / 3; grid-row: 3; border: 0; padding: 0 }
			$elementCSS .hat-actions { grid-column: 2; grid-row: 1 / 3 }
			$elementCSS .hat-status { padding: 9px }
		}`
	}

	async loadServerData(e = {}) {
		const Delim = ';'
		let { user: buUser } = config.session
		let user2Adi = app.user2Adi ??= {}
		let recs = [], eksikUserSet = new Set()
		let { table, tableAlias: alias } = this.class
		let sent = new MQSent({ from: `${table} ${alias}` })
		let stm = new MQStm({ sent })
		this.loadServerData_queryDuzenle({ stm, sent })
		for (let source of await stm.execSelect()) {
			let r = { ...source }
			r.kapandi = r.kapandi === true || r.kapandi === 1 || r.kapandi === '1'
			r.kayitTipi = (r.kayitTipi ?? '').trim()
			r.kesinUser = (r.kesinUser ?? '').trim()
			let { usersStr, eMailsStr, kapandi, sonTarih } = r
			let users = r.users ??= (
				usersStr
					?.split(Delim)
					?.map(u => u.trim()).filter(Boolean)
					?? []
			)
			if (!buUser || !users.find(u => u == buUser))
				continue

			;users
				.filter(u => !user2Adi[u])
				.forEach(u => eksikUserSet.add(u))

			r.eMails ??= (
				eMailsStr
					?.split(Delim)
					?.filter(v => v && v.length >= 4 && v.includes('@'))
					?? []
			)
			r._durumText = kapandi
				? `<span class="orangered">Kapananlar</span>`
				: `<span class="forestgreen">Bekleyenler</span>`
			
			sonTarih = r.sonTarih = asDate(sonTarih)
			r.kapanmaTarihi = asDate(r.kapanmaTarihi)
			r.kalanGun ??= (
				sonTarih
					? ( sonTarih - today() ) / Date_OneDayNum
					: null
			)
			// Takvim günü farkı: yaz/kış saati geçişlerinde kesirli gün oluşmaz.
			if (sonTarih)
				r.kalanGun = this.gunFarki(sonTarih, today())
				
			recs.push(r)
		}

		if (!empty(eksikUserSet)) {
			await promiseAll(
				arrayFrom(eksikUserSet).map(user =>
					Session.getSessionBasit({ user }).then(s =>
						user2Adi[user] = s?.userDesc || user).catch(() => user2Adi[user] = user)
				)
			)
		}

		for (let rec of recs)
			rec._text = await this.getHTML({ rec })
		
		return recs
	}
	loadServerData_queryDuzenle({ stm, sent } = {}) {
		let { user } = config.session ?? {}
		let { hepsiniGoster } = this
		let { tableAlias: alias } = this.class

		sent.sahalarVeGroupByVeHavingReset()
		let { where: wh, sahalar } = sent, { orderBy } = stm
		sent
			.leftJoin(alias, 'htipbilgi tbil', ['htr.kayittipi = tbil.kayittipi', 'htr.xtipkod = tbil.xtipkod'])
			.leftJoin('tbil', 'htipbilgi tanabil', ['htr.kayittipi = tanabil.kayittipi', `tanabil.xtipkod = ''`])
		sahalar.add(`${alias}.bkapandi kapandi`)
		if (!hepsiniGoster)
			wh.add(`${alias}.bkapandi = 0`)
		if (user) {
			wh.add(new MQOrClause()
				.degerAta('', `${alias}.kesinkullanicikod`)
				.degerAta(user, `${alias}.kesinkullanicikod`)
			)
		}
		wh.add(`DATEDIFF(DAY, CAST(GETDATE() AS DATE), CAST(htr.sontarih as DATE)) <= htr.hatirlatmagunu`)
		sahalar
			.addWithAlias(alias,
				'id', 'xid orjBelgeId', 'kayittipi kayitTipi', 'sontarih sonTarih',
				'hatirlatmagunu hatirlatmaGunu', 'kesinkullanicikod kesinUser', 'referans',
				'xtipadi tipAdi', 'kapanisnotu kapanisNotu', 'kapanmatarihi kapanmaTarihi',
				'yenilenmesuresi yenilenmeSuresi', 'suretipi sureTipi'
			 )
			.add(
				'dbo.emptycoalesce(tbil.kullanicilistestr, tanabil.kullanicilistestr) usersStr',
				'dbo.emptycoalesce(tbil.emaillistestr, tanabil.emaillistestr) eMailsStr'
			)
		orderBy.liste = ['kapandi', 'sonTarih DESC', 'kayitTipi', 'tipAdi']
	}

	async _setTaskState({ state, recs: givenRecs } = {}) {
		let e = { ...arguments[0], sender: this }, gridPart = this
		let assign = state == 'assign'
		let release = state == 'release'
		let done = state == 'done'
	
		let islemAdi = `${
			assign ? 'Görev Ata' :
			release ? 'Görev Bırak' :
			done ? 'Görev Tamamlandı' :
			state
		} işlemi`
		let recs = givenRecs ?? this.selectedRecs
		let orjRecs = recs
		let { user2Adi = {}, frpPort } = app
		let topic = makeArray(app.ntfyTopic)
		let { dev, ws, session } = config
		let { DefaultWSHostName_SkyServer: defHost } = config.class
		let { url: wsURL, ssl, hostname: host, port } = ws
		let { loginTipi, user: buUser, pass: buPass } = session
		let buUserText = user2Adi[buUser] || buUser
		// let { location: loc } = window

		let kayitTipSet = asSet(recs.map(r => r.kayitTipi))
		if (len(kayitTipSet) > 1) {
			hConfirm(`<b class="red">Farklı Tipler</b> için <b class="royalblue">${islemAdi}</b> işlemi yapılamaz`, islemAdi)
			return false
		}
		
		if (!dev) {
			if (!empty(recs)) {
				let id2Rec = fromEntries(recs.map(r => [r.id, r]))
				let newRecs = await this.loadServerData(e)
				recs = newRecs.filter(r => id2Rec[r.id])
			}
			
			let kosul = (
				assign ? ( r => ( !r?.kapandi && r?.kesinUser != buUser ) ) :
				release ? ( r => ( !r?.kapandi && r?.kesinUser == buUser ) ) :
				done ? ( r => ( !r?.kapandi ) ) :
				null
			)
			recs = recs?.filter(kosul)
			if (empty(recs))
				orjRecs = orjRecs?.filter(kosul)
		}
	
		if (empty(recs)) {
			let degistimi = recs.length != orjRecs.length
			gridPart?.tazele(e)
			let errorText = [
				`${islemAdi} için uygun kayıt bulunamadı`,
				( degistimi ? `<b class="red">**</b> <span class="orangered">Seçilen kayıtlar başka bir kullanıcı tarafından işlem görmüş gibi gözüküyor</span>` : null )
			].filter(Boolean).map(_ => `<li>${_}</li>`).join('\n')
			hConfirm(`<ul>${errorText}</ul>`, islemAdi)
			return false
		}

		let { kayitTipi, sureTipi, yenilenmeSuresi } = recs[0]
		let inst = {}
		let yenilenirmi = false
		let kapanisNotu = ''
		if (done) {
			try {
				let min_v = today().yarin()
				yenilenirmi = !kayitTipi || kayitTipi == 'ARC'
				if (yenilenirmi) {
					if (recs.length > 1) {
						hConfirm(`Seçilen tipler için <b class="red">Birden fazla satıra</b> ait <b class="royalblue">${islemAdi}</b> işlemi yapılamaz`, islemAdi)
						return false
					}
					
					let sel = (
						sureTipi == 'G' ? 'addDays' :
						sureTipi == 'A' ? 'addMonths' :
						'addYears'
					)
					let dt = today()[sel](yenilenmeSuresi)
					if (isInvalidDate(dt) || dt < min_v)
						dt = min_v
					inst.yeniTarih = dt
				}
				
				let title = islemAdi
				let etiket = [
					( 
						yenilenirmi
							? `<p class="fs-90 orangered left pl-20">Asıl belgenin <b class="forestgreen">Yeni Bitişi</b> ayarlanacaktır:</p>`
							: `<p>Kapanış yapılacak</p>`
					)
				].filter(Boolean)
					.join('\n')

				let fbd_yeniTarih
				let duzenle = ({ args, wnd, rfb, fbd_value }) => {
					if (yenilenirmi) {
						fbd_yeniTarih = rfb.addDateInput('yeniTarih', 'Yenileme Tarihi')
							.etiketGosterim_placeHolder()
							.degisince(({ value: v, builder: fbd }) => {
								let { id } = fbd
								if (isInvalidDate(v) || v < min_v)
									v = fbd.value = inst[id] = min_v
							})
							//.onAfterRun(({ builder: { input } }) =>
							//	delay(100).then(() => input.focus()))
							.addCSS('absolute')
							.addStyle(
								`$elementCSS { left: 310px; top: -35px; z-index: 1000 !important }
								 $elementCSS > input { width: 150px !important; height: 40px !important; box-shadow: 0 0 3px 2px forestgreen }`
							)
					}
				}
				let validate = ({ fbd_value: { input }, inst: { yeniTarih: v }}) => {
					if (yenilenirmi && (isInvalidDate(v) || !v || v < min_v)) {
						hConfirm(`<b class="royalblue">Bitiş Tarihi</b> dolu ve bugünden büyük bir değer olmalıdır`, islemAdi)
						delay(200).then(() =>
							fbd_yeniTarih?.input?.focus())
						return false
					}
				}
				
				kapanisNotu = await jqxPrompt({
					title, etiket, inst,
					duzenle, validate,
					placeHolder: 'Kapanış notu (opsiyonel)',
					maxLength: 250
				})
				if (kapanisNotu == null)    // VAZGEÇ butonu
					return false
			}
			catch (ex) { throw ex }
		}

		const User_ALL = 'all'
		let yeniTarih = asDate(inst.yeniTarih)
		let idListe = recs.map(r => r.id)
		// let _now = now()
		let sqlNow = 'GETDATE()'
		let sqlToday = `CAST(${sqlNow} AS DATE)`
		try {
			if (this.isDestroyed || empty(idListe))
				return false
					
			// db update
			;{
				let { table } = this
				let toplu = new MQToplu().withTrn()
				;{
					let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
					upd.fromAdd(table)
					wh.inDizi(idListe, 'id')
					if (done) {
						set.add('bkapandi = 1', `kapanmatarihi = ${sqlNow}`)
						if (kapanisNotu)
							set.degerAta(kapanisNotu, 'kapanisnotu')
						if (yenilenirmi)
							set.degerAta(yeniTarih, 'sontarih')
					}
					else if (assign || release)
						set.degerAta(assign ? buUser : '', 'kesinkullanicikod')
					toplu.add(upd)
				}
				
				if (yenilenirmi) {
					let r = recs[0]                      // bu durumda sadece tek kayıt gelecek
					let { orjBelgeId, sonTarih } = r
					let ortakWh = { degerAta: orjBelgeId, saha: 'id' }
					switch (kayitTipi) {
						case '': {      // diger belgeler
							let table = 'hbelge'
							toplu.add(
								new MQIliskiliUpdate({
									table,
									where: ortakWh,
									set: [
										{ degerAta: yeniTarih, saha: 'bitistarihi' },
										`tarih = ${sqlToday}`,
										`sonyenilenmezamani = ${sqlNow}`
									]
								})
							)
							break
						}
						case 'ARC': {    // araç muayene
							let table = 'aracmuayene'
							toplu.add(
								new MQSelect2Insert({
									table,
									sahalar: [
										'arackod', 'evrakkod', 'sonmuayene',
										'id', 'tarih',
										'bittarih'
									],
									sent: new MQSent({
										table: `${table} mua`,
										where: [
											{ degerAta: orjBelgeId, saha: 'mua.id' },
											`kont.id IS NULL`
										],
										sahalar: [
											'mua.arackod', 'mua.evrakkod', bool2FileStr(true).sqlServerDegeri(),
											'NEWID()', sqlToday,
											`( CAST(${sqlToday} AS DATETIME) + ${(yeniTarih - sonTarih) / Date_OneDayNum} )`
										]
									}).leftJoin('mua', `${table} kont`, [
										`mua.arackod = kont.arackod`,
										`mua.evrakkod = kont.evrakkod`,
										`mua.tarih = kont.tarih`
									])
								}),
								new MQIliskiliUpdate({
									table,
									where: ortakWh,
									set: [`sonmuayene = ''`]
								})
							)
							break
						}
					}
				}

				if (empty(toplu.liste))
					return false

				let res = await toplu.execute()
				if (res === false)
					return false
				this._taskCommitted = true
			}

			for (let r of recs) {
				let { id, users, kesinUser, eMails, tipAdi, sonTarih, referans } = r
				;{
					let targetUsers = kesinUser ? [kesinUser] : users
					let sonTarihText = asDateAndToKisaString(sonTarih)
					let indicator = (
						assign ? '?' :
						release ? '?' :
						done ? '?' : null
					)
					let statusText = (
						assign ? 'Alındı' :
						release ? 'Bırakıldı' :
							done ? 'TAMAMLANDI' : null
					)
					let title = [indicator, 'Görev', statusText].filter(Boolean).join(' ')
					let message = [
						( sonTarihText ? `- **${sonTarihText}** bitişli` : null ),
						( tipAdi || referans ? `**${[tipAdi, referans].filter(Boolean).join(', ')}**` : null ),
						'görevi\n',
						`- **${buUserText}** tarafından ${assign ? 'alınmıştır' : release ? 'bırakılmıştır' : 'tamamlanmıştır'}`,
						'\n\n_'
					].filter(Boolean).join(' ')
	
					// ntfy
					{
						let priority = (
							assign ? 4 :
							3
						)
						let shortStatus = (
							assign ? 'alindi' :
							release ? 'birakildi':
							done ? 'tamamlandi' : null
						)
						if (shortStatus)
							shortStatus = `gorev-${shortStatus}`
						
						let topicPFList = [...targetUsers, User_ALL]
						for (let u of topicPFList) {
							let url = `${location.origin}${location.pathname}?`
							;{
								let pass = u == buUser ? buPass : null
								if (pass == null) {
									let { pass: _ } = u == User_ALL ? {} : await Session.getSessionBasit({ user: u }) ?? {}
									pass = _
								}
								
								let q = { ...qs }
								deleteKeys(q, 'url', 'wsURL', 'ssl', 'hostname', 'port', 'loginTipi', 'user', 'pass')
								if (wsURL || port || frpPort) {
									if (wsURL)
										q.url = wsURL
									else {
										q.ssl = ssl ?? true
										q.hostname = host ?? defHost
										q.port = port || frpPort
									}
								}
								if (u != User_ALL) {
									q.loginTipi = loginTipi || 'login'
									q.user = u
									if (pass)
										q.pass = pass
								}

								if (!empty(q))
									url += `_=${Base64.encode($.param(q), true)}`
							}
							
							let t = topic
							;{
								if (isString(t))
									t = t.split('-')
								t = t.map(v => v == buUser ? u : v)
							}
							
							;{
								let tags = [indicator, shortStatus, '_']
								let markdown = true
								let click = new URL(t.join('-'), app.ntfyWSUrl).toString()
								let actions = [
									{
										action: 'view', url,
										label: 'HATIRLATICILARI GÖSTER'
									}
								]
								await ntfy({ topic: t, priority, tags, markdown, title, message, click, actions }).catch(ex => {
									this._notificationErrors.push(getErrorText(ex))
								})
							}
							
							await delay(50)
						}
					}
					
					// email
					if (!empty(eMails)) {
						let to = eMails[0]
						let cc = eMails.slice(1).join(delimWS)
						let subject = `Sky Hatırlatıcı: ${title}`
						let body = message
						await app.wsEMailQueue_add({ to, cc, subject, body }).catch(ex => {
							this._notificationErrors.push(getErrorText(ex))
						})
					}
				}
			}

			gridPart?.tazele()
		}
		catch (ex) {
			hideProgress()
			// hConfirm(getErrorText(ex), islemAdi)
			throw ex
		}
		
		return true
	}
	gunFarki(son, ilk) {
		let gun = d => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
		return Math.round((gun(son) - gun(ilk)) / 86_400_000)
	}
	async setTaskState(e = {}) {
		if (this.isDestroyed || this._taskBusy || this._gridLoading) return false
		if (!['assign', 'release', 'done'].includes(e.state)) return false
		this._taskBusy = true
		this._taskCommitted = false
		this._notificationErrors = []
		this.headerGuncelle()
		try {
			let result = await this._setTaskState(e)
			if (this._notificationErrors.length)
				hConfirm('Görev kaydedildi; bazı bildirimler gönderilemedi. İşlemi yeniden uygulamanız gerekmiyor.', this.title)
			return result
		}
		catch (ex) {
			hConfirm(this._taskCommitted
				? 'Görev kaydedildi; bildirim tamamlanamadı. İşlemi yeniden uygulamanız gerekmiyor.'
				: this.escapeHTML(getErrorText(ex)), this.title)
			return this._taskCommitted
		}
		finally {
			this._taskBusy = false
			this._refreshPending = false
			this.tazele()
			this.headerGuncelle()
		}
	}
	startServiceProc() {
		this.stopServiceProc()
		if (this.isDestroyed || !this.serviceProc_delaySecs) return
		this._timer_serviceProc = setTimeout(async () => {
			try { await this.serviceProc() }
			catch (ex) { console.error(ex) }
			finally { this.startServiceProc() }
		}, this.serviceProc_delaySecs * 1_000)
	}
	stopServiceProc() { clearTimeout(this._timer_serviceProc); this._timer_serviceProc = null }
	async serviceProc() {
		await app._promise_ilkBilgiler
		if (this.isDestroyed || this._taskBusy) return false
		let recs = await this.loadServerData(), prev = this._servicePrevRecs
		if (this.isDestroyed) return false
		this._servicePrevRecs = recs
		if (prev && recs.length > prev.length)
			await ntfy({ topic: app.ntfyTopic, priority: 1, tags: ['_'] })
		return true
	}
	async registerNTFY() {
		if (this.isDestroyed || this.ws_ntfy || this._ntfyConnecting) return
		this._ntfyConnecting = true
		try {
			await app._promise_ilkBilgiler
			if (this.isDestroyed || !app.portalMustKod || this.ws_ntfy) return
			let topic = makeArray(app.ntfyTopic).filter(Boolean).join('-')
			let url = [app.ntfyWSUrl.replace(/\/$/, ''), topic, 'sse'].join('/')
			let ws = this.ws_ntfy = new EventSource(url)
			ws.onmessage = ({ data }) => {
				if (this.isDestroyed || ws != this.ws_ntfy) return
				try {
					let { tags = [], message: msg } = JSON.parse(data || '{}')
					if (!tags.includes('_')) return
					this.tazele()
					if (msg != null && msg != 'triggered') {
						let title = this.class.title, body = msg == '.' ? '' : msg
						notify({ title, body })
						if (!isTouchDevice() && window.Notification?.permission == 'granted')
							new Notification(title, { body })
					}
				}
				catch (ex) { console.error(ex) }
			}
			// EventSource geçici hatalarda kendi bağlantısını yeniden kurar.
			ws.onerror = () => {
				if (this.isDestroyed || ws != this.ws_ntfy || ws.readyState != EventSource.CLOSED) return
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
		if (this.isDestroyed || this.otoTazeleDisabled || !otoTazeleSecs) return
		this._timer_otoTazele = setTimeout(() => {
			try { if (!this._taskBusy && !this._gridLoading) this.tazele() }
			finally { this.otoTazele_startTimer() }
		}, otoTazeleSecs * 1_000)
	}
	otoTazele_stopTimer() { clearTimeout(this._timer_otoTazele); this._timer_otoTazele = null }
}
