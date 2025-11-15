class MQOnay extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'İskonto Sınır Talep Onayı' } static get table() { return 'sipfis' }
	static get detayTable() { return 'sipstok' } static get tableAlias() { return 'fis' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({
			onayliSiparisleriGosterFlag: new SecimBool({ etiket: 'Onaylı Diğer Siparişleri de göster' }),
			cariTip: new SecimString({ etiket: 'Cari Tip', mfSinif: MQCariTip }),
			mustUnvan: new SecimOzellik({ etiket: 'Müşteri' }),
			stokAdi: new SecimOzellik({ etiket: 'Ürün' })
		});
		sec.whereBlockEkle(e => {
			const {aliasVeNokta, sayacSaha} = this, wh = e.where, sec = e.secimler;
			let or = new MQOrClause([`(fis.onaytipi = 'ON' and har.bdistonayistendi > 0)`]);
			if (sec.onayliSiparisleriGosterFlag.value) { or.add(`har.bdistonayistendi = 0 and har.iskozelsinir > 0`) }
			wh.basiSonu(sec.cariTip, 'car.tipkod');
			wh.add(or); wh.ozellik(sec.mustUnvan, 'car.birunvan'); wh.ozellik(sec.stokAdi, 'stk.aciklama')
		})
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const belirtec = e.dataField, {rec, result} = e;
		if (belirtec == 'onay_sevk') { const {onayDurum} = rec; if (onayDurum) { result.push(rec.sevkmiktar ? 'onay-sevk' : onayDurum) } }
		if (belirtec == 'sonuciskoran' && rec.sonuciskoran) result.push('bold', 'royalblue')
		if (belirtec == 'onayliisksinir' && rec.onayliisksinir) result.push('green')
		if (belirtec == 'bolgeMDSinir' && rec.bolgeMDSinir) result.push('darkred')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e, isMiniDevice = $(window).height() < 750;
		if (isMiniDevice) {
			liste.push(
				new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 6 }).tipDate().noSql(),
				new GridKolon({ belirtec: 'must_il', text: 'Müşteri/İl', genislikCh: 20 }).noSql(),
				new GridKolon({ belirtec: 'urun_grup', text: 'Ürün/Grup', genislikCh: 23 }).noSql(),
				new GridKolon({ belirtec: 'onay_sevk', text: 'Onay/Sevk', genislikCh: 11, filterType: 'checkedlist' }).alignCenter().noSql(),
				new GridKolon({ belirtec: 'miktarText', text: 'Miktar', genislikCh: 6 }).tipDecimal().noSql(),
				new GridKolon({ belirtec: 'fiyat', text: 'Fiyat', genislikCh: 10 }).tipDecimal_fiyat().noSql(),
				new GridKolon({ belirtec: 'sonuciskoran', text: 'Net İsk.', genislikCh: 5, filterType: 'checkedlist' }).tipDecimal(1).noSql(),
				new GridKolon({ belirtec: 'onayliisksinir', text: 'Dist.Snr', genislikCh: 5, filterType: 'checkedlist' }).tipDecimal(1).noSql(),
				new GridKolon({ belirtec: 'bolgeMDSinir', text: 'Blg.Snr', genislikCh: 5, filterType: 'checkedlist' }).tipDecimal(1).noSql(),
				new GridKolon({ belirtec: 'dist_sube', text: 'Dist/Şube', genislikCh: 15, filterType: 'checkedlist' }).noSql()
			)
		}
		else {
			liste.push(
				new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 7 }).tipDate().noSql(),
				new GridKolon({ belirtec: 'must_il', text: 'Müşteri/İl', genislikCh: 40 }).noSql(),
				new GridKolon({ belirtec: 'urun_grup', text: 'Ürün/Grup', genislikCh: 40 }).noSql(),
				new GridKolon({ belirtec: 'onay_sevk', text: 'Onay/Sevk', genislikCh: 11, filterType: 'checkedlist' }).alignCenter().noSql(),
				new GridKolon({ belirtec: 'miktarText', text: 'Miktar', genislikCh: 9 }).tipDecimal().noSql(),
				new GridKolon({ belirtec: 'fiyat', text: 'Fiyat', genislikCh: 13 }).tipDecimal_fiyat().noSql(),
				new GridKolon({ belirtec: 'sonuciskoran', text: 'Net İsk.', genislikCh: 7, filterType: 'checkedlist' }).tipDecimal(1).noSql(),
				new GridKolon({ belirtec: 'onayliisksinir', text: 'Dist.Snr', genislikCh: 7, filterType: 'checkedlist' }).tipDecimal(1).noSql(),
				new GridKolon({ belirtec: 'bolgeMDSinir', text: 'Blg.Snr', genislikCh: 7, filterType: 'checkedlist' }).tipDecimal(1).noSql(),
				new GridKolon({ belirtec: 'dist_sube', text: 'Dist/Şube', genislikCh: 30, filterType: 'checkedlist' }).noSql()
			)
		}
	}
	static orjBaslikListesi_argsDuzenle(e) { $.extend(e.args, { rowsHeight: $(window).height() < 750 ? 70 : 60, groupsExpandedByDefault: true, showFilterRow: false, selectionMode: 'checkbox' })}
	static gridVeriYuklendi(e) {
		const part = e.sender, sec = part.secimler, {fbd_onayliSiparisleriGosterFlag, grid} = part;
		if (sec && fbd_onayliSiparisleriGosterFlag?.layout?.length) {
			const input = fbd_onayliSiparisleriGosterFlag.layout.children('input'), secValue = sec.onayliSiparisleriGosterFlag.value;
			if (secValue != null && input.is(':checked') != secValue) input.prop('checked', secValue)
		}
		grid.jqxGrid('groups', ['dist_sube'])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {stm, sent, aliasVeNokta} = e, {detayTable} = this;
		sent.fromIliski(`${detayTable} har`, `${aliasVeNokta}kaysayac = har.fissayac`);
		sent.leftJoin({ alias: 'har', from: 'sip2ifstok don', on: 'har.kaysayac = don.sipharsayac' });
		sent.fis2SubeBagla().fis2CariBagla().cari2BolgeBagla().cari2IlBagla().har2StokBagla().stok2GrupBagla();
		sent.where.fisSilindiEkle().add(`fis.kapandi = ''`, `har.kapandi = ''`, `sub.isygrupkod > ''`);
		sent.where.subeGecerlilikWhereEkle({ subeKodSql: 'fis.bizsubekod', subeGrupSql: 'sub.isygrupkod' });
		/* sent.where.icerikselCariClauseBagla('car.must'); sent.where.subeGecerlilikWhereEkle({ subeKodSql: 'fis.bizsubekod', subeGrupSql: 'sub.isygrupkod' }) */
		sent.sahalar.liste = [];
		sent.sahalar.add(
			'har.kaysayac harsayac', 'fis.kaysayac fissayac', 'fis.onaytipi', 'fis.fisnox', 'fis.tarih', 'igrp.kod distkod', 'igrp.aciklama distadi', 'sub.kod subekod', 'sub.aciklama subeadi',
			'car.birunvan', 'il.aciklama iladi', 'har.stokkod', 'stk.aciklama stokadi', 'stk.brm', 'grp.aciklama grupadi', 'har.miktar', 'har.fiyat',
			/*'har.sonuciskoran',*/ `(har.sonuciskoran - har.distsonuciskdusulecek) sonuciskoran`, 'har.bdistonayistendi', 'har.iskozelsinir onayliisksinir', 'sum(don.busevkmiktar) sevkmiktar'
		);
		sent.groupByOlustur()
		stm.orderBy.add('tarih', 'fisnox', 'stokadi')
	}
	static async loadServerData(e) {
		e = e || {}; const {globals} = this; let subeVeStok2Sinirlar = globals.subeVeStok2Sinirlar;
		if (subeVeStok2Sinirlar == null) { subeVeStok2Sinirlar = globals.subeVeStok2Sinirlar = this.subelerIcinSinirBelirle(e) }
		const recs = await super.loadServerData(e); /*const recs = await app.sqlExecSelect(`SELECT 1`);*/
		if (subeVeStok2Sinirlar?.then) subeVeStok2Sinirlar = globals.subeVeStok2Sinirlar = await subeVeStok2Sinirlar;
		for (const rec of recs) {
			if (subeVeStok2Sinirlar) { const bolgeMDSinir = subeVeStok2Sinirlar[this.getAnah_subeVeStok(rec)]?.bolgeMd; if (bolgeMDSinir) rec.bolgeMDSinir = bolgeMDSinir }
			const {onayliisksinir, bdistonayistendi, sevkmiktar} = rec, onaylimi = !!onayliisksinir;
			const sevkText = !!sevkmiktar ? 'Sevkedilmiş' : '', onayDurum = onaylimi ? 'onay' : !!bdistonayistendi ? 'talep' : '';
			const onayText = (
				onayDurum == 'onay' ? `<span class="ek-bilgi">Onay: </span><span class="veri bold royalblue">%${onayliisksinir}</span>` :
				onayDurum == 'talep' ? '<span class="veri bold">Talep</span>' : ''
			);
			$.extend(rec, {
				onayDurum, onayText, sevkText,
				dist_sube: (`<div class="parent left flex-row full-width"><div class="item distAdi">${rec.distadi}</div><div class="item ek-bilgi subeAdi">${rec.subeadi}</div></div>`),
				must_il: (`<div class="parent left flex-row full-width"><div class="item mustUnvan">${rec.birunvan}</div><div class="item ek-bilgi ilAdi">${rec.iladi}</div></div>`),
				urun_grup: (
					`<div class="parent left flex-row full-width">` +
						`<div class="item stokKod kod">(${rec.stokkod})</div><div class="item stokAdi">${rec.stokadi}</div>` +
						`<div class="item ek-bilgi grupAdi">${rec.grupadi}</div>` +
					`</div>`
				),
				onay_sevk: (`<div class="parent left flex-row full-width"><div class="item onayText">${onayText}</div><div class="item ek-bilgi sevkText">${sevkText}</div></div>`),
				miktarText: (`<div class="parent left flex-row full-width"><div class="item miktar">${numberToString(rec.miktar)}</div><div class="item ek-bilgi brm">${rec.brm || ''}</div></div>`)
			})
		}
		return recs
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); const rfb = e.rootBuilder;
		this.fbd_listeEkrani_addCheckBox(rfb, {
			id: 'onayliSiparisleriGosterFlag', text: 'Onaylı Diğer Siparişleri de göster',
			value: e => e.builder.rootPart.secimler.onayliSiparisleriGosterFlag.value,
			handler: e => this.onayliSiparisleriGosterFlag_secimDegisti(e),
			onAfterRun: e => e.builder.rootPart.fbd_onayliSiparisleriGosterFlag = e.builder
		});
		this.fbd_listeEkrani_addButton(rfb, 'onaylaVeyaKaldir', 'ONAYLA / KALDIR', 200, e => this.onaylaVeyaKaldirIstendi(e))
	}
	static onayliSiparisleriGosterFlag_secimDegisti(e) {
		const {builder} = e, part = e.part ?? builder.rootPart, sec = part.secimler, {secimlerPart} = part, input = builder.layout.children('input');
		const value = sec.onayliSiparisleriGosterFlag.value = input.is(':checked');
		if (secimlerPart) secimlerPart.secim2Info.onayliSiparisleriGosterFlag.element.children('.veri').val(value);
		setTimeout(() => part.tazele(), 100)
	}
	static onaylaVeyaKaldirIstendi(e) {
		const {sinifAdi} = this, {builder} = e, part = e.part ?? builder.rootPart, {grid, gridWidget, selectedRecs} = part;
		if ($.isEmptyObject(selectedRecs)) { hConfirm('İşlem yapılacak satırlar seçilmelidir', sinifAdi); return }
		$.extend(e, { grid, gridWidget, recs: selectedRecs }); const {globals} = this;
		let onayDurumListe = {}; for (const rec of selectedRecs) onayDurumListe[rec.onayDurum == 'onay'] = true; onayDurumListe = Object.keys(onayDurumListe).map(x => asBool(x));
		if (onayDurumListe.length != 1) { hConfirm(`Seçilen satırların <span class="bold darkred">bir kısmı Onaylı ve bir kısmı Onaysız</span> durumdadır`, sinifAdi); return }
		const onaylimi = e.onaylimi = onayDurumListe[0]; let onayKaldirmi = e.onayKaldir ?? e.onayKaldirmi ?? onaylimi; e.onayKaldirmi = onayKaldirmi; delete e.onayKaldir;
		const title = `${sinifAdi}${onayKaldirmi ? ` <span class="bold lightpink">KALDIR</span>` : ''}`, buttonText = onayKaldirmi ? 'Onay KALDIR' : 'Onayla', renk = onayKaldirmi ? 'lightpink' : 'forestgreen';
		const satirBilgilerHTML = selectedRecs.map(rec => {
			return (
				`<div class="satirBilgi full-width">` +
					`<div class="row tarih"><div class="etiket">Tarih:</div><div class="veri">${asDateAndToKisaString(rec.tarih)}</div></div>` +
					`<div class="row dist_sube"><div class="etiket">Dist / Şube:</div><div class="veri">${rec.dist_sube}</div></div>` +
					`<div class="row must_il"><div class="etiket">Müşteri / İl:</div><div class="veri">${rec.must_il}</div></div>` +
					`<div class="row urun_grup"><div class="etiket">Ürün / Grup:</div><div class="veri">${rec.urun_grup}</div></div>` +
					`<div class="row iskBilgi flex-row">` +
						`<div class="sonucIskOran flex-row"><div class="etiket">Sonuç İsk. Oran:</div><div class="veri">%${numberToString(rec.sonuciskoran)}</div></div>` +
						`<div class="distSinir flex-row"><div class="etiket">Dist. Sınır:</div><div class="veri">%${numberToString(rec.onayliisksinir)}</div></div>` +
						`<div class="bolgeMDSinir flex-row"><div class="etiket">Bölge Sınır:</div><div class="veri">${rec.bolgeMDSinir ? `%${numberToString(rec.bolgeMDSinir)}` : '- Tanımsız -'}</div></div>` +
					`</div>` +
					( !!rec.sevkmiktar ? `<div class="row bold firebrick" style="font-size: 120%; margin-top: 13px">** Sevk edilmiş **</div>` : '' ) +
				`</div>`
			)
		}).join(CrLf);
		const content = $(
			`<div class="full-wh">` +
				`<div class="mesaj bg-whitesmoke">Seçilen <span class="bold royalblue">${selectedRecs.length}</span> satır için <span class="bold ${renk}">${title}</span> yapılacaktır</div>` +
				`<div class="satirBilgiler">${satirBilgilerHTML}</div>` +
				`<div class="renkCizgi" style="background: ${renk}" />` +
			`</div>`
		);
		const args = { isModal: true, width: $(window).width() < 950 ? '90%' : '60%', height: Math.min(500, $(window).height() - 50), showCollapseButton: true };
		let promise = new $.Deferred(); const buttons = {}; buttons[buttonText] = _e => { _e.close(); _e.promise?.resolve(true) };
		const wnd = e.wnd = createJQXWindow({ content, title, args, buttons, promise }); wnd.addClass('mqOnay onaylaVeyaKaldir part');
		wnd.find('div > .jqx-window-header').css('background-color', onayKaldirmi ? 'darkred' : undefined);
		let btn = wnd.find('div > .jqx-window-content > .buttons *:eq(0)'); btn.jqxButton('template', onayKaldirmi ? 'danger' : 'success');
		promise.then(async rdlg => {
			if (rdlg != true) return; let result;
			let timer_progress = setTimeout(() => {
				showProgress(
					`${selectedRecs.length} satır ${onayKaldirmi ? `için <span class="bold" style="color: ${renk}">ONAY KALDIRILIYOR</span>` : `<span class="bold" style="color: ${renk}">ONAYLANIYOR</span>`}...`,
					sinifAdi, true
				)
			}, 500);
			try { result = await this.onaylaVeyaKaldir(e); if (!result) return; if (part?.tazele) part.tazele() }
			catch (ex) { hConfirm(getErrorText(ex), sinifAdi) }
			finally { clearTimeout(timer_progress); timer_progress = null; if (window.progressManager) setTimeout(() => hideProgress(), 500) }
		})
	}
	static async onaylaVeyaKaldir(e) {
		const {recs, onayKaldirmi} = e; if ($.isEmptyObject(recs)) return false
		const toplu = new MQToplu([`DECLARE @sayi INT`]).withDefTrn();
		for (const rec of recs) {
			const harSayac = rec.harsayac, fisSayac = rec.fissayac;
			if (onayKaldirmi) {
				const miktar = rec.sevkmiktar, onayIstendimi = asBool(rec.bdistonayistendi), onayliIskSinir = rec.onayliisksinir;
				if (miktar && (!onayIstendimi && onayliIskSinir)) { throw { isError: true, rc: 'karmaIslem', errorText: `Seçilen satırların <span class="bold darkred">bir kısmı Sevk Edilmiş</span> durumdadır ve onay kaldırılamaz` } }
				toplu.add(
					new MQIliskiliUpdate({ from: 'sipstok', where: { degerAta: harSayac, saha: 'kaysayac' }, set: [`iskozelsinir = 0`, `bdistonayistendi = 1`] }),
					new MQIliskiliUpdate({ from: 'sipfis', where: [{ degerAta: fisSayac, saha: 'kaysayac' }, `onaytipi = ''`], set: `onaytipi = 'ON'` }),
				)
			}
			else {
				const iskOran = rec.sonuciskoran, {bolgeMDSinir} = rec;
				if (bolgeMDSinir != null && iskOran > bolgeMDSinir) { throw { isError: true, rc: 'iskSinir_bolgeMd', errorText: `Bazı satırlarda Onay talebi Bölge Md. sınırından yüksektir<p/>Devam edilemez` } }
				toplu.add(
					new MQIliskiliUpdate({
						from: 'sipstok', where: { degerAta: harSayac, saha: 'kaysayac' },
						set: [ { degerAta: iskOran, saha: 'iskozelsinir' }, `bdistonayistendi = (case when ${MQSQLOrtak.sqlServerDegeri(iskOran)} >= sonuciskoran then 0 else 1 end)` ]
					}),
					new MQSent({ from: 'sipstok', where: { degerAta: fisSayac, saha: 'fissayac' }, sahalar: `@sayi = sum(case when bdistonayistendi > 0 then 1 else 0 end)` }),
					`IF @sayi = 0 BEGIN`,
					new MQIliskiliUpdate({ from: 'sipfis', where: [{ degerAta: fisSayac, saha: 'kaysayac' }, `onaytipi <> ''`], set: `onaytipi = ''` }),
					`END`
				)
			}
		}
		return toplu.liste.length ? await app.sqlExecNone(toplu) : false
	}
	static async subelerIcinSinirBelirle(e) {
		e = e || {}; const {subeEksikleri} = e, result = {};
		let sent = new MQSent({
			from: ['genelkosul kos', 'isyeri sub'],
			fromIliskiler: [{ from: 'genelkosultarife det', iliski: 'kos.kaysayac=det.fissayac' }],
			where: [
				`kos.tipkod = 'DA'`, `kos.devredisi = ''`,
				new MQOrClause([`(kos.subeicinozeldir = 'G' AND sub.isygrupkod = kos.ozelisygrupkod)`, `(kos.subeicinozeldir = '*' AND sub.kod = kos.ozelsubekod)`])
			],
			sahalar: ['sub.kod subekod', 'kos.kod kosulkod', 'kos.tarihb', 'kos.tarihs', 'det.stokkod', 'det.bolgemdsinir', 'det.isksinir']
		});
		if (subeEksikleri) sent.where.inDizi(subeEksikleri, 'sub.kod')
		let stm = new MQStm({ sent, orderBy: ['subekod', 'tarihb desc', 'tarihs', 'kosulkod desc', 'stokkod'] });
		const recs = await app.sqlExecSelect(stm); for (const rec of recs) {
			const subeKod = rec.subekod?.trimEnd(), stokKod = rec.stokkod?.trimEnd(), key = this.getAnah_subeVeStok(subeKod, stokKod);
			result[key] = result[key] ?? { distributor: rec.isksinir, bolgeMd: rec.bolgemdsinir }
		}
		return result
	}
	static getAnah_subeVeStok(e, _stokKod) {
		const subeKod = (typeof e == 'object' ? e.subeKod ?? e.subekod ?? e.bizsubekod : e) ?? '*';
		const stokKod = (typeof e == 'object' ? e.stokKod ?? e.stokkod : _stokKod) ?? '';
		return `${subeKod}|${stokKod}`
		
	}
}
