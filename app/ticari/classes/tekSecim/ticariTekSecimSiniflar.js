class AktifVeDevreDisi extends BuDigerVeHepsi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get aktifmi() { return this.bumu } get devreDisimi() { return this.digermi }
	init(e) {
		e = e || {}; super.init(e); const {_buDigerYapi} = this;
		_buDigerYapi[0] = '<span class="green">Aktif</span>';
		_buDigerYapi[1] = '<span class="red">Devre Dışı</span>';
	}
}
class CalismaDurumu extends BuDigerVeHepsi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get calisiyormu() { return this.bumu } get calismiyormu() { return this.digermi }
	init(e) {
		e = e || {}; super.init(e); const {_buDigerYapi} = this;
		_buDigerYapi[0] = '<span class="green">Çalışanlar</span>';
		_buDigerYapi[1] = '<span class="red">ÇalışMAyanlar</span>';
	}
}
class SatilmaDurumu extends BuDigerVeHepsi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get satilirmi() { return this.bumu }
	get satilmazmi() { return this.digermi }
	init(e) {
		e = e || {};
		super.init(e);
		const {_buDigerYapi} = this;
		_buDigerYapi[0] = '<span class="green">Satılanlar</span>';
		_buDigerYapi[1] = '<span class="red">SatılMAyanlar</span>';
	}
}
class MQOzelIsaret extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' }
	get yildizmi() { return this.char == '*' } get fiktifmi() { return this.char == 'X' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi([' ', ' ']),
			new CKodVeAdi(['*', '*']),
			new CKodVeAdi(['X', 'X'])
		)
	}
}
class NormalIade extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' } get normalmi() { return this.char == '' } get iademi() { return this.char == 'I' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', 'Normal']),
			new CKodVeAdi(['I', `<span class="red">İade</span>`])
		)
	}
}
class BorcAlacak extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'B' } get borcmu() { return this.char == 'B' } get alacakmi() { return this.char == 'A' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e; kaListe.push(
			new CKodVeAdi(['B', 'Borç']),
			new CKodVeAdi(['A', 'Alacak'])
		)
	}
}
class GelirGider extends BorcAlacak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get gelirmi() { return this.borcmu }
	get gidermi() { return this.alacakmi }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		for (const ka of kaListe) {
			switch (ka.kod) {
				case 'B': ka.aciklama = 'Gelir'; break;
				case 'A': ka.aciklama = 'Gider'; break;
			}
		}
	}
}
class TahsilatOdeme extends BorcAlacak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'A' }
	get tahsilatmi() { return this.alacakmi }
	get odememi() { return this.borcmu }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.reverse();
		for (const ka of kaListe) {
			switch (ka.kod) {
				case 'A': ka.aciklama = 'Tahsilat'; break;
				case 'B': ka.aciklama = 'Ödeme'; break;
			}
		}
	}
}
class FisHesapSekli extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' } get bedelmi() { return this.char == '' } get fiyatmi() { return this.char == 'F' } get miktarmi() { return this.char == 'M' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			{ kod: '', aciklama: 'Miktar * Fiyat = Bedel' },
			{ kod: 'F', aciklama: 'Bedel / Miktar = Fiyat' },
			{ kod: 'M', aciklama: 'Bedel / Fiyat = Miktar' }
		)
	}
	bedelYap() { this.char = ''; return this }
	fiyatYap() { this.char = 'F'; return this }
	miktarYap() { this.char = 'M'; return this }
}
class StokTip extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'TC' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['M', 'Mamül']),
			new CKodVeAdi(['H', 'Hammadde']),
			new CKodVeAdi(['Y', 'Yarı Mamul']),
			new CKodVeAdi(['A', 'Ambalaj']),
			new CKodVeAdi(['U', 'Hurda']),
			new CKodVeAdi(['SR', 'Sarj Malzemesi']),
			new CKodVeAdi(['YM', 'Yardımcı Malzeme']),
			new CKodVeAdi(['TC', 'Ticari Mal']),
			new CKodVeAdi([' ', 'Diğer'])
		)
	}
}
class VergiTip extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'KDV' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e);
		const {kaListe} = e; kaListe.push(
			new CKodVeAdi(['KDV', 'Kdv']),
			new CKodVeAdi(['KDI', 'İADE Kdv']),
			new CKodVeAdi(['KMAT0', 'Kdv Matrah (%0)']),
			new CKodVeAdi(['KTEV', 'Kdv Tevkifatı']),
			new CKodVeAdi(['OTV', 'Ötv']),
			new CKodVeAdi(['OTEC', 'Ötv Tecili']),
			new CKodVeAdi(['STO', 'Stopaj']),
			new CKodVeAdi(['KON', 'Konaklama']),
			new CKodVeAdi(['MMAK', 'Müstahsil Kesintisi']),
			new CKodVeAdi(['EKVER', 'Ek Vergi']),
			new CKodVeAdi(['GKKP', 'Geri Kazanım Katkı Payı']),
			new CKodVeAdi(['DAMGA', 'Damga Kesintisi']),
			new CKodVeAdi(['SSK', 'SGK Kesintisi']),
			new CKodVeAdi(['UCVER', 'Ücret GV Kesintisi'])
		)
	}
}
class EkVergiTipi extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi({ kod: ' ', aciklama: 'Yok' }),
			new CKodVeAdi({ kod: 'TV', aciklama: 'Tevkifatlı' }),
			new CKodVeAdi({ kod: 'IS', aciklama: 'Tam İstisna' }),
			new CKodVeAdi({ kod: 'KI', aciklama: 'Kısmi İstisna' })
		)
	}
}
class TahsilSekliTip extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'NK' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['NK', 'Nakit', 'nakitmi']),
			new CKodVeAdi(['PS', 'POS', 'posmu']),
			new CKodVeAdi(['', 'Açık Hesap', 'acikHesapmi']),
			new CKodVeAdi(['YM', 'Yemek Çeki', 'yemekCekimi']),
			new CKodVeAdi(['HZ', 'Hizmet Gideri', 'hizmetGiderimi']),
			new CKodVeAdi(['HV', 'Gelen Havale', 'gelenHavalemi'])
		)
	}
}
class TahsilSekliAltTip extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', ' ', 'acikHesapmi']),
			new CKodVeAdi(['C', 'Çek', 'cekmi']),
			new CKodVeAdi(['S', 'Senet', 'senetmi'])
		)
	}
}
class MQSHTip extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip2MFSinif() {
		let result = this._tip2MFSinif; if (result === undefined) { result = this._tip2MFSinif = { stok: MQStok, hizmet: MQHizmet, demirbas: MQDemirbas } }
		return result
	}
	static get defaultChar() { return TSStokDetay.tip }
	get stokmu() { return this.char == TSStokDetay.tip }
	get hizmetmi() { return this.char == TSHizmetDetay.tip }
	get demirbasmi() { return this.char == TSDemirbasDetay.tip }
	get aciklamami() { return this.char == TSAciklamaDetay.tip }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e, classes = [TSStokDetay, TSHizmetDetay];
		if (app.params.ticariGenel.kullanim.demirbas) { classes.push(TSDemirbasDetay) }
		for (const cls of classes) { kaListe.push(new CKodVeAdi({ kod: cls.tip, aciklama: cls.tipText })) }
	}
}
class MQSHTipVeAciklama extends MQSHTip {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get aciklamami() { return this.char == TSAciklamaDetay.tip }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e, classes = [TSAciklamaDetay];
		for (const cls of classes) { kaListe.push(new CKodVeAdi({ kod: cls.tip, aciklama: cls.tipText })) }
	}
}
class MQSHTip_Sabit extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return TSStokDetay.tip }
	get stokmu() { return this.char == TSStokDetay.tip }
	get hizmetmi() { return this.char == TSHizmetDetay.tip }
	get demirbasmi() { return this.char == TSDemirbasDetay.tip }
	get aciklamami() { return this.char == TSAciklamaDetay.tip }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e, classes = [TSStokDetay, TSHizmetDetay, TSDemirbasDetay, TSAciklamaDetay];
		for (const cls of classes) { kaListe.push(new CKodVeAdi({ kod: cls.tip, aciklama: cls.tipText })) }
	}
}
class LimitKontrol extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	get devammi() { return this.char == '' }
	get uyarVeDevammi() { return this.char == '*' }
	get devamIcinOnaymi() { return this.char == 'G' }
	get sevkDurdurmu() { return this.char == 'S' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', 'Devam']),
			new CKodVeAdi(['*', 'Uyarı ve Devam']),
			new CKodVeAdi(['G', 'Devam için Onay']),
			new CKodVeAdi(['S', 'Sevk Durdur'])
		)
	}
}
class FisAyrimTipiBasit extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get basitmi() { return true }
	static get defaultChar() { return '' }
	get normalmi() { return this.char == ' ' }
	get ihracatmi() { return this.char == 'IH' }
	get ihracKaydiylami() { return this.char == 'IK' }
	get konsinyemi() { return this.char == 'KN' }
	get emanetmi() { return this.char == 'EM' }
	get fasonmu() { return this.char == 'FS' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kullanim} = app.params.satis, {kaListe} = e;
		const ekleyici = (selector, recBlock) => {
			if (kullanim[selector]) { const ka = getFuncValue.call(this, recBlock); if (ka) { kaListe.push($.isPlainObject(ka) ? new CKodVeAdi(ka) : ka) } }
			return this
		}
		kaListe.push(new CKodVeAdi({ kod: '', aciklama: 'Normal Fatura' }));
		if (!this.class.basitmi) { ekleyici('ihracat', { kod: 'IH', aciklama: 'İhracat' }) }
		ekleyici('ihracKaydiyla', { kod: 'IK', aciklama: 'İhraç Kaydıyla' });
		ekleyici('konsinye', { kod: 'KN', aciklama: 'Konsinye' });
		ekleyici('emanet', { kod: 'EM', aciklama: 'Emanet' });
		ekleyici('fason', { kod: 'FS', aciklama: 'Fason' });
	}
	static gelenFisSinifFor(e) {
		e = e || {};
		const ayrimTipi = e.ayrimTipi?.trim();
		const {irsaliyemi, iademi} = e;
		if (!ayrimTipi) {
			return iademi
				? (irsaliyemi ? SatisIadeIrsaliyeFis : SatisIadeFaturaFis)
				: (irsaliyemi ? AlimIrsaliyeFis : AlimFaturaFis)
		}
		switch (ayrimTipi) {
			case 'IH':								// Gelen e-İşlem için İthalat olmaz
				return null
			case 'IK':
				return iademi
					? (irsaliyemi ? SatisIhracKaydiylaIadeIrsaliyeFis : SatisIhracKaydiylaIadeFaturaFis)
					: (irsaliyemi ? AlimIhracKaydiylaIrsaliyeFis : AlimIhracKaydiylaFaturaFis)
			case 'KN':
				return iademi
					? (irsaliyemi ? SatisKonsinyeIadeIrsaliyeFis : SatisKonsinyeIadeFaturaFis)
					: (irsaliyemi ? AlimKonsinyeIrsaliyeFis : AlimKonsinyeFaturaFis)
			case 'EM':
				return iademi
					? (irsaliyemi ? SatisEmanetIadeIrsaliyeFis : SatisEmanetIadeFaturaFis)
					: (irsaliyemi ? AlimEmanetIrsaliyeFis : AlimEmanetFaturaFis)
			case 'FS':
				return iademi
					? (irsaliyemi ? SatisFasonIadeIrsaliyeFis : SatisFasonIadeFaturaFis)
					: (irsaliyemi ? AlimFasonIrsaliyeFis : AlimFasonFaturaFis)
		}
		return null
	}
	gelenFisSinifFor(e) { e = e || {}; return this.class.gelenFisSinifFor($.extend({}, e, { ayrimTipi: this.char || '' })) }
}
class FisAyrimTipi extends FisAyrimTipiBasit {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get basitmi() { return false }
}
class UretimSekli extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	get serimi() { return this.char == '' }
	get onSerimi() { return this.char == 'O' }
	get numunemi() { return this.char == 'N' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi({ kod: '', aciklama: 'Seri' }),
			new CKodVeAdi({ kod: 'O', aciklama: 'Ön Seri' }),
			new CKodVeAdi({ kod: 'N', aciklama: 'Numune' })
		)
	}
}
class HesapTipi extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', 'Vadesiz Mevduat']),
			new CKodVeAdi(['KR', 'Taksitli Kredi']),
			new CKodVeAdi(['TM', 'Senet/Çek Karşılığı Kredi']),
			new CKodVeAdi(['IP', 'Kefalet/İpotek Karşılığı Kredi']),
		)
	}
}
class FiyatListeNo extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['1', '1']),
			new CKodVeAdi(['2', '2']),
			new CKodVeAdi(['3', '3']),
		)
	}
}
class KkegTipi extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', '<YOK>']),
			new CKodVeAdi(['3', '%30 KKEG']),
			new CKodVeAdi(['1', '%100 KKEG']),
		)
	}
}
class TedarikSekli extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', 'Satın Alınan']),
			new CKodVeAdi(['UR', 'Üretim']),
			new CKodVeAdi(['FS', 'Fason']),
		)
	}
}
class SubeGecerlilik extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', 'Sadece Şubesinde']),
			new CKodVeAdi(['G', 'Şube Grubunda']),
			new CKodVeAdi(['T', 'Tüm Şubelerde'])
		)
	}
}
class HizGelirTabloTipi extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', 'Alınmaz']),
			new CKodVeAdi(['TP', 'Tipine (Gelir/Gider) Göre'])
		)
	}
}
class SenaryoTipi extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultChar() { return 'T' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e; kaListe.push(
			new CKodVeAdi(['M', 'Temel Fatura', 'temel']),
			new CKodVeAdi(['T', 'Ticari Fatura', 'ticari']),
			new CKodVeAdi(['K', 'Kamu', 'kamu'])
		)
	}
}
class KdvTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', 'Kdv Dipte Uygulanır']),
			new CKodVeAdi(['D', 'Kdvli Fiyat']),
			new CKodVeAdi(['Y', 'Kdv Uygulanmaz'])
		)
	}
}
class SatisFisTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle(e) { super.kaListeDuzenle(e); const {kaListe} = e }
}
class AlimFisTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle(e) { super.kaListeDuzenle(e); const {kaListe} = e }
}
class CSBelgeTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	get ba() { return (this.char || '')[0] }
	get alacakmi() { return this.ba == 'A' }
	get borcmu() { return this.ba == 'B' }
	get alacakCekmi() { return this.char == 'AC' }
	get alacakSenetmi() { return this.char == 'AS' }
	get borcCekmi() { return this.char == 'BC' }
	get borcSenetmi() { return this.char == 'BS' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push([
			new CKodVeAdi(['AC', 'Alacak Çek' ]),
			new CKodVeAdi(['AS', 'Alacak Senet' ]),
			new CKodVeAdi(['BC', 'Borç Çek' ]),
			new CKodVeAdi(['BS', 'Borç Senet'])
		])
	}
}
class HizmetTipi extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	get gelirmi() { return this.char == '' }
	get gidermi() { return this.char == 'G' }
	get tahakkukmu() { return this.char == 'T' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e
		kaListe.push(
			new CKodVeAdi(['', 'Gelir']),
			new CKodVeAdi(['G', 'Gider']),
			new CKodVeAdi(['T', 'Tahakkuk'])
		)
	}
}
class HavaleEFTTipi extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return this.chars.havale }
	static get chars() {
		let result = this._chars;
		if (result === undefined)
			result = this._chars = this.charsInternal
		return result
	}
	static get etiketPrefixVeBosluk() { const {etiketPrefix} = this; return etiketPrefix ? etiketPrefix + ' ' : '' }
	static get charsInternal() { return { havale: 'H', eft: 'E', swift: 'S' } }
	static get etiketPrefix() { '' }
	get havalemi() { return this.char == this.chars.havale }
	get eftmi() { return this.char == this.chars.eft }
	get swiftmi() { return this.char == this.chars.swift }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e, {chars, etiketPrefixVeBosluk} = this.class;
		kaListe.push(
			new CKodVeAdi([chars.havale, `${etiketPrefixVeBosluk}Havale`]),
			new CKodVeAdi([chars.eft, `${etiketPrefixVeBosluk}EFT`]),
			new CKodVeAdi([chars.swift, `${etiketPrefixVeBosluk}Swift`])
		)
	}
}
class GelenHavaleEFTTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get charsInternal() { return { havale: 'BHAV', eft: 'BEFT', swift: 'BSWF' } }
	static get etiketPrefix() { 'Gelen' }
	get posmu() { return this.char == 'BPOS' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(new CKodVeAdi(['BPOS', 'POS']))
	}
}
class GelenGidenHavaleEFTTipi extends TekSecim {
	get ba() { return (this.char || '')[0] } get gelenmi() { return this.ba == 'B' } get gidenmi() { return this.ba == 'A' }
	get gelenHavalemi() { return this.char == 'BHAV' } get gelenEFTmi() { return this.char == 'BEFT' } get gelenSwiftmi() { return this.char == 'BSWF' } get gelenPOSmu() { return this.char == 'BPOS' }
	get gidenHavalemi() { return this.char == 'AHAV' } get gidenEFTmi() { return this.char == 'AEFT' } get gidenSwiftmi() { return this.char == 'ASWF' } get gidenPOSmu() { return this.char == 'APOS' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['BHAV', 'Gelen Havale']), new CKodVeAdi(['BEFT', 'Gelen EFT']), new CKodVeAdi(['BSWF', 'Gelen Swift']), new CKodVeAdi(['BPOS', 'Gelen POS']),
			new CKodVeAdi(['AHAV', 'Gönderilen Havale']), new CKodVeAdi(['AEFT', 'Gönderilen EFT']), new CKodVeAdi(['ASWF', 'Gönderilen Swift']), new CKodVeAdi(['APOS', 'Gönderilen POS'])
		)
	}
}
class DonemSecim extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultChar() { return '' }
	get basiSonu() { const {char} = this; return $.isArray(char) ? char.map(kod => this.getBasiSonu(kod)) : this.getBasiSonu(char) }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e; kaListe.push(
			new CKodVeAdi(['B', 'Bugün']), new CKodVeAdi(['D', 'Dün']), new CKodVeAdi(['HF', 'Bu Hafta']), new CKodVeAdi(['AY', 'Bu Ay']),
			new CKodVeAdi(['GA', 'Geçen Ay']), new CKodVeAdi(['BC', 'Bu Çeyrek Dönem']), new CKodVeAdi(['OC', 'Önceki Çeyrek Dönem']), new CKodVeAdi(['YL', 'Bu Yıl'])
		)
	}
	bugun() { this.char = 'B'; return this } dun() { this.char = 'D'; return this } buHafta() { this.char = 'HF'; return this }
	buAy() { this.char = 'AY'; return this } gecenAy() { this.char = 'GA'; return this }
	buCeyrekDonem() { this.char = 'BC'; return this } oncekiCeyrekDonem() { this.char = 'OC'; return this } buYil() { this.char = 'YL'; return this }
	getBasiSonu(kod) {
		const _today = today(), {ay, yil} = _today; let basi; switch (kod) {
			case 'B': return new CBasiSonu({ basi: _today.clone(), sonu: _today.clone() })
			case 'D': return new CBasiSonu({ basi: _today.clone().dun(), sonu: _today.clone().dun() })
			case 'HF': return new CBasiSonu({ basi: _today.clone().haftaBasi(), sonu: _today.clone().haftaSonu() })
			case 'AY': return new CBasiSonu({ basi: _today.clone().ayBasi(), sonu: _today.clone().aySonu() })
			case 'GA': return new CBasiSonu({ basi: _today.clone().ayBasi().addMonths(-1), sonu: _today.clone().ayBasi().addDays(-1) })
			case 'BC':
				const ceyrekNo = ((ay - 1) % 3) + 1; basi = new Date(yil, ((ceyrekNo - 1) * 3) + 1, 1);
				return new CBasiSonu({ basi, sonu: basi.clone().addMonths(2).aySonu() })
			case 'OC':
				const oncekiCeyrekNo = (ay - 1) % 3; basi = oncekiCeyrekNo ? new Date(yil, ((oncekiCeyrekNo - 1) * 3) + 1, 1) : new Date(yil - 1, 9, 1);
				return new CBasiSonu({ basi, sonu: basi.clone().addMonths(2).aySonu() })
			case 'BY': return new CBasiSonu({ basi: _today.clone().yilBasi(), sonu: _today.clone().yilSonu() })
		}
		return null
	}
}
class DonemVeTarihAralikSecim extends DonemSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultChar() { return '' } get tarihAralikmi() { return this.char == 'TR' }
	kaListeDuzenle(e) { const {kaListe} = e; kaListe.push(new CKodVeAdi(['TR', `<span class="bold forestgreen">Tarih Aralık</span>`])); super.kaListeDuzenle(e) }
	tarihAralik() { this.char = 'TR'; return this }
}
class DonemTarihAralikVeHepsiSecim extends DonemVeTarihAralikSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultChar() { return '' } get tarihAralikmi() { return this.char == 'TR' }
	kaListeDuzenle(e) { const {kaListe} = e; kaListe.push(new CKodVeAdi(['', `<span class="bold royalblue">- Hepsi -</span>`])); super.kaListeDuzenle(e) }
	tarihAralik() { this.char = 'TR'; return this }
}
class ResimBelirlemeKurali extends TekSecim {
	static get defaultChar() { return 'ST' } get stokTanimdami() { return this.char == '' } get stokKodu() { return this.char == 'ST' }
	get grupVeStokmu() { return this.char == 'GS' } get pdmmi() { return this.char == 'PD' } get grupVePDMmi() { return this.char == 'GP' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', 'Stok Tanımda Belirtilir']), new CKodVeAdi(['ST', 'Stok Kodu ile aynı (StokKodu)']), new CKodVeAdi(['GS', 'Grup altında Stok (GrupKod\Stok)']),
			new CKodVeAdi(['PD', 'Pdm Kodu ile aynı (PdmKodu)']), new CKodVeAdi(['GP', 'Grup altında Pdm (GrupKod\PdmKodu)'])
		)
	}
}
class TicBorclanmaSekli extends TekSecim {
	static get defaultChar() { return 'F' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); e.kaListe.push(
			new CKodVeAdi(['S', 'Sipariş', 'siparismi']), new CKodVeAdi(['I', 'İrsaliye', 'irsaliyemi']),
			new CKodVeAdi(['X', 'Fatura ve Bekleyen İrsaliye', 'faturaVeBekleyenIrsaliyemi']), new CKodVeAdi(['F', 'Fatura', 'faturami'])
		)
	}
}
