class FisDipPart extends GridliGirisPart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'fisDip' }
	static get isSubPart() { return false }
	static get isWindowPart() { return false }
	static get gelismisFlag() { return false }
	get defaultGridIDBelirtec() { return 'belirtec' }
	//get gridEtiketGenislik() { return 16 }
	//get gridOranGenislik() { return 7 }
	//get gridBedelGenislik() { return 14 }
	
	
	constructor(e) {
		e = e || {};
		super(e);

		$.extend(this, {
			islem: e.islem,
			fis: e.inst || e.fis,
			dipIslemci: e.dipIslemci
		});
	}

	runDevam(e) {
		e = e || {};
		super.superRunDevam(e);

		const {layout, fis} = this;
		layout.addClass(this.class.partName);
		
		if (fis && fis.class.dipKullanilirmi) {
			if (!this.dipIslemci && fis.dipIslemci)
				this.dipIslemci = fis.dipIslemci
			
			this.grid = layout.find('.grid');
			this.gridInit(e)
		}
	}

	afterRun(e) {
		e = e || {};
		super.afterRun(e);

		if (app.activePart == this)
			app._activePartStack.pop()
	}

	open(e) {
		let {wndPart} = this;
		if (wndPart && wndPart.isDestroyed) {
			wndPart = null;
			delete this.wndPart
		}
		if (wndPart)
			return wndPart
		
		const {parentPart, layout, islem, fis} = this;
		wndPart = this.wndPart = new FisDipWindowPart({
			parentPart: parentPart,
			layout: $(
				`<div>` +
					`<div class="header">` +
						`<div class="islemTuslari"></div>` +
					`</div>` +
					layout.html() +
				`</div>`
			),
			islem: islem, fis: fis
		});
		wndPart.run();
		
		const {wnd} = wndPart;
		wnd.on('close', evt => {
			delete this.wndPart;
			setTimeout(() => this.onResize(e), 10)
		});
		setTimeout(() => this.onResize(e), 10);

		return wndPart
	}

	close(e) {
		let {wndPart} = this;
		if (!wndPart || wndPart.isDestroyed)
			return null
		
		wndPart.close(e);
		return wndPart
	}

	gridArgsDuzenleDevam(e) {
		super.gridArgsDuzenleDevam(e);

		$.extend(e.args, {
			width: '100%', height: '100%', autoRowHeight: false,
			columnsHeight: 18, rowsHeight: 30
		})
	}

	get defaultTabloKolonlari() {
		const liste = [];
		liste.push(new GridKolon({
			belirtec: 'etiket', text: ' ', minWidth: 100, maxWidth: 300,
			cellClassName: (sender, rowIndex, belirtec, value, rec) => {
				let result = `${belirtec} readOnly`;
				/*const {_ekCSS} = rec;
				if (_ekCSS)
					result += ` ${_ekCSS}`;*/
				return result;
			}
		}).readOnly());
		if (this.class.gelismisFlag) {
			liste.push(
				new GridKolon({
					belirtec: '_oran', text: '%', minWidth: 50, maxWidth: 100,
					cellClassName: (sender, rowIndex, belirtec, value, rec) => {
						let result = belirtec;
						result += rec._oranEditable ? ' editable' : ' readOnly';
						const {_ekCSS} = rec;
						if (_ekCSS)
							result += ` ${_ekCSS}`;
						return result;
					},
					cellBeginEdit: (colDef, rowIndex, belirtec, colType, value, result) => {
						const {gridWidget} = this;
						const rec = gridWidget.getrowdata(rowIndex);
						return !!rec._oranEditable
					},
					cellValueChanged: e =>
						this.gridHucreDegeriDegisti(e)
				}).tipDecimal_bedel().sifirGosterme()
			);
		}
		liste.push(
			new GridKolon({
				belirtec: 'tlBedel', text: 'TL Bedel', minWidth: 100, maxWidth: 160,
				cellClassName: (sender, rowIndex, belirtec, value, rec) => {
					let result = `${belirtec} bedel`;
					result += rec._bedelEditable ? ' editable' : ' readOnly';
					const {_ekCSS} = rec;
					if (_ekCSS)
						result += ` ${_ekCSS}`;
					return result;
				},
				cellBeginEdit: (colDef, rowIndex, belirtec, colType, value, result) => {
					const {gridWidget} = this;
					const rec = gridWidget.getrowdata(rowIndex);
					return !!rec._bedelEditable
				},
				cellValueChanged: e =>
					this.gridHucreDegeriDegisti(e)
			}).tipDecimal_bedel().sifirGosterme()
		);

		return liste;
	}

	async defaultLoadServerData(e) {
		const {dipIslemci} = this;
		return dipIslemci ? dipIslemci.getDipGridSatirlari({ gelismis: this.class.gelismisFlag }) : []
	}

	gridHucreDegeriDegisti(e) {
		const {dipIslemci} = this;
		dipIslemci.satirlariHesapla(e);
		this.tazele();
	}

	gridContextMenuIstendi(e) {
		/*const {event} = e;
		//if (event)
		//	event.preventDefault();*/
		
		setTimeout(() => {
			const wndPart = this.wndPart = new FisDipWindowPart({
				parentPart: this.parentPart,
				islem: this.islem, fis: this.fis,
				layout: $(
					`<div>` +
						`<div class="header">` +
							`<div class="islemTuslari"></div>` +
						`</div>` +
						this.layout.html() +
					`</div>`
				)
			});
			wndPart.run();
			
			const {wnd} = wndPart;
			wnd.on('close', evt => {
				delete this.wndPart;
				setTimeout(() => this.onResize(e), 10)
			});
			setTimeout(() => this.onResize(e), 10)
		}, 100)
	}

	onResize(e) {
		super.onResize(e)
	}
}