var qs, oldQS, config, app, lastAjaxObj;
class Ortak {
	static async boot() {
		try {
			this.registerSW()
			this.globalInit()
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
		this.registerSW()
		qs = readQSDict()
		oldQS = { ...qs }
		animationType = qs.animationType || animationType
		theme = qs.theme || theme
		this.globalInit()
	}
	static globalInit() {
		try { globalThis?.eruda?.init() }
		catch (ex) { console.error(ex) }
		globalThis.fixJSBugs?.()
		qs = readQSDict()
		oldQS = { ...qs }
		animationType = qs.animationType || animationType
		theme = qs.theme || theme
		if (theme) {
			$(`<link rel="stylesheet" href="${webRoot}/lib_external/jqx/css/jqx.${window.theme}.css" />`)
				.insertAfter($('link.theme-base'))
		}
		try { screen.orientation.unlock() }
		catch (ex) { console.warn('orientation-unlock', ex) }
		applyExtensions()
		window.addEventListener('unhandledrejection', evt =>
			console.error(evt, evt?.reason))
	}
	static async registerSW() {
		if (!navigator.serviceWorker)
			return
		try { await navigator.serviceWorker.register(`${webRoot}/sw.php`) }
		catch (ex) { console.error('ServiceWorker registration failed') }
	}
}
