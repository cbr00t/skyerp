class BarkodParser_Tarti extends BarkodParser_Kuralli {
	static get aciklama() { return 'Tartı' }
	
	constructor(e) {
		e = e || {};
		super(e);
	}

	parseDevam(e) {
		let result = super.parseDevam(e);
		if (result)
			return result

		const {kural} = this;
		result = this.parcaAl({
			bas: kural.stokbas, hane: kural.stokhane,
			callback: value => this.shKod = value
		});
		if (!result)
			return result
		
		if (this.shKod) {
			let parser = new BarkodParser_Referans();
			const _e = { barkod: `${kural.kod}${this.shKod}` };
			result = parser.parse(_e);
			if (result)
				this.shKod = parser.shKod
			_e.shKod = this.shKod;
			
			const {shRec} = _e;
			if (shRec) {
				for (const key in shRec) {
					const value = shRec[key];
					if (value != null)
						this[key] = value;
				}
				result = true
			}
			else {
				result = this.shEkBilgileriBelirle(_e)
			}
		}
		this.parcaAl({ bas: kural.miktarbas, hane: kural.miktarhane,
			callback: value => {
				value = asFloat(value) || null;
				let bolen = kural.miktarBolen;
				if (value && bolen)
					value /= asFloat(bolen) || null;
				this.miktar = value || this.miktar || null
			} });
		
		this.parcaAl({ bas: kural.fiyatbas, hane: kural.fiyathane,
			callback: value => {
				const fiyatFra = coalesce((app.params.zorunlu || {}).fiyatFra, 6);
				value = asFloat(value) || null;
				let bolen = kural.fiyatbolen;
				if (value && bolen)
					value /= roundToFra(bolen, fiyatFra) || null;
				value = value ? roundToFra(value, fiyatFra) : value;
				this.fiyat = value || this.fiyat || null
			} });

		return result
	}
}
