class MQEIslVKNRef extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return ModelTanimPart }
	static get sinifAdi() { return 'e-İşlem VKN Referansı' }
	static get kodListeTipi() { return 'EISLVKNREF' }
	static get table() { return 'efvergi2cari' }
	static get tableAlias() { return 'vref' }
	static get kodSaha() { return 'vkno' }

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			vkn: new PInstStr('vkno'),
			mustKod: new PInstStr('mustkod')
		})
	}

	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e);

		const tanimForm = e.tanimFormBuilder;
		let form = tanimForm.addFormWithParent();
		form.addTextInput({ id: 'vkn', etiket: 'VKN/TCKN' });
		form.addModelKullan({ id: 'mustKod', mfSinif: MQCari }).comboBox()
	}

	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);

		const {secimler} = e;
		secimler.secimTopluEkle({
			vkn: new SecimOzellik({ etiket: 'VKN' }),
			mustKod: new SecimString({ etiket: MQCari.sinifAdi, mfSinif: MQCari }),
			mustUnvan: new SecimOzellik({ etiket: 'Cari Ünvan' })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const sec = e.secimler;
			const wh = e.where;
			wh.ozellik(sec.vkn, `${aliasVeNokta}vkno`);
			wh.basiSonu(sec.mustKod, `${aliasVeNokta}mustkod`);
			wh.ozellik(sec.mustUnvan, `car.birunvan`)
		})
	}

	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e);
		
		const {liste} = e;
		liste.push('vkno', 'mustkod', 'mustunvan')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'vkno', text: 'VKN/TCKN', genislikCh: 13 }),
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 16 }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 36, sql: 'car.birunvan' })
		)
	}
	
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.fromIliski('carmst car', `${aliasVeNokta}mustkod = car.must`)
		// sent.where.addAll(`${aliasVeNokta}silindi = ''`)
	}
	
	keyHostVarsDuzenle(e) {
		super.keyHostVarsDuzenle(e);
		
		const {hv} = e;
		hv.vkno = this.vkn
	}
	keySetValues(e) {
		super.keySetValues(e);
		const {rec} = e;
		this.vkn = rec.vkno
	}

	static getVKN2Must_yoksaOlustur(e) {
		e = e || {};
		return this.getVKN2Must($.extend({}, e, { yoksaOlustur: true }))
	}
	static async getVKN2Must(e) {
		e = e || {};
		const yoksaOlusturFlag = coalesce(e.yoksaOlustur, e.yoksaOlusturFlag);
		const _vknListe = e.vknListe || e.liste || [];
		const vknSet = asSet(_vknListe);

		const caches = this._vkn2Must = this._vkn2Must || {};
		let result = {};
		for (const vkn of Object.keys(vknSet)) {
			const mustKod = caches[vkn];
			if (mustKod !== undefined) {
				result[vkn] = mustKod;
				delete vknSet[vkn]
			}
		}
		if ($.isEmptyObject(vknSet))
			return result

		let sent = new MQSent({
			from: 'efvergi2cari',
			where: { inDizi: Object.keys(vknSet), saha: 'vkno' },
			sahalar: ['vkno', 'mustkod']
		});
		let recs = await app.sqlExecSelect(sent);
		for (const rec of recs) {
			const vkn = rec.vkno;
			const mustKod = rec.mustkod;
			result[vkn] = caches[vkn] = mustKod;
			delete vknSet[vkn]
		}
		if (!yoksaOlusturFlag || $.isEmptyObject(vknSet))
			return result

		// vkn kaldı ve yoksaOlusturFlag ise
		sent = new MQSent({
			from: 'carmst',
			where: { inDizi: Object.keys(vknSet), saha: `(case when sahismi = '' then vnumara else tckimlikno end)` },
			sahalar: ['vkno', 'must']
		});
		let hvListe = [];
		recs = await app.sqlExecSelect(sent);
		for (const rec of recs) {
			const vkn = rec.vkno;
			const mustKod = rec.must;
			result[vkn] = caches[vkn] = mustKod;
			delete vknSet[vkn];
			hvListe.push({ vkno: vkn, mustkod: mustKod })
		}
		if (!$.isEmptyObject(hvListe))
			await app.sqlExecNone(new MQInsert({ table: 'efvergi2cari', hvListe: hvListe }))
		return result
	}

	uygunDetay(e) {
		const {detaylar} = this;
		if ($.isEmptyObject(detaylar))
			return null
		
		for (const det of detaylar) {
			if (det.uygunmu(e))
				return null
		}
		
		return null
	}
}
