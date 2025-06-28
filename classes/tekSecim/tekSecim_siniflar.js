class Cinsiyet extends TekSecim {
	static get defaultChar() { return 'E' }
	static get defaultChar() { return 'E' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(
			new CKodVeAdi(['E', 'Erkek', 'erkekmi']),
			new CKodVeAdi(['K', 'Kadın', 'kadinmi'])
		)
	}
}
class ColorScheme extends TekSecim {
	static get defaultChar() { return 'E' }
	static get defaultChar() { return '' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(
			new CKodVeAdi(['', 'Açık', 'lightmi']),
			new CKodVeAdi(['dark', 'Koyu', 'darkmi'])
		)
	}
}
