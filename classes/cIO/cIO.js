class CIO extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static _cls2PTanim = {}; static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, '_p'] }
	
	constructor(e) { e = e || {}; super(e); this.pTanim2Inst(e) }
	static get pTanim() {
		const {classKey} = this;
		let result = this._cls2PTanim[classKey];
		if (!result) {
			result = {}; const _e = { pTanim: result }; this.pTanimDuzenle(_e);
			this.pTanimIcinInit(_e); this.pTanimDuzenleSonrasi(_e); this.pTanimDuzenleSonIslemler(_e);
			this._cls2PTanim[classKey] = result; /* Object.freeze(result) */
		}
		return result
	}
	static pTanimDuzenle(e) { }
	static pTanimDuzenleSonrasi(e) { }
	static pTanimDuzenleSonIslemler(e) { }
	static pTanimIcinInit(e) {
		const {pTanim} = e;
		for (const ioAttr in pTanim) { const pInst = pTanim[ioAttr]; pInst.ioAttr = ioAttr /* Object.freeze(pInst) */ }
	}
	pTanim2Inst(e) {
		e = e || {}; const {pTanim} = this.class, _p = this._p = {};
		for (const ioAttr in pTanim) {
			if (ioAttr in this) continue
			let pInst = _p[ioAttr] = pTanim[ioAttr].deepCopy();
			let _value = e[ioAttr]; if (_value === undefined) _value = pInst.initValue
			pInst.value = pInst.getValue(_value);
			Object.defineProperty(this, ioAttr, {
				get: () => { const pInst = this._p[ioAttr]; return pInst.value },
				set: value => {
					const pInst = this._p[ioAttr], oldValue = this[ioAttr]; value = pInst.getValue(value);
					if (oldValue !== value) { pInst.value = value; pInst.trigger('change', { pInst, ioAttr, oldValue, value }); }
				}
			})
			/* Object.seal(pInst) */
		}
		this.pTanim2InstSonrasi(e)
		/* Object.freeze(p); */
	}
	pTanim2InstSonrasi(e) { }
	hostVars(e) { e = e || {}; e.hv = {}; this.pIO_hostVarsDuzenle(e); this.hostVarsDuzenle(e); return e.hv }
	hostVarsDuzenle(e) { }
	setValues(e) { e = e || {}; this.pIO_setValues(e); }
	pIO_hostVarsDuzenle(e) {
		e = e || {}; const {hv} = e, {_p} = this;
		for (const ioAttr in _p) {
			const pInst = _p[ioAttr], {rowAttr} = pInst;
			if (rowAttr) hv[rowAttr] = pInst.hostVarsDegeri
		}
	}
	pIO_setValues(e) {
		e = e || {}; const {rec} = e, {_p} = this;
		for (const ioAttr in _p) {
			const pInst = _p[ioAttr], {rowAttr} = pInst;
			if (rowAttr) {
				const value = rec[rowAttr];
				if (value !== undefined) pInst.setValues({ value, rec })
			}
		}
	}
	shallowCopy(e) {
		e = e || {}; const inst = super.shallowCopy(e), {_p} = this;
		if (_p) {
			inst._p = {};
			for (const ioAttr in _p) { const _pInst = _p[ioAttr], pInst = _pInst ? _pInst.shallowCopy(e) : _pInst; inst._p[ioAttr] = pInst; }
		}
		return inst
	}
	deepCopy(e) {
		e = e || {}; const inst = super.deepCopy(e), {_p} = this;
		if (_p) {
			inst._p = {};
			for (const ioAttr in _p) { const _pInst = _p[ioAttr], pInst = _pInst ? _pInst.deepCopy(e) : _pInst;inst._p[ioAttr] = pInst; }
		}
		return inst
	}
}


class CIO_Test extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		e.pTanim.miktar = new PInstNum('miktar')
		e.pTanim.bedel = new PInstNum('belgebedel');
	}
}
