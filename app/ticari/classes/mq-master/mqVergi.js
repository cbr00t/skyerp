class MQVergi extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Vergi' }
	static get table() { return 'vergihesap' }
	static get tableAlias() { return 'ver' }
	static get tanimUISinif() { return ModelTanimPart }
	static get silindiDesteklenirmi() { return true }
	static get zeminRenkDesteklermi() { return false }
	static get kodListeTipi() { return 'VERGI' }
	static get eIslTypeCode() { return null }

	static get ekVergiSayi() { return 2 }
	static get ioAttrPrefixes_ekVergi() {
		const liste = [];
		for (const key of this.getIOAttrPrefixes_ekVergi())
			liste.push(key)
		return liste
	}
	static get rowAttrPrefixes_ekVergi() {
		const liste = [];
		for (const key of this.getRowAttrPrefixes_ekVergi())
			liste.push(key)
		return liste
	}
	static *getIOAttrPrefixes_ekVergi() {
		for (let i = 1; i < this.ekVergiSayi; i++ )
			yield `ekVergi${i}`
	}
	static *getRowAttrPrefixes_ekVergi() {
		for (let i = 1; i < this.ekVergiSayi; i++ )
			yield `ekvergi${i}`
	}
	static get ioAttrPrefixes_stok() { return ['kdv', 'kdvTevkifat', 'stopaj', 'otv'] }
	static get rowAttrPrefixes_stok() { return ['kdv', 'kdvtevkifat', 'stopaj', 'otv'] }
	static get ioAttrPrefixes_hizmet() { return ['kdv', 'kdvTevkifat', 'stopaj', 'konaklama', ...this.ioAttrPrefixes_ekVergi] }
	static get rowAttrPrefixes_hizmet() { return ['kdv', 'kdvtevkifat', 'stopaj', 'konaklama', ...this.rowAttrPrefixes_ekVergi] }
	
	static get sabitKdvOranlari() { return this.getSabitOranlar({ belirtec: 'kdv' }) }
	static get sabitOtvOranlari() { return this.getSabitOranlar({ belirtec: 'otv' }) }
	static getSabitOranlar(e) {
		e = e || {};
		const belirtec = e.belirtec || e.key;
		const altSinif = this.belirtec2AltSinif[belirtec];
		return altSinif ? altSinif.sabitOranlar : null
	}
	static async getKod2VergiBilgi(e) {
		e = e || {};
		let belirtec = e.belirtec || e.key;
		if (belirtec) {
			const altSinif = this.belirtec2AltSinif[belirtec];
			return altSinif ? await altSinif.getKod2VergiBilgi(e) : null
		}
		const oransizmi = e.oransizmi ?? e.oransiz;
		const rootGlobals = MQVergi.globals;
		const belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		const rootGlobalKey = this.belirtec || this.classKey || this;
		const globalKey = [rootGlobalKey, oransizmi ? 'oransiz' : ''].join('-');
		const globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		let result = globals.kod2VergiBilgi;
		if (result == null) {
			result = {};
			const {table, kodSaha} = MQVergi;
			const {tipSet, rowAttrPrefix} = this;
			let sent = new MQSent({
				from: table,
				where: [`kod <> ''`, `alttip = ''`, `baktifmi <> 0`],
				sahalar: (oransizmi ? ['kod', 'aciklama', 'vergitipi', 'alttip', 'belirtec', 'ba'] : ['*'])
			});
			const recs = await app.sqlExecSelect({ query: sent });
			const {belirtec2AltSinif} = this;
			for (const rec of recs) {
				const kod = rec.kod.trimEnd();
				const altTip = rec.alttip.trimEnd();
				let oranYapi;
				if (!oransizmi) {
					oranYapi = {}
					for (const belirtec in belirtec2AltSinif) {
						const cls = belirtec2AltSinif[belirtec];
						const {rowAttrPrefix} = cls;
						const oran = rec[`${rowAttrPrefix || ''}orani`];
						if (oran != null)
							oranYapi[belirtec] = asFloat(oran)
					}
				}
				const item = {
					kod: kod, aciklama: rec.aciklama.trimEnd(),
					tip: rec.vergitipi.trimEnd(), ba: rec.ba.trimEnd(),
					belirtec: rec.belirtec.trimEnd()
				};
				if (altTip)
					item.altTip = altTip
				if (oranYapi)
					item.oranYapi = oranYapi
				result[kod] = item
			}
			globals.kod2VergiBilgi = result
		}
		return result
	}
	static getKod2VergiBilgi_oransiz(e) {
		e = $.extend({}, e, { oransiz: true });
		return this.getKod2VergiBilgi(e)
	}
	static get tevkifatOranlari() {
		const {globals} = this;
		let result = globals.tevkifatOranlari;
		if (result == null) {
			const {tevkifatOranlari} = app.sabitTanimlar.vergi || {};
			result = tevkifatOranlari;
			if (result == null)
				result = ['1/10', '2/10', '3/10', '4/10', '5/10', '7/10', '9/10']
			globals.tevkifatOranlari = result
		}
		return result
	}
	static getKismiTevkifatlar(e) {
		e = e || {};
		return this.getTevkifatlar($.extend({}, e, { kismi: true }))
	}
	static getTamTevkifatlar(e) {
		e = e || {};
		return this.getTevkifatlar($.extend({}, e, { kismi: false }))
	}
	static getTevkifatlar(e) {
		e = e || {};
		const fisSinif = e.fis || (e.fis || {}).class;
		
		let alimmi = coalesce(coalesce(e.alim, e.alimmi), e.ba ? e.ba == 'A' : null);
		if (alimmi == null)
			alimmi = !coalesce(e.satis, e.satismi)
		if (alimmi == null && fisSinif)
			alimmi = fisSinif.alimmi
		let kismimi = coalesce(e.kismi, e.kismimi)
		if (kismimi == null)
			kismimi = !coalesce(e.tam, e.tammi)

		const {globals} = this;
		let result = globals.tevkifatKodlari;
		if (result == null)
			globals.tevkifatKodlari = result = {}
		const subKey = [ alimmi ? 'A' : 'T', kismimi ? 'K' : 'T' ];
		let subResult = result[subKey];
		if (subResult === undefined) {
			const vergi = app.sabitTanimlar.vergi || {};
			const selector = kismimi ? 'kismiTevkifatUygulananIslemTurleri' : 'tamTevkifatIslemTurleri';
			subResult = vergi[selector] || null;
			if (subResult) {
				const uygunOlmayanKodSet = {};
				const _subResult = subResult;
				subResult = [];
				const kaSinif = kismimi ? CKodAdiVeOran : CKodVeAdi;
				for (const item of _subResult) {
					let {kod} = item;
					if (!uygunOlmayanKodSet[kod]) {
						if (alimmi)
							kod = '2' + item.kod.slice(1)
						subResult.push(
							new kaSinif({ kod: kod, aciklama: item.aciklama || item.adi || item.ad || '', oran: item.oran })
						)
					}
				}
			}
			result[subKey] = subResult
		}
		return subResult
	}
	static getKismiTevkifatDict(e) {
		e = e || {};
		return this.getTevkifatDict($.extend({}, e, { kismi: true }))
	}
	static getTevkifatDict(e) {
		const {globals} = this;
		const key = `tevkifatDict-${toJSONStr(e)}`;
		let result = globals[key];
		if (result == null) {
			result = {};
			for (const ka of this.getTevkifatlar(e))
				result[ka.kod] = ka
			globals[key] = result
		}
		return result
	}
	static getKismiIstisnalar(e) {
		e = e || {};
		return this.getIstisnalar($.extend({}, e, { kismi: true }));
	}
	static getTamIstisnalar(e) {
		e = e || {};
		return this.getIstisnalar($.extend({}, e, { kismi: false }));
	}
	static getTumIstisnalar(e) {
		e = e || {};
		return [this.getKismiIstisnalar(e), this.getTamIstisnalar(e)]
	}
	static getIstisnalar(e) {
		e = e || {};
		const fisSinif = e.fis || (e.fis || {}).class;
		let alimmi = coalesce(e.alim, e.alimmi);
		if (alimmi == null)
			alimmi = !coalesce(e.satis, e.satismi);
		if (alimmi == null && fisSinif)
			alimmi = fisSinif.alimmi
		let kismimi = coalesce(e.kismi, e.kismimi);
		if (kismimi == null)
			kismimi = !coalesce(e.tam, e.tammi)

		const {globals} = this;
		let result = globals.istisnalar;
		if (result == null)
			globals.istisnalar = result = {}
		const subKey = [ alimmi ? 'A' : 'T', kismimi ? 'K' : 'T' ];
		let subResult = result[subKey];
		if (subResult === undefined) {
			const vergi = app.sabitTanimlar.vergi || {};
			const selector = kismimi ? 'kismiistisnalar' : 'tamistisnalar';
			subResult = vergi[selector] || null;
			if (subResult) {
				const uygunOlmayanKodSet = kismimi ? {} : asSet(['301', '302', '303']);
				const _subResult = subResult;
				subResult = [];
				const kaSinif = CKodAdiVeMadde;
				for (const item of _subResult) {
					const {kod} = item;
					if (!uygunOlmayanKodSet[kod])
						subResult.push(new kaSinif({ kod: kod, aciklama: item.ad || item.adi || item.aciklama || '', madde: item.madde }))
				}
			}
			result[subKey] = subResult
		}
		return subResult
	}
	static getKismiIstisnaDict(e) {
		e = e || {};
		return this.getIstisnaDict($.extend({}, e, { kismi: true }))
	}
	static getTamIstisnaDict(e) {
		e = e || {};
		return this.getIstisnaDict($.extend({}, e, { kismi: false }))
	}
	static getTumIstisnaDict(e) {
		e = e || {};
		const {globals} = this;
		const key = `tumIstisnaDict-${toJSONStr(e)}`;
		let result = globals[key];
		if (result == null) {
			result = $.extend({}, this.getKismiIstisnaDict(e), this.getTamIstisnaDict(e));
			globals[key] = result
		}
		const tamIstisnalar = (app.sabitTanimlar.vergi || {}).tamistisnalar || [];
		if (!$.isEmptyObject(tamIstisnalar)) {
			const uygunOlmayanKodSet = asSet(['301', '302', '303']);
			for (const rec of tamIstisnalar) {
				const {kod} = rec;
				if (uygunOlmayanKodSet[kod]) {
					result[kod] = new CKodAdiVeMadde({
						kod: kod,
						aciklama: rec.ad || rec.adi || rec.aciklama || '',
						madde: rec.madde
					})
				}
			}
		}
		return result
	}
	static getIstisnaDict(e) {
		const {globals} = this;
		const key = `istisnaDict-${toJSONStr(e)}`;
		let result = globals[key];
		if (result == null) {
			result = {};
			for (const ka of this.getIstisnalar(e))
				result[ka.kod] = ka;
			globals[key] = result
		}
		return result
	}
	static getKod2Oran(e) {
		e = e || {};
		const {belirtec} = e;
		const altSinif = this.belirtec2AltSinif[belirtec];
		return altSinif ? altSinif.getKod2Oran(e) : null;
	}
	static oran2KodSet(e) {
		e = e || {};
		const {belirtec} = e;
		const altSinif = this.belirtec2AltSinif[belirtec];
		return altSinif ? altSinif.oran2KodSet(e) : null;
	}
	static getKdvKod2Oran(e) {
		e = e || {};
		if (typeof e != 'object')
			e = { kod: e };
		return this.getKod2Oran($.extend({}, e, { belirtec: 'kdv' }))
	}
	static getOtvKod2Oran(e) {
		e = e || {};
		if (typeof e != 'object')
			e = { kod: e };
		return this.getKod2Oran($.extend({}, e, { belirtec: 'otv' }))
	}
	static getStopajKod2Oran(e) {
		e = e || {};
		if (typeof e != 'object')
			e = { kod: e };
		return this.getKod2Oran($.extend({}, e, { belirtec: 'stopaj' }))
	}
	static getGKKPKod2Oran(e) {
		e = e || {};
		if (typeof e != 'object')
			e = { kod: e };
		return this.getKod2Oran($.extend({}, e, { belirtec: 'gkkp' }))
	}
	static getKonaklamaKod2Oran(e) {
		e = e || {};
		if (typeof e != 'object')
			e = { kod: e };
		return this.getKod2Oran($.extend({}, e, { belirtec: 'konaklama' }))
	}
	static getDigerKod2Oran(e) {
		e = e || {};
		if (typeof e != 'object')
			e = { kod: e };
		return this.getKod2Oran($.extend({}, e, { belirtec: 'diger' }))
	}
	static async getKdvBilgileri(e) {
		return await MQVergiKdv.getKdvBilgileri(e)
	}
	static async getTevkifatBilgileri(e) {
		return await MQVergiKdv.getTevkifatBilgileri(e)
	}
	static async getTevkifatBilgiDict(e) {
		return await MQVergiKdv.getTevkifatBilgiDict(e)
	}
	static get eTip2BelirtecDict() {
		let result = this._eTip2BelirtecDict;
		if (result === undefined) {
			result = {};
			for (const cls of [MQVergiKdv, MQVergiOtv, MQVergiStopaj])
				result[cls.eIslTypeCode] = cls.belirtec
			for (let i = 72; i <= 77; i++)
				result[`00${i}`] = MQVergiOtv.belirtec
			$.extend(result, {
				'0059': 'konaklama',
				'4080': 'ozelIletisim',
				'8001': 'mustahsil_borsa',
				'9040': 'mustahsil_mera',
				'SGK_PRIM': 'mustahsil_bagkur',
				'BIR_KES': 'mustahsil_birlik'
			});
			this._eTip2BelirtecDict = result
		}
		return result
	}
	static getETip2Belirtec(e) {
		e = e || {}
		const eTip = typeof e == 'object' ? e.eTip : e;
		const {eTip2BelirtecDict}  = this;
		return eTip2BelirtecDict[eTip] || null
	}
	static get belirtec2AltSinif() {
		let result = this._belirtec2AltSinif;
		if (result === undefined) {
			result = {};
			const subClasses = MQVergiAlt.subClasses;
			for (const cls of subClasses) {
				const {belirtec} = cls;
				if (belirtec)
					result[belirtec] = cls
			}
			this._belirtec2AltSinif = result
		}
		return result
	}
	static altYapiDictDuzenle(e) {
		super.altYapiDictDuzenle(e);
		const {liste} = e;
		const {belirtec2AltSinif} = this;
		for (const belirtec in belirtec2AltSinif)
			liste[belirtec] = belirtec2AltSinif[belirtec]
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			ba: new PInstTekSecim('ba', BorcAlacak),
			tip: new PInstTekSecim('vergitipi', VergiTip),
			altTip: new PInstStr('alttip'),
			belirtec: new PInstStr('belirtec'),
			oncelik: new PInstNum('oncelik'),
			grupKod: new PInstStr('vergrupkod'),
			muhHesapKod: new PInst('muhhesapkod'),
			ihrKayMuhHesapKod: new PInst('muhhesap2kod')
			/* kdvTevkifMuhHesapKod: new PInstStr('muhhesap3kod') */
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		this.formBuilder_addTabPanelWithGenelTab(e);
		const tabPage_genel = e.tabPage_genel;
		let form = tabPage_genel.addFormWithParent().yanYana();
		form.addRadioButton({ id: 'ba', etiket: 'B/A', source: e => e.builder.inst.ba.kaListe })
			.addStyle_wh({ width: '300px !important' });
		form.addLabel({ etiket: 'Tip' })
			.addStyle(e => `$elementCSS { --width: 50px; min-width: var(--width) !important; width: var(--width) !important }`);
		form.addModelKullan({ id: 'tip', etiket: '', source: e => e.builder.inst.tip.kaListe }).etiketGosterim_yok()
			.dropDown().noMF().kodsuz()
			.degisince(e => {
				const {builder} = e;
				const {fbd_vergiAltForm} = builder.rootPart;
				for (const builder of fbd_vergiAltForm.getBuilders())
					builder.updateVisible()
			})
			.addStyle_wh({ width: '300px !important' });
		form = tabPage_genel.addFormWithParent().altAlta();
		const fbd_vergiAltForm = e.fbd_vergiAltForm = tabPage_genel.addFormWithParent({ id: 'vergiAltForm' });
		this.rootFormBuilderDuzenle_vergiAltForm(e);
		fbd_vergiAltForm._afterRun = fbd_vergiAltForm.afterRun;
		fbd_vergiAltForm.onAfterRun(e => {
			const {builder} = e;
			const {rootPart, _afterRun} = builder;
			builder.rootPart.fbd_vergiAltForm = builder;
			if (_afterRun)
				getFuncValue.call(this, _afterRun, e)
		})
	}
	static getFormBuilders_vergiAltForm(e) {
		const fbd_vergiAltForm = e.fbd_vergiAltForm = new FormBuilder({ id: 'vergiAltForm' });
		this.rootFormBuilderDuzenle_vergiAltForm(e)
		return fbd_vergiAltForm
	}
	static rootFormBuilderDuzenle_vergiAltForm(e) {
		const {fbd_vergiAltForm} = e;
		fbd_vergiAltForm.altAlta();
		for (const altYapiKey in MQVergi.altYapiDict) {
			let form = fbd_vergiAltForm.addFormWithParent({ id: altYapiKey }).yanYana(2)
				.setAltInst(e => { const {builder} = e; return builder.inst[builder.id] })
				.setVisibleKosulu(e => {
					const {builder} = e;
					const {altInst, inst} = builder;
					const altYapiKey = builder.id;
					const tip = inst.tip.char ?? inst.tip;
					return !!altInst.class.tipSet[tip] || (altYapiKey == 'kdv' && tip == 'KTEV')
				});
			form.addTextInput({ id: 'belirtec', etiket: 'Belirteç', maxLength: 8 })
				.setAltInst(e => e.builder.inst)
				.addStyle_wh({ width: '150px !important' });
			form.addNumberInput({ id: 'oncelik', etiket: 'Öncelik', maxLength: 3, min: 0, max: 100 })
				.setAltInst(e => e.builder.inst)
				.addStyle_wh({ width: '100px !important' });
			form.addModelKullan({ id: 'oran', etiket: 'Oran', maxLength: 3 }).comboBox().noMF().kodsuz()
				.setSource(e => {
					const {altInst} = e.builder;
					const oranlar = [0, ...(altInst.class.sabitOranlar || [])];
					return oranlar.map(oran => new CKodVeAdi({ kod: oran, aciklama: oran.toString() }))
				})
				.widgetArgsDuzenleIslemi(e => {
					$.extend(e.args, {
						rendererEk: e => {
							const matchStr = `<div class="aciklama`;
							return e.result.replace(matchStr, `${matchStr} right`)
						}
					})
				})
				.degisince(e => {
					const {builder} = e;
					const value = asFloat(e.sender.widget.input.val());
					builder.inst.belirtec = value.toString()
				})
				.addStyle_wh({ width: '100px !important' })
				.addStyle(e => `$elementCSS .jqx-widget-content { text-align: right }`);
			if (altYapiKey == 'kdv') {
				const getAltInst = e => e.builder.parentBuilder.altInst.tevkifatYapi;
				const getVisibleKosulu = e => {
					const {inst} = e.builder; const tip = inst.tip.char ?? inst.tip;
					return tip == 'KTEV'
				};
				form.addNumberInput({ id: 'pay', etiket: 'Pay', min: 0, max: 10 })
					.setAltInst(getAltInst).setVisibleKosulu(getVisibleKosulu)
					.addStyle_wh({ width: '100px !important' });
				form.addNumberInput({ id: 'baz', etiket: 'Baz', min: 0, max: 10 })
					.setAltInst(getAltInst).setVisibleKosulu(getVisibleKosulu)
					.addStyle_wh({ width: '100px !important' });
				form.addModelKullan({ id: 'tevkifatIslemTuru', etiket: 'İşlem Türü' }).dropDown().noMF()
					.setAltInst(getAltInst).setVisibleKosulu(getVisibleKosulu)
					.setSource(e => {
						const {inst} = e.builder; const ba = inst.ba.char ?? inst.ba;
						return MQVergi.getKismiTevkifatlar({ ba: ba })
					})
					.degisince(e => {
						const {builder} = e;
						const {inst, altInst, parentBuilder} = builder;
						const value = altInst.tevkifatIslemTuru = e.value;
						let islemTuru = e.item;
						if (!islemTuru) {
							const ba = inst.ba.char ?? inst.ba;
							islemTuru = MQVergi.getKismiTevkifatlar({ ba: ba }).find(ka => ka.kod == value)
						}
						const {oran} = islemTuru || {};
						if (oran) {
							inst.belirtec = oran;
							const parts = oran.split('/');
							const {id2Builder} = parentBuilder;
							id2Builder.pay.input.val(asInteger(parts[0]) || 0);
							id2Builder.baz.input.val(asInteger(parts[1]) || 0)
						}
					})
					.addStyle(e => `$elementCSS { min-width: 1200px !important }`)
			}
		}
	}
	static getFormBuilder_shdKDV(e) {
		const {ioAttrPrefix, etiketPrefix, ba} = e;
		return this.getFormBuilder_shdDigerVergi($.extend({}, e, {
			ioAttr: `${ioAttrPrefix}KdvHesapKod`, etiket: 'KDV Hesabı',
			belirtec: 'KDV', ba: ba,
			builderDuzenle: e => {
				const {formBuilder, vergiHesapBuilder, ioAttrPrefix, etiketPrefix} = e;
				formBuilder.add(
					vergiHesapBuilder,
					new FBuilder_CheckBox({ id: `${ioAttrPrefix}KdvDegiskenmi`, etiket: `${etiketPrefix || ''} KDV Değişkendir` })
						.onChange(e =>
							vergiHesapBuilder.updateVisible())
				);
				vergiHesapBuilder.setVisibleKosulu(e =>
					!!e.builder.altInst[`${ioAttrPrefix}KdvDegiskenmi`] ? 'basic-hidden' : true);
					// return value ? 'basic-hidden' : true
				e.attachedToParent()
			}
		}))
	}
	static getFormBuilder_shdDigerVergi(e) {
		const {belirtec, ioAttr, etiket, ba} = e;
		let vergiHesapBuilder = new FBuilder_ModelKullan({ id: ioAttr, etiket: etiket, mfSinif: MQVergi })
			.dropDown()
			.ozelQueryDuzenleBlock(e => {
				const {stm, alias} = e;
				stm.sentDo(sent => {
					sent.where.degerAta(belirtec.toUpperCase(), `${alias}.vergitipi`);
					sent.where.degerAta(ba, `${alias}.ba`)
				})
			});
		let formBuilder = new FBuilderWithInitLayout({ id: `${belirtec}Form` });
		let attachedToParentFlag = false;
		const {builderDuzenle} = e;
		if (builderDuzenle) {
			const _e = $.extend({}, e, {
				formBuilder: formBuilder, vergiHesapBuilder: vergiHesapBuilder,
				attachedToParentFlag: coalesce(e.attachedToParent, false),
				attachedToParent() { this.attachedToParentFlag = true; return this },
				notAttachedToParent() { this.attachedToParentFlag = false; return this }
			});
			getFuncValue.call(this, builderDuzenle, _e);
			vergiHesapBuilder = _e.vergiHesapBuilder;
			formBuilder = _e.formBuilder;
			attachedToParentFlag = _e.attachedToParentFlag
		}
		if (!attachedToParentFlag)
			formBuilder.add(vergiHesapBuilder)
		return formBuilder
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);
		const {secimler} = e;
		secimler.secimTopluEkle({
			tip: new SecimBirKismi({ etiket: 'Tip', tekSecimSinif: VergiTip }),
			grupKod: new SecimString({ mfSinif: MQVergiGrup }),
			grupAdi: new SecimOzellik({ etiket: 'Grup Adı' }),
			belirtec: new SecimString({ etiket: 'Belirteç' }),
			ba: new SecimBirKismi({ etiket: 'B/A', tekSecimSinif: BorcAlacak })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			if (secimler.tip.value != null)
				where.birKismi(secimler.tip.value, `${aliasVeNokta}vergitipi`);
			where.basiSonu(secimler.grupKod, `${aliasVeNokta}vergrupkod`);
			where.ozellik(secimler.grupAdi, `vgrp.aciklama`);
			where.basiSonu(secimler.belirtec, `${aliasVeNokta}belirtec`);
			if (secimler.ba.value != null)
				where.birKismi(secimler.ba.value, `${aliasVeNokta}ba`);
		})
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const {aliasVeNokta} = this;
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'vergrupkod', text: 'Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'vergrupadi', text: 'Grup Adı', genislikCh: 20, sql: 'vgrp.aciklama' }),
			new GridKolon({ belirtec: 'vergitipi', text: 'Tip', genislikCh: 23, sql: VergiTip.getClause(`${aliasVeNokta}vergitipi`) }),
			new GridKolon({ belirtec: 'belirtec', text: 'Belirteç', genislikCh: 10 }),
			new GridKolon({ belirtec: 'kdvorani', text: 'Kdv %', genislikCh: 8 }).tipNumerik(),
			new GridKolon({ belirtec: 'otvorani', text: 'Ötv %', genislikCh: 8 }).tipNumerik(),
			new GridKolon({ belirtec: 'stopajorani', text: 'Sto %', genislikCh: 8 }).tipNumerik(),
			new GridKolon({ belirtec: 'konaklamaorani', text: 'Konak. %', genislikCh: 8 }).tipNumerik()
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.fromIliski('vergigrup vgrp', 'ver.vergrupkod = vgrp.kod')
	}
}

class MQVergiAlt extends MQAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get belirtec() { return null }
	static get rowAttrPrefix() { return null }

	static get tipSet() {
		let result = this._tipSet;
		if (!result) {
			const e = { liste: {} };
			this.tipSetDuzenle(e);
			result = this._tipSet = e.liste
		}
		return result
	}
	static tipSetDuzenle(e) { }
	static async getKod2VergiBilgi(e) {
		e = e || {};
		const rootGlobals = MQVergi.globals;
		const belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		const rootGlobalKey = this.belirtec || this.classKey || this;
		const globalKey = [rootGlobalKey].join('-');
		const globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		let result = globals.kod2VergiBilgi;
		if (result == null) {
			result = {};
			const {table, kodSaha} = MQVergi;
			const {tipSet, rowAttrPrefix} = this;
			let sent = new MQSent({
				from: table,
				where: [
					`kod <> ''`, `alttip = ''`, `baktifmi <> 0`,
					{ inDizi: Object.keys(tipSet), saha: 'vergitipi' }
				],
				sahalar: ['kod', 'ba', `${rowAttrPrefix}orani oran`]
			});
			const recs = await app.sqlExecSelect({ query: sent });
			for (const rec of recs) {
				const kod = rec.kod.trimEnd();
				const ba = rec.ba.trimEnd();
				const oran = asFloat(rec.oran);
				result[kod] = { ba: ba, oran: oran }
			}
			globals.kod2VergiBilgi = result
		}
		return result
	}
	static async getKod2OranSet(e) {
		e = e || {};
		const rootGlobals = MQVergi.globals;
		const belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		const rootGlobalKey = this.belirtec || this.classKey || this;
		const ba = e.ba || '';
		const globalKey = [rootGlobalKey, ba].join('-');
		const globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		let result = globals.kod2Oran;
		if (result == null) {
			result = {};
			const oran2KodSet = globals.oran2KodSet || {};
			const kod2VergiBilgi = await this.getKod2VergiBilgi(e);
			for (const kod in kod2VergiBilgi) {
				const {oran} = kod2VergiBilgi[kod];
				result[kod] = oran;
				( oran2KodSet[oran] = oran2KodSet[oran] || {} )[kod] = true
			}
			globals.oran2KodSet = oran2KodSet;
			globals.kod2Oran = result
		}
		return result
	}
	static async getKod2Oran(e) {
		e = e || {};
		const {kod} = e;
		if (!kod)
			return undefined
		const result = await this.getKod2OranSet(e) || {};
		return result[kod]
	}
	static async oran2KodSet(e) {
		e = e || {};
		const rootGlobals = MQVergi.globals;
		const belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		const rootGlobalKey = this.belirtec || this.classKey || this;
		
		const ba = e.ba || '';
		const globalKey = [rootGlobalKey, ba].join('-');
		let globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		let {oran2KodSet} = globals;
		if (oran2KodSet == null) {
			await this.getKod2OranSet(e);
			globals = belirtec2Globals[globalKey] || {};
			oran2KodSet = globals.oran2KodSet
		}
		return oran2KodSet
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			oran: new PInstNum(`${this.rowAttrPrefix}orani`)
		})
	}
}
class MQVergiKdv extends MQVergiAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get belirtec() { return 'kdv' }
	static get rowAttrPrefix() { return 'kdv' }
	static get eIslTypeCode() { return '0015' }
	static tipSetDuzenle(e) {
		super.tipSetDuzenle(e);
		const {liste} = e;
		liste.KDV = true
		// liste.KDV = liste.KMAT0 = liste.KDI = liste.KTEV = true
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			tevkifatYapi: new PInstClass(Oran),
			tevkifatIslemTuru: new PInstStr('tevislemturu'),
			refVergiKod: new PInstStr('refvergikod')
		})
	}
	static get sabitOranlar() {
		const rootGlobals = MQVergi.globals;
		const belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		const globalKey = this.belirtec || this.classKey || this;
		const globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		let result = globals.sabitOranlar;
		if (result == null) {
			const {oranlar} = app.sabitTanimlar.vergi || {};
			if (!$.isEmptyObject(oranlar))
				result = oranlar.map(x => asInteger(x))
			if (result == null)
				result = [1, 10, 20];
			globals.sabitOranlar = result
		}
		return result
	}
	static async getKdvBilgileri(e) {
		e = e || {};
		let satismi, iademi;
		const fisSinif = (e.fis || {}).class || e.fisSinif;
		let {ba} = e;
		if (fisSinif) {
			satismi = fisSinif.satismi;
			iademi = fisSinif.iademi
		}
		if (iademi == null)
			iademi = e.iademi ?? e.iade
		if (satismi == null) {
			satismi = e.satismi ?? e.satis;
			if (satismi == null) {
				let alimmi = e.alimmi ?? e.alim;
				if (alimmi != null)
					satismi = !alimmi
			}
		}
		if (satismi == null) {
			if (ba)
				ba = ba.char ?? ba
			satismi = ba == 'B' ? true : ba == 'A' ? false : null;
			if (iademi)
				satismi = !satismi
		}
		if (!ba && satismi != null)
			ba = (satismi == iademi) ? 'B' : 'A'
		
		const rootGlobals = MQVergi.globals;
		const belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		const globalKey = this.belirtec || this.classKey || this;
		const globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		const anah2KdvBilgileri = globals.anah2KdvBilgileri = globals.anah2KdvBilgileri || {};
		let altTip = e.altTip ?? '';
		const anah = `${satismi == null ? '' : satismi ? 'T' : 'A'}|${iademi ? 'I' : ''}|${altTip}`;
		let result = anah2KdvBilgileri[anah];
		if (result === undefined) {
			const {table} = MQVergi;
			const vergiTipi = iademi ? 'KDI' : 'KDV';
			const sent = new MQSent({
				from: table,
				where: [
					`baktifmi <> 0`,
					{ degerAta: vergiTipi, saha: 'vergitipi' },
					ba == null ? null : { degerAta: ba, saha: 'ba' },
					{ degerAta: altTip, saha: 'alttip' }
				],
				sahalar: ['kod kdvKod', 'kdvorani kdvOrani', 'belirtec kdvBelirtec']
			});
			const kod2Rec = {};
			const recs = await app.sqlExecSelect({ query: sent });
			for (const rec of recs)
				kod2Rec[rec.kdvKod] = rec
			result = anah2KdvBilgileri[anah] = kod2Rec
		}
		return result
	}
	static async getTevkifatBilgiDict(e) {
		e = e || {};
		let ticariCikismi = coalesce(coalesce(e.ticariCikis, e.ticariCikismi), e.ticariCikisGibimi);
		if (ticariCikismi == null)
			ticariCikismi = coalesce(e.cikis, e.cikismi);
		if (ticariCikismi == null) {
			let satismi, iademi;
			const fisSinif = (e.fis || {}).class || e.fisSinif;
			if (fisSinif) {
				satismi = fisSinif.satismi;
				iademi = fisSinif.iademi;
			}
			if (satismi == null) {
				satismi = coalesce(e.satismi, e.satis);
				if (satismi == null)
					satismi = !coalesce(e.alimmi, e.alim);
			}
			if (iademi == null)
				iademi = asBool(coalesce(e.iademi, e.iade));
			ticariCikismi = satismi != iademi;
		}
		
		const rootGlobals = MQVergi.globals;
		const belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		const globalKey = this.belirtec || this.classKey || this;
		const globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		const anah2TevkifatBilgiDict = globals.anah2TevkifatBilgiDict = globals.anah2TevkifatBilgiDict || {};
		
		const anah = [ticariCikismi];
		let result = anah2TevkifatBilgiDict[anah];
		if (result === undefined) {
			const recs = await MQVergiKdv.getTevkifatBilgileri(e);
			if (recs) {
				result = {};
				for (const rec of recs) {
					const {kod} = rec;
					result[kod] = rec
				}
			}
			if (result !== undefined)
				anah2TevkifatBilgiDict[anah] = result
		}
		
		return result
	}
	static async getTevkifatBilgileri(e) {
		e = e || {};
		let ticariCikismi = coalesce(coalesce(e.ticariCikis, e.ticariCikismi), e.ticariCikisGibimi);
		if (ticariCikismi == null)
			ticariCikismi = coalesce(e.cikis, e.cikismi);
		if (ticariCikismi == null) {
			let satismi, iademi;
			const fisSinif = (e.fis || {}).class || e.fisSinif;
			if (fisSinif) {
				satismi = fisSinif.satismi;
				iademi = fisSinif.iademi
			}
			if (satismi == null) {
				satismi = coalesce(e.satismi, e.satis);
				if (satismi == null)
					satismi = !coalesce(e.alimmi, e.alim)
			}
			if (iademi == null)
				iademi = asBool(coalesce(e.iademi, e.iade))
			ticariCikismi = satismi != iademi
		}
		const rootGlobals = MQVergi.globals;
		const belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		const globalKey = this.belirtec || this.classKey || this;
		const globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		const anah2TevkifatBilgileri = globals.anah2TevkifatBilgileri = globals.anah2TevkifatBilgileri || {};
		const anah = [ticariCikismi];
		let result = anah2TevkifatBilgileri[anah];
		if (result === undefined) {
			const {table} = MQVergi;
			const vergiTipi = 'KTEV'
			const ba = ticariCikismi ? 'B' : 'A';
			const sent = new MQSent({
				from: table,
				where: [
					{ degerAta: vergiTipi, saha: 'vergitipi' },
					{ degerAta: ba, saha: 'ba' }
				],
				sahalar: [
					'kod', 'belirtec', 'oncelik',
					'kdvtevoranpay oranPay', 'kdvtevoranbaz oranBaz', 'tevislemturu islemTuru'
				]
			});
			const stm = new MQStm({
				sent: sent,
				orderBy: ['oncelik', 'belirtec', 'kod']
			});
			const recs = anah2TevkifatBilgileri[anah] = [];
			recs.push(new CTevkifatBilgi({ kod: '', oran: '0/1' }));
			const _recs = await app.sqlExecSelect({ query: stm });
			if (_recs) {
				for (const _rec of _recs) {
					const rec = new CTevkifatBilgi({
						kod: _rec.kod,
						oran: { pay: _rec.oranPay, baz: _rec.oranBaz },
						belirtec: _rec.belirtec, islemTuru: _rec.islemTuru
					})
					recs.push(rec)
				}
			}
			result = recs
		}
		return result
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e);
		const {hv} = e;
		const {tevkifatYapi} = this;
		$.extend(hv, {
			kdvtevoranpay: asInteger(tevkifatYapi.pay) || 0,
			kdvtevoranbaz: asInteger(tevkifatYapi.baz) || 0
		})
	}
	setValues(e) {
		super.setValues(e);
		const {rec} = e;
		const {tevkifatYapi} = this;
		$.extend(tevkifatYapi, {
			pay: asInteger(rec.kdvtevoranpay) || 0,
			baz: asInteger(rec.kdvtevoranbaz) || 0
		})
	}
}
class MQVergiOtv extends MQVergiAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get belirtec() { return 'otv' }
	static get rowAttrPrefix() { return 'otv' }
	static get eIslTypeCode() { return '0071' }
	static tipSetDuzenle(e) {
		super.tipSetDuzenle(e);
		const {liste} = e;
		liste.OTV = liste.OTEC = true
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			oransalmi: new PInstTrue('otvoransaldir'),
			tecilYapi: new PInstClass(Oran)
		})
	}
	static get sabitOranlar() {
		const rootGlobals = MQVergi.globals;
		const belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		const globalKey = this.belirtec || this.classKey || this;
		const globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		let result = globals.sabitOranlar;
		if (result == null) {
			const oranlar = MQVergi.belirtec2AltSinif.kdv.sabitOranlar;
			if (oranlar != null)
				result = oranlar
			globals.sabitOranlar = result
		}
		return result
	}
}
class MQVergiStopaj extends MQVergiAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get belirtec() { return 'stopaj' }
	static get rowAttrPrefix() { return 'stopaj' }
	static get eIslTypeCode() { return '0003' }
	static tipSetDuzenle(e) {
		super.tipSetDuzenle(e);
		const {liste} = e;
		liste.STO = true
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			tipi: new PInstStr('stotipkod')
		})
	}
}
class MQVergiGKKP extends MQVergiAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get belirtec() { return 'gkkp' }
	static get rowAttrPrefix() { return 'gkkp' }
	static tipSetDuzenle(e) {
		super.tipSetDuzenle(e);
		const {liste} = e;
		liste.GKKP = true
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			oransalmi: new PInstBool('gkkporansaldir')
		})
	}
}
class MQVergiMustahsil extends MQVergiAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get belirtec() { return 'mustahsil' }
	static get rowAttrPrefix() { return 'mustahsil' }
	static tipSetDuzenle(e) {
		super.tipSetDuzenle(e);
		const {liste} = e;
		liste.MMAK = true
	}
}
class MQVergiKonaklama extends MQVergiAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get belirtec() { return 'konaklama' }
	static get rowAttrPrefix() { return 'konaklama' }
	static tipSetDuzenle(e) {
		super.tipSetDuzenle(e);
		const {liste} = e;
		liste.KON = true
	}
}
class MQVergiEkVergi extends MQVergiAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get belirtec() { return 'ekVergi' }
	static get rowAttrPrefix() { return 'ekvergi' }
	static tipSetDuzenle(e) {
		super.tipSetDuzenle(e);
		const {liste} = e;
		liste.EKVER = true
	}
}


class CTevkifatBilgi extends PayVeBaz {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {};
		super(e);
		if ($.isArray(e)) {
			this.islemTuru = e[5];
			this.belirtec = e[6];
		}
		else {
			if (e.islemTuru != undefined)
				this.islemTuru = e.islemTuru;
			if (e.belirtec != undefined)
				this.belirtec = e.belirtec;
		}
	}
}

