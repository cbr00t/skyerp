class MQYaslandirmaEk_Base extends DMQCogul {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'YASL_KH' }
	static get aciklama() { return 'Kapanmayan Hesaplar' }
	static get tanimUISinif() { return null }
	static get secimSinif() { return null }
	static get sadeceTanimmi() { return false }
	static get bulFormKullanilirmi() { return true }
	static get kolonDuzenlemeYapilirmi() { return true }
	static get kolonFiltreKullanilirmi() { return false }
	static get seviyeAcKapatKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return true }
	// static get vioAdim() { return 'MH-R' }
	static get dataKey() { return null }

	static islemTuslariDuzenle_listeEkrani({ sender: gridPart, liste, part: { ekSagButonIdSet: sagSet } }) {
		super.islemTuslariDuzenle_listeEkrani(...arguments)
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e)
		let { sender: gridPart, rootBuilder: rfb, layout } = e
		let { islemTuslari, parentRec: rec = {} } = gridPart
		let { mustKod, mustUnvan } = rec
		let fbd_islemTuslari = rfb.addForm('islemTuslari')
			.setLayout(islemTuslari)
		;{
			let parent = fbd_islemTuslari.addForm('sol')
				.setLayout(islemTuslari.children('.sol'))
				.addCSS('flex-row')
			let form = e.fbd_ekBilgi = parent.addForm('ekBilgi')
				.setLayout(({ builder: fbd, builder: { id }, ...rest }) => $([
					`<div class="${id} full-wh flex-row" style="gap: 30px">`,
						( mustKod ? new CKodVeAdi([mustKod, mustUnvan]).parantezliOzet({ styled: true }) : null ),
						...this.getEkBilgiHTML({ ...e, builder: fbd, id, ...rest, gridPart, rec }),
					`</div>`
				].filter(Boolean).join('\n')))
				.addStyle_fullWH('calc(var(--full) - 300px)')
				.addCSS('fs-120 bold royalblue')
				.addStyle(`$elementCSS { margin: 5px 0 0 20px }`)
		}
		
	}
	static async orjBaslikListesi_gridInit({ sender: gridPart } = {}) {
		await super.orjBaslikListesi_gridInit(...arguments)
	}
	static orjBaslikListesi_argsDuzenle({ sender: gridPart, args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		gridPart.tekil()
		extend(args, { showStatusBar: true, showAggregates: true, showGroupAggregates: true })
	}
	static orjBaslikListesi_groupsDuzenle({ liste }) {
		super.orjBaslikListesi_groupsDuzenle(...arguments)
		liste.push('takipadi')
	}
	static ekCSSDuzenle({ dataField: k, value: v, rec: r, result: res }) {
		super.ekCSSDuzenle(...arguments)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 14 }).checkedList().date(),
			...MQCogul.getKAKolonlar(
				new GridKolon({ belirtec: 'isladi', text: 'İşlem Adı', genislikCh: 25 }).checkedList(),
				new GridKolon({ belirtec: 'belgeNox', text: 'Belge No', genislikCh: 18 }).input()
			),
			new GridKolon({ belirtec: 'vade', text: 'Vade', genislikCh: 14 }).checkedList().date()
		)
	}
	static orjBaslikDuzenleSonrasi({ liste }) {
		super.orjBaslikDuzenleSonrasi(...arguments)
		liste.push(
			...MQCogul.getKAKolonlar(
				new GridKolon({ belirtec: 'takipno', text: 'Takip No', genislikCh: 16 }).checkedList(),
				new GridKolon({ belirtec: 'takipadi', text: 'Takip Adı', genislikCh: 25 }).checkedList()
			)
		)
	}
	static async loadServerDataDogrudan({ gridPart }) {
		let { _recs: recs } = gridPart
		recs = recs?.toReversed()
		return recs
	}
	static async gridVeriYuklendi({ gridPart } = {}) {
		await super.gridVeriYuklendi(...arguments)
		// let { boundRecs: recs } = gridPart
	}
	static getEkBilgiHTML({ gridPart, rec }) {
		return []
	}
}

class MQKapanmayanHesap extends MQYaslandirmaEk_Base {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'KAPHES' }
	static get sinifAdi() { return 'Kapanmayan Hesaplar' }
	static get dataKey() { return 'kapanmayanHesap' }

	static ekCSSDuzenle({ dataField: k, value: v, rec: r, result: res }) {
		super.ekCSSDuzenle(...arguments)
		switch (k) {
			case 'bedel': {
				res.push(
					v
						? v < 0 ? 'firebrick' : 'royalblue'
						: 'lightgray'
				)
				break
			}
			case 'acikkisim': {
				res.push(
					'fs-110', 'bold',
					v
						? v < 0 ? 'forestgreen' : 'orangered'
						: 'lightgray'
				)
				break
			}
			case 'gecikmegun': {
				res.push(
					v
						? v < 0 ? 'forestgreen' : 'firebrick bold'
						: 'lightgray'
				)
				break
			}
			case 'gelecekgun': {
				res.push(
					v
						? v < 0 ? 'firebrick' : 'forestgreen'
						: 'lightgray'
				)
				break
			}
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'bedel', text: 'Orj Bedel', genislikCh: 16 }).input().sum().bedel(),
			new GridKolon({ belirtec: 'acikkisim', text: 'Açık Kısım', genislikCh: 15 }).input().sum().bedel(),
			new GridKolon({ belirtec: 'gecikmegun', text: 'Gecikme', genislikCh: 10 }).input().sum().number(),
			new GridKolon({ belirtec: 'gelecekgun', text: 'Gelecek', genislikCh: 10 }).input().sum().number()
		)
	}
	static getEkBilgiHTML({ gridPart, rec: { dengesizmi } }) {
		return [
			...super.getEkBilgiHTML(...arguments),
			( dengesizmi ? `<div class="fs-120 bold firebrick">!!</div>` : null )
		].filter(Boolean)
	}
}

class MQCariEkstre extends MQYaslandirmaEk_Base {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'CARIEKSTRE' }
	static get sinifAdi() { return 'Cari Ekstre' }
	static get dataKey() { return 'cariEkstre' }

	static ekCSSDuzenle({ dataField: k, value: v, rec: r, result: res }) {
		super.ekCSSDuzenle(...arguments)
		switch (k) {
			case 'borcbedel':
			case 'alacakbedel':
			case 'bedel': {
				res.push(
					'fs-110', 'bold',
					v
						? v < 0 ? 'firebrick' : 'forestgreen'
						: 'lightgray'
				)
				break
			}
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			//new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 16 }).input().sum().bedel(),
			//new GridKolon({ belirtec: 'ba', text: 'B/A', genislikCh: 5 }).checkedList().center(),
			new GridKolon({ belirtec: 'borcbedel', text: 'Borç Bedel', genislikCh: 16 }).input().sum().bedel(),
			new GridKolon({ belirtec: 'alacakbedel', text: 'Alacak Bedel', genislikCh: 16 }).input().sum().bedel(),
			new GridKolon({ belirtec: 'bedel', text: 'Bakiye', genislikCh: 16 }).input().sum().bedel()
		)
	}
}