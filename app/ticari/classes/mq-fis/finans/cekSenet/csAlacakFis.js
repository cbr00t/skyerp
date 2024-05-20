class AlacakCSDevirFis extends AlacakCSIlkFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi_prefix() { return 'Devir' }
	static get devirmi() { return true }
}
class AlacakCekDevirFis extends AlacakCSDevirFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get cekmi() { return true }
}
class AlacakSenetDevirFis extends AlacakCSDevirFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get senetmi() { return true }
}

class AlacakCSGirisFis extends AlacakCSIlkFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi_prefix() { return 'Alacak' }
	static get sinifAdi_postfix() { return `${super.sinifAdi_postfix} Giriş` }
	static get girismi() { return true }
	static extYapilarDuzenle(e) {
		super.extYapilarDuzenle(e); const {liste} = e;
		liste.push(ExtFis_Portfoy, ExtFis_Ciranta, ExtFis_TakipNo, ExtFis_AltHesap, ExtFis_Plasiyer)
	}
}
class AlacakCekGirisFis extends AlacakCSGirisFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get cekmi() { return true }
}
class AlacakSenetGirisFis extends AlacakCSGirisFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get senetmi() { return true }
}


class AlacakCS_BankaTakasaVerilenFis extends AlacakCSDigerFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi_prefix() { return 'Banka Takasa Verilen' }
}
class AlacakCek_BankaTakasaVerilenFis extends AlacakCS_BankaTakasaVerilenFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get cekmi() { return true }
}
class AlacakSenet_BankaTakasaVerilenFis extends AlacakCS_BankaTakasaVerilenFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get senetmi() { return true }
}

class AlacakCS_BankaTakastanIadeFis extends AlacakCSDigerFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi_prefix() { return 'Banka Takastan İade' }
	static get iademi() { return true }
}
class AlacakCek_BankaTakastanIadeFis extends AlacakCS_BankaTakastanIadeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get cekmi() { return true }
}
class AlacakSenet_BankaTakastanIadeFis extends AlacakCS_BankaTakastanIadeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get senetmi() { return true }
}

class AlacakCS_EldenTahsilFis extends AlacakCSDigerFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi_prefix() { return 'Elden Tahsil' }
}
class AlacakCek_EldenTahsilFis extends AlacakCS_EldenTahsilFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get cekmi() { return true }
}
class AlacakSenet_EldenTahsilFis extends AlacakCS_EldenTahsilFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get senetmi() { return true }
}

class AlacakCS_EldenKarsiliksizFis extends AlacakCSDigerFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi_prefix() { return 'Elden Karşılıksız' }
}
class AlacakCek_EldenKarsiliksizFis extends AlacakCS_EldenKarsiliksizFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get cekmi() { return true }
}
class AlacakSenet_EldenKarsiliksizFis extends AlacakCS_EldenKarsiliksizFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get senetmi() { return true }
}

class AlacakCS_Sahis3VerilenFis extends AlacakCSDigerFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi_prefix() { return '3. Şahsa Verilen' }
}
class AlacakCek_Sahis3VerilenFis extends AlacakCS_Sahis3VerilenFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get cekmi() { return true }
}
class AlacakSenet_Sahis3VerilenFis extends AlacakCS_Sahis3VerilenFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get senetmi() { return true }
}

class AlacakCS_Sahis3IadeFis extends AlacakCSDigerFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi_prefix() { return '3. Şahıstan İade' }
	static get iademi() { return true }
}
class AlacakCek_Sahis3IadeFis extends AlacakCS_Sahis3IadeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get cekmi() { return true }
}
class AlacakSenet_Sahis3IadeFis extends AlacakCS_Sahis3IadeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get senetmi() { return true }
}

class AlacakCS_Sahis3KarsiliksizFis extends AlacakCSDigerFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi_prefix() { return '3. Şahıs Karşılıksız' }
}
class AlacakCek_Sahis3KarsiliksizFis extends AlacakCS_Sahis3KarsiliksizFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get cekmi() { return true }
}
class AlacakSenet_Sahis3KarsiliksizFis extends AlacakCS_Sahis3KarsiliksizFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get senetmi() { return true }
}

class AlacakCS_AlacakIadeFis extends AlacakCSDigerFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi_postfix() { return `${super.sinifAdi_postfix} İade` }
	static get iademi() { return true }
}
class AlacakCek_AlacakIadeFis extends AlacakCS_AlacakIadeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get cekmi() { return true }
}
class AlacakSenet_AlacakIadeFis extends AlacakCS_AlacakIadeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get senetmi() { return true }
}

class AlacakCS_PortfoyTransferFis extends AlacakCSDigerFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi_postfix() { return `${super.sinifAdi_postfix} Portföy Transfer` }
}
class AlacakCek_PortfoyTransferFis extends AlacakCS_PortfoyTransferFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get cekmi() { return true }
}
class AlacakSenet_PortfoyTransferFis extends AlacakCS_PortfoyTransferFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get senetmi() { return true }
}


/* const MatchStr = 'CS_';
const classes = AlacakCSDigerFis.subClasses;
const defs = [];
for (const {classKey} of classes) {
	const subDefs = [];
	for (const cs of ['Cek', 'Senet']) {
		subDefs.push(`class ${classKey.replace(MatchStr, `${cs}_`)} extends ${classKey} {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}`)
	}
	defs.push(subDefs.join(CrLf))
}
defs */
