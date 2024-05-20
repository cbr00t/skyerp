class TarihUIPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true } static get partName() { return 'uiTarih' }
	get hasTime() { const {timeLayout} = this; return timeLayout?.length }
	get value() {
		const {layout, hasTime} = this; let result = asDate(tarihDegerDuzenlenmis(layout?.length ? layout.val() : this._value));
		if (hasTime) { const _value = this.timeLayout.val(); if (_value) result.setTime(asDate(timeFormatString(_value, this.saniyesizFlag))) }
		return result
	}
	set value(value) {
		const {layout} = this;
		if (layout?.length) { layout.val(dateToString(value)); if (this.hasTime) this.timeLayout.val(timeToString(asDate(value), this.saniyesizFlag)) } else { this._value = value }
	}

	constructor(e) {
		e = e || {}; super(e); const getValue = (value, defValue) => value == null ? defValue : value;
		$.extend(this, {
			builder: e.builder, _value: e.value ? asDate(e.value) : null, timeLayout: e.timeLayout, saniyesizFlag: coalesce(e.saniyesizFlag || e.saniyesiz, true),
			autoComplete: e.autoComplete, placeHolder: e.placeHolder, argsDuzenleBlock: e.argsDuzenleBlock || e.argsDuzenle, degisinceEvent: []
		});
		const degisinceBlock = e.degisince || e.degisinceBlock; if (degisinceBlock) { this.change(degisinceBlock) }
	}
	runDevam(e) {
		e = e || {}; super.runDevam(e); const {partName} = this.class, {layout, timeLayout} = this;
		layout.addClass(`${partName} date`); if (timeLayout?.length) timeLayout.addClass(`${this.class.partName} time`)
		const ci = Date.CultureInfo,  _e = $.extend({}, e, {
			sender: this, builder: this.builder,
			args: {
				changeMonth: true, changeYear: true, theme, /*, currentDate: asDate(secim.deger || secim.default), */
				constrainInput: false, showButtonPanel: true /*, showOn: 'button'*/, buttonText: 'Tarih Seç', buttonImage: 'lib/calendar.gif', buttonImageOnly: true,
				dateFormat: /*ci.shortDate*/ 'dd.mm.yy', firstDay: ci.firstDayOfWeek, weekHeader: 'Hft.', showWeek: true, currentText: 'BUGÜN', closeText: 'KAPAT',
				dayNames: ci.dayNames, dayNamesShort: ci.abbreviatedDayNames, dayNamesMin: ci.shortestDayNames, monthNames: ci.monthNames, monthNamesShort: ci.abbreviatedMonthNames
			}
		});
		const {argsDuzenleBlock} = this; if (argsDuzenleBlock) getFuncValue.call(this, argsDuzenleBlock, _e)
		const input = layout.datepicker(_e.args); input.datepicker($.datepicker.regional['tr']);
		if (!this.autoComplete) { input.attr('autocomplete', 'off') }
		input.on('change', evt => {
			const elm = $(evt.target), {value} = elm[0];
			if (value && !isInvalidDate(value)) elm.data('lastValue', value); this.onChange({ event: evt })
		});
		input.on('focus', evt => evt.target.select());
		input.on('blur', evt => {
			const elm = $(evt.target), value = tarihDegerDuzenlenmis(elm.val(), () => elm.data('lastValue'));
			if (value) { evt.preventDefault(); elm.val(value || ''); } else if (this.hasTime) this.timeLayout.val(null)
		});
		const value = this._value || null; if (value !== undefined) input.val(dateToString(value));
		if (this.hasTime) {
			const {timeLayout} = this;
			timeLayout.on('change', evt => { const {target} = evt; target.value = timeToString(asDate(target.value), this.saniyesizFlag); this.onChange({ event: evt }) });
			timeLayout.on('focus', evt => evt.target.select());
			if (value) { timeLayout.val(timeToString(asDate(value), this.saniyesizFlag)) }
		}
		return input
	}
	val(value) { if (value === undefined) { return this.value } this.value = value; return this }
	saniyesiz() { this.saniyesizFlag = true; return this }
	saniyeli() { this.saniyesizFlag = false; return this }
	focus(e) { this.layout.focus(); return this }
	change(handler) { const {degisinceEvent} = this; if (!degisinceEvent.find(x => x == handler)) degisinceEvent.push(handler); return this }
	degisince(handler) { return this.change(handler) }
	on(eventName, handler) { if (eventName == 'change') return this.change(handler); return this }
	off(eventName, handler) {
		if (eventName == 'change') {
			if (handler) { const {degisinceEvent} = this, ind = degisinceEvent.findIndex(x => x == handler); if (ind != null && ind > -1) degisinceEvent.splice(ind, 1); return this }
			else return change(handler)
		}
		return this
	}
	onChange(e) {
		e = e  || {}; const evt = e.event;
		if (this.inEvent) { if (evt) evt.preventDefault(); return }
		try {
			const {degisinceEvent} = this;
			if (!$.isEmptyObject(degisinceEvent)) {
				const {value} = this, _e = { sender: this, builder: this.builder, event: evt, value };
				for (const handler of degisinceEvent) getFuncValue.call(this, handler, _e)
			}
		}
		finally { setTimeout(() => this.inEvent = false, 10) }
	}
}
