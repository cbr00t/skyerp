class TekSecim extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tekSecimmi() { return true }
	get tekSecimmi() { return this.class.tekSecimmi }
	static get defaultChar() { return null }
	//get char() { return this._char }
	//set char(value) { return this._char = value }
	get coklumu() { return $.isArray(this.char) }
	static get kaListe() { return this.instance.kaListe }
	static get kodListe() { return this.instance.kodListe }
	static get adiListe() { return this.instance.adiListe }
	get kaListe() { return this._kaListe }
	set kaListe(value) {
		const savedValue = this._kaListe;
		this._kaListe = value;
		if (!(this.kaDict && value == savedValue))
			this.kaDictOlustur()
	}
	get secilen() {
		const {coklumu, kaDict, char} = this;
		if (coklumu) {
			const result = [];
			for (const kod of char) { const ka = kaDict[kod]; if (ka != null) result.push(ka) }
			return result
		}
		return kaDict[char]
	}
	get kodListe() {
		let result = this._kodListe;
		if (result === undefined) result = this._kodListe = this.kaListe.map(ka => ka.kod)
		return result
	}
	get adiListe() {
		let result = this._adiListe;
		if (result === undefined) result = this.adiListe = this.kaListe.map(ka => ka.aciklama)
		return result
	}
	get kod() { return this.char }
	get aciklama() { return this.secilen?.aciklama }
	constructor(e) {
		if (e != null && typeof e != 'object') e = { char: e }; e = e || {}; super(e);
		this.init(e); this.kaListeOlustur(e);
		const defaultChar = this.defaultChar = e.defaultChar ?? this.class.defaultChar;
		const kaListe = this.kaListe ?? []; this.char = e.char ?? ( defaultChar == null ? this.kaListe[0]?.char : defaultChar )
		/* const handler = $.extend(new CTekSecimProxyHandler(), this), props = Object.getOwnPropertyDescriptors(this);
		Object.defineProperties(handler, props); return new Proxy(handler, this) */
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { char: new PInst({ init: e => { const {value} = e; return typeof value == 'object' ? value.char : value } }) })
	}
	static getClause(e) { return this.instance.getClause(e) }
	getClause(e, _kodGetter, _adiGetter) {
		const {kaListe} = this; if ($.isEmptyObject(kaListe)) return `''`
		const saha = typeof e == 'object' ? e.saha : e;
		let kodGetter = (typeof e == 'object' ? e.kodGetter : _kodGetter) ?? (ka => MQSQLOrtak.sqlServerDegeri(ka.kod));
		let adiGetter = (typeof e == 'object' ? e.adiGetter : _adiGetter) ?? (ka => MQSQLOrtak.sqlServerDegeri(ka.aciklama));
		let result = `(case ${saha}`;
		for (const ka of kaListe) {
			result += (
				` when ${getFuncValue.call(this, kodGetter, ka)}` +
					` then ${getFuncValue.call(this, adiGetter, ka)}`
			);
		}
		result += ' end)'; return result
	}
	init(e) { }
	kaListeOlustur(e) {
		const kaListe = this._kaListe = [];
		this.kaListeDuzenle($.extend({}, e, { kaListe: kaListe })); this.kaDictOlustur(e)
	}
	kaListeDuzenle(e) { }
	kaDictOlustur(e) {
		const {kaListe} = this, kaDict = this.kaDict = {},  questionDict = this.questionDict = {};
		for (const ka of kaListe) {
			const {question} = ka; kaDict[ka.kod] = ka;
			if (question && question.length > 2) questionDict[question.substr(0, question.length - 2)] = ka
		}
	}
	toString(e) {
		const {coklumu, secilen} = this;
		return secilen ? (coklumu ? secilen.map(x => x.kod).join(',') : secilen).toString(e) : ''
	}
}