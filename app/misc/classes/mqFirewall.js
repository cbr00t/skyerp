class MQFirewall extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporKullanilirmi() { return false }
	static get kodListeTipi() { return 'FIREWALL' } static get sinifAdi() { return 'Firewall' }
	static get kodKullanilirmi() { return false } static get adiSaha() { return 'name' } static get adiEtiket() { return 'Kural Adı' }
	static get tumKolonlarGosterilirmi() { return true } static get defaultDirection() { return 'in' }
	get name() { return this.aciklama } set name(value) { this.aciklama = value }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); delete pTanim.kod;
		$.extend(pTanim, {
			direction: new PInstStr('direction', MQFirewall_Direction),
			action: new PInstTekSecim('action', MQFirewall_Action),
			enabled: new PInstTrue('enabled'), ip: new PInstStr('ip')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		// sec.secimTopluEkle({ ruleName: new SecimOzellik({ etiket: 'Kural Adı' }) })
	}
	static rootFormBuilderDuzenle({ sender, inst, rootBuilder: rfb, tanimFormBuilder: tanimForm }) {
		super.rootFormBuilderDuzenle(...arguments);
		let form = tanimForm.addFormWithParent();
		form.addCheckBox('enabled', 'Aktif?'); form.addTextInput('ip', 'IP');
		form.addModelKullan('direction', 'Yön').dropDown().noMF().kodsuz().listedenSecilmez().setSource(MQFirewall_Direction.kaListe);
		form.addModelKullan('action', 'Eylem').dropDown().noMF().kodsuz().listedenSecilmez().setSource(MQFirewall_Action.kaListe)
	}
	static ekCSSDuzenle({ dataField: belirtec, value, rec, result }) {
		value = value?.toLowerCase?.();
		if (rec.enabled === false) { result.add('bg-lightgray', 'iptal') }
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
		super.orjBaslikListesiDuzenle(...arguments); let {adiSaha} = this;
		{
			let colDef = liste.find(colDef => colDef.belirtec == adiSaha);
			if (colDef) { colDef.hidden() }
		}
		liste.push(
			new GridKolon({ belirtec: 'ip', text: 'IP', genislikCh: 50 }),
			new GridKolon({ belirtec: 'direction', text: 'Yön', genislikCh: 13 }).tipTekSecim(MQFirewall_Direction).kodsuz().alignCenter(),
			new GridKolon({ belirtec: 'action', text: 'Eylem', genislikCh: 13 }).tipTekSecim(MQFirewall_Action).kodsuz().alignCenter(),
			new GridKolon({ belirtec: 'enabled', text: 'Aktif?', genislikCh: 10 }).tipBool()
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
	tekilOku({ _rec: rec }) { return rec }
	setValues({ rec }) { super.setValues(...arguments) }

	static wsFirewall_update(e) { return this.wsFirewall_x({ ...e, api: 'update' }) }
	static wsFirewall_show(e) { return this.wsFirewall_x({ ...e, api: 'show' }) }
	static async wsFirewall_x(e) {
		e = e || {}; let data = e.data ?? e.args ?? {}, {api} = e;
		for (let key of ['api', 'data', 'args']) { delete e[key] }
		data ||= null; if (typeof data == 'object') { data = toJSONStr(data) }
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
	static get defaultChar() { return 'in' }
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
