/*
 * Geçici API sözleşmesi — servis kesinleşince yalnızca wsSMSOnay* / bilgiRecAl
 * metotlarını ve gerekirse belgeDurumu / onayBasarilimi eşlemesini uyarlayın.
 *
 * POST onayBilgi?id={SMS belgesinin DB kimliği}&tip={qs.tip}
 *   Doğrudan rec veya { rec }:
 *   { id?, tipAdi?, adSoyad? (veya unvan), tarih?, seri?, no?,
 *     sonucBedel? (veya bedel), paraBirimi?: 'TRY', telefonMasked?,
 *     kodUzunlugu?: 6, state?: 'bekliyor'|'onaylandi'|'suresiDoldu'|'iptal',
 *     remainingSecs?: 300, validUntil?: ISO-8601, serverTS?: ISO-8601 }
 *   Süre için remainingSecs veya saat dilimi içeren validUntil tercih edilir.
 *   İkisi de yoksa ilk açılıştan itibaren 5 dakika; aynı sekmede yenileme sıfırlamaz.
 *
 * POST onayla?id=...&tip=...   JSON: { onayKodu: '012345', reqId: '...' }
 *   - Başarı: true veya { success: true } / { onaylandi: true } / { state: 'onaylandi' }.
 *   - Hata: { isError: true, errorText: '...' }.
 *   Boş/belirsiz yanıt ve ağ hatası başarı sayılmaz, state yeniden sorgulanır.
 *   Backend reqId için idempotent olmalı
 *   Süre/kod/erişim kontrolü sunucudadır.
 *   Onay kodu onayBilgi yanıtında veya URL içinde gönderilmemelidir.
 *
 * SMS'in normal linkinde JavaScript/copy çalışmaz. Web üzerindeki linkin click
 * handler'ında SMSOnayPart.onayEkraniAc({ url, onayKodu }) kullanılabilir;
 * kopyalama başarısız olsa da link açılır. Otomatik onay veya otomatik gönderim yok.
 */

class SMSOnayPart extends SimplePart {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'MAIN' }
	static get sinifAdi() { return 'SMS Onay' }
	static get partName() { return 'smsOnay' }
	static get title() { return this.sinifAdi }
	static get islemTuslariVarmi() { return false }

	constructor(e = {}) {
		super(e)
		this.id = qs.id ?? e.id ?? null    // String olarak kalır: GUID / bigint hassasiyeti korunur.
		this.tip = qs.tip ?? e.tip ?? null
		this.state = 'loading'
		this.kodUzunlugu = 6
		this.rec = null
	}
	rfbDuzenle(e) {
		super.rfbDuzenle(e)
		this.rfb
			.setId(this.class.partName)
			.addStyle_fullWH()
		this.content
			.setLayout($(this.getLayout()))
			.addCSS('sms-onay-shell')
			.addStyle(this.getStyle())
	}
	async afterRun(e) {
		await super.afterRun(e)
		if (this._destroyed || this.ui)
			return
		
		let { layout: root } = this.content
		this.ui = {
			root, code: root.find('[name="onayKodu"]'),
			send: root.find('[data-action="send"]'), paste: root.find('[data-action="paste"]'),
			retry: root.find('[data-action="retry"]'), form: root.find('[data-field="form"]'),
			status: root.find('[data-field="status"]'), countdown: root.find('[data-field="countdown"]')
		}
		root.on('submit.smsOnay', 'form', evt => { evt.preventDefault(); this.gonder() })
		root.on('click.smsOnay', '[data-action="paste"]', () => this.kodYapistir())
		root.on('click.smsOnay', '[data-action="retry"]', () => this.bilgiYukle())
		this.ui.code.on('input.smsOnay', evt => {
			if (evt.originalEvent?.isComposing)
				return
			evt.target.value = this.kodNormallestir(evt.target.value)
			this.ui.code.attr('aria-invalid', 'false')
			this.kontrolGuncelle()
		}).on('paste.smsOnay', evt => {
			let text = (evt.originalEvent ?? evt).clipboardData?.getData('text')
			if (!text)
				return
			evt.preventDefault()
			this.kodUygula(text)
		})
		
		this._visibilityHandler = () => { if (!document.hidden) this.sayacGuncelle() }
		document.addEventListener('visibilitychange', this._visibilityHandler)
		this._wasInKioskMode = app.inKioskMode
		if (!config.dev && !this._wasInKioskMode) {
			app.enterKioskMode()
			this._enteredKiosk = true
		}
		
		await this.bilgiYukle()
	}
	destroyPart(e) {
		if (this._destroyed)
			return
		
		this._destroyed = true
		clearInterval(this._timer_sayac)
		this._timer_sayac = null
		
		document.removeEventListener('visibilitychange', this._visibilityHandler)
		this.ui?.root.off('.smsOnay')
		this.ui?.code.off('.smsOnay').val('')
		
		if (this._enteredKiosk) {
			app.exitKioskMode()
			this._enteredKiosk = false
		}
		
		this.rec = null
		this._lastReq = null
		
		super.destroyPart(e)
	}

	wsSMSOnayBilgi(e = {}) {
		return ajaxPost({
			processData: false, contentType: wsContentTypeVeCharSet, timeout: 20_000,
			url: app.getWSUrl({ api: 'smsOnayBilgi', args: this.getWSArgs(e) })
		})
	}
	wsSMSOnayGonder(e = {}) {
		let { onayKodu } = e
		let args = { ...this.getWSArgs(e), onayKodu }
		return ajaxPost({
			processData: false, contentType: wsContentTypeVeCharSet, timeout: 20_000,
			url: app.getWSUrl({ api: 'smsOnayGonder', args })
			// data: toJSONStr({ onayKodu })
		})
	}
	getWSArgs(e = {}) {
		let args = { id: e.id ?? this.id, tip: e.tip ?? this.tip }
		if (!args.tip)
			delete args.tip
		return args
	}
	bilgiRecAl(res) {
		if (!(res && isObject(res)) || isArray(res))
			throw new Error('Belge bilgileri alınamadı. Lütfen yeniden deneyin')
		if (res.isError || res.success === false)
			throw res
		
		let rec = res.rec ?? res
		if (!(rec && isObject(rec)) || isArray(rec) || empty(rec))
			throw new Error('Belge bilgileri bulunamadı')
		if (rec.isError || rec.success === false)
			throw rec
		
		let belgeAlanlari = ['id', 'tipAdi', 'adSoyad', 'unvan', 'tarih', 'seri', 'no', 'sonucBedel', 'bedel', 'state', 'onaylandi', 'remainingSecs', 'validUntil']
		if (!belgeAlanlari.some(key => rec[key] != null))
			throw new Error('Belge bilgileri bulunamadı')
		if (rec.id != null && String(rec.id) !== String(this.id))
			throw new Error('Bağlantı ile belge bilgileri eşleşmiyor')
		
		return rec
	}
	async bilgiYukle() {
		if (this._destroyed || this._loading || this.state === 'submitting')
			return
		if (this.id == null || !String(this.id).trim()) {
			this.setState('error', 'Onay bağlantısında belge kimliği bulunamadı. Lütfen SMS ile gelen bağlantıyı kullanın')
			return
		}
		this._loading = true
		this.setState('loading')
		try {
			let res = await this.wsSMSOnayBilgi()
			if (this._destroyed)
				return
			
			let rec = this.rec = this.bilgiRecAl(res)
			let len = Number(rec.kodUzunlugu ?? 6)
			if (!Number.isInteger(len) || len < 4 || len > 12)
				throw new Error('Onay kodu bilgisi geçersiz. Lütfen belgeyi düzenleyen firmayla görüşün')
			
			this.kodUzunlugu = len
			this.belgeGoster(rec)
			let state = this.belgeDurumu(rec)
			if (state === 'ready') {
				this.sonGecerlilikTS = this.gecerlilikTarihi(rec)
				this._sayacToplam = max(1, (this.sonGecerlilikTS - now()) / 1000)
				this.setState('ready')
				this.sayacBaslat()
			}
			else
				this.setState(state)
		}
		catch (ex) {
			if (!this._destroyed)
				this.setState('error', this.getErrorText(ex, 'Belge bilgileri yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin'))
		}
		finally {
			this._loading = false
			if (!this._destroyed) this.kontrolGuncelle()
		}
	}
	belgeDurumu(rec = {}) {
		let state = String(rec.state ?? '').toLocaleLowerCase(culture)
		if (rec.onaylandi === true || ['onaylandi', 'onaylandı', 'approved'].includes(state))
			return 'approved'
		if (['suresidoldu', 'süresidoldu', 'expired'].includes(state))
			return 'expired'
		if (['iptal', 'cancelled', 'canceled'].includes(state))
			return 'cancelled'
		if (['kilitli', 'locked'].includes(state))
			return 'locked'
		if (!state || ['pending', 'ready', 'bekliyor'].includes(state))
			return 'ready'
		return 'error'    // Tanınmayan sunucu state'inde onay açılmaz
	}
	onayBasarilimi(res) {
		if (res === true) return true
		if (!(res && isObject(res)) || res.isError || res.success === false || res.onaylandi === false)
			return false
		if (res.state && this.belgeDurumu({ state: res.state }) !== 'approved')
			return false
		return res.success === true || res.onaylandi === true || this.belgeDurumu(res) === 'approved'
	}
	async gonder() {
		if (this._destroyed || this.state !== 'ready' || this._loading)
			return
		
		this.sayacGuncelle()
		if (this.state !== 'ready')
			return
		
		let onayKodu = this.kodNormallestir(this.ui.code.val())
		if (!new RegExp(`^[0-9]{${this.kodUzunlugu}}$`).test(onayKodu)) {
			this.mesajGoster(`${this.kodUzunlugu} haneli SMS onay kodunu yazın.`, 'warning')
			this.ui.code.attr('aria-invalid', 'true').trigger('focus')
			return
		}
		
		if (this._lastReq?.kod != onayKodu)
			this._lastReq = { kod: onayKodu, id: globalThis.crypto?.randomUUID?.() ?? `${now()}-${random().toString(36).slice(2)}` }
		
		this.setState('submitting')
		try {
			// let { id: reqId } = this._lastReq
			let res = await this.wsSMSOnayGonder({ onayKodu })
			if (this._destroyed)
				return
			
			if (this.onayBasarilimi(res)) {
				this.ui.code.val('')
				this._lastReq = null
				this.setState('approved')
			}
			else if (
				res && isObject(res) && (
					res.isError || res.success === false || res.onaylandi === false ||
					['expired', 'cancelled', 'locked'].includes(this.belgeDurumu(res))
				)
			) {
				let state = this.belgeDurumu(res)
				this.setState(
					state === 'approved' ? 'ready' : state,
					this.getErrorText(res, 'Kod doğrulanamadı. SMS ile gelen kodu kontrol edin')
				)
				if (this.state === 'ready') {
					this.ui.code.attr('aria-invalid', 'true').trigger('focus')
					this.sayacGuncelle()
				}
			}
			else
				this.setState('uncertain')
		}
		catch (ex) {
			if (!this._destroyed) {
				// HTTP hata yanıtında açık bir iş hatası varsa kod düzeltilebilir.
				let res = ex?.responseJSON
				if (res?.isError || res?.success === false) {
					let state = this.belgeDurumu(res)
					this.setState(
						state === 'approved' ? 'ready' : state,
						this.getErrorText(res, 'Kod doğrulanamadı')
					)
					this.sayacGuncelle()
				}
				else
					this.setState('uncertain')
			}
		}
	}

	gecerlilikTarihi(rec, _now = now()) {
		if (!(rec.remainingSecs == null || rec.remainingSecs === '')) {
			let secs = Number(rec.remainingSecs)
			if (!Number.isFinite(secs))
				throw new Error('Onay süresi bilgisi geçersiz')
			return _now.addSeconds(max(0, secs))
		}
		
		if (rec.validUntil) {
			let ts = asDate(rec.validUntil).getTime()
			let serverTS = rec.serverTS ? asDate(rec.serverTS).getTime() : _now
			if (!Number.isFinite(ts) || !Number.isFinite(serverTS))
				throw new Error('Onay süresi bilgisi geçersiz')
			return asDate(_now.getTime() + (ts - serverTS))
		}
		
		if (this._fallbackTS)
			return this._fallbackTS
		
		let key = `smsOnay.deadline:${encodeURIComponent(this.tip ?? '')}:${encodeURIComponent(this.id)}`
		let ts
		try { ts = Number(sessionStorage?.getItem(key)) } catch (ex) { }
		if (!Number.isFinite(ts) || ts <= 0) {
			ts = _now.addSeconds(5 * 60)
			try { sessionStorage?.setItem(key, String(ts)) } catch (ex) { }
		}
		
		return this._fallbackTS = ts
	}
	sayacBaslat() {
		clearInterval(this._timer_sayac)
		this.sayacGuncelle()
		if (this.state === 'ready')
			this._timer_sayac = setInterval(() => this.sayacGuncelle(), 1000)
	}
	sayacGuncelle() {
		if (this._destroyed || !this.ui || !['ready', 'submitting'].includes(this.state))
			return
		
		let secs = max(0, ceil((this.sonGecerlilikTS - now()) / 1000))
		let { ui } = this
		ui.countdown.text(`${String(floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`)
		ui.root.find('[data-field="timer"]').toggleClass('is-urgent', secs <= 60)
		ui.root.find('[data-field="progress"]').css('width', `${min(100, secs / this._sayacToplam * 100)}%`)
		if (!secs && this.state === 'ready')
			this.setState('expired')
		// Gönderim sürerken süre bitse de sunucunun sonucu beklenir.
	}
	kodNormallestir(v) {
		return String(v ?? '').replace(/[٠-٩۰-۹]/g, c => String(c.charCodeAt(0) - (c >= '۰' ? 1776 : 1632))).replace(/\D/g, '')
	}
	panodanKodBul(text) {
		let str = String(text ?? '').replace(/[٠-٩۰-۹]/g, c => this.kodNormallestir(c))
		if (/^[\d\s-]+$/.test(str)) {
			let code = this.kodNormallestir(str)
			if (code.length === this.kodUzunlugu) return code
		}
		let marked = str.match(/(?:onay\s*kodu|doğrulama\s*kodu|verification\s*code|otp)\s*[:=-]?\s*([\d][\d\s-]*)/i)
		if (marked) {
			let code = this.kodNormallestir(marked[1].trim())
			if (code.length === this.kodUzunlugu) return code
		}
		let codes = str.match(new RegExp(`(?<![0-9])[0-9]{${this.kodUzunlugu}}(?![0-9])`, 'g')) ?? []
		return codes.length === 1 ? codes[0] : ''
	}
	kodUygula(text) {
		let code = this.panodanKodBul(text)
		if (!code) {
			this.mesajGoster(`Panodaki metinden tek bir ${this.kodUzunlugu} haneli kod alınamadı. Yalnızca onay kodunu yapıştırın`, 'warning')
			this.ui.code.trigger('focus')
			return
		}
		this.ui.code.val(code).attr('aria-invalid', 'false')
		this.mesajGoster('Kod yapıştırıldı. Belge bilgilerini kontrol edip Gönder’e basın.', 'info')
		this.kontrolGuncelle()
		this.ui.code.trigger('focus')
	}
	async kodYapistir() {
		if (this._destroyed || this.state !== 'ready' || this._pasting)
			return
		this._pasting = true
		this.kontrolGuncelle()
		try {
			if (!globalThis.navigator?.clipboard?.readText) throw new Error('clipboard unavailable')
			let text = await navigator.clipboard.readText()
			if (!this._destroyed && this.state === 'ready')
				this.kodUygula(text)
		}
		catch (_) {
			if (!this._destroyed && this.state === 'ready') {
				this.mesajGoster('Panoya erişilemedi. Kod alanına basılı tutup Yapıştır’ı seçin veya Ctrl+V kullanın.', 'warning')
				this.ui.code.trigger('focus')
			}
		}
		finally {
			this._pasting = false
			if (!this._destroyed)
				this.kontrolGuncelle()
		}
	}
	static async onayEkraniAc({ url, onayKodu } = {}) {
		if (!(isString(url) && url.trim()))
			throw new Error('Onay bağlantısı belirtilmedi')
		
		let target = new URL(url, location.href)
		if (!['https:', 'http:'].includes(target.protocol))
			throw new Error('Geçersiz onay bağlantısı')
		
		let copied = false
		try {
			if (onayKodu != null && navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(String(onayKodu))
				copied = true
			}
		}
		catch (ex) { }
		location.assign(target.href)
		
		return { copied }
	}
	belgeGoster(rec) {
		let { root, code } = this.ui
		root.toggleClass('sms-long-code', this.kodUzunlugu > 6)
		let tip = String(rec.tipAdi || 'Belge')
		root.find('[data-field="document"]').prop('hidden', false)
		root.find('[data-field="tipAdi"]').text(tip)
		let alici = rec.adSoyad || rec.unvan || ''
		root.find('[data-field="alici"]').text(alici ? `Sn. ${alici}` : 'Sayın ilgili')
		root.find('[data-field="description"]').text(`${tip} için SMS ile gelen kodu kullanarak onay verebilirsiniz.`)
		let meta = root.find('[data-field="meta"]').empty()
		for (let [label, value] of [['Tarih', this.tarihGoster(rec.tarih)], ['Seri', rec.seri], ['No', rec.no]]) {
			if (value == null || String(value).trim() === '') continue
			$('<div class="sms-meta-item"/>').append($('<dt/>').text(label), $('<dd/>').text(String(value))).appendTo(meta)
		}
		meta.prop('hidden', !meta.children().length)
		let bedel = rec.sonucBedel ?? rec.bedel
		let hasBedel = bedel != null && String(bedel).trim() !== ''
		root.find('[data-field="amount"]').prop('hidden', !hasBedel)
		if (hasBedel) root.find('[data-field="bedel"]').text(this.bedelGoster(bedel, rec.paraBirimi))
		root.find('[data-field="phone"]').text(rec.telefonMasked ? `Kodun gönderildiği telefon: ${rec.telefonMasked}` : 'SMS mesajındaki kodu aşağıya yazın.')
		root.find('[data-field="code-help"]').text(`${this.kodUzunlugu} haneli kod · Baştaki sıfırlar dahil`)
		code.attr({ placeholder: '0'.repeat(this.kodUzunlugu), pattern: `[0-9]{${this.kodUzunlugu}}`, 'aria-invalid': 'false' })
	}
	tarihGoster(v) {
		if (v == null || String(v).trim() === '') return ''
		// Belge tarihi takvim tarihidir; tarayıcının saat dilimi günü değiştirmesin.
		let m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})(?:T|\s|$)/)
		if (m) return `${m[3]}.${m[2]}.${m[1]}`
		return String(v)
	}
	bedelGoster(v, paraBirimi = 'TL') {
		let n = isNumber(v) ? v : Number(String(v).replace(/\s/g, '').replace(/^(\d{1,3}(?:\.\d{3})+),/, '$1,').replace(/\.(?=.*[,])/g, '').replace(',', '.'))
		let text = Number.isFinite(n) ? new Intl.NumberFormat(culture, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) : String(v)
		return `${text} ${!paraBirimi || ['TRY', 'TL'].includes(paraBirimi) ? 'TL' : paraBirimi}`
	}
	getErrorText(ex, fallback) {
		let v = ex?.errorText ?? ex?.responseJSON?.errorText ?? ex?.message
		return isString(v) && v.trim() ? v : fallback
	}
	mesajGoster(text, type = 'info') {
		this.ui.status.text(text).attr('data-tone', type)
	}
	setState(state, mesaj) {
		if (this._destroyed || !this.ui) return
		this.state = state
		let defs = {
			loading: ['Yükleniyor', 'Belge bilgileri alınıyor…', 'info'],
			ready: ['Onay bekliyor', 'Belge bilgilerini kontrol edin ve SMS ile gelen kodu yazın.', 'info'],
			submitting: ['Gönderiliyor', 'Onay kodunuz doğrulanıyor. Lütfen bekleyin.', 'info'],
			approved: ['Onaylandı', 'Belge onayınız başarıyla kaydedildi. Bu ekranı kapatabilirsiniz.', 'success'],
			expired: ['Süre doldu', 'Onay kodunun süresi doldu. Yeni SMS onayı için belgeyi düzenleyen firmayla görüşün.', 'warning'],
			cancelled: ['İptal edildi', 'Bu belge için onay işlemi iptal edilmiş.', 'warning'],
			locked: ['Onay durduruldu', 'Onay işlemi kullanıma kapalı. Belgeyi düzenleyen firmayla görüşün.', 'warning'],
			uncertain: ['Sonuç bekleniyor', 'Gönderimin sonucu doğrulanamadı. Yeniden denemek için Tekrar dene tuşuna basın.', 'warning'],
			error: ['Bilgi alınamadı', 'Belge bilgileri doğrulanamadı. Lütfen yeniden deneyin.', 'warning']
		}
		let [label, text, tone] = defs[state] ?? defs.error
		let { root } = this.ui
		root.attr('data-state', state).attr('aria-busy', ['loading', 'submitting'].includes(state) ? 'true' : 'false')
		root.find('[data-field="badge"]').text(label)
		this.mesajGoster(mesaj || text, mesaj && state === 'ready' ? 'warning' : tone)
		let approved = state === 'approved'
		root.find('[data-field="result"]').prop('hidden', !approved)
		root.find('[data-field="form"]').prop('hidden', approved || ['cancelled', 'locked'].includes(state))
		root.find('[data-field="intro"]').prop('hidden', approved)
		this.ui.retry.text(state === 'uncertain' ? 'Tekrar dene' : 'Bilgileri yeniden yükle')
		if (!['ready', 'submitting'].includes(state)) {
			clearInterval(this._timer_sayac)
			this._timer_sayac = null
		}
		if (state === 'expired')
			this.ui.countdown.text('00:00')
		this.kontrolGuncelle()
	}
	kontrolGuncelle() {
		if (!this.ui || this._destroyed) return
		let ready = this.state === 'ready' && !this._loading
		let valid = new RegExp(`^[0-9]{${this.kodUzunlugu}}$`).test(this.ui.code.val() || '')
		this.ui.code.prop('disabled', !ready)
		this.ui.paste.prop('disabled', !ready || !!this._pasting)
		this.ui.send.prop('disabled', !ready || !valid)
		this.ui.send.find('span').text(this.state === 'submitting' ? 'Doğrulanıyor…' : 'Gönder')
		this.ui.retry.prop('hidden', !['error', 'uncertain'].includes(this.state) || this.id == null || !String(this.id).trim()).prop('disabled', !!this._loading)
		this.ui.root.find('[data-field="timer"]').prop('hidden', !['ready', 'submitting', 'expired'].includes(this.state))
	}
	icon(name) {
		let paths = {
			shield: '<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z"/><path d="m8 12 3 3 5-6"/>',
			paste: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3M11 12h6m-6 4h6"/>',
			arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
			clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
			check: '<path d="m5 12 4 4L19 6"/>'
		}
		return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none"
					 stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
					 aria-hidden="true">${paths[name] || paths.shield}</svg>`
	}
	getLayout() {
		let { kodUzunlugu } = this
		return `<div class="sms-onay-shell">
			<div class="sms-page">
				<header class="sms-brand">
					<span class="sms-brand-icon">${this.icon('shield')}</span>
					<span>SMS ile belge onayı</span>
				</header>
				<main class="sms-card" aria-label="Belge onay ekranı">
					<div class="sms-card-top">
						<span class="sms-eyebrow">BELGE DOĞRULAMA</span>
						<span class="sms-badge" data-field="badge">Yükleniyor</span>
					</div>
					<div data-field="intro">
						<h1>Belgenizi onaylayın</h1>
						<p class="sms-description" data-field="description">Belge bilgileri hazırlanıyor.</p>
					</div>
					<section class="sms-document" data-field="document" aria-label="Belge bilgileri" hidden>
						<div class="sms-doc-type" data-field="tipAdi">Belge</div>
						<h2 data-field="alici">Sayın ilgili</h2>
						<dl class="sms-meta" data-field="meta"></dl>
						<div class="sms-amount" data-field="amount" hidden>
							<span>Sonuç bedel</span>
							<strong data-field="bedel"></strong>
						</div>
					</section>
					<section class="sms-result" data-field="result" hidden>
						<span class="sms-success-icon">${this.icon('check')}</span>
						<h1>Onayınız alındı</h1>
						<p>Belge onayı başarıyla tamamlandı.</p>
					</section>
					<form class="sms-form" data-field="form" novalidate>
						<div class="sms-form-head">
							<span class="sms-code-title">SMS Onay Kodu</span>
							<div class="sms-timer" data-field="timer" hidden>${this.icon('clock')}
								<span data-field="countdown" aria-label="Kalan süre" role="timer">05:00</span>
							</div>
						</div>
						<p class="sms-phone" data-field="phone">SMS mesajındaki kodu aşağıya yazın.</p>
						<div class="sms-code-row">
							<label class="sms-code-label">
								<span class="sms-sr-only">SMS onay kodu</span>
								<input name="onayKodu" type="text" inputmode="numeric" autocomplete="one-time-code"
									   autocapitalize="off" spellcheck="false" maxlength="${kodUzunlugu}" placeholder="000000"
									   aria-label="SMS onay kodu" disabled>
							</label>
							<button type="button" class="sms-paste" data-action="paste" title="Onay kodunu panodan yapıştır" aria-label="Onay kodunu panodan yapıştır" disabled>
								${this.icon('paste')}
								<span>Yapıştır</span>
							</button>
						</div>
						<p class="sms-code-help" data-field="code-help">
							${kodUzunlugu} haneli kod · Baştaki sıfırlar dahil
						</p>
						<div class="sms-time-track" aria-hidden="true"><div data-field="progress"></div></div>
						<button type="submit" class="sms-send" data-action="send" disabled>
							<span>Gönder</span>
							${this.icon('arrow')}
						</button>
					</form>
					<p class="sms-status" data-field="status" data-tone="info" role="status" aria-live="polite" aria-atomic="true">
						Belge bilgileri alınıyor…
					</p>
					<button type="button" class="sms-retry" data-action="retry" hidden>
						Bilgileri Yeniden Yükle
					</button>
				</main>
				<footer class="sms-footer">
					${this.icon('shield')}
					<span>Onayınız yalnızca ekranda gösterilen belge için kaydedilir.</span>
				</footer>
			</div>
		</div>`
	}
	getStyle() {
		return `
		$elementCSS { --sms-ink: #183746; --sms-muted: #687d87; --sms-accent: #087c77; --sms-border: #dce7e9; width: 100% !important; height: 100% !important; position: absolute; inset: 0; margin: 0 !important; padding: 0 !important; overflow: auto !important; color: var(--sms-ink); background: radial-gradient(ellipse at 12% 8%, #dcefea 0, transparent 50%), radial-gradient(ellipse at 92% 88%, #e7eafa 0, transparent 45%), #f4f7f8; color-scheme: light; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Verdana, sans-serif; font-size: 12pt; line-height: 1.5; }
		$elementCSS *, $elementCSS *::before, $elementCSS *::after { box-sizing: border-box }
		$elementCSS [hidden] { display: none !important }
		$elementCSS .sms-page { min-height: 100%; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 20px; gap: 20px }
		$elementCSS .sms-brand { display: flex; align-items: center; gap: 10px; color: #365962; font-size: 140%; font-weight: 600 }
		$elementCSS svg { flex-shrink: 0; vertical-align: middle }
		$elementCSS .sms-brand-icon { display: grid; place-items: center; width: 35px; height: 35px; border: 1px solid #c5ddda; border-radius: 11px; background: #ffffff90; color: var(--sms-accent) }
		$elementCSS .sms-card { width: 100%; max-width: 520px; padding: 30px; border: 1px solid #ffffff; border-radius: 24px; background: #fff; box-shadow: 0 18px 65px #214d5912, 0 2px 8px #214d5908 }
		$elementCSS .sms-card-top { display: flex; gap: 12px; justify-content: space-between; align-items: center; margin-bottom: 22px; flex-wrap: wrap }
		$elementCSS .sms-eyebrow { font-size: 10px; letter-spacing: 1.6px; font-weight: 700; color: var(--sms-muted) }
		$elementCSS .sms-badge { color: #307165; background: #eaf5ef; font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 50px }
		$elementCSS h1, $elementCSS h2, $elementCSS p, $elementCSS dl { margin: 0; padding: 0 }
		$elementCSS h1 { font-size: 27px; line-height: 1.25; letter-spacing: -.7px; color: var(--sms-ink); font-weight: 700 }
		$elementCSS .sms-description { margin: 10px 0 22px; font-size: 140%; color: var(--sms-muted); overflow-wrap: anywhere }
		$elementCSS .sms-document { padding: 20px; background: #f6f9fa; border: 1px solid #e5edef; border-radius: 15px; margin-bottom: 25px; overflow-wrap: anywhere }
		$elementCSS .sms-doc-type { color: var(--sms-accent); font-size: 120%; font-weight: 650; margin-bottom: 7px }
		$elementCSS h2 { color: var(--sms-ink); font-size: 18px; font-weight: 650; line-height: 1.35 }
		$elementCSS .sms-meta { display: flex; gap: 12px 24px; flex-wrap: wrap; margin-top: 16px }
		$elementCSS .sms-meta-item { min-width: 50px; max-width: 100% }
		$elementCSS dt { color: var(--sms-muted); font-size: 11px; font-weight: 400 }
		$elementCSS dd { color: var(--sms-ink); font-size: 13px; font-weight: 600; margin: 2px 0 0 }
		$elementCSS .sms-amount { border-top: 1px dashed #d5e2e5; margin-top: 17px; padding-top: 14px; display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 5px 16px }
		$elementCSS .sms-amount > span { color: var(--sms-muted); font-size: 120% }
		$elementCSS .sms-amount > strong { font-size: 26px; font-weight: 700; letter-spacing: -.6px; color: var(--sms-ink); max-width: 100%; overflow-wrap: anywhere }
		$elementCSS .sms-form-head { display: flex; align-items: center; justify-content: space-between; gap: 10px }
		$elementCSS .sms-code-title { font-size: 140%; font-weight: 650 }
		$elementCSS .sms-timer { display: flex; align-items: center; gap: 5px; color: var(--sms-accent); font-size: 13px; font-weight: 650; font-variant-numeric: tabular-nums; white-space: nowrap }
		$elementCSS .sms-timer svg { width: 16px; height: 16px }
		$elementCSS .sms-timer.is-urgent { color: #a6590a }
		$elementCSS .sms-phone { color: var(--sms-muted); font-size: 120%; margin: 6px 0 14px; overflow-wrap: anywhere }
		$elementCSS .sms-code-row { display: flex; gap: 9px; align-items: stretch }
		$elementCSS .sms-code-label { display: block; flex: 1; min-width: 0 }
		$elementCSS input[name="onayKodu"] { width: 100%; min-width: 0; height: 58px; padding: 10px 14px; border: 1.5px solid #cddce0; border-radius: 11px; background: #fff; color: var(--sms-ink); font-family: ui-monospace, 'Cascadia Code', Consolas, monospace; font-size: 27px; letter-spacing: .15em; text-align: center; outline: none; box-shadow: none; transition: border-color .15s, box-shadow .15s }
		$elementCSS input[name="onayKodu"]::placeholder { color: #b7c6cc; opacity: 1 }
		$elementCSS input[name="onayKodu"]:focus { border-color: var(--sms-accent); box-shadow: 0 0 0 4px #087c7712 }
		$elementCSS input[name="onayKodu"][aria-invalid="true"] { border-color: #bb5c43 }
		$elementCSS input[name="onayKodu"]:disabled { background: #f5f7f8; color: #82929a }
		$elementCSS.sms-long-code input[name="onayKodu"] { font-size: 180%; letter-spacing: .04em }
		$elementCSS button { font: inherit; cursor: pointer; border: 0; margin: 0; white-space: normal; height: auto }
		$elementCSS button:focus-visible { outline: 3px solid #29978f; outline-offset: 3px }
		$elementCSS button:disabled { cursor: default }
		$elementCSS .sms-paste { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; width: 65px; min-width: 65px; padding: 6px; border: 1px solid var(--sms-border); border-radius: 11px; background: #f5f9fa; color: #43727a; font-size: 9px; font-weight: 600 }
		$elementCSS .sms-paste svg { width: 20px; height: 20px }
		$elementCSS .sms-paste:hover:enabled { background: #e7f2f0 }
		$elementCSS .sms-paste:disabled { opacity: .45 }
		$elementCSS .sms-code-help { font-size: 90%; color: var(--sms-muted); margin: 8px 0 14px }
		$elementCSS .sms-time-track { height: 3px; background: #edf1f2; border-radius: 8px; overflow: hidden; margin-bottom: 18px }
		$elementCSS .sms-time-track > div { height: 100%; width: 100%; background: #6caaa0; border-radius: inherit; transition: width .35s linear }
		$elementCSS .sms-send { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; min-height: 50px; padding: 12px 20px; border-radius: 11px; background: var(--sms-accent); color: #fff; font-size: 15px; font-weight: 650; box-shadow: 0 5px 12px #087c7715 }
		$elementCSS .sms-send:hover:enabled { background: #086d68 }
		$elementCSS .sms-send:disabled { background: #dce6e8; color: #607780; box-shadow: none }
		$elementCSS .sms-send svg { width: 19px; height: 19px }
		$elementCSS .sms-status { padding: 12px 14px; border-radius: 10px; margin-top: 18px; background: #f5f8fa; color: #526a75; font-size: 120%; overflow-wrap: anywhere }
		$elementCSS .sms-status[data-tone="warning"] { background: #fff6e9; color: #875916 }
		$elementCSS .sms-status[data-tone="success"] { background: #edf7f1; color: #2c7250 }
		$elementCSS .sms-retry { width: 100%; min-height: 44px; color: var(--sms-accent); background: #edf5f4; padding: 10px 12px; border-radius: 10px; margin-top: 12px; font-size: 130%; font-weight: 600 }
		$elementCSS .sms-retry:disabled { opacity: .5 }
		$elementCSS .sms-footer { display: flex; justify-content: center; align-items: flex-start; gap: 7px; max-width: 470px; font-size: 11px; color: #617c84; text-align: center }
		$elementCSS .sms-footer svg { width: 15px; height: 15px; margin-top: 1px }
		$elementCSS .sms-result { text-align: center; margin: 24px 0 }
		$elementCSS .sms-success-icon { display: grid; place-items: center; margin: 0 auto 16px; width: 66px; height: 66px; border-radius: 50%; background: #e9f6ee; color: #287850 }
		$elementCSS .sms-success-icon svg { width: 32px; height: 32px }
		$elementCSS .sms-result p { margin-top: 9px; font-size: 13px; color: var(--sms-muted) }
		$elementCSS[data-state="expired"] .sms-badge, $elementCSS[data-state="error"] .sms-badge, $elementCSS[data-state="uncertain"] .sms-badge { background: #fff1dd; color: #925e16 }
		$elementCSS .sms-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0 }
		@media (max-width: 540px) {
			$elementCSS .sms-page { padding: 20px 14px; gap: 16px }
			$elementCSS .sms-card { padding: 24px 20px; border-radius: 20px }
			$elementCSS h1 { font-size: 25px }
			$elementCSS .sms-document { padding: 17px; margin-bottom: 22px }
			$elementCSS .sms-amount > strong { font-size: 24px }
			$elementCSS .sms-card-top { margin-bottom: 19px }
		}
		@media (max-width: 360px) {
			$elementCSS .sms-page { padding: 15px 10px }
			$elementCSS .sms-card { padding: 20px 16px }
			$elementCSS input[name="onayKodu"] { font-size: 23px; letter-spacing: .1em; padding: 10px 8px }
			$elementCSS .sms-paste { width: 54px; min-width: 54px }
		}
		@media (prefers-reduced-motion: reduce) { $elementCSS * { transition: none !important } }
		`
	}
}
