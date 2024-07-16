class InjectCode extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	init(e) { setTimeout(() => eConfirm('injected'), 1000) }
	partRun(e) {
		const {asilPart} = e?.sender || {};
		if (asilPart?.inst?.class == MQBarkodRec) {
			for (const fbd of asilPart.builder.getItems()) {
				switch (fbd.id) {
					case 'harDet':
						console.info(fbd); fbd.input.on('change', evt => {
							const target = evt.currentTarget; let {value} = target; const dateVal = value ? asDate(value) : null;
							if (dateVal && !isInvalidDate(dateVal)) { value = target.value = dateToString(dateVal) + ' ' }
						}); break
				}
			}
		}
	}
}
(function() { if (app.ozelKonfYuklendimi) { return } app.ozelKonfYuklendimi = true; return new InjectCode() })()
