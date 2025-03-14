class MQSablonOrtak extends MQDetayliVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get gereksizTablolariSilYapilirmi() { return false } static get noAutoFocus() { return true }
	static get detaySinif() { return MQSablonOrtakDetay } static get listeFisSinif() { return SablonluSiparisListeOrtakFis }
	static get listeFisTemplate() { return this.listeFisSinif?.instance }
	static get fisSinif() { return this.listeFisTemplate?.fisSinif } static get fisIcinDetaySinif(){ return this.listeFisTemplate?.fisIcinDetaySinif }
	static get fisIcinDetayTable(){ return this.listeFisTemplate?.fisIcinDetayTable }
	static get table() { return 'hizlisablon' } static get tableAlias() { return 'sab' } static get adiEtiket() { return 'Şablon Adı' }
	static get kodListeTipi() { return this.listeFisSinif.kodListeTipi } static get sinifAdi() { return this.listeFisSinif.sinifAdi } static get tumKolonlarGosterilirmi() { return true }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); let {secimler: sec} = e;
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
	static listeEkrani_init(e) { super.listeEkrani_init(e); let gridPart = e.gridPart ?? e.sender; gridPart.tarih = today(); gridPart.rowNumberOlmasin() }
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); let session = config.session ?? {};
		let loginTipi = session.loginTipi || 'login', loginSubemi = loginTipi == 'login' && session.subeKod != null, loginMusterimi = loginTipi == 'musteri';
		let subeKod = loginSubemi ? session.subeKod : null, mustKod = loginMusterimi ? session.kod : null;
		let gridPart = e.gridPart ?? e.sender, {header, islemTuslariPart} = gridPart, {layout, sol} = islemTuslariPart;
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
						let {where: wh} = sent; sent.fromAdd('hizlisablon sab');
						sent.fromIliski('kldagitim dag', [`dag.mustkod = ${aliasVeNokta}must`, 'sab.klfirmakod = dag.klfirmakod'])
						wh.add(`${aliasVeNokta}silindi = ''`, `${aliasVeNokta}calismadurumu <> ''`)
						/*wh.icerikKisitDuzenle_cari({ saha: `${aliasVeNokta}kod` })*/
					}
				}).degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
		}
		else {
			rfb.addForm('must', ({ builder: fbd }) => $(`<div class="${fbd.id}">${mustKod}</div>`)).setParent(header)
				.onAfterRun(({ builder: fbd }) => setKA(fbd, mustKod, MQSCari.getGloKod2Adi(mustKod)))
		}
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); $.extend(e.args, { rowsHeight: 60, groupable: false, selectionMode: 'none' }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(...[
			new GridKolon({ belirtec: 'topSayi', text: 'Sip.Sayı', genislikCh: 10 }).noSql().tipNumerik(),
			new GridKolon({ belirtec: 'yeni', text: ' ', genislikCh: 8 }).noSql().tipButton('+').onClick(_e => { this.yeniIstendi({ ...e, ..._e }) })
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let basitmi = e.basit ?? e.basitmi; if (basitmi) { return }
		let {tableAlias: alias} = this, {sent, stm} = e, {sahalar, where: wh} = sent, {orderBy} = stm;
		sahalar.addWithAlias(alias, 'bvadegunkullanilir vadeGunKullanilirmi', 'vadegunu vadeGunu', 'emailadresler email_sablonEk', 'klfirmakod klFirmaKod');
		orderBy.liste = ['aciklama']
	}
	static async orjBaslikListesi_recsDuzenle(e) {
		super.orjBaslikListesi_recsDuzenle(e); let {recs} = e;   /* 'await' super.orjBaslikListesi_recsDuzenle(e)  yapınca  'e.recs' bozuluyor ?? */
		let gridPart = e.gridPart = e.gridPart ?? e.sender, {sayacSaha, listeFisSinif} = this, sayac2Rec = {};
		for (let rec of recs) { let sayac = rec[sayacSaha]; sayac2Rec[sayac] = rec }
		let sent = new MQSent(), stm = new MQStm({ sent });
		let sablonSayacListe = Object.keys(sayac2Rec).map(x => asInteger(x)); $.extend(e, { sablonSayacListe, sent, stm });
		listeFisSinif.sablonEkQueryDuzenle(e); sent = e.sent; stm = e.stm;
		for (let { sablonSayac, topSayi } of await app.sqlExecSelect(stm)) {
			let rec = sayac2Rec[sablonSayac]; if (!rec) { continue }
			rec.topSayi = (rec.topSayi || 0) + topSayi
		}
		return recs
	}
	static loadServerData_detaylar(e) {
		let {parentRec} = e; return this.detaySinif.loadServerData(e).then(recs => {
			for (let rec of recs) { rec._parentRec = parentRec } return recs })
	}
	static async yeniIstendi(e) {
		try {
			let {sender: gridPart} = e, {listeFisSinif} = this; if (!listeFisSinif) { return null }
			let {tarih, mustKod} = gridPart, subeKod = gridPart.subeKod ?? config.session?.subeKod, {rec} = e, {kaysayac: sablonSayac, klFirmaKod} = rec;
			if (!mustKod) { throw { isError: true, errorText: `<b>Müşteri</b> seçilmelidir` } }
			let fis = new listeFisSinif({ sablonSayac, tarih, subeKod, mustKod, klFirmaKod });
			let result = await fis.yukle({ ...e, rec: undefined }); if (!result) { return }
			let islem = 'yeni', kaydedince = _e => this.tazele({ ...e, gridPart });
			return fis.tanimla({ islem, kaydedince })
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Yeni'), 100); throw ex }
	}
	static async onaylaIstendi(e) {
		try {
			let gridPart = e.sender.parentPart, {listeFisSinif} = this; if (!listeFisSinif) { return null }
			let {rec} = e, {kaysayac: fisSayac, bonayli: onaylimi, _parentRec: parentRec} = rec;
			let {kaysayac: sablonSayac, klFirmaKod} = parentRec, {mustkod: mustKod, sevkadreskod: sevkAdresKod} = rec;
			if (onaylimi) { throw { isError: true, errorText: 'Bu sipariş zaten onaylanmış' } }
			let fis = new listeFisSinif({ fisSayac, sablonSayac, klFirmaKod });
			let result = await fis.yukle({ ...e, parentRec, rec: undefined }); if (!result) { return }
			let islem = 'onayla', kaydedince = _e => this.tazele({ ...e, gridPart });
			let kaydetIslemi = async _e => await this.onaylaDevam({ ...e, ..._e, gridPart });
			$.extend(e, { sablonSayac, mustKod, sevkAdresKod }); await listeFisSinif.instance.fisSinifBelirle(e);
			return await fis.tanimla({ islem, kaydetIslemi, kaydedince })
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Onayla'), 100); throw ex }
	}
	static async onaylaDevam({ gridPart: listePart, sender: fisGirisPart, fis: listeFis, rec }) {
		const {asilFis: fis} = listeFis, {sayac: fisSayac, detaylar} = fis, {table, sayacSaha} = fis.class;
		if (!fisSayac) { throw { isError: true, errorText: 'Onaylanacak Sipariş için ID belirlenemedi' } }
		let dokumVeEMail = musterimi => this.dokumYapVeEMailGonder({ musterimi, listeFis, rec });
		await dokumVeEMail(true); await dokumVeEMail(false);
		let upd = new MQIliskiliUpdate({ from: table, where: { degerAta: fisSayac, saha: sayacSaha }, set: `onaytipi = ''` });
		await app.sqlExecNone(upd); listePart?.tazeleDefer(); fisGirisPart?.close()
	}
	static async dokumYapVeEMailGonder({ musterimi, listeFis, fis, fisSayac, parentRec, rec }) {
		let hmrBilgiler = Array.from(HMRBilgi.hmrIter()), dokumcu;
		try { dokumcu = await HTMLDokum.FromDosyaAdi(`VioWeb.KonLojistik.Siparis.${musterimi ? 'Musteri' : 'Diger'}.htm`) }
		catch (ex) { console.error(ex); return false } if (dokumcu == null) { return }
		fis = fis ?? listeFis?.asilFis; fisSayac = fisSayac || fis?.sayac; parentRec = parentRec ?? rec?._parentRec;
		const {fiyatFra, bedelFra} = app.params.zorunlu, dvKod = fis.dvKod || 'TL';
		let to = [], cc = [], bcc = [], eMailYapi = await listeFis.class.getEMailYapi({ fisSayac }) ?? {};
		if (eMailYapi) {
			let {email_sablonEk} = parentRec; if (email_sablonEk) {
				email_sablonEk = email_sablonEk.split(';').map(x => x.trim()).filter(x => !!x);
				if (email_sablonEk?.length) { $.extend(eMailYapi, { mail_sablonEk }) }
			}
			let eMailSelectors = ['sablon', 'sablonEk', 'bolge', 'ozel', (musterimi ? 'alici' : 'teslimatci')].filter(x => !!x), eMailSet = {};
			for (let selector of eMailSelectors) {
				let eMails = eMailYapi[selector]?.filter(x => x?.length >= 5 && x.includes('@')) ?? [];
				for (let eMail of eMails) {
					eMail = eMail.trim(); if (eMailSet[eMail]) { continue }
					eMailSet[eMail] = true; (to.length ? bcc : to).push(eMail)
				}
			}
		}
		if (!(config.dev || to?.length)) { return }
		let SERI = '', KLFIRMAADI = '', SEVKADRES1 = '', SEVKADRES2 = '', TESLIMTARIHIVARTEXT = '', EKNOTLAR = '', cro = { TEMSILCI: '', TELEFON: '' };
		let {fisnox: FISNO, mustunvan: MUSTUNVAN, sevkadreskod, sevkadresadi} = rec;
		let {aciklama: SABLONADI} = parentRec, TARIH = dateKisaString(asDate(rec.tarih)), TESLIMTARIH = dateKisaString(asDate(rec.basteslimtarihi));
		let TESLIMYERIADIPARANTEZLI = new CKodVeAdi(sevkadreskod, sevkadresadi).parantezliOzet();
		let baslik = { MUSTUNVAN, SEVKADRES1, SEVKADRES2, SABLONADI, KLFIRMAADI, TESLIMYERIADIPARANTEZLI, TARIH, SERI, FISNO, TESLIMTARIH, TESLIMTARIHIVARTEXT, EKNOTLAR };
		for (let [key, value] of Object.entries(cro)) { baslik[`CRO-OZ${key}`] = value }
		let dip = { brm2Miktar: {}, TOPBEDEL: 0 }, detaylar = fis.detaylar.map(det => {
			let {shKod: STOKKOD, shAdi: STOKADI, brm: BRM, miktar, fiyat, netBedel: bedel} = det;
			for (const {adiAttr} of hmrBilgiler) { let value = det[adiAttr]?.trim(); if (value) { STOKADI += ` (<b style="color: royalblue">${value}</b>)` } }
			dip.brm2Miktar[BRM] = (dip.brm2Miktar[BRM] ?? 0) + (miktar ?? 0); dip.TOPBEDEL += (bedel ?? 0);
			let MIKTAR = numberToString(miktar ?? 0), FIYAT = `${toStringWithFra(fiyat ?? 0, fiyatFra)} ${dvKod}`, BEDEL = `${toStringWithFra(bedel ?? 0, bedelFra)} ${dvKod}`;
			return { STOKKOD, STOKADI, MIKTAR, BRM, FIYAT, BEDEL }
		});
		let bm_ents = Object.entries(dip.brm2Miktar); $.extend(dip, {
			TOPMIKTAR: bm_ents.map(([, miktar]) => numberToString(miktar)).join(`<br/>${CrLf}`),
			BRM: bm_ents.map(([brm]) => brm).join(`<br/>${CrLf}`),
			TOPBEDEL: `${toStringWithFra(dip.TOPBEDEL, bedelFra)} ${dvKod}`
		}); delete dip.brm2Miktar;
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
	static async degistirIstendi(e) {
		try {
			let {parentPart: gridPart} = e.sender ?? {}, {listeFisSinif} = this; if (!listeFisSinif) { return null }
			let {rec} = e, {kaysayac: fisSayac, bonayli: onaylimi, _parentRec: parentRec} = rec;
			let {kaysayac: sablonSayac, klFirmaKod} = parentRec;
			let fis = new listeFisSinif({ fisSayac, sablonSayac, klFirmaKod });
			let result = await fis.yukle({ ...e, parentRec, rec: undefined }); if (!result) { return }
			let islem = onaylimi ? 'izle' : 'degistir', kaydedince = _e => this.tazele({ ...e, gridPart });
			return await fis.tanimla({ islem, kaydedince })
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Değiştir'), 100); throw ex }
	}
	static async silIstendi(e) {
		try {
			let {parentPart: gridPart} = e.sender ?? {}, {listeFisSinif} = this; if (!listeFisSinif) { return null }
			let {tarih, mustKod} = gridPart, {rec} = e, {kaysayac: fisSayac, bonayli: onaylimi, _parentRec: parentRec} = rec;
			let {kaysayac: sablonSayac, klFirmaKod} = parentRec;
			if (onaylimi) { throw { isError: true, errorText: 'Onaylı sipariş silinemez' } }
			let fis = new listeFisSinif({ fisSayac, sablonSayac, tarih, mustKod, klFirmaKod });
			let result = await fis.yukle({ ...e, parentRec, rec: undefined }); if (!result) { return }
			let islem = 'sil', kaydedince = _e => this.tazele({ ...e, gridPart });
			return await fis.tanimla({ islem, kaydedince })
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Değiştir'), 100); throw ex }
	}
	static tazele(e) {
		let gridPart = e.gridPart ?? e.sender, {expandedIndexes, bindingCompleteBlock, gridWidget} = gridPart;
		let rowIndex = e.rowIndex ?? e.args?.rowindex; expandedIndexes[rowIndex] = true;
		gridPart.bindingCompleteBlock = _e => {
			gridPart.bindingCompleteBlock = bindingCompleteBlock;
			if (!$.isEmptyObject(expandedIndexes)) { for (let ind in expandedIndexes) { gridWidget.showrowdetails(ind) } }
		};
		gridPart.tazeleDefer(e)
	}
}
class MQSablon extends MQSablonOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get detaySinif() { return MQSablonDetay }
	static get listeFisSinif() { return SablonluSiparisListeFis }
}
class MQKonsinyeSablon extends MQSablonOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get detaySinif() { return MQKonsinyeSablonDetay }
	static get listeFisSinif() { return SablonluKonsinyeSiparisListeFis }
}

class MQSablonOrtakDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sablonSinif() { return MQSablonOrtak }
	static get listeFisSinif() { return this.sablonSinif.listeFisSinif } static get fisSinif() { return this.sablonSinif.fisSinif } static get table() { return this.fisSinif.table }
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); $.extend(e.args, {
			rowsHeight: 50, groupable: true, filterable: true, showGroupsHeader: true, adaptive: false })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); let {liste} = e, {sablonSinif} = this;
		liste.push(...[
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 15 }).tipDate(),
			new GridKolon({ belirtec: 'fisnox', text: 'Sip. No', genislikCh: 20 }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri' }),
			new GridKolon({ belirtec: 'sevkadresadi', text: 'Sevk Adres', genislikCh: 30 }),
			new GridKolon({ belirtec: 'basteslimtarihi', text: 'Teslim Tarihi', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'bonayli', text: 'Onay?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'onayla', text: ' ', genislikCh: 5 }).noSql().tipButton('O').onClick(_e => { sablonSinif.onaylaIstendi({ ...e, ..._e }) }),
			new GridKolon({ belirtec: 'degistir', text: ' ', genislikCh: 5 }).noSql().tipButton('D').onClick(_e => { sablonSinif.degistirIstendi({ ...e, ..._e }) }),
			new GridKolon({ belirtec: 'sil', text: ' ', genislikCh: 5 }).noSql().tipButton('X').onClick(_e => { sablonSinif.silIstendi({ ...e, ..._e }) })
		])
	}
	static loadServerDataDogrudan(e) { let stm = e.query = e.stm = new MQStm(); e.sent = stm.sent; this.loadServerData_queryDuzenle(e); return super.loadServerData_querySonucu(e) }
	static loadServerData_queryDuzenle(e) { this.listeFisSinif?.loadServerData_queryDuzenle(e) }
}
class MQSablonDetay extends MQSablonOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sablonSinif() { return MQSablon }
}
class MQKonsinyeSablonDetay extends MQSablonOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sablonSinif() { return MQKonsinyeSablon }
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {sender: gridPart, parentRec, stm} = e, {kaysayac: sablonSayac} = parentRec;
		let {tarih, mustKod} = gridPart, subeKod = gridPart.subeKod ?? config.session.subeKod;
		let {fisSinif} = this, {table, fisIcinDetayTable: detayTable, mustSaha} = fisSinif, cariYil = app.params.zorunlu?.cariYil || today().getYil();
		let uni = stm.sent = e.sent = stm.sent.asUnionAll()
		/*let sent = new MQSent();*/
	}
}
