class MQTest extends MQGuidOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
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
			result = {}; const {subClasses} = this; for (const cls of subClasses) { const {araSeviyemi, tip} = cls; if (!araSeviyemi && tip) { result[tip] = cls } }
			this._tip2Sinif = result
		}
		return result
   }
	static get uiState2Adi() { let {_uiState2Adi: result} = this; if (result == null) { let e = { liste: [] }; this.uiState2AdiDuzenle(e); result = this._uiState2Adi = e.liste } return result }
	static get uiStates() { let {_uiStates: result} = this; if (result == null) { result = this._uiStates = Object.keys(this.uiState2Adi) } return result }

	constructor(e) {
		e = e || {}; super(e); const {tip} = this.class, {belirtec, sablonId} = e; $.extend(this, { belirtec, sablonId });
		if (tip && !this.sablonId) { const {sablon} = app.params.ese || {}; this.sablonId = sablon?.[tip]?.[0]?.sablonId }
	}
	static getClass(e) { const tip = typeof e == 'object' ? e.tip : e; return this.tip2Sinif[tip] }
	static newFor(e) { if (typeof e != 'object') { e = { tip: e } } const cls = this.getClass(e); return cls ? new cls(e) : null }
	static pTanimDuzenle(e) {
		const {tip} = this, {maxSecenekSayisi} = MQSablonAnketYanit; super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			muayeneId: new PInstGuid('muayeneid'), hastaId: new PInstGuid('hastaid'), ts: new PInstDate('tarihsaat'), dehbVarmi: new PInstBitBool('bdehbvarmi'),
			uygulanmaYeri: new PInstTekSecim('uygulanmayeri', MQTestUygulanmaYeri), onayKodu: new PInstNum('onaykodu'), aktifYas: new PInstNum('aktifyas'), cinsiyet: new PInstTekSecim('cinsiyet', Cinsiyet)
			/*deSkor: new PInstNum('deskor'), hiSkor: new PInstNum('hiskor'), deBelirtiSayi: new PInstNum('debelirtisayi'), hiBelirtiSayi: new PInstNum('hibelirtisayi')*/
		});
		for (const {tip, belirtec, prefix, etiket} of app.params.ese) {
			if (tip == 'anket') { for (const key of ['Skor', 'BelirtiSayi']) { const prefix = belirtec + key; pTanim[prefix] = new PInstNum(prefix.toLowerCase()) } }
			pTanim[`${prefix}Yapildimi`] = new PInstBitBool(`b${prefix}yapildi`)
		}
	}
	static secimlerDuzenle(e) {
		const {secimler: sec} = e, {idSaha} = this; sec.grupTopluEkle([ { kod: 'teknik', aciklama: 'Teknik Bilgiler', kapali: true, zeminRenk: 'darkgray' } ]);
		sec.secimTopluEkle({
			/*tamamlandiDurumu: new SecimTekSecim({ etiket: 'Tamamlanma Durumu', tekSecim: new BuDigerVeHepsi([`<span class="forestgreen">Tamamlananlar</span>`, `<span class="darkred">TamamlanMAyanlar</span>`]) }),*/
			tarih: new SecimDate({ etiket: 'Tarih/Saat' }), aktifYas: new SecimInteger({ etiket: 'Aktif Yaş' }),
			sablonAdi: new SecimOzellik({ etiket: 'Şablon Adı' }), hastaAdi: new SecimOzellik({ etiket: 'Hasta İsim' }), doktorIsim: new SecimOzellik({ etiket: 'Doktor İsim' }),
			dehbTutarsizFlag: new SecimBool({ etiket: 'Sadece DEHB Tutarsız olanlar?' }),
			hastaId: new SecimBasSon({ etiket: 'Hasta', mfSinif: MQHasta, grupKod: 'teknik' }), muayeneId: new SecimBasSon({ etiket: 'Muayene', mfSinif: MQMuayene, grupKod: 'teknik' }),
			id: new SecimBasSon({ etiket: 'Test ID', mfSinif: this, grupKod: 'teknik' })
		}).whereBlockEkle(({ secimler: sec, where: wh }) => {
			const {tableAlias: alias} = this;
			/*let tSec = sec.tamamlandiDurumu.tekSecim; if (!tSec.hepsimi) { wh.add(tSec.getBoolBitClause(`${alias}.btamamlandi`)) }*/
			wh.basiSonu({ basi: sec.tarih.basi, sonu: sec.tarih.sonu?.yarin().clone().clearTime() }, `${alias}.tarihsaat`);
			if (sec.dehbTutarsizFlag.value) { wh.add(`${alias}.bdehbvarmi <> ${alias}.bdehbmiozel`) }
			wh.ozellik(sec.sablonAdi, 'sab.aciklama').basiSonu(sec.aktifYas, `${alias}.aktifyas`).ozellik(sec.hastaAdi, 'has.aciklama').ozellik(sec.doktorAdi, 'dok.aciklama');
			wh.basiSonu(sec.muayeneId, `${alias}.muayeneid`).basiSonu(sec.hastaId, `${alias}.hastaid`).basiSonu(sec.id, `${alias}.${idSaha}`)
		})
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {dataField: belirtec, rec, result} = e;
		if (belirtec == 'onaykodu') { result.push('center bold royalblue') }
		if ((belirtec == 'bdehbvarmi' && asBool(rec.bdehbvarmi)) || belirtec == 'bdehbmiozel' && asBool(rec.bdehbmiozel)) { result.push('dehb') }
		for (const key of ['dogrusayi', 'yanlissayi', 'secilmeyendogrusayi', 'dogrusecimsurems', 'yanlissecimsurems', 'ortdogrusecimsurems', 'ortyanlissecimsurems']) {
			if (belirtec == key) { result.push('cpt') } }
		for (const key of ['deskor', 'debelirtisayi']) { if (belirtec == key) { result.push('anket', 'anket-de') } }
		for (const key of ['hiskor', 'hibelirtisayi']) { if (belirtec == key) { result.push('anket', 'anket-hi') } }
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, {dev} = config;
		const {liste} = e; liste.push(...[
			(dev ? new GridKolon({ belirtec: 'muayeneid', text: 'Muayene ID', genislikCh: 40 }) : null),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 10, sql: `${alias}.tarihsaat` }).tipDate(),
			new GridKolon({ belirtec: 'saat', text: 'Saat', genislikCh: 9, sql: `${alias}.tarihsaat` }).tipTime()
		].filter(x => !!x));
		for (const {prefix, kisaEtiket, sablonId} of app.params.ese) {
			liste.push(new GridKolon({ belirtec: `b${prefix}yapildi`, text: `${kisaEtiket}?`, genislikCh: 10, filterType: 'checkedlist' }).tipBool()) }
		liste.push(...[
			new GridKolon({ belirtec: 'bdehbvarmi', text: 'DEHB?', genislikCh: 8 }).tipBool(), new GridKolon({ belirtec: 'bdehbmiozel', text: 'Hes.DEHB?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'onaykodu', text: 'Onay Kodu', genislikCh: 10 }).tipNumerik().sifirGosterme(),
			new GridKolon({ belirtec: 'aktifyas', text: 'Aktif Yaş', genislikCh: 9 }).tipNumerik(),
			new GridKolon({ belirtec: 'cinsiyettext', text: 'Cinsiyet', genislikCh: 8, sql: Cinsiyet.getClause(`${alias}.cinsiyet`) }),
			new GridKolon({ belirtec: 'dogrusayi', text: 'Doğru Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'yanlissayi', text: 'Yanlış Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'secilmeyendogrusayi', text: 'Seçilmeyen Doğru', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'dogrusecimsurems', text: 'Doğru Seçim(ms)', genislikCh: 10 }).tipDecimal(1),
			new GridKolon({ belirtec: 'yanlissecimsurems', text: 'Yanlış Seçim(ms)', genislikCh: 10 }).tipDecimal(1),
			new GridKolon({ belirtec: 'ortdogrusecimsurems', text: 'Ort. Doğru Seçim(ms)', genislikCh: 10, sql: `(case when ${alias}.dogrusayi = 0 then 0 else ROUND(SUM(${alias}.dogrusecimsurems) / SUM(${alias}.dogrusayi), 1) end)` }).tipDecimal(1),
			new GridKolon({ belirtec: 'ortyanlissecimsurems', text: 'Ort. Yanlış Seçim(ms)', genislikCh: 10, sql: `(case when ${alias}.yanlissayi = 0 then 0 else ROUND(SUM(${alias}.yanlissecimsurems) / SUM(${alias}.yanlissayi), 1) end)` }).tipDecimal(1),
			new GridKolon({ belirtec: 'deskor', text: 'DE Skor', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'debelirtisayi', text: 'DE Belirti', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'hiskor', text: 'HI Skor', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'hibelirtisayi', text: 'HI Belirti', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'hastaadi', text: 'Hasta Adı', genislikCh: 40, sql: 'has.aciklama' }),
			new GridKolon({ belirtec: 'doktoradi', text: 'Doktor Adı', genislikCh: 40, sql: 'dok.aciklama' }),
			new GridKolon({ belirtec: 'seri', text: 'Seri', genislikCh: 5, sql: 'mua.seri' }),
			new GridKolon({ belirtec: 'fisno', text: 'No', genislikCh: 17, sql: 'mua.fisno' }).tipNumerik(),
			new GridKolon({ belirtec: 'uygulanmayeritext', text: 'Uygulanma Yeri', genislikCh: 15, sql: MQTestUygulanmaYeri.getClause(`${alias}.uygulanmayeri`) })
		].filter(x => !!x))
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tip, tableAlias: alias, sablonSinif, pTanim} = this;
		sent.leftJoin({ alias, from: 'esehasta has', on: `${alias}.hastaid = has.id` })
			.leftJoin({ alias, from: 'esemuayene mua', on: `${alias}.muayeneid = mua.id` })
			.leftJoin({ alias: 'mua', from: 'esedoktor dok', on: 'mua.doktorid = dok.id' });
		sent.sahalar.add(`${alias}.muayeneid`, `${alias}.hastaid`, 'has.aciklama hastaadi', `${alias}.uygulanmayeri`, `${alias}.onaykodu`, `${alias}.cinsiyet`, 'has.email');
		for (const {prefix} of app.params.ese) { sent.sahalar.add(`b${prefix}yapildi`) }
		if (e.tekilOku) { const {sahalar} = sent; sahalar.liste = sahalar.liste.filter(({ deger }) => !deger.includes('SUM(')) }
		else { sent.groupByOlustur() }
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); const removeIdSet = asSet(['yeni', 'kopya']);
		let {liste} = e; liste = e.liste = liste.filter(item => !removeIdSet[item.id]);
		liste.push(
			{ id: 'testIslemleri', text: 'TEST', handler: _e => this.testIslemleriIstendi({ ...e, ..._e, id: _e.event.currentTarget.id }) },
			{ id: 'eMailGonder', text: 'e-Mail', handler: _e => this.eMailIslemleriIstendi({ ...e, ..._e, id: _e.event.currentTarget.id }) }
		)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const {tanimFormBuilder: tanimForm} = e, {dev} = config;
		let form = tanimForm.addFormWithParent().altAlta().addStyle(() => `$elementCSS { margin-top: 40px !important }`);
		/*if (dev) { form.addModelKullan('sablonId', 'Şablon').dropDown().kodsuz().setMFSinif(this.sablonSinif) }*/
		let altForm = form.addFormWithParent().yanYana(); for (const {prefix, etiket} of app.params.ese) {
			altForm.addCheckBox(`${prefix}Yapildimi`, `${etiket} Yapıldı?`).addCSS('testTip-flag testTip').addStyle(e => `$elementCSS { margin-top: 10px !important }`) }
		tanimForm.addDiv('ozetBilgi').etiketGosterim_yok().addCSS('bold gray')
			.addStyle_fullWH(null, 130)
			.addStyle(...[e =>
				`$elementCSS { font-size: 120%; padding: 10px 20px }
				 $elementCSS .onayKodu.veri { text-decoration: unset; margin-left: 10px }
				 $elementCSS .onayKodu.veri:hover, $elementCSS .onayKodu.veri:active { text-decoration: underline !important; cursor: pointer !important }
				 $elementCSS .onayKodu.veri:hover { color: steelblue !important } $elementCSS .onayKodu.veri:active { color: slateblue !important }
				 @media print { $elementCSS .onayKodu-parent { display: none !important } }
			`])
			.onAfterRun(async ({ builder: fbd }) => {
				const {altInst: inst, input} = fbd, {ts, muayeneId, hastaId, sablonId} = inst, {tip} = inst.class;
				let {uygulanmaYeri, onayKodu, aktifYas, dehbVarmi} = inst, cinsiyet = inst.cinsiyet?.char ?? inst.cinsiyet;
				let cinsiyetText = (cinsiyet == 'E' ? 'Erkek' : cinsiyet == 'K' ? 'Kadın' : null);
				let hastaAdi = hastaId ? await MQHasta.getGloKod2Adi(hastaId) : null;
				/*let sablonAdi; if (tip && sablonId) { sablonAdi = (await MQSablon.getClass(tip)?.getGloKod2Adi(sablonId)) || '' }*/
				let muayeneRec; if (muayeneId) { muayeneRec = await new MQMuayene({ id: muayeneId }).tekilOku() }
				uygulanmaYeri = uygulanmaYeri?.char ?? uygulanmaYeri;
				const addItem = (elm, css, style) => {
					if (elm && !elm.html) { elm = $(`<div class="full-width">${elm}</div>`) } if (!elm?.length) { return }
					let parent = $(`<div class="full-width"${style ? ` style="${style}"` : ''}/>`); if (css) { parent.addClass(css) }
					elm.appendTo(parent); parent.appendTo(input)
				};
				/*if (!dev && sablonAdi) { addItem(`<span class="gray etiket">Şablon:</span> <b class="veri forestgreen">${sablonAdi}</b>`, 'flex-row'), `font-size: 130%` }*/
				/*addItem(`${ts ? `<span class="gray etiket">Tarih/Saat:</span> <b class="veri royalblue">${dateTimeAsKisaString(ts)}</b>` : ''} <span style="onayKodu-parent"><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="gray etiket">Onay Kodu:</span> <u class="onayKodu veri bold royalblue">${onayKodu}</u></span>`, null, `margin-top: 30px; cursor: pointer`, 'flex-row');*/
				if ((muayeneRec?.fisnox || '0') != '0') { addItem(`<span class="gray etiket">Muayene:</span> <b class="veri">${muayeneRec.fisnox}</b>`, 'flex-row') }
				/*addItem((
					`<span class="gray">Hasta: <b class="royalblue">${hastaAdi || ''}</b></span>` + (aktifYas ? ` ${hastaAdi ? '- ' : ''}(Yaş: <b class="royalblue">${aktifYas}</b>)` : '') +
					(cinsiyetText ? ` - <b class="royalblue">${cinsiyetText}</b>` : '') + (dehbVarmi ? ` <b class="orangered" style="margin-left: 30px">DEHB</b>` : '')
				), 'flex-row');
				if (uygulanmaYeri) { addItem(`<span class="darkgray etiket">Uygulanma Yeri:</span> <b>${MQTestUygulanmaYeri.kaDict[uygulanmaYeri]?.aciklama || ''}</b> - <b class="gray">${muayeneRec.hastaadi}</b>`, 'flex-row') }*/
				if (onayKodu) { addItem(`<span class="onayKodu-parent"><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="gray etiket">Onay Kodu:</span> <u class="onayKodu veri bold royalblue">${onayKodu}</u></span>`) }
				let elm = input.find('.onayKodu.veri'); if (elm?.length) {
					elm.on('click', evt => { navigator.clipboard.writeText(onayKodu).then(() => eConfirm('Onay Kodu panoya kopyalandı!', this.sinifAdi)) }) }
			});
		tanimForm.addDiv('testSonuc').etiketGosterim_yok()
			.addStyle_fullWH(null, `calc(var(--full) - 75px)`)
			.addStyle(e => `$elementCSS { margin-top: -90px; padding: 5px; overflow-y: auto !important; user-select: text !important; cursor: all !important }`)
			.onAfterRun(async ({ builder: fbd, rootPart }) => {
				let {layout, input, inst} = fbd, {id} = inst, {aliasVeNokta, idSaha} = this;
				let rec = (await this.loadServerData({ ozelQueryDuzenle: ({ sent }) => sent.where.degerAta(id, `${aliasVeNokta}${idSaha}`) }))?.[0];
				let html; try { html = await this.getHTML_testSonuc({ rec }) }
				catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Test Bilgisi Gösterimi') }
				input.html(html); makeScrollable(layout)
			})
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
	static async testIslemleriIstendi(e) {
		e = e ?? {}; let title = 'Test İşlemleri', {forcedRecs} = e, {ese} = app.params;
		let gridPart = e.gridPart ?? e.parentPart ?? e.sender ?? {};
		(gridPart ?? app.activeWndPart)?.openContextMenu({
			gridPart, title, forcedRecs,
			argsDuzenle: _e => $.extend(_e.wndArgs, { width: Math.min(1100, $(window).width() - 50), height: 230 }),
			formDuzenleyici: async _e => {
				delete _e.recs; let {form, close, gridPart} = _e, recs = _e.forcedRecs ?? e.recs ?? gridPart.selectedRecs;
				let idListe = recs.map(rec => rec.id), testId = idListe[0];
				if (!idListe?.length) { return } if (idListe?.length > 1) { hConfirm('Sadece bir tane Test seçilmelidir', title); return false }
				let bitenTestKeySet = {}; for (let rec of recs) {
					for (let {prefix: key} of ese) {
						let value = rec[`b${key}yapildi`];
						if (value) { bitenTestKeySet[key] = true }
					}
				}
				form.yanYana().addStyle(e => `$elementCSS { padding-top: 40px }`);
				/* let sent = new MQSent({ from, where: { degerAta: testId, saha: idSaha }, sahalar: '*' }) */
				for (let {tip, belirtec, prefix, seq, etiket, sablonId} of ese) {
					let altForm = form.addFormWithParent(prefix).altAlta();
					altForm.addForm().setLayout(e => $(
						`<h5 class="bold center royalblue" style="padding-bottom: 13px; margin-right: 10px; border-bottom: 1px solid royalblue">${etiket || ''}</h5>`));
					let handler = __e => {
						let {id} = __e.builder, parts = id.split('_'), [tip, belirtec, selector] = parts, seq = asInteger(parts[2]);
						let args = { ...e, ..._e, ...__e, tip, belirtec, seq, testId, sablonId }; delete args.id;
						close(); this[`${selector}Istendi`](args)
					};
					let bittimi = bitenTestKeySet[prefix], text = bittimi ? `<span class="orangered">[ TAMAMLANDI ]</span>` : 'Test Başlat';
					let fbd_btn = altForm.addButton(`${tip}_${belirtec}_testBaslat_${seq}`, text).onClick(handler)
					if (bittimi) { fbd_btn.disable() }
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
		let {ese} = app.params, sablonDosya = ese.eMailSablonDosya_testGiris || '/VioData/ESE/ESE.TestGiris.Sablon.htm';
		let dokumcu = await HTMLDokum.FromDosya(sablonDosya);
		let {DefaultWSHostName_SkyServer: wsHostName} = config.class, {email: to, hastaadi: HASTAADI, onaykodu: onayKodu} = rec;
		let URL = `https://${wsHostName}:90/skyerp/app/ese/?ssl&hostname=${wsHostName}&user=${to}&pass=${onayKodu}&`;
		let baslik = { HASTAADI, URL };
		let {result: html} = dokumcu.process({ baslik }) ?? {};
		if (config.dev) { let url = URL.createObjectURL(new Blob([html], { type: 'text/html' })); openNewWindow(url) }
		return html
	}
	static async getHTML_testSonuc({ rec }) {
		let {ese} = app.params, sablonDosya = ese.eMailSablonDosya_testGiris || '/VioData/ESE/ESE.TestSonuc.Sablon.htm';
		let dokumcu = await HTMLDokum.FromDosya(sablonDosya);
		let {gecerliTekrarSayi, digerTekrarSayi, toplamTekrarSayi} = MQSablonCPT;
		let testTip2Bilgi = {}, uni = new MQUnionAll(); for (let item of ese) {
			let {tip, prefix, sablonTable, sablonId} = item;
			testTip2Bilgi[prefix] = { ...item };
			switch (tip) {
				case 'cpt': {
					let sent = new MQSent({
						from: sablonTable, where: [ { degerAta: sablonId, saha: 'id' } ],
						sahalar: [
							`${prefix.sqlServerDegeri()} prefix`, `(resimsayisi * gruptekrarsayisi) soruSayi`,
							`ROUND((baslamaoncesibostams + ((resimbostams + resimgosterimms + resimarasisn * 1000) * resimsayisi * ${toplamTekrarSayi})) / 60000, 0) sureDk`
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
		let {tarih, hastaadi: HASTAADI, cinsiyet, aktifyas: YAS, doktoradi: DOKTORADI, uygulanmayeri: UYGTURU} = rec;
		let TARIH = dateToString(tarih), KURUMADI = 'ESE', CINSIYET = Cinsiyet.kaDict[cinsiyet]?.aciklama;
		let {dogrusayi, yanlissayi, secilmeyendogrusayi, dogrusecimsurems, yanlissecimsurems} = rec;
		let {debelirtisayi, deskor, hibelirtisayi, hiskor} = rec;
		let cpt = testTip2Bilgi.cpt ?? {}, de = testTip2Bilgi.anketde ?? {}, hi = testTip2Bilgi.ankethi ?? {};
		for (let obj of [cpt, de, hi]) { for (let key of ['soruSayi', 'sureDk']) { obj[key] = obj[key] ?? 1 } }
		let {soruSayi, sureDk} = cpt, duySayi = gecerliTekrarSayi, yanlisSayi = digerTekrarSayi;
		let baslik = {
			TARIH, HASTAADI, YAS, CINSIYET, DOKTORADI, KURUMADI, UYGTURU,
			CPT_SIKLIK: toplamTekrarSayi, CPT_ORTSURE: sureDk,
			DUY_SAYI: duySayi, DUY_DEGER: dogrusayi, DUY_YUZDE: roundToFra1(dogrusayi * 100 / duySayi), DUY_ORT_SECIM: dogrusecimsurems,
			YANLIS_SAYI: yanlisSayi, YANLIS_DEGER: yanlissayi, YANLIS_YUZDE: roundToFra1(yanlissayi * 100 / yanlisSayi), YANLIS_ORT_SECIM: yanlissecimsurems,
			ANKETDE_ADI: de.etiket, ANKETDE_SORUSAYI: de.soruSayi, ANKETDE_BELIRTISAYI: debelirtisayi, ANKETDE_SKOR: deskor,
			ANKETHI_ADI: hi.etiket, ANKETHI_SORUSAYI: hi.soruSayi, ANKETHI_BELIRTISAYI: hibelirtisayi, ANKETHI_SKOR: hiskor
		};
		$.extend(baslik, {
			TOPLAM_SORUSAYI: de.soruSayi + hi.soruSayi,
			TOPLAM_BELIRTISAYI: baslik.ANKETDE_BELIRTISAYI + baslik.ANKETHI_BELIRTISAYI,
			TOPLAM_SKOR: baslik.ANKETDE_SKOR + baslik.ANKETHI_SKOR,
			DEHB_SONUC: rec.bdehbvarmi ? `<div class="var">VAR</div>` : `<div class="yok">YOK</div>`
		});
		let {result: html} = dokumcu.process({ baslik }) ?? {};
		if (config.dev) { let url = URL.createObjectURL(new Blob([html], { type: 'text/html' })); openNewWindow(url) }
		return html
	}
	static baslat(e) {
		let inst = new this({ id: e.testId ?? e.id, belirtec: e.belirtec, sablonId: e.sablonId });
		return inst.baslat(e)
	}
	async baslat(e) {
		const inst = this, {tip} = this.class, {id: testId, sablonId, belirtec} = this;
		clearTimeout(this._timerProgress); this._timerProgress = setTimeout(() => showProgress(), 500);
		try {
			let rec = (await app.wsTestBilgi({ tip, testId, sablonId, belirtec })) || {}; await this.testUI_setValues({ rec });
			let part = new TestPart({ inst }); await part.run(); return { inst, part }
		}
		catch (ex) { hConfirm(getErrorText(ex), this.sinifAdi); throw ex }
		finally { clearTimeout(this._timerProgress); setTimeout(() => hideProgress(), 10) }
	}
	testUI_setValues(e) {
		const {rec} = e; if (!rec) { return }
		let keys = ['sablonID', 'sablonAdi', 'hastaID', 'doktorID', 'hastaAdi', 'doktorAdi'];
		for (const key of keys) { let value = rec[key]; if (value !== undefined) { this[key.replace('ID', 'Id')] = value } }
		$.extend(this, { ts: now(), detaylar: rec.detaylar || [] })
	}
	static uiState2AdiDuzenle({ liste }) {
		$.extend(liste, { home: 'Hoşgeldiniz', test: 'Test Ekranı', end: 'Test Bitti' })
	}
	async testUI_initLayout(e) {
		const {parentPart} = e, {header, content} = parentPart; content.children().remove();
		const {ts: tarih, hastaAdi} = this; $.extend(parentPart, { tarih, hastaAdi });
		const {tip, aciklama: tipAdi, uiState2Adi} = this.class, {id: testId, belirtec, sablonAdi} = this;
		const getAdimText = () => { let result = uiState2Adi[state] ?? 'state'; if (sablonAdi /*&& state == 'home'*/) { result = `${tipAdi} <b class="royalblue">${sablonAdi}</b> Testi` } return result }
		let {state} = parentPart; if (state == 'test') { this.genelSonuc = new this.class.testGenelSonucSinif({ tip, testId, belirtec }) }
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
	static { window[this.name] = this; this._key2Class[this.name] = this } static get intervalKatSayi() { return config.dev ? .1: 1 }
	static get sinifAdi() { return 'CPT Test' }  static get testSonucSinif() { return TestSonucCPT } static get testGenelSonucSinif() { return TestGenelSonucCPT }
	static get kodListeTipi() { return 'TSTCPT' } static get sablonSinif() { return MQSablonCPT }
	static get testUyariText() { return `Bu testi <span class="orangered">Çocuk</span> uygulayacaktır` }
	testUI_setValues(e) {
		super.testUI_setValues(e); const {rec} = e; if (!rec) { return }
		for (const key of ['gecerliResimSeq', /*'grupTekrarSayisi',*/ 'baslamaOncesiBostaMS', 'resimGosterimMS', 'resimBostaMS']) {
			let value = rec[key]; if (value !== undefined) { this[key] = value } }
	}
	async testUI_initLayout_ara(e) {   /* gecerliResimSeq: Bu seq'daki resim görünür olunca ve tıklanınca DOĞRU kabul et */
		await super.testUI_initLayout_ara(e); let {tip, intervalKatSayi, sablonSinif, testUyariText} = this.class, {parentPart} = e, {state, content} = parentPart;
		let {id: testId, detaylar, genelSonuc, gecerliResimSeq, baslamaOncesiBostaMS, resimGosterimMS, resimBostaMS} = this;
		let startCounter = 3, orjUrls = detaylar.map(det => det.resimLink), urls = [...orjUrls], imageCount = urls.length, keyDownHandler;
		let {gecerliTekrarSayi, digerTekrarSayi, toplamTekrarSayi} = sablonSinif, gecerliResimInd = gecerliResimSeq - 1;
		let shuffleOzel = _urls => {
			let secilenUrl = orjUrls[gecerliResimInd], urls = [];
			for (let i = 0; i < gecerliTekrarSayi; i++) { urls.push(secilenUrl) }
			while (urls.length < toplamTekrarSayi) {
				let rndInd; do { rndInd = Math.round(Math.random() * 100000) % orjUrls.length } while (rndInd == gecerliResimInd);
				urls.push(orjUrls[rndInd])
			} urls = shuffle(urls); imageCount = urls.length;
			return urls
		}
		switch (state) {
			case 'home':
				let promises = []; for (let i = 0; i < orjUrls.length; i++) { promises.push(new $.Deferred()) }
				let elmContainer = $(`<div class="prefetch-parent" hidden/>`); for (let i = 0; i < orjUrls.length; i++) {
					let img = $(`<img class="prefetch" data-index="${i}" src="${urls[i]}"/>`); img.appendTo(elmContainer);
					img.on('load', evt => promises[asInteger(evt.currentTarget.dataset.index)].resolve({ result: true, evt }));
					img.on('error', evt => promises[asInteger(evt.currentTarget.dataset.index)].resolve({ result: false, evt }))
				}
				elmContainer.appendTo(content); let imgStates = { load: 0, error: 0 }, results = await Promise.all(promises); elmContainer.remove();
				for (let rec of results) { imgStates[rec.result ? 'load' : 'error']++ }
				let rightWidth = 250, infoHTML = (
					`<p>Biraz sonra Sürekli Performans Testine başlayacaksınız.</p>` +
					`<p>Bu testin amacı, alfabenin sadece belli bir harfine cevap vermektir.</p>` +
					`<p>Alfabenin çeşitli harfleri kısa sürelerle ekranda gözükecektir.<br/>` +
						`Sağ taraftaki resimde gösterilen harfi görür görmez <b>Ara Tuşuna (<i>SPACE</i>)</b> basınız.</p>` +
					`<p>Başka harf görürseniz herhangi bir tuşa basmayınız</p>` +
					`<p>Hazırsanız <b class="royalblue">'İşleme Başla'</b> tuşuna basarak testi başlatınız.</p>` +
					`<p style="font-weight: bold; font-size: 180%; margin-top: 30px">${testUyariText || ''}</p>` +
					`<div style="margin-bottom: 50px"></div>`
				);
				$(`<div class="info float-left wrap-pretty" style="width: calc(var(--full) - (${rightWidth}px + 5px))">${infoHTML}</div>`).appendTo(content);
				$(`<div class="target-img-parent float-right full-height" style="width: ${rightWidth}px">` +
					  `Şu resme tıklayınız: <div class="target-img full-wh" style="margin-left: 100px; background-image: url(${orjUrls[gecerliResimInd]})"></div>`).appendTo(content)
				/*if (imgStates.error) { hConfirm(`<b>UYARI: </b><p/><div class="darkred"><b>${imgStates.error} adet</b> resim yüklenemedi!</div>`, parentPart.title); return }*/
				break
			case 'test':
				const {testSonucSinif} = this.class;
				let gecerliResimURL, index = -1, resimGosterimTime, ilkTiklamaTime, hInternal;
				/*parentPart.headerText = `Şu resme tıklayınız: <img class="target-img" src="${orjUrls[gecerliResimInd]}">`;*/
				const img = $(`<div class="resim"/>`); img.appendTo(content);
				let clearFlag = false; let promise_wait = new $.Deferred();
				let loopProc = () => {
					if (startCounter <= 0 || parentPart.isDestroyed || parentPart.state != 'test') { clearInterval(this._hInterval); delete this._hInterval; promise_wait?.resolve(); return false }
					img.html(clearFlag ? '' : `<div class="veri full-wh">${startCounter--}</div>`); clearFlag = !clearFlag
				}; this._hInterval = setInterval(loopProc, 1000 * intervalKatSayi); await promise_wait; img.html('');
				let clickHandler = evt => {
					if (!clearFlag || ilkTiklamaTime || !resimGosterimTime) { return } ilkTiklamaTime = now(); let dogrumu = urls[index] == gecerliResimURL;
					let cssClicked = `clicked-${dogrumu ? 'dogru' : 'yanlis'}`; img.removeClass('clicked-dogru clicked-yanlis'); setTimeout(() => img.addClass(cssClicked), 1);
					let tiklamaMSFarki = (ilkTiklamaTime - resimGosterimTime), grupNo = 1;
					let testSonuc = genelSonuc.grupNo2Bilgi[grupNo] = genelSonuc.grupNo2Bilgi[grupNo] || new testSonucSinif({ tip, testId });
					testSonuc.tiklamaEkle(dogrumu, tiklamaMSFarki); if (dogrumu) { genelSonuc.secilmeyenDogruSayi-- }
				}; img.on('mousedown', clickHandler); img.on('touchstart', clickHandler);
				keyDownHandler = evt => {
					if (parentPart.isDestroyed || parentPart.state != 'test') { $('body').off('keydown', keyDownHandler); return }
					let key = evt.key?.toLowerCase(); if (key == ' ' || key == 'enter' || key == 'linefeed') { clickHandler(evt) }
				}; $('body').off('keydown', keyDownHandler).on('keydown', keyDownHandler);
				let ilkmi = true, intervalTime; clearFlag = true;
				loopProc = async () => {
					if (parentPart.isDestroyed || parentPart.state != 'test') { clearInterval(this._hInterval); delete this._hInterval; return false }
					let farkMS = now() - intervalTime;
					if (clearFlag) { if (farkMS < resimGosterimMS * intervalKatSayi) { return true } img.css('background-image', '') }
					else {
						if (farkMS < resimBostaMS * intervalKatSayi) { return true }
						index++; let gecerliResimmi = urls[index] == gecerliResimURL;
						if (ilkmi) { ilkmi = false } genelSonuc.tumSayi++; if (gecerliResimmi) { genelSonuc.secilmeyenDogruSayi++ }
						let cevrimBittimi = index >= imageCount - 1; if (cevrimBittimi) { parentPart.nextPage(); return false }
						/*parentPart.progressText = (`<div class="flex-row">
							<div class="item"><span class="ek-bilgi">Resim: &nbsp;</span><span class="veri white">${index + 1} / ${imageCount}</span></div>
						</div>`);*/
						img.css('background-image', `url(${urls[index]})`); resimGosterimTime = now(); ilkTiklamaTime = null
					}
					clearFlag = !clearFlag; intervalTime = now(); return true
				}; gecerliResimURL = urls[gecerliResimSeq - 1]; urls = shuffleOzel(urls); intervalTime = now(), this._hInterval = setInterval(loopProc, 10); break
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
	static get sinifAdi() { return 'Anket Test' } static get testSonucSinif() { return TestSonucAnket } static get testGenelSonucSinif() { return TestGenelSonucAnket }
	static get kodListeTipi() { return 'TSTANKET' } static get sablonSinif() { return MQSablonAnket }
	static get testUyariText() { return `Bu testi <span class="orangered">Ebeveyn</span> uygulayacaktır` }
	testUI_setValues(e) {
		super.testUI_setValues(e); const {rec} = e; if (!rec) { return }
		const keys = ['sureDk', 'yanitID'], PrefixSecenek = 'secenek', PrefixYanit = 'yanit';
		for (const key of keys) { let value = rec[key]; if (value !== undefined) { this[key] = value } }
		for (const [key, value] of Object.entries(rec)) {
			if (key.startsWith(PrefixSecenek) || key.startsWith(PrefixYanit)) {
				let value = rec[key]; if (value !== undefined) { this[key] = value } }
		}
	}
	async testUI_initLayout_ara(e) {   /* gecerliResimSeq: Bu seq'daki resim görünür olunca ve tıklanınca DOĞRU kabul et */
		await super.testUI_initLayout_ara(e); const {parentPart} = e, {state, header, content, islemTuslari} = parentPart;
		let {detaylar} = this, PrefixSecenek = 'secenek', PrefixYanit = 'yanit';
		let rec = detaylar[0], secenekler = []; for (const key of Object.keys({ ...this, ...rec })) {
			if (key.startsWith(PrefixSecenek) || key.startsWith(PrefixYanit)) {
				let value = (rec[key] ?? this[key])?.trimEnd?.();
				if (value) { secenekler[asInteger(key.slice(PrefixSecenek.length)) - 1] = value }
			}
		} 
		let id2Soru = {}; for (const det of detaylar) { let {id, soru} = det; if (soru == null) { continue } soru = soru.trimEnd(); id2Soru[id] = soru }
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
					let {index} = evt.args; if (index == null) { return } index = asInteger(index); const seq = index + 1;
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
