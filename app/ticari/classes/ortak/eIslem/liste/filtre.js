class EIslemFiltre extends Secimler {
	constructor(e) {
		e = e || {}; super(e)
		$.extend(this, { eConf: e.eConf ?? MQEConf.instance })
	}
	static getBelgeTipText(e) {
		let rec = e.rec || e;
		const psTip = (rec.pstip || rec.psTip || rec.psTipStr || '').trim(), pifTipi = (rec.piftipi || rec.pifTipi || '').trim(), almSat = (rec.almsat || rec.almSat || '').trim();
		const iade = (rec.iade || '').trim(), ayrimTipi = (rec.ayrimTipi || rec.ayrimTipi || '').trim();
		if (psTip == 'S') {												/* S: sipfis */
			if (almSat == 'T') { switch (ayrimTipi) { case 'IH': return 'İhracat Fatura'; case 'EM': return 'Emanet Fatura' } }
			return null
		}
		if (psTip == 'ST') {											/* ST: stfis */
			if (ayrimTipi == 'SB' || pifTipi == 'SB') return 'Şube Transfer'
			if (ayrimTipi == 'SC' || pifTipi == 'SC') return 'Plasiyer Teslim'
			if (ayrimTipi == 'IR' || pifTipi == 'IR') return 'İrsaliyeli Transfer'
			if (ayrimTipi == 'FS' || pifTipi == 'FS') return 'Fasona Malzeme Çıkış'
			return 'Plasiyere Teslim'
		}
		if (psTip == 'SM') return 'Süt Makbuz'
		if (psTip == 'SR') return 'Sürü Müstahsil'
		if (pifTipi == 'P') return 'Mağaza Satış'
		// Normal Satış veya Alım İADE
		const alimmi = almSat == 'A', iademi = iade == 'I', atText = alimmi ? 'Alım' : 'Satış', iadePrefix = iademi ? ' İADE' : '', ifText = (pifTipi == 'I' ? 'İrsaliye' : 'Fatura');
		switch (ayrimTipi) {
			case '': return `${atText}${iadePrefix} ${ifText}`;
			case 'IK': return `${atText} İhraç Kaydıyla${iadePrefix} ${ifText}`;
			case 'EM': return `${atText} Emanet${iadePrefix} ${ifText}`;
			case 'FS': return `${atText} Fason${iadePrefix} ${ifText}`;
			case 'KN': return `${atText} Konsinye${iadePrefix} ${ifText}`;
			case 'IH': return `${alimmi ? 'İthalat' : 'İhracat'}${iadePrefix} ${ifText}`;
		}
		return `${atText}${iadePrefix} ${ifText}`
	}
	getQueryStm(e) {
		e = e || {}; const uni = new MQUnionAll(), stm = new MQStm({ sent: uni });
		const _e = $.extend({}, e, { stm, uni }); this.queryStmDuzenle(_e); return _e.stm
	}
	queryStmDuzenle(e) {
		e = e || {}; e.alias = e.alias || 'fis';
		const {eConf} = this, {stm, uni} = e;
		const sentEkle = __e => {
			const _e = $.extend({}, e, __e); /* e: { fisTablo psTipStr ifSql efAyrimTipiClause } */
			const wh = this.getTBWhereClause(_e); if (!wh) { return null }
			const {fisTablo, alias, psTip, ifSql, efAyrimTipiClause} = _e;
			const sent = new MQSent({
				from: `${fisTablo} ${alias}`, where: [ { birlestir: wh } ],
				sahalar: [
					`${MQSQLOrtak.sqlServerDegeri(psTip)} pstip`, `${ifSql} piftipi`, `${efAyrimTipiClause} efayrimtipi`, `${alias}.kaysayac`, `${alias}.almsat`, `${alias}.iade`, `${alias}.ayrimtipi`, `${alias}.tarih`, `${alias}.fisnox`,
					`${alias}.ticmust mustkod`, `car.birunvan`, `${alias}.efatuuid`, `${alias}.efgonderimts`, `${alias}.efatonaydurumu`, `${alias}.net sonucbedel`, `car.vkno vkn`
				]
			});
			sent.fis2TicCariBagla(); if (eConf) { eConf.eIslListeSentDuzenle($.extend({}, e, { sent })) }
			uni.add(sent); return sent
		};
		const fisGenelAyrimTipiClause = `(case when fis.ayrimtipi = 'IH' then 'IH' when fis.efayrimtipi = '' then 'A' else fis.efayrimtipi end)`;
		sentEkle({ fisTablo: 'piffis', psTip: 'P', ifSql: 'fis.piftipi', efAyrimTipiClause: `(case when fis.piftipi = 'I' then 'IR' when fis.almsat = 'M' then 'MS' else ${fisGenelAyrimTipiClause} end)` });
		sentEkle({ fisTablo: 'sipfis', psTip: 'S', ifSql: `'F'`, efAyrimTipiClause: fisGenelAyrimTipiClause });
		(() => {
			const alias = 'fis', wh = this.getTBWhereClause({ psTip: 'ST' }); if (!wh) { return }
			const sent = new MQSent({
				from: `stfis ${alias}`, where: [ { birlestir: wh } ],
				sahalar: [
					`'ST' pstip`, `fis.ozeltip piftipi`, `'IR' efayrimtipi`, `${alias}.kaysayac`, `'T' almsat`, `'' iade`, `${alias}.fisekayrim ayrimtipi`, `${alias}.tarih`, `${alias}.fisnox`,
					`'' mustkod`, `'' birunvan`, `${alias}.efatuuid`, `${alias}.efgonderimts`, `${alias}.efatonaydurumu`, `0 sonucbedel`,
					`(case when fis.fisekayrim = 'SC' then ${MQSQLOrtak.sqlServerDegeri(VergiNo.perakendeVKN)} else ${MQSQLOrtak.sqlServerDegeri(app.params.isyeri.vergiVeyaVKN || '')} end) vkn`
				]
			}); uni.add(sent)
		})();
		(() => {
			const alias = 'fis', ustAlias = 'ust', wh = this.getTBWhereClause({ psTip: 'SM' }); if (!wh) { return }
			const sent = new MQSent({
				from: `topmakbuzara ${alias}`,
				fromIliskiler: [
					{ from: `topmakbuzfis ${ustAlias}`, iliski: `${alias}.fissayac = ${ustAlias}.kaysayac` },
					{ from: `carmst car`, iliski: `${alias}.mustahsilkod = car.must` }
				],
				where: [ { birlestir: wh } ],
				sahalar: [
					`'SM' pstip`, `'' piftipi`, `'MS' efayrimtipi`, `${alias}.kaysayac`, `'T' almsat`, `'' iade`, `'' ayrimtipi`, `${ustAlias}.tarih`, `${alias}.makbuznox fisnox`,
					`${alias}.mustahsilkod mustkod`, `car.birunvan`, `${alias}.efatuuid`, `${alias}.efgonderimts`, `${alias}.efatonaydurumu`, `0 sonucbedel`, `car.vkno vkn`
				]
			}); uni.add(sent)
		})();
		sentEkle({ fisTablo: 'piffis', psTip: 'SR', ifSql: `fis.piftipi`, efAyrimTipiClause: `'MS'` })
	}
	listeOlustur(e) {
		super.listeOlustur(e); this.grupTopluEkle([ { kod: 'PRG', aciklama: 'Yazılımsal', renk: '#111', zeminRenk: '#eee', kapali: true } ])
		const ayBasi = today().addMonths(-1); ayBasi.setDate(1); const {liste} = e;
		$.extend(liste, {
			uygunOlmayanlarGosterilirmiFlag: new SecimBool({ etiket: 'Seri-No Yıl Uygun OLMAYANLAR da gösterilsin' }),
			eIslemBirKismi: new SecimBirKismi({ etiket: 'e-İşlem', tekSecimSinif: EIslemTip }),
			sube: new SecimBirKismi({ etiket: 'Fiş Şubesi', mfSinif: MQSube }),
			tarih: new SecimDate({ etiket: 'Tarih', basi: ayBasi }),
			seri: new SecimString({ etiket: 'Seri' }),
			no: new SecimInteger({ etiket: 'No' }),
			must: new SecimString({ etiket: 'Müşteri', mfSinif: MQCari }),
			mustUnvan1: new SecimOzellik({ etiket: 'Müşteri Ünvan 1' }),
			gonderimDurumSecim: new SecimTekSecim({ etiket: 'Gönderim Durumu', tekSecim: new BuDigerVeHepsi(['Bekleyenler', 'GÖNDERİLENLER']) }),
			gonderimTarihi: new SecimDate({ etiket: 'Gönderim Tarihi' }),
			akibetDurumBirKismi: new SecimBirKismi({ etiket: 'Akıbet', tekSecimSinif: EIslemOnayDurum }),
			uuid: new SecimString({ etiket: 'UUID' }),
			fisSayac: new SecimInteger({ etiket: 'VIO ID (fisSayac)', grupKod: 'PRG' })
		})
	}
	tbWhereClauseDuzenle(e) {
		e = e || {}; const {alias, aliasVeNokta} = e, {eIslemBirKismi} = this;
		let eIslemTipSet = eIslemBirKismi.value; eIslemTipSet = e.eIslemTipSet = $.isEmptyObject(eIslemTipSet) ? null : asSet(eIslemTipSet);
		let wh = e.where; this.tbWhereClauseDuzenle_basit(e); this.tbWhereClauseDuzenle_eIslem(e);
		const psTip = e.psTip || e.psTipStr || e.psTipKod; let result;
		switch (psTip) {
			case 'P': this.tbWhereClauseDuzenle_pifFis(e); break
			case 'S': this.tbWhereClauseDuzenle_sipFis(e); break
			case 'ST': this.tbWhereClauseDuzenle_stFis(e); break
			case 'SM': this.tbWhereClauseDuzenle_sutMakbuzFis(e); break
			case 'SR': this.tbWhereClauseDuzenle_srMustahsilMakbuzFis(e); break
		}
		wh = e.where; if (!wh) { return }
		const _e = $.extend({}, e, { where: new MQWhereClause() }); this.tbWhereClauseDuzenle_cari(_e); const cariWh = _e.where;
		if (cariWh && !$.isEmptyObject(cariWh.liste)) { if (psTip == 'ST') { e.where = null; return } wh.birlestir(cariWh) }
	}
	tbWhereClauseDuzenle_basit(e) {
		e = e || {}; super.tbWhereClauseDuzenle(e);
		const psTip = e.psTip || e.psTipStr || e.psTipKod, {alias, aliasVeNokta} = e, wh = e.where;
		wh.birKismi(this.eIslemBirKismi, `${aliasVeNokta}...`);
		if (psTip == 'SM') { this.tbWhereClauseDuzenle_sutMakbuz(e) }
		else { this.tbWhereClauseDuzenle_ortak(e) }
		wh.basiSonu(this.fisSayac, `${aliasVeNokta}kaysayac`)
	}
	tbWhereClauseDuzenle_ortak(e) {
		e = e || {}; const {alias, aliasVeNokta} = e, wh = e.where;
		wh.addAll(`${aliasVeNokta}silindi = ''`, `${aliasVeNokta}ozelisaret <> '*'`);
		if (!this.uygunOlmayanlarGosterilirmiFlag.value) { wh.addAll(`LEN(${aliasVeNokta}seri) = 3`, `${aliasVeNokta}noyil > 0`) }
		wh.birKismi(this.sube, `${aliasVeNokta}bizsubekod`);
		wh.basiSonu(this.tarih, `${aliasVeNokta}tarih`);
		wh.basiSonu(this.seri, `${aliasVeNokta}seri`);
		wh.basiSonu(this.no, `${aliasVeNokta}no`)
	}
	tbWhereClauseDuzenle_sutMakbuz(e) {
		e = e || {}; const {alias, aliasVeNokta} = e, ustAliasVeNokta = 'ust.', wh = e.where;
		wh.addAll(`${ustAliasVeNokta}silindi = ''`, `${ustAliasVeNokta}ozelisaret <> '*'`);
		if (this.uygunOlmayanlarGosterilirmiFlag.value) wh.addAll(`LEN(${aliasVeNokta}makbuzseri) = 3`, `${aliasVeNokta}makbuznoyil > 0`)
		wh.birKismi(this.sube, `${ustAliasVeNokta}bizsubekod`);
		wh.basiSonu(this.tarih, `${ustAliasVeNokta}tarih`);
		wh.basiSonu(this.seri, `${aliasVeNokta}makbuzseri`);
		wh.basiSonu(this.no, `${aliasVeNokta}makbuzno`)
	}
	tbWhereClauseDuzenle_cari(e) {
		e = e || {}; const {alias, aliasVeNokta} = e, wh = e.where;
		wh.basiSonu(this.must, `${aliasVeNokta}must`);
		wh.ozellik(this.mustUnvan1, 'car.birunvan')
	}
	tbWhereClauseDuzenle_eIslem(e) {
		e = e || {}; const {eIslemTipSet, alias, aliasVeNokta} = e, wh = e.where;
		if (eIslemTipSet && (eIslemTipSet.E || eIslemTipSet.A)) eIslemTipSet[''] = true
		wh.add(`${aliasVeNokta}efayrimtipi <> 'BL'`);
		wh.basiSonu(this.gonderimTarihi, `${aliasVeNokta}efgonderimts`);
		if (!$.isEmptyObject(eIslemTipSet)) { wh.birKismi(Object.keys(eIslemTipSet), `${aliasVeNokta}efayrimtipi`) }
		wh.birKismi(this.akibetDurumBirKismi, `${aliasVeNokta}efatonaydurumu`);
		wh.basiSonu(this.uuid, `${aliasVeNokta}efatuuid`);
		const gonderimDurum = this.gonderimDurumSecim.tekSecim;
		if (!gonderimDurum.hepsimi) wh.add(`${aliasVeNokta}efgonderimts IS${gonderimDurum.digermi ? ' NOT' : ''} NULL`)
	}
	tbWhereClauseDuzenle_pifFis(e) {
		e = e || {}; const pifGenelAyrimlar = ['', 'IK', 'KN', 'FS'];															/* normal, ihrac kay, kons, fason */
		const pifGenelAyrimlarVeIhracat = $.merge($.merge([], pifGenelAyrimlar), ['IH']), pifTipi2AlimSat2Iade2Ayrimlar = {};
		const dizici = e => {
			const {pifTipi, almSat, iade, ayrimlar} = e;
			const almSat2Iade2Ayrimlar = pifTipi2AlimSat2Iade2Ayrimlar[pifTipi] = pifTipi2AlimSat2Iade2Ayrimlar[pifTipi] || {};
			const iade2Ayrimlar = almSat2Iade2Ayrimlar[almSat] = almSat2Iade2Ayrimlar[almSat] || {};
			const _ayrimlar = iade2Ayrimlar[iade] = iade2Ayrimlar[iade] || {};
			if (!$.isEmptyObject(ayrimlar)) $.extend(_ayrimlar, ($.isArray(ayrimlar) ? asSet(ayrimlar) : ayrimlar))
		};
		const {eIslemTipSet} = e;
		if (!eIslemTipSet || (eIslemTipSet.A || eIslemTipSet.E)) {
			dizici({ pifTipi: 'F', almSat: 'T', iade: '', ayrimlar: pifGenelAyrimlar });
			dizici({ pifTipi: 'F', almSat: 'A', iade: 'I', ayrimlar: pifGenelAyrimlar })
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
						{ degerAta: pifTipi, saha: `${aliasVeNokta}piftipi` }, { degerAta: almSat, saha: `${aliasVeNokta}almsat` },
						{ degerAta: iade, saha: `${aliasVeNokta}iade` }, { inDizi: ayrimlar, saha: `${aliasVeNokta}ayrimtipi` }
					]).parantezli())
				}
			}
		}
		if (!$.isEmptyObject(or.liste)) { wh.add(or) }
	}
	tbWhereClauseDuzenle_sipFis(e) {
		e = e || {}; const ozelTip2AlimSat2Ayrimlar = {};
		const dizici = e => {
			const {ozelTip, almSat, ayrimlar} = e, almSat2Ayrimlar = ozelTip2AlimSat2Ayrimlar[ozelTip] = ozelTip2AlimSat2Ayrimlar[ozelTip] || {};
			const _ayrimlar = almSat2Ayrimlar[almSat] = almSat2Ayrimlar[almSat] || {}; if (!$.isEmptyObject(ayrimlar)) { $.extend(_ayrimlar, ($.isArray(ayrimlar) ? asSet(ayrimlar) : ayrimlar)) }
		};
		const {eIslemTipSet} = e;
		if (!eIslemTipSet || (eIslemTipSet.A || eIslemTipSet.E)) { dizici({ ozelTip: 'E', almSat: 'T', ayrimlar: ['EM'] }) }
		if (!eIslemTipSet || eIslemTipSet.IH) { dizici({ ozelTip: 'V', almSat: 'T', ayrimlar: ['IH'] }) }
		const {alias, aliasVeNokta} = e, wh = e.where, or = new MQOrClause();
		for (const ozelTip in ozelTip2AlimSat2Ayrimlar) {
			const almSat2Ayrimlar = ozelTip2AlimSat2Ayrimlar[ozelTip];
			for (const almSat in almSat2Ayrimlar) {
				const ayrimlar = Object.keys(almSat2Ayrimlar[almSat] || {});
				or.add(new MQAndClause([ { degerAta: ozelTip, saha: `${aliasVeNokta}ozeltip` }, { degerAta: almSat, saha: `${aliasVeNokta}almsat` }, { inDizi: ayrimlar, saha: `${aliasVeNokta}ayrimtipi` } ]).parantezli())
			}
		}
		if (!$.isEmptyObject(or.liste)) { wh.add(or) }
	}
	tbWhereClauseDuzenle_stFis(e) {
		e = e || {}; const ozelTip2GC2Ayrimlar = {};
		const dizici = e => {
			const {ozelTip, gcTipi, ayrimlar} = e, gc2Ayrimlar = ozelTip2GC2Ayrimlar[ozelTip] = ozelTip2GC2Ayrimlar[ozelTip] || {};
			const _ayrimlar = gc2Ayrimlar[gcTipi] = gc2Ayrimlar[gcTipi] || {}; if (!$.isEmptyObject(ayrimlar)) { $.extend(_ayrimlar, ($.isArray(ayrimlar) ? asSet(ayrimlar) : ayrimlar)) }
		};
		const {eIslemTipSet} = e;
		if (!eIslemTipSet || eIslemTipSet.IR) {
			dizici({ ozelTip: 'SB', gcTipi: 'T', ayrimlar: [''] });											/* subeler arasi trf */
			dizici({ ozelTip: '', gcTipi: 'T', ayrimlar: ['SC'] });											/* plas,yer teslim */
			dizici({ ozelTip: 'FS', gcTipi: 'T', ayrimlar: [''] });											/* fasona gonderim */
			dizici({ ozelTip: 'IR', gcTipi: 'T', ayrimlar: [''] })											/* irsaliyeli trf */
		}
		
		const {alias, aliasVeNokta} = e, wh = e.where, or = new MQOrClause();
		for (const ozelTip in ozelTip2GC2Ayrimlar) {
			const gc2Ayrimlar = ozelTip2GC2Ayrimlar[ozelTip];
			for (const gcTipi in gc2Ayrimlar) {
				const ayrimlar = Object.keys(gcTipi[gcTipi] || {});
				or.add(new MQAndClause([ { degerAta: ozelTip, saha: `${aliasVeNokta}ozeltip` }, { degerAta: gcTipi, saha: `${aliasVeNokta}gctipi` }, { inDizi: ayrimlar, saha: `${aliasVeNokta}fisekayrim` } ]).parantezli())
			}
		}
		if (!$.isEmptyObject(or.liste)) { wh.add(or) }
	}
	tbWhereClauseDuzenle_sutMakbuzFis(e) {
		e = e || {}; const {alias, aliasVeNokta} = e;
		const wh = e.where; wh.add(`${aliasVeNokta}fistipi = 'M'`);
	}
	tbWhereClauseDuzenle_srMustahsilMakbuzFis(e) {
		e = e || {}; const {alias, aliasVeNokta} = e, wh = e.where;
		wh.add(`${aliasVeNokta}piftipi = 'F'`, `${aliasVeNokta}almsat = 'M'`, `${aliasVeNokta}iade = ''`, `${aliasVeNokta}ayrimtipi = 'SM'`)
	}
}
