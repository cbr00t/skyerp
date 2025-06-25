class MQHesnaStok extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { const {resimlimi} = this; return `STOK_${resimlimi == null ? '' : `${resimlimi ? 'RESIMLI' : 'RESIMSIZ'}`}` }
	static get sinifAdi() { const {resimlimi} = this; return `Hesna Ürünler${resimlimi == null ? '' : ` (${resimlimi ? 'Resimli' : 'Resimsiz'})`}` }
	static get table() { return 'stkmst' } static get tableAlias() { return 'stk' }
	static secimlerDuzenle({ secimler: sec }) {
		let {tableAlias: alias} = this;
		/* sec.grupTopluEkle([ { kod: 'genel', etiket: 'Genel', kapali: false } ]); */
		sec
			.addKA('grup', MQHesnaStokGrup, `${alias}.grupkod`, 'grp.aciklama')
			.addKA('anaGrup', MQHesnaStokAnaGrup, 'grp.anagrupkod', 'agrp.aciklama')
			.addKA('istGrup', MQHesnaStokIstGrup, `${alias}.sistgrupkod`, 'sigrp.aciklama')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {resimlimi} = this;
		if (resimlimi) { liste.push(new GridKolon({ belirtec: 'resim', text: 'Resim', genislikCh: 50, filterable: false, sortable: false, groupable: false, exportable: false }).noSql()) }
		liste.push(
			new GridKolon({ belirtec: 'grupkod', text: 'Grup', genislikCh: 10, filterable: false }), new GridKolon({ belirtec: 'grupadi', text: 'Grup Adı', genislikCh: 20, filterable: false, sql: 'grp.aciklama' }),
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10, filterable: false, sql: 'grp.anagrupkod' }), new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 20, filterable: false, sql: 'agrp.aciklama' }),
			new GridKolon({ belirtec: 'sistgrupkod', text: 'İst. Grup', genislikCh: 10, filterable: false }), new GridKolon({ belirtec: 'sistgrupadi', text: 'İst. Grup Adı', genislikCh: 20, filterable: false, sql: 'sigrp.aciklama' })
		);
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments); let {tableAlias: alias} = this, {where: wh} = sent;
		sent.stok2GrupBagla().stokGrup2AnaGrupBagla().stok2IstGrupBagla();
		wh.add(`${alias}.silindi = ''`, `${alias}.satilamazfl = ''`)
	}
	static async loadServerDataDogrudan(e) {
		let recs = await super.loadServerDataDogrudan(e); if (!recs) { return recs }
		let _rootDirYapi = (await app.wsStokResimParam())?.rootDirs?.stok;
		let rootDirYapi = {}, baseUrl = qs.url || qs.dir || qs.rootDir; if (baseUrl) { rootDirYapi.base = baseUrl }
		for (let key of ['base', 'ftp', 'yerel']) {
			let value = _rootDirYapi?.[key];
			if (value) { rootDirYapi[key] = value }
		}
		let webRootDir = _rootDirYapi?.web || _rootDirYapi?.base || _rootDirYapi?.ftp || _rootDirYapi?.yerel;
		if (!$.isEmptyObject(rootDirYapi)) {
			let {resimlimi} = this, dir = Object.values(rootDirYapi)[0], args = { dir, pattern: '*.*', recursive: true, includeDirs: false, minSize: 500 };
			let {recs: files} = await app.wsDosyaListe({ session: null, hostName: config.class.DefaultWSHostName_SkyServer, ssl: true, args }) ?? {};
			let kodSet = asSet(files?.map(file => file?.name?.split('.')?.slice(0, -1)?.join('.')?.trim()) ?? []);
			recs = recs.filter(({ kod }) => resimlimi ? kodSet[kod] : !kodSet[kod]); if (resimlimi !== false) {
				for (let rec of recs) {
					let {kod} = rec; if (!kod) { continue }
					let url = app.getWSUrl({
						session: null, hostName: config.class.DefaultWSHostName_SkyServer, ssl: true,
						api: 'resimData', args: { resimAnaBolum: webRootDir, kod }
					});
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


class MQHesnaStokGrup extends MQStokGrup {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
}
class MQHesnaStokAnaGrup extends MQStokAnaGrup {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
}
class MQHesnaStokIstGrup extends MQStokIstGrup {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
}
