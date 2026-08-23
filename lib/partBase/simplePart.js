class SimplePart extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isWindow() { return true }
	static get title() { return null }
	static get islemTuslariVarmi() { return true }
	
	get builders() { return this._builders }
	get isWindow() { return this._isWindow ?? this.class.isWindow }
	set isWindow(v) {
		let { part } = this
		if (part)
			throw { isError: true, errorText: `Ekran oluştuktan sonra 'isWindow' ataması yapılamaz` }
		this._isWindow = v
	}
	get rfb() { return this._rfb }
	set rfb(v) { this._rfb = v }
	get part() { return this.rfb?.part ?? this._part }
	set part(v) {
		let { rfb } = this
		if (rfb)
			rfb.part = v
		else
			this._part = v
	}
	get title() { return this.part?.title ?? this._title ?? this.class.title }
	set title(v) {
		let { part } = this
		if (part)
			part.updateWndTitle(v)
		else
			this._title = v
	}
	get islemTuslariVarmi() {
		let { part: hasPart } = this
		return hasPart ? !!this.islemTuslari : this._islemTuslariVarmi ?? this.class.islemTuslariVarmi
	}
	get islemTuslari() { return this.rfb?.id2Builder?.islemTuslari }
	get parentPart() { return this.rfb?.parentPart ?? this._parentPart }
	set parentPart(v) {
		let { rfb } = this
		if (rfb)
		   rfb.parentPart = v
		else
			this._parentPart = v
	}
	get parent() { return this.rfb?.parent ?? this._parent }
	set parent(v) {
		let { rfb } = this
		if (rfb)
		   rfb.parent = v
		else
			this._parent = v
	}
	get layout() { return this.rfb?.id2Builder?.content ?? this._layout }
	set layout(v) {
		let { rfb } = this
		if (rfb)
		   rfb.layout = v
		else
			this._layout = v
	}
	get content() { return this.rfb?.id2Builder?.content }
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, '_rfb'] }

	static get ekBilgi_styleAndTools() {
		let { _ekBilgi_styleAndTools: res } = this
		if (!res) {
	        let t = {
	            tag(v, tag, cssClass, style) {
	                return [
	                    `<${tag} class="${
	                        ['item', cssClass]
	                            .filter(Boolean)
	                            .join(' ')
	                    }" style="${style || ''}">` +
	                        v +
	                    `</${tag}>`
	                ]
	            },
	            span(v, ...rest) {
					return this.tag(v, 'span', ...rest)
				},
				div(v, ...rest) {
					return this.tag(v, 'div', ...rest)
				},
	            ka(id, etiket, veri) {
					if (veri == null || veri === '')
						return ''
					
	                return [
	                    `<div class="${id} ka item flex-row">`,
	                        this.div(etiket, 'etiket'),
	                        this.div(veri, 'veri'),
	                    `</div>`
	                ].join('')
	            }
	        }
	        let style = [
	            `$elementCSS { width: calc(var(--full) - 35px) !important; margin: 30px 0; padding: 10px 20px; overflow-y: auto !important }
				 $elementCSS:not(:empty) { box-shadow: 0 0 2px 0 #aaa; border-radius: 10px }
	             $elementCSS > .parent { gap: 25px }
	             $elementCSS > .parent .item { gap: 20px }
	             $elementCSS .etiket { color: #888 }
	             $elementCSS .veri { font-weight: bold; font-size: 100%; color: royalblue }`
	        ]
	
	        res = this._ekBilgi_styleAndTools = { tools: t, style }
		}

		return res
    }
	get ekBilgi_styleAndTools() { return this.class.ekBilgi_styleAndTools }


	constructor(e = {}) {
		super(e)
		let { builders: _builders, rfbEkDuzenleyici = e.rfbEkDuzenle, args } = e
		_builders ??= {}
		extend(this, { _builders, rfbEkDuzenleyici })
		if (args)
			extend(this, ...args)
	}
	static run(e = {}) {
		let inst = new this(e)
		return inst.run(e)
	}
    run(e = {}) {
		let { rfb, rfbEkDuzenleyici } = this
		let { title, isWindow, islemTuslariVarmi } = this
		let { parentPart, part, parent, layout } = this
		
		if (!rfb)
			rfb = new RootFormBuilder()
		rfb
			.setInst(this)
			.setParentPart(parentPart)
			.setPart(part)
			.setParent(parent)
			.setLayout(layout)
		if (isWindow)
			rfb = rfb.asWindow(title)

		this.rfb = rfb
		if (islemTuslariVarmi) {
			let height = 50
			rfb.addIslemTuslari()
				.setTip('vazgec')
				.addStyle_fullWH(null, height)
		}
		rfb.addForm('content').altAlta()
			.addCSS('dock-bottom')
			.addStyle_fullWH()

		this.rfbDuzenle(e)
		rfbEkDuzenleyici?.call?.(this, { ...e, sender: this })
		rfb.onAfterRun(_e =>
			this.afterRun({ ...e, ..._e }))
		
		rfb = this.rfb
		rfb.run()
		return this
	}
	afterRun(e) { }
	rfbDuzenle(e) { }
	close() { return this.part?.close?.(...arguments) }

	shallowCopy(e) {
		let res = super.shallowCopy(e)
		return res
	}
	deepCopy(e) {
		let res = super.deepCopy(e)
		return res
	}

	setRFB(v) { this.rfb = v; return this }
	setParentPart(v) { this.parentPart = v; return this }
	setPart(v) { this.part = v; return this }
	setParent(v) { this.parent = v; return this }
	setLayout(v) { this.layout = v; return this }
	islemTuslariVar(v) { this.islemTuslariVarmi = true; return this }
	islemTuslariYok(v) { this.islemTuslariVarmi = false; return this }
	asForm(v) { this.isWindow = false; return this }
	asWindow(v) { this.isWindow = true; return this }
	setTitle(v) { this.title = v; return this }
	getContent() { return this.content }
	getBuilders() { return this.builders }
	rfbEkDuzenle(v) { this.rfbEkDuzenleyici = v; return this }
}
