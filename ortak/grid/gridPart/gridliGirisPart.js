class GridliGirisPart extends GridPart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get wndClassNames() { return ['gridliGiris', ...super.wndClassNames] }
	static get noFullHeightFlag() { return true } /* static get defaultAsyncFlag() { return false } */
	constructor(e) { super(e); e = e || {}; this.noEmptyRowFlag = asBool(e.noEmptyRow ?? e.noEmptyRowFlag) }
	gridArgsDuzenleDevam(e) {
		super.gridArgsDuzenleDevam(...arguments); let {args} = e;
		$.extend(args, { editable: args.editable ?? true, autoshowcolumnsmenubutton: true });
		if (!this.gridInitFlag) {
			const kontrolcu = this.getKontrolcu(...arguments), tabloKolonlari = e.tabloKolonlari = e.tabloKolonlari || [];
			if (kontrolcu) {
				let _tabloKolonlari = getFuncValue(kontrolcu.tabloKolonlari) || [];
				tabloKolonlari.push(..._tabloKolonlari)
			}
		}
	}
	async defaultLoadServerData(e) {
		let result = []; if (!this.noEmptyRowFlag) {
			for (let i = 0; i < 1; i++) { result.push(this.newRec()) } }
		return result
	}
	gridVeriDegisti(e) {
		return super.gridVeriDegisti(e)
		/* const gridWidget = e?.event?.args.owner ?? this.gridWidget; setTimeout(() => gridWidget.refresh(), 10) */
	}
	gridRendered(e) {
		super.gridRendered(e); if (true || this.dragDropDisabledFlag) return
		const {grid, gridWidget} = this; if (this.isDestroyed || !(gridWidget && grid?.length)) return
		const gridRows = $(gridWidget.table).find('*[role=row]'); if (!gridRows.length) return
		gridRows.jqxDragDrop({
			appendTo: 'body', dragZIndex: 99999, dropAction: 'none',
			initFeedback: feedback => feedback.height(35), dropTarget: $(gridWidget.table), revert: true
		});
		gridRows.off('dragStart'); gridRows.off('dragEnd'); gridRows.off('dropTargetEnter'); gridRows.off('dropTargetLeave');
		gridRows.on('dropTargetEnter', () => gridRows.jqxDragDrop({ revert: false }));
		gridRows.on('dropTargetLeave', () => gridRows.jqxDragDrop({ revert: true }));
		gridRows.on('dragStart', evt => {
			if (!this.isEditable || gridWidget.editcell) { elm.jqxDragDrop({ revert: true }); evt.preventDefault(); return }
			/*if (gridWidget.editcell) gridWidget.endcelledit();*/
			const elm = $(evt.target), /* value = elm.text(), */ position = $.jqx.position(evt.args);
			let rowIndex = gridWidget.getcellatposition(position.left, position.top)?.row;
			if (rowIndex != null && rowIndex > -1) { let rec = gridWidget.getrowdata(rowIndex); if (rec) elm.jqxDragDrop('data', { value: rec }) }
		});
		gridRows.on('dragEnd', evt => {
			if (!this.isEditable) { return }
			if (gridWidget.editcell) { gridWidget.endcelledit() }
			const elm = $(evt.target), {args} = evt, orjRec = args.value;
			let rec = orjRec; /*if (!rec) rec = this.newRec({ rec: rec });*/
			const {originalEvent} = args, kopyami = (args.button == 2 || originalEvent.ctrlKey), position = $.jqx.position(args);
			const rowIndex = gridWidget.getcellatposition(position.left, position.top)?.row, uid = gridWidget.getrowid(rowIndex);
			if (!rec || uid == null || (!kopyami && orjRec.uid == uid)) { elm.jqxDragDrop({ revert: true }); return }
			/*const colDef = this.belirtec2Kolon[column]; if (!(colDef && colDef.isEditable)) { elm.jqxDragDrop({ revert: true }); return }
			gridWidget.setcellvalue(cell.row, column, value); const {uid} = (rec || {}); */
			rec = rec.deepCopy ? rec.deepCopy() : $.extend(true, {}, rec);
			for (const key of this.gridRecOzelkeys) { delete rec[key] }
			const sender = this.sender || this, totalRecs = gridWidget.getrecordscount();
			gridWidget.beginupdate();
			if (rowIndex + 1 >= totalRecs) {
				gridWidget.addrow(null, rec, rowIndex);
				this.gridSatirEklendi({ sender, owner: gridWidget, rowIndex, uid, rowCount: { yeni: totalRecs + 1, eski: totalRecs } })
			}
			else {
				const oldRec = gridWidget.getrowdatabyid(uid) || {}; gridWidget.updaterow(uid, rec);
				this.gridSatirGuncellendi({ sender, owner: gridWidget, rowIndex, uid, rowCount: { yeni: totalRecs, eski: totalRecs } });
				/*for (const colDef of this.duzKolonTanimlari) {
					if (colDef && colDef.cellValueChanged) {
						const {belirtec} = colDef;
						colDef.cellValueChanged({ args: { sender, owner: gridWidget, datafield: belirtec, rowindex: rowIndex, oldvalue: oldRec[belirtec], newvalue: rec[belirtec] } })
					}
				}*/
			}
			if (!kopyami) {
				const _uid = orjRec.uid, emptyRec = this.newRec({ rec: orjRec });
				gridWidget.updaterow(_uid, emptyRec);
				this.gridSatirGuncellendi({ sender, owner: gridWidget, uid: _uid, rowIndex: gridWidget.getrowboundindex(_uid), rowCount: { yeni: totalRecs, eski: totalRecs } });
				/*for (const colDef of this.duzKolonTanimlari) {
					if (colDef && colDef.cellValueChanged) {
						const {belirtec} = colDef;
						colDef.cellValueChanged({ args: { sender, owner: gridWidget, datafield: belirtec, rowindex: rowIndex, oldvalue: orjRec[belirtec], newvalue: emptyRec[belirtec] } })
					}
				}*/
			}
			gridWidget.clearselection(); gridWidget.selectrow(rowIndex); gridWidget.endupdate()
		})
	}
	allowEmptyRow() { this.noEmptyRowFlag = false; return true }
	noEmptyRow() { this.noEmptyRowFlag = true; return true }
}
