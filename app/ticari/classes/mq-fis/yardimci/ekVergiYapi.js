class EkVergiYapi extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get bosmu() { return !this.tip.char }
	get tevkifatmi() { return this.tip.char == 'TV' }
	get istisnami() { return this.kismiIstisnami || this.tamIstisnami }
	get tamIstisnami() { return this.tip.char == 'IS' }
	get kismiIstisnami() { return this.tip.char == 'KI' }
	

	get kodAttr() {
		if (this.tevkifatmi)
			return 'dettevhesapkod';
		if (this.istisnami)
			return 'detistisnakod';
		return null;
	}
	
	get belirtec() {
		if (this.tevkifatmi)
			return 'TEV';
		if (this.tamIstisnami)
			return 'TAMIST';
		if (this.kismiIstisnami)
			return 'KISIST';
		return null;
	}
	
	get tevkifatKod() {
		return this.tevkifatmi ? this.kod : null
	}
	set tevkifatKod(value) {
		if (this.tevkifatmi)
			this.kod = value;
	}
	get istisnaKod() {
		return this.istisnami ? this.kod : null
	}
	set istisnaKod(value) {
		if (this.istisnami)
			this.kod = value;
	}

	get oranStr() {
		const {oran} = this;
		if (!oran)
			return null;
		if (typeof oran == 'string')
			return oran;
		return `${oran.pay}/${oran.baz}`;
	}
	
	get kdvEkText() {
		if (this.bosmu)
			return '';

		const {belirtec, islemTuru, oranStr} = this;
		let result = '';
		if (belirtec)
			result += `<b>${belirtec}</b>`;
		if (oranStr)
			result += `-<span class="bold green">${oranStr}</span>`;
		if (islemTuru)
			result += ` (<i class="bold royalblue">${islemTuru}</i>)`;
		return result;
	}
	

	constructor(e) {
		e = e || {};
		super(e);

		this.islemTuru = e.islemTuru;
		this.oran = e.oran;
	}
	
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);

		const {pTanim} = e;
		$.extend(pTanim, {
			tip: new PInstTekSecim(EkVergiTipi),
			kod: new PInstStr()
		});
	}

	ticariHostVarsDuzenle(e) {
		const {fis, hv} = e;
		$.extend(hv, {
			detkdvekvergitipi: this.tip.char || '',
			dettevhesapkod: this.tevkifatKod || '',
			detistisnakod: this.islemTuru || ''
		});
	}

	ticariSetValues(e) {
		const {fis, rec} = e;
		this.tip.char = rec.detkdvekvergitipi;
		$.extend(this, {
			tevkifatKod: rec.dettevhesapkod,
			islemTuru: rec.detistisnakod
		});

		const {kod} = this;
		if (kod) {
			const {alimmi} = fis.class;
			if (this.tevkifatmi) {
				let promise = MQVergiKdv.getTevkifatBilgiDict({ fis: fis });
				promise.then(dict => {
					const rec = dict[kod] || {};
					this.islemTuru = rec.islemTuru;
					this.oran = rec.oran;
				});
			}
			else if (this.istisnami) {
				this.islemTuru = this.kod;
			}
		}
	}
}
