class MQTabMusDurum extends MQKodOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'MQMUSDURUM' }
	static get sinifAdi() { return 'Müşteri Durumu' }
	static get table() { return 'musdurum' }
	static get tableAlias() { return 'dur' }
	static get offlineGonderYapilirmi() { return true }
	static get ioPostfixes() {
		let { _ioPostfixes: result } = this
		if (!result)
			result = this._ioPostfixes = ['Bakiye', 'KalanRisk', 'TakipBorc']
		return result
	}
	static get ioKeys() {
		let { _ioKeys: result } = this
		if (!result) {
			let { ioPostfixes } = this
			result = ioPostfixes.flatMap(k => [`orj${k}`, `tab${k}`])
			this._ioKeys = result
		}
		return result
	}

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		let { ioKeys } = this
		extend(pTanim, { vade: new PInstDate('vade') })
		extend(pTanim, fromEntries(
			ioKeys.map(k =>
				[k, new PInstNum(k)])
		))
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let { ioKeys } = this
		for (let i = 0; i < ioKeys.length; i += 2) {
			liste.push(
				...this.getKAKolonlar(
					new GridKolon({ belirtec: ioKeys[i], text: ioKeys[i], genislikCh: 15 }).tipDecimal_bedel(),
					new GridKolon({ belirtec: ioKeys[i + 1], text: ioKeys[i + 1], genislikCh: 15 }).tipDecimal_bedel()
				)
			)
		}
		liste.push(new GridKolon({ belirtec: 'vade', text: 'Vade', genislikCh: 13 }).tipTarih())
	}
	static async offlineSaveToLocalTableOncesi({ temps } = {}) {
		let result = await super.offlineSaveToLocalTableOncesi(...arguments)
		if (result === false)
			return false
		let { table, kodSaha, ioPostfixes } = this
		;{
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent.fromAdd(table)
			wh.add(`${kodSaha} <> ''`)
			;{
				let or = new MQOrClause()
				;ioPostfixes.forEach(k =>
					or.add(`tab${k} <> 0`))
				wh.add(or)
			}
			sahalar.add(
				kodSaha,
				...ioPostfixes.map(k => `tab${k}`)
			)
			try {
				temps.saved_kod2Rec = fromEntries(
					( await sent.execSelect() )
						.map(r => [r[kodSaha], r])
				)
			}
			catch (ex) { cerr(ex) }
		}
		return true
	}
	static async loadServerDataDogrudan(e = {}) {
		let { offlineBuildQuery, offlineRequest, offlineMode, temps: { saved_kod2Rec = {} } = {} } = e
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			// let { plasiyerKod } = app
			let params = [
				//( plasiyerKod ? { name: '@argPlasiyerKod', type: 'char', value: plasiyerKod } : null )
			].filter(Boolean)
			let recs = []
			let _recs = await 'tic_topluDurum'.execSP({ params, offlineRequest, offlineMode })
			for (let r of _recs) {
				let { must: kod, ortalamavade: vade } = r
				if (!kod)
					continue
				vade = asDateAndToString(vade)
				let _r = saved_kod2Rec[kod] ?? {}
				let rec = {
					kod, vade,
					orjBakiye: r.bakiye ?? 0,
					tabBakiye: _r.tabBakiye ?? 0,
					orjKalanRisk: r.kalanrisk ?? 0,
					tabKalanRisk: _r.tabKalanRisk ?? 0,
					orjTakipBorcu: r.takipborcu ?? 0,
					tabTakipBorcu: _r.tabTakipBorcu ?? 0
				}
				//if (rec.vade || rec.tabBakiye || rec.tabKalanRisk || rec.tabTakipBorcu)
				recs.push(rec)
			}
			return recs
		}
		
		let recs = await super.loadServerDataDogrudan(e)
		if (!(offlineRequest || offlineBuildQuery)) {
			let { ioPostfixes } = this
			for (let r of recs ?? [])
			for (let pr of ioPostfixes) {
				let k_agg = pr[0].toLowerCase() + pr.slice(1)
				let v = r[k_agg]
				if (v != null)
					continue
				let k_orj = `orj${pr}`, k_tab = `tab${pr}`
				// r.bakiye = r.orjBakiye + r.tabBakiye
				r[k_agg] = r[k_orj] + r[k_tab]
			}
		}
		return recs
	}
	static loadServerData_queryDuzenle_son(e = {}) {
		super.loadServerData_queryDuzenle_son(e)
		let { alias = this.tableAlias, offlineRequest, offlineMode, stm, sent } = e
		let { where: wh, sahalar } = sent
		if (!offlineRequest)
			return
	}

	static update(e) {
		let { same, yeni, eski, delta } = this.calc(e) ?? {}
		let { table, kodSaha, ioPostfixes } = this
		let getUpd = t => {
			let { mustKod } = t ?? {}
			if (!mustKod)
				return null
			let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
			upd.fromAdd(table)
			wh.degerAta(mustKod, kodSaha)
			for (let pf of ioPostfixes) {
				let tk = pf[0].toLowerCase() + pf.slice(1)
				let v = t[tk]
				if (!v)
					continue
				let rk = `tab${pf}`
				let op = v < 0 ? '-' : '+'
				v = abs(v)
				set.add(`${rk} = ${rk} ${op} ${v.sqlDegeri()}`)
			}
			return empty(set.liste) ? null : upd
		}
		
		let toplu = new MQToplu()
		if (same)
			toplu.add(...[ getUpd(delta) ])
		else {
			toplu.add(...[
				getUpd(yeni),
				getUpd(eski)
			].filter(Boolean))
		}
		if (empty(toplu.liste))
			return null

		;{
			// bakiye için kayıt yoksa boş kayıt ekle
			let { mustKod: kod } = yeni ?? delta
			let ins = new MQInsert({ table, hv: { kod } }).insertIgnore()
			toplu.liste.unshift(ins)
		}
		
		this.globalleriSil()
		return toplu.execNone()
	}
	static async check(e = {}) {
		let { same, delta: d } = await this.calc(e) ?? {}
		if (!same)
			return

		let { mustKod } = d
		let { dvKod } = e.inst ?? {}
		dvKod ??= 'TL'

		let { [mustKod]: r } = await this.getGloKod2Rec() ?? {}
		;{
			let { kalanRisk: v = 0 } = d
			v = roundToBedelFra( ( r.orjKalanRisk || 0) + ( r.tabKalanRisk || 0) + v )
			if (v < 0)
				throw { isError: true, errorText: `Risk Aşıldı: [<b class="royalblue">${bedelToString(v)} ${dvKod}</b>]` }
		}
	}
	static calc({ yeni = {}, eski = {}, delta = {}, inst, eskiInst }) {
		;{
			yeni = { ...yeni }
			eski = { ...eski }
			delta = { ...delta }
		}
		;{
			yeni.mustKod ??= inst?.mustKod
			yeni.bakiye ??= inst?.bakiyeArtis ?? 0
		}
		;{
			eski.mustKod ??= eskiInst?.mustKod
			eski.bakiye ??= eskiInst?.bakiyeArtis ?? 0
		}
		if (!(yeni.mustKod || eski.mustKod))
			return null

		eski = { ...eski }
		;entries(eski).forEach(([k, v]) => {
			if (v && isNumber(v))
				eski[k] = -v
		})

		let { table, kodSaha } = this
		let fill = (...targets) => {
			for (let t of targets) {
				let { bakiye: ref } = t
				t.bakiye = ref || 0
				t.kalanRisk ??= ref ? -ref : 0
				t.takipBorcu ??= ref || 0
			}
		}

		eski.mustKod ||= yeni.mustKod
		let same = yeni.mustKod == eski.mustKod
		let empty = false
		if (same) {
			delta ??= {}
			delta.bakiye ??= roundToBedelFra( (yeni.bakiye || 0) + (eski.bakiye || 0) )
			fill(delta)
			empty = values(delta).every(v => isNumber(v) && !v)
			delta.mustKod = yeni.mustKod
		}
		else {
			fill(yeni, eski)
			delta ??= {}
			for (let k of keys(yeni)) {
				let v1 = yeni[k], v2 = eski[k]
				if (isNumber(v1) || isNumber(v2))
					delta[k] = (v1 || 0) - (v2 || 0)
			}
			empty = values(delta).every(v => isNumber(v) && !v)
			delta.mustKod = yeni.mustKod
		}

		return { same, yeni, eski, delta, empty }
	}
}

/*bakiye
: 
180398.69
kalanrisk
: 
0
must
: 
"120 004"
ortalamavade
: 
"07.01.2026 00:00:00"
risklimiti
: 
0
takipborcu
: 
180398.69
vadelikalanrisk
: 
0
vadelikisim
: 
0
vadeliortalamavade
: 
null
vaderisklimiti
: 
0*/
