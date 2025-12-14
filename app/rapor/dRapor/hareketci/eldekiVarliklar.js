class DRapor_EldekiVarliklar extends DRapor_AraSeviye {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 6 } static get uygunmu() { return true } static get araSeviyemi() { return false }
	static get sabitmi() { return true } static get vioAdim() { return 'FN-RE' } static get konsolideKullanilirmi() { return true }
	static get kategoriKod() { return 'FINANLZ' } static get kategoriAdi() { return 'Finansal Analiz' }
	static get kod() { return 'ELDVAR' } static get aciklama() { return 'Eldeki Varlıklar' } static get yataymi() { return true }
	altRaporlarDuzenle(e) {
		super.altRaporlarDuzenle(e)
		this.addWithZorunluOzelID(DRapor_EldekiVarliklar_Sol, DRapor_EldekiVarliklar_Sag)
	}
	rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {rfb_items} = e;
		rfb_items.addStyle(e =>
			`$elementCSS > [data-builder-id = main].item { border-radius: 5px !important; box-shadow: 0 0 5px 8px ${DRapor_EldekiVarliklar_Sol.borderColor} !important }
			 $elementCSS > [data-builder-id = sag].item { border-radius: 5px !important; box-shadow: 0 0 5px 6px ${DRapor_EldekiVarliklar_Sag.borderColor} !important }
			 $elementCSS > .item:not(.hasFocus) > label { color: #555 !important }`
		)
	}
}
class DAltRapor_EldekiVarliklar_Ortak extends DRapor_AraSeviye_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get eldekiVarliklarmi() { return true } 
	static get mstEtiket() { return '' } static get borderColor() { return '' }
	static get aciklama() { return `<div class="full-wh" style="background-color: ${this.borderColor}">${this.mstEtiket}</div>` }
	static get raporClass() { return DRapor_EldekiVarliklar } get width() { return '49.5%' }
	static get yon() { return 'sol' } static get solmu() { return true }
	get tazeleHideProgress_minCount() { return 2 }

	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		let {eldekiVarlikStokDegerlemesiKDVlidir: degKDVlimi} = app?.params?.finans
		{
			let harClasses = values(Hareketci.kod2Sinif).filter(cls => cls.eldekiVarliklarIcinUygunmu)
			let anaTip_kaListe = []
			for (let {kod, aciklama} of harClasses)
				anaTip_kaListe.push(new CKodVeAdi([kod, aciklama]))
			let grupKod = 'donemVeTarih'
			sec.grupEkle(grupKod, 'Tarih ve Bilgiler')
			sec.secimTopluEkle({
				tarih: new SecimTekilDate({ grupKod, etiket: '... Tarihdeki Durum', placeHolder: 'Bugünkü Durum' }),
				anaTip: new SecimBirKismi({ grupKod, etiket: 'Gösterilecek Bilgiler', kaListe: anaTip_kaListe }).birKismi().autoBind()
				// tipeUymayanBakiyelerAlinmaz: new SecimBool({ grupKod, etiket: `Satıcı/Müşteri Tip'e uymayan bakiyeler alınmasın` }).setTrue()
				// uyari1: new SecimText({ grupKod, value: `!! Satıcı/Müşteri Tip'e uymayan bakiyeler de <u class="bold firebrick">ALINIR</u>` })
			})
		}
		{
			let cariGosterim_tSec = new TekSecim({
				char: '',
				kaListe: [	new CKodVeAdi(['', 'Cari Hesap', 'carimi']),
					new CKodVeAdi(['BL', 'Bölge', 'bolgemi']),
					new CKodVeAdi(['AB', 'Ana Bölge', 'anaBolgemi']),
					new CKodVeAdi(['TP', 'Tip', 'tipmi']),
					new CKodVeAdi(['IL', 'İl', 'ilmi'])
				]
			})
			let stokTipi_tSec = new TekSecim({
				char: '',
				kaListe: [	new CKodVeAdi(['', 'Stok', 'stokmu']),
					new CKodVeAdi(['GR', 'Grup', 'grupmu']),
					new CKodVeAdi(['AG', 'Ana Grup', 'anaGrupmu']),
					new CKodVeAdi(['IG', 'İst. Grup', 'istGrupmu']),
					new CKodVeAdi(['MR', 'Marka', 'markami'])
				]
			})
			let grupKod = 'gosterim'
			sec.grupEkle(grupKod, 'Gösterim')
			sec.secimTopluEkle({
				cariGosterim: new SecimTekSecim({ grupKod, etiket: 'Cari Gösterim', tekSecim: cariGosterim_tSec }).autoBind(),
				stokTipi: new SecimTekSecim({ grupKod, etiket: 'Stok Tipi', tekSecim: stokTipi_tSec }).autoBind()
			})
			if (degKDVlimi) {
				sec.secimEkle('degKDVliUyari',
					new SecimText({ grupKod, etiket: ' ', value: `<span class=fs-120>Stok Değerlemesi <b class=firebrick>KDV'li</b>dir</span>` }))
			}
		}
		sec.addKA('sube', DMQSube, ({ hv }) => hv.bizsubekod, 'sub.aciklama')
		sec.addKA('subeGrup', DMQSubeGrup, 'sub.isygrupkod', 'igrp.aciklama')
	}
	tabloYapiDuzenle({ result }) {
		result.addKAPrefix('hartip', 'mst')
			.addGrupBasit('DB', 'Veritabanı', 'db', null, null, null, false)
			.addGrupBasit_numerik('ONCELIK', 'Öncelik', 'oncelik', null, null, null, false)
			.addGrupBasit_numerik('GRUPONCELIK', 'Grup Öncelik', 'gruponcelik', null, null, null, false)
			.addGrupBasit('GRUP', '', 'grup', null, null, null, false)
			.addGrupBasit('MST', this.class.mstEtiket, 'mst', null, 550, null, false)
		for (let {kod, aciklama} of this.dovizKAListe)
			result.addToplamBasit_bedel(`BEDEL_${kod}`, `${aciklama} Bedel`, `bedel_${kod}`, null, 110, ({ colDef }) => colDef?.hidden(), false)
		result.addToplamBasit_bedel('BEDEL', 'TL Bedel', 'bedel', null, 140, null, false)
		result.addToplamBasit('MIKTAR', 'Miktar', 'miktar', null, 110)
	}
	sabitRaporTanimDuzenle({ result }) {
		super.sabitRaporTanimDuzenle(...arguments)
		result.resetSahalar()
			// .addGrup('ONCELIK').addGrup('GRUPONCELIK')
			.addGrup('GRUP').addIcerik('MST')
		for (let kod of this.dvKodListe)
			result.addIcerik(`BEDEL_${kod}`)
		result.addIcerik('BEDEL')
		result.addIcerik('MIKTAR')
	}
	tazele(e) {
		let {rapor, raporTanim, konsolideVarmi} = this
		let {main: { gridPart: { grid } }} = rapor
		let {kullanim} = raporTanim ?? {}
		if (!kullanim)
			debugger
		kullanim.yatayAnaliz = konsolideVarmi ? 'DB' : null
		{
			let cssSelector = 'status-ekBilgi'
			grid?.children(`.${cssSelector}`)?.remove()
		}
		return super.tazele(e)
	}
	tazeleDiger(e) { /* do nothing */ }
	loadServerData_queryDuzenle(e) {
		e.alias = ''; super.loadServerData_queryDuzenle(e)
		let {attrSet} = e, {length: attrSetSize} = keys(attrSet)
		/* if (attrSetSize == 1 && attrSet.DB) { return } */
		let /*{ozelIsaret: ozelIsaretVarmi} = app.params.zorunlu; */ ozelIsaretVarmi = true;
		let {stm} = e, {tabloYapi: { grupVeToplam }, rapor: { main: { secimler: sec } }, class: { yon }} = this
		let {sqlNull, sqlEmpty, sqlZero} = Hareketci_UniBilgi.ortakArgs;
		let {value: anaTipListe, disindakilermi: anaTip_haricmi} = sec.anaTip ?? {}
		let anaTipSet = asSet(anaTipListe)
		if (!anaTip_haricmi && empty(anaTipSet))
			anaTipSet = null
		let harClasses = values(Hareketci.kod2Sinif).filter(cls =>
			!!cls.eldekiVarliklarIcinUygunmu &&
			( !anaTipSet || !!anaTipSet[cls.kod] != anaTip_haricmi )
		)
		let sabitBelirtecler = [
			'alttiponcelik', 'alttipadi', 'yon', 'finanalizkullanilmaz',
			'tarih', 'ba', 'bedel', 'dvbedel', 'dvkod', 'belgetipi',
			'bizsubekod', 'bolgekod', 'tipkod', 'ilkod',
			'stokkod', 'grupkod', 'anagrupkod', 'sistgrupkod', 'smarkakod'
		];
		if (ozelIsaretVarmi)
			sabitBelirtecler.push('ozelisaret')
		let harListe = this.harListe = []
		for (let cls of harClasses) {
			let {kod: anaTip, mstYapi} = cls, {hvAlias: mstKodAlias, hvAdiAlias: mstAdiAlias, hvAdiAlias2: mstAdiAlias2} = mstYapi
			let belirtecler = [...sabitBelirtecler, mstKodAlias, mstAdiAlias, mstAdiAlias2].filter(x => !!x)
			let har = new cls()
			har.withAttrs(belirtecler)
			harListe.push(har)
		}
		let sonTarih = sec.tarih.value || null
		let buYonClause = yon.sqlServerDegeri()
		let uni = new MQUnionAll()
		for (let har of harListe) {
			let {oncelik, mstYapi, kod: harTipKod, finAnaliz_baIcinTersIslemYapilirmi: baTersIslem} = har.class
			let {hvAlias: mstKodAlias, hvAdiAlias: mstAdiAlias, hvAdiAlias2: mstAdiAlias2} = mstYapi
			let harUni = har.uniOlustur({ sender: this })
			for (let harSent of harUni) {
				if (!harSent)
					continue
				let {from, where: wh, sahalar, alias2Deger} = harSent
				let {yon: yonClause} = alias2Deger, yonLiteralmi = yonClause?.[0] == `'`
				if (yonLiteralmi && yonClause != buYonClause)
					continue
				let {alttiponcelik: grupOncelikClause, alttipadi: grupAdiClause, ozelisaret: ozelIsaretClause,
					 tarih: tarihClause, miktar: miktarClause, ba: baClause, bedel: tlBedelClause, dvbedel: dvBedelClause, dvkod: dvKodClause
				} = alias2Deger
				miktarClause = miktarClause ? miktarClause.sumOlmaksizin() : sqlZero
				dvKodClause = dvKodClause || sqlEmpty
				let dvBosmuClause = this.getDvBosmuClause(dvKodClause)
				let bedelClause = this.getDovizliBedelClause({ dvKodClause, tlBedelClause, dvBedelClause, sumOlmaksizin: true })
				let mstKodClause = alias2Deger[mstKodAlias], mstAdiClause = alias2Deger[mstAdiAlias], mstAdiClause2 = alias2Deger[mstAdiAlias2]
				sahalar.liste = []
				sahalar.add(`'${harTipKod}' anatip`)
				if (mstAdiClause)
					sahalar.add(`${mstAdiClause} ${mstAdiAlias}`)
				else {
					mstYapi.duzenle({ sender: this, secimler: sec, sent: harSent, wh, kodClause: mstKodClause, hv: alias2Deger })
					$.extend(alias2Deger, { ...harSent.alias2Deger })
					mstKodAlias = mstYapi.hvAlias; mstAdiAlias = mstYapi.hvAdiAlias || mstAdiAlias; mstAdiAlias2 = mstYapi.hvAdiAlias2 || mstAdiAlias2
					mstKodClause = alias2Deger[mstKodAlias]; mstAdiClause = alias2Deger[mstAdiAlias]; mstAdiClause2 = alias2Deger[mstAdiAlias2]
				}
				sahalar.add(`${mstAdiClause2 || sqlEmpty} ${mstAdiAlias2}`)
				mstKodClause ||= sqlEmpty
				let getMiktarBedelClause = clause => {
					if (baTersIslem)
						clause = clause.sqlBosDegermi() ? sqlZero : `case when ${baClause} = 'B' then ${clause} else 0 - ${clause} end`
					return clause
				}
				sahalar.add(
					`${mstKodClause} mstkod`, `${oncelik} oncelik`, `${grupAdiClause} grup`, `${grupOncelikClause} gruponcelik`,
					`${this.getRevizeDvKodClause(dvKodClause)} dvkod`,
					`SUM(${getMiktarBedelClause(miktarClause)}) miktar`,
					`SUM(${getMiktarBedelClause(bedelClause)}) bedel`
				)
				if (!yonLiteralmi) { wh.degerAta(yon, yonClause) }
				if (ozelIsaretVarmi && ozelIsaretClause) { wh.notDegerAta('X', ozelIsaretClause) }
				if (sonTarih) { wh.basiSonu({ sonu: sonTarih }, tarihClause) }
				harSent.groupByOlustur().gereksizTablolariSil()
				uni.add(harSent)
			}
		}
		/* console.table(uni.siraliSahalar) */
		if (!uni?.liste?.length)
			return false
		stm.sent = uni
		/*let topStm = uni.asToplamStm()
		stm.with.birlestir(topStm.with); stm.sent = topStm.sent
		stm.orderBy.add('oncelik', 'anatip', 'gruponcelik', 'grup', 'dvkod', 'mstkod')
		let withSent = topStm.with.liste[0]?.sent
		if (!withSent?.liste?.length)
			return false*/
	}
	loadServerData_queryDuzenle_genelSon(e) {
		super.loadServerData_queryDuzenle_genelSon(e)
		/*if (finansalAnalizmi && sec?.tipeUymayanBakiyelerAlinmaz?.value) {
			debugger
		}*/
		let {stm: { orderBy }} = e
		orderBy.liste = ['oncelik', 'gruponcelik', 'grup', 'mstkod']
	}
	loadServerData_recsDuzenleIlk({ recs }) {
		let {class: { sagmi, sagDuzenlenmeyecekGrupAdlariSet }} = this
		let recsDvKodSet = this.recsDvKodSet = {}
		for (let rec of recs) {
			let {miktar, dvkod: dvKod, bedel, dvbedel, grup: grupAdi, mstadi: mstAdi, mstadi2: mstAdi2} = rec
			if (this.getDovizmi(dvKod))
				recsDvKodSet[dvKod] = true
			if (!mstAdi && mstAdi2)
				mstAdi = rec.mstadi = mstAdi2
			/*if (sagmi && sagDuzenlenmeyecekGrupAdlariSet?.[grupAdi])
				debugger*/
			if (sagmi && !(sagDuzenlenmeyecekGrupAdlariSet?.[grupAdi])) {
				if (miktar)
					miktar = rec.miktar = -miktar
				if (bedel)
					bedel = rec.bedel = -bedel
				if (dvbedel)
					dvbedel = rec.dvbedel = -dvbedel
			}
		}
		return super.loadServerData_recsDuzenleIlk(...arguments)
	}
	/*loadServerDataInternal(e) { return [] }
	loadServerData_recsDuzenleIlk({ recs }) {
		super.loadServerData_recsDuzenleIlk(...arguments);
		recs.sort(
			({ oncelik: onc1, grup: grup1, mstkod: mst1 }, { oncelik: onc2, grup: grup2, mstkod: mst2 }) =>
				(onc1 - onc2) || (grup1 - grup2) || (mst1 - mst2)
		)
	}*/
	loadServerData_recsDuzenleSon({ recs }) {
		let {recsDvKodSet, rapor: { tazeleCount }, gridPart} = this
		if (!empty(recsDvKodSet)) {
			for (let sev of recs) {                                         // sev: anatip
				let mst2Detay = sev.mst2Detay = {}
				for (let rec of sev.detaylar) {
					let {mstkod: mst = '', dvkod: dvKod, bedel} = rec
					if (!this.getDovizmi(dvKod))
						dvKod = ''
					let newRec = mst2Detay[mst] ??= { ...rec, bedel: 0 }
					newRec[dvKod ? `bedel_${dvKod}` : 'bedel'] = bedel
				}
				sev.detaylar = values(mst2Detay)
			}
		}
		return super.loadServerData_recsDuzenleSon({ ...arguments[0], recs })
	}
	gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e)
		let {rapor, rapor: { tazeleCount }} = this
		{
			let {dvKodListe, recsDvKodSet, gridPart, gridPart: { gridWidget, gridWidget: { base: w } }} = this
			for (let dvKod of dvKodListe) {
				let dvKodVarmi = recsDvKodSet[dvKod]
				w[dvKodVarmi ? 'showColumn' : 'hideColumn'](`bedel_${dvKod}`)
			}
			let {boundRecs: recs} = e
			gridPart.expandedRowsSet = {}
			if (!recs?.length)
				gridWidget.collapseAll()
		}
		{
			if (tazeleCount >= 2) {
				setTimeout(() => {
					let { main, sag, main: { gridPart: { grid } }} = rapor.id2AltRapor
					let cssSelector = 'status-ekBilgi'
					grid.children(`.${cssSelector}`).remove()
					let getTotal = r =>
						topla(_ => _.bedel || 0, r.gridPart.gridWidget.getRows())
					let farkTL = roundToBedelFra(getTotal(main) - getTotal(sag))
					let veri = toStringWithFra(farkTL, 2)
					let colorCSS = farkTL > 0 ? 'forestgreen' : farkTL < 0 ? 'firebrick' : 'royalblue'
					$(`<div class="${cssSelector} absolute" style="left: 15px; bottom: 8px; z-index: 25">
							<span class="etiket">Fark: </span>
							<span class="veri bold ${colorCSS}">${veri}</span>
							<span class="ek-bilgi bold"> TL</span>
					   </div>`).appendTo(grid)
				}, 10)
			}
		}
	}
}
class DRapor_EldekiVarliklar_Sol extends DAltRapor_EldekiVarliklar_Ortak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get mstEtiket() { return 'VARLIKLAR VE ALACAKLARIMIZ' } static get borderColor() { return '#96cd96' }
	/*async loadServerDataInternal(e) {
		let recs = await super.loadServerDataInternal(e) ?? [];
		recs.push(...[
			{ oncelik: 1, grup: 'NAKİTLER', mstkod: '100 01', mstadi: 'TL KASA', bedel: -3_357_903.97, kur2tl: -3_357_903.97 },
			{ oncelik: 1, grup: 'USD KASA', mstkod: '100 02', mstadi: 'TL KASA', bedel_USD: 43_972.44, kur2tl: 1_507_023.46 },
			{ oncelik: 1, grup: 'EUR KASA', mstkod: '100 03', mstadi: 'EUR KASA', bedel_USD: 1_095.00, kur2tl: 41_238.69 },
			{ oncelik: 3, grup: 'POS TAHSİLLERİ', mstkod: '102 01', mstadi: 'GARANTİ BANKASI TL', bedel: 3_382_752.54, kur2tl: 3_382_752.54 },
			{ oncelik: 3, grup: 'POS TAHSİLLERİ', mstkod: '102 02', mstadi: 'VAKIFBANK TL', bedel: 545_550.62, kur2tl: 545_550.62 },
			{ oncelik: 4, grup: 'ALACAK ÇEKLER', mstkod: '102 14', mstadi: 'KUVEYTTÜRK TL', bedel: 70_000.00, kur2tl: 70_000.00 },
			{ oncelik: 4, grup: 'ALACAK ÇEKLER', mstkod: '102 19', mstadi: 'KUVEYTTÜRK ÇEK HESABI', bedel: 342_646.00, kur2tl: 342_646.00 },
			{ oncelik: 4, grup: 'ALACAK ÇEKLER', mstkod: 'ALCEK', mstadi: 'Alacak Çekleri', bedel: 2_118_300.00, kur2tl: 2_118_300.00 }
		]);
		return recs
	}*/
	ozetBilgiRecsOlustur(e) { }
}
class DRapor_EldekiVarliklar_Sag extends DAltRapor_EldekiVarliklar_Ortak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'sag' }
	static get mstEtiket() { return 'BORÇLARIMIZ' } static get borderColor() { return '#bc9d9d' }
	static get yon() { return 'sag' } static get sagmi() { return true }
	static get sagDuzenlenmeyecekGrupAdlariSet() {
		return asSet([
			/*'Borç Çekleri',
			'Borç Senetleri'*/
		])
	}
	/*async loadServerDataInternal(e) {
		let recs = await super.loadServerDataInternal(e) ?? [];
		recs.push(...[
			{ oncelik: 2, grup: 'KREDİ KART ÖDEMELERİ', mstkod: '0011', mstadi: 'GARANTİ BANKASI K.K 0011', bedel: 2_389_590.07, kur2tl: 2_389_590.07 },
			{ oncelik: 2, grup: 'KREDİ KART ÖDEMELERİ', mstkod: '1019', mstadi: 'GARANTİ BANKASI K.K 1019', bedel: 518_260.69, kur2tl: 518_260.69 },
			{ oncelik: 2, grup: 'KREDİ KART ÖDEMELERİ', mstkod: '3830', mstadi: 'KUVEYTTÜRK K.K 3830', bedel: 51.00, kur2tl: 51.00 },
			{ oncelik: 5, grup: 'BORÇ ÇEKLER', mstkod: 'CR00173', mstadi: 'VF EGE GİYİM SANAYİ VE TİC. LTD.ŞTİ.', bedel: 4_878_035.00, kur2tl: 4_878_035.00 },
			{ oncelik: 5, grup: 'BORÇ ÇEKLER', mstkod: 'CR00891', mstadi: 'ÜMİT KARAKOÇ TEKSTİL SAN.TİC.LTD.ŞTİ. - USD HESABI', bedel_USD: 17_840.13, kur2tl: 611_416.94 }
		]);
		return recs
	}*/
}
