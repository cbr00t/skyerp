class SatisKosulYapi extends CObject {
	static get kosulSiniflar() {
		let {_kosulSiniflar: result} = this;
		if (result == null) { result = this._kosulSiniflar = [SatisKosul_Fiyat, SatisKosul_Iskonto, SatisKosul_Kampanya] }
		return result
	}
	static get tipListe() {
		let {_tipListe: result} = this;
		if (result == null) { result = this._tipListe = this.kosulSiniflar.map(cls => cls.tipKod) }
		return result
	}
	get satisKosullari() { return Array.from(this.getIter()) }
	get tip2SatisKosul() { let result = {}; for (let item of this.getIter()) { let {tipKod} = item.class; result[tipKod] = item } return result }
	get kapsam() { return this._kapsam } set kapsam(value) { this._kapsam = $.isPlainObject(value) ? new SatisKosulKapsam(value) : null /* this.reset() */ }
	constructor(e) {
		e = e ?? {}; super(e); let {kapsam} = e;
		$.extend(this, { kapsam })
	}
	reset(e) {
		let {kosulSiniflar} = this.class, {kapsam} = this;
		for (let cls of kosulSiniflar) { let {tipKod} = cls; this[tipKod] = new cls({ kapsam }) }
		this._initFlag = true; return this
	}
	static async uygunKosullar(e) { let inst = new this(e); return await inst.uygunKosullar(e) ? inst : null }
	async uygunKosullar(e) {
		e ??= {}; let {kosulSiniflar} = this.class, kapsam = e.kapsam ?? this.kapsam;
		let _e = { ...e, kapsam }, promises = [];
		for (let cls of kosulSiniflar) {
			let {tipKod} = cls;
			promises.push(
				cls.uygunKosullar(_e)
					.then(result => {
						if ($.isEmptyObject(result)) { delete this[tipKod] }
						else { this[tipKod] = result }
					})
					.catch(ex => { delete this[tipKod]; throw ex })
			)
		}
		await Promise.allSettled(promises);
		return this
	}
	static async yukle(e) { let inst = new this(e); return await inst.yukle(e) ? inst : null }
	async yukle(e) {
		e ??= {}; this.reset(e);
		let {kosulSiniflar} = this.class, kapsam = e.kapsam ?? this.kapsam;
		let _e = { ...e, kapsam }, promises = [];
		for (let cls of kosulSiniflar) {
			let {tipKod} = cls, inst = this[tipKod]; if (!inst) { continue }
			promises.push(inst.yukle(_e).catch(ex => { delete this[tipKod]; inst = null; throw ex }))
		}
		await Promise.allSettled(promises); return this
	}
	*getIter() {
		let {tipListe} = this.class;
		for (let tip of tipListe) { let item = this[tip]; if (item != null) { yield item } }
	}
}
