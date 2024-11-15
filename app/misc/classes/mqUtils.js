class MQHesnaStok extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { const {resimlimi} = this; return `HESNA-STOK${resimlimi == null ? '' : `-${resimlimi ? 'RESIMLI' : 'RESIMSIZ'}`}` }
	static get sinifAdi() { const {resimlimi} = this; return `Hesna Ürünler${resimlimi == null ? '' : ` (${resimlimi ? 'Resimli' : 'Resimsiz'})`}` }
	static get table() { return 'stkmst' } static get tableAlias() { return 'stk' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(
			new GridKolon({ belirtec: 'grupkod', text: 'Grup', genislikCh: 15, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'grupadi', text: 'Grup Adı', genislikCh: 30, filterType: 'checkedlist', sql: 'grp.aciklama' }),
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 13, filterType: 'checkedlist', sql: 'grp.anagrupkod' }), new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 25, filterType: 'checkedlist', sql: 'agrp.aciklama' }),
			new GridKolon({ belirtec: 'sistgrupkod', text: 'İst. Grup', genislikCh: 15, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'sistgrupadi', text: 'İst. Grup Adı', genislikCh: 30, filterType: 'checkedlist', sql: 'sigrp.aciklama' }),
			new GridKolon({ belirtec: 'resim', text: 'Resim', genislikCh: 50, filterable: false, sortable: false, groupable: false, exportable: false }).noSql()
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this;
		sent.stok2GrupBagla(e).stokGrup2AnaGrupBagla().stok2IstGrupBagla(e); sent.where.add(`${alias}.silindi = ''`, `${alias}.satilamazfl = ''`)
	}
	static async loadServerDataDogrudan(e) {
		let recs = await super.loadServerDataDogrudan(e); if (!recs) { return recs }
		let _rootDirYapi = (await app.wsStokResimParam())?.rootDirs?.stok, webRootDir = _rootDirYapi?.web || _rootDirYapi.ftp || _rootDirYapi.yerel;
		let rootDirYapi = {}; for (const key of ['ftp', 'yerel']) { let value = _rootDirYapi?.[key]; if (value) { rootDirYapi[key] = value } }
		if (!$.isEmptyObject(rootDirYapi)) {
			const {resimlimi} = this; let dir = Object.values(rootDirYapi)[0], args = { dir, pattern: '*.*', recursive: true, includeDirs: false, minSize: 5000 * 1024 };
			let {recs: files} = await app.wsDosyaListe({ args }) ?? {}, kodSet = asSet(files?.map(file => file?.name?.split('.')?.slice(0, -1)?.join('.')?.trim()) ?? []);
			recs = recs.filter(({ kod }) => resimlimi ? kodSet[kod] : !kodSet[kod]); if (resimlimi !== false) {
				for (let rec of recs) {
					let resimAnaBolum = webRootDir, {kod} = rec; if (!kod) { continue } let url = app.getWSUrl({ api: 'resimData', args: { resimAnaBolum: webRootDir, kod } });
					rec.resim = `<div class="full-wh" onclick="openNewWindow('${url}')" style="background-image: url(${url})">`
				}
			}
		}
		return recs
	}
}
class MQHesnaStok_Resimli extends MQHesnaStok {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get resimlimi() { return true }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); $.extend(e.args, { rowsHeight: 200 }) }
}
class MQHesnaStok_Resimsiz extends MQHesnaStok { static { window[this.name] = this; this._key2Class[this.name] = this } static get resimlimi() { return false } }
