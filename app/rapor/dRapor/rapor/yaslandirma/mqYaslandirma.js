class MQYaslandirma extends DRaporMQ {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return DRapor_DonemselIslemler.oncelik + 10 }
	static get kategoriKod() { return DRapor_DonemselIslemler.kategoriKod }
	static get kategoriAdi() { return DRapor_DonemselIslemler.kategoriAdi }
	static get kod() { return 'YASL' }
	static get aciklama() { return 'Yaşlandırma Analizi' }
	static get uygunmu() { return true }
	get uygunmu() { return this.class.uygunmu }
	static get tanimUISinif() { return null }
	static get secimSinif() { return Secimler }
	static get sadeceTanimmi() { return false }
	static get bulFormKullanilirmi() { return true }
	static get kolonDuzenlemeYapilirmi() { return true }
	static get kolonFiltreKullanilirmi() { return false }
	static get seviyeAcKapatKullanilirmi() { return true }
	static get tumKolonlarGosterilirmi() { return true }
	// static get vioAdim() { return 'MH-R' }

	async onAfterRun({ gridPart }) {
		await super.onAfterRun(...arguments)
		gridPart.secimlerIstendi()
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		let { liste: l } = sec
		deleteKeys(l, 'instKod', 'instAdi')
		;{
			let grupKod = 'genel'
			sec
				.grupEkle({ kod: grupKod, aciklama: 'Genel', kapali: false })
				.secimTopluEkle({
					bakiyesizleriGoster: new SecimBool({ grupKod, etiket: 'Bakiyesizleri de göster' }),
					sadecePlasiyereBagliOlanlar: new SecimBool({ grupKod, etiket: 'Plasiyere bağlı olanlar' }),
					smTipi: new SecimTekSecim({ grupKod, etiket: 'Satıcı/Müşteri', tekSecim: new BuDigerVeHepsi(['Satıcılar', 'Müşteriler']).hepsi() })
				})
		}
		sec
			.addKA('plasiyer', DMQPlasiyer)
			.addKA('must', DMQCari)
			.addKA('cariTip', DMQCariTip)
			.addKA('bolge', DMQCariBolge)
		;{
			let _keys = ['must', 'cariTip', 'plasiyer', 'bolge']
			deleteKeys(l, _keys.map(k => k + 'Adi'))
		}
	}
	static islemTuslariDuzenle_listeEkrani({ sender: gridPart, liste, part: { ekSagButonIdSet: sagSet } }) {
		super.islemTuslariDuzenle_listeEkrani(...arguments)
		let items = [
			{
				id: 'kapanmayanHesap', text: 'KAP. HESAP', handler: e =>
					this.detayGoster({ ...e, mfSinif: MQKapanmayanHesap })
			},
			{
				id: 'cariEkstre', text: 'CARİ EKSTRE.', handler: e =>
					this.detayGoster({ ...e, mfSinif: MQCariEkstre })
			}
		]
		liste.push(...items)
		extend(sagSet, asSet(items.map(r => r.id)))
	}
	static async orjBaslikListesi_gridInit({ sender: gridPart } = {}) {
		await super.orjBaslikListesi_gridInit(...arguments)
	}
	static orjBaslikListesi_argsDuzenle({ sender: gridPart, args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		gridPart.tekil()
		extend(args, {
			showStatusBar: true, showAggregates: true, showGroupAggregates: true,
			selectionMode: 'multiplerowsextended',
			rowsHeight: 48
		})
	}
	static orjBaslikListesi_groupsDuzenle({ liste }) {
		super.orjBaslikListesi_groupsDuzenle(...arguments)
		liste.push('plasiyerAdi', 'ilAdi')
	}
	static ekCSSDuzenle({ dataField: k, value: v, rec: r, result: res }) {
		super.ekCSSDuzenle(...arguments)
		if (k == 'bakiye' || k.startsWith('kademe')) {
			//if (!v && k == 'bakiye')
			//	v = r._bakiye
			res.push(
				v
					? v < 0 ? 'firebrick' : 'forestgreen'
					: 'lightgray'
			)
			if (k == 'bakiye' || k == 'bedel')
				res.push('bold', 'fs-110')
		}
		else if (r.dengesizmi)
			res.push('orangered')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let { kademeler } = Yaslandirma
		liste.push(
			new GridKolon({ belirtec: 'dengesizmi', text: 'Dengesiz?', genislikCh: 9 }).checkedList().bool(),
			...MQCogul.getKAKolonlar(
				new GridKolon({ belirtec: 'mustKod', text: 'Müşteri', genislikCh: 13 }).input(),
				new GridKolon({ belirtec: 'mustUnvan', text: 'Ünvan', genislikCh: 45 }).input()
			),
			...MQCogul.getKAKolonlar(
				new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 16 }).checkedList(),
				new GridKolon({ belirtec: 'ilAdi', text: 'İl Adı', genislikCh: 13 }).checkedList()
			),
			new GridKolon({ belirtec: 'bakiye', text: 'Bakiye', genislikCh: 18 }).input().tipDecimal_bedel(),
			...keys(kademeler).map(i => {
				i = Number(i)
				return new GridKolon({
					belirtec: `kademe${i + 1}Bedel`,
					text: Yaslandirma.getKademeText(i),
					genislikCh: 15
				}).input().tipDecimal_bedel()
			}),
			...MQCogul.getKAKolonlar(
				new GridKolon({ belirtec: 'plasiyerKod', text: 'Plasiyer', genislikCh: 13 }).input(),
				new GridKolon({ belirtec: 'plasiyerAdi', text: 'Plasiyer Adı', genislikCh: 45 }).input()
			)
		)
	}
	static async loadServerDataDogrudan({ gridPart, secimler: sec, wsArgs = {} }) {
		if (!gridPart._triggered) {
			gridPart._triggered = true
			return []
		}

		let { bakiyesizleriGoster: { value: bakiyesizleriGoster } } = sec
		let { sadecePlasiyereBagliOlanlar: { value: sadecePlasiyereBagliOlanlar } } = sec
		let { smTipi } = sec
		let { plasiyerKod: { value: plasiyer } } = sec
		let { mustKod: { value: must } } = sec
		let { cariTipKod: { value: tip } } = sec
		let { bolgeKod: { value: bolge } } = sec

		smTipi = smTipi?.tekSecim ?? smTipi
		smTipi = (
			smTipi?.bumu ? 'S' :
			smTipi?.digermi ? 'M' :
			isString(smTipi) ? smTipi : null
		)
		
		//if (!(isArray(plasiyerKodArr) && plasiyerKodArr.length == 1))
		//	plasiyerKodArr = null
		//if (!(isArray(mustKodArr) && mustKodArr.length == 1))
		//	mustKodArr = null

		let args = {
			sadecePlasiyereBagliOlanlar,
			smTipi,
			filtre: { plasiyer, must, bolge, tip }
		}
		let data = {
			plasiyer: app.wsPlasiyerIcinCariler(args),
			kapanmayanHesap: app.wsTicKapanmayanHesap(args),
			cariEkstre: app.wsTicCariEkstre(args)
			//cariEkstre_detay: app.wsTicCariEkstre_icerik(args)
		}
		for (let [k, v] of entries(data))
			data[k] = await v

		let k2m = gridPart.key2MustBilgi = {}
		let { kapanmayanHesap, cariEkstre } = data
		;{
			;kapanmayanHesap.forEach(rec => {
				let k = MustBilgi.getKey(rec)
				let m = k2m[k] ??= new MustBilgi({ rec })
				if (smTipi == 'S') {
					;['orjbedel', 'acikkisim'].forEach(_k => {
						let v = rec[_k]
						if (v)
							rec[_k] = v = -v
					})
				}
				m.kapanmayanHesap.push(rec)
			})
			;cariEkstre.forEach(r => {
				let k = MustBilgi.getKey(r)
				let m = k2m[k] ??= new MustBilgi({ rec: r })
				;{
					let { bedel, ba, borcbedel: borc, alacakbedel: alacak } = r
					if (borc == null && alacak == null && bedel != null) {
						r.borcbedel = borc = ba == 'B' ? bedel : 0
						r.alacakbedel = alacak = ba == 'A' ? bedel : 0
					}
					r.isaretlibedel = ba == 'A' ? -bedel : bedel
				}
				m.cariEkstre.push(r)
			})
		}

		let recs = values(k2m)
		if (empty(recs))
			return []

		let k2r = extend(
			await DMQCari.getGloKod2Rec(),
			fromEntries(data.plasiyer.map(r =>[r.kod, r]))
		)
		for (let m of recs) {
			let { mustKod: k } = m
			let r = k2r[k]
			if (!r)
				continue

			let { aciklama: mustUnvan = r.birunvan, yore, ilkod: ilKod, iladi: ilAdi, plasiyerKod, plasiyerAdi, oscolor: osColor } = r
			let renk = os2HTMLColor(osColor)
			extend(m, { mustUnvan, yore, ilKod, ilAdi, plasiyerKod, plasiyerAdi, renk })
			await m.init()
		}

		if (!bakiyesizleriGoster)
			recs = recs.filter(r => r.bakiye)
		
		return recs
	}
	static async gridVeriYuklendi({ gridPart } = {}) {
		await super.gridVeriYuklendi(...arguments)
		//let { boundRecs: recs } = gridPart
	}
	static orjBaslikListesi_satirCiftTiklandi({ event: { args = {} } }) {
		let { row: { bounddata: rec } = {} } = args
	}
	
	static detayGoster(e = {}) {
		let { mfSinif, gridPart = e.sender, rec: parentRec } = e
		let { dataKey } = mfSinif ?? {}
		if (!dataKey)
			return
		
		parentRec ??= gridPart.selectedRec
		if (!parentRec)
			return

		let _recs = parentRec[dataKey]
		if (!_recs)
			return

		let args = { parentRec, _recs }
		return mfSinif.listeEkraniAc({ args })
	}
}
