/** Şablon listesi, Home screen */
class MQSablonOrtak extends MQDetayliVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get gereksizTablolariSilYapilirmi() { return false } static get noAutoFocus() { return true } static get konsinyemi() { return false } 
	static get table() { return 'hizlisablon' } static get tableAlias() { return 'sab' } static get fisSiniflar() { return [] }
	static get detaySinif() { return MQSablonOrtakDetay } static get adiEtiket() { return 'Şablon Adı' } static get tumKolonlarGosterilirmi() { return true }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments);
		sec.grupTopluEkle([ { kod: 'inst', etiket: 'Şablon', kapali: false } ])
		sec.secimTopluEkle({
			inst: new SecimBasSon({ etiket: 'Şablon', mfSinif: this, grupKod: 'inst' }),
			aciklama: new SecimOzellik({ etiket: 'Şablon Adı', grupKod: 'inst' })
		});
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {tableAlias: alias} = this, {sayacSaha, adiSaha} = this;
			wh.basiSonu(sec.inst, `${alias}.${sayacSaha}`).ozellik(sec.aciklama, `${alias}.${adiSaha}`)
		})
	}
	static listeEkrani_init({ gridPart, sender }) {
		super.listeEkrani_init(...arguments); gridPart = gridPart ?? sender
		gridPart.tarih = today(); gridPart.rowNumberOlmasin()
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e)
		let {konsinyemi} = this, session = config.session ?? {}
		let {gridPart = e.sender, rootBuilder: rfb} = e
		let {header, islemTuslariPart} = gridPart, {layout, sol} = islemTuslariPart
		let loginTipi = session.loginTipi || 'login', loginSubemi = loginTipi == 'login' && session.subeKod != null, loginMusterimi = loginTipi == 'musteri'
		let subeKod = gridPart.subeKod = loginSubemi ? session.subeKod : qs.subeKod ?? qs.sube
		let mustKod = gridPart.mustKod = loginMusterimi ? session.kod : qs.mustKod ?? qs.must
		rfb.setInst(gridPart).addStyle(
			`$elementCSS { --header-height: 160px !important } $elementCSS .islemTuslari { overflow: hidden !important }`)
		let setKA = async (fbdOrLayout, kod, aciklama) => {
			let elm = fbdOrLayout?.layout ?? fbdOrLayout; if (!elm?.length) { return }
			if (kod) {
				aciklama = await aciklama; if (!aciklama) { return }
				let text = aciklama?.trim()
				if (kod && typeof kod == 'string') { text = `<span class="kod bold gray">${kod}</b> <span class="aciklama royalblue normal">${aciklama}</span>` }
				elm.html(text.trim())
				elm.removeClass('jqx-hidden basic-hidden')
			}
			else { elm.addClass('jqx-hidden') }
		};
		sol.addClass('flex-row')
		rfb.addDateInput('tarih', 'İşlem Tarihi').setParent(sol).etiketGosterim_yok()
			.degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
			.addStyle(`$elementCSS { margin-left: 30px } $elementCSS > input { width: 130px !important }`)
		rfb.addButton('snapshot', 'SNP').setParent(sol).addStyle_wh(100, 50)
			.onClick(_e => this.snapshotIstendi({ ...e, ..._e }))
			.addStyle(`$elementCSS { margin-left: 50px }`)
		if (!konsinyemi && subeKod == null) {
			rfb.addModelKullan('subeKod', 'Şube').dropDown().setMFSinif(MQSube).autoBind().etiketGosterim_yok().setParent(sol)
				.ozelQueryDuzenleHandler(({ builder: fbd, aliasVeNokta, stm }) => {
					for (let {where: wh} of stm) { wh.add(`${aliasVeNokta}silindi = ''`) }
				}).degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
				.onAfterRun(({ builder: fbd }) => gridPart.fbd_sube = fbd)
				.addStyle(e => `$elementCSS { width: 450px !important; margin: 5px 0 0 30px }`)
		}
		else {
			rfb.addForm('sube', ({ builder: fbd }) => $(`<div class="${fbd.id}">${subeKod}</div>`)).setParent(sol)
				.onAfterRun(({ builder: fbd }) => setKA(fbd, subeKod, MQSube.getGloKod2Adi(subeKod)))
				.addStyle(e => `$elementCSS { width: auto !important; margin: 13px 0 0 30px }`)
		}
		if (mustKod) {
			rfb.addForm('must', ({ builder: fbd }) => $(`<div class="${fbd.id}">${mustKod}</div>`)).setParent(header)
				.onAfterRun(({ builder: fbd }) => setKA(fbd, mustKod, MQSCari.getGloKod2Adi(mustKod)))
		}
		else {
			rfb.addModelKullan('mustKod', 'Müşteri').comboBox().setMFSinif(MQSCari).autoBind().setParent(header)
				.ozelQueryDuzenleHandler(({ builder: fbd, alias, stm }) => {
					for (let sent of stm) {
						let {where: wh, sahalar} = sent;
						sent.distinctYap();
						if (konsinyemi) {
							sent
								.cari2BolgeBagla({ alias })
								.fromIliski('kldagitim dag', [`dag.mustkod = ${alias}.must`])
								.fromIliski('hizlisablon sab', 'sab.klfirmakod = dag.klfirmakod')
						}
						wh.add(`${alias}.silindi = ''`, `${alias}.calismadurumu <> ''`)
						/*wh.icerikKisitDuzenle_cari({ saha: `${alias}.kod` })*/
						if (konsinyemi) { sahalar.add(`${alias}.bolgekod`, 'bol.bizsubekod') }
					}
				}).degisince(async ({ builder: fbd, item: rec }) => {
					if (konsinyemi)
						gridPart.tazeleDefer(e)
					else {
						let {bizsubekod: subeKod} = rec, {fbd_sube} = gridPart
						if (subeKod == null) { gridPart.tazeleDefer(e) }
						else { gridPart.subeKod = subeKod; fbd_sube?.part?.val(subeKod) }
					}
				})
				.onAfterRun(({ builder: fbd }) =>
					gridPart.fbd_must = fbd)
		}
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		$.extend(args, { rowsHeight: 60, groupable: false, selectionMode: 'none' })
	}
	static orjBaslikListesiDuzenle({ liste }) {
		let e = arguments[0]; super.orjBaslikListesiDuzenle(e)
		liste.push(...[
			new GridKolon({ belirtec: 'topSayi', text: 'Sip.Sayı', genislikCh: 10 }).noSql().tipNumerik(),
			new GridKolon({ belirtec: 'yeni', text: ' ', genislikCh: 8 }).noSql().tipButton('+').onClick(_e => { this.yeniIstendi({ ...e, ..._e }) })
		])
	}
	static async loadServerData(e = {}) {
		let recs = await super.loadServerData(e); let {offlineMode: offline} = app
		let {sender: gridPart = {}} = e, {tarih, subeKod, mustKod} = gridPart
		if (!offline && recs && tarih && mustKod) {
			subeKod ??= config.session?.subeKod
			let prefetchData = this.prefetchData ??= {}
			let anah = toJSONStr({ tarih: dateToString(tarih), mustKod })
			prefetchData[anah] ??= (async () => {
				let MinCalcCount = 2, calculated = 0
				let promises = [], curPromise
				for (let parentRec of recs) {
					let {kaysayac: sablonSayac, klFirmaKod} = parentRec;
					curPromise = (async () => {
						await this.loadServerData_detaylar({ ...e, parentRec })
						let fisSinif = await this.fisSinifBelirle({ ...e, sablonSayac, mustKod })
						if (!fisSinif) { return }
						let _e = { ...e }; delete _e.rec
						let fis = new fisSinif({ sablonSayac, tarih, subeKod, mustKod, klFirmaKod })
						await fis.sablonYukleVeBirlestir(_e)
						await fis.yeniTanimOncesiIslemler(_e)
						calculated++
						return ({ rec: parentRec, fisSinif, fis })
					})()
					promises.push(curPromise)
					if (calculated < MinCalcCount && curPromise) {
						try { await curPromise }
						catch (ex) { console.error('prefetch', ex) }
					}
				}
				return Promise.allSettled(promises)
			})()
		}
		return recs
	}
	static async loadServerData_queryDuzenle({ basit, basitmi, gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments);
		gridPart ??= sender; basitmi = basit ?? basitmi;
		if (basitmi) { return }
		let {konsinyemi, tableAlias: alias} = this, {subeKod, mustKod} = gridPart;
		subeKod ??= config.session?.subeKod ?? ''
		/* let fisSinif = await this.fisSinifBelirle({ ...arguments[0], mustKod }); let {mustSaha} = fisSinif */
		let {sahalar, where: wh} = sent, {orderBy} = stm;
		sahalar.addWithAlias(alias, 'bvadegunkullanilir vadeGunKullanilirmi', 'vadegunu vadeGunu', 'emailadresler email_sablonEk');
		if (konsinyemi) {
			/*sent
				.fromIliski('klfirma dfir', 'sab.klfirmakod = dfir.kod')
				.fromIliski('kldagitim dag', 'dfir.kod = dag.klfirmakod');*/
			sahalar.add(`${alias}.klfirmakod klFirmaKod`)
		}
		orderBy.liste = ['aciklama']
	}
	static async orjBaslikListesi_recsDuzenle(e) {
		super.orjBaslikListesi_recsDuzenle(e)
		let {offlineMode} = app, {recs} = e   /* 'await' super.orjBaslikListesi_recsDuzenle(e)  yapınca  'e.recs' bozuluyor ?? */
		let gridPart = e.gridPart = e.gridPart ?? e.sender, {sayacSaha, listeFisSinif} = this, sayac2Rec = {}
		for (let rec of recs) {
			let sayac = rec[sayacSaha]; sayac2Rec[sayac] = rec }
		if (offlineMode) {
			let {detaySinif} = this
			for (let [sayac, parentRec] of Object.entries(sayac2Rec)) {
				let _recs = await detaySinif.loadServerData({ ...e, parentRec })
				parentRec.topSayi = _recs.length
			}
		}
		else {
			e.sablonSayacListe = Object.keys(sayac2Rec).map(x => asInteger(x))
			let sent = e.sent = new MQSent(), stm = e.stm = new MQStm({ sent })
			this.sablonEkQueryDuzenle(e); sent = e.sent; stm = e.stm
			for (let { sablonSayac, topSayi } of await app.sqlExecSelect(stm)) {
				let rec = sayac2Rec[sablonSayac]; if (!rec) { continue }
				rec.topSayi = (rec.topSayi || 0) + topSayi
			}
		}
		return recs
	}
	static loadServerData_detaylar({ parentRec }) {
		return this.detaySinif.loadServerData(...arguments).then(recs => {
			for (let rec of recs) { rec._parentRec = parentRec }
			return recs
		})
	}
	static sablonEkQueryDuzenle(e) {
		let gridPart = e.gridPart ?? e.sender ?? {}, {tarih, mustKod} = gridPart;
		let subeKod = gridPart.subeKod ?? config.session?.subeKod;
		let {sablonSayacListe, stm, sent} = e, uni = e.sent = stm.sent = new MQUnionAll();
		$.extend(e, { gridPart, subeKod, tarih, mustKod });
		this.sablonEkQueryDuzenleDevam(e)
	}
	static sablonEkQueryDuzenleDevam(e) { return this.detaySinif.sablonIcinSiparislerStmDuzenle({ ...e, detaylimi: false }) }
	static async getEMailYapi({ musterimi, fisSayac }) {
		let {sablonSip_eMail, konBuFirma_eMailListe} = app.params.web;
		if (!(fisSayac && sablonSip_eMail)) { return {} }
		let _e = { ...arguments[0] }, {eMailStm: stm} = _e;
		if (!stm) {
			stm = _e.stm = new MQStm();
			stm = _e.stm = _e.eMailStm = this.eMailYapiQueryDuzenle(_e) === false ? null : _e.stm
		}
		let uygunTipler = musterimi ? asSet(['email_alici']) : asSet(['email_teslimatci', 'email_ozel', 'email_bolge']);
		let EMailPrefix = 'email_', recs = stm ? await app.sqlExecSelect(stm) : null;
		let result = {}; if (recs?.length) {
			for (let rec of recs) {
				for (let [key, value] of Object.entries(rec)) {
					if (!key.startsWith(EMailPrefix)) { continue }
					if (uygunTipler && !uygunTipler[key]) { continue }
					let newKey = key.slice(EMailPrefix.length); value = eMailStr2Array(value);
					let array = result[newKey] ??= []; if (value?.length) { array.push(...value) }
					// delete result[key]
				}
			}
		}
		if (!musterimi && konBuFirma_eMailListe?.length) {
			result.buFirma = eMailStr2Array(konBuFirma_eMailListe) }
		console.log('eMail adres belirle', { musterimi, uygunTipler }, result);
		return result
	}
	static eMailYapiQueryDuzenle(e) { return false }
	static getSablonluVeKLDagitimliOnSent({ fisSinif, fisSayac }) {
		let {table, sayacSaha, teslimCariSaha} = fisSinif;
		let maxSent = new MQSent({
			from: `${table} xfis`, fromIliskiler: [
				{ from: 'hizlisablon xsab', iliski: 'xfis.sablonsayac = xsab.kaysayac' },
				{
					from: 'kldagitim xdag', iliski: [
						`xfis.${teslimCariSaha} = xdag.mustkod`, `xsab.klfirmakod = xdag.klfirmakod`,
						new MQOrClause([`xfis.xadreskod = xdag.sevkadreskod`, `xdag.sevkadreskod = ''`])
					]
				},
			],
			where: { degerAta: fisSayac, saha: 'xfis.kaysayac' },
			sahalar: [
				'MAX(xdag.sevkadreskod) sevkadreskod', 'xfis.kaysayac fissayac',
				'xfis.sablonsayac sablonsayac', 'xsab.klfirmakod klfirmakod', 'xdag.mustkod teslimcarikod'
			]
		}).groupByOlustur();
		return new MQSent({
			from: `(${maxSent.toString()}) kmax`,
			fromIliskiler: [
				{
					from: 'kldagitim kdag', iliski: [
						'kmax.teslimcarikod = kdag.mustkod', 'kmax.klfirmakod = kdag.klfirmakod',
						'kmax.sevkadreskod = kdag.sevkadreskod'
					]
				},
				{ from: `${table} fis`, iliski: 'kmax.fissayac = fis.kaysayac' },
				{ from: 'hizlisablon sab', iliski: 'kmax.sablonsayac = sab.kaysayac' }
			]
		})
	}
	static async snapshotIstendi({ sender: gridPart }) {
		let islemAdi = 'Snapshot', {tarih, mustKod} = gridPart
		if (!tarih) { hConfirm(`<b>Tarih</b> belirtilmelidir`, islemAdi); return }
		if (!mustKod) { hConfirm(`<b>Müşteri</b> belirtilmelidir`, islemAdi); return }
		let {prefetchData} = this; if (!prefetchData) { return }
		let anah = toJSONStr({ tarih: dateToString(tarih), mustKod })
		let hasHTML = value => value?.includes?.('<') && value?.includes?.('>')
		showProgress('Önbellek verisi bekleniyor...', islemAdi)
		try {
			let data = await prefetchData?.[anah]; if (!data) { return }
			let groups = ['_sablonAdi', '_grupAdi'], groupsSet = asSet(groups)
			let removeBelirtecSet = asSet(['aciklama', 'grupAdi', 'brm', 'fiyat', 'iskOranlar', 'brutBedel', 'netBedel', 'bedel'])
			let colDefs = [...new SablonluSiparisGridciOrtak().tabloKolonlari]
				.filter(_ => !(groupsSet[_.belirtec] || removeBelirtecSet[_.belirtec]))
			for (let _ of colDefs) {
				let {belirtec, text} = _
				if (text && hasHTML(text)) { text = _.text = getTagContent(text) }
				if (belirtec == 'miktar') { _.text = 'Paket İçi' }
			}
			let belirtecSet = asSet(colDefs.map(_ => _.belirtec))
			// colDefs.push(new GridKolon({ belirtec: '_sep1', text: ' ' }).hidden())
			for (let belirtec of groups) {
				if (belirtecSet[belirtec]) { continue }
				colDefs.push(new GridKolon({ belirtec, text: ' ' }).hidden())
			}
			let ignoreKeys = asSet(['uid', 'uniqueid', 'boundindex', 'visibleindex', '_rowNumber'])
			let notNullKeys = asSet(colDefs.map(_ => _.belirtec))
			let reduced = (obj, root) => {
				if (isDate(obj)) { obj = dateToString(obj) }
				else if (!root && (obj == null || typeof obj == 'object')) { return undefined }
				else if (typeof obj == 'string' && !obj) { return undefined }
				else if (obj?.length != null && $.isEmptyObject(obj)) { return undefined }
				if (typeof obj == 'object') {
					for (let [k, v] of Object.entries(obj)) {
						if (ignoreKeys[k]) { delete obj[k]; continue }
						let nv = reduced(v, false)
						if (nv === undefined) { delete obj[k]; continue }
						if (nv == null && notNullKeys[k]) { nv = '' }
						if (nv !== v) { obj[k] = nv }
					}
				}
				return obj
			}
			data = data.filter(_ => _.status == 'fulfilled')
			   .flatMap(({ value: { rec, fis: { detaylar } } }) =>
				   detaylar.map(det => reduced({ ...rec, ...det.asExportData }, true)))
			notNullKeys = Object.keys(notNullKeys)
			let space = count => ' '.repeat(count)
			let converted = (det, key) => {
				switch (key) {
					case '_sablonAdi': return `${det.aciklama || ''}`
					case '_grupAdi': return `${space(4)}${det.grupAdi || ''}`
					case 'stokText': return `_${space(6)}(${det.shKod}) ${det.shAdi}`
					case 'miktar': return det.paketIcAdet || ''
					// default: if (key.startsWith('_sep')) { return '.' } break
				}
				return det[key] ?? ''
			}
			for (let det of data)
				for (let key of notNullKeys) {
					let _value = det[key], value = converted(det, key)
					if (hasHTML(value)) {
						value = getTagContent(value)
						if (hasHTML(value)) { value = $(value).text() }
					}
					if (value !== _value) { det[key] = value }
				}
			// let dumpData = toJSONStr(data)
			{
				let wRFB = new RootFormBuilder('snapshot').asWindow('Önizleme').addCSS('part');
				let headerHeight = 70, gridPart
				wRFB.addIslemTuslari('islemTuslari').addStyle_fullWH(null, headerHeight)
					.setTip('tazeleVazgec').setEkSagButonlar('yazdir', 'html', 'excel')
					.setButonlarIlk([
						{ id: 'html', handler: e => gridPart?.gridExport_html(e) },
						{ id: 'excel', handler: e => gridPart?.gridExport_excel(e) }
					])
					.setId2Handler({
						tazele: ({ builder: { rootPart } }) => gridPart?.tazele(),
						vazgec: ({ builder: { rootPart } }) => rootPart.close()
					})
					.addStyle(
						`$elementCSS .butonlar.part { position: relative; top: 10px; z-index: 100 }
						 $elementCSS .butonlar.part  button { margin: 0 0 0 10px }
						 $elementCSS .butonlar.part .sol { z-index: -1; background-color: unset !important; background: transparent !important }
						 $elementCSS .butonlar.part #excel { margin-right: 30px }
						 $elementCSS .butonlar.part button.jqx-fill-state-normal { background-color: whitesmoke !important }
						 $elementCSS .butonlar.part button.jqx-fill-state-pressed { background-color: royalblue !important }`
					)
				let fbd_content = wRFB.addFormWithParent('content').altAlta()
					.addStyle_fullWH(null, `calc(var(--full) - ${headerHeight}px)`)
				fbd_content.addGridliGosterici('grid').addStyle_fullWH()
					.setSource(data).setTabloKolonlari(colDefs)
					.widgetArgsDuzenleIslemi(({ args }) => $.extend(args, { groupsExpandedByDefault: true }))
					.veriYukleninceIslemi(({ builder: { input: grid } }) => grid.jqxGrid('groups', groups))
					.onAfterRun(({ builder: { part } }) => gridPart = part)
				wRFB.run()
			}
		}
		finally { hideProgress() }
	}
	static async yeniIstendi(e) {
		try {
			let {sender: gridPart, rec} = e, {tarih, mustKod, subeKod} = gridPart;
			if (!mustKod) { throw { isError: true, errorText: `<b>Müşteri</b> seçilmelidir` } }
			let {event: evt} = e, {currentTarget: target} = evt; target = $(target);
			setButonEnabled(target, false); setTimeout(() => setButonEnabled(target, true), 2000);
			showProgress();
			try {
				subeKod ??= config.session?.subeKod ?? ''
				let {kaysayac: sablonSayac, klFirmaKod} = rec
				let fisSinif = await this.fisSinifBelirle({ ...e, sablonSayac, mustKod })
				if (!fisSinif) { throw { isError: true, errorText: 'Fiş Sınıfı belirlenemedi' } }
				let _e = { ...e}; delete _e.rec
				let fis = new fisSinif({ sablonSayac, tarih, subeKod, mustKod, klFirmaKod })
				await fis.sablonYukleVeBirlestir(_e)
				let islem = 'yeni', kaydedince = _e => this.tazele({ ...e, gridPart })
				return await fis.tanimla({ islem, kaydedince })
			}
			finally { setTimeout(() => hideProgress(), 500) }
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Yeni'), 550); throw ex }
	}
	static async onaylaIstendi(e) {
		try {
			let {sender, rec} = e, {parentPart: gridPart} = sender, {bonayli: onaylimi} = rec;
			if (!config.dev && onaylimi) { throw { isError: true, errorText: 'Bu sipariş zaten onaylanmış' } }
			let {event: evt} = e, {currentTarget: target} = evt; target = $(target);
			setButonEnabled(target, false); setTimeout(() => setButonEnabled(target, true), 2000);
			showProgress();
			try {
				let {kaysayac: sayac, mustkod: mustKod, sevkadreskod: sevkAdresKod, _parentRec: parentRec} = rec;
				let {kaysayac: sablonSayac, klFirmaKod} = parentRec;
				let fisSinif = await this.fisSinifBelirle({ ...e, sablonSayac, mustKod, sevkAdresKod });
				if (!fisSinif) { throw { isError: true, errorText: 'Fiş Sınıfı belirlenemedi' } }
				let fis = new fisSinif({ sayac, klFirmaKod }), _e = { ...e, parentRec, islem: 'onayla' }; delete _e.rec;
				let result = await fis.yukle(_e); if (!result) { return }
				let islem = 'onayla', kaydedince = _e => this.tazele({ ...e, gridPart });
				let kaydetIslemi = async _e => await this.onaylaDevam({ ...e, ..._e, gridPart });
				return await fis.tanimla({ islem, kaydetIslemi, kaydedince })
			}
			finally { setTimeout(() => hideProgress(), 500) }
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Onayla'), 100); throw ex }
	}
	static async degistirIstendi(e) {
		try {
			let {sender, rec} = e, {parentPart: gridPart} = sender ?? {};
			let {kaysayac: sayac, bonayli: onaylimi, sevkadreskod: sevkAdresKod, _parentRec: parentRec} = rec;
			let mustKod = rec.mustkod ?? gridPart.mustKod, {kaysayac: sablonSayac, klFirmaKod} = parentRec;
			let {event: evt} = e, {currentTarget: target} = evt; target = $(target);
			setButonEnabled(target, false); setTimeout(() => setButonEnabled(target, true), 2000);
			showProgress();
			try {
				let fisSinif = await this.fisSinifBelirle({ ...e, sablonSayac, mustKod, sevkAdresKod });
				if (!fisSinif) { throw { isError: true, errorText: 'Fiş Sınıfı belirlenemedi' } }
				let islem = onaylimi ? 'izle' : 'degistir';
				let fis = new fisSinif({ sayac, klFirmaKod }), _e = { ...e, parentRec, islem }; delete _e.rec;
				let result = await fis.yukle(_e); if (!result) { return }
				let kaydedince = _e => this.tazele({ ...e, ..._e, gridPart });
				return await fis.tanimla({ islem, kaydedince })
			}
			finally { setTimeout(() => hideProgress(), 500) }
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Değiştir'), 100); throw ex }
	}
	static async silIstendi(e) {
		try {
			let {sender, rec} = e, {parentPart: gridPart} = sender ?? {}, {bonayli: onaylimi} = rec;
			if (!config.dev && onaylimi) { throw { isError: true, errorText: 'Onaylı sipariş silinemez' } }
			let {kaysayac: sayac, sevkadreskod: sevkAdresKod, _parentRec: parentRec} = rec;
			let mustKod = rec.mustkod ?? gridPart.mustKod, {kaysayac: sablonSayac} = parentRec;
			let {event: evt} = e, {currentTarget: target} = evt; target = $(target);
			setButonEnabled(target, false); setTimeout(() => setButonEnabled(target, true), 2000);
			showProgress();
			try {
				let fisSinif = await this.fisSinifBelirle({ ...e, sablonSayac, mustKod, sevkAdresKod });
				if (!fisSinif) { throw { isError: true, errorText: 'Fiş Sınıfı belirlenemedi' } }
				let fis = new fisSinif({ sayac }), _e = { ...e, parentRec, islem: 'sil' }; delete _e.rec;
				let result = await fis.yukle(_e); if (!result) { return }
				let islem = 'sil', kaydedince = _e => this.tazele({ ...e, ..._e, gridPart });
				return await fis.tanimla({ islem, kaydedince })
			}
			finally { setTimeout(() => hideProgress(), 500) }
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'SİL'), 100); throw ex }
	}
	static tazele(e) {
		let {parentPart} = e, gridPart = e.gridPart ?? e.sender, {expandedIndexes, bindingCompleteBlock, gridWidget} = gridPart;
		let rowIndex = e.rowIndex ?? e.args?.rowindex; if ($.isEmptyObject(expandedIndexes)) { expandedIndexes[rowIndex] = true }
		gridPart.bindingCompleteBlock = _e => {
			gridPart.bindingCompleteBlock = bindingCompleteBlock;
			if (!$.isEmptyObject(expandedIndexes)) { for (let ind in expandedIndexes) { gridWidget.showrowdetails(ind) } }
		};
		try { gridPart.tazeleDefer(e) }
		finally { setTimeout(() => hideProgress(), 500) }
	}
	static async onaylaDevam({ gridPart, sender: fisGirisPart, fis, rec }) {
		let {sayac: fisSayac, detaylar} = fis, {table, sayacSaha, stokmu} = fis.class;
		if (!fisSayac) { throw { isError: true, errorText: 'Onaylanacak Sipariş için ID belirlenemedi' } }
		let dokumVeEMail = musterimi => this.dokumYapVeEMailGonder({ musterimi, fis, rec });
		for (let musterimi of [true, false]) { await dokumVeEMail(musterimi) }
		/*if (!stokmu) { await dokumVeEMail(true) }
		await dokumVeEMail(false);*/
		let upd = new MQIliskiliUpdate({
			from: table, where: { degerAta: fisSayac, saha: sayacSaha },
			set: { degerAta: '', saha: 'onaytipi' }
		});
		await app.sqlExecNone(upd);
		let islem = 'D', degisenler = ['Web Kon.Sip.', 'Onay'];
		fis.logKaydet({ islem, degisenler }); await delay(10);
		gridPart?.tazeleDefer(); fisGirisPart?.close()
	}
	static async dokumYapVeEMailGonder({ musterimi, fis, fisSayac, parentRec, rec }) {
		let hmrBilgiler = Array.from(HMRBilgi.hmrIter()), dokumcu, {class: fisSinif} = fis;
		try { dokumcu = await HTMLDokum.FromDosyaAdi(`VioWeb.KonLojistik.Siparis.${musterimi ? 'Musteri' : 'Diger'}.htm`) }
		catch (ex) { console.error(ex); return false } if (dokumcu == null) { return }
		fisSayac = fisSayac || fis?.sayac; parentRec = parentRec ?? rec?._parentRec;
		let {fiyatFra, bedelFra} = app.params.zorunlu, dvKod = fis.dvKod || 'TL';
		let to = [], cc = [], bcc = [], eMailYapi = await this.getEMailYapi({ musterimi, fisSinif, fisSayac }) ?? {};
		let {email_sablonEk} = parentRec; if (email_sablonEk) {
			email_sablonEk = email_sablonEk.split(';').map(x => x.trim()).filter(x => !!x);
			if (email_sablonEk?.length) { $.extend(eMailYapi, { sablonEk: email_sablonEk }) }
		}
		if (!$.isEmptyObject(eMailYapi)) {
			let eMailSelectors = ['ozel', 'sablon', 'sablonEk', 'alici', 'teslimatci', 'bolge'];
			let eMailSet = {}; for (let selector of eMailSelectors) {
				let eMails = eMailYapi[selector]?.filter(x => x?.length >= 5 && x.includes('@')) ?? [];
				for (let eMail of eMails) {
					eMail = eMail.trim(); if (eMailSet[eMail]) { continue }
					eMailSet[eMail] = true; (to.length ? cc : to).push(eMail)
				}
			}
		}
		if (!(config.dev || to?.length)) { return }
		let BUGUN = dateToString(today()), SERI = '', {sevkadres1: SEVKADRES1, sevkadres2: SEVKADRES2} = rec;
		let {sayac: SABLONSAYAC, aciklama: SABLONADI} = parentRec, {fisno: FISNO, mustkod: MUSTKOD, mustunvan: MUSTUNVAN} = rec;
		let {sevkadreskod: SEVKADRESKOD, sevkadresadi: SEVKADRESADI, fisaciklama: EKNOTLAR} = rec;
		let {klFirmaKod: KLFIRMAKOD} = this, KLFIRMAUNVAN = (KLFIRMAKOD ? await MQSKLFirma.getGloKod2Adi(KLFIRMAKOD) : null) ?? '', KLFIRMAADI = KLFIRMAUNVAN, KLFIRMABIRUNVAN = KLFIRMAUNVAN;
		let MUSTBIRUNVAN = MUSTUNVAN, MUSTADI = MUSTUNVAN, TARIH = dateToString(asDate(rec.tarih)) ?? '', TESLIMTARIH = dateToString(asDate(rec.basteslimtarihi)) || TARIH;
		let TESLIMTARIHIVARTEXT = TESLIMTARIH ? `${TESLIMTARIH} tarihinde teslim edilmek üzere ` : '', TESLIMYERIADIPARANTEZLI = new CKodVeAdi([SEVKADRESKOD, SEVKADRESADI]).parantezliOzet();
		let TESLIMYERKOD = SEVKADRESKOD, TESLIMYERADI = SEVKADRESADI, TESLIMYERIKOD = TESLIMYERKOD, TESLIMYERIADI = TESLIMYERADI;
		let EKNOT = EKNOTLAR, EKACIKLAMA = EKNOTLAR;
		let baslik = {
			BUGUN, SABLONSAYAC, SABLONADI, MUSTKOD, MUSTUNVAN, MUSTBIRUNVAN, MUSTADI, TARIH, SERI, FISNO, TESLIMTARIH, TESLIMTARIHIVARTEXT,
			KLFIRMAKOD, KLFIRMAUNVAN, KLFIRMABIRUNVAN, KLFIRMAADI, SEVKADRES1, SEVKADRES2, TESLIMYERKOD, TESLIMYERADI, TESLIMYERIKOD, TESLIMYERIADI,
			TESLIMYERIADIPARANTEZLI, SEVKADRESKOD, SEVKADRESADI, EKNOTLAR
		};
		{
			const Prefix = 'OZ';
			for (let [key, value] of Object.entries(rec)) {
				if (!key.startsWith(Prefix)) { continue }
				baslik[`CRO-${key}`] = value || ''
			}
		}
		let dip = { brm2Miktar: {}, TOPBEDEL: 0 }, _seq = 0, detaylar = fis.detaylar.map(det => {
			_seq++; let SEQ = det.seq || _seq;
			let {barkod: BARKOD, shKod: STOKKOD, shAdi: STOKADI, brm: BRM, miktar, fiyat, netBedel: bedel} = det;
			for (let {adiAttr} of hmrBilgiler) { let value = det[adiAttr]?.trim(); if (value) { STOKADI += ` (<b style="color: royalblue">${value}</b>)` } }
			dip.brm2Miktar[BRM] = (dip.brm2Miktar[BRM] ?? 0) + (miktar ?? 0); dip.TOPBEDEL += (bedel ?? 0);
			let MIKTAR = numberToString(miktar ?? 0), FIYAT = `${toStringWithFra(fiyat ?? 0, fiyatFra)} ${dvKod}`, BEDEL = `${toStringWithFra(bedel ?? 0, bedelFra)} ${dvKod}`;
			BARKOD = BARKOD ?? ''; return { SEQ, BARKOD, STOKKOD, STOKADI, MIKTAR, BRM, FIYAT, BEDEL }
		});
		let bm_ents = Object.entries(dip.brm2Miktar); $.extend(dip, {
			TOPMIKTAR: bm_ents.map(([, miktar]) => numberToString(miktar)).join(`<br/>${CrLf}`),
			BRM: bm_ents.map(([brm]) => brm).join(`<br/>${CrLf}`),
			TOPBEDEL: `${toStringWithFra(dip.TOPBEDEL, bedelFra)} ${dvKod}`
		});
		delete dip.brm2Miktar; dip.TOPBRM = dip.BRM;
		let data = { baslik, detaylar, dip }, {result: htmlData} = dokumcu.process(data) ?? {}
		if (qs.preview || (config.dev && !qs.noPreview)) {
			let url = URL.createObjectURL(new Blob([htmlData], { type: 'text/html' }));
			setTimeout(url => openNewWindow(url), 0, url)
		}
		let html = true, subject = 'SkyERP Web Sipariş', body = htmlData;
		if (to.length) {
			let data = { to, cc, bcc, subject, html, body };
			let rec = await app.getMailParam(); rec?.wsEMailArgsDuzenle?.({ args: data });
			try { return await app.wsEMailQueue_add({ data }) }
			catch (ex) { console.error(getErrorText(ex)) }
		}
	}
	/* args: { belirtec, gridRec, sablonSayac, mustKod, sevkAdresKod } */
	static fisSinifBelirle(e) { return this.fisSinifBelirleInternal(e) }
	static fisSinifBelirleInternal(e) { return this.fisSiniflar[0] }
}
/** Şablon listesi, Home screen */
class MQSablon extends MQSablonOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'SSIP' } static get sinifAdi() { return 'Sipariş' }
	static get fisSiniflar() { return [...super.fisSiniflar, SablonluSatisSiparisFis ] }
	static get detaySinif() { return MQSablonDetay }
	static async fisSinifBelirleInternal(e) { return await super.fisSinifBelirleInternal(e) }
}
/** Şablon listesi, Home screen */
class MQKonsinyeSablon extends MQSablonOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get konsinyemi() { return true }
	static get kodListeTipi() { return 'KSSIP' } static get sinifAdi() { return 'Konsinye Sipariş' }
	static get fisSiniflar() { return [...super.fisSiniflar, SablonluKonsinyeAlimSiparisFis, SablonluKonsinyeTransferFis ] }
	static get detaySinif() { return MQKonsinyeSablonDetay }
	static async fisSinifBelirleInternal(e) {
		e ??= {}; await super.fisSinifBelirleInternal(e)
		let {offlineMode} = app
		if (offlineMode) {
			let {rec} = e, {_cls = e._cls} = rec
			let cls = window[_cls]; if (cls) { return cls }
		}
		{
			let rec = await this.getSablonIcinTeslimBilgisi(e); if (!rec) { return null }
			let {TSEK: tip} = rec, islem = e.islem || e.belirtec, {gridRec: fisRec} = e;
			if (islem == 'yeni' || islem == 'kopya') { fisRec = e.gridRec = null }
			let kendimizmi = tip == 'K', kayitSTmi = fisRec?.kayitTipi == 'ST';
			return kendimizmi || kayitSTmi ? SablonluKonsinyeTransferFis : SablonluKonsinyeAlimSiparisFis
		}
	}
	static async getSablonIcinTeslimBilgisi({ sablonSayac, mustKod, sevkAdresKod }) {
		sevkAdresKod ??= ''
		let anah2DagTeslimBilgi = this._anah2DagTeslimBilgi ??= {}
		let anah = toJSONStr({ sablonSayac, mustKod, sevkAdresKod })
		return anah2DagTeslimBilgi[anah] ??= await (() => {
			let sent = new MQSent({
				from: 'hizlisablon sab', fromIliskiler: [
					{ from: 'klfirma kfrm', iliski: 'sab.klfirmakod = kfrm.kod' },
					{
						alias: 'sab', leftJoin: 'kldagitim kdag', on: [
							`kdag.mustkod = ${MQSQLOrtak.sqlServerDegeri(mustKod)}`,
							'sab.klfirmakod = kdag.klfirmakod',
							`kdag.sevkadreskod = ''`
						]
					},
					(sevkAdresKod ? {
						alias: 'sab', leftJoin: 'kldagitim kdagsevk', on: [
							`kdagsevk.mustkod = ${MQSQLOrtak.sqlServerDegeri(mustKod)}`,
							'sab.klfirmakod = kdagsevk.klfirmakod',
							`kdagsevk.sevkadreskod = ${MQSQLOrtak.sqlServerDegeri(sevkAdresKod)}`
						]
					} : null)
				].filter(x => !!x),
				where: { degerAta: sablonSayac, saha: 'sab.kaysayac' },
				sahalar: (sevkAdresKod
					? [
						`COALESCE(kdagsevk.klteslimatcikod, kdag.klteslimatcikod, '') TES`,
						`COALESCE(kdagsevk.teslimtipi, kdag.teslimtipi, 'A') TSEK`,
						'COALESCE(kdagsevk.kendidepokod, kdag.kendidepokod) DEP'
					]
					: [
						`COALESCE(kdag.klteslimatcikod, '') TES`,
						`COALESCE(kdag.teslimtipi, 'A') TSEK`,
						'kdag.kendidepokod DEP'
					])
				}), {sahalar} = sent;
				sahalar.add('sab.klfirmakod SFIR', 'sab.aciklama ADI', 'kfrm.mustkod ANA');
				/* TSEK: { K: kendimiz, A: anafirma, T: teslimatci } */
				return app.sqlExecTekil(sent)
			})()
	}
	static eMailYapiQueryDuzenle({ musterimi, fisSinif, fisSayac, stm }) {
		super.eMailYapiQueryDuzenle(...arguments);
		let fisSiniflar = $.makeArray(fisSinif) ?? this.fisSiniflar;
		let uni = stm.sent = new MQUnionAll();
		let sentEkle = fisSinif => {
			let {teslimCariSaha: xCariKodSaha, stokmu} = fisSinif;
			let sent = this.getSablonluVeKLDagitimliOnSent({ fisSinif, fisSayac }), {sahalar} = sent;
			let kendimizTeslimmiClause = `kdag.bkendimizteslim > 0 AND kdag.klteslimatcikod > ''`;
			sent.fromIliski('carmst car', `fis.${xCariKodSaha} = car.must`)
				.fromIliski('carsevkadres sadr', 'fis.xadreskod = sadr.kod')
				.leftJoin('kdag', 'klfirmabolge kfbol', 'kdag.klfirmabolgekod = kfbol.kod')
				.leftJoin('kdag', 'carmst ktes', 'kdag.klteslimatcikod = ktes.must');
			sahalar.add(
				`'' email_sablon`,
				`${stokmu ? `''` : `(case when sadr.email > '' then sadr.email else car.email end)`} email_alici`,
				`(case when ${kendimizTeslimmiClause} then '' else kfbol.email end) email_bolge`,
				'ktes.email email_teslimatci',
				`(case when kdag.bteslimatmailozeldir > 0 then kdag.ozelmaillistestr else '' end) email_ozel`
			);
			uni.add(sent); return sent
		}
		for (let fisSinif of fisSiniflar) { sentEkle(fisSinif) }

		/*
-- alım sip.
, (case when sadr.email > '' then sadr.email else car.email end) email_alici
-- stok fiş
, (case when kdag.bteslimatmailozeldir > 0 then  else '' end) email_ozel
, '' email_alici
*/
	}
}

/** Şablon'a ait Önceki Siparişler */
class MQSablonOrtakDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return this.fisSinif.table }
	static get sablonSinif() { return MQSablonOrtak } static get fisSinif() { return this.sablonSinif.fisSinif }
	static get konsinyemi() { return this.sablonSinif.konsinyemi }
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e)
		$.extend(e.args, { rowsHeight: 50, groupable: true, filterable: true, showGroupsHeader: true, adaptive: false })
	}
	static ekCSSDuzenle({ sender, rowIndex, dataField: belirtec, rec, result }) {
		super.ekCSSDuzenle(...arguments)
		if (rec._offline === true) { result.push('offline') }
		else if (rec?._offline === false) { result.push('online', 'bg-lightcyan') }
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); let {liste} = e, {offlineMode: offline} = app
		let {konsinyemi, sablonSinif} = this, {sablonSip_degisiklik} = app.params.web
		liste.push(...[
			new GridKolon({ belirtec: 'subekod', text: 'Şube', genislikCh: 7, filterType: 'checkedlist' }),
			(offline ? null : new GridKolon({ belirtec: 'subeadi', text: 'Şube Adı', genislikCh: 23, filterType: 'checkedlist' })),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 11, filterType: 'checkedlist' }).tipDate(),
			new GridKolon({ belirtec: 'fisnox', text: 'Sip. No', genislikCh: 20, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', filterType: 'checkedlist', genislikCh: 16 }),
			(offline ? null : new GridKolon({ belirtec: 'mustunvan', text: 'Ünvan', filterType: 'checkedlist' })),
			new GridKolon({ belirtec: 'sevkadresadi', text: 'Sevk Adres', genislikCh: 15, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'basteslimtarihi', text: 'Tes.Tarih', genislikCh: 11, filterType: 'checkedlist' }).tipDate(),
			new GridKolon({ belirtec: 'bonayli', text: 'Onay?', genislikCh: 6, filterType: 'checkedlist' }).tipBool(),
			(offline ? null : new GridKolon({ belirtec: 'onayla', text: ' ', genislikCh: 6 }).noSql().tipButton('O').onClick(_e => { sablonSinif.onaylaIstendi({ ...e, ..._e }) })),
			(sablonSip_degisiklik ? new GridKolon({ belirtec: 'degistir', text: ' ', genislikCh: 5 }).noSql().tipButton('D').onClick(_e => { sablonSinif.degistirIstendi({ ...e, ..._e }) }) : null),
			new GridKolon({ belirtec: 'sil', text: ' ', genislikCh: 5 }).noSql().tipButton('X').onClick(_e => { sablonSinif.silIstendi({ ...e, ..._e }) })
		].filter(x => !!x))
	}
	static async loadServerDataDogrudan(e) {
		let {offlineMode: offline} = app, {parentRec} = e
		let stm = e.query = e.stm = new MQStm()
		e.sent = stm.sent; this.loadServerData_queryDuzenle(e)
		let recs = await super.loadServerData_querySonucu(e)
		if (offline) {
			await (async () => {
				for (let rec of recs) { rec._offline ??= false }
				let {offlineFisCache} = app; if (!offlineFisCache) { return }
				await offlineFisCache._promise;
				/*let {name: table} = fis.class
				let cache = offlineFisCache.get(table); if (!cache) { return }*/
				let donusum = {
					key: {
						bizsubekod: 'subekod', must: 'mustkod', mustunvan: 'mustunvan',
						no: 'fisnox', sevkadreskod: 'sevkadresadi', onaytipi: 'bonayli',
						subeKod: 'subekod', mustKod: 'mustkod', mustAdi: 'mustunvan',
						fisNo: 'fisnox', sevkAdresKod: 'sevkadresadi', baslikTeslimTarihi: 'basteslimtarihi'
						
					},
					value: {
						no: ({ seri = '', no = 0 }) => `${seri} ${no}`,
						onaytipi: ({ _offline, onaytipi }) => _offline ? false : onaytipi != 'ON'
					}
				}
				let onlineRecsVarmi = !!recs?.length, offlineRecsVarmi = false
				let {kaysayac: sablonSayac} = parentRec ?? {}
				recs = [...recs]
				for (let cache of offlineFisCache.values())
				for (let [id, rec] of cache) {
					if ((rec.sablonsayac || rec.sablonSayac) != sablonSayac) { continue }
					let newRec = { kaysayac: id }
					for (let [key, value] of Object.entries(rec)) {
						if (value === undefined) { continue }
						let newKey = donusum?.key?.[key] ?? key
						let newValue = donusum?.value?.[key] ?? value
						if (newValue?.call) { newValue = newValue.call(this, rec) }
						if (value !== undefined) { newRec[newKey] = newValue; offlineRecsVarmi = true }
					}
					let {seri} = rec
					if (seri) { newRec.fisnox = `${seri} ${newRec.fisnox}`}
					recs.push({ _offline: true, ...newRec })
					/*let fisSinif = window[rec._cls]; if (!fisSinif) { continue }
					let fis = new fisSinif(); await fis.setValues({ rec })
					for (let detRec of rec.detaylar) {
						let detSinif = window[detRec._cls]; if (!detSinif) { continue }
						let det = new detSinif(); await det.setValues({ fis, rec: detRec })
						fis.addDetay(det)
					}*/
				}
				if (onlineRecsVarmi || offlineRecsVarmi) {
					let converted = (key, value) => key == 'tarih' ? asDate(value) : value
					let comparer = (key, a, b, reverse) => {
						a = converted(key, a[key]); b = converted(key, b[key])
						return reverse
							? ( a < b ? 1 : a > b ? -1 : 0 )
							: ( b < a ? -1 : b > a ? 1 : 0 )
					}
					recs.sort((a, b) =>
						comparer('_offline', a, b) ||
						comparer('tarih', a, b) ||
						comparer('seri', a, b, false) ||
						comparer('fisnox', a, b)
					)
				}
			})()
		}
		return recs
	}
	static loadServerData_queryDuzenle(e) { this.sablonIcinSiparislerStmDuzenle({ ...e, detaylimi: true }) }
	static sablonIcinSiparislerStmDuzenle(e) {
		/* gridPart:
				- (detaylimi == true): SablonOrtakFis'in liste ekranı ; parentRec: nil
				- (detaylimi == false): SablonOrtakFis'in liste ekranı ; parentRec: Şablon başlık kaydı
		*/
		let {konsinyemi} = this, {sender: gridPart, parentRec, sablonSayacListe, detaylimi} = e; 
		let {kaysayac: sablonSayac} = parentRec ?? {}; sablonSayacListe ??= $.makeArray(sablonSayac);
		let {tarih, mustKod} = gridPart, subeKod = gridPart.subeKod ?? config.session.subeKod;
		let cariYil = app.params.zorunlu?.cariYil || today().getYil();
		let {stm} = e, {orderBy} = stm, uni = stm.sent = new MQUnionAll();
		let {carmst_ekOz} = app._table2Col;
		let sentEkle = (kayitTipi, fisSinif) => {
			let {table, mustSaha, teslimCariSaha} = fisSinif, keyHV = fisSinif.varsayilanKeyHostVars();
			let mustVeyaTeslimCariSaha = konsinyemi ? teslimCariSaha : mustSaha;
			let sent = new MQSent(), {sahalar, where: wh} = sent;
			sent.fromAdd(`${table} fis`); wh.fisSilindiEkle();
			wh.birlestirDict(keyHV).add(`fis.kapandi = ''`, `fis.tarih >= CAST('${cariYil}-01-01T00:00:00' AS DATETIME)`);
			if (sablonSayacListe) { wh.inDizi(sablonSayacListe, 'fis.sablonsayac') }
			if (subeKod) { wh.degerAta(subeKod, 'fis.bizsubekod') }
			if (tarih) { wh.degerAta(tarih, 'fis.tarih') }
			if (mustKod) { wh.degerAta(mustKod, `fis.${mustVeyaTeslimCariSaha}`) }
			sahalar.add('fis.sablonsayac sablonSayac');
			if (detaylimi) {
				let getSevkAdresClause = n => `(case when COALESCE(sadr.adres${n}, '') = '' then car.adres${n} else sadr.adres${n} end)`;
				sent.fis2SubeBagla().fis2CariBagla({ mustSaha: mustVeyaTeslimCariSaha }).fis2SevkAdresBagla();
				sahalar.add(`${kayitTipi.sqlServerDegeri()} kayitTipi`,
					'fis.kaysayac', 'fis.tarih', 'fis.seri', 'fis.no fisno', 'fis.fisnox', 'fis.bizsubekod subekod', 'sub.aciklama subeadi',
					`fis.${mustVeyaTeslimCariSaha} mustkod`, 'car.birunvan mustunvan',
					'fis.xadreskod sevkadreskod', 'sadr.aciklama sevkadresadi',
					`${getSevkAdresClause(1)} sevkadres1`, `${getSevkAdresClause(2)} sevkadres2`,
					'fis.basteslimtarihi', `(case when fis.onaytipi = 'BK' or fis.onaytipi = 'ON' then 0 else 1 end) bonayli`,
					'fis.cariaciklama fisaciklama'
				)
				for (let attr of ['OZTEMSILCI', 'OZTELEFON']) {
					if (!carmst_ekOz[attr]) { continue }
					sahalar.add(`car.${attr}`)
				}
			}
			else { sahalar.add('COUNT(*) topSayi'); sent.groupByOlustur() }
			uni.add(sent); return sent
		}
		sentEkle('', SablonluKonsinyeAlimSiparisFis);
		sentEkle('ST', SablonluKonsinyeTransferFis);
		if (detaylimi) { orderBy.add('tarih DESC', 'no DESC') }
	}
}
/** Şablon'a ait Önceki Siparişler */
class MQSablonDetay extends MQSablonOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sablonSinif() { return MQSablon }
	static async loadServerDataDogrudan(e) {
		let {sender: gridPart, parentRec} = e;  /* gridPart: SablonOrtakFis'in liste ekranı ; parentRec: Şablon başlık kaydı */
		let {kaysayac: sablonSayac} = parentRec, {tarih, mustKod} = gridPart;
		e.fisSinif = await this.sablonSinif.fisSinifBelirle({ ...e, sablonSayac, mustKod });
		return await super.loadServerDataDogrudan(e)
	}
	static loadServerData_queryDuzenle({ sender: gridPart, parentRec, fisSinif, stm }) {
		super.loadServerData_queryDuzenle(...arguments);    /* gridPart: SablonOrtakFis'in liste ekranı ; parentRec: Şablon başlık kaydı */
		let {kaysayac: sablonSayac} = parentRec, {tarih, mustKod} = gridPart, subeKod = gridPart.subeKod ?? config.session.subeKod;
		let {table, mustSaha} = fisSinif, cariYil = app.params.zorunlu?.cariYil || today().getYil();
		let getSevkAdresClause = n => `(case when COALESCE(sadr.adres${n}, '') = '' then car.adres${n} else sadr.adres${n} end)`;
		let sent = stm.sent = new MQSent({
			from: `${table} fis`,
			where: [
				{ alias: 'fis', birlestirDict: fisSinif.varsayilanKeyHostVars() }, { degerAta: sablonSayac, saha: 'fis.sablonsayac' },
				`fis.kapandi = ''`, `fis.tarih >= CAST('${cariYil}-01-01T00:00:00' AS DATETIME)`
			],
			sahalar: [
				'fis.kaysayac', 'fis.tarih', 'fis.fisnox', 'fis.seri', 'fis.no fisno',
				'fis.bizsubekod subekod', 'sub.aciklama subeadi', `fis.${mustSaha} mustkod`, 'car.birunvan mustunvan',
				'fis.xadreskod sevkadreskod', 'sadr.aciklama sevkadresadi',
				`${getSevkAdresClause(1)} sevkadres1`, `${getSevkAdresClause(2)} sevkadres2`,
				'fis.basteslimtarihi', `(case when fis.onaytipi = 'BK' or fis.onaytipi = 'ON' then 0 else 1 end) bonayli`
			]
		}).fis2SubeBagla().fis2CariBagla().fis2SevkAdresBagla().fisSilindiEkle();
		let {where: wh} = sent, {orderBy} = stm;
		if (tarih) { wh.degerAta(tarih, 'fis.tarih') }
		if (subeKod) { wh.degerAta(subeKod, 'fis.bizsubekod') }
		if (mustKod) { wh.degerAta(mustKod, `fis.${mustSaha}`) }
		orderBy.add('tarih DESC', 'fisnox DESC')
	}
}
/** Şablon'a ait Önceki Siparişler */
class MQKonsinyeSablonDetay extends MQSablonOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sablonSinif() { return MQKonsinyeSablon }
}


/*
	// !! sqlExec sonuçlarını saklayan bir düzeneğe ihtiyaç olabilir (cache)
	let {activeWndPart: part} = app, {subeKod, tarih, mustKod, boundRecs: sablonRecs} = part;
	subeKod ??= config.session.subeKod;
	let sablon2Bilgi = {}, promises = [];
	for (let sablon of sablonRecs) {
		let {kaysayac: sablonSayac, klFirmaKod} = sablon;
		let fisSinif = await MQSablon.fisSinifBelirle({ sablonSayac, mustKod });
		if (!fisSinif) { continue }
		let fis = new fisSinif({ sablonSayac, subeKod, tarih, mustKod, klFirmaKod });
		let e = { ...sablon, sablonSayac, subeKod, tarih, mustKod, fis };
		let promise =
			fis.sablonYukleVeBirlestir(e).then(() =>
			SablonluSiparisFisTemplate.stokIslemBelirle(e).then(() =>
			SablonluSiparisFisTemplate.dagitimIcinEkBilgileriBelirle(e)
		));
		promises.push(promise);
		if (promises.length == 1) {
			try { await promise } catch (ex) { continue }
			promises = []
		}
		promise.then(() => sablon2Bilgi[sablonSayac] = e)
	}
	if (promises.length) { await Promise.allSettled(promises) }
	for (let [sablon, item] of Object.entries(sablon2Bilgi)) {
		let {fis: fisInst} = item, {name: _cls} = fisInst.class;
		let fis = { _cls };
		for (let key of [
				'islKod', 'sablonSayac', 'subeKod', 'tarih', 'seri', 'noYil', 'fisNo', 'mustKod', 'sevkAdresKod',
				'teslimCariKod', 'araciKod', 'cYerKod', 'gYerKod'
				]) {
			let value = fisInst[key];
			if (isDate(value)) { value = dateToString(value) }
			if (value != null) { fis[key] = value }
		}
		let detaylar = fis.detaylar = [];
		for (let detInst of fisInst.detaylar) {
			let {name: _cls} = detInst.class;
			let det = { _cls };
			for (let key of ['shKod', 'shAdi', 'shText', 'grupKod', 'grupAdi', 'grupText', 'miktar', 'fiyat', 'netBedel']) {
				let value = detInst[key];
				if (value != null) { det[key] = value }
			}
			detaylar.push(det)
		}
		item.fis = fis
	}
	let cls2Bilgi = { };
	for (let cls of [app, MQSablonOrtak, MQSCari, SablonluSiparisFisTemplate, HMRBilgi, SatisKosulYapi, Object.values(SatisKosul.tip2Sinif)]) {
		let {name: _cls, globals} = cls, item = {};
		if (globals) {
			let tGlobals = {}; for (let key of ['kod2Adi']) {
				{ let value = globals[key]; if (!$.isEmptyObject(value)) { tGlobals[key] = value } }
			}
			if (!$.isEmptyObject(tGlobals)) { item.globals = tGlobals }
			if (!$.isEmptyObject(tGlobals)) { item.globals = tGlobals }
		}
		if (!_cls) { _cls = 'app' }
		for (let key of [
			'_sqlTables', '_table2Col', '_anah2KosulYapi', '_belirtec2Bilgi', '_belirtecListe', '_belirtecSet', '_ekOzellikListe', '_hmrEtiketDict',
			'_mustKod2Rec', '_must2KonYerKod', 'gecerliDepolar', '_must2UrunKisit', '_key2IzinliStokKodSet'
		]) {
			let value = cls[key];
			if (!$.isEmptyObject(value)) { item[key] = value }
		}
		if (!$.isEmptyObject(item)) { cls2Bilgi[_cls] = item }
	}
	let data = { sablon2Bilgi, cls2Bilgi };
	console.table(data);
	JSON.parse(toJSONStr(data))
*/
