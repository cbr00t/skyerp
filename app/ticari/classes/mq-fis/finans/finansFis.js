class FinansFis extends MQGenelFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'finansfis' } static get detaySinif() { return FinansDetay } static get gridKontrolcuSinif() { return FinansGridci }
	static get tsnKullanilirmi() { return true } static get ticMustKullanilirmi() { return true } static get mustSaha() { return 'must' }
	static get numYapi() { let {numTipKod: kod} = this; return kod ? new MQNumarator({ kod }) : null }
	static get fisTipi() { return null } static get ozelTip() { return null }
	get bakiyeKullanim() {
		let { _bakiyeKullanim: res } = this
		if (res == null) {
			let _e = { result: { cari: false, kasa: false, mevduat: false } }
			this.bakiyeKullanimDuzenle(_e)
			res = this._bakiyeKullanim = _e.result
		}
		return res
	}
	get bakiyeciler() {
		let { bakiyeKullanim: k } = this
		//let getBA = () =>
		//	this.ba?.borcmu ?? this.class.ba
		return [
			...super.bakiyeciler,
			( k.cari ? new CariBakiyeci({ sqlDuzenleyici: 'bakiyeSqlEkDuzenle_cari' }) : null ),
			( k.kasa ? new KasaBakiyeci({ sqlDuzenleyici: 'bakiyeSqlEkDuzenle_kasa' }) : null ),
			( k.mevduat ? new MevduatBakiyeci({ sqlDuzenleyici: 'bakiyeSqlEkDuzenle_mevduat' }) : null )
		].filter(Boolean)
	}

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, { baslikAciklama: new PInstStr('aciklama') })
	}
	static rootFormBuilderDuzenle_ilk(e) {
		let { builders: baslikFormlar } = e.builders.baslikForm
		baslikFormlar[0].yanYana(3)
		super.rootFormBuilderDuzenle_ilk(e)
	}
	static rootFormBuilderDuzenle_son(e) {
		let { builders: baslikFormlar } = e.builders.baslikForm
		baslikFormlar[2].yanYana(2)
		super.rootFormBuilderDuzenle_son(e)
		let form = baslikFormlar[baslikFormlar[0].builders.length < 3 ? 0 : baslikFormlar[1].builders.length < 3 ? 1 : 2]
		form.addTextInput('baslikAciklama', 'Açıklama')
			.etiketGosterim_yok()
	}
	static secimlerDuzenleSon({ secimler: sec }) {
		super.secimlerDuzenleSon(...arguments);
		sec.secimTopluEkle({ aciklama: new SecimOzellik({ etiket: 'Açıklama' }) });
		sec.whereBlockEkle(e => {
			let {aliasVeNokta} = this, {where: wh, secimler: sec} = e;
			wh.ozellik(sec.aciklama, `${aliasVeNokta}aciklama`)
		})
	}
	static standartGorunumListesiDuzenle_son({ liste }) {
		super.standartGorunumListesiDuzenle_son(...arguments)
		liste.push('fisaciklama', 'toplambedel')
	}
	static orjBaslikListesiDuzenle_son({ liste }) {
		super.orjBaslikListesiDuzenle_son(...arguments)
		let { tableAlias: alias } = this
		liste.push(
			new GridKolon({ belirtec: 'toplambedel', text: 'Toplam Bedel', genislikCh: 15 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'fisaciklama', text: 'Fiş Açıklama', genislikCh: 50, sql: `${alias}.aciklama` })
		)
	}
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments)
		let { fisTipi, ozelTip } = this
		if (fisTipi != null)
			hv.fistipi = fisTipi
		if (ozelTip != null)
			hv.ozeltip = ozelTip
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments)
		let { fisTopNet: toplambedel, fisTopDvNet: toplamdvbedel } = this
		extend(hv, { toplambedel, toplamdvbedel })
	}

	bakiyeKullanimDuzenle({ result }) { }
	bakiyeSqlEkDuzenle_cari({ sent, sent: { sahalar } }) {
		//sent.fis2HarBagla('')
		//sahalar.addWithAlias('fis', 'ozelisaret')
		//sahalar.addWithAlias('har', 'stokkod', 'detyerkod yerkod', 'opno', ...HMRBilgi.rowAttrListe)
		//sahalar.add('SUM(har.miktar) sonmiktar', 'SUM(har.miktar2) sonmiktar2')
	}
	bakiyeSqlEkDuzenle_kasa({ sent, sent: { sahalar } }) {
		//sent.fis2HarBagla('')
		//sahalar.addWithAlias('fis', 'ozelisaret')
		//sahalar.addWithAlias('har', 'stokkod', 'detyerkod yerkod', 'opno', ...HMRBilgi.rowAttrListe)
		//sahalar.add('SUM(har.miktar) sonmiktar', 'SUM(har.miktar2) sonmiktar2')
	}
	bakiyeSqlEkDuzenle_mevduat({ sent, sent: { sahalar } }) {
		//sent.fis2HarBagla('')
		//sahalar.addWithAlias('fis', 'ozelisaret')
		//sahalar.addWithAlias('har', 'stokkod', 'detyerkod yerkod', 'opno', ...HMRBilgi.rowAttrListe)
		//sahalar.add('SUM(har.miktar) sonmiktar', 'SUM(har.miktar2) sonmiktar2')
	}
}
class FinansDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'finanshar' }
	static get ticMustKullanilirmi() { return true }
}

class FinansGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	grid_cellClassName(colDef, rowIndex, belirtec, value, det) {
		let result = [belirtec], editableSet = det._editableSet || {};
		if (!editableSet[belirtec])
			result.push('grid-readOnly')
		return result.join(' ')
	}
	grid_cellBeginEdit(colDef, rowIndex, belirtec, colType, value) {
		const det = colDef.gridPart.gridWidget.getrowdata(rowIndex);
		const editableSet = det._editableSet || {}
		return !!editableSet[belirtec]
	}
	async fis2Grid({ sender: { fis } }) {
		let result = await super.fis2Grid(...arguments)
		if (!result)
			return result
		await fis?.cacheOlustur(...arguments)
		return true
	}
}
