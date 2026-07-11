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
	static get secimSinif() { return DonemselSecimler }
	static get sadeceTanimmi() { return false }
	static get bulFormKullanilirmi() { return true }
	static get kolonDuzenlemeYapilirmi() { return true }
	static get kolonFiltreKullanilirmi() { return false }
	static get seviyeAcKapatKullanilirmi() { return true }
	static get tumKolonlarGosterilirmi() { return true }
	// static get vioAdim() { return 'MH-R' }

	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		let { liste: l } = sec
		deleteKeys(l, 'instKod', 'instAdi')
		sec
			.addKA('must', DMQCari)
			.addKA('plasiyer', DMQPlasiyer)
		deleteKeys(l, 'mustAdi', 'plasiyerAdi')
	}
	static islemTuslariDuzenle_listeEkrani({ sender: gridPart, liste, part: { ekSagButonIdSet: sagSet } }) {
		super.islemTuslariDuzenle_listeEkrani(...arguments)
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
			if (!v && k == 'bakiye')
				v = r._bakiye
			res.push(
				v
					? v < 0 ? 'firebrick' : 'forestgreen'
					: 'lightgray'
			)
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let { kademeler } = Yaslandirma
		liste.push(
			...MQCogul.getKAKolonlar(
				new GridKolon({ belirtec: 'mustKod', text: 'Müşteri', genislikCh: 13 }).input(),
				new GridKolon({ belirtec: 'mustUnvan', text: 'Ünvan', genislikCh: 45 }).input()
			),
			...MQCogul.getKAKolonlar(
				new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 16 }).checkedList(),
				new GridKolon({ belirtec: 'ilAdi', text: 'İl Adı', genislikCh: 13 }).checkedList()
			),
			new GridKolon({ belirtec: 'bakiye', text: 'Bakiye', genislikCh: 15 }).input().tipDecimal_bedel(),
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
				new GridKolon({ belirtec: 'plasiyerAdi', text: 'Plas. Adı', genislikCh: 45 }).input()
			)
		)
	}
	static async loadServerDataDogrudan({ gridPart, secimler: sec, wsArgs = {} }) {
		let { plasiyerKod: { value: plasiyerKod } } = sec
		let { mustKod: { value: mustKod } } = sec
		if (!(isArray(plasiyerKod) && plasiyerKod.length == 1))
			plasiyerKod = null
		if (!(isArray(mustKod) && mustKod.length == 1))
			mustKod = null
		
		let data = {
			plasiyer: app.wsPlasiyerIcinCariler({ plasiyerKod, mustKod }),
			kapanmayanHesap: app.wsTicKapanmayanHesap({ plasiyerKod, mustKod }),
			cariEkstre: app.wsTicCariEkstre({ plasiyerKod, mustKod })
			//cariEkstre_detay: app.wsTicCariEkstre_icerik({ plasiyerKod, mustKod })
		}
		for (let [k, v] of entries(data))
			data[k] = await v

		let k2m = gridPart.key2MustBilgi = {}
		let { kapanmayanHesap, cariEkstre } = data
		;{
			;kapanmayanHesap.forEach(rec => {
				let k = MustBilgi.getKey(rec)
				let m = k2m[k] ??= new MustBilgi({ rec })
				m.kapanmayanHesap.push(rec)
			})
			;cariEkstre.forEach(rec => {
				let k = MustBilgi.getKey(rec)
				let m = k2m[k] ??= new MustBilgi({ rec })
				m.cariEkstre.push(rec)
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
		
		return recs
	}
	static async gridVeriYuklendi({ gridPart } = {}) {
		await super.gridVeriYuklendi(...arguments)
		let { boundRecs: recs } = gridPart
	}
}
