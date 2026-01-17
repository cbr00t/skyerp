class Callable extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(block, args) {
        super(); if (args) { Object.assign(this, args) }
        return block ? block.bind(this) : (() => {})
    }
}
class CPoint extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get empty() { return new this({ x: 0, y: 0 }) } static get zero() { return this.empty } static get oneOne() { return new this({ x: 1, y: 1 }) }
	get bosmu() { return !(this.x || this.y) } get legalmi() { return (this.x && this.y) }
	constructor(e) {
		e = e || {}; super(e);
		for (const key of ['x', 'X', 'basi', 'Basi']) { let value = e[key]; if (value != null) { this.x = asFloat(value); break } }
		for (const key of ['y', 'Y', 'sonu', 'Sonu']) { let value = e[key]; if (value != null) { this.y = asFloat(value); break } }
	}
	static fromText(e) {
		e = e || {};
		if (typeof e == 'object' && !$.isPlainObject(e)) return e		/* CPoint gelmistir */
		let value = typeof e == 'object' && e.value !== undefined ? e.value : e; if (value == null) return null
		if (typeof value == 'object') {
			let inst = $.isPlainObject(value) ? new this(value) : value;
			for (const key of ['x', 'y']) { let value = inst[key]; if (typeof value != 'number') inst[key] = value = asFloat(value) }
			return inst
		}
		let ind = value.indexOf('@'); ind = ind < 0 ? value.indexOf('x') : ind; ind = ind < 0 ? value.indexOf('|') : ind; if (ind < 0) return null
		return new this({ x: asFloat(value.substring(0, ind).trim()) || 0, y: asFloat(value.substring(ind + 1).trim()) || 0 })
	}
	toString(e) { return `${this.x} x ${this.y}` }
}
class CBasiSonu extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get bosmu() { return !(this.basi || this.sonu) } get bosDegilmi() { return !this.bosmu }
	static get empty() { return new this({ basi: '', sonu: '' }) } static get zero() { return new this({ basi: 0, sonu: 0 }) }
	get kisaText() {
	    let {basi, sonu} = this, {namesAbbr: kisaAy} = localizationObj.months
	    if (!(isDate(basi) || isDate(sonu))) {
			return (
				basi && sonu ? `${basi} - ${sonu}` :
				basi ? `${basi} -> '...'` :
				sonu ? `'...' -> ${sonu}` : ''
			)
		}
	    if (!(basi && sonu))
			return `${basi ? gA(basi) : '...'} -> ${sonu ? gA(sonu) : '...'}`
	    let b = { gun: basi.gun.sifirlaDoldur(2), ay: basi.ay, yil: basi.yil }
		let s = { gun: sonu.gun.sifirlaDoldur(2), ay: sonu.ay, yil: sonu.yil }
	    if (b.yil === s.yil && b.ay === s.ay)
			return `${b.gun} -> ${s.gun} ${kisaAy[b.ay - 1]} ${b.yil}`
	    if (b.yil === s.yil)
			return `${b.gun}.${kisaAy[b.ay - 1]} -> ${s.gun}.${kisaAy[s.ay - 1]} ${b.yil}`
	    return `${b.gun}.${kisaAy[b.ay - 1]}.${(b.yil % 100).sifirlaDoldur(2)} -> ${s.gun}.${kisaAy[s.ay - 1]}.${(s.yil % 100).sifirlaDoldur(2)}`
	}
	
	constructor(e) { e = e || {}; super(e); $.extend(this, { basi: e.basi ?? e.Basi, sonu: e.sonu ?? e.Sonu }) }
	static fromText(e) {
		e = e || {}; if (typeof e == 'object' && !$.isPlainObject(e)) return e		/* CBasiSonu gelmistir */
		let value = typeof e == 'object' && e.value !== undefined ? e.value : e; if (value == null) return null
		if (typeof value == 'object') {
			let inst = $.isPlainObject(value) ? new this(value) : value; const {converter} = e;
			if (converter) { for (const key of ['basi', 'sonu']) { let value = inst[key]; inst[key] = value = converter.call(inst, { value }) } }
			return inst
		}
		let ind = value.indexOf('@'); ind = ind < 0 ? value.indexOf('x') : ind; ind = ind < 0 ? value.indexOf('|') : ind; if (ind < 0) return null
		const converter = e.converter ?? (value => value); return new this({
			basi: converter.call(this, { value: value.substring(0, ind).trim() }),
			sonu: converter.call(this, { value: value.substring(ind + 1).trim() })
		})
	}
	uygunmu(e) {
		let value = e?.value ?? e, {basi, sonu} = this
		if (isDate(value)) {
			let bs = { basi, sonu }
			for (let [k, v] of entries(bs)) {
				v ||= null
				if (v && !isDate(v))
					bs[k] = v = asDate(v)
			}
			basi = bs.basi; sonu = bs.sonu
		}
		return empty(value) ? true : (!basi || basi <= value) && (!sonu || sonu >= value)
	}
	toString(e) { return this.kisaText }
	/*
	#bindWithArguments: , #bindWith: , #bindWith:with: , #bindWith:with:with: , #bindWith:with:with:with: ...
		===> js: template formatted string
			('hi %1 %2' bindWith: adi with: soyadi) = js `hi ${adi} ${soyadi}`
	
	Number>>#sifirlaDoldur:
		" ==> js: sifirlaDoldur(value) ==> return value?.toString()?.padStart(2, '0') "

	Date class>>#ayKisaDizi
	ayKisaDizi
		^#('Oca' 'Şub' 'Mar' 'Nis' 'May' 'Haz' 'Tem' 'Ağu' 'Eyl' 'Eki' 'Kas' 'Ara')
			===> js: localizationObj.months.namesAbbr

	Date>>#ayKisaAdi
	ayKisaAdi
		^self class ayKisaDizi at: self ay ifAbsent: ['']
			===> js: localizationObj.months.namesAbbr[aDate.ay - 1]
	
	Date>>#gAy
		" gün num[2 hane] ve Ay adı "
	
		^'%1.%2.%3'
			bindWith: (self gun sifirlaDoldur: 2)
			with: self ayKisaAdi
			with: ((self yil \\ 100) sifirlaDoldur: 2)
	
	BasiSonu>>#tarihAralikText
		" 01->07 May 2021
		17.May -> 08.Haz 2021
		20.Ara.21 -> 15.Oca.22 (bu durumda yil 2 hane) "
	
		| basGunText sonGunText basAy sonAy basYil sonYil ayDizi |
	
		(self basi isNil
			or: [ self sonu isNil ]
			) ifTrue: [
				^'%1 -> %2'
					bindWith: (self basi ifNil: [ '...' ] else: [ :trh | trh gA ])
						with: (self sonu ifNil: [ '...' ] else: [ :trh | trh gA ])
					].
	
		ayDizi := Date ayKisaDizi.
		basGunText := self basi gun sifirlaDoldur: 2.
		sonGunText := self sonu gun sifirlaDoldur: 2.
		basYil := self basi yil.
		sonYil := self sonu yil.
		basAy := self basi ay.
		sonAy := self sonu ay.
	
		(basYil = sonYil)
			ifTrue: [
					basAy = sonAy
						ifTrue: [ ^'%1->%2 %3 %4'		" 01->07 May 2021 "
										bindWith: basGunText
											with: sonGunText
											with: (ayDizi at: basAy)
											with: basYil asString
										].
					^'%1.%2 -> %3.%4 %5'		" 17.May -> 08.Haz 2021 "
							bindWithArguments: (OrderedCollection new
													add: basGunText;
													add: (ayDizi at: basAy);
													add: sonGunText;
													add: (ayDizi at: sonAy);
													add: basYil asString;
													yourself)
					].
	
		^'%1.%2.%3 -> %4.%5.%6'		" 20.Ara.2021 -> 15.Oca.2022 "
				bindWithArguments: (OrderedCollection new
										add: basGunText;
										add: (ayDizi at: basAy);
										add: (basYil \\ 100) asString;
										add: sonGunText;
										add: (ayDizi at: sonAy);
										add: (sonYil \\ 100) asString;
										yourself)

	*/
}
class YilVeAy extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get bosmu() { return !(this.basi || !this.sonu) }
	get yilAy() { const {yil, ay} = this; return asYilAy(yil, ay) }
	set yilAy(value) { const yilVeAy = ya2YilVeAy(value); if (yilVeAy) { const {yil, ay} = yilVeAy; $.extend(this, { yil, ay }) } }
	constructor(e, _ay) {
		e = e || {}; super(e); let yil, ay;
		if (typeof e == 'object') {
			let yilAy = e.yilAy ?? e.YilAy ?? e.yilay;
			if (yilAy) { const yilVeAy = ya2YilVeAy(e); yil = yilVeAy?.yil; ay = yilVeAy?.ay } else { yil = e.yil ?? e.Yil; ay = e.ay ?? e.Ay }
		}
		else {
			if (_ay === undefined) { const yilVeAy = ya2YilVeAy(e); yil = yilVeAy?.yil; ay = yilVeAy?.ay }
			else { yil = e; ay = _ay }
		}
		if (yil && yil < 100) { yil = yil2To4(yil) }
		$.extend(this, { yil, ay })
	}
}
class Countdown extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get state() { const {remainingSecs: r, totalSecs: t} = this; return r == null || r == t ? 'begin' : r <= 0 ? 'end' : 'progress' }
	get needUpdate() {
		/*const {remainingSecs: secs} = this, modulo = secs < 10 ? 1 : secs < 60 ? 10 : 30;
		return secs % (modulo + 1) == modulo*/
		return true 
	}
	get text() {
		const {remainingSecs} = this; let result = this._lastText; if (remainingSecs == null) { return '' }
		result = remainingSecs < 60 ? `${remainingSecs} sn` : `${Math.round(remainingSecs / 60, 1)} dk`;
		return this._lastText = result
	}
	constructor(e) { e = e || {}; super(e); $.extend(this, { layout: e.layout, totalSecs: e.totalSecs ?? 0, remainingSecs: e.remainingSecs, callback: e.callback }) }
	run(e) { delete this.isDestroyed; this.reset(e).start(e) }
	destroyPart(e) { this.isDestroyed = true; this.abort(e); const {layout} = this; if (layout?.length) { layout.remove() } }
	abort(e) { this.stop(e).reset(e); return this }
	start(e) { if (!this.hTimer) { this.hTimer = setInterval(e => this.intervalProc(e), 1000, e) } return this }
	stop(e) { clearInterval(this.hTimer); delete this.hTimer; this._stoppedFlag = true; setTimeout(() => delete this._stoppedFlag, 100); this.updateUI(); return this }
	reset(e) { this.remainingSecs = null; this.updateUI(e); return this }
	intervalProc(e) {
		e = e || {}; if (this.isDestroyed || this._stoppedFlag) { return this } const {state: savedState} = this;
		const totalSecs = this.totalSecs ?? 0; let remainingSecs = this.remainingSecs = this.remainingSecs ?? totalSecs;
		if (remainingSecs <= 0) { this.stop(e); return this }
		this.remainingSecs = --remainingSecs; this.updateUI({ force: savedState == 'begin' });
		const {callback} = this; if (callback) {
			const {text, _lastText: lastText, needUpdate, state} = this, abort = e => this.abort(e);
			const _e = { ...e, sender: this, totalSecs, remainingSecs, state, needUpdate, text, lastText, abort };
			let result = getFuncValue.call(this, callback, _e); if (result === false) { this.stop(e) }
		}
		return this
	}
	updateUI(e) {
		e = e || {}; const {layout} = this, force = e.force ?? e.forceFlag;
		if ((force || this.needUpdate) && layout?.length) {
			const {text} = this, remainingSecs = this.remainingSecs || this.totalSecs;
			layout.html(numberToString(text)); layout[remainingSecs <= 10 ? 'addClass' : 'removeClass']('critical')
		} return this
	}
	updateUIForce(e) { return this.updateUI({ ...e, force: true }) }
	getState() { return this.state }
	getNeedUpdate() { return this.needUpdate } getText() { return this.text } getLastText() { return this._lastText }
	getTotalSecs() { return this.totalSecs } setTotalSecs(value) { this.totalSecs = value; return this }
	getRemainingSecs() { return this.remainingSecs } setRemainingSecs(value) { this.remainingSecs = value; return this }
	getLayout() { return this.layout } setLayout(value) { this.layout = value; return this }
	callbackHandler(value) { this.callback = value; return this } onCallback(value) { return this.callbackHandler(value) }
}
