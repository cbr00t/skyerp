class MQOrtakFis extends MQDetayli {
    static { window[this.name] = this; this._key2Class[this.name] = this }	
	static get gridKontrolcuSinif() { return null }
	get gridKontrolcuSinif() { return this.class.gridKontrolcuSinif }
	static get tableAlias() { return 'fis' } static get ayrimTable() { return 'tfisayrim' } static get noSaha() { return 'no' }
	static get dipSinif() { return DipIslemci } static get dipKullanilirmi() { return false } static get dipNakliyeKullanilirmi() { return false }
	static get dipIskOranSayi() { return 0 } static get dipIskBedelSayi() { return 0 }
	static get tsnKullanilirmi() { return true } static get numYapi() { return null }
	get numYapi() { return this.class.numYapi } get fisNox() { return this.tsn?.asText() }
	get dipIslemci() {
		let result = this._dipIslemci; if (result === undefined) { this.dipOlustur(); result = this._dipIslemci }
		return result
	}
	set dipIslemci(value) { this._dipIslemci = value }
	get dipGridSatirlari() { return null }
	get fisTopBrut() {
		let toplam = 0; const {detaylar} = this; if (!detaylar) { return 0 }
		for (const det of detaylar) { toplam += (det.brutBedel || 0) }
		return roundToBedelFra(toplam)
	}
	get fisTopNet() {
		let toplam = 0; const {detaylar} = this; if (!detaylar) { return 0 }
		for (const det of detaylar) { toplam += (det.netBedel || 0) }
		return roundToBedelFra(toplam)
	}
	get fisBaslikOlusturucular() { const _e = { liste: [] }; this.fisBaslikOlusturucularDuzenle(_e); return _e.liste }
	
	constructor(e) {
		e = e || {}; super(e); if (e.isCopy) return
		this.fisNo = e.no ?? e.fisNo ?? this.no
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { fisNo: new PInst() })
	}
	static secimlerDuzenleSon(e) {
		super.secimlerDuzenleSon(e); const {secimler} = e;
		secimler.grupTopluEkle([ { kod: 'teknik', aciklama: 'Teknik', renk: '#eee', zeminRenk: 'orangered', kapalimi: true } ]);
		secimler.secimTopluEkle({ sayac: new SecimInteger({ etiket: 'Belge ID' }) });
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta, sayacSaha} = this, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.sayac, `${aliasVeNokta}${sayacSaha}`)
		})
	}
	static getRootFormBuilder(e) { return this.getRootFormBuilder_fis(e) }
	static rootFormBuilderDuzenle(e) { }
	static rootFormBuilderDuzenleSonrasi_ayrimVeOzelSahalar_getParentBuilder(e) { return e.builders.baslikForm.builders[2] }
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		this.rootFormBuilderDuzenle_ilk(e);
		this.rootFormBuilderDuzenle_ara(e);
		this.rootFormBuilderDuzenle_son(e)
	}
	static rootFormBuilderDuzenle_ilk(e) { this.forAltYapiClassesDo('rootFormBuilderDuzenle_ilk', e) }
	static rootFormBuilderDuzenle_ara(e) { this.forAltYapiClassesDo('rootFormBuilderDuzenle_ara', e) }
	static rootFormBuilderDuzenle_son(e) { this.forAltYapiClassesDo('rootFormBuilderDuzenle_son', e) }
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e);
		this.standartGorunumListesiDuzenle_ilk(e);
		this.standartGorunumListesiDuzenle_ara(e);
		this.standartGorunumListesiDuzenle_son(e)
	}
	static standartGorunumListesiDuzenle_ilk(e) { this.forAltYapiClassesDo('standartGorunumListesiDuzenle_ilk', e) }
	static standartGorunumListesiDuzenle_ara(e) { this.forAltYapiClassesDo('standartGorunumListesiDuzenle_ara', e) }
	static standartGorunumListesiDuzenle_son(e) { this.forAltYapiClassesDo('standartGorunumListesiDuzenle_son', e) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		this.orjBaslikListesiDuzenle_ilk(e);
		this.orjBaslikListesiDuzenle_ara(e);
		this.orjBaslikListesiDuzenle_son(e)
	}
	static orjBaslikListesiDuzenle_ilk(e) { this.forAltYapiClassesDo('orjBaslikListesiDuzenle_ilk', e) }
	static orjBaslikListesiDuzenle_ara(e) { this.forAltYapiClassesDo('orjBaslikListesiDuzenle_ara', e) }
	static orjBaslikListesiDuzenle_son(e) { this.forAltYapiClassesDo('orjBaslikListesiDuzenle_son', e) }
	fisBaslikOlusturucularDuzenle(e) { }
	dipOlustur(e) {
		let result = null;
		if (this.class.dipKullanilirmi) {
			const {dipSinif} = this.class;
			if (dipSinif)
				result = this.dipIslemci = new dipSinif({ fis: this })
		}
		return result
	}
	getDipGridSatirlari(e) { e.liste = []; this.dipGridSatirlariDuzenle(e); return e.liste }
	dipGridSatirlariDuzenle(e) { }
	kopyaIcinDuzenle(e) {
		super.kopyaIcinDuzenle(e); this.fisNo = 0;
		for (const det of this.detaylar) { det.donusumBilgileriniSil(e) }
		this.donusumBilgileriniSil(e)
	}
	alternateKeyHostVarsDuzenle(e) {
		super.alternateKeyHostVarsDuzenle(e); const {hv} = e;
		hv[this.class.noSaha] = coalesce(this.fisNo, null)
	}
	setValues(e) {
		super.setValues(e); const {rec} = e;
		this.fisNo = rec[this.class.noSaha] || 0
	}
	uiDuzenle_fisGiris(e) {
		const {fisBaslikOlusturucular} = this;
		if (fisBaslikOlusturucular) {
			for (let baslikOlusturucu of fisBaslikOlusturucular) {
				const _e = $.extend({}, e);
				if (baslikOlusturucu) {
					if (baslikOlusturucu.prototype)
						baslikOlusturucu = new baslikOlusturucu();
					else
						baslikOlusturucu = getFuncValue.call(this, baslikOlusturucu, _e);
				}
				if (baslikOlusturucu && baslikOlusturucu.prototype)
					baslikOlusturucu = new baslikOlusturucu();
				if (baslikOlusturucu)
					getFuncValue.call(this, baslikOlusturucu, _e);
			}
		}
	}
	uiDuzenle_fisGirisIslemTuslari(e) {
		const {parent, sender} = e;
		let btn = $(`<button id="listedenSec">LST</button>`);
		btn.on('click', evt => {
			const {gridWidget} = sender;
			const listedenSecIslemi = colDef => {
				const {kaKolonu} = colDef || {};
				if (kaKolonu && kaKolonu.listedenSec) {
					const _e = { sender: sender, args: cell };
					kaKolonu.listedenSec(_e);
					return true
				}
			};
			const cell = gridWidget.getselectedcell();
			const {datafield} = cell;
			let colDef = sender.tabloKolonlari.find(_colDef => _colDef.kodAttr == datafield || _colDef.adiAttr == datafield);
			if (!listedenSecIslemi(colDef)) {
				colDef = sender.tabloKolonlari.find(_colDef => !!(_colDef.kaKolonu || {}).listedenSec);
				listedenSecIslemi(colDef)
			}
		});
		btn.appendTo(parent)
	}
	fisGiris_gridVeriYuklendi(e) { }
}