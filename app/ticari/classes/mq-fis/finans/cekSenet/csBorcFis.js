class BorcCSDevirFis extends BorcCSIlkFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi_prefix() { return 'Devir' }
	static get devirmi() { return true }
}
class BorcCekDevirFis extends BorcCSDevirFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get cekmi() { return true }
}
class BorcSenetDevirFis extends BorcCSDevirFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get senetmi() { return true }
}

class BorcCSGirisFis extends BorcCSIlkFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi_prefix() { return 'Borç' }
	static get sinifAdi_postfix() { return `${super.sinifAdi_postfix} Giriş` }
	static get girismi() { return true }
	static extYapilarDuzenle(e) {
		super.extYapilarDuzenle(e); const {liste} = e;
		liste.push(ExtFis_Portfoy, ExtFis_Ciranta, ExtFis_TakipNo, ExtFis_AltHesap, ExtFis_Plasiyer)
	}
}
class BorcCekGirisFis extends BorcCSGirisFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get cekmi() { return true }
}
class BorcSenetGirisFis extends BorcCSGirisFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get senetmi() { return true }
}
