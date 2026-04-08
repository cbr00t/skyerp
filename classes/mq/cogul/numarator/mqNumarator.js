class MQNumarator extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, 'fis'] }
	static get numaratorPartSinif() { return NumaratorPart } static get fisGirisLayoutSelector() { return '.numarator' }
	static get kodListeTipi() { return 'NUMARATOR' } static get sinifAdi() { return 'Numaratör' }
	static get sayacSaha() { return 'sayac' } static get table() { return 'numarator' } static get tableAlias() { return 'num' }
	static get offlineDirect() { return true } static get gonderildiDesteklenirmi() { return true }

	constructor(e = {}) {
		super(e)
		$.extend(this, { sonNo: asInteger(e.no || e.fisNo) || this.sonNo })
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, { seri: new PInstStr('seri'), sonNo: new PInstNum('sonno') })
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e);
		const {rootBuilder, kaForm, tanimFormBuilder} = e;
		rootBuilder.onPartInit(e => {
			const {wndArgs} = e.part;
			$.extend(wndArgs, { width: 900, height: 490, position: 'center' })
		});
		kaForm.id2Builder.kod.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { min-width: auto !important; width: 100px !important; }`);
		kaForm.id2Builder.aciklama.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { width: 400px !important; }`);
		tanimFormBuilder.add(new FBuilder_TanimFormTabs({ id: 'tabPanel' }).add(
			new FBuilder_TabPage({ id: 'genel', etiket: 'Genel' }).add(
				new FBuilderWithInitLayout().yanYana(2).add(
					new FBuilder_TextInput({ id: 'seri', etiket: 'Seri', maxLength: 3 })
						.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { min-width: auto !important; width: 70px !important; }`)
						.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.input)} { text-align: center !important; }`)
						.onChange(e => {
							let {target} = e.event;
							target.value = (target.value || '').toUpperCase()
						}),
					new FBuilder_NumberInput({ id: 'sonNo', etiket: 'Son No', fra: 0, maxLength: 15 })
						.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { max-width: 160px !important; }`)
				)
			)
		))
	}
	static standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e); const {liste} = e; liste.push('seri', 'sonno') }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'seri', text: 'Seri', genislikCh: 6 }),
			new GridKolon({ belirtec: 'sonno', text: 'Son No', genislikCh: 15 }).tipNumerik(),
		)
	}
	static loadServerData_queryDuzenle({ sent, offlineRequest, offlineMode }) {
		super.loadServerData_queryDuzenle(...arguments)
		// let {aliasVeNokta: alias} = this
	}
	static async offlineSaveToLocalTable(e = {}) {
		let result = await super.offlineSaveToLocalTable(e)
		let {table, gonderildiDesteklenirmi, gonderimTSSaha} = this
		if (result && gonderildiDesteklenirmi && gonderimTSSaha) {
			let upd = new MQIliskiliUpdate({
				from: table,
				set: { degerAta: today(), saha: gonderimTSSaha }
			})
			await this.sqlExecNone(upd)
		}
		return result
	}
	static partLayoutDuzenle(e) {
		const {sender, layout, islem, fis, argsDuzenle} = e;
		const mfSinif = e.mfSinif || this;
		const _e = $.extend({}, e, { args: { sender, layout, islem, fis } }); if (argsDuzenle) getFuncValue.call(this, argsDuzenle, _e.args);
		const part = e.result = new this.numaratorPartSinif(_e.args); part.run(); return part
	}
	keyHostVarsDuzenle({ hv }) { super.keyHostVarsDuzenle(...arguments); hv.seri = this.seri }
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments);
		let {sayacSaha} = this.class; delete hv[sayacSaha]
	}
	keySetValues({ rec }) {
		super.keySetValues(...arguments);
		let value = rec.seri; if (value != null) { this.seri = value }
	}
	superKeyHostVarsDuzenle(e) { super.keyHostVarsDuzenle(e) }
	superKeySetValues(e) { super.keySetValues(e) }
	async yukle(e) {
		e = e || {}; let {rec} = e;
		if (!rec) {
			let {kod, seri} = this
			if (!kod && seri == null)
				return false
			let sent = new MQSent({
				from: this.class.table, sahalar: 'sonno',
				where: seri == null ? { birlestirDict: this.keyHostVars(e) } : { birlestirDict: this.alternateKeyHostVars(e) }
			});
			rec = await this.class.sqlExecTekil(sent)
		}
		return await super.yukle({ ...e, rec })
	}
	async kesinlestir(e = {}) {
		let { isOfflineMode } = MQCogul
		let { class: { table: numTable } } = this
		let { fis = e.inst ?? this.fis } = e
		let { id, class: { table: fisTable } } = fis
	
		if (isOfflineMode) {
			if (!await this.varmi(e))
				await this.yaz(e)
			
			let keyHV = this.alternateKeyHostVars(e)
			let toplu = new MQToplu([
				new MQIliskiliUpdate({
					from: numTable,
					where: { birlestirDict: keyHV },
					set: `sonno = sonno + 1`
				}),
				new MQSent({
					from: numTable, sahalar: ['sonno'],
					where: { birlestirDict: keyHV }
				})
			]).withTrn()
			let sonNo = this.sonNo = asInteger(await this.sqlExecTekilDeger(toplu))
			if (fis)
				fis.fisNo = sonNo + 1
			//}
		}
		else {
			// let keyHV = this.keyHostVars()
			let keyHV = this.keyHostVars(e)
			if (keyHV.no == 0)
				delete keyHV.no
			// `UPDATE ${table} SET @sonNo = sonno = sonno + 1 WHERE ${idSaha} = ${id}`,
			let toplu = new MQToplu()
			;{
				let upd = new MQIliskiliUpdate({ from: numTable }), { where: wh, set } = upd
				wh.birlestirDict(keyHV)
				set.add(`sonno = COALESCE(sonno, 0) + 1`)
				toplu.add(upd)
			}
			;{
				let sent = new MQSent({ from: numTable }), { where: wh, sahalar } = sent
				wh.birlestirDict(keyHV)
				sahalar.add(`@sonNo = MAX(sonno)`)
				toplu.add(sent)
			}
			let params = [{ name: '@sonNo', type: 'int', direction: 'output' }]
			let result = await toplu.executeResult({ params })
			result = result[0] ?? result
			let qParam = result?.params?.['@sonNo']
			if (qParam?.value) {
				let sonNo = this.sonNo = qParam.value
				if (fis)
					fis.fisNo = sonNo + 1
			}
			else if (fis) {
				fis.fisNo++
				if (this.sonNo < fis.fisNo) {
					this.sonNo = fis.fisNo
					await this.kaydet(e)
				}
			}
		}
		
		return this
	}

	offlineBuildSQLiteQuery({ result: r = [] }) {
		super.offlineBuildSQLiteQuery(...arguments)
	}
}
