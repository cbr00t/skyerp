class EIslemListeBasePart extends MasterListePart {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get rootPartName() { return 'eIslemListe' }
	static get partName() { return this.rootPartName }
	static get filtreSinif() { return null }
	static get kolonFiltreKullanilirmi() { return false }
	get gidenmi() { return this.class.gidenmi }
	get gelenmi() { return this.class.gelenmi }
	// static get isWindowPart() { return true }
	// get wndDefaultIsModal() { return false }
	
	constructor(e = {}) {
		let eConf = e.eConf ??= MQEConf.getInstance()
		super(e)
		this.eConf = eConf
		this.title = e.title ?? ( 'e-İşlem Listesi' ) ?? ''
	}
	static async listele(e = {}) {
		let { eConf } = e
		let { eIslem } = app.params
		if (!eConf && eIslem?.kullanim?.ozelConf) {
			let pr = defer()
			MQEConf.listeEkraniAc({
				secince: e => pr.resolve(e),
				vazgecince: e => pr.reject({ isError: true, rc: 'userAbort' })
			})
			
			let { mfSinif, rec } = await pr
			if (rec) {
				eConf = new mfSinif()
				eConf.setValues({ rec })
			}
		}

		eConf = e.eConf ??= MQEConf.getInstance()
		try {
			let part = new this(e)
			return part.run()
		}
		catch (ex) { hConfirm(getErrorText(ex)); throw ex }
	}
	runDevam(e) {
		let { layout, class: { rootPartName } } = this
		layout.addClass(rootPartName)
		return super.runDevam(e)
	}
	getSecimler(e) {
		let { eConf, class: { filtreSinif } } = this
		return new filtreSinif({ eConf })
	}
	gridArgsDuzenleDevam({ args }) {
		super.gridArgsDuzenleDevam(...arguments)
		extend(args, {
			columnsHeight: 55, rowsHeight: 55,
			showGroupsHeader: true, showFilterRow: true, filterMode: 'default',
			virtualMode: false, selectionMode: 'checkbox'
		})
	}
	async defaultLoadServerData(e) {
		;{
			let _colDefs = app._colDefs ??= {}
			;['piffis', 'sipfis', 'stfis', 'topmakbuzara', 'efgecicialfatfis'].forEach(k =>
				_colDefs[k] ??= app.sqlGetColumns(k))
			
			for (let [k, v] of entries(_colDefs)) {
				if (v?.then)
					_colDefs[k] = await v
			}
		}
		
		let { secimler: filtre } = this
		let { querySinif: cls } = filtre
		let queryci = new cls({ filtre })
		let stm = await queryci.getQuery()
		if (!stm)
			return []
		
		let args = { ...e, alias: 'fis' }
		let recs = args.recs = await stm.execSelect()
		if (empty(recs))
			return []
		
		await this.loadServerData_veriDuzenle(args)
		recs = args.recs
		
		return recs
	}
	loadServerData_veriDuzenle(e) { }
	getSecilenSatirlar_mesajli(e) {
		return this.getSecilenSatirlar({ ...e, mesajli: true })
	}
	async getSecilenSatirlar(e) {
		let { kosul, mesajlimi = e.mesajli ?? e.mesajFlag } = e
		let islemAdi = e.islemAdi ||= 'e-İşlem'
		
		let { gridWidget, eConf, selectedRecs } = this
		let recs = selectedRecs.filter(r =>
			!!r && (kosul?.call(this, { ...e, rec }) ?? true))
		if (empty(recs)) {
			hConfirm(`İşlem yapılacak satırlar seçilmelidir`, islemAdi)
			return null
		}
		
		let araMesaj = e.araMesaj = getFuncValue.call(this, e.araMesaj, e) ??
			`<span class="bold royalblue">${islemAdi}</span> işlemi`
		
		if (mesajlimi) {
			let mesaj = getFuncValue.call(this, e.mesaj, e)
				?? `<span class="bold">${recs.length} adet</span> adet e-İşlem Belgesi için ${araMesaj} yapılsın mı?`
			let rdlg = await ehConfirm(mesaj, islemAdi)
			if (!rdlg)
				return null
		}
		
		return recs
	}
	uiIslemiSonrasi(e = {}) {
		let { progressManager: pm } = globalThis
		if (pm) {
			pm.progressEnd()
			let { uuid2Result, silent, error } = e
			let hasError = !!error
			if (!hasError && uuid2Result)
				hasError = values(uuid2Result).some(r => r.isError)
			
			if (hasError) {
				pm.imgSrc = pm.imgSrc.replace('loading.gif', 'uyari.png')
				let progressText = `İşlem bazı hatalarla tamamlandı`
				if (!empty(uuid2Result))
					progressText += `. Detaylar için <b class="royalblue">Ek Bilgi</b>'ye tıklayınız`
				pm.text = progressText
			}
			else {
				pm.imgSrc = pm.imgSrc.replace('loading.gif', 'tamam_blue.png')
				pm.text = 'İşlem tamamlandı!'
				hideProgress()
				if (!(silent || empty(uuid2Result)))
					eConfirm('İşlem tamamlandı', e.islemAdi)
				return
			}
			pm
				.setAbortText('KAPAT')
				.showAbortButton()
				.progressEnd()
				.hideProgress()
			
			let { wnd } = pm
			if (wnd?.length)
				wnd.jqxWindow('isModal', true)
			
			;[500, 1000, 2000].forEach(ms =>
				delay(ms).then(() =>
					pm?.layouts?.abortButton?.focus())
			)
			//if (empty(uuid2Result))
			//	delay(100).then(() => hideProgress())
		}
		/*hideProgress()*/
	}
	showProgress(e = {}) {
		let { recs = [], progressIsModal: modal } = e
		let pre = empty(recs) ? '' :
			`<span class="bold">${recs.length} adet</span> e-İşlem Belgesi için `
		let mid = e.araMesaj = getFuncValue.call(this, e.araMesaj, e) ??
			`<span class="bold royalblue">${e.islemAdi}</span> işlemi`
		
		let pm = showProgress(`${pre}${mid} yapılıyor...`, null, true, null, null, modal)
		pm.setProgressMax(recs.length)
		delete e.progressIsModal
	}
}
