class SablonluSiparisListeOrtakFis extends MQOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Sipariş' }
	get fisSinif() { return this._fisSinif } static get tanimUISinif() { return FisGirisPart }
	static get detaySinif() { return SablonluSiparisListeOrtakDetay } static get gridKontrolcuSinif() { return SablonluSiparisListeOrtakGridci }
	static get tumKolonlarGosterilirmi() { return true } static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get raporKullanilirmi() { return false } static get noSaha() { return null } get listemi() { return true }
	get fisIcinDetaySinif(){ let {fisSinif} = this; return fisSinif?.detaySinifFor?.('') ?? fisSinif?.detaySinif } get fisTable(){ return this.fisSinif?.table }
	get fisIcinDetayTable(){ let {fisSinif, fisIcinDetaySinif} = this; return fisIcinDetaySinif?.getDetayTable?.({ fisSinif }) ?? fisIcinDetaySinif?.table }
	get asilFis() {
		let {fisSinif, fisSayac: sayac, sablonSayac, tarih, subeKod, mustKod, sevkAdresKod} = this, detaylar = this.getYazmaIcinDetaylar();
		let fis = new fisSinif({ sayac, sablonSayac, tarih, subeKod, mustKod, sevkAdresKod, detaylar });
		if (fis.onayTipi == null) { fis.onayTipi = 'BK' }
		return fis
	}
	static getUISplitHeight({ islem }) { return islem == 'onayla' || islem == 'sil' ? 200 : MQDetayli.getUISplitHeight(...arguments) }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			sablonSayac: new PInstNum(), tarih: new PInstDateToday(), subeKod: new PInstStr(),
			mustKod: new PInstStr(), sevkAdresKod: new PInstStr(), fisSayac: new PInstNum()
		})
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {root: rfb, baslikForm: fbd_baslikForm} = e.builders, {builders: baslikFormlar} = fbd_baslikForm;
		let {sender: gridPart, inst, islem} = e, {grid, gridWidget, layout} = gridPart;
		rfb.addStyle(e => `$elementCSS .islemTuslari { position: absolute !important; top: 3px !important }`);
		rfb.vazgecIstendi = async e => { return false };
		baslikFormlar[0].altAlta().addForm('_baslikBilgi')
			.addStyle(e =>
				`$elementCSS { font-size: 130% } $elementCSS > ._row { gap: 10px } $elementCSS > ._row:not(:last-child) { margin-bottom: 5px }
				$elementCSS .etiket { width: 100px !important } $elementCSS .veri { font-weight: bold; color: royalblue }`
			 ).setLayout(({ builder: fbd }) => {
				let {altInst: inst} = fbd, {tarih, subeKod, mustKod, sablonSayac} = inst;
				return $(`<div class="full-width">
					<div class="flex-row" style="gap: 100px">
						<div class="tarih _row flex-row"><div class="etiket">Tarih</div><div style="margin-right: 10px"></div><div class="veri">${dateToString(inst.tarih) || ''}</div></div>
						<div class="sablon _row flex-row"><div class="etiket">Şablon</div><div class="veri">${sablonSayac || ''}</div></div>
					</div>
					<div class="flex-row" style="gap: 50px">
						${subeKod ? `<div class="sube _row flex-row"><div class="etiket">Şube</div><div class="veri" style="margin-right: 10px">${subeKod?.trim() || ''}</div></div>` : ''}
						${mustKod ? `<div class="must _row flex-row"><div class="etiket">Müşteri</div><div class="veri">${mustKod?.trim() || ''}</div></div>` : ''}
					</div>
				</div>`)
			}).onBuildEk(({ builder: fbd }) => {
				let {altInst: inst, layout} = fbd, {subeKod, mustKod, sablonSayac} = inst;
				let setKA = async (selector, kod, aciklama) => {
					if (!selector) { return } let elm = layout.find(`.${selector}`); if (!elm?.length) { return }
					if (kod) {
						aciklama = await aciklama; if (!aciklama) { return }
						let text = aciklama?.trim(); if (kod && typeof kod == 'string') { text = `<span class="kod bold gray">${kod}</b> <span class="aciklama royalblue normal">${aciklama}</span>` };
						elm.find('.veri').html(text.trim()); elm.removeClass('jqx-hidden basic-hidden')
					}
					else { elm.addClass('jqx-hidden') }
				};
				setKA('sablon', sablonSayac, MQSablon.getGloKod2Adi(sablonSayac)); setKA('sube', subeKod, MQSube.getGloKod2Adi(subeKod))
				setKA('must', mustKod, MQSCari.getGloKod2Adi(mustKod))
			});
		baslikFormlar[0].addModelKullan('sevkAdresKod', 'Sevk Adres').comboBox().autoBind().setMFSinif(MQSSevkAdres)
			.ozelQueryDuzenleHandler(({ builder: fbd, aliasVeNokta, stm }) => {
				let {altInst: inst} = fbd ?? {}, {mustKod} = inst ?? {}; if (!mustKod) { return }
				for (let sent of stm.getSentListe()) { sent.where.degerAta(mustKod, `${aliasVeNokta}must`) }
			});
		let disableWithInfo = ({ color, text }) => {
			grid.jqxGrid('editable', false); gridPart.baslikFormlar[0].parent().css('box-shadow', `0 2px 5px 3px ${color}`);
			baslikFormlar[2].addForm('_ekBilgi').addStyle_fullWH(null, 'unset').addStyle(() => `$elementCSS { margin-top: 5px; padding: 5px 5px 10px 20px }`)
				.setLayout(({ builder: fbd }) => $(`<h4 class="bold ${color}">Bu sipariş ${text}:</h4>`))
		};
		switch (islem) {
			case 'onayla': disableWithInfo({ color: 'green', text: 'onaylanacak' }); break
			case 'sil': disableWithInfo({ color: 'firebrick', text: '<u>SİLİNECEK</u>' }); break
		}
	}
	async yukle(e) {
		e = e || {}; let {rec} = e; delete e.rec;
		await this.baslikVeDetaylariYukle(e); await this.detaylariYukleSonrasi(e);
		e.rec = rec; await this.yukleSonrasiIslemler(e);
		return true
	}
	async baslikVeDetaylariYukle(e) {
		let {detaySinif} = this.class, {parentRec, gridRec, belirtec: islem} = e, yenimi = !parentRec;
		$.extend(this, {
			tarih: gridRec?.tarih || this.tarih || now(), subeKod: gridRec?.subekod || this.subeKod,
			mustKod: gridRec?.mustkod || this.mustKod, sevkAdresKod: gridRec?.sevkadreskod || this.sevkAdresKod
		});
		let {sablonSayac, tarih, subeKod, mustKod, sevkAdresKod} = this; await this.fisSinifBelirle({ ...e, sablonSayac, mustKod, sevkAdresKod });
		let getAnahStr = e.getAnahStr = rec => [rec.stokkod, ...ekOzellikler.map(({ rowAttr }) => rec[rowAttr] ?? '')].join(delimWS);
		let ekOzellikler = e.ekOzellikler = Array.from(HMRBilgi.hmrIter_ekOzellik());
		let sent = e.sent = new MQSent({
			from: 'hizlisablongrup grp', fromIliskiler: [
				{ from: 'hizlisablondetay har', iliski: 'har.grupsayac = grp.kaysayac' },
				{ from: 'stkmst stk', iliski: 'har.stokkod = stk.kod' }
			],
			where: [
				{ degerAta: sablonSayac, saha: 'grp.fissayac' },
				'har.bdevredisi = 0', `stk.silindi = ''`, `stk.satilamazfl = ''`
			],
			sahalar: [
				'grp.kaysayac grupsayac', 'grp.seq grupseq', 'grp.grupadi', 'har.seq',
				'har.stokkod', 'stk.aciklama stokadi', 'stk.brm'
			]
		}), {sahalar} = sent;
		for (let {table, tableAlias: alias, rowAttr, rowAdiAttr} of ekOzellikler) {
			sent.fromIliski(`${table} ${alias}`, `har.${rowAttr} = ${alias}.kod`);
			sahalar.add(`har.${rowAttr}`, `${alias}.aciklama ${rowAdiAttr}`)
		}
		let stm = e.stm = e.query = new MQStm({ sent, orderBy: ['fissayac', 'grupseq', 'seq'] });
		let recs = await this.class.loadServerData_querySonucu(e), detaylar = this.detaylar = [];
		let kapsam = { tarih, subeKod, mustKod }, stokKodListe = recs.map(({ stokkod: kod }) => kod);
		let satisKosul = new SatisKosul_Fiyat(); if (!await satisKosul.yukle({ kapsam })) { satisKosul = null }
		let anah2Det = {}; for (let rec of recs) {
			let {stokkod: stokKod, stokadi: stokAdi} = rec, stokText = new CKodVeAdi([stokKod, stokAdi]).parantezliOzet({ styled: true });
			let det = new detaySinif({ stokText }); det.setValues({ rec }); detaylar.push(det);
			for (let {belirtec, ioAttr, adiAttr, rowAttr, rowAdiAttr} of ekOzellikler) {
				let kod = rec[rowAttr], aciklama = rec[rowAdiAttr]; if (kod === undefined) { continue }
				det[ioAttr] = kod; det[adiAttr] = aciklama; det[belirtec] = kod ? `<b>(${kod})</b> ${aciklama}` : ''
			}
			let anahStr = getAnahStr(rec); anah2Det[anahStr] = anah2Det[anahStr] ?? det
		}
		if (!yenimi) {
			let query = e.stm = new MQStm(); this.baslikVeDetaylariYukle_degistir_queryDuzenle(e);
			query = e.stm; let recs = await this.class.loadServerData_querySonucu({ ...e, query });
			{
				let rec = recs[0]; if (rec) {
					let {tarih, seri, noyil: noYil, no: fisNo} = rec;
					$.extend(this, { tarih, seri, noYil, fisNo })
				}
			}
			for (let rec of recs) {
				let anahStr = getAnahStr(rec), det = anah2Det[anahStr]; if (!det) { continue }
				let {kaysayac: okunanHarSayac, miktar} = rec; $.extend(det, { okunanHarSayac, miktar })
			}
			if (islem == 'onayla' || islem == 'sil') { detaylar = this.detaylar = detaylar.filter(({ miktar }) => !!miktar) }
		}
		if (detaylar?.length) {
			let fiyatYapilar = await SatisKosul_Fiyat.stoklarIcinFiyatlar(stokKodListe, satisKosul, mustKod);
			for (const det of detaylar) {
				if (fiyatYapilar && det.netBedel == undefined) { continue }
				let {stokKod} = det, fiyat = det.fiyat || fiyatYapilar[stokKod]?.fiyat;
				if (fiyat) {
					let miktar = det.miktar || 0, netBedel = roundToBedelFra(miktar * fiyat);
					$.extend(det, { fiyat, netBedel })
				}
			}
		}
		return true
	}
	baslikVeDetaylariYukle_degistir_queryDuzenle(e) {
		let {fisSayac, fisTable: table, fisIcinDetayTable: detayTable} = this;
		let {stm, ekOzellikler} = e, sent = e.sent = stm.sent = new MQSent({
			where: { degerAta: fisSayac, saha: 'fissayac' },
			sahalar: ['fis.tarih', 'fis.seri', 'fis.noyil', 'fis.no', 'har.kaysayac', 'har.stokkod', 'SUM(har.miktar) miktar', 'SUM(har.fiyat) fiyat', 'SUM(har.bedel) bedel']
		}), {sahalar, where: wh} = sent; sent.fisHareket(table, detayTable);
		wh.icerikKisitDuzenle_stok({ saha: 'har.stokkod' });
		for (let {table, tableAlias: alias, rowAttr} of ekOzellikler) {
			sent.fromIliski(`${table} ${alias}`, `har.${rowAttr} = ${alias}.kod`);
			sahalar.add(`har.${rowAttr}`)
		}
		sent.groupByOlustur()
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
			if (subeKod != null) { wh.degerAta(subeKod, 'fis.bizsubekod') }
			if (tarih) { wh.degerAta(tarih, 'fis.tarih') }
			sahalar.add('fis.sablonsayac sablonSayac', 'COUNT(*) topSayi');
			sent.groupByOlustur()
		}
	}
	async fisSinifBelirle(e) { this._fisSinif = await this.fisSinifBelirleInternal(e); return this }
	fisSinifBelirleInternal(e) { return null }
	async yaz(e) {
		e = e ?? {}; await this.kaydetOncesiIslemler(e); let {fis} = e;
		await this.numaratordenBelirle(e); return await fis.yaz(e)
	}
	async degistir(e) {
		e = e ?? {}; await this.kaydetOncesiIslemler(e); let {fis} = e;
		if (!fis.fisNo) { await this.numaratordenBelirle(e) } return fis.degistir(e)
	}
	async sil(e) {
		e = e ?? {}; await this.silmeOncesiIslemler(e); let {fis} = e;
		return await fis.sil(e)
	}
	async kaydetVeyaSilmeOncesiIslemler(e) { e = e ?? {}; let {asilFis: fis} = this; this.asilFis_argFix(e, fis); e.fis = fis }
	yukleSonrasiIslemler(e) { /* super yok */ }
	asilFis_argFix(e, fis) {
		if (!e) { return this }
		for (let key of ['inst', 'fis']) { if (e[key] !== undefined) { e[key] = fis } }
		for (let key of ['tarih', 'seri', 'noYil', 'fisNo']) { let value = this[key]; if (value != null) { fis[key] = value } }
		return this
	}
	getYazmaIcinDetaylar(e) {
		let {fisIcinDetaySinif} = this, detaylar = super.getYazmaIcinDetaylar(e).filter(det => det.miktar);
		detaylar = detaylar.map(det => det.listemi ? new fisIcinDetaySinif(det) : det);
		return detaylar
	}
	async numaratordenBelirle(e) {
		e = e ?? {}; let fis = e.asilFis ?? e.fis ?? this.asilFis, num = e.num ?? e.numarator ?? fis?.numarator;
		if (num) {
			await num.yukle(); fis.fisNo = (await num.kesinlestir()).sonNo;
			for (let key of ['seri', 'noYil']) { let value = num[key]; if (value != null) { fis[key] = value } }
		}
		return this
	}
	uiDuzenle_fisGirisIslemTuslari(e) { /* super yok */ }
}
class SablonluSiparisListeFis extends SablonluSiparisListeOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'SSIP' } get fisSinif() { return super.fisSinif ?? SablonluSatisSiparisFis }
	static get detaySinif() { return SablonluSiparisListeDetay } static get gridKontrolcuSinif() { return SablonluSiparisListeGridci }
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {sender: gridPart, parentRec} = e;  /* gridPart: SablonOrtakFis'in liste ekranı ; parentRec: Şablon başlık kaydı */
		let {kaysayac: sablonSayac} = parentRec, {tarih, mustKod} = gridPart, subeKod = gridPart.subeKod ?? config.session.subeKod;
		let {fisSinif} = this.instance, {table, mustSaha} = fisSinif, cariYil = app.params.zorunlu?.cariYil || today().getYil();
		let {stm} = e, sent = stm.sent = new MQSent({
			from: `${table} fis`,
			where: [
				{ alias: 'fis', birlestirDict: fisSinif.varsayilanKeyHostVars() }, { degerAta: sablonSayac, saha: 'fis.sablonsayac' },
				`fis.kapandi = ''`, `fis.tarih >= CAST('${cariYil}-01-01T00:00:00' AS DATETIME)`
			],
			sahalar: [
				'fis.kaysayac', 'fis.tarih', 'fis.fisnox', `fis.bizsubekod subekod`, 'sub.aciklama subeadi', `fis.${mustSaha} mustkod`, 'car.birunvan mustunvan',
				'fis.xadreskod sevkadreskod', 'sadr.aciklama sevkadresadi', `(case when fis.onaytipi = 'BK' or fis.onaytipi = 'ON' then 0 else 1 end) bonayli`
			]
		}).fis2SubeBagla().fis2CariBagla().fis2SevkAdresBagla().fisSilindiEkle(); if (subeKod != null) { sent.where.degerAta(subeKod, 'fis.bizsubekod') }
		if (tarih) { sent.where.degerAta(tarih, 'fis.tarih') } if (mustKod) { sent.where.degerAta(mustKod, `fis.${mustSaha}`) }
		stm.orderBy.add('tarih DESC', 'fisnox DESC')
	}
	static sablonEkQueryDuzenle_ilk({ sent: uni, sablonSayacListe, mustKod, tarih }) {
		super.sablonEkQueryDuzenle_ilk(...arguments); let {fisSinif} = this.instance;
		let {table, mustSaha} = fisSinif, sent = new MQSent({ from: `${table} fis` });
		let {sahalar, where: wh} = sent, keyHV = fisSinif.varsayilanKeyHostVars();
		if (!$.isEmptyObject(keyHV)) { wh.birlestirDict(keyHV) }
		if (mustKod) { wh.degerAta(mustKod, `fis.${mustSaha}`) }
		uni.add(sent)
	}
}
class SablonluKonsinyeSiparisListeFis extends SablonluSiparisListeOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return `Konsinye ${super.sinifAdi}` }
	static get kodListeTipi() { return 'KSSIP' } get fisSinif() { return super.fisSinif ?? SablonluKonsinyeSiparisOrtakFis }
	static get detaySinif() { return SablonluKonsinyeSiparisListeDetay } static get gridKontrolcuSinif() { return SablonluKonsinyeSiparisListeGridci }
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {sender: gridPart, parentRec} = e;  /* gridPart: SablonOrtakFis'in liste ekranı ; parentRec: Şablon başlık kaydı */
		let {kaysayac: sablonSayac} = parentRec, {tarih, mustKod} = gridPart, subeKod = gridPart.subeKod ?? config.session.subeKod;
		let cariYil = app.params.zorunlu?.cariYil || today().getYil();
		let {stm} = e, uni = stm.sent = new MQUnionAll();
		let sentEkle = (kayitTipi, fisSinif) => {
			let {table, mustSaha} = fisSinif, sent = new MQSent({
				from: `${table} fis`,
				where: [
					{ alias: 'fis', birlestirDict: fisSinif.varsayilanKeyHostVars() }, { degerAta: sablonSayac, saha: 'fis.sablonsayac' },
					`fis.kapandi = ''`, `fis.tarih >= CAST('${cariYil}-01-01T00:00:00' AS DATETIME)`
				],
				sahalar: [
					`${kayitTipi.sqlServerDegeri()} kayitTipi`,
					'fis.kaysayac', 'fis.tarih', 'fis.fisnox', `fis.bizsubekod subekod`, 'sub.aciklama subeadi', `fis.${mustSaha} mustkod`, 'car.birunvan mustunvan',
					'fis.xadreskod sevkadreskod', 'sadr.aciklama sevkadresadi', `(case when fis.onaytipi = 'BK' or fis.onaytipi = 'ON' then 0 else 1 end) bonayli`
				]
			}).fis2SubeBagla().fis2CariBagla({ mustSaha }).fis2SevkAdresBagla().fisSilindiEkle(); if (subeKod != null) { sent.where.degerAta(subeKod, 'fis.bizsubekod') }
			if (tarih) { sent.where.degerAta(tarih, 'fis.tarih') } if (mustKod) { sent.where.degerAta(mustKod, `fis.${mustSaha}`) }
			uni.add(sent); return sent
		}
		sentEkle('', SablonluKonsinyeAlimSiparisFis); sentEkle('ST', SablonluKonsinyeTransferFis);
		stm.orderBy.add('tarih DESC', 'fisnox DESC')
	}
	static sablonEkQueryDuzenle_ilk({ sent: uni, sablonSayacListe, mustKod, tarih }) {
		super.sablonEkQueryDuzenle_ilk(...arguments); let fisSiniflar = [SablonluKonsinyeAlimSiparisFis, SablonluKonsinyeTransferFis];
		for (let fisSinif of fisSiniflar) { 
			let {table, mustSaha} = fisSinif, sent = new MQSent({ from: `${table} fis` });
			let {sahalar, where: wh} = sent, keyHV = fisSinif.varsayilanKeyHostVars();
			if (!$.isEmptyObject(keyHV)) { wh.birlestirDict(keyHV) }
			if (mustKod) { wh.degerAta(mustKod, `fis.${mustSaha}`) }
			uni.add(sent)
		}
	}
	async fisSinifBelirleInternal(e) {
		await super.fisSinifBelirleInternal(e); let rec = await this.class.getSablonIcinTeslimBilgisi(e); if (!rec) { return null }
		let {TSEK: tip} = rec, {belirtec: islem, gridRec: fisRec} = e;
		if (islem == 'yeni' || islem == 'kopya') { fisRec = e.gridRec = null }
		let kendimizmi = tip == 'K', kayitSTmi = fisRec?.kayitTipi == 'ST';
		return kendimizmi || kayitSTmi ? SablonluKonsinyeTransferFis : SablonluKonsinyeAlimSiparisFis
	}
	static getSablonIcinTeslimBilgisi({ sablonSayac, mustKod, sevkAdresKod }) {
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
	}
}

class SablonluSiparisListeOrtakDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'hizlisablondetay' }
	static get fisSayacSaha() { return 'grupsayac' } get listemi() { return true }
	constructor(e) {
		e = e ?? {}; super(e); let {grupSayac, grupAdi, stokKod, stokAdi, stokText, brm} = e, miktar = e.miktar ?? 0;
		$.extend(this, { grupSayac, grupAdi, stokKod, stokAdi, stokText, miktar, brm });
		for (let {ioAttr, adiAttr} of HMRBilgi.hmrIter_ekOzellik()) { for (let key of [ioAttr, adiAttr]) { this[key] = e[key] } }
	}
	setValues(e) {
		super.setValues(e); let {rec} = e, {grupsayac: grupSayac, grupadi: grupAdi, stokkod: stokKod, stokadi: stokAdi, brm} = rec, miktar = rec.miktar ?? 0;
		$.extend(this, { grupSayac, grupAdi, stokKod, stokAdi, brm, miktar })
		for (let {ioAttr, adiAttr} of HMRBilgi.hmrIter_ekOzellik()) { for (let key of [ioAttr, adiAttr]) { this[key] = e[key] } }
	}
}
class SablonluSiparisListeDetay extends SablonluSiparisListeOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class SablonluKonsinyeSiparisListeDetay extends SablonluSiparisListeOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e ?? {}; super(e); let fiyat = e.fiyat ?? 0, netBedel = e.bedel ?? 0; $.extend(this, { fiyat, netBedel })
	}
	setValues(e) {
		super.setValues(e); let {rec} = e, {fiyat, bedel: netBedel} = rec;
		if (fiyat) { this.fiyat = fiyat }
		if (netBedel) { this.netBedel = netBedel }
	}
}

class SablonluSiparisListeOrtakGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	gridArgsDuzenle(e) {
		super.gridArgsDuzenle(e); let gridPart = e.gridPart ?? e.sender, {args} = e; gridPart.sabit();
		$.extend(args, { rowsHeight: 45, groupsExpandedByDefault: true, editMode: 'click', selectionMode: 'singlecell' })
	}
	tabloKolonlariDuzenle_ilk({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ilk(...arguments); tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'grupAdi', text: 'Grup Adı', genislikCh: 20 }).hidden(),
			new GridKolon({ belirtec: 'stokText', text: 'Ürün/Hizmet', genislikCh: 60, filterable: false }).readOnly(),
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', genislikCh: 13, groupable: false,
				cellValueChanging: (colDef, rowIndex, belirtec, colType, oldValue, newValue) => {
					let {gridPart} = colDef, {gridWidget} = gridPart, rec = gridWidget.getrowdata(rowIndex), orj = rec._orj = rec._orj ?? {};
					if (orj[belirtec] === undefined) { orj[belirtec] = rec[belirtec] }
					rec._degistimi = (orj[belirtec] || 0) != newValue;
					this.bedelHesapla({ colDef, rowIndex, belirtec, colType, oldValue, gridPart, gridWidget, rec, miktar: newValue || 0, fiyat: rec.fiyat || 0 })
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
	gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); let {grid} = e;
		grid.jqxGrid({ sortable: true, filterable: true, groupable: true, groups: ['grupAdi'] })
	}
	bedelHesapla(e) { /* do nothing */ }
}
class SablonluSiparisListeGridci extends SablonluSiparisListeOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class SablonluKonsinyeSiparisListeGridci extends SablonluSiparisListeOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ara({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ara(...arguments); tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'fiyat', text: 'Fiyat', genislikCh: 13, groupable: false }).readOnly().tipDecimal_fiyat().sifirGosterme(),
			new GridKolon({ belirtec: 'netBedel', text: 'Bedel', genislikCh: 13, groupable: false }).readOnly().tipDecimal_bedel().sifirGosterme()
		])
	}
	bedelHesapla({ gridWidget, rowIndex, miktar, fiyat }) {
		super.bedelHesapla(...arguments);
		gridWidget.setcellvalue(rowIndex, 'netBedel', roundToBedelFra(miktar * fiyat))
	}
}
