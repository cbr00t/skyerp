class MQAktivasyon extends MQDetayli {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'AKT' } static get sinifAdi() { return 'Aktivasyon' }
	static get table() { return 'muslisans' } static get tableAlias() { return 'fis' }
	static get detaySinif() { return MQAktivasyonDetay } static get gridKontrolcuSinif() { return MQAktivasyonGridci }
	/* static get tumKolonlarGosterilirmi() { return true } */ static get raporKullanilirmi() { return false }
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		/*sec.grupTopluEkle([ { kod: 'inst', etiket: 'Şablon', kapali: false } ])
		sec.secimTopluEkle({
			inst: new SecimBasSon({ etiket: 'Şablon', mfSinif: this, grupKod: 'inst' }),
			aciklama: new SecimOzellik({ etiket: 'Şablon Adı', grupKod: 'inst' })
		});
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {tableAlias: alias} = this, {sayacSaha, adiSaha} = this;
			wh.basiSonu(sec.inst, `${alias}.${sayacSaha}`).ozellik(sec.aciklama, `${alias}.${adiSaha}`)
		})*/
	}
	static listeEkrani_init({ gridPart, sender }) {
		super.listeEkrani_init(...arguments); gridPart = gridPart ?? sender
		/*gridPart.tarih = today(); gridPart.rowNumberOlmasin()*/
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); let {konsinyemi} = this, session = config.session ?? {};
		let gridPart = e.gridPart ?? e.sender, {header, islemTuslariPart} = gridPart, {layout, sol} = islemTuslariPart;
		let loginTipi = session.loginTipi || 'login', loginSubemi = loginTipi == 'login' && session.subeKod != null, loginMusterimi = loginTipi == 'musteri';
		let subeKod = gridPart.subeKod = loginSubemi ? session.subeKod : qs.subeKod ?? qs.sube;
		let mustKod = gridPart.mustKod = loginMusterimi ? session.kod : qs.mustKod ?? qs.must;
		let {rootBuilder: rfb} = e; rfb.setInst(gridPart).addStyle(e => `$elementCSS { --header-height: 160px !important } $elementCSS .islemTuslari { overflow: hidden !important }`);
		let setKA = async (fbdOrLayout, kod, aciklama) => {
			let elm = fbdOrLayout?.layout ?? fbdOrLayout; if (!elm?.length) { return }
			if (kod) {
				aciklama = await aciklama; if (!aciklama) { return }
				let text = aciklama?.trim(); if (kod && typeof kod == 'string') { text = `<span class="kod bold gray">${kod}</b> <span class="aciklama royalblue normal">${aciklama}</span>` };
				elm.html(text.trim()); elm.removeClass('jqx-hidden basic-hidden')
			}
			else { elm.addClass('jqx-hidden') }
		};
		sol.addClass('flex-row'); rfb.addDateInput('tarih', 'İşlem Tarihi').setParent(sol).etiketGosterim_yok()
			.degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
			.addStyle(e => `$elementCSS { margin-left: 30px } $elementCSS > input { width: 130px !important }`);
		if (subeKod == null) {
			rfb.addModelKullan('subeKod', 'Şube').dropDown().setMFSinif(MQSube).autoBind().etiketGosterim_yok().setParent(sol)
				.ozelQueryDuzenleHandler(({ builder: fbd, aliasVeNokta, stm }) => {
					for (let {where: wh} of stm.getSentListe()) {
						wh.add(`${aliasVeNokta}silindi = ''`)
						/*wh.icerikKisitDuzenle_sube({ saha: `${aliasVeNokta}kod` })*/
					}
				}).degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
				.addStyle(e => `$elementCSS { width: 350px !important; margin: 5px 0 0 30px }`)
		}
		else {
			rfb.addForm('sube', ({ builder: fbd }) => $(`<div class="${fbd.id}">${subeKod}</div>`)).setParent(sol)
				.onAfterRun(({ builder: fbd }) => setKA(fbd, subeKod, MQSube.getGloKod2Adi(subeKod)))
				.addStyle(e => `$elementCSS { width: auto !important; margin: 13px 0 0 30px }`)
		}
		if (!mustKod) {
			rfb.addModelKullan('mustKod', 'Müşteri').comboBox().setMFSinif(MQSCari).autoBind().setParent(header)
				.ozelQueryDuzenleHandler(({ builder: fbd, aliasVeNokta, stm }) => {
					for (let sent of stm.getSentListe()) {
						let {where: wh} = sent; if (konsinyemi) {
							sent.fromAdd('hizlisablon sab').fromIliski('kldagitim dag', [`dag.mustkod = ${aliasVeNokta}must`, 'sab.klfirmakod = dag.klfirmakod']) }
						wh.add(`${aliasVeNokta}silindi = ''`, `${aliasVeNokta}calismadurumu <> ''`)
						/*wh.icerikKisitDuzenle_cari({ saha: `${aliasVeNokta}kod` })*/
						sent.distinctYap()
					}
				}).degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
		}
		else {
			rfb.addForm('must', ({ builder: fbd }) => $(`<div class="${fbd.id}">${mustKod}</div>`)).setParent(header)
				.onAfterRun(({ builder: fbd }) => setKA(fbd, mustKod, MQSCari.getGloKod2Adi(mustKod)))
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
	static loadServerData_queryDuzenle({ basit, basitmi, gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments);
		basitmi = basit ?? basitmi; if (basitmi) { return }
		gridPart = gridPart ?? sender; let {subeKod, mustKod} = gridPart, {konsinyemi, tableAlias: alias} = this;
		let {sahalar, where: wh} = sent, {orderBy} = stm;
		sahalar.addWithAlias(alias, 'bvadegunkullanilir vadeGunKullanilirmi', 'vadegunu vadeGunu', 'emailadresler email_sablonEk');
		if (konsinyemi && mustKod) {
			sent.fromIliski('kldagitim dag', ['sab.klfirmakod = dag.klfirmakod', `dag.sevkadreskod = ''`, `dag.mustkod = ${mustKod.sqlServerDegeri()}`]);
			sahalar.add(`${alias}.klfirmakod klFirmaKod`)
		}
		orderBy.liste = ['aciklama']
	}
	static async orjBaslikListesi_recsDuzenle(e) {
		super.orjBaslikListesi_recsDuzenle(e); let {recs} = e;   /* 'await' super.orjBaslikListesi_recsDuzenle(e)  yapınca  'e.recs' bozuluyor ?? */
		let gridPart = e.gridPart = e.gridPart ?? e.sender, {sayacSaha, listeFisSinif} = this, sayac2Rec = {};
		for (let rec of recs) { let sayac = rec[sayacSaha]; sayac2Rec[sayac] = rec }
		let sent = new MQSent(), stm = new MQStm({ sent });
		let sablonSayacListe = Object.keys(sayac2Rec).map(x => asInteger(x)); $.extend(e, { sablonSayacListe, sent, stm });
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
		let gridPart = e.gridPart ?? e.sender ?? {}, {tarih, mustKod} = gridPart, subeKod = gridPart.subeKod ?? config.session?.subeKod;
		let {sablonSayacListe, stm, sent} = e, uni = e.sent = stm.sent = new MQUnionAll();
		$.extend(e, { gridPart, subeKod, tarih, mustKod });
		this.sablonEkQueryDuzenle_ilk(e); this.sablonEkQueryDuzenle_son(e)
	}
	static sablonEkQueryDuzenle_ilk(e) { }
	static sablonEkQueryDuzenle_son({ stm, sablonSayacListe, subeKod, tarih }) {
		for (let sent of stm.getSentListe()) {
			let {sahalar, where: wh} = sent; wh.fisSilindiEkle().add(`fis.kapandi = ''`)
			if (sablonSayacListe?.length) { wh.inDizi(sablonSayacListe, 'fis.sablonsayac') }
			if (subeKod) { wh.degerAta(subeKod, 'fis.bizsubekod') }
			if (tarih) { wh.degerAta(tarih, 'fis.tarih') }
			sahalar.add('fis.sablonsayac sablonSayac', 'COUNT(*) topSayi');
			sent.groupByOlustur()
		}
	}
	static async getEMailYapi(e) {
		let {fisSayac} = e ?? {}, {sablonSip_eMail, konBuFirma_eMailListe} = app.params.web; 
		if (!(fisSayac && sablonSip_eMail)) { return {} }
		let stm = new MQStm(), _e = { ...e, stm }; stm = this.eMailYapiQueryDuzenle(_e) === false ? null : _e.stm;
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
		if (konBuFirma_eMailListe) { result.buFirma = eMailStr2Array(konBuFirma_eMailListe) }
		return result
	}
	static eMailYapiQueryDuzenle(e) { return false }
	static getSablonluVeKLDagitimliOnSent({ fisSinif, fisSayac }) {
		let {table, sayacSaha, mustSaha} = fisSinif;
		let maxSent = new MQSent({
			from: `${table} xfis`, fromIliskiler: [
				{ from: 'hizlisablon xsab', iliski: 'xfis.sablonsayac = xsab.kaysayac' },
				{
					from: 'kldagitim xdag', iliski: [
						`xfis.${mustSaha} = xdag.mustkod`, `xsab.klfirmakod = xdag.klfirmakod`,
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
			return fis.tanimla({ islem, kaydedince })
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Yeni'), 100); throw ex }
	}
	static async onaylaIstendi(e) {
		try {
			let {sender, rec} = e, {parentPart: gridPart} = sender, {bonayli: onaylimi} = rec;
			if (onaylimi) { throw { isError: true, errorText: 'Bu sipariş zaten onaylanmış' } }
			let {kaysayac: sayac, mustkod: mustKod, sevkadreskod: sevkAdresKod, _parentRec: parentRec} = rec, {kaysayac: sablonSayac, klFirmaKod} = parentRec;
			let fisSinif = await this.fisSinifBelirle({ ...e, sablonSayac, mustKod, sevkAdresKod }); if (!fisSinif) { throw { isError: true, errorText: 'Fiş Sınıfı belirlenemedi' } }
			let fis = new fisSinif({ sayac, klFirmaKod }), _e = { ...e, parentRec }; delete _e.rec;
			let result = await fis.yukle(_e); if (!result) { return }
			let islem = 'onayla', kaydedince = _e => this.tazele({ ...e, gridPart });
			let kaydetIslemi = async _e => await this.onaylaDevam({ ...e, ..._e, gridPart });
			return await fis.tanimla({ islem, kaydetIslemi, kaydedince })
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Onayla'), 100); throw ex }
	}
	static async degistirIstendi(e) {
		try {
			let {sender, rec} = e, {parentPart: gridPart} = sender ?? {};
			let {kaysayac: sayac, bonayli: onaylimi, sevkadreskod: sevkAdresKod, _parentRec: parentRec} = rec;
			let mustKod = rec.mustkod ?? gridPart.mustKod, {kaysayac: sablonSayac, klFirmaKod} = parentRec;
			let fisSinif = await this.fisSinifBelirle({ ...e, sablonSayac, mustKod, sevkAdresKod }); if (!fisSinif) { throw { isError: true, errorText: 'Fiş Sınıfı belirlenemedi' } }
			let fis = new fisSinif({ sayac, klFirmaKod }), _e = { ...e, parentRec }; delete _e.rec;
			let result = await fis.yukle(_e); if (!result) { return }
			let islem = onaylimi ? 'izle' : 'degistir', kaydedince = _e => this.tazele({ ...e, ..._e, gridPart });
			return await fis.tanimla({ islem, kaydedince })
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Değiştir'), 100); throw ex }
	}
	static async silIstendi(e) {
		try {
			let {sender, rec} = e, {parentPart: gridPart} = sender ?? {}, {bonayli: onaylimi} = rec;
			if (onaylimi) { throw { isError: true, errorText: 'Onaylı sipariş silinemez' } }
			let {kaysayac: sayac, sevkadreskod: sevkAdresKod, _parentRec: parentRec} = rec;
			let mustKod = rec.mustkod ?? gridPart.mustKod, {kaysayac: sablonSayac} = parentRec;
			let fisSinif = await this.fisSinifBelirle({ ...e, sablonSayac, mustKod, sevkAdresKod }); if (!fisSinif) { throw { isError: true, errorText: 'Fiş Sınıfı belirlenemedi' } }
			let fis = new fisSinif({ sayac }), _e = { ...e, parentRec }; delete _e.rec;
			let result = await fis.yukle(_e); if (!result) { return }
			let islem = 'sil', kaydedince = _e => this.tazele({ ...e, ..._e, gridPart });
			return await fis.tanimla({ islem, kaydedince })
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
		gridPart.tazeleDefer(e)
	}
	static async onaylaDevam({ gridPart: listePart, sender: fisGirisPart, fis, rec }) {
		const {sayac: fisSayac, detaylar} = fis, {table, sayacSaha} = fis.class;
		if (!fisSayac) { throw { isError: true, errorText: 'Onaylanacak Sipariş için ID belirlenemedi' } }
		let dokumVeEMail = musterimi => this.dokumYapVeEMailGonder({ musterimi, fis, rec });
		await dokumVeEMail(true); await dokumVeEMail(false);
		let upd = new MQIliskiliUpdate({ from: table, where: { degerAta: fisSayac, saha: sayacSaha }, set: `onaytipi = ''` });
		await app.sqlExecNone(upd); listePart?.tazeleDefer(); fisGirisPart?.close()
	}
	static async dokumYapVeEMailGonder({ musterimi, fis, fisSayac, parentRec, rec }) {
		let hmrBilgiler = Array.from(HMRBilgi.hmrIter()), dokumcu;
		try { dokumcu = await HTMLDokum.FromDosyaAdi(`VioWeb.KonLojistik.Siparis.${musterimi ? 'Musteri' : 'Diger'}.htm`) }
		catch (ex) { console.error(ex); return false } if (dokumcu == null) { return }
		fisSayac = fisSayac || fis?.sayac; parentRec = parentRec ?? rec?._parentRec;
		const {fiyatFra, bedelFra} = app.params.zorunlu, dvKod = fis.dvKod || 'TL';
		let to = [], cc = [], bcc = [], eMailYapi = await this.getEMailYapi({ fisSayac }) ?? {};
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
					eMailSet[eMail] = true; (to.length ? bcc : to).push(eMail)
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
			for (const {adiAttr} of hmrBilgiler) { let value = det[adiAttr]?.trim(); if (value) { STOKADI += ` (<b style="color: royalblue">${value}</b>)` } }
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
class MQAktivasyonDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'muslisansdetay' }
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); $.extend(e.args, {
			rowsHeight: 50, groupable: true, filterable: true, showGroupsHeader: true, adaptive: false })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); let {liste} = e, {konsinyemi, sablonSinif} = this, {sablonSip_degisiklik} = app.params.web;
		liste.push(...[
			new GridKolon({ belirtec: 'subekod', text: 'Şube', genislikCh: 13 }),
			new GridKolon({ belirtec: 'subeadi', text: 'Şube Adı', genislikCh: 23 }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 15 }).tipDate(),
			new GridKolon({ belirtec: 'fisnox', text: 'Sip. No', genislikCh: 20 }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri' }),
			new GridKolon({ belirtec: 'sevkadresadi', text: 'Sevk Adres', genislikCh: 30 }),
			new GridKolon({ belirtec: 'basteslimtarihi', text: 'Teslim Tarihi', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'bonayli', text: 'Onay?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'onayla', text: ' ', genislikCh: 5 }).noSql().tipButton('O').onClick(_e => { sablonSinif.onaylaIstendi({ ...e, ..._e }) }),
			(sablonSip_degisiklik ? new GridKolon({ belirtec: 'degistir', text: ' ', genislikCh: 5 }).noSql().tipButton('D').onClick(_e => { sablonSinif.degistirIstendi({ ...e, ..._e }) }) : null),
			new GridKolon({ belirtec: 'sil', text: ' ', genislikCh: 5 }).noSql().tipButton('X').onClick(_e => { sablonSinif.silIstendi({ ...e, ..._e }) })
		].filter(x => !!x))
	}
	static loadServerDataDogrudan(e) { let stm = e.query = e.stm = new MQStm(); e.sent = stm.sent; this.loadServerData_queryDuzenle(e); return super.loadServerData_querySonucu(e) }
	static loadServerData_queryDuzenle(e) { /* super yok */ }
}
class MQAktivasyonGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static gridArgsDuzenle({ gridPart, sender, args }) {
		gridPart = gridPart ?? sender; gridPart.sabit();
		$.extend(args, { groupsExpandedByDefault: true, editMode: 'click', selectionMode: 'singlecell' })
	}
	static tabloKolonlariDuzenle_ilk({ tabloKolonlari }) {
		tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'grupAdi', text: 'Grup Adı', genislikCh: 20 }).hidden(),
			new GridKolon({ belirtec: 'stokText', text: 'Ürün/Hizmet', genislikCh: 60, filterable: false }).readOnly(),
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', genislikCh: 13, groupable: false,
				cellValueChanged: e => {
					let { sender: gridPart, gridWidget, rowIndex, belirtec, value } = e;
					let rec = gridWidget.getrowdata(rowIndex), orj = rec._orj = rec._orj ?? {};
					if (orj[belirtec] === undefined) { orj[belirtec] = rec[belirtec] }
					rec._degistimi = (orj[belirtec] || 0) != value;
					gridPart.kontrolcu.miktarFiyatDegisti(e)
					/*gridWidget.beginupdate(); gridWidget.endupdate(false); gridWidget.ensurerowvisible(rowIndex)*/
				},
				cellClassName: (colDef, rowIndex, belirtec, value, _rec) => {
					let {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex);
					let result = [belirtec], {_degistimi: degistimi} = rec;
					if (degistimi) { result.push('bg-lightgreen') }
					return result.join(' ')
				}
			}).tipDecimal().sifirGosterme(),
			new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5 }).readOnly()
		]);
		for (let {belirtec, etiket: text, mfSinif} of HMRBilgi.hmrIter_ekOzellik()) {
			tabloKolonlari.push(new GridKolon({ belirtec, text, genislikCh: 20, filterType: 'checkedlist' }).readOnly()) }
	}
	static tabloKolonlariDuzenle_ara({ tabloKolonlari }) {
		let {params} = app, {sabit: iskSayi} = params.fiyatVeIsk?.iskSayi, {webSiparis_sonStokGosterilirmi} = params.web;
		tabloKolonlari.push(...[
			(webSiparis_sonStokGosterilirmi ? new GridKolon({ belirtec: 'sonStokBilgi', text: 'Son Stok', genislikCh: 13, groupable: false }).readOnly() : null),
			new GridKolon({ belirtec: 'fiyat', text: 'Fiyat', genislikCh: 13, groupable: false }).readOnly().tipDecimal_fiyat().sifirGosterme(),
			new GridKolon({ belirtec: 'brutBedel', text: 'Brüt Bedel', genislikCh: 13, groupable: false }).readOnly().tipDecimal_bedel().sifirGosterme(),
			(iskSayi ? new GridKolon({
				belirtec: 'iskOranlar', text: `İsk.`, genislikCh: 13, groupable: false,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					let result = []; for (let i = 1; i <= iskSayi; i++) {
						let value = rec[`iskOran${i}`]; if (value) { result.push(value) } }
					return changeTagContent(html, result.length ? `%${result.join(' + ')}` : '')
				}
			}).readOnly().sifirGosterme() : null)?.readOnly(),
			new GridKolon({ belirtec: 'netBedel', text: 'Net Bedel', genislikCh: 13, groupable: false }).readOnly().tipDecimal_bedel().sifirGosterme()
		].filter(x => !!x))
	}
	static tabloKolonlariDuzenle_son({ tabloKolonlari }) { }
	static fis2Grid(e) { return true }
	static grid2Fis(e) { return true }
	static geriYuklemeIcinUygunmu(e) { return true }
	static gridVeriYuklendi({ sender: gridPart, grid }) {
		/*let {boundRecs: detaylar, kontrolcu} = gridPart, args = {}, _e = { ...arguments[0], args };
		for (let rowIndex = 0; rowIndex < detaylar.length; rowIndex++) {
			let det = detaylar[rowIndex], {uid} = det;
			$.extend(args, { uid, rowIndex }); kontrolcu.satirBedelHesapla(_e)
		}*/
		grid.jqxGrid({ sortable: true, filterable: true, groupable: true, groups: ['grupAdi'] })
	}
	static miktarFiyatDegisti({ gridWidget, rowIndex, belirtec, gridRec: det, value }) {
		det._degistimi = true
		/* gridWidget.render(); gridWidget.ensurerowvisible(rowIndex) */
	}
	static bedelHesapla(e) { }
}
