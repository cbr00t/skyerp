var delimWS = '|', culture = 'tr-TR', animationType = 'fade', animationSlow = 'slow';
var theme = 'metro', wsDataType = 'json', wsPrefixTemp = '$$temp-', wsContentType = 'application/json', wsCharSet = 'utf-8;'
var mimeType_SQLite3 = 'application/vnd.sqlite3';
var wsContentTypeVeCharSet = `${wsContentType}; charset=${wsCharSet}`;
var md5Length = 32, guidLength = 36, katSayi_ch2Px = 10, katSayi_px2Ch = (1 / katSayi_ch2Px), katSayi_ch2STRapor = 542, katSayi_stRapor2Ch = (1 / katSayi_ch2STRapor);
var CrLf = '\r\n', Date_OneHourNum = 3600 * 1000, Date_OneDayNum = Date_OneHourNum * 24;
var DateFormat = 'dd.MM.yyyy', TimeFormat_Saniyesiz = 'HH:mm', TimeFormat = TimeFormat_Saniyesiz + ':ss', DateTimeFormat = `${DateFormat} ${TimeFormat}`;
var jqxWindow_zIndex_min = 2000, jqxWindow_zIndex = jqxWindow_zIndex_min;
var separatorCharsSet = {}, id2WaitUntilInfo = {}, ajaxInfiniteMS = 5 * 60000;
var encoding_windows = 'windows-1252', encoding_iso = 'ISO-8859-9', encoding_utf8 = 'UTF-8', appActivatedFlag = window.document?.hasFocus() ?? true;
/*
	s = window.document.createElement('script');
	data = `window.c.resolve({"result": 567})`;
	s.async = s.defer = false;
	s.src = `http://cobramsi:8200/ws/writeTemp/?key=t1&temp=true&base64=true&data=${btoa(data)}`;
	window.document.head.appendChild(s);
	
	p = window.c = new $.Deferred();
	s = window.document.createElement('script');
	data = `window.c.resolve({"result": true})`;
	s.src = `http://cobramsi:8200/ws/echo/?stream=true&data=${wsPrefixTemp}t1`;
	s.onload = evt => console.info('script loaded', evt);
	s.onerror = evt => console.error('script error', evt);
	window.document.head.appendChild(s);
	await p
*/
function fixProtocol(value,  sslFlag) {
	sslFlag = sslFlag ?? config?.ssl;
	if (value && !value.includes('://')) value = `http${sslFlag ? 's' : ''}://${value}`
	if (value && value.includes('$port')) {
		let port = config?.ws?.port ?? (sslFlag ? config?.class?.DefaultSSLWSPort : config?.class?.DefaultWSPort);
		value = value.replaceAll('$port', port)
	}
	return value
}
function ajaxCall(e) {
	// e.proxyServerURL = 'https://127.0.0.1:9200';
	let proxyServerURL = fixProtocol(e.proxyServerURL ?? config?.ws?.proxyServerURL); let proxyURL = fixProtocol(e.proxyURL); let {url} = e;
	if (proxyServerURL || proxyURL) {
		if (proxyURL) { e.url = (`${app.getWSUrlBase({ wsPath: 'ws/proxy' })}/send/?url=${proxyURL}` ) }
		else { e.url = app.getWSUrl({ wsPath: 'ws/proxy', api: 'send', args: { url: `${url.replace(config.wsURLBase, proxyServerURL)}` } }) }
	}
	return ajaxCallDirect(e)
}
function ajaxCallDirect(e) {
	e = e || {}; return lastAjaxObj = $.ajax($.extend( {
		cache: false, processData: coalesce(e.processData, undefined),
		contentType: e.ajaxContentType === undefined ? undefined : e.ajaxContentType,
		dataType: e.dataType === undefined ? wsDataType : e.dataType, timeout: e.timeout
	}, e))
}
function ajaxGet(e) { return lastAjaxObj = ajaxCall($.extend({ type: 'GET' }, e || {})) }
function ajaxPost(e) { return lastAjaxObj = ajaxCall($.extend({ type: 'POST' }, e || {})) }
function createTabbedWindow(e, _title) {
	e = e || {}; if (e.content && !e.layout) { e.layout = e.content; delete e.layout }
	if (!e.layout) e = { layout: e.html ? e : $(e) }
	if (_title !== undefined) e.title = _title
	const part = new TabbedWindowPart(e); part.run(); return part
}
function createJQXWindow(e) {
	const {buttons, promise} = e; let {title} = e;
	const subContent = e.content; const args = e.args || {};
	if (typeof title == 'string' && !title.trim()) title = '&nbsp;'
	let wnd; const wndLayout = $(
		`<div class="wndLayout active">` +
			`<div class="title">${title && typeof title != 'object' ? title : ''}</div>` +
			`<div class="content">` +
				`<div class="subContent">${subContent && typeof subContent != 'object' ? subContent : ''}</div>` +
				`<div class="buttons"></div>` +
			`</div>` +
		`</div>`
	);
	const divTitle = wndLayout.find('.title');
	if (title && typeof title == 'object' && title.length) title.appendTo(divTitle)
	if (!title) divTitle.addClass('jqx-hidden')
	const divContent = wndLayout.find('.content');
	if (subContent && typeof subContent == 'object' && subContent.length) subContent.appendTo(divContent.children('.subContent'))
	const buttons_isArray = !buttons || $.isArray(buttons); const divButtons = divContent.children('.buttons')
	if (buttons) {
		for (const key in buttons) {
			let text, handler;
			if (buttons_isArray) { const rec = buttons[key]; text = rec.text; handler = rec.handler || rec.block }
			else { text = key; handler = buttons[key] }
			const button = $(`<button>${text}</button>`).jqxButton({ theme: theme });
			button.on('click', evt => {
				const _e = {
					event, wnd, button, key, promise,
					key, text: button.text(), index: button.index(),
					close: () => wnd.jqxWindow('close')
				};
				if (handler) getFuncValue.call(this, handler, _e)
			});
			button.appendTo(divButtons)
		}
	}
	if (divButtons?.length && !divButtons.children().length) { divButtons.addClass('jqx-hidden'); divContent.css('--buttons-height', '0px') }
	if (!args.closeButtonAction) args.closeButtonAction = 'destroy'
	let destroyOnClose = false;
	if (args.closeButtonAction == 'destroy') { args.closeButtonAction = 'close'; destroyOnClose = true }
	if (!args.maxWidth) args.maxWidth = $(window).width() + 300
	if (!args.maxHeight) args.maxHeight = $(window).height() + 300
	let {dragArea} = args; const {divAppTitle, mainNav, mainWindowsTabs} = app || {};
	/*if (!dragArea) {
		const padding = { left: 0, top: 8 };
		dragArea = {
			left: (mainNav && mainNav.length ? mainNav.position().left + mainNav.width() : 0) + padding.left,
			top: (
				(divAppTitle && divAppTitle.length ? divAppTitle.position().top + divAppTitle.height() : 0) +
				(mainWindowsTabs && mainWindowsTabs.length ? mainWindowsTabs.position().top + mainWindowsTabs.height() : 0) + padding.top
			)
		};
		dragArea.width = $(window).width() - dragArea.left - 50;
		dragArea.height = $(window).height() - dragArea.top - 50;
		args.dragArea = dragArea;
		if ((args.position || {}).x != null)
			args.position.x += dragArea.left;
		if ((args.position || {}).y != null)
			args.position.y += dragArea.top;
	}*/
	if (destroyOnClose) { wndLayout.on('close', evt => $(evt.target).jqxWindow('destroy')) }
	wndLayout.on('open', evt => {
		// $(document).trigger('resize');
		$(evt.target).focus();
		if (!$.isEmptyObject(buttons)) {
			let index = e.defaultButtonIndex === undefined ? undefined : e.defaultButtonIndex;
			if (index === undefined) index = e.defaultIndex === undefined ? undefined : e.defaultIndex
			if (index === undefined) index = e.default === undefined ? undefined : e.default
			if (index === undefined && !$.isEmptyObject(buttons)) index = 0
			if (index != null && index >= 0) { const btn = divContent.find(`.buttons button:eq(${index})`); if (btn && btn.length) btn.focus() }
		}
	});
	wndLayout.on('close', evt => { if (jqxWindow_zIndex > jqxWindow_zIndex_min) jqxWindow_zIndex-- });
	const _e = $.extend({
		theme: theme, autoOpen: true, isModal: true, showCloseButton: true, showCollapseButton: true,
		closeButtonAction: args.closeButtonAction, closeButtonSize: 20, minWidth: 100, minHeight: 40 /* keyboardCloseKey: '' */
	}, args || {});
	if (_e) {
		if (_e.minWidth && typeof _e.width == 'number' && _e.width < args.minWidth) _e.minWidth = _e.width
		if (_e.minHeight && typeof _e.height == 'number' && _e.height < args.minHeight) _e.minHeight = _e.height
	}
	wnd = wndLayout.jqxWindow(_e);
	if (wnd) {
		wnd.css('z-index', jqxWindow_zIndex); jqxWindow_zIndex++;
		/* wnd.jqxWindow('zIndex', jqxWindow_zIndex); wnd.jqxWindow('modalZIndex', jqxWindow_zIndex); */
		wnd.find('*').on('focus', evt => {
			const target = $(evt.currentTarget).parents('.jqx-window'), id = target.prop('id');
			$(`.jqx-window:not(#${id})`).removeClass('active'); target.addClass('active')
		}); /* wnd.jqxWindow('bringToFront') */
	}
	return wnd
}
function displayMessage(e, __title, __buttons, __default) {
	if (typeof e == 'string') e = { content: e, title: __title, buttons: __buttons, default: __default };
	if (typeof e?.content == 'string') e.content = `<div margin-top: 10px;>${e.content}</div>`
	let promise = e.promise = new $.Deferred(); let _buttons = e.buttons;
	if (!_buttons) _buttons = ['TAMAM']
	if (typeof _buttons == 'string') {
		switch (_buttons.toLowerCase()) {
			case 'ok': case 'tamam': case 't': _buttons = ['TAMAM']; break
			case 'okcancel': case 'oc': case 'tv': _buttons = ['TAMAM', 'VAZGEÇ']; break
			case 'yesno': case 'evethayir': case 'yn': case 'eh': _buttons = ['EVET', 'HAYIR']; break
			case 'yesnocancel': case 'evethayirvazgec': case 'ync': case 'ehv': _buttons = ['EVET', 'HAYIR', 'VAZGEÇ']; break
			case 'cancel': case 'vazgec': case 'c': case 'v': _buttons = ['VAZGEÇ']; break
		}
	}
	const buttons_isArray = !_buttons || $.isArray(_buttons), buttons = buttons_isArray ? [] : {};
	for (const key in _buttons) {
		let text, handler;
		if (buttons_isArray) {
			let item = _buttons[key];
			if (typeof item == 'string')
				item = { text: item, handler: e => { if (promise) { promise.resolve(e); promise = null } e.close(); } }
			buttons.push(item)
		}
		else { const item = _buttons[key]; buttons[key] = item }
	} e.buttons = buttons;
	let contentText = (e.content || '');
	if (contentText.text) contentText = contentText.text() || '';
	/* const title = e.title = e.title == null ? ' ' : e.title; */
	const {title} = e; const args = e.args = e.args = e.args || {};
	$.extend(args, {
		width: args.width ||
			Math.min(
				50 + (
					((((buttons || []).length || 1) - 1) * 90) + (((contentText.length || 50) * (katSayi_ch2Px - 1)) / 1)
				), Math.min(700, $(window).width() - 10 )
			),
		height: args.height ||
			Math.min(
				80 + (
					(title ? 30 : 0) + (((contentText.length || 50) * (katSayi_ch2Px - 2)) / 8)
				), Math.min(800, $(window).height() - 20)
			),
		showCollapseButton: args.showCollapseButton == null ? true : args.showCollapseButton
	});
	const wnd = createJQXWindow(e); if (wnd) { wnd.on('close', evt => { if (promise) { promise.reject({ rc: 'userClose' }); /* promise.resolve({ index: null }); */ promise = null } }) }
	return { wnd, result: promise }
}
function xConfirm(e, __title, __buttons, __default) {
	if (typeof e == 'string') e = { content: e, title: __title, buttons: __buttons, default: __default };
	return displayMessage(e).result
}
function eConfirm(e, __title, __buttons, __default) {
	if (typeof e == 'string') e = { content: e, title: __title, buttons: __buttons, default: __default };
	e = e ?? {}; e.title = e.title || 'Bilgi'; return xConfirm(e)
}
function hConfirm(e, __title, __buttons, __default) {
	if (typeof e == 'string') e = { content: e, title: __title, buttons: __buttons, default: __default };
	e = e ?? {}; e.title = e.title || 'UYARI'; return xConfirm(e)
}
function okConfirm(e, __title, __buttons, __default) {
	if (typeof e == 'string') e = { content: e, title: __title, buttons: __buttons, default: __default };
	e = e ?? {}; e.buttons = 'ok'; return displayMessage(e).result.then(result => result.index == 0)
}
function tvConfirm(e, __title, __buttons, __default) {
	if (typeof e == 'string') e = { content: e, title: __title, buttons: __buttons, default: __default };
	e = e ?? {}; e.buttons = 'tv'; return displayMessage(e).result.then(result => result.index == 0)
}
function ehConfirm(e, __title, __buttons, __default) {
	if (typeof e == 'string') e = { content: e, title: __title, buttons: __buttons, default: __default };
	e = e ?? {}; e.buttons = 'eh'; return displayMessage(e).result.then(result => result.index == 0)
}
function ehvConfirm(e, __title, __buttons, __default) {
	if (typeof e == 'string') e = { content: e, title: __title, buttons: __buttons, default: __default };
	e = e ?? {}; e.buttons = 'ehv'; return displayMessage(e).result.then(result => result.index == 2 || result.index == null ? null : result.index == 0)
}
function showProgress(message, title, showProgressFlag, abortBlock, ekBilgi, isModal) {
	if (isModal == null) isModal = true
	const ekBilgiText = ekBilgi ? ( isFunction(ekBilgi) ? null : typeof ekBilgi == 'object' ? ekBilgi.text : ekBilgi ) : undefined;
	const ekBilgiHandler = ekBilgi ? ( isFunction(ekBilgi) ? ekBilgi : typeof ekBilgi == 'object' ? ekBilgi.handler : null ) : undefined;
	let {wndProgress, progressManager} = this;
	if ((wndProgress && wndProgress.length) && progressManager) {
		progressManager.text = message;
		if (ekBilgiText !== undefined) {
			if (ekBilgi != null) progressManager.ekBilgiText = ekBilgiText
			progressManager.ekBilgiHandler = ekBilgiHandler; progressManager.isEkBilgiVisible = !!ekBilgiText
		}
		return wndProgress
	}
	if (showProgressFlag && !message) message = ' '
	const buttons = {};
	buttons['İPTAL'] = e => { if (progressManager) progressManager.abort(e) };
	const isEkBilgiVisible = ekBilgiText !== undefined;
	wndProgress = this.wndProgress = createJQXWindow({
		content: $(
			`<div class="progress-ui flex-row" style="padding-top: ${message ? 15 : 5}px; padding-left: ${message ? '3px' : '30%'};">` +
				`<img src="/skyerp/images/loading.gif" style="margin: 0; padding: 0; margin-left: ${message ? 13 : 0}px; margin-right: ${message ? 10 : 0}px;` +
					` width: ${message ? 32 : 40}px; height: ${message ? 32 : 40}px;` +
					` background-size: contain; background-position: center; background-repeat: no-repeat;"></img>` +
				`<div class="text">${message || ''}</div>` +
			`</div>` +
			`<div class="progress-parent${showProgressFlag ? '' : ' jqx-hidden'}" style="width: 300px; height: 30px; margin-left: 50px; padding: 8px;">` +
				`<progress min="0" max="100" class="full-wh"/>` +
		    `</div>` +
			`<a class="ekBilgi${isEkBilgiVisible ? '' : ' jqx-hidden'}" style="position: absolute; bottom: 20px; right: 25px;" href="#">${ekBilgiText || 'Ek Bilgi...'}</a>`
		),
		title, args: {
			isModal, minWidth: 1, minHeight: 1, width: message ? Math.min(750, $(window).width() - 50) : 100,
			height: ((message ? 120 : 70) + (showProgressFlag ? 30 : 0) + (title ? 30 : 0) + 20 )
		}, buttons
	});
	wndProgress.on('close', evt => {
		this.wndProgress = null; let {progressManager} = this;
		if (progressManager) { progressManager.destroyPart(); this.progressManager = null }
	});
	const content = wndProgress.find('div > .content'); makeScrollable(content);
	content.css('overflow-y', 'hidden'); wndProgress.css('border-radius', '10px'); 
	progressManager = this.progressManager = new ProgressManager({ wnd: wndProgress, ekBilgiHandler, abortBlock });
	/* progressManager.isEkBilgiVisible = !!isEkBilgiVisible; */ progressManager.isAbortButtonVisible = !!abortBlock;
	let elm = progressManager.layouts.ekBilgi;
	if (elm && elm.length) {
		elm.off('click');
		elm.on('click', evt => { if (progressManager) progressManager.ekBilgiIstendi({ event: evt }) })
	}
	setTimeout(() => {
		if (progressManager) {
			const {layouts} = progressManager;
			if (progressManager.isAbortButtonVisible) layouts.abortButton?.focus()
			else if (progressManager.isEkBilgiVisible) layouts.ekBilgi?.focus()
			else layouts.content?.focus()
		}
	}, 10);
	return progressManager
}
function hideProgress() {
	let {wndProgress, progressManager} = this;
	if (wndProgress && wndProgress.length) wndProgress.jqxWindow('close')
	if (progressManager) progressManager.destroyPart()
	for (const key of ['wndProgress', 'progressManager']) this[key] = null
	return progressManager
}
function setButonEnabledBasit(uiBtn, state) { uiBtn.prop('disabled', !state) }
function setButonEnabled(uiBtn, state) {
	setButonEnabledBasit(uiBtn, state);
	if (state) uiBtn.removeClass('ui-state-disabled')
	else uiBtn.addClass('ui-state-disabled')
}
function openNewWindow(url, target, args) {
	const wnd = window.open(
		url, target || '_blank', args || (
			`titlebar=1,menubar=0,toolbar=0,status=1,location=0,resizeable=1,directories=1,top=0,left=1,` +
			`width=${screen.width - 13},height=${screen.height - 70}`
		)
	);
	setTimeout(wnd => { if (wnd && wnd.focus) wnd.focus() }, 10, wnd); return wnd
}
function downloadData(data, fileName, contentType, newWindowFlag) {
	const a = window.document.createElement('a');
	if (window.URL && window.Blob && ('download' in a) && window.atob) {
		// Do it the HTML5 compliant way
		const blob = new Blob([data], { type: contentType || 'application/octet-stream' }), url = URL.createObjectURL(blob);
		a.href = url; a.download = fileName;
		if (newWindowFlag) a.target = '_blank';
		a.click() /* URL.revokeObjectURL(url) */
	}
}
function downloadFile(url, fileName, contentType, newWindowFlag) {
	const a = window.document.createElement('a');
	if (window.URL && ('download' in a) && window.atob) {
		// Do it the HTML5 compliant way
		a.href = url; a.download = fileName;
		if (newWindowFlag) a.target = '_blank';
		a.click() /* URL.revokeObjectURL(url) */
	}
}
function fixJSBugs() {
	if (typeof String.prototype.padStart != 'function') {
		String.prototype.padStart = function(count) {
			let result = this;
			while (result.length < count) result = ' ' + result
			return result.toString()
		}
	}
	if (typeof String.prototype.padEnd != 'function') {
		String.prototype.padEnd = function(count) {
			let result = this;
			while (result.length < count) result += ' '
			return result.toString()
		}
	}
	if (window.jQuery) {
		jQuery.fn.hasHScrollBar = function() { return this.get(0).scrollWidth > this.innerWidth() };
		jQuery.fn.hasVScrollBar = function() { return this.get(0).scrollHeight > this.innerHeight() };
		jQuery.fn.hasScrollBar = function() { return this.hasHScrollBar() || this.hasVScrollBar() }
	}
	// Passive event listeners
	const setupJQueryPassiveEventListener = selector => {
		jQuery.event.special[selector] = { setup: function(_, ns, handle) { this.addEventListener(selector, handle, { passive: !ns.includes('noPreventDefault') }) } }
	};
	/*['touchstart', 'touchend', 'touchmove', 'mousewheel'].forEach(selector => setupJQueryPassiveEventListener(selector));*/
}
function readQSDict() {
	const vars = {}; const hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&'); let hash;
	for (let i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('='); /* vars.push(hash[0]); */
		vars[decodeURIComponent(hash[0])] = hash[1] == null ? true : decodeURIComponent(hash[1])
	}
	return vars
}
function getErrorText(error) {
	if (error?.responseJSON) { error = error.responseJSON }
	if (error?.responseText) { error = error.responseText }
	if (error?.errorText) {
		const code = config?.dev ? (error.rc ?? error.code) : null, {errorText} = error;
		error = code ? `(<b style="color: red;">${code}</b>) ${errorText}` : errorText
	}
	error = error?.message ?? error;
	if (error) {
		const {statusText} = error, {wsURLBase} = app;
		if (statusText == 'error') { error = `<h4>Merkez ile iletişim sorunu</h4><div style="padding-left: 10px;">(<b><a href="${wsURLBase}/getSessionInfo" target="_blank">${wsURLBase}</a></b>)</div>` }
		else if (statusText == 'cancel' || statusText == 'cancelled' || statusText == 'abort' || statusText == 'aborted') {
			error = `<h4>Merkez ile iletişim kurulurken WebServis iletişimi kesildi</h4><div style="padding-left: 10px;">(<b><a href="${wsURLBase}/getSessionInfo" target="_blank">${wsURLBase}</a></b>)</div>`
		}
	}
	return typeof error == 'object' ? null : error
}
function toJSONStr(obj, space) {
	let result = JSON.stringify(obj, (key, value) => jsonEscaped(value), space || '');
	if (result && typeof result == 'string') { result = result.replace(/&/g, '\\u0026') }
	return result
}

function jsonEscaped(obj) {
	/*if (typeof obj == 'string') { return obj.replace(/&/g, '\\u0026') }*/
	if (obj) {
		if (typeof obj == 'number') { obj = roundToFra(obj, 13) }
		else if (typeof obj == 'function') { obj = obj.toString() }
	}
	return obj
}
function string2Numeric(value) { return value && typeof value == 'string' ? value.replaceAll(/[^0-9]+/g, '') : value }
function newGUID() {
	const KatSayi = 0xffffffff; let u = '', m = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx', i = 0, rb = Math.random() * KatSayi | 0;
	while (i++ < 36) {
		let c = m[i - 1], r = rb & 0xf, v = c == 'x' ? r : (r & 0x3 | 0x8);
		u += (c == '-' || c == '4') ? c : v.toString(16);
		rb = (i % 8 == 0) ? (Math.random() * KatSayi) | 0 : rb >> 4
	}
	return u
}
function numberToString(value, options) {
	if (value == null || typeof value != 'number') { return value }
	return value.toLocaleString(culture, $.extend({ minimumIntegerDigits: 1, useGrouping: true }, options || {}));
}
function toStringWithFra(value, fra, options) {
	if (value == null || typeof value != 'number') { return value }
	return value.toLocaleString(culture, $.extend({ minimumIntegerDigits: 1, minimumFractionDigits: fra, maximumFractionDigits: fra, useGrouping: true }, options || {}))
}
function toFileStringWithFra(value, fra, options) {
	if (value == null || typeof value != 'number') { return value }
	return value.toLocaleString('en-US', $.extend({ minimumIntegerDigits: 1, minimumFractionDigits: fra, maximumFractionDigits: fra, useGrouping: false }, options || {}))
}
function fra1Str(value) { return toStringWithFra(value, 1) }
function fra2Str(value) { return toStringWithFra(value, 2) }
function fra3Str(value) { return toStringWithFra(value, 3) }
function roundToFra(value, fra) {
	if (!value) { return value }
	if (typeof value == 'number') { return asFloat(fra == null ? value : value.toFixed(fra)) }
	return roundToFra(asFloat(value), fra)
}
function roundToFiyatFra(value) { const fra = (app.params?.zorunlu?.fiyatFra) ?? 5; return roundToFra(value, fra) }
function roundToBedelFra(value) { const fra = (app.params?.zorunlu?.bedelFra) ?? 2; return roundToFra(value, fra) }
function roundToDvFiyatFra(value) { const fra = (app.params?.zorunlu?.dvFiyatFra) ?? 5; return roundToFra(value, fra) }
function roundToDvBedelFra(value) { const fra = (app.params?.zorunlu?.dvBedelFra) ?? 2; return roundToFra(value, fra) }
function roundToStokFra(value, brm) {
	let fra = 0; if (brm) { const brmDict = app.params?.stokBirim?.brmDict || {}; fra = brmDict[brm] ?? 0 }
	return roundToFra(value, fra)
}
function evalOrSelf(value) { return (typeof value == 'string') ? eval(value) : value }
function isClass(value) { return typeof value == 'function' && !!value.prototype?.constructor }
function isInstance(value) { return isClass(value?.__proto__) && !$.isFunction(value) }
function isClassOrInstance(value) { return isClass(value) || isInstance(value) }
function isFunction(value) { return $.isFunction(value) && !isClassOrInstance(value) }
function getFunc(blockOrString) {
	let result = blockOrString;
	if (result && typeof result == 'string') result = eval(result)
	return result;
}
function getFuncValue(blockOrString, ...args) {
	let result = blockOrString;
	if (result) {
		if (isFunction(result)) return result.call(this, ...args)
		if (result.run) return result.run(...args)
	}
	return result
}
function coalesceNull(value, aBlock) {
	value = value == null ? getFuncValue(aBlock, value) : value;
	if (value == null) value = null; return value
}
function coalesce(value, aBlock) { return value == null ? getFuncValue(aBlock, value) : value }
function emptyCoalesce(value, aBlock) { return value ? value : getFuncValue(aBlock, value) }
function inverseCoalesce(value, aBlock) { return value == null ? value : getFuncValue(aBlock, value) }
function inverseNullCoalesce(value, aBlock) { return value == null ? null : getFuncValue(aBlock, value) }
function inverseEmptyCoalesce(value, aBlock) { return value ? getFuncValue(aBlock, value) : value }
function changeTagContent(html, newValue) {
	if (html == null) return html
	if (html.html) { html.html(newValue); return html }
	let ind = html?.indexOf('>'); if (ind < 0) return html
	return html.substring(0, ind + 1) + newValue + html.substring(html.lastIndexOf('<'))
}
function getTagContent(html) {
	if (html == null) return html
	if (html.html) { return html.html() }
	let indStart = html.indexOf('>'); if (indStart < 0) return ''
	let indEnd = html.lastIndexOf('</'); if (indEnd < 0) return ''
	return html.substring(indStart + 1, indEnd)
}
function now() { return new Date() }
function today() { let _now = now(); return new Date(_now.getFullYear(), _now.getMonth(), _now.getDate()) }
function nowAddDays(days) { return now().add(days).day() }
function isInvalidDate(value) {
	if (!value) return true; const type = typeof value;
	if (type == 'string') {
		if (!$.isNumeric(value[0])) return true				// 01.01.2017  gibi olmali  ;  +30 -5 hb y b ab as  ... gibi ise hatalidir
		return isInvalidDate(asDate(value))
	}
	else if (!(type == 'date' || value.__proto__.constructor.name.toLowerCase() == 'date')) return true
	return isInvalidDateDogrudan(value)
}
function isInvalidDateDogrudan(value) {
	if (!value) return true; const type = typeof value;
	if (type == 'date' || value.__proto__.constructor.name.toLowerCase() == 'date') value = value.toString()
	return value == new Date('').toString('')
}
function isDate(value) {
	if (!value) return false; const type = typeof value;
	return type == 'date' || (value && value.__proto__.constructor.name.toLowerCase() == 'date')
}
function asSaniyeKisaString(value, saniyesizFlag) {
	if (!value) return value; value = asFloat(value);
	let kalan = value; const sa = asInteger(kalan / 3600); kalan -= (sa * 3600);
	let dk = 0, sn = 0;
	if (saniyesizFlag) dk = roundToFra(asFloat(kalan / 60), 0)
	else { dk = asInteger(kalan / 60); sn = kalan - (dk * 60) }
	let result = '';
	if (sa > 0) result += `${sa.toLocaleString()}sa`
	if (dk > 0) { if (result) result += ' '; result += `${dk.toLocaleString()}dk` }
	if (sn > 0) { if (result) result += ' '; result += `${sn.toLocaleString()}sn` }
	return result
}
function asInteger(value, defaultValue) {
	let defaultcu = () => {
		let result = defaultValue;
		if (result !== undefined) { result = getFuncValue(defaultValue) }
		if (result == undefined) { result = 0 }
		return result
	}
	if (value == null || isNaN(value)) { return defaultcu() }
	if (typeof value == 'number') { return parseInt(value) }
	if (typeof value == 'boolean') { return value ? 1 : 0 }
	if (typeof value == 'string') { value = value.replace(/,/g, '.') } value = parseInt(value);
	if (value == null || isNaN(value)) return defaultcu()
	return value
}
function bool2Int(value) { return asBool(value) ? 1 : 0 }
function bool2FileStr(value) { return asBool(value) ? '*' : '' }
function asFloat(value, defaultValue) {
	let defaultcu = () => {
		let result = defaultValue; if (result !== undefined) { result = getFuncValue(defaultValue) }
		if (result == undefined) { result = 0 }
		return result
	};
	if (value == null || isNaN(value)) return defaultcu()
	if (typeof value == 'number') return value
	if (typeof value == 'string') value = value.replace(/,/g, '.')
	value = parseFloat(value); if (value == null || isNaN(value)) { return defaultcu() }
	return value
}
function asDate(value) {
	if (!value || typeof value != 'string') { return value }
	let info, dtParts = value.split(' ');
	if (!dtParts || dtParts.length < 2) dtParts = value.split('T')
	if (dtParts?.length) {
		let datePart = dtParts[0].trim(), timePart = dtParts.length > 1 ? dtParts[1].trim() : '';
		if ($.inArray('-', datePart) != -1) { let parts = datePart.split('-'); info = { year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2]) } }
		else if ($.inArray('.', datePart) != -1) { let parts = datePart.split('.'); info = { day: parseInt(parts[0]), month: parseInt(parts[1]), year: parseInt(parts[2]) } }
		else if ($.inArray('/', datePart) != -1) { let parts = datePart.split('/'); info = { month: parseInt(parts[0]), day: parseInt(parts[1]), year: parseInt(parts[0]) } }
		else { if ($.isNumeric(datePart)) { info = { day: parseInt(datePart.substring(0, 2)), month: parseInt(datePart.substring(2, 4)), year: parseInt(datePart.substring(4)) } } }
		if (info && timePart?.length > 1) {
			if ($.inArray(':', timePart) != -1) {
				let parts = timePart.split(':'), secParts = parts.length > 3 ? parts.split('.') : null, milliseconds = 0;
				if (secParts) { parts[2] = secParts[0]; milliseconds = parseInt(secParts[1]); }
				$.extend(info, { hours: parseInt(parts[0]), minutes: parts.length > 1 ? parseInt(parts[1]) : 0, seconds: parts.length > 2 ? parseInt(parts[2]) : 0, milliseconds: milliseconds})
			}
			else { $.extend(info, { hours: timePart.substring(0, 2), minutes: timePart.length >= 2 ? timePart.substring(2, 4) : 0, seconds: timePart.length >= 4 ? timePart.substring(4, 6) : 0, milliseconds: timePart.length >= 6 ? timePart.substring(6) : 0}) }
		}
	}
	if (info) {
		let d = today(); value = `${info.day.toString().padStart(2, '0')}.${(info.month || d.getMonth() + 1).toString().padStart(2, '0')}.${(info.year || d.getFullYear()).toString().padStart(2, '0')}`;
		if (info.hours != null) value += ' ' + info.hours.toString().padStart(2, '0')
		if (info.minutes != null) value += ':' + info.minutes.toString().padStart(2, '0')
		if (info.seconds) value += ':' + info.seconds.toString().padStart(2, '0')
		if (info.milliseconds) value += '.' + info.milliseconds.toString().padStart(2, '0')
	}
	return Date.parse(value)
}
function asNormalDate(value) { value = string2Numeric(value); return asDate(value) }
function asReverseDate(value) {
	if (typeof value == 'number') value = value.toString()
	else if (!value || typeof value != 'string') return value
	value = string2Numeric(value);
	let parts; if (value.length == 6) { value = new Date(asInteger(value.substr(0, 2)), asInteger(value.substr(2, 2)), asInteger(value.substr(4, 2))) }
	else if (value.length == 8) { value = new Date(asInteger(value.substr(0, 4)), asInteger(value.substr(4, 2)), asInteger(value.substr(6, 2))) }
	if (value) { /* javascript Date month = 0'dan baslar */ value = value.addMonths(-1) }
	return value
}
function asTime(value) {
	if (value && typeof value == 'string') { value = asDate(value) }
	return isInvalidDate(value) ? null : (value.getTime() || 0)
}
function setTime(aDate, aTime) {
	if (aDate != null && typeof aDate == 'string') aDate = asDate(aDate); if (isInvalidDate(aDate)) return aDate;
	if (typeof aTime == 'string') { aTime = asDate(aTime) } if (typeof aTime == 'number') { aTime = new Date(aTime) }
	if (aTime != null) { aDate.clearTime().addMilliseconds( aTime.getTime() - aTime.clone().clearTime().getTime() ) }
	return aDate
}
/*function setTime(aDate, aTime) {
	if (aDate != null && typeof aDate == 'string') aDate = asDate(aDate); if (isInvalidDate(aDate)) return aDate;
	if (typeof aTime == 'string') aTime = asDate(aTime); if (typeof aTime != 'number' && !isInvalidDate(aTime)) aTime = aTime.getTime()
	if (aTime != null) aDate.setTime(aTime); return aDate
}*/
function hasTime(value) {
	if (value != null && typeof value == 'string')
		value = asDate(value)
	return !(value == null || value.clone().clearTime().getTime() == value.getTime())
}
function dateToString(value) {
	if (!value || typeof value == 'string')
		return value
	return value.toString(DateFormat)
}
function timeToString(value, noSecsFlag) {
	if (value == null || typeof value == 'string') { return value }
	if (typeof value == 'number') { value = new Date(value) }
	return value.toString(noSecsFlag ? TimeFormat_Saniyesiz : TimeFormat)
}
function dateTimeToString(value) {
	if (!value || typeof value == 'string')
		return value
	return value.toString(DateTimeFormat)
}
function dateKisaString(value) {
	if (!value || typeof value == 'string')
		return value
	return value.toString('dd.MMM')
}
function timeKisaString(value) {
	if (!value || typeof value == 'string')
		return value
	return value.toString('HH:mm')
}
function dateTimeAsKisaString(value) {
	if (!value || typeof value == 'string')
		return value;
	
	return value.toString('dd.MMM HH:mm');
}
function asDateAndToString(value) {
	return dateToString(asDate(value))
}
function asTimeAndToString(value, noSecsFlag) {
	if (typeof value == 'string')
		value = timeFormatString(value, noSecsFlag)
	return timeToString(asDate(value), noSecsFlag)
}
function asDateTimeAndToString(value, noSecsFlag) {
	return dateTimeToString(asDate(value), noSecsFlag)
}
function asDateAndToKisaString(value) {
	return dateKisaString(asDate(value))
}
function asDateTimeAndToKisaString(value) {
	return dateTimeAsKisaString(asDate(value))
}
function asReverseDateString(value) {
	if (typeof value == 'string')
		value = asDate(value)
	if (!value)
		return null
	return dateToString(value).split('.').reverse().map(x => x.padStart(2, '0')).join('-')
}
function asReverseDateTimeString(value, concatStr) {
	let result = asReverseDateString(value);
	if (result) {
		if (typeof value == 'string')
			value = asDate(value);
		if (value)
			result += `${concatStr || ' '}${timeToString(value)}`
	}
	return result
}
function asLocaleDateString(value) {
	if (!value || typeof value != 'string')
		return value
	return value.split('-').reverse().map(x => x.padStart(2, '0')).join('.');
}
function timeFormatString(value, noSecsFlag) {
	if (!value)
		return value
	value = ((
		value
			.replaceAll('.', ':')
			.replaceAll('-', ':')
			.split(' ').pop()
	) || '').trim();
	const hasSeparator = value.includes(':');
	if (hasSeparator) {
		const parts = value.split(':');
		if (parts.length == 1)
			value = noSecsFlag ? `${parts[0].padStart(2, '0')}:00` : `${parts[0].padStart(2, '0')}:00:00`;
		else if (parts.length == 2)
			value = noSecsFlag ? `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}` : `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
		else if (parts.length == 3)
			value = noSecsFlag ? `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}` : `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
	}
	else {
		let _value = value.toLowerCase();
		if (_value == 'b' || _value == 's')
			_value = value = timeToString(now());
		
		if (value.length == 1)
			value = noSecsFlag ? `0${value}:00` : `0${value}:00:00`;
		else if (value.length == 2)
			value = noSecsFlag ? `${value}:00` : `${value}:00:00`;
		else if (value.length == 4)
			value = noSecsFlag ? `${value.substr(0, 2)}:${value.substr(2, 2)}` : `${value.substr(0, 2)}:${value.substr(2, 2)}:00`;
		else if (value.length == 5)
			value = noSecsFlag ? `${value.substr(0, 2)}:${value.substr(2, 2)}` : `${value.substr(0, 2)}:${value.substr(2, 2)}:0${value.substr(4, 1)}`;
		else if (value.length == 6)
			value = noSecsFlag ? `${value.substr(0, 2)}:${value.substr(2, 2)}` : `${value.substr(0, 2)}:${value.substr(2, 2)}:${value.substr(4, 2)}`;
	}
	return value
}

function isVirtualKeyboardSupported() {
	let result = this._isVirtualKeyboardSupported;
	if (result == null)
		result = this._isVirtualKeyboardSupported = !!navigator.virtualKeyboard
	return result
}
function showKeyboard() {
	if (this.isVirtualKeyboardSupported())
		navigator.virtualKeyboard.show()
}
function hideKeyboard() {
	if (this.isVirtualKeyboardSupported())
		navigator.virtualKeyboard.hide()
}
function tarihDegerDuzenlenmis(ch, valueBlock) {
	/*let d = new Date();
	let getDateToString = function() {
		return dateToString(d);
		//return d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
	};
	valueBlock = valueBlock || function() { return getDateToString() };*/
	if (typeof ch != 'string')
		return ch
	if (!ch)
		return null
	let converters = {
		  'b': (d) => d
		, 'y': (d) => { d.next().day(); return d }
		, 'd': (d) => { d.prev().day(); return d }
		, '2gs': (d) => { d.add(2).day(); return d }
		, '3gs': (d) => { d.add(3).day(); return d }
		, '4gs': (d) => { d.add(4).day(); return d }
		, '5gs': (d) => { d.add(5).day(); return d }
		, '6gs': (d) => { d.add(6).day(); return d }
		, '7gs': (d) => { d.add(7).day(); return d }
		, '8gs': (d) => { d.add(8).day(); return d }
		, '9gs': (d) => { d.add(9).day(); return d }
		, '10gs': (d) => { d.add(10).day(); return d }
		, '2go': (d) => { d.add(-2).day(); return d }
		, '3go': (d) => { d.add(-3).day(); return d }
		, '4go': (d) => { d.add(-4).day(); return d }
		, '5go': (d) => { d.add(-5).day(); return d }
		, '6go': (d) => { d.add(-6).day(); return d }
		, '7go': (d) => { d.add(-7).day(); return d }
		, '8go': (d) => { d.add(-8).day(); return d }
		, '9go': (d) => { d.add(-9).day(); return d }
		, '10go': (d) => { d.add(-10).day(); return d }
		
		, 'hs': (d) => { d.next().sunday(); return d }
		, 'hb': (d) => { d.prev().monday(); return d }
		, 'sh': (d) => { d.next().week(); return d }
		, 'gh': (d) => { d.prev().week(); return d }
		, 'shb': (d) => { converters.hb(converters.sh(d)); return d }
		, 'shs': (d) => { converters.hs(converters.sh(d)); return d }
		, 'ghb': (d) => { converters.hb(converters.gh(d)); return d }
		, 'ghs': (d) => { converters.hs(converters.gh(d)); return d }
		, '2hs': (d) => { d.add(2).week(); return d }
		, '3hs': (d) => { d.add(3).week(); return d }
		, '4hs': (d) => { d.add(4).week(); return d }
		, '5hs': (d) => { d.add(5).week(); return d }
		, '6hs': (d) => { d.add(6).week(); return d }
		, '7hs': (d) => { d.add(7).week(); return d }
		, '8hs': (d) => { d.add(8).week(); return d }
		, '2ho': (d) => { d.add(-2).week(); return d }
		, '3ho': (d) => { d.add(-3).week(); return d }
		, '4ho': (d) => { d.add(-4).week(); return d }
		, '5ho': (d) => { d.add(-5).week(); return d }
		, '6ho': (d) => { d.add(-6).week(); return d }
		, '7ho': (d) => { d.add(-7).week(); return d }
		, '8ho': (d) => { d.add(-8).week(); return d }
		
		, 'as': (d) => { d.moveToLastDayOfMonth(); return d }
		, 'ab': (d) => { d.moveToFirstDayOfMonth(); return d }
		, 'sa': (d) => { d.next().month(); return d }
		, 'ga': (d) => { d.prev().month(); return d }
		, 'sas': (d) => { converters.as(converters.sa(d)); return d }
		, 'sab': (d) => { converters.ab(converters.sa(d)); return d }
		, 'gas': (d) => { converters.as(converters.ga(d)); return d }
		, 'gab': (d) => { converters.ab(converters.ga(d)); return d }
		, '2as': (d) => { d.add(2).month(); return d }
		, '3as': (d) => { d.add(3).month(); return d }
		, '4as': (d) => { d.add(4).month(); return d }
		, '5as': (d) => { d.add(5).month(); return d }
		, '6as': (d) => { d.add(6).month(); return d }
		, '2ao': (d) => { d.add(-2).month(); return d }
		, '3ao': (d) => { d.add(-3).month(); return d }
		, '4ao': (d) => { d.add(-4).month(); return d }
		, '5ao': (d) => { d.add(-5).month(); return d }
		, '6ao': (d) => { d.add(-6).month(); return d }
		
		, 'ys': (d) => { d.next().dec().moveToLastDayOfMonth(); return d }
		, 'yb': (d) => { d.prev().jan().moveToFirstDayOfMonth(); return d }
		, 'sy': (d) => { d.next().year(); return d }
		, 'gy': (d) => { d.prev().year(); return d }
		, 'sys': (d) => { converters.ys(converters.sy(d)); return d }
		, 'syb': (d) => { converters.yb(converters.sy(d)); return d }
		, 'gys': (d) => { converters.ys(converters.gy(d)); return d }
		, 'gyb': (d) => { converters.yb(converters.gy(d)); return d }
		, '2ys': (d) => { d.add(2).year(); return d }
		, '3ys': (d) => { d.add(3).year(); return d }
		, '4ys': (d) => { d.add(4).year(); return d }
		, '5ys': (d) => { d.add(5).year(); return d }
		, '2yo': (d) => { d.add(-2).year(); return d }
		, '3yo': (d) => { d.add(-3).year(); return d }
		, '4yo': (d) => { d.add(-4).year(); return d }
		, '5yo': (d) => { d.add(-5).year(); return d }
	};
	let _now = today();
	let valueGetter = function(noConvertFlag) {
		let value = ch;
		if (isInvalidDate(ch))
			value = getFuncValue(valueBlock)
		if (isInvalidDate(value))
			value = _now
		if (noConvertFlag)
			return value
		return value && $.type(value) == 'string'
					? asDate(value)
					: value
	};
	let result;
	if (ch[0] == '-' || ch[0] == '+') {
		result = valueGetter(false).add(parseInt(ch || 1)).day();
	}
	else {
		ch = ch.toLowerCase();
		let converter = converters[ch];
		if (converter)
			result = converter(valueGetter(false))
		if (!result || isInvalidDateDogrudan(result)) {
			let tmp = asDate(ch);
			if (tmp && !isInvalidDateDogrudan(tmp))
				result = tmp
		}
	}
	result = result || valueGetter(true);
	if (result && $.type(result) != 'string')
		result = dateToString(result)
	if (isInvalidDateDogrudan(result))
		return null
	return result;
}
function asTarihInputString(value) {
	if (!value)
		return value
	value = tarihDegerDuzenlenmis(value) || value;
	return asLocaleDateString(dateToString(value))
}
function sqlStringDuzenlenmis(value) {
	if (!value)
		return value
	return value.replace(/'/g, "''")
				.replace(/%/g, "%%")
				.replace(/\*/g, "%")
				.replace(/\?/g, "_")
}
function asDict(anArray, mapBlock) {
	if ($.isEmptyObject(anArray) || typeof anArray != 'object')
		return {}
	const result = {};
	for (const i in anArray) {
		const item = anArray[i];
		const kv = mapBlock(item, i);
		if (kv)
			result[kv.key == null ? kv.kod : kv.key] = kv.value == null ? kv.aciklama : kv.value
	}
	return result
}
function asSet(anArray) {
	if (!anArray)
		return null
	const isArray = window.$ ? $.isArray(anArray) : Array.isArray(anArray);
	if (!isArray)
		return anArray
	const result = {};
	for (const i in anArray) {
		const item = anArray[i];
		result[item] = true
	}
	return result
}
function dictToKAListe(e) {
	e = e || {};
	let {dict} = e;
	if (!dict)
		return null
	if ($.isEmptyObject(dict))
		return []
	if ($.isArray(dict))
		return dict
	
	let kodGetter = e.kodGetter || (value => value);
	let adiGetter = e.adiGetter || (value => value);
	return Object.entries(dict).map(entry => {
		return new CKodVeAdi({ kod: kodGetter(entry[0]), aciklama: adiGetter(entry[1]) })
	})
}

function asBool(value) {
	if (value == null || (typeof value == 'string' && !value) || value === 0 || value === "0" || value == "H" || value === "h" || value === 'false' || value === 'False' || value === 'FALSE') { return false }
	return !!value
}
function asBoolQ(value) { if (value == null) { return null } return asBool(value) }
function sqlAliasmi(value) { return (value == '_') || isLetterOrDigit(value) }
function isLetterOrDigit(value) { return value && value.length == 1 && ( (value >= 'a' && value <= 'z') || (value >= 'A' && value <= 'Z') || (value >= '0' && value <= '9') ) }
function isLetter(value) { return value && value.length == 1 && ( (value >= 'a' && value <= 'z') || (value >= 'A' && value <= 'Z') ) }
function isDigit(value) { return value && value.length == 1 && (value >= '0' && value <= '9') }
function isSeparator(value) { return value ? !!separatorCharsSet[value[0]] : false }
function isGUID(value) { return typeof value == 'string' && value?.length == guidLength && Array.from(value).filter(ch => ch == '-').length == 4 }
function parantezDengelimi(value, chars) {
	if (!value) { return true }
	if (!chars) chars = ['(', ')'];
	const result = {
		open: value.match(new RegExp(`[\\${chars[0]}]`, 'g')),
		close: value.match(new RegExp(`[\\${chars[1] || chars[0]}]`, 'g'))
	}
	return result.open?.length == result?.close.length
}
function hepsiUygunmu(coll, matchBlock) {
	if (!coll || !matchBlock) return true
	for (let i = 0; i < coll.length; i++) {
		const item = coll[i]; if (!matchBlock(item, i)) { return false }
	}
	return true
}
function varmi(coll, matchBlock) {
	if ($.isEmptyObject(coll)) { return false } if (!matchBlock) { return true }
	for (item of coll) { if (!matchBlock(item)) { return true } }
	return false
}
function getExpressions(e) {
	e = e || {}; let text = (typeof e == 'object' ? e.text : e) || '', expListe = text;
	if (!$.isArray(expListe)) {
		text = text.toString().trim(); expListe = [];
		let matchRegExp = /(?<=\[)[^\]\[\r\n]*(?=\])/g;
		let parts = text.match(matchRegExp);
		if (!$.isEmptyObject(parts)) { for (const part of parts) { let value = (part || '').toString().trim(); if (value) { expListe.push(value) } } }
		matchRegExp = /(?<=\#)[^\#\#\r\n]*(?=\#)/g; parts = text.match(matchRegExp);
		if (!$.isEmptyObject(parts)) { for (const part of parts) { let value = (part || '').toString().trim(); if (value) { expListe.push(value) } } }
	}
	return expListe
}
function getContrastedColor(bgColor, whiteColor, blackColor) {
  const whiteContrast = getContrast(bgColor, '#ffffff');
  const blackContrast = getContrast(bgColor, '#000000');
  return whiteContrast > blackContrast
	  ? (whiteColor == undefined ? '#ffffff' : whiteColor)
	  : (blackColor == undefined ? '#000000' : blackColor)
}

function getContrast(c1, c2) {
  const L1 = getLuminance(c1);
  const L2 = getLuminance(c2);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
}

function getLuminance(hexColor) {
  return (
	0.2126 * getsRGB(hexColor.substr(1, 2)) +
	0.7152 * getsRGB(hexColor.substr(3, 2)) +
	0.0722 * getsRGB(hexColor.substr(-2))
  )
}
function getsRGB(c) { return getRGB(c) / 255 <= 0.03928 ? getRGB(c) / 255 / 12.92 : Math.pow((getRGB(c) / 255 + 0.055) / 1.055, 2.4) }
function getRGB(c) { return parseInt(c, 16) || c }
function rTrim(value) { if (value && typeof value == 'string') { value = value.trimEnd() } return value }
function hvListeFarkSonucu(e) {
	e = e || {}; const hv1Liste = e.hv1Liste ?? e.hvListe1 ?? [], hv2Liste = e.hv2Liste ?? e.hvListe2 ?? [];
	let uniqueKeys = e.uniqueKeys ?? e.anahtarListe; if (!$.isArray(uniqueKeys)) { uniqueKeys = Object.keys(uniqueKeys) }
	/* const ortakKeys = $.isEmptyObject(hv1Liste) || $.isEmptyObject(hv2Liste) ? uniqueKeys : kesisim(Object.keys(hv1Liste[0]), Object.keys(hv2Liste[0])); */
	const buildKey = e => {
		const {hv} = e, result = {}; for (const key of uniqueKeys) { const value = hv[key]; result[key] = value };
		e.keyHV = result; e.keyStr = Object.values(result).map(item => item ?? '').join('|')
	}, getKeyStr = hv => { const _e = { hv }; buildKey(_e); return _e.keyStr }
	const keyToHV2 = {}; for (const hv of hv2Liste) { keyToHV2[getKeyStr(hv)] = hv }
	const result = { eklenecekler: [], degisecekler: [], silinecekler: [] }, {eklenecekler, degisecekler, silinecekler} = result;
	for (let hv of hv1Liste) {
		const _e = { hv }; buildKey(_e); const {keyStr, keyHV} = _e, hv2 = keyToHV2[keyStr];
		if (hv.kaysayac) { hv = $.extend({}, hv); delete hv.kaysayac }
		if (hv2) { const farkHV = degisimHV(hv, hv2); if (!$.isEmptyObject(farkHV)) { degisecekler.push({ keyHV, farkHV }) } delete keyToHV2[keyStr] }
		else { eklenecekler.push(hv) }
	}
	for (const hv of Object.values(keyToHV2)) { const _e = { hv }; buildKey(_e); const {keyHV} = _e; silinecekler.push(keyHV) }
	return result
}
function kesisim(orj, diger) {
	if (orj == null || diger == null) { return [] } const digerSet = asSet(diger), result = {};
	for (const item of orj) { if (digerSet[item]) { result[item] = true } }
	return Object.keys(result)
}
function degisimHV(orj, diger, alma) {
	if (orj == null || diger == null) return orj
	const almaSet = $.isArray(alma) ? asSet(alma) : (alma || {}), result = {};
	const convertedValue = value => { if (isDate(value)) { value = dateTimeToString(value) } return rTrim(value) }
	for (const key in orj) {
		if (almaSet[key]) { continue }
		const orjDeger = orj[key], digerDeger = convertedValue(diger[key]);
		if (convertedValue(orjDeger) != digerDeger) { result[key] = orjDeger }
	}
	return result
}
function arrayInsert(liste, index, ...items) { return liste.splice(index, 0, ...items) }
function arraySort(liste, _sortFunc) {
	if ($.isArray(liste) || $.isEmptyObject(liste)) return liste
	_sortFunc = _sortFunc || sortFunc; return liste.sort(_sortFunc)
}
function arraySortReverse(liste, _sortFunc) {
	let result = arraySort(liste);
	if (result)
		result = result.reverse();
	return result
}
function sortFunc(a, b) {
	return a < b
}
function reverseSortFunc(a, b) {
	return !sortFunc(a, b)
}
function intToHex(value) {
	return typeof value == 'number' ? value.toString(16).padStart(2, '0') : value
}
function hexToInt(value) {
	if (typeof value != 'string')
		return value;
	if (!value)
		return null;
	
	if (value.charAt(0) == '#')
		value = value.slice(1);
	if (!(value.charAt(0) == '0' && value.charAt(1) == 'x'))
		value = '0x' + value;
	
	return eval(value)
}
function os2HTMLColor(value) {
	value = osColor2RGB(value);
	return rgb2HTMLColor(value)
}
function rgb2HTMLColor(rgb, _green, _blue) {
	if (rgb == null)
		return rgb;
	if (typeof rgb != 'object')
		rgb = { r: rgb, g: _green, b: _blue };
	
	return `#${intToHex(rgb.r)}${intToHex(rgb.g)}${intToHex(rgb.b)}`
}
function html2RGB(value) {
	if (typeof value == 'number')
		return value;
	if (typeof value != 'string')
		return null;

	value = hexToInt(value);
	return osColor2RGB(value)
}
function html2OSColor(value) {
	value = html2RGB(value);
	return rgb2OSColor(value)
}
function osColor2RGB(value) {
	if (typeof value == 'string')
		return value;
	if (typeof value != 'number')
		return value;
	
	return ({
		r: (value & 0xff0000) >> 16, 
	    g: (value & 0x00ff00) >> 8, 
	    b: (value & 0x0000ff)
	})
}
function rgb2OSColor(rgb, _green, _blue) {
	if (rgb == null) return rgb
	if (typeof rgb != 'object') rgb = { r: rgb, g: _green, b: _blue }
	return (rgb.r << 16) + (rgb.g << 8) + (rgb.b)	
}
function getSeriVeNo(e) { return SeriVeNo.fromText(e) }
function yedir(liste) { }
function seviyelendir(e) {
	e = e || {}; const {source, attrListe} = e;
	if ($.isEmptyObject(source) || $.isEmptyObject(attrListe)) return source
	const getter = e.getter || (e => null);
	const detayGetter = e.detayGetter || (e => null);
	const attrLen = attrListe.length;
	const sonSeviyeler = [];
	const aktifSeviyeler = [];
	const detayListeler = [];
	
	const result = [];
	detayListeler[0] = result;
	detayListeler[attrLen] = [];							// size: attrLen + 1

	let ilkGecismi = true;
	for (const item of source) {
		for (let i = 0; i < attrLen; i++) {
			const attr = attrListe[i];
			aktifSeviyeler[i] = item[attr]
		}
		
		for (let i = 0; i < attrLen; i++) {
			const attr = attrListe[i];
			if (ilkGecismi || sonSeviyeler[i] != aktifSeviyeler[i]) {
				const sev = getter
					? coalesce(getter({ sevAttr: attr, item: item }), new SeviyeliYapi({ orjBilgi: item }))
					: new SeviyeliYapi({ orjBilgi: item });
				detayListeler[i].push(sev);
				detayListeler[i + 1] = sev.detaylar;
				sonSeviyeler[i] = aktifSeviyeler[i];
				for (let j = i + 1; j < attrLen; j++)
					delete sonSeviyeler[j]
				ilkGecismi = true
			}
		}

		const det = detayGetter ? coalesce(detayGetter({ item: item }), item) : item;
		detayListeler[attrLen].push(det);					// size: attrLen + 1
		ilkGecismi = false
	}
	return result
}
function seviyelendirAttrGruplari(e) {
	e = e || {}; const {source, attrGruplari} = e;
	if ($.isEmptyObject(source) || $.isEmptyObject(attrGruplari)) return source
	const getter = e.getter || (e => null);
	const detayGetter = e.detayGetter || (e => null);
	const attrGrupLen = attrGruplari.length;
	const sonSeviyeler = [];
	const aktifSeviyeler = [];
	const detayListeler = [];
	
	const result = [];
	detayListeler[0] = result;
	detayListeler[attrGrupLen] = [];							// size: attrLen + 1

	let ilkGecismi = true;
	for (const item of source) {
		for (let i = 0; i < attrGrupLen; i++) {
			const attrListe = attrGruplari[i];
			const values = attrListe.map(attr => item[attr]);
			aktifSeviyeler[i] = values
		}
		
		for (let i = 0; i < attrGrupLen; i++) {
			const attrListe = attrGruplari[i];
			if (ilkGecismi || !hepsiUygunmu(sonSeviyeler[i], (bu, j) => aktifSeviyeler[i][j] == bu)) {
				const sev = getter
					? coalesce(getter({ sevAttrListe: attrListe, item: item }), new SeviyeliYapi({ orjBilgi: item }))
					: new SeviyeliYapi({ orjBilgi: item });
				detayListeler[i].push(sev);
				detayListeler[i + 1] = sev.detaylar;
				sonSeviyeler[i] = aktifSeviyeler[i];
				for (let j = i + 1; j < attrGrupLen; j++)
					delete sonSeviyeler[j]
				ilkGecismi = true
			}
		}

		const det = detayGetter ? coalesce(detayGetter({ item: item }), item) : item;
		detayListeler[attrGrupLen].push(det);					// size: attrLen + 1
		ilkGecismi = false
	}

	return result
}
function iniTextSonucu(text) {
	const result = {};
	if (!text)
		return result;

	let sonAttr, sonDeger;
	const _parts = text.split('=');
	const parts = [];
	let eklenecekPart;
	for (let part of _parts) {
		if (eklenecekPart) {
			part = `${eklenecekPart}=${part}`;
			eklenecekPart = null;
		}
		
		if (parantezDengelimi(part, '()'))
			parts.push(part);
		else if (parts.length)
			eklenecekPart = part;
	}

	let ardisikAtanacaklar = [];
	const size = parts.length;
	const atamaYap = () => {
		if (sonDeger == '""')
			sonDeger = '';
		result[sonAttr] = sonDeger;
		if (ardisikAtanacaklar.length) {
			for (const atanacakAttr of ardisikAtanacaklar)
				result[atanacakAttr] = sonDeger;
			ardisikAtanacaklar = [];
		}
	};
	for (let i = 0; i < size; i++) {
		let part = parts[i].trim();
		switch (i) {
			case 0:
				sonAttr = part;
				break;
			case (size - 1):
				sonDeger = part;
				atamaYap();
				break;
			default:
				let j = part.length - 1;
				while (j >= 0) {
					const ch = part[j];
					if (isSeparator(ch))
						break;
					j--;
				}

				let yeniAttr = part.slice(j + 1);
				if (j >= 0) {
					sonDeger = part.slice(0, j).trim();
					atamaYap();
				}
				else {
					// onceki deger yoksa ardisik atama vardir
					ardisikAtanacaklar.push(sonAttr);
				}
				sonAttr = yeniAttr;
				sonDeger = null;
				break;
		}
	}

	return result
}
function makeScrollable(target) {
	if (!target)
		return;
	
	if (target.length)
		target = target[0];
	
	// target.style.cursor = 'grab';
	const e = {
		target: target,
		pos: { top: 0, left: 0, x: 0, y: 0 },
		isScrolled: false
	};
	const mouseDownHandler = event => {
		const {target, pos} = e;
		const {button} = event;
		if (!(button == 0 || button == 2))
			return;
		target.style._cursor = target.style.cursor;
		target.style.cursor = 'grabbing';
		target.style.userSelect = 'none';
		$.extend(pos, {
			left: target.scrollLeft,
			top: target.scrollTop,
			// Get the current mouse position
			x: event.clientX,
			y: event.clientY
		});
		window.addEventListener('mousemove', mouseMoveHandler);
		window.addEventListener('mouseup', mouseUpHandler);
		e.isScrolled = false;
	};
	const mouseMoveHandler = event => {
		const {target, pos} = e;
		// How far the mouse has been moved
		const dx = event.clientX - pos.x;
		const dy = event.clientY - pos.y;
		// Scroll the element
		target.scrollTop = pos.top - dy;
		target.scrollLeft = pos.left - dx;
		if (Math.abs(dx) > 30 || Math.abs(dy) > 15)
			e.isScrolled = true
	};
	const mouseUpHandler = event => {
		// target.style.cursor = 'grab';
		target.style.cursor = target.style._cursor;
		delete target.style._cursor;
		target.style.removeProperty('user-select');
		window.removeEventListener('mousemove', mouseMoveHandler);
		window.removeEventListener('mouseup', mouseUpHandler);
		if (e.isScrolled) {
			target.classList.add(`scrolled`);
			setTimeout(() =>
				target.classList.remove(`scrolled`),
				200);
		}
	};
	target.addEventListener('mousedown', mouseDownHandler);
}
function escapeHTML(value) {
	if (!value) return value
	let donusumDict = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "/": "&#x2F;", "`": "&#x60;", "=": "&#x3D;" };
	return value.toString().replace(/[&<>"'`=\/]/g, ch => donusumDict[ch])
}
function unescapeHTML(value) {
	if (!value) return value
	let donusumDict = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', "'": '&#39;', '/': '&#x2F', '`': '&#x60', '=': '&#x3D;' }; value = value.toString();
	for (const [search, replace] of Object.entries(donusumDict)) { value = value.replaceAll(search, replace) }
	return value
}
function escapeXML(value) {
	if (!value) return value
	const donusumDict = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
	return value.toString().replace(/[&<>"]/g, ch => donusumDict[ch])
}
function unescapeXML(value) {
	if (!value) return value
	let donusumDict = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"'}; value = value.toString();
	for (const [search, replace] of Object.entries(donusumDict)) { value = value.replaceAll(search, replace) }
	return value
}
function sanitizeHTML(value) {
	const regExp = new RegExp("<s*(applet|audio|base|bgsound|embed|form|iframe|isindex|keygen|layout|link|meta|object|script|svg|style|template|video)[^>]*>(.*?)<s*/s*(applet|audio|base|bgsound|embed|form|iframe|isindex|keygen|layout|link|meta|object|script|svg|style|template|video)>", "ig");
	return value.toString().replace(regExp, ch => escapeHTML(ch))
}
function yalnizYazisi(e) {
	const value = e == null || e.value == null ? e : e.value;
	if (typeof value != 'number')
		return value || ''
	const result = numberAsLiraVeKurusText(value);
	return result ? `YALNIZ ${result}` : ''
}
function numberAsLiraVeKurusText(e) {
	const value = e == null || e.value == null ? e : e.value;
	if (typeof value != 'number')
		return value || ''
	
	const tl = asInteger(value);
	const kr = asInteger(roundToBedelFra(value - tl) * 100);
	return (
		`${numberAsText(tl)}TL ` +
		(kr ? `${numberAsText(kr)}KR` : ``)
	)
}
function numberAsText(e) {
	const value = e == null || e.value == null ? e : e.value;
	if (typeof value != 'number')
		return value || ''
	
	const listeler = {
		birler: ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'],
		onlar:  ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'],
		carpan: ['', 'Bin', 'Milyon', 'Milyar', 'Trilyon', 'Katrilyon', 'Kentrilyon']
	};

	let ucerlemeColl = [];
	let sayi = Math.abs(asInteger(value));
	while (sayi > 0) {
		ucerlemeColl.push(sayi % 1000);
		sayi = parseInt(sayi / 1000)
	}
	let result = [];
	let index = -1;
	for (const ucluk of ucerlemeColl) {
		index++;
		if (ucluk == 0)
			continue
		
		let currentText;
		if (ucluk == 1 && index == 1) {
			// '1Bin' olmaz sadece 'Bin' yazılır
			currentText = listeler.carpan[index]
		}
		else {
			let uclukText = '';
			let kalan = ucluk;
			let yuzler = parseInt(kalan / 100);
			if (yuzler > 0) {
				if (yuzler > 1) {
					// '1Yüz' olmaz sadece 'Yüz' yazılır
					uclukText += listeler.birler[yuzler];
				}
				uclukText += 'Yüz'
			}

			let kalanOnlar = kalan = parseInt(kalan % 100);
			uclukText += listeler.onlar[parseInt(kalanOnlar / 10)];
			let kalanBirler = kalan = parseInt(kalan % 10);
			uclukText += listeler.birler[kalanBirler];
			uclukText += listeler.carpan[index];
			uclukText += ' ';
			currentText = uclukText
		}

		if (currentText) {
			result.unshift(currentText);
			currentText = null
		}
	}
	return $.isEmptyObject(result) ? 'Sıfır' : result.join('')
}
function birlestirBosluk(...values) { return birlestir(' ', ...values) }
function birlestirCrLf(...values) { return birlestir(CrLf, ...values) }
function birlestirVirgul(...values) { return birlestir(',', ...values) }
function birlestirVirgulBosluk(...values) { return birlestir(', ', ...values) }
function birlestirNoktaliVirgul(...values) { return birlestir(';', ...values) }
function birlestirNoktaliVirgulBosluk(...values) { return birlestir('; ', ...values) }
function birlestirPipe(...values) { return birlestir('|', ...values) }
function birlestir(separator, ...values) {
	if (separator == null) separator = ''
	return $.isEmptyObject(values) ? '' : values.filter(x => !!x).join(separator)
}
function negated(value) { return -value }
function uygunKelimeliParcala(arrayOrString, length, concatNewLines) {
	if (!(arrayOrString && arrayOrString.length))
		return []
	if (length <= 0)
		return typeof arrayOrString == 'string' ? [arrayOrString] : arrayOrString
	if (typeof arrayOrString == 'string')
		arrayOrString = arrayOrString.split('\n')

	arrayOrString = arrayOrString.map(x => {
		if (x[x.length - 1] == '\r')
			x = x.slice(0, x.length - 1)
		return x
	});
	const result = [];
	for (const value of arrayOrString) {
		const subResult = uygunKelimeliParcalaDogrudan(value, length);
		if (subResult) {
			if (concatNewLines)
				result.push(...subResult)
			else
				result.push(subResult)
		}
	}
	return result
}
function uygunKelimeliParcalaBirlesik(arrayOrString, length, concatNewLines) { return uygunKelimeliParcala(arrayOrString, length, true) }
function uygunKelimeliParcalaDogrudan(value, length) {
	if (!value)
		return []
	if (length <= 0 || value.length <= length)
		return [value]
	
	const result = [];
	let startIndex = 0;
	while (startIndex < value.length) {
		// endIndex, string'in sonunu aşarsa, string'in sonunu al
		let endIndex = startIndex + length;
		if (endIndex >= value.length)
			endIndex = value.length

		const orjEndIndex = endIndex;
		// endIndex'i kelime sonu kadar geri al
		if (endIndex < value.length - 1) {
			while (endIndex > startIndex && !/\s/.test(value.charAt(endIndex - 1)))			/*  /\s/ => regexp - space, tab, crlf ... separator chars kontrolu için */
			  endIndex--
		}
		if (endIndex <= startIndex)				// bir kelimenin uzunlugu parça length'den büyük ise
			endIndex = orjEndIndex
		// Parçayı result dizisine ekle
		result.push(value.slice(startIndex, endIndex));
		startIndex = endIndex
	}
	return result
}
function errorTextsAsObject(e, _errCode, _errResultPrefix, _errResultPostfix, _errResultConverter, _errItemConverter) {
	let errorTexts = e?.errorTexts ?? e.errTexts ?? e.errors ?? e.texts ?? e.liste ?? e.result ?? e, errCode = e?.errCode ?? _errCode;
	let errResultPrefix  = e?.errResultPrefix ?? _errResultPrefix, errResultPostfix = e?.errResultPostfix ?? _errResultPostfix;
	let errResultConverter  = e?.errResultConverter ?? _errResultConverter, errItemConverter = e?.errItemConverter ?? _errItemConverter;
	if (errorTexts && typeof errorTexts == 'string') { errorTexts = [errorTexts] }
	if (errorTexts?.length) { errorTexts = errorTexts.filter(x => !!x) }
	if (!errorTexts?.length) { return null }
	if (errResultConverter == null) { errResultConverter = text => `<ul class="errors">${text}</ul>`}
	if (errItemConverter == null) { errItemConverter = item => `<li class="item">${item}</li>`}
	const errorText = `${errResultPrefix || ''}${errResultConverter(errorTexts.map(errItemConverter).join(''))}${errResultPostfix || ''}`;
	return { isError: true, rc: errCode, errorText } 
}
function gridDipIslem_sum(toplam, value, belirtec, rec, _) {
	if (value?.constructor?.name == 'Number') value = asFloat(value)
	return roundToBedelFra((toplam || 0) + (value || 0))
}
function gridDipIslem_avg(toplam, value, belirtec, rec, _) {
	if (value?.constructor?.name == 'Number') value = asFloat(value)
	toplam = (toplam || 0) + (value || 0);
	const count = rec?.boundindex + 1; if (toplam && typeof count == 'number') toplam = toplam / count
	return roundToBedelFra(toplam)
}
async function getFS(temp, e) {
	e = e || {}; if (temp == null) temp = e.temp
	const {storage} = navigator; if (temp == null) { temp = !(await storage.persist()) }
	const fs = await storage.getDirectory({ type: temp ? 'temporary' : 'persistent' });
	return { temp, storage, fs }
}
function getTempFS(e) { return this.getFS(true, e) }
async function getFSDirHandle(path, create, e) {
	e = e || {}; if (path == null) path = e.name ?? e.path
	if (!path) return null
	if (create == null) create = e.create
	let fs = e.fs ?? (await this.getFS(null, e)).fs; if (!fs) { return fs }
	let parts = path.split('/'), dir = fs;
	for (let name of parts) {
		name = name?.trimEnd(); if (!name) continue
		dir = await dir.getDirectoryHandle(name, { create })
	}
	return dir
}
async function getFSFileHandle(name, path, create, e) {
	e = e || {}; if (name == null) name = e.name
	if (path == null) path = e.path
	if (create == null) create = e.create
	if (!name) return null
	let fs = e.fs ?? (await this.getFS(null, e)).fs; if (!fs) return fs
	let dir = await this.getFSDirHandle(path, create, e);
	return dir ? await dir.getFileHandle(name, { create }) : dir
}
async function getFSFile(name, path, create, e) {
	e = e || {};
	const fh = await this.getFSFileHandle(name, path, create, e);
	return fh ? await fh.getFile() : fh
}

function waitUntil(proc, opts) {
	if (!proc)
		return null
	opts = opts || {}; const id = newGUID();
	const info = {
		promise: new $.Deferred(), steps: 0, aborted: false,
		abort() { const {hTimer} = this; return this.aborted = true; clearTimeout(hTimer); return hTimer }
	};
	const delay = opts.delay ?? opts.delayMS ?? opts.interval ?? 10;
	let args = opts.args ?? [], timerProc;
	if (!$.isArray(args)) args = [args]
	timerProc = async (info, delay, args) => {
		clearTimeout(info.hTimer);
		const {promise} = info; info.steps++;
		if (info.aborted) return
		try {
			const result = await getFuncValue.call(this, proc, ...args);
			if (result) { promise.resolve(result); return }
			if (info.aborted) return
			info.hTimer = setTimeout(timerProc, delay, info, delay, args);
		}
		catch (ex) { hasError = true; promise.reject(ex); return null }
	};
	info.hTimer = setTimeout(timerProc, 1, info, delay, args);
	return info
}
function isTouchDevice() {
	return !!navigator.maxTouchPoints
}
function disableTouch() {
	window.document.addEventListener('touchstart', e => {
		if (e.touches.length > 1)
			e.preventDefault()
	}, { passive: false });
}
function preventUnload() {
	allowUnload();
	const handler = this._beforeUnloadHandler = evt => {
		evt.preventDefault();
	    return evt.returnValue = 'Uygulamadan çıkmak istediğinize emin misiniz?'
	};
	window.addEventListener('beforeunload', handler);
	this.isUnloadHandlerRegistered = true
}
function allowUnload() {
	if (!this.isUnloadHandlerRegistered)
		return
	const handler = this._beforeUnloadHandler;
	if (handler)
		window.removeEventListener('beforeunload', handler)
	this.isUnloadHandlerRegistered = false
}
function getOppositeOrientation(value) {
	if (value == null)
		value = screen.orientation.type
	const KeyPortrait = 'portrait';
	return value.startsWith(KeyPortrait) ? 'landscape' : KeyPortrait
}
async function rotate(lockButton) {
	//if (!window.document.fullscreenElement)
	//  await window.document.documentElement.requestFullscreen();
	await requestFullScreen();
	const newOrientation = getOppositeOrientation();
	await screen.orientation.lock(newOrientation)
}

async function requestFullScreen(e) {
	e = e || {};
	if (window.document.fullscreen || (!e.force && asBool(qs.noFullScreen || qs.tamEkranYok)))
		return true
	const docElm = window.document.documentElement;
	try { await docElm.requestFullscreen(); return true } catch (ex) { }
	try { await docElm.webkitRequestFullScreen(); return true } catch (ex) { }
	try { await docElm.mozRequestFullScreen(); return true } catch (ex) { }
	try { await docElm.msRequestFullscreen(); return true } catch (ex) { }
	try { await window.document.requestFullscreen(); return true } catch (ex) { }
	try { await window.document.webkitRequestFullScreen(); return true } catch (ex) { }
	try { await window.document.mozRequestFullScreen(); return true } catch (ex) { }
	try { await window.document.msRequestFullscreen(); return true } catch (ex) { }
	return false
}
async function cancelFullScreen(e) {
	e = e || {};
	if (!window.document.fullscreen)
		return true
	try { await docElm.exitFullscreen(); return true } catch (ex) { }
	try { await docElm.webkitCancelFullScreen(); return true } catch (ex) { }
	try { await docElm.mozExitFullScreen(); return true } catch (ex) { }
	try { await docElm.mozCancelFullScreen(); return true } catch (ex) { }
	try { await docElm.msExitFullscreen(); return true } catch (ex) { }
	try { await docElm.msCancelFullscreen(); return true } catch (ex) { }
	try { await window.document.exitFullscreen(); return true } catch (ex) { }
	try { await window.document.webkitCancelFullScreen(); return true } catch (ex) { }
	try { await window.document.mozExitFullScreen(); return true } catch (ex) { }
	try { await window.document.mozCancelFullScreen(); return true } catch (ex) { }
	try { await window.document.msExitFullscreen(); return true } catch (ex) { }
	try { await window.document.msCancelFullscreen(); return true } catch (ex) { }
	return false
}

(function() {
	// global init
	const sabitChars = [' ', '\t', '\n', '\r', '\b']; separatorCharsSet = asSet(sabitChars);
	window.addEventListener('mousemove', evt => window.mousePos = { x: evt.clientX, y: evt.clientY });
	window.addEventListener('focus', evt => { appActivatedFlag = true; console.debug('app activated', evt) });
	window.addEventListener('blur', evt => { appActivatedFlag = false; console.debug('app deactivated', evt) });
	console.debug({ appHasFocus: appActivatedFlag })
	// screen.orientation.addEventListener('change', updateLockButton);
})()