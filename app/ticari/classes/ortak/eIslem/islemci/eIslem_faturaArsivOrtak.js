class EIslFaturaArsivOrtak extends EIslemOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'EA' } static get paramSelector() { return 'eFatura' }
	static get xmlRootTag() { return 'Invoice' } static get xmlDetayTag() { return 'cac:InvoiceLine' }
	get gondericiBilgi() { return app.params.isyeri } get aliciBilgi() { return this.baslik.aliciBilgi }
	static getUUIDStm(e) {
		e = e || {}; const gelenmi = e.gelen ?? e.gelenmi, ps2SayacListe = getFuncValue.call(this, e.ps2SayacListe || e.psTip2SayacListe, e) || {};
		let {whereDuzenleyici: genelWhereDuzenleyici, sentDuzenleyici: genelSentDuzenleyici, stmDuzenleyici: genelStmDuzenleyici} = e, stm;
		if (gelenmi) {
			let psTip = 'P', buSayaclar = ps2SayacListe[psTip]; let sent = new MQSent({
				from: 'efgecicialfatfis fis',
				sahalar: [`'${psTip}' pstip`, 'fis.kaysayac fissayac', 'fis.efuuid uuid', 'fis.efbelge efayrimtipi', 'fis.tarih', 'fis.effatnox fisnox']
			});
			if (buSayaclar || genelWhereDuzenleyici) {
				if (buSayaclar) { sent.where.inDizi(buSayaclar, 'fis.kaysayac') }
				if (genelWhereDuzenleyici) { getFuncValue.call(this, genelWhereDuzenleyici, { ...e, psTip, table, uni, sent, where: sent.where }) }
			}
			else if (!$.isEmptyObject(ps2SayacListe)) { return null }
			sent.gereksizTablolariSil(); stm = new MQStm({ sent })
		}
		else {
			let uni = new MQUnionAll(), psTipVeYapilar = [
				{ psTip: 'P', table: 'piffis', whereDuzenleyici: e => e.where.add(`fis.ayrimtipi <> 'IN'`) },
				{ psTip: 'S', table: 'sipfis', whereDuzenleyici: e => e.where.addAll(`fis.ayrimtipi = 'EM'`, `fis.ozeltip = 'E'`) },
			];
			for (let {psTip, table, whereDuzenleyici} of psTipVeYapilar) {
				let buSayaclar = ps2SayacListe[psTip], sent = new MQSent({
					from: `${table} fis`, where: [`fis.efayrimtipi IN ('E', 'A', '')`, new MQOrClause([`(fis.almsat = 'T' AND fis.iade = '')`, `(fis.almsat = 'A' AND fis.iade = 'I')` ]) ],
					sahalar: [`'${psTip}' pstip`, 'fis.kaysayac fissayac', 'fis.efatuuid uuid', 'fis.efayrimtipi', 'fis.tarih', 'fis.fisnox']
				});
				sent.fis2CariBagla(); sent.where.fisSilindiEkle();
				if (buSayaclar || genelWhereDuzenleyici) {
					if (buSayaclar) { sent.where.inDizi(buSayaclar, 'fis.kaysayac') }
					if (whereDuzenleyici || genelWhereDuzenleyici) {
						let _e = { ...e, psTip, table, uni, sent, where: sent.where };
						if (whereDuzenleyici) { getFuncValue.call(this, whereDuzenleyici, _e) }
						if (genelWhereDuzenleyici) { getFuncValue.call(this, genelWhereDuzenleyici, _e) }
					}
				}
				else if (!$.isEmptyObject(ps2SayacListe)) { continue }
				if (genelSentDuzenleyici) { getFuncValue.call(this, genelSentDuzenleyici, { ...e, psTip, table, uni, sent, where: sent.where }) }
				sent.gereksizTablolariSil(); uni.add(sent)
			}
			stm = $.isEmptyObject(uni.liste) ? null : new MQStm({ sent: uni })
		}
		if (stm && genelStmDuzenleyici) {
			(() => {
				const _e = $.extend({}, e, { psTip, table, stm, uni, sent, where: sent.where });
				getFuncValue.call(this, genelStmDuzenleyici, _e)
			})()
		}
		return stm
	}
	static getEFisBaslikVeDetayStm(e) {
		e = e || {}; const ps2SayacListe = getFuncValue.call(this, e.ps2SayacListe || e.psTip2SayacListe, e) || {};
		const genelWhereDuzenleyici = e.whereDuzenleyici, uni = new MQUnionAll(); let sent, psTip, sayacListe;
		const fhBagla = _e => {
			const {psTip, fisTable, harTable} = _e, mustIlClause = `(case when fis.degiskenvknox <> '' then dadr.ilkod else car.ilkod end)`;
			sent = new MQSent(); uni.add(sent); sent.fisHareket({ fisTable: fisTable, harTable: harTable, innerJoin: true });
			sent.fis2TicCariBagla(); sent.fromIliski('degiskenadres dadr', 'fis.degiskenvknox = dadr.vknox');
			sent.fromIliski('naksekli nak', 'fis.nakseklikod = nak.kod'); sent.fromIliski('carmst pls', 'fis.plasiyerkod = pls.must');
			sent.fromIliski('caril cil', `${mustIlClause} = cil.kod`); sent.fromIliski('ulke culk', 'car.ulkekod = culk.kod');
			sent.leftJoin({ alias: 'fis', table: 'tahsilsekli tsek', iliski: [`fis.tahtipi = 'T'`, 'fis.martahsil = tsek.kodno'] });
			sent.leftJoin({ alias: 'fis', table: 'pifbasekaciklama basack', iliski: 'fis.kaysayac = basack.fissayac' });
			sent.leftJoin({ alias: 'fis', table: 'pifdipaciklama dipack', iliski: 'fis.kaysayac = dipack.fissayac' });
			sent.fromIliski('vergihesap kver', 'har.kdvhesapkod = kver.kod'); sent.fromIliski('vergihesap tevver', 'har.dettevhesapkod = tevver.kod');
			sent.fromIliski('vergihesap sver', 'har.stopajhesapkod = sver.kod');
			sent.fisSilindiEkle();
			sent.where.add(`fis.ozelisaret <> '*'`, `fis.efayrimtipi in ('E', 'A', '')`, new MQOrClause([`(fis.almsat = 'T' and fis.iade = '')`, `(fis.almsat = 'A' and fis.iade = 'I')`]));
			sent.where.inDizi(sayacListe, 'fis.kaysayac');
			sent.sahalar.addAll([
				`${MQSQLOrtak.sqlServerDegeri(psTip)} pstip`, `${MQSQLOrtak.sqlServerDegeri(fisTable)} fisTable`, `${MQSQLOrtak.sqlServerDegeri(harTable)} harTable`,
				`fis.bizsubekod`, 'fis.kaysayac fissayac', 'fis.iade', 'fis.ayrimtipi', 'fis.fistipi', 'fis.efayrimtipi', 'fis.tarih', 'fis.fisnox', 'fis.ortalamavade', 'car.earsivbelgetipi',
				`(case fis.ayrimtipi when 'IH' then 'IHRACAT' when 'IK' then 'IHRACKAYITLI' when 'FS' then 'FASON' when 'EM' then 'EMANET' when 'KN' then 'KONSINYE' else '' end) faturaozeltip`,
				`(case when fis.almsat = 'A' and fis.iade = 'I' then '*' else '' end) alimiademi`,
									/* M: TEMEL ; T: TİCARİ ; K: KAMU */
				`(case when fis.degiskenvknox <> '' then 'M' else dbo.emptycoalesce(car.efatsenaryotipi, 'M') end) carsenaryo`,
				`car.efatyontem genelyontem`, `car.efozelyontemkod ozelyontem`, 'fis.tahtipi', 'fis.martahsil tahseklino',
				`(case when fis.tahtipi = 'K' then 'Karma Tahsil' else tsek.aciklama end) tahsekliadi`,
				'fis.plasiyerkod', 'fis.nakseklikod', 'fis.zorunluguidstr', 'fis.efatuuid uuid', 'fis.dvkod', 'fis.dvkur', 'fis.net sonucbedel',
				`(case when fis.degiskenvknox <> '' then fis.degiskenvknox else fis.ticmust end) mustkod`,
				`(case when fis.degiskenvknox <> '' then dadr.birunvan when fis.must = '' and fis.ayrimtipi = 'PR' then 'Muhtelif Müşteri' else car.birunvan end) unvan`,
				`(case when fis.degiskenvknox <> '' then dadr.biradres else car.biradres end) adres`,
				`(case when fis.degiskenvknox <> '' then dadr.yore else car.yore end) yore`,
				`(case when fis.degiskenvknox <> '' then dadr.posta else car.posta end) posta`,
				`${mustIlClause} ilkod`, 'cil.aciklama iladi', 'car.ulkekod', 'culk.aciklama ulkeadi',
				`(case when fis.degiskenvknox <> '' then (case when dadr.sahismi = '' then fis.degiskenvknox else '' end)
						when fis.must = '' and fis.ayrimtipi = 'PR' then ''
						else car.vnumara end) vkn`,
				`(case when fis.degiskenvknox <> '' then (case when dadr.sahismi <> '' then fis.degiskenvknox else '' end)
						when fis.must = '' and fis.ayrimtipi = 'PR' then ${MQSQLOrtak.sqlServerDegeri(TCKimlik.perakendeVKN)}
						else car.tckimlikno end) tckn`,
				`(case when fis.degiskenvknox <> '' then dadr.sahismi
						when fis.must = '' and fis.ayrimtipi = 'PR' then '*' else car.sahismi
					end) sahismi`,
				`(case when fis.degiskenvknox <> '' then dadr.vdaire else car.vdaire end) vergidairesi`,
				`(case when fis.degiskenvknox <> '' then '' else car.ticaretsicilno end) ticsicilno`,
				`(case when fis.degiskenvknox <> '' then '' else car.mersisno end) mersisno`,
				`(case when fis.degiskenvknox <> '' then dadr.efatgibalias else car.efatgibalias end) gibalias`,
				`(case when fis.degiskenvknox <> '' then '' else car.webadresi end) webadresi`,
				'pls.birunvan plasiyeradi', 'nak.aciklama naksekliadi', 'car.musrefkod', 'car.kondepomu',
				`fis.tlacikhesap tlbakiye`, `fis.tloncekibakiye`, `fis.dvacikhesap dvbakiye`, `fis.dvoncekibakiye`,
				'fis.refstrnox refnox', /*'fis.borsatescilvarmi', 'fis.kunyenox',*/ 'basack.basaciklama', 'dipack.aciklama dipaciklama',
				'har.seq', 'har.miktar', 'har.fiyat', 'har.dvfiyat', 'har.brutbedel', 'har.dvbrutbedel', 'har.bedel', 'har.dvbedel',
				'har.ekaciklama', 'har.detkdvekvergitipi', 'har.detistisnakod', 'har.perkdv', 'kver.kdvorani', 'har.perstopaj', 'sver.stopajorani',
				'tevver.kdvtevoranx', 'tevver.kdvtevoranpay', 'tevver.tevislemturu', 'har.pertevkifat'
			]);
			if (genelWhereDuzenleyici) {
				const __e = $.extend({}, _e, { psTip, fisTable, harTable, uni, sent, where: sent.where });
				getFuncValue.call(this, genelWhereDuzenleyici, _e)
			}
			return this
		};
		const stokBagla = () => {
			sent.har2StokBagla();
			sent.stok2BarkodBagla();
			sent.fromIliski('vergihesap otver', 'har.otvhesapkod = otver.kod');
			sent.leftJoin({ alias: 'har', from: 'pzmusturunfis mref', on: 'fis.ticmust = mref.mustkod' });
			sent.leftJoin({ alias: 'mref', from: 'pzmusturundetay mdet', on: ['mref.kaysayac = mdet.fissayac', 'har.stokkod = mdet.stokkod'] });
			sent.sahalar.addAll(
				`'S' kayittipi`, 'sbar.refkod barkod', 'har.stokkod shkod', 'stk.aciklama shadi', 'stk.aciklama2 shadi2',
				'stk.brm', 'stk.brm2', 'stk.gtipkod', 'har.miktar2', 'har.koli', 'har.fiyatveritipi',
				'mdet.refkod stokrefkod', 'mdet.refadi stokrefadi', 'otver.otvorani', 'har.perotv'
			);
			for (const item of HMRBilgi.hmrIter()) {
				const {rowAttr} = item;
				sent.sahalar.add(`har.${rowAttr}`)
			}
			for (const item of TicIskYapi.getIskIter()) {
				const {rowAttr} = item;
				sent.sahalar.add(`har.${rowAttr}`)
			}
			return this
		};
		const hizmetBagla = () => {
			sent.har2HizmetBagla();
			sent.sahalar.addAll(
				`'H' kayittipi`, `NULL barkod`, 'har.hizmetkod shkod', 'hiz.aciklama shadi', 'hiz.aciklama2 shadi2',
				'hiz.brm', `'' brm2`, `'' gtipkod`, `0 miktar2`, `0 koli`, `'' fiyatveritipi`,
				'NULL stokrefkod', 'NULL stokrefadi', '0 otvorani', '0 perotv',
			);
			for (const item of HMRBilgi.hmrIter()) {
				const {numerikmi, rowAttr} = item;
				sent.sahalar.add(`${numerikmi ? '0' : `''`} ${rowAttr}`)
			}
			for (const item of TicIskYapi.getIskIter()) {
				const {rowAttr} = item;
				sent.sahalar.add(`har.${rowAttr}`)
			}
			return this
		};

		psTip = 'P';
		sayacListe = ps2SayacListe[psTip];
		if (sayacListe) {
			fhBagla({ psTip: psTip, fisTable: 'piffis', harTable: 'pifstok' });
			sent.where.add(`fis.ayrimtipi NOT IN ('FS', 'IN')`);				// PR -magaza da alinir
			stokBagla();

			fhBagla({ psTip: psTip, fisTable: 'piffis', harTable: 'pifhizmet' });
			sent.where.add(`fis.ayrimtipi NOT IN ('FS', 'IN', 'PR')`);
			hizmetBagla();

			fhBagla({ psTip: psTip, fisTable: 'piffis', harTable: 'piffsstok' });				// sadece fason olanlar
			sent.where.add(`fis.ayrimtipi = 'FS'`);
			hizmetBagla()
		}
		psTip = 'S';
		sayacListe = ps2SayacListe[psTip];
		if (sayacListe) {
			fhBagla({ psTip: psTip, fisTable: 'sipfis', harTable: 'sipstok' });
			sent.where.addAll(`fis.ayrimtipi = 'EM'`, `fis.ozeltip = 'E'`);
			stokBagla();
		}
		return $.isEmptyObject(uni.liste) ? null : new MQStm({ sent: uni, orderBy: ['tarih', 'pstip', 'fisnox', 'fissayac', 'seq'] })
	}
	static tipIcinFislerEkDuzenlemeYapDevam(e) {
		super.tipIcinFislerEkDuzenlemeYapDevam(e); const {yukleIslemi, promises} = e; promises.push(
			yukleIslemi({
				stm: e => this.getDetayAciklamaStm(e), seviyelendirici: e => seviyelendirAttrGruplari({ source: e.recs, attrGruplari: [['pstip', 'fissayac']] }),
				yukleyici: e => e.eFis.detayAciklamalarYukle($.extend({}, e, { recs: e.detaylar }))
			}),
			yukleIslemi({
				stm: e => this.getDipAciklamaStm(e), seviyelendirici: e => seviyelendirAttrGruplari({ source: e.recs, attrGruplari: [['pstip', 'fissayac']] }),
				yukleyici: e => e.eFis.dipAciklamaYukle($.extend({}, e, { recs: e.detaylar }))
			}),
			yukleIslemi({
				stm: e => this.getDipEIcmalStm(e), seviyelendirici: e => seviyelendirAttrGruplari({ source: e.recs, attrGruplari: [['pstip', 'fissayac']] }),
				yukleyici: e => e.eFis.dipEIcmalYukle($.extend({}, e, { recs: e.detaylar }))
			}),
			yukleIslemi({ stm: e => this.getOzelYontemStm(e), yukleyici: e => this.ozelYontemYukle({ ...e }) }),
			yukleIslemi({
				stm: e => this.getOncekiIrsTSNStm(e), seviyelendirici: e => seviyelendirAttrGruplari({ source: e.recs, attrGruplari: [['pstip', 'fissayac']] }),
				yukleyici: e => e.eFis.oncekiIrsTSNYukle($.extend({}, e, { recs: e.detaylar }))
			})
		)
	}
	static getDetayAciklamaStm(e) {
		let stm, uni;
		const fhBagla = _e => {
			const {harTable, fisSayaclar, psTip} = _e;
			const sent = new MQSent({
				from: harTable,
				where: [{ inDizi: fisSayaclar, saha: 'fissayac' }],
				sahalar: [
					`${MQSQLOrtak.sqlServerDegeri(psTip)} pstip`,
					'fissayac', 'seq', 'aciklama'
				]
			});
			uni.add(sent)
		};
		uni = new MQUnionAll(); stm = new MQStm({ sent: uni });
		const {ps2SayacListe} = e;
		let fisSayaclar = ps2SayacListe.P;
		if (fisSayaclar) fhBagla(({ harTable: 'pifaciklama', fisSayaclar, psTip: 'P' }))
		fisSayaclar = ps2SayacListe.S;
		if (fisSayaclar) fhBagla(({ harTable: 'sipaciklama', fisSayaclar, psTip: 'S' }))
		if ($.isEmptyObject(uni.liste)) return null
		stm.orderBy.addAll('pstip', 'fissayac', 'seq');
		return stm
	}
	detayAciklamalarYukle(e) {
		// 'seq' değerine göre ilgili detaya eklenecektir
		const {recs} = e, {detaylar} = this, seq2Detay = {}; for (const det of detaylar) seq2Detay[det.seq] = det
		for (const rec of recs) {
			let ackSeq = rec.seq, maxSeq = 0; for (const seq in seq2Detay) { if (seq <= ackSeq) maxSeq = Math.max(maxSeq, seq) }
			if (maxSeq) seq2Detay[maxSeq].aciklamaEkle({ aciklama: rec.aciklama })
		}
	}
	static getDipAciklamaStm(e) {
		let stm, uni;
		const fhBagla_baslik = _e => {
			const {harTable, fisSayaclar, psTip} = _e;
			const sent = new MQSent({
				from: harTable, where: [{ inDizi: fisSayaclar, saha: 'fissayac' }],
				sahalar: [`${MQSQLOrtak.sqlServerDegeri(psTip)} pstip`, `'B' alttip`, `0 kayitno`, 'fissayac', 'basaciklama aciklama']
			});
			uni.add(sent)
		};
		const fhBagla_dip = _e => {
			const {harTable, fisSayaclar, psTip} = _e;
			const sent = new MQSent({
				from: harTable,where: [{ inDizi: fisSayaclar, saha: 'fissayac' }],
				sahalar: [`${MQSQLOrtak.sqlServerDegeri(psTip)} pstip`, `'D' alttip`, `0 kayitno`, 'fissayac', 'aciklama']
			});
			uni.add(sent)
		};
		const fhBagla_ekBilgi = _e => {
			const {harTable, fisSayaclar, psTip} = _e;
			const sent = new MQSent({
				from: harTable, where: [{ inDizi: fisSayaclar, saha: 'fissayac' }, `kayittipi IN ('E1', 'E2')` ],
				sahalar: [`${MQSQLOrtak.sqlServerDegeri(psTip)} pstip`, 'kayittipi alttip', 'kayitno', 'fissayac', 'ekbilgi aciklama']
			});
			uni.add(sent)
		};
		uni = new MQUnionAll(); stm = new MQStm({ sent: uni });
		const {ps2SayacListe} = e;
		let psTip = 'P', fisSayaclar = ps2SayacListe[psTip];
		if (fisSayaclar) {
			fhBagla_baslik(({ harTable: 'pifbasekaciklama', fisSayaclar, psTip }));
			fhBagla_dip(({ harTable: 'pifdipaciklama', fisSayaclar, psTip }));
			fhBagla_ekBilgi(({ harTable: 'pifdipekbilgi', fisSayaclar, psTip }))
		}
		psTip = 'S';
		fisSayaclar = ps2SayacListe[psTip];
		if (fisSayaclar) {
			fhBagla_baslik(({ harTable: 'sipbasekaciklama', fisSayaclar, psTip }));
			fhBagla_dip(({ harTable: 'sipdipaciklama', fisSayaclar, psTip }));
			fhBagla_ekBilgi(({ harTable: 'sipdipekbilgi', fisSayaclar, psTip }))
		}
		if ($.isEmptyObject(uni.liste)) { return null }
		stm.orderBy.addAll('pstip', 'fissayac', 'alttip', 'kayitno');
		return stm
	}
	dipAciklamaYukle(e) { const dipNotlar = this.dipNotlar = [], {recs} = e; for (const rec of recs) { dipNotlar.push((rec.aciklama || '').trimEnd()) } }
	static getDipEIcmalStm(e) {
		let stm, uni;
		const fhBagla = _e => {
			const {fisSayaclar, psTip} = _e, fisSayacSaha = psTip == 'S' ? 'sipsayac' : 'pifsayac';
			const sent = new MQSent({
				from: 'dipebilgi', where: [{ inDizi: fisSayaclar, saha: fisSayacSaha }],
				sahalar: [`${MQSQLOrtak.sqlServerDegeri(psTip)} pstip`, `${fisSayacSaha} fissayac`, 'seq', 'xadi', 'xkod', 'hvtip', 'anatip', 'alttip', 'ustoran', 'oran', 'matrah', 'dvmatrah', 'bedel', 'dvbedel']
			});
			uni.add(sent)
		};
		uni = new MQUnionAll(); stm = new MQStm({ sent: uni });
		const {ps2SayacListe} = e;
		let fisSayaclar = ps2SayacListe.P; if (fisSayaclar) { fhBagla(({ fisSayaclar, psTip: 'P' })) }
		fisSayaclar = ps2SayacListe.S; if (fisSayaclar) { fhBagla(({ fisSayaclar, psTip: 'S' })) }
		if ($.isEmptyObject(uni.liste)) { return null }
		stm.orderBy.addAll('pstip', 'fissayac', 'seq');
		return stm
	}
	dipEIcmalYukle(e) { const icmal = this.icmalYoksaOlustur(); icmal.dipEIcmalYukle(e) }
	static getOzelYontemStm(e) { return new MQSent({ from: 'efozelyontem', where: [`kod <> ''`, `silindi = ''`], sahalar: '*' }) }
	static ozelYontemYukle(e) {
		const {recs, temps} = e, ozelYontemKod2Rec = temps.ozelYontemKod2Rec = {};
		for (const rec of recs) { const {kod} = rec; ozelYontemKod2Rec[kod] = rec }
	}
	static getOncekiIrsTSNStm(e) {
		let uni = new MQUnionAll(); const stm = new MQStm({ sent: uni }), {ps2SayacListe} = e;
		let fisSayaclar = ps2SayacListe.P; if (fisSayaclar) {
			const sent = new MQSent({
				from: 'irs2fat don', where: { inDizi: fisSayaclar, saha: 'don.fatsayac' },
				fromIliskiler: [ { from: 'piffis irs', iliski: 'don.irssayac = irs.kaysayac' } ],
				sahalar: [`'P' pstip`, `don.fatsayac fissayac`, 'irs.tarih', 'irs.fisnox nox']
			});
			uni.add(sent)
		}
		if ($.isEmptyObject(uni.liste)) { return null }
		stm.orderBy.addAll('pstip', 'fissayac', 'tarih', 'nox');
		return stm
	}
	oncekiIrsTSNYukle(e) { const {baslik} = this; baslik.oncekiIrsTSNListe = e._detaylar }
	xmlDuzenle_rootElement_ilk(e) {
		super.xmlDuzenle_rootElement_ilk(e); const {xw} = e;
		xw.writeAttributeString('xmlns', 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2')
	}
	xmlDuzenle_rootElement_son(e) {
		const {xw} = e; xw.writeAttributeString('xsi:schemaLocation', 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2 UBL-Invoice-2.1.xsd');
		super.xmlDuzenle_rootElement_son(e)
	}
	async xmlDuzenle_docRefs(e) {
		const {params} = app, {isyeri} = params, param_zorunlu = params.zorunlu, param_stok = params.stok, param_eIslem = params.eIslem, param_eIslemKullanim = param_eIslem.kullanim, param_eIslemKural = param_eIslem.kural;
		const {xw} = e, {baslik, dvKod, dvKur} = this, {eYontem, ortalamavade, plasiyerkod, plasiyeradi, tahsekliadi, faturaOzelTipText, eArsivBelgeTipBelirtec, oncekiIrsTSNListe} = baslik;
		const {sutOnayKodu, tapdkNox} = isyeri.diger; await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Fatura Ek Tipi', value: faturaOzelTipText });
		if (eYontem) { eYontem.xmlDuzenle_docRefs(e) } await this.xmlDuzenleInternal_logoBilgileri(e)
		await super.xmlDuzenle_docRefs(e);
		await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Süt Onay', value: sutOnayKodu }); await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Tapdk No', value: tapdkNox });
		if ($.isEmptyObject(oncekiIrsTSNListe)) { await this.xmlDuzenleInternal_docRef({ xw, type: 'IS_DESPATCH' }) }
		if (eArsivBelgeTipBelirtec) { await this.xmlDuzenleInternal_docRef({ xw, typeCode: 'SEND_TYPE', id: eArsivBelgeTipBelirtec }) }
		if (param_eIslemKullanim.baslikVade) { await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: param_eIslem.faturaVadeEtiket, value: dateToString(asDate(ortalamavade)) }) }
		if (param_eIslemKullanim.baslikPlasiyer) { await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Plasiyer', value: plasiyerkod ? `(${plasiyerkod}) ${plasiyeradi}` : null }) }
		if (param_eIslemKullanim.baslikTahsilatSekli) { await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Tahsil Şekli', value: tahsekliadi }) }
	}
	async xmlDuzenleInternal_logoBilgileri(e) {
		const {xw} = e, {params} = app, param_eIslem = params.eIslem, logocu = await param_eIslem.getLogoData();
		const kod2Tip = { RLOGO: 'FIRMALOGO_IMG', EFIM: 'ISLAKIMZA_IMG', EFKI: 'KASE_IMG' };
		for (const [kod, type] of Object.entries(kod2Tip)) {
			const logo = logocu[kod] || {}, {ext} = logo, imgData = logo.data; if (!imgData) { continue }
			let {mimeType} = logo; if (!mimeType) { mimeType = ext == 'png' ? 'image/png' : ext == 'gif' ? 'image/gif' : 'image/jpeg' }
			await this.xsltDuzenleyiciEkle({ args: { type, imgData }, handler: e => e.result.replaceAll(`[${e.args.type}]`, `data:${mimeType};base64,${imgData}`) });
			await this.xmlDuzenleInternal_docRef({ xw, id: '0', type, typeCode: 'dynamic' })
			/* this.xmlDuzenleInternal_docRef({ xw, id: '0', type, attachment: { mimeType, imgData } }) */
		}
	}
	xmlDuzenle_notes(e) { this.xmlDuzenle_notes_eArsiv(e); this.xmlDuzenle_notes_bakiye(e); super.xmlDuzenle_notes(e) }
	xmlDuzenle_notes_eArsiv({ xw }) {
		let {eArsivBelgeTipBelirtec} = this.baslik;
		if (eArsivBelgeTipBelirtec) { const value = `Gönderim Şekli: ${eArsivBelgeTipBelirtec}`; xw.writeElementString('cbc:Note', escapeXML(value)) }
	}
	xmlDuzenle_notes_bakiye({ xw }) {
		let {baslik} = this, {oncekiXBakiye, sonrakiXBakiye, dovizlimi, dvKodUyarlanmis} = baslik;
		let {dipOncekiBakiye, dipSonBakiye, bakiyeDovizliIseAyricaTLBakiye} = app.params.eIslem.kullanim;
		const bakiyeTextEkle = e => {
			let {cssPrefix, etiket, bakiye, tlBakiye} = e, araTextListe = [`${toStringWithFra(bakiye, 2)} ${dvKodUyarlanmis}`];
			if (dovizlimi && bakiyeDovizliIseAyricaTLBakiye) { araTextListe.push(`${toStringWithFra(tlBakiye, 2)} TL`) }
			let text = `<span class="${cssPrefix}Bakiye bakiye" style="font-weight: bold; font-size: 120%%;">Bu Fatura ${etiket} Bakiye: ${araTextListe.join(', ')}</span>`;
			xw.writeElementString('cbc:Note', escapeXML(text))
		};
		if (dipOncekiBakiye && oncekiXBakiye) { bakiyeTextEkle({ cssPrefix: 'onceki', etiket: 'Öncesi', bakiye: oncekiXBakiye, tlBakiye: baslik.oncekiTLBakiye }) }
		if (dipSonBakiye && sonrakiXBakiye) { bakiyeTextEkle({ cssPrefix: 'sonraki', etiket: 'Son', bakiye: sonrakiXBakiye, tlBakiye: baslik.sonrakiTLBakiye }) }
	}
	xmlDuzenle_belgeTipKodu({ xw }) { let value = this.baslik._belgeTipKod = this.xmlGetBelgeTipKodu(...arguments); xw.writeElementString('cbc:InvoiceTypeCode', value) }
	xmlDuzenle_doviz(e) { super.xmlDuzenle_doviz(e); this.xmlDuzenleInternal_doviz(e) }
	xmlDuzenle_dvKur(e) { super.xmlDuzenle_dvKur(e); if (this.dovizlimi) this.xmlDuzenleInternal_dvKur(e) }
	xmlDuzenle_docRefs_yalnizYazisi({ xw }) {
		super.xmlDuzenle_docRefs_yalnizYazisi(...arguments);
		let icmal = this.icmalYoksaOlustur(), sonucBedel = icmal.sonucBedelYapi[this.bedelSelector];
		let type = 'YALNIZYAZISI', desc = `#${yalnizYazisi(sonucBedel)}#`; this.xmlDuzenleInternal_docRef({ xw, id: '0', type, desc })
	}
	xmlDuzenle_signatureParty(e) {
		super.xmlDuzenle_signatureParty(e); let {xw} = e, {gondericiBilgi: source} = this;
		e.source = source; xw.writeElementBlock('cac:Signature', null, () => {
			const {vknTckn} = source; if (vknTckn) { xw.writeElementString('cbc:ID', vknTckn, null, { schemeID: 'VKN_TCKN' }) }
			xw.writeElementBlock('cac:SignatoryParty', null, () => this.xmlDuzenle_partyOrtak({ ...e, sahismiKontrolsuz: true }));
			this.xmlDuzenle_digitalSignatureAttachment(e)
		});
		delete e.source
	}
	xmlDuzenle_supplierParty(e) {
		super.xmlDuzenle_supplierParty(e); let {xw} = e, {gondericiBilgi: source} = this;
		e.source = source; xw.writeElementBlock('cac:AccountingSupplierParty', null, () =>
			xw.writeElementBlock('cac:Party', null, () => this.xmlDuzenle_partyOrtak(e)));
		delete e.source
	}
	xmlDuzenle_customerParty(e) {
		super.xmlDuzenle_customerParty(e); let {xw} = e, {aliciBilgi: source} = this;
		e.source = source; xw.writeElementBlock('cac:AccountingCustomerParty', null, () =>
			xw.writeElementBlock('cac:Party', null, () => this.xmlDuzenle_partyOrtak(e)));
		delete e.source
	}
	xmlDuzenle_allowanceCharge({ xw }) {
		super.xmlDuzenle_allowanceCharge(...arguments); let {icmal} = this, {hizmetler} = icmal;
		if (!$.isEmptyObject(hizmetler)) {
			let {bedelSelector, xattrYapi_bedel} = this, dipSonucBedel = icmal.dipSonucBedelYapi[bedelSelector];
			for (let {nakliyemi, oran, bedelYapi} of hizmetler) {
				xw.writeElementBlock('cac:AllowanceCharge', null, () =>
					xw.writeElementString('cbc:ChargeIndicator', nakliyemi)
					  .writeElementString('cbc:MultiplierFactorNumeric', toFileStringWithFra(oran, 4))
					  .writeElementString('cbc:Amount', toFileStringWithFra(bedelYapi[bedelSelector], 2), null, xattrYapi_bedel)
					  .writeElementString('cbc:BaseAmount', toFileStringWithFra(dipSonucBedel, 2), null, xattrYapi_bedel)
				)
			}
		}
	}
	xmlDuzenle_taxTotal({ xw }) {
		super.xmlDuzenle_taxTotal(...arguments); let {icmal, bedelSelector, xattrYapi_bedel, dovizlimi} = this;
		let {vergiTip2Oran2EVergiRecs_tevkifatsiz} = icmal, toplamBedel = 0;
		for (let oran2Recs of Object.values(vergiTip2Oran2EVergiRecs_tevkifatsiz))
		for (let eSatirlar of Object.values(oran2Recs))
		for (let eRec of eSatirlar) { toplamBedel += eRec.bedelYapi[bedelSelector] }
		xw.writeElementBlock('cac:TaxTotal', null, () => {
			xw.writeElementString('cbc:TaxAmount', toFileStringWithFra(toplamBedel, 2), null, xattrYapi_bedel);
			for (const oran2VergiRecs of Object.values(vergiTip2Oran2EVergiRecs_tevkifatsiz))
			for (let [oran, vergiRecs] of Object.entries(oran2VergiRecs))
			for (let eRec of vergiRecs) {
				let etiket = ((eRec.etiket || '').split('%')[0] || '').trim();		/* KDV % 20  ==>  KDV */
				if (etiket?.endsWith('(')) { etiket = etiket.substring(0, etiket.length - 1).trim() }
				xw.writeElementBlock('cac:TaxSubtotal', null, () => {
					xw.writeElementString('cbc:TaxableAmount', toFileStringWithFra(eRec.getMatrahYapi({ dovizlimi })[bedelSelector], 2), null, xattrYapi_bedel)
					   .writeElementString('cbc:TaxAmount', toFileStringWithFra(eRec.bedelYapi[bedelSelector], 2), null, xattrYapi_bedel)
					   .writeElementString('cbc:CalculationSequenceNumeric', '2.0').writeElementString('cbc:Percent', oran)
					   .writeElementBlock('cac:TaxCategory', null, () =>
							xw.writeElementBlock('cac:TaxScheme', null, () => { xw.writeElementString('cbc:Name', etiket).writeElementString('cbc:TaxTypeCode', eRec.kod) }))
				})
			}
		})
	}
	xmlDuzenle_tevkifatli_taxTotal({ xw }) {
		super.xmlDuzenle_tevkifatli_taxTotal(...arguments); let {vergiRecs_tevkifatlar} = this.icmal;
		if ($.isEmptyObject(vergiRecs_tevkifatlar)) { return }
		let {bedelSelector, xattrYapi_bedel, dovizlimi} = this, toplamBedel = 0;
		for (const eRec of vergiRecs_tevkifatlar) { toplamBedel += eRec.bedelYapi[bedelSelector] }
		xw.writeElementBlock('cac:WithholdingTaxTotal', null, () => {
			xw.writeElementString('cbc:TaxAmount', toFileStringWithFra(toplamBedel, 2), null, xattrYapi_bedel);
			for (const eRec of vergiRecs_tevkifatlar) {
				xw.writeElementBlock('cac:TaxSubtotal', null, () => {
					xw.writeElementString('cbc:TaxableAmount', toFileStringWithFra(eRec.getMatrahYapi({ dovizlimi })[bedelSelector], 2), null, xattrYapi_bedel)
					  .writeElementString('cbc:TaxAmount', toFileStringWithFra(eRec.bedelYapi[bedelSelector], 2), null, xattrYapi_bedel)
					  .writeElementString('cbc:CalculationSequenceNumeric', '2.0')
					  .writeElementString('cbc:Percent', eRec.oran)
					  .writeElementBlock('cac:TaxCategory', null, () =>
						  xw.writeElementBlock('cac:TaxScheme', null, () => { xw.writeElementString('cbc:Name', eRec.etiket).writeElementString('cbc:TaxTypeCode', eRec.kod) }))
				})
			}
		})
	}
	xmlDuzenle_legalMonetaryTotal({ xw }) {
		super.xmlDuzenle_legalMonetaryTotal(...arguments); let {icmal, bedelSelector, xattrYapi_bedel} = this;
		let brutBedel = icmal.brutBedelYapi[bedelSelector], topIskBedel = (icmal.topIskBedelYapi || {})[bedelSelector] || 0;
		let vergiHaricBedel = icmal.vergiHaricToplamYapi[bedelSelector], vergiDahilBedel = icmal.vergiDahilToplamYapi[bedelSelector];
		let sonucBedel = icmal.sonucBedelYapi[bedelSelector];
		xw.writeElementBlock('cac:LegalMonetaryTotal', null, () =>
			xw.writeElementString('cbc:LineExtensionAmount', toFileStringWithFra(brutBedel, 2), null, xattrYapi_bedel)
			  .writeElementString('cbc:TaxExclusiveAmount', toFileStringWithFra(vergiHaricBedel, 2), null, xattrYapi_bedel)
			  .writeElementString('cbc:TaxInclusiveAmount', toFileStringWithFra(vergiDahilBedel, 2), null, xattrYapi_bedel)
			  .writeElementString('cbc:AllowanceTotalAmount', toFileStringWithFra(topIskBedel, 2), null, xattrYapi_bedel)
			  .writeElementString('cbc:PayableAmount', toFileStringWithFra(sonucBedel, 2), null, xattrYapi_bedel)
		)
	}
	xmlDuzenle_detayDevam_taxTotal({ xw, detay: det }) {
		/* 'har.detkdvekvergitipi', 'har.detistisnakod', 'har.perkdv', 'har.pertevkifat', 'har.perstopaj', 'kver.kdvorani', 'sver.stopajorani',
			'tevver.kdvtevoranx', 'tevver.kdvtevoranpay', 'tevver.tevislemturu' */
		super.xmlDuzenle_detayDevam_taxTotal(...arguments); let {bedelSelector, xattrYapi_bedel, dovizlimi} = this;
		let {bedel: matrah} = det, tumIstisnaDict, toplamBedel = (det.perkdv || 0) + (det.perstopaj || 0) + (det.perotv || 0);						// det.perstopaj dusulecek mi ??
		let tip2VergiYapi = {
			get kdv() { return det.perkdv ? { bedel: det.perkdv, oran: det.kdvorani, taxTypeCode: MQVergiKdv.eIslTypeCode, taxName: 'KDV' } : null },
			get istisna() {
				const ekVergiTipi = det.detkdvekvergitipi;
				return (ekVergiTipi == 'KI' || ekVergiTipi == 'IS') ? { bedel: 0, oran: 0, taxTypeCode: MQVergiKdv.eIslTypeCode, taxName: 'KDV' } : null
			},
			get stopaj() { return det.perstopaj ? { bedel: det.perstopaj, oran: det.stopajorani, taxTypeCode: MQVergiStopaj.eIslTypeCode, taxName: 'STOPAJ' } : null },
			get otv() { return det.perotv ? { bedel: det.perotv, oran: det.otvorani, taxTypeCode: MQVergiOtv.eIslTypeCode, taxName: 'ÖTV' } : null }
		};
		xw.writeElementBlock('cac:TaxTotal', null, () => {
			xw.writeElementString('cbc:TaxAmount', toFileStringWithFra(toplamBedel, 2), null, xattrYapi_bedel);
			for (let [tip, rec] in Object.entries(tip2VergiYapi)) {
				if (!rec) { continue }
				xw.writeElementBlock('cac:TaxSubtotal', null, () =>
					xw.writeElementString('cbc:TaxableAmount', toFileStringWithFra(matrah, 2), null, xattrYapi_bedel)
					  .writeElementString('cbc:TaxAmount', toFileStringWithFra(rec.bedel || 0, 2), null, xattrYapi_bedel)
					  .writeElementString('cbc:CalculationSequenceNumeric', '2.0')
					  .writeElementString('cbc:Percent', rec.oran || 0)
					  .writeElementBlock('cac:TaxCategory', null, () => {
						  let {istisnaKod} = rec; if (istisnaKod) {
							  if (!tumIstisnaDict) { tumIstisnaDict = MQVergi.getTumIstisnaDict() }
							  xw.writeElementString('cbc:TaxExemptionReasonCode', istisnaKod);
							  xw.writeElementString('cbc:TaxExemptionReason', (tumIstisnaDict[istisnaKod] || {}).aciklama || '.')
						  }
						  xw.writeElementBlock('cac:TaxScheme', null, () =>
							  xw.writeElementString('cbc:Name', rec.taxName || '')
								.writeElementString('cbc:TaxTypeCode', rec.taxTypeCode || '')
						  )
					})
				)
			}
		})
	}
	xmlDuzenle_detayDevam_tevkifatli_taxTotal(e) {
		/* 'har.detkdvekvergitipi', 'har.detistisnakod',
			'har.perkdv', 'har.pertevkifat', 'har.perstopaj', 'kver.kdvorani', 'sver.stopajorani',
			'tevver.kdvtevoranx', 'tevver.kdvtevoranpay', 'tevver.tevislemturu' */
		super.xmlDuzenle_detayDevam_tevkifatli_taxTotal(e);
		const {xw} = e, {bedelSelector, xattrYapi_bedel, dovizlimi} = this;
		const det = e.detay, matrah = det.bedel, bedel = det.pertevkifat || 0, oran = (det.kdvtevoranpay || 0) * 10, toplamBedel = bedel;
		if (bedel) {
			let tevkifatDict;
			xw.writeElementBlock('cac:WithholdingTaxTotal', null, () => {
				xw.writeElementString('cbc:TaxAmount', toFileStringWithFra(toplamBedel, 2), null, xattrYapi_bedel);
				xw.writeElementBlock('cac:TaxSubtotal', null, () => {
					xw
						.writeElementString('cbc:TaxableAmount', toFileStringWithFra(matrah, 2), null, xattrYapi_bedel)
						.writeElementString('cbc:TaxAmount', toFileStringWithFra(bedel, 2), null, xattrYapi_bedel)
						.writeElementString('cbc:CalculationSequenceNumeric', '2.0')
						.writeElementString('cbc:Percent', oran)
						.writeElementBlock('cac:TaxCategory', null, () => {
							xw.writeElementBlock('cac:TaxScheme', null, () => {
								const tevIslemTuru = det.tevislemturu;
								if (!tevkifatDict) { tevkifatDict = MQVergi.getTevkifatDict() }
								xw.writeElementString('cbc:Name', tevkifatDict[tevIslemTuru]?.aciklama || '.').writeElementString('cbc:TaxTypeCode', tevIslemTuru)
							})
						})
				})
			})
		}
	}
	xmlDuzenle_detayDevam_item_additionalItemIds_miktar2(e) {
		super.xmlDuzenle_detayDevam_item_additionalItemIds_miktar2(e); const det = e.detay, result = det.eMiktarYapi, {miktar2} = result || {};
		if (miktar2) {
			const brm2 = result.brm || det.brm2;
			this.xmlDuzenleInternal_detAdditionalIdent({ xw: e.xw, schemeID: 'MIKTAR2GORUNUM', id: miktar2 })
			this.xmlDuzenleInternal_detAdditionalIdent({ xw: e.xw, schemeID: 'BRM2GORUNUM', id: brm2 })
		}
	}
	xmlDuzenle_detayDevam_item_additionalItemIds_netFiyat(e) {
		super.xmlDuzenle_detayDevam_item_additionalItemIds_netFiyat(e);
		const det = e.detay, {dovizlimi} = this, result = det.getEFiyatYapi({ dovizlimi }), {netFiyat} = result || {};
		if (netFiyat) {
			const fiyatFra = app.params.zorunlu.fiyatFra || 6;
			this.xmlDuzenleInternal_detAdditionalIdent({ xw: e.xw, schemeID: 'NET_FIYAT', id: toFileStringWithFra(netFiyat, fiyatFra) })
		}
	}
	xmlDuzenle_detayDevam_miktar(e) {
		super.xmlDuzenle_detayDevam_miktar(e);
		const det = e.detay, result = det.eMiktarYapi, brm = result.brm || det.brm, ulsBrm = app.params.stokBirim.brmDict[brm]?.intKod || 'NIU';			/* NIU = AD */
		if (!ulsBrm) { throw { isError: true, rc: 'brmUls', errorText: `<b class="royalblue">${brm}</b> Stok Birim kodu için <u class="bold royalblue">Uls. Kod Karşılığı</u>, Stok Birim Parametrelerinden tanımlanmalıdır` } }
		e.xw.writeElementString('cbc:InvoicedQuantity', result.asilMiktar || 0, null, { unitCode: ulsBrm })
	}
	xmlDuzenle_detayDevam_fiyat(e) {
		super.xmlDuzenle_detayDevam_fiyat(e); const {xw} = e, det = e.detay, result = det.getEFiyatYapi({ dovizlimi: this.dovizlimi });
		if (result) {
			xw.writeElementBlock('cac:Price', null, () =>
				xw.writeElementString('cbc:PriceAmount', toFileStringWithFra(result.asilFiyat || 0, app.params.zorunlu.fiyatFra || 6), null, this.xattrYapi_bedel))
		}
	}
	xmlGetProfileID(e) { const {baslik} = this; return this.class.eArsivmi ? 'EARSIVFATURA': baslik.alimIademi ? 'TEMELFATURA' : EIslemSenaryo.getSenaryoText(baslik.carsenaryo) }
	xmlGetBelgeTipKodu(e) {
		let {baslik, detaylar, icmal, bedelSelector} = this, {fistipi: fisTipi, ayrimtipi: ayrimTipi, alimIademi, eYontem} = baslik, {eIslem} = app.params;
		if (alimIademi) { return fisTipi == 'SR' ? 'TEVKIFATIADE' : 'IADE' }
		if (fisTipi == 'TV') { return 'TEVKIFAT' }
		if (ayrimTipi == 'IK') { return 'IHRACKAYITLI' }
		let istisnaTipSet = asSet(['KI', 'TK', 'TR', 'IS']), ihracatTipSet = asSet(['IH', 'MI']);
		if (istisnaTipSet[fisTipi] || ihracatTipSet[ayrimTipi]) { return 'ISTISNA' }
		let ekVergiTipleri = {}; for (let {detkdvekvergitipi: tip} of detaylar) { if (tip) { ekVergiTipleri[tip] = true } }
		if (ekVergiTipleri.TV) { return 'TEVKIFAT' }
		let detaylarHepsiIstisnami = detaylar.every(({ detkdvekvergitipi: tip }) => tip == 'IS' || tip == 'KI');
		if (detaylarHepsiIstisnami) { return 'ISTISNA' }
		let {vergiTip2Oran2EVergiRecs_tevkifatsiz: vergiTip2Oran2Recs} = icmal;
			/* Detay KDV'ler = 0 & Detayda ISTISNA YOK & app.params.eIslem.kdvMuafiyetKod == '812' => 'OZELMATRAH' */
		if ($.isEmptyObject(vergiTip2Oran2Recs?.[MQVergiKdv.eIslTypeCode])) {
			return !(ekVergiTipleri.IS || ekVergiTipleri.KI) && eIslem.kdvMuafiyetKod == '812' ? 'OZELMATRAH' : 'ISTISNA' }
		if (eYontem?.varsaGenelYontem?.sgkmi) { return 'SGK' }
		return 'SATIS'
	}
}
class EIslFatura extends EIslFaturaArsivOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get eFaturami() { return true } static get ortakSinif() { return EIslFaturaArsivOrtak }
	static get tip() { return 'E' } static get sinifAdi() { return 'e-Fatura' }
	static get kisaAdi() { return 'e-Fat' } /*static get paramSelector() { return 'eFatura' }*/
	get xsltBelirtec() { return 'EFatura' }
}
class EIslIhracat extends EIslFatura {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get eIhracatmi() { return true } static get tip() { return 'IH' }
	static get sinifAdi() { return 'e-İhracat' } static get kisaAdi() { return 'e-İhr' }
	/*static get paramSelector() { return 'eIhracat' }*/ get xsltBelirtec() { return 'EIhracat' }
}
class EIslArsiv extends EIslFaturaArsivOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get eArsivmi() { return true } static get ortakSinif() { return EIslFaturaArsivOrtak }
	static get tip() { return 'A' } static get altBolum() { return 'EArsiv' }
	static get sinifAdi() { return 'e-Arşiv' } static get kisaAdi() { return 'e-Arş' }
	/*static get paramSelector() { return 'eArsiv' }*/ get xsltBelirtec() { return 'EArsiv' }
}

