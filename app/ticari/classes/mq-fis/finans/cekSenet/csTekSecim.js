class CSFisTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get fisSiniflari() { return [] }
	static get defaultChar() { return null }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e, {fisSiniflari} = this.class;
		for (const cls of fisSiniflari) {
			const {sinifAdi} = cls;
			kaListe.push(new CKodVeAdi([cls, sinifAdi]))
		}
	}
}
class CSFisTipi_AlacakCek extends CSFisTipi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get fisSiniflari() {
		return [
			...super.fisSiniflari,
			AlacakCekGirisFis,
			AlacakCek_BankaTakasaVerilenFis, AlacakCek_BankaTakastanIadeFis,
			AlacakCek_EldenTahsilFis, AlacakCek_EldenKarsiliksizFis,
			AlacakCek_Sahis3VerilenFis, AlacakCek_Sahis3IadeFis, AlacakCek_Sahis3KarsiliksizFis,
			AlacakCek_AlacakIadeFis, AlacakCek_PortfoyTransferFis,
			AlacakCekDevirFis
	   ]
	}
}
class CSFisTipi_AlacakSenet extends CSFisTipi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get fisSiniflari() {
		return [
			...super.fisSiniflari,
			AlacakSenetGirisFis,
			AlacakSenet_BankaTakasaVerilenFis, AlacakSenet_BankaTakastanIadeFis,
			AlacakSenet_EldenTahsilFis, AlacakSenet_EldenKarsiliksizFis,
			AlacakSenet_Sahis3VerilenFis, AlacakSenet_Sahis3IadeFis, AlacakSenet_Sahis3KarsiliksizFis,
			AlacakSenet_AlacakIadeFis, AlacakSenet_PortfoyTransferFis,
			AlacakSenetDevirFis
	   ]
	}
}
class CSFisTipi_BorcCek extends CSFisTipi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get fisSiniflari() { return [...super.fisSiniflari, BorcCekGirisFis] }
}
class CSFisTipi_BorcSenet extends CSFisTipi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get fisSiniflari() { return [...super.fisSiniflari, BorcSenetGirisFis] }
}
