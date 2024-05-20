class BekleyenleriGetirPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'bekleyenleriGetir' }
	static get isWindowPart() { return true }
	
	constructor(e) {
		e = e || {};
		super(e);

		let secimler = this.secimler = e.secimler;
		if (!secimler)
			this.secimlerOlustur(e)
		
		this.title = e.title == null ? (
			'Bekleyen e-İşlemleri Getir'
		) : e.title || ''
	}

	secimlerOlustur(e) {
		e = e || {};
		this.secimler = new Secimler({
			liste: { tarih: new SecimDate({ etiket: 'Tarih', basi: today().addDays(-25) }) }
		})
	}

	runDevam(e) {
		e = e || {};
		super.runDevam(e);

		const {layout} = this;
		$.extend(this, {
			header: layout.find('.header'),
			secimlerParent: layout.find('.secimler.content')
		});
		this.islemTuslari = this.header.find('.islemTuslari');
		this.secimlerForm = this.secimlerParent.children('.secimler-form');
		
		this.initIslemTuslari(e);
		this.initFiltreForm(e)
	}
	initIslemTuslari(e) {
		const {header} = this;
		const islemTuslari = this.islemTuslari = header.find(`.islemTuslari`);
		let _e = { args: { sender: this, layout: islemTuslari } };
		if (this.islemTuslariDuzenle(_e) === false)
			return null;
		const islemTuslariPart = this.islemTuslariPart = new ButonlarPart(_e.args);
		islemTuslariPart.run();
		return islemTuslariPart
	}
	islemTuslariDuzenle(e) {
		const {args} = e;
		args.ekButonlarIlk = [
			{ id: 'tamam', handler: e => this.tamamIstendi(e) },
			{ id: 'vazgec', handler: e => this.vazgecIstendi(e) }
		]
	}
	initFiltreForm(e) {
		e = e || {};
		const part = new SecimlerPart({
			secimler: this.secimler,
			secimlerParent: this.secimlerParent,
			secimlerForm: this.secimlerForm
		});
		part.initTabLayout_secimler()
	}

	baslat(e) {
		const {tarih} = this.secimler;
		return false
	}

	async tamamIstendi(e) {
		if (!await this.baslat(e))
			return
		this.close()
	}
	vazgecIstendi(e) {
		this.close()
	}
}
