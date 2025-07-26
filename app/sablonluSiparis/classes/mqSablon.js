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
		super.listeEkrani_init(...arguments); gridPart = gridPart ?? sender;
		gridPart.tarih = today(); gridPart.rowNumberOlmasin()
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); let {konsinyemi} = this, session = config.session ?? {};
		let gridPart = e.gridPart ?? e.sender, {header, islemTuslariPart} = gridPart, {layout, sol} = islemTuslariPart;
		let loginTipi = session.loginTipi || 'login', loginSubemi = loginTipi == 'login' && session.subeKod != null, loginMusterimi = loginTipi == 'musteri';
		let subeKod = gridPart.subeKod = loginSubemi ? session.subeKod : qs.subeKod ?? qs.sube;
		let mustKod = gridPart.mustKod = loginMusterimi ? session.kod : qs.mustKod ?? qs.must;
		let {rootBuilder: rfb} = e; rfb.setInst(gridPart).addStyle(
			`$elementCSS { --header-height: 160px !important } $elementCSS .islemTuslari { overflow: hidden !important }`);
		let setKA = async (fbdOrLayout, kod, aciklama) => {
			let elm = fbdOrLayout?.layout ?? fbdOrLayout; if (!elm?.length) { return }
			if (kod) {
				aciklama = await aciklama; if (!aciklama) { return }
				let text = aciklama?.trim(); if (kod && typeof kod == 'string') {
					text = `<span class="kod bold gray">${kod}</b> <span class="aciklama royalblue normal">${aciklama}</span>` }
				elm.html(text.trim()); elm.removeClass('jqx-hidden basic-hidden')
			}
			else { elm.addClass('jqx-hidden') }
		};
		sol.addClass('flex-row'); rfb.addDateInput('tarih', 'İşlem Tarihi').setParent(sol).etiketGosterim_yok()
			.degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
			.addStyle(e => `$elementCSS { margin-left: 30px } $elementCSS > input { width: 130px !important }`);
		if (!konsinyemi && subeKod == null) {
			rfb.addModelKullan('subeKod', 'Şube').dropDown().setMFSinif(MQSube).autoBind().etiketGosterim_yok().setParent(sol)
				.ozelQueryDuzenleHandler(({ builder: fbd, aliasVeNokta, stm }) => {
					for (let {where: wh} of stm.getSentListe()) {
						wh.add(`${aliasVeNokta}silindi = ''`)
						/*wh.icerikKisitDuzenle_sube({ saha: `${aliasVeNokta}kod` })*/
					}
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
					if (konsinyemi) {
						gridPart.tazeleDefer(e) }
					else {
						let {bizsubekod: subeKod} = rec, {fbd_sube} = gridPart;
						if (subeKod == null) { gridPart.tazeleDefer(e) }
						else { gridPart.subeKod = subeKod; fbd_sube?.part?.val(subeKod) }
					}
				})
				.onAfterRun(({ builder: fbd }) => gridPart.fbd_must = fbd)
		}
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments);
		$.extend(args, { rowsHeight: 60, groupable: false, selectionMode: 'none' })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(...[
			new GridKolon({ belirtec: 'topSayi', text: 'Sip.Sayı', genislikCh: 10 }).noSql().tipNumerik(),
			new GridKolon({ belirtec: 'yeni', text: ' ', genislikCh: 8 }).noSql().tipButton('+').onClick(_e => { this.yeniIstendi({ ...e, ..._e }) })
		])
	}
	static async loadServerData_queryDuzenle({ basit, basitmi, gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments);
		gridPart ??= sender; basitmi = basit ?? basitmi;
		if (basitmi) { return }
		let {konsinyemi, tableAlias: alias} = this, {mustKod} = gridPart;
		let subeKod = gridPart.subeKod ?? config.session?.subeKod;
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
		super.orjBaslikListesi_recsDuzenle(e); let {recs} = e;   /* 'await' super.orjBaslikListesi_recsDuzenle(e)  yapınca  'e.recs' bozuluyor ?? */
		let gridPart = e.gridPart = e.gridPart ?? e.sender, {sayacSaha, listeFisSinif} = this, sayac2Rec = {};
		for (let rec of recs) { let sayac = rec[sayacSaha]; sayac2Rec[sayac] = rec }
		let sablonSayacListe = e.sablonSayacListe = Object.keys(sayac2Rec).map(x => asInteger(x));
		let sent = e.sent = new MQSent(), stm = e.stm = new MQStm({ sent });
		this.sablonEkQueryDuzenle(e); sent = e.sent; stm = e.stm;
		for (let { sablonSayac, topSayi } of await app.sqlExecSelect(stm)) {
			let rec = sayac2Rec[sablonSayac]; if (!rec) { continue }
			rec.topSayi = (rec.topSayi || 0) + topSayi
		}
		return recs
	}
	static loadServerData_detaylar({ parentRec }) {
		return this.detaySinif.loadServerData(...arguments).then(recs => {
			for (let rec of recs) { rec._parentRec = parentRec } return recs })
	}
	static sablonEkQueryDuzenle(e) {
		let gridPart = e.gridPart ?? e.sender ?? {}, {tarih, mustKod} = gridPart;
		let subeKod = gridPart.subeKod ?? config.session?.subeKod;
		let {sablonSayacListe, stm, sent} = e, uni = e.sent = stm.sent = new MQUnionAll();
		$.extend(e, { gridPart, subeKod, tarih, mustKod });
		this.sablonEkQueryDuzenleDevam(e)
	}
	static sablonEkQueryDuzenleDevam(e) { return this.detaySinif.sablonIcinSiparislerStmDuzenle({ ...e, detaylimi: false }) }
	static async getEMailYapi({ musterilimi, fisSinif, fisSayac }) {
		let {sablonSip_eMail, konBuFirma_eMailListe} = app.params.web;
		if (!(fisSayac && sablonSip_eMail)) { return {} }
		let _e = { ...arguments[0] }, {eMailStm: stm} = _e;
		if (!stm) {
			stm = _e.stm = new MQStm();
			stm = _e.stm = _e.eMailStm = this.eMailYapiQueryDuzenle(_e) === false ? null : _e.stm
		}
		let EMailPrefix = 'email_', recs = stm ? await app.sqlExecSelect(stm) : null;
		let result = { ...recs?.[0] }; if (recs?.length) {
			for (let rec of recs) {
				for (let [key, value] of Object.entries(rec)) {
					if (key.startsWith(EMailPrefix)) {
						value = eMailStr2Array(value);
						let newKey = key.slice(EMailPrefix.length), array = result[newKey] = result[newKey] ?? [];
						if (value?.length) { array.push(...value) } delete result[key]
					}
				}
			}
		}
		if (konBuFirma_eMailListe?.length) { result.buFirma = eMailStr2Array(konBuFirma_eMailListe) }
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
	static async yeniIstendi(e) {
		try {
			let {sender: gridPart} = e, {tarih, mustKod} = gridPart; if (!mustKod) { throw { isError: true, errorText: `<b>Müşteri</b> seçilmelidir` } }
			let subeKod = gridPart.subeKod ?? config.session?.subeKod, {rec} = e, {kaysayac: sablonSayac, klFirmaKod} = rec;
			let fisSinif = await this.fisSinifBelirle({ ...e, sablonSayac, mustKod }); if (!fisSinif) { throw { isError: true, errorText: 'Fiş Sınıfı belirlenemedi' } }
			let _e = { ...e}; delete _e.rec;
			let fis = new fisSinif({ sablonSayac, tarih, subeKod, mustKod, klFirmaKod }); await fis.sablonYukleVeBirlestir(_e);
			let islem = 'yeni', kaydedince = _e => this.tazele({ ...e, gridPart });
			setTimeout(() => showProgress(), 10);
			try { return fis.tanimla({ islem, kaydedince }) }
			finally { setTimeout(() => hideProgress(), 500) }
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Yeni'), 100); throw ex }
	}
	static async onaylaIstendi(e) {
		try {
			let {sender, rec} = e, {parentPart: gridPart} = sender, {bonayli: onaylimi} = rec;
			if (!config.dev && onaylimi) { throw { isError: true, errorText: 'Bu sipariş zaten onaylanmış' } }
			let {kaysayac: sayac, mustkod: mustKod, sevkadreskod: sevkAdresKod, _parentRec: parentRec} = rec;
			let {kaysayac: sablonSayac, klFirmaKod} = parentRec;
			let fisSinif = await this.fisSinifBelirle({ ...e, sablonSayac, mustKod, sevkAdresKod });
			if (!fisSinif) { throw { isError: true, errorText: 'Fiş Sınıfı belirlenemedi' } }
			let fis = new fisSinif({ sayac, klFirmaKod }), _e = { ...e, parentRec }; delete _e.rec;
			setTimeout(() => showProgress(), 10);
			try {
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
			setTimeout(() => showProgress(), 10);
			try {
				let fisSinif = await this.fisSinifBelirle({ ...e, sablonSayac, mustKod, sevkAdresKod });
				if (!fisSinif) { throw { isError: true, errorText: 'Fiş Sınıfı belirlenemedi' } }
				let fis = new fisSinif({ sayac, klFirmaKod }), _e = { ...e, parentRec }; delete _e.rec;
				let result = await fis.yukle(_e); if (!result) { return }
				let islem = onaylimi ? 'izle' : 'degistir', kaydedince = _e => this.tazele({ ...e, ..._e, gridPart });
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
			setTimeout(() => showProgress(), 10);
			try {
				let fisSinif = await this.fisSinifBelirle({ ...e, sablonSayac, mustKod, sevkAdresKod });
				if (!fisSinif) { throw { isError: true, errorText: 'Fiş Sınıfı belirlenemedi' } }
				let fis = new fisSinif({ sayac }), _e = { ...e, parentRec }; delete _e.rec;
				let result = await fis.yukle(_e); if (!result) { return }
				let islem = 'sil', kaydedince = _e => this.tazele({ ...e, ..._e, gridPart });
				return await fis.tanimla({ islem, kaydedince })
			}
			finally { setTimeout(() => hideProgress(), 500) }
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Değiştir'), 100); throw ex }
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
		if (!stokmu) { await dokumVeEMail(true) }
		await dokumVeEMail(false);
		let upd = new MQIliskiliUpdate({
			from: table, where: { degerAta: fisSayac, saha: sayacSaha },
			set: { degerAta: '', saha: 'onaytipi' }
		});
		await app.sqlExecNone(upd);
		let islem = 'D', degisenler = ['Web Kon.Sip.', 'Onay'];
		fis.logKaydet({ islem, degisenler });
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
			let eMailSelectors = ['buFirma', 'sablon', 'sablonEk', 'bolge', 'ozel', (musterimi ? 'alici' : 'teslimatci')].filter(x => !!x), eMailSet = {};
			for (let selector of eMailSelectors) {
				let eMails = eMailYapi[selector]?.filter(x => x?.length >= 5 && x.includes('@')) ?? [];
				for (let eMail of eMails) {
					eMail = eMail.trim(); if (eMailSet[eMail]) { continue }
					eMailSet[eMail] = true; (to.length ? cc : to).push(eMail)
				}
			}
		}
		if (!(config.dev || to?.length)) { return }
		let SERI = '', SEVKADRES1 = '', SEVKADRES2 = '', cro = { TEMSILCI: '', TELEFON: '' };
		let {sayac: SABLONSAYAC, aciklama: SABLONADI} = parentRec, {fisnox: FISNO, mustkod: MUSTKOD, mustunvan: MUSTUNVAN, sevkadreskod: SEVKADRESKOD, sevkadresadi: SEVKADRESADI} = rec;
		let {klFirmaKod: KLFIRMAKOD} = this, KLFIRMAUNVAN = (KLFIRMAKOD ? await MQSKLFirma.getGloKod2Adi(KLFIRMAKOD) : null) ?? '', KLFIRMAADI = KLFIRMAUNVAN, KLFIRMABIRUNVAN = KLFIRMAUNVAN;
		let MUSTBIRUNVAN = MUSTUNVAN, MUSTADI = MUSTUNVAN, TARIH = dateKisaString(asDate(rec.tarih)) ?? '', TESLIMTARIH = dateKisaString(asDate(rec.basteslimtarihi)) || TARIH;
		let TESLIMTARIHIVARTEXT = TESLIMTARIH ? `${TESLIMTARIH} tarihinde teslim edilmek üzere ` : '', TESLIMYERIADIPARANTEZLI = new CKodVeAdi(SEVKADRESKOD, SEVKADRESADI).parantezliOzet();
		let TESLIMYERKOD = SEVKADRESKOD, TESLIMYERADI = SEVKADRESADI, TESLIMYERIKOD = TESLIMYERKOD, TESLIMYERIADI = TESLIMYERADI;
		let EKNOTLAR = '', EKNOT = EKNOTLAR, EKACIKLAMA = EKNOTLAR;
		let baslik = {
			SABLONSAYAC, SABLONADI, MUSTKOD, MUSTUNVAN, MUSTBIRUNVAN, MUSTADI, TARIH, SERI, FISNO, TESLIMTARIH, TESLIMTARIHIVARTEXT,
			KLFIRMAKOD, KLFIRMAUNVAN, KLFIRMABIRUNVAN, KLFIRMAADI, SEVKADRES1, SEVKADRES2, TESLIMYERKOD, TESLIMYERADI, TESLIMYERIKOD, TESLIMYERIADI,
			TESLIMYERIADIPARANTEZLI, SEVKADRESKOD, SEVKADRESADI, EKNOTLAR
		};
		for (let [key, value] of Object.entries(cro)) { baslik[`CRO-OZ${key}`] = value }
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
		if (config.dev) {
			let url = URL.createObjectURL(new Blob([htmlData], { type: 'text/html' }));
			openNewWindow(url)
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
		await super.fisSinifBelirleInternal(e);
		let rec = await this.getSablonIcinTeslimBilgisi(e); if (!rec) { return null }
		let {TSEK: tip} = rec, islem = e.islem || e.belirtec, {gridRec: fisRec} = e;
		if (islem == 'yeni' || islem == 'kopya') { fisRec = e.gridRec = null }
		let kendimizmi = tip == 'K', kayitSTmi = fisRec?.kayitTipi == 'ST';
		return kendimizmi || kayitSTmi ? SablonluKonsinyeTransferFis : SablonluKonsinyeAlimSiparisFis
	}
	static getSablonIcinTeslimBilgisi({ sablonSayac, mustKod, sevkAdresKod }) {
		let anah2DagTeslimBilgi = this._anah2DagTeslimBilgi ??= {};
		let anah = toJSONStr({ sablonSayac, mustKod, sevkAdresKod });
		return anah2DagTeslimBilgi[anah] ??= (() => {
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
	static eMailYapiQueryDuzenle({ fisSinif, fisSayac, stm }) {
		super.eMailYapiQueryDuzenle(...arguments);
		let fisSiniflar = $.makeArray(fisSinif) ?? this.fisSiniflar;
		let uni = stm.sent = new MQUnionAll();
		let sentEkle = fisSinif => {
			let {teslimCariSaha: xCariKodSaha, stokmu} = fisSinif;
			let sent = this.getSablonluVeKLDagitimliOnSent({ fisSinif, fisSayac }), {sahalar} = sent;
			// let kendimizTeslimmiClause = `kdag.bkendimizteslim > 0 AND kdag.klteslimatcikod > ''`;
			sent.fromIliski('carmst car', `fis.${xCariKodSaha} = car.must`)
				.fromIliski('carsevkadres sadr', 'fis.xadreskod = sadr.kod')
				.leftJoin('kdag', 'klfirmabolge kfbol', 'kdag.klfirmabolgekod = kfbol.kod')
				.leftJoin('kdag', 'carmst ktes', 'kdag.klteslimatcikod = ktes.must');
			sahalar.add(
				`'' email_sablon`, 'kfbol.email email_bolge',
				`${stokmu ? 'ktes.email' : `(case when kdag.bteslimatmailozeldir = 0 then ktes.email else '' end)`} email_teslimatci`,
				`(case when kdag.bteslimatmailozeldir > 0 then kdag.ozelmaillistestr else '' end) email_ozel`,
				`${stokmu ? `''` : `(case when sadr.email > '' then sadr.email else car.email end)`} email_alici`
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
		super.orjBaslikListesi_argsDuzenle(e); $.extend(e.args, {
			rowsHeight: 50, groupable: true, filterable: true, showGroupsHeader: true, adaptive: false })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); let {liste} = e, {konsinyemi, sablonSinif} = this, {sablonSip_degisiklik} = app.params.web;
		liste.push(...[
			new GridKolon({ belirtec: 'subekod', text: 'Şube', genislikCh: 8, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'subeadi', text: 'Şube Adı', genislikCh: 30, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 13, filterType: 'checkedlist' }).tipDate(),
			new GridKolon({ belirtec: 'fisnox', text: 'Sip. No', genislikCh: 16, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', filterType: 'checkedlist', genislikCh: 18 }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Ünvan', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'sevkadresadi', text: 'Sevk Adres', genislikCh: 20, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'basteslimtarihi', text: 'Tes.Tarih', genislikCh: 13, filterType: 'checkedlist' }).tipDate(),
			new GridKolon({ belirtec: 'bonayli', text: 'Onay?', genislikCh: 8, filterType: 'checkedlist' }).tipBool(),
			new GridKolon({ belirtec: 'onayla', text: ' ', genislikCh: 6 }).noSql().tipButton('O').onClick(_e => { sablonSinif.onaylaIstendi({ ...e, ..._e }) }),
			(sablonSip_degisiklik ? new GridKolon({ belirtec: 'degistir', text: ' ', genislikCh: 5 }).noSql().tipButton('D').onClick(_e => { sablonSinif.degistirIstendi({ ...e, ..._e }) }) : null),
			new GridKolon({ belirtec: 'sil', text: ' ', genislikCh: 5 }).noSql().tipButton('X').onClick(_e => { sablonSinif.silIstendi({ ...e, ..._e }) })
		].filter(x => !!x))
	}
	static loadServerDataDogrudan(e) {
		let stm = e.query = e.stm = new MQStm(); e.sent = stm.sent;
		this.loadServerData_queryDuzenle(e);
		return super.loadServerData_querySonucu(e)
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
				sent.fis2SubeBagla().fis2CariBagla({ mustSaha: mustVeyaTeslimCariSaha }).fis2SevkAdresBagla();
				sahalar.add(`${kayitTipi.sqlServerDegeri()} kayitTipi`,
					'fis.kaysayac', 'fis.tarih', 'fis.fisnox', 'fis.no', 'fis.bizsubekod subekod', 'sub.aciklama subeadi',
					`fis.${mustVeyaTeslimCariSaha} mustkod`, 'car.birunvan mustunvan',
					'fis.xadreskod sevkadreskod', 'sadr.aciklama sevkadresadi', 'fis.basteslimtarihi',
					`(case when fis.onaytipi = 'BK' or fis.onaytipi = 'ON' then 0 else 1 end) bonayli`)
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
		let sent = stm.sent = new MQSent({
			from: `${table} fis`,
			where: [
				{ alias: 'fis', birlestirDict: fisSinif.varsayilanKeyHostVars() }, { degerAta: sablonSayac, saha: 'fis.sablonsayac' },
				`fis.kapandi = ''`, `fis.tarih >= CAST('${cariYil}-01-01T00:00:00' AS DATETIME)`
			],
			sahalar: [
				'fis.kaysayac', 'fis.tarih', 'fis.fisnox', `fis.bizsubekod subekod`, 'sub.aciklama subeadi', `fis.${mustSaha} mustkod`, 'car.birunvan mustunvan',
				'fis.xadreskod sevkadreskod', 'sadr.aciklama sevkadresadi', 'fis.basteslimtarihi', `(case when fis.onaytipi = 'BK' or fis.onaytipi = 'ON' then 0 else 1 end) bonayli`
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
