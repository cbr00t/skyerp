class GelenEIslemListePart extends EIslemListeBasePart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'gelenEIslemListe' }
	static get filtreSinif() { return GelenEIslemFiltre }
	
	constructor(e) { e = e || {}; super(e); this.title = e.title == null ? ( 'Gelen e-İşlem Listesi' ) : e.title || '' }
	islemTuslariDuzenle(e) {
		super.islemTuslariDuzenle(e); const {liste, part} = e;
		liste.unshift(
			{ id: 'bekleyenleriGetir', handler: e => this.bekleyenleriGetirIstendi(e) },
			{ id: 'dosyadanYukle', handler: e => this.dosyadanYukleIstendi(e) },
			{ id: 'ticariFiseDonustur', handler: e => this.ticariFiseDonusturIstendi(e) },
			{ id: 'eIslemIzle', handler: e => this.eIslemIzleIstendi(e) },
			{ id: 'sil', handler: e => this.silIstendi(e) }
		);
		$.extend(part.sagButonIdSet, asSet(['bekleyenleriGetir', 'dosyadanYukle', 'ticariFiseDonustur', 'eIslemIzle', 'sil']))
	}
	gridArgsDuzenleDevam(e) {
		super.gridArgsDuzenleDevam(e); const {args} = e;
		$.extend(args, {
			rowDetails: true, rowDetailsTemplate: rowIndex => {
				return {
					rowdetailsheight: 233,
					rowdetails: `<div class="parent full-wh" style="margin: 5px;"><div class="split full-wh"><div class="dipGrid-parent full-wh"/><div class="detayGrid-parent full-wh"/></div></div>`
				}
			},
			initRowDetails: (rowIndex, _parent, grid, parentRec) => { setTimeout(() => { const parent = $(_parent).children().eq(0); this.initRowDetails({ rowIndex, parent, parentRec }) }, 1) }
		})
	}
	initRowDetails(e) {
		const {grid} = this, {parent, parentRec} = e;
		let form = new FormBuilder({
			id: 'split', layout: parent.children('.split'),
			afterRun: e => {
				const {layout} = e.builder;
				layout.jqxSplitter({ theme: theme, width: '100%', height: '100%', orientation: 'vertical', splitBarSize: 20, panels: [ { min: 300, size: 400 }, { min: '70%' } ] })
			}
		});
		const rowsHeight = 28; form.addGridliGosterici({
			id: 'dipGrid',
			tabloKolonlari: e => {
				const getCSSDuzenleyici = e => {
					e = e || {}; const {duzenleyici} = e, arg_ekCSS = e.ekCSS || [];
					return ((sender, rowIndex, belirtec, value, rec) => {
						let result = [belirtec];
						const ekCSS = []; if (arg_ekCSS.length) ekCSS.push(...arg_ekCSS)
						const _ekCSS = rec.ekCSS; if (_ekCSS && $.isArray(_ekCSS)) ekCSS.push(..._ekCSS)
						if (!$.isEmptyObject(ekCSS)) result.push(...ekCSS)
						if (duzenleyici) { const _e = $.extend({}, e, { sender, rowIndex, belirtec, value, rec, result }); getFuncValue.call(this, duzenleyici, _e); result = _e.result }
						return result.join(' ')
					})
				};
				return [
					new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 13, cellClassName: getCSSDuzenleyici() }),
					new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 13, cellClassName: getCSSDuzenleyici() }).tipDecimal_bedel()
				]
			},
			source: async e => {
				const fisSayac = parentRec.fissayac;
				let sent = new MQSent({
					from: 'efgecicialfatfis', where: { degerAta: fisSayac, saha: 'kaysayac' },
					sahalar: ['dvkod', 'efbrut', 'efiskonto', 'efkdv', 'efsonuc', 'efdvbrut', 'efdviskonto', 'efdvkdv', 'efdvsonuc']
				});
				const rec = await app.sqlExecTekil(sent), dvKod = rec.dvkod, dovizlimi = !!dvKod, result = [];
				const numVeriEkle = (aciklama, bedel, ekCSS) => { if (bedel) result.push({ aciklama, bedel, ekCSS }); return this }
				if (dovizlimi) {
					result.push({ aciklama: '', bedel: `<span class="darkgray">Dvz:</span> <b>${dvKod}</b>`, ekCSS: ['bg-mediumpurple'] });
					numVeriEkle('Dv.Brüt', rec.efdvbrut); numVeriEkle('Dv.Dip.İsk', rec.efdviskonto); numVeriEkle('Dv.KDV', rec.efdvkdv); numVeriEkle('Dv.Sonuç', rec.efdvsonuc, ['bg-lightcyan'])
				}
				numVeriEkle('Brüt', rec.efbrut);
				numVeriEkle('Dip. İskonto', rec.efiskonto); if (rec.efiskonto) result.push({ aciklama: 'Matrah', bedel: (rec.efbrut - rec.efiskonto), ekCSS: ['bg-lightgreen'] })
				numVeriEkle('KDV', rec.efkdv); numVeriEkle('Sonuç', rec.efsonuc, ['bg-lightcyan'])
				return result
			}
		}).rowNumberOlmasin() .widgetArgsDuzenleIslemi(e => e.args.rowsHeight = rowsHeight) .addStyle_fullWH() .setParent(e => e.builder.parentBuilder.layout.find('.dipGrid-parent'));
		
		form.addGridliGosterici({
			id: 'detayGrid',
			tabloKolonlari: [
				new GridKolon({ belirtec: 'efstokadi', text: 'e-Fat Açıklama', minWidth: 300 }),
				new GridKolon({
					belirtec: 'efmiktar', text: 'Miktar', genislikCh: 10,
					cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
						const brm = rec.shbrm; if (brm) html = changeTagContent(html, `${value.toLocaleString()} ${brm}`)
						return html
					}
				}).tipDecimal(),
				new GridKolon({ belirtec: 'fiyat', text: 'Fiyat', genislikCh: 16 }).tipDecimal_fiyat(),
				new GridKolon({ belirtec: 'kdvorani', text: 'KDV %', genislikCh: 6 }).tipNumerik(),
				new GridKolon({ belirtec: 'tevoranx', text: 'Tev.%', genislikCh: 6 }),
				new GridKolon({ belirtec: 'iskoranstr', text: 'İsk.%', genislikCh: 8 }),
				new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 18 }).tipDecimal_bedel(),
				new GridKolon({ belirtec: 'shkod', text: 'Stok/Hizmet Kod', maxWidth: 200 }),
				new GridKolon({ belirtec: 'shadi', text: 'Stok/Hizmet Adı' })
			],
			source: async e => {
				const fisSayac = parentRec.fissayac;
				let sent = new MQSent({ from: 'efgecicialfatdetay har', where: { degerAta: fisSayac, saha: 'har.fissayac' } });
				sent.har2StokBagla(); sent.har2HizmetBagla(); sent.har2DemirbasBagla({ sahaAdi: 'demkod' });
				sent.addWithAlias('har',
					'seq', 'efbarkod', 'efstokkod', 'efstokadi', 'efmiktar', 'fiyat', 'bedel', 'kdvorani', 'iskoranstr', 'tevoranx');
				sent.add(
					`(case when har.tevgibkod = '0' then '' else har.tevgibkod end) tevgibkod`,
					`(case har.shtip when 'H' then har.hizmetkod when 'D' then har.demkod else har.stokkod end) shkod`,
					`(case har.shtip when 'H' then hiz.aciklama when 'D' then dem.aciklama else stk.aciklama end) shadi`,
					`(case har.shtip
						when 'H' then hiz.brm
						when 'D' then dem.brm
						else (case when har.efbirimtipi = '2' then stk.brm2 else stk.brm end)
					 end) shbrm`,
					`(har.irskabuledilmeyen + har.irseksik - har.irsfazla) efgecersizmiktar`
				);
				
				return await app.sqlExecSelect(sent)
			}
		}).widgetArgsDuzenleIslemi(e => e.args.rowsHeight = rowsHeight) .addStyle_fullWH() .setParent(e => e.builder.parentBuilder.layout.find('.detayGrid-parent'));
		// form.addTextInput().setParent(e => e.builder.parentBuilder.layout.find('.detayGrid-parent'));
		form.run()
	}
	get defaultTabloKolonlari() {
		const getCSSDuzenleyici = e => {
			e = e || {};
			const {ekCSS, duzenleyici} = e;
			return ((sender, rowIndex, belirtec, value, rec) => {
				let result = [belirtec]; const {efayrimtipi, efatonaydurumu, efatuuid, tamamlandimi, yazdirildimi} = rec;
				if (!$.isEmptyObject(ekCSS)) { const _liste = $.isArray(ekCSS) ? ekCSS : [ekCSS]; result.push(..._liste) }
				if (efayrimtipi != null) result.push(`eIslTip-${efayrimtipi}`)
				if (efatonaydurumu != null) result.push(`akibet-${efatonaydurumu}`)
				if (tamamlandimi) result.push('tamamlandi')
				if (yazdirildimi) result.push('yazdirildi')
				if (efatuuid) result.push('hasUUID')
				if (duzenleyici) {
					const _e = $.extend({}, e, { sender: sender, rowIndex: rowIndex, belirtec: belirtec, value: value, rec: rec, result: result });
					getFuncValue.call(this, duzenleyici, _e); result = _e.result
				}
				return result.join(' ')
			})
		};
		return $.merge(super.defaultTabloKolonlari, [
			new GridKolon({ belirtec: 'tamamlandimi', text: 'Tamam?', genislikCh: 8, cellClassName: getCSSDuzenleyici() }).tipBool(),
			new GridKolon({ belirtec: 'yazdirildimi', text: 'Yazdır?', genislikCh: 8, cellClassName: getCSSDuzenleyici() }).tipBool(),
			new GridKolon({ belirtec: 'kayitts', text: 'Kayıt<br/>Zamanı', genislikCh: 15, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'eIslTipText', text: 'e-İşlem', genislikCh: 9, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 9, filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }).tipDate(),
			new GridKolon({ belirtec: 'fisnox', text: 'Belge<br/>No', genislikCh: 18, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'akibetText', text: 'Akıbet', genislikCh: 12, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'uuid', text: 'UUID<br/>(ETTN)', genislikCh: 36, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'efmustunvan', text: 'e-İşl.Müşteri', filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'mustText', text: 'Müşteri', filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'sonucbedel', text: 'Sonuç<br/>Bedel', genislikCh: 14, cellClassName: getCSSDuzenleyici() }).tipDecimal_bedel()
		])

		/*
		  'kaysayac fissayac', 'kayitts', 'bizsubekod', 'vkno', 'mustkod', 'takipno', 'efmustunvan', 'althesapkod',
			'yerkod', 'efatuuid', 'tamamlandi', 'bozukmu', 'ozelentalimrefno', 'efatonaydurumu', 'yazdirildimi', 'tarih', 'fisnox',
			'seri', 'noyil', 'no', 'iade', 'efatconfkod', 'efatsenaryotipi', 'satirbedelbrutmu', 'efbelge', 'efayrimtipi', 'dvkod', 'dvkur',
			'efbrut', 'efiskonto', 'efkdv', 'efsonuc', 'efdvbrut', 'efdviskonto', 'efdvkdv', 'efdvsonuc'
		   
		 'car.birunvan mustadi', 'car.yore mustyore', 'il.aciklama mustiladi', 'alth.aciklama althesapadi',
			'efc.aciklama efatconfadi', 'car.efatgibalias cargibalias'
		*/
	}
	loadServerData_veriDuzenle(e) {
		super.loadServerData_veriDuzenle(e); const tSec_eIslTip = new EIslemTip({ hepsi: true }), tSec_akibet = new EIslemOnayDurum(), {secimler} = this, {recs} = e;
		for (const rec of recs) {
			const efAyrimTipi = rec.efayrimtipi = rec.efayrimtipi || 'E', efOnayDurumu = rec.efatonaydurumu;
			$.extend(rec, {
				eIslTipText: tSec_eIslTip.kaDict[efAyrimTipi]?.aciklama || efAyrimTipi, akibetText: tSec_akibet.kaDict[efOnayDurumu]?.aciklama || efOnayDurumu,
				mustText: `(<b>${rec.mustkod}</b>) ${rec.birunvan}`, tamamlandimi: asBool(rec.tamamlandi), yazdirildimi: asBool(rec.yazdirildimi)
			})
		}
	}
	gridSatirTiklandi(e) {
		super.gridSatirTiklandi(e); const {args} = e.event;
		if (!args.rightclick) {
			const rowIndex = args.rowinde, expandedIndexes = this.expandedIndexes || {};
			if (!($.isEmptyObject(expandedIndexes) || expandedIndexes[rowIndex])) { const {gridWidget} = this; for (const ind in expandedIndexes) { gridWidget.hiderowdetails(ind) } gridWidget.showrowdetails(rowIndex) }
		}
	}
	async bekleyenleriGetirIstendi(e) {
		e = e || {}; const islemAdi = 'e-İşlem Bekleyenleri Getir'; const _e = { islemAdi };
		try {
			let {bekleyenleriGetirSecimler} = this;
			if (!bekleyenleriGetirSecimler) {
				bekleyenleriGetirSecimler = new Secimler({ liste: {
					bilgi1: new SecimText({ value: `Özel Entegratör (<b>${app.params.eIslem.ozelEntegrator?.aciklama}</b>) için Bekleyen e-İşlemler indirilecek`, css: 'gray' }),
					tarih: new SecimDate({ etiket: 'Tarih', basi: today().addDays(-25), sonu: today() })
				} })
			}
			let promise = new $.Deferred();
			bekleyenleriGetirSecimler.duzenlemeEkraniAc({ title: 'Bekleyen e-İşlemleri Getir', tamamIslemi: e => promise.resolve(e) });
			const rdlg = await promise; $.extend(_e, { sender: this, callback: new EIslemAkibet_Callback({ islemAdi }), /* .ekIslem(e => this.bekleyenleriGetir_veriIsle(e)), */ secimler: rdlg.secimler });
			this.showProgress(_e); await EYonetici.eIslemBekleyenleriGetir(_e); if ($.isEmptyObject(_e.uuid2Result)) { hideProgress(); throw { isError: true, errorText: 'Tarih aralığa ait bekleyen e-İşlem Belgesi bulunamadı' } }
		}
		catch (ex) { displayMessage(getErrorText(ex), islemAdi); throw ex } finally { this.uiIslemiSonrasi(_e) }
	}
	async dosyadanYukleIstendi(e) {
		e = e || {}; const islemAdi = `e-İşlem XML'den Yükle`;
		const _e = { islemAdi }; $.extend(_e, { sender: this, callback: new EIslemAkibet_Callback({ islemAdi }) });
		try {
			this.showProgress(_e); await EYonetici.eIslemAlimXMLYukle(_e);
			if ($.isEmptyObject(_e.uuid2Result)) { hideProgress();  throw { isError: true, errorText: 'Seçilen dosyalardan alınabilecek hiç e-İşlem Belgesi bulunamadı' } }
		}
		catch (ex) {
			let errorText = getErrorText(ex); if (errorText == 'The user aborted a request.') { errorText = null }
			if (errorText) { displayMessage(errorText, islemAdi) } throw ex
		} finally { this.uiIslemiSonrasi(_e) }
	}
	async ticariFiseDonusturIstendi(e) {
		e = e || {}; const islemAdi = 'İçeri Al', _e = await this.getSecilenSatirlar({ islemAdi }) || {}, {recs} = _e;
		if (!recs) return; if (recs.length != 1) { displayMessage('Sadece bir satır seçilmelidir'); return }
		try { _e.callback = new EIslemAkibet_Callback({ islemAdi }); _e.progressIsModal = false; this.showProgress(_e); await EYonetici.eIslemAlimTicariFiseDonustur(_e) }
		catch (ex) { _e.error = ex; displayMessage(getErrorText(ex), islemAdi); throw ex } finally { this.uiIslemiSonrasi(_e) }
	}
	async eIslemIzleIstendi(e) {
		const islemAdi = 'Gelen e-İşlem Görüntüle', _e = await this.getSecilenSatirlar_mesajli({ islemAdi }) || {}, {recs} = _e; if (!recs) return
		try { _e.gelen = true; _e.callback = new EIslemAkibet_Callback({ islemAdi }); this.showProgress(_e); await EYonetici.eIslemIzle(_e) }
		catch (ex) { _e.error = ex; displayMessage(getErrorText(ex), islemAdi); throw ex } finally { this.uiIslemiSonrasi(_e) }
	}
	async silIstendi(e) {
		const islemAdi = 'Gelen e-İşlem SİL', _e = await this.getSecilenSatirlar_mesajli({ islemAdi }) || {}, {recs} = _e; if (!recs) return
		try { _e.callback = new EIslemAkibet_Callback({ islemAdi }); this.showProgress(_e); await EYonetici.alimEIslemSil(_e) }
		catch (ex) { _e.error = ex; displayMessage(getErrorText(ex), islemAdi); throw ex } finally { this.uiIslemiSonrasi(_e) }
	}
	bekleyenleriGetir_veriIsle(e) { return e.eYonetici.bekleyenleriGetir_veriIsle(e) }
}
