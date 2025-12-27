class BrUcretTipi extends TekSecim {
	static get defaultChar() { return 'A' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(
			new CKodVeAdi(['A', 'Aylık', 'aylikmi']),
			new CKodVeAdi(['S', 'Saatlik', 'saatlikmi']),
			new CKodVeAdi(['Y', 'Yevmiyeli', 'yevmiyelimi'])
		)
	}
}
