class MQHareketKarti extends DMQCogul {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'HARKART' }
	static get sinifAdi() { return 'Hareket Kartı' }
	static get tanimUISinif() { return null }
	static get secimSinif() { return null }
	static get sadeceTanimmi() { return false }
	static get bulFormKullanilirmi() { return true }
	static get kolonDuzenlemeYapilirmi() { return true }
	static get kolonFiltreKullanilirmi() { return false }
	static get seviyeAcKapatKullanilirmi() { return true }
	static get tumKolonlarGosterilirmi() { return true }

	static islemTuslariDuzenle_listeEkrani({ sender: gridPart, liste, part: { ekSagButonIdSet: sagSet } }) {
		super.islemTuslariDuzenle_listeEkrani(...arguments)
		/*let items = [
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
		extend(sagSet, asSet(items.map(r => r.id)))*/
	}
	static async orjBaslikListesi_gridInit({ sender: gridPart } = {}) {
		await super.orjBaslikListesi_gridInit(...arguments)
	}
	static orjBaslikListesi_argsDuzenle({ sender: gridPart, args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		//gridPart.tekil()
		extend(args, {
			showStatusBar: true, showAggregates: true, showGroupAggregates: true
			// selectionMode: 'multiplerowsextended', rowsHeight: 48
		})
	}
	static orjBaslikListesi_groupsDuzenle({ liste }) {
		super.orjBaslikListesi_groupsDuzenle(...arguments)
	}
	static ekCSSDuzenle({ dataField: k, value: v, rec: r, result: res }) {
		super.ekCSSDuzenle(...arguments)
		if (k == 'bakiye' || k == 'bedel' || k == 'borcbedel' || k == 'alacakbedel') {
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
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		/*liste.push(
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 14 }).checkedList().date(),
			...MQCogul.getKAKolonlar(
				new GridKolon({ belirtec: 'isladi', text: 'İşlem Adı', genislikCh: 30 }).checkedList(),
				new GridKolon({ belirtec: 'belgeNox', text: 'Belge No', genislikCh: 18 }).input()
			),
			...MQCogul.getKAKolonlar(
				new GridKolon({ belirtec: 'refkod', text: 'Ref. Kod', genislikCh: 16 }).checkedList(),
				new GridKolon({ belirtec: 'refadi', text: 'Referans Adı', genislikCh: 30 }).checkedList()
			),
			new GridKolon({ belirtec: 'vade', text: 'Vade', genislikCh: 14 }).checkedList().date()
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 18 }).input().bedel(),
			new GridKolon({ belirtec: 'ba', text: 'B/A', genislikCh: 5 }).checkedList()
		)*/
	}
	static async loadServerDataDogrudan(e = {}) {
		let { gridPart, wsArgs = {} } = e
		let { getRecs } = gridPart
		return await getFuncValue.call(this, getRecs, e) ?? []
	}
	static async gridVeriYuklendi(e = {}) {
		await super.gridVeriYuklendi(e)
		let { gridPart } = e
		let { getColDefs } = gridPart
		;{
			let liste = await getFuncValue.call(this, getColDefs, e)
			if (liste)
				gridPart.updateColumns(liste)
		}
	}
	static orjBaslikListesi_satirCiftTiklandi({ event: { args = {} } }) {
		let { row: { bounddata: rec } = {} } = args
	}
}
