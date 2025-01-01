class GidenEIslemFiltre extends EIslemFiltre {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static getBelgeTipText(e) {
		let rec = e.rec || e; const psTip = (rec.pstip || rec.psTip || rec.psTipStr || '').trim(), pifTipi = (rec.piftipi || rec.pifTipi || '').trim();
		const almSat = (rec.almsat || rec.almSat || '').trim(), iade = (rec.iade || '').trim(), ayrimTipi = (rec.ayrimTipi || rec.ayrimTipi || '').trim();
		if (psTip == 'S') {												/* S: sipfis */
			if (almSat == 'T') { switch (ayrimTipi) { case 'IH': return 'İhracat Fatura'; case 'EM': return 'Emanet Fatura'; } }
			return null
		}
		if (psTip == 'ST') {											/* ST: stfis */
			if (ayrimTipi == 'SB' || pifTipi == 'SB') return 'Şube Transfer'
			if (ayrimTipi == 'SC' || pifTipi == 'SC') return 'Plasiyer Teslim'
			if (ayrimTipi == 'IR' || pifTipi == 'IR') return 'İrsaliyeli Transfer'
			if (ayrimTipi == 'FS' || pifTipi == 'FS') return 'Fasona Malzeme Çıkış'
			return 'Plasiyere Teslim'
		}
		if (psTip == 'SM')												/* SM: topmakbuzfis */
			return 'Süt Makbuz'
		if (psTip == 'SR')												/* SR: piffis */
			return 'Sürü Müstahsil'
		if (pifTipi == 'P')												/* P: piffis - Mağaza */
			return 'Mağaza Satış'

		// Normal Satış veya Alım İADE
		const alimmi = almSat == 'A', iademi = iade == 'I', atText = alimmi ? 'Alım' : 'Satış', iadePrefix = iademi ? ' İADE' : '', ifText = (pifTipi == 'I' ? 'İrsaliye' : 'Fatura');
		switch (ayrimTipi) {
			case '': return `${atText}${iadePrefix} ${ifText}`
			case 'IK': return `${atText} İhraç Kaydıyla${iadePrefix} ${ifText}`
			case 'EM': return `${atText} Emanet${iadePrefix} ${ifText}`
			case 'FS': return `${atText} Fason${iadePrefix} ${ifText}`
			case 'KN': return `${atText} Konsinye${iadePrefix} ${ifText}`
			case 'IH': return `${alimmi ? 'İthalat' : 'İhracat'}${iadePrefix} ${ifText}`
		}
		return `${atText}${iadePrefix} ${ifText}`
	}
	getQueryStm(e) { e = e || {}; const uni = new MQUnionAll(), stm = new MQStm({ sent: uni }), _e = $.extend({}, e, { stm, uni }); this.queryStmDuzenle(_e); return _e.stm }
	queryStmDuzenle(e) {
		e = e || {}; super.queryStmDuzenle(e); const {eConf} = this, {stm, uni} = e;
		const sentEkle = __e => {
			const _e = $.extend({}, e, __e), wh = this.getTBWhereClause(_e); if (!wh) { return null }
				/* e: { fisTablo psTipStr ifSql efAyrimTipiClause } */
			const {fisTablo, alias, psTip, ifSql, efAyrimTipiClause} = _e;
			const sent = new MQSent({
				from: `${fisTablo} fis`,
				where: { birlestir: wh },
				sahalar: [
					`${MQSQLOrtak.sqlServerDegeri(psTip)} pstip`, `${ifSql} piftipi`, `${efAyrimTipiClause} efayrimtipi`,
					`fis.kaysayac`, `fis.almsat`, `fis.iade`, `fis.ayrimtipi`, `fis.tarih`, `fis.fisnox`, `fis.ticmust mustkod`, `car.birunvan`, `fis.efatuuid`,
					(fisTablo == 'piffis' ? 'fis.zorunluguidstr' : `'' zorunluguidstr`), `fis.efgonderimts`, `fis.efatonaydurumu`, `fis.net sonucbedel`, `car.vkno vkn`, 'car.efatsenaryotipi'
				]
			});
			sent.fis2TicCariBagla();
			if (eConf) { eConf.eIslListeSentDuzenle($.extend({}, e, { sent })) }
			uni.add(sent); return sent
		};
		const fisGenelAyrimTipiClause = `(case when fis.ayrimtipi = 'IH' then 'IH' when fis.efayrimtipi = '' then 'A' else fis.efayrimtipi end)`;
		sentEkle({ fisTablo: 'piffis', psTip: 'P', ifSql: 'fis.piftipi', efAyrimTipiClause: `(case when fis.piftipi = 'I' then 'IR' when fis.almsat = 'M' then 'MS' else ${fisGenelAyrimTipiClause} end)` });
		sentEkle({ fisTablo: 'sipfis', psTip: 'S', ifSql: `'F'`, efAyrimTipiClause: fisGenelAyrimTipiClause });
		(() => {
			const wh = this.getTBWhereClause($.extend({}, e, { psTip: 'ST' })); if (!wh) { return }
			const alias = 'fis', sent = new MQSent({
				from: `stfis fis`,
				fromIliskiler: [{ from: 'carmst car', iliski: 'fis.irsmust = car.must' }],
				where: [ { birlestir: wh } ],
				sahalar: [
					`'ST' pstip`, `fis.ozeltip piftipi`, `'IR' efayrimtipi`, `fis.kaysayac`, `'T' almsat`, `'' iade`, `fis.fisekayrim ayrimtipi`, `fis.tarih`, `fis.fisnox`,
					`'' mustkod`, `'' birunvan`, `fis.efatuuid`, `'' zorunluguidstr`, `fis.efgonderimts`, `fis.efatonaydurumu`, `0 sonucbedel`,
					`(case when fis.fisekayrim = 'SC' then ${MQSQLOrtak.sqlServerDegeri(VergiNo.perakendeVKN)} else ${MQSQLOrtak.sqlServerDegeri(app.params.isyeri.vergiVeyaVKN || '')} end) vkn`,
					'car.efatsenaryotipi'
				]
			});
			uni.add(sent)
		})();
		(() => {
			const wh = this.getTBWhereClause($.extend({}, e, { psTip: 'SM' })); if (!wh) { return }
			const sent = new MQSent({
				from: `topmakbuzara fis`,
				fromIliskiler: [
					{ from: `topmakbuzfis ust`, iliski: `fis.fissayac = ust.kaysayac` },
					{ from: `carmst car`, iliski: `fis.mustahsilkod = car.must` }
				],
				where: { birlestir: wh },
				sahalar: 
					[`'SM' pstip`, `'' piftipi`, `'MS' efayrimtipi`, `fis.kaysayac`, `'T' almsat`, `'' iade`, `'' ayrimtipi`, `ust.tarih`, `fis.makbuznox fisnox`,
					`fis.mustahsilkod mustkod`, `car.birunvan`, `fis.efatuuid`, `'' zorunluguidstr`, `fis.efgonderimts`, `fis.efatonaydurumu`, `0 sonucbedel`, `car.vkno vkn`, 'car.efatsenaryotipi'
				]
			});
			uni.add(sent)
		})();
		sentEkle({ fisTablo: 'piffis', psTip: 'SR', ifSql: `fis.piftipi`, efAyrimTipiClause: `'MS'` });
		stm.orderBy.liste = ['tarih DESC', 'pstip', 'fisnox DESC']
	}
	listeOlustur(e) {
		super.listeOlustur(e); const tarihBasi = null; /*today().addMonths(-5); tarihBasi.setDate(1);*/
		this.grupTopluEkle([ { kod: 'PRG', aciklama: 'Yazılımsal', renk: '#111', zeminRenk: '#eee', kapali: true } ])
		let sec_eIslem, sec_faturaAyrim; const eConf = this.eConf ?? MQEConf.instance, kisit = eConf.kisitUyarlanmis;
		const {liste} = e; $.extend(liste, {
			uygunOlmayanlarGosterilirmiFlag: new SecimBool({ etiket: 'Seri-No Yıl Uygun OLMAYANLAR da gösterilsin' }),
			eIslemBirKismi: (sec_eIslem = new SecimBirKismi({ etiket: 'e-İşlem', tekSecim: new EIslemTip({ hepsi: true }) })),
			faturaAyrimSecim: (sec_faturaAyrim = new SecimTekSecim({ etiket: 'Fatura Ayrım', tekSecim: new BuDigerVeHepsi(['Mağaza Fişi', 'Normal Fatura']) }))
		});
		if (kisit.kullanilirmi) {
			const magazami = kisit.magaza, eIslKodlar = [];
				if (kisit.fatura) { eIslKodlar.push('E', 'IH'); if (magazami) { eIslKodlar.push('A') } }
				if (kisit.irsaliye) { eIslKodlar.push('IR') }; if (kisit.musMakbuz) { eIslKodlar.push('MS') };
			if (eIslKodlar.length) { const {kaDict} = EIslemTip; liste.uyari_kisitEIslTip = new SecimText({ etiket: `Kısıtlanacak e-İşlem Tipleri:`, value: `[ <b class="indianred">${eIslKodlar.map(eIslTip => kaDict[eIslTip] || eIslTip)}</b> ]` }) }
			liste.uyari_kisitAyrim = new SecimText({ etiket: `Kısıtlanacak Ayrımlar`, value: `[ <b class="indianred">${magazami ? 'Mağaza' : 'Normal Faturalar'}</b> ]` });
		}
		$.extend(liste, {
			sube: new SecimBirKismi({ etiket: 'Fiş Şubesi', mfSinif: MQSube }),
			tarih: new SecimDate({ etiket: 'Tarih', basi: tarihBasi }),
			seri: new SecimString({ etiket: 'Belge Seri' }),
			fisNo: new SecimNumber({ etiket: 'Belge No' }),
			must: new SecimString({ etiket: 'Müşteri', mfSinif: MQCari }),
			mustUnvan1: new SecimOzellik({ etiket: 'Müşteri Ünvan 1' }),
			gonderimDurumSecim: new SecimTekSecim({ etiket: 'Gönderim Durumu', tekSecim: new BuDigerVeHepsi(['Bekleyenler', 'GÖNDERİLENLER']).bu() }),
			gonderimTarihi: new SecimDate({ etiket: 'Gönderim Tarihi' }),
			akibetDurumBirKismi: new SecimBirKismi({ etiket: 'Akıbet', tekSecimSinif: EIslemOnayDurum }),
			uuid: new SecimOzellik({ etiket: 'UUID' }),
			xmlDurumSecim: new SecimTekSecim({ etiket: 'XML Durumu', tekSecim: new BuDigerVeHepsi([`<span class="green">XML Oluşmuş Olanlar</span>`, `<span class="red">XML OLUŞMAMIŞ Olanlar</span>`]) }),
			fisSayac: new SecimInteger({ etiket: 'VIO ID (fisSayac)', grupKod: 'PRG' })
		});
	}
	tbWhereClauseDuzenle(e) {
		e = e || {}; super.tbWhereClauseDuzenle(e); this.tbWhereClauseDuzenle_kisit(e);
		this.tbWhereClauseDuzenle_basit(e); this.tbWhereClauseDuzenle_eIslem(e)
		const psTip = e.psTip || e.psTipStr || e.psTipKod; let wh = e.where, result;
		switch (psTip) {
			case 'P': this.tbWhereClauseDuzenle_pifFis(e); break; case 'S': this.tbWhereClauseDuzenle_sipFis(e); break; case 'ST': this.tbWhereClauseDuzenle_stFis(e); break
			case 'SM': this.tbWhereClauseDuzenle_sutMakbuzFis(e); break; case 'SR': this.tbWhereClauseDuzenle_srMustahsilMakbuzFis(e); break
		}
		wh = e.where; if (!wh) { return }
		const _e = $.extend({}, e, { where: new MQWhereClause() }); this.tbWhereClauseDuzenle_cari(_e); const cariWh = _e.where;
		if (cariWh && !$.isEmptyObject(cariWh.liste)) { if (psTip == 'ST') { e.where = null; return } wh.birlestir(cariWh) }
	}
	tbWhereClauseDuzenle_kisit(e) {
		e = e || {}; const eConf = this.eConf ?? MQEConf.instance, kisit = eConf.kisitUyarlanmis; if (!kisit?.kullanilirmi) { return }
		const {alias, aliasVeNokta} = e, psTip = e.psTip || e.psTipStr || e.psTipKod, wh = e.where, magazami = kisit.magaza, alinmazPSTipSet = {};
		switch (psTip) {
			case 'P':
				if (kisit.fatura) { wh.add(`not (fis.piftipi = 'F' and fis.almsat <> 'M')`); alinmazPSTipSet.S = true }
				if (kisit.irsaliye) { wh.add(`fis.piftipi <> 'I'`); alinmazPSTipSet.ST = true }
				if (magazami) { wh.add(`not (fis.piftipi = 'P' and fis.ayrimtipi = 'PR')`) }
				if (kisit.musMakbuz) { wh.add(`not (fis.piftipi = 'F' and fis.almsat = 'M')`); alinmazPSTipSet.SM = alinmazPSTipSet.SR = true }
				break
		}
		if (alinmazPSTipSet[psTip]) { wh.add('1 = 2') }
	}
	tbWhereClauseDuzenle_basit(e) {
		e = e || {}; const psTip = e.psTip || e.psTipStr || e.psTipKod, wh = e.where;
		if (psTip == 'SM') { this.tbWhereClauseDuzenle_sutMakbuz(e) } else { this.tbWhereClauseDuzenle_ortak(e) }
	}
	tbWhereClauseDuzenle_ortak(e) {
		e = e || {}; const {alias, aliasVeNokta} = e, wh = e.where;
		wh.add(`${aliasVeNokta}silindi = ''`, `${aliasVeNokta}ozelisaret <> '*'`);
		if (!this.uygunOlmayanlarGosterilirmiFlag.value) { wh.add(`LEN(${aliasVeNokta}seri) = 3`, `${aliasVeNokta}noyil > 0`) }
		wh.birKismi(this.sube, `${aliasVeNokta}bizsubekod`); wh.basiSonu(this.tarih, `${aliasVeNokta}tarih`);
		wh.basiSonu(this.seri, `${aliasVeNokta}seri`); wh.basiSonu(this.fisNo, `${aliasVeNokta}no`)
	}
	tbWhereClauseDuzenle_sutMakbuz(e) {
		e = e || {}; const {alias, aliasVeNokta} = e, ustAliasVeNokta = 'ust.', wh = e.where;
		wh.add(`${ustAliasVeNokta}silindi = ''`, `${ustAliasVeNokta}ozelisaret <> '*'`);
		if (this.uygunOlmayanlarGosterilirmiFlag.value) { wh.add(`LEN(${aliasVeNokta}makbuzseri) = 3`, `${aliasVeNokta}makbuznoyil > 0`) }
		wh.birKismi(this.sube, `${ustAliasVeNokta}bizsubekod`); wh.basiSonu(this.tarih, `${ustAliasVeNokta}tarih`);
		wh.basiSonu(this.seri, `${aliasVeNokta}makbuzseri`); wh.basiSonu(this.no, `${aliasVeNokta}makbuzno`)
	}
	tbWhereClauseDuzenle_cari(e) {
		e = e || {}; const {alias, aliasVeNokta} = e, wh = e.where;
		wh.basiSonu(this.must, 'car.must'); wh.ozellik(this.mustUnvan1, 'car.birunvan')
	}
	tbWhereClauseDuzenle_eIslem(e) {
		e = e || {}; const {alias, aliasVeNokta} = e, wh = e.where, {eIslemTipSet} = e; if (eIslemTipSet && (eIslemTipSet.E || eIslemTipSet.A)) { eIslemTipSet[''] = true }
		wh.add(`${aliasVeNokta}efayrimtipi <> 'BL'`); wh.basiSonu(this.gonderimTarihi, `${aliasVeNokta}efgonderimts`);
		if (!$.isEmptyObject(eIslemTipSet)) { wh.birKismi(Object.keys(eIslemTipSet), `${aliasVeNokta}efayrimtipi`) }
		wh.birKismi(this.eIslemBirKismi, `${aliasVeNokta}efayrimtipi`); wh.birKismi(this.akibetDurumBirKismi, `${aliasVeNokta}efatonaydurumu`); wh.ozellik(this.uuid, `${aliasVeNokta}efatuuid`);
		const xmlDurum = this.xmlDurumSecim.tekSecim; if (!xmlDurum.hepsimi) { wh.add(`${aliasVeNokta}efatuuid ${xmlDurum.bumu ? '<>' : '='} ''`) }
		const gonderimDurum = this.gonderimDurumSecim.tekSecim; if (!gonderimDurum.hepsimi) { wh.add(`${aliasVeNokta}efgonderimts IS${gonderimDurum.digermi ? ' NOT' : ''} NULL`) }
	}
	tbWhereClauseDuzenle_pifFis(e) {
		e = e || {}; const pifGenelAyrimlar = [], faturaAyrim = this.faturaAyrimSecim.tekSecim, fatTipHepsimi = faturaAyrim.hepsimi, magazami = faturaAyrim.bumu, faturami = faturaAyrim.digermi;
		if (fatTipHepsimi || faturami) { pifGenelAyrimlar.push('', 'IK', 'KN', 'FS') }
		if (fatTipHepsimi || magazami) { pifGenelAyrimlar.push('PR') }
		const pifGenelAyrimlarVeIhracat = magazami ? pifGenelAyrimlar : [...pifGenelAyrimlar, 'IH'], pifTipi2AlimSat2Iade2Ayrimlar = {};
		const dizici = e => {
			const {pifTipi, almSat, iade, ayrimlar} = e, almSat2Iade2Ayrimlar = pifTipi2AlimSat2Iade2Ayrimlar[pifTipi] = pifTipi2AlimSat2Iade2Ayrimlar[pifTipi] || {};
			const iade2Ayrimlar = almSat2Iade2Ayrimlar[almSat] = almSat2Iade2Ayrimlar[almSat] || {}, _ayrimlar = iade2Ayrimlar[iade] = iade2Ayrimlar[iade] || {};
			if (!$.isEmptyObject(ayrimlar)) { $.extend(_ayrimlar, ($.isArray(ayrimlar) ? asSet(ayrimlar) : ayrimlar)) }
		};
		const {eIslemTipSet} = e; if (!eIslemTipSet || (eIslemTipSet.A || eIslemTipSet.E)) {
			const ayrimlar = pifGenelAyrimlar; dizici({ pifTipi: 'F', almSat: 'T', iade: '', ayrimlar });
			dizici({ pifTipi: 'F', almSat: 'A', iade: 'I', ayrimlar })
		}
		if (!eIslemTipSet || eIslemTipSet.IH) { dizici({ pifTipi: 'F', almSat: 'T', iade: '', ayrimlar: ['MI', 'IH'] }) }
		if (!eIslemTipSet || eIslemTipSet.IR) {
			dizici({ pifTipi: 'I', almSat: 'T', iade: '', ayrimlar: pifGenelAyrimlarVeIhracat });
			dizici({ pifTipi: 'I', almSat: 'A', iade: 'I', ayrimlar: pifGenelAyrimlarVeIhracat });
			dizici({ pifTipi: 'F', almSat: 'T', iade: '', ayrimlar: ['EM'] })										/* emanet ve (piftipi = F) ise irsaliyedir */
		}
		if (!eIslemTipSet || eIslemTipSet.MS) { dizici({ pifTipi: 'F', almSat: 'M', iade: '', ayrimlar: [''] }) }
		const {alias, aliasVeNokta} = e, wh = e.where, or = new MQOrClause();
		for (const pifTipi in pifTipi2AlimSat2Iade2Ayrimlar) {
			const almSat2Iade2Ayrimlar = pifTipi2AlimSat2Iade2Ayrimlar[pifTipi];
			for (const almSat in almSat2Iade2Ayrimlar) {
				const iade2Ayrimlar = almSat2Iade2Ayrimlar[almSat];
				for (const iade in iade2Ayrimlar) {
					const ayrimlar = Object.keys(iade2Ayrimlar[iade] || {});
					or.add(new MQAndClause([
						(pifTipi == 'F' ?
							new MQOrClause([
								new MQSubWhereClause([ { degerAta: 'F', saha: `${aliasVeNokta}piftipi` }, { not: true, degerAta: 'PR', saha: `${aliasVeNokta}ayrimtipi` } ]),
								new MQSubWhereClause([ { degerAta: 'P', saha: `${aliasVeNokta}piftipi` }, { degerAta: 'PR', saha: `${aliasVeNokta}ayrimtipi` } ])
							]) : { degerAta: pifTipi, saha: `${aliasVeNokta}piftipi` }
						),
						{ degerAta: almSat, saha: `${aliasVeNokta}almsat` }, { degerAta: iade, saha: `${aliasVeNokta}iade` }, { inDizi: ayrimlar, saha: `${aliasVeNokta}ayrimtipi` }
					]).parantezli())
				}
			}
		}
		if (!$.isEmptyObject(or.liste)) { wh.add(or) }
	}
	tbWhereClauseDuzenle_sipFis(e) {
		e = e || {}; const ozelTip2AlimSat2Ayrimlar = {}, dizici = e => {
			const {ozelTip, almSat, ayrimlar} = e, almSat2Ayrimlar = ozelTip2AlimSat2Ayrimlar[ozelTip] = ozelTip2AlimSat2Ayrimlar[ozelTip] || {};
			const _ayrimlar = almSat2Ayrimlar[almSat] = almSat2Ayrimlar[almSat] || {};
			if (!$.isEmptyObject(ayrimlar)) { $.extend(_ayrimlar, ($.isArray(ayrimlar) ? asSet(ayrimlar) : ayrimlar)) }
		};
		const {eIslemTipSet, alias, aliasVeNokta} = e, wh = e.where, or = new MQOrClause();
		if (!eIslemTipSet || (eIslemTipSet.A || eIslemTipSet.E)) { dizici({ ozelTip: 'E', almSat: 'T', ayrimlar: ['EM'] }) }
		if (!eIslemTipSet || eIslemTipSet.IH) { dizici({ ozelTip: 'V', almSat: 'T', ayrimlar: ['IH'] }) }
		for (const ozelTip in ozelTip2AlimSat2Ayrimlar) {
			const almSat2Ayrimlar = ozelTip2AlimSat2Ayrimlar[ozelTip];
			for (const almSat in almSat2Ayrimlar) {
				const ayrimlar = Object.keys(almSat2Ayrimlar[almSat] || {});
				or.add(new MQAndClause([
					{ degerAta: ozelTip, saha: `${aliasVeNokta}ozeltip` },
					{ degerAta: almSat, saha: `${aliasVeNokta}almsat` },
					{ inDizi: ayrimlar, saha: `${aliasVeNokta}ayrimtipi` }
				]).parantezli())
			}
		}
		if (!$.isEmptyObject(or.liste)) { wh.add(or) }
	}
	tbWhereClauseDuzenle_stFis(e) {
		e = e || {}; const ozelTip2GC2Ayrimlar = {}, dizici = e => {
			const {ozelTip, gcTipi, ayrimlar} = e, gc2Ayrimlar = ozelTip2GC2Ayrimlar[ozelTip] = ozelTip2GC2Ayrimlar[ozelTip] || {};
			const _ayrimlar = gc2Ayrimlar[gcTipi] = gc2Ayrimlar[gcTipi] || {};
			if (!$.isEmptyObject(ayrimlar)) { $.extend(_ayrimlar, ($.isArray(ayrimlar) ? asSet(ayrimlar) : ayrimlar)) }
		};
		const {eIslemTipSet, alias, aliasVeNokta} = e, wh = e.where, or = new MQOrClause();
		if (!eIslemTipSet || eIslemTipSet.IR) {
			dizici({ ozelTip: 'SB', gcTipi: 'T', ayrimlar: [''] });											/* subeler arasi trf */
			dizici({ ozelTip: '', gcTipi: 'T', ayrimlar: ['SC'] });											/* plas,yer teslim */
			dizici({ ozelTip: 'FS', gcTipi: 'T', ayrimlar: [''] });											/* fasona gonderim */
			dizici({ ozelTip: 'IR', gcTipi: 'T', ayrimlar: [''] })											/* irsaliyeli trf */
		}
		for (const ozelTip in ozelTip2GC2Ayrimlar) {
			const gc2Ayrimlar = ozelTip2GC2Ayrimlar[ozelTip];
			for (const gcTipi in gc2Ayrimlar) {
				const ayrimlar = Object.keys(gcTipi[gcTipi] || {});
				or.add(new MQAndClause([
					{ degerAta: ozelTip, saha: `${aliasVeNokta}ozeltip` },
					{ degerAta: gcTipi, saha: `${aliasVeNokta}gctipi` },
					{ inDizi: ayrimlar, saha: `${aliasVeNokta}fisekayrim` }
				]).parantezli())
			}
		}
		if (!$.isEmptyObject(or.liste)) { wh.add(or) }
	}
	tbWhereClauseDuzenle_sutMakbuzFis(e) { e = e || {}; const wh = e.where; wh.add(`ust.fistipi = 'M'`) }
	tbWhereClauseDuzenle_srMustahsilMakbuzFis(e) {
		e = e || {}; const {alias, aliasVeNokta} = e, wh = e.where;
		wh.add(`${aliasVeNokta}piftipi = 'F'`, `${aliasVeNokta}almsat = 'M'`, `${aliasVeNokta}iade = ''`, `${aliasVeNokta}ayrimtipi = 'SM'`)
	}
}
