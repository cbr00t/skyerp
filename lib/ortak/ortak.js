var qs, oldQS, config, app, lastAjaxObj;
var globalClick

class Ortak {
	static async boot() {
		try {
			this.globalInit()
			this.registerSW()
			this.globalInitSon()
			config = new Config()
			app = new appClass()
			await app.run()
		}
		catch (ex) {
			try { globalInit?.boot?.end() }
			catch (_ex) { }
			console.error(ex)
			try { hConfirm(getErrorText(ex)) }
			catch (ex) { }
		}
	}
	static linkBoot() {
		this.globalInit()
		this.registerSW()
		qs = readQSDict()
		oldQS = { ...qs }
		animationType = qs.animationType || animationType
		theme = qs.theme || theme
		this.globalInitSon()
	}
	static globalInit() {
		;['mousedown', 'touchstart'].forEach(name => {
			addEventListener(name, async evt => {
				let r = globalClick ??= {
					timestamp: new Date().getTime(),
					count: 0
				}
				r.count++
				if (new Date().getTime() - r.timestamp > 3_000) {
					r = globalClick = null
					return
				}
				if (r.count >= 13) {
					r = globalClick = null
					if (!globalThis.eruda)
						await importLib_eruda()
					try { globalThis?.eruda?.init() }
					catch (ex) { console.error(ex) }
				}
			})
		})
		
		globalThis.fixJSBugs?.()
		addEventListener('unhandledrejection', evt =>
			console.error(evt, evt?.reason))
		
		qs = readQSDict()
		oldQS = { ...qs }
		animationType = qs.animationType || animationType
		theme = qs.theme || theme
		
		try { screen.orientation.unlock() }
		catch (ex) { console.warn('orientation-unlock', ex) }
		
		applyExtensions()
	}
	static globalInitSon() {
		if (theme) {
			$(`<link rel="stylesheet" href="${webRoot}/lib_external/jqx/css/jqx.${window.theme}.css" />`)
				.insertAfter($('link.theme-base'))
		}
	}
	static async registerSW() {
		if (!navigator.serviceWorker)
			return
		try { await navigator.serviceWorker.register(`${webRoot}/sw.php`) }
		catch (ex) { console.error('ServiceWorker registration failed') }
	}
}
