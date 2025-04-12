class DRapor_EldekiVarliklar extends DRapor_AraSeviye {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get uygunmu() { return true } static get araSeviyemi() { return false }
	static get sabitmi() { return true } static get vioAdim() { return null } static get konsolideKullanilirmi() { return false }
	static get kategoriKod() { return DRapor_Hareketci.kategoriKod } static get kategoriAdi() { return DRapor_Hareketci.kategoriAdi }
	static get kod() { return 'ELDVAR' } static get aciklama() { return 'Eldeki Varlıklar' }
	altRaporlarDuzenle(e) { this.add(DRapor_EldekiVarliklar_Sol, DRapor_EldekiVarliklar_Sag) }
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
	get hareketciYapilari() { return [] }
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); let grupKod = 'donemVeTarih';
		let {id2AltRapor} = this.rapor, anaTip_kaListe = [];
		for (let {hareketciYapilari} of Object.values(id2AltRapor)) { anaTip_kaListe.push(...hareketciYapilari) }
		sec.grupEkle(grupKod, 'Tarih ve Bilgiler');
		sec.secimTopluEkle({
			tarih: new SecimTekilDate({ grupKod, etiket: '... Tarihdeki Durum', placeHolder: 'Bugünkü Durum' }),
			anaTip: new SecimBirKismi({ grupKod, etiket: 'Gösterilecek Bilgiler', kaListe: anaTip_kaListe }).birKismi().autoBind()
		})
	}
	tabloYapiDuzenle({ result }) {
		result.addKAPrefix('hartip', 'mst')
			.addGrupBasit_numerik('ONCELIK', 'Öncelik', 'oncelik', null, null, null, false)
			.addGrupBasit('GRUP', '', 'grup', null, null, null, false)
			.addGrupBasit('MST', this.class.mstEtiket, 'mst', null, 550, null, false);
		for (let {kod, aciklama} of this.dovizKAListe) {
			result.addToplamBasit_bedel(`BEDEL_${kod}`, `${aciklama} Bedel`, `bedel_${kod}`, null, 110, ({ colDef }) => colDef?.hidden(), false) }
		result.addToplamBasit_bedel('BEDEL', 'TL Bedel', 'bedel', null, 140, null, false)
	}
	sabitRaporTanimDuzenle({ result }) {
		super.sabitRaporTanimDuzenle(...arguments);
		result.resetSahalar().addGrup('GRUP').addIcerik('MST');
		for (let kod of this.dvKodListe) { result.addIcerik(`BEDEL_${kod}`) }
		result.addIcerik('BEDEL')
	}
	loadServerData_queryDuzenle(e) {
		e.alias = ''; super.loadServerData_queryDuzenle(e); let {ozelIsaret: ozelIsaretVarmi} = app.params.zorunlu;
		let {stm} = e, {secimler: sec} = this, {grupVeToplam} = this.tabloYapi, {sqlNull, sqlEmpty} = Hareketci_UniBilgi.ortakArgs;
		let {hareketciYapilari} = this, clsKey2HarYapi = {}; for (let item of hareketciYapilari) { clsKey2HarYapi[item.sinif.classKey] = item }
		let {secilen: secHareketciYapilari} = sec.anaTip;
		if (secHareketciYapilari?.length) {
			/* Seçilen HarYapilar varsa, sadece (bu - sol/sağ) uygun olanı alınır */
			secHareketciYapilari = secHareketciYapilari.filter(({ sinif: cls }) => clsKey2HarYapi[cls.classKey])
		}
		else {
			/* Aksinde, (bu - sol/sağ) için hareketciYapilari listesi aynen alınır - orijinal liste zaten sadece bu alt sınıfa uygun olanları içerir */
			secHareketciYapilari = hareketciYapilari
		}
		let harClasses = secHareketciYapilari.map(({ sinif }) => sinif);
		let sabitBelirtecler = ['tarih', 'ba', 'bedel', 'dvbedel', 'dvkod', 'belgetipi', 'finanalizkullanilmaz'];
		if (ozelIsaretVarmi) { sabitBelirtecler.push('ozelisaret') }
		let harListe = []; for (let cls of harClasses) {
			let {kod: anaTip, mstYapi} = cls, {hvAlias: mstKodAlias, hvAdiAlias: mstAdiAlias, hvAdiAlias2: mstAdiAlias2} = mstYapi;
			let belirtecler = [...sabitBelirtecler, mstKodAlias, mstAdiAlias, mstAdiAlias2].filter(x => !!x);
			let har = new cls(); har.withAttrs(belirtecler); harListe.push(har)
		}
		let sonTarih = sec.tarih.value || null;
		let uni = new MQUnionAll(); for (let har of harListe) {
			let {oncelik, mstYapi} = har.class, {hvAlias: mstKodAlias, hvAdiAlias: mstAdiAlias, hvAdiAlias2: mstAdiAlias2} = mstYapi;
			let harUni = har.uniOlustur({ sender: this }); for (let harSent of harUni.getSentListe()) {
				if (!harSent) { continue } let {classKey} = har.class;
				let harYapi = clsKey2HarYapi[classKey]; if (!harYapi) { debugger; continue }
				let {kod: harTipKod, aciklama: harTipAdi} = harYapi, {from, where: wh, sahalar, alias2Deger} = harSent; sahalar.liste = []; 
				let {ozelisaret: ozelIsaretClause, tarih: tarihClause, ba: baClause, bedel: tlBedelClause, dvbedel: dvBedelClause, dvkod: dvKodClause} = alias2Deger;
				dvKodClause = dvKodClause || sqlEmpty; let dvBosmuClause = this.getDvBosmuClause(dvKodClause);
				let bedelClause = this.getDovizliBedelClause({ dvKodClause, tlBedelClause, dvBedelClause, sumOlmaksizin: true });
				let kodClause = alias2Deger[mstKodAlias], adiClause = alias2Deger[mstAdiAlias], adiClause2 = alias2Deger[mstAdiAlias2];
				sahalar.add(`'${harTipKod}' anatip`);
				if (adiClause) { sahalar.add(`${adiClause} mstadi`) } else { mstYapi.duzenle({ sent: harSent, wh, kodClause }) }
				sahalar.add(`${adiClause2 || sqlEmpty} mstadi2`);
				sahalar.add(
					`${kodClause} mstkod`, `'${harTipAdi}' grup`, `${oncelik} oncelik`,
					`${this.getRevizeDvKodClause(dvKodClause)} dvkod`,
					`SUM(case when ${baClause} = 'B' then ${bedelClause} else 0 - ${bedelClause} end) bedel`
				);
				if (ozelIsaretVarmi && ozelIsaretClause) { wh.notDegerAta('X', ozelIsaretClause) }
				if (sonTarih) { wh.basiSonu({ sonu: sonTarih }, tarihClause) }
				harYapi.duzenle({
					har, hv: alias2Deger, sent: harSent, wh, harTipKod,
					kodClause, adiClause, mstKodAlias, mstAdiAlias
				});
				harSent.groupByOlustur().gereksizTablolariSil();
				uni.add(harSent)
			}
		}
		/* console.table(uni.siraliSahalar) */
		let topStm = uni.asToplamStm(); stm.with.birlestir(topStm.with); stm.sent = topStm.sent;
		stm.orderBy.add('oncelik', 'anatip', 'dvkod', 'mstkod')
		let withSent = topStm.with.liste[0]?.sent;
		if (!withSent?.liste?.length) { return false }
		/* self.uni = withSent */
	}
	loadServerData_recsDuzenleIlk({ recs }) {
		super.loadServerData_recsDuzenleIlk(...arguments);
		let recsDvKodSet = this.recsDvKodSet = {}; for (let rec of recs) {
			let {dvkod: dvKod, bedel, mstadi: mstAdi, mstadi2: mstAdi2} = rec;
			if (this.getDovizmi(dvKod)) { rec[`bedel_${dvKod}`] = bedel; rec.bedel = 0; recsDvKodSet[dvKod] = true }
			if (!mstAdi && mstAdi2) { mstAdi = rec.mstadi = mstAdi2 }
		}
	}
	/*loadServerDataInternal(e) { return [] }
	loadServerData_recsDuzenleIlk({ recs }) {
		super.loadServerData_recsDuzenleIlk(...arguments);
		recs.sort(
			({ oncelik: onc1, grup: grup1, mstkod: mst1 }, { oncelik: onc2, grup: grup2, mstkod: mst2 }) =>
				(onc1 - onc2) || (grup1 - grup2) || (mst1 - mst2)
		)
	}*/
	tazeleDiger(e) { /* do nothing */ }
	gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e);
		let {gridPart, recsDvKodSet} = this, {gridWidget} = gridPart, {base} = gridWidget;
		for (let dvKod of this.dvKodListe) {
			let dvKodVarmi = recsDvKodSet[dvKod];
			base[dvKodVarmi ? 'showColumn' : 'hideColumn'](`bedel_${dvKod}`)
		}
		let {boundRecs: recs} = e; gridPart.expandedRowsSet = {};
		if (recs?.length) { gridWidget.expandAll() }
	}
}
class DRapor_EldekiVarliklar_Sol extends DAltRapor_EldekiVarliklar_Ortak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get mstEtiket() { return 'VARLIKLAR VE ALACAKLARIMIZ' } static get borderColor() { return '#96cd96' }
	get hareketciYapilari() {
		return [
			...super.hareketciYapilari,
			new DRapor_HarYapi().setSinif(KasaHareketci),
			new DRapor_HarYapi().setSinif(BankaMevduatHareketci),
			new DRapor_HarYapi().setSinif(POSHareketci),
			new DRapor_HarYapi(['alcek', 'Alacak Çekleri']).setSinif(CSHareketci)
				.setDuzenleyici(({ hv, wh }) => wh.degerAta('AC', hv.belgetipi)),
			new DRapor_HarYapi(['alsenet', 'Alacak Senetleri']).setSinif(CSHareketci)
				.setDuzenleyici(({ hv, wh }) => wh.degerAta('AS', hv.belgetipi)),
			new DRapor_HarYapi(['must', 'Müşteriler']).setSinif(CariHareketci)
				.setDuzenleyici(({ sent, wh, kodClause }) => {
					if (!sent.from.aliasIcinTable('car')) { sent.fromIliski('carmst car', `${kodClause} = car.must`) }
					sent.cari2TipBagla(); wh.add(`ctip.satmustip = ''`)
				})
		]
	}
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
	get hareketciYapilari() {
		return [
			...super.hareketciYapilari,
			new DRapor_HarYapi().setSinif(KrediTaksitHareketci),
			new DRapor_HarYapi().setSinif(KrediKartiHareketci),
			new DRapor_HarYapi().setSinif(BankaAkreditifHareketci),
			new DRapor_HarYapi().setSinif(BankaTeminatMektupHareketci),
			new DRapor_HarYapi(['brcek', 'Borç Çekleri']).setSinif(CSHareketci)
				.setDuzenleyici(({ hv, wh }) => wh.degerAta('BC', hv.belgetipi)),
			new DRapor_HarYapi(['brsenet', 'Borç Senetleri']).setSinif(CSHareketci)
				.setDuzenleyici(({ hv, wh }) => wh.degerAta('BS', hv.belgetipi)),
			new DRapor_HarYapi(['satici', 'Satıcılar']).setSinif(CariHareketci)
				.setDuzenleyici(({ hv, sent, wh, kodClause }) => {
					if (!sent.from.aliasIcinTable('car')) { sent.fromIliski('carmst car', `${kodClause} = car.must`) }
					sent.cari2TipBagla(); wh.add(`ctip.satmustip = 'S'`)
				})
		]
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
