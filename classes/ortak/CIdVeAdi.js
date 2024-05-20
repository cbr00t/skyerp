class CId extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }

	constructor(e) {
		e = e || {};
		super(e);
		
		this.id = e.id;
	}

	cizgiliOzet(e) {
		return '';
	}
	
	parantezliOzet(e) {
		return '';
	}
	
	toString(e) {
		return this.parantezliOzet(e);
	}
}


class CIdVeAdi extends CId {
	constructor(e) {
		e = e || {};
		super(e);
		
		this.aciklama = e.aciklama;
	}

	cizgiliOzet(e) {
		return this.aciklama || '';
	}
	
	parantezliOzet(e) {
		return this.aciklama || '';
	}
}
