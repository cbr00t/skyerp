
class DRapor_HizmetMuhKontrol extends DRaporMQ {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 98 }
	static get kategoriKod() { return 'MUH' } static get kategoriAdi() { return 'Muhasebe' }
	static get kod() { return 'HIZMUHKONT' } static get aciklama() { return 'Hizmet Muhasebeleşme Kontrolü' }
	static get kolonFiltreKullanilirmi() { return false } get uygunmu() { return this.class.uygunmu }
	static get uygunmu() { return app.params?.dRapor?.hizmetVeMuhKarsilastirma }
	// static get vioAdim() { return 'MH-R' }
	static get secimSinif() { return DonemselSecimler }
	async onAfterRun({ gridPart, builder: rfb }) {
		await super.onAfterRun(...arguments)
		if (!this.isPanelItem)
			setTimeout(() => gridPart.secimlerIstendi(), 50)
	}
	static islemTuslariDuzenle_listeEkrani({ sender: gridPart, liste, part: { ekSagButonIdSet: sagSet } }) {
		super.islemTuslariDuzenle_listeEkrani(...arguments)
		let items = [
			// { id: 'eIslemXMLOlustur', handler: e => this.eIslemIzleIstendi({ ...arguments[0], ...e, recs: gridPart.selectedRecs }) }
		]
		liste.push(...items)
		$.extend(sagSet, asSet(items.map(_ => _.id)))
	}
	static orjBaslikListesi_argsDuzenle({ sender: gridPart, args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		gridPart.tekil()
		$.extend(args, { showStatusBar: true, showAggregates: true, selectionMode: 'multiplerowsextended' })
	}
	static orjBaslikListesi_groupsDuzenle({ liste }) {
		super.orjBaslikListesi_groupsDuzenle(...arguments)
	}
	static secimlerDuzenle({ secimler: sec }) {
		let {liste: l, donem: { tekSecim: donem }} = sec
		donem.buAy()
		sec.addKA('muhHesap', DMQMuhHesap, null, null, false)
		$.extend(l.muhHesapKod, { birKismimi: false, basi: '7', sonu: '7z' })
		delete l.muhHesapAdi
	}
	static ekCSSDuzenle({ dataField: belirtec, rec, value, result }) {
		super.ekCSSDuzenle(...arguments)
		if (value) {
			if (belirtec.endsWith('borc') || belirtec.endsWith('bakiye'))
				result.push('bold', value > 0 ? 'forestgreen' : 'orangered')
			if (belirtec.endsWith('alacak'))
				result.push('bold', value > 0 ? 'firebrick' : 'orangered')
		}
		else if (belirtec.endsWith('borc') || belirtec.endsWith('alacak') || belirtec.endsWith('bakiye'))
			result.push('lightgray')
		if (belirtec == 'bakiye')
			result.push('fs-120')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'muhHesapKod', text: 'Muh Hesap', genislikCh: 15 }),
				new GridKolon({ belirtec: 'muhHesapAdi', text: 'Hesap Adı', maxWidth: 60 * katSayi_ch2Px })
			),
			new GridKolon({ belirtec: 'muh_borc', text: 'Muh.Borç', genislikCh: 15, aggregates: ['sum'] }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'muh_alacak', text: 'Muh.Alacak', genislikCh: 15, aggregates: ['sum'] }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'hiz_borc', text: 'Hiz.Borç', genislikCh: 15, aggregates: ['sum'] }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'hiz_alacak', text: 'Hiz.Alacak', genislikCh: 15, aggregates: ['sum'] }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'bakiye', text: '(Muh - Hiz) Fark', genislikCh: 21, aggregates: ['sum'] }).tipDecimal_bedel()
		)
	}
	static async loadServerDataDogrudan({ gridPart, secimler: sec, secimler: { tarihBSVeyaCariDonem: tarihBS } }) {
		let {hizmetVeMuhKarsilastirma_ozelIsaret: ozelIsaretBakilirmi} = app.params?.dRapor ?? {}
		let {muhHesapKod: sec_muhHesapKod, muhHesapAdi: sec_muhHesapAdi} = sec
		let recs
		{
			let har = new HizmetHareketci()
			har.withAttrs('hizmetkod', 'bedel', 'ba')
			har.addEkDuzenleyici(null, ({ har, hv, sent, where: wh }) => {
				wh.basiSonu(tarihBS, hv.tarih)
				wh.basiSonu(sec_muhHesapKod, 'hiz.muhhesap')
				// hareketci wh.fisSilindiEkle() kendisi yapıyor olabilir
				if (ozelIsaretBakilirmi)
					wh.add(`${hv.ozelisaret} <> '*'`)                                                      // sadece muhasebeleşenler
				sent.sahalarVeGroupByVeHavingReset()
				let {sahalar} = sent, {ba, bedel} = hv
				sahalar.add(...[
					'hiz.muhhesap muhHesapKod',
					`SUM(case when ${ba} = 'B' then ${bedel} else 0 end) hiz_borc`,
					`SUM(case when ${ba} = 'A' then ${bedel} else 0 end) hiz_alacak`,
					`0 muh_borc`,
					`0 muh_alacak`
				])
				sent.groupByOlustur()
				sent.gereksizTablolariSilDogrudan(['hiz'])
			})
			let uni = har.uniOlustur()
			{
				let sent = new MQSent(), {where: wh, sahalar} = sent
				sent.fisHareket('muhfis', 'muhhar')
				wh.fisSilindiEkle()
				if (ozelIsaretBakilirmi)
					wh.add(`fis.ozelisaret <> '*'`)
				wh.basiSonu(tarihBS, 'fis.tarih')
				wh.basiSonu(sec_muhHesapKod, 'har.hesapkod')
				sahalar.add(...[
					'har.hesapkod muhHesapKod',
					`0 hiz_borc`,
					`0 hiz_alacak`,
					`SUM(case when har.ba = 'B' then har.bedel else 0 end) muh_borc`,
					`SUM(case when har.ba = 'A' then har.bedel else 0 end) muh_alacak`
				])
				sent.groupByOlustur()
				uni.add(sent)
			}
			let stm = new MQStm(), {with: _with, orderBy} = stm
			_with.add(uni.asTmpTable('onhesap'))
			{
				let sent = stm.sent = new MQSent(), {sahalar, having} = sent
				sent.fromAdd('onhesap onh')
					.fromIliski('muhhesap mhes', 'onh.muhHesapKod = mhes.kod')
				sahalar.add(
					'onh.muhHesapKod', 'mhes.aciklama muhHesapAdi',
					...['hiz_borc', 'hiz_alacak', 'muh_borc', 'muh_alacak']
							.map(alias => `SUM(onh.${alias}) ${alias}`)
				)
				sent.groupByOlustur()
				having.add(new MQOrClause([
					`SUM(onh.hiz_borc) <> SUM(onh.muh_borc)`,
					`SUM(onh.hiz_alacak) <> SUM(onh.muh_alacak)`
				]))
			}
			orderBy.add('muhHesapKod')
			recs = await this.sqlExecSelect(stm)
			for (let rec of recs) {
				for (let prefix of ['hiz', 'muh']) {
					let borc = rec[`${prefix}_borc`], alacak = rec[`${prefix}_alacak`]
					rec[`${prefix}_bakiye`] = roundToBedelFra(borc - alacak)
				}
				rec.bakiye = rec.muh_bakiye - rec.hiz_bakiye
			}
		}
		return recs ?? []
	}
}
