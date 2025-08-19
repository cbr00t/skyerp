class SablonluSiparisFisTemplate extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sablonSinif() { return MQSablonOrtak }
	static getUISplitHeight({ islem }) { return 170 + ($(window).width() < 1300 ? 90 : 0) + (islem == 'onayla' || islem == 'sil' ? 65 : 0) }
	static get numaratorGosterilirmi() { return false } static get dipGirisYapilirmi() { return false }
	static get aciklamaKullanilirmi() { return false } static get teslimCariSaha() { return 'teslimcarikod' }
	static constructor({ fis }) {
		let {web} = app.params, {otoTeslimTarihi_gunEk} = web;
		if (otoTeslimTarihi_gunEk) { fis.baslikTeslimTarihi = fis.tarih.clone().addDays(otoTeslimTarihi_gunEk) }
		/* fis.yerKod = app.gecerliDepolar?.[0] || fis.yerKod */
	}
	static pTanimDuzenle({ fisSinif, pTanim }) {
		$.extend(pTanim, {
			sablonSayac: new PInstNum('sablonsayac'), onayTipi: new PInstStr({ rowAttr: 'onaytipi', init: () => 'ON' }),
			klFirmaKod: new PInstStr(), teslimOrtakdir: new PInstBitTrue('bteslimortakdir'),
			teslimCariKod: new PInstStr(), araciKod: new PInstStr()
		})
	}
	static rootFormBuilderDuzenle({ fisSinif, builders, sender: gridPart, islem /* , inst */ }) {
		fisSinif.rootFormBuilderDuzenle_numarator(...arguments);
		let {root: rfb, baslikForm: fbd_baslikForm} = builders, {builders: baslikFormlar} = fbd_baslikForm;
		let {konsinyemi} = fisSinif, {grid, gridWidget, layout} = gridPart;
		rfb.addStyle(e =>
			`/*$elementCSS .islemTuslari { position: absolute !important; top: 3px !important }*/
			 $elementCSS .grid [role = row] .sonStokBilgi { font-size: 90% !important; margin-top: -5px !important; line-height: 20px !important }
			 $elementCSS .grid [role = row] .sonStokBilgi .sub-item:not(:first-child) { margin-left: 10px }
		`);
		/* rfb.vazgecIstendi = e => false; */
		let updateHeader = async e => {
			e = e ?? {}; let fbd = e.builder ?? gridPart.fbd_baslikBilgi;
			let {altInst: inst, layout} = fbd;
			let {subeKod, mustKod, sablonSayac, klFirmaKod, teslimCariKod} = inst;
			let setKA = async (selector, kod, aciklama) => {
				let elm = selector ? layout.find(`.${selector}`) : null; if (!elm?.length) { return }
				if (kod) {
					aciklama = await aciklama; if (!aciklama) { return }
					let text = aciklama?.trim(); if (kod && typeof kod == 'string') {
						text = `<span class="kod bold gray">${kod}</b> <span class="aciklama royalblue normal">${aciklama}</span>` };
					elm.find('.veri').html(text.trim()); elm.removeClass('jqx-hidden basic-hidden')
				}
				else { elm.addClass('jqx-hidden') }
			};
			setKA('sablon', sablonSayac, MQSablon.getGloKod2Adi(sablonSayac));
			setKA('sube', subeKod, MQSube.getGloKod2Adi(subeKod));
			if (konsinyemi && klFirmaKod) { setKA('klFirma', klFirmaKod, MQSKLFirma.getGloKod2Adi(klFirmaKod)) }
			setKA('must', mustKod, MQSCari.getGloKod2Adi(mustKod));
			setKA('teslimCari', teslimCariKod, MQSTeslimatci.getGloKod2Adi(teslimCariKod))
		};
		baslikFormlar[0].altAlta().addForm('_baslikBilgi')
			.addStyle(e =>
				`$elementCSS { font-size: 130% } $elementCSS > ._row { gap: 10px } $elementCSS > ._row:not(:last-child) { margin-bottom: 5px }
				$elementCSS .etiket { width: 130px !important } $elementCSS .veri { font-weight: bold; color: royalblue }`
			 ).setLayout(({ builder: fbd }) => {
				let {altInst: inst} = fbd, {tarih, subeKod, mustKod, sablonSayac, klFirmaKod, teslimCariKod, takipNo} = inst, css = `gap: 50px`;
				return $(`<div class="full-width">
					<div class="flex-row" style="${css}">
						<div class="tarih _row flex-row"><div class="etiket">Tarih</div><div style="margin-right: 10px"></div><div class="veri">${dateToString(inst.tarih) || ''}</div></div>
						<div class="sablon _row flex-row"><div class="etiket">Şablon</div><div class="veri">${sablonSayac || ''}</div></div>
						${konsinyemi ? `<div class="klFirma _row flex-row"><div class="etiket">KL Firma</div><div class="veri">${klFirmaKod || ''}</div></div>` : ''}
					</div>
					<div class="flex-row" style="${css}">
						${mustKod ? `<div class="must _row flex-row"><div class="etiket">Müşteri</div><div class="veri">${mustKod?.trim() || ''}</div></div>` : ''}
						${takipNo ? `<div class="takipNo _row flex-row"><div class="etiket">Takip</div><div class="veri">${takipNo?.trim?.() || ''}</div></div>` : ''}
					</div>
					<div class="flex-row" style="${css}">
						${subeKod ? `<div class="sube _row flex-row"><div class="etiket">Şube</div><div class="veri" style="margin-right: 10px">${subeKod?.trim() || ''}</div></div>` : ''}
						${konsinyemi ? `<div class="teslimCari _row flex-row jqx-hidden"><div class="etiket">Teslimatçı</div><div class="veri">${teslimCariKod?.trim() || ''}</div></div>` : ''}
					</div>
				</div>`)
			}).onBuildEk(({ builder: fbd }) => { fbd.rootPart.fbd_baslikBilgi = fbd; updateHeader() });
		baslikFormlar[1].yanYana();
		baslikFormlar[1].addModelKullan('sevkAdresKod', 'Sevk Adres').comboBox().autoBind().setMFSinif(MQSSevkAdres)
			.addStyle_wh(500)
			.ozelQueryDuzenleHandler(({ builder: fbd, aliasVeNokta, stm }) => {
				let {altInst: inst} = fbd ?? {}, {mustKod} = inst ?? {}; if (!mustKod) { return }
				for (let {where: wh} of stm.getSentListe()) { wh.degerAta(mustKod, `${aliasVeNokta}must`) }
			})
			.degisince(({ builder: fbd }) => updateHeader());
		baslikFormlar[1].addDateInput('baslikTeslimTarihi', 'Teslim Tarihi');
		baslikFormlar[1].addTextInput('baslikAciklama', 'Açıklama');
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
	static loadServerData_queryDuzenle({ fisSinif, sent }) {
		/*let {tableAlias: alias, mustSaha} = fisSinif, {sahalar} = sent;
		sahalar.addWithAlias(alias, 'sablonsayac', mustSaha)*/
	}
	static async yeniTanimOncesiIslemler(e) {
		/* await this.dagitimIcinEkBilgileriBelirle({ fis }) */
		await this.yeniTanimOncesiIslemler_ozel?.(e)
	}
	static async yukleSonrasiIslemler(e) {
		let {sender: detGridPart, fis} = e, {parentPart: gridPart} = detGridPart ?? {};
		// fis.mustKod = gridPart.mustKod || fis.mustKod;
		fis.mustKod = fis.teslimCariKod || fis.mustKod;
		let result = await this.sablonYukleVeBirlestir({ ...e });
		await this.yukleSonrasiIslemler_ozel?.(e);
		return result
	}
	static async sablonYukleVeBirlestir(e) {
		let {fis, islem, belirtec} = e, {sablonSayac, tarih, subeKod, mustKod, numarator, class: fisSinif} = fis;
		if (!mustKod) { throw { isError:  true, errorText: `<b>Müşteri</b> seçilmelidir` } }
		let _fis = fis.deepCopy(); await this.dagitimIcinEkBilgileriBelirle({ ...e, fis: _fis });
		let {onayliTipler} = SiparisFis, {mustKod: teslimCariVeyaMustKod, onayTipi} = _fis;
		let onaylimi = onayliTipler.includes(onayTipi?.char ?? onayTipi);
		let {detaySinif, konsinyemi, numTipKod} = fisSinif; islem = islem || belirtec;
		let yenimi = islem == 'yeni', izlemi = islem == 'izle';
		let onaylami = islem == 'onayla', silmi = islem == 'sil';
		let onaylaVeyaSilmi = onaylami || silmi || izlemi;
		tarih = fis.tarih = tarih || today();
		if (numarator) { numarator.belirtec = 'W' }
		/*numSayac = app.param.web.x;
		if (numSayac) {
			let sent = new MQSent({
				from: 'tnumara', where: [{ degerAta: numTipKod, saha: 'tip' }, { degerAta: numSayac, saha: 'sayac' }],
				sahalar: ['belirtec']
			})
			let belirtec = await app.sqlExecTekilDeger(sent);
			if (belirtec) { numarator.belirtec = belirtec }
		}*/
		let kapsam = { tarih, subeKod, mustKod };
		let anah2KosulYapi = SatisKosulYapi._anah2KosulYapi ??= {};
		let kosulYapilar = anah2KosulYapi[toJSONStr(kapsam)] ??= await SatisKosulYapi.uygunKosullar({ kapsam });
		let sent = new MQSent({
			from: 'hizlisablon sab', fromIliskiler: [
				{ from: 'hizlisablongrup grp', iliski: 'grp.fissayac = sab.kaysayac' },
				{ from: 'hizlisablondetay har', iliski: 'har.grupsayac = grp.kaysayac' },
				{ from: 'stkmst stk', iliski: 'har.stokkod = stk.kod' },
				{ alias: 'stk', leftJoin: 'urunpaket upak', on: ['stk.kod = upak.urunkod', `upak.varsayilan <> ''`] }
			],
			where: [
				{ degerAta: sablonSayac, saha: 'sab.kaysayac' },
				`stk.silindi = ''`, `stk.satilamazfl = ''`
			],
			sahalar: [
				'grp.kaysayac grupsayac', 'grp.seq grupseq', 'grp.grupadi', 'har.seq', 'har.bdevredisi',
				'har.stokkod shkod', 'stk.aciklama shadi', 'stk.brm', 'upak.urunmiktari paketicadet'
			]
		}), {sahalar, where: wh} = sent;
		if (!onaylami) { wh.add(`har.bdevredisi = 0`) }
		wh.icerikKisitDuzenle_stok({ saha: 'har.stokkod' });
		if (konsinyemi && yenimi) {    /* Yeni fiş için KL Dağıtım bağlantısı yoksa recs boş dönsün */
			sent.fromIliski('kldagitim dag', [`dag.mustkod = ${mustKod.sqlServerDegeri()}`, 'sab.klfirmakod = dag.klfirmakod']) }
		let ekOzellikler = Array.from(HMRBilgi.hmrIter_ekOzellik());
		for (let {table, tableAlias: alias, rowAttr, rowAdiAttr} of ekOzellikler) {
			sent.fromIliski(`${table} ${alias}`, `har.${rowAttr} = ${alias}.kod`);
			sahalar.add(`har.${rowAttr}`, `${alias}.aciklama ${rowAdiAttr}`)
		}
		let stm = new MQStm({ sent, orderBy: ['fissayac', 'grupseq', 'seq'] });
		let recs = await app.sqlExecSelect(stm);
		if (!recs?.length) {
			let mustUnvan = mustKod ? await MQSCari.getGloKod2Adi(mustKod) : null;
			let sablonAdi = sablonSayac ? await MQSablonOrtak.getGloKod2Adi(sablonSayac) : null;
			throw {
				isError: true, errorText: (
					(mustKod ? `<b class=royalblue>${mustKod}-${mustUnvan}</b> Carisi ve ` : '') +
					(sablonSayac ? `<b class=royalblue>${sablonAdi}</b> Şablonuna ait ` : '') +
					(konsinyemi ? `<u class="bold red">Dağıtım Kaydı yok</u> veya ` : '') +
					`<u class="bold red">Ürün listesi boş</u>`
				)
			}
		}
		let izinliStokKodSet = null, stokKodListe = recs?.map(({ shkod }) => shkod);
		if (stokKodListe?.length) {
			let tables = this._sqlTables = this._sqlTables ?? await app.sqlGetTables();
			if (tables.pzmusturunfis) {
				let must2UrunKisit = this._must2UrunKisit ??= {};
				izinliStokKodSet = must2UrunKisit[toJSONStr([mustKod, stokKodListe])] ??= await (async () => {
					let sent = new MQSent(), {where: wh, sahalar} = sent;
					sent.fisHareket('pzmusturunfis', 'pzmusturundetay'); sahalar.add('har.stokkod stokKod');
					wh.add(`fis.devredisi = ''`).degerAta(mustKod, 'fis.mustkod').inDizi(stokKodListe, 'har.stokkod');
					return asSet((await app.sqlExecSelect(sent)).map(({ stokKod }) => stokKod))
				})();
				if ($.isEmptyObject(izinliStokKodSet)) { izinliStokKodSet = null }
			}
			if (tables.hizlisablonkisit) {
				let {sablonDefKisit} = app.params.web, {sube: defKisit_sube, musteri: defKisit_musteri} = sablonDefKisit;
				let key2IzinliStokKodSet = this._key2IzinliStokKodSet ??= {};
				let {result: _izinliStokKodSet, reset} = key2IzinliStokKodSet[toJSONStr([sablonSayac, subeKod, mustKod, stokKodListe])] ??= await (async () => {
					let sent = new MQSent(), {where: wh, sahalar} = sent;
					sent.fisHareket('hizlisablonkisit', 'hizlisablonkisitdetay');
					wh.degerAta(sablonSayac, 'fis.sablonsayac').inDizi(stokKodListe, 'har.stokkod');
					wh.add(new MQOrClause([
						new MQAndClause([`fis.kayittipi = ''`, { degerAta: subeKod ?? '', saha: 'fis.subekod' }]),
						new MQAndClause([`fis.kayittipi = 'M'`, { degerAta: mustKod, saha: 'fis.mustkod' }])
					]));
					sahalar.add('fis.kayittipi kayitTipi', 'har.stokkod stokKod');
					let tip2StokKodSet = { sube: {}, musteri: {} };
					for (let {kayitTipi, stokKod} of await app.sqlExecSelect(sent)) {
						let selector = kayitTipi == 'M' ? 'musteri' : !kayitTipi ? 'sube' : null; if (!selector) { continue }
						tip2StokKodSet[selector][stokKod] = true
					}
					if (
						(defKisit_sube && $.isEmptyObject(tip2StokKodSet.sube)) &&
						(defKisit_musteri && $.isEmptyObject(tip2StokKodSet.musteri))
					) { return ({ reset: true }) }
					let result = {}; for (let xSet of Object.values(tip2StokKodSet)) {
						if ($.isEmptyObject(xSet)) { continue }
						$.extend(result, xSet)
					}
					return result
				})();
				if (reset) { recs = null }
				if (izinliStokKodSet) {
					for (let key of Object.keys(izinliStokKodSet)) {
						if (!_izinliStokKodSet?.[key]) { delete izinliStokKodSet[key] } }
				}
				else { izinliStokKodSet = _izinliStokKodSet }
				if (!(defKisit_sube || defKisit_musteri) && $.isEmptyObject(izinliStokKodSet)) { izinliStokKodSet = null }
			}
		}
		if (izinliStokKodSet && recs?.length) {    /* izinliStokKodSet içindeki kayıtlar filtrelenir */
			recs = recs.filter(({ shkod: stokKod }) => !!izinliStokKodSet[stokKod]) }
		if (recs && !recs?.length) {
			let mustUnvan = mustKod ? await MQSCari.getGloKod2Adi(mustKod) : null;
			let sablonAdi = sablonSayac ? await MQSablonOrtak.getGloKod2Adi(sablonSayac) : null;
			throw {
				isError: true, errorText: (
					(mustKod ? `<b class=royalblue>${mustKod}-${mustUnvan}</b> Carisi ve ` : '') +
					(sablonSayac ? `<b class=royalblue>${sablonAdi}</b> Şablonuna ait ` : '') +
					`<u class="bold red">Kullanılabilir Ürün Listesi boş</u>`
				)
			}
		}
		let getAnahStr = rec => [
			(rec.shkod ?? rec.shKod ?? rec.stokkod ?? rec.stokKod),
			 ...ekOzellikler.map(({ rowAttr, ioAttr }) => rec[rowAttr] ?? rec[ioAttr] ?? '')
		].join(delimWS);
		let anah2Det = {}; for (let rec of recs) {
			let {shkod: shKod} = rec; if (izinliStokKodSet && !izinliStokKodSet[shKod]) { continue }
			let {bdevredisi: devreDisimi, grupsayac: grupSayac, grupseq: grupSeq, grupadi: grupAdi, shadi: shAdi, paketicadet: paketIcAdet} = rec;
			let _e = { devreDisimi, grupSayac, grupSeq, grupAdi, shKod, shAdi, paketIcAdet };
			let det = new detaySinif(_e);
			for (let {belirtec, ioAttr, adiAttr, rowAttr, rowAdiAttr} of ekOzellikler) {
				let kod = rec[rowAttr], aciklama = rec[rowAdiAttr]; if (kod === undefined) { continue }
				det[ioAttr] = kod; det[adiAttr] = aciklama; det[belirtec] = kod ? `<b>(${kod})</b> ${aciklama}` : ''
			}
			anah2Det[getAnahStr(rec)] ??= det
		}
		let {detaylar} = fis; for (let det of detaylar) {
			let anahStr = getAnahStr(det), sabDet = anah2Det[anahStr]; if (!sabDet) { continue }
			/* det.devreDisimi = sabDet.devreDisimi; */
			if (!sabDet._initFlag) { $.extend(sabDet, { ...det.deepCopy() }) }
			else { sabDet.miktar += det.miktar }
			sabDet._initFlag = true
		}
		detaylar = Object.values(anah2Det);
		if (onaylimi || onaylaVeyaSilmi) { detaylar = detaylar.filter(({ miktar }) => !!miktar) }
		fis.detaylar = detaylar;
		let stokKod2Detaylar = {}; for (let det of detaylar) {
			// if (!onaylaVeyaSilmi && det._initFlag) { continue }
			(stokKod2Detaylar[det.shKod] = stokKod2Detaylar[det] ?? []).push(det)
		}
		stokKodListe = Object.keys(stokKod2Detaylar); kosulYapilar = await kosulYapilar;
		if (stokKodListe?.length) {
			// let kosulSinif = fisSinif.alimmi ? SatisKosul_AlimAnlasma : SatisKosul_Fiyat;
			let kosulSinif = SatisKosul_Fiyat;
			let {tipKod: tip} = kosulSinif, iskontoArastirStokSet = {};
			let anah = toJSONStr({ tip, kapsam, stokKodListe });
			let fiyatYapilar = anah2KosulYapi[anah] ??= await kosulSinif.getAltKosulYapilar(stokKodListe, kosulYapilar?.FY, mustKod);
			for (let det of detaylar) {
				if (fiyatYapilar && det.netBedel == undefined) { continue }
				let {shKod: stokKod} = det, kosulRec = fiyatYapilar[stokKod] ?? {}, {iskontoYokmu} = kosulRec;
				if (!iskontoYokmu) { iskontoArastirStokSet[stokKod] = true }
				let fiyat = det.fiyat || kosulRec.fiyat || kosulRec.alimFiyat;
				if (fiyat) {
					let miktar = det.miktar || 0, netBedel = roundToBedelFra(miktar * fiyat);
					$.extend(det, { fiyat, netBedel })
				}
			}
			let iskontoArastirStokKodListe = Object.keys(iskontoArastirStokSet);
			anah = toJSONStr({ tip: 'SB', kapsam, stokKodListe: iskontoArastirStokKodListe });
			let iskYapilar = anah2KosulYapi[anah] ??= await SatisKosul_Iskonto.getAltKosulYapilar(iskontoArastirStokKodListe, kosulYapilar?.SB);
			let prefix = 'oran'; for (let det of detaylar) {
				let {stokKod} = det, kosulRec = iskYapilar[stokKod] ?? {};
				for (let [key, value] of Object.entries(iskYapilar)) {
					if (!(value && key.startsWith(prefix))) { continue }
					let i = asInteger(key.slice(prefix.length)); det[`iskOran${i}`] = value
				}
			}
			let {gecerliDepolar: yerKodListe} = app, paramName_stokKodListe = '@stokKodListe';
			let {webSiparis_sonStokGosterilirmi, webSiparis_ayOnceSayisi: ayOnceSayisi} = app.params.web;
			let _e = { ...e, getAnahStr, anah2Det, ekOzellikler, paramName_stokKodListe };
			if (webSiparis_sonStokGosterilirmi) {
				let stokKodSet = _e.stokKodSet = asSet(detaylar.map(det => det.shKod));
				let params = _e.params = [
					{
						name: paramName_stokKodListe, type: 'structured', typeName: 'type_charList',
						value: Object.keys(stokKodSet).map(kod => ({ kod }))
					}
				];
				let table2Col = app._table2Col ??= {};
				let colInfo = table2Col.carmst_konsinyeyerkod ??= Object.values(await app.sqlGetColumns('carmst', 'konsinyeyerkod'))?.[0] ?? {};
				if (!$.isEmptyObject(colInfo)) {
					let must2KonYerKod = this._must2KonYerKod ??= {};
					let getMust2YerKod = async mustKod => {
						mustKod ??= fis.mustKod; if (!mustKod) { return null }
						return must2KonYerKod[mustKod] ??= await (async () => {
							let sent = new MQSent({ from: 'carmst', sahalar: 'konsinyeyerkod' }), {where: wh} = sent;
							wh.degerAta(mustKod, 'must');
							let yerKod = (await app.sqlExecTekilDeger(sent))?.trimEnd();
							return yerKod
						})()
					}
					let query = _e.query = new MQStm({ sent: new MQUnionAll() }), toplamInd = 0;
					await this.detaylariDuzenle_sonStok_queryOlustur({ ..._e, tip: 'genel', yerKodListe, uzakSonStokmu: true });
					if (konsinyemi) {
						await this.detaylariDuzenle_sonStok_queryOlustur({
							..._e, tip: 'kendiDeposu', kendisimi: true, yerKodListe: () => getMust2YerKod()
						})
					}
					await this.detaylariDuzenle_sonStok(_e)
				}
			}
			if (konsinyemi && ayOnceSayisi) { await this.detaylariDuzenle_oncekiMiktar(_e) }
		}
	}
	static async detaylariDuzenle_sonStok_queryOlustur(e) {
		let {
			tip, query, mfSinif: sablonSinif, islem, fis, ekOzellikler, yerKodListe,
			uzakSonStokmu, kendisimi, sentDuzenle, paramName_stokKodListe
		} = e;
		let {sonStokDB} = app, yenimi = islem == 'yeni'; /*, onaylaVeyaSilmi = (islem == 'onayla' || islem == 'sil') */
		sablonSinif = sablonSinif?.sablonSinif ?? sablonSinif;    /* detaySinif gelirse (detaySinif.sablonSinif) */
		// let {fisSiniflar} = sablonSinif;
		let {class: buFisSinif, sayac: fisSayac, mustKod, detaylar} = fis;
		let stokKodSet = asSet(detaylar.map(det => det.shKod));
		if (isFunction(yerKodListe)) { yerKodListe = await yerKodListe.call(this, ...arguments) }
		yerKodListe = yerKodListe ? $.makeArray(yerKodListe) : [];
		let sentOrtakSahalarEkle = ({ sent }) => {
			sent.sahalar.add(
				`${tip.sqlServerDegeri()} tip`, 'stokkod',
				...ekOzellikler.filter(({ rowAttr }) => rowAttr).map(({ rowAttr }) => `'' ${rowAttr}`)
			)
		};
		sentDuzenle ??= {};
		sentDuzenle.normal ??= ({ sent, carpanClause }) =>
			sent.sahalar.add('0 sonStok', `SUM(har.miktar * ${carpanClause}) gidecek`, '0 yoldaki');
		sentDuzenle.donusum ??= ({ sent, tersCarpanClause }) =>
			sent.sahalar.add('0 sonStok', `SUM(don.busevkmiktar * ${tersCarpanClause}) gidecek`, '0 yoldaki');
		sentDuzenle.yoldaki ??= ({ sent }) =>
			sent.sahalar.add('0 sonStok', '0 gidecek', 'SUM(har.miktar) yoldaki');
		let orjCarpan = kendisimi ? 1 : -1;
		let {onayliTipler} = SiparisFis, uni = new MQUnionAll();
		/* sonstok sent */
		{
			let table = 'sonstok son';
			if (uzakSonStokmu && sonStokDB) { table = `${sonStokDB}..${table}` }
			let sent = new MQSent(), {where: wh, sahalar} = sent;
			sent.fromAdd(`${table}`)
				.fromIliski(`${paramName_stokKodListe} s`, 'son.stokkod = s.kod');
			wh.add(`son.opno IS NULL`, `son.ozelisaret <> 'X'`)
				.inDizi(yerKodListe, 'son.yerkod');
			sahalar.add(
				`${tip.sqlServerDegeri()} tip`, 'son.stokkod',
				...ekOzellikler.filter(({ rowAttr }) => rowAttr).map(({ rowAttr }) => `'' ${rowAttr}`),
				'SUM(son.sonmiktar) sonStok', '0 gidecek', '0 yoldaki'
			);
			sent.groupByOlustur(); uni.add(sent)
		}
		let table2Col = app._table2Col ??= {};
		for (let fisSinif of [buFisSinif]) {
			let {table, detaySinif, sevkFisSinif, siparismi} = fisSinif, detayTable = detaySinif.getDetayTable({ fisSinif });
			let {table: donusumTable, baglantiSaha: donusumSayacSaha} = fisSinif.getDonusumYapi({ detaySinif }) ?? {};
			let mustSaha = `fis.${fisSinif.mustSaha}`, teslimCariSaha = `fis.${fisSinif.teslimCariSaha}`, keyHV = fisSinif.varsayilanKeyHostVars();
			let {satismi, stokmu} = fisSinif;
			let carpan = orjCarpan; if (satismi) { carpan = -carpan } if (stokmu) { carpan = -carpan }
			// carpan = -carpan;    /* carpan gidecek durumuna göre ayarlandı */
			let carpanClause = carpan.sqlServerDegeri(), tersCarpanClause = (-carpan).sqlServerDegeri(), tipClause = tip.sqlServerDegeri();
			let konumStatuVarmi = table2Col[`${table}_konumstatu`] ??= Object.values(await app.sqlGetColumns(table, 'konumstatu'))?.[0] ?? false;
			{
				/* olası sevk */
				let sent = new MQSent(), {where: wh, sahalar} = sent;
				sent.fisHareket(table, detayTable)
					.fromIliski(`${paramName_stokKodListe} s`, 'har.stokkod = s.kod');
				wh.birlestirDict({ alias: 'fis', dict: keyHV });
				wh.fisSilindiEkle().add(`fis.kapandi = ''`, `fis.ozelisaret <> 'X'`);
				if (konumStatuVarmi) { wh.add(`fis.konumstatu = ''`) }
				wh.inDizi(onayliTipler, 'fis.onaytipi');
				if (kendisimi && mustKod) { wh.degerAta(mustKod, teslimCariSaha) }
				/*wh.inDizi(Object.keys(stokKodSet), 'har.stokkod');*/
				if (fisSayac && fisSinif == buFisSinif) { wh.add(`fis.kaysayac <> ${fisSayac.sqlServerDegeri()}`) }
				sahalar.add(
					`${tipClause} tip`, 'har.stokkod',
					...ekOzellikler.filter(({ rowAttr }) => rowAttr).map(({ rowAttr }) => `har.${rowAttr}`)
				);
				let _e = { ...e, sent, carpan, carpanClause, tersCarpanClause };
				sentOrtakSahalarEkle(_e); sentDuzenle.normal?.(_e);
				sent.groupByOlustur(); uni.add(sent);
				
				/* olası sevkten düşülecek */
				if (donusumTable) {
					sent = sent.deepCopy(); let {where: wh, sahalar} = sent;
					sent.fromIliski(`${donusumTable} don`, `har.kaysayac = don.${donusumSayacSaha}`);
					sent.sahalarReset();
					let _e = { ...e, sent, carpan, carpanClause, tersCarpanClause };
					sentOrtakSahalarEkle(_e); sentDuzenle?.donusum(_e);
					sent.groupByOlustur(); uni.add(sent)
				}
			}
			
			/* sevk için bekleyen */
			if (kendisimi && sevkFisSinif) {
				let sent = new MQSent(), {where: wh, sahalar} = sent;
				let {table: sevkFisTable, varsayilanKeyHostVars: keyHV} = sevkFisSinif;
				let sevkDetaySinif = sevkFisSinif.detaySinifFor('');
				let sevkDetayTable = sevkDetaySinif.getDetayTable({ fisSinif: sevkFisSinif });
				sent.fisHareket(sevkFisTable, sevkDetayTable)
					.fromIliski(`${paramName_stokKodListe} s`, 'har.stokkod = s.kod');
				wh.birlestirDict({ alias: 'fis', dict: keyHV });
				wh.fisSilindiEkle().add(`fis.ozelisaret <> 'X'`);
				wh.add(`fis.konumstatu <> ''`);                                                         /* kesinleşmemiş fiş için */
				if (mustKod) { wh.degerAta(mustKod, mustSaha) }
				/*wh.inDizi(Object.keys(stokKodSet), 'har.stokkod');*/
				if (fisSayac && fisSinif == buFisSinif) { wh.add(`fis.kaysayac <> ${fisSayac.sqlServerDegeri()}`) }
				sahalar.add(
					`${tipClause} tip`, 'har.stokkod',
					...ekOzellikler.filter(({ rowAttr }) => rowAttr).map(({ rowAttr }) => `har.${rowAttr}`)
				);
				let _e = { ...e, sent, carpan, carpanClause, tersCarpanClause };
				sentOrtakSahalarEkle(_e); sentDuzenle.yoldaki?.(_e);
				sent.groupByOlustur(); uni.add(sent)
				
				/*
				select 'yol' tip, har.stokkod, har.ekoz1kod, sum(har.miktar) miktar
					from piffis fis, pifstok har
					where fis.silindi='' and fis.kaysayac=har.fissayac and fis.piftipi='I'
						and fis.almsat='A' and fis.iade=''
						and fis.teslimcarikod=@mustKod and fis.ozelisaret<>'X' and fis.konumstatu<>''
						and har.stokkod in (@stokListe)
					group by har.stokkod, har.ekoz1kod
	
				select 'yol tip, har.stokkod, har.ekoz1kod, sum(har.miktar) miktar
					from stfis fis, ststok har
					where fis.silindi='' and fis.kaysayac=har.fissayac 
						and fis.gctipi='T' and fis.ozeltip='IR' 
						and fis.irsmust=@mustKod and fis.ozelisaret<>'X' and fis.konumstatu<>''
						and har.stokkod in (@stokListe)
					group by har.stokkod, har.ekoz1kod
				*/
			}
		}
		let target = query.sent ?? query;
		target.addAll(uni.liste);
		/*let stm = uni.asToplamStm({ toplamInd });
		let target = query.with ?? query;
		target.add(stm);*/
		return this
	}
	static async detaylariDuzenle_sonStok({ query, params, getAnahStr, anah2Det, ioAttrPrefix, ioAttrPostfix }) {
		ioAttrPrefix ??= ''; ioAttrPostfix ??= '';
		let recs = await app.sqlExecSelect({ query, params });
		let getKeys = tip => tip == 'kendiDeposu' ? ['sonStok', 'gidecek', 'yoldaki'] : ['sonStok', 'olasi'];
		let _getKey = (key, tip) => [`${ioAttrPrefix}${key}${ioAttrPostfix}`, tip].filter(x => !!x).join('_');
		for (let rec of recs) {
			let anahStr = getAnahStr(rec), det = anah2Det[anahStr]; if (!det) { continue }
			let {tip, stokkod: stokKod, sonStok, gidecek} = rec, kendisimi = tip == 'kendiDeposu';
			if (!kendisimi) { rec.olasi = (sonStok ?? 0) - (gidecek ?? 0) }
			let keys = getKeys(tip), getKey = key => _getKey(key, tip);
			let values = keys.map(key => rec[key]);
			for (let i = 0; i < keys.length; i++) {
				let value = values[i]; if (!value) { continue }
				let key = getKey(keys[i]);
				det[key] = (det[key] ?? 0) + value
			}
			// if (stokKod == '8690451706136') { debugger }
		}
		for (let rec of recs) {
			let anahStr = getAnahStr(rec), det = anah2Det[anahStr]; if (!det) { continue }
			let {tip, stokkod: stokKod} = rec;
			let keys = getKeys(tip), getKey = key => _getKey(key, tip);
			let values = keys.map(key => det[getKey(key)] ?? 0);
			// if (stokKod == '8680782524158') { debugger }
			let cssColor = {}, defaultColor = 'lightgray';
			// cssColor[keys[0]] = values[0] > 0 ? 'forestgreen' : values[0] < 0 ? 'firebrick' : 'gray';
			for (let i = 0; i < keys.length; i++) {
				let key = keys[i], value = values[i];
				cssColor[key] = value > 0 ? 'forestgreen' : value < 0 ? 'firebrick' : 'gray'
			}
			$.extend(cssColor, { yoldaki: cssColor.olasi, gidecek: cssColor.sonStok });
			let sonStokBilgi = []; for (let i = 0; i < keys.length; i++) {
				let value = values[i]; if (!value) { continue }
				let key = keys[i], label = key[0].toUpperCase();
				sonStokBilgi.push([
					`<div class="item ${key}">`,
						`<span class="etiket gray">${label}:</span> `,
						`<span class="veri bold ${cssColor[key] || defaultColor}">${numberToString(value)}</span>`,
					 `<div>`
				].join(CrLf))
			}
			sonStokBilgi = sonStokBilgi.filter(x => !!x).join(CrLf);
			if (sonStokBilgi) { sonStokBilgi = `<div class="sonStokBilgi parent">${sonStokBilgi}</div>` }
			det[getKey('sonStokBilgi')] = sonStokBilgi
			// if (stokKod == '8690451706136') { debugger }
		}
	}
	static async detaylariDuzenle_oncekiMiktar({ mfSinif: sablonSinif, fis, islem, belirtec, getAnahStr, anah2Det, ekOzellikler }) {
		let {params} = app, {webSiparis_ayOnceSayisi: ayOnceSayisi} = params.web;
		let yenimi = islem == 'yeni'; /*, onaylaVeyaSilmi = (islem == 'onayla' || islem == 'sil') */
		sablonSinif = sablonSinif?.sablonSinif ?? sablonSinif;    /* detaySinif gelirse (detaySinif.sablonSinif) */
		let fisSinif = SatisFaturaFis, {fisSiniflar} = sablonSinif;
		let {sayac: fisSayac, class: buFisSinif, tarih, mustKod, detaylar} = fis;
		let stokKodSet = asSet(detaylar.map(det => det.shKod));
		let onceTarih = tarih?.clone()?.addMonths(-ayOnceSayisi);
		let sent = new MQSent(), {where: wh, sahalar} = sent;
		sent.fisHareket('piffis', 'pifstok')
		/*sent.fisHareket(table, detayTable); wh.birlestirDict({ alias: 'fis', dict: keyHV });*/
		wh.fisSilindiEkle().add(`fis.kapandi = ''` /*, `fis.ozelisaret <> '*'`*/);
		wh.add(`fis.piftipi = 'F'`, `fis.almsat = 'T'`, `fis.iade = ''`, `fis.konumstatu = ''`);
		wh.add(`fis.tarih >= ${onceTarih.sqlServerDegeri()}`);
		wh.degerAta(mustKod, 'fis.must');
		wh.inDizi(Object.keys(stokKodSet), 'har.stokkod');
		if (fisSayac && fisSinif == buFisSinif) { wh.add(`fis.kaysayac <> ${fisSayac.sqlServerDegeri()}`) }
		sahalar.add(
			'har.stokkod',
			...ekOzellikler.filter(({ rowAttr }) => rowAttr).map(({ rowAttr }) => `har.${rowAttr}`),
			`ROUND(SUM(har.miktar) / ${ayOnceSayisi.sqlServerDegeri()}, 0) onceMiktar`
		);
		sent.groupByOlustur();
		let stm = new MQStm({ sent }), recs = await app.sqlExecSelect(stm);
		for (let rec of recs) {
			let anahStr = getAnahStr(rec), det = anah2Det[anahStr]; if (!det) { continue }
			let {onceMiktar} = rec, cssColor = { onceMiktar: onceMiktar > 0 ? 'forestgreen' : onceMiktar < 0 ? 'firebrick' : 'gray' };
			let onceMiktarBilgi = [
				(onceMiktar ? `<div class="item onceMiktar"><span class="veri bold ${cssColor.onceMiktar}">${numberToString(onceMiktar)}</span><div>` : null),
			].filter(x => !!x).join(CrLf);
			$.extend(det, { onceMiktar, onceMiktarBilgi })
		}
	}
	static getYazmaIcinDetaylar({ fis }) { return fis.detaylar.filter(det => !!det.miktar) }
	static async kaydetOncesiIslemler({ islem, fis }) {
		if (islem == 'sil') { return }
		let {detaylar} = fis, bosmu = true;
		for (let det of detaylar) {
			let {miktar} = det; if (!miktar) { continue }
			let {fiyat, netBedel: bedel} = det; bosmu = false;
			if (fiyat && !bedel) {
				await det.bedelHesapla?.({ fis }); bedel = det.netBedel;
				if (!bedel) { throw { isError: true, rc: 'fiyatBedelSorunu', errorText: 'Bazı ürünlerin Fiyati var ama Bedeli belirsiz' } }
			}
		}
		if (bosmu) { throw { isError: true, rc: 'emptyRecs', errorText: 'Sipariş boş olamaz' } }
		await this.stokIslemBelirle(...arguments);
		await this.dagitimIcinEkBilgileriBelirle(...arguments)
	}
	static async kaydetSonrasiIslemler({ islem, fis, trn }) { }
	static async kaydetVeyaSilmeSonrasiIslemler({ islem, fis, trn }) {
		islem = (islem ?? 'y')[0].toUpperCase();
		let degisenler = ['Web Kon.Sip.'];
		try { await fis.logKaydet({ islem, degisenler, trn }) }
		catch (ex) { console.error(ex) }
	}
	static hostVarsDuzenle({ fis, hv }) {
		if (fis.class.ticarimi) {
			let {teslimCariKod: teslimcarikod, araciKod: aracikod} = fis;
			$.extend(hv, { teslimcarikod, aracikod })
		}
	}
	static setValues({ fis, rec }) {
		if (fis.class.ticarimi) {
			let {teslimcarikod: teslimCariKod, aracikod: araciKod} = rec;
			$.extend(fis, { teslimCariKod, araciKod })
		}
	}
	static uiDuzenle_fisGirisIslemTuslari(e) { /* super yok */ }
	static async stokIslemBelirle({ fis }) {
		let {almSat} = fis.class; almSat ||= 'T';
		let isl = new MQStokIslem({ kod: `${almSat}INT`, tip: `${almSat}F`, durumKod: almSat });
		if (!await isl.varmi()) { await isl.yaz() }
		fis.islKod = isl.kod
	}
	static async dagitimIcinEkBilgileriBelirle({ fis }) {
		let {konsinyemi} = fis.class, {klFirmaKod} = fis;
		if (!konsinyemi) {
			fis.teslimCariKod = fis.araciKod = '';
			return null
		}
		/* Sonrası Konsinye içindir */
		let {sablonSayac, mustKod, sevkAdresKod, class: fisSinif} = fis;
		let {mustSaha, stokmu} = fisSinif, {gecerliDepolar} = app, sabitCikisYerKod = gecerliDepolar?.[0] ?? '';
		let hedefMustKodClause = (
			`(case when dag.bkendimizteslim > 0 then ${mustKod.sqlServerDegeri()}
					when dag.bfaturayianafirmakeser > 0 then dfir.mustkod
					else dag.klteslimatcikod end)`
		);
		let anah = toJSONStr([sablonSayac, mustKod, sevkAdresKod, klFirmaKod]);
		this._anah2DagEkBilgi ??= {}; let {_anah2DagEkBilgi} = this;
		let rec = _anah2DagEkBilgi[anah] ??= await (async () => {
			let sent = new MQSent(), {where: wh, sahalar} = sent;
			sent.fromAdd('kldagitim dag')
				.fromIliski('klfirma dfir', 'dag.klfirmakod = dfir.kod')
				.fromIliski('carmst car', `car.must = ${mustKod.sqlServerDegeri()}`)
				.cari2BolgeBagla();
			wh.degerAta(klFirmaKod, 'dag.klfirmakod').degerAta(mustKod, 'dag.mustkod')
			wh.add(new MQOrClause([
				`dag.sevkadreskod = ''`,
				(sevkAdresKod ? { degerAta: sevkAdresKod, saha: 'dag.sevkadreskod' } : null)
			].filter(x => !!x)));
			sahalar.add(
				`${hedefMustKodClause} hedefMustKod`, 'bol.bizsubekod subeKod', 'dag.bkendimizteslim kendimizTeslimmi',
				`(case when dag.bkendimizteslim > 0 then '' else dag.klteslimatcikod end) teslimEdenCariKod`,
				`(case when dag.bkendimizteslim > 0 then dag.kendidepokod else ${sabitCikisYerKod.sqlServerDegeri()} end) cYerKod`,
				'car.konsinyeyerkod gYerKod'
			);
			return await app.sqlExecTekil(sent)
		})() ?? {};
		let {subeKod, hedefMustKod, kendimizTeslimmi, teslimEdenCariKod, gYerKod, cYerKod} = rec;
		/* kendimizTeslimmi  { true: İrs. Trf. Sip. | false: Alım Sip. }  */
		$.extend(fis, {
			subeKod, mustKod: hedefMustKod,
			teslimCariKod: kendimizTeslimmi ? '' : mustKod,
			araciKod: kendimizTeslimmi ? '' : teslimEdenCariKod
		});
		if (stokmu) { $.extend(fis, { cYerKod, gYerKod }) }
		return this
	}
}
class SablonluSiparisDetayTemplate extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static getStokText(det) {
		let {shKod: stokKod, shAdi: stokAdi} = det;
		return stokKod || stokAdi ? new CKodVeAdi([stokKod, stokAdi]).parantezliOzet({ styled: true }) : ''
	}
	static constructor(e) {
		let {det} = e; for (let key of ['grupSayac', 'grupSeq', 'grupAdi']) { det[key] = e[key] ?? det[key] }
		det.stokText = this.getStokText(det)
	}
	static pTanimDuzenle({ fisSinif, pTanim }) {
		$.extend(pTanim, { devreDisimi: new PInstBitBool() })
	}
	static hostVarsDuzenle({ det, hv }) { }
	static setValues({ det, rec }) {
		let {grupsayac: grupSayac, grupadi: grupAdi, bdevredisi: devreDisimi} = rec;
		$.extend(det, { grupSayac, grupAdi, devreDisimi });
		det.stokText = this.getStokText(det)
	}
}
class SablonluSiparisGridciTemplate extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get fisTemplateSinif() { return SablonluSiparisFisTemplate } static get sablonSinif() { return this.fisTemplateSinif.sablonSinif }
	static gridArgsDuzenle({ gridPart, sender, inst, args }) {
		gridPart ??= sender; let {fis} = gridPart; gridPart.sabit();
		let {onayliTipler} = SiparisFis, {onayTipi} = fis;
		let onaylimi = onayliTipler.includes(onayTipi.char ?? onayTipi);
		$.extend(args, { editable: !onaylimi, rowsHeight: 45, groupsExpandedByDefault: true, editMode: 'click', selectionMode: 'multiplerowsextended' })
	}
	static tabloKolonlariDuzenle_ilk({ tabloKolonlari }) {
		tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'grupAdi', text: 'Grup Adı', genislikCh: 20 }).hidden(),
			new GridKolon({ belirtec: 'stokText', text: 'Ürün/Hizmet', genislikCh: 60, filterable: false }).readOnly(),
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', genislikCh: 13, groupable: false,
				cellValueChanged: e => {
					let {sender: gridPart, gridWidget, rowIndex, belirtec, value} = e, {kontrolcu} = gridPart;
					let rec = gridWidget.getrowdata(rowIndex), orj = rec._orj = rec._orj ?? {};
					if (orj[belirtec] === undefined) { orj[belirtec] = rec[belirtec] }
					rec._degistimi = (orj[belirtec] || 0) != value;
					kontrolcu.miktarFiyatDegisti(e)
					/*gridWidget.beginupdate(); gridWidget.endupdate(false); gridWidget.ensurerowvisible(rowIndex)*/
				},
				cellBeginEdit: (colDef, rowIndex, belirtec, colType, value, result) => {
					let {gridWidget} = colDef.gridPart, det = gridWidget.getrowdata(rowIndex);
					return !det.devreDisimi
				},
				cellsRenderer: (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
					if (belirtec == 'miktar' && !value) {
						let {paketIcAdet, devreDisimi} = rec;
						if (paketIcAdet && !devreDisimi) {
							let content = `<div class="full-wh lightgray">
								<span class="etiket">Pk:</span>
								<span class="veri bold">${numberToString(paketIcAdet)}</span>
							</div>`;
							html = changeTagContent(html, content)
						}
					}
					return html
				},
				validation: (colDef, cell, value) => {
					value = asFloat(value);
					if (value < 0 || value >= 1_000_000) {
						return ({ result: false, message: `<b>Miktar</b> <u>0'dan büyük</u> ve <u>geçerli</u> bir değer olmalıdır` }) }
					return true
				},
			}).tipDecimal().sifirGosterme(),
			new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5 }).readOnly()
		]);
		for (let {belirtec, etiket: text, mfSinif} of HMRBilgi.hmrIter_ekOzellik()) {
			tabloKolonlari.push(new GridKolon({ belirtec, text, genislikCh: 20, filterType: 'checkedlist' }).readOnly()) }
	}
	static tabloKolonlariDuzenle_ara({ tabloKolonlari }) {
		let {params} = app, {sabit: iskSayi} = params.fiyatVeIsk?.iskSayi;
		let {webSiparis_sonStokGosterilirmi, webSiparis_ayOnceSayisi} = params.web;
		tabloKolonlari.push(...[
			(webSiparis_sonStokGosterilirmi ? new GridKolon({ belirtec: 'sonStokBilgi_genel', text: 'Son Stok', genislikCh: 13, groupable: false }).readOnly().alignRight() : null),
			(webSiparis_sonStokGosterilirmi ? new GridKolon({ belirtec: 'sonStokBilgi_kendiDeposu', text: 'S. (<span class=royalblue>Müşteri</span>)', genislikCh: 13, groupable: false }).readOnly().alignRight() : null),
			(webSiparis_ayOnceSayisi ? new GridKolon({ belirtec: 'onceMiktarBilgi', text: 'Önceki', genislikCh: 13, groupable: false }).readOnly().alignRight() : null),
			new GridKolon({ belirtec: 'fiyat', text: 'Fiyat', genislikCh: 13, groupable: false }).readOnly().tipDecimal_fiyat().sifirGosterme(),
			new GridKolon({ belirtec: 'brutBedel', text: 'Brüt Bedel', genislikCh: 13, groupable: false }).readOnly().tipDecimal_bedel().sifirGosterme(),
			(iskSayi ? new GridKolon({
				belirtec: 'iskOranlar', text: `İsk.`, genislikCh: 13, groupable: false,
				cellsRenderer: (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
					let result = []; for (let i = 1; i <= iskSayi; i++) {
						let value = rec[`iskOran${i}`]; if (value) { result.push(value) } }
					return changeTagContent(html, result.length ? `%${result.join(' + ')}` : '')
				}
			}).readOnly().sifirGosterme() : null)?.readOnly(),
			new GridKolon({ belirtec: 'netBedel', text: 'Net Bedel', genislikCh: 13, groupable: false }).readOnly().tipDecimal_bedel().sifirGosterme()
		].filter(x => !!x))
	}
	static tabloKolonlariDuzenle_son({ tabloKolonlari }) {
		let cellClassName = (colDef, rowIndex, belirtec, value, _rec) => {
			let {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex);
			let result = [belirtec], {_degistimi: degistimi, devreDisimi} = rec;
			if (devreDisimi) { result.push('grid-readOnly', 'bg-gray', 'lightgray', 'strikeout') }
			else if (belirtec == 'miktar' && degistimi) { result.push('bg-lightgreen') }
			return result
		};
		for (let colDef of tabloKolonlari) {
			let {cellClassName: _cellClassName} = colDef;
			colDef.cellClassName = (...args) =>
				[..._cellClassName?.call(...args), ...cellClassName(...args) ].flat().join(' ')
		}
	}
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
	static miktarFiyatDegisti({ sender: gridPart, gridWidget, rowIndex, belirtec, gridRec: det, value }) {
		let {belirtec2Kolon, fis} = gridPart, {paketIcAdet} = det;
		det._degistimi = true;
		if (belirtec == 'miktar' && paketIcAdet) {
			let {brm} = det, {fra} = belirtec2Kolon[belirtec].tip ?? {};
			if (brm) { fra = Math.max(fra, app.params.stokBirim.brmDict[brm].fra) }
			if (typeof value != 'number') { value = asFloat(value) }
			value = det.miktar = roundToFra(Math.ceil(value / paketIcAdet) * paketIcAdet, fra);
			det.bedelHesapla({ fis })
		}
		setTimeout(() => {
			let {selectedRowIndex, selectedBelirtec} = gridPart; selectedBelirtec ||= belirtec;
			if (selectedRowIndex > -1 && selectedRowIndex != rowIndex && belirtec2Kolon[selectedBelirtec].isEditable) {
				gridWidget.begincelledit(selectedRowIndex, selectedBelirtec) }
		}, 70)
		/* gridWidget.render(); gridWidget.ensurerowvisible(rowIndex) */
	}
}
