class MQStokYer extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Stok Yer' }
	static get table() { return 'stkyer' }
	static get tableAlias() { return 'yer' }
	
	
	constructor(e) {
		e = e || {};
		super(e);
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			subeKod: new PInstStr('bizsubekod')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);

		this.formBuilder_addTabPanelWithGenelTab(e);
		const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent();
		form.addModelKullan({ id: 'subeKod', etiket: 'Şube', mfSinif: MQSube }).dropDown()
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);
		
		const {secimler} = e;
		secimler.grupTopluEkle([
			{ kod: 'sube', aciklama: 'Şube', kapalimi: true, /*, renk: '#555', zeminRenk: 'lightgreen'*/ }
		]);
		secimler.secimTopluEkle({
			subeKod: new SecimBasSon({ mfSinif: MQSube, grupKod: 'sube' }),
			subeAdi: new SecimOzellik({ etiket: 'Şube Adı', grupKod: 'sube' })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			where.basiSonu(secimler.subeKod, `yer.bizsubekod`);
			where.ozellik(secimler.subeAdi, `sub.aciklama`);
		});
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'bizsubekod', text: 'Şube', genislikCh: 8 }),
			new GridKolon({ belirtec: 'subeadi', text: 'Şube Adı', genislikCh: 15, sql: 'sub.aciklama' })
		);
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.fromIliski('isyeri sub', 'yer.bizsubekod = sub.kod');
	}
	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e);

		/*const {aliasVeNokta} = this;
		const {sent} = e;*/
	}

	static async getVarsayilanYerRec(e) {
		const {globals} = this;
		let result = globals.varsayilanYerRec;
		if (result === undefined)
			result = globals.varsayilanYerRec = await this.getVarsayilanYerRecDogrudan(e)
		return result
	}
	static getVarsayilanYerRecDogrudan(e) {
		let sent = new MQSent({
			from: 'elterparam par',
			fromIliskiler: [{ from: 'stkyer yer', iliski: 'par.ticariyerkod = yer.kod' }],
			where: `par.bizsubekod = ''`,
			sahalar: ['par.ticariyerkod kod', 'yer.aciklama', 'yer.bizsubekod']
		});
		return app.sqlExecTekil(sent)
	}
}
