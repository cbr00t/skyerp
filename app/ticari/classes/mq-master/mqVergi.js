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
		let liste = [];
		for (let key of this.getIOAttrPrefixes_ekVergi())
			liste.push(key)
		return liste
	}
	static get rowAttrPrefixes_ekVergi() {
		let liste = [];
		for (let key of this.getRowAttrPrefixes_ekVergi())
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
		let belirtec = e.belirtec || e.key;
		let altSinif = this.belirtec2AltSinif[belirtec];
		return altSinif ? altSinif.sabitOranlar : null
	}
	static async getKod2VergiBilgi(e) {
		e = e || {};
		let belirtec = e.belirtec || e.key;
		if (belirtec) {
			let altSinif = this.belirtec2AltSinif[belirtec];
			return altSinif ? await altSinif.getKod2VergiBilgi(e) : null
		}
		let oransizmi = e.oransizmi ?? e.oransiz;
		let rootGlobals = MQVergi.globals;
		let belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		let rootGlobalKey = this.belirtec || this.classKey || this;
		let globalKey = [rootGlobalKey, oransizmi ? 'oransiz' : ''].join('-');
		let globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		let result = globals.kod2VergiBilgi;
		if (result == null) {
			result = {};
			let {table, kodSaha} = MQVergi;
			let {tipSet, rowAttrPrefix} = this;
			let sent = new MQSent({
				from: table,
				where: [`kod <> ''`, `alttip = ''`, `baktifmi <> 0`],
				sahalar: (oransizmi ? ['kod', 'aciklama', 'vergitipi', 'alttip', 'belirtec', 'ba'] : ['*'])
			});
			let recs = await app.sqlExecSelect({ query: sent });
			let {belirtec2AltSinif} = this;
			for (let rec of recs) {
				let kod = rec.kod.trimEnd();
				let altTip = rec.alttip.trimEnd();
				let oranYapi;
				if (!oransizmi) {
					oranYapi = {}
					for (let belirtec in belirtec2AltSinif) {
						let cls = belirtec2AltSinif[belirtec];
						let {rowAttrPrefix} = cls;
						let oran = rec[`${rowAttrPrefix || ''}orani`];
						if (oran != null)
							oranYapi[belirtec] = asFloat(oran)
					}
				}
				let item = {
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
		let {globals} = this;
		let result = globals.tevkifatOranlari;
		if (result == null) {
			let {tevkifatOranlari} = app.sabitTanimlar.vergi || {};
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
		let fisSinif = e.fis || (e.fis || {}).class;
		
		let alimmi = coalesce(coalesce(e.alim, e.alimmi), e.ba ? e.ba == 'A' : null);
		if (alimmi == null)
			alimmi = !coalesce(e.satis, e.satismi)
		if (alimmi == null && fisSinif)
			alimmi = fisSinif.alimmi
		let kismimi = coalesce(e.kismi, e.kismimi)
		if (kismimi == null)
			kismimi = !coalesce(e.tam, e.tammi)

		let {globals} = this;
		let result = globals.tevkifatKodlari;
		if (result == null)
			globals.tevkifatKodlari = result = {}
		let subKey = [ alimmi ? 'A' : 'T', kismimi ? 'K' : 'T' ];
		let subResult = result[subKey];
		if (subResult === undefined) {
			let vergi = app.sabitTanimlar.vergi || {};
			let selector = kismimi ? 'kismiTevkifatUygulananIslemTurleri' : 'tamTevkifatIslemTurleri';
			subResult = vergi[selector] || null;
			if (subResult) {
				let uygunOlmayanKodSet = {};
				let _subResult = subResult;
				subResult = [];
				let kaSinif = kismimi ? CKodAdiVeOran : CKodVeAdi;
				for (let item of _subResult) {
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
		let {globals} = this;
		let key = `tevkifatDict-${toJSONStr(e)}`;
		let result = globals[key];
		if (result == null) {
			result = {};
			for (let ka of this.getTevkifatlar(e))
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
		let fisSinif = e.fis || (e.fis || {}).class;
		let alimmi = coalesce(e.alim, e.alimmi);
		if (alimmi == null)
			alimmi = !coalesce(e.satis, e.satismi);
		if (alimmi == null && fisSinif)
			alimmi = fisSinif.alimmi
		let kismimi = coalesce(e.kismi, e.kismimi);
		if (kismimi == null)
			kismimi = !coalesce(e.tam, e.tammi)

		let {globals} = this;
		let result = globals.istisnalar;
		if (result == null)
			globals.istisnalar = result = {}
		let subKey = [ alimmi ? 'A' : 'T', kismimi ? 'K' : 'T' ];
		let subResult = result[subKey];
		if (subResult === undefined) {
			let vergi = app.sabitTanimlar.vergi || {};
			let selector = kismimi ? 'kismiistisnalar' : 'tamistisnalar';
			subResult = vergi[selector] || null;
			if (subResult) {
				let uygunOlmayanKodSet = kismimi ? {} : asSet(['301', '302', '303']);
				let _subResult = subResult;
				subResult = [];
				let kaSinif = CKodAdiVeMadde;
				for (let item of _subResult) {
					let {kod} = item;
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
		e = e || {}; let {globals} = this, key  = `tumIstisnaDict-${toJSONStr(e)}`, result = globals[key];
		if (result == null) { result = { ...this.getKismiIstisnaDict(e), ...this.getTamIstisnaDict(e) }; globals[key] = result }
		let tamIstisnalar = (app.sabitTanimlar.vergi || {}).tamistisnalar || [];
		if (!$.isEmptyObject(tamIstisnalar)) {
			let uygunOlmayanKodSet = asSet(['301', '302', '303']);
			for (let {kod} of tamIstisnalar) {
				if (!uygunOlmayanKodSet[kod]) { continue }
				result[kod] = new CKodAdiVeMadde({ kod, aciklama: rec.ad || rec.adi || rec.aciklama || '', madde: rec.madde })
			}
		}
		return result
	}
	static getIstisnaDict(e) {
		let {globals} = this;
		let key = `istisnaDict-${toJSONStr(e)}`;
		let result = globals[key];
		if (result == null) {
			result = {};
			for (let ka of this.getIstisnalar(e))
				result[ka.kod] = ka;
			globals[key] = result
		}
		return result
	}
	static getKod2Oran(e) {
		e = e || {};
		let {belirtec} = e;
		let altSinif = this.belirtec2AltSinif[belirtec];
		return altSinif ? altSinif.getKod2Oran(e) : null;
	}
	static oran2KodSet(e) {
		e = e || {};
		let {belirtec} = e;
		let altSinif = this.belirtec2AltSinif[belirtec];
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
			for (let cls of [MQVergiKdv, MQVergiOtv, MQVergiStopaj])
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
		let eTip = typeof e == 'object' ? e.eTip : e;
		let {eTip2BelirtecDict}  = this;
		return eTip2BelirtecDict[eTip] || null
	}
	static get belirtec2AltSinif() {
		let result = this._belirtec2AltSinif;
		if (result === undefined) {
			result = {};
			let subClasses = MQVergiAlt.subClasses;
			for (let cls of subClasses) {
				let {belirtec} = cls;
				if (belirtec)
					result[belirtec] = cls
			}
			this._belirtec2AltSinif = result
		}
		return result
	}
	static altYapiDictDuzenle(e) {
		super.altYapiDictDuzenle(e);
		let {liste} = e;
		let {belirtec2AltSinif} = this;
		for (let belirtec in belirtec2AltSinif)
			liste[belirtec] = belirtec2AltSinif[belirtec]
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		let {pTanim} = e;
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
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); let {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana();
		form.addRadioButton({ id: 'ba', etiket: 'B/A', source: e => e.builder.inst.ba.kaListe }).addStyle_wh('300px !important');
		form.addLabel({ etiket: 'Tip' }).addStyle(e => `$elementCSS { --width: 50px; min-width: var(--width) !important; width: var(--width) !important; margin-bottom: 50px !important }`);
		form.addModelKullan({ id: 'tip', etiket: '', source: e => e.builder.inst.tip.kaListe }).etiketGosterim_yok()
			.dropDown().noMF().kodsuz()
			.degisince(e => {
				let {builder} = e, {fbd_vergiAltForm} = builder.rootPart;
				for (let builder of fbd_vergiAltForm.getBuilders()) { builder.updateVisible() }
			})
			.addStyle_wh({ width: '300px !important' });
		form = tabPage_genel.addFormWithParent().altAlta();
		let fbd_vergiAltForm = e.fbd_vergiAltForm = tabPage_genel.addFormWithParent({ id: 'vergiAltForm' });
		this.rootFormBuilderDuzenle_vergiAltForm(e);
		fbd_vergiAltForm._afterRun = fbd_vergiAltForm.afterRun;
		fbd_vergiAltForm.onAfterRun(e => {
			let {builder} = e;
			let {rootPart, _afterRun} = builder;
			builder.rootPart.fbd_vergiAltForm = builder;
			if (_afterRun)
				getFuncValue.call(this, _afterRun, e)
		})
	}
	static getFormBuilders_vergiAltForm(e) {
		let fbd_vergiAltForm = e.fbd_vergiAltForm = new FormBuilder({ id: 'vergiAltForm' });
		this.rootFormBuilderDuzenle_vergiAltForm(e)
		return fbd_vergiAltForm
	}
	static rootFormBuilderDuzenle_vergiAltForm(e) {
		let {fbd_vergiAltForm} = e;
		fbd_vergiAltForm.altAlta();
		for (let altYapiKey in MQVergi.altYapiDict) {
			let form = fbd_vergiAltForm.addFormWithParent({ id: altYapiKey }).yanYana(2)
				.setAltInst(e => { let {builder} = e; return builder.inst[builder.id] })
				.setVisibleKosulu(e => {
					let {builder} = e;
					let {altInst, inst} = builder;
					let altYapiKey = builder.id;
					let tip = inst.tip.char ?? inst.tip;
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
					let {altInst} = e.builder;
					let oranlar = [0, ...(altInst.class.sabitOranlar || [])];
					return oranlar.map(oran => new CKodVeAdi({ kod: oran, aciklama: oran.toString() }))
				})
				.widgetArgsDuzenleIslemi(e => {
					$.extend(e.args, {
						rendererEk: e => {
							let matchStr = `<div class="aciklama`;
							return e.result.replace(matchStr, `${matchStr} right`)
						}
					})
				})
				.degisince(e => {
					let {builder} = e;
					let value = asFloat(e.sender.widget.input.val());
					builder.inst.belirtec = value.toString()
				})
				.addStyle_wh({ width: '100px !important' })
				.addStyle(e => `$elementCSS .jqx-widget-content { text-align: right }`);
			if (altYapiKey == 'kdv') {
				let getAltInst = e => e.builder.parentBuilder.altInst.tevkifatYapi;
				let getVisibleKosulu = e => {
					let {inst} = e.builder; let tip = inst.tip.char ?? inst.tip;
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
						let {inst} = e.builder; let ba = inst.ba.char ?? inst.ba;
						return MQVergi.getKismiTevkifatlar({ ba: ba })
					})
					.degisince(e => {
						let {builder} = e;
						let {inst, altInst, parentBuilder} = builder;
						let value = altInst.tevkifatIslemTuru = e.value;
						let islemTuru = e.item;
						if (!islemTuru) {
							let ba = inst.ba.char ?? inst.ba;
							islemTuru = MQVergi.getKismiTevkifatlar({ ba: ba }).find(ka => ka.kod == value)
						}
						let {oran} = islemTuru || {};
						if (oran) {
							inst.belirtec = oran;
							let parts = oran.split('/');
							let {id2Builder} = parentBuilder;
							id2Builder.pay.input.val(asInteger(parts[0]) || 0);
							id2Builder.baz.input.val(asInteger(parts[1]) || 0)
						}
					})
					.addStyle(e => `$elementCSS { min-width: 1200px !important }`)
			}
		}
	}
	static getFormBuilder_shdKDV(e) {
		let {ioAttrPrefix, etiketPrefix, ba} = e;
		return this.getFormBuilder_shdDigerVergi($.extend({}, e, {
			ioAttr: `${ioAttrPrefix}KdvHesapKod`, etiket: 'KDV Hesabı',
			belirtec: 'KDV', ba: ba,
			builderDuzenle: e => {
				let {formBuilder, vergiHesapBuilder, ioAttrPrefix, etiketPrefix} = e;
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
		let {belirtec, ioAttr, etiket, ba} = e;
		let vergiHesapBuilder = new FBuilder_ModelKullan({ id: ioAttr, etiket: etiket, mfSinif: MQVergi })
			.dropDown()
			.ozelQueryDuzenleBlock(e => {
				let {stm, alias} = e;
				stm.sentDo(sent => {
					sent.where.degerAta(belirtec.toUpperCase(), `${alias}.vergitipi`);
					sent.where.degerAta(ba, `${alias}.ba`)
				})
			});
		let formBuilder = new FBuilderWithInitLayout({ id: `${belirtec}Form` });
		let attachedToParentFlag = false;
		let {builderDuzenle} = e;
		if (builderDuzenle) {
			let _e = $.extend({}, e, {
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
		let {secimler} = e;
		secimler.secimTopluEkle({
			tip: new SecimBirKismi({ etiket: 'Tip', tekSecimSinif: VergiTip }),
			grupKod: new SecimString({ mfSinif: MQVergiGrup }),
			grupAdi: new SecimOzellik({ etiket: 'Grup Adı' }),
			belirtec: new SecimString({ etiket: 'Belirteç' }),
			ba: new SecimBirKismi({ etiket: 'B/A', tekSecimSinif: BorcAlacak })
		});
		secimler.whereBlockEkle(e => {
			let {aliasVeNokta} = this;
			let {where, secimler} = e;
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
		let {aliasVeNokta} = this;
		let {liste} = e;
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
		let {aliasVeNokta} = this;
		let {sent} = e;
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
			let e = { liste: {} };
			this.tipSetDuzenle(e);
			result = this._tipSet = e.liste
		}
		return result
	}
	static tipSetDuzenle(e) { }
	static async getKod2VergiBilgi(e) {
		e = e || {};
		let rootGlobals = MQVergi.globals;
		let belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		let rootGlobalKey = this.belirtec || this.classKey || this;
		let globalKey = [rootGlobalKey].join('-');
		let globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		let result = globals.kod2VergiBilgi;
		if (result == null) {
			result = {};
			let {table, kodSaha} = MQVergi;
			let {tipSet, rowAttrPrefix} = this;
			let sent = new MQSent({
				from: table,
				where: [
					`kod <> ''`, `alttip = ''`, `baktifmi <> 0`,
					{ inDizi: Object.keys(tipSet), saha: 'vergitipi' }
				],
				sahalar: ['kod', 'ba', `${rowAttrPrefix}orani oran`]
			});
			let recs = await app.sqlExecSelect({ query: sent });
			for (let rec of recs) {
				let kod = rec.kod.trimEnd();
				let ba = rec.ba.trimEnd();
				let oran = asFloat(rec.oran);
				result[kod] = { ba: ba, oran: oran }
			}
			globals.kod2VergiBilgi = result
		}
		return result
	}
	static async getKod2OranSet(e) {
		e = e || {};
		let rootGlobals = MQVergi.globals;
		let belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		let rootGlobalKey = this.belirtec || this.classKey || this;
		let ba = e.ba || '';
		let globalKey = [rootGlobalKey, ba].join('-');
		let globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		let result = globals.kod2Oran;
		if (result == null) {
			result = {};
			let oran2KodSet = globals.oran2KodSet || {};
			let kod2VergiBilgi = await this.getKod2VergiBilgi(e);
			for (let kod in kod2VergiBilgi) {
				let {oran} = kod2VergiBilgi[kod];
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
		let {kod} = e;
		if (!kod)
			return undefined
		let result = await this.getKod2OranSet(e) || {};
		return result[kod]
	}
	static async oran2KodSet(e) {
		e = e || {};
		let rootGlobals = MQVergi.globals;
		let belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		let rootGlobalKey = this.belirtec || this.classKey || this;
		
		let ba = e.ba || '';
		let globalKey = [rootGlobalKey, ba].join('-');
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
		let {pTanim} = e;
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
		let {liste} = e;
		liste.KDV = true
		// liste.KDV = liste.KMAT0 = liste.KDI = liste.KTEV = true
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		let {pTanim} = e;
		$.extend(pTanim, {
			tevkifatYapi: new PInstClass(Oran),
			tevkifatIslemTuru: new PInstStr('tevislemturu'),
			refVergiKod: new PInstStr('refvergikod')
		})
	}
	static get sabitOranlar() {
		let rootGlobals = MQVergi.globals
		let belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {}
		let globalKey = this.belirtec || this.classKey || this
		let globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {}
		let { sabitOranlar: result } = globals
		if (result == null) {
			/*let {oranlar} = app.sabitTanimlar.vergi || {}
			if (!$.isEmptyObject(oranlar))
				result = oranlar.map(x => asInteger(x))*/
			if (result == null)
				result = [1, 10, 20]
			globals.sabitOranlar = result
		}
		return result
	}
	static async getKdvBilgileri(e) {
		e = e || {};
		let satismi, iademi;
		let fisSinif = (e.fis || {}).class || e.fisSinif;
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
		
		let rootGlobals = MQVergi.globals;
		let belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		let globalKey = this.belirtec || this.classKey || this;
		let globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		let anah2KdvBilgileri = globals.anah2KdvBilgileri = globals.anah2KdvBilgileri || {};
		let altTip = e.altTip ?? '';
		let anah = `${satismi == null ? '' : satismi ? 'T' : 'A'}|${iademi ? 'I' : ''}|${altTip}`;
		let result = anah2KdvBilgileri[anah];
		if (result === undefined) {
			let {table} = MQVergi;
			let vergiTipi = iademi ? 'KDI' : 'KDV';
			let sent = new MQSent({
				from: table,
				where: [
					`baktifmi <> 0`,
					{ degerAta: vergiTipi, saha: 'vergitipi' },
					ba == null ? null : { degerAta: ba, saha: 'ba' },
					{ degerAta: altTip, saha: 'alttip' }
				],
				sahalar: ['kod kdvKod', 'kdvorani kdvOrani', 'belirtec kdvBelirtec']
			});
			let kod2Rec = {};
			let recs = await app.sqlExecSelect({ query: sent });
			for (let rec of recs)
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
			let fisSinif = (e.fis || {}).class || e.fisSinif;
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
		
		let rootGlobals = MQVergi.globals;
		let belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		let globalKey = this.belirtec || this.classKey || this;
		let globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		let anah2TevkifatBilgiDict = globals.anah2TevkifatBilgiDict = globals.anah2TevkifatBilgiDict || {};
		
		let anah = [ticariCikismi];
		let result = anah2TevkifatBilgiDict[anah];
		if (result === undefined) {
			let recs = await MQVergiKdv.getTevkifatBilgileri(e);
			if (recs) {
				result = {};
				for (let rec of recs) {
					let {kod} = rec;
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
			let fisSinif = (e.fis || {}).class || e.fisSinif;
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
		let rootGlobals = MQVergi.globals;
		let belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		let globalKey = this.belirtec || this.classKey || this;
		let globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		let anah2TevkifatBilgileri = globals.anah2TevkifatBilgileri = globals.anah2TevkifatBilgileri || {};
		let anah = [ticariCikismi];
		let result = anah2TevkifatBilgileri[anah];
		if (result === undefined) {
			let {table} = MQVergi;
			let vergiTipi = 'KTEV'
			let ba = ticariCikismi ? 'B' : 'A';
			let sent = new MQSent({
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
			let stm = new MQStm({
				sent: sent,
				orderBy: ['oncelik', 'belirtec', 'kod']
			});
			let recs = anah2TevkifatBilgileri[anah] = [];
			recs.push(new CTevkifatBilgi({ kod: '', oran: '0/1' }));
			let _recs = await app.sqlExecSelect({ query: stm });
			if (_recs) {
				for (let _rec of _recs) {
					let rec = new CTevkifatBilgi({
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
		let {hv} = e;
		let {tevkifatYapi} = this;
		$.extend(hv, {
			kdvtevoranpay: asInteger(tevkifatYapi.pay) || 0,
			kdvtevoranbaz: asInteger(tevkifatYapi.baz) || 0
		})
	}
	setValues(e) {
		super.setValues(e);
		let {rec} = e;
		let {tevkifatYapi} = this;
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
		let {liste} = e;
		liste.OTV = liste.OTEC = true
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		let {pTanim} = e;
		$.extend(pTanim, {
			oransalmi: new PInstTrue('otvoransaldir'),
			tecilYapi: new PInstClass(Oran)
		})
	}
	static get sabitOranlar() {
		let rootGlobals = MQVergi.globals;
		let belirtec2Globals = rootGlobals.belirtec2Globals = rootGlobals.belirtec2Globals || {};
		let globalKey = this.belirtec || this.classKey || this;
		let globals = belirtec2Globals[globalKey] = belirtec2Globals[globalKey] || {};
		let result = globals.sabitOranlar;
		if (result == null) {
			let oranlar = MQVergi.belirtec2AltSinif.kdv.sabitOranlar;
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
		let {liste} = e;
		liste.STO = true
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		let {pTanim} = e;
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
		let {liste} = e;
		liste.GKKP = true
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		let {pTanim} = e;
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
		let {liste} = e;
		liste.MMAK = true
	}
}
class MQVergiKonaklama extends MQVergiAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get belirtec() { return 'konaklama' }
	static get rowAttrPrefix() { return 'konaklama' }
	static tipSetDuzenle(e) {
		super.tipSetDuzenle(e);
		let {liste} = e;
		liste.KON = true
	}
}
class MQVergiEkVergi extends MQVergiAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get belirtec() { return 'ekVergi' }
	static get rowAttrPrefix() { return 'ekvergi' }
	static tipSetDuzenle(e) {
		super.tipSetDuzenle(e);
		let {liste} = e;
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

