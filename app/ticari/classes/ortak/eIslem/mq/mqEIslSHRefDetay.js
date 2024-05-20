class MQEIslSHRefDetay extends MQDetay {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'efreftanimdetay' }
	static get sayacSaha() { return null }
	static get seqSaha() { return null }
	static get tumSHSahalar() { return ['stokkod', 'hizmetkod', 'demkod'] }
	get shBelirtec() {
		switch (this.shTip.char) {
			case 'hizmet': return 'hizmet'
			case 'demirbas': return 'dem'
		}
		return 'stok'
	}
	get shKod_rowAttr() { return this.shBelirtec + 'kod' }
	get shAdi_rowAttr() { return this.shBelirtec + 'adi' }
	get bosmu() { return this.efTipi?.char == null || !(this.efAnahtar && this.shKod) }
	
	constructor(e) {
		e = e || {};
		super(e)

		/*const {efTipi, shTip} = this;
		for (const tSec of [efTipi, shTip]) {
			if (!tSec.char)
				tSec.char = tSec.class.defaultChar
		}*/
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			efTipi: new PInstTekSecim('eftipi', EIslMusRefDetayTip),
			efAnahtar: new PInstStr('efanahtar'),
			shTip: new PInstTekSecim('shtip', MQSHTip),
			shKod: new PInstStr(),
			shAdi: new PInstStr()
		})
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);

		const {secimler} = e;
		secimler.secimTopluEkle({
			efAnahtar: new SecimOzellik({ etiket: 'Anahtar Bilgi' }),
			shTip: new SecimBirKismi({ etiket: 'Tip', tekSecimSinif: MQSHTip }),
			stokKod: new SecimString({ etiket: MQStok.sinifAdi, mfSinif: MQStok }),
			hizmetKod: new SecimString({ etiket: MQHizmet.sinifAdi, mfSinif: MQHizmet }),
			demirbasKod: new SecimString({ etiket: MQDemirbas.sinifAdi, mfSinif: MQDemirbas })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const {secimler} = e;
			const wh = e.where;
			wh.ozellik(secimler.efAnahtar, `${aliasVeNokta}efanahtar`);
			wh.birKismi(secimler.shTip, `${aliasVeNokta}shtip`);
			wh.basiSonu(secimler.stokKod, `${aliasVeNokta}stokkod`);
			wh.basiSonu(secimler.hizmetKod, `${aliasVeNokta}hizmetkod`);
			wh.basiSonu(secimler.demirbasKod, `${aliasVeNokta}demirbaskod`);
		})
	}

	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e);
		
		const {liste} = e;
		liste.push('eftipitext', 'efanahtar', 'shtiptext', 'shkod', 'shadi')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);

		const {aliasVeNokta} = this;
		const shTipClause = `(case ${aliasVeNokta}shtip when 'H' then 'hizmet' when 'D' then 'demirbas' else 'stok' end)`;
		const shTipAdiClause = `(case ${aliasVeNokta}shtip when 'H' then 'Hizmet' when 'D' then 'Demirbaş' else 'Stok' end)`;
		const sh2AliasPrefix = { stok: 'stk', hizmet: 'hiz', demirbas: 'dem' };
		
		const sh2RowAttr = {};
		for (const ka of MQSHTip.instance.kaListe)
			sh2RowAttr[ka.kod] = ka.kod
		sh2RowAttr.demirbas = 'dem'
		
		const {liste} = e;
		liste.push(
			new GridKolon({
				cellClassName: 'bold',
				belirtec: 'eftipitext', text: 'e-İşl. Tip', genislikCh: 10,
				sql: EIslMusRefDetayTip.getClause(`${aliasVeNokta}eftipi`)
			}),
			new GridKolon({
				belirtec: 'efanahtar', text: 'e-İşl. Değer', genislikCh: 50
			}),
			new GridKolon({
				cellClassName: 'bold',
				belirtec: 'shtiptext', text: 'Tip', genislikCh: 10,
				sql: shTipAdiClause
			}),
			new GridKolon({
				belirtec: 'shkod', text: 'SHD Kod', genislikCh: 16,
				sql: MQSHTip.getClause({
					saha: shTipClause,
					adiGetter: ka =>
						`${aliasVeNokta}${sh2RowAttr[ka.kod]}kod`
				})
			}),
			new GridKolon({
				belirtec: 'shadi', text: 'SHD Adı', genislikCh: 40,
				sql: MQSHTip.getClause({
					saha: shTipClause,
					adiGetter: ka =>
						`${sh2AliasPrefix[ka.kod]}.aciklama`
				})
			})
		)
	}
	
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		// sent.where.addAll(`${aliasVeNokta}silindi = ''`);
		sent.fromIliski('stkmst stk', `${aliasVeNokta}stokkod = stk.kod`);
		sent.fromIliski('hizmst hiz', `${aliasVeNokta}hizmetkod = hiz.kod`);
		sent.fromIliski('demmst dem', `${aliasVeNokta}demkod = dem.kod`);
		sent.sahalar.addAll(
			'stk.aciklama stokadi',
			'hiz.aciklama hizmetadi',
			'dem.aciklama demirbasadi'
		)
	}
	hostVarsDuzenle(e) {
		const shTip = this.shTip.char;
		const shtip = (
			shTip == 'stok' ? 'S' :
			shTip == 'hizmet' ? 'H' :
			shTip == 'demirbas' ? 'D' :
			shTip
		);
		super.hostVarsDuzenle(e);
		const {hv} = e;
		hv.shtip = shtip;
		for (const key of ['stokkod', 'hizmetkod', 'demkod'])
			hv[key] = ''
		hv[this.shKod_rowAttr] = this.shKod
	}
	setValues(e) {
		super.setValues(e);
		
		const {tip2MFSinif} = MQSHTip;
		const {rec} = e;
		const _shTip = rec.shtip;
		this.shTip = (
			_shTip == 'H' ? 'hizmet' :
			_shTip == 'D' ? 'demirbas' :
			'stok'
		);
		$.extend(this, {
			shKod: rec[this.shKod_rowAttr],
			shAdi: rec[this.shAdi_rowAttr],
			efTipi: rec.eftipi || ' '
		})
	}

	uygunmu(e) {
		let {efAnahtar} = this;
		if (efAnahtar)
			efAnahtar = efAnahtar.trim();
		if (!efAnahtar)
			return true
		
		const {rec} = e;
		const {efTipi} = this;
		let value = (
			efTipi.barkodmu ? rec.barkod :
			efTipi.kodmu ? coalesce(rec.eSHKod, () => coalesce(rec.shkod, () => rec.kod)) :
			efTipi.adimi ? coalesce(rec.eSHAdi, () => coalesce(rec.shadi, () => rec.aciklama)) :
			null
		);
		if (!efTipi.adimi)
			return (value || '').trim() == efAnahtar

		efAnahtar = efAnahtar.toLocaleLowerCase();
		if (value)
			value = value.trim().toLocaleLowerCase()
		if (!value)
			return true
		
		const parts = efAnahtar.split(' ');
		let uygunmu = true;
		for (const _part of parts) {
			const part = _part.trim();
			if (!part)
				continue
			if (!value.includes(part)) {
				uygunmu = false;
				break
			}
		}
		return uygunmu
	}
}
