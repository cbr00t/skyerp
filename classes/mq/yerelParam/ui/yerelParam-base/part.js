class MQYerelParamBaseTanimPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get rootPartName() { return 'yerelParamBaseTanim' }
	static get partName() { return this.rootPartName }
	get defaultLayoutSelector() { return `#${this.class.partName}` }
	get wndDefaultIsModal() { return true }
	static get canDestroy() { return true }
	
	get builder() {
		let result = this._builder;
		if (result && $.isFunction(result)) {
			const _e = {
				sender: this, commitFlag: true,
				commit() { this.commitFlag = true; return this },
				temp() { this.commitFlag = false; return this }
			};
			result = getFuncValue.call(this, result, _e);
			if (_e.commitFlag)
				this._builder = result
		}
		return result
	}
	set builder(value) { this._builder = value }

	get yenimi() { return this.islem == 'yeni' }
	get degistirmi() { return this.islem == 'degistir' }
	get silmi() { return this.islem == 'silmi' }
	get kopyami() { return this.islem == 'kopya' }
	get yeniVeyaKopyami() { return this.yenimi || this.kopyami }
	get degistirVeyaSilmi() { return this.degistirmi || this.silmi }
	
	constructor(e) {
		e = e || {};
		super(e);
		$.extend(this, {
			islem: e.islem, mfSinif: e.mfSinif,
			inst: e.inst, eskiInst: e.eskiInst,
			_builder: e.builder,
			kaydedince: e.kaydedince
		});
		let {mfSinif, inst, eskiInst} = this;
		if (!inst && mfSinif)
			inst = this.inst = new mfSinif();
		if (inst && !mfSinif)
			mfSinif = this.mfSinif = inst.class;
		if (inst && !eskiInst && this.degistirmi)
			eskiInst = this.eskiInst = inst.deepCopy();
		this.title = this.title || `${(mfSinif || {}).sinifAdi || 'Parametre'} Tanım`;
		const {islem} = this;
		if (islem) {
			const islemText = islem[0].toUpperCase() + islem.slice(1);
			this.title += ` &nbsp;[<span class="window-title-ek">${islemText}</span>]`
		}
	}
	init(e) {
		e = e || {};
		super.init(e);
		//const _e = $.extend({}, e, { wndArgs: this.wndArgs });
		//this.wndArgsDuzenle(_e)
	}
	runDevam(e) {
		e = e || {};
		super.runDevam(e);
		const {layout} = this;
		layout.addClass(`${this.class.partName} ${this.class.rootPartName} part`);
		const btnTamam = this.btnTamam = layout.find('#tamam');
		if (btnTamam && btnTamam.length) {
			btnTamam.jqxButton({ theme: theme, width: false, height: false });
			btnTamam.on('click', evt =>
				this.kaydetIstendi($.extend({}, e, { event: evt })))
		}
		layout.add(this.class.rootPartName)
	}
	async afterRun(e) {
		e = e || {};
		super.afterRun(e);

		let {layout} = this;
		const {wnd, mfSinif, inst} = this;
		if (wnd?.length) {
			layout = this.wndContent;
			wnd.addClass(`${this.class.partName} ${this.class.rootPartName} part`)
		}
		const _e = {
			sender: this, parentPart: this.parentPart, part: this,
			layout: layout, parent: this.parent, inst: inst, mfSinif: mfSinif
		};
		let {builder} = this;
		if (!builder) {
			if (mfSinif && mfSinif.getRootFormBuilder)
				builder = this.builder = await mfSinif.getRootFormBuilder(_e)
		}
		if (builder && builder.run)
			await builder.run(_e)
		
		let elms = layout.find('input[type=textbox], input[type=password], input[type=number]');
		if (elms.length) {
			elms.on('focus', evt =>
				evt.target.select());
			elms.on('keyup', evt => {
				const key = (evt.key || '').toLowerCase();
				if (key == 'enter' || key == 'linefeed')
					this.kaydetIstendi($.extend({}, e, { event: evt }))
			})
		}

		setTimeout(() => {
			const {wnd} = this;
			if (wnd?.length)
				wnd.jqxWindow('resize')
		}, 500)
	}
	destroyPart(e) {
		super.destroyPart(e);
		const {wnd} = this;
		if (wnd) {
			delete this.wnd;
			wnd.jqxWindow('destroy')
		}
	}
	wndArgsDuzenle(e) {
		super.wndArgsDuzenle(e);
		const {args} = e;
		$.extend(args, { width: $(window).width() < 1000 ? '100%' : '70%', height: 650 })
	}

	close(e) {
		const {wnd} = this;
		if (wnd)
			wnd.jqxWindow('close')
		else
			this.hide()
	}
	kaydetIstendi(e) {
		const {inst} = this;
		if (this.kaydetOncesiIslemler(e) === false)
			return false
		inst.kaydet();
		if (this.kaydetSonrasiIslemler(e) === false)
			return false
		const {kaydedince} = this;
		if (kaydedince) {
			if (getFuncValue.call(this, kaydedince, _e) === false)
				return false
		}
		this.close(e);
		return true
	}
	kaydetOncesiIslemler(e) {
	}
	kaydetSonrasiIslemler(e) {
	}
}
