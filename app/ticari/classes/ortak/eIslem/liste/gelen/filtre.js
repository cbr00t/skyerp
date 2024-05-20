class GelenEIslemFiltre extends EIslemFiltre {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	getQueryStm(e) {
		e = e || {}; const stm = new MQStm(), _e = $.extend({}, e, { stm, sent: stm.sent })
		this.queryStmDuzenle(_e); return _e.stm
	}
	queryStmDuzenle(e) {
		e = e || {}; super.queryStmDuzenle(e);
		const wh = this.getTBWhereClause(e); if (!wh) { return null }
		const {eConf} = this, {stm, sent} = e;
		sent.fromAdd('efgecicialfatfis fis');
		sent.fromIliski('carmst car', 'fis.mustkod = car.must');
		sent.cari2IlBagla();
		sent.fromIliski('efatconf efc', 'fis.efatconfkod = efc.kod');
		sent.fromIliski('althesap alth', 'fis.althesapkod = alth.kod');
		sent.where.birlestir(wh);
		if (eConf && app.params.eIslem.kullanim.ozelConf) { sent.where.degerAta(eConf.kod, 'fis.efatconfkod') }
		sent.sahalar.add(...[
			'kaysayac fissayac', 'kayitts', 'bizsubekod', 'vkno', 'mustkod', 'takipno', 'efmustunvan', 'althesapkod',
			'yerkod', 'efuuid uuid', 'tamamlandi', 'bozukmu', 'ozelentalimrefno', 'onaydurumu efatonaydurumu', 'yazdirildimi', 'tarih', 'effatnox fisnox',
			'seri', 'noyil', 'no', 'iade', 'efatconfkod', 'efatsenaryotipi', 'satirbedelbrutmu', 'efbelge efayrimtipi', 'ayrimtipi', 'dvkod', 'dvkur',
			'efbrut', 'efiskonto', 'efkdv', 'efsonuc', 'efdvbrut', 'efdviskonto', 'efdvkdv', 'efdvsonuc'
		].map(x => 'fis.' + x));
		sent.sahalar.add('car.birunvan', 'car.yore mustyore', 'il.aciklama mustiladi', 'alth.aciklama althesapadi', 'efc.aciklama efatconfadi', 'car.efatgibalias cargibalias');
	}
	secimlerOlustur_ilk(e) {
		super.secimlerOlustur_ilk(e); const {liste} = e, gecenAyBasi = today().addMonths(-5); gecenAyBasi.setDate(1);
		this.grupTopluEkle([ { kod: 'PRG', aciklama: 'Yazılımsal', renk: '#111', zeminRenk: '#eee', kapali: true } ]);
		$.extend(liste, {
			eIslemBirKismi: new SecimBirKismi({ etiket: 'e-İşlem', tekSecim: new EIslemTip({ hepsi: true }) }),
			/* akibetDurumBirKismi: new SecimBirKismi({ etiket: 'Akıbet', tekSecimSinif: EIslemOnayDurum }), */
			tarih: new SecimDate({ etiket: 'Tarih' }),
			uuid: new SecimOzellik({ etiket: 'UUID' }),
			belgeNox: new SecimOzellik({ etiket: 'Belge No' }),
			fisSayac: new SecimInteger({ etiket: 'VIO ID (fisSayac)', grupKod: 'PRG' })
		})
	}
	tbWhereClauseDuzenle(e) {
		e = e || {}; super.tbWhereClauseDuzenle(e); const wh = e.where;
		wh.birKismi(this.eIslemBirKismi, `(case when fis.efbelge = '' then 'E' else fis.efbelge end)`);
		wh.basiSonu(this.tarih, 'fis.tarih');
		wh.ozellik(this.uuid, 'fis.efuuid');
		wh.ozellik(this.belgeNox, 'fis.effatnox');
		wh.basiSonu(this.fisSayac, 'fis.kaysayac')
	}
}
