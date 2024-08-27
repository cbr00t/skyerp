class TicHareketci extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return null }
	static get hareketTipSecim() {
		let cacheSelector = '_hareketTipTekSecim', result = this[cacheSelector];
		if (result === undefined) { result = this[cacheSelector] = this.hareketTipSecimInternal } return result
	}
	static get hareketTipSecimInternal() { let cls = this.hareketTipSecimSinif; return cls ? new cls() : null }
	static get hareketTipSecimSinif() {
		const $this = this; return class extends TekSecim {
			kaListeDuzenle(e) { super.kaListeDuzenle(e); $this.hareketTipSecim_kaListeDuzenle(e) } }
	}
	get attrSet() { let result = this._attrSet; if ($.isArray(result)) { result = this.attrSet = asSet(result) } return result } set attrSet(value) { this._attrSet = value }
	get uygunluk() {
		let result = this._uygunluk; if (result == null) { result = this.class.hareketTipSecim }
		if (!(result.class?.birKismimi ?? result.birKismimi)) { result = this._uygunluk = new SecimBirKismi({ tekSecim: result }) }
		return result
	} set uygunluk(value) { this._uygunluk = value }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			_attrSet: e.attrListe ?? e.attrSet, whereYapi: e.whereYapi ?? {}, _uygunluk: e.uygunluk,
			gereksizTablolariSilFlag: e.gereksizTablolariSil ?? e.gereksizTablolariSilFlag ?? false
		});
		const {whereYapi} = this; for (const key of ['master', 'hareket']) { const value = e[key]; if (value !== undefined) { whereYapi[key] = value } }
	}
	static hareketTipSecim_kaListeDuzenle(e) { }
	uniOlustur(e) {
		e = e || {}; const uni = new MQUnionAll(), _e = { ...e, uni }; this.uniDuzenle(_e);
		if (this.gereksizTablolariSilFlag) { for (const sent of uni.getSentListe()) { sent.gereksizTablolariSil() } }
		return uni
	}
	uniDuzenle(e) {
		e = e || {}; $.extend(e, {
			...e, sqlEmpty: `''`,
			ekleyici: (e, ...items) => { for (const item of items) { let sql = item[0], alias = item[1]; this.sentSahaEkleyici({ ...e, sql, alias }) } }
		}); return this.uniDuzenleDevam(e)
	}
	uniDuzenleDevam(e) { }
	sentSahaEkleyici(e) {
		const {sent, sql, alias, attr2Deger} = e, {attrSet} = this;
		let saha = alias ? new MQAliasliYapi({ alias, deger: sql }) : MQAliasliYapi.newForSahaText(sql), sahaAlias = saha.alias;
		if (!attrSet || attrSet[sahaAlias]) { sent.add(saha) } attr2Deger[sahaAlias] = saha.deger; return this
	}
	withAttrs(...items) { this.attrSet = items.flat(); return this }
	setWhereDuzenleyiciler(value) { this.whereYapi = value; return this }
	setWHD_master(value) { this.whereYapi.master = value; return this } setWHD_hareket(value) { this.whereYapi.hareket = value; return this } setUygunluk(value) { this.uygunluk = value; return this }
	gereksizTablolariSil() { this.gereksizTablolariSilFlag = true; return this } gereksizTablolariSilme() { this.gereksizTablolariSilFlag = false; return this }
}
class CariHareketci extends TicHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'CARI' }
	static hareketTipSecim_kaListeDuzenle(e) {
		super.hareketTipSecim_kaListeDuzenle(e); const {kaListe} = e; kaListe.push(
			new CKodVeAdi(['kasa', 'Kasa Tahsilat/Ödeme']), new CKodVeAdi(['hizmet', 'Hizmet Gelir/Gider']), new CKodVeAdi(['havaleEFT', 'Havale/EFT']),
			new CKodVeAdi(['tahsilatOdeme', 'Cari Tahsilat/Ödeme']), new CKodVeAdi(['virman', 'Cari Virman', 'virmanmi']), new CKodVeAdi(['dekont', 'Genel Dekont']),
			new CKodVeAdi(['topluIslem', 'Toplu İşlem']), new CKodVeAdi(['devir', 'Cari Devir']), new CKodVeAdi(['cek', 'Çek']), new CKodVeAdi(['SENET', 'Senet']),
			new CKodVeAdi(['kredi', 'Banka Kredi']), new CKodVeAdi(['pos', 'POS İşlemi']), new CKodVeAdi(['fatura', 'Fatura']), new CKodVeAdi(['MASRAF', 'Faiz/Masraf'])
		)
	}
	constructor(e) { e = e || {}; super(e) }
	uniDuzenleDevam(e) {
		super.uniDuzenleDevam(e); const {uni, sqlEmpty, ekleyici} = e, {uygunluk, attrSet, whereYapi} = this;
		if (uygunluk.uygunmu('havaleEFT')) {
			let sent = new MQSent().fisHareket('hefis', 'hehar'), wh = sent.where;
			sent.fis2PlasiyerBagla(e).fis2BankaHesapBagla(e).har2AltHesapBagla(e);
			wh.fisSilindiEkle().inDizi(['SH', 'SE', 'SS', 'GL', 'TP'], 'fis.fistipi');
			let attr2Deger = {}, _e = { ...e, sent, attr2Deger }; ekleyici(_e,
				['har.kaysayac'], ['fis.ozelisaret'], ['fis.silindi'], ['12', 'oncelik'], ['fis.bizsubekod'], [`'HavEft'`, 'unionayrim'],
				[`((case when fis.fistipi = 'GL' then 'G' when fis.fistipi = 'TP' then 'T' else 'S' end) + 'BNHE')`, 'kayittipi'], [sqlEmpty, 'iceriktipi'],
				[`(case when fis.fistipi = 'GL' then 'Gelen Havale/EFT' when fis.fistipi = 'TP' then 'Toplu Havale/EFT/POS' else 'Satıcı Havale/EFT' end)`, 'anaislemadi'],
				['fis.fistipi'], [sqlEmpty, 'iade'], ['har.ticmustkod', 'must'], ['har.must', 'asilmust'], ['coalesce(har.belgetarih, fis.tarih)', 'tarih'],
				['fis.tarih', 'basliktarih'], ['fis.no', 'baslikno'], [sqlEmpty, 'odemekod'], [sqlEmpty, 'odgunkod'],
				[`(case when har.karsidvvar = '' then har.dvkur else har.karsidvkur end)`, 'dvkur'], ['fis.seri'], ['0', 'noyil'], ['fis.no', 'fisno'],
				['fis.fisnox'], ['fis.fisnox', 'disfisnox'], ['har.cariitn', 'althesapkod'], ['alth.aciklama', 'althesapadi'], ['dbo.emptycoalesce(alth.dvkod, car.dvkod)', 'dvkod'],
				[`(case when fis.fistipi in ('SH', 'SE', 'SS') then 'B' when fis.fistipi = 'TP' then dbo.tersba(har.hba) else 'A' end)`, 'ba'],
				['har.aciklama'], ['fis.aciklama', 'ekaciklama'], [sqlEmpty, 'islkod'], ['dbo.heacik(fis.fistipi, har.hisl)', 'isladi'],
				['fis.plasiyerkod'], ['pls.aciklama', 'plasiyeradi'], [sqlEmpty, 'kdetay'], ['har.takipno'], [sqlEmpty, 'satistipkod'],
				['fis.banhesapkod', 'refkod'], ['bhes.aciklama', 'refadi'], ['har.vade'], ['fis.tarih', 'karsiodemetarihi'], [`cast(null as datetime)`, 'reftarih'],
				['har.bedel'], [`(case when har.karsidvvar = '' then har.dvbedel else har.karsidvbedel end)`, 'dvbedel'],
				['fis.muhfissayac'], [sqlEmpty, 'fisektipi'], [sqlEmpty, 'dovizsanalmi'], ['fis.kaysayac', 'fissayac'], ['fis.sonzamants']
			);
			/* degerci bosGcbEkle value: sent. degerci koopDonemEkle value: sent. degerci sonIslem value: sent */
			if (whereYapi) { for (const handler of Object.values(whereYapi)) { getFuncValue.call(this, handler, { wh, attr2Deger }) } }
			uni.add(sent)
		}
	}
}
