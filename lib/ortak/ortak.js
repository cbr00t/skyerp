var qs, oldQS, config, app, lastAjaxObj;
class Ortak {
	static async boot() {
		try { this.registerSW(); this.globalInit(); config = new Config(); app = new appClass(); await app.run() }
		catch (ex) { try { if (window.boot) { window.boot.end() } } catch (_ex) { } console.error(ex); try { hConfirm(getErrorText(ex)) } catch (ex) { } }
	}
	static linkBoot() { this.registerSW(); qs = readQSDict(); oldQS = Object.assign({}, qs); animationType = qs.animationType || animationType; theme = qs.theme || theme; this.globalInit() }
	static globalInit() {
		if (window.fixJSBugs) { fixJSBugs() }
		qs = readQSDict(); oldQS = Object.assign({}, qs); animationType = qs.animationType || animationType; theme = qs.theme || theme;
		if (window.theme) { $(`<link rel="stylesheet" href="${webRoot}/lib_external/jqx/css/jqx.${window.theme}.css" />`).insertAfter($('link.theme-base')) }
		try { screen.orientation.unlock() } catch (ex) { console.warn('orientation-unlock', ex) }
		applyExtensions();
	}
	static async registerSW() {  if ('serviceWorker' in navigator) { try { navigator.serviceWorker.register(`${webRoot}/sw.php`) } catch (e) { console.error('ServiceWorker registration failed') } } }
}
