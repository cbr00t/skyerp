class MQTest extends MQGuidOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Test' } static get kodListeTipi() { return 'TEST' }
	static get tip() { return this.sablonTip } static get kod() { return this.tip } static get aciklama() { return this.sablonSinif?.aciklama }
	static get tableAlias() { return 'tst' } static get tanimUISinif() { return ModelTanimPart } static get sablonSinif() { return null } static get sablonTip() { return this.sablonSinif?.tip }
	static get ignoreBelirtecSet() { return {...super.ignoreBelirtecSet, ...asSet(['muayeneid']) } }
	static get tip2Sinif() {
		let result = this._tip2Sinif; if (result == null) {
			result = {}; const {subClasses} = this; for (const cls of subClasses) { const {araSeviyemi, tip} = cls; if (!araSeviyemi && tip) { result[tip] = cls } }
			this._tip2Sinif = result
		}
		return result
   }
	get tarih() { const {tarihSaat} = this; return tarihSaat?.clearTime ? new Date(tarihSaat).clearTime() : tarihSaat } set tarih(value) { this.tarihSaat = value?.clearTime ? new Date(value).clearTime() : value }
	get saat() { return timeToString(this.tarihSaat) } set saat(value) { const {tarihSaat} = this; if (value) { setTime(tarihSaat, asDate(value).getTime()) } }

	constructor(e) {
		e = e || {}; super(e); const {sablonTip} = this.class;
		if (sablonTip) { const {sablon} = app.params.ese || {}; this.sablonId = sablon[sablonTip] }
	}
	static getClass(e) { const tip = typeof e == 'object' ? e.tip : e; return this.tip2Sinif[tip] }
	static newFor(e) { if (typeof e != 'object') { e = { tip: e } } const cls = this.getClass(e); return cls ? new cls(e) : null }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			muayeneId: new PInstGuid('muayeneid'), tarihSaat: new PInstDate('tarihsaat'), tamamlandimi: new PInstBitBool('btamamlandi'),
			uygulanmaYeri: new PInstTekSecim('uygulanmayeri', MQTestUygulanmaYeri)
		})
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, {liste} = e, {dev} = config;
		liste.push(...[
			(dev ? new GridKolon({ belirtec: 'muayeneid', text: 'Muayene ID', genislikCh: 40 }) : null),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 10, sql: `${alias}.tarihsaat` }).tipDate(),
			new GridKolon({ belirtec: 'saat', text: 'Saat', genislikCh: 9, sql: `${alias}.tarihsaat` }).tipTime(),
			new GridKolon({ belirtec: 'hastaadi', text: 'Hasta Adı', genislikCh: 40, sql: 'has.aciklama' }),
			new GridKolon({ belirtec: 'doktoradi', text: 'Doktor Adı', genislikCh: 40, sql: 'dok.aciklama' }),
			new GridKolon({ belirtec: 'seri', text: 'Seri', genislikCh: 5, sql: 'mua.seri' }),
			new GridKolon({ belirtec: 'fisno', text: 'No', genislikCh: 17, sql: 'mua.fisno' }).tipNumerik(),
			new GridKolon({ belirtec: 'btamamlandi', text: 'Tamam?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'uygulanmayeritext', text: 'Uygulanma Yeri', genislikCh: 15, sql: MQTestUygulanmaYeri.getClause(`${alias}.uygulanmayeri`) })
		].filter(x => !!x))
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, alias = this.tableAlias;
		sent.leftJoin({ alias, from: 'esemuayene mua', on: `${alias}.muayeneid = mua.id` })
			.leftJoin({ alias: 'mua', from: 'esehasta has', on: 'mua.hastaid = has.id' })
			.leftJoin({ alias: 'mua', from: 'esedoktor dok', on: 'mua.doktorid = dok.id' });
		sent.sahalar.add(`${alias}.uygulanmayeri`)
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e) /*; let {liste} = e; const removeIdSet = asSet(['yeni', 'kopya']);
		liste = e.liste = liste.filter(rec => !removeIdSet[rec.id])*/
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const {tanimFormBuilder: tanimForm} = e; 
		tanimForm.addDiv('ozetBilgi').etiketGosterim_yok().addCSS('bold gray').addStyle_fullWH(null, 'auto').addStyle(e => `$elementCSS { font-size: 120%; padding: 10px 20px }`)
			.onAfterRun(async e => {
				const {altInst: inst, input} = e.builder, {sablonId, tarihSaat, muayeneId, tamamlandimi} = inst, {sablonTip} = inst.class;
				let {uygulanmaYeri} = inst, sablonAdi, muayeneRec;
				if (sablonTip && sablonId) { sablonAdi = (await MQSablon.getClass(sablonTip)?.getGloKod2Adi(sablonId)) || '' }
				if (muayeneId) { muayeneRec = await new MQMuayene({ id: muayeneId }).tekilOku() }
				uygulanmaYeri = uygulanmaYeri?.char ?? uygulanmaYeri;
				const addItem = (elm, css, style) => {
					if (elm && !elm.html) { elm = $(`<div class="full-width">${elm}</div>`) }
					if (!elm?.length) { return } let parent = $(`<div class="full-width"${style ? ` style="${style}"` : ''}/>`); if (css) { parent.addClass(css) }
					elm.appendTo(parent); parent.appendTo(input)
				};
				if (sablonAdi) { addItem(sablonAdi, 'bold', `font-size: 150%; color: #999`) }
				addItem(`${tarihSaat ? `Tarih/Saat: <b>${dateTimeAsKisaString(tarihSaat)}</b>` : ''} ${tamamlandimi ? `<div class="forestgreen" style="margin-left: "20px">Tamamlandı</b>` : ''}`, 'flex-row');
				if (muayeneRec) { addItem(`Muayene: <b>${muayeneRec.fisnox}</b> - <b class="gray">${muayeneRec.hastaadi}</b>`, 'flex-row') }
				if (uygulanmaYeri) { addItem(`Uygulanma Yeri: <b>${MQTestUygulanmaYeri.kaDict[uygulanmaYeri]?.aciklama || ''}</b> - <b class="gray">${muayeneRec.hastaadi}</b>`, 'flex-row') }
			})
	}
}
class MQTestCPT extends MQTest {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'CPT Test' }
	static get kodListeTipi() { return 'TSTCPT' } static get table() { return 'esecpttest' } static get sablonSinif() { return MQSablonCPT }
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { cptsablonid: this.sablonId }) }
}
class MQTestESE extends MQTest {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'ESE Test' }
	static get kodListeTipi() { return 'TSTESE' } static get table() { return 'eseesetest' } static get sablonSinif() { return MQSablonESE }
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { esesablonid: this.sablonId }) }
}

class MQTestUygulanmaYeri extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultChar() { return '' }
	kaListeDuzenle(e) { super.kaListeDuzenle(e); e.kaListe.push(new CKodVeAdi(['', 'Muayenehnae', 'muayenehanemi']), new CKodVeAdi(['IN', 'İnternet', 'internetmi'])) }
}
