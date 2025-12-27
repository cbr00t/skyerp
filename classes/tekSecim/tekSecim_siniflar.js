class Cinsiyet extends TekSecim {
	static get defaultChar() { return 'E' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(
			new CKodVeAdi(['E', 'Erkek', 'erkekmi']),
			new CKodVeAdi(['K', 'Kadın', 'kadinmi'])
		)
	}
}
class MedeniDurum extends TekSecim {
	static get defaultChar() { return 'B' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(
			new CKodVeAdi(['B', 'Bekar', 'bekarmi']),
			new CKodVeAdi(['K', 'Evli', 'evlimi']),
			new CKodVeAdi(['D', 'Dul', 'dulmu'])
		)
	}
}
class NetBrut extends TekSecim {
	static get defaultChar() { return 'N' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(
			new CKodVeAdi(['N', 'Net', 'netmi']),
			new CKodVeAdi(['B', 'Brüt', 'brutmu'])
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
