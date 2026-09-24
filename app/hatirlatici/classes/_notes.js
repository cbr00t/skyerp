let cls = (class extends SimplePart {
	static get partName() { return 'hatirlatici' }
	static get title() { return 'Hatırlatıcı' }
	static get islemTuslariVarmi() { return false }

	run(e) { return super.run(e) }
	async afterRun() { }
	rfbDuzenle() {
		super.rfbDuzenle()
		let { rfb } = this
		rfb
			.addStyle_fullWH()
			.addStyle(
				`$elementCSS { --header-height: 80px }
				 $elementCSS .wnd-content { padding: 30px !important }
				 /*$elementCSS > #header { }*/`
			)

		let header = rfb.addForm('header')
			.setLayout($(
				`<div>
					<button id="assign" class="emoji" title="Görevi Al">?</button>
					<button id="release" class="emoji" title="Görevi BIRAK">??</button>
					<!--<button id="close" class="jqx-danger" title="Kapat">X</button>-->
				</div>`
			))
			.onAfterRun(({ builder: fbd, ...rest }) => {
				let { layout } = fbd
				layout.find('button')
					.click( ({ currentTarget: target }) => {
						let { id } = target
						switch (id) {
							case 'assign': { console.info('assign', fbd, rest); break }
							case 'release': { console.info('release', fbd, rest); break }
							// case 'close': { this.close(); break }
						}
					})
					.jqxButton({ theme })
			})
			.addCSS('absolute')
			.addStyle_wh('auto', 'var(--header-height)')
			.addStyle(
				`$elementCSS { right: 20px; padding: 0 5px }
				 $elementCSS > button { font-weight: bold; font-size: 120%; margin: 15px 10px; padding: 10px 20px }
				 $elementCSS > button.emoji { font-size: 210% }
				 /*$elementCSS > button#close { position: fixed; top: 3px; right: 250px; width: 50px; height: 30px; color: #111; padding: 0 }*/
				`
			)
		
		rfb.addGridliGosterici('grid')
			.rowNumberOlmasin()
			.setTabloKolonlari([
				gridKolon('_text', 'Hatırlatıcılar').noSql()
			])
			.setSource(async e => {
				return [
					{ id: '..', _text: `content ...` },
					{ id: '...', _text: `content ...` }
				]
			})
			.widgetArgsDuzenleIslemi( ({ args }) => {
				extend(args, {
					showGroupsHeader: false, columnsMenu: false,
					showStatusBar: true, columnsHeight: 0, rowsHeight: 130,
					adaptive: false, selectionMode: 'checkbox'
				})
			})
			.onAfterRun( ({ builder: { part } }) => {
				let { gridWidget: w } = part
				w.hScrollBar.hide()
			})
			.addCSS('relative')
			.addStyle(
				`$elementCSS { --margin: 20px; top: calc(var(--header-height) + 10px); left: var(--margin) }
				 $elementCSS [role = row] > div:not([title = false]) > div { padding: 20px !important }  /* ([title = false]: cells except checkbox column */
				 `
			)
			.addStyle_wh(`calc(var(--full) - (var(--margin) * 2))`, `calc(var(--full) - (var(--header-height) + 10px)) !important`)
	}
})
;cls.run()
