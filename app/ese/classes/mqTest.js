class MQTest extends MQGuidOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Test' } static get kodListeTipi() { return 'TEST' }
	static get tip() { return this.sablonTip } static get kod() { return this.tip } static get aciklama() { return this.sablonSinif?.aciklama }
	static get tableAlias() { return 'tst' } static get tanimUISinif() { return ModelTanimPart } static get sablonSinif() { return null } static get sablonTip() { return this.sablonSinif?.tip }
	static get ignoreBelirtecSet() { return {...super.ignoreBelirtecSet, ...asSet(['muayeneid']) } }
	static get tip2Sinif() {
		let result = this._tip2Sinif; if (result == null) {
			result = {}; const {subClasses} = this; for (const cls of subClasses) { const {araSeviyemi, tip} = cls; if (!araSeviyemi && tip) { result[tip] = cls } }
			this._tip2Sinif = result
		}
		return result
   }
	get tarih() { const {tarihSaat} = this; return tarihSaat?.clearTime ? new Date(tarihSaat).clearTime() : tarihSaat } set tarih(value) { this.tarihSaat = value?.clearTime ? new Date(value).clearTime() : value }
	get saat() { return timeToString(this.tarihSaat) } set saat(value) { const {tarihSaat} = this; if (value) { setTime(tarihSaat, asDate(value).getTime()) } }
	static get uiState2Adi() { let {_uiState2Adi: result} = this; if (result == null) { let e = { liste: [] }; this.uiState2AdiDuzenle(e); result = this._uiState2Adi = e.liste } return result }
	static get uiStates() { let {_uiStates: result} = this; if (result == null) { result = this._uiStates = Object.keys(this.uiState2Adi) } return result }

	constructor(e) {
		e = e || {}; super(e); const {sablonTip} = this.class;
		if (sablonTip) { const {sablon} = app.params.ese || {}; this.sablonId = sablon[sablonTip] }
	}
	static getClass(e) { const tip = typeof e == 'object' ? e.tip : e; return this.tip2Sinif[tip] }
	static newFor(e) { if (typeof e != 'object') { e = { tip: e } } const cls = this.getClass(e); return cls ? new cls(e) : null }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			muayeneId: new PInstGuid('muayeneid'), tarihSaat: new PInstDate('tarihsaat'), tamamlandimi: new PInstBitBool('btamamlandi'),
			uygulanmaYeri: new PInstTekSecim('uygulanmayeri', MQTestUygulanmaYeri), onayKodu: new PInstNum('onaykodu')
		})
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {dataField: belirtec, rec, result} = e;
		if (belirtec == 'onaykodu') { result.push('center bold royalblue') }
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, {liste} = e, {dev} = config;
		liste.push(...[
			(dev ? new GridKolon({ belirtec: 'muayeneid', text: 'Muayene ID', genislikCh: 40 }) : null),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 10, sql: `${alias}.tarihsaat` }).tipDate(),
			new GridKolon({ belirtec: 'saat', text: 'Saat', genislikCh: 9, sql: `${alias}.tarihsaat` }).tipTime(),
			new GridKolon({ belirtec: 'hastaadi', text: 'Hasta Adı', genislikCh: 40, sql: 'has.aciklama' }),
			new GridKolon({ belirtec: 'doktoradi', text: 'Doktor Adı', genislikCh: 40, sql: 'dok.aciklama' }),
			new GridKolon({ belirtec: 'seri', text: 'Seri', genislikCh: 5, sql: 'mua.seri' }),
			new GridKolon({ belirtec: 'fisno', text: 'No', genislikCh: 17, sql: 'mua.fisno' }).tipNumerik(),
			new GridKolon({ belirtec: 'btamamlandi', text: 'Tamam?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'uygulanmayeritext', text: 'Uygulanma Yeri', genislikCh: 15, sql: MQTestUygulanmaYeri.getClause(`${alias}.uygulanmayeri`) }),
			new GridKolon({ belirtec: 'onaykodu', text: 'Onay Kodu', genislikCh: 10 })
		].filter(x => !!x))
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, alias = this.tableAlias;
		sent.leftJoin({ alias, from: 'esemuayene mua', on: `${alias}.muayeneid = mua.id` })
			.leftJoin({ alias: 'mua', from: 'esehasta has', on: 'mua.hastaid = has.id' })
			.leftJoin({ alias: 'mua', from: 'esedoktor dok', on: 'mua.doktorid = dok.id' });
		sent.sahalar.add(`${alias}.uygulanmayeri`, `${alias}.onaykodu`, 'has.email')
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); let {liste} = e; liste.push(
			{ id: 'eMailGonder', text: 'EMail', handler: _e => this.eMailGonderIstendi({ ...e, ..._e, id: _e.event.currentTarget.id }) },
			{ id: 'testBaslat', text: 'Başlat', handler: _e => this.testBaslatIstendi({ ...e, ..._e, id: _e.event.currentTarget.id }) }
		)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const {tanimFormBuilder: tanimForm} = e; 
		tanimForm.addDiv('ozetBilgi').etiketGosterim_yok().addCSS('bold gray').addStyle_fullWH(null, 'auto').addStyle(e => `$elementCSS { font-size: 120%; padding: 10px 20px }`)
			.onAfterRun(async e => {
				const {altInst: inst, input} = e.builder, {sablonId, tarihSaat, muayeneId, tamamlandimi} = inst, {sablonTip} = inst.class;
				let {uygulanmaYeri, onayKodu} = inst, sablonAdi, muayeneRec;
				if (sablonTip && sablonId) { sablonAdi = (await MQSablon.getClass(sablonTip)?.getGloKod2Adi(sablonId)) || '' }
				if (muayeneId) { muayeneRec = await new MQMuayene({ id: muayeneId }).tekilOku() }
				uygulanmaYeri = uygulanmaYeri?.char ?? uygulanmaYeri;
				const addItem = (elm, css, style) => {
					if (elm && !elm.html) { elm = $(`<div class="full-width">${elm}</div>`) }
					if (!elm?.length) { return } let parent = $(`<div class="full-width"${style ? ` style="${style}"` : ''}/>`); if (css) { parent.addClass(css) }
					elm.appendTo(parent); parent.appendTo(input)
				};
				if (sablonAdi) { addItem(sablonAdi, 'veri bold', `font-size: 150%; color: #999`) }
				addItem(`${tarihSaat ? `<span class="gray etiket">Tarih/Saat:</span> <b class="veri">${dateTimeAsKisaString(tarihSaat)}</b>` : ''} ${tamamlandimi ? `<div class="forestgreen" style="margin-left: "20px">Tamamlandı</b>` : ''}`, 'flex-row');
				if (muayeneRec) { addItem(`<span class="gray etiket">Muayene:</span> <b class="veri">${muayeneRec.fisnox}</b> - <b class="gray">${muayeneRec.hastaadi}</b>`, 'flex-row') }
				if (uygulanmaYeri) { addItem(`<span class="kgray etiket">Uygulanma Yeri:</span> <b>${MQTestUygulanmaYeri.kaDict[uygulanmaYeri]?.aciklama || ''}</b> - <b class="gray">${muayeneRec.hastaadi}</b>`, 'flex-row') }
				if (onayKodu) { addItem(`<span class="gray etiket">Onay Kodu:</span> <b class="onayKodu veri royalblue">${onayKodu}</b>`) }

				let elm = input.find('.onayKodu.veri');
				if (elm?.length) { elm.on('click', evt => { navigator.clipboard.writeText(onayKodu).then(() => eConfirm('Onay Kodu panoya kopyalandı!', this.sinifAdi)) }) }
			})
	}
	static async eMailGonderIstendi(e) {
		const {sinifAdi} = this, gridPart = e.gridPart ?? e.parentPart ?? e.sender;
		let {selectedRecs} = gridPart; if (!selectedRecs?.length) { hConfirm('Kayıtlar seçilmelidir', sinifAdi); return null }
		selectedRecs = selectedRecs.filter(rec => !!rec.email && rec.email.length >= 5 && rec.email.includes('@'));
		if (!selectedRecs?.length) { hConfirm('Seçilenler arasında <u>Geçerli e-Mail Adresi Olan</u> kayıt bulunamadı', sinifAdi); return null }
		if (!await ehConfirm(`Seçilen <b>${selectedRecs.length}</b> adet kişiye <b>Test Onay Kodu için e-Mail</b> gönderilsin mi?`, sinifAdi)) { return null }
		e.pAborted = { result: false }; showProgress(`<b>${selectedRecs.length}</b> kişiye Toplu e-Mail Gönderimi yapılıyor...`, sinifAdi, true, () => e.pAborted.result = true);
		try {
			let result = await this.eMailGonder({ ...e, recs: selectedRecs });
			eConfirm(`Toplu e-Mail Gönderimi Bitti<p/>` +
				(result?.send ? `<div><span class="darkgray">Başarılı:</span> <b class="green">${result?.send ?? '??'}</b></div>` : '') +
				(result?.error ? `<div><span class="darkgray">Hatalı:</span> <b class="red">${result?.error ?? '??'}</b></div>` : '') +
				(result?.total ? `<div><span class="darkgray">Toplam:</span> <b class="royalblue">${result?.total ?? '??'}</b></div>` : '')
			, sinifAdi);
			return result
		}
		finally { window.progressManager?.progressEnd(); setTimeout(() => hideProgress(), 100) }
	}
	static async testBaslatIstendi(e) {
		const {sinifAdi} = this, gridPart = e.gridPart ?? e.parentPart ?? e.sender;
		let {selectedRecs} = gridPart; if (!selectedRecs?.length) { hConfirm('Kayıtlar seçilmelidir', sinifAdi); return }
		let rec = selectedRecs[0]; if (!rec) { hConfirm(`Test seçilmelidir`, sinifAdi); return }
		let {id} = rec, inst = new this({ id }); inst.baslat(e)
	}
	static async eMailGonder(e) {
		const {aciklama: sablonAdi} = this, recs = e.recs || [], {pAborted} = e, TopluSayi = 2; let promises = [], allResults = { total: 0, send: 0, error: 0 };
		const waitBlock = async () => {
			try {
				if (pAborted?.result) { return }
				let results = await Promise.all(promises);
				for (let result of results) { if (!result || result.result === false) { throw {} } else { allResults.send++ } }
			}
			catch (ex) { allResults.error += promises.length; console.error(ex) }
			finally { progressManager?.progressStep(promises.length); allResults.total += promises.length; promises = [] }
		}
		progressManager?.setProgressMax(recs.length); const eMailAuth = await app.getEMailAuth();
		for (const rec of recs) {
			if (pAborted?.result) { break } const {email: to, hastaadi: hastaAdi, onaykodu: onayKodu} = rec;
			const url = `https://cloud.vioyazilim.com.tr:90/skyerp/app/ese/?hostname=cloud.vioyazilim.com.tr&user=${to}&`;
			promises.push(app.wsEMailGonder({ data: {
				...eMailAuth, to, subject: 'ESE Test', body: (
					`<div style="font-size: 14pt;">
						<p style="font-size: 130%; font-weight: bold; color: #555">Sayın ${hastaAdi || ''},</p>
						<p><b>ESE Uygulaması <b>${sablonAdi || ''} TEST</b> için onay kodunuz:<br/>
							<b style="font-size: 160%; color: forestgreen">${onayKodu}</b></p>
						<p><b>Sisteme Giriş Adresi:<br/>
							<a href="${url}" style="font-weight: bold; font-size: 120%">${url}</a></p>
					</div>`
				)
			} })); if (promises.length >= TopluSayi) { await waitBlock() }
		}
		if (promises.length) { await waitBlock() }
		return allResults
	}
	static baslat(e) { let inst = new this({ id: e.testId ?? e.id }); return inst.baslat(e) }
	async baslat(e) {
		const inst = this, {tip} = inst.class, {id} = inst;
		clearTimeout(this._timerProgress); this._timerProgress = setTimeout(() => showProgress(), 500);
		try {
			let rec = (await app.wsTestBilgi({ tip, id })) || {}; await this.testUI_setValues({ rec });
			let part = new TestPart({ inst }); await part.run(); return { inst, part }
		}
		catch (ex) { hConfirm(getErrorText(ex), this.sinifAdi); throw ex }
		finally { clearTimeout(this._timerProgress); setTimeout(() => hideProgress(), 10) }
	}
	testUI_setValues(e) {
		const {rec} = e; if (!rec) { return }
		let keys = ['hastaID', 'doktorID', 'hastaAdi', 'doktorAdi']; for (const key of keys) { let value = rec[key]; if (value !== undefined) { this[key] = value } }
		$.extend(this, { tarihSaat: asDate(rec.ts), detaylar: rec.detaylar || [] })
	}
	static uiState2AdiDuzenle(e) { const {liste} = e; $.extend(liste, { home: 'Hoşgeldiniz', test: 'Test Ekranı', end: 'Test Bitti' }) }
	async testUI_initLayout(e) {
		const {parentPart} = e, {header, content} = parentPart; content.children().remove();
		for (const key of ['hastaAdi', 'doktorAdi']) { $(`<span class="veri">${this[key] || ''}</span>`).appendTo('header') }
		const {uiState2Adi} = this.class; let {state} = parentPart; parentPart.adimText = uiState2Adi[state] ?? state;
		parentPart.headerText = ''; await this.testUI_initLayout_ara(e); state = parentPart.state; parentPart.adimText = uiState2Adi[state] ?? state;
		switch (state) {
			case 'home':
				parentPart.headerText = `<b>${this.hastaAdi}</b>`;
				let btn = $(`<button id="baslat">BAŞLAT</button>`); btn.jqxButton({ theme }).on('click', evt => parentPart.nextPage()); btn.appendTo(content);
				break
		}
	}
	testUI_initLayout_ara(e) { }
	testUI_kaydetOncesi(e) { } testUI_kaydet(e) { } testUI_kaydetSonrasi(e) { }
}
class MQTestCPT extends MQTest {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'CPT Test' }
	static get kodListeTipi() { return 'TSTCPT' } static get table() { return 'esecpttest' } static get sablonSinif() { return MQSablonCPT }
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { cptsablonid: this.sablonId }) }
	testUI_setValues(e) {
		super.testUI_setValues(e); const {rec} = e; if (!rec) { return }
		for (const key of ['gecerliResimSeq', 'grupTekrarSayisi', 'resimArasiSn']) { let value = rec[key]; if (value !== undefined) { this[key] = value } }
	}
	async testUI_initLayout_ara(e) {   /* gecerliResimSeq: Bu seq'daki resim görünür olunca ve tıklanınca DOĞRU kabul et */
		await super.testUI_initLayout_ara(e); const {parentPart} = e, {state, content} = parentPart;
		const {detaylar, gecerliResimSeq, grupTekrarSayisi, resimArasiSn} = this, urls = detaylar.map(det => det.resimLink), imageCount = urls.length;
		switch (state) {
			case 'home':
				let promises = []; for (let i = 0; i < imageCount; i++) { promises.push(new $.Deferred()) }
				let elmContainer = $(`<div class="prefetch-parent" hidden/>`); for (let i = 0; i < imageCount; i++) {
					let img = $(`<img class="prefetch" data-index="${i}" src="${urls[i]}"/>`); img.appendTo(elmContainer);
					img.on('load', evt => promises[asInteger(evt.currentTarget.dataset.index)].resolve({ result: true, evt }));
					img.on('error', evt => promises[asInteger(evt.currentTarget.dataset.index)].resolve({ result: false, evt }))
				}
				elmContainer.appendTo(content); let imgStates = { load: 0, error: 0 }, results = await Promise.all(promises); elmContainer.remove();
				for (let rec of results) { imgStates[rec.result ? 'load' : 'error']++ }
				/*if (imgStates.error) { hConfirm(`<b>UYARI: </b><p/><div class="darkred"><b>${imgStates.error} adet</b> resim yüklenemedi!</div>`, parentPart.title); return }*/
				break
			case 'test':
				parentPart.headerText = `<b>${gecerliResimSeq}.</b> resme tıklayınız`;
				let index = -1, repeatIndex = 0, hInternal, img = $(`<div class="resim"/>`); img.appendTo(content);
				img.on('click', evt => {
					this.testResult = { result: index + 1 == gecerliResimSeq, index };
					clearInterval(this._hInterval); delete this._hInterval; parentPart.nextPage()
				})
				let loopProc = () => {
					if (parentPart.isDestroyed || parentPart.state != 'test') { clearInterval(this._hInterval); delete this._hInterval; return false }
					index++; if (index >= imageCount) { repeatIndex++; index = 0; if (grupTekrarSayisi && repeatIndex >= grupTekrarSayisi) { parentPart.nextPage(); return false } }
					img.css('background-image', `url(${urls[index]})`); return true
				}
				if (loopProc()) { this._hInterval = setInterval(loopProc, resimArasiSn * 1000) }
				break
			case 'end':
				let {result} = this.testResult || {}; if (result != null) {
					$(`<div class="resultText ${result ? 'green' : 'red'}">${result ? 'Başarılı' : 'Hatalı'}</div>`).appendTo(content) }
				break
		}
	}
}
class MQTestESE extends MQTest {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'ESE Test' }
	static get kodListeTipi() { return 'TSTESE' } static get table() { return 'eseesetest' } static get sablonSinif() { return MQSablonESE }
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { esesablonid: this.sablonId }) }
	async testUI_initLayout_ara(e) {   /* gecerliResimSeq: Bu seq'daki resim görünür olunca ve tıklanınca DOĞRU kabul et */
		await super.testUI_initLayout_ara(e); const {parentPart} = e, {state, content, islemTuslari} = parentPart;
		const {detaylar} = this, urls = detaylar.map(det => det.resimLink), imageCount = urls.length;
		const PrefixSecenek = 'secenek', id2SoruVeSecenekler = {}; for (const det of detaylar) {
			let {id, soru} = det; if (soru == null) { continue } soru = soru.trimEnd();
			let secenekler = []; for (const key in det) {
				if (!key.startsWith(PrefixSecenek)) { continue } let value = det[key].trimEnd();
				if (value) { secenekler[asInteger(key.slice(PrefixSecenek.length)) - 1] = value }
			}
			id2SoruVeSecenekler[id] = { soru, secenekler }
		}
		let testResult, htmlList = []; switch (state) {
			case 'test':
				let btn = $(`<button id="tamam"></button>`); btn.jqxButton({ theme }).on('click', evt => parentPart.nextPage()); btn.appendTo(islemTuslari.children('.sag'));
				testResult = this.testResult = {}; htmlList.push(`<div class="anket">`);
				for (let [id, {soru, secenekler}] of Object.entries(id2SoruVeSecenekler)) {
					if (soru == null) { continue }
					htmlList.push(`<div class="item" data-id="${id}"><div class="soru">${soru || '&nbsp;'}</div><div name="${id}" class="secenekler">`);
					for (let i = 0; i < secenekler.length; i++) { htmlList.push(`<button class="secenek">${secenekler[i]}</button>`) }
					htmlList.push(`</div></div>`)
				}
				$(htmlList.join('')).appendTo(content);
				content.find('.anket > .item > .secenekler').jqxButtonGroup({ theme, mode: 'radio' }).on('buttonclick', evt => {
					let {index} = evt.args; if (index == null) { return }
					let id = $(evt.currentTarget).parents('.item').data('id'); if (!id) { return }
					testResult[id] = asInteger(index + 1)
				}); makeScrollable(content.find('.anket')); break
			case 'end':
				islemTuslari.children('.sag').find('#tamam').remove();
				testResult = this.testResult || {}; htmlList.push(`<div class="anket-sonuclar">`);
				for (const [id, seq] of Object.entries(testResult)) {
					let {soru, secenekler} = id2SoruVeSecenekler[id] || {}, cevap = seq ? secenekler[seq - 1] : null;
					if (soru != null && cevap != null) { htmlList.push(`<div class="item"><div class="soru">${soru}</div><div class="cevap">${cevap}</div></div>`) }
				}
				htmlList.push(`</div>`); $(htmlList.join('')).appendTo(content);
				makeScrollable(content.find('.anket-sonuclar')); break
		}
	}
}

class MQTestUygulanmaYeri extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultChar() { return '' }
	kaListeDuzenle(e) { super.kaListeDuzenle(e); e.kaListe.push(new CKodVeAdi(['', 'Muayenehane', 'muayenehanemi']), new CKodVeAdi(['IN', 'İnternet', 'internetmi'])) }
}
