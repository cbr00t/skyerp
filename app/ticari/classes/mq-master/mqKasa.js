class MQKasa extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kodListeTipi() { return 'KASA' } static get zeminRenkDesteklermi() { return true }
	static get sinifAdi() { return 'Kasa' } static get table() { return 'kasmst' } static get tableAlias() { return 'kas' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, {
			aciklama: new PInstStr('aciklama'), dvKod: new PInstStr('dvtipi'), finanAlizKullanilmaz: new PInstBool('finanalizkullanilmaz'),
			subeGecerlilik: new PInstTekSecim('subegecerlilik', SubeGecerlilik), muhHesap: new PInstStr('muhhesap'), calismaDurumu: new PInstBool('calismadurumu')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); let {tanimFormBuilder: tanimForm} = e;
		let form = tanimForm.addFormWithParent().yanYana(4); form.addTextInput('aciklama', 'Açıklama').setMaxlength(100);
			form.addModelKullan('dvKod', 'Döviz').setMFSinif(MQDoviz).dropDown().kodsuz().autoBind();
			form.addModelKullan('subeGecerlilik', 'Şube Geçerlilik').setSource(({ builder: fbd }) => fbd.inst.subeGecerlilik.kaListe).dropDown().kodsuz();
			form.addModelKullan('muhHesap', 'Muhasebe Kodu').setMFSinif(MQMuhHesap).dropDown().kodsuz();
			form.addCheckBox('finanAlizKullanilmaz', 'Finansal Analizlerde Gösterilir');
			form.addCheckBox('calismaDurumu', 'Aktif Durumda(Kullanılıyor)')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, {liste} = e; liste.push(
			new GridKolon({ belirtec: 'kod', text: 'Kod', genislikCh: 10 }),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 50 }),
			new GridKolon({ belirtec: 'dvtipi', text: 'Döviz Tipi', genislikCh: 10 }),
			new GridKolon({ belirtec: 'bizsubekod', text: 'BizSubeKod', genislikCh: 10 }),
			new GridKolon({ belirtec: 'muhhesap', text: 'Muh Hesap', genislikCh: 10 }),
			new GridKolon({ belirtec: 'finanalizkullanilmaz', text: 'Finansal Kullanılmaz', genislikCh: 10 }).tipBool(),
			new GridKolon({ belirtec: 'subegecerlilik', text: 'Şube Geçerlilik', genislikCh: 10, sql: SubeGecerlilik.getClause(`${alias}subegecerlilik`) })
		)
	}
	static async kasaKod2DvKur(e) {
		e = e || {}; const kasaKod = typeof e == 'object' ? e.kasaKod ?? e.kod : e; if (!kasaKod) { return null }
		const {globals} = this, cache = globals.kasaKod2DvKur = globals.kasaKod2DvKur || {};
		let result = cache[kasaKod]; if (result === undefined) { result = globals.kasaKod2DvKur[kasaKod] = await this.kasaKod2DvKurDogrudan(e) }
		return result
	}
	static async kasaKod2DvKurDogrudan(e) {
		e = e || {}; const dvKod = await this.kasaKod2DvKod(e);
		return dvKod == null ? dvKod : (await MQDoviz.dvKod2Kur(dvKod))
	}
	static async kasaKod2DvKod(e) {
		e = e || {}; const kasaKod = typeof e == 'object' ? e.kasaKod ?? e.kod : e; if (!kasaKod) { return null }
		const {globals} = this;
		const cache = globals.kasaKod2DvKod = globals.kasaKod2DvKod || {};
		let result = cache[kasaKod]; if (result === undefined) { result = globals.kasaKod2DvKod[kasaKod] = await this.kasaKod2DvKodDogrudan(e) }
		return result
	}
	static async kasaKod2DvKodDogrudan(e) {
		e = e || {}; const kasaKod = typeof e == 'object' ? e.kasaKod ?? e.kod : e; if (!kasaKod) { return null }
		let sent = new MQSent({  top: 1, from: this.table, where: { degerAta: kasaKod, saha: 'kod' }, sahalar: ['dvtipi dvkod'] });
		return await app.sqlExecTekilDeger(sent) ?? null
	}
}
