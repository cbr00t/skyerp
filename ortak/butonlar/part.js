class ButonlarPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'butonlar' } static get isSubPart() { return true }
	static get templates() { let result = this._templates; if (!result) { result = this._templates = {}; this.templatesOlustur({ result }) } return result }

	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
			sender: e.sender || this.parentPart, builder: e.builder, tip: e.tip, id2Handler: e.id2Handler, butonlarDuzenleyici: e.butonlarDuzenleyici,
			prepend: asBool(e.prepend), ekButonlarIlk: e.ekButonlarIlk || [], ekButonlarSon: e.ekButonlarSon || [],
			sagButonIdSet: e.sagButonIdSet || asSet(['tamam', 'kaydet', 'tazele', 'sec', 'vazgec', 'temizle']),
			ekSagButonIdSet: asSet(e.ekSagButonIdSet) || {}, userData: e.userData
		})
	}
	runDevam(e) { e = e || {}; super.runDevam(e); this.butonlariOlustur(e); const {layout} = this; layout.addClass('flex-row'); makeScrollable(layout) }
	destroyPart(e) {
		super.destroyPart(e); const {layout} = this;
		if (layout?.length) { const buttons = layout.find('button'); if (buttons?.length) { buttons.jqxButton('destroy') } layout.children().remove() }
		this.layout = null
	}
	butonlariOlustur(e) {
		const {templates} = this.class, {tip} = this, builder = templates[tip]; let liste = [];
		if (builder) { liste = getFuncValue.call(this, builder, e) } if (!liste) { return false }
		if (typeof liste == 'object') { this.butonlariEkle({ liste }) }
		return true
	}
	butonlariEkle(e) {
		e = e || {}; const {parentPart, builder, userData, ekButonlarIlk, ekButonlarSon, butonlarDuzenleyici, layout, prepend, id2Handler} = this;
		const sender = this.sender || this, _liste = e.liste ?? e; let liste = [];
		if (!$.isEmptyObject(ekButonlarIlk)) { liste.push(...ekButonlarIlk) }
		if (!$.isEmptyObject(_liste)) { liste.push(..._liste) }
		if (!$.isEmptyObject(ekButonlarSon)) { liste.push(...ekButonlarSon) }
		for (const key in liste) { let item = liste[key]; if (typeof item != 'object') { item = { id: item, text: '' }; liste[key] = item } }
		if (butonlarDuzenleyici) {
			const _e = { ...e, sender, parentPart, builder, part: this, userData, liste }; let result = getFuncValue.call(this, butonlarDuzenleyici, _e);
			if (typeof result == 'object') { result = result.liste ?? result } liste = result ?? _e.liste
		}
		const subParent = this.sol = $(`<div class="sol"/>`), subParent_sag = this.sag = $(`<div class="sag"/>`), sagButonIdSet = this.sagButonIdSet || {}, {ekSagButonIdSet} = this;
		for (const item of liste) {
			const {id, text, args} = item, btn = $(`<button id="${id}">${text || ''}</button>`);
			const sagmi = (sagButonIdSet && sagButonIdSet[id]) || (ekSagButonIdSet && ekSagButonIdSet[id]);
			const _subParent = sagmi ? subParent_sag : subParent, _prependFlag = prepend; btn[_prependFlag ? 'prependTo' : 'appendTo'](_subParent); btn.jqxButton($.extend({ theme }, args || {}));
			let {handler} = item; btn.data('handler', handler);
			if (handler) {
				btn.on('click', evt => {
					handler = $(evt.currentTarget).data('handler');
					const _e = { parentPart, sender, builder, userData, event: evt, button: btn, id: evt.currentTarget.id }; getFuncValue.call(this, handler, _e)
				})
			}
			if (id2Handler) {
				handler = id2Handler[id];
				if (handler) { btn.on('click', evt => { const _e = { parentPart, sender, builder, userData, event: evt, button: btn, id: evt.currentTarget.id }; getFuncValue.call(this, handler, _e) }) }
			}
		}
		subParent.appendTo(layout); subParent_sag.appendTo(layout); const sagButonlar = subParent_sag.children('button');
		layout.css('--width-sag', `calc((var(--button-right) * ${sagButonlar.length}) + var(--width-sag-ek))`)
	}
	static templatesOlustur(e) {
		const {result} = e; $.extend(result, {
			tazeleVazgecSec(e) { return ['tazele', { id: 'sec', args: { template: 'success' } }, 'vazgec'] },
			tazeleVazgec(e) { return ['tazele', 'vazgec'] },
			tamamVazgec(e) { return [{ id: 'tamam', args: { template: 'success' } }, 'vazgec'] },
			tamam(e) { return [{ id: 'tamam', args: { template: 'success' } }] },
			vazgec(e) { return ['vazgec'] }
		})
	}
}
