class MQYerelParamConfigTanimPart extends MQYerelParamBaseTanimPart {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'yerelParamConfigTanim' }
	constructor(e = {}) {
		super(e)
		extend(this, {
			gelismisFlag: e.gelismis ?? e.gelismisFlag,
			title: e.title || 'Yerel Parametreler (WS)'
		})
	}
	runDevam(e) {
		super.runDevam(e); let {layout, inst} = this
		;{
			let txtWSUrl = this.txtSQL_server = layout.find('#wsURL .veri')
			txtWSUrl.val(inst.wsURL)
			let changeHandler = (target, value) => {
				value = value?.trim()
				if (value?.startsWith('/'))
					value = value.substring(1)
				if (value?.endsWith('/'))
					value = value.slice(0, -1)
				value = value?.trim()
				if (target)
					target.value = value
				inst.wsURL = value
			}
			txtWSUrl.on('change', evt => {
				let { currentTarget: target } = evt
				let { value } = target
				changeHandler(target, value)
			})
			txtWSUrl.autocomplete({
				delay: 100, minLength: 0,
				select: (evt, { item: { value }}) =>
					setTimeout(() => changeHandler(txtWSUrl[0], value), 10),
				source: async ({ term } = {}, callback) => {
					let result = [
						'http://localhost:8200',
						'https://localhost:9200'
					]
					let tokens = term?.split(' ')
					result = result.filter(adi => {
						if (adi[0] == '_' || !tokens?.length)
							return false
						return tokens?.every(token =>
							adi.toLocaleUpperCase().includes(token.toLocaleUpperCase()) ||
							adi.toUpperCase().includes(token.toUpperCase())
						)
					})
					callback(result)
				}
			})
		}
		let txtWSProxyServerURL = this.txtWSProxyURL = layout.find('#wsProxyServerURL .veri')
		txtWSProxyServerURL.val(inst.wsProxyServerURL || '')
		txtWSProxyServerURL.on('change', evt => {
			let elm = evt.currentTarget
			let value = (elm.value || '').trim()
			if (value.startsWith('/')) { value = value.substring(1) }
			if (value.endsWith('/')) { value = value.slice(0, -1) }
			value = value.trim(); elm.value = value; inst.wsProxyServerURL = (value || '')
		})
		let chkGelismisAyarlar = this.chkGelismisAyarlar = layout.find('#chkGelismisAyarlar')
		chkGelismisAyarlar.val(this.gelismisFlag);
		chkGelismisAyarlar.on('change', ({ currentTarget: target }) => {
			this.gelismisFlag = $(target).is(':checked')
			this.gelismisFlagDegisti(e)
		})
		;{
			let txtSQL_server = this.txtSQL_server = layout.find('#sql-server .veri')
			txtSQL_server.val(inst.sql?.server)
			let changeHandler = (target, value) => {
				value = value?.trim()
				if (target)
					target.value = value
				let sql = inst.sql ??= {}
				sql.server = value
			}
			txtSQL_server.on('change', evt => {
				let { currentTarget: target } = evt
				let { value } = target
				changeHandler(target, value)
			})
			txtSQL_server.autocomplete({
				delay: 100, minLength: 0,
				select: (evt, { item: { value }}) =>
					setTimeout(() => changeHandler(txtSQL_server[0], value), 10),
				source: async ({ term } = {}, callback) => {
					let result = await app.wsSqlServerListe()
					let tokens = term?.split(' ')
					result = result.filter(adi => {
						if (adi[0] == '_' || !tokens?.length)
							return false
						return tokens?.every(token =>
							adi.toLocaleUpperCase().includes(token.toLocaleUpperCase()) ||
							adi.toUpperCase().includes(token.toUpperCase())
						)
					})
					callback(result)
				}
			})
		}
		;{
			let txtSQL_db = this.txtSQL_db = layout.find('#sql-db .veri')
			txtSQL_db.val(inst.sql?.db)
			let changeHandler = (target, value) => {
				value = value?.trim()
				if (target)
					target.value = value
				let sql = inst.sql ??= {}
				sql.db = value
			}
			txtSQL_db.on('change', evt => {
				let { currentTarget: target } = evt
				let { value } = target
				changeHandler(target, value)
			})
			if (config.dev) {
				txtSQL_db.autocomplete({
					delay: 100, minLength: 0,
					select: (evt, { item: { value }}) =>
						setTimeout(() => changeHandler(txtSQL_db[0], value), 10),
					source: async ({ term } = {}, callback) => {
						let result = await app.wsDBListe()
						let tokens = term?.split(' ')
						result = result.filter(adi => {
							if (adi[0] == '_' || !tokens?.length)
								return false
							return tokens?.every(token =>
								adi.toLocaleUpperCase().includes(token.toLocaleUpperCase()) ||
								adi.toUpperCase().includes(token.toUpperCase())
							)
						})
						callback(result)
					}
				})
			}
		}
		let txtSQL_user = this.txtSQL_user = layout.find('#sql-user .veri')
		txtSQL_user.val((inst.sql || {}).sqlUser || '')
		txtSQL_user.on('change', evt => {
			let elm = evt.currentTarget
			let value = elm.value = (elm.value || '').trim()
			let sql = inst.sql = inst.sql || {}
			sql.sqlUser = value
		})
		let txtSQL_pass = this.txtSQL_pass = layout.find('#sql-pass .veri')
		txtSQL_pass.val((inst.sql || {}).sqlPass || '')
		txtSQL_pass.on('change', evt => {
			let elm = evt.currentTarget
			let value = elm.value = (elm.value || '').trim()
			let sql = inst.sql = inst.sql || {}
			sql.sqlPass = value
		})
		let txtUzakScriptURL = this.txtUzakScriptURL = layout.find('#uzakScriptURL .veri')
		txtUzakScriptURL.val(inst.uzakScriptURL)
		txtUzakScriptURL.on('change', evt => {
			let elm = evt.currentTarget
			let value = elm.value = (elm.value || '').trim()
			inst.uzakScriptURL = value
		})
		let txtUzakScriptIntervalSecs = this.txtUzakScriptIntervalSecs = layout.find('#uzakScriptIntervalSecs .veri')
		txtUzakScriptIntervalSecs.val(inst.uzakScriptIntervalSecs || null)
		txtUzakScriptIntervalSecs.on('change', evt => {
			let elm = evt.currentTarget
			let value = elm.value = (typeof isString(elm.value) ? asFloat((elm.value || '').trim()) : asFloat(elm.value)) || null
			inst.uzakScriptIntervalSecs = value
		})
		new RootFormBuilder().addModelKullan('colorScheme', 'Renk Şeması')
			.dropDown().kodsuz().noMF().listedenSecilemez()
			.setParent(chkGelismisAyarlar.parent().parent())
			.setInst(inst)
			.setSource(ColorScheme.kaListe)
			.degisince(e => inst.applyColorScheme())
			.addStyle_wh(150).addStyle(e => `$elementCSS { position: absolute; right: 20px; margin-top: -30px }`)
			.run()
		this.gelismisFlagDegisti(e)
	}
	afterRun(e) {
		super.afterRun(e)
		setTimeout(() => {
			makeScrollable(this.layout)
			this.txtWSUrl?.focus()
		}, 100)
	}
	/*wndArgsDuzenle() {
		super.wndArgsDuzenle(e)
		let { wndArgs } = e
		extend(wndArgs, { width: $(window).width() < 900 ? '100%' : '60%', height: 580 })
	}*/
	gelismisFlagDegisti(e) {
		let { layout, gelismisFlag } = this
		layout.find('.gelismis')[gelismisFlag ? 'removeClass' : 'addClass']('jqx-hidden')
	}
}
