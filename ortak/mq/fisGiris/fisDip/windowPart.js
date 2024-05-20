class FisDipWindowPart extends FisDipPart {
	static get isSubPart() { return false }
	static get isWindowPart() { return true }
	get wndDefaultIsModal() { return true }
	static get canDestroy() { return true }
	static get gelismisFlag() { return true }
	get gridEtiketGenislik() { return 28 }
	//get gridOranGenislik() { return 9 }
	//get gridBedelGenislik() { return 18 }
	
	
	constructor(e) {
		e = e || {};
		super(e);

		this.title = coalesce(e.title, 'Dip Ekranı');
	}

	runDevam(e) {
		super.runDevam(e);

		const {layout} = this;
		const islemTuslari = this.islemTuslari = layout.find(`.islemTuslari`);
		const islemTuslariPart = this.islemTuslariPart = new ButonlarPart({
			sender: this, layout: islemTuslari,
			tip: 'tamamVazgec',
			butonlarDuzenleyici: e =>
				this.islemTuslariDuzenle(e)
		});
		islemTuslariPart.run();
		
		/*const btnVazgec = islemTuslari.find('#vazgec')
			.jqxButton({ theme: theme })
			.on('click', evt =>
				this.vazgecIstendi({ event: evt }));*/	
	}

	afterRun(e) {
		super.afterRun(e);
		
		this.gridWidget.focus();
		this.show();
	}

	wndOnOpen(e) {
		super.wndOnOpen(e);

		//if (parentPart && !parentPart.isDestroyed)
		//	parentPart.layout.find(':not(.islemTuslari):not(.islemTuslari *)').css('opacity', .8);
	}
	
	wndOnClose(e) {
		super.wndOnClose(e);

		const {parentPart} = this;
		if (parentPart && !parentPart.isDestroyed && parentPart.dipTazele)
			parentPart.dipTazele();
		//if (parentPart && !parentPart.isDestroyed)
		//	parentPart.layout.find(':not(.islemTuslari):not(.islemTuslari *)').css('opacity', 1);
	}

	wndArgsDuzenle(e) {
		super.wndArgsDuzenle(e);
		
		const {wndArgs} = this;
		$.extend(wndArgs, {
			width: '70%', height: '50%',
			position: 'center'
		});
	}

	gridArgsDuzenleDevam(e) {
		super.gridArgsDuzenleDevam(e);

		$.extend(e.args, {
			columnsHeight: 30, rowsHeight: 35
		})
	}

	get defaultTabloKolonlari() {
		const liste = super.defaultTabloKolonlari || [];
		/*const colDef = liste.find(colDef => colDef.belirtec == 'tlBedel');
		if (colDef)
			colDef.genislik = '15%';*/
		liste.push(
			new GridKolon({
				belirtec: 'dvBedel', text: 'Dv.Bedel', minWidth: 100, maxWidth: 160,
				cellClassName: (sender, rowIndex, belirtec, value, rec) => {
					let result = `${belirtec} bedel`;
					result += rec._bedelEditable ? ' editable' : ' readOnly';
					const {_ekCSS} = rec;
					if (_ekCSS)
						result += ` ${_ekCSS}`;
					return result;
				},
				cellBeginEdit: (colDef, rowIndex, belirtec, colType, value, result) => {
					const {gridWidget} = this, rec = gridWidget.getrowdata(rowIndex);
					return !!rec._bedelEditable
				},
				cellValueChanged: e =>
					this.gridHucreDegeriDegisti(e)
			}).tipDecimal_bedel().sifirGosterme()
		);
		return liste
	}

	islemTuslariDuzenle(e) {
		const {liste} = e;
		const yListe = [];
		for (const item of liste) {
			const {id} = item;
			switch (id) {
				case 'tamam':
					item.handler = e =>
						this.tamamIstendi(e);
					break;
				case 'vazgec':
					item.handler = e =>
						this.vazgecIstendi(e);
					break;
			}
			yListe.push(item);
		}
		
		e.liste = yListe;
	}

	contextMenuIstendi(e) {
		// do nothing
	}

	tamamIstendi(e) {
		return this.parentPart.kaydetIstendi(e)
	}

	onResize(e) {
		super.onResize(e)

		/*const {wnd} = this;
		if (wnd && wnd.length) {
			if (this.timer_resize_windowPart)
				clearTimeout(this.timer_resize_windowPart);		
			this.timer_resize_windowPart = setTimeout(() => {
				try {
					const {wnd, grid} = this;
					if ((wnd && wnd.length) && (grid && grid.length)) {
						grid.jqxGrid({ height: wnd.height() - grid.position().top - 10 });
						grid.jqxGrid('refresh');
					}
				}
				finally {
					this.timer_resize_windowPart = null;
				}
			}, 10)
		}*/
	}
}
