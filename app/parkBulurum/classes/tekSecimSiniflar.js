class CihazDurum extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' } get bostami() { return '' } get rezervemi() { return this.char == 'R' } get kullaniliyormu() { return this.char == 'KUL' }
	kaListeDuzenle(e) {
		/* cihaz durum: '':bosta, REZ:trzerve, KUL:kullaniliyor */
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', 'Boşta']),
			new CKodVeAdi(['REZ', `<span style="color: #333; background: var(--bg-REZ); box-shadow: var(--bs-REZ); padding: 5px !important">Rezerve</span>`]),
			new CKodVeAdi(['KUL', `<span style="color: #eee !important; background: var(--bg-KUL); box-shadow: var(--bs-KUL); padding: 5px !important">Kullanılıyor</span>`])
		)
	}
}
class OtoParkKullanim extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' } get sureklimi() { return '' } get saatAraliklimi() { return this.char == 'SA' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', 'Sürekli']),
			new CKodVeAdi(['SA', 'Saat Aralıklı'])
		)
	}
}
class RezervasyonDurum extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' } get aktifmi() { return 'Aktif' } get iptalmi() { return this.char == 'IP' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', '<span class="green">Aktif</span>']),
			new CKodVeAdi(['IP', `<span class="red">İPTAL</span>`])
		)
	}
}
class KurumTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' } get sahismi() { return '' } get okulmu() { return this.char == 'OKL' } get hastanemi() { return this.char == 'HAS' }
	 get sitemi() { return this.char == 'SIT' } get eczanemi() { return this.char == 'ECZ' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', 'Kurum']),
			new CKodVeAdi(['OKL', 'Okul']),
			new CKodVeAdi(['HAS', 'Hastane']),
			new CKodVeAdi(['SIT', 'Site']),
			new CKodVeAdi(['ECZ', 'Eczane'])
		)
	}
}
class AlanTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'YOL' } get yolKenarimi() { return 'YOL' } get acikOtoparkmi() { return this.char == 'ACK' } get kapaliOtoparkmi() { return this.char == 'KAP' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['YOL', 'Yol Kenarı']),
			new CKodVeAdi(['ACK', 'Açık Otopark']),
			new CKodVeAdi(['KAP', 'Kapalı Otopark'])
		)
	}
}
