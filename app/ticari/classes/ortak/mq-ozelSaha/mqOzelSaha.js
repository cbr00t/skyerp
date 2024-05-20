
class MQOzelSahaGrup extends MQSayacliKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'OSahaGrup' }
	static get tableAlias() { return 'ogrp' }
	
	constructor(e) {
		e = e || {};
		super(e);

		this.detaylar = e.detaylar || [];			// SeviyeliYapi içindir
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e)
	}

	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e)
		// const {hv} = e;
	}

	setValues(e) {
		super.setValues(e)
		// const {rec} = e;
	}

	getOzelSahaFormBuilders(e) {
		const formBuilder = new FormBuilder({
			id: this.kod,
			/*altInst: e =>
				e.builder.inst[`ozelSaha${e.builder.id}`], */
			layout: e => {
				return $(
					`<div class="ozelSaha-grup">` +
						`<div class="header">${this.aciklama || ''}</div>` +
						`<div class="content flex-row"></div>` +
					`</div>`
				).appendTo(e.builder.parent)
			},
			styles: [
				e => {
					const prefix = e.builder.getCSSElementSelector(e.builder.parent);
					return `${prefix} .ozelSaha-grup {
						font-size: 100%;
						margin-bottom: 13px !important;
						margin-right: 5px !important;
					}
					${prefix} .ozelSaha-grup > .header {
						font-weight: bold;
						font-size: 130%;
						color: #aaa;
						border: 1px solid #ccc;
						width: 100%;
						height: 45px;
						margin-right: 3px !important;
					}
					${prefix} .ozelSaha-grup:not(.collapsed) > .header {
						color: #555;
						background-color: #f1fafe;
						border: 1px solid #bfc0c6;
					}
					${prefix} .ozelSaha-grup > .content {
						font-size: 100%;
						width: 100%;
						margin-right: 3px !important;
					}
					${prefix} .ozelSaha-grup > .content .ozelSaha-item {
						width: 20% !important;
						min-width: 120px !important;
						margin-bottom: 8px !important;
					}`
				}
			],
			buildEk: _e => {
				const {builder} = _e;
				const {layout, inst} = builder;
				const header = layout.children('.header')
				const content = layout.children('.content');
				for (const det of this.detaylar || []) {
					for (const subBuilder of det.getOzelSahaFormBuilders($.extend({}, e, _e))) {
						$.extend(subBuilder, {
							inst: inst, parentBuilder: builder,
							parent: content
						});
						builder.builders.push(subBuilder)
					}
				}

				const clickHandler = evt => {
					content.toggleClass('jqx-hidden');
					layout.toggleClass('collapsed')
				};
				for (const selector of ['click', 'touchend']) {
					header.off(selector);
					header.on(selector, clickHandler)
				}
			},
			afterRun: e => {
				const {layout} = e.builder;
				// const parentElmId = parentBuilder.getElementId(parent);
				setTimeout(() => layout.jqxSortable({ theme: theme, items: `> .content .ozelSaha-item` }), 10)
			}
		})

		return [formBuilder]
	}
}


class MQOzelSahaDetay extends MQDetay {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get prefix() { return 'OZ' }
	static get table() { return 'OSahaTanim' }
	static get tableAlias() { return 'osaha' }
	
	constructor(e) {
		e = e || {};
		super(e);
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			tip: new PInstTekSecim('tipi', OzelSahaTipi),
			attr: new PInstStr('attr'),
			aciklama: new PInstStr('aciklama'),
			gorunumSiraNo: new PInstNum('gorunumSiraNo'),
			genislik: new PInstNum('genislik'),
			fra: new PInstNum('fra'),
			tanimlardaZorunlumu: new PInstBool('tanimlardaZorunludur'),
			masterAramadaKullanilirmi: new PInstBool('masterAramadaKullan'),
			masterSecimdeKullanilirmi: new PInstBool('masterSecimdeKullan'),
			raporSecimdeKullanilirmi: new PInstBool('raporSecimdeKullan'),
			buyukmuVeyaBosmu: new PInstBool('buyukmuVeyaBosmu'),
			evetmiVeyaBugunmu: new PInstBool('evetmiVeyaBugundur'),
			teksecimVarInd: new PInstNum('teksecimVarInd')
		})
	}

	getOzelSahaFormBuilders(e) {
		e = e || {};
		const subBuilder = this.tip.getOzelSahaFormBuilder($.extend({}, e, { fra: this.fra }));
		if (!subBuilder)
			return [];

		const {prefix} = this.class;
		const {attr} = this;
		const id = attr ? attr.substring(prefix.length) : attr;
		$.extend(subBuilder, {
			id: id, etiket: this.aciklama,
			altInst: e => e.builder.inst.ozelSahalar,
			maxLength: this.genislik, kodsuzmu: true, bosKodEklenirmi: true,
			etiketGosterim: e.etiketGosterim
		});
		subBuilder.onChange(e => {
			const {builder, sender, item} = e;
			const kodAttr = e.kodAttr || sender.kodAttr || (sender.mfSinif || MQKA).kodSaha;
			const value = ((item || {})[kodAttr], e.value);
			builder.altInst[builder.id] = value
		});
		subBuilder.addCSS('ozelSaha-item');
		
		return [subBuilder]
	}
	
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e)
	}

	setValues(e) {
		super.setValues(e)
	}

	getConvertedValue(e) {
		if (e == null || typeof e != 'object')
			e = { value: e };
		e = $.extend({ fra: this.fra }, e);
		return this.tip.getConvertedValue(e)
	}
}


class OzelSahaTipi extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'TX' }
	
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e);
		
		const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['TX', 'Text', 'textmi']),
			new CKodVeAdi(['SY', 'Basit Sayı', 'basitSayimi']),
			new CKodVeAdi(['NR', 'Nümerik', 'numerikmi']),
			new CKodVeAdi(['DT', 'Tarih', 'tarihmi']),
			new CKodVeAdi(['YL', 'Yıl', 'yilmi']),
			new CKodVeAdi(['TS', 'Çokludan Seçim', 'cokludanSecimmi']),
			new CKodVeAdi(['CH', 'Evet/Hayır', 'evetHayirmi']),
			new CKodVeAdi(['NL', 'Çok Satırlı Yazı', 'mlemi']),
			new CKodVeAdi(['US', 'Uzun Sayı', 'uzunSayimi']),
			new CKodVeAdi(['AY', 'Ay Adı', 'aymi']),
			new CKodVeAdi(['TT', 'Dosya Yolu ve Adı', 'pathmi']),
			new CKodVeAdi(['TL', 'Telefon', 'telefonmu']),
			new CKodVeAdi(['EM', 'e-Mail', 'emailmi']),
			new CKodVeAdi(['IB', 'IBAN', 'ibanmi']),
			new CKodVeAdi(['IT', 'IBAN (TR)', 'ibanTRmi'])
		)
	}

	getOzelSahaFormBuilder(e) {
		const {char} = this;
		switch (char) {
			case 'SY':
			case 'US':
				return new FBuilder_NumberInput({ fra: 0 });
			case 'NR': return new FBuilder_NumberInput({ fra: e.fra || 0 });
			case 'DT': return new FBuilder_DateInput();
			case 'TS': return new FBuilder_ModelKullan({ source: e => { debugger; return ['a', 'b', 'c'] } }).dropDown();
			case 'CH': return new FBuilder_ToggleButton({ onLabel: 'EVET', offLabel: 'HAYIR' });
			case 'NL': return new FBuilder_TextArea({ rows: 5 });
		}

		return new FBuilder_TextInput()
	}

	getConvertedValue(e) {
		const {value, fra} = e;
		switch (this.char) {
			case 'SY':
			case 'YL':
			case 'AY':
				return asInteger(value) || 0
			case 'TS':
				return coalesce((value == null ? this.teksecimVarInd : asInteger(value)), 0)
			case 'NR':
			case 'US':
				return (this.fra == null ? asFloat(value) : roundToFra(value, fra)) || 0
			case 'DT':
				return value ? asDate(value) : (this.evetmiVeyaBugunmu ? today() : null)
			case 'CH':
				return value == null ? !!this.evetmiVeyaBugunmu : asBool(value)
		}

		return value || ''
	}
}
