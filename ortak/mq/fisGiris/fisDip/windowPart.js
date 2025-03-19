class FisDipWindowPart extends FisDipPart {
	static get isSubPart() { return false } static get isWindowPart() { return true }
	get wndDefaultIsModal() { return true } static get canDestroy() { return true }
	static get gelismisFlag() { return true } get gridEtiketGenislik() { return 28 }
	constructor(e) { e = e || {}; super(e); this.title = e.title ?? 'Dip Ekranı' }
	runDevam(e) {
		super.runDevam(e); const {layout} = this, islemTuslari = this.islemTuslari = layout.find(`.islemTuslari`);
		const islemTuslariPart = this.islemTuslariPart = new ButonlarPart({
			sender: this, layout: islemTuslari, tip: 'tamamVazgec',
			butonlarDuzenleyici: e => this.islemTuslariDuzenle(e)
		}); islemTuslariPart.run()
	}
	afterRun(e) { super.afterRun(e); this.gridWidget.focus(); this.show() }
	wndOnOpen(e) { super.wndOnOpen(e) }
	wndOnClose(e) {
		super.wndOnClose(e); const {parentPart} = this;
		if (parentPart?.dipTazele && !parentPart.isDestroyed) { parentPart.dipTazele() }
	}
	wndArgsDuzenle(e) {
		super.wndArgsDuzenle(e); const {wndArgs} = this;
		$.extend(wndArgs, { width: '70%', height: '50%', position: 'center' })
	}
	gridArgsDuzenleDevam({ args }) {
		super.gridArgsDuzenleDevam(...arguments);
		$.extend(args, { columnsHeight: 30, rowsHeight: 35 })
	}
	get defaultTabloKolonlari() {
		const liste = super.defaultTabloKolonlari || [];
		liste.push(
			new GridKolon({
				belirtec: 'dvBedel', text: 'Dv.Bedel', minWidth: 80, maxWidth: 160,
				cellClassName: (sender, rowIndex, belirtec, value, rec) => {
					let result = `${belirtec} bedel`;
					result += rec._bedelEditable ? ' editable' : ' readOnly';
					const {_ekCSS} = rec; if (_ekCSS) { result += ` ${_ekCSS}` }
					return result
				},
				cellBeginEdit: (colDef, rowIndex, belirtec, colType, value, result) => !!this.gridWidget.getrowdata(rowIndex)._bedelEditable,
				cellValueChanged: e => { this.gridHucreDegeriDegisti(e) }
			}).tipDecimal_bedel().sifirGosterme()
		);
		return liste
	}
	islemTuslariDuzenle(e) {
		const {liste} = e, yListe = e.liste = [];
		for (const item of liste) {
			const {id} = item; switch (id) {
				case 'tamam': item.handler = e => this.tamamIstendi(e); break
				case 'vazgec': item.handler = e => this.vazgecIstendi(e); break
			}
			yListe.push(item)
		}
	}
	contextMenuIstendi(e) { /* do nothing */ }
	tamamIstendi(e) { return this.parentPart.kaydetIstendi(e) }
}
