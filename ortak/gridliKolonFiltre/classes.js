class GridKolonFiltreDuzenleyici extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get recs() { return this._recs } set recs(value) { this._recs = value; this._attr2FiltreRecs }
	get attr2FiltreRecs() {
		let result = this._attr2FiltreRecs; if (result == null) {
			const recs = this.recs ?? []; result = {};
			for (const rec of recs) { const {attr} = rec; (result[attr] = result[attr] ?? []).push(rec) }
			this._attr2FiltreRecs = result
		}
		return result
	}
	constructor(e) { e = e || {}; super(e); $.extend(this, { degistimi: e.degistimi ?? false, recs: e.recs, attrKAListe: e.attrKAListe }) }
	degisti() { this.degistimi = true; return this } degismedi() { this.degistimi = false; return this }
}
class GridKolonFiltreRec extends CKodAdiVeEkBilgi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get attr() { return this.kod } set attr(value) { this.kod = value }
	get operator() { return this.ekBilgi } set operator(value) { this.ekBilgi = value }
	get value() { return this.aciklama } set value(value) { this.aciklama = value }
	get operatorCh() { let result = this.operator; if (result) result = result.kod || result; return result }
	set operatorCh(value) { if (value) value = value.kod; this.operator = value }
	get operatorTekSecim() {
		let result = this.operator; if (typeof result != 'object') result = new GridliKolonFiltre_OperatorTekSecim({ char: result });
		return result
	}
	get operatorText() {
		let result = this.operator; if (result) { result = result.kod ?? result } 
		return result ? GridliKolonFiltre_OperatorTekSecim.instance.kaDict[result]?.aciklama : null
	}
	get jqxFilterAnaTip() { return this.class.tip2JqxFilterAnaTip(this.tip) }
	constructor(e) {
		e = e || {}; super(e); if (!$.isArray(e)) { $.extend(this, { attr: e.attr, operator: e.operator, value: e.value, tip: e.tip }) }
		if (!this.operator) { this.operator = GridliKolonFiltre_OperatorTekSecim.instance.class.defaultChar }
	}
	static tip2JqxFilterAnaTip(e) {
		let _tip2JqxFilterAnaTip = this._tip2JqxFilterAnaTip;
		if (!_tip2JqxFilterAnaTip) {
			_tip2JqxFilterAnaTip = this._tip2JqxFilterAnaTip = {
				string: GridKolonTip_String.jqxFilterAnaTip, number: GridKolonTip_Number.jqxFilterAnaTip,
				date: GridKolonTip_Date.jqxFilterAnaTip, bool: 'booleanfilter'
			}
		}
		const tip = (typeof e == 'object') ? e.tip : e; return _tip2JqxFilterAnaTip[tip] || GridKolonTip_String.jqxFilterAnaTip
	}
	getGridFilter(e) {
		e = e || {};
		const {operatorCh} = this; const attr = e.attr ?? e.sql ?? e.field ?? this.attr; if (!(attr && operatorCh)) return null
		const value = e.value ?? this.value, filterType = this.jqxFilterAnaTip;
		return GridliKolonFiltre_OperatorTekSecim.getGridFilter($.extend({}, e, { type: filterType, attr, operator: operatorCh, value }))
	}
	uygunmu(e) {
		const {rec} = e, {attr, operatorCh, value, tip} = this, rec_value = rec[attr];
		if (rec_value === undefined) return true
		const filterType = this.class.tip2JqxFilterAnaTip(tip);
		return GridliKolonFiltre_OperatorTekSecim.uygunmu($.extend({}, e, { type: filterType, attr, operator: operatorCh, value, target: rec_value }))
	}
}
class GridliKolonFiltre_OperatorTekSecim extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'CONTAINS' }
	kaListeDuzenle(e) {
		/* [ "EMPTY", "NOT_EMPTY", "CONTAINS", "CONTAINS_CASE_SENSITIVE", "DOES_NOT_CONTAIN", "DOES_NOT_CONTAIN_CASE_SENSITIVE", "STARTS_WITH", "STARTS_WITH_CASE_SENSITIVE",
			 "ENDS_WITH", "ENDS_WITH_CASE_SENSITIVE", "EQUAL", "EQUAL_CASE_SENSITIVE", "NULL", "NOT_NULL" ] */
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['CONTAINS', 'gibi']),
			new CKodVeAdi(['NOT_CONTAINS', 'gibi OLMAYAN']),
			new CKodVeAdi(['EQUAL', '=']),
			new CKodVeAdi(['NOT_EQUAL', '<>']),
			new CKodVeAdi(['STARTS_WITH', '... ile başlayan']),
			new CKodVeAdi(['ENDS_WITH', '... ile biten']),
			new CKodVeAdi(['LESS_THAN_OR_EQUAL', '&lt;=']),
			new CKodVeAdi(['LESS_THAN', '&lt;']),
			new CKodVeAdi(['GREATER_THAN_OR_EQUAL', '&gt;=']),
			new CKodVeAdi(['GREATER_THAN', '&gt;']),
			new CKodVeAdi(['EMPTY', 'BOŞ DEĞER olan']),
			new CKodVeAdi(['NOT_EMPTY', 'BOŞ DEĞER OLMAYAN'])
		)
	}
	static getGridFilter(e) {
		let operator = e.operator ?? e.condition; if (operator && operator.kod) operator = operator.kod; if (!operator) return null;
		const {type, value} = e, attr = e.attr ?? e.sql ?? e.field;
		return { type: type || GridKolonTip_String.jqxFilterAnaTip, field: attr, condition: operator, value }
	}
	getGridFilter(e) { const {char} = this; return this.class.getGridFilter($.extend({}, e, { operator: char })) }
	static uygunmu(e) {
		const filterObj = this.getGridFilter(e); if (filterObj == null) return true
		const attr = filterObj.field, {type, value} = filterObj, operator = filterObj.condition, {target} = e;
		const isStringFilter = type == 'stringfilter', getLowercased = _value => isStringFilter ? (_value || '').toLowerCase() : _value;
		let result = true;
		switch (operator) {
			case 'EQUAL': result = (target == value); break
			case 'NOT_EQUAL': result = (target != value); break
			case 'CONTAINS': case 'CONTAINS_CASE_SENSITIVE': result = ( target.includes(value) || (getLowercased(target).includes(getLowercased(value))) ); break
			case 'NOT_CONTAINS': case 'NOT_CONTAINS_CASE_SENSITIVE':
				case 'DOES_NOT_CONTAIN': case 'DOES_NOT_CONTAIN_CASE_SENSITIVE': result = !( target.includes(value) || (getLowercased(target).includes(getLowercased(value))) ); break
			case 'STARTS_WITH': case 'STARTS_WITH_CASE_SENSITIVE': result = ( target.startsWith(value) || getLowercased(target).startsWith(getLowercased(value)) ); break
			case 'ENDS_WITH': case 'ENDS_WITH_CASE_SENSITIVE': result = ( target.endsWith(value) || getLowercased(target).endsWith(getLowercased(value)) ); break
			case 'LESS_THAN_OR_EQUAL': result = (target <= value); break
			case 'LESS_THAN': result = (target < value); break
			case 'GREATER_THAN_OR_EQUAL': result = (target >= value); break
			case 'GREATER_THAN': result = (target > value); break
			case 'EMPTY': result = !target; break
			case 'NOT_EMPTY': result = !!target; break
		}
		return result
	}
	uygunmu(e) { const {char} = this; return this.class.uygunmu($.extend({}, e, { operator: char })) }
}
