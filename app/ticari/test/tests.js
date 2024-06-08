class Ticari_TestBase extends TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get rootTip() { return Ticari_RunnableBase.rootTip }
	static get DefaultWSHost() { return Ticari_RunnableBase.DefaultWSHost } static get DefaultWSPath() { return Ticari_RunnableBase.DefaultWSPath } static get DefaultLoginTipi() { return Ticari_RunnableBase.DefaultLoginTipi }
	runInternal(e) { super.runInternal(e) /*; const {tip} = this.class; this.callback({ message: 'in test', tip })*/ }
}
class Ticari_TrnListTest extends Ticari_TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return 'trnList' }
	constructor(e) { e = e || {}; super(e); Object.assign(this, { delayMS: e.delay ?? e.delayMS, showTableFlag: e.showTable ?? e.withTable }) }
	async runInternal(e) {
		await super.runInternal(e); await this.wsLogin(e); const {showTableFlag} = this, {tip} = this.class, delayMS = this.delayMS ?? 500;
		console.debug('test', tip, 'başladı'); let result;
		try {
			result = await this.ajaxGet({ api: 'sqlTrnList' }); if (!Object.keys(result).length) { result = undefined }
			if (result) { if (showTableFlag) { console.table(result) } else { console.info(result) } }
		}
		catch (ex) { console.error('test', tip, getErrorText(ex, this.wsURLBase)) }
		if (delayMS) { await new Promise((resolve, reject) => setTimeout(() => resolve(), delayMS)) }
		console.debug('test', tip, 'bitti'); return result
	}
	delay(value) { this.delayMS = value; return this }
	withTable() { this.showTableFlag = true; return this } noTable() { this.showTableFlag = false; return this }
}
class Ticari_SatFat_TopluKayitOlustur extends Ticari_TestBase {
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
class Ticari_SatFat_TopluKayitSil extends Ticari_TestBase {
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