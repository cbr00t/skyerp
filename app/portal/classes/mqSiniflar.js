class MQVPIl extends MQCariIl {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tumKolonlarGosterilirmi() { return true } static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.class?.adminmi }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.class?.adminmi }
}
class MQVPCari extends MQCari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tumKolonlarGosterilirmi() { return true } static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.class?.adminmi }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.class?.adminmi }
	static async loadServerDataDogrudan(e) { return app.onMuhDBDo(() => super.loadServerDataDogrudan(e)) }
}
class MQVPTahSekli extends MQTahsilSekli {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tumKolonlarGosterilirmi() { return true } static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.class?.adminmi }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.class?.adminmi }
}
class MQPSM extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PSM' } static get sinifAdi() { 'Prog/Set/Modül' }
	static get table() { return 'progsetmodul' } static get tableAlias() { return 'psm' }
	static get tumKolonlarGosterilirmi() { return true } static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.yetkiVarmi('degistir') }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.class?.adminmi }
}
class MQVPAnaBayi extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return true }
	static get kodListeTipi() { return 'ANABAYI' } static get sinifAdi() { return 'Ana Bayi' }
	static get table() { return 'anabayi' } static get tableAlias() { return 'abay' }
	static get tumKolonlarGosterilirmi() { return true } static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.class?.adminmi }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.class?.adminmi }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, { onMuhMustKod: new PInstStr('onmuhmustkod') })
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments);
		let {tableAlias: alias} = this
		sec.grupTopluEkle([ { kod: 'must', etiket: 'Müşteri', kapali: false } ]);
		sec.secimTopluEkle({ mustKod: new SecimString({ etiket: 'Kod', grupKod: 'must' }) });
		sec.whereBlockEkle(({ secimler: sec, sent, where: wh }) => {
			wh.basiSonu(sec.mustKod, `${alias}.onmuhmustkod`)
		})
	}
	static rootFormBuilderDuzenle({ sender, inst, rootBuilder: rfb, tanimFormBuilder: tanimForm }) {
		super.rootFormBuilderDuzenle(...arguments);
		let form = tanimForm.addFormWithParent();
			form.addModelKullan('onMuhMustKod', 'Müşteri').comboBox().autoBind().setMFSinif(MQVPCari)
				.setSource(() => e =>
					MQVPCari.loadServerData({
						...e,
						ozelQueryDuzenle: ({ alias, sent }) => {
							let {sahalar} = sent;
							sent.add(`${alias}.must kod`, `${alias}.birunvan aciklama`)
						}
					})
					/*let sent = e.sent = new MQSent({ from: 'carmst' }), {where: wh, sahalar} = sent;
					wh.add(`silindi = ''`, `calismadurumu <> ''`);
					sahalar.add(`must kod`, `birunvan aciklama`);
					let orderBy = ['kod'], stm = e.stm = new MQStm({ sent, orderBy });
					await MQKA.loadServerData_queryDuzenle({ ...e, kodSaha: 'must', adiSaha: 'birunvan' });
					return await app.sqlExecSelect(stm)*/
				)
				/*.ozelQueryDuzenleHandler(({ stm, aliasVeNokta, mfSinif }) => {
					let {kodSaha} = mfSinif, clauses = { musteri: `${aliasVeNokta}${kodSaha}`, bayi: `${aliasVeNokta}bayikod` };
					for (let sent of stm) {
						let {where: wh} = sent;
						wh.add(`${aliasVeNokta}aktifmi <> ''`);
						MQLogin.current.yetkiClauseDuzenle({ sent, clauses })
					}
				})*/
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {tableAlias: alias} = this;
		liste.push(...[
			new GridKolon({ belirtec: 'onmuhmustkod', text: 'Müşteri', genislikCh: 18 })
			// new GridKolon({ belirtec: 'mustadi', text: 'Müşteri Adı', genislikCh: 50, sql: 'mus.aciklama' })
		].filter(x => !!x))
	}
	static loadServerData_queryDuzenle({ sender, stm, sent, basit, tekilOku, modelKullanmi }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {tableAlias: alias} = this, {where: wh, sahalar} = sent, {alias2Deger} = sent;
		let {current: login} = MQLogin, {musterimi: loginMusterimi} = login?.class;
		let sabitMustKod = (loginMusterimi ? login.kod : qs.mustKod ?? qs.must);
		// sent.fromIliski('musteri mus', `${alias}.mustkod = mus.kod`);
		if (!alias2Deger.onmuhmustkod) { sahalar.add(`${alias}.onmuhmustkod`) }
		if (!basit) {
			// if (sabitMustKod) { wh.degerAta(sabitMustKod, `${alias}.mustkod`) }
			let clauses = { anaBayi: `${alias}.kod` };
			MQLogin.current.yetkiClauseDuzenle({ sent, clauses })
		}
	}
}
