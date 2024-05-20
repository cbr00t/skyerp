class GrafikPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get rootPartName() { return 'grafik' } static get partName() { return null } static get isSubPart() { return true }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { value: e.value ?? 50, index: e.index ?? 0, width: e.width || 130, left: e.left || 0 , top: e.top || 0, colors: e.colors });
		if (!this.colors) { this.colors = ['royalblue', 'orangered', 'orange', 'steelblue', 'forestgreen', 'slategray', 'cadetblue', 'darkgreen', 'red'] }
	}
	asHTML(e) { e = e || {}; e.result = ''; this.buildLayout(e); return e.result }
	buildLayout(e) { }
	setValue(value) { this.value = value; return this }
}
class GaugeGrafikPart extends GrafikPart {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get partName() { return 'gauge' }
	constructor(e) {
		e = e || {}; super(e); const {colors} = this; $.extend(this, {
			kucult: e.kucult || 23, thickness: e.thickness || 10, fillColor: e.fillColor, backColor: e.backColor || 'lightgray',
			noLabelFlag: e.noLabel ?? true
		})
	}
	buildLayout(e) {
		super.buildLayout(e); const getConvertedPxValue = value => typeof value == 'number' ? `${value}px` : value;
		const {value, index, width, left, top, kucult, parentWidth,  backColor, thickness, noLabelFlag} = this;
		const colors = this.colors ?? [], fillColor = this.fillColor || colors[index || 0];
		const widthStr = getConvertedPxValue(width), leftStr = getConvertedPxValue(left), topStr = getConvertedPxValue(top);
		const kucultStr = getConvertedPxValue(kucult), thicknessStr = getConvertedPxValue(thickness);
		e.result +=
			`<div class="${this.birlesikPartName} part" style="
					--value: ${value}; --index: ${index}; --width: ${widthStr}; --kucult: ${kucultStr};
					--left: ${leftStr}; --top: ${topStr}; --fillColor: ${fillColor}; --backColor: ${backColor}; --thickness: ${thicknessStr}">
				${noLabelFlag ? '' : `<label>%${value}</label>`}
			</div>`
	}
	asHTMLWithIcrement(e) { const result = this.asHTML(e); if (result) { this.newIndex().updatePosAndSize() } return result }
	buildLayoutWithIncrement(e) { const result = this.buildLayout(e); if (result) { this.newIndex().updatePosAndSize() } return result }
	newIndex() { this.index = (this.index || 0) + 1; return this }
	updatePosAndSize() {
		const px2Num = value => asFloat((typeof value == 'string') ? value.slice(0, -2) : value);
		const {kucult} = this; let width = px2Num(this.width), left = px2Num(this.left), top = px2Num(this.top);
		width -= kucult; left += (kucult / 2); top -= (width + (kucult / 2));
		$.extend(this, { width, left, top }); return this
	}
	resetColors() { this.colors = null; return this }
	noLabel() { this.noLabelFlag = true; return this }
	withLabel() { this.noLabelFlag = false; return this }
}


/*
	0: normal
	1: (initwidth-kucult/2)
	2: (initwidth-kucult/2) + (initwidth-2*kucult/2) 
	3: (initwidth-kucult/2) + (initwidth-2*kucult/2) + (initwidth-3*kucult/2)
	
	n. islemde
	(n-1). deger + (initwidth - (n)*kucult/2)
*/
