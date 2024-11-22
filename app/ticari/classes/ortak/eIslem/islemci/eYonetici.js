class EYonetici extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get eIslTip2Token() { let result = this._eIslTip2Token; if (result === undefined) { result = this._eIslTip2Token = {} } return result }
	static set eIslTip2Token(value) { this._eIslTip2Token = value }
	constructor(e) { e = e || {}; super(e); $.extend(this, { eConf: e.eConf ?? MQEConf.instance, eIslSinif: e.eIslSinif, ps2SayacListe: e.ps2SayacListe, whereDuzenleyici: e.whereDuzenleyici }) }
	static async eIslemGonder(e) {
		const eYoneticiler = await this.getEYoneticiListe(e); delete e.eYoneticiler; const uuid2Result = {};
		for (const eYonetici of eYoneticiler) {
			await eYonetici.eIslemGonder(e);
			const _uuid2Result = e.uuid2Result; if (!$.isEmptyObject(_uuid2Result)) { $.extend(uuid2Result, _uuid2Result) }
		}
		e.uuid2Result = uuid2Result
	}
	async eIslemGonder(e) {
			/* nesV4 test = 068E86F50AFBEFEB3795FD9BDC17EDE0D65D62A4EA2911F80F5C59854C518420 */
		e.internal = true; await this.eIslemXMLOlustur(e); delete e.internal; const eIslAnaSinif = this.eIslSinif;
		$.extend(e, {
			ps2SayacListe: this.ps2SayacListe || (() => this.class.getPS2SayacListe(e)),
			whereDuzenleyici: e => e.where.addAll(`fis.efatuuid <> ''`),
			sentDuzenleyici: e => {
				const {sent} = e; sent.fis2CariBagla();
				sent.sahalar.add('fis.seri', 'car.vkno', 'car.efatgibalias', 'car.eirsgibalias', 'car.efatsenaryotipi', 'car.email', 'car.earsivbelgetipi', 'car.revizeeislemmail')
			}
		});
		const stm = eIslAnaSinif.getUUIDStm(e); for (const key of ['psTip2SayacListe', 'sentDuzenleyici', 'whereDuzenleyici']) { delete e[key] }
		if (!stm) { throw { isError: true, rc: 'bosUUIDStm', errorText: 'Filtre hatalı' } }
		const {sender, callback} = e, param_eIslem = app.params.eIslem, {eConf} = this, {eIslEkArgs} = eConf, BlockSize = 20;
		const senderGIBAlias = eConf.getValue('gibAlias') ?? '', senderEIrsGIBAlias = eConf.getValue('eIrsGIBAlias') ?? '';
		const recs = await app.sqlExecSelect(stm), ps2Recs = this.class.getPS2Recs({ recs }), uuid2Result = e.uuid2Result = e.uuid2Result || {};
		if (!$.isEmptyObject(ps2Recs)) {
			const eConf = e.eConf ?? this.eConf;
			for (const psTip in ps2Recs) {
				const _recs = ps2Recs[psTip], eIslTip2Recs = {}, duzgunUUIDListe = [];
				for (const rec of _recs) { const efAyrimTipi = rec.efayrimtipi || 'A'; (eIslTip2Recs[efAyrimTipi] = eIslTip2Recs[efAyrimTipi] || []).push(rec) }
				for (const efAyrimTipi in eIslTip2Recs) {
					const _recs = eIslTip2Recs[efAyrimTipi] || []; if (!_recs.length) continue
					const eIslSinif = EIslemOrtak.getClass({ tip: efAyrimTipi }), eIslAltBolum = eConf.getAnaBolumFor({ eIslSinif });
					if (!eIslAltBolum) throw { isError: true, rc: 'eIslAnaBolumBelirsiz', errorText: 'e-İşlem için Ana Bölüm belirlenemedi' };
					let startIndex = 0; while (true) {
						const subRecs = _recs.slice(startIndex, startIndex + BlockSize); startIndex += BlockSize; if (!subRecs.length) { break }
						let savedToken = this.class.getTempToken(efAyrimTipi), subDuzgunUUIDListe = [];
						const results = await app.wsEIslemYap({
							eIslemci: efAyrimTipi, oe: eConf.getValue('ozelEntegrator')?.char || '', eIslemAPI: 'belgeGonder', eLogin: toJSONStr(eConf.eLogin), eToken: savedToken || '',
							ekArgs: toJSONStr(eIslEkArgs), args: subRecs.map(rec => {
								const {uuid, seri} = rec, senaryoTipi = rec.efatsenaryotipi, eArsivGonderimTipi = rec.earsivbelgetipi || '', receiverVKN = rec.vkno, eMailStr = rec.revizeeislemmail;
								const eMails = eMailStr ? eMailStr.split(';').filter(x => !!x?.trim() && x.length > 4 && x.includes('@') && x.includes('.')).map(x => x.trim()) : null;
								const receiverGIBAlia = (efAyrimTipi == 'IR') ? (rec.eirsgibalias || rec.efatgibalias) : rec.efatgibalias, belgeNox = rec.fisnox;
								return { uuid, seri, /*irsBaglantiVarmi,*/ senaryoTipi, receiverVKN, belgeNox, eMails }
							})
						});
						if (results) {
							for (let i = 0; i < subRecs.length; i++) {
								const result = results[i]; if (!result) continue
								const _rec = subRecs[i], {uuid} = _rec, isError = result.isError ?? !result.code, message = result.message ?? result.errorText;
								$.extend(result, { islemZamani: now(), isError, message, rec: _rec, efAyrimTipi, xmlDosya: `${eIslAltBolum}\\${uuid}.xml` });
								uuid2Result[uuid] = result; if (!isError) { duzgunUUIDListe.push(uuid); subDuzgunUUIDListe.push(uuid) }
								if (!savedToken) { const {token} = result; if (token != null && savedToken != token) { savedToken = token; this.class.setTempToken(efAyrimTipi, token) } }
								if (window.progressManager) { window.progressManager.progressStep() }
								if (callback) { getFuncValue.call(this, callback, e) }
							}
						}
						if (subDuzgunUUIDListe.length) {
							let upd = new MQIliskiliUpdate({ from: this.class.getPS2Table(psTip), set: [`efgonderimts = getdate()`], where: [{ inDizi: subDuzgunUUIDListe, saha: 'efatuuid' }] });
							await app.sqlExecNone(upd)
						}
					}
				}
			}
		}
		if (!e.internal) { if (sender && !sender.isDestroyed && sender.tazele) { sender.tazele() } }
	}
	static async eIslemIzle(e) {
		const eYoneticiler = await this.getEYoneticiListe(e); delete e.eYoneticiler; const uuid2Result = {};
		for (const eYonetici of eYoneticiler) {
			await eYonetici.eIslemIzle(e);
			const _uuid2Result = e.uuid2Result; if (!$.isEmptyObject(_uuid2Result)) { $.extend(uuid2Result, _uuid2Result) }
		}
		e.uuid2Result = uuid2Result
	}
	async eIslemIzle(e) {
		const gelenmi = asBool(e.gelen ?? e.gelenmi); if (!gelenmi) { e.internal = true; await this.eIslemXMLOlustur(e); delete e.internal }
		const eIslAnaSinif = this.eIslSinif; $.extend(e, { ps2SayacListe: this.ps2SayacListe || (() => this.class.getPS2SayacListe(e)) });
		const stm = eIslAnaSinif.getUUIDStm(e); for (const key of ['psTip2SayacListe', 'whereDuzenleyici']) { delete e[key] }
		if (!stm) throw { isError: true, rc: 'bosUUIDStm', errorText: 'Filtre hatalı' }
		const {sender, callback} = e, {eConf} = this, ps2Recs = {}, recs = await app.sqlExecSelect(stm);
		for (const rec of recs) { const {pstip, uuid} = rec; if (uuid) { (ps2Recs[pstip] = ps2Recs[pstip] || []).push(rec) } }
		const uuid2Result = e.uuid2Result = e.uuid2Result || {};
		if (!$.isEmptyObject(ps2Recs)) {
			const divContainer = $(`<div/>`)[0]; let eDocCount = 0;
			for (const psTip in ps2Recs) {
				const _recs = ps2Recs[psTip];
				for (const rec of _recs) {
					const {uuid} = rec, efAyrimTipi = rec.efayrimtipi || (gelenmi ? 'E' : 'A'), eIslSinif = EIslemOrtak.getClass({ tip: efAyrimTipi });
					const eIslAltBolum = eConf.getAnaBolumFor({ eIslSinif }); if (!eIslAltBolum) { throw { isError: true, rc: 'eIslAnaBolumBelirsiz', errorText: 'e-İşlem için Ana Bölüm belirlenemedi' } }
					const xmlDosyaAdi = `${uuid}.xml`, xmlDosya = `${eIslAltBolum}\\${gelenmi ? 'ALINAN' : 'IMZALI'}\\${xmlDosyaAdi}`;
					const result = uuid2Result[uuid] = uuid2Result[uuid] || {};
					$.extend(result, { islemZamani: now(), isError: false, eIslSinif, efAyrimTipi, rec, anaBolum: eIslAltBolum, xmlDosya });
					try {
						const xmlData = uuid2Result[uuid]?.xmlData || (await app.wsDownloadAsStream({ remoteFile: xmlDosya, localFile: xmlDosyaAdi }));
						if (!xmlData) { throw { isError: true, rc: 'noXML', errorText: 'XML (e-İşlem Belge İçeriği) bilgisi belirlenemedi' } } const xml = $.parseXML(xmlData);
						let xsltData = Array.from(xml.documentElement.querySelectorAll(`AdditionalDocumentReference`))
								?.find(elm => elm.querySelector('DocumentType')?.innerHTML == 'XSLT')?.querySelector('EmbeddedDocumentBinaryObject')?.textContent;
						if (!xsltData) { throw { isError: true, rc: 'noXSLT', errorText: 'XSLT (e-İşlem Görüntü) bilgisi belirlenemedi' } }
						if (xsltData?.startsWith(Base64.encode('<?xml'))) { xsltData = Base64.decode(xsltData) }
						const xslt = $.parseXML(Base64.decode(xsltData)), xsltProcessor = new XSLTProcessor(); xsltProcessor.importStylesheet(xslt);
						const eDoc = xsltProcessor.transformToFragment(xml, document);
						if (!eDoc) { console.error({ isError: true, rc: 'xsltTransform', errorText: 'XSLT Görüntüsü oluşturulamadı', source: xsltProcessor }); continue }
						if (eDocCount) {
							const elmPageBreak = $(`<div style="float: none;"><div style="page-break-after: always;"></div></div>`)[0];
							divContainer.lastElementChild.after(elmPageBreak); divContainer.lastElementChild.after(eDoc.querySelector('div'))
						}
						else { divContainer.append(eDoc) }
						eDocCount++; $.extend(result, { xmlData, xml, xsltData, xslt, xsltProcessor, eDoc, divContainer });
						if (window.progressManager) { window.progressManager.progressStep() } if (Object.keys(uuid2Result).length % 201 == 200) { if (callback) { getFuncValue.call(this, callback, e) } }
					}
					catch (ex) {
						if (!ex.responseJSON && ex.responseText) { try { ex = JSON.parse(ex.responseText) } catch (_ex) { } }
						$.extend(result, { isError: true, rc: ex?.rc ?? ex.code ?? '??', errorText: getErrorText(ex), error: ex }); console.error(ex)
					}
				}
			}
			if (callback) { getFuncValue.call(this, callback, e) }
			if (!e.internal) {
				if (eDocCount) { let newDocHTML = `<html><head>${divContainer.innerHTML}</head></html>`; const url = URL.createObjectURL(new Blob([newDocHTML], { type: 'text/html' })); openNewWindow(url) }
				if (sender && !sender.isDestroyed && sender.tazele) { sender.tazele() }
			}
		}
	}
	static async eIslemSorgula(e) {
		const eYoneticiler = await this.getEYoneticiListe(e); delete e.eYoneticiler;
		const promises = []; for (const eYonetici of eYoneticiler) { promises.push(eYonetici.eIslemSorgula(e)) } await Promise.all(promises)
	}
	async eIslemSorgula(e) {
		const eIslAnaSinif = this.eIslSinif;
		$.extend(e, { ps2SayacListe: this.ps2SayacListe || (() => this.class.getPS2SayacListe(e)), whereDuzenleyici: e=>e.where.addAll(`fis.efatuuid <> ''`) });
		const stm = eIslAnaSinif.getUUIDStm(e); for (const key of ['psTip2SayacListe', 'whereDuzenleyici']) { delete e[key] }
		if (!stm) { throw { isError: true, rc: 'bosUUIDStm', errorText: 'Filtre hatalı' } }
		const {sender, callback} = e, {eConf} = this, {eIslEkArgs} = eConf, recs = await app.sqlExecSelect(stm);
		const BlockSize = 50, ps2Recs = this.class.getPS2Recs({ recs }), uuid2Result = e.uuid2Result = e.uuid2Result || {}; let subUUID2Result = e.subUUID2Result = [], seq = 0;
		if (!$.isEmptyObject(ps2Recs)) {
			const eConf = e.eConf ?? this.eConf;
			for (const psTip in ps2Recs) {
				const _recs = ps2Recs[psTip], eIslTip2Recs = {};
				for (const rec of _recs) { const efAyrimTipi = rec.efayrimtipi || 'A'; (eIslTip2Recs[efAyrimTipi] = eIslTip2Recs[efAyrimTipi] || []).push(rec) }
				for (const efAyrimTipi in eIslTip2Recs) {
					let savedToken = this.class.getTempToken(efAyrimTipi); const _recs = eIslTip2Recs[efAyrimTipi] || []; if (!_recs.length) { continue }
					for (let i = 0; i < _recs.length; i += BlockSize) {
						seq++; const subRecs = _recs.slice(i, i + BlockSize);
						const results = await app.wsEIslemYap({
							eIslemci: efAyrimTipi, oe: eConf.getValue('ozelEntegrator')?.char || '', eIslemAPI: 'akibetSorgula', eLogin: toJSONStr(eConf.eLogin), eToken: savedToken || '',
							ekArgs: toJSONStr(eIslEkArgs), args: subRecs.map(rec => ({ gelenmi: false, uuid: rec.uuid }))
						});
						if (!savedToken && results?.length) { const {token} = results[0]; if (token != null && savedToken != token) { savedToken = token; this.class.setTempToken(efAyrimTipi, token) } }
						if (results) {
							for (let i = 0; i < subRecs.length; i++) {
								const result = results[i]; if (!result) { continue } const rec = subRecs[i], {uuid} = rec, sayac = rec.kaysayac;
								$.extend(result, { islemZamani: now(), isError: result.isError ?? !result.result, psTip, sayac, uuid, rec, efAyrimTipi });
								uuid2Result[uuid] = subUUID2Result[uuid] = result
							}
							if (!$.isEmptyObject(subUUID2Result)) { this.eIslemSorgula_sonucIsle(e); subUUID2Result = e.subUUID2Result = [] }
							if (window.progressManager) { window.progressManager.progressStep(results.length) } if (callback) { getFuncValue.call(this, callback, e) }
						}
					}
				}
			}
			if (window.progressManager) { window.progressManager.progressStep() } if (callback) { getFuncValue.call(this, callback, e) }
			if (!$.isEmptyObject(subUUID2Result)) { this.eIslemSorgula_sonucIsle(e) }
			subUUID2Result = []; delete e.subUUID2Result
		}
		if (!e.internal) { if (sender && !sender.isDestroyed && sender.tazele) { sender.tazele() } }
	}
	async eIslemSorgula_sonucIsle(e) {
		const uuid2Result = e.subUUID2Result ?? e.uuid2Result; if ($.isEmptyObject(uuid2Result)) { return }
		const gelenmi = e.gelen ?? e.gelenmi ?? false, toplu = new MQToplu().withDefTrn();
		for (const subResult of Object.values(uuid2Result)) {
			const {psTip, uuid} = subResult, from = gelenmi ? 'efgecicialfatfis' : psTip == 'S' ? 'sipfis' : 'piffis';
			const uuidSaha = gelenmi ? 'efuuid' : 'efatuuid', onaySaha = gelenmi ? 'onaydurumu' : 'efatonaydurumu';
			let value = subResult.isError ? 'X' : subResult.onayDurumChar;
			if (value != null) { toplu.add(new MQIliskiliUpdate({ from, where: { degerAta: uuid, saha: uuidSaha }, set: { degerAta: value, saha: onaySaha } })) }
		}
		if (toplu?.liste?.length) { await app.sqlExecNone(toplu) }
	}
	static async eIslemIptal(e) {
		const eYoneticiler = await this.getEYoneticiListe(e); delete e.eYoneticiler; const uuid2Result = {};
		for (const eYonetici of eYoneticiler) {
			await eYonetici.eIslemIptal(e);
			const _uuid2Result = e.uuid2Result; if (!$.isEmptyObject(_uuid2Result)) { $.extend(uuid2Result, _uuid2Result) }
		}
		e.uuid2Result = uuid2Result
	}
	async eIslemIptal(e) {
		const {sender} = e, {eConf} = this, eIslAnaSinif = this.eIslSinif;
		$.extend(e, { ps2SayacListe: this.ps2SayacListe || (() => this.class.getPS2SayacListe(e)), whereDuzenleyici: e => e.where.add(`fis.efatuuid <> ''`) });
		const stm = eIslAnaSinif.getUUIDStm(e); for (const key of ['psTip2SayacListe', 'whereDuzenleyici']) { delete e[key] }
		if (!stm) { throw { isError: true, rc: 'bosUUIDStm', errorText: 'Filtre hatalı' } }
		const recs = await app.sqlExecSelect(stm), ps2Recs = this.class.getPS2Recs({ recs });
		const {callback} = e, uuid2Result = e.uuid2Result = e.uuid2Result || {};
		if (!$.isEmptyObject(ps2Recs)) {
			const eConf = e.eConf ?? this.eConf;
			for (const psTip in ps2Recs) {
				const _recs = ps2Recs[psTip], eIslTip2Recs = {}, duzgunUUIDListe = [], block_duzgunUUIDListe = [];
				const updateIslemi = async () => {
					if (!block_duzgunUUIDListe?.length) { return }
					let upd = new MQIliskiliUpdate({ 
						from: this.class.getPS2Table(psTip), set: [`efatuuid = ''`, `efgonderimts = NULL`],
						where: [`(efgonderimts IS NOT NULL OR efatuuid <> '')`, { inDizi: block_duzgunUUIDListe, saha: 'efatuuid' }]
					});
					await app.sqlExecNone(upd)
				};
				for (const rec of _recs) { const efAyrimTipi = rec.efayrimtipi || 'A'; (eIslTip2Recs[efAyrimTipi] = eIslTip2Recs[efAyrimTipi] || []).push(rec) }
				for (const efAyrimTipi in eIslTip2Recs) {
					const _recs = eIslTip2Recs[efAyrimTipi] || []; if (!_recs.length) { continue }
					let savedToken = this.class.getTempToken(efAyrimTipi);
					try {
						const results = await app.wsEIslemYap({
							eIslemci: efAyrimTipi, oe: eConf.getValue('ozelEntegrator')?.char || '', eIslemAPI: 'belgeIptal',
							eLogin: toJSONStr(eConf.eLogin), eToken: savedToken || '', args: _recs.map(rec => ({ uuid: rec.uuid }))
						});
						if (results) {
							for (let i = 0; i < _recs.length; i++) {
								const result = results[i]; if (!result) { continue } const _rec = _recs[i], {uuid} = _rec;
								$.extend(result, { islemZamani: now(), isError: false, rec: _rec, efAyrimTipi }); uuid2Result[uuid] = result;
								if (!savedToken) { const {token} = result; if (token != null && savedToken != token) { savedToken = token; this.class.setTempToken(efAyrimTipi, token) } }
								if (!result.isError) { duzgunUUIDListe.push(uuid); block_duzgunUUIDListe.push(uuid) }
								if (window.progressManager) { window.progressManager.progressStep() }
								if (Object.keys(uuid2Result).length % 201 == 200) { await updateIslemi(); if (callback) { getFuncValue.call(this, callback, e) } }
							}
						}
					}
					catch (ex) {
						if (!ex.responseJSON && ex.responseText) { try { ex = JSON.parse(ex.responseText) } catch (_ex) { } }
						const errorText = getErrorText(ex); for (const rec of _recs) {
							const {uuid} = rec; if (!uuid) { continue }
							uuid2Result[uuid] = { islemZamani: now(), uuid, rec, isError: true, rc: ex?.rc ?? ex.code ?? '??', errorText, error: ex };
							console.error(ex)
						}
					}
					await updateIslemi(); if (callback) { getFuncValue.call(this, callback, e) } }
				}
		}
		if (!e.internal) { if (sender && !sender.isDestroyed && sender.tazele) { sender.tazele() } }
	}
	static async xmlKaldir(e) {
		const eYoneticiler = await this.getEYoneticiListe(e); delete e.eYoneticiler; const uuid2Result = {};
		for (const eYonetici of eYoneticiler) {
			await eYonetici.xmlKaldir(e);
			const _uuid2Result = e.uuid2Result; if (!$.isEmptyObject(_uuid2Result)) { $.extend(uuid2Result, _uuid2Result) }
		}
		e.uuid2Result = uuid2Result
	}
	async xmlKaldir(e) {
		const eIslAnaSinif = this.eIslSinif;
		$.extend(e, { ps2SayacListe: this.ps2SayacListe || (()=>this.class.getPS2SayacListe(e)), whereDuzenleyici: e => e.where.add(`fis.efatuuid <> ''`) });
		const stm = eIslAnaSinif.getUUIDStm(e); for (const key of ['psTip2SayacListe', 'whereDuzenleyici']) { delete e[key] }
		if (!stm) { throw { isError: true, rc: 'bosUUIDStm', errorText: 'Filtre hatalı' } }
		const {sender, callback} = e, {eConf} = this, {eIslEkArgs} = eConf, recs = await app.sqlExecSelect(stm), ps2Recs = this.class.getPS2Recs({ recs });
		const uuid2Result = e.uuid2Result = e.uuid2Result || {};
		if (!$.isEmptyObject(ps2Recs)) {
			const eConf = e.eConf ?? this.eConf; let duzgunUUIDListe = [], block_duzgunUUIDListe = [];
			for (const psTip in ps2Recs) {
				const _recs = ps2Recs[psTip], eIslTip2Recs = {};
				for (const rec of _recs) { const efAyrimTipi = rec.efayrimtipi || 'A'; (eIslTip2Recs[efAyrimTipi] = eIslTip2Recs[efAyrimTipi] || []).push(rec) }
				for (const efAyrimTipi in eIslTip2Recs) {
					const _recs = eIslTip2Recs[efAyrimTipi] || []; if (!_recs.length) { continue }
					const updateIslemi = async () => {
						if (!block_duzgunUUIDListe?.length) { return }
						let upd = new MQIliskiliUpdate({ 
							from: this.class.getPS2Table(psTip), set: [`efatuuid = ''`, `efgonderimts = NULL`],
							where: [`(efgonderimts IS NOT NULL OR efatuuid <> '')`, { inDizi: duzgunUUIDListe, saha: 'efatuuid' }]
						});
						await app.sqlExecNone(upd)
					};
					try {
						// let savedToken = this.class.getTempToken(efAyrimTipi);
						const results = await app.wsEIslemYap({
							eIslemci: efAyrimTipi, oe: eConf.getValue('ozelEntegrator')?.char || '', eIslemAPI: 'xmlKaldir',
							/*eLogin: toJSONStr(eConf.eLogin), eToken: savedToken || '',*/ eToken: true,
							ekArgs: toJSONStr(eIslEkArgs), args: _recs.map(rec => ({ uuid: rec.uuid }))
						});
						if (results) {
							for (let i = 0; i < results.length; i++) {
								const result = results[i]; if (!result) { continue } const _rec = _recs[i], {uuid} = _rec;
								$.extend(result, { islemZamani: now(), isError: false, rec: _rec, efAyrimTipi }); uuid2Result[uuid] = result;
								if (!result.isError) { duzgunUUIDListe.push(uuid); block_duzgunUUIDListe.push(uuid) }
								if (window.progressManager) { window.progressManager.progressStep() }
							}
						}
						if (window.progressManager) { window.progressManager.progressStep() };
						if (Object.keys(uuid2Result).length % 201 == 200) { await updateIslemi(); if (callback) { getFuncValue.call(this, callback, e) } }
					}
					catch (ex) {
						if (!ex.responseJSON && ex.responseText) { try { ex = JSON.parse(ex.responseText) } catch (_ex) { } }
						const errorText = getErrorText(ex); for (const rec of _recs) {
							const {uuid} = rec; if (!uuid) { continue }
							uuid2Result[uuid] = { islemZamani: now(), uuid, rec, isError: true, rc: ex?.rc ?? ex.code ?? '??', errorText, error: ex };
							console.error(ex)
						}
					}
					await updateIslemi(); if (callback) { getFuncValue.call(this, callback, e) }
				}
			}
		}
		if (!e.internal) { if (sender && !sender.isDestroyed && sender.tazele) { sender.tazele() } }
	}
	static async eIslemXMLOlustur(e) {
		const eYoneticiler = await this.getEYoneticiListe(e); delete e.eYoneticiler; const uuid2Result = {};
		for (const eYonetici of eYoneticiler) {
			await eYonetici.eIslemXMLOlustur(e);
			const _uuid2Result = e.uuid2Result; if (!$.isEmptyObject(_uuid2Result)) { $.extend(uuid2Result, _uuid2Result) }
		}
		e.uuid2Result = uuid2Result
	}
	async eIslemXMLOlustur(e) {
		const {sender, callback} = e, {eConf} = this, eIslAnaSinif = this.eIslSinif;
		$.extend(e, { ps2SayacListe: this.ps2SayacListe ?? this.class.getPS2SayacListe(e) });
		const stm = eIslAnaSinif.getUUIDStm(e); for (const key of ['psTip2SayacListe', 'whereDuzenleyici']) delete e[key]
		if (!stm) { throw { isError: true, rc: 'bosUUIDStm', errorText: 'Filtre hatalı' } }
		const efAyrimTipi2Arastirilacaklar = {}, olusacakPS2Sayaclar = {}; let recs = await app.sqlExecSelect(stm);
		if (window.progressManager) { window.progressManager.progressMax = (window.progressManager.progressMax || 0) + recs.length }
		for (const rec of recs) {
			const {pstip, fissayac, uuid} = rec;
			if (!uuid) { (olusacakPS2Sayaclar[pstip] = olusacakPS2Sayaclar[pstip] || []).push(fissayac); continue }
			const efAyrimTipi = rec.efayrimtipi = rec.efayrimtipi || 'A'; (efAyrimTipi2Arastirilacaklar[efAyrimTipi] = efAyrimTipi2Arastirilacaklar[efAyrimTipi] || []).push(rec)
		}
		if (!$.isEmptyObject(efAyrimTipi2Arastirilacaklar)) {
			for (const efAyrimTipi in efAyrimTipi2Arastirilacaklar) {
				const arastirilacaklar = efAyrimTipi2Arastirilacaklar[efAyrimTipi], eIslSinif = EIslemOrtak.getClass({ tip: efAyrimTipi }), anaBolum = eConf.getAnaBolumFor({ eIslSinif });
				if (!anaBolum) { throw { isError: true, rc: 'eIslAnaBolumBelirsiz', errorText: `e-İşlem için Ana Bölüm belirsizdir` } }
				const eksikUUID2Dosya = {}, dosyaAdiSet = {};
				for (const {uuid} of arastirilacaklar) {
					const dosyaAdi = `${uuid}.xml`, dosya = `${anaBolum}\\IMZALI\\${dosyaAdi}`;
					eksikUUID2Dosya[uuid] = dosya; dosyaAdiSet[dosyaAdi] = true
				}
				if (!$.isEmptyObject(dosyaAdiSet)) {
					// toplu uuid2Dosya xml dosya kontrol
					const fileNames = Object.keys(dosyaAdiSet);
					const result = await app.wsDosyaListe({ args: { dir: anaBolum, recursive: true, includeDirs: false, pattern: `${'?'.repeat(newGUID().length)}.xml`, fileNames } }) || {};
					const {recs} = result; for (const rec of recs) {
						const dosyaAdi = rec.name, uuid = dosyaAdi.split('.')[0].trim(); delete eksikUUID2Dosya[uuid]; delete dosyaAdiSet[dosyaAdi] }
				}
				for (const [efAyrimTipi, recs] of Object.entries(efAyrimTipi2Arastirilacaklar)) {
					for (const {uuid, pstip: psTip, fissayac: fisSayac} of recs) {
						if (eksikUUID2Dosya[uuid]) { (olusacakPS2Sayaclar[psTip] = olusacakPS2Sayaclar[psTip] || []).push(fisSayac) } }
				}
			}
		}
		let kalanSayi = recs.length; const eFisListe = [], uuid2Result = e.uuid2Result = e.uuid2Result || {};
		if (!$.isEmptyObject(olusacakPS2Sayaclar)) {
			for (const sayacListe of Object.values(olusacakPS2Sayaclar)) {
				const sayi = sayacListe.length; kalanSayi -= sayi;
				if (window.progressManager) { window.progressManager.progressStep(sayi) }
			}
		}
		if (!$.isEmptyObject(olusacakPS2Sayaclar)) {
			const _e = $.extend({}, e, this); $.extend(_e, { ps2SayacListe: olusacakPS2Sayaclar, temps: {} })
			const stm = eIslAnaSinif.getEFisBaslikVeDetayStm(_e); if (!stm) { return } recs = await app.sqlExecSelect(stm);
			const sevRecs = seviyelendirAttrGruplari({ source: recs, attrGruplari: [['pstip', 'fissayac']] }), ps2Sayac2EFis = _e.ps2Sayac2EFis = {};
			for (const sev of sevRecs) {
				const rec = sev.orjBilgi, psTip = rec.pstip, fisSayac = rec.fissayac, efAyrimTipi = rec.efayrimtipi = rec.efayrimtipi || 'A';
				$.extend(rec, { tarihStr: asReverseDateString(rec.tarih), sevkTarihStr: timeToString(rec.sevktarih || now()) });
				$.extend(sev, { orjBilgi: new EIslBaslik(sev.orjBilgi), detaylar: sev.detaylar.map(det => new EIslDetay(det)) });
				const eFis = EIslemOrtak.newFor({ tip: efAyrimTipi, eConf }); await eFis.baslikVeDetaylariYukle($.extend({}, _e, { baslik: sev.orjBilgi, detaylar: sev.detaylar }));
				const sayac2EFis = ps2Sayac2EFis[psTip] = ps2Sayac2EFis[psTip] || {}; sayac2EFis[fisSayac] = eFis
			}
			await eIslAnaSinif.tipIcinFislerEkDuzenlemeYap(_e); let temps = _e.temps = {};
			const BlockSize = 100; for (const psTip in ps2Sayac2EFis) {
				const sayac2EFis = ps2Sayac2EFis[psTip], fisSayacListe = Object.keys(sayac2EFis);
				while (fisSayacListe.length) {
					const subFisSayacListe = fisSayacListe.splice(0, BlockSize), uuid2SubResult = {};
					let toplu = new MQToplu(), updCallback = _e.updCallback = ({ query }) => { if (query) { toplu.add(query) } };
					let promises = [], uploadList = []; const commit = async () => {
						await Promise.all(promises); promises = [];
						if (uploadList.length) { await app.wsMultiUpload({ data }); uploadList = [] }
						if (toplu.liste.length) { await app.sqlExecNone(toplu); toplu.liste = [] }
					};
					for (const fisSayac of subFisSayacListe) {
						promises.push(new $.Deferred(async p => {
							const eFis = sayac2EFis[fisSayac], {baslik} = eFis, efAyrimTipi = baslik.efayrimtipi;
							const eIslSinif = EIslemOrtak.getClass({ tip: efAyrimTipi }), anaBolum = eConf.getAnaBolumFor({ eIslSinif });
							if (!anaBolum) { throw { isError: true, rc: 'eIslAnaBolumBelirsiz', errorText: 'e-İşlem için Ana Bölüm belirlenemedi' } }
							let uuid; try {
								const args = { ..._e }, xmlStr = await eFis.xmlOlustur(args); if (!xmlStr) { p.resolve() }
								uuid = baslik.uuid; e.uuid2Result = uuid2Result[uuid] = uuid2Result[uuid] ?? { islemZamani: now(), isError: false, eFis, rec: baslik, efAyrimTipi };
								/* const uuid2XML = e.uuid2XML = e.uuid2XML || {}; uuid2XML[uuid] = xmlStr; */
								const xmlDosya = `${anaBolum}\\IMZALI\\${uuid}.xml`; /*await app.wsUpload({ remoteFile: xmlDosya, args: xmlStr });*/
								uploadList.push({ name: xmlDosya, data: Base64.encode(xmlStr) });
								/*if (config.dev) { const url = URL.createObjectURL(new Blob([xmlStr], { type: 'application/xml' })); openNewWindow(url) }*/
							} catch (ex) { const rec = uuid2Result[uuid]; if (rec) { $.extend(rec, { isError: true, message: getErrorText(ex) }) } }
							p.resolve()
						}));
						if (promises.length == 1) { await commit() }
					}
					await commit(); try { if (window.progressManager) { window.progressManager.progressStep(subFisSayacListe.length) } } catch (ex) { }
					try { if (callback) { getFuncValue.call(this, callback, e) } } catch (ex) { }
				}
			}
			if (!e.internal) { if (sender && !sender.isDestroyed && sender.tazele) { sender.tazele() } }
		}
	}
	static async alimEIslemSil(e) {
		const eYoneticiler = await this.getEYoneticiListe(e); delete e.eYoneticiler;
		const promises = []; for (const eYonetici of eYoneticiler) { promises.push(eYonetici.alimEIslemSil(e)) } await Promise.all(promises)
	}
	async alimEIslemSil(e) {
		const {sender, callback, recs} = e, fisSayacListe = recs.map(rec=>rec.fissayac), uuid2Result = e.uuid2Result = e.uuid2Result || {};
		let del = new MQIliskiliDelete({
			from: 'efgecicialfatfis',
			where: { inDizi: fisSayacListe, saha: 'kaysayac ' }
		});
		const isError = !(await app.sqlExecNone(del));
		for (const rec of recs) {
			const efAyrimTipi = rec.efayrimtipi || 'A', {uuid} = rec;
			const result = { islemZamani: now(), isError, rec, efAyrimTipi };
			uuid2Result[uuid] = result; if (window.progressManager) { window.progressManager.progressStep() }
		}
		if (callback) { getFuncValue.call(this, callback, e) }
		if (!e.internal) { if (sender && !sender.isDestroyed && sender.tazele) { sender.tazele() } }
	}
	static async eIslemBekleyenleriGetir(e) {
		e = e || {}; const eConf = e.eConf ?? MQEConf.instance, eIslSiniflar = [EIslFatura, EIslIrsaliye];
		const eYoneticiler = e.eYoneticiler = eIslSiniflar.map(eIslSinif=>new EYonetici({ eConf, eIslSinif })), uuid2Result = {};
		for (const eYonetici of eYoneticiler) {
			await eYonetici.eIslemBekleyenleriGetir(e);
			const _uuid2Result = e.uuid2Result; if (!$.isEmptyObject(_uuid2Result)) { $.extend(uuid2Result, _uuid2Result) }
		}
		e.uuid2Result = uuid2Result
	}
	async eIslemBekleyenleriGetir(e) {
		e.eYonetici = this; const {eIslSinif} = this, {callback, secimler} = e, sender = e.sender ?? callback?.parentPart, efAyrimTipi = eIslSinif.tip, eConf = e.eConf ?? this.eConf, {eIslEkArgs} = eConf;
		const tarihBS = secimler?.tarih || {}, uuid2Result = e.uuid2Result = e.uuid2Result || {}; let savedToken = this.class.getTempToken(efAyrimTipi);
		let eIslemBlock = async e => {
			e = e || {};
			const _e = {
				eIslemci: efAyrimTipi, oe: eConf.getValue('ozelEntegrator')?.char || '', eIslemAPI: 'gelenBelgeleriGetir',
				eLogin: toJSONStr(eConf.eLogin), eToken: savedToken || '', ekArgs: toJSONStr(eIslEkArgs),
				args: { gelen: true, offset: 0, count: 5, tarihBS: { basi: dateToString(tarihBS.basi), sonu: dateToString(tarihBS.sonu) } }
			};
			const {argsDuzenleyici} = e; if (argsDuzenleyici) getFuncValue.call(this, argsDuzenleyici, $.extend({}, e, _e))
			let result = await app.wsEIslemYap(_e); if ($.isArray(result)) { result = result[0] } return result
		}
		let result = await eIslemBlock(); if (savedToken != null) { const {token} = result; if (token != null && savedToken != token /*&& asBoolQ(savedToken) == null*/) { savedToken = token; this.class.setTempToken(efAyrimTipi, token) } }
		const {parentDir} = result; let seq = 0, {count} = result, subResults = e.subResults = result?.results ?? result?.subResults;  if (!subResults?.length) { return }
		const uuids = e.uuids = subResults?.map(result => result.uuid );
		if (count == null) { count = e.count = subResults?.length }
		if (window.progressManager) progressManager.progressMax = (progressManager.progressMax || 0) + (count || 1)
		const eIslAltBolum = eConf.getAnaBolumFor({ efAyrimTipi }); if (!eIslAltBolum) { throw { isError: true, rc: 'eIslAnaBolumBelirsiz', errorText: 'e-İşlem için Ana Bölüm belirlenemedi' } }
		const BlockSize = 10; let blockSubResults = [];
		const kismiVeriIsleVeBosalt = async _e => {
			try { e.subResults = blockSubResults; await this.bekleyenleriGetir_veriIsle(e) } catch (ex) { console.error('Alım e-İşlem Veri İşle', { BlockSize, blockSubResults, subResults }) }
			if (window.progressManager) { window.progressManager.progressStep(blockSubResults.length) } if (callback) { getFuncValue.call(this, callback, e) } 
			blockSubResults = [];
		};
		for (const subResult of subResults) {
			let isError = false, errorText; const {uuid} = subResult, xmlDosyaAdi = subResult.xmlDosyaAdi || subResult.xmlFileName || `${uuid}.xml`; let xmlData = subResult.xmlData ?? subResult.xmlContent;
			let xml, eFis;
			try {
				if (!xmlData) { const xmlDosya = `${parentDir || `${eIslAltBolum}\\ALINAN`}\\${xmlDosyaAdi}`; xmlData = await app.wsDownloadAsStream({ remoteFile: xmlDosya, localFile: xmlDosyaAdi }) }
				xml = result.xml = $.parseXML(xmlData)?.documentElement; eFis = new EFis({ xml });
			}
			catch (ex) { isError = true; errorText = getErrorText(ex); console.error(ex) }
			$.extend(subResult, { islemZamani: now(), isError, errorText, uuid, eFis });
			if (eFis) { const efAyrimTipi = eFis.eIslTip, {tarih, fisNox} = eFis; $.extend(subResult, { efAyrimTipi, tarih, fisNox }) }
			blockSubResults.push(subResult); uuid2Result[uuid] = subResult; seq++;
			if (blockSubResults.length >= BlockSize) { await kismiVeriIsleVeBosalt(e) }
		}
		await kismiVeriIsleVeBosalt(e)
	}
	static async eIslemAlimXMLYukle(e) {
		e = e || {}; let {xmlListe} = e;
		if (!xmlListe) {
			const fhList = await showOpenFilePicker({
				multiple: true, excludeAcceptAllOption: true,
				types: [{ accept: { 'application/xml': ['.xml'] }, description: 'XML Dosyaları' }]
			});
			if (fhList) {
				xmlListe = e.xmlListe = [];
				for (const fh of fhList) {
					const file = await fh.getFile(), sr = file.stream().getReader(); let data = '';
					while (true) { const enm = await sr.read(); data += new TextDecoder().decode(enm.value); if (enm.done) { break } }
					if (!data) { continue }
					let xml = $.parseXML(data); if (xml) { xml = xml.documentElement || xml }
					xmlListe.push(xml)
				}
			}
		}
		const {eConf} = e, eIslSiniflar = [], eYoneticiler = e.eYoneticiler = [ new EYonetici({ eConf }) ], uuid2Result = {};
		for (const eYonetici of eYoneticiler) {
			await eYonetici.eIslemAlimXMLYukle(e);
			const _uuid2Result = e.uuid2Result; if (!$.isEmptyObject(_uuid2Result)) { $.extend(uuid2Result, _uuid2Result) }
		}
		e.uuid2Result = uuid2Result
	}
	async eIslemAlimXMLYukle(e) {
		const BlockSize = 10; e.eYonetici = this; const {eConf} = this, {eIslEkArgs} = eConf, {callback} = e;
		const xmlListe = e.xmlListe || [], count = e.count = xmlListe.length;
		if (window.progressManager) { progressManager.progressMax = (progressManager.progressMax || 0) + (count || 1) }
		const uuid2Result = e.uuid2Result = e.uuid2Result || {}; e.subResults = [];
		const kismiVeriIsleVeBosalt = async e => {
			const {subResults} = e; if (!subResults.length) { return }
			try { await this.bekleyenleriGetir_veriIsle(e) } catch (ex) { console.error('Alım e-İşlem Veri İşle', { blockSize: BlockSize, subResults: $.extend({}, subResults) }) }
			if (window.progressManager) { window.progressManager.progressStep(subResults.length) } if (callback) { getFuncValue.call(this, callback, e) }
			e.subResults = []
		};
		for (const _xml of xmlListe) {
			let xml = _xml; if (xml) { xml = xml.documentElement || xml } if (!xml) { continue }
			const eFis = new EFis({ xml }), efAyrimTipi = eFis.eIslTip, {uuid} = eFis, xmlDosyaAdi = `${uuid}.xml`;
			const eIslAltBolum = eConf.getAnaBolumFor({ efAyrimTipi }); if (!eIslAltBolum) { throw { isError: true, rc: 'eIslAnaBolumBelirsiz', errorText: 'e-İşlem için Ana Bölüm belirlenemedi' } }
			const xmlDosya = `${eIslAltBolum}\\ALINAN\\${xmlDosyaAdi}`; app.wsUpload({ remoteFile: xmlDosya, args: _xml?.outerHTML ?? _xml });
			const result = { islemZamani: now(), isError: false, efAyrimTipi, uuid: uuid, tarih: eFis.tarih, fisNox: eFis.fisNox, eFis };
			const {subResults} = e; subResults.push(result); uuid2Result[uuid] = result;
			if (subResults.length >= BlockSize) { await kismiVeriIsleVeBosalt(e) }
		}
		await kismiVeriIsleVeBosalt(e)
	}
	static async eIslemAlimTicariFiseDonustur(e) {
		e = e || {}; const {eConf} = e, eYoneticiler = e.eYoneticiler = [new EYonetici({ eConf })];
		for (const eYonetici of eYoneticiler) { await eYonetici.eIslemAlimTicariFiseDonustur(e) }
	}
	async eIslemAlimTicariFiseDonustur(e) {
		e.eYonetici = this; const {eConf} = this, {eIslEkArgs} = eConf;
		const {recs, callback} = e, count = e.count = recs.length; if (window.progressManager) { progressManager.progressMax = (progressManager.progressMax || 0) + (count || 1) }
		const uuid2Result = e.uuid2Result = e.uuid2Result || {}, uuid2Rec = e.uuid2Rec = {}; for (const rec of recs) { const {uuid} = rec; uuid2Rec[rec.uuid] = rec }
		for (const rec of recs) {
			$.extend(e, { rec }); uuid2Result[rec.uuid] = await this.eIslemAlimTicariFiseDonustur_tekil(e);
			if (window.progressManager) { window.progressManager.progressStep() }
			if (callback) { getFuncValue.call(this, callback, e) }
		}
		if (!e.internal) { const {sender} = e; if (sender && !sender.isDestroyed && sender.tazele); sender.tazele() }
	}
	async eIslemAlimTicariFiseDonustur_tekil(e) {
		e = e || {}; const wndProgress = progressManager?.wnd; if (wndProgress?.length) wndProgress.hide()
		try {
			const {rec} = e, {uuid} = rec, fisNox = rec.fisnox; let result = e.result = { islemZamani: now(), isError: false, uuid, fisNox, rec };
			const islemci = new EAlimTicariyeDonusturucu(e); $.extend(result, await islemci.ekranOlustur_onBilgi(e) || {});
			if (result?.reason == 'close') return result
			const {varmi, ayrimTipi} = await islemci.belgeKontrol(e);
			if (varmi) { $.extend(result, { isError: true, message: 'Bu fiş zaten var', detail: ayrimTipi }); return result }
			$.extend(result, await islemci.fisGirisiYap(e) || {});
			if (result && !result.isError) {
				const upd = new MQIliskiliUpdate({ from: 'efgecicialfatfis', where: { degerAta: uuid, saha: 'efuuid' }, set: `tamamlandi = '*'` });
				await app.sqlExecNone(upd)
			}
			return result
		}
		finally { if (wndProgress?.length) wndProgress.show() }
	}
	async bekleyenleriGetir_veriIsle(e) {
		const {eConf} = this; console.debug('bekleyenleriGetir_veriIsle', e)
		let results = e.subResults || e.results; if (!results) { const {subUUID2Results} = e; result = Object.values(subUUID2Results) }
		for (const result of results) {
			let {eFis} = result;
			if (!eFis) {
				let {xml} = result; if (!xml) { const {xmlContent} = result; if (xmlContent) { xml = result.xml = $.parseXML(xmlContent)?.documentElement } }
				let {eIslSinif} = result; if (!eIslSinif) { const efAyrimTipi = result.efAyrimTipi || 'A'; eIslSinif = result.eIslSinif = EIslemOrtak.getClass(efAyrimTipi) }
				eFis = result.eFis = new EFis({ eConf, eIslSinif, xml });
			}
			e.result = result; const _result = await this.bekleyenleriGetir_veriIsle_onKontrol(e);
			delete e.result; if (!_result) { continue }
			$.extend(result, eFis); console.debug('..', eFis)
		}
		await EFis.topluEkBilgileriBelirle({ eYonetici: this, liste: results.map(result=>result.eFis) });
		let _e = $.extend({}, e, { results }); await this.bekleyenleriGetir_veriIsle_sonrasi(_e)
	}
	async bekleyenleriGetir_veriIsle_onKontrol(e) {
		const {result} = e, {eFis} = result;
		// Alıcı VKN Kontrol
		const isyeri_vknTckn = e._isyeri_vknTckn = coalesce(e._isyeri_vknTckn, ()=> app.params.isyeri.vergi.vknTckn);
		const {aliciVKN} = eFis; let devamFlag = true;
		if (isyeri_vknTckn && aliciVKN != isyeri_vknTckn) {
			devamFlag = e.rdlg_vkn;
			if (devamFlag === undefined) {
				let rdlg, mesaj = (`<div>Alınan e-İşlem Belgesindeki <ul>` + `<li><u>Alıcı VKN bilgisi</u>: <b>${aliciVKN}</b></li>` + `<li><u>Bu İşyerine ait VKN</u>: <b>${isyeri_vknTckn}</b></li>` + `</ul> farklıdır.</div>` + `<div style="font-weight: bold; color: firebrick; margin-top: 5px; padding-left: 30px;">Yine de devam edilsin mi?</div>`);
				try { rdlg = await ehConfirm(mesaj, e.islemAdi || `Gelen e-İşlem Belgesi`) } catch (ex) { console.error(ex) }
				e.rdlg_vkn = devamFlag = rdlg
			}
		}
		if (!devamFlag) {
			$.extend(result, { isError: true, message: 'Farklı VKN nedeniyle işlem iptal edildi' });
			console.warn('X.', eFis); return false
		}
		// ...
		const {gondericiVKN, fisNox, eIslSinif} = eFis, {eIrsaliyemi} = eIslSinif, fisNo_tsn = TicariSeriliNo.fromText(fisNox);
		let uni = new MQUnionAll([new MQSent({
			from: 'efgecicialfatfis', sahalar: [`'*' gecicimi`, 'effatnox fisnox'],
			where: [{ degerAta: gondericiVKN, saha: 'vkno' }, { degerAta: fisNox, saha: 'effatnox' }, { degerAta: eIrsaliyemi ? 'IR' : '', saha: 'efbelge' }]
		}), new MQSent({
			from: 'piffis fis', sahalar: [`'' gecicimi`, 'fis.fisnox'],
			fromIliskiler: [{ from: 'carmst car', iliski: 'fis.must = car.must' }],
			where: [
				new MQOrClause([ { degerAta: gondericiVKN, saha: 'car.vnumara' }, { degerAta: gondericiVKN, saha: 'car.tckimlikno' } ]),
				{ ticariTSN: fisNo_tsn }, { degerAta: eIrsaliyemi ? 'I' : 'F', saha: 'fis.piftipi' }, { ticariGC: true }
			]
		})]);
		let stm = new MQStm({ sent: uni }), recs = await app.sqlExecSelect({ query: stm });
		if (!$.isEmptyObject(recs)) {
			const rec = recs[0], gecicimi = asBool(rec.gecicimi);
			$.extend(result, { isError: true, message: `${rec.fisnox} numaralı belge ${gecicimi ? 'Geçici Listede ' : ''}tekrarlanıyor` });;
			console.debug('X.', eFis); return false
		}
		return true
	}
	async bekleyenleriGetir_veriIsle_sonrasi(e) {
		const {results, sender} = e;
		for (const result of results) {
			if (result.isError) { continue }
			const {eFis} = result, paramName_fisSayac = '@fisSayac', const_fisSayac = new MQSQLConst(paramName_fisSayac), fisTable = 'efgecicialfatfis', harTable = 'efgecicialfatdetay';
			const basHV = eFis.alimGeciciBaslikHostVars(result), sipHVListe = [], irsHVListe = [];
			const detHVListe = eFis.detaylar.map(det => $.extend({ fissayac: const_fisSayac }, det.alimGeciciDetayHostVars(result)));
			for (const rec of eFis.siparisler || []) {
				const {tsn, tarih} = rec;
				sipHVListe.push({ fissayac: const_fisSayac, efsipnobilgi: tsn.asText, efsiptarih: tarih, sipseri: tsn.seri, sipnoyil: tsn.noyil, sipno: tsn.no })
			}
			for (const rec of eFis.irsaliyeler || []) {
				const {tsn, tarih} = rec;
				irsHVListe.push({ fissayac: const_fisSayac, efirsnobilgi: tsn.asText, efirstarih: tarih, irsseri: tsn.seri, irsnoyil: tsn.noyil, irsno: tsn.no })
			}
			const toplu = new MQToplu({
				liste: [
					new MQInsert({ table: fisTable, hv: basHV }),
					new MQSent({ from: fisTable, sahalar: `${paramName_fisSayac} = MAX(kaysayac)` }),
					new MQInsert({ table: harTable, hvListe: detHVListe }),
					new MQInsert({ table: 'efgecicialfatsip', hvListe: sipHVListe }),
					new MQInsert({ table: 'efgecicialfatirs', hvListe: irsHVListe })
				], params: [{ name: paramName_fisSayac, type: 'int', direction: 'inputOutput', value: 0 }]
			}).withDefTrn();
			let _result; try { _result = ((await app.sqlExecNoneWithResult({ query: toplu })) || {})[0] }
			catch (ex) { $.extend(result, { isError: true, rc: 'sqlError', errorText: getErrorText(ex), error: ex }); console.error(ex) }
			if (_result) { _result = (_result?.params || {})[paramName_fisSayac]; result.fisSayac = asInteger(_result?.value) || null }
		}
		/* debugger */
		if (!e.internal) { if (sender && !sender.isDestroyed && sender.tazele) { sender.tazele() } }
	}
	static getPS2Table(e) { e = e || {}; const psTip = typeof e == 'object' ? (e.psTip || e.tip || e.ps) : e; return (psTip == 'S' ? 'sipfis' : 'piffis') }
	static getEYoneticiListe(e) {
		const {eYoneticiler, recs} = e; if (eYoneticiler) { return eYoneticiler } if (!recs) { return null } if ($.isEmptyObject(recs)) { return [] }
		const eIslAnaTip2PS2SayacListe = {};
		for (const rec of recs) {
			if (!rec) { continue }
			const psTip = rec.pstip ?? 'P', efAyrimTipi = rec.efayrimtipi ?? rec.efbelge, {anaTip} = EIslemOrtak.getClass({ tip: efAyrimTipi }) || {}; if (!anaTip) { continue }
			const ps2SayacListe = eIslAnaTip2PS2SayacListe[anaTip] = eIslAnaTip2PS2SayacListe[anaTip] || {};
			(ps2SayacListe[psTip] = ps2SayacListe[psTip] || []).push(rec.kaysayac ?? rec.fissayac)
		}
		const {eConf} = e, result = [];
		for (const anaTip in eIslAnaTip2PS2SayacListe) {
			const eIslSinif = EIslemOrtak.getAnaClass({ anaTip }), ps2SayacListe = eIslAnaTip2PS2SayacListe[anaTip];
			result.push(new EYonetici({ eConf, eIslSinif, ps2SayacListe }))
		}
		return result
	}
	static getPS2Recs(e) {
		e = e || {}; const recs = e.recs || e; if (!recs) { return null }
		const result = {}; for (const rec of recs) { const psTip = rec.pstip ?? rec.psTip; (result[psTip] = result[psTip] || []).push(rec) } return result
	}
	static getPS2SayacListe(e) {
		e = e || {}; const recs = e.recs || e; if (!recs) { return null } const result = {};
		for (const rec of recs) {
			const psTip = rec.pstip ?? rec.psTip, sayac = rec.sayac || rec.fissayac || rec.fisSayac || rec.kaysayac || rec.kaySayac;
			(result[psTip] = result[psTip] || []).push(sayac)
		}
		return result
	}
	static getTempToken(e) { e = e || {}; const eIslTip = typeof e == 'object' ? (e.eIslTip || e.tip || e.efAyrimTipi || e.efayrimtipi) : e; return this.eIslTip2Token[eIslTip] }
	static setTempToken(e, _value) {
		e = e || {}; const eIslTip = typeof e == 'object' ? (e.eIslTip || e.tip || e.efAyrimTipi || e.efayrimtipi) : e;
		const value = typeof e == 'object' ? e.value ?? e.token : _value, {eIslTip2Token} = this; eIslTip2Token[eIslTip] = value;
		const eIslTip2TokenResetTimer = this._eIslTip2TokenResetTimer = this._eIslTip2TokenResetTimer || {}; clearTimeout(eIslTip2TokenResetTimer[eIslTip]);
		eIslTip2TokenResetTimer[eIslTip] = setTimeout(() => { try { delete eIslTip2Token[eIslTip] } finally { delete eIslTip2TokenResetTimer[eIslTip] } } , 10 * 60 * 1000); return this
	}
}


/*
	[ efat akıbet toplu update ]
try {
    const uuidList = app.activeWndPart.recs.map(rec => rec.efatuuid ?? rec.uuid);
    if (uuidList?.length) {
        const upd = new MQIliskiliUpdate({ from: 'piffis', where: [`efgonderimts IS NOT NULL`, `efatuuid <> ''`, { inDizi: uuidList, saha: 'efatuuid' }], set: { degerAta: '', saha: 'efatonaydurumu' } });
        console.info({ upd, result: await app.sqlExecNone(upd) })
    }
}
catch (ex) { console.error(ex) }
*/
