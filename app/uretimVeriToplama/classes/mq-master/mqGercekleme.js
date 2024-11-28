class MQGercekleme extends MQSayacli {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Gerçekleme' } static get table() { return 'opergerdetay' } static get tableAlias() { return 'gdet' }
	static get kodListeTipi() { return 'UGER' } static get localDataBelirtec() { return 'gercekleme' }
	static get silinebilirmi() { return !!config.dev } static get raporKullanilirmi() { return false }
	static get sayacSahaGosterilirmi() { return true } static get iskartaMaxSayi() { return 8 }

	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const {secimler: sec} = e;
		sec.grupTopluEkle([ { kod: 'teknik', aciklama: 'Teknik', renk: '#eee', zeminRenk: 'orangered', kapalimi: true } ]);
		sec.secimTopluEkle({
			iskartaSecim: new SecimTekSecim({ etiket: 'Iskarta', tekSecim: new BuDigerVeHepsi([`<span class="forestgreen">Olanlar</span>`, `<span class="darkred">OLMAYANLAR</span>`]) }),
			hatKod: new SecimString({ etiket: 'Hat', mfSinif: MQHat }),
			hatAdi: new SecimOzellik({ etiket: 'Hat Adı' }),
			tarih: new SecimDate({ etiket: 'Tarih' }),
			// emirNox: new SecimString({ etiket: 'Emir Seri ve No', mfSinif: MQEmir }),
			emirTarih: new SecimDate({ etiket: 'Emir Tarih' }),
			emirNo: new SecimString({ etiket: 'Emir No' }),
			opNo: new SecimInteger({ etiket: 'Oper. No', mfSinif: MQOperasyon }).birKismi(),
			opAdi: new SecimOzellik({ etiket: 'Oper. Adı' }),
			stokKod: new SecimString({ etiket: 'Stok' }),
			stokAdi: new SecimOzellik({ etiket: 'Stok Adı' }),
			miktar: new SecimNumber({ etiket: 'Miktar' }),
			tezgahKod: new SecimString({ etiket: 'Tezgah', mfSinif: MQTezgah }),
			tezgahAdi: new SecimOzellik({ etiket: 'Tezgah Adı' }),
			perKod: new SecimString({ etiket: 'Personel', mfSinif: MQPersonel }),
			perAdi: new SecimOzellik({ etiket: 'Personel Adı' }),
			oemSayac: new SecimNumber({ etiket: 'OEM ID', grupKod: 'teknik' })
		});
		sec.whereBlockEkle(e => {
			const {aliasVeNokta, sayacSaha} = this, {where: wh, secimler: sec} = e, gridPart = e.gridPart ?? e.sender, {oemSayacListe} = gridPart || {};
			wh.basiSonu({ basi: sec.tarih.basi }, `${aliasVeNokta}detbasts`);
			wh.basiSonu({ sonu: sec.tarih.sonu }, `${aliasVeNokta}detbitts`);
			wh.basiSonu(sec.hatKod, 'oem.ismrkkod');
			wh.basiSonu(sec.hatAdi, `uhat.aciklama`);
			wh.basiSonu(sec.emirTarih, 'emr.tarih');
			wh.basiSonu(sec.emirNo, 'emr.fisnox');
			wh.basiSonu(sec.opNo, `oem.opno`);
			wh.basiSonu(sec.opAdi, `op.aciklama`);
			wh.basiSonu(sec.stokKod, `frm.formul`);
			wh.basiSonu(sec.stokAdi, `stk.aciklama`);
			wh.basiSonu(sec.miktar, `${aliasVeNokta}miktar`);
			wh.basiSonu(sec.tezgahKod, `${aliasVeNokta}tezgahkod`);
			wh.basiSonu(sec.tezgahAdi, `tez.aciklama`);
			wh.basiSonu(sec.perKod, `${aliasVeNokta}perkod`);
			wh.basiSonu(sec.perAdi, `per.aciklama`);
			wh.basiSonu(sec.oemSayac, `${aliasVeNokta}${sayacSaha}`);
			if (oemSayacListe) { wh.inDizi(oemSayacListe, `${aliasVeNokta}fissayac`) }
		})
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); const {args} = e; $.extend(args, { showFilterRow: true, rowsHeight: 65 }) }
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); const {liste} = e;
		if (config.dev) liste.push(this.sayacSaha, 'oemsayac')
		liste.push('detbasts', 'detbitts', 'hatadi', 'emirnox', 'opadi', 'stokadi', 'tezgahadi', 'perAdi', 'miktar', 'ekBilgi')
	}
	static orjBaslikListesiDuzenle(e) {
		e = e || {}; super.orjBaslikListesiDuzenle(e); const {iskartaMaxSayi} = this, {liste} = e, alias = e.alias || this.tableAlias;
		const globalCellsClassName = (colDef, rowIndex, belirtec, value, rec) => `mq-gercekleme ${belirtec}`;
		const belirtec2Bilgi = HMRBilgi.belirtec2Bilgi || {};
		liste.push(...[
			new GridKolon({ belirtec: this.sayacSaha, text: 'Ger. ID', genislikCh: 8, filterType: 'checkedlist', cellClassName: globalCellsClassName }).tipNumerik(),
			new GridKolon({ belirtec: 'oemsayac', text: 'OEM ID', genislikCh: 8, filterType: 'checkedlist', cellClassName: globalCellsClassName }).noSql().tipNumerik(),
			new GridKolon({
				belirtec: 'hatadi', text: 'Hat', minWidth: 100, maxWidth: 230, width: '8%', filterType: 'checkedlist', cellClassName: globalCellsClassName, sql: `${alias}.ismrkkod`,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) =>
					changeTagContent(html, (`<div class="veri">${rec.hatkod}</div><div class="ek-veri">${rec.hatadi}</div>`))
			}).noSql(),
			new GridKolon({
				belirtec: 'emirnox', text: 'Emir', minWidth: 80, maxWidth: 150, width: '7%', sql: 'emr.fisnox', filterType: 'checkedlist', cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) =>
					changeTagContent(html, (`<div class="veri">${asInteger(rec.emirnox)}</div><div class="ek-veri">${dateKisaString(asDate(rec.emirtarih))}</div>`))
			}).noSql().tipNumerik(),
			new GridKolon({
				belirtec: 'opadi', text: 'Operasyon', minWidth: 100, maxWidth: 250, width: '9%', filterType: 'checkedlist', cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) =>
					changeTagContent(html, (`<div class="veri">${value}</div><div class="ek-veri">${rec.opno}</div>`))
			}).noSql().tipNumerik(),
			new GridKolon({
				belirtec: 'stokadi', text: 'Ürün', minWidth: 150, maxWidth: 600, width: '25%', sql: 'frm.formul', filterType: 'checkedlist', cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) =>
					changeTagContent(html, (`<div class="veri">${rec.stokkod}</div><div class="ek-veri">${rec.stokadi} ${rec.stokbrm}</div>`))
			}).noSql(),
			new GridKolon({
				belirtec: 'tezgahadi', text: 'Tezgah', minWidth: 100, maxWidth: 250, width: '8%', filterType: 'checkedlist', cellClassName: globalCellsClassName, sql: `${alias}.tezgahkod`,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) =>
					changeTagContent(html, (`<div class="veri">${rec.tezgahkod}</div><div class="ek-veri">${rec.tezgahadi}</div>`))
			}).noSql(),
			new GridKolon({
				belirtec: 'peradi', text: 'Personel', minWidth: 100, maxWidth: 300, width: '10%', filterType: 'checkedlist', cellClassName: globalCellsClassName, sql: `${alias}.perkod`,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) =>
					changeTagContent(html, (`<div class="veri">${rec.perkod}</div><div class="ek-veri">${rec.perAdi}</div>`))
			}).noSql(),
			new GridKolon({
				belirtec: 'detbasts', text: 'Başlangıç', minWidth: 80, maxWidth: 150, width: 100, filterType: 'date', filterCondition: 'greater_than_or_equal', cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					value = asDate(value); return changeTagContent(
						html, (`<div class="veri">${dateKisaString(value)}</div><div class="ek-veri">${timeKisaString(value)}</div>`))
				}
			}),
			new GridKolon({
				belirtec: 'detbitts', text: 'Bitiş', minWidth: 80, maxWidth: 150, width: 100, filterType: 'date', filterCondition: 'greater_than_or_equal', cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					value = asDate(value); return changeTagContent(
						html, (`<div class="veri">${dateKisaString(value)}</div><div class="ek-veri">${timeKisaString(value)}</div>`))
				}
			}),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', minWidth: 70, maxWidth: 130, width: 130, /* filterType: 'checkedlist' */ cellClassName: globalCellsClassName }).tipDecimal(),
			new GridKolon({
				belirtec: 'ekBilgi', text: 'Ek Bilgi', minWidth: 40, maxWidth: 500, width: '20%', filterType: 'input', cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const htmlListe = [],  ekOzellikler = rec.ekOzellikler || {};
					if (!$.isEmptyObject(ekOzellikler)) {
						let subHTMLListe = []; for (let [key, value] of Object.entries(ekOzellikler)) {
							if (!value) { continue } if (key?.toLowerCase().endsWith('kod')) { key = key.slice(0, -3) }
							subHTMLListe.push(
								`<div class="ekOzellik">
									<span class="etiket">${key}</span><span class="ek-bilgi">: </span><span class="veri">${value.toLocaleString()}</span>
								</div>`
							)
						}
						if (subHTMLListe.length) {
							htmlListe.push(
								`<li class="ekOzellikler flex-row">
									<div class="title">Ek Özellikler</div><div class="ek-bilgi">: </div>
									<div class="content flex-row">${subHTMLListe.join('')}</div>
								</li>`
							)
						}
					}
					const {iskartalar} = rec; if (!$.isEmptyObject(iskartalar)) {
						const subHTMLListe = []; for (const kod in iskartalar) {
							subHTMLListe.push(
								`<div class="iskarta">
									<span class="etiket">${kod}</span><span class="ek-bilgi">: </span><span class="veri">${(iskartalar[kod] || 0).toLocaleString()}</span>
								</div>`)
						}
						htmlListe.push(
							`<li class="iskartalar flex-row">
								<div class="title">Iskartalar</div><span class="ek-bilgi">: </span>
								<div class="content flex-row">${subHTMLListe.join('')}</div>
							</li>`
						)
					}
					return changeTagContent(html, ( htmlListe.length ? `<ul>${htmlListe.join('\r\n')}</ul>` : '' ))
				}
			}).noSql()
		])
	}
	static loadServerData_queryDuzenle(e) {
		e = e || {}; super.loadServerData_queryDuzenle(e); const {stm} = e, {sayacSaha, iskartaMaxSayi} = this, alias = e.alias || this.tableAlias;
		for (const sent of stm.getSentListe()) {
			sent.fromIliski('tekilmakina tez', `${alias}.tezgahkod = tez.kod`);
			sent.fromIliski('personel per', `${alias}.perkod = per.kod`);
			sent.fromIliski('operemri oem', `${alias}.fissayac = oem.kaysayac`);
			sent.fromIliski('emirdetay edet', 'oem.emirdetaysayac = edet.kaysayac');
			sent.fromIliski('isemri emr', 'edet.fissayac = emr.kaysayac');
			sent.fromIliski('ismerkezi uhat', 'oem.ismrkkod = uhat.kod');
			sent.fromIliski('operasyon op', 'oem.opno = op.opno');
			sent.fromIliski('urtfrm frm', 'edet.formulsayac = frm.kaysayac');
			sent.fromIliski('stkmst stk', 'frm.formul = stk.kod');
			sent.sahalar.add(
				`oem.ismrkkod hatkod`, `uhat.aciklama hatadi`, `emr.tarih emirtarih`, `emr.fisnox emirnox`, `oem.opno`, `${alias}.tezgahkod`, `${alias}.perkod`, `frm.formul stokkod`,
				`oem.kaysayac oemsayac`, `emr.tarih emirtarih`, `op.aciklama opadi`, `stk.aciklama stokadi`, `stk.brm stokbrm`,
				`tez.aciklama tezgahadi`, `per.aciklama peradi`, `gdet.*`
			);
			for (let i = 1; i <= iskartaMaxSayi; i++) { sent.sahalar.add(`iskartaneden${i}kod`, `iskartamiktar${i}`) }
			const kodEkle = true, adiEkle = true; sent.har2HMRBagla({ alias, kodEkle, adiEkle });
		}
		const {orderBy} = stm; orderBy.liste.unshift(`${alias}.${sayacSaha} DESC`)
		orderBy.liste = orderBy.liste.filter(x => !x.includes('ekBilgi'))
	}
	static async loadServerData_querySonucu(e) {
		const sec = e.secimler, tSecIskarta = sec?.iskartaSecim?.tekSecim;
		let recs = await super.loadServerData_querySonucu(e); if (recs) {
			const {iskartaMaxSayi} = this, {ekOzellikSahalar} = MQBarkodRec;
			for (const rec of recs) {
				for (const key of ['detbasts', 'detbitts', 'emirtarih']) { let value = rec[key]; if (value && typeof value == 'string') value = rec[key] = asDate(value) }
				const iskartalar = rec._iskartalar = {};
				for (let i = 1; i <= iskartaMaxSayi; i++) {
					const kod = rec[`iskartaneden${i}kod`], miktar = rec[`iskartamiktar${i}`];
					if (kod && miktar) { iskartalar[kod] = miktar } delete rec[`iskartaneden${i}kod`]; delete rec[`iskartamiktar$${i}`]
				}
				const ekOzellikler = rec.ekOzellikler = {}; for (let key of ekOzellikSahalar ?? []) {
					const keyLower = key.toLowerCase(), kod = rec[`${keyLower}kod`] ?? rec[keyLower], adi = rec[`${keyLower}adi`];
					const text = adi || kod; ekOzellikler[key] = text
				}
			}
		}
		if (tSecIskarta && !tSecIskarta.hepsimi) { recs = recs.filter(rec => tSecIskarta.bumu ? !$.isEmptyObject(rec._iskartalar) : $.isEmptyObject(rec._iskartalar)) }
		return recs
	}
	static gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); const part = e.sender, sec = part.secimler, {fbd_iskartaOlanlarmi} = part;
		if (sec && fbd_iskartaOlanlarmi) {
			const input = fbd_iskartaOlanlarmi.layout.children('input'), secValue = sec.iskartaSecim.tekSecim.bumu;
			if (input.is(':checked') != secValue) { input.prop('checked', secValue) }
		}
	}
	static rootFormBuilderDuzenleSonrasi_listeEkrani(e) {
		super.rootFormBuilderDuzenleSonrasi_listeEkrani(e); const rfb = e.rootBuilder;
		this.fbd_listeEkrani_addCheckBox(rfb, {
			id: 'iskartaOlanlar', text: 'Iskarta', value: e => e.builder.rootPart.secimler.iskartaSecim.tekSecim.bumu,
			handler: e => {
				const {builder} = e; let part = e.part ?? builder.rootPart; if (!part?.secimler && part.parentPart) { part = part.parentPart }
				const sec = part.secimler, {secimlerPart} = part, input = builder.layout.children('input'), value = sec.iskartaSecim.value = input.is(':checked');
				part.tazeleDefer()
			},
			onAfterRun: e => e.builder.rootPart.fbd_iskartaOlanlarmi = e.builder
		});
		this.fbd_listeEkrani_addButton(rfb, 'iskarta', 'ISKARTA', 100, e => this.iskartaIstendi(e));
		this.fbd_listeEkrani_addButton(rfb, 'kalite', 'KALİTE', 100, e => this.kaliteIstendi(e))
	}
	static async iskartaIstendi(e) {
		const {builder} = e, part = builder.part || builder.rootPart, {gridWidget} = part, {table, sayacSaha, iskartaMaxSayi} = this;
		const gridRec = part.selectedRec, oemSayac = (gridRec || {})[sayacSaha];
		if (!oemSayac) { hConfirm('Uygun bilgi yok', ' '); return }
		let sent = new MQSent({ from: table, where: { degerAta: oemSayac, saha: sayacSaha } });
		for (let i = 1; i <= iskartaMaxSayi; i++) sent.sahalar.add(`iskartaneden${i}kod`,`iskartamiktar${i}`)
		const kod2Rec = {},  parentRec = await app.sqlExecTekil(new MQStm({ sent: sent }));
		for (let i = 1; i <= iskartaMaxSayi; i++) {
			const miktar = parentRec[`iskartamiktar${i}`];
			if (miktar) { const kod = parentRec[`iskartaneden${i}kod`]; kod2Rec[kod] = { miktar: miktar } }
		}
		const _part = new IskartaGirisPart({
			parentPart: part, parentRec: $.extend({}, gridRec, parentRec), kod2Rec,
			tamamIslemi: async e => {
				const {kod2Rec} = e || {}, recs = Object.values(kod2Rec) || [];
				const upd = new MQIliskiliUpdate({ from: table, where: { degerAta: oemSayac, saha: sayacSaha } });
				for (let i = 1; i <= iskartaMaxSayi; i++) {
					const rec = recs[i - 1] || {}, {kod, miktar} = rec;
					upd.degerAta(kod || '', `iskartaneden${i}kod`); upd.degerAta(miktar || 0, `iskartamiktar${i}`)
				}
				await app.sqlExecNone(upd); part.tazele()
			}
		});
		_part.run()
	}
	static async kaliteIstendi(e) {
		const {builder} = e, listePart = builder.part || builder.rootPart, {gridWidget} = listePart;
		let rec = listePart.selectedRec; if (rec?._durum == 'removed') { rec = null }
		if (!rec) { hConfirm('Uygun bilgi yok', ' '); return }
		const kaliteYapi = rec.kaliteYapi ?? {}; const part = new KaliteGirisPart({
			parentPart: listePart, parentRec: rec, numuneSayisi: kaliteYapi.numuneSayisi, savedRecs: kaliteYapi.recs,
			tamamIslemi: async _e => await this.kaliteGirisiYapildi($.extend({}, e, _e))
		}); part.run()
	}
	static async kaliteGirisiYapildi(e) {
		const {builder, sender, parentRec, recs, gerSayac, numuneSayisi} = e; if (!gerSayac) throw { isError: true, rc: 'gerSayacEksik', errorText: 'Gerçekleme Kaydı belirsiz' }
		const listePart = e.listePart ?? builder?.part ?? builder?.rootPart, {gridWidget} = listePart, seriBelirtec = 'TAB', numKeyHV = { kod: 'OPERKAL', seri: seriBelirtec };
		const fisKeyHV = { tipkod: 'OP', bizsubekod: parentRec.bizsubekod ?? '', seri: seriBelirtec }, fisHV = $.extend({}, fisKeyHV, {
			no: new MQSQLConst('@sonNo'), basdurum: 'K', sartlidurum: '',		/* basdurum { K = Kabul } | sartlidurum: Şartlı Kabul ise Nedeni */
			opergersayac: gerSayac, olcumsaati: now(), tarih: today(), personelkod: parentRec.perKod || '', ekrannumunesayisi: numuneSayisi
		}), detHVListe = [];
		for (let i = 0; i < recs.length; i++) {
			const rec = recs[i], hv = { fissayac: new MQSQLConst('@fisSayac'), seq: i + 1, olcukod: rec.olcukod, sayideger: rec.ortalama || 0, notlar: (rec.notlar || '').slice(0, 120) };
			let min, max;
			for (let j = 1; j <= numuneSayisi; j++) {
				const key = `sayideger${j}`, buDeger = hv[key] = rec[key] ||0;
				if (min == null || buDeger < min) min = buDeger; if (max == null || buDeger > max) max = buDeger
			}
			$.extend(hv, { sonucmindeger: min || 0, sonucmaxdeger: max || 0 }); detHVListe.push(hv)
		}
		const toplu = new MQToplu().withDefTrn();
		toplu.add(
			`IF NOT EXISTS (`, new MQSent({ from: 'numarator', where: { birlestirDict: numKeyHV }, sahalar: '*' }), `)`,
			new MQInsert({ table: 'numarator', hv: numKeyHV }),
			`WHILE 1 = 1 BEGIN`,
			new MQIliskiliUpdate({ from: 'numarator', where: { birlestirDict: numKeyHV }, set: `sonno = sonno + 1` }),
			new MQSent({ from: 'numarator', where: { birlestirDict: numKeyHV }, sahalar: [`@sonNo = sonno`] }),
			`IF NOT EXISTS (`,
			new MQSent({
				from: 'kalitefis', sahalar: '*',
				where: [ { birlestirDict: fisKeyHV }, { degerAta: new MQSQLConst('@sonNo'), saha: 'no' } ]
			}), `) BREAK`,
			`END`,
			new MQInsert({ table: 'kalitefis', hv: fisHV }),
			new MQSent({
				from: 'kalitefis', sahalar: '@fisSayac = max(kaysayac)',
				where: [ { birlestirDict: fisKeyHV }, { degerAta: new MQSQLConst('@sonNo'), saha: 'no' } ]
			}),
			new MQInsert({ table: 'kalitehar', hvListe: detHVListe })
		)
		const qParams = [
			{ name: '@sonNo', type: 'int', direction: 'output' },
			{ name: '@fisSayac', type: 'int', direction: 'output' }
		];
		const sqlResult = (await app.sqlExecNoneWithResult({ query: toplu, params: qParams })) || [];
		const paramsResult = sqlResult[0]?.params || {}, fisSayac = (paramsResult['@fisSayac'] || {}).value;
		listePart.tazele()
	}
}
