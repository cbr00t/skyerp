class SablonluSiparisListeOrtakFis extends MQOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Sipariş' }
	get fisSinif() { return this._fisSinif } static get tanimUISinif() { return FisGirisPart }
	static get detaySinif() { return SablonluSiparisListeOrtakDetay } static get gridKontrolcuSinif() { return SablonluSiparisListeOrtakGridci }
	static get tumKolonlarGosterilirmi() { return true } static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get raporKullanilirmi() { return false } static get noSaha() { return null } get listemi() { return true }
	get fisIcinDetaySinif(){ let {fisSinif} = this; return fisSinif?.detaySinifFor?.('') ?? fisSinif?.detaySinif } get fisTable(){ return this.fisSinif?.table }
	get fisIcinDetayTable(){ let {fisSinif, fisIcinDetaySinif} = this; return fisIcinDetaySinif?.getDetayTable?.({ fisSinif }) ?? fisIcinDetaySinif?.table }
	get asilFis() {
		let {fisSinif, fisSayac: sayac, sablonSayac, tarih, subeKod, mustKod, sevkAdresKod, klFirmaKod, teslimOrtakdir, baslikTeslimTarihi} = this;
		let detaylar = this.getYazmaIcinDetaylar();
		let fis = new fisSinif({ sayac, sablonSayac, tarih, subeKod, mustKod, sevkAdresKod, klFirmaKod, teslimOrtakdir, baslikTeslimTarihi, detaylar });
		if (fis.onayTipi == null) { fis.onayTipi = 'BK' }
		return fis
	}
	static getUISplitHeight({ islem }) { return islem == 'onayla' || islem == 'sil' ? 200 : MQDetayli.getUISplitHeight(...arguments) }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			sablonSayac: new PInstNum(), tarih: new PInstDateToday(), subeKod: new PInstStr(),
			mustKod: new PInstStr(), sevkAdresKod: new PInstStr(), fisSayac: new PInstNum(), klFirmaKod: new PInstStr(),
			teslimOrtakdir: new PInstBitTrue('bteslimortakdir'), baslikTeslimTarihi: new PInstDate('basteslimtarihi')
		})
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {root: rfb, baslikForm: fbd_baslikForm} = e.builders, {builders: baslikFormlar} = fbd_baslikForm;
		let {sender: gridPart, inst, islem} = e, {konsinyemi} = this, {grid, gridWidget, layout} = gridPart;
		rfb.addStyle(e => `$elementCSS .islemTuslari { position: absolute !important; top: 3px !important }`);
		rfb.vazgecIstendi = async e => { return false };
		baslikFormlar[0].altAlta().addForm('_baslikBilgi')
			.addStyle(e =>
				`$elementCSS { font-size: 130% } $elementCSS > ._row { gap: 10px } $elementCSS > ._row:not(:last-child) { margin-bottom: 5px }
				$elementCSS .etiket { width: 130px !important } $elementCSS .veri { font-weight: bold; color: royalblue }`
			 ).setLayout(({ builder: fbd }) => {
				let {altInst: inst} = fbd, {tarih, subeKod, mustKod, sablonSayac, klFirmaKod} = inst;
				return $(`<div class="full-width">
					<div class="flex-row" style="gap: 50px">
						<div class="tarih _row flex-row"><div class="etiket">Tarih</div><div style="margin-right: 10px"></div><div class="veri">${dateToString(inst.tarih) || ''}</div></div>
						<div class="sablon _row flex-row"><div class="etiket">Şablon</div><div class="veri">${sablonSayac || ''}</div></div>
						${konsinyemi ? `<div class="klFirma _row flex-row"><div class="etiket">KL Firma</div><div class="veri">${klFirmaKod || ''}</div></div>` : ''}
					</div>
					<div class="flex-row" style="gap: 50px">
						${subeKod ? `<div class="sube _row flex-row"><div class="etiket">Şube</div><div class="veri" style="margin-right: 10px">${subeKod?.trim() || ''}</div></div>` : ''}
						${mustKod ? `<div class="must _row flex-row"><div class="etiket">Müşteri</div><div class="veri">${mustKod?.trim() || ''}</div></div>` : ''}
					</div>
				</div>`)
			}).onBuildEk(({ builder: fbd }) => {
				let {altInst: inst, layout} = fbd, {subeKod, mustKod, sablonSayac, klFirmaKod} = inst;
				let setKA = async (selector, kod, aciklama) => {
					if (!selector) { return } let elm = layout.find(`.${selector}`); if (!elm?.length) { return }
					if (kod) {
						aciklama = await aciklama; if (!aciklama) { return }
						let text = aciklama?.trim(); if (kod && typeof kod == 'string') { text = `<span class="kod bold gray">${kod}</b> <span class="aciklama royalblue normal">${aciklama}</span>` };
						elm.find('.veri').html(text.trim()); elm.removeClass('jqx-hidden basic-hidden')
					}
					else { elm.addClass('jqx-hidden') }
				};
				setKA('sablon', sablonSayac, MQSablon.getGloKod2Adi(sablonSayac));
				setKA('sube', subeKod, MQSube.getGloKod2Adi(subeKod));
				if (konsinyemi && klFirmaKod) { setKA('klFirma', klFirmaKod, MQSKLFirma.getGloKod2Adi(klFirmaKod)) }
				setKA('must', mustKod, MQSCari.getGloKod2Adi(mustKod))
			});
		baslikFormlar[1].yanYana();
		baslikFormlar[1].addModelKullan('sevkAdresKod', 'Sevk Adres').comboBox().autoBind().setMFSinif(MQSSevkAdres)
			.addStyle_wh(500)
			.ozelQueryDuzenleHandler(({ builder: fbd, aliasVeNokta, stm }) => {
				let {altInst: inst} = fbd ?? {}, {mustKod} = inst ?? {}; if (!mustKod) { return }
				for (let sent of stm.getSentListe()) { sent.where.degerAta(mustKod, `${aliasVeNokta}must`) }
			});
		baslikFormlar[1].addDateInput('baslikTeslimTarihi', 'Teslim Tarihi');
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
		let {detaySinif, konsinyemi} = this.class, {parentRec, gridRec, belirtec: islem} = e, yenimi = !parentRec;
		$.extend(this, {
			tarih: gridRec?.tarih || this.tarih || now(), subeKod: gridRec?.subekod || this.subeKod,
			mustKod: gridRec?.mustkod || this.mustKod, sevkAdresKod: gridRec?.sevkadreskod || this.sevkAdresKod
		});
		let {sablonSayac, tarih, subeKod, mustKod, sevkAdresKod} = this; await this.fisSinifBelirle({ ...e, sablonSayac, mustKod, sevkAdresKod });
		let getAnahStr = e.getAnahStr = rec => [rec.stokkod, ...ekOzellikler.map(({ rowAttr }) => rec[rowAttr] ?? '')].join(delimWS);
		let ekOzellikler = e.ekOzellikler = Array.from(HMRBilgi.hmrIter_ekOzellik());
		let sent = e.sent = new MQSent({
			from: 'hizlisablongrup grp', fromIliskiler: [
				{ from: 'hizlisablon sab', iliski: 'grp.fissayac = sab.kaysayac' },
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
		if (konsinyemi && yenimi) { sent.fromIliski('kldagitim dag', [`dag.mustkod = ${mustKod.sqlServerDegeri()}`, 'sab.klfirmakod = dag.klfirmakod']) }
		for (let {table, tableAlias: alias, rowAttr, rowAdiAttr} of ekOzellikler) {
			sent.fromIliski(`${table} ${alias}`, `har.${rowAttr} = ${alias}.kod`);
			sahalar.add(`har.${rowAttr}`, `${alias}.aciklama ${rowAdiAttr}`)
		}
		let stm = e.stm = e.query = new MQStm({ sent, orderBy: ['fissayac', 'grupseq', 'seq'] });
		let recs = await this.class.loadServerData_querySonucu(e); if (!recs?.length) {
			let mustUnvan = await MQSCari.getGloKod2Adi(mustKod), {aciklama: sablonAdi} = gridRec;
			throw {
				isError: true, errorText: (
					`<b class=royalblue>${mustKod}-${mustUnvan}</b> Carisi ve <b class=royalblue>${sablonAdi}</b> Şablonuna ait ` +
					`${konsinyemi ? `<u class="bold red">Dağıtım Kaydı yok</u> veya ` : ''}<u class="bold red">Ürün listesi boş</u>`
				)
			}
		}
		let detaylar = this.detaylar = [];
		let kapsam = { tarih, subeKod, mustKod }, stokKodListe = recs.map(({ stokkod: kod }) => kod);
		let kosulYapilar = new SatisKosulYapi({ kapsam }); if (!await kosulYapilar.yukle()) { kosulYapilar = null }
		let anah2Det = {}; for (let rec of recs) {
			let {stokkod: stokKod, stokadi: stokAdi} = rec, stokText = new CKodVeAdi([stokKod, stokAdi]).parantezliOzet({ styled: true });
			let det = new detaySinif({ stokText }); det.setValues({ rec }); detaylar.push(det);
			for (let {belirtec, ioAttr, adiAttr, rowAttr, rowAdiAttr} of ekOzellikler) {
				let kod = rec[rowAttr], aciklama = rec[rowAdiAttr]; if (kod === undefined) { continue }
				det[ioAttr] = kod; det[adiAttr] = aciklama; det[belirtec] = kod ? `<b>(${kod})</b> ${aciklama}` : ''
			}
			let anahStr = getAnahStr(rec); anah2Det[anahStr] = anah2Det[anahStr] ?? det
		}
		if (yenimi) {
			if (detaylar?.length) {
				let fiyatYapilar = await SatisKosul_Fiyat.stoklarIcinFiyatlar(stokKodListe, kosulYapilar?.FY, mustKod), iskontoArastirStokSet = {};
				for (const det of detaylar) {
					if (fiyatYapilar && det.netBedel == undefined) { continue }
					let {stokKod} = det, kosulRec = fiyatYapilar[stokKod] ?? {}, {iskontoYokmu} = kosulRec;
					if (!iskontoYokmu) { iskontoArastirStokSet[stokKod] = true }
					let fiyat = det.fiyat || kosulRec.fiyat; if (fiyat) {
						let miktar = det.miktar || 0, netBedel = roundToBedelFra(miktar * fiyat);
						$.extend(det, { fiyat, netBedel })
					}
				}
				let iskYapilar = await SatisKosul_Iskonto.stoklarIcinOranlar(Object.keys(iskontoArastirStokSet), kosulYapilar?.SB);
				let prefix = 'oran'; for (const det of detaylar) {
					let {stokKod} = det, kosulRec = iskYapilar[stokKod] ?? {};
					for (let [key, value] of Object.entries(iskYapilar)) {
						if (!(value && key.startsWith(prefix))) { continue }
						let i = asInteger(key.slice(prefix.length)); det[`iskOran${i}`] = value
					}
				}
			}
		}
		else {
			let query = e.stm = new MQStm(); this.baslikVeDetaylariYukle_degistir_queryDuzenle(e);
			query = e.stm; let recs = await this.class.loadServerData_querySonucu({ ...e, query });
			{
				let rec = recs[0]; if (rec) {
					let {tarih, seri, noyil: noYil, no: fisNo, xadreskod: sevkAdresKod, basteslimtarihi: baslikTeslimTarihi} = rec;
					$.extend(this, { tarih, seri, noYil, fisNo, sevkAdresKod, baslikTeslimTarihi })
				}
			}
			for (let rec of recs) {
				let anahStr = getAnahStr(rec), det = anah2Det[anahStr];
				if (det) { det.setValues({ rec }) }
			}
			if (islem == 'onayla' || islem == 'sil') { detaylar = this.detaylar = detaylar.filter(({ miktar }) => !!miktar) }
		}
		return true
	}
	baslikVeDetaylariYukle_degistir_queryDuzenle(e) {
		let {fisSayac, fisSinif, fisTable: table, fisIcinDetayTable: detayTable} = this;
		let {ticarimi} = fisSinif, {sabit: iskSayi} = app.params?.fiyatVeIsk?.iskSayi;
		let {stm, ekOzellikler} = e, sent = e.sent = stm.sent = new MQSent({
			where: { degerAta: fisSayac, saha: 'fissayac' }, sahalar: [
				'fis.tarih', 'fis.seri', 'fis.noyil', 'fis.no', 'fis.xadreskod', 'fis.basteslimtarihi',
				'har.kaysayac', 'har.stokkod', 'har.fiyat fiyat', 'SUM(har.miktar) miktar',
				'SUM(har.belgebrutbedel) brutbedel', 'SUM(har.bedel) bedel'
			]
		}), {sahalar, where: wh} = sent; sent.fisHareket(table, detayTable);
		wh.icerikKisitDuzenle_stok({ saha: 'har.stokkod' });
		if (ticarimi) { for (let i = 1; i < iskSayi; i++) { sahalar.add(`har.iskoran${i}`) } }
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
	static async getEMailYapi(e) {
		let {fisSayac} = e ?? {}; if (!fisSayac) { return {} }
		let stm = new MQStm(), _e = { ...e, stm }; stm = this.eMailYapiQueryDuzenle(_e) === false ? null : _e.stm;
		let EMailPrefix = 'email_', recs = await app.sqlExecSelect(stm); if (!recs?.length) { return null }
		let result = { ...recs[0] }; for (let rec of recs) {
			for (let [key, value] of Object.entries(rec)) {
				if (key.startsWith(EMailPrefix)) {
					value = value.split(';').map(x => x.trim()).filter(x => !!x);
					let newKey = key.slice(EMailPrefix.length);
					let array = result[newKey] = result[newKey] ?? [];
					if (value?.length) { array.push(...value) }
					delete result[key]
				}
			}
		}
		return result
	}
	static eMailYapiQueryDuzenle({ fisSayac, stm }) {
		if (!this.konsinyemi) { return false }
		let teslimCariKodClause = `fis.${this.teslimCariKodSaha}`, uni = stm.sent = new MQUnionAll();
		let sentEkle = (fisSinif, teslimCariKodSaha) => {
			let sent = this.getSablonluVeKLDagitimliOnSent({ fisSinif, fisSayac }), {sahalar} = sent;
			sent.fromIliski('carmst car', `fis.${teslimCariKodSaha} = car.must`)
				.fromIliski('carsevkadres sadr', 'fis.xadreskod = sadr.kod')
				.leftJoin('kdag', 'klfirmabolge kfbol', 'kdag.klfirmabolgekod = kfbol.kod')
				.leftJoin('kdag', 'carmst ktes', 'kdag.klteslimatcikod = ktes.must');
			sahalar.add(
				'sab.emailadresler email_sablon', 'kfbol.email email_bolge',
				`(case when kdag.klteslimatcikod > '' then ktes.email else '' end) email_teslimatci`,
				`(case when kdag.klteslimatcikod > '' and kdag.bteslimatmailozeldir > 0 then kdag.ozelmaillistestr else '' end) email_ozel`,
				`(case when sadr.email = '' then car.email else sadr.email end) email_alici`
			);
			uni.add(sent); return sent
		};
		sentEkle(SablonluKonsinyeAlimSiparisFis, 'teslimcarikod');
		sentEkle(SablonluKonsinyeTransferFis, 'irsmust')
	}
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
		for (let key of ['tarih', 'seri', 'noYil', 'fisNo', 'klFirmaKod', 'teslimOrtakdir', 'baslikTeslimTarihi']) {
			let value = this[key]; if (value != null) { fis[key] = value } }
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
				'fis.xadreskod sevkadreskod', 'sadr.aciklama sevkadresadi', 'fis.basteslimtarihi', `(case when fis.onaytipi = 'BK' or fis.onaytipi = 'ON' then 0 else 1 end) bonayli`
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
	static get kodListeTipi() { return 'KSSIP' } get fisSinif() { return super.fisSinif ?? SablonluKonsinyeSiparisOrtakFis } static get konsinyemi() { return true }
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
					'fis.xadreskod sevkadreskod', 'sadr.aciklama sevkadresadi', 'fis.basteslimtarihi', `(case when fis.onaytipi = 'BK' or fis.onaytipi = 'ON' then 0 else 1 end) bonayli`
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
		await super.fisSinifBelirleInternal(e); if (!this.class.konsinyemi) { return SablonluSatisSiparisFis }
		let rec = await this.class.getSablonIcinTeslimBilgisi(e); if (!rec) { return null }
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
		e = e ?? {}; super(e); let {grupSayac, grupAdi, stokKod, stokAdi, stokText, brm} = e;
		let miktar = e.miktar ?? 0, fiyat = e.fiyat ?? 0, brutBedel = e.brutBedel ?? 0, netBedel = e.bedel ?? 0;
		$.extend(this, { grupSayac, grupAdi, stokKod, stokAdi, stokText, miktar, brm, fiyat, brutBedel, netBedel });
		for (let {ioAttr, adiAttr} of HMRBilgi.hmrIter_ekOzellik()) { for (let key of [ioAttr, adiAttr]) { this[key] = e[key] } }
	}
	setValues(e) {
		super.setValues(e); let {rec} = e, {grupsayac: grupSayac, grupadi: grupAdi, stokkod: stokKod, stokadi: stokAdi, brm} = rec;
		let miktar = rec.miktar ?? 0, {fiyat, brutbedel: brutBedel, bedel: netBedel} = rec;
		$.extend(this, { grupSayac, grupAdi, stokKod, stokAdi, brm, miktar });
		if (fiyat) { this.fiyat = fiyat } if (brutBedel) { this.brutBedel = brutBedel } if (netBedel) { this.netBedel = netBedel }
		for (let [key, value] of Object.entries(rec)) {
			for (let prefix of ['isk', 'kam']) {
				if (!(value && key.startsWith(prefix))) { continue }
				let i = asInteger(key.slice(`${prefix}oran`.length)); if (!i) { continue }
				this[`${prefix}Oran${i}`] = value
			}
		}
		for (let {ioAttr, adiAttr} of HMRBilgi.hmrIter_ekOzellik()) { for (let key of [ioAttr, adiAttr]) { this[key] = e[key] } }
	}
}
class SablonluSiparisListeDetay extends SablonluSiparisListeOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class SablonluKonsinyeSiparisListeDetay extends SablonluSiparisListeOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
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
	tabloKolonlariDuzenle_ara({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ara(...arguments); let {sabit: iskSayi} = app.params?.fiyatVeIsk?.iskSayi;
		tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'fiyat', text: 'Fiyat', genislikCh: 13, groupable: false }).readOnly().tipDecimal_fiyat().sifirGosterme(),
			new GridKolon({ belirtec: 'brutBedel', text: 'Brüt Bedel', genislikCh: 13, groupable: false }).readOnly().tipDecimal_bedel().sifirGosterme(),
			(iskSayi ? new GridKolon({
				belirtec: `iskOranlar`, text: `İsk.`, genislikCh: 13, groupable: false,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					let result = []; for (let i = 1; i <= iskSayi; i++) {
						let value = rec[`iskOran${i}`]; if (value) { result.push(value) } }
					return changeTagContent(html, result.length ? `%${result.join(' + ')}` : '')
				}
			}).readOnly().sifirGosterme() : null),
			new GridKolon({ belirtec: 'netBedel', text: 'Net Bedel', genislikCh: 13, groupable: false }).readOnly().tipDecimal_bedel().sifirGosterme()
		].filter(x => !!x))
	}
	fis2Grid({ gridPart, fis }) {
		/*let {detaylar} = fis ?? {}; 
		if (detaylar && !gridPart.yenimi) {
			for (let rec of detaylar) {
				let {miktar, fiyat} = rec;
				this.bedelHesapla({ rec, miktar, fiyat })
			}
		}*/
		return super.fis2Grid(...arguments)
	}
	gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); let {grid} = e;
		grid.jqxGrid({ sortable: true, filterable: true, groupable: true, groups: ['grupAdi'] })
	}
	bedelHesapla({ gridWidget, rowIndex, rec, miktar, fiyat }) {
		let brutBedel = roundToBedelFra(miktar * fiyat), netBedel = brutBedel;
		let Prefix = 'iskOran'; for (let [key, value] of Object.entries(rec)) {
			if (value && key.startsWith(Prefix)) {
				value = typeof value == 'number' ? value : asFloat(value);
				netBedel -= (netBedel * value / 100)
			}
			netBedel = roundToBedelFra(netBedel)
		}
		if (gridWidget) {
			gridWidget.setcellvalue(rowIndex, 'brutBedel', brutBedel);
			gridWidget.setcellvalue(rowIndex, 'netBedel', netBedel)
		}
		else { $.extend(rec, { brutBedel, netBedel }) }
	}
}
class SablonluSiparisListeGridci extends SablonluSiparisListeOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class SablonluKonsinyeSiparisListeGridci extends SablonluSiparisListeOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
