class TekSecim extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tekSecimmi() { return true } get tekSecimmi() { return this.class.tekSecimmi }
	static get defaultChar() { return null } get coklumu() { return $.isArray(this.char) }
	static get kaListe() { return this.instance.kaListe } static get kaDict() { return this.instance.kaDict }
	static get kodListe() { return this.instance.kodListe } static get adiListe() { return this.instance.adiListe }
	static get kaYapimi() { return true } static get table() { return null } static get tableAlias() { return '' }
	static get orjBaslikListesi() { return MQKA.orjBaslikListesi } static get listeBasliklari() { return this.orjBaslikListesi }
	static loadServerData(e) { return this.instance.kaListe }
	get kaListe() { return this._kaListe }
	set kaListe(value) {
		let savedValue = this._kaListe; this._kaListe = value;
		if (!(this.kaDict && value == savedValue)) { this.kaDictOlustur() }
	}
	get secilen() {
		let {coklumu, kaDict, char} = this;
		if (coklumu) { let result = []; for (let kod of char) { let ka = kaDict[kod]; if (ka != null) { result.push(ka) } } return result }
		return kaDict[char]
	}
	get kodListe() { let result = this._kodListe; if (result === undefined) { result = this._kodListe = this.kaListe.map(ka => ka.kod) } return result }
	get adiListe() { let result = this._adiListe; if (result === undefined) { result = this._adiListe = this.kaListe.map(ka => ka.aciklama) } return result }
	get kod() { return this.char } get aciklama() { return this.secilen?.aciklama }
	get question() { return this.secilen?.question }
	get ekBilgi() { return this.secilen?.ekBilgi }

	constructor(e = {}) {
		try {
			if (!isObject(e))
				e = { char: e }
			super(e)
			this.init(e)
			this.kaListeOlustur(e)
			let defaultChar = this.defaultChar = e.defaultChar ?? this.class.defaultChar
			let kaListe = this.kaListe = e.kaListe ?? this.kaListe ?? []
			this.char = e.char ?? (defaultChar == null ? kaListe[0]?.char : defaultChar)
			if (!this._propInitFlag)
				this.initProps()
		}
		catch (ex) { debugger; throw ex }
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); let {pTanim} = e;
		$.extend(pTanim, { char: new PInst({ init: e => { let {value} = e; return typeof value == 'object' ? value.char : value } }) })
	}
	static getClause(e) { return this.instance.getClause(e) }
	getClause(e, _kodGetter, _adiGetter) {
		let {kaListe} = this; if ($.isEmptyObject(kaListe)) { return `''` } let saha = typeof e == 'object' ? e.saha : e;
		let kodGetter = (typeof e == 'object' ? e.kodGetter : _kodGetter) ?? (ka => MQSQLOrtak.sqlServerDegeri(ka.kod));
		let adiGetter = (typeof e == 'object' ? e.adiGetter : _adiGetter) ?? (ka => MQSQLOrtak.sqlServerDegeri(ka.aciklama));
		let result = `(case ${saha}`; for (let ka of kaListe) { result += ` when ${getFuncValue.call(this, kodGetter, ka)} then ${getFuncValue.call(this, adiGetter, ka)}` }
		result += ' end)'; return result
	}
	init(e) { }
	kaListeOlustur(e) { let kaListe = this._kaListe = []; this.kaListeDuzenle($.extend({}, e, { kaListe })); this.kaDictOlustur(e) }
	kaListeDuzenle(e) { }
	kaDictOlustur(e) {
		let {kaListe} = this, kaDict = this.kaDict = {},  questionDict = this.questionDict = {};
		for (let ka of kaListe) { let {question} = ka; kaDict[ka.kod] = ka; if (question?.length > 2) { questionDict[question.substr(0, question.length - 2)] = ka } }
	}
	initProps(e) {
		let {_kaListe: kaListe} = this;
		for (let {kod, question} of kaListe) {
			if (!question) { continue }
			Object.defineProperty(this, question, {
				configurable: true,
				get() {
					let {char} = this; char = char?.trim?.() ?? char;
					let _kod = kod; _kod = _kod?.trim?.() ?? _kod;
					return char == _kod
				}
			});
			let setterPostfix = 'Yap', questionSetter = question.replace('mi', setterPostfix).replace('mu', setterPostfix);
			let func = this.__proto__[questionSetter] = (function() { this.char = kod; return this }) /*func.bind(this.__proto__)*/
		}
		this._propInitFlag = true
	}
	toString(e) { let {coklumu, secilen} = this; return secilen ? (coklumu ? secilen.map(x => x.kod).join(',') : secilen).toString(e) : '' }
	secimYok() { this.char = null; return this }
	setDefault() { this.char = this.class.defaultChar; return this }
}

