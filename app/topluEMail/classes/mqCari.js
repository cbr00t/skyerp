class MQCari extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Toplu e-Mail: Cari Listesi' } static get table() { return 'carmst' } static get tableAlias() { return 'car' }
	static get kodSaha() { return 'must' } static get adiSaha() { return 'birunvan' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return true }
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({ eMail: new SecimOzellik({ etiket: 'e-Mail' }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta, sayacSaha} = this, wh = e.where, sec = e.secimler;
			wh.ozellik(sec.eMail, `${aliasVeNokta}email`)
		})
	}
	static standartGorunumListesiDuzenle(e) { const {liste} = e, {orjBaslikListesi} = this; liste.push(...orjBaslikListesi.map(colDef => colDef.belirtec)) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(new GridKolon({ belirtec: 'email', text: 'e-Mail', genislikCh: 60 }))
	}
	static orjBaslikListesi_argsDuzenle(e) { $.extend(e.args, { rowsHeight: 40, showFilterRow: true, selectionMode: 'checkbox' })}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {stm, sent, aliasVeNokta} = e, {detayTable} = this;
		sent.where.add(`${aliasVeNokta}silindi = ''`, `${aliasVeNokta}calismadurumu <> ''`, `${aliasVeNokta}email <> ''`)
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); const rfb = e.rootBuilder;
		this.fbd_listeEkrani_addButton(rfb, 'topluEMailGonder', 'Toplu e-Mail Gönder', 180, e => this.topluEMailGonderIstendi(e))
	}
	static async topluEMailGonderIstendi(e) {
		const {sinifAdi} = this, {builder} = e, inst = e.inst = builder.inst = e.inst ?? builder.inst ?? {}, part = e.part ?? builder.rootPart, {grid, gridWidget, selectedRecs} = part;
		/* if ($.isEmptyObject(selectedRecs)) { hConfirm('e-Mail Gönderimi yapılacak cariler seçilmelidir', sinifAdi); return }*/
		$.extend(e, { grid, gridWidget, recs: selectedRecs });
		const eMailRecs = Object.keys(asSet(selectedRecs.map(rec => rec.email))).filter(x => !!x?.trim() && x.length > 2 && x.includes('@')).map(x => ({ email: x }));
		$.extend(inst, { eMailRecs }); const {params} = app, {mailVT, mailOrtak} = params, mailParam = inst.mailParam = {};
		const keys = ['from', 'smtpServer', 'port', 'ssl', 'user', 'pass'], paramList = []; if (mailVT?.user) { paramList.push(mailVT) } paramList.push(mailOrtak);
		for (const param of paramList) {
			if (!param) continue; for (const key of keys) {
				if (mailParam[key] !== undefined) continue
				const value = param[key]; if (value !== undefined) { mailParam[key] = value }
			}
		} 
		let content = $(`<div/>`); const rfb = new RootFormBuilder({ id: 'root', layout: content, inst }).addStyle_fullWH().onAfterRun(e => {
			const {layout} = e.builder, content = layout;
			setTimeout(() => layout.find(`[data-builder-id = 'mesaj'] > textarea`).focus(), 10)
		});
		let disForm = rfb; disForm.addCSS('flex-row').addStyle(e => [`
			$elementCSS { --sag-width: 30% }
			$elementCSS > .formBuilder-element { height: calc(var(--full) - 13px) !important }
			$elementCSS > [data-builder-id = 'sol'] { width: calc(var(--full) - (var(--sag-width) + 15px)) !important }
			$elementCSS > [data-builder-id = 'sag'] { min-width: 0 !important; width: var(--sag-width) !important }
			$elementCSS textarea { width: var(--full) !important; height: var(--full) !important }
		`]);
		let solForm = disForm.addFormWithParent('sol').altAlta(), sagForm = disForm.addFormWithParent('sag').altAlta();
		solForm.addTextInput('from', 'Gönderici').setAltInst(e => e.builder.inst.mailParam).onAfterRun(e => e.builder.input.attr('readonly', ''));
		/*let innerForm = solForm.addFormWithParent().yanYana();*/ solForm.addTextInput('cc', 'CC'); solForm.addTextInput('konu', 'Konu');
		solForm.addTextArea('mesaj', 'Mesaj').addStyle_wh(null, 'calc(var(--full) - 260px)');
		sagForm.addGridliGiris('emails', 'e-Mail Adresleri').addStyle_fullWH().rowNumberOlmasin().setSource(eMailRecs)
			.widgetArgsDuzenleIslemi(e => $.extend(e.args, { columnsHeight: 25, showGroupsHeader: false }))
			.setTabloKolonlari(e => [ new GridKolon({ belirtec: 'email', text: 'e-Mail' }) ]);
		/* `<h4>Mesaj</h4><textarea id="mesaj"></textarea>` */
		let promise = new $.Deferred();
		const wnd = createJQXWindow({
			content, title: 'e-Mail Mesaj İçeriği',
			buttons: { 'GÖNDER': e => { if (!inst.mesaj) { hConfirm('Mesaj boş olamaz', sinifAdi); return } e.close(); promise.resolve({ inst }) }, 'VAZGEÇ': e => { e.close() } },
			args: { width: '90%', height: '85%' }
		}); wnd.addClass('topluEMailGonder part'); wnd.find('div > .buttons > :eq(0)').jqxButton({ template: 'success' }); rfb.run();
		await promise; if (!inst.mesaj) { return } inst.emails = inst.eMailRecs.filter(rec => !!rec.email).map(rec => rec.email?.trim()); delete inst.eMailRecs;
		showProgress(`<b class="royalblue">${inst.emails.length} adet</b> Toplu e-Mail Gönderimi yapılıyor...`, sinifAdi, true);
		try {
			const result = await this.topluEMailGonder(e); if (!result) throw ({ isError: true, rc: 'unknownError', errorText: `e-Mail Gönderimi başarısız` })
			if (window.progressManager) { setTimeout(() => { progressManager.text = 'Toplu e-Mail Gönderimi bitti'; progressManager.progressEnd(); progressManager.hideImg() }, 300) }
		}
		catch (ex) { if (window.progressManager) setTimeout(() => hideProgress(), 500); hConfirm(getErrorText(ex), sinifAdi); throw ex }
	}
	static async topluEMailGonder(e) {
		const {inst} = e, emails = Object.keys(asSet(inst.emails.map(x => x.trim()).filter(x => !!x))); if ($.isEmptyObject(emails)) return false
		const {recs} = e, {konu, mesaj} = inst, ccListe = inst.cc ? Object.keys(asSet(inst.cc.split(';').map(x => x.trim()).filter(x => !!x))) : [];
		const email2Rec = {}; for (const rec of recs) { const email = rec.email?.trim(); if (email) email2Rec[email] = email2Rec[email] ?? rec }
		const errorsSet = {}, BlockSize = 5, WaitTimeMS_Katsayi = 1.5, {mailParam} = inst; let waitTimeMS = 500, i = 0, promises = [];
		for (const email of emails) {
			const rec = email2Rec[email] || {}, {must, birunvan} = rec; if (!email) continue
			const _mesaj = mesaj.replaceAll('\n', '<br/>\n').replaceAll(`[MUST]`, must).replaceAll(`[BIRUNVAN]`, birunvan);
			const wsArgs_data = { to: email, cc: ccListe, subject: konu, body: _mesaj, html: true };
			for (const key of ['from', 'smtpServer', 'port', 'ssl', 'user', 'pass']) { const value = mailParam[key]; if (value !== undefined) { wsArgs_data[key] = value } }
			const wsArgs = { data: wsArgs_data }; promises.push(app.wsEMailGonder(wsArgs).always(() => progressManager?.progressStep()));
			i++; if (promises.length && BlockSize && (i % (BlockSize + 1)) == BlockSize) {
				try { await Promise.all(promises) } catch (ex) { errorsSet[getErrorText(ex)] = true } promises = []
				waitTimeMS = roundToFra((waitTimeMS || 1) * WaitTimeMS_Katsayi, 2); if (waitTimeMS) { await new $.Deferred(p => setTimeout(p.resolve(), waitTimeMS)) }
			}
		}
		if (promises.length) { try { await Promise.all(promises) } catch (ex) { errorsSet[getErrorText(ex)] = true } promises = [] }
		if (!$.isEmptyObject(errorsSet)) { throw { isError: true, rc: 'topluEMailGonderim', errorText: `Bazı e-mail adresilerine gönderim başarısız.<p/><ul>${Object.keys(errorsSet).map(x => `<li color="darkred">${x}</li>`)}</ul>` } }
		return true
	}
}
