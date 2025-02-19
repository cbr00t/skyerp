class GidenEIslemListePart extends EIslemListeBasePart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'gidenEIslemListe' } static get filtreSinif() { return GidenEIslemFiltre }
	constructor(e) { e = e || {}; super(e); this.title = e.title == null ? ( 'Giden e-İşlem Listesi' ) : e.title || '' }
	runDevam(e) {
		e = e || {}; super.runDevam(e);
		const {dbName} = config.session, {kural} = app.params.eIslem, {sadeceAdi2mi} = kural?.shAdi ?? {};
		if (!sadeceAdi2mi && dbName?.toUpperCase().includes('BAKERMAN')) { setTimeout(() => hConfirm(`<b>BAKERMAN</b> veritabanı için e-İşlem Parametresi <b class="red">Stok Adı Gösterim</b> kuralı <u class="bold royalblue">2. Adı</u> olarak işaretlenmelidir`, 'UYARI'), 1000) }
	}
	islemTuslariDuzenle(e) {
		super.islemTuslariDuzenle(e); const {liste, part} = e;
		liste.unshift(
			{ id: 'eIslemGonder', handler: e => this.eIslemGonderIstendi(e) },
			{ id: 'eIslemIzle', handler: e => this.eIslemIzleIstendi(e) },
			{ id: 'eIslemSorgu', handler: e => this.eIslemSorguIstendi(e) },
			{ id: 'eIslemXMLOlustur', handler: e => this.eIslemXMLOlusturIstendi(e) },
			{ id: 'eIslemIptal', handler: e => this.eIslemIptalIstendi(e) },
			{ id: 'xmlKaldir', handler: e => this.xmlKaldirIstendi(e) }
		);
		$.extend(part.sagButonIdSet, asSet(['eIslemGonder', 'eIslemIzle', 'eIslemSorgu', 'eIslemXMLOlustur', 'eIslemIptal', 'xmlKaldir']))
	}
	get defaultTabloKolonlari() {
		const getCSSDuzenleyici = e => {
			e = e || {}; const {ekCSS, duzenleyici} = e;
			return ((sender, rowIndex, belirtec, value, rec) => {
				let result = [belirtec]; const {efayrimtipi, efatonaydurumu, efatuuid, efimzats, efgonderimts} = rec;
				if (!$.isEmptyObject(ekCSS)) { const _liste = $.isArray(ekCSS) ? ekCSS : [ekCSS]; result.push(..._liste) }
				if (efayrimtipi != null) { result.push(`eIslTip-${efayrimtipi}`) }
				if (efatonaydurumu != null) { result.push(`akibet-${efatonaydurumu}`) }
				if (efimzats) { result.push('imzali') }
				if (efgonderimts) { result.push('gonderildi') }
				if (efatuuid) { result.push('hasUUID') }
				if (duzenleyici) { const _e = $.extend({}, e, { sender, rowIndex, belirtec, value, rec, result }); getFuncValue.call(this, duzenleyici, _e); result = _e.result }
				return result.join(' ')
			})
		};
		return $.merge(super.defaultTabloKolonlari, [
			new GridKolon({ belirtec: 'eIslTipText', text: 'e-İşlem', genislikCh: 9, filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'belgeTipText', text: 'Belge<br/>Tipi', filterType: 'checkedlist', genislikCh: 12, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 9, filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }).tipDate(),
			new GridKolon({ belirtec: 'fisnox', text: 'Belge<br/>No', genislikCh: 16, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'akibetText', text: 'Akıbet', genislikCh: 12, filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'efUUIDText', text: 'UUID<br/>(ETTN)', genislikCh: 36, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'efimzats', text: 'XML Oluş.<br/>Zamanı', genislikCh: 16, filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'efgonderimts', text: 'Gönderim<br/>Zamanı', genislikCh: 16, filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'mustText', text: 'Müşteri', filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'sonucbedel', text: 'Sonuç<br/>Bedel', genislikCh: 14, cellClassName: getCSSDuzenleyici() }).tipDecimal_bedel()
		])
	}
	loadServerData_veriDuzenle(e) {
		super.loadServerData_veriDuzenle(e); const tSec_eIslTip = new EIslemTip(),  tSec_akibet = new EIslemOnayDurum(), {secimler: sec} = this, {recs} = e;
		for (const rec of recs) {
			const efAyrimTipi = rec.efayrimtipi = rec.efayrimtipi || 'A',  efOnayDurumu = rec.efatonaydurumu;
			$.extend(rec, {
				eIslTipText: tSec_eIslTip.kaDict[efAyrimTipi]?.aciklama || efAyrimTipi, belgeTipText: sec.class.getBelgeTipText({ rec }),
				akibetText: tSec_akibet.kaDict[efOnayDurumu]?.aciklama || efOnayDurumu, mustText: `(<b>${rec.mustkod}</b>) ${rec.birunvan}`,
				efUUIDText: rec.efatuuid || rec.zorunluguidstr
			})
		}
	}
	async eIslemGonderIstendi(e) {
		e = e || {}; const {eConf} = this, islemAdi = 'e-İşlem Gönder';
		const _e = await this.getSecilenSatirlar_mesajli({ islemAdi }) || {}; if (!_e.recs) return
		try { $.extend(_e, { eConf, callback: new EIslemAkibet_Callback({ islemAdi }) }); this.showProgress(_e); await EYonetici.eIslemGonder(_e) } catch (ex) { _e.error = ex; displayMessage(getErrorText(ex), islemAdi); throw ex } finally { this.uiIslemiSonrasi(_e) }
	}
	async eIslemIzleIstendi(e) {
		e = e || {}; const {eConf} = this, islemAdi = 'e-İşlem İZLE';
		const _e = await this.getSecilenSatirlar_mesajli({ islemAdi }) || {}; if (!_e.recs) return
		try { $.extend(_e, { eConf, callback: new EIslemAkibet_Callback({ islemAdi }) }); this.showProgress(_e); await EYonetici.eIslemIzle(_e) } catch (ex) { _e.error = ex; displayMessage(getErrorText(ex), islemAdi); throw ex } finally { this.uiIslemiSonrasi(_e) }
	}
	async eIslemSorguIstendi(e) {
		e = e || {}; const {eConf} = this, islemAdi = 'e-İşlem Sorgu';
		const _e = await this.getSecilenSatirlar_mesajli({ islemAdi }) || {}; if (!_e.recs) return
		try { $.extend(_e, { eConf, callback: new EIslemAkibet_Callback({ islemAdi }) }); this.showProgress(_e); await EYonetici.eIslemSorgula(_e) } catch (ex) { _e.error = ex; displayMessage(getErrorText(ex), islemAdi); throw ex } finally { this.uiIslemiSonrasi(_e) }
	}
	async eIslemXMLOlusturIstendi(e) {
		e = e || {}; const {eConf} = this, islemAdi = 'e-İşlem XML Oluştur';
		const _e = await this.getSecilenSatirlar_mesajli({ islemAdi }) || {}; if (!_e.recs) return
		try { $.extend(_e, { eConf, callback: new EIslemAkibet_Callback({ islemAdi }) }); this.showProgress(_e); await EYonetici.eIslemXMLOlustur(_e) } catch (ex) { _e.error = ex; displayMessage(getErrorText(ex), islemAdi); throw ex } finally { this.uiIslemiSonrasi(_e) }
	}
	async eIslemIptalIstendi(e) {
		e = e || {}; const {eConf} = this, islemAdi = 'e-İşlem İPTAL';
		const _e = await this.getSecilenSatirlar_mesajli({ islemAdi }) || {}; if (!_e.recs) return
		try { $.extend(_e, { eConf, callback: new EIslemAkibet_Callback({ islemAdi }) }); this.showProgress(_e); await EYonetici.eIslemIptal(_e) } catch (ex) { _e.error = ex; displayMessage(getErrorText(ex), islemAdi); throw ex } finally { this.uiIslemiSonrasi(_e) }
	}
	async xmlKaldirIstendi(e) {
		e = e || {}; const {eConf} = this, islemAdi = 'e-İşlem XML Kaldır';
		const _e = await this.getSecilenSatirlar_mesajli({ islemAdi }) || {}; if (!_e.recs) return
		try { $.extend(_e, { eConf, callback: new EIslemAkibet_Callback({ islemAdi }) }); this.showProgress(_e); await EYonetici.xmlKaldir(_e) } catch (ex) { _e.error = ex; displayMessage(getErrorText(ex), islemAdi); throw ex } finally { this.uiIslemiSonrasi(_e) }
	}
}


/*
	let part = await GidenEIslemListePart.listele(), sec = part.secimler;
	sec.tarih.basi = today();
	part.grid.on('bindingcomplete', evt => { debugger })
*/
