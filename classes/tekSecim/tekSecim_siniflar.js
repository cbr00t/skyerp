class Cinsiyet extends TekSecim {
	static get defaultChar() { return 'E' }
	kaListeDuzenle(e) { super.kaListeDuzenle(e); const {kaListe} = e; kaListe.push( new CKodVeAdi(['E', 'Erkek', 'erkekmi']), new CKodVeAdi(['K', 'Kadın', 'kadinmi']) ) }
}
