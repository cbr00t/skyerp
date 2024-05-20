class MQPosKrediHesapOrtak extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Banka Koşul' }
	static get kosulSinif() { return MQAlt_BankaKosulOrtak }
	static get table() { return 'poskosul' }
	static get tableAlias() { return 'kos' }
	static get kodListeTipi() { return 'BANKOSUL' }
	static get almSat() { return null }
	static get satismi() { return this.almSat == 'T' }
	static get alimmi() { return this.almSat == 'A' }
	static altYapiDictDuzenle(e) {
		super.altYapiDictDuzenle(e);
		const {liste} = e;
		$.extend(liste, { kosul: this.kosulSinif })
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			aktifmi: new PInstBitTrue('baktifmi'),
			kendisimi: new PInstBool('kendisimi'),
			mevduatHesapKod: new PInstStr('mevduathesapkod'),
			ilkTaksitAyEklenecek: new PInstNum('ilktaksitayekle')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		this.formBuilder_addTabPanelWithGenelTab(e);
		const {tabPanel, tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(3);
		form.addModelKullan({ id: 'mevduatHesapKod', etiket: 'Mevduat Hesap', mfSinif: MQBankaHesap }).dropDown();
		form.addNumberInput('ilkTaksitAyEklenecek', 'İlk Taksit Ay Eklenecek');
		form.addCheckBox('aktifmi', 'Aktif');
		form.addCheckBox('kendisimi', 'Kendi Bankasına ait Kartlar içindir')
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);
		const sec = e.secimler;
		sec.secimTopluEkle({
			aktifDurumu: new SecimTekSecim({ etiket: 'Durum', tekSecimSinif: AktifVeDevreDisi }),
			mevduatHesapKod: new SecimString({ mfSinif: MQBankaHesap }),
			mevduatHesapAdi: new SecimOzellik({ etiket: 'Hesap Adı' })
		});
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this, wh = e.where, sec = e.secimler;
			wh.add(sec.aktifDurumu.tekSecim.getBoolBitClause(`${aliasVeNokta}baktifmi`));
			wh.basiSonu(sec.mevduatHesapKod, `${aliasVeNokta}mevduathesapkod`);
			wh.ozellik(sec.mevduatHesapAdi, `bhes.aciklama`)
		})
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e);
		const {rec, result} = e;
		if (!rec.baktifmi)
			result.push('bg-lightgray', 'iptal')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'mevduathesapkod', text: 'Ban. Hesap', genislikCh: 15 }),
			new GridKolon({ belirtec: 'mevduathesapadi', text: 'Hesap Adı', genislikCh: 40, sql: 'bhes.aciklama' })
		);
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this, {sent} = e;
		sent.fromIliski('banbizhesap bhes', `${aliasVeNokta}mevduathesapkod = bhes.kod`);
		sent.sahalar.add('baktifmi')
	}
	static varsayilanKeyHostVarsDuzenle(e) {
		super.varsayilanKeyHostVarsDuzenle(e);
		const {hv} = e, {almSat} = this;
		if (almSat != null)
			hv.almsat = almSat
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e);
		const {hv} = e;
		hv.almsat = this.class.almSat
	}
	static getGridKolonGrup_bankaHesapli(e) {
		const kolonGrup = this.getGridKolonGrup(e);
		if (!kolonGrup)
			return kolonGrup
		kolonGrup.tabloKolonlari.push(new GridKolon({
			belirtec: 'banHesapKod', text: 'Banka Hesap', genislikCh: 50,
			cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
				const adiAttr = 'banHesapAdi';
				const kod = value;
				if (kod) {
					let result = `<b>${kod}</b>`;
					const adi = rec[adiAttr];
					if (adi) {
						result += ` - ${adi}`;
						html = changeTagContent(html, result)
					}
				}
				return html
			}
		}).readOnly());
		kolonGrup.stmDuzenleyiciEkle(e => {
			const {aliasVeNokta} = this;
			for (const sent of e.stm.getSentListe()) {
				sent.fromIliski('banbizhesap bhes', `${aliasVeNokta}mevduathesapkod = bhes.kod`);
				sent.sahalar.add(`${aliasVeNokta}mevduathesapkod banhesapkod`, 'bhes.aciklama banhesapadi')
			}
		});
		kolonGrup.degisince(async e => {
			const rec = await e.rec;
			if (rec) {
				e.gridRec.banHesapAdi = rec.banhesapadi || '';
				e.setCellValue({ belirtec: 'banHesapKod', value: rec.banhesapkod || '' })
			}
		});
		return kolonGrup
	}
	taksitlendiriciUIGoster(e) {
		const _e = $.extend({}, e, { tamamIslemi: e => promise.resolve(e), kapaninca: e => promise.resolve(null) });
		const rfb = this.getRootFormBuilder_taksitlendirici(_e);
		if (!rfb)
			return null
		const promise = new $.Deferred();
		rfb.run(_e);
		return { rfb, part: rfb.part, promise }
	}
	getRootFormBuilder_taksitlendirici(e) {
		e = e || {};
		const {bedelSaha, tamamIslemi} = e;
		const taksitci = e.taksitci || new Taksitci();
		if (!taksitci.inst)
			taksitci.inst = this
		const rfb = new RootFormBuilder({ id: 'posTaksitlendirici', inst: taksitci }).asWindow('POS Taksitlendirici')
			.onAfterRun(e => {
				const {builder} = e; const {part, layout, id2Builder} = builder;
				$.extend(part, { tamamIslemi });
				layout.on('keyup', evt => {
					const key = evt.key?.toLowerCase();
					if (key == 'enter' || key == 'linefeed')
						id2Builder.islemTuslari.layout.find('#tamam').click()
				})
			});
		rfb.addIslemTuslari({ id: 'islemTuslari', tip: 'tamamVazgec' })
			.setId2Handler({
				tamam: async e => {
					const {parentPart} = e; const {builder} = parentPart;
					const taksitci = builder.inst; const {tamamIslemi} = parentPart;
					const _e = $.extend({}, e, { bedelSaha, taksitci, inst: taksitci.inst });
					try {
						await taksitci.uiKaydetOncesiIslemler(_e);
						_e.taksitler = taksitci.toplamdanTaksitlendir(_e)
					}
					catch (ex) { hConfirm(getErrorText(ex), parentPart.title || ''); throw ex }
					const {taksitler} = _e;
					if (tamamIslemi) {
						let result = getFuncValue.call(this, tamamIslemi, _e);
						if (result === false)
							return
					}
					parentPart.close()
				},
				vazgec: e =>
					e.parentPart.close()
			});
		let form = rfb.addFormWithParent();
		form.addDiv('mevduatHesapText', 'Mevduat Hesap')
			.setInput(e => $(`<div>${e.builder.inst.inst.parantezliOzet({ styled: true })}</div>`))
			.addStyle(e => `$elementCSS { margin-bottom: 20px }`);
		form = rfb.addFormWithParent().yanYana();
		form.addDateInput('islemTarihi', 'İşlem Tarihi').setValue(e => today());
		form.addNumberInput('bedel', 'Toplam Bedel').setMaxLength(17).addStyle_wh({ width: '200px !important' });
		form = rfb.addFormWithParent().yanYana();
		form.addNumberInput('taksitSayisi', 'Taksit Sayısı').addStyle_wh({ width: '140px !important' })
			.onAfterRun(e => setTimeout(input => input.focus(), 100, e.builder.input));
			// .setValue(e => e.builder.altInst.inst.xyz);
		form.addNumberInput('ilkTaksit', 'İlk Taksit').addStyle_wh({ width: '140px !important' });
		form = rfb.addFormWithParent();
		form.addLabel(null, 'İlk taksit verilirse kalanı diğer taksitlere paylaştırılır');
		// ...
		return rfb
	}
}
class MQPosHesap extends MQPosKrediHesapOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kosulSinif() { return MQAlt_POSKosul }
	static get sinifAdi() { return 'POS Hesap' }
	static get almSat() { return 'T' }
}
class MQKrediKarti extends MQPosKrediHesapOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kosulSinif() { return MQAlt_KrediKartiKosul }
	static get sinifAdi() { return 'Kredi Kartı' }
	static get almSat() { return 'A' }
}

class MQAlt_BankaKosulOrtak extends MQAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kosulVadeMaxSayi() { return 8 }
	static rootFormBuilderDuzenle(e) { }
	static orjBaslikListesiDuzenle(e) { }
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e) }
	setValues(e) { super.setValues(e) }
	toplamdanTaksitlendir(e) {
		const {bedelSaha, taksitci} = e, {bedel} = taksitci, {ilkTaksit, taksitSayisi} = taksitci;
		const vade = taksitci.islemTarihi;
		const ilkTaksitVarmi = ilkTaksit && taksitSayisi > 1;
		const tekTaksit = roundToBedelFra(ilkTaksitVarmi ? (bedel - ilkTaksit) / (taksitSayisi - 1) : bedel / taksitSayisi);
		const taksitBilgileri = [];
		let nakdeDonusumVade = vade, sonMusVade = vade;
		for (let i = 0; i < taksitSayisi; i++) {
			let taksit = tekTaksit;
			if (!i) {
				nakdeDonusumVade = this.ilkNDVadeBul(nakdeDonusumVade.clone());
				sonMusVade = this.ilkMustVadeBul(sonMusVade.clone());
				if (ilkTaksitVarmi)
					taksit = ilkTaksit
			}
			else {
				nakdeDonusumVade = this.sonraNDVadeBul(nakdeDonusumVade.clone(), i, vade.clone());
				sonMusVade = this.sonraMustVadeBul(sonMusVade.clone())
			}
			taksitBilgileri.push({ eskiDeger: 0, vade, taksit, nakdeDonusumVade })
		}
		const sonTaksitBilgi = taksitBilgileri[taksitBilgileri.length - 1];
		sonTaksitBilgi.eskiDeger = null;
		let fark = bedel;
		for (const item of taksitBilgileri)
			fark -= item.taksit
		if (fark)
			sonTaksitBilgi.taksit = roundToBedelFra(sonTaksitBilgi.taksit + fark)
		return taksitBilgileri
	}
	ilkNDVadeBul(vade) {
		if (isInvalidDate(vade))
			return null
		vade = this.ilkNDHamVadeBul(this.tarihBaslangicDuzenlenmis(vade));
		if (isInvalidDate(vade))
			return null
		if (this.ilkGunPazarIseAtla && vade.is().sunday())
			vade = vade.addDays(1)
		return vade
	}
	ilkNDHamVadeBul(vade) {
		if (isInvalidDate(vade))
			return null
		const gunSonrasi = () => vade.addDays(this.ilkNakdeDonusumGunu || 0);
		const {nakdeDonusumTipi} = this;
		if (nakdeDonusumTipi.gunSonrami || nakdeDonusumTipi.sabitmi)  /* şimdilik sabitmi yok */
			return gunSonrasi()
		if (nakdeDonusumTipi.aySonumu)
			return vade.addMonths(this.nakdeDonusumAyi).moveToLastDayOfMonth()
		if (nakdeDonusumTipi.ozelGunmu)
			return this.ozelNDVade(0, vade)
		return gunSonrasi()
	}
	ilkMustVadeBul(vade) {
		if (isInvalidDate(vade))
			return null
		vade = this.tarihBaslangicDuzenlenmis(vade)
						.addMonths(this.ilkTaksitAyEklenecek || 0);
		return vade
	}
	sonraMustVadeBul(vade) {
		if (isInvalidDate(vade))
			return null
		vade = vade.addDays(1);
		return vade
	}
	sonraNDVadeBul(vade, i, orjVade) {
		if (isInvalidDate(vade))
			return null
		const {nakdeDonusumTipi} = this;
		if (nakdeDonusumTipi.ozelGunmu)
			return this.ozelNDVade(0, vade)
		vade = this.ndSonrakiVade(vade);
		if (this.ilkGunPazarIseAtla && vade.is().sunday())
			vade = vade.addDays(1)
		return vade
	}
	ndSonrakiVade(vade) {
		if (isInvalidDate(vade))
			return null
		return this.sonrakiNakdeDonusum30mu ? vade.addDays(30) : vade.addMonths(1)
	}
	ozelNDVade(index, islemTarihi) {
		if (isInvalidDate(islemTarihi))
			return null
		const {ndVadeGunKodDizi} = this;
		let {gunKodu} = ndVadeGunKodDizi[index] || {};
		if (typeof gunKodu == 'string')
			gunKodu = gunKodu.trim()
		if (!gunKodu || !isNaN(parseInt(gunKodu)))
			return islemTarihi.addDays(asInteger(gunKodu) || 0)
		/* return new TOdemeGunu({ gunKodu }).vadeDegeri(islemTarihi)*/
		return islemTarihi
	}
	tarihBaslangicDuzenlenmis(vade) { return vade }
}
class MQAlt_POSKosul extends MQAlt_BankaKosulOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {};
		super(e);
		this.ndVadeGunKodDizi = e.ndVadeGunKodDizi || ( new Array(this.class.kosulVadeMaxSayi).fill(null).map(x => ({ gunKodu: 0 })) )
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			taksitSayisi: new PInstNum('taksitsayisi'),
			ilkGunCumartesiDurumu: new PInstTekSecim('ilkguncumartesiatla', MQAlt_BankaKosulOrtak_IlkGunCumartesiDurumu),
			ilkGunPazarIseAtla: new PInstBool('ilkgunpazaratla'),
			sonrakiNakdeDonusum30mu: new PInstBool('sonrakind30mu'),
			nakdeDonusumTipi: new PInstTekSecim('nakdontipi', MQAlt_BankaKosulOrtak_NakdeDonusumTipi),
			ilkNakdeDonusumGunu: new PInstNum('ilknakdedonusumgunu'),
			ilkNakdeDonusumAyi: new PInstNum('ilknakdedonusumayi')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(5).setAltInst(e => e.builder.inst.kosul);
		form.addNumberInput({ id: 'taksitSayisi', etiket: 'Taksit Sayısı', maxLength: 2 })
			.addStyle_wh({ width: '100px !important' });
		form.addModelKullan({ id: 'ilkGunCumartesiDurumu', etiket: 'İşlem tarihi Cumartesi ise' }).dropDown().noMF().kodsuz()
			.setSource(e => MQAlt_BankaKosulOrtak_IlkGunCumartesiDurumu.instance.kaListe);
		form.addCheckBox({ id: 'ilkGunPazarIseAtla', etiket: 'İşlem tarihi Pazar ise Pazartesiye Atlayarak Araştır' });
		form.addCheckBox({ id: 'sonrakiNakdeDonusum30mu', etiket: 'Sonraki Taksitler için 30 gün kullan' });

		form = tabPage_genel.addFormWithParent().yanYana().setAltInst(e => e.builder.inst.kosul);
		form.addModelKullan({ id: 'nakdeDonusumTipi', etiket: 'Nakde Dönüşüm Tipi' }).dropDown().noMF().kodsuz()
			.setSource(e => MQAlt_BankaKosulOrtak_NakdeDonusumTipi.instance.kaListe)
			.onChange(e => {
				const {builder} = e; const {rootPart} = builder; const {fbd_nakdeDonusum_altForm} = rootPart;
				fbd_nakdeDonusum_altForm.updateVisible();
				for (const subBuilder of fbd_nakdeDonusum_altForm.builders)
					subBuilder.updateVisible()
			});
		let altForm = form.addForm({ id: 'nakdeDonusum-altForm' })
			.onAfterRun(e => {
				const {builder} = e;
				builder.rootPart.fbd_nakdeDonusum_altForm = builder
			});
		altForm.addNumberInput({ id: 'ilkNakdeDonusumAyi', etiket: 'Ayın ... günü' })
			.setVisibleKosulu(e => {
				const {builder} = e; const {altInst} = builder; const {nakdeDonusumTipi} = altInst;
				return nakdeDonusumTipi.sabitmi || nakdeDonusumTipi.aySonumu ? true : 'jqx-hidden'
			})
			.addStyle_wh({ width: '100px !important' })
		altForm.addNumberInput({ id: 'ilkNakdeDonusumGunu', etiket: 'Gün Değeri' })
			.setVisibleKosulu(e => {
				const {builder} = e; const {altInst} = builder; const {nakdeDonusumTipi} = altInst;
				return nakdeDonusumTipi.gunSonrami || nakdeDonusumTipi.sabitmi ? true : 'jqx-hidden'
			})
			.addStyle_wh({ width: '100px !important' });
		altForm.addGridliGiris_sabit('ndVadeGunKodDizi')
			.setVisibleKosulu(e => {
				const {builder} = e; const {altInst} = builder; const {nakdeDonusumTipi} = altInst;
				return nakdeDonusumTipi.ozelGunmu ? true : 'jqx-hidden'
			})
			.addStyle_wh({ width: '128px !important', height: '360px !important'})
			.setSource(e => e.builder.altInst.ndVadeGunKodDizi)
			.setTabloKolonlari(e => [ new GridKolon({ belirtec: 'gunKodu', text: 'Gün', genislikCh: 8 }).alignRight() ]);
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'taksitSayisi', etiket: 'Taksit Sayısı', genislikCh: 10 }).tipNumerik()
		)
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e);
		const {hv} = e, {ndVadeGunKodDizi} = this;
		for (let i = 0; i < this.class.kosulVadeMaxSayi; i++)
			hv[`ndvadegun${i + 1}`] = ndVadeGunKodDizi[i]?.gunKodu
	}
	setValues(e) {
		super.setValues(e);
		const {rec} = e, {ndVadeGunKodDizi} = this;
		for (let i = 0; i < this.class.kosulVadeMaxSayi; i++)
			ndVadeGunKodDizi[i].gunKodu = (rec[`ndvadegun${i + 1}`] || 0)
	}
}
class MQAlt_KrediKartiKosul extends MQAlt_BankaKosulOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class MQAlt_BankaKosulOrtak_NakdeDonusumTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	get gunSonrami() { return !this.char }
	get sabitmi() { return this.char == 'X' }
	get aySonumu() { return this.char == 'S' }
	get ozelGunmu() { return this.char == 'Z' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e);
		const {kaListe} = e
		kaListe.push(
			new CKodVeAdi(['', '... gün sonrası']),
			new CKodVeAdi(['X', 'ayın ... günü']),
			new CKodVeAdi(['S', 'Ay Sonu']),
			new CKodVeAdi(['Z', 'Her taksit için Özel gün']),
		)
	}
}
class MQAlt_BankaKosulOrtak_IlkGunCumartesiDurumu extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	get yapmami() { return !this.char }
	get pazarmi() { return this.char == '*' }
	get pazartesimi() { return this.char == '2' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e);
		const {kaListe} = e
		kaListe.push(
			new CKodVeAdi(['', 'İşlem yapma']),
			new CKodVeAdi(['*', `Pazar'a Atla`]),
			new CKodVeAdi(['2', `Pazartesi'ye Atla`])
		)
	}
}


/*const inst = new MQPosHesap({ kod: 'POS70' });
await inst.yukle();
const {promise} = inst.taksitlendiriciUIGoster({ taksitci: new Taksitci({ bedel: 1000, taksitSayisi: 10, ilkTaksit: 200 }) });
const result = await promise;
console.table(result.taksitler)*/
