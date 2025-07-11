class SablonluSiparisFisTemplate extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sablonSinif() { return MQSablonOrtak }
	static getUISplitHeight({ islem }) { return 170 + ($(window).width() < 1300 ? 90 : 0) + (islem == 'onayla' || islem == 'sil' ? 65 : 0) }
	static get numaratorGosterilirmi() { return false } static get dipGirisYapilirmi() { return false }
	static constructor({ fis }) {
		let {web} = app.params, {otoTeslimTarihi_gunEk} = web;
		if (otoTeslimTarihi_gunEk) { fis.baslikTeslimTarihi = fis.tarih.clone().addDays(otoTeslimTarihi_gunEk) }
		/* fis.yerKod = app.gecerliDepolar?.[0] || fis.yerKod */
	}
	static pTanimDuzenle({ fisSinif, pTanim }) {
		$.extend(pTanim, {
			sablonSayac: new PInstNum('sablonsayac'), onayTipi: new PInstStr({ rowAttr: 'onaytipi', init: () => 'BK' }),
			klFirmaKod: new PInstStr(), teslimOrtakdir: new PInstBitTrue('bteslimortakdir'),
			teslimCariKod: new PInstStr()
		})
	}
	static rootFormBuilderDuzenle({ fisSinif, builders, sender: gridPart, islem /* , inst */ }) {
		fisSinif.rootFormBuilderDuzenle_numarator(...arguments);
		let {root: rfb, baslikForm: fbd_baslikForm} = builders, {builders: baslikFormlar} = fbd_baslikForm;
		let {konsinyemi} = fisSinif, {grid, gridWidget, layout} = gridPart;
		rfb.addStyle(e =>
			`/*$elementCSS .islemTuslari { position: absolute !important; top: 3px !important }*/
			 $elementCSS .grid [role = row] > .sonStokBilgi > *,
				 $elementCSS .grid [role = row] > .sonStokBilgi_kendiDeposu > * { font-size: 90% !important; margin-top: 3px !important; line-height: 23px !important }
		`);
		/* rfb.vazgecIstendi = e => false; */
		let updateHeader = async e => {
			e = e ?? {}; let fbd = e.builder ?? gridPart.fbd_baslikBilgi;
			let {altInst: inst, layout} = fbd; await this.teslimCariKodBelirle({ fis: inst });
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
				let {altInst: inst} = fbd, {tarih, subeKod, mustKod, sablonSayac, klFirmaKod, teslimCariKod} = inst, css = `gap: 50px`;
				return $(`<div class="full-width">
					<div class="flex-row" style="${css}">
						<div class="tarih _row flex-row"><div class="etiket">Tarih</div><div style="margin-right: 10px"></div><div class="veri">${dateToString(inst.tarih) || ''}</div></div>
						<div class="sablon _row flex-row"><div class="etiket">Şablon</div><div class="veri">${sablonSayac || ''}</div></div>
						${konsinyemi ? `<div class="klFirma _row flex-row"><div class="etiket">KL Firma</div><div class="veri">${klFirmaKod || ''}</div></div>` : ''}
					</div>
					<div class="flex-row" style="${css}">
						${mustKod ? `<div class="must _row flex-row"><div class="etiket">Müşteri</div><div class="veri">${mustKod?.trim() || ''}</div></div>` : ''}
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
				for (let sent of stm.getSentListe()) { sent.where.degerAta(mustKod, `${aliasVeNokta}must`) }
			})
			.degisince(({ builder: fbd }) => updateHeader());
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
	static loadServerData_queryDuzenle({ fisSinif, sent }) {
		/*let {tableAlias: alias, mustSaha} = fisSinif, {sahalar} = sent;
		sahalar.addWithAlias(alias, 'sablonsayac', mustSaha)*/
	}
	static async yukleSonrasiIslemler(e) { return await this.sablonYukleVeBirlestir({ ...e }) }
	static async sablonYukleVeBirlestir(e) {
		let {fis, islem, belirtec} = e, {sablonSayac, tarih, subeKod, mustKod} = fis;
		if (!mustKod) { throw { isError:  true, errorText: `<b>Müşteri</b> seçilmelidir` } }
		let {detaySinif, konsinyemi} = fis.class; islem = islem || belirtec;
		let yenimi = islem == 'yeni', onaylaVeyaSilmi = (islem == 'onayla' || islem == 'sil');
		tarih = fis.tarih = tarih || today();
		let {numarator} = fis, {numTipKod} = fis.class; if (numarator) { numarator.belirtec = 'W' }
		/*numSayac = app.param.web.x;
		if (numSayac) {
			let sent = new MQSent({
				from: 'tnumara', where: [{ degerAta: numTipKod, saha: 'tip' }, { degerAta: numSayac, saha: 'sayac' }],
				sahalar: ['belirtec']
			})
			let belirtec = await app.sqlExecTekilDeger(sent);
			if (belirtec) { numarator.belirtec = belirtec }
		}*/
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
		let stokKodListe = recs?.map(({ shkod }) => shkod), izinliStokKodSet = null;
		if (stokKodListe?.length) {
			let tables = await app.sqlGetTables();
			if (tables.pzmusturunfis) {
				let sent = new MQSent(), {where: wh, sahalar} = sent;
				sent.fisHareket('pzmusturunfis', 'pzmusturundetay'); sahalar.add('har.stokkod stokKod');
				wh.add(`fis.devredisi = ''`).degerAta(mustKod, 'fis.mustkod').inDizi(stokKodListe, 'har.stokkod');
				izinliStokKodSet = asSet((await app.sqlExecSelect(sent)).map(({ stokKod }) => stokKod));
				if ($.isEmptyObject(izinliStokKodSet)) { izinliStokKodSet = null }
			}
			if (tables.hizlisablonkisit) {
				let {sablonDefKisit} = app.params.web, {sube: defKisit_sube, musteri: defKisit_musteri} = sablonDefKisit;
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
				) { recs = null }
				else {
					let _izinliStokKodSet = {}; for (let xSet of Object.values(tip2StokKodSet)) {
						if (!$.isEmptyObject(xSet)) { $.extend(_izinliStokKodSet, xSet) } }
					if (izinliStokKodSet) {
						for (let key of Object.keys(izinliStokKodSet)) {
							if (!_izinliStokKodSet[key]) { delete izinliStokKodSet[key] } }
					}
					else { izinliStokKodSet = _izinliStokKodSet }
					if (!(defKisit_sube || defKisit_musteri) && $.isEmptyObject(izinliStokKodSet)) { izinliStokKodSet = null }
				}
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
			let _e = { grupSayac: rec.grupsayac, grupSeq: rec.grupseq, grupAdi: rec.grupadi, shKod, shAdi: rec.shadi };
			let det = new detaySinif(_e);
			for (let {belirtec, ioAttr, adiAttr, rowAttr, rowAdiAttr} of ekOzellikler) {
				let kod = rec[rowAttr], aciklama = rec[rowAdiAttr]; if (kod === undefined) { continue }
				det[ioAttr] = kod; det[adiAttr] = aciklama; det[belirtec] = kod ? `<b>(${kod})</b> ${aciklama}` : ''
			}
			let anahStr = getAnahStr(rec); anah2Det[anahStr] = anah2Det[anahStr] ?? det
		}
		let {detaylar} = fis; for (let det of detaylar) {
			let anahStr = getAnahStr(det), sabDet = anah2Det[anahStr]; if (!sabDet) { continue }
			if (!sabDet._initFlag) { $.extend(sabDet, { ...det.deepCopy() }) } else { sabDet.miktar += det.miktar }
			sabDet._initFlag = true
		}
		detaylar = Object.values(anah2Det); if (onaylaVeyaSilmi) { detaylar = detaylar.filter(({ miktar }) => !!miktar) }
		fis.detaylar = detaylar;
		let stokKod2Detaylar = {}; for (let det of detaylar) {
			if (det._initFlag) { continue }
			(stokKod2Detaylar[det.shKod] = stokKod2Detaylar[det] ?? []).push(det)
		}
		stokKodListe = Object.keys(stokKod2Detaylar); kosulYapilar = await kosulYapilar;
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
		let {gecerliDepolar: yerKodListe} = app;
		let {webSiparis_sonStokGosterilirmi, webSiparis_ayOnceSayisi: ayOnceSayisi} = app.params.web;
		let _e = { ...e, getAnahStr, anah2Det, ekOzellikler };
		if (webSiparis_sonStokGosterilirmi && await app.sqlHasColumn('carmst', 'konsinyeyerkod')) {
			await this.detaylariDuzenle_sonStok({ ..._e, yerKodListe });
			await this.detaylariDuzenle_sonStok({
				..._e, ioAttrPostfix: '_kendiDeposu',
				yerKodListe: async () => {
					let sent = new MQSent({ from: 'carmst', sahalar: 'konsinyeyerkod' }), {where: wh} = sent;
					wh.degerAta(fis.mustKod, 'must');
					return (await app.sqlExecTekilDeger(sent))?.trimEnd()
				}
			})
		}
		if (ayOnceSayisi) { await this.detaylariDuzenle_oncekiMiktar(_e) }
	}
	static async detaylariDuzenle_sonStok({ mfSinif: sablonSinif, fis, islem, belirtec, getAnahStr, anah2Det, ekOzellikler, yerKodListe, ioAttrPrefix, ioAttrPostfix }) {
		let {sonStokDB} = app;
		let yenimi = islem == 'yeni'; /*, onaylaVeyaSilmi = (islem == 'onayla' || islem == 'sil') */
		sablonSinif = sablonSinif?.sablonSinif ?? sablonSinif;    /* detaySinif gelirse (detaySinif.sablonSinif) */
		let {fisSiniflar} = sablonSinif, {sayac: fisSayac, class: buFisSinif, detaylar} = fis;
		let stokKodSet = asSet(detaylar.map(det => det.shKod));
		if (isFunction(yerKodListe)) { yerKodListe = await yerKodListe.call(this, ...arguments) }
		yerKodListe = yerKodListe ? $.makeArray(yerKodListe) : []; ioAttrPrefix ??= ''; ioAttrPostfix ??= '';
		let uni = new MQUnionAll();
		{
			let sent = new MQSent(), {where: wh, sahalar} = sent;
			sent.fromAdd(`${sonStokDB}..sonstok`);
			wh.add(`opno IS NULL` /*, `ozelisaret <> '*'`*/)
				.inDizi(Object.keys(stokKodSet), 'stokkod')
				.inDizi(yerKodListe, 'yerkod');
			sahalar.add(
				'stokkod',
				...ekOzellikler.filter(({ rowAttr }) => rowAttr).map(({ rowAttr }) => `NULL ${rowAttr}`),
				'SUM(sonmiktar) sonstok', 'SUM(sonmiktar) olasi'
			);
			sent.groupByOlustur(); uni.add(sent)
		}
		for (let fisSinif of fisSiniflar) {
			let {table, tsStokDetayTable: detayTable} = fisSinif, keyHV = fisSinif.varsayilanKeyHostVars();
			let sent = new MQSent(), {where: wh, sahalar} = sent;
			sent.fisHareket(table, detayTable); wh.birlestirDict({ alias: 'fis', dict: keyHV });
			wh.fisSilindiEkle().add(`fis.kapandi = ''` /*, `fis.ozelisaret <> '*'`*/);
			wh.inDizi(Object.keys(stokKodSet), 'har.stokkod');
			if (fisSayac && fisSinif == buFisSinif) { wh.add(`fis.kaysayac <> ${fisSayac.sqlServerDegeri()}`) }
			sahalar.add(
				'har.stokkod',
				...ekOzellikler.filter(({ rowAttr }) => rowAttr).map(({ rowAttr }) => `har.${rowAttr}`),
				'0 sonstok', 'SUM(0 - har.miktar) olasi'
			);
			sent.groupByOlustur(); uni.add(sent)
		}
		let stm = uni.asToplamStm(), recs = await app.sqlExecSelect(stm);
		for (let rec of recs) {
			let anahStr = getAnahStr(rec), det = anah2Det[anahStr]; if (!det) { continue }
			let {sonstok: sonStok, olasi: olasiMiktar} = rec;
			let cssColor = {
				olasiMiktar: olasiMiktar > 0 ? 'forestgreen' : olasiMiktar < 0 ? 'firebrick' : 'gray',
				sonStok: 'lightgray'
			};
			let sonStokBilgi = [
				(olasiMiktar ? `<div class="item olasiMiktar"><span class="etiket gray">O:</span> <span class="veri bold ${cssColor.olasiMiktar}">${numberToString(olasiMiktar)}</span><div>` : null),
				(sonStok ? `<div class="item sonStok"><span class="etiket lightgray">S:</span> <span class="veri bold ${cssColor.sonStok}">${numberToString(sonStok)}</span><div>` : null)
			].filter(x => !!x).join(CrLf);
			let tRec = { sonStok, olasiMiktar, sonStokBilgi }, _rec = {};
			for (let [key, value] of Object.entries(tRec)) {
				key = `${ioAttrPrefix}${key}${ioAttrPostfix}`;
				_rec[key] = value
			}
			$.extend(det, _rec)
		}
	}
	static async detaylariDuzenle_oncekiMiktar({ mfSinif: sablonSinif, fis, islem, belirtec, getAnahStr, anah2Det, ekOzellikler }) {
		let {params} = app, {webSiparis_ayOnceSayisi: ayOnceSayisi} = params.web;
		let yenimi = islem == 'yeni'; /*, onaylaVeyaSilmi = (islem == 'onayla' || islem == 'sil') */
		sablonSinif = sablonSinif?.sablonSinif ?? sablonSinif;    /* detaySinif gelirse (detaySinif.sablonSinif) */
		let fisSinif = SatisFaturaFis, {fisSiniflar} = sablonSinif, {sayac: fisSayac, class: buFisSinif, tarih, mustKod, detaylar} = fis;
		let stokKodSet = asSet(detaylar.map(det => det.shKod));
		let onceTarih = tarih.clone().addMonths(-ayOnceSayisi);
		let sent = new MQSent(), {where: wh, sahalar} = sent;
		sent.fisHareket('piffis', 'pifstok')
		/*sent.fisHareket(table, detayTable); wh.birlestirDict({ alias: 'fis', dict: keyHV });*/
		wh.fisSilindiEkle().add(`fis.kapandi = ''` /*, `fis.ozelisaret <> '*'`*/);
		wh.add(`fis.piftipi = 'F'`, `fis.almsat = 'T'`, `fis.iade = ''`);
		wh.add(`fis.tarih >= ${onceTarih.sqlServerDegeri()}`);
		wh.degerAta(mustKod, 'must');
		wh.inDizi(Object.keys(stokKodSet), 'har.stokkod');
		if (fisSayac && fisSinif == buFisSinif) { wh.add(`fis.kaysayac <> ${fisSayac.sqlServerDegeri()}`) }
		sahalar.add(
			'har.stokkod',
			...ekOzellikler.filter(({ rowAttr }) => rowAttr).map(({ rowAttr }) => `har.${rowAttr}`),
			'SUM(har.miktar) onceMiktar'
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
	static kaydetOncesiIslemler({ fis }) { this.teslimCariKodBelirle(...arguments) }
	static hostVarsDuzenle({ fis, hv }) { if (fis.class.ticarimi) { hv.teslimcarikod = fis.teslimCariKod } }
	static setValues({ fis, rec }) { if (fis.class.ticarimi) { fis.teslimCariKod = rec.teslimcarikod } }
	static uiDuzenle_fisGirisIslemTuslari(e) { /* super yok */ }
	static async teslimCariKodBelirle({ fis }) {
		let {konsinyemi} = fis.class, {klFirmaKod} = fis;
		if (!(konsinyemi && klFirmaKod)) { fis.teslimCariKod = ''; return null }
		let {sablonSayac, mustKod, sevkAdresKod} = fis, sent = new MQSent(), {where: wh, sahalar} = sent;
		sent.fromAdd('kldagitim dag').fromIliski('klfirma dfir', 'dag.klfirmakod = dfir.kod');
		wh.degerAta(klFirmaKod, 'dag.klfirmakod').degerAta(mustKod, 'dag.mustkod')
		wh.add(new MQOrClause([
			`dag.sevkadreskod = ''`,
			(sevkAdresKod ? { degerAta: sevkAdresKod, saha: 'dag.sevkadreskod' } : null)
		].filter(x => !!x)));
		sahalar.add(`(case dag.bkendimizteslim when 0 then '' else dag.klteslimatcikod end) teslimCariKod`);
		return fis.teslimCariKod = await app.sqlExecTekilDeger(sent)
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
		let {params} = app, {sabit: iskSayi} = params.fiyatVeIsk?.iskSayi;
		let {webSiparis_sonStokGosterilirmi, webSiparis_ayOnceSayisi} = params.web;
		tabloKolonlari.push(...[
			(webSiparis_sonStokGosterilirmi ? new GridKolon({ belirtec: 'sonStokBilgi', text: 'Son Stok', genislikCh: 13, groupable: false }).readOnly() : null),
			(webSiparis_sonStokGosterilirmi ? new GridKolon({ belirtec: 'sonStokBilgi_kendiDeposu', text: 'S. (<span class=royalblue>Bu Yer</span>)', genislikCh: 13, groupable: false }).readOnly() : null),
			(webSiparis_ayOnceSayisi ? new GridKolon({ belirtec: 'onceMiktarBilgi', text: 'Önceki Miktarlar', genislikCh: 13, groupable: false }).readOnly() : null),
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
