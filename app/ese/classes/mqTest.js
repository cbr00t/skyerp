class MQTest extends MQGuidOrtak {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Test' } static get kodListeTipi() { return 'TEST' }
	static get tip() { return this.sablonTip } static get kod() { return this.tip } static get aciklama() { return this.sablonSinif?.aciklama }
	static get table() { return 'esetest' } static get tableAlias() { return 'tst' } static get tanimUISinif() { return ModelTanimPart } static get raporSinif() { return DRapor_ESETest }
	static get sablonSinif() { return null } static get sablonTip() { return this.sablonSinif?.tip } static get testSonucSinif() { return null } static get testGenelSonucSinif() { return null } 
	static get ignoreBelirtecSet() {
		return { ...super.ignoreBelirtecSet,
			...asSet(['muayeneid', 'ortyanlissecimsurems', 'seri', 'fisno', 'doktorid', 'doktoradi', 'uygulanmayeritext', 'ortdogrusecimsurems', 'ortyanlissecimsurems']) }
	}
	static get tip2Sinif() {
		let result = this._tip2Sinif; if (result == null) {
			result = {}; let {subClasses} = this; for (let cls of subClasses) { let {araSeviyemi, tip} = cls; if (!araSeviyemi && tip) { result[tip] = cls } }
			this._tip2Sinif = result
		}
		return result
   }
	static get uiState2Adi() { let {_uiState2Adi: result} = this; if (result == null) { let e = { liste: [] }; this.uiState2AdiDuzenle(e); result = this._uiState2Adi = e.liste } return result }
	static get uiStates() { let {_uiStates: result} = this; if (result == null) { result = this._uiStates = Object.keys(this.uiState2Adi) } return result }

	constructor(e = {}) {
		super(e)
		let { tip } = this.class
		let { belirtec, sablonId } = e
		extend(this, { belirtec, sablonId })
		if (tip && !this.sablonId) {
			let { sablon } = app.params.ese ?? {}
			this.sablonId = sablon?.[tip]?.[0]?.sablonId
		}
	}
	static getClass(e = {}) {
		let tip = isObject(e) ? e.tip : e
		return this.tip2Sinif[tip]
	}
	static newFor(e = {}) {
		e = isObject(e) ? e : { tip: e }
		let cls = this.getClass(e)
		return cls ? new cls(e) : null
	}
	static pTanimDuzenle({ pTanim }) {
		let { tip } = this
		let { maxSecenekSayisi } = MQSablonAnketYanit
		let { ese = {} } = app.params
		
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			muayeneId: new PInstGuid('muayeneid'), hastaId: new PInstGuid('hastaid'), ts: new PInstDate('tarihsaat'),
			dehbVarmi: new PInstBitBool('bdehbvarmi'), dehbVarmi_klinik: new PInstBitBool('bdehbvarmiklinik'), 
			uygulanmaYeri: new PInstTekSecim('uygulanmayeri', MQTestUygulanmaYeri), onayKodu: new PInstNum('onaykodu'),
			aktifYas: new PInstNum('aktifyas'), cinsiyet: new PInstTekSecim('cinsiyet', Cinsiyet),
			notlar: new PInstStr('notlar')
			/*deSkor: new PInstNum('deskor'), hiSkor: new PInstNum('hiskor'), deBelirtiSayi: new PInstNum('debelirtisayi'), hiBelirtiSayi: new PInstNum('hibelirtisayi')*/
		})
		for (let { tip, belirtec, prefix, etiket } of ese) {
			if (tip == 'anket') {
				for (let key of ['Skor', 'BelirtiSayi']) {
					let prefix = belirtec + key;
					pTanim[prefix] = new PInstNum(prefix.toLowerCase())
				}
			}
			pTanim[`${prefix}Yapildimi`] = new PInstBitBool(`b${prefix}yapildi`)
		}
	}
	static secimlerDuzenle(e) {
		let {secimler: sec} = e, {idSaha} = this; sec.grupTopluEkle([ { kod: 'teknik', aciklama: 'Teknik Bilgiler', kapali: true, zeminRenk: 'darkgray' } ]);
		sec.secimTopluEkle({
			/*tamamlandiDurumu: new SecimTekSecim({ etiket: 'Tamamlanma Durumu', tekSecim: new BuDigerVeHepsi([`<span class="forestgreen">Tamamlananlar</span>`, `<span class="darkred">TamamlanMAyanlar</span>`]) }),*/
			tarih: new SecimDate({ etiket: 'Tarih/Saat' }), aktifYas: new SecimInteger({ etiket: 'Aktif Yaş' }),
			sablonAdi: new SecimOzellik({ etiket: 'Şablon Adı' }), hastaAdi: new SecimOzellik({ etiket: 'Hasta İsim' }), doktorIsim: new SecimOzellik({ etiket: 'Doktor İsim' }),
			dehbTutarsizFlag: new SecimBool({ etiket: 'Sadece DEHB Tutarsız olanlar?' }),
			dehbTutarsizKlinikFlag: new SecimBool({ etiket: 'Sadece DEHB Tutarsız olanlar (Klinik Tanı)?' }),
			hastaId: new SecimBasSon({ etiket: 'Hasta', mfSinif: MQHasta, grupKod: 'teknik' }), muayeneId: new SecimBasSon({ etiket: 'Muayene', mfSinif: MQMuayene, grupKod: 'teknik' }),
			notlar: new SecimOzellik({ etiket: 'Notlar' }),
			id: new SecimBasSon({ etiket: 'Test ID', mfSinif: this, grupKod: 'teknik' })
		}).whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {tableAlias: alias} = this;
			/*let tSec = sec.tamamlandiDurumu.tekSecim; if (!tSec.hepsimi) { wh.add(tSec.getBoolBitClause(`${alias}.btamamlandi`)) }*/
			wh.basiSonu({ basi: sec.tarih.basi, sonu: sec.tarih.sonu?.yarin().clone().clearTime() }, `${alias}.tarihsaat`)
			if (sec.dehbTutarsizFlag.value) { wh.add(`${alias}.bdehbvarmi <> ${alias}.bdehbmiozel`) }
			if (sec.dehbTutarsizKlinikFlag.value) { wh.add(`${alias}.bdehbvarmiklinik <> ${alias}.bdehbmiozel`) }
			wh.ozellik(sec.sablonAdi, 'sab.aciklama').basiSonu(sec.aktifYas, `${alias}.aktifyas`).ozellik(sec.hastaAdi, 'has.aciklama').ozellik(sec.doktorAdi, 'dok.aciklama')
			wh.ozellik(sec.notlar, `${alias}.notlar`)
			wh.basiSonu(sec.muayeneId, `${alias}.muayeneid`).basiSonu(sec.hastaId, `${alias}.hastaid`).basiSonu(sec.id, `${alias}.${idSaha}`)
		})
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e)
		let {dataField: belirtec, rec, result} = e
		if (belirtec == 'onaykodu') { result.push('center bold royalblue') }
		if ((belirtec == 'bdehbvarmi' || belirtec == 'bdehbvarmiklinik') && asBool(rec.bdehbvarmi) || (belirtec == 'bdehbmiozel') && asBool(rec.bdehbmiozel))
			result.push('dehb')
		for (let key of ['dogrusayi', 'yanlissayi', 'secilmeyendogrusayi', 'dogrusecimsurems', 'yanlissecimsurems', 'ortdogrusecimsurems', 'ortyanlissecimsurems']) {
			if (belirtec == key) { result.push('cpt') } }
		for (let key of ['deskor', 'debelirtisayi']) { if (belirtec == key) { result.push('anket', 'anket-de') } }
		for (let key of ['hiskor', 'hibelirtisayi']) { if (belirtec == key) { result.push('anket', 'anket-hi') } }
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let { tableAlias: alias } = this, { dev } = config
		liste.push(...[
			( dev ? new GridKolon({ belirtec: 'muayeneid', text: 'Muayene ID', genislikCh: 40 }) : null ),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 11, sql: `${alias}.tarihsaat` }).tipDate(),
			new GridKolon({ belirtec: 'saat', text: 'Saat', genislikCh: 9, sql: `${alias}.tarihsaat` }).tipTime_noSecs().alignCenter()
		].filter(Boolean))
		for (let {prefix, kisaEtiket, sablonId} of app.params.ese) {
			liste.push(
				new GridKolon({ belirtec: `b${prefix}yapildi`, text: `${kisaEtiket}?`, genislikCh: 10, filterType: 'checkedlist' }).tipBool()
			)
		}
		liste.push(...[
			new GridKolon({ belirtec: 'bdehbvarmi', text: 'DEHB?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'bdehbvarmiklinik', text: 'Kln.DEHB?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'bdehbmiozel', text: 'Hes.DEHB?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'onaykodu', text: 'Onay Kodu', genislikCh: 10 }).tipNumerik().sifirGosterme(),
			new GridKolon({ belirtec: 'aktifyas', text: 'Aktif Yaş', genislikCh: 9 }).tipNumerik(),
			new GridKolon({ belirtec: 'cinsiyettext', text: 'Cinsiyet', genislikCh: 8, sql: Cinsiyet.getClause(`${alias}.cinsiyet`) }),
			new GridKolon({ belirtec: 'dogrusayi', text: 'Doğru Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'yanlissayi', text: 'Yanlış Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'secilmeyendogrusayi', text: 'Seçilmeyen Doğru', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'dogrusecimsurems', text: 'Doğru Seçim(ms)', genislikCh: 10 }).tipDecimal(1),
			new GridKolon({ belirtec: 'yanlissecimsurems', text: 'Yanlış Seçim(ms)', genislikCh: 10 }).tipDecimal(1),
			new GridKolon({ belirtec: 'deskor', text: 'DE Skor', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'debelirtisayi', text: 'DE Belirti', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'hiskor', text: 'HI Skor', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'hibelirtisayi', text: 'HI Belirti', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'hastaadi', text: 'Hasta Adı', genislikCh: 35, sql: 'has.aciklama' }),
			new GridKolon({ belirtec: 'doktoradi', text: 'Doktor Adı', genislikCh: 25, sql: 'dok.aciklama' }),
			new GridKolon({ belirtec: 'seri', text: 'Seri', genislikCh: 5, sql: 'mua.seri' }),
			new GridKolon({ belirtec: 'fisno', text: 'No', genislikCh: 17, sql: 'mua.fisno' }).tipNumerik(),
			new GridKolon({ belirtec: 'uygulanmayeritext', text: 'Uygulanma Yeri', genislikCh: 15, sql: MQTestUygulanmaYeri.getClause(`${alias}.uygulanmayeri`) }),
			new GridKolon({ belirtec: 'notlar', text: 'Notlar', genislikCh: 100 })
		].filter(Boolean))
	}
	static loadServerData_queryDuzenle({ tekilOku, stm: { orderBy }, sent, sent: { where: wh, sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments)
		let { tip, tableAlias: alias, sablonSinif, pTanim } = this
		sent.leftJoin({ alias, from: 'esehasta has', on: `${alias}.hastaid = has.id` })
			.leftJoin({ alias, from: 'esemuayene mua', on: `${alias}.muayeneid = mua.id` })
			.leftJoin({ alias: 'mua', from: 'esedoktor dok', on: 'mua.doktorid = dok.id' });
		sahalar.add(
			`${alias}.muayeneid`, `${alias}.hastaid`, 'has.aciklama hastaadi',
			`${alias}.uygulanmayeri`, `${alias}.onaykodu`, `${alias}.cinsiyet`, 'has.email',
			'mua.doktorid', 'dok.aciklama doktoradi'
		)
		
		for (let { prefix } of app.params.ese)
			sahalar.add(`b${prefix}yapildi`)
		
		if (tekilOku) {
			sahalar.liste = sahalar.liste.filter(({ deger: v }) =>
				!v.includes('SUM('))
		}
		else {
			sent.groupByOlustur()
			if (empty(orderBy.liste))
				orderBy.liste = [`${alias}.tarihsaat DESC`]
		}
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e)
		let removeIdSet = asSet(['yeni', 'kopya'])
		let liste = e.liste = e.liste
			.filter(item => !removeIdSet[item.id])
		liste.push(
			{ id: 'testIslemleri', text: 'TEST', handler: _e => this.testIslemleriIstendi({ ...e, ..._e, id: _e.event.currentTarget.id }) },
			{ id: 'eMailGonder', text: 'e-Mail', handler: _e => this.eMailIslemleriIstendi({ ...e, ..._e, id: _e.event.currentTarget.id }) }
		)
	}
	static async rootFormBuilderDuzenle(e) {
		await super.rootFormBuilderDuzenle(e)
		let { aliasVeNokta, idSaha } = this
		let { rootBuilder: rfb, tanimFormBuilder: tanimForm, inst, inst: { id } } = e
		let { dev } = config, fbd_testSonuc
		let rec = (await this.loadServerData({ ozelQueryDuzenle: ({ sent }) =>
			sent.where.degerAta(id, `${aliasVeNokta}${idSaha}`) }))?.[0]
		let getLayout_testSonuc = () => {
			let fbd = fbd_testSonuc
			let {_layout: iframe} = fbd ?? {}
			if (!iframe || isFunction(iframe))
				iframe = $(`<iframe class="full-wh" src="about:blank" border="0" scroll="yes""></iframe>`)
			; (async () => {
				let html, gosterimmi = true
				try { html = await this.getHTML_testSonuc({ rec, gosterimmi }) }
				catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Test Bilgisi Gösterimi') }
				if (!html)
					return
				let {contentDocument: doc} = iframe[0]
				doc.open(); doc.writeln(html); doc.close()
			})()
			return iframe
		}
		/*if (dev) { form.addModelKullan('sablonId', 'Şablon').dropDown().kodsuz().setMFSinif(this.sablonSinif) }*/
		;{
			let form = tanimForm.addFormWithParent().altAlta().addStyle(() => `$elementCSS { margin-top: 40px !important }`)
			let altForm = form.addFormWithParent().yanYana()
			for (let {prefix, etiket} of app.params.ese) {
				altForm.addCheckBox(`${prefix}Yapildimi`, `${etiket} Yapıldı?`)
					.addCSS('testTip-flag testTip')
					.addStyle(`$elementCSS { margin-top: 10px !important }`)
			}
		}
		;{
			let ustForm = tanimForm.addFormWithParent().yanYana()
			{
				let form = ustForm.addFormWithParent().altAlta()
				form.addCheckBox(`dehbVarmi_klinik`, `Tanı: DEHB?`)
					.onBuildEk(({ builder: { input }}) => {
						input.prop('multiple', true)
						input.on('click', ({ currentTarget: target }) => {
							if (this._eventsDisabled)
								return
							this._eventsDisabled = true
							let value = undefined
							try {
								if (target._indeterminate) {
									target.checked =  target._indeterminate = false
									value = false
								}
								else if (!target.checked) {
									target.indeterminate = target._indeterminate = true
									value = null
								}
								else
									value = true
								rec.bdehbvarmiklinik = value
								if (value !== undefined && fbd_testSonuc)
									fbd_testSonuc.setLayout(getLayout_testSonuc())
							}
							finally {
								this._timer_eventsDisabled_reset =
									setTimeout(() => this._eventsDisabled = false, 100)
							}
						})
					})
					.addCSS('testTip-flag testTip').addStyle(
						`$elementCSS { font-size: 150%; margin: 30px 0 13px 27px !important }
						 $elementCSS > input:not(:checked) + label { color: orangered !important }
						 $elementCSS > input:checked + label { color: firebrick !important }`
					)
				form.addDiv('ozetBilgi').etiketGosterim_yok().addCSS('bold gray')
					.addStyle_fullWH(null, 130)
					.addStyle(...[e =>
						`$elementCSS { font-size: 120%; padding: 10px 20px }
						 $elementCSS .onayKodu.veri { text-decoration: unset; margin-left: 10px }
						 $elementCSS .onayKodu.veri:hover, $elementCSS .onayKodu.veri:active { text-decoration: underline !important; cursor: pointer !important }
						 $elementCSS .onayKodu.veri:hover { color: steelblue !important } $elementCSS .onayKodu.veri:active { color: slateblue !important }
						 @media print { $elementCSS .onayKodu-parent { display: none !important } }
					`])
					.onAfterRun(async ({ builder: fbd }) => {
				let {altInst: inst, input} = fbd, {ts, muayeneId, hastaId, sablonId} = inst, {tip} = inst.class;
				let {uygulanmaYeri, onayKodu, aktifYas, dehbVarmi} = inst, cinsiyet = inst.cinsiyet?.char ?? inst.cinsiyet;
				let cinsiyetText = (cinsiyet == 'E' ? 'Erkek' : cinsiyet == 'K' ? 'Kadın' : null);
				let hastaAdi = hastaId ? await MQHasta.getGloKod2Adi(hastaId) : null;
				/*let sablonAdi; if (tip && sablonId) { sablonAdi = (await MQSablon.getClass(tip)?.getGloKod2Adi(sablonId)) || '' }*/
				let muayeneRec; if (muayeneId) { muayeneRec = await new MQMuayene({ id: muayeneId }).tekilOku() }
				uygulanmaYeri = uygulanmaYeri?.char ?? uygulanmaYeri;
				let addItem = (elm, css, style) => {
					if (elm && !elm.html) { elm = $(`<div class="full-width">${elm}</div>`) } if (!elm?.length) { return }
					let parent = $(`<div class="full-width"${style ? ` style="${style}"` : ''}/>`); if (css) { parent.addClass(css) }
					elm.appendTo(parent); parent.appendTo(input)
				};
				/*if (!dev && sablonAdi) { addItem(`<span class="gray etiket">Şablon:</span> <b class="veri forestgreen">${sablonAdi}</b>`, 'flex-row'), `font-size: 130%` }*/
				/*addItem(`${ts ? `<span class="gray etiket">Tarih/Saat:</span> <b class="veri royalblue">${dateTimeAsKisaString(ts)}</b>` : ''} <span style="onayKodu-parent"><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="gray etiket">Onay Kodu:</span> <u class="onayKodu veri bold royalblue">${onayKodu}</u></span>`, null, `margin-top: 30px; cursor: pointer`, 'flex-row');*/
				if ((muayeneRec?.fisnox || '0') != '0')
					addItem(`<span class="gray etiket">Muayene:</span> <b class="veri">${muayeneRec.fisnox}</b>`, 'flex-row')
				/*addItem((
					`<span class="gray">Hasta: <b class="royalblue">${hastaAdi || ''}</b></span>` + (aktifYas ? ` ${hastaAdi ? '- ' : ''}(Yaş: <b class="royalblue">${aktifYas}</b>)` : '') +
					(cinsiyetText ? ` - <b class="royalblue">${cinsiyetText}</b>` : '') + (dehbVarmi ? ` <b class="orangered" style="margin-left: 30px">DEHB</b>` : '')
				), 'flex-row');
				if (uygulanmaYeri) { addItem(`<span class="darkgray etiket">Uygulanma Yeri:</span> <b>${MQTestUygulanmaYeri.kaDict[uygulanmaYeri]?.aciklama || ''}</b> - <b class="gray">${muayeneRec.hastaadi}</b>`, 'flex-row') }*/
				if (onayKodu)
					addItem(`<span class="onayKodu-parent"><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="gray etiket">Onay Kodu:</span> <u class="onayKodu veri bold royalblue">${onayKodu}</u></span>`)
				let elm = input.find('.onayKodu.veri')
				if (elm?.length)
					elm.on('click', evt => { navigator.clipboard.writeText(onayKodu).then(() => eConfirm('Onay Kodu panoya kopyalandı!', this.sinifAdi)) })
			})
			}
			{
				let form = ustForm.addFormWithParent().altAlta()
				form.addTextArea('notlar', 'Notlar').setRows(5).setMaxLength(300)
					.addStyle(`$elementCSS > textarea { color: forestgreen; padding: 8px }`)
			}
		}
		{
			fbd_testSonuc = tanimForm.addForm('testSonuc').autoAppend()
				.addStyle_fullWH(null, 'calc(var(--full) - 650px)')
				.addStyle(e => `$elementCSS { margin-top: -90px; padding: 5px; overflow-y: auto !important; user-select: text !important; cursor: all !important }`)
				.setLayout(e => getLayout_testSonuc({ ...e }))
				.onAfterRun(({ builder: { parent } }) =>
					makeScrollable(parent))
			rfb.islemTuslariArgsDuzenle = ({ args }) => {
				$.extend(args, {
					ekSagButonIdSet: asSet(['yazdir']),
					ekButonlarIlk: [
						{ id: 'yazdir', handler: _e => this.testSonuc_preview({ ...e, ..._e, rec }) }
					]
				})
			}
		}
	}
	async yaz(e) { await super.yaz(e) }
	static async eMailIslemleriIstendi(e) {
		e = e ?? {}; let title = 'e-Mail İşlemleri', {forcedRecs} = e, {ese} = app.params;
		let gridPart = e.gridPart ?? e.parentPart ?? e.sender ?? {};
		(gridPart ?? app.activeWndPart)?.openContextMenu({
			gridPart, title, forcedRecs,
			argsDuzenle: _e => $.extend(_e.wndArgs, { width: Math.min(700, $(window).width() - 50), height: 230 }),
			formDuzenleyici: async _e => {
				delete _e.recs; let {form, close, gridPart} = _e, recs = _e.forcedRecs ?? e.recs ?? gridPart.selectedRecs;
				let testIdListe = recs.map(rec => rec.id); if (!testIdListe?.length) { return false }
				let bitenTestKeySet = {}; for (let rec of recs) {
					for (let { prefix: key } of ese) {
						let value = rec[`b${key}yapildi`];
						if (value) { bitenTestKeySet[key] = true }
					}
				}
				let bitenTestKeys = Object.keys(bitenTestKeySet);
				let yapildimi = !!bitenTestKeys.length, bittimi = bitenTestKeys.length >= Array.from(ese).length;
				form.yanYana().addStyle(e => `$elementCSS { padding-top: 40px }`);
				let addButton = (id, islemAdi, disabled) => {
					let getBody = `getHTML_${id}`, altForm = form.addFormWithParent(id).altAlta();
					altForm.addForm().setLayout(e => $(
						`<h5 class="bold center royalblue" style="padding-bottom: 13px; margin-right: 10px; border-bottom: 1px solid royalblue">${islemAdi || ''}</h5>`));
					let handler = __e => {
						let {id} = __e.builder, args = { ...e, ..._e, ...__e, testIdListe, islemAdi, getBody };
						delete args.id; close(); this.eMailGonderIstendi(args)
					};
					let fbd_btn = altForm.addButton(id, 'e-Mail Gönder').onClick(handler);
					if (disabled) { fbd_btn.disable() }
					return { id, islemAdi, disabled, fbd_btn }
				};
				addButton('testGiris', 'Test Giriş Link', bittimi);
				addButton('testSonuc', 'Test Sonuçları', !yapildimi)
			}
		})
	}
	static async testIslemleriIstendi(e = {}) {
		let title = 'Test İşlemleri', {forcedRecs} = e, {ese} = app.params
		let gridPart = e.gridPart ?? e.parentPart ?? e.sender ?? {}
		;(gridPart ?? app.activeWndPart)?.openContextMenu({
			gridPart, title, forcedRecs,
			argsDuzenle: ({ wndArgs }) =>
				extend(wndArgs, { width: Math.min(1000, $(window).width() - 50), height: 270 }),
			formDuzenleyici: async _e => {
				delete _e.recs
				let {form: ustForm, close, gridPart} = _e
				let recs = _e.forcedRecs ?? e.recs ?? gridPart.selectedRecs
				let idListe = recs.map(rec => rec.id), testId = idListe[0]
				if (empty(idListe))
					return false
				let coklumu = idListe.length > 1
				/*if (coklumu) {
					wConfirm('Sadece bir tane Test seçilmelidir', title)
					return false
				}*/
				if (!coklumu) {
					let bitenTestKeySet = {}
					for (let rec of recs) {
						for (let {prefix: key} of ese) {
							let value = rec[`b${key}yapildi`];
							if (value)
								bitenTestKeySet[key] = true
						}
					}
					let form = ustForm.addFormWithParent().yanYana(2.85)
						.addStyle_wh('var(--full)')
						.addStyle(e => `$elementCSS { padding-top: 40px }`)
					/* let sent = new MQSent({ from, where: { degerAta: testId, saha: idSaha }, sahalar: '*' }) */
					for (let {tip, belirtec, prefix, seq, etiket, sablonId} of ese) {
						let altForm = form.addFormWithParent(prefix).altAlta()
						altForm.addForm().setLayout(e => $(
							`<h5 class="bold center royalblue" style="padding-bottom: 13px; margin-right: 10px; border-bottom: 1px solid royalblue">
								${etiket || ''}
							</h5>`
						))
						let handler = __e => {
							let {id} = __e.builder, parts = id.split('_')
							let [tip, belirtec, selector] = parts, seq = asInteger(parts[2])
							let args = { ...e, ..._e, ...__e, tip, belirtec, seq, testId, sablonId }
							delete args.id; close()
							this[`${selector}Istendi`](args)
						};
						let bittimi = bitenTestKeySet[prefix], text = bittimi ? `<span class="orangered">[ TAMAMLANDI ]</span>` : 'Test Başlat'
						let fbd_btn = altForm.addButton(`${tip}_${belirtec}_testBaslat_${seq}`, text).onClick(handler)
						if (bittimi)
							fbd_btn.disable()
					}
				}
				{
					let form = ustForm.addFormWithParent().yanYana()
						.addStyle_wh(`calc(var(--full) - 27px)`)
					if (coklumu)
						form.addStyle(`$elementCSS { padding-top: 70px; padding-left: 15px }`)
					{
						let fbd = form.addButton('testSonucGoster', 'TEST SONUÇ GÖSTER')
							.addStyle_fullWH('calc(var(--full) - 370px)')
							.onClick(__e => this.testSonucGosterIstendi({ ...e, ..._e, ...__e }))
						if (coklumu)
							fbd.disable()
					}
					{
						let fbd = form.addButton('testDetayGoster', 'ANKET CEVAPLARI GÖSTER')
							.addStyle_fullWH('350px')
							.onClick(__e => this.testAnketCevaplariGosterIstendi({ ...e, ..._e, ...__e }))
						if (empty(recs))
							fbd.disable()
					}
				}
			}
		})
	}
	static async testBaslatIstendi(e) {
		let gridPart = e.gridPart ?? e.parentPart ?? e.sender ?? {}, {tip, sablonId, belirtec} = e, testSinif = MQTest.getClass(tip); if (!testSinif) { return }
		let {sinifAdi} = testSinif, {rec} = e, id = e.testId ?? e.id ?? rec?.testId ?? rec?.testID ?? rec?.testid ?? rec?.id;
		let inst = new testSinif({ id, sablonId, belirtec }), {part} = await inst.baslat(e) || {};
		if (part?.kapaninca) { part.kapaninca(e => gridPart?.tazele()) }
	}
	static async eMailGonderIstendi(e) {
		let {sinifAdi} = this, gridPart = e.gridPart ?? e.parentPart ?? e.sender;
		let {selectedRecs} = gridPart; if (!selectedRecs?.length) { hConfirm('Kayıtlar seçilmelidir', sinifAdi); return null }
		selectedRecs = selectedRecs.filter(({ email: eMail }) => !!eMail && eMail.length >= 5 && eMail.includes('@'));
		if (!selectedRecs?.length) { hConfirm('Seçilenler arasında <u>Geçerli e-Mail Adresi Olan</u> kayıt bulunamadı', sinifAdi); return null }
		let {islemAdi, subject} = e; e.subject = subject = subject ?? `ESE ${islemAdi}`;
		/* if (!await ehConfirm(`Seçilen <b>${selectedRecs.length}</b> adet kişiye <b class="royalblue">${islemAdi}</b> <b>için e-Mail</b> gönderilsin mi?`, sinifAdi)) { return null } */
		e.pAborted = { result: false };
		showProgress(`<b>${selectedRecs.length}</b> kişiye <b class="royalblue">${islemAdi}</b> için <b>e-Mail Gönderimi</b> yapılıyor...`, sinifAdi, true, () => e.pAborted.result = true);
		try {
			let result = await this.eMailGonder({ ...e, recs: selectedRecs, subject });
			eConfirm(`Toplu e-Mail Gönderimi Bitti<p/>` +
				(result?.send ? `<div><span class="darkgray">Başarılı:</span> <b class="green">${result?.send ?? '??'}</b></div>` : '') +
				(result?.error ? `<div><span class="darkgray">Hatalı:</span> <b class="red">${result?.error ?? '??'}</b></div>` : '') +
				((result?.total && !(result.send || result.error)) ? `<div><span class="darkgray">Toplam:</span> <b class="royalblue">${result?.total ?? '??'}</b></div>` : '')
			, sinifAdi);
			return result
		}
		finally { window.progressManager?.progressEnd(); setTimeout(() => hideProgress(), 100) }
	}
	static testSonucGosterIstendi({ gridPart, wnd }) {
		if (wnd?.length)
			wnd.jqxWindow('close')
		// let {selectedRec: rec} = gridPart
		gridPart.degistirIstendi(...arguments)
	}
	static testAnketCevaplariGosterIstendi({ gridPart, wnd }) {
		if (wnd?.length)
			wnd.jqxWindow('close')
		let { selectedRecs: recs } = gridPart
		if (empty(recs))
			return
		let idListe = recs.map(_ => _.id)
		MQTestSonuc.listeEkraniAc({
			secimlerDuzenle: ({ secimler: { testKod } }) => {
				extend(testKod, {
					birKismimi: true,
					value: idListe
				})
			}
		})
	}
	static async eMailGonder(e) {
		let recs = e.recs || [], {pAborted} = e, TopluSayi = 2;
		let promises = [], allResults = { total: 0, send: 0, error: 0 };
		let flush = async () => {
			try {
				if (pAborted?.result) { return }
				let results = await Promise.allSettled(promises);
				for (let result of results) {
					if (!result || result.result === false) { throw {} }
					allResults.send++
				}
			}
			catch (ex) { allResults.error += promises.length; console.error(ex) }
			finally { progressManager?.progressStep(promises.length); allResults.total += promises.length; promises = [] }
		}
		progressManager?.setProgressMax(recs.length);
		let {subject, getBody} = e, eMailAuth = await app.getEMailAuth();
		for (let rec of recs) {
			if (pAborted?.result) { break } let {email: to} = rec;
			let _e = { ...e, rec };
			let body = await (typeof getBody == 'string' ? this[getBody]?.(_e) : getBody?.call(this, _e)); if (!body) { continue }
			promises.push(app.wsEMailGonder({ data: { ...eMailAuth, html: true, to, subject, body }}));
			if (promises.length >= TopluSayi) { await flush() }
		}
		if (promises.length) { await flush() }
		return allResults
	}
	static async getHTML_testGiris({ rec }) {
		let {ese} = app.params, sablonDosya = ese.eMailSablonDosya_testGiris || 'c:/VioData/ESE/ESE.TestGiris.Sablon.htm';
		let dokumcu = await HTMLDokum.FromDosya(sablonDosya);
		let {DefaultWSHostName_SkyServer: wsHostName} = config.class, {email: to, hastaadi: HASTAADI, onaykodu: onayKodu} = rec;
		let URL = `https://${wsHostName}:90/skyerp/app/ese/?ssl&hostname=${wsHostName}&user=${to}&pass=${onayKodu}&`;
		let baslik = { HASTAADI, URL };
		let {result: html} = dokumcu.process({ baslik }) ?? {};
		/* if (config.dev) { let url = URL.createObjectURL(new Blob([html], { type: 'text/html' })); openNewWindow(url) } */
		return html
	}
	static async getHTML_testSonuc({ rec, gosterimmi }) {
		let {isAdmin, params: { ese }} = app
		let sablonDosya = ese.eMailSablonDosya_testGiris || 'c:/VioData/ESE/ESE.TestSonuc.Sablon.htm'
		let dokumcu = await HTMLDokum.FromDosya(sablonDosya)
		let {gecerliTekrarSayi, digerTekrarSayi, toplamTekrarSayi} = MQSablonCPT
		let testTip2Bilgi = {}, uni = new MQUnionAll()
		for (let item of ese) {
			let {tip, prefix, sablonTable, sablonId} = item;
			testTip2Bilgi[prefix] = { ...item };
			switch (tip) {
				case 'cpt': {
					let sent = new MQSent({
						from: sablonTable, where: [ { degerAta: sablonId, saha: 'id' } ],
						sahalar: [
							`${prefix.sqlServerDegeri()} prefix`, `${toplamTekrarSayi.sqlServerDegeri()} soruSayi`,
							`ROUND((baslamaoncesibostams + ((resimbostams + resimgosterimms) * ${toplamTekrarSayi})) / 60000, 0) sureDk`
						]
					}).groupByOlustur(); uni.add(sent);
					break
				}
				case 'anket': {
					let sent = new MQSent({
						from: `${sablonTable} fis`,
						fromIliskiler: [ { from: `${sablonTable}detay har`, iliski: 'har.fisid = fis.id' } ],
						where: [
							{ degerAta: sablonId, saha: 'har.fisid' },
							{ notLike: `#%`, saha: 'har.soru', aynenAlinsin: true }
						],
						sahalar: [`${prefix.sqlServerDegeri()} prefix`, `COUNT(*) soruSayi`, 'fis.suredk sureDk']
					}).groupByOlustur(); uni.add(sent);
					break
				}
			}
		}
		if (uni.liste.length) {
			try {
				let stm = uni.asToplamStm(), recs = await app.sqlExecSelect(stm);
				for (let rec of recs) {
					let {prefix} = rec, item = testTip2Bilgi[prefix];
					if (item) { $.extend(item, rec) }
				}
			}
			catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Test Bilgisi') }
		}
		let {bcptyapildi, banketdeyapildi, bankethiyapildi, notlar} = rec
		let cptYapildimi = asBool(bcptyapildi), anketDEYapildimi = asBool(banketdeyapildi), anketHIYapildimi = asBool(bankethiyapildi)
		let anketYapildimi = banketdeyapildi || bankethiyapildi
		let {tarih, hastaadi: HASTAADI, cinsiyet, aktifyas: YAS, doktoradi: DOKTORADI, uygulanmayeri: UYGTURU} = rec
		let TARIH = dateToString(tarih), KURUMADI = 'ESE', CINSIYET = Cinsiyet.kaDict[cinsiyet]?.aciklama;
		let {dogrusayi, yanlissayi, secilmeyendogrusayi, dogrusecimsurems, yanlissecimsurems} = rec
		if (!cptYapildimi) { dogrusayi = yanlissayi = secilmeyendogrusayi = dogrusecimsurems = yanlissecimsurems = 0 }
		let {debelirtisayi, deskor, hibelirtisayi, hiskor, bdehbvarmi, bdehbvarmiklinik} = rec
		if (!anketDEYapildimi) { debelirtisayi = deskor = 0 }
		if (!anketHIYapildimi) { hibelirtisayi = hiskor = 0 }
		let cpt = testTip2Bilgi.cpt ?? {}, de = testTip2Bilgi.anketde ?? {}, hi = testTip2Bilgi.ankethi ?? {};
		for (let obj of [cpt, de, hi]) { for (let key of ['soruSayi', 'sureDk']) { obj[key] = obj[key] ?? 1 } }
		if (!anketDEYapildimi) { de.soruSayi = de.sureDk = 0 }
		if (!anketHIYapildimi) { hi.soruSayi = hi.sureDk = 0 }
		let {soruSayi, sureDk} = cpt, duySayi = gecerliTekrarSayi, yanlisSayi = digerTekrarSayi;
		let baslik = {
			TARIH, HASTAADI, YAS, CINSIYET, DOKTORADI, KURUMADI, UYGTURU,
			CPT_SIKLIK: toplamTekrarSayi, CPT_ORTSURE: sureDk,
			DOGRU_SAYI: duySayi, DOGRU_DEGER: dogrusayi, DOGRU_YUZDE: duySayi ? roundToFra1(dogrusayi * 100 / duySayi) : 0, DOGRU_ORT_SECIM: dogrusecimsurems,
			SECILMEYEN_DOGRU_SAYI: secilmeyendogrusayi,
			YANLIS_SAYI: yanlisSayi, YANLIS_DEGER: yanlissayi, YANLIS_YUZDE: yanlisSayi ? roundToFra1(yanlissayi * 100 / yanlisSayi) : 0, YANLIS_ORT_SECIM: yanlissecimsurems,
			ANKETDE_ADI: de.etiket, ANKETDE_SORUSAYI: de.soruSayi, ANKETDE_BELIRTISAYI: debelirtisayi, ANKETDE_SKOR: deskor,
			ANKETHI_ADI: hi.etiket, ANKETHI_SORUSAYI: hi.soruSayi, ANKETHI_BELIRTISAYI: hibelirtisayi, ANKETHI_SKOR: hiskor,
			CSS_CPT: cptYapildimi ? '' : ' hidden', CSS_CPT_ERROR: cptYapildimi ? ' hidden' : '',
			STYLE_CPT: '', CSS_CPT_ROW: '',
			CSS_ANKET: anketYapildimi ? '' : ' hidden', CSS_ANKET_ERROR: anketYapildimi ? ' hidden' : '',
			STYLE_ANKET: '', CSS_ANKET_DE: anketDEYapildimi ? '' : ' hidden', CSS_ANKET_HI: anketHIYapildimi ? '' : ' hidden',
			NOTLAR: notlar
		}
		$.extend(baslik, {
			TOPLAM_SORUSAYI: de.soruSayi + hi.soruSayi,
			TOPLAM_BELIRTISAYI: baslik.ANKETDE_BELIRTISAYI + baslik.ANKETHI_BELIRTISAYI,
			TOPLAM_SKOR: baslik.ANKETDE_SKOR + baslik.ANKETHI_SKOR,
			DEHB_SONUC: bdehbvarmiklinik ?? bdehbvarmi ? `<div class="var">VAR</div>` : `<div class="yok">YOK</div>`,
			ASIL_DEHB_SONUC: '', CSS_ASIL_DEHB_SONUC: 'hidden'
		})
		if (gosterimmi && isAdmin) {
			$.extend(baslik, {
				ASIL_DEHB_SONUC: (bdehbvarmi ? `<div class="var">VAR</div>` : `<div class="yok">YOK</div>`),
				CSS_ASIL_DEHB_SONUC: ''
			})
			baslik.DEHB_SONUC = (bdehbvarmiklinik == null ? baslik.ASIL_DEHB_SONUC : (bdehbvarmiklinik ? `<div class="var">VAR</div>` : `<div class="yok">YOK</div>`))
		}
		let {result: html} = dokumcu.process({ baslik }) ?? {};
		/*if (config.dev) { let url = URL.createObjectURL(new Blob([html], { type: 'text/html' })); openNewWindow(url) }*/
		return html
	}
	static baslat(e) {
		let inst = new this({ id: e.testId ?? e.id, belirtec: e.belirtec, sablonId: e.sablonId });
		return inst.baslat(e)
	}
	async baslat(e) {
		let inst = this, {tip} = this.class, {id: testId, sablonId, belirtec} = this;
		clearTimeout(this._timerProgress); this._timerProgress = setTimeout(() => showProgress(), 500);
		try {
			let rec = (await app.wsTestBilgi({ tip, testId, sablonId, belirtec })) || {}; await this.testUI_setValues({ rec });
			let part = new TestPart({ inst }); await part.run(); return { inst, part }
		}
		catch (ex) { hConfirm(getErrorText(ex), this.sinifAdi); throw ex }
		finally { clearTimeout(this._timerProgress); setTimeout(() => hideProgress(), 10) }
	}
	testUI_setValues(e) {
		let {rec} = e; if (!rec) { return }
		let keys = ['sablonID', 'sablonAdi', 'hastaID', 'doktorID', 'hastaAdi', 'doktorAdi'];
		for (let key of keys) { let value = rec[key]; if (value !== undefined) { this[key.replace('ID', 'Id')] = value } }
		$.extend(this, { ts: now(), detaylar: rec.detaylar || [] })
	}
	static uiState2AdiDuzenle({ liste }) {
		$.extend(liste, { home: 'Hoşgeldiniz', test: 'Test Ekranı', end: 'Test Bitti' })
	}
	static async testSonuc_preview({ rec }) {
		let html = await this.getHTML_testSonuc({ rec });
		html = html.replaceAll('</head>', `<script>setTimeout(() => print(), 100)</script></head>`);
		let blob = new Blob([html], { type: 'text/html' });
		let url = URL.createObjectURL(blob);
		let wnd = openNewWindow(url);

	}
	async testUI_initLayout(e) {
		let {parentPart} = e, {header, content} = parentPart; content.children().remove();
		let {ts: tarih, hastaAdi} = this; $.extend(parentPart, { tarih, hastaAdi });
		let {tip, aciklama: tipAdi, uiState2Adi} = this.class, {id: testId, belirtec, sablonAdi} = this;
		let getAdimText = () => { let result = uiState2Adi[state] ?? 'state'; if (sablonAdi /*&& state == 'home'*/) { result = `${tipAdi} <b class="royalblue">${sablonAdi}</b> Testi` } return result }
		let {state} = parentPart; if (state == 'test') { this.genelSonuc = new this.class.testGenelSonucSinif({ tip, testId, belirtec }) }
		$.extend(parentPart, { adimText: getAdimText(), headerText: '' });
		await this.testUI_initLayout_ara(e); state = parentPart.state; parentPart.adimText = getAdimText();
		let btn; switch (state) {
			case 'home':
				requestFullScreen();btn = $(`<button id="baslat">İşleme başla</button>`); btn.jqxButton({ theme });
				btn.on('click', evt => { requestFullScreen(); parentPart.nextPage({ ...e, evt }) }); btn.appendTo(content);
				break
			case 'end':
				let {genelSonuc} = this; if (genelSonuc) {
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
	static { globalThis[this.name] = this; this._key2Class[this.name] = this } static get intervalKatSayi() { return config.dev ? .5: 1 }
	static get sinifAdi() { return 'CPT Test' }  static get testSonucSinif() { return TestSonucCPT } static get testGenelSonucSinif() { return TestGenelSonucCPT }
	static get kodListeTipi() { return 'TSTCPT' } static get sablonSinif() { return MQSablonCPT }
	static get testUyariText() { return `Bu testi <span class="orangered">Çocuk</span> uygulayacaktır` }
	
	testUI_setValues({ rec }) {
		super.testUI_setValues(...arguments)
		if (!rec)
			return
		
		;['gecerliResimSeq', /*'grupTekrarSayisi',*/ 'baslamaOncesiBostaMS', 'resimGosterimMS', 'resimBostaMS'].forEach(k => {
			let v = rec[k]
			if (v !== undefined)
				this[k] = v
		})
		this.baslamaOncesiBostaMS ??= rec.baslamaOncesiMS
		;['baslamaOncesiBostaMS', 'resimGosterimMS'].forEach(k =>
			this[k] ||= 500)
		this.resimBostaMS ||= 0
	}
	async testUI_initLayout_ara(e) {   /* gecerliResimSeq: Bu seq'daki resim görünür olunca ve tıklanınca DOĞRU kabul et */
		await super.testUI_initLayout_ara(e)
		let { dev, session, debug } = config, { isAdmin: admin } = session ?? {}
		let { tip, intervalKatSayi, sablonSinif, testUyariText } = this.class
		let { parentPart } = e, { state, content } = parentPart
		let { id: testId, detaylar, genelSonuc, gecerliResimSeq, baslamaOncesiBostaMS, resimGosterimMS, resimBostaMS } = this
		let erkenYanitMS = 300
		let gecYanitMS = floor(resimBostaMS / 2)
		//let randomizeTime = debug
		let randomizeTime = false
		
		baslamaOncesiBostaMS *= intervalKatSayi
		resimGosterimMS *= intervalKatSayi
		resimBostaMS *= intervalKatSayi
		erkenYanitMS *= intervalKatSayi
		gecYanitMS *= intervalKatSayi
		
		let { gecerliTekrarSayi, digerTekrarSayi, toplamTekrarSayi } = sablonSinif
		let startCounter = 3, orjUrls = detaylar.map(r => r.resimLink)
		let urls = [...orjUrls]
		let { length: imageCount } = urls
		let gecerliResimInd = gecerliResimSeq - 1
		let shuffleOzel = _urls => {
			let secilenUrl = orjUrls[gecerliResimInd]
			let urls = []
			for (let i = 0; i < gecerliTekrarSayi; i++)
				urls.push(secilenUrl)
			
			while (urls.length < toplamTekrarSayi) {
				let rndInd
				do { rndInd = round(random() * 100000) % orjUrls.length }
					while (rndInd == gecerliResimInd)
				urls.push(orjUrls[rndInd])
			}
			urls = shuffle(urls)
			imageCount = urls.length
			return urls
		}

		let keyDownHandler, elmDebug
		switch (state) {
			
			case 'home': {
				let promises = []
				for (let i = 0; i < orjUrls.length; i++)
					promises.push(defer())
				
				let elmContainer = $(`<div class="prefetch-parent" hidden/>`)
				for (let i = 0; i < orjUrls.length; i++) {
					let img = $(`<img class="prefetch" data-index="${i}" src="${urls[i]}"/>`)
					img.appendTo(elmContainer)
					img.on('load', evt => promises[asInteger(evt.currentTarget.dataset.index)].resolve({ result: true, evt }))
					img.on('error', evt => promises[asInteger(evt.currentTarget.dataset.index)].resolve({ result: false, evt }))
				}
				elmContainer.appendTo(content)
				
				let imgStates = { load: 0, error: 0 }
				let results = await promiseAll(promises)
				elmContainer.remove()
				
				;results.forEach(r =>
					imgStates[r.result ? 'load' : 'error']++)
				
				let rightWidth = 250
				let infoHTML = (
					`<p>Biraz sonra Sürekli Performans Testine başlayacaksınız.</p>` +
					`<p>Bu testin amacı, alfabenin sadece belli bir harfine cevap vermektir.</p>` +
					`<p>Alfabenin çeşitli harfleri kısa sürelerle ekranda gözükecektir.<br/>` +
						`Sağ taraftaki resimde gösterilen harfi görür görmez <b>Ara Tuşuna (<i>SPACE</i>)</b> basınız.</p>` +
					`<p>Başka harf görürseniz herhangi bir tuşa basmayınız</p>` +
					`<p>Hazırsanız <b class="royalblue">'İşleme Başla'</b> tuşuna basarak testi başlatınız.</p>` +
					`<p style="font-weight: bold; font-size: 180%; margin-top: 30px">${testUyariText || ''}</p>` +
					`<div style="margin-bottom: 50px"></div>`
				)
				$(`<div class="info float-left wrap-pretty" style="width: calc(var(--full) - (${rightWidth}px + 5px))">${infoHTML}</div>`
					).appendTo(content)
				$(`<div class="target-img-parent float-right full-height" style="width: ${rightWidth}px">` +
					  `Şu resme tıklayınız: <div class="target-img full-wh" style="margin-left: 100px; background-image: url(${orjUrls[gecerliResimInd]})"></div>`
					).appendTo(content)
				/*if (imgStates.error) { hConfirm(`<b>UYARI: </b><p/><div class="darkred"><b>${imgStates.error} adet</b> resim yüklenemedi!</div>`, parentPart.title); return }*/
				break
			}
			
			case 'test': {
				// Önceki çalışmanın zamanlayıcısı ve dinleyicileri bu çalışmaya taşınmasın.
				this._cptCleanup?.()
				clearInterval(this._hInterval)
				delete this._hInterval
				let gecerliResimURL = orjUrls[gecerliResimInd]
				if (!gecerliResimURL || (digerTekrarSayi > 0 && !orjUrls.some(url => url && url != gecerliResimURL)))
					throw new Error('CPT için geçerli hedef ve farklı bir çeldirici resim gereklidir')
				
				if (![baslamaOncesiBostaMS, resimBostaMS].every(ms => Number.isFinite(ms) && ms >= 0) ||
					!Number.isFinite(resimGosterimMS) || resimGosterimMS <= 0)
					throw new Error('CPT süreleri geçerli olmalı; resim gösterim süresi sıfırdan büyük olmalıdır')
				
				urls = shuffleOzel(urls)
				imageCount = urls.length

				let { testSonucSinif } = this.class
				let grupNo = 1
				let testSonuc = genelSonuc.grupNo2Bilgi[grupNo] = new testSonucSinif({ tip, testId })
				let hedefSayi = urls.filter(url => url == gecerliResimURL).length
				for (let [key, toplamSayi] of entries({ dogru: hedefSayi, yanlis: imageCount - hedefSayi })) {
					testSonuc[key].toplamSayi = toplamSayi
					// 'end' adımı grup toplamlarını zaten genel sonuca ekliyor.
					genelSonuc[key].toplamSayi = 0
				}
				genelSonuc.tumSayi = genelSonuc.secilmeyenDogruSayi = 0
				if (admin && debug) {
					let w_etk = '80px', w_veri = '130px'
					let mb = '.5rem'
					elmDebug = $(
						`<div
								class="debug-info"
								style="position: absolute; top: 2rem; left: 2rem; width: 350px; padding: .5rem 1rem; box-shadow: 0 0 5px 0 #eee; z-index: 1010"
						 >
							<div class="_row flex-row dogru" style="margin-bottom: ${mb}">
								<div class="etiket gray" style="width: ${w_etk}">Doğru:</div>
								<div class="veri right bold forestgreen" style="width: ${w_veri}">-</div>
							</div>
							<div class="_row flex-row yanlis" style="margin-bottom: ${mb}">
								<div class="etiket gray" style="width: ${w_etk}">Yanlış:</div>
								<div class="veri right bold firebrick" style="width: ${w_veri}">-</div>
							</div>
							<div class="_row flex-row click" style="margin-bottom: ${mb}">
								<div class="etiket gray" style="width: ${w_etk}">Tıklama:</div>
								<div class="veri right bold royalblue" style="width: ${w_veri}">-</div>
							</div>
							<div class="_row flex-row kalan" style="margin-bottom: ${mb}">
								<div class="etiket gray" style="width: ${w_etk}">Kalan:</div>
								<div class="veri right bold" style="width: ${w_veri}">${imageCount}</div>
							</div>
						</div>`
					).appendTo(content)
				}
				
				let img = $(`<div class="resim"/>`).appendTo(content), imgNode = img[0]
				img.css('touch-action', 'none')
				let index = -1, clickCount = 0
				let denemeler = [], gecerliDeneme = null
				let bekleyenYanitlar = []
				let phase = 'countdown'
				let deadline = performance.now() + 1000 * intervalKatSayi
				let stopped = false, timer, frame
				let basiliTuslar = new Set()
				
				let olcumPaneli
				this._cptTiming = []
				if (elmDebug) {
					olcumPaneli = $(
						`<div
							class="timing"
							style="font-size: 85%; width: 100%; white-space: pre-line;
								   margin-top: .5rem; border-top: 1px solid #666; padding-top: .5rem; pointer-events: none"
						/>`
					).appendTo(elmDebug)
				}
				
				let pointerEvent = typeof window.PointerEvent == 'function' ? 'pointerdown' : null
				let active = () => !parentPart.isDestroyed && parentPart.state == 'test'
				
				let cleanup = () => {
					if (stopped)
						return
					
					stopped = true
					clearInterval(timer)
					cancelAnimationFrame(frame)
					if (this._hInterval === timer)
						delete this._hInterval
					
					document.removeEventListener('keydown', keyDownHandler, true)
					document.removeEventListener('keyup', keyUpHandler, true)
					
					if (pointerEvent)
						imgNode.removeEventListener(pointerEvent, pointerHandler, true)
					else {
						imgNode.removeEventListener('mousedown', pointerHandler, true)
						imgNode.removeEventListener('touchstart', pointerHandler, true)
					}
					
					if (this._cptCleanup === cleanup)
						delete this._cptCleanup
				}
				
				let olayZamani = evt => {
					let time = evt?.timeStamp, simdi = performance.now()
					if (!Number.isFinite(time) || time <= 0)
						return simdi
					
					// Eski tarayıcıların epoch tabanlı olay saatini monoton saate çevir.
					if (time > 1e12)
						time -= performance.timeOrigin
					
					return Number.isFinite(time) && time <= simdi ? time : simdi
				}
				
				let taniYaz = (evt, sonuc, deneme) => {
					if (!olcumPaneli)
						return
					
					let time = olayZamani(evt)
					let simdi = performance.now()
					let secilenDeneme = deneme ?? gecerliDeneme
					let bilgi = {
						tiklama: clickCount, tur: evt.type ?? 'tampon', faz: phase,
						olayMS: time, islemeMS: simdi, beklemeMS: simdi - time,
						resimNo: secilenDeneme ? denemeler.indexOf(secilenDeneme) + 1 : null,
						baslangicaGoreMS: secilenDeneme ? time - secilenDeneme.baslangic : null,
						sonuc
					}

					let { _cptTiming } = this
					_cptTiming.push(bilgi)
					if (_cptTiming.length > 500)
						_cptTiming.shift()
					
					let { baslangicaGoreMS: fark } = bilgi
					olcumPaneli.html([
						`<span class="darkgray">Giriş:</span> <b>${bilgi.tur}</b> <span class="darkestgray">|</span> <span class="darkgray">Aşama:</span> <b>${phase}</b>`,
						`<span class="darkgray">${evt.type ? 'Olay → işleme' : 'Tampon bekleme'}:</span> <b>${bilgi.beklemeMS.toFixed(1)}</b> ms`,
						`<span class="darkgray">Resim: ${bilgi.resimNo ?? '-'}</span> <span class="darkestgray">|</span> <span class="darkgray">Başlangıca göre:</span> <b>${fark == null ? '-' : (fark >= 0 ? '+' : '') + fark.toFixed(1) + '</b> ms'}`,
						`<span class="gray" style="margin-right: .3rem">Sonuç:</span> <b class="cadetblue">${sonuc}</b>`
					].join('\n'))
				}
				
				let yanitEkle = evt => {
					if (stopped || !active())
						return
					
					let time = olayZamani(evt)
					let deneme
					// Kuyrukta geciken giriş, işlendiği resme değil oluştuğu resme aittir.
					for (let i = denemeler.length - 1; i >= 0; i--) {
						let aday = denemeler[i]
						if (time >= aday.baslangic && (aday.bitis == null || time < aday.bitis)) {
							deneme = aday
							break
						}
					}
					
					// Öncelik: görünür resim, önceki resmin geç yanıtı, sonraki resmin erken yanıtı.
					if (!deneme && gecYanitMS > 0) {
						for (let i = denemeler.length - 1; i >= 0; i--) {
							let aday = denemeler[i], sonrakiBaslangic = denemeler[i + 1]?.baslangic ?? Infinity
							if (aday.bitis != null && time >= aday.bitis && time <= aday.bitis + gecYanitMS && time < sonrakiBaslangic) {
								deneme = aday
								break
							}
						}
					}
					if (!deneme) {
						// Önce gerçek görünür aralık aranır; erken pencere önceki resmin yanıtını çalmaz.
						for (let i = denemeler.length - 1; i >= 0; i--) {
							let aday = denemeler[i], oncekiBitis = denemeler[i - 1]?.bitis ?? -Infinity
							if (time >= max(aday.baslangic - erkenYanitMS, oncekiBitis) && time < aday.baslangic) {
								deneme = aday
								break
							}
						}
					}
					
					if (!deneme) {
						// Gelecek resmin gerçek başlangıcı belli olduğunda erken yanıt toleransını doğrula.
						if (/*phase != 'visible' &&*/ index + 1 < imageCount) {
							let altSinir = performance.now() - erkenYanitMS
							bekleyenYanitlar = bekleyenYanitlar.filter(t => t >= altSinir)
							if (time >= altSinir)
								bekleyenYanitlar.push(time)
						}
						taniYaz(evt, bekleyenYanitlar.includes(time) ? 'Sonraki resim için bekliyor' : 'Eşleşen yanıt penceresi yok')
						return
					}
					
					if (deneme.yanitlandi /*|| (deneme.bitis == null && phase != 'visible')*/) {
						taniYaz(evt, deneme.yanitlandi ? 'Bu resim zaten yanıtlandı' : 'Görünür aşamada değil', deneme)
						return
					}
					
					// Görünür aralık ve başlangıçtan önceki tolerans içindeki ilk yanıt sayılır.
					deneme.yanitlandi = true
					let { dogrumu } = deneme
					let gecYanitmi = deneme.bitis != null && time >= deneme.bitis
					taniYaz(evt, (
						( dogrumu ? 'Sayıldı: <b class=forestgreen>doğru</b>' : 'Sayıldı: <b class=firebrick>yanlış</b>' ) +
						( gecYanitmi ? ' &nbsp;(<span class="fs90 normal orangered">geç yanıt</span>)' : '' )
					), deneme)

					let tiklamaTime = max(0, time - deneme.baslangic)
					testSonuc.tiklamaEkle(dogrumu, tiklamaTime)
					if (dogrumu)
						genelSonuc.secilmeyenDogruSayi--
					
					console.info(max(0, time - deneme.baslangic))
					
					if (deneme === gecerliDeneme /* && phase == 'visible'*/) {
						img.removeClass('clicked-dogru clicked-yanlis')
							.addClass(`clicked-${dogrumu ? 'dogru' : 'yanlis'}`)
					}
					
					if (elmDebug) {
						let key = dogrumu ? 'dogru' : 'yanlis'
						elmDebug.find(`.${key} > .veri`).html(testSonuc[key].sayi)
					}
				}

				let yanitTusu = evt => {
					let key = evt.key?.toLowerCase()
					return (
						evt.code == 'Space' || key == ' '
							? 'space'
							: ( key == 'enter' || key == 'linefeed' ? 'enter' : null )
					)
				}
				
				keyDownHandler = evt => {
					if (!active()) {
						cleanup()
						return
					}

					let key = yanitTusu(evt)
					if (!key || evt.isComposing)
						return

					if (elmDebug)
						elmDebug.find('.click > .veri').html(++clickCount)
					
					evt.preventDefault()
					if (evt.repeat || basiliTuslar.has(key)) {
						taniYaz(evt, 'Tuş tekrarı / basılı tuş')
						return
					}
					
					basiliTuslar.add(key)
					yanitEkle(evt)
				}
				
				let keyUpHandler = evt =>
					basiliTuslar.delete(yanitTusu(evt))
				
				let pointerHandler = evt => {
					if (!active()) {
						cleanup()
						return 
					}
					
					if (evt.isPrimary === false || !(evt.button == null || evt.button == 0))
						return
					
					if (evt.type == 'touchstart' && evt.touches?.length > 1)
						return
					
					if (evt.type == 'mousedown' && evt.sourceCapabilities?.firesTouchEvents)
						return

					if (elmDebug)
						elmDebug.find('.click > .veri').html(++clickCount)

					evt.preventDefault()
					yanitEkle(evt)
				}
				
				let sonrakiResim = () => {
					if (elmDebug) {
						let kalan = imageCount - index - 2
						elmDebug.find('.kalan > .veri')
							.html(`<b>${kalan}</b> <span class="lightgray">/</span> <span class="gray">${imageCount}</span>`)
					}
					
					if (index + 1 >= imageCount) {
						// Son resmin gösterim VE yanıt süresi dolduktan sonra yalnızca bir kez bitir.
						cleanup()
						parentPart.nextPage()
						return
					}
					
					phase = 'pending'
					frame = requestAnimationFrame(() => {
						frame = null
						if (stopped || !active()) {
							cleanup()
							return
						}
						
						index++
						let dogrumu = urls[index] == gecerliResimURL
						img.removeClass('clicked-dogru clicked-yanlis')
							.css('background-image', `url(${urls[index]})`)
						
						// Saati çizim karesinde aç; resim hazırlanırken gösterim süresi tükenmesin.
						let baslangic = performance.now()
						gecerliDeneme = { baslangic, bitis: null, dogrumu, yanitlandi: false }
						denemeler.push(gecerliDeneme)
						genelSonuc.tumSayi++
						if (dogrumu)
							genelSonuc.secilmeyenDogruSayi++
						
						phase = 'visible'
						deadline = baslangic + resimGosterimMS
						let erkenYanit = bekleyenYanitlar.find(t => t >= baslangic - erkenYanitMS && t < baslangic)
						if (erkenYanit === undefined && bekleyenYanitlar.length)
							taniYaz({ timeStamp: bekleyenYanitlar[bekleyenYanitlar.length - 1] }, 'Erken yanıt toleransı dışında', gecerliDeneme)
						
						bekleyenYanitlar = []
						if (erkenYanit !== undefined)
							yanitEkle({ timeStamp: erkenYanit })
					})
				}
				
				let loopProc = () => {
					if (stopped)
						return
					
					if (!active()) {
						cleanup()
						return
					}
					
					let time = performance.now()
					if (time < deadline)
						return
					
					switch (phase) {
						case 'countdown':
							if (--startCounter > 0) {
								img.html(`<div class="veri full-wh">${startCounter}</div>`)
								deadline = time + ( 1000 * intervalKatSayi )
								return
							}
							img.html('')
							phase = 'initial'
							deadline = time + baslamaOncesiBostaMS
							if (baslamaOncesiBostaMS > 0)
								return
						case 'initial': {
							sonrakiResim()
							return
						}
						case 'visible': {
							if (frame != null)
								return
							
							frame = requestAnimationFrame(() => {
								frame = null
								if (stopped || !active()) {
									cleanup()
									return
								}

								if (randomizeTime)
									resimBostaMS = (floor(this.resimBostaMS / 3) + ( random() * 550 ) ) * intervalKatSayi

								img.css('background-image', '')
								
								let bitis = performance.now()
								gecerliDeneme.bitis = bitis
								// Son resimde de geç yanıt penceresi dolmadan bitirme.
								let bostaMS = index == imageCount - 1 ? max(resimBostaMS, gecYanitMS) : resimBostaMS
								deadline = bitis + bostaMS

								phase = 'blank'
								if (bostaMS == 0)
									sonrakiResim()
							})
							return
						}
						case 'blank': {
							sonrakiResim()
							break
						}
					}
				}
				
				this._cptCleanup = cleanup
				document.addEventListener('keydown', keyDownHandler, true)
				document.addEventListener('keyup', keyUpHandler, true)
				if (pointerEvent)
					imgNode.addEventListener(pointerEvent, pointerHandler, true)
				else {
					imgNode.addEventListener('mousedown', pointerHandler, true)
					imgNode.addEventListener('touchstart', pointerHandler, { capture: true, passive: false })
				}
				
				img.html(`<div class="veri full-wh">${startCounter}</div>`)
				timer = this._hInterval = setInterval(loopProc, 10)
				break
			}
			
			case 'end': {
				$('body').off('keydown', keyDownHandler)
				if (genelSonuc) {
					values(genelSonuc.grupNo2Bilgi).forEach(testSonuc => {
						genelSonuc.totalEkle(testSonuc)
						testSonuc.ortalamaOlustur()
					})
					genelSonuc.ortalamaOlustur()
				}
				break
			}
			
			/*case 'end': {
				let { result } = this.testResult
				if (result != null) {
					$(`<div class="resultText ${result ? 'green' : 'red'}">${result ? 'Başarılı' : 'Hatalı'}</div>`).appendTo(content) }
				break
			}*/
			
		}
	}
}

class MQTestAnket extends MQTest {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Anket Test' } static get testSonucSinif() { return TestSonucAnket } static get testGenelSonucSinif() { return TestGenelSonucAnket }
	static get kodListeTipi() { return 'TSTANKET' } static get sablonSinif() { return MQSablonAnket }
	static get testUyariText() { return `Bu testi <span class="orangered">Ebeveyn</span> uygulayacaktır` }
	testUI_setValues(e) {
		super.testUI_setValues(e); let {rec} = e; if (!rec) { return }
		let keys = ['sureDk', 'yanitID'], PrefixSecenek = 'secenek', PrefixYanit = 'yanit';
		for (let key of keys) { let value = rec[key]; if (value !== undefined) { this[key] = value } }
		for (let [key, value] of Object.entries(rec)) {
			if (key.startsWith(PrefixSecenek) || key.startsWith(PrefixYanit)) {
				let value = rec[key]; if (value !== undefined) { this[key] = value } }
		}
	}
	async testUI_initLayout_ara(e) {   /* gecerliResimSeq: Bu seq'daki resim görünür olunca ve tıklanınca DOĞRU kabul et */
		await super.testUI_initLayout_ara(e); let {parentPart} = e, {state, header, content, islemTuslari} = parentPart;
		let {detaylar} = this, PrefixSecenek = 'secenek', PrefixYanit = 'yanit';
		let rec = detaylar[0], secenekler = []; for (let key of Object.keys({ ...this, ...rec })) {
			if (key.startsWith(PrefixSecenek) || key.startsWith(PrefixYanit)) {
				let value = (rec[key] ?? this[key])?.trimEnd?.();
				if (value) { secenekler[asInteger(key.slice(PrefixSecenek.length)) - 1] = value }
			}
		} 
		let id2Soru = {}; for (let det of detaylar) { let {id, soru} = det; if (soru == null) { continue } soru = soru.trimEnd(); id2Soru[id] = soru }
		let {genelSonuc, testId, sureDk} = this, {tip, testSonucSinif, testUyariText} = this.class;
		let soruSayi = Object.values(id2Soru).filter(x => x && x[0] != '#').length;
		let htmlList = [], countdown;
		switch (state) {
			case 'home':
				let infoHTML = (
					`<p>Test Anket şeklinde verilecektir.<br>` +
						`<b class="royalblue">${secenekler.join(', ')}</b> şeklinde yanıtlar verilmelidir.</p>` +
					`<p>Anket <b class="royalblue">${soruSayi}</b> sorudan oluşmaktadır ve başladıktan sonra <b class="forestgreen">${sureDk} dakika</b> içinde tamamlanmalıdır.</p>` +
					`<p>Hazırsanız <b class="royalblue">'İşleme Başla'</b> tuşuna basarak testi başlatınız.</p>` +
					`<p style="font-weight: bold; font-size: 180%; margin-top: 30px">${testUyariText || ''}</p>` +
					`<div style="margin-bottom: 50px"></div>`
				);
				$(`<div class="info wrap-pretty full-width">${infoHTML}</div>`).appendTo(content);
				break
			case 'test':
				genelSonuc.tumSayi = soruSayi;
				let btn = $(`<button id="bitti">TEST BİTTİ ise Buraya tıklayınız</button>`); btn.jqxButton({ theme }).on('click', evt => {
					if (genelSonuc.cevapsizSayi) { hConfirm(`<b class="firebrick">Tüm soruları cevaplamalısınız</b>`, 'Uyarı'); return }
					countdown?.destroyPart(); countdown = null; delete this._countdown;
					if (genelSonuc) { for (let testSonuc of Object.values(genelSonuc.soruId2Cevap)) { genelSonuc.totalEkle(testSonuc) } }
					parentPart.nextPage()
				}); btn.appendTo(header);
				let id2Grup = {}, grupId2Id2Soru = {}, _id2Soru = {};
				let grup = { id: '_default', text: '' }; id2Grup[grup.id] = grup;
				for (let [id, soru] of Object.entries(id2Soru)) {
					if (!soru) { continue } _id2Soru[id] = soru;
					if (soru[0] == '#') {
						let text = soru.slice(1).trimStart(); id2Grup[id] = grup = { id, text };
						continue
					}
					(grupId2Id2Soru[grup.id] = grupId2Id2Soru[grup.id] ?? {})[id] = soru
				}
				htmlList.push(`<div class="anket">`);
				for (let [grupId, id2Soru] of Object.entries(grupId2Id2Soru)) {
					let grup = id2Grup[grupId], {text} = grup;
					htmlList.push(`<div class="grup">`, `<div class="etiket">${text}</div>`);
					for (let [id, soru] of Object.entries(id2Soru)) {
						htmlList.push(`<div class="item flex-row" data-id="${id}"><div class="soru">${soru || '&nbsp;'}</div><div name="${id}" class="secenekler">`);
						for (let i = 0; i < secenekler.length; i++) { htmlList.push(`<button class="secenek">${secenekler[i]}</button>`) }
						htmlList.push(`</div></div>`)
					}
					htmlList.push(`</div>`)
				}
				htmlList.push(`</div>`);
				$(htmlList.join('')).appendTo(content); makeScrollable(content.find('.anket'));
				content.find('.anket .item > .secenekler').jqxButtonGroup({ theme, mode: 'radio' }).on('buttonclick', evt => {
					let {index} = evt.args; if (index == null) { return } index = asInteger(index); let seq = index + 1;
					let soruId = $(evt.currentTarget).parents('.item').data('id'); if (!soruId) { return }
					genelSonuc.soruId2Cevap[soruId] = { soru: id2Soru[soruId], index, puan: this[`yanit${seq}Puan`] }
				});
				if (countdown) { countdown.abort() }
				countdown = this._countdown = new Countdown({ totalSecs: sureDk * 60, layout: parentPart.headerLayouts.countdown });
				countdown.onCallback(({sender, state}) => {
					if (parentPart?.isDestroyed || countdown == null) { sender.destroyPart(e); return false }
					if (state == 'end') { countdown.destroyPart(); countdown = null; parentPart.nextPage() }
				});
				countdown.layout.removeClass('jqx-hidden basic-hidden'); countdown.run();
				break
			case 'end':
				header.find('button#bitti').remove();
				if (countdown) { countdown.layout?.addClass('jqx-hidden'); countdown.destroyPart(); countdown = null; delete this._countdown }
				break
		}
	}
}
