class Part extends CObject {
	static { window[this] = this; this._key2Class[this.name] = this }
	static get partName() { return null }
	run(e) {
		e = e || {};
		this.init(e);
		this.runDevam(e);
		this.afterRun(e)
	}
	destroyPart(e) {
		let {layout} = this;
		if (layout?.length)
			layout.remove()
		app.activePart = null
	}
	init(e) {
		const content = app.layout; let {layout} = this;
		let {activePart} = app;
		if (activePart)
			activePart.destroyPart()
		activePart = app.activePart = this;
		if (!layout?.length) {
			layout = this.layout = this.getLayout(e);
			if (layout?.length && !layout.parent()?.length) {
				layout.addClass('basic-hidden');
				layout.removeClass('jqx-hidden')
			}
		}
		if (layout?.length) {
			const {partName} = this.class;
			layout.addClass(`${partName} part`);
			layout.removeClass('jqx-hidden basic-hidden');
			if (!layout.parent()?.length)
				layout.appendTo(content)
		}
	}
	runDevam(e) { }
	afterRun(e) { }
	getLayout(e) {
		const {partName} = this.class, content = app.layout, body = $('body');
		let layout = content.children(`#${partName}.part`);
		if (!layout?.length)
			layout = content.children(`.${partName}.part`);
		if (!layout?.length)
			layout = body.children(`#${partName}.part`);
		if (!layout?.length)
			layout = body.children(`.${partName}.part`);
		if (layout?.length && layout[0].tagName.toUpperCase() == 'TEMPLATE')
			layout = layout.contents('div').clone(true)
		return layout
	}
}
class PaymentPart extends Part {
	static { window[this] = this; this._key2Class[this.name] = this }
	static get partName() { return 'payment' }
	runDevam(e) {
		super.runDevam(e);
		const {layout} = this;
		const paymentForm = this.paymentForm = layout.find('.payment-form');
		let inputs = this.inputs = layout.find('input[type=textbox], input[type=number], input[type=pass]');
		inputs.on('input', evt => evt.currentTarget.setCustomValidity(''));
		inputs.on('focus', evt => evt.currentTarget.select());
		inputs.on('change', evt => this.validateIslemi($.extend({}, e, { event: evt })));
		const btnTamam = this.btnTamam = paymentForm.find('#tamam');
		btnTamam.jqxButton({ theme: theme, template: 'success', disabled: true });
		btnTamam.on('click', evt => this.tamamIstendi($.extend({}, e, { event: evt })));
		const txtIsim = this.txtIsim = paymentForm.find('#cardholder-name');
		txtIsim.on('input', evt => this.isimDegisti($.extend({}, e, { event: evt })));
		const txtKartNo = this.txtKartNo = paymentForm.find('#card-number');
		txtKartNo.on('input', evt => this.kartNoDegisti({ e, event: evt }));
		const txtSKT = this.txtSKT = paymentForm.find('#expiry-date');
		txtSKT.on('input', evt => this.sktDegisti($.extend({}, e, { event: evt })));
		const txtCVV = this.txtCVV = paymentForm.find('#cvv');
		txtCVV.on('input', evt => this.cvvDegisti($.extend({}, e, { event: evt })));
		paymentForm.on('keyup', evt => {
			const key = evt.key?.toLowerCase();
			if (key == 'enter' || key == 'linefeed')
				btnTamam.click()
		});
		//input.on('change', evt => this.validateIslemiInternal($.extend({}, e, { event: evt })))
		setTimeout(() => txtIsim.focus(), 1)
	}
	tamamIstendi(e) { debugger }
	validateIslemi(e) {
		const target = e.event.currentTarget;
		this.validateIslemiInternal(e);
		target.reportValidity()
	}
	validateIslemiInternal(e) {
		const target = e.event.currentTarget, {id, value} = target;
		target.setCustomValidity('');
		if (target.checkValidity()) {
			switch (id) {
				case 'cardholder-name':
					if (value && !value.includes(' '))
						target.setCustomValidity(`Lütfen Kart Sahibinin Adı ve Soyadı bilgilerini tam olarak yazınız`)
					break
				case 'expiry-date':
					if (value) {
						const parts = value.split('/'), _today = today();
						const ya = { ay: asInteger(parts[0]), yil: asInteger(parts[1]) };
						const buYA = { ay: _today.getMonth() + 1, yil: asInteger(_today.toString('yy')) };
						if (ya.ay < 1 || ya.ay > 12 || ya.yil < buYA.yil || (ya.yil == buYA.yil && ya.ay < buYA.ay))
							target.setCustomValidity(`Son Kullanım Tarihi hatalıdır`)
					}
					break
				case 'cvv':
					if (!value || Array.from(value).filter(x => $.isNumeric(x)).length != 3)
						target.setCustomValidity(`CVV (Güvenlik Kodu) 3 haneli sayı olmalıdır`)
			}
		}
		this.btnTamam.jqxButton('disabled', !Array.from(this.inputs).every(elm => elm.checkValidity()))
	}
	isimDegisti(e) {
		const target = e.event.currentTarget;
		let {value} = target;
		if (value)
			value = target.value = value.toLocaleUpperCase()
	}
	kartNoDegisti(e) {
		const target = e.event.currentTarget;
		let {value} = target;
		if (value) {
			const Separator = ' ';
			const PartSize = 4, MaxParts = 4;
			let result = '', partCount = 0;
			let _value = Array.from(value.trim()).filter(x => x != '-' && $.isNumeric(x));
			while (_value.length) {
				let temp = _value.splice(0, PartSize).join('');
				if (!temp)
					continue
				if (result)
					result += Separator
				result += temp.trim();
				partCount++;
				if (partCount == MaxParts)
					break
			}
			if (result != value)
				value = target.value = result
		}
	}
	sktDegisti(e) {
		const target = e.event.currentTarget;
		let {value} = target;
		if (value) {
			const Separator = '/';
			const PartSize = 2, MaxParts = 2;
			let result = '', partCount = 0;
			let _value = Array.from(value.trim()).filter(x => x != '-' && $.isNumeric(x));
			while (_value.length) {
				let temp = _value.splice(0, PartSize).join('');
				if (!temp)
					continue
				temp = temp.trim();
				if (result)
					result += Separator
				result += temp.trim();
				partCount++;
				if (partCount == MaxParts)
					break
			}
			if (result != value)
				value = target.value = result
		}
	}
	cvvDegisti(e) {
		const target = e.event.currentTarget;
		let {value} = target;
		let result = Array.from(value.trim()).filter(x => x != '-' && $.isNumeric(x)).join('');
		const PartSize = 3;
		if (result.length > PartSize)
			result = result.slice(0, PartSize)
		else if (asInteger(result) <= 0)
			result = ''
		value = target.value = result
	}
}