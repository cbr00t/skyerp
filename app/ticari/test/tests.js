class Ticari_TestBase extends TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get rootTip() { return Ticari_RunnableBase.rootTip }
	static get DefaultWSHost() { return Ticari_RunnableBase.DefaultWSHost } static get DefaultWSPath() { return Ticari_RunnableBase.DefaultWSPath } static get DefaultLoginTipi() { return Ticari_RunnableBase.DefaultLoginTipi }
	runInternal(e) { super.runInternal(e) /*; const {tip} = this.class; this.callback({ message: 'in test', tip })*/ }
}
class TicariTest_TrnListTest extends Ticari_TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return 'trnList' }
	constructor(e) { e = e || {}; super(e); Object.assign(this, { delayMS: e.delay ?? e.delayMS, showTableFlag: e.showTable ?? e.withTable }) }
	async runInternal(e) {
		await super.runInternal(e); const {showTableFlag} = this, {tip} = this.class, delayMS = this.delayMS ?? 500;
		console.debug('test', tip, 'başladı'); let result;
		try {
			await this.wsLogin(e); result = await this.ajaxGet({ api: 'sqlTrnList' }); if (!Object.keys(result).length) { result = undefined }
			if (result) { if (showTableFlag) { console.table(result) } else { console.info(result) } }
		}
		catch (ex) { console.error('test', tip, getErrorText(ex, this.wsURLBase)) }
		if (delayMS) { await new Promise((resolve, reject) => setTimeout(() => resolve(), delayMS)) }
		console.debug('test', tip, 'bitti'); return result
	}
	delay(value) { this.delayMS = value; return this }
	withTable() { this.showTableFlag = true; return this } noTable() { this.showTableFlag = false; return this }
}
class TicariTest_SatFat_TopluKayitOlustur extends Ticari_TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return 'satFat-topluKayitAc' }
	static get fisSinif() { return SatisFaturaFis } static get baslikAciklama() { return 'KAYIT TEST' }
	constructor(e) { e = e || {}; super(e); Object.assign(this, { trnFlag: e.trn ?? e.trnFlag, unvanLike: e.unvanLike ?? 'MEMDUH' }) }
	async runInternal(e) {
		await super.runInternal(e); await this.wsLogin(e); const {iterCount, trnFlag, unvanLike} = this, {tip, fisSinif, baslikAciklama} = this.class;
		console.debug('test', tip, 'başladı');
		let sent = new MQSent({ from: 'carmst', where: { like: `*${unvanLike}*`, saha: 'unvan1' }, sahalar: 'RTRIM(must) kod' }); let mustKod = await app.sqlExecTekilDeger(sent);
		e.proc = async _e => {
			const {trnId} = _e, e = { trnId };
			let result; for (let i = 0; i < (iterCount || 1); i++) { let fis = new fisSinif({ mustKod, baslikAciklama }); result = await fis.disKaydetIslemi(e) }
			return true
		};
		const trnResult = await (trnFlag ? app.sqlTrnDo(e) : e.proc(e)); console.debug('test', tip, 'bitti'); return trnResult
	}
	withTrn() { this.trnFlag = true; return this } noTrn() { this.trnFlag = false; return this }
	setUnvanLike(value) { this.unvanLike = value; return this }
}
class TicariTest_SatFat_TopluKayitSil extends Ticari_TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return 'satFat-topluKayitAc' } static get olusturClass() { return Ticari_SatFat_TopluKayitOlustur }
	constructor(e) { e = e || {}; super(e); Object.assign(this, { trnFlag: e.trn ?? e.trnFlag }) }
	async runInternal(e) {
		await super.runInternal(e); await this.wsLogin(e); const {trnFlag} = this, {tip, olusturClass} = this.class, {fisSinif, baslikAciklama} = olusturClass;
		console.debug('test', tip, 'başladı');
		let sent = new MQSent({ from: fisSinif.table, where: { degerAta: baslikAciklama, saha: 'cariaciklama' }, sahalar: 'kaysayac' });
		let sayacListe = (await app.sqlExecSelect(sent)).map(rec => asInteger(rec.kaysayac));
		e.proc = async _e => {
			const {trnId} = _e, e = { trnId };
			let result; for (const sayac of sayacListe) { let fis = new fisSinif({ sayac }); result = await fis.sil(e) }
			return true
		};
		const trnResult = await (trnFlag ? app.sqlTrnDo(e) : e.proc(e)); console.debug('test', tip, 'bitti'); return trnResult
	}
	withTrn() { this.trnFlag = true; return this } noTrn() { return this.trnFlag = false; return this }
}
class TicariTest_OzelComboBox1 extends Ticari_TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return this.partName } static get partName() { return 'ozelComboBox1' }
	constructor(e) {
		e = e || {}; super(e); const kolonTanimlari = e.kolonTanimlari ?? MQKA.orjBaslikListesi, {source, parent, layout} = e;
		const width = e.width || '98%', height = e.height ?? 40, kodAttr = e.kodAttr ?? e.kodSaha ?? MQKA.kodSaha, adiAttr = e.adiAttr ?? e.adiSaha ?? MQKA.adiSaha;
		$.extend(this, { parent, layout, kolonTanimlari, source, width, height, kodAttr, adiAttr });
		if (!this.source) {
			/*this.source = e => ['item 1', 'S02', 'ÖZER DURMAZ', 'MEMDUH DURMAZ']*/
			this.source = e => app.sqlExecSelect(`select top 500 kod, aciklama, grupkod from stkmst where kod <> '' and silindi = '' and satilamazfl = ''`)
		}
	}
	async runInternal(e) {
		await app.promise_ready; await super.runInternal(e); 
		return await new $.Deferred(p => setTimeout(async e => p.resolve(await this.runInternalDevam(e)), 10, e))
	}
	runInternalDevam(e) {
		const {tip, partName} = this.class, {width, height, source, kodAttr, adiAttr} = this, parent = e.parent ?? app.content;
		console.debug('test', tip, 'başladı', this); app.content.children().remove();
		let layout = e.layout ?? parent.children('#widget'); if (!layout?.length) { layout = $(`<div id="widget"/>`); layout.appendTo(parent) }
		this.layout = layout; layout.jqxComboBox({
			theme, width, height, multiSelect: true, remoteAutoComplete: true, remoteAutoCompleteDelay: 200, minLength: 2, enableBrowserBoundsDetection: true,
			valueMember: kodAttr, displayMember: adiAttr, searchMode: 'containsignorecase',
			search: text => { const {widget} = this; if (widget) { widget.source.dataBind(); if (!widget.isOpened()) { widget.open() } } },
			renderSelectedItem: (index, wItem) => this.widget.getSelectedItems().length > 5 ? wItem.value : wItem.label,
			renderer: (index, aciklama, kod) => { return `<b>${kod}</b> <span>${aciklama}</span>` },
			source: new $.jqx.dataAdapter({ datatype: wsDataType, url: `${webRoot}/empty.json` }, {
				autoBind: true, cache: true, async: false, loadServerData: async (_source, wsArgs, callback) => {
					const {widget} = this, searchText = widget?.input?.val()?.trim(), _e = { ...e, wsArgs, searchText }; let records = (await getFuncValue.call(this, source, e)) || [];
					if (records?.length) {
						if (searchText) {
							let matches; matches = value => {
								if (typeof value == 'object') { const rec = value; for (const key in rec) { if (matches(rec[key])) { return true } } return false }
								if (value != null) {
									value = value.toString().trim(); if (!value) { return false } const valueUpper = value.toUpperCase();
									const searchTextUpper = searchText.toUpperCase(), tokens = searchTextUpper.split(' ').filter(x => !!x?.trim());
									let uygunmu = true; for (const token of tokens) { if (!valueUpper.includes(searchTextUpper)) { uygunmu = false; break } } return uygunmu
								}
								return false
							}; records = records.filter(rec => !!matches(rec))
						}
					}
					callback({ totalrecords: records.length, records })
				}
			})
		});
		let widget = this.widget = layout.jqxComboBox('getInstance'); const ddContent = widget.dropdownlistContent;
		makeScrollable(ddContent); ddContent.css('max-height', height);
		widget.input.on('keyup', evt => {
			const key = evt.key?.toLowerCase(), target = evt.currentTarget, {widget} = this;
			if (key == 'enter' || key == 'linefeed') {
				const value = target.value?.trim(); target.value = ''; if (value?.trim()) { widget.addItem(value); widget.selectItem(widget.getItems().slice(-1)[0]) }
				else { widget.dataBind() } widget.input.focus()
			}
		});
		return this
	}
}
class TicariTest_OzelComboBox2 extends Ticari_TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return this.partName } static get partName() { return 'ozelComboBox2' }
	constructor(e) {
		e = e || {}; super(e); const {mfSinif, source, parent, layout} = e;
		const width = e.width || '98%', height = e.height ?? 40, kodAttr = e.kodAttr ?? e.kodSaha ?? MQKA.kodSaha, adiAttr = e.adiAttr ?? e.adiSaha ?? MQKA.adiSaha;
		$.extend(this, { parent, layout, mfSinif, source, width, height, kodAttr, adiAttr });
		if (!this.source) {
			/*this.source = e => ['item 1', 'S02', 'ÖZER DURMAZ', 'MEMDUH DURMAZ']*/
			this.source = e => app.sqlExecSelect(`select top 500 kod, aciklama, grupkod from stkmst where kod <> '' and silindi = '' and satilamazfl = ''`)
		}
	}
	async runInternal(e) {
		await app.promise_ready; await super.runInternal(e); 
		return await new $.Deferred(p => setTimeout(async e => p.resolve(await this.runInternalDevam(e)), 10, e))
	}
	runInternalDevam(e) {
		const {tip, partName} = this.class, {width, height, mfSinif, source, kodAttr, adiAttr} = this, parent = e.parent ?? app.content;
		console.debug('test', tip, 'başladı', this); app.content.children().remove();
		let layout = e.layout ?? parent.children('#widget'); if (!layout?.length) { layout = $(`<div id="widget"/>`); layout.appendTo(parent) }
		let part = this.part = new ModelKullanPart({ layout, width, height, mfSinif, source, kodAttr, adiAttr }).comboBox().coklu(); part.run();
		return app._activePartStack.push(this)
	}
}
