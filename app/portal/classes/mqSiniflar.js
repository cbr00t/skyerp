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
	static async loadServerDataDogrudan(e) { return app.onMuhDBDo_polen(() => super.loadServerDataDogrudan(e)) }
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
		extend(pTanim, { onMuhMustKod: new PInstStr('onmuhmustkod') })
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

class MQVPAltMusteri extends MQCogul {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'ALTMUST' }
	static get sinifAdi() { return 'Alt Müşteri' }
	static get table() { return 'altmusteri' }
	static get tableAlias() { return 'amus' }
	static get idSaha() { return 'mustid' }
	static get adiSaha() { return 'vkn' }
	static get tanimUISinif() { return MQKA.tanimUISinif }
	static get tumKolonlarGosterilirmi() { return false }
	static get kolonFiltreKullanilirmi() { return false }
	static get uygunmu() { return true }
	static get altMusterimi() { return true }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			mustId: new PInstGuid('mustid'),
			vkn: new PInstStr('vkn'),
			aciklama: new PInstStr('aciklama')
		})
	}
	static async rootFormBuilderDuzenle(e) {
		await super.rootFormBuilderDuzenle(e)
		let { inst, tanimFormBuilder: tanimForm } = e
		let { mustId } = inst
		let mustKod = mustId ? await MQLogin_Musteri.gloId2Kod(mustId) ?? '' : ''
		;{
			let form = tanimForm.addFormWithParent().altAlta()
			form.addSimpleComboBox('mustKod', 'Müşteri', 'Müşteri')
				.etiketGosterim_yok()
				.setMFSinif(MQLogin_Musteri)
				.autoBind()
				.setValue(mustKod)
				.degisince(async ({ type, builder: { altInst: inst }, events }) => {
					if (type == 'batch') {
						let { value } = events.at(-1)
						inst.mustId = await MQLogin_Musteri.gloKod2Id(value)
					}
				})
				.onAfterRun(({ builder: { part } }) =>
					delay(5).then(() => part.focus()))
				.addStyle(`$elementCSS { max-width: 800px !important }`)
		}
		;{
			let form = tanimForm.addFormWithParent().yanYana()
			form.addTextInput('vkn', 'VKN')
				.etiketGosterim_yok()
				.setPlaceholder('VKN')
				.setMaxLength(11)
				.addCSS('center')
				.addStyle_wh(150)
			form.addTextInput('aciklama', 'Açıklama')
				.etiketGosterim_yok()
				.setPlaceholder('Açıklama')
				.setMaxLength(80)
				.addStyle(`$elementCSS { max-width: calc(800px - 140px) !important }`)
		}
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		extend(args, { groupsExpandedByDefault: true })
	}
	static orjBaslikListesi_groupsDuzenle({ sender: gridPart, liste }) {
		super.orjBaslikListesi_groupsDuzenle(...arguments)
		//liste.push('mustunvan')
	}
	static standartGorunumListesiDuzenle({ liste }) {
		super.standartGorunumListesiDuzenle(...arguments)
		liste.push('mustunvan', 'vkn', 'aciklama')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(...[
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'mustid', text: 'Must ID', genislikCh: 50 }).noSql(),
				new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri', genislikCh: 40 }).noSql().checkedList()
			),
			new GridKolon({ belirtec: 'vkn', text: 'VKN', genislikCh: 15 }).noSql().checkedList(),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 50 }).checkedList()
		])
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent, basit, tekilOku }) {
		super.loadServerData_queryDuzenle(...arguments)
		let { tableAlias: alias, kodSaha } = this
		let { where: wh, sahalar } = sent, { orderBy } = stm
		//basit ||= tekilOku
		
		sent.innerJoin(alias, `${MQLogin_Musteri.table} mus`, `${alias}.mustid = mus.id`)
		if (!basit) {
			;{
				let { current: login } = MQLogin
				let clauses = { bayi: 'mus.bayikod', musteri: 'mus.kod' }
				login.yetkiClauseDuzenle({ sent, clauses })
			}
			sahalar.addWithAlias('mus', 'aciklama mustunvan')
			if (!empty(orderBy.liste))
				orderBy.add('mustunvan', 'vkn')
		}
		sahalar.addWithAlias(alias, 'mustid', 'vkn')
		sahalar.addWithAlias('mus', 'kod mustkod')
	}
	static keyHostVarsDuzenle({ hv }) {
		super.keyHostVarsDuzenle(...arguments)
		let { mustId: mustid, vkn } = this
		extend(hv, { mustid, vkn })
	}
	static keySetValues({ rec }) {
		super.keySetValues(...arguments)
		let { mustid: mustId, vkn } = this
		extend(this, { mustId, vkn })
	}
	async dataDuzgunmu(e) {
		let { mustId, vkn } = this
		if (!mustId)
			return `<b class="royalblue">Müşteri</b> belirtilmelidir`
		if (!await MQLogin_Musteri.gloId2Kod(mustId))
			return `<b class="royalblue">Müşteri</b> kodu belirlenemedi`
		
		if (!vkn)
			return `<b class="royalblue">VKN</b> belirtilmelidir`
		if (!between(vkn.length, 10, 11))
			return `<b class="royalblue">VKN</b> değeri <b class="firebrick">10-11</b> hane arası olmalıdır`
		
		if (!VergiVeyaTCKimlik.uygunmu(vkn))
			return `<b class="royalblue">VKN</b> değeri hatalıdır`
		
		return await super.dataDuzgunmu(e)
	}

	static async must2Recs(e = {}) {
		let isObj = isObject(e)
		let kod = isObj ? e.mustKod ?? e.kod : e
		let ozelQueryDuzenle = ({ alias, sent }) =>
			this.mustSentBagla({ ...e, alias, sent, kod, sahalarAlinir: false })
		
		let wh = kod ? { degerAta: kod, saha: 'mus.kod' } : null
		let res = {}
		;( await this.loadServerData({ ...e, ozelQueryDuzenle }) ?? [] ).forEach(r => {
			( res[r.mustkod] ??= [] )
				.push(r)
		})
		
		return res
	}
	static mustSentBagla({ alias, sent, mustKod, sahalarAlinir }) {
		alias ||= this.tableAlias
		let { from, where: wh } = sent
		let alsMus = ['mus', 'car'].find(v =>
			from.aliasIcinTable('mus') ? v : null)
		if (!alsMus) {
			alsMus = 'mus'
			sent.innerJoin(alias, `${alias}.mustid = ${alsMus}.id`)
		}
		if (mustKod)
			wh.degerAta(mustKod, `${alsMus}.kod`)
		if (sahalarAlinir)
			sahalar.addWithAlias(alsMus, 'kod mustkod', 'aciklama mustunvan')
	}
}

