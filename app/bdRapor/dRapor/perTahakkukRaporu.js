class DRapor_PerTahakkukRaporuOrtak extends DRapor_BDRaporBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return this == DRapor_PerTahakkukRaporuOrtak }
	static get vioAdim() { return null }
}
class DRapor_PerTahakkukRaporuOrtak_Main extends DRapor_BDRaporBase_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_PerTahakkukRaporuOrtak }
	static get raporDosyaTanimlar() {
		return [
			...super.raporDosyaTanimlar,
			{ belirtec: 'VioPer.RaporEkSaha', section: 'TahRaporTah' },
			{ belirtec: 'VioPer.RaporEkSaha', section: 'TahRapor-TahDiger' },
			{ belirtec: 'VioPer.RaporEkSaha', section: 'TahRapor-IsvPrimMuaf' },
			{ belirtec: 'VioPer.RaporEkSaha', section: 'TahRapor-OzelBilgi' },
			{ belirtec: 'VioPer.RaporEkSaha', section: 'TahRapor-FMBilgi' },
			{ belirtec: 'VioPer.RaporEkSaha', section: 'TahRapor-FMGYuzMal' },
			{ belirtec: 'VioPer.RaporEkSaha', section: 'TahRapor-Eksik' },
			{ belirtec: 'VioPer.RaporEkSaha', section: 'TahRapor-SGKInd' },
			{ belirtec: 'VioPer.RaporEkSaha', section: 'TahRapor-VergiInd' }
		]
	}
	raporDosyaTanimlarDuzenle({ liste }) {
		super.raporDosyaTanimlarDuzenle(...arguments)
		{
			let satirDuzenle = ({ line, kv }) => {
				let {SQL: sql} = kv, r = 'ekb.'
				for (let s of ['avn', 'kih', 'fmes' ]) {
					s += '.'
					sql = sql.replaceAll(s, r)
				}
				kv.SQL = sql
			}
			for (let _ of liste)
				$.extend(_, { satirDuzenle })
		}
	}
	async ilkIslemler(e) {
		await super.ilkIslemler(e)
		this.eksikNedenKod2Adi = values(await app.wsSabitTanimlar_secIni({ belirtec: 'Yasal', section: 'SgkEksikNeden' }))?.[0]
		{
			let sent = new MQSent(), {where: wh, sahalar} = sent
			sent.fromAdd('odemesaha ode')
			wh.add(`ode.anatip = ''`, 'ode.senaryono IS NULL')
			sahalar.add('ode.kod', 'ode.aciklama')
			let recs = await app.sqlExecSelect(sent) ?? []
			this.odemeSahaKAListe = recs.map(rec => new CKodVeAdi(rec))
		}
	}
	secimlerDuzenle({ secimler: sec }) {
		let _today = today()
		sec.grupEkle('donemVeTarih', 'Dönem', false)
		sec.secimTopluEkle({
			yil: new SecimInteger({ etiket: 'Yıl', basiSonu: _today.yil }),
			ay: new SecimInteger({ etiket: 'Ay' })
		})
		super.secimlerDuzenle(...arguments)
		sec.whereBlockEkle(({ secimler, where: wh }) => {
			let {ay: sec_ay} = secimler, {yil: { basi: ylb, sonu: yls } = {}} = secimler
			let {basi: ayb, sonu: ays} = sec_ay
			if (ylb)
				wh.add(`pay.yilay >= (${ylb} * 100 + ${ayb || 0})`)
			if (yls)
				wh.add(`pay.yilay <= (${yls} * 100 + ${ays || 99})`)
			wh.basiSonu(sec_ay, 'dbo.ya2ay(pay.yilay)')
		})
	}
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments)
		let {tahakkuk: { gecerliEksikNedenleri } = {}} = app.params
		let {eksikNedenKod2Adi, odemeSahaKAListe} = this
		result
			// .addKAPrefix('x', 'y')
			.addGrupBasit_numerik('YIL', 'Yıl', 'yil')
			.addGrupBasit_numerik('AY', 'Ay', 'ay')
		for (let k of gecerliEksikNedenleri ?? []) {
			let v = eksikNedenKod2Adi[k]
			if (v != null)
				result.addToplamBasit(`eksikGun${k}`, v, `eksikGun${k}`)
		}
		let addOdemeSaha = (kod, aciklama, keyPostfix, etiketPrefix) => {
			let key = [`saha${kod}`, keyPostfix].filter(_ =>_).join('_')
			let etiket = [etiketPrefix, aciklama].filter(_ =>_).join(': ')
			result.addToplamBasit(key, etiket, key)
		}
		for (let {kod, aciklama} of odemeSahaKAListe) {
			addOdemeSaha(kod, aciklama, 'Veri', 'Veri')
			addOdemeSaha(kod, aciklama, 'Brut', 'Brüt')
			addOdemeSaha(kod, aciklama, 'Net', 'Net')
		}
	}
	loadServerData_queryDuzenle({ attrSet, stm, stm: { with: _with } }) {
		let e = arguments[0]
		super.loadServerData_queryDuzenle(e)
		let avanssizVarmi   = ['normalOdeme', 'brutOdenen', 'ozelKesinti'].some(k => attrSet[k])
		let kidemIhbarVarmi = ['kidemYuku', 'ihbarYuku', 'kidemIhbarYuku'].some(k => attrSet[k])
		let fazlaMesaiVarmi = (
			['fazlaMesai_TumVeri'].some(k => attrSet[k]) ||
			keys(attrSet).some(k => k.startsWith('fazlaMesai') && k.length > 10)
		)
		let odemeSahaBelirtecleri = {}, baglantiEksikNedenleri = {}
		for (let k in attrSet) {
			if (k.startsWith('saha')) {
				let odemeKod = k.slice(4).split('_')[0]
				odemeSahaBelirtecleri[odemeKod] = true
			}
			avanssizVarmi ||= k.startsWith('avans')
			if (k.length > 8 && k.startsWith('eksikGun')) {
				let nedenKod = k.slice(8)
				if (nedenKod)
					baglantiEksikNedenleri[nedenKod] = true
			}
		}
		{
			let sent = new MQSent().distinctYap()
			let {where: wh, sahalar} = sent
			sent.fromAdd('pertahodeme pode')
				.brTahOdemeSonraBagla()
				.brPerHepsiBagla()
				.brTahIsyeriBagla()
			this.loadServerData_queryDuzenle_ortakWhereClause({ ...e, sent })
			sahalar.add('pode.kaysayac tahodesayac')
			sent.gereksizTablolariSil({ disinda: ['pode', 'pay']} )
			_with.add(sent.asTmpTable('sayaclar'))
		}
		if (avanssizVarmi || kidemIhbarVarmi || fazlaMesaiVarmi) {
			let sent = new MQSent().distinctYap()
			let {where: wh, sahalar} = sent
			sent.fromAdd('sayaclar say')
				.fromIliski('pertahdetay tdet', 'say.tahodesayac = tdet.tahodemesayac')
				.fromIliski('odemesaha ode', 'tdet.odemesahasayac = ode.kaysayac')
			wh.add(new MQOrClause([
				`ode.odemetipi = 'AV'`, `ode.hesap = 'AV'`,
				`ode.odemetipi = 'KI'`, `ode.hesap = 'IH'`,
				`ode.kod LIKE 'B%'`
			]))
			sahalar.add(...[
				'say.tahodesayac',
				...(avanssizVarmi ? [
					`SUM(case when ode.odemetipi = 'AV' then tdet.brut else 0 end) avansbrutodenen`,
					`SUM(case when ode.hesap = 'AV' then tdet.brut else 0 end) avansbrutkesilen`
				] : []),
				...(kidemIhbarVarmi ? [
					`SUM(case when ode.odemetipi = 'KI' then tdet.brut else 0 end) kidemyuku`,
					`SUM(case when ode.hesap = 'IH' then tdet.brut else 0 end) ihbaryuku`
				] : []),
				...(fazlaMesaiVarmi ? [
					`SUM(case when ode.kod like 'B%' then tdet.veri else 0 end) tumfmveri`,
					`SUM(case when ode.kod like 'B%' and ode.carpan = 1 then tdet.veri else 0 end) fmnormal`,
					`SUM(case when ode.kod like 'B%' and ode.carpan = 1.5 then tdet.veri else 0 end) fm50`,
					`SUM(case when ode.kod like 'B%' and ode.carpan = 2 then tdet.veri else 0 end) fm100`,
					`SUM(case when ode.kod like 'B%' and ode.carpan = 2.5 then tdet.veri else 0 end) fm150`,
					`SUM(case when ode.kod like 'B%' then tdet.brut else 0 end) tumfmbrut`,
					`SUM(case when ode.kod like 'B%' and ode.carpan = 1 then tdet.brut else 0 end) fmnormalbrut`,
					`SUM(case when ode.kod like 'B%' and ode.carpan = 1.5 then tdet.brut else 0 end) fm50brut`,
					`SUM(case when ode.kod like 'B%' and ode.carpan = 2 then tdet.brut else 0 end) fm100brut`,
					`SUM(case when ode.kod like 'B%' and ode.carpan = 2.5 then tdet.brut else 0 end) fm150brut`,
					`SUM(case when ode.kod like 'B%' then tdet.net else 0 end) tumfmnet`,
					`SUM(case when ode.kod like 'B%' and ode.carpan = 1 then tdet.net else 0 end) fmnormalnet`,
					`SUM(case when ode.kod like 'B%' and ode.carpan = 1.5 then tdet.net else 0 end) fm50net`,
					`SUM(case when ode.kod like 'B%' and ode.carpan = 2 then tdet.net else 0 end) fm100net`,
					`SUM(case when ode.kod like 'B%' and ode.carpan = 2.5 then tdet.net else 0 end) fm150net`
				] : [])
			])
			sent.groupByOlustur()
			_with.add(sent.asTmpTable('ekbilgi'))
		}
		if (!empty(odemeSahaBelirtecleri)) {
			let sent = new MQSent().distinctYap()
			let {where: wh, sahalar} = sent
			sent.fromAdd('sayaclar say')
				.fromIliski('pertahdetay tdet', 'say.tahodesayac = tdet.tahodemesayac')
				.fromIliski('odemesaha ode', 'tdet.odemesahasayac = ode.kaysayac')
			wh.inDizi(keys(odemeSahaBelirtecleri), 'ode.kod')
			sahalar.add(
				'say.tahodesayac', 'ode.kod odemekod',
				'SUM(tdet.veri) veri', 'SUM(tdet.veri2) veri2', 'SUM(tdet.brut) brut', 'SUM(tdet.net) net'
			)
			sent.groupByOlustur()
			_with.add(sent.asTmpTable('odemeler'))
		}

		let {odemeSahaKAListe} = this
		for (let sent of stm) {
			let {from, where: wh, sahalar} = sent
			let addOdemeSaha = (k, aliasPostfix, saha) => {
				saha ??= aliasPostfix.toLowerCase()
				let tblSay = from.aliasIcinTable('say')
				let odetTableAlias = `odet${k}`
				if (!tblSay.aliasVarmi(odetTableAlias))
					sent.leftJoin('say', `odemeler odet${k}`, [`say.tahodesayac = odet${k}.tahodesayac`, `odet${k}.odemekod = '${k}'`])
				sahalar.add(`${odetTableAlias}.${saha} saha${k}_${aliasPostfix}`)
			}
			sent.fromAdd('sayaclar say')
			if (avanssizVarmi || kidemIhbarVarmi || fazlaMesaiVarmi)
				sent.leftJoin('say', 'ekbilgi ekb', 'say.tahodesayac = ekb.tahodesayac')
			/*for (let k in odemeSahaBelirtecleri)
				sent.leftJoin('say', `odemeler odet${k}`, [`say.tahodesayac = odet${k}.tahodesayac`, `odet${k}.odemekod = '${k}'`])*/
			sent.innerJoin('say', 'pertahodeme pode', 'say.tahodesayac = pode.kaysayac')
			sent.innerJoin('pode', 'tahakkuk tdon', ['pode.tahsayac = tdon.kaysayac', 'tdon.senaryono IS NULL'])
			for (let k in baglantiEksikNedenleri)    // 99: son
				sent.leftJoin('tdon', `pertaheksik eks${k}`, [`pode.peraysayac = eks${k}.tahaysayac`, `eks${k}.nedenkod = '${k}'`, `tdon.odemeno = 99`])
			sent.innerJoin('pode', 'pertahay pay', ['pode.peraysayac = pay.kaysayac', 'pay.senaryono IS NULL'])
			sent.brX2PerSayacBagla({ kodClause: 'pay.persayac' })
				.brPerHepsiBagla()
				.brTahIsyeriBagla()
			this.loadServerData_queryDuzenle_ortakWhereClause({ ...e, sent })
			for (let k in attrSet) {
				switch (k) {
					case 'YIL':
						sahalar.add(`dbo.ya2yil(pay.yilay) yil`)
						break
					case 'AY':
						sahalar.add(`dbo.ya2ay(pay.yilay) ay`)
						break
					default:
						if (k.length > 8 && k.startsWith('eksikGun')) {
							let nd = k.slice(8)
							sahalar.add(`eks${nd}.gun eksikGun${nd}`)
						}
						else if (k.length > 4 && k.startsWith('saha')) {
							let tokens = k.slice(4).split('_')
							let kod = tokens[0].trim()
							if (odemeSahaBelirtecleri[kod]) {
								let aliasPostfix = tokens.at(-1).trim()
								addOdemeSaha(kod, aliasPostfix)
							}
						}
						break
				}
			}
		}
	}
	loadServerData_queryDuzenle_ortakWhereClause({ sent: { where: wh }}) {
		wh.add('pay.senaryono IS NULL')
	}
	loadServerData_queryDuzenle_tekilSonrasi({ stm }) {
		super.loadServerData_queryDuzenle_tekilSonrasi(...arguments)
		let disinda = asSet(['pode', 'btah', 'tdon'])
		//for (let sent of stm)
		//	sent.gereksizTablolariSil({ disinda })
	}
	loadServerData_queryDuzenle_genelSon_havingOlustur({ stm }) { 
		// do nothing
	}
}

class DRapor_PerTahakkukRaporu extends DRapor_PerTahakkukRaporuOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'PERTAH' } static get aciklama() { return 'Personel Tahakkuk' }
	static get vioAdim() { return null }
}
class DRapor_PerTahakkukRaporu_Main extends DRapor_PerTahakkukRaporuOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_PerTahakkukRaporu }
	static get raporDosyaTanimlar() {
		return [...super.raporDosyaTanimlar]
	}
	loadServerData_queryDuzenle_ortakWhereClause({ sent: { where: wh }}) {
		super.loadServerData_queryDuzenle_ortakWhereClause(...arguments)
		wh.add(`pay.gyuzdonemrefid IS NULL`)
	}
}

class DRapor_PerTarimTahakkukRaporu extends DRapor_PerTahakkukRaporuOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'TARTAH' } static get aciklama() { return 'Tarım Tahakkuk' }
	static get uygunmu() { return app.params?.bGenel?.guleryuzOzel }
	static get vioAdim() { return null }
}
class DRapor_PerTarimTahakkukRaporu_Main extends DRapor_PerTahakkukRaporuOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_PerTarimTahakkukRaporu }
	static get raporDosyaTanimlar() {
		return [
			...super.raporDosyaTanimlar,
			{ belirtec: 'VioPer.RaporEkSaha', section: 'TahRapor-Tarim' }
			// { belirtec: 'VioPer.RaporEkSaha', section: 'TahRapor-TarimOlasiPrimMuaf' }
		]
	}
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		sec
			.addKA('goFirma', BDMQGOFirma, true)
			.addKA('goBolge', BDMQGOBolge, true)
	}
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments)
		result
			.addKAPrefix('gofirma', 'gobolge')
			.addGrupBasit('GOFIRMA', 'GO Firma', 'gofirma', BDMQGOFirma, null, ({ item }) => item.kodsuz())
			.addGrupBasit('GOBOLGE', 'GO Bölge', 'gobolge', BDMQGOBolge, null, ({ item }) => item.kodsuz())
	}
	loadServerData_queryDuzenle({ attrSet, stm }) {
		super.loadServerData_queryDuzenle(...arguments)
		for (let sent of stm) {
			let {where: wh, sahalar} = sent
			for (let key in attrSet) {
				switch (key) {
					case 'GOFIRMA':
						sent.fromIliski('gyuzfirma gfir', 'pay.gyuzfirmaid = gfir.webrefid')
						sahalar.add('pay.gyuzfirmaid gyuzfirmakod', 'gfir.aciklama gyuzfirmaadi')
						break
					case 'GOBOLGE':
						sent.fromIliski('gyuzbolge gbol', 'pay.gyuzbolgeid = gbol.webrefid')
						sahalar.add('pay.gyuzbolgeid gyuzbolgekod', 'gbol.aciklama gyuzbolgeadi')
						break
				}
			}
		}
	}
	loadServerData_queryDuzenle_ortakWhereClause({ sent: { where: wh }}) {
		super.loadServerData_queryDuzenle_ortakWhereClause(...arguments)
		wh.add(`pay.gyuzdonemrefid IS NOT NULL`)
	}
}



/*
* önce geçerli pertahodeme kayıtları bulunur
* rapor kolonuna göre
  . avanssız bilgisi, kıdem ihbar varsa, fazla mesai varsa ek bilgi bulunur
  . ödeme saha bilgisi varsa odeme kod bazında bilgi oluşur
  . eksik neden kodu varsa kod bazında bilgi olusur
  . yeni olusanlar ve asıl tahakkuk bilgileri tek sent olarak duzenlenir
  belirlenir

personelHepsiBagla()
	// personele bagli diger dosyalar
	inner join departman dep on per.depkod=dep.kod
	inner join bisyeri isy on dep.isyerikod=isy.kod
	inner join bisygrup igrp on isy.isygrupkod=igrp.kod		// yeni
	inner join pergrup grp on per.grupkod=grp.kod
	inner join peranagrup agrp on grp.anagrupkod=agrp.kod		// yeni
	inner join perbirim pbrm on per.birimkod=pbrm.kod		// yeni
	inner join bgorev gor on per.gorevkod=gor.kod
	inner join bgorevtipi gtip on gor.tipkod=gtip.kod
	inner join peryaka yak on per.yakakod=yak.kod
	inner join permasraf mas on per.masrafkod=mas.kod
	inner join peruzmanlik uzm on per.uzmanlikkod=uzm.kod
	inner join bil il on per.ilkod=il.kod

tahakkukIsyeriBagla()
	// tahakkuk aylik bilgi diger dosyalar
	inner join bisyeri tahisy on pay.sgkisyerikod=tahisy.kod
	inner join bisygrup tahigrp on tahisy.isygrupkod=tahigrp.kod
	inner join bil isyil on tahisy.ilkod=isyil.kod)		

tahOdemeSonraBagla()
	inner join tahakkuk tdon on pode.tahsayac=tdon.kaysayac and tdon.senaryono is null
					and tdon.altisveren=''	// Tarım için >'' olacak
	inner join pertahay pay on pode.peraysayac=pay.kaysayac and pay.senaryono is null
					and pay.gyuzdonemrefid is null		// Tarım için is not null olacak
	inner join personel per iliski: pay.persayac=per.kaysayac
	// ileride gerekirse left join perisegiriscikis gircik on pay.istencikissayac=gircik.kaysayac


avanssizVarmi = tumAttrListesi içinde [normalOdeme, brutOdenen, ozelKesinti] herhangi biri var mı
kidemIhbarVarmi = tumAttrListesi içinde [kidemYuku, ihbarYuku, kidemIhbarYuku] herhangi biri var mı
fazlaMesaiVarmi = tumAttrListesi içinde [fazlaMesai_TumVeri] varmı 
	VEYA tumAttrListesi içinde 'fazlaMesai' ile başlayıp length(attr)>10 olan var mı
odemeSahaBelirtecleri = new Set()
baglantiEksikNedenleri = new Set()
tumAttrListesi için for çevrimi attr değişkeni için {
	if attr.begins('saha') {
			odemeKod = 4 haneden sonra ama '_'ye kadar // sahaA16_brut için A16
			odemeSahaBelirtecleri[odemeKod] = true }
	if (!avanssizVarmi & attr.begins('avans)) avanssizVarmi=true
	if (attr.begins('eksikGun')) {
		nedenKod = attr.slice(8)	// 8 ve sonrası
		baglantiEksikNedenleri[nedenKod]=true
	}


with sayaclar ( tahodesayac)
		as (select distinct pode.kaysayac
				from pertahodeme pode
			// tahOdemeSonraBagla() yapılacak
			// personelHepsiBagla() yapılacak
			// tahakkukIsyeriBagla() yapılacak
				where ... 	// tbWhereClause
					)		// gereksizTablolariSilDisinda([pode, pay])	yapılacak

		// avanssizVarmi || kidemIhbarVarmi || fazlaMesaiVarmi
	, ekbilgi 
		as (select say.tahodesayac
				
				// avanssizVarmi
				, sum(case when ode.odemetipi='AV' or then tdet.brut else 0 end) avansbrutodenen
				, sum(case when ode.hesap='AV' then tdet.brut else 0 end) avansbrutkesilen
				
				// kidemIhbarVarmi
				, sum(case when ode.odemetipi='KI' then tdet.brut else 0 end) kidemyuku
				, sum(case when ode.hesap='IH' then tdet.brut else 0 end) ihbaryuku
				
				// fazlaMesaiVarmi
				, sum(case when ode.kod like 'B%' then tdet.veri else 0 end) tumfmveri
				, sum(case when ode.kod like 'B%' and ode.carpan=1 then tdet.veri else 0 end) fmnormal
				, sum(case when ode.kod like 'B%' and ode.carpan=1.5 then tdet.veri else 0 end) fm50
				, sum(case when ode.kod like 'B%' and ode.carpan=2 then tdet.veri else 0 end) fm100
				, sum(case when ode.kod like 'B%' and ode.carpan=2.5 then tdet.veri else 0 end) fm150
				, sum(case when ode.kod like 'B%' then tdet.brut else 0 end) tumfmbrut
				, sum(case when ode.kod like 'B%' and ode.carpan=1 then tdet.brut else 0 end) fmnormalbrut
				, sum(case when ode.kod like 'B%' and ode.carpan=1.5 then tdet.brut else 0 end) fm50brut
				, sum(case when ode.kod like 'B%' and ode.carpan=2 then tdet.brut else 0 end) fm100brut
				, sum(case when ode.kod like 'B%' when ode.carpan=2.5 then tdet.brut else 0 end) fm150brut
				, sum(case when ode.kod like 'B%' then tdet.net else 0 end) tumfmnet
				, sum(case when ode.kod like 'B%' and ode.carpan=1 then tdet.net else 0 end) fmnormalnet
				, sum(case when ode.kod like 'B%' and ode.carpan=1.5 then tdet.net else 0 end) fm50net
				, sum(case when ode.kod like 'B%' and ode.carpan=2 then tdet.net else 0 end) fm100net
				, sum(case when ode.kod like 'B%' and ode.carpan=2.5 then tdet.net else 0 end) fm150net
				
			from sayaclar say
				inner join pertahdetay tdet on say.tahodesayac=tdet.tahodemesayac
				inner join odemesaha ode on tdet.odemesahasayac=ode.kaysayac
			where (ode.odemetipi='AV' or ode.hesap='AV'		// avanssizVarmi
					or ode.odemetipi='KI' or ode.hesap='IH'		// kidemIhbarVarmi
					or ode.kod like 'B%')		// fazlaMesaiVarmi
			group by tahodesayac)
 
 		// odemeSahaBelirtecleri.bosDegilmi()
	, odemeler 
		as (select say.tahodesayac, ode.kod odemekod
				, sum(tdet.veri) veri, sum(tdet.veri2) veri2, sum(tdet.brut) brut, sum(tdet.net) net
			from sayaclar say
				inner join pertahdetay tdet on say.tahodesayac=tdet.tahodemesayac
				inner join odemesaha ode on tdet.odemesahasayac=ode.kaysayac
			where ode.kod in @odemeSahaBelirtecleri
			group by tahodesayac, odemekod)
			
	
	// asil sent /////////////////////////////////
	select ...
		from sayaclar say

			if avanssizVarmi || kidemIhbarVarmi || fazlaMesaiVarmi
				left join say ekbilgi ekb on say.tahodesayac = ekb.tahodesayac

			for çevrimi odemeSahaBelirtecleri - odemeKod
				left join say odemeler odet${odemeKod} on say.tahodesayac=odet${odemeKod}.tahodesayac
										and odet${odemeKod}.odemekod='${odemeKod}'

			inner join pertahodeme pode on say.tahodemesayac = pode.kaysayac
			// tahOdemeSonraBagla() yapılacak

			for çevrimi baglantiEksikNedenleri - nedenKod
				left join tdon pertaheksik eks${nedenKod} on pode.peraysayac=eks${nedenKod}.tahaysayac
											and eks${nedenKod}.nedenkod='${nedenKod}' and tdon.odemeno=99		// 99: son odeme

			// personelHepsiBagla() yapılacak
			// tahakkukIsyeriBagla() yapılacak


*/
