class EIslemListeBasePart extends MasterListePart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get rootPartName() { return 'eIslemListe' }
	static get partName() { return this.rootPartName }
	static get filtreSinif() { return null }
	// static get isWindowPart() { return true }
	// get wndDefaultIsModal() { return false }
	
	constructor(e) {
		e = e || {}; e.eConf = e.eConf ?? MQEConf.instance; super(e);
		this.title = e.title == null ? ( 'e-İşlem Listesi' ) : e.title || ''
	}
	static async listele(e) {
		e = e || {}; let {eConf} = e; if (!(eConf || app.params.eIslem.kullanim.ozelConf)) { eConf = eConf ?? MQEConf.instance }
		if (!eConf) {
			let promise = new $.Deferred(); MQEConf.listeEkraniAc({ secince: e => promise.resolve(e), vazgecince: e => promise.reject({ isError: true, rc: 'userAbort' }) })
			const {mfSinif, rec} = await promise; if (rec) { eConf = e.eConf = new mfSinif(); eConf.setValues({ rec }) }
		}
		try { const part = new this(e); return part.run() } catch (ex) { hConfirm(getErrorText(ex)); throw ex }
	}
	runDevam(e) { e = e || {}; const {layout} = this; layout.addClass(this.class.rootPartName); super.runDevam(e); }
	getSecimler(e) { return new this.class.filtreSinif({ eConf: this.eConf }) }
	gridArgsDuzenleDevam(e) {
		super.gridArgsDuzenleDevam(e); const {args} = e;
		$.extend(args, { columnsHeight: 55, rowsHeight: 45, showGroupsHeader: true, showFilterRow: true, filterMode: 'default', virtualMode: false, selectionMode: 'checkbox' })
	}
	defaultLoadServerData(e) {
		const _e = { ...e, alias: 'fis' }, {secimler} = this, query = _e.query = secimler.getQueryStm(_e);
		return MQCogul.loadServerData_querySonucu(_e).then(recs => { _e.recs = recs; this.loadServerData_veriDuzenle(_e); return _e.recs })
	}
	loadServerData_veriDuzenle(e) { }
	uiIslemiSonrasi(e) {
		if (window.progressManager) {
			const {uuid2Result} = e; progressManager.progressEnd(); let hasError = !!e?.error;
			if (!hasError && uuid2Result) { hasError = Object.values(uuid2Result).some(rec => rec.isError) }
			if (hasError) {
				/* if ($.isEmptyObject(uuid2Result)) { if (progressManager) { setTimeout(() => hideProgress(), 100) } return } */
				progressManager.imgSrc = progressManager.imgSrc.replace('loading.gif', 'uyari.png');
				let progressText = `İşlem bazı hatalarla tamamlandı`; if (!$.isEmptyObject(uuid2Result)) { progressText += `. Detaylar için <b class="royalblue">Ek Bilgi</b>'ye tıklayınız` }
				progressManager.text = progressText
			}
			else { progressManager.imgSrc = progressManager.imgSrc.replace('loading.gif', 'tamam_blue.png'); progressManager.text = 'İşlem tamamlandı!' }
			progressManager.abortText = 'KAPAT'; progressManager.showAbortButton(); progressManager.progressEnd(); progressManager.hideProgress();
			const {wnd} = progressManager; if (wnd?.length) { wnd.jqxWindow('isModal', true )}
			for (const ms of [500, 1000, 2000]) setTimeout(() => { if (progressManager) progressManager.layouts.abortButton.focus() }, ms)
			/*if ($.isEmptyObject(uuid2Result)) { setTimeout(() => hideProgress(), 100) }*/
		}
		/*hideProgress()*/
	}
	getSecilenSatirlar_mesajli(e) { return this.getSecilenSatirlar($.extend({}, e, { mesajli: true })) }
	async getSecilenSatirlar(e) {
		e = e || {}; const {kosul} = e, mesajlimi = coalesce(e.mesajlimi, coalesce(e.mesajli, e.mesajFlag)),  islemAdi = e.islemAdi = e.islemAdi || 'e-İşlem';
		const {gridWidget, eConf} = this, recs = this.selectedRecs.filter(rec => !!rec && (kosul ? getFuncValue.call(this, kosul, $.extend({}, e, { rec })) : true));
		if ($.isEmptyObject(recs)) { hConfirm(`İşlem yapılacak satırlar seçilmelidir`, islemAdi); return null }
		let araMesaj = e.araMesaj = getFuncValue.call(this, e.araMesaj, e) ?? `<span class="bold royalblue">${islemAdi}</span> işlemi`;
		if (mesajlimi) {
			let mesaj = getFuncValue.call(this, e.mesaj, e) ?? `<span class="bold">${recs.length} adet</span> adet e-İşlem Belgesi için ${araMesaj} yapılsın mı?`;
			let rdlg = await ehConfirm(mesaj, islemAdi); if (!rdlg) return null
		}
		return $.extend({}, e, { sender: this, recs })
	}
	showProgress(e) {
		e = e || {}; const recs = e.recs || []; let onMesaj = $.isEmptyObject(recs) ? '' : `<span class="bold">${recs.length} adet</span> e-İşlem Belgesi için `;
		let araMesaj = e.araMesaj = getFuncValue.call(this, e.araMesaj, e) ?? `<span class="bold royalblue">${e.islemAdi}</span> işlemi`;
		showProgress(`${onMesaj}${araMesaj} yapılıyor...`, null, true, null, null, e.progressIsModal);
		if (window.progressManager) { window.progressManager.progressMax = recs.length }
		delete e.progressIsModal
	}
}
