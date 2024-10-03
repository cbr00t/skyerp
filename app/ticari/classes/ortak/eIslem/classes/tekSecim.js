class EIslemTip extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' }
	get eFaturami() { return this.char == EIslFatura.tip } get eArsivmi() { return this.char == EIslArsiv.tip }
	get eIrsaliyemi() { return this.char == EIslIrsaliye.tip } get eMustahsilmi() { return this.char == EIslMustahsil.tip }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e, hepsimi = asBool(e.hepsimi ?? e.hepsi), {tip2Sinif} = EIslemOrtak;
		for (const tip in tip2Sinif) {
			const cls = tip2Sinif[tip];
			if (cls && (hepsimi || cls.kullanilirmi !== false)) { kaListe.push(new CKodVeAdi({ kod: tip, aciklama: cls.sinifAdi, question: cls.question })) }
		}
	}
}
class EIslFaturaAyrim extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' } get magazami() { return this.char == 'PR' } faturami() { return !this.char?.trim() }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e; kaListe.push(
			new CKodVeAdi({ kod: 'PR', aciklama: 'Mağaza Fişleri' }),
			new CKodVeAdi({ kod: '', aciklama: 'Faturalar' })
		)
	}
}
class EIslemOnayDurum extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' }
	get aliciyaUlastimi() { return this.char == '@' } onaymi() { return this.char == 'O' } get kabulmu() { return this.onaymi } get redmi() { return this.char == 'R' }
	get iptalmi() { return this.char == 'C' } get hatami() { return this.char == 'X' } get beklemedemi() { return this.char == 'B' } get belirsizmi() { return this.char == ' ' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi({ kod: '@', aciklama: 'Alıcıya Ulaştı' }),
			new CKodVeAdi({ kod: 'O', aciklama: 'Kabul' }),
			new CKodVeAdi({ kod: 'R', aciklama: 'RED' }),
			new CKodVeAdi({ kod: 'C', aciklama: 'İPTAL' }),
			new CKodVeAdi({ kod: 'X', aciklama: '-HATA-' }),
			new CKodVeAdi({ kod: 'B', aciklama: '-Beklemede-' }),
			new CKodVeAdi({ kod: ' ', aciklama: '-Belirsiz-' })
		)
	}
}
class EOzelEntegrator extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' }
	get yokmu() { return this.char == ' ' }
	get innovami() { return this.char == 'innova' }
	get edmmi() { return this.char == 'edm' }
	get nes4mu() { return this.char == 'nesV4' }
	get nesmi() { return this.char == 'nes' }
	get eFinansmi() { return this.char == 'efinans' }
	get turkkepmi() { return this.char == 'turkkep' }
	get uyumsoftmu() { return this.char == 'uyumsoft' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi({ kod: ' ', aciklama: ' ' }),
			new CKodVeAdi({ kod: 'innova', aciklama: 'Innova' }),
			new CKodVeAdi({ kod: 'nesV4', aciklama: 'NESv4' }),
			new CKodVeAdi({ kod: 'nes', aciklama: 'NES' }),
			new CKodVeAdi({ kod: 'edm', aciklama: 'EDM' }),
			new CKodVeAdi({ kod: 'efinans', aciklama: 'e-Finans' }),
			new CKodVeAdi({ kod: 'turkkep', aciklama: 'Turkkep' }),
			new CKodVeAdi({ kod: 'uyumsoft', aciklama: 'Uyumsoft' })
		)
	}
}
class EIslemSenaryo extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'M' }
	get temelmi() { return this.char == 'M' }
	get ticarimi() { return this.char == 'T' }
	get kamumu() { return this.char == 'K' }
	static getSenaryoText(char) {
		switch (char) {
			case 'T': return 'TICARIFATURA'
			case 'K': return 'KAMU'
		}
		return 'TEMELFATURA'
	}
	get senaryoText() { return this.class.getSenaryoText(this.char) }
	
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi({ kod: 'M', aciklama: 'Temel Fatura' }),
			new CKodVeAdi({ kod: 'T', aciklama: 'Ticari Fatura' }),
			new CKodVeAdi({ kod: 'K', aciklama: 'Kamu' })
		)
	}
}
