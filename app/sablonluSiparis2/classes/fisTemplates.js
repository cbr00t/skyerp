class SablonluSiparisFisTemplate extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sablonSinif() { return MQSablonOrtak }
	static getUISplitHeight({ islem }) { return islem == 'onayla' || islem == 'sil' ? 200 : MQDetayli.getUISplitHeight(...arguments) }
	static pTanimDuzenle({ fisSinif, pTanim }) {
		$.extend(pTanim, {
			sablonSayac: new PInstNum('sablonsayac'), onayTipi: new PInstStr({ rowAttr: 'onaytipi', init: () => 'BK' }),
			klFirmaKod: new PInstStr(), teslimOrtakdir: new PInstBitTrue('bteslimortakdir')
		});
		if (fisSinif.ticarimi) { $.extend(pTanim, { klFirmaKod: new PInstStr('teslimcarikod') }) }
	}
	static rootFormBuilderDuzenle({ fisSinif, builders, sender: gridPart, /*inst,*/ islem }) {
		let {root: rfb, baslikForm: fbd_baslikForm} = builders, {builders: baslikFormlar} = fbd_baslikForm;
		let {konsinyemi} = fisSinif, {grid, gridWidget, layout} = gridPart;
		rfb.addStyle(e => `$elementCSS .islemTuslari { position: absolute !important; top: 3px !important }`);
		/* rfb.vazgecIstendi = e => false; */
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
	static async sablonYukleVeBirlestir({ fis, islem, belirtec }) {
		let {sablonSayac, tarih, subeKod, mustKod} = fis; if (!mustKod) { throw { isError:  true, errorText: `<b>Müşteri</b> seçilmelidir` } }
		let {detaySinif, konsinyemi} = fis.class; islem = islem || belirtec;
		let yenimi = islem == 'yeni', onaylaVeyaSilmi = (islem == 'onayla' || islem == 'sil');
		tarih = fis.tarih = tarih || today();
		let kapsam = { tarih, subeKod, mustKod }, kosulYapilar = SatisKosulYapi.yukle({ kapsam });
		let sent = new MQSent({
			from: 'hizlisablon sab', fromIliskiler: [
				{ from: 'hizlisablongrup grp', iliski: 'grp.fissayac = sab.kaysayac' },
				{ from: 'hizlisablondetay har', iliski: 'har.grupsayac = grp.kaysayac' },
				{ from: 'stkmst stk', iliski: 'har.stokkod = stk.kod' }
			],
			where: [
				{ degerAta: sablonSayac, saha: 'sab.kaysayac' },
				'har.bdevredisi = 0', `stk.silindi = ''`, `stk.satilamazfl = ''`
			],
			sahalar: [
				'grp.kaysayac grupsayac', 'grp.seq grupseq', 'grp.grupadi', 'har.seq',
				'har.stokkod shkod', 'stk.aciklama shadi', 'stk.brm'
			]
		}), {sahalar, where: wh} = sent;
		wh.icerikKisitDuzenle_stok({ saha: 'har.stokkod' });
		if (konsinyemi && yenimi) {    /* Yeni fiş için KL Dağıtım bağlantısı yoksa recs boş dönsün */
			sent.fromIliski('kldagitim dag', [`dag.mustkod = ${mustKod.sqlServerDegeri()}`, 'sab.klfirmakod = dag.klfirmakod']) }
		let ekOzellikler = Array.from(HMRBilgi.hmrIter_ekOzellik());
		for (let {table, tableAlias: alias, rowAttr, rowAdiAttr} of ekOzellikler) {
			sent.fromIliski(`${table} ${alias}`, `har.${rowAttr} = ${alias}.kod`);
			sahalar.add(`har.${rowAttr}`, `${alias}.aciklama ${rowAdiAttr}`)
		}
		let stm = new MQStm({ sent, orderBy: ['fissayac', 'grupseq', 'seq'] }), recs = await app.sqlExecSelect(stm);
		if (!recs?.length) {
			let mustUnvan, sablonAdi; await Promise.all([
				MQSCari.getGloKod2Adi(mustKod).then(result => mustUnvan = result),
				MQSablonOrtak.getGloKod2Adi(sablonSayac).then(result => sablonAdi = result)
			]);
			throw {
				isError: true, errorText: (
					`<b class=royalblue>${mustKod}-${mustUnvan}</b> Carisi ve <b class=royalblue>${sablonAdi}</b> Şablonuna ait ` +
					`${konsinyemi ? `<u class="bold red">Dağıtım Kaydı yok</u> veya ` : ''}<u class="bold red">Ürün listesi boş</u>`
				)
			}
		}
		let getAnahStr = rec => [
			(rec.shkod ?? rec.shKod),
			 ...ekOzellikler.map(({ rowAttr, ioAttr }) => rec[rowAttr] ?? rec[ioAttr] ?? '')
		].join(delimWS);
		let anah2Det = {}; for (let rec of recs) {
			if (onaylaVeyaSilmi && !rec.miktar) { continue }
			let det = new detaySinif(); det.setValues({ rec });
			for (let {belirtec, ioAttr, adiAttr, rowAttr, rowAdiAttr} of ekOzellikler) {
				let kod = rec[rowAttr], aciklama = rec[rowAdiAttr]; if (kod === undefined) { continue }
				det[ioAttr] = kod; det[adiAttr] = aciklama; det[belirtec] = kod ? `<b>(${kod})</b> ${aciklama}` : ''
			}
			let anahStr = getAnahStr(rec); anah2Det[anahStr] = anah2Det[anahStr] ?? det
		}
		let {detaylar} = fis; for (let det of detaylar) {
			let anahStr = getAnahStr(det), sabDet = anah2Det[anahStr]; if (!sabDet) { continue }
			if (!sabDetay._initFlag) { $.extend(sabDet, { fiyat: det.fiyat, iskYapi: det.iskYapi?.deepCopy() }) }
			sabDet.miktar += det.miktar; sabDet._initFlag = true
		}
		detaylar = fis.detaylar = Object.values(anah2Det);
		let stokKod2Detaylar = {}; for (let det of detaylar) {
			if (!det._initFlag) { (stokKod2Detaylar[det.shKod] = stokKod2Detaylar[det] ?? []).push(det) } }
		let stokKodListe = Object.keys(stokKod2Detaylar); kosulYapilar = await kosulYapilar;
		let fiyatYapilar = await SatisKosul_Fiyat.getAltKosulYapilar(stokKodListe, kosulYapilar?.FY, mustKod), iskontoArastirStokSet = {};
		for (let det of detaylar) {
			if (fiyatYapilar && det.netBedel == undefined) { continue }
			let {shKod: stokKod} = det, kosulRec = fiyatYapilar[stokKod] ?? {}, {iskontoYokmu} = kosulRec;
			if (!iskontoYokmu) { iskontoArastirStokSet[stokKod] = true }
			let fiyat = det.fiyat || kosulRec.fiyat; if (fiyat) {
				let miktar = det.miktar || 0, netBedel = roundToBedelFra(miktar * fiyat);
				$.extend(det, { fiyat, netBedel })
			}
		}
		let iskYapilar = await SatisKosul_Iskonto.getAltKosulYapilar(Object.keys(iskontoArastirStokSet), kosulYapilar?.SB);
		let prefix = 'oran'; for (const det of detaylar) {
			let {stokKod} = det, kosulRec = iskYapilar[stokKod] ?? {};
			for (let [key, value] of Object.entries(iskYapilar)) {
				if (!(value && key.startsWith(prefix))) { continue }
				let i = asInteger(key.slice(prefix.length)); det[`iskOran${i}`] = value
			}
		}
	}
	static async yukleSonrasiIslemler({ fis }) { await this.yukleSonrasiIslemler(...arguments); return this.sablonYukleVeBirlestir(...arguments) }
	static uiDuzenle_fisGirisIslemTuslari(e) { /* super yok */ }
	/*
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
	static async kaydetVeyaSilmeOncesiIslemler(e) { let {asilFis: fis} = this; this.asilFis_argFix(e, fis); e.fis = fis }
	static yukleSonrasiIslemler(e) { }
	asilFis_argFix(e, fis) {
		if (!e) { return this }
		for (let key of ['inst', 'fis']) { if (e[key] !== undefined) { e[key] = fis } }
		for (let key of ['tarih', 'seri', 'noYil', 'fisNo', 'klFirmaKod', 'teslimOrtakdir', 'baslikTeslimTarihi']) {
			let value = this[key]; if (value != null) { fis[key] = value } }
		return this
	}
	static getYazmaIcinDetaylar(e) {
		let {fisIcinDetaySinif} = this, detaylar = super.getYazmaIcinDetaylar(e).filter(det => det.miktar);
		detaylar = detaylar.map(det => det.listemi ? new fisIcinDetaySinif(det) : det);
		return detaylar
	}*/
}

class SablonluSiparisDetayTemplate extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static getStokText(det) {
		let {shKod: stokKod, shAdi: stokAdi} = det;
		return stokKod || stokAdi ? new CKodVeAdi([stokKod, stokAdi]).parantezliOzet({ styled: true }) : ''
	}
	static constructor(e) {
		let {det} = e; for (let key of ['grupSayac', 'grupAdi']) { det[key] = e[key] ?? det[key] }
		det.stokText = this.getStokText(det)
	}
	static pTanimDuzenle({ fisSinif, pTanim }) { }
	static hostVarsDuzenle({ det, hv }) { }
	static setValues({ det, rec }) {
		let {grupsayac: grupSayac, grupadi: grupAdi} = rec; $.extend(det, { grupSayac, grupAdi });
		det.stokText = this.getStokText(det)
		/*for (let [key, value] of Object.entries(rec)) {
			for (let prefix of ['isk', 'kam']) {
				if (!(value && key.startsWith(prefix))) { continue }
				let i = asInteger(key.slice(`${prefix}oran`.length)); if (!i) { continue }
				this[`${prefix}Oran${i}`] = value
			}
		}
		for (let {ioAttr, adiAttr} of HMRBilgi.hmrIter_ekOzellik()) { for (let key of [ioAttr, adiAttr]) { this[key] = e[key] } } */
	}
}

class SablonluSiparisGridciTemplate extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get fisTemplateSinif() { return SablonluSiparisFisTemplate } static get sablonSinif() { return this.fisTemplateSinif.sablonSinif }
	static gridArgsDuzenle({ gridPart, sender, args }) {
		gridPart = gridPart ?? sender; gridPart.sabit();
		$.extend(args, { rowsHeight: 45, groupsExpandedByDefault: true, editMode: 'click', selectionMode: 'singlecell' })
	}
	static tabloKolonlariDuzenle_ilk({ tabloKolonlari }) {
		tabloKolonlari.push(...[
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
	static tabloKolonlariDuzenle_ara({ tabloKolonlari }) {
		let {sabit: iskSayi} = app.params?.fiyatVeIsk?.iskSayi; tabloKolonlari.push(...[
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
	static tabloKolonlariDuzenle_son({ tabloKolonlari }) { }
	static fis2Grid(e) { return true }
	static grid2Fis(e) { return true }
	static geriYuklemeIcinUygunmu(e) { return true }
	static gridVeriYuklendi({ grid }) { grid.jqxGrid({ sortable: true, filterable: true, groupable: true, groups: ['grupAdi'] }) }
	static bedelHesapla({ gridWidget, rowIndex, rec, miktar, fiyat }) {
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
