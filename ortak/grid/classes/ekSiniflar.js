class GridState extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get sender() { return this._sender ?? this.gridPart } set sender(value) { this._sender = value }
	get activePart() { return app.activePart } get isSubPart() { return this.gridPart?.isSubPart }
	get builder() { return this.gridPart?.builder } get eventTS() { return this.event?.timeStamp ?? now() }
	get eventType() { return this.event?.type?.toLowerCase() }
	get activeElement() { return document.activeElement ? $(document.activeElement) : null }
	get hasFocus() { let {activeElement} = this; return (activeElement?.hasClass('jqx-grid') || !!activeElement?.parents('.jqx-grid')?.length) ?? false }
	get targetIsGrid() { let {event, grid} = this; return grid && event?.target == grid }
	get grid() { return this.gridPart?.grid } get gridWidget() { return this.gridPart?.gridWidget }
	get dataView() { return this.gridPart?.dataView } get boundRecs() { return this.gridPart?.boundRecs }
	get totalRecs() { return this.gridPart?.totalRecs } get totalCols() { return this.gridPart?.totalCols }
	get selectedCell() { return this.gridPart?.selectedCell } get editing() { return !!this.editCell }
	get selectedRowIndex() { return this.gridPart?.selectedRowIndex } get selectedBelirtec() { return this.gridPart?.selectedBelirtec }
	get editCell() { return this.gridPart?.editCell } get uid() { return this.gridWidget?.getrowid(this.rowIndex) }
	get rowIndex() { return Math.max(this.selectedCell?.rowindex ?? 0, 0) } get belirtec() { return this.selectedCell?.datafield }
	get colIndex() { return this.gridWidget?.getcolumnindex(this.belirtec) }
	get selectedRec() { return this.gridPart?.selectedRec } get selectedRecs() { return this.gridPart?.selectedRecs }
	get belirtec2Kolon() { return this.gridPart?.belirtec2Kolon } get colDef() { return this.belirtec2Kolon?.[this.belirtec] }
	get jqxCol() { let {belirtec, gridWidget} = this; return belirtec ? gridWidget?.getcolumn(belirtec) : null }
	get gridEditable() { return this.gridWidget?.editable } get colEditable() { return this.jqxCol?.editable }
	get editable() { return this.gridEditable && this.colEditable } get sabitmi() { return this.gridPart.sabitFlag }
	get canHandleEvents() {
		let {gridWidget, activePart, isSubPart, activeElement, eventTS, lastEventTS} = this;
		if (!gridWidget) { return false }
		if (!/*!this.isSubPart &&*/ app.activePart && app.activePart != this) { return false }
		if (lastEventTS && eventTS == lastEventTS) { return false }
		if (activeElement?.[0].tagName?.toUpperCase() == 'TEXTAREA') { return false }
		return true
	}
	get newEventArgs() {
		let keyState = this, {
			sender, builder, event, eventType, key, modifiers, hasModifiers, eventTS: timeStamp, targetIsGrid,
			gridPart, grid, gridWidget, rowIndex, belirtec, colDef, jqxCol, selectedCell, editCell,
			gridEditable, colEditable, editable, result
		} = this;
		return {
			keyState, sender, gridPart, builder, event, eventType, key, modifiers, hasModifiers, timeStamp, targetIsGrid,
			gridPart, grid, gridWidget, rowIndex, belirtec, colDef, jqxCol, selectedCell, editCell,
			gridEditable, colEditable, editable, result
		}
	}
	get tusaBasilincaBlock() { return this.gridPart?.tusaBasilincaBlock }
	constructor(e) {
		e = e ?? {}; super(e); let {gridPart, sender: _sender, event, lastEventTS, result} = e;
		$.extend(this, { gridPart, _sender, event, lastEventTS, result })
	}
	run(e) {
		if (!this.canHandleEvents) { return null }
		this.saveLastEventTS(); let result = this.runDevam(e);
		return result
	}
	runDevam(e) {
		let result = this.dispatchEvents(e); if (result != null) { return result }
		return this.runInternal(e)
	}
	runInternal(e) { }
	dispatchEvents(e) { this.signalEvents(e); return this.result }
	signalEvents(e) { }
	setEvent(value) { this.event = value; return this }
	setResult(value) { this.result = value; return this } resetResult() { return this.setResult(undefined) }
	saveLastEventTS() { this.lastEventTS = this.eventTS; return this }
}

class GridKeyState extends GridState {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get canHandleEvents() { return super.canHandleEvents && this.hasFocus }
	get isKeyDown() { return this.eventType == 'keydown' }
	get key() {
		let result = this.event?.key ?? '';
		if (result?.toLowerCase() == 'linefeed') { result = 'Enter' }
		return result
	}
	get keyLower() { return this.key?.toLowerCase() } 
	get hasModifiers() { return !!Object.keys(this.modifiers).length }
	get modifiers() { let {event: evt} = this; return { ctrl: evt?.ctrlKey, shift: evt?.shiftKey, alt: evt?.altKey } }
	runInternal(e) { super.runInternal(e) }
	signalEvents(e) {
		super.signalEvents(e); let {gridPart, colDef, tusaBasilincaBlock: tusaBasilinca, newEventArgs} = this;
		colDef = colDef ?? new GridKolon();
		let _e = { ...e, ...newEventArgs }, result;
		result = _e.result = colDef?.handleKeyboardNavigation?.(_e) ?? result;
		result = _e.result = tusaBasilinca?.call(gridPart, _e) ?? result;
		result = _e.result = colDef?.handleKeyboardNavigation_ortak?.(_e) ?? result;
		return this.setResult(result)
	}
}
