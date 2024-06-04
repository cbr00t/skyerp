class CSOrtakFis extends FinansFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return [this.sinifAdi_prefix, this.sinifAdi_postfix, 'Fiş'].filter(x => !!x).join(' ') }
	static get listeSinifAdi() { return [this.belgeSinif.sinifAdi, 'Fiş'].filter(x => !!x).join(' ') }
	static get sinifAdi_prefix() { return '' }
	static get sinifAdi_postfix() { return this.belgeSinif?.sinifAdi_postfix }
	static get table() { return 'csfis' }
	static get detaySinif() { return CSOrtakDetay }
	static get gridKontrolcuSinif() { return CSOrtakGridci }
	static get numTipKod() { return this.belgeSinif?.numTipKod ?? super.numTipKod }
	static get belgeSinif() {
		if (this.alacakmi)
			return this.cekmi ? ExtFis_AlacakCek : this.senetmi ? ExtFis_AlacakSenet : null
		if (this.borcmu)
			return this.cekmi ? ExtFis_BorcCek : this.senetmi ? ExtFis_BorcSenet : null
		return null
	}
	static get belgeTekSecimSinif() { return this.belgeSinif?.tekSecimSinif }
	static get belgeTipi() { return this.belgeSinif.tipKod }
	static get fisTipi() { return null }
	static get cekSenetmi() { return true }
	static get iademi() { return false }
	static get iade() { return this.iademi ? 'I' : '' }
	static extYapilarDuzenle(e) {
		super.extYapilarDuzenle(e); const {liste} = e;
		liste.push(Ext_DvKur)
	}
	static async yeniInstOlustur(e) {
		const {islem, rec} = e; let fisSinif;
		if (islem == 'yeni' || islem == 'kopya') {
			const tSec = this.belgeTekSecimSinif?.instance; if (!tSec) { return null }
			let promise = new $.Deferred();
			new MasterListePart({
				title: 'Belge Tipi', tabloKolonlari: MQKA.orjBaslikListesi.filter(colDef => colDef.belirtec == 'aciklama'),
				source: _e => this.belgeTekSecimSinif.kaListe, secince: _e => promise.resolve(_e.value || null), kapaninca: _e => promise.resolve(null)
			}).run();
			fisSinif = await promise
		}
		else {
			const {rec} = e, belgeTipi = rec.belgetipi, fisTipi = rec.fistipi, {iade} = rec;
			for (const cls of this.subClasses) { if (cls.belgeTipi == belgeTipi && cls.fisTipi == fisTipi && cls.iade == iade) { fisSinif = cls; break } }
		}
		return fisSinif ? new fisSinif(e) : null
	}
	static varsayilanKeyHostVarsDuzenle(e) {
		super.varsayilanKeyHostVarsDuzenle(e);
		const {hv} = e, {belgeTipi} = this;
		if (belgeTipi != null)
			hv.belgetipi = belgeTipi
	}
	alternateKeyHostVarsDuzenle(e) {
		super.alternateKeyHostVarsDuzenle(e);
		const {hv} = e, {fisTipi} = this.class;
		if (fisTipi != null)
			hv.fistipi = fisTipi
	}
}
class CSOrtakDetay extends FinansDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static extYapilarDuzenle(e) {
		super.extYapilarDuzenle(e); const {liste} = e;
		liste.push(Ext_DetAciklama)
	}
}
class CSOrtakGridci extends FinansGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_son(e) {
		super.tabloKolonlariDuzenle_son(e); const {tabloKolonlari} = e;
		tabloKolonlari.push(new GridKolon({ belirtec: 'detAciklama', text: 'Açıklama', genislikCh: 50 }))
	}
}

class CSIlkFis extends CSOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return CSIlkDetay }
	static get gridKontrolcuSinif() { return CSIlkGridci }
	static get ilkmi() { return true }
}
class CSIlkDetay extends CSOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'csilkhar' }
}
class CSIlkGridci extends CSOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class CSDigerFis extends CSOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return CSDigerDetay }
	static get gridKontrolcuSinif() { return CSDigerGridci }
	static get digermi() { return true }
}
class CSDigerDetay extends CSOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'csdigerhar' }
}
class CSDigerGridci extends CSOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class AlacakCSIlkFis extends CSIlkFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return AlacakCSIlkDetay }
	static get gridKontrolcuSinif() { return AlacakCSIlkGridci }
	static get alacakmi() { return true }
}
class AlacakCSIlkDetay extends CSIlkDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class AlacakCSIlkGridci extends CSIlkGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class AlacakCSDigerFis extends CSDigerFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return AlacakCSDigerDetay }
	static get gridKontrolcuSinif() { return AlacakCSDigerGridci }
	static get alacakmi() { return true }
}
class AlacakCSDigerDetay extends CSDigerDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class AlacakCSDigerGridci extends CSDigerGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class BorcCSIlkFis extends CSIlkFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return BorcCSIlkDetay }
	static get gridKontrolcuSinif() { return BorcCSIlkGridci }
	static get borcmu() { return true }
}
class BorcCSIlkDetay extends CSIlkDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class BorcCSIlkGridci extends CSIlkGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class BorcCSDigerFis extends CSDigerFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return BorcCSDigerDetay }
	static get gridKontrolcuSinif() { return BorcCSDigerGridci }
	static get borcmu() { return true }
}
class BorcCSDigerDetay extends CSDigerDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class BorcCSDigerGridci extends CSDigerGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
