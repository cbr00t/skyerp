class MQFirewall extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporKullanilirmi() { return false }
	static get kodListeTipi() { return 'FIREWALL' } static get sinifAdi() { return 'Firewall' }
	static get kodKullanilirmi() { return false } static get kodSaha() { return 'name' } static get adiSaha() { return 'name' }
	static get adiEtiket() { return 'Kural Adı' }
	static get tumKolonlarGosterilirmi() { return true } static get defaultDirection() { return 'in' }
	get name() { return this.aciklama } set name(value) { this.aciklama = value }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); delete pTanim.kod;
		$.extend(pTanim, {
			direction: new PInstTekSecim('direction', MQFirewall_Direction),
			action: new PInstTekSecim('action', MQFirewall_Action),
			enabled: new PInstTrue('enabled'), ip: new PInstStr('ip')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		// sec.secimTopluEkle({ ruleName: new SecimOzellik({ etiket: 'Kural Adı' }) })
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {adiEtiket} = this;
		let {sender, inst, rootBuilder: rfb, tanimFormBuilder: tanimForm, kaForm} = e;
		$.extend(kaForm, {
			builders: kaForm.builders.filter(({ id }) => id != 'aciklama'),
			id2Builder: null
		});
		kaForm.yanYana();
		kaForm.addModelKullan('aciklama', adiEtiket).dropDown().noMF().kodsuz().bosKodEklenmez()
			.addStyle(`$elementCSS { max-width: 600px !important }`)
			.setSource(({ builder: { rootPart: { parentPart: gridPart } } }) =>
				Object.keys(asSet(gridPart.boundRecs.map(rec => rec.name))).sort()
					.map(aciklama => ({ kod: aciklama, aciklama }))
			);
		kaForm.addCheckBox('enabled', 'Aktif?').readOnly().addStyle(`$elementCSS { margin: 35px 0 0 20px !important }`);
		let form = tanimForm.addFormWithParent(); form.addTextInput('ip', 'IP');
			form.addModelKullan('direction', 'Yön').disable().dropDown().noMF().kodsuz().bosKodEklenmez().listedenSecilmez().setSource(MQFirewall_Direction.kaListe);
			form.addModelKullan('action', 'Eylem').disable().dropDown().noMF().kodsuz().bosKodEklenmez().listedenSecilmez().setSource(MQFirewall_Action.kaListe)
	}
	static ekCSSDuzenle({ dataField: belirtec, value, rec, result }) {
		value = value?.toLowerCase?.();
		if (rec.enabled === false) { result.push('bg-lightgray', 'iptal') }
		switch (belirtec) {
			case 'action': {
				result.push('bold');
				/*if (value == 'deny') { result.push('firebrick') }
				else if (value == 'allow') { result.push('lightgreen') }*/
				break
			}
			case 'direction': {
				result.push('bold');
				/*if (value == 'inbound') { result.push('forestgreen') }
				else if (value == 'outbound') { result.push('orangered') }*/
				break
			}
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {kodSaha} = this;
		{
			let colDefs = liste.filter(colDef => colDef.belirtec == kodSaha);
			if (colDefs) { colDefs.forEach(colDef => colDef.hidden()) }
		}
		liste.push(
			new GridKolon({ belirtec: 'name', text: 'Kural Adı', genislikCh: 50, filterType: 'checkedlist' }).hidden(),
			new GridKolon({ belirtec: 'ip', text: 'IP', genislikCh: 50 }),
			new GridKolon({ belirtec: 'direction', text: 'Yön', genislikCh: 13, filterType: 'checkedlist' }).tipTekSecim(MQFirewall_Direction).kodsuz().alignCenter(),
			new GridKolon({ belirtec: 'action', text: 'Eylem', genislikCh: 13, filterType: 'checkedlist' }).tipTekSecim(MQFirewall_Action).kodsuz().alignCenter(),
			new GridKolon({ belirtec: 'enabled', text: 'Aktif?', genislikCh: 10, filterType: 'checkedlist' }).tipBool()
		)
	}
	static async loadServerDataDogrudan({ secimler }) {
		let {value: name} = secimler.instAdi, {defaultDirection: direction} = this;
		let name2Rule = await this.wsFirewall_show({ direction, name }); if (name2Rule == null) { return [] }
		let recs = []; for (let [name, rule] of Object.entries(name2Rule)) {
			let {ipList} = rule; if (!ipList?.length) { continue }
			for (let ip of ipList) { recs.push({ name, ...rule, ip }) }
		}
		return recs
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments);
		$.extend(args, { groupsExpandedByDefault: true })
	}
	static gridVeriYuklendi({ sender: gridPart }) {
		super.gridVeriYuklendi(...arguments); let {grid} = gridPart;
		grid.jqxGrid('groups', ['name'])
	}
	async degistir(eskiInst) {
		await eskiInst.sil();
		return await this.yaz()
	}
	yaz(e) {
		let {aciklama: name, enabled, direction, action, ip} = this;
		direction = direction?.char ?? direction; action = action?.char ?? action;
		let data = { name, enabled, direction, action, add: [ip] };
		showProgress(); return this.class.wsFirewall_update({ data })
			.finally(() => hideProgress())
	}
	sil(e) {
		let {aciklama: name, enabled, direction, action, ip} = this;
		direction = direction?.char ?? direction; action = action?.char ?? action;
		let data = { name, enabled, direction, action, remove: [ip] };
		showProgress(); return this.class.wsFirewall_update({ data })
			.finally(() => hideProgress())
	}
	tekilOku({ _rec: rec }) { return rec }
	keySetValues({ rec }) {
		super.keySetValues(...arguments); let {name: aciklama, ip} = rec;
		$.extend(this, { aciklama, ip })
	}

	static wsFirewall_update(e) { return this.wsFirewall_x({ ...e, api: 'update' }) }
	static wsFirewall_show(e) { return this.wsFirewall_x({ ...e, api: 'show' }) }
	static async wsFirewall_x(e) {
		e = e || {}; let data = e.data ?? e.args ?? {}, {api} = e;
		for (let key of ['api', 'data', 'args']) { delete e[key] }
		data = typeof data == 'object' && !$.isEmptyObject(data) ? toJSONStr(data) : null;
		let timeout = 13_000, ajaxContentType = wsContentTypeVeCharSet, processData = false;
		let wsPath = 'ws/firewall', args = e;
		return ajaxPost({
			timeout, processData, ajaxContentType, data,
			url: app.getWSUrl({ wsPath, api, args })
		})
	}
}

class MQFirewall_Direction extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'inbound' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(
			new CKodVeAdi(['inbound', '<span class=forestgreen>Gelen</span>', 'gelenmi']),
			new CKodVeAdi(['outbound', '<span class=firebrick>Giden</span>', 'gidenmi'])
		)
	}
}
class MQFirewall_Action extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'deny' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(
			new CKodVeAdi(['deny', '<span class=orangered>RED</span>', 'redmi']),
			new CKodVeAdi(['allow', '<span class=forestgreen>Kabul</span>', 'kabulmu'])
		)
	}
}
