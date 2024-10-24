class MQTest extends MQGuidOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Test' } static get kodListeTipi() { return 'TEST' }
	static get tip() { return this.sablonTip } static get kod() { return this.tip } static get aciklama() { return this.sablonSinif?.aciklama }
	static get tableAlias() { return 'tst' } static get tanimUISinif() { return ModelTanimPart } static get raporSinif() { return null }
	static get sablonSinif() { return null } static get sablonTip() { return this.sablonSinif?.tip }
	static get testSonucSinif() { return null } static get testGenelSonucSinif() { return null } 
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
		e = e || {}; super(e); const {sablonTip} = this.class; $.extend(this, { sablonAdi: e.sablonAdi });
		if (sablonTip) { const {sablon} = app.params.ese; this.sablonId = this.sablonId || sablon?.[sablonTip]?.[0]?.sablonId }
	}
	static getClass(e) { const tip = typeof e == 'object' ? e.tip : e; return this.tip2Sinif[tip] }
	static newFor(e) { if (typeof e != 'object') { e = { tip: e } } const cls = this.getClass(e); return cls ? new cls(e) : null }
	static pTanimDuzenle(e) {
		const {sablonTip} = this; super.pTanimDuzenle(e); $.extend(e.pTanim, {
			tarihSaat: new PInstDate('tarihsaat'), tamamlandimi: new PInstBitBool('btamamlandi'),
			muayeneId: new PInstGuid('muayeneid'), hastaId: new PInstGuid('hastaid'),
			uygulanmaYeri: new PInstTekSecim('uygulanmayeri', MQTestUygulanmaYeri), onayKodu: new PInstNum('onaykodu'),
			sablonId: new PInstGuid(`${sablonTip == 'anket' ? 'ese' : sablonTip}sablonid`), aktifYas: new PInstNum('aktifyas')
		})
	}
	static secimlerDuzenle(e) {
		const {secimler: sec} = e; sec.grupTopluEkle([ { kod: 'teknik', aciklama: 'Teknik Bilgiler', kapali: true, zeminRenk: 'darkgray' } ]);
		sec.secimTopluEkle({
			tamamlandiDurumu: new SecimTekSecim({ etiket: 'Tamamlanma Durumu', tekSecim: new BuDigerVeHepsi([`<span class="forestgreen">Tamamlananlar</span>`, `<span class="darkred">TamamlanMAyanlar</span>`]) }),
			tarih: new SecimDate({ etiket: 'Tarih/Saat' }), aktifYas: new SecimInteger({ etiket: 'Aktif Yaş' }),
			sablonAdi: new SecimOzellik({ etiket: 'Şablon Adı' }), hastaAdi: new SecimOzellik({ etiket: 'Hasta İsim' }), doktorIsim: new SecimOzellik({ etiket: 'Doktor İsim' }),
			sablonId: new SecimBasSon({ etiket: 'Şablon', mfSinif: this.sablonSinif, grupKod: 'teknik' }), muayeneId: new SecimBasSon({ etiket: 'Muayene', mfSinif: MQMuayene, grupKod: 'teknik' }),
			hastaId: new SecimBasSon({ etiket: 'Hasta', mfSinif: MQHasta, grupKod: 'teknik' })
		}).whereBlockEkle(({ secimler: sec, where: wh }) => {
			const {tableAlias: alias} = this;
			let tSec = sec.tamamlandiDurumu.tekSecim; if (!tSec.hepsimi) { wh.add(tSec.getBoolBitClause(`${alias}.btamamlandi`)) }
			wh.basiSonu({ basi: sec.tarih.basi, sonu: sec.tarih.sonu?.yarin().clone().clearTime() }, `${alias}.tarihsaat`);
			wh.ozellik(sec.sablonAdi, 'sab.aciklama').basiSonu(sec.aktifYas, `${alias}.aktifyas`).ozellik(sec.hastaAdi, 'has.aciklama').ozellik(sec.doktorAdi, 'dok.aciklama');
			wh.basiSonu(sec.sablonId, `${alias}.sablonid`).basiSonu(sec.muayeneId, `${alias}.muayeneid`).basiSonu(sec.hastaId, `${alias}.hastaid`)
			
		})
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {dataField: belirtec, rec, result} = e;
		if (belirtec == 'onaykodu') { result.push('center bold royalblue') }
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, {liste} = e, {dev} = config;
		liste.push(...[
			new GridKolon({ belirtec: 'sablonadi', text: 'Şablon Adı', genislikCh: 35, sql: 'sab.aciklama' }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 10, sql: `${alias}.tarihsaat` }).tipDate(),
			new GridKolon({ belirtec: 'saat', text: 'Saat', genislikCh: 9, sql: `${alias}.tarihsaat` }).tipTime(),
			new GridKolon({ belirtec: 'btamamlandi', text: 'Tamam?', genislikCh: 8 }).tipBool().noSql(),
			new GridKolon({ belirtec: 'onaykodu', text: 'Onay Kodu', genislikCh: 10 }).noSql(),
			new GridKolon({ belirtec: 'aktifyas', text: 'Aktif Yaş', genislikCh: 9 }).tipNumerik().noSql(),
			new GridKolon({ belirtec: 'hastaadi', text: 'Hasta Adı', genislikCh: 40, sql: 'has.aciklama' }),
			new GridKolon({ belirtec: 'doktoradi', text: 'Doktor Adı', genislikCh: 40, sql: 'dok.aciklama' }),
			new GridKolon({ belirtec: 'email', text: 'Hasta e-Mail', genislikCh: 40, sql: 'has.email' }).noSql(),
			new GridKolon({ belirtec: 'seri', text: 'Seri', genislikCh: 5, sql: 'mua.seri' }),
			new GridKolon({ belirtec: 'fisno', text: 'No', genislikCh: 17, sql: 'mua.fisno' }).tipNumerik(),
			new GridKolon({ belirtec: 'uygulanmayeritext', text: 'Uygulanma Yeri', genislikCh: 15, sql: MQTestUygulanmaYeri.getClause(`${alias}.uygulanmayeri`) }),
			(dev ? new GridKolon({ belirtec: 'muayeneid', text: 'Muayene ID', genislikCh: 40 }) : null),
			(dev ? new GridKolon({ belirtec: 'hastaid', text: 'Hasta ID', genislikCh: 40 }) : null),
			(dev ? new GridKolon({ belirtec: 'doktorid', text: 'Hasta ID', genislikCh: 40 }) : null)
		].filter(x => !!x))
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tekilOku: tekilOkuFlag} = e;
		const {tableAlias: alias, sablonSinif, pTanim} = this, {rowAttr: sablonIdSaha} = pTanim.sablonId;
		sent.leftJoin({ alias, from: `${sablonSinif.table} sab`, on: `${alias}.${sablonIdSaha} = sab.id` })
			.leftJoin({ alias, from: 'esehasta has', on: `${alias}.hastaid = has.id` })
			.leftJoin({ alias, from: 'esemuayene mua', on: `${alias}.muayeneid = mua.id` })
			.leftJoin({ alias: 'mua', from: 'esedoktor dok', on: 'mua.doktorid = dok.id' });
		sent.sahalar.add(`${alias}.btamamlandi`, `${alias}.uygulanmayeri`, `${alias}.onaykodu`, `${alias}.aktifyas`, 'has.aciklama hastaAdi', 'has.email', 'sab.aciklama sablonAdi');
		if (tekilOkuFlag) { sent.sahalar.liste = sent.sahalar.liste.filter(saha => !saha.deger.includes('SUM(')) }
		else { sent.groupByOlustur() }
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); const removeIdSet = asSet(['yeni', 'kopya']);
		let {liste} = e; liste = e.liste = liste.filter(item => !removeIdSet[item.id]);
		liste.push(
			{ id: 'eMailGonder', text: 'e-Mail<br/>Gönder', handler: _e => this.eMailGonderIstendi({ ...e, ..._e, id: _e.event.currentTarget.id }) },
			{ id: 'testBaslat', text: 'Test<br/>Başlat', handler: _e => this.testBaslatIstendi({ ...e, ..._e, id: _e.event.currentTarget.id }) }
		)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const {tanimFormBuilder: tanimForm} = e, {sinifAdi, sablonSinif} = this;
		let form = tanimForm.addFormWithParent().altAlta();
			form.addModelKullan('sablonId', 'Şablon').dropDown().kodsuz().setMFSinif(sablonSinif);
			form.addCheckBox('tamamlandimi', 'Tamamlandı').addStyle(e => `$elementCSS { margin-top: 10px !important }`);
		tanimForm.addDiv('ozetBilgi').etiketGosterim_yok().addCSS('bold gray').addStyle_fullWH(null, 'auto').addStyle(e => `$elementCSS { font-size: 120%; padding: 10px 20px }`)
			.onAfterRun(async e => {
				const {altInst: inst, input} = e.builder, {sablonId, tarihSaat, muayeneId, tamamlandimi} = inst, {sablonTip} = inst.class;
				let {uygulanmaYeri, onayKodu, aktifYas, hastaAdi} = inst, sablonAdi, muayeneRec;
				/*if (sablonTip && sablonId) { sablonAdi = (await MQSablon.getClass(sablonTip)?.getGloKod2Adi(sablonId)) || '' }*/
				if (muayeneId) { muayeneRec = await new MQMuayene({ id: muayeneId }).tekilOku() }
				uygulanmaYeri = uygulanmaYeri?.char ?? uygulanmaYeri;
				const addItem = (elm, css, style) => {
					if (elm && !elm.html) { elm = $(`<div class="full-width">${elm}</div>`) }
					if (elm?.length) { let parent = $(`<div class="full-width"${style ? ` style="${style}"` : ''}/>`); if (css) { parent.addClass(css) } elm.appendTo(parent); parent.appendTo(input) }
				};
				/*if (sablonAdi) { addItem(`<span class="gray etiket">Şablon:</span> <b class="veri forestgreen">${sablonAdi}</b>`, 'flex-row'), `font-size: 130%` }
				addItem(`${tarihSaat ? `<span class="gray etiket">Tarih/Saat:</span> <b class="veri">${dateTimeAsKisaString(tarihSaat)}</b>` : ''} ${tamamlandimi ? `<div class="forestgreen" style="margin-left: "20px">Tamamlandı</b>` : ''}`, 'flex-row');*/
				addItem(`${tarihSaat ? `<span class="gray etiket">Tarih/Saat:</span> <b class="veri">${dateTimeAsKisaString(tarihSaat)}</b>` : ''}`, 'flex-row');
				addItem(
						(muayeneRec ? `<span class="gray etiket">Muayene:</span> <b class="veri">${muayeneRec.fisnox}</b> - ` : '') +
						`<b class="gray">${hastaAdi}</b> - (Yaş: <b class="forestgreen">${aktifYas}</b>)`,
					'flex-row')
				if (uygulanmaYeri) { addItem(`<span class="kgray etiket">Uygulanma Yeri:</span> <b>${MQTestUygulanmaYeri.kaDict[uygulanmaYeri]?.aciklama || ''}</b>`, 'flex-row') }
				if (onayKodu) { addItem(`<span class="gray etiket">Onay Kodu:</span> <u class="onayKodu veri bold royalblue">${onayKodu}</u>`, null, `margin-top: 30px; cursor: pointer`) }
				let elm = input.find('.onayKodu.veri'); if (elm?.length) {
					elm.on('click', evt => { navigator.clipboard.writeText(onayKodu).then(() => eConfirm('Onay Kodu panoya kopyalandı!', sinifAdi)) }) }
			})
	}
	setValues(e) { super.setValues(e); const {rec} = e; $.extend(this, { hastaAdi: rec.hastaadi, doktorAdi: rec.doktoradi }) }
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
					(result?.total && (result?.send && result?.error) ? `<div><span class="darkgray">Toplam:</span> <b class="royalblue">${result?.total ?? '??'}</b></div>` : '')
				, sinifAdi);
			return result
		}
		finally { window.progressManager?.progressEnd(); setTimeout(() => hideProgress(), 100) }
	}
	static async testBaslatIstendi(e) {
		const {sinifAdi} = this, gridPart = e.gridPart ?? e.parentPart ?? e.sender;
		let {selectedRecs} = gridPart; if (!selectedRecs?.length) { hConfirm('Kayıtlar seçilmelidir', sinifAdi); return }
		let rec = selectedRecs[0]; if (!rec) { hConfirm(`Test seçilmelidir`, sinifAdi); return }
		let {id} = rec, inst = new this({ id }); const {part} = await inst.baslat(e) || {};
		if (part?.kapaninca) { part.kapaninca(e => gridPart.tazele()) }
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
		const {DefaultWSHostName_SkyServer} = sky.config.class; for (const rec of recs) {
			if (pAborted?.result) { break } const {email: to, hastaadi: hastaAdi, onaykodu: onayKodu} = rec;
			const url = `${location.origin}/skyerp/app/ese/?ssl&hostname=${DefaultWSHostName_SkyServer}&user=${to}&pass=${onayKodu}&`;
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
	setValues(e) { super.setValues(e); const {rec} = e; $.extend(this, { sablonAdi: rec.sablonadi })}
	static baslat(e) { let inst = new this({ id: e.testId ?? e.id }); return inst.baslat(e) }
	async baslat(e) {
		const inst = this, {tip} = this.class, {id} = this;
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
		let keys = ['id', 'muayeneID', 'sablonID', 'sablonAdi', 'hastaID', 'doktorID', 'hastaAdi', 'doktorAdi'];
		for (const key of keys) { let value = rec[key]; if (value !== undefined) { this[key] = value } }
		$.extend(this, { tarihSaat: now(), detaylar: rec.detaylar || [] })
	}
	static uiState2AdiDuzenle(e) { const {liste} = e; $.extend(liste, { home: 'Hoşgeldiniz', test: 'Test Ekranı', end: 'Test Bitti' }) }
	async testUI_initLayout(e) {
		const {parentPart} = e, {header, content} = parentPart; content.children().remove();
		const {tarihSaat: tarih, hastaAdi} = this; $.extend(parentPart, { tarih, hastaAdi });
		const {tip, aciklama: tipAdi, uiState2Adi} = this.class, {id: testId, sablonAdi} = this;
		const getAdimText = () => { let result = uiState2Adi[state] ?? 'state'; if (sablonAdi /*&& state == 'home'*/) { result = `${tipAdi} <b class="royalblue">${sablonAdi}</b> Testi` } return result }
		let {state} = parentPart; if (state == 'test') { this.genelSonuc = new this.class.testGenelSonucSinif({ tip, testId }) }
		$.extend(parentPart, { adimText: getAdimText(), headerText: '' });
		await this.testUI_initLayout_ara(e); state = parentPart.state; parentPart.adimText = getAdimText();
		let btn; switch (state) {
			case 'home':
				requestFullScreen();btn = $(`<button id="baslat">İşleme başla</button>`); btn.jqxButton({ theme });
				btn.on('click', evt => { requestFullScreen(); parentPart.nextPage({ ...e, evt }) }); btn.appendTo(content);
				break
			case 'end':
				const {genelSonuc} = this; if (genelSonuc) {
					console.table(genelSonuc); try { await genelSonuc.kaydet(e) } catch (ex) {
						$(`<div class="resultText error">Test sonuçları kaydedilirken bir hata oluştu.</div><p/>`).appendTo(content);
						$(`<div class="resultText">Kayıt işlemini tekrar denemek için <button id="retry" class="bold royalblue">buraya tıklayınız</b></button>.</div>`).appendTo(content);
						content.find('button#retry').jqxButton({ theme }).on('click', evt => { content.find('button#retry').remove(); parentPart.tazele() });
						throw ex
					}
				}
				$(`<div class="resultText">Test tamamlandı.<p/>Teşekkür ederiz.</div>`).appendTo(content);
				if(config.dev) { $(`<div class="resultText darkgray" style="font-size: 90%">*<u>programcı</u>*: Sonuçlar için <span class="royalblue">F12 (DevTools) &gt; Console</span> kısmına bakınız</div>`).appendTo(content) }
				$(`<span class="cikis-etiket">Çıkmak için basınız => </span>`).appendTo(content);
				btn = $(`<button class="cikis">[ Çıkış ]</button>`).jqxButton({ theme }).on('click', evt => parentPart.cikisIstendi({ ...e, evt })); btn.appendTo(content);
				break
		}
	}
	testUI_initLayout_ara(e) { }
	testUI_kaydetOncesi(e) { } testUI_kaydet(e) { } testUI_kaydetSonrasi(e) { }
}
class MQTestCPT extends MQTest {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get intervalKatSayi() { return config.dev ? .2 : 1 }
	static get sinifAdi() { return `${app.params.ese.sablon?.cpt?.[0]?.etiket ?? 'CPT'} Test` } 
	static get testSonucSinif() { return TestSonucCPT } static get testGenelSonucSinif() { return TestGenelSonucCPT }
	static get kodListeTipi() { return 'TSTCPT' } static get table() { return 'esecpttest' } static get sablonSinif() { return MQSablonCPT } static get raporSinif() { return DRapor_ESETest_CPT }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'tumsayi', text: 'Tüm Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'grupsayi', text: 'Grup Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'dogrusayi', text: 'Doğru Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'yanlissayi', text: 'Yanlış Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'ortdogrusecimsurems', text: 'Ort. Doğru Seçim(ms)', genislikCh: 23, sql: `(case when ${alias}.dogrusayi = 0 then 0 else ROUND(SUM(${alias}.dogrusecimsurems) / SUM(${alias}.dogrusayi), 1) end)` }).tipDecimal(1),
			new GridKolon({ belirtec: 'ortyanlissecimsurems', text: 'Ort. Yanlış Seçim(ms)', genislikCh: 23, sql: `(case when ${alias}.yanlissayi = 0 then 0 else ROUND(SUM(${alias}.yanlissecimsurems) / SUM(${alias}.yanlissayi), 1) end)` }).tipDecimal(1),
		].filter(x => !!x))
	}
	/*static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.sahalar.add('sab.gecerliresimseq', 'sab.gruptekrarsayisi', 'sab.resimgosterimms') }*/
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { cptsablonid: this.sablonId }) }
	testUI_setValues(e) {
		super.testUI_setValues(e); const {rec} = e; if (!rec) { return }
		for (const key of ['resimSayisi', 'grupTekrarSayisi', 'gecerliResimSeq', 'baslamaOncesiMS', 'resimGosterimMS', 'resimBostaMS']) {
			let value = rec[key]; if (value !== undefined) { this[key] = value }
		}
	}
	async testUI_initLayout_ara(e) {   /* gecerliResimSeq: Bu seq'daki resim görünür olunca ve tıklanınca DOĞRU kabul et */
		await super.testUI_initLayout_ara(e); const {parentPart} = e, {state, content} = parentPart;
		const {id: testId, detaylar, genelSonuc, gecerliResimSeq, grupTekrarSayisi, baslamaOncesiMS, resimGosterimMS, resimBostaMS} = this, {tip, intervalKatSayi} = this.class;
		let startCounter = 3, orjUrls = detaylar.map(det => det.resimLink), urls = [...orjUrls], imageCount = urls.length, keyDownHandler;
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
				let rightWidth = 250, infoHTML = (
					`<p>Test başlamadan önce <b class="royalblue">${startCounter} saniyelik</b> bir geri sayım olacak ve ` +
							`Test sırasında <b class="royalblue">${imageCount}</b> tane resim karışık sırada ve <b class="royalblue">${resimGosterimMS} ms</b> aralıklarla gösterilecektir.<br>` +
						`Yanda gözüken resim gözükürse SPACE veya ENTER tuşuna basınız ya da Resme tıklayınız.</p>` +
					`<p>Bir grup gösterim tamamlanınca aynı resimler bir daha karışık şekilde gösterilir. Grup gösterimi <b class="royalblue">${grupTekrarSayisi}</b> defa yapılır.<br/>` +
						`Sonuçta yandaki resim değişik zamanlarda <b class="royalblue">${grupTekrarSayisi}</b> defa karşımıza çıkacaktır.</p>` +
					`<p>Bu test tahmini <b class="forestgreen">${Math.ceil(resimGosterimMS * 1000 * imageCount * grupTekrarSayisi / 60)} dakika</b> sürecektir.</p>` +
					`<p>Hazırsanız <b>'İşleme Başla'</b> tuşuna basarak testi başlatınız.</p>`
				);
				$(`<div class="info float-left wrap-pretty" style="width: calc(var(--full) - (${rightWidth}px + 5px))">${infoHTML}</div>`).appendTo(content);
				$(`<div class="target-img-parent float-right full-height" style="width: ${rightWidth}px">` +
					  `Şu resme tıklayınız: <div class="target-img full-wh" style="margin-left: 100px; background-image: url(${orjUrls[gecerliResimSeq - 1]})"></div>`).appendTo(content)
				/*if (imgStates.error) { hConfirm(`<b>UYARI: </b><p/><div class="darkred"><b>${imgStates.error} adet</b> resim yüklenemedi!</div>`, parentPart.title); return }*/
				break
			case 'test':
				const {testSonucSinif} = this.class;
				let gecerliResimURL, index = -1, repeatIndex = 0, resimGosterimTime, ilkTiklamaTime, hInternal;
				parentPart.headerText = `Şu resme tıklayınız: <img class="target-img" src="${orjUrls[gecerliResimSeq - 1]}">`;
				const img = $(`<div class="resim"/>`); img.appendTo(content);
				let clearFlag = true; let promise_wait = new $.Deferred();
				let loopProc = () => {
					if (startCounter <= 0 || parentPart.isDestroyed || parentPart.state != 'test') { clearInterval(this._hInterval); delete this._hInterval; promise_wait?.resolve(); return false }
					img.html(clearFlag ? '' : `<div class="veri full-wh">${startCounter--}</div>`); clearFlag = !clearFlag
				}; this._hInterval = setInterval(loopProc, 800 * (intervalKatSayi / 2)); await promise_wait; img.html('');
				if (baslamaOncesiMS) { await new $.Deferred(p => setTimeout(() => p.resolve(), baslamaOncesiMS)) }
				let clickHandler = evt => {
					if (clearFlag || ilkTiklamaTime || !resimGosterimTime) { return } ilkTiklamaTime = now(); let dogrumu = urls[index] == gecerliResimURL;
					let cssClicked = `clicked-${dogrumu ? 'dogru' : 'yanlis'}`; img.removeClass('clicked-dogru clicked-yanlis'); setTimeout(() => img.addClass(cssClicked), 1);
					let tiklamaMSFarki = (ilkTiklamaTime - resimGosterimTime), grupNo = repeatIndex + 1;
					let testSonuc = genelSonuc.grupNo2Bilgi[grupNo] = genelSonuc.grupNo2Bilgi[grupNo] || new testSonucSinif({ tip, testId }); testSonuc.tiklamaEkle(dogrumu, tiklamaMSFarki)
				}; img.on('mousedown', clickHandler); img.on('touchstart', clickHandler);
				keyDownHandler = evt => {
					if (parentPart.isDestroyed || parentPart.state != 'test') { $('body').off('keydown', keyDownHandler); return }
					let key = evt.key?.toLowerCase(); if (key == ' ' || key == 'enter' || key == 'linefeed') { clickHandler(evt) }
				}; $('body').off('keydown', keyDownHandler).on('keydown', keyDownHandler);
				let ilkmi = true, lastProcTime; clearFlag = false; loopProc = () => {
					let prevLastProcTime = lastProcTime; lastProcTime = now(); let farkMS = lastProcTime - prevLastProcTime;
					if (parentPart.isDestroyed || parentPart.state != 'test') { clearInterval(this._hInterval); delete this._hInterval; return false }
					if (clearFlag) { if (farkMS < resimBostaMS) { return true } img.css('background-image', '') }
					else {
						if (farkMS < resimGosterimMS) { return true } index++; if (ilkmi) { ilkmi = false } else { genelSonuc.tumSayi++ }
						let cevrimBittimi = index >= imageCount; if (cevrimBittimi) {
							repeatIndex++; index = 0; if (grupTekrarSayisi && repeatIndex >= grupTekrarSayisi) { parentPart.nextPage(); return false }
							urls = shuffle(urls)
						}
						parentPart.progressText = (`<div class="flex-row">
							<div class="item"><span class="ek-bilgi">Resim: &nbsp;</span><span class="veri white">${index + 1} / ${imageCount}</span></div>
							<div class="item"><span class="ek-bilgi">Grup: &nbsp;</span><span class="veri">${repeatIndex + 1} / ${grupTekrarSayisi}</span></div>
						</div>`);
						img.css('background-image', `url(${urls[index]})`);
						resimGosterimTime = now(); ilkTiklamaTime = null
					}
					clearFlag = !clearFlag; return true
				}; gecerliResimURL = urls[gecerliResimSeq - 1]; urls = shuffle(urls);
				lastProcTime = now(); this._hInterval = setInterval(loopProc, 50); break
			case 'end':
				$('body').off('keydown', keyDownHandler);
				if (genelSonuc) {
					for (const testSonuc of Object.values(genelSonuc.grupNo2Bilgi)) { genelSonuc.totalEkle(testSonuc); testSonuc.ortalamaOlustur() }
					genelSonuc.ortalamaOlustur()
				} break
			/*case 'end':
				let {result} = this.testResult || {}; if (result != null) {
					$(`<div class="resultText ${result ? 'green' : 'red'}">${result ? 'Başarılı' : 'Hatalı'}</div>`).appendTo(content) }
				break*/
		}
	}
}
class MQTestAnket extends MQTest {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return `${app.params.ese.sablon?.anket?.[0]?.etiket ?? 'Anket'} Test` } 
	static get testSonucSinif() { return TestSonucAnket } static get testGenelSonucSinif() { return TestGenelSonucAnket }
	static get kodListeTipi() { return 'TSTANKET' } static get table() { return 'eseankettest' } static get sablonSinif() { return MQSablonAnket } static get raporSinif() { return DRapor_ESETest_Anket }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {sablonTip} = this, {maxSecenekSayisi} = MQSablonAnketYanit, {pTanim} = e;
		$.extend(pTanim, { toplamPuan: new PInstNum('toplampuan'), yanitsizSayi: new PInstNum('yanitsizsayi') });
		for (let i = 1; i <= maxSecenekSayisi; i++) { for (const key of [`yanit${i}Sayi`, `yanit${i}Puan`]) { pTanim[key] = new PInstNum(key.toLowerCase()) } }
		
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'toplampuan', text: 'Top.Puan', genislikCh: 10 }).tipDecimal(1),
			new GridKolon({ belirtec: 'yanitsizsayi', text: 'Yanıtsız Sayı', genislikCh: 10 }).tipNumerik()
		].filter(x => !!x));
		const {maxSecenekSayisi} = MQSablonAnketYanit; for (let i = 1; i <= maxSecenekSayisi; i++) {
			liste.push(
				new GridKolon({ belirtec: `yanit${i}sayi`, text: `Yanıt-${i} Sayı`, genislikCh: 15 }).tipNumerik(),
				new GridKolon({ belirtec: `yanit${i}puan`, text: `Yanıt-${i} Puan`, genislikCh: 15 }).tipDecimal(1)
			)
		}
	}
	/*static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.sahalar.add('sab.suredk', 'sab.yanitid') }*/
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { esesablonid: this.sablonId }) }
	setValues(e) { super.setValues(e); const {rec} = e; $.extend(this, { sureDk: rec.suredk, yanitID: rec.yanitid })}
	testUI_setValues(e) {
		super.testUI_setValues(e); const {rec} = e; if (!rec) { return }
		const keys = ['sureDk', 'yanitID'], PrefixSecenek = 'secenek', PrefixYanit = 'yanit';
		for (const key of keys) { let value = rec[key]; if (value !== undefined) { this[key] = value } }
		for (const [key, value] of Object.entries(rec)) {
			if (key.startsWith(PrefixSecenek) || key.startsWith(PrefixYanit)) { let value = rec[key]; if (value !== undefined) { this[key] = value } } }
	}
	async testUI_initLayout_ara(e) {   /* gecerliResimSeq: Bu seq'daki resim görünür olunca ve tıklanınca DOĞRU kabul et */
		await super.testUI_initLayout_ara(e); const {parentPart} = e, {state, header, content, islemTuslari} = parentPart;
		const {detaylar} = this, urls = detaylar.map(det => det.resimLink), imageCount = urls.length;
		const PrefixSecenek = 'secenek', PrefixYanit = 'yanit';
		let rec = detaylar[0], secenekler = []; for (const key of Object.keys({ ...this, ...rec })) {
			if (key.startsWith(PrefixSecenek) || key.startsWith(PrefixYanit)) {
				let value = (rec[key] ?? this[key])?.trimEnd?.(); if (value) { secenekler[asInteger(key.slice(PrefixSecenek.length)) - 1] = value } }
		} 
		const id2Soru = {}; for (const det of detaylar) { let {id, soru} = det; if (soru == null) { continue } soru = soru.trimEnd(); id2Soru[id] = soru }
		const {genelSonuc, testId, sureDk} = this, {tip, testSonucSinif} = this.class, soruSayi = Object.keys(id2Soru).length;
		let htmlList = [], countdown;
		switch (state) {
			case 'home':
				let infoHTML = (
					`<p>Test Anket şeklinde verilecektir.<br>` +
						`<b class="royalblue">${secenekler.join(', ')}</b> şeklinde yanıtlar verilmelidir.</p>` +
					`<p>Anket <b class="royalblue">${soruSayi}</b> sorudan oluşmaktadır ve başladıktan sonra <b class="forestgreen">${sureDk} dakika</b> içinde tamamlanmalıdır.</p>` +
					`<p>Hazırsanız <b>'İşleme Başla'</b> tuşuna basarak testi başlatınız.</p>`
				);
				$(`<div class="info wrap-pretty full-width">${infoHTML}</div>`).appendTo(content);
				break
			case 'test':
				genelSonuc.tumSayi = soruSayi;
				let btn = $(`<button id="bitti">TEST BİTTİ ise Buraya tıklayınız</button>`); btn.jqxButton({ theme }).on('click', evt => {
					countdown.destroyPart(); countdown = null; parentPart.nextPage() }); btn.appendTo(header);
				htmlList.push(`<div class="anket">`); for (const [id, soru] of Object.entries(id2Soru)) {
					if (soru == null) { continue }
					htmlList.push(`<div class="item flex-row" data-id="${id}"><div class="soru">${soru || '&nbsp;'}</div><div name="${id}" class="secenekler">`);
					for (let i = 0; i < secenekler.length; i++) { htmlList.push(`<button class="secenek">${secenekler[i]}</button>`) }
					htmlList.push(`</div></div>`)
				}
				$(htmlList.join('')).appendTo(content); makeScrollable(content.find('.anket'));
				content.find('.anket > .item > .secenekler').jqxButtonGroup({ theme, mode: 'radio' }).on('buttonclick', evt => {
					let {index} = evt.args; if (index == null) { return } index = asInteger(index); const seq = index + 1;
					let soruId = $(evt.currentTarget).parents('.item').data('id'); if (!soruId) { return }
					genelSonuc.soruId2Cevap[soruId] = { soru: id2Soru[soruId], index, puan: this[`yanit${seq}Puan`] }
				});
				if (countdown) { countdown.abort() }
				countdown = new Countdown({ totalSecs: sureDk * 60, layout: parentPart.headerLayouts.countdown });
				countdown.onCallback(({sender, state}) => {
					if (parentPart?.isDestroyed || countdown == null) { sender.destroyPart(e); return false }
					if (state == 'end') { countdown.destroyPart(); countdown = null; parentPart.nextPage() }
				});
				countdown.layout.removeClass('jqx-hidden basic-hidden'); countdown.run();
				break
			case 'end':
				header.find('button#bitti').remove();
				if (countdown) { countdown.layout?.addClass('jqx-hidden'); countdown.destroyPart(); countdown = null }
				break
		}
	}
}
