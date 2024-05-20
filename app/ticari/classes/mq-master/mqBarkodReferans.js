class MQBarkodReferans extends MQKod {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() {return 'Barkod Referans' }
	static get table() { return 'sbarref' }
	static get kodSaha() { return 'refkod' }
	static get kodEtiket() { return 'Barkod' }
	static get tableAlias() { return 'ref' }
	static get kodListeTipi() { return 'BARREF' }

	get refKod() { return this.kod }
	set refKod(value) { this.kod = value }

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			stokKod: new PInstStr('stokkod'),
			varsayilanmi: new PInstBool('varsayilan')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		const tanimForm = e.tanimFormBuilder;
		const form = tanimForm.addFormWithParent();
		form.addModelKullan({ id: 'stokKod', etiket: 'Stok', mfSinif: MQStok }).etiketGosterim_normal().comboBox();
		form.addCheckBox({ id: 'varsayilanmi', etiket: 'Varsayılan?' })
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.secimTopluEkle({
			stokKod: new SecimString({ mfSinif: MQStok }),
			stokAdi: new SecimOzellik({ etiket: 'Stok Adı' }),
			varsayilanmi: new SecimBool({ etiket: 'Sadece Varsayılanlar' })
		});
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const wh = e.where, secimler = e.secimler;
			wh.basiSonu(sec.stokKod, `${aliasVeNokta}stokkod`);
			wh.ozellik(sec.stokAdi, `stk.aciklama`);
			if (sec.varsayilanmi.value)
				wh.add(`${aliasVeNokta}varsayilan <> ''`)
		})
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e);
		const {liste} = e;
		liste.push(/*'refkod',*/ 'stokkod', 'stokadi', 'varsayilan')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const {liste} = e;
		liste.push(
			// new GridKolon({ belirtec: 'refkod', text: 'Barkod', genislikCh: 15 }),
			new GridKolon({ belirtec: 'stokkod', text: 'Stok', genislikCh: 18 }),
			new GridKolon({ belirtec: 'stokadi', text: 'Stok Adı', genislikCh: 30, sql: 'stk.aciklama' }),
			new GridKolon({ belirtec: 'varsayilan', text: 'Varsayılan?', genislikCh: 8 }).tipBool()
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.fromIliski(`stkmst stk`, `${aliasVeNokta}stokkod = stk.kod`)
	}
}
