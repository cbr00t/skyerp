class ProgressManager extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }

	get wnd() {
		let result = this._wnd || window.wndProgress;
		if ($.isFunction(result))
			result = getFuncValue.call(this, result)
		return result && result.length ? result : null
	}
	set wnd(value) { this._wnd = value }
	get layouts() {
		let result = this._layouts;
		if (!result) {
			const $this = this;
			result = this._layouts = {
				get wnd() { return $this.wnd },
				get content() { const {wnd} = this; return wnd?.length ? wnd.find('div > .content') : null },
				get layout() { const {content} = this; return content?.length ? content.find('.subContent') : null },
				get subLayout() { const {layout} = this; return layout?.length ? layout.find('div') : null },
				get buttons() { const {content} = this; return content?.length ? content.children('.buttons') : null },
				get abortButton() { const {buttons} = this; return buttons?.length ? buttons.children('button:eq(0)') : null },
				get img() { const {subLayout} = this; return subLayout && subLayout.length ? subLayout.children('img') : null },
				get text() { const {subLayout} = this; return subLayout && subLayout.length ? subLayout.children('.text') : null },
				get progressParent() { const {layout} = this; return layout && layout.length ? layout.children('.progress-parent') : null },
				get progress() { const {progressParent} = this; return progressParent && progressParent.length ? progressParent.children('progress') : null },
				get ekBilgi() { const {layout} = this; return layout && layout.length ? layout.children('.ekBilgi') : null }
			}
		}
		return result
	}
	get text() { const {layouts} = this, elm = layouts.text; return elm?.length ? elm.html() : null }
	set text(value) { const {layouts} = this, elm = layouts.text; if (elm?.length) { elm.html(value) } }
	get imgSrc() { const {layouts} = this, elm = layouts.img; return elm?.length ? elm.attr('src') : null }
	set imgSrc(value) { const {layouts} = this, elm = layouts.img; if (elm.length) { elm.attr('src', value) } }
	get imgVisible() { const {layouts} = this, elm = layouts.img; return elm?.length ? !(elm.hasClass('jqx-hidden') || elm.hasClass('basic-hidden')) : false }
	set isImgVisible(value) { const {layouts} = this, elm = layouts.img; if (elm?.length) { const {wnd} = this; if (value) { elm.removeClass('jqx-hidden basic-hidden') } else { elm.addClass('basic-hidden') } } }
	get isProgressVisible() { const {layouts} = this, elm = layouts.progressParent; return elm?.length ? !(elm.hasClass('jqx-hidden') || elm.hasClass('basic-hidden')) : false }
	set isProgressVisible(value) { const {layouts} = this, elm = layouts.progressParent; if (elm?.length) { const {wnd} = this; if (value) { elm.removeClass('jqx-hidden basic-hidden') } else { elm.addClass('jqx-hidden') } } }
	get progressMax() { const {layouts} = this, elm = layouts.progress; return elm?.length ? inverseCoalesce(elm.attr('max'), value => asFloat(value)) : null }
	set progressMax(value) { const {layouts} = this, elm = layouts.progress; if (elm?.length) { elm.attr('max', inverseCoalesce(value, value => asFloat(value))) } }
	get progressValue() { const {layouts} = this, elm = layouts.progress; return elm?.length ? inverseCoalesce(elm.attr('value'), value => asFloat(value)) : null }
	set progressValue(value) {
		const {layouts} = this, elm = layouts.progress;
		if (elm?.length) {
			if (value != null) { value = asFloat(value); const {progressMax} = this; if (progressMax != null && value > progressMax) { value = progressMax } }
			if (!this.isProgressVisible) { this.showProgress() } elm.attr('value', value)
		}
	}
	get ekBilgiText() { const {layouts} = this, elm = layouts.ekBilgi; return elm?.length ? elm.html() : null }
	set ekBilgiText(value) { const {layouts} = this, elm = layouts.ekBilgi; if (elm.length) { elm.html(value) } }
	get isEkBilgiVisible() { const {layouts} = this, elm = layouts.ekBilgi; return em?.length ? !(elm.hasClass('jqx-hidden') || elm.hasClass('basic-hidden')) : false }
	set isEkBilgiVisible(value) { const {layouts} = this, elm = layouts.ekBilgi; if (elm?.length) { if (value) { elm.removeClass('jqx-hidden basic-hidden') } else { elm.addClass('jqx-hidden') } } }
	get ekBilgiHandler() { return this._ekBilgiHandler } set ekBilgiHandler(value) { return this._ekBilgiHandler = value }
	get abortText() { const {layouts} = this, elm = layouts.abortButton; return elm?.length ? elm.html() : null }
	set abortText(value) { const {layouts} = this, elm = layouts.abortButton; if (elm?.length) { elm.html(value) } }
	get isAbortButtonVisible() { const {layouts} = this, elm = layouts.buttons; return elm?.length ? !(elm.hasClass('jqx-hidden') || elm.hasClass('basic-hidden')) : false }
	set isAbortButtonVisible(value) { const {layouts} = this, elm = layouts.buttons; if (elm?.length) { if (value) { elm.removeClass('jqx-hidden basic-hidden') } else { elm.addClass('jqx-hidden') } } }
	get abortBlock() { return this._abortBlock } set abortBlock(value) { return this._abortBlock = value }
	
	constructor(e) { e = e || {}; super(e); $.extend(this, { _wnd: e.wnd, ekBilgiHandler: e.ekBilgiHandler, abortBlock: e.abortBlock ?? e.onAbort }) }
	destroyPart(e) { this._wnd = this._layouts = this._ekBilgiHandler = this._abortBlock = null }
	progressStep(value) { const {layouts} = this, elm = layouts.progress; if (elm?.length) { this.progressValue += (asFloat(value) || 1) } return this }
	progressEnd() { const {layouts} = this, elm = layouts.progress; if (elm?.length) { this.progressValue = this.progressMax } return this }
	progressReset() { const {layouts} = this, elm = layouts.progress; if (elm.length) { this.progressValue = 0 } return this }
	progressNoValue() { const {layouts} = this, elm = layouts.progress; if (elm?.length) { this.progressValue = null } return this }
	close(e) { const {wnd} = this; if (wnd?.length) { wnd.jqxWindow('close') } return this }
	abort(e) {
		e = e || {}; const {wnd, abortBlock} = this;
		if (wnd?.length) {
			let result; if (abortBlock) { const $this = this; $.extend(e, { sender: this, wnd, close(e) { return $this.close() } }); result = getFuncValue.call(this, abortBlock, e) }
			if (result !== false) { wnd.jqxWindow('close') }
		}
		return this
	}
	ekBilgiIstendi(e) {
		e = e || {}; const {wnd, ekBilgiHandler} = this;
		if (ekBilgiHandler && wnd?.length) {
			const $this = this; $.extend(e, { sender: this, wnd, close(e) { return $this.close() } }); let result; result = getFuncValue.call(this, ekBilgiHandler, e)
			if (result !== false) { wnd.jqxWindow('close') }
		}
		return this
	}
	showProgress(e) { const {wnd} = this; if (wnd?.length) { this.isProgressVisible = true } return this }
	hideProgress(e) { const {wnd} = this; if (wnd?.length) { this.isProgressVisible = false } return this }
	showImg(e) { const {wnd} = this; if (wnd?.length) { this.isImgVisible = true } return this }
	hideImg(e) { const {wnd} = this; if (wnd?.length) { this.isImgVisible = false } return this }
	showEkBilgi(e) { const {wnd} = this; if (wnd?.length) { this.isEkBilgiVisible = true } return this }
	hideEkBilgi(e) { const {wnd} = this; if (wnd?.length) { this.isEkBilgiVisible = false } return this }
	showAbortButton(e) { const {wnd} = this; if (wnd?.length) { this.isAbortButtonVisible = true } return this }
	hideAbortButton(e) { const {wnd} = this; if (wnd?.length) { this.isAbortButtonVisible = false } return this }
	setProgressMin(value) { this.progressMin = value; return this }
	setProgressMax(value) { this.progressMax = value; return this }
	setProgressValue(value) { this.progressValue = value; return this }
	setEkBilgiText(value) { this.ekBilgiText = value; return this }
	setEkBilgiVisible(value) { this.isEkBilgiVisible = value; return this }
	setEkBilgHandler(value) { this.ekBilgHandler = value; return this }
	setAbortText(value) { this.abortText = value; return this }
	setAbortButtonVisible(value) { this.isAbortButtonVisible = value; return this }
	setAbortBlock(value) { this.abortBlock = value; return this }
}
