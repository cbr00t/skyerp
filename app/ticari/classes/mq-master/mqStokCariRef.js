class MQStokCariRef extends MQDetayliMaster {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOKCARIREF' } static get sinifAdi() { return 'Stok-Cari Referans' }
	static get table() { return 'pzmusturunfis' } static get tableAlias() { return 'fis' }
	static get detaySinif() { return MQStokCariRefDetay } static get gridKontrolcuSinif() { return MQStokCariRefGridci }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); $.extend(pTanim, {
			devreDisimi: new PInstBool('devredisi'),
			mustKod: new PInstStr('mustkod')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); sec.secimTopluEkle({
			devreDisiSecim: new SecimTekSecim({ text: `Çalışma Durumu`, tekSecimSinif: AktifVeDevreDisi }),
			mustKod: new SecimString({ text: 'Cari', mfSinif: MQCari }), mustUnvan: new SecimOzellik({ text: 'Cari Ünvan' })
		}).whereBlockEkle(({ where: wh, secimler: sec }) => {
			const {aliasVeNokta: avn} = this;
			wh.add(sec.devreDisiSecim.tekSecim.getTersBoolClause(`${avn}devredisi`))
			  .basiSonu(sec.mustKod, `${avn}mustkod`).ozellik(sec.mustUnvan, 'car.birunvan')
		})
	}
	static rootFormBuilderDuzenle({ sender: tanimPart, inst, rootBuilder: rfb, tanimFormBuilder: tanimForm }) {
		super.rootFormBuilderDuzenle(...arguments); const {kaForm} = tanimForm.id2Builder;
		/*rfb.addStyle(() =>`$elementCSS [data-builder-id = 'grid-parent'] { height: calc(var(--full) - 130px) !important }`); */
		kaForm?.id2Builder?.aciklama?.setVisibleKosulu('jqx-hidden');
		let form = tanimForm.addFormWithParent().yanYana().addStyle(() => `$elementCSS { margin-top: -5px !important }`); form.addCheckBox('devreDisimi', 'Devre Dışı?');
		form.addModelKullan('mustKod', 'Müşteri').setMFSinif(MQCari).setPlaceholder('Müşteri').comboBox().autoBind().etiketGosterim_yok()
	}
	static ekCSSDuzenle({ rec, dataField: belirtec, result }) {
		super.ekCSSDuzenle(...arguments);
		if (rec.devredisi) { result.push('bg-lightgray', 'iptal') }
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); liste.push(...[
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 20 }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 60, sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'devredisi', text: 'DevreDışı?', genislikCh: 10 }).tipBool()
		])
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments); const {aliasVeNokta: avn} = this;
		sent.fromIliski('carmst car', `${avn}mustkod = car.must`).add(`${avn}devredisi`)
	}
	/** Object.values(await MQStokCariRef.getMustKod2Bilgiler(mustKodOrArray))[0]?.[stokKodOrArray] */
	static getMustKod2Bilgiler(e, _stokKodListe) {
		e = e ?? {}; const mustKodListe = $.makeArray(typeof e == 'object' && !$.isArray(e) ? e.mustKod ?? e.mustKodListe : e);
		const stokKodListe = $.makeArray(typeof e == 'object' &&  !$.isArray(e) ? e.stokKod ?? e.stokKodListe : _stokKodListe);
		let {table, detayTable} = this, sent = new MQSent({
			where: `fis.devredisi = ''`,
			sahalar: ['fis.mustkod mustKod', 'har.seq', 'har.stokkod stokKod', 'har.refkod refKod', 'har.refadi refAdi', 'har.urundurumu urunDurumu']
		}), {where: wh} = sent; sent.fisHareket(table, detayTable);
		if (mustKodListe?.length) { wh.inDizi(mustKodListe, 'fis.mustkod') }
		if (stokKodListe?.length) { wh.inDizi(stokKodListe, 'har.stokkod') }
		return app.sqlExecSelect(sent).then(recs => {
			const result = {}; for (const rec of recs) {
				const {mustKod, stokKod} = rec, stok2Rec = (result[mustKod] = result[mustKod] ?? {});
				stok2Rec[stokKod] = rec
			}
			return result
		})
	}
}
class MQStokCariRefDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'pzmusturundetay' }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); $.extend(pTanim, {
			urunDurumu: new PInstStr('urundurumu'), stokKod: new PInstStr('stokkod'),
			refKod: new PInstStr('refkod'), refAdi: new PInstStr('refadi')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); liste.push(...[
			new GridKolon({ belirtec: 'stokkod', text: 'Stok', genislikCh: 18 }),
			new GridKolon({ belirtec: 'stokadi', text: 'Stok Adı', genislikCh: 50, sql: 'stk.aciklama' }),
			new GridKolon({ belirtec: 'refkod', text: 'Ref. Kod', genislikCh: 18 }),
			new GridKolon({ belirtec: 'refadi', text: 'Ref. Adı', genislikCh: 40 })
		])
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments); const {aliasVeNokta: avn} = this;
		sent.fromIliski('stkmst stk', `${avn}stokkod = stk.kod`).add(`${avn}urundurumu`)
	}
}
class MQStokCariRefGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ara({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ara(...arguments); tabloKolonlari.push(...[
			...MQStok.getGridKolonlar({ belirtec: 'stok' }),
			new GridKolon({ belirtec: 'refKod', text: 'Ref. Kod', genislikCh: 18 }),
			new GridKolon({ belirtec: 'refAdi', text: 'Ref. Adı', genislikCh: 40 })
			/* new GridKolon({ belirtec: 'urunDurumu', text: 'Ürün Durumu', genislikCh: 10 }) */
		])
	}
}
