class KontorTip extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return null }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(
			new CKodVeAdi([' ', MQKontor.tipAdi, 'hepsimi']),
			...entries(MQKontor.key2SubClasses)
				.filter(([, c]) => c.uygunmu)
				.map(([, c]) => {
					let { tip: t, tipAdi: a } = c
					let tlw = t?.toLowerCase() ?? null
					return new CKodAdiVeEkBilgi([t || '', a, `${tlw}mi`, c])
				})
		)
	}
}
class KontorAHTip extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'A' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(...[
			new CKodVeAdi(['A', '<span class=green>Satılan</span>', 'alinanmi']),
			new CKodVeAdi(['H', '<span class=orangered>Harcanan</span>', 'harcananmi'])
		])
	}
}
class KontorFatDurum extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(...[
			new CKodVeAdi([' ', '<span class=lightgray>Açıktan</span>', 'aciktanmi']),
			new CKodVeAdi(['M', '<span class=lightgray>Açıktan (<i class=bold><span class=royalblue>MD</span></i>)</span>', 'aciktanMDmi']),
			new CKodVeAdi(['A', '<span class=lightgray>Açıktan (<i class=bold><span class=firebrick>Ana Bayi</span></i>)</span>', 'aciktanAnaBayimi']),
			new CKodVeAdi(['B', '<span class=orangered>Fatura Edilecek</span>', 'faturaEdilecekmi'])
			/*new CKodVeAdi(['X', '<span class=green>Fatura Edildi</span>', 'faturaEdildimi'])*/
		])
	}
}
class VIOSurum extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return app.defaultSurum }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(...[
			new CKodVeAdi(['416', '<span class=green>4.16</span>']),
			new CKodVeAdi(['415', '<span class=forestgreen>4.15</span>']),
			new CKodVeAdi(['414', '<span class=darkcyan>4.14</span>']),
			new CKodVeAdi(['413', '<span class=orange>4.13</span>']),
			new CKodVeAdi(['412', '<span class=orangered>4.12</span>']),
			new CKodVeAdi(['411', '<span class=firebrick>4.11</span>']),
			new CKodVeAdi(['410', '<span class=red>4.10</span>']),
			new CKodVeAdi(['49', '<span class=darkred>4.09</span>']),
			new CKodVeAdi(['48', '<span class=lightgray>4.08</span>']),
			new CKodVeAdi(['47', '<span class=lightgray>4.07</span>']),
			new CKodVeAdi(['46', '<span class=lightgray>4.06</span>'])
		])
	}
}
class AktHesapSekli extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(...[
			new CKodVeAdi([' ', '', 'normalmi'])
			/* ... ?? daha belli değil */
		])
	}
}

class EDefKontor_AyrimTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(...[
			new CKodVeAdi([' ', '', 'yokmu']),
			new CKodVeAdi(['O1M', 'Oluşturma: 100MB', 'olusturma100MBmi']),
			new CKodVeAdi(['O1G', 'Oluşturma: 1GB', 'olusturma1GBmi']),
			new CKodVeAdi(['S1M', 'Saklama: 100MB', 'saklama100MBmi']),
			new CKodVeAdi(['S1G', 'Saklama: 1GB', 'saklama1GBmi'])
		])
	}
}
