class HizmetOrtakFis extends FinansFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'finansfis' } static get detaySinif() { return HizmetOrtakDetay }
	static get gridKontrolcuSinif() { return HizmetOrtakGridci } static get fisTipi() { return null }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { ba: new PInstTekSecim('ba', GelirGider) })
	}
	static rootFormBuilderDuzenle_ilk(e) {
		super.rootFormBuilderDuzenle_ilk(e); const baslikFormlar = e.builders.baslikForm.builders;
		let form = baslikFormlar[0];
		form.addModelKullan({ id: 'ba', etiket: 'Gelir/Gider', source: e => GelirGider.instance.kaListe })
			.dropDown().kodsuz().bosKodAlinmaz().bosKodEklenmez().noMF()
			.onAfterRun(e => {
				const {builder} = e;
				if (!builder.rootPart.yeniVeyaKopyami) {
					const {part} = builder;
					part.disable()
				}
				if (builder)
					builder.altInst.baDegisti(e)
			})
			.degisince(e => e.builder.altInst.baDegisti(e))
			.addStyle_wh({ width: '130px !important' })
	}
	static super_rootFormBuilderDuzenle_ilk(e) { super.rootFormBuilderDuzenle_ilk(e) }
	static standartGorunumListesiDuzenle_son(e) {
		e.liste.push('toplambedel');
		super.standartGorunumListesiDuzenle_son(e)
	}
	static super_standartGorunumListesiDuzenle_son(e) { super.standartGorunumListesiDuzenle_son(e) }
	static orjBaslikListesiDuzenle_son(e) {
		// this.forAltYapiClassesDo('orjBaslikListesiDuzenle_son', e);
		const {aliasVeNokta} = this, {liste} = e;
		liste.push(new GridKolon({ belirtec: 'toplambedel', text: 'Toplam Bedel', genislikCh: 15 }).tipDecimal_bedel());
		super.orjBaslikListesiDuzenle_son(e)
	}
	static super_orjBaslikListesiDuzenle_son(e) { return super.orjBaslikListesiDuzenle_son(e) }
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this, {sent} = e;
		sent.sahalar.add(`${aliasVeNokta}ba`)
	}
	static super_loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e) }
	static varsayilanKeyHostVarsDuzenle(e) {
		super.varsayilanKeyHostVarsDuzenle(e);
		const {hv} = e, {fisTipi} = this;
		if (fisTipi != null)
			hv.fistipi = fisTipi
	}
	static super_varsayilanKeyHostVarsDuzenle(e) { super.varsayilanKeyHostVarsDuzenle(e) }
	alternateKeyHostVarsDuzenle(e) {
		super.alternateKeyHostVarsDuzenle(e);
		const {hv} = e;
		$.extend(hv, { ba: this.ba.char })
	}
	super_alternateKeyHostVarsDuzenle(e) { super.alternateKeyHostVarsDuzenle(e) }
	async cacheOlustur(e) {
		await super.cacheOlustur(e);
		const ba2KDVBilgileri = this._ba2KDVBilgileri = this._ba2KDVBilgileri || {};
		const ba = this.ba?.char || '';
		if (ba && ba2KDVBilgileri[ba] === undefined)
			ba2KDVBilgileri[ba] = await MQVergi.getKdvBilgileri({ satis: ba, iade: false })
		if (!this._kod2VergiBilgi)
			this._kod2VergiBilgi = (await MQVergi.getKod2VergiBilgi()) || {}
		if (!this._kategoriKod2Detaylar)
			this._kategoriKod2Detaylar = (await MQKategori.getKod2Detaylar()) || {}
	}
	baDegisti(e) {
		const {ba} = this;
		const {builder} = e;
		const {layout, input} = builder;
		const renk = ba.gelirmi ? 'green' : ba.gidermi ? 'orange' : 'transparent';
		input.css('border', `3px solid ${renk}`);
		input.css('color', renk)
	}
}
class HizmetOrtakDetay extends FinansDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'finanshar' }
	getHesaplanmisSonuc(e) {
		const fis = e.inst ?? e.fis ?? e.sender?.fis;
		const fis_ba = fis?.ba?.char;
		const kod2VergiBilgi = fis._kod2VergiBilgi;
		let sonuc = (
			(this.brutBedel || 0) -
			(this.stopaj || 0) +
			(this.kdv || 0) -
			(this.kdvTevkifat || 0) +
			(this.konaklama || 0)
		);
		for (const vergiTip of MQVergi.ioAttrPrefixes_ekVergi) {
			let ekVergi = this[vergiTip];
			if (!ekVergi)
				continue
			let ekVergiKod = this[`${vergiTip}Kod`];
			const {ba} = kod2VergiBilgi[ekVergiKod];
			if (ba == fis_ba)
				ekVergi = -ekVergi
			sonuc += ekVergi
		}
		return sonuc
	}
	static extYapilarDuzenle(e) {
		super.extYapilarDuzenle(e);
		e.liste.push(Ext_BelgeTarihVeNo, Ext_TakipNo, Ext_Hizmet, Ext_DetAciklama)
	}
	super_extYapilarDuzenle(e) { super.extYapilarDuzenle(e) }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		for (const vergiTip of MQVergi.ioAttrPrefixes_hizmet) {
			pTanim[`${vergiTip}Kod`] = new PInstStr(`${vergiTip.toLowerCase()}hesapkod`);
			let rowAttr = vergiTip.toLowerCase();
			if (rowAttr.startsWith('ekvergi'))
				rowAttr += 'bedel'
			pTanim[vergiTip] = new PInstNum(rowAttr)
		}
		$.extend(pTanim, {
			kategoriKod: new PInstStr(),
			katDetaySayac: new PInst('kdetaysayac'),
			brutBedel: new PInstNum('brutbedel'),
			bedel: new PInstNum('bedel')
		})
	}
	static super_pTanimDuzenle(e) { super.pTanimDuzenle(e) }
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const alias = this.tableAlias, aliasVeNokta = this.aliasVeNokta;
		const {sent} = e;
		// extYapilarDuzenle() kısmında from bağlantıları yapıldı
		sent.leftJoin({ alias: alias, from: 'kategoridetay kdet', iliski: `${aliasVeNokta}kdetaysayac = kdet.kaysayac` });
		sent.sahalar.add('hiz.kategorikod hizkategorikod')
	}
	static super_loadServerData_queryDuzenle(e) { return super.loadServerData_queryDuzenle(e) }
	static tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e);
		const {fis} = e;
		const alias = this.tableAlias, aliasVeNokta = this.aliasVeNokta;
		const vergiOnEk = fis.ba?.borcmu ? 'gid' : 'gel';
		const {sent} = e;
		sent.fromIliski('vergihesap kver', `${aliasVeNokta}kdvhesapkod = kver.kod`);
		sent.fromIliski('vergihesap sver', `${aliasVeNokta}stopajhesapkod = sver.kod`);
		sent.fromIliski('vergihesap nver', `${aliasVeNokta}konaklamahesapkod = nver.kod`);
		sent.fromIliski('vergihesap tver', `${aliasVeNokta}kdvtevkifathesapkod = tver.kod`);
		sent.sahalar.addWithAlias('hiz',
			'tip', 'brm', 'birimfiyat', 'dvfiyat', 'dvkod', 'adidegisir',
			`${vergiOnEk}kdvdegiskenmi kdvdegiskenmi`, 'kkegtipi'
		);
		sent.sahalar.add(
			`kver.belirtec kdvbelirtec`, `kver.kdvorani`,
			`sver.belirtec stopajbelirtec`, `sver.stopajorani`,
			`nver.belirtec konaklamabelirtec`, `nver.konaklamaorani`,
			`tver.belirtec kdvtevkifatbelirtec`, `tver.kdvtevoranx kdvtevkifatorani`
		)
	}
	static orjBaslikListesiDuzenle_ara(e) {
		super.orjBaslikListesiDuzenle_ara(e);
		const {aliasVeNokta} = this, {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'kategorikod', text: 'Kat.', genislikCh: 8, sql: 'hiz.kategorikod' }),
			new GridKolon({ belirtec: 'kdetayadi', text: 'Kat.Detay', genislikCh: 15, sql: 'kdet.kdetay' }),
			new GridKolon({ belirtec: 'brutbedel', text: 'Brüt Bedel', genislikCh: 15 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'stopaj', text: 'Stopaj', genislikCh: 13 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'kdv', text: 'Kdv', genislikCh: 13 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'kdvtevkifat', text: 'Kdv.Tev.', genislikCh: 13 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'konaklama', text: 'Konaklama', genislikCh: 13 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'bedel', text: 'Sonuç Bedel', genislikCh: 15 }).tipDecimal_bedel()
		])
	}
	setValues(e) {
		super.setValues(e);
		this.hizmetEkBilgileriAta(e)
	}
	hizmetEkBilgileriAta(e) {
		const editableSet = this._editableSet = this._editableSet || {};
		const setCellValue = e.setCellValue || (e => this[e.belirtec] = e.value);
		const {fis, rec} = e;
		const {kayitIcinOzelIsaretlimi, ba} = fis;
		setCellValue({ belirtec: 'brm', value: rec.brm });
		const kategoriKod = this.kategoriKod = rec.hizkategorikod ?? rec.kategorikod;
		editableSet.katDetaySayac = !!kategoriKod;
		this.adiDegisirmi = asBool(rec.adidegisir);
		const kdvDegiskenmi = this.kdvDegiskenmi = asBool(rec.kdvdegiskenmi);
		const {ioAttrPrefixes_hizmet} = MQVergi;
		const kod2VergiBilgi = fis._kod2VergiBilgi;
		const getUyarlanmisVergiKod = vergiKod => kayitIcinOzelIsaretlimi ? '' : vergiKod;
		const setVergiBilgi = vergiTip => {
			const vergiBelirtecKey = `${vergiTip}Belirtec`;
			const vergiKodKey = `${vergiTip}Kod`;
			const vergiKey = vergiTip;
			const eskiVergiKod = this[vergiBelirtecKey];
			let vergiKod = this[vergiKodKey] = getUyarlanmisVergiKod(rec[`${vergiTip.toLowerCase()}hesapkod`]);
			if (vergiKod != eskiVergiKod)
				setCellValue({ belirtec: vergiKey, value: rec[vergiKey] ?? null })
			let vergiBilgi = kod2VergiBilgi[vergiKod] || {};
			let oranYapi = vergiBilgi.oranYapi || {};
			let oran = this[`${vergiTip}Orani`] = (oranYapi[vergiTip] || 0);
			try { setCellValue({ belirtec: vergiBelirtecKey, value: vergiBilgi.belirtec || '' }) }
			catch (ex) { this[vergiBelirtecKey] = vergiBilgi.belirtec || '' }
			const isEditable = !!oran || vergiTip == 'kdv';
			for (const key of [vergiTip, vergiKodKey])
				editableSet[key] = isEditable
		};
		for (const key of ioAttrPrefixes_hizmet)
			setVergiBilgi(key)
	}
}
class HizmetOrtakGridci extends FinansGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ilk(e) {
		super.tabloKolonlariDuzenle_ilk(e);
		const {tabloKolonlari} = e;
		tabloKolonlari.push(
			...[
				new GKG_BelgeTarihVeNo({ belirtec: 'belgeTarihVeNo' }),
				// new GKG_HizmetEk({ belirtec: 'hizmetEk' })
			]
		)
	}
	tabloKolonlariDuzenle_ara(e) {
		super.tabloKolonlariDuzenle_ara(e);
		const kolonGruplar = MQHizmet.getGridKolonlar({ gridKolonGrupcu: 'getGridKolonGrup_kategorili', belirtec: 'hizmet' });
		const gkg_hizmet = kolonGruplar[0];
		let colDef = gkg_hizmet.tabloKolonlari.find(_colDef => _colDef.belirtec == 'katDetaySayac');
		if (colDef) {
			$.extend(colDef, {
				cellClassName: (...args) => this.grid_cellClassName(...args),
				cellBeginEdit: (...args) => this.grid_cellBeginEdit(...args),
			})
		}
		gkg_hizmet
			.stmDuzenleyiciEkle(e => {
				const {stm, alias, fis} = e;
				const vergiOnEk = fis.ba.borcmu ? 'gel' : 'gid';
				for (const sent of stm.getSentListe()) {
					sent.sahalar.addWithAlias(alias,
						'tip', 'brm', 'birimfiyat', 'dvfiyat', 'dvkod', 'adidegisir', `${vergiOnEk}kdvdegiskenmi kdvdegiskenmi`, 'kkegtipi',
						...MQVergi.rowAttrPrefixes_hizmet.map(prefix => `${vergiOnEk}${prefix}hesapkod ${prefix}hesapkod`)
					 )
				}
			})
			.degisince(async e => {
				const det = e.gridRec;
				const rec = e.rec = await e.rec;
				det.hizmetEkBilgileriAta(e);
				const {fis, gridPart, gridWidget, setCellValue} = e;
				const {ba} = fis;
				const {belirtec2Kolon} = gridPart;
				/*let colDef = belirtec2Kolon.kdvKod;
				if (colDef) {
					const vergiKodKey = colDef.belirtec;
					const vergiTip = vergiKodKey.slice(0, -3);
					const {tip} = colDef;
					const {kdvDegiskenmi} = det;
					let editableSet = det._editableSet = det._editableSet || {};
					let item = kaListe[0] || {};
					const vergiKod = item.kod;
					for (const key of [vergiKodKey, vergiTip])
						editableSet[key] = !!vergiKod && kdvDegiskenmi
				}*/
				const gerekirseVergiKolonGoster = vergiTip => {
					const vergiKodKey = `${vergiTip}Kod`;
					if (!det[vergiKodKey])
						return
					for (const key of [vergiTip, `${vergiTip}Orani`, `${vergiTip}Belirtec`]) {
						const colDef = belirtec2Kolon[key];
						if (colDef) {
							colDef.visible();
							gridWidget.showcolumn(colDef.belirtec)
						}
					}
				};
				for (const key of MQVergi.ioAttrPrefixes_hizmet)
					gerekirseVergiKolonGoster(key)
				this.vergileriHesapla(e)
			});
		const {tabloKolonlari} = e;
		tabloKolonlari.push(
			...MQTakipNo.getGridKolonlar({ belirtec: 'takip' }),
			...kolonGruplar
		)
	}
	tabloKolonlariDuzenle_son(e) {
		super.tabloKolonlariDuzenle_son(e);
		const {tabloKolonlari} = e;
		tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'miktar', text: 'miktar', genislikCh: 10 }).hidden().tipDecimal(),
			new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5 }).readOnly().hidden(),
			new GridKolon({
				belirtec: 'brutBedel', text: 'Brüt Bedel', genislikCh: 13,
				cellValueChanged: e => this.brutBedelDegisti(e)
			}).tipDecimal_bedel()
		]);
		this.tabloKolonlariDuzenle_vergi(e)
		tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'bedel', text: 'Sonuç Bedel', genislikCh: 13 }).readOnly().tipDecimal_bedel(),
			new GridKolon({ belirtec: 'vade', text: 'Vade', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'detAciklama', text: 'Açıklama', genislikCh: 50 })
		])
	}
	super_tabloKolonlariDuzenle_son(e) { super.tabloKolonlariDuzenle_son(e) }
	tabloKolonlariDuzenle_vergi(e) {
		const {tabloKolonlari} = e;
		tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'stopajBelirtec', text: 'Sto.', genislikCh: 6 })
				.readOnly().hidden(),
			new GridKolon({
				belirtec: 'stopaj', text: 'Stopaj', genislikCh: 8,
				cellValueChanged: e => this.stopajDegisti(e),
				cellClassName: (...args) => this.grid_cellClassName(...args),
				cellBeginEdit: (...args) => this.grid_cellBeginEdit(...args)
			}).hidden().tipDecimal_bedel(),
			new GridKolon({ belirtec: 'konaklamaBelirtec', text: 'Kon.', genislikCh: 6 })
				.readOnly().hidden(),
			new GridKolon({
				belirtec: 'kdvKod', text: 'Kdv%', genislikCh: 8,
				cellsRenderer: (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
					const kod2VergiBilgi = colDef.gridPart.fis?._kod2VergiBilgi || {};
					return `<div class="jqx-grid-cell-right-align">${kod2VergiBilgi[value]?.belirtec || html}</div>`
				},
				cellValueChanged: e => this.kdvKodDegisti(e),
				cellClassName: (...args) => this.grid_cellClassName(...args),
				cellBeginEdit: (...args) => this.grid_cellBeginEdit(...args)
			}).alignRight().tipTekSecim({
				source: async e => {
					const {fis} = e;
					const ba = fis.ba?.char;
					const det = e.gridRec;
					const {kdvDegiskenmi} = det;
					let _recs;
					if (kdvDegiskenmi) {
						const ba2KDVBilgileri = fis._ba2KDVBilgileri = fis._ba2KDVBilgileri || {};
						let kod2Rec = ba2KDVBilgileri[ba];
						if (kod2Rec === undefined)
							kod2Rec = ba2KDVBilgileri[ba] = (await MQVergi.getKdvBilgileri({ satis: ba.alacakmi, iade: false })) || {}
						_recs = Object.values(kod2Rec)
					}
					else
						_recs = [det]
					return _recs.map(_rec =>
						new CKodAdiVeOran({ kod: _rec.kdvKod, aciklama: _rec.kdvOrani, oran: _rec.kdvOrani }))
				}
			}).kodsuz(),
			new GridKolon({
				belirtec: 'kdv', text: 'KDV', genislikCh: 8,
				cellValueChanged: e => this.kdvDegisti(e),
				cellClassName: (...args) => this.grid_cellClassName(...args),
				cellBeginEdit: (...args) => this.grid_cellBeginEdit(...args)
			}).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'kdvTevOranx', text: 'Tev.', genislikCh: 6 })
				.readOnly().hidden(),
			new GridKolon({
				belirtec: 'kdvTevkifat', text: 'Kdv.Tev', genislikCh: 8,
				cellValueChanged: e => this.kdvTevkifatDegisti(e),
				cellClassName: (...args) => this.grid_cellClassName(...args),
				cellBeginEdit: (...args) => this.grid_cellBeginEdit(...args)
			}).hidden().tipDecimal_bedel(),
			new GridKolon({
				belirtec: 'konaklama', text: 'Konaklama', genislikCh: 8,
				cellValueChanged: e => this.konaklamaDegisti(e),
				cellClassName: (...args) => this.grid_cellClassName(...args),
				cellBeginEdit: (...args) => this.grid_cellBeginEdit(...args)
			}).hidden().tipDecimal_bedel()
		]);
		for (let i = 1; i <= MQVergi.ekVergiSayi; i++) {
			tabloKolonlari.push(...[
				new GridKolon({ belirtec: `ekVergi${i}Belirtec`, text: `Ek-${i}`, genislikCh: 6 })
					.readOnly().hidden(),
				new GridKolon({
					belirtec: `ekVergi${i}`, text: `Ek Vergi ${i}`, genislikCh: 8, userData: { index: i },
					cellValueChanged: e => this.ekVergiDegisti(e),
					cellClassName: (...args) => this.grid_cellClassName(...args),
					cellBeginEdit: (...args) => this.grid_cellBeginEdit(...args)
				}).hidden().tipDecimal_bedel()
			])
		}
		tabloKolonlari.push(...[
			new GridKolon({
				belirtec: 'kkegBrut', text: 'Brütten KKEG', genislikCh: 10,
				cellValueChanged: e => this.kkegBrutDegisti(e),
				cellClassName: (...args) => this.grid_cellClassName(...args),
				cellBeginEdit: (...args) => this.grid_cellBeginEdit(...args)
			}).hidden().tipDecimal_bedel(),
			new GridKolon({
				belirtec: 'kkegKdv', text: 'Kdvden KKEG', genislikCh: 10,
				cellValueChanged: e => this.kkegKdvDegisti(e),
				cellClassName: (...args) => this.grid_cellClassName(...args),
				cellBeginEdit: (...args) => this.grid_cellBeginEdit(...args)
			}).hidden().tipDecimal_bedel()
		])
	}
	async fisGiris_gridVeriYuklendi(e) {
		await super.fisGiris_gridVeriYuklendi(e);
		this.vergiKolonlariTopluAyarla(e)
	}
	vergiKolonlariTopluAyarla(e) {
		const {gridWidget, sender} = e;
		const kontrolVergiBelirtecleri = asSet(MQVergi.ioAttrPrefixes_hizmet);
		delete kontrolVergiBelirtecleri.kdv;
		const visibleSet = {};
		const detaylar = gridWidget.getboundrows();
		for (const det of detaylar) {
			if ($.isEmptyObject(kontrolVergiBelirtecleri))
				break
			for (const vergiTip in kontrolVergiBelirtecleri) {
				const vergiKodKey = `${vergiTip}Kod`;
				if (!det[vergiKodKey])
					continue
				visibleSet[vergiTip] = true;
				delete kontrolVergiBelirtecleri[vergiTip]
			}
		}
		if ($.isEmptyObject(visibleSet))
			return
		const gridPart = sender.gridPart ?? sender;
		const {belirtec2Kolon} = gridPart;
		gridWidget.beginupdate();
		for (const vergiTip in visibleSet) {
			for (const key of [vergiTip, `${vergiTip}Orani`, `${vergiTip}Belirtec`]) {
				const colDef = belirtec2Kolon[key];
				if (colDef) {
					colDef.visible();
					gridWidget.showcolumn(colDef.belirtec)
				}
			}
		}
		gridWidget.endupdate(true)
	}

	kdvKodDegisti(e) { this.vergiKodDegisti(e) }
	kdvDegisti(e) { this.vergiDegisti(e) }
	stopajDegisti(e) { this.vergiDegisti(e) }
	kdvTevkifatDegisti(e) { this.vergiDegisti(e) }
	konaklamaDegisti(e) { this.vergiDegisti(e) }
	ekVergiDegisti(e) {
		/* const ekVergiIndex = e.sender.belirtec2Kolon[args.datafield].ekBilgi?.index */
		this.vergiDegisti(e)
	}
	kkegBrutDegisti(e) { this.vergiDegisti(e) }
	kkegKdvDegisti(e) { this.vergiDegisti(e) }
	brutBedelDegisti(e) { this.vergileriHesapla(e); this.netBedelHesapla(e) }
	vergiKodDegisti(e) {
		const fis = e.inst ?? e.fis;
		const kod2VergiBilgi = fis._kod2VergiBilgi;
		const vergiKod = e.value;
		const vergiBilgi = kod2VergiBilgi[vergiKod];
		if (vergiBilgi) {
			const {gridWidget, rowIndex} = e;
			const vergiKodKey = e.belirtec;
			const vergiTip = vergiKodKey.slice(0, -3);
			const vergiBelirtecKey = `${vergiTip}Belirtec`;
			const vergiOranKey = `${vergiTip}Orani`;
			
			const vergiKod = vergiBilgi.kod || '';
			const vergiOran = vergiBilgi.oranYapi[vergiTip] || 0;
			const det = e.gridRec;
			det[vergiBelirtecKey] = vergiBilgi.belirtec || '';
			det[vergiOranKey] = vergiOran;
			gridWidget.setcellvalue(rowIndex, vergiKodKey, vergiKod);
			
			const value = vergiKod ? roundToBedelFra(det.brutBedel * vergiOran / 100) : 0;
			gridWidget.setcellvalue(rowIndex, vergiTip, value)
		}
		this.netBedelHesapla(e)
	}
	vergiDegisti(e) { this.netBedelHesapla(e) }

	vergileriHesapla(e) {
		const tipListe = e.tipListe || MQVergi.ioAttrPrefixes_hizmet;
		const {gridWidget, rowIndex} = e;
		const det = e.gridRec;
		gridWidget.beginupdate();
		for (const vergiTip of tipListe) {
			const vergiKodKey = `${vergiTip}Kod`;
			const vergiOranKey = `${vergiTip}Orani`;
			const vergiKod = det[vergiKodKey];
			const vergiOran = det[vergiOranKey] || 0;
			const value = vergiKod ? roundToBedelFra(det.brutBedel * vergiOran / 100) : 0;
			gridWidget.setcellvalue(rowIndex, vergiTip, value)
		}
		gridWidget.endupdate(false)
	}
	netBedelHesapla(e) {
		const {gridWidget, rowIndex} = e;
		const det = e.gridRec;
		const value = det.getHesaplanmisSonuc(e);
		gridWidget.setcellvalue(rowIndex, 'bedel', value)
	}
}

class KasaHizmetFis extends HizmetOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return KasaHizmetDetay } static get gridKontrolcuSinif() { return KasaHizmetGridci } static get sinifAdi() { return 'Kasa Hizmet Fişi' }
	static get kodListeTipi() { return 'KSHIZ' } static get numTipKod() { return 'KDTAH' } static get fisTipi() { return 'KH' }
	get bakiyeciler() { return [...super.bakiyeciler, new KasaBakiyeci({ borcmu: e => this.ba.gelirmi })] }
	static extYapilarDuzenle(e) { e.liste.push(ExtFis_Kasa); super.extYapilarDuzenle(e) }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { dvKod: new PInstStr(), dvKur: new PInstNum() }) }
	static rootFormBuilderDuzenle_son(e) {
		e = e || {};
		super.rootFormBuilderDuzenle_son(e);
		const baslikFormlar = e.builders.baslikForm.builders;
		let form = baslikFormlar[0];
		form.addNumberInput({ id: 'dvKur', etiket: 'Dv.Kur' })
			.onBuildEk(e => { const {builder} = e, {input} = builder; input.attr('readonly', ''); input.addClass('readOnly'); e.builder.rootPart.fbd_dvKur = builder })
			.addStyle_wh({ width: '150px !important' })
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta} = this, {sent} = e;
		sent.sahalar.add('kas.dvtipi dvkod')
	}
	setValues(e) { super.setValues(e); const {rec} = e; $.extend(this, { dvKod: rec.dvkod }) }
	kasaBakiyeSqlEkDuzenle(e) { const {sent, borcmu} = e, {sahalar} = sent; sahalar.addWithAlias('fis', 'ozelisaret', 'kasakod', 'toplambedel bakiye', 'toplamdvbedel dvbakiye') }
	async kasaDegisti(e) {
		const {kasaKod} = this, rec = await MQKasa.kasaKod2DvKur(kasaKod), dvKur = this.dvKur = rec?.satis || 0, {builder} = e;
		const {rootPart} = builder; rootPart.fbd_dvKur.input.val(dvKur || 0);
		const {gridWidget} = rootPart, gridRecs = gridWidget.getboundrows();
		gridWidget.beginupdate();
		for (let i = 0; i < gridRecs.length; i++) {
			const gridRec = gridRecs[i], {dvBedel} = gridRec;
			if (dvBedel && dvKur) { gridWidget.setcellvalue(i, 'bedel', roundToBedelFra( dvBedel * dvKur )) }
		}
		gridWidget.endupdate(false)
	}
}
class KasaHizmetDetay extends HizmetOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class KasaHizmetGridci extends HizmetOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class CariHizmetFis extends HizmetOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return CariHizmetDetay } static get gridKontrolcuSinif() { return CariHizmetGridci } static get sinifAdi() { return 'Cari Hizmet Fişi' }
	static get kodListeTipi() { return 'CRHIZ' } static get numTipKod() { return 'CHIZ' } static get fisTipi() { return 'CH' }
	get bakiyeciler() { return [...super.bakiyeciler, new CariBakiyeci({ borcmu: e => this.ba.gelirmi })] }
	cariBakiyeSqlEkDuzenle(e) {
		const {sent, borcmu} = e, {sahalar} = sent; sent.fis2HarBagla('finanshar');
		sahalar.addWithAlias('fis', 'ozelisaret'); sahalar.addWithAlias('har', 'ticmustkod must', 'cariitn althesapkod');
		sahalar.add('SUM(har.bedel) bakiye', 'SUM(har.dvbedel) dvbakiye')
	}
}
class CariHizmetDetay extends HizmetOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static extYapilarDuzenle(e) {
		super.extYapilarDuzenle(e);
		e.liste.unshift(Ext_CariVeAltHesap)
	}
}
class CariHizmetGridci extends HizmetOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ilk(e) {
		const kolonGruplar = MQCari.getGridKolonlar({ belirtec: 'cari', gridKolonGrupcu: 'getGridKolonGrup_yoreli', sabitle: true });
		const {tabloKolonlari} = e; tabloKolonlari.push(...kolonGruplar);
		super.tabloKolonlariDuzenle_ilk(e)
	}
}

class BankaHizmetFis extends HizmetOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return BankaHizmetDetay } static get gridKontrolcuSinif() { return BankaHizmetGridci } static get sinifAdi() { return 'Banka Hizmet Fişi' }
	static get kodListeTipi() { return 'BNHIZ' } static get numTipKod() { return 'HSHIZ' } static get fisTipi() { return 'HH' }
	get bakiyeciler() { return [...super.bakiyeciler, new MevduatBakiyeci({ borcmu: e => this.ba.gelirmi })] }
	mevduatBakiyeSqlEkDuzenle(e) {
		const {sent, borcmu} = e, {sahalar} = sent; sent.fis2HarBagla('finanshar');
		sahalar.addWithAlias('fis', 'ozelisaret'); sahalar.addWithAlias('har', 'banhesapkod');
		sahalar.add('SUM(har.bedel) bakiye', 'SUM(har.dvbedel) dvbakiye')
	}
}
class BankaHizmetDetay extends HizmetOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static extYapilarDuzenle(e) {
		super.extYapilarDuzenle(e);
		e.liste.unshift(Ext_BankaHesap)
	}
}
class BankaHizmetGridci extends HizmetOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ilk(e) { const kolonGruplar = MQBankaHesap.getGridKolonlar({ belirtec: 'banHesap', sabitle: true }); e.tabloKolonlari.push(...kolonGruplar); super.tabloKolonlariDuzenle_ilk(e) }
}

class KrediKartiIleMasrafOdemeFis extends HizmetOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Kredi Kartı ile Masraf Ödeme' } static get table() { return KrediKartiIleOdemeFis.table } static get detaySinif() { return KrediKartiIleMasrafOdemeDetay }
	static get gridKontrolcuSinif() { return KrediKartiIleMasrafOdemeGridci } static get almSat() { return KrediKartiIleOdemeFis.almSat } static get fisTipi() { return KrediKartiIleOdemeFis.fisTipi }
	static get kodListeTipi() { return 'KKMOF' } static get numTipKod() { return KrediKartiIleOdemeFis.numTipKod }
	get ba() {
		let result = this._ba;
		if (result === undefined)
			result = this._ba = new BorcAlacak(this.class.almSat)
		return result
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		delete pTanim.ba
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e)
		e.bedelSaha = 'brutBedel';
		KrediKartiIleOdemeFis.rootFormBuilderDuzenle_taksitlendir(e)
	}
	static rootFormBuilderDuzenle_ilk(e) { super.super_rootFormBuilderDuzenle_ilk(e) }
	static loadServerData_queryDuzenle(e) { super.super_loadServerData_queryDuzenle(e) }
	static varsayilanKeyHostVarsDuzenle(e) {
		super.super_varsayilanKeyHostVarsDuzenle(e);
		const {hv} = e, {almSat} = this;
		if (almSat != null)
			hv.almsat = almSat
	}
	alternateKeyHostVarsDuzenle(e) { super.super_alternateKeyHostVarsDuzenle(e) }
	static super_standartGorunumListesiDuzenle_son(e) { super.super_standartGorunumListesiDuzenle_son(e) }
	static orjBaslikListesiDuzenle_son(e) { return super.super_orjBaslikListesiDuzenle_son(e) }
}
class KrediKartiIleMasrafOdemeDetay extends HizmetOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'posilkhar' }
	static extYapilarDuzenle(e) {
		const {liste} = e;
		super.extYapilarDuzenle(e);
		let eklenecekler = [Ext_KrediKartiHesap, Ext_NDVade, Ext_Vade];
		let ind = liste.indexOf(Ext_TakipNo);
		if (ind == -1)
			liste.push(...eklenecekler)
		else
			liste.splice(ind, 0, ...eklenecekler)
	}
}
class KrediKartiIleMasrafOdemeGridci extends HizmetOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get posHesapSinif() { return MQKrediKarti }
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e);
		const {tabloKolonlari} = e;
		let ind = tabloKolonlari.findLastIndex(colDef => colDef.belirtec == 'vade');
		if (ind != -1)
			tabloKolonlari.splice(ind, 1)
	}
	tabloKolonlariDuzenle_ilk(e) {
		const {tabloKolonlari} = e;
		tabloKolonlari.push(
			...this.class.posHesapSinif.getGridKolonlar({ belirtec: 'posKosul', gridKolonGrupcu: 'getGridKolonGrup_bankaHesapli' }),
			new GridKolon({ belirtec: 'ndVade', text: 'Nakde Dönüşüm Vade', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'vade', text: 'Vade', genislikCh: 13 }).tipDate()
		);
		super.tabloKolonlariDuzenle_ilk(e)
	}
	gridContextMenuIstendi(e) {
		e = e || {};
		const evt = e.event, target = $(evt?.currentTarget), gridWidget = target?.jqxGrid('getInstance');
		const cell = gridWidget.getselectedcell() || {}; const rowIndex = cell.rowindex, belirtec = cell.datafield;
		const bedelSaha = e.bedelSaha || 'brutBedel';
		if (belirtec == bedelSaha || belirtec == 'dvBedel') {
			$.extend(e, { gridPart: e.gridPart ?? e.sender, gridWidget, rowIndex, belirtec });
			this.taksitlendirIstendi(e);
			return false
		}
	}
	async taksitlendirIstendi(e) {
		e = e || {};
		const bedelSaha = e.bedelSaha = e.bedelSaha || 'brutBedel';
		await PosOrtakGridci.taksitlendirIstendi(e);
		if (bedelSaha == 'brutBedel') {
			const {changedGridRecs} = e;
			if (!$.isEmptyObject(changedGridRecs) && this.brutBedelDegisti) {
				const {gridPart, gridWidget} = e, {fis} = gridPart, cell = gridWidget.getselectedcell(), rowIndex = cell?.rowindex, belirtec = e.belirtec ?? cell?.datafield;
				for (const det of changedGridRecs) {
					const value = det[belirtec];
					const _e = { inst: fis, fis, sender: gridPart, gridPart, gridWidget, rowIndex: det.boundindex ?? rowIndex, belirtec, gridRec: det, value };
					gridPart.belirtec2Kolon[belirtec].cellValueChanged(_e)
				}
			}
		}
	}
}
