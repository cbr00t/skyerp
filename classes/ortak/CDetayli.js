class DetayliYapi extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }

	get detaylar() { return this.ekBilgi }
	set detaylar(value) { return this.ekBilgi = value }

	constructor(e) {
		e = e || {};
		super(e);

		if ($.isArray(e)) {
			this.detaylar = e[0];
		}
		else {
			if (e.detaylar !== undefined)
				this.detaylar = e.detaylar;
		}

		this.detaylar = this.detaylar || [];
	}

	addDetay(...liste) {
		const {detaylar} = this;
		if (liste) {
			for (const item of liste) {
				if (item == null)
					continue;
				
				if ($.isArray(item))
					detaylar.push(...item)
				else
					detaylar.push(item)
			}
		}
		return this
	}

	addDetaylar(liste) {
		return this.addDetay(liste)
	}

	detaylarReset() {
		this.detaylar = [];
	}
}


class SeviyeliYapi extends DetayliYapi {
	get orjBilgi() {
		return coalesce(this._orjBilgi, () => (this.detaylar || [])[0])
	}
	set orjBilgi(value) {
		this._orjBilgi = value
	}

	constructor(e) {
		e = e || {};
		super(e);

		if ($.isArray(e)) {
			this.orjBilgi = e[0];
			this.detaylar = e[1];
		}
		else {
			if (e.orjBilgi !== undefined)
				this.orjBilgi = e.orjBilgi;
		}
	}
}
