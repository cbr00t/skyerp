class EYonetici extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get eIslTip2Token() {
		let {_eIslTip2Token: result} = this
		if (result === undefined)
			result = this._eIslTip2Token = {}
		return result
	}
	static set eIslTip2Token(value) { this._eIslTip2Token = value }
	constructor({ eConf = MQEConf.instance, eIslSinif, ps2SayacListe, whereDuzenleyici } = {}) {
		super(e)
		extend(this, { eConf, eIslSinif, ps2SayacListe, whereDuzenleyici })
	}
	/* api: mukellefDurumu */
	static async mukellefSorgula(e = {}) {
		let eYoneticiler = await this.getEYoneticiListe(e); delete e.eYoneticiler
		let uuid2Result = {}
		for (let eYonetici of eYoneticiler ?? []) {
			await eYonetici.mukellefSorgula(e)
			let {uuid2Result: _uuid2Result} = e
			if (!empty(_uuid2Result))
				extend(uuid2Result, _uuid2Result)
		}
		e.uuid2Result = uuid2Result
	}
	async mukellefSorgula(e) {
		let vknListe = $.makeArray(e.vknListe ?? e.vkn)
		for (let key of ['psTip2SayacListe', 'whereDuzenleyici'])
			delete e[key]
		if (!vknListe?.length)
			throw { isError: true, rc: 'emptyArgument', errorText: 'VKN Liste(vknListe) belirtilmelidir' }
		let {sender, callback, internal, eConf = this.eConf} = e, {eIslEkArgs} = eConf
		let {eIslSinif} = this, {sinifAdi: eIslAdi, tip: efAyrimTipi} = eIslSinif
		let oe = eConf.getValue('ozelEntegrator')
		if (isObject(oe))
			oe = oe.char
		let eIslemci = efAyrimTipi, eLogin = toJSONStr(eConf.eLogin), ekArgs = toJSONStr(eIslEkArgs), eIslemAPI = 'mukellefDurumu'
		let BlockSize = 8, vkn2Result = {}, promises = [], error, savedToken = this.class.getTempToken(efAyrimTipi);
		try {
			vkn2Result = (await app.wsEIslemYap({ eIslemci, oe, eIslemAPI, eLogin, eToken: savedToken || '', ekArgs, args: { vknTckn: vknListe } }))?.[0];
			let {token} = vkn2Result ?? {}; delete vkn2Result.token;
			if (token && !(savedToken && savedToken == token)) { savedToken = token; this.class.setTempToken(efAyrimTipi, token) }
		}
		catch (ex) { console.error(ex); error = ex }
		for (let vkn of vknListe) {
			let result = vkn2Result[vkn]; if (empty(result)) { result = null }
			if (!(error || result)) { result = { isError: true, rc: 'mukellefYok', errorText: `${eIslAdi} mükellefi değil` } }
			let subResult = vkn2Result[vkn] = {
				islemZamani: now(), isError: error || (result?.isError ?? false), vkn,
				rec: error || result?.isError ? undefined : result, efAyrimTipi, message: error ? getErrorText(error) : result.errorText ?? `${eIslAdi} MÜKELLEFİ`
			}
			extend(subResult, { islemZamaniText: dateTimeToString(subResult.islemZamani), eIslTipText: eIslAdi, efUUIDText: vkn })
		}
		if (promises?.length) { await Promise.all(promises); promises = [] }
		if (window.progressManager) { window.progressManager.progressStep(results.length) } if (callback) { getFuncValue.call(this, callback, e) }
		if (!internal && sender && !sender.isDestroyed) { sender.tazele?.() }
		return { eYonetici: this, vkn2Result }
	}
	static async eIslemGonder(e) {
		let eYoneticiler = await this.getEYoneticiListe(e); delete e.eYoneticiler; let uuid2Result = {};
		for (let eYonetici of eYoneticiler ?? []) {
			await eYonetici.eIslemGonder(e);
			let _uuid2Result = e.uuid2Result; if (!empty(_uuid2Result)) { extend(uuid2Result, _uuid2Result) }
		}
		e.uuid2Result = uuid2Result
	}
	async eIslemGonder(e) {
			/* nesV4 test = 068E86F50AFBEFEB3795FD9BDC17EDE0D65D62A4EA2911F80F5C59854C518420 */
		e.internal = true
		await this.eIslemXMLOlustur(e)
		delete e.internal
		let { eIslSinif: eIslAnaSinif } = this
		let { gelenmi } = eIslAnaSinif
		extend(e, {
			ps2SayacListe: this.ps2SayacListe || (() => this.class.getPS2SayacListe(e)),
			whereDuzenleyici: (
				gelenmi
					? null
					: ({ where: wh }) => wh.add(`fis.efatuuid <> ''`)
			),
			sentDuzenleyici: (
				gelenmi
					? null
					: ({ sent, sent: { sahalar } }) => {
						sent.fis2CariBagla()
						sahalar.add(
							'fis.seri', 'car.vkno', 'car.efatgibalias', 'car.eirsgibalias',
							'car.efatsenaryotipi', 'car.email', 'car.earsivbelgetipi', 'car.revizeeislemmail'
						)
				}
			)
		})
		let stm = eIslAnaSinif.getUUIDStm(e)
		deleteKeys(e, 'psTip2SayacListe', 'sentDuzenleyici', 'whereDuzenleyici')
		if (!stm)
			throw { isError: true, rc: 'bosUUIDStm', errorText: 'Filtre hatalı' }
		
		let param_eIslem = app.params.eIslem
		let { sender, callback } = e
		let { eConf } = this, { eIslEkArgs } = eConf
		let oe = eConf.getValue('ozelEntegrator')
		if (isObject(oe))
			oe = oe.char
		
		const BlockSize = 20
		// let senderGIBAlias = eConf.getValue('gibAlias') ?? ''
		// let senderEIrsGIBAlias = eConf.getValue('eIrsGIBAlias') ?? ''
		let recs = await app.sqlExecSelect(stm)
		let ps2Recs = this.class.getPS2Recs({ recs })
		let uuid2Result = e.uuid2Result = e.uuid2Result || {}
		if (!empty(ps2Recs)) {
			let eConf = e.eConf ?? this.eConf
			for (let psTip in ps2Recs) {
				let _recs = ps2Recs[psTip]
				let eIslTip2Recs = {}
				for (let rec of _recs) {
					let efAyrimTipi = rec.efayrimtipi || 'A'
					;(eIslTip2Recs[efAyrimTipi] ??= [])
						.push(rec)
				}

				let duzgunUUIDListe = []
				for (let efAyrimTipi in eIslTip2Recs) {
					let _recs = eIslTip2Recs[efAyrimTipi]
					if (empty(_recs))
						continue
					
					let eIslSinif = EIslemOrtak.getClass({ tip: efAyrimTipi })
					let eIslAltBolum = eConf.getAnaBolumFor({ eIslSinif })
					if (!eIslAltBolum)
						throw { isError: true, rc: 'eIslAnaBolumBelirsiz', errorText: 'e-İşlem için Ana Bölüm belirlenemedi' };
					
					let startIndex = 0
					while (true) {
						let subRecs = _recs.slice(startIndex, startIndex + BlockSize)
						startIndex += BlockSize
						if (!subRecs.length)
							break
						
						let savedToken = this.class.getTempToken(efAyrimTipi)
						let subDuzgunUUIDListe = []
						let results = await app.wsEIslemYap({
							eIslemci: efAyrimTipi, oe,
							eIslemAPI: 'belgeGonder',
							eLogin: toJSONStr(eConf.eLogin),
							eToken: savedToken || '',
							ekArgs: toJSONStr(eIslEkArgs),
							args: subRecs.map(rec => {
								let { uuid, seri } = rec
								let { efatsenaryotipi: senaryoTipi, fisnox: belgeNox, gibalias: receiverGIBAlias } = rec
								let { vkno: receiverVKN } = rec
								let { revizeeislemmail: eMailStr } = rec
								let eMails = eMailStr
									? eMailStr
										.split(';')
										.map(v => v?.trim())
										.filter(v =>
											v && v.length > 4 && v.includes('@') & v.includes('.'))
									: null
								
								// let { earsivbelgetipi: eArsivGonderimTipi } = rec
								//eArsivGonderimTipi ??= ''
								
								return {
									uuid, seri, senaryoTipi,
									receiverVKN, receiverGIBAlias,
									belgeNox, eMails
								}
							})
						});
						if (results) {
							for (let i = 0; i < subRecs.length; i++) {
								let result = results[i]
								if (!result)
									continue
								
								let _rec = subRecs[i], { uuid } = _rec
								let isError = result.isError ?? !result.code
								let message = result.message ?? result.errorText
								extend(result, {
									islemZamani: now(), isError, message,
									rec: _rec, efAyrimTipi,
									xmlDosya: `${eIslAltBolum}\\${uuid}.xml`
								})
								uuid2Result[uuid] = result
								if (!isError) {
									duzgunUUIDListe.push(uuid)
									subDuzgunUUIDListe.push(uuid)
								}
								if (!savedToken) {
									let { token } = result
									if (token != null && savedToken != token) {
										savedToken = token
										this.class.setTempToken(efAyrimTipi, token) }
								}
								window.progressManager?.progressStep?.()
								if (callback)
									getFuncValue.call(this, callback, e)
							}
						}
						if (subDuzgunUUIDListe.length) {
							let upd = new MQIliskiliUpdate({
								from: this.class.getPS2Table(psTip),
								set: [`efgonderimts = getdate()`],
								where: { inDizi: subDuzgunUUIDListe, saha: 'efatuuid' }
							})
							await upd.execute()
						}
					}
				}
			}
		}
		if (!e.internal) {
			if (sender && !sender.isDestroyed)
				sender?.tazele?.()
		}
	}
	static async eIslemIzle(e) {
		let eYoneticiler = await this.getEYoneticiListe(e)
		delete e.eYoneticiler
		let uuid2Result = {}
		for (let eYonetici of eYoneticiler ?? []) {
			await eYonetici.eIslemIzle(e)
			let { uuid2Result: _uuid2Result } = e
			if (!empty(_uuid2Result))
				extend(uuid2Result, _uuid2Result)
		}
		e.uuid2Result = uuid2Result
	}
	async eIslemIzle(e) {
		let gelenmi = asBool(e.gelen ?? e.gelenmi)
		if (!gelenmi) {
			e.internal = true
			await this.eIslemXMLOlustur(e)
			delete e.internal
		}
		let { eConf, eIslSinif: eIslAnaSinif } = this
		if (!gelenmi) {
			extend(e, {
				ps2SayacListe: this.ps2SayacListe ?? (() => this.class.getPS2SayacListe(e))
			})
		}
		let { recs } = e
		if (!recs) {
			let stm = eIslAnaSinif.getUUIDStm(e)
			deleteKeys(e, 'psTip2SayacListe', 'whereDuzenleyici')
			if (!stm)
				throw { isError: true, rc: 'bosUUIDStm', errorText: 'Filtre hatalı' }
			recs = await stm.execSelect()
		}
		
		let { sender, callback } = e
		let ps2Recs = {}
		for (let rec of recs) {
			let { pstip = 'P', uuid = rec.efatuuid ?? rec.efuuid } = rec
			if (!uuid)
				continue

			rec.uuid ??= uuid
			;(ps2Recs[pstip] ??= []).push(rec)
		}
		
		let uuid2Result = e.uuid2Result ??= {}
		if (!empty(ps2Recs)) {
			if (!window.XSLTProcessor) {
				showProgress('XSLT İşleyicisi modülü yükleniyor...')
				try { await loadLib_xslt() }
				catch (ex) { cerr(ex) }
				finally { hideProgress() }
			}
			let divContainer = $(`<div/>`)[0]
			let eDocCount = 0
			for (let psTip in ps2Recs) {
				let _recs = ps2Recs[psTip];
				for (let rec of _recs) {
					let {uuid} = rec, efAyrimTipi = rec.efayrimtipi || (gelenmi ? 'E' : 'A')
					let eIslSinif = EIslemOrtak.getClass({ tip: efAyrimTipi, gelenmi })
					let eIslAltBolum = eConf.getAnaBolumFor({ eIslSinif })
					if (!eIslAltBolum)
						throw { isError: true, rc: 'eIslAnaBolumBelirsiz', errorText: 'e-İşlem için Ana Bölüm belirlenemedi' }
					let xmlDosyaAdi = `${uuid}.xml`, xmlDosya = `${eIslAltBolum}\\${gelenmi ? 'ALINAN' : 'IMZALI'}\\${xmlDosyaAdi}`
					let result = uuid2Result[uuid] = uuid2Result[uuid] || {}
					extend(result, { islemZamani: now(), isError: false, eIslSinif, efAyrimTipi, rec, anaBolum: eIslAltBolum, xmlDosya })
					try {
						let xmlData = uuid2Result[uuid]?.xmlData
						if (!xmlData)
							xmlData = await app.wsDownloadAsStream({ remoteFile: xmlDosya, localFile: xmlDosyaAdi })
						if (!xmlData)
							throw { isError: true, rc: 'noXML', errorText: 'XML (e-İşlem Belge İçeriği) bilgisi belirlenemedi' }
						let xml = $.parseXML(xmlData)
						let docRefs = Array.from(xml.documentElement.querySelectorAll(`AdditionalDocumentReference`))
						let xsltData
						{
							let xbinDoc, subName = 'EmbeddedDocumentBinaryObject'
							xbinDoc = docRefs.find(elm => elm.querySelector('DocumentType')?.innerHTML?.toUpperCase() == 'XSLT' && elm.querySelector(subName))
							if (!xbinDoc)
								xbinDoc = docRefs.find(elm => elm.querySelector(subName))
							if (xbinDoc)
								xsltData = xbinDoc.querySelector(subName)?.textContent
						}
						if (!xsltData)
							throw { isError: true, rc: 'noXSLT', errorText: 'XSLT (e-İşlem Görüntü) bilgisi belirlenemedi' }
						if (Base64.isValid(xsltData))
							xsltData = Base64.decode(xsltData)
						let xslt = $.parseXML(xsltData)
						let xsltProcessor, eDoc
						try {
							(xsltProcessor = new XSLTProcessor()).importStylesheet(xslt)
							eDoc = xsltProcessor.transformToFragment(xml, document)
						}
						catch (ex) {
							xsltProcessor = 'api'
							let xmlURL = remoteFile
							let html = await app.wsXSLTTransformAsStream({ data: { xmlData, xsltData } })
							if (html)
								eDoc = $(html)
						}
						if (!eDoc) {
							console.error({ isError: true, rc: 'xsltTransform', errorText: 'XSLT Görüntüsü oluşturulamadı', source: xsltProcessor })
							continue
						}
						if (eDocCount) {
							let elmPageBreak = $(`<div style="float: none;"><div style="page-break-after: always;"></div></div>`)[0];
							divContainer.lastElementChild.after(elmPageBreak); divContainer.lastElementChild.after(eDoc.querySelector('div'))
						}
						else
							divContainer.append(eDoc)
						eDocCount++
						extend(result, { xmlData, xml, xsltData, xslt, xsltProcessor, eDoc, divContainer })
						window.progressManager?.progressStep()
						if (callback && keys(uuid2Result).length % 201 == 200)
							getFuncValue.call(this, callback, e)
					}
					catch (ex) {
						if (!ex.responseJSON && ex.responseText) {
							try { ex = JSON.parse(ex.responseText) }
							catch (_ex) { }
						}
						extend(result, { isError: true, rc: ex?.rc ?? ex.code ?? '??', errorText: getErrorText(ex), error: ex })
						console.error(ex)
					}
				}
			}
			if (callback)
				getFuncValue.call(this, callback, e)
			if (!e.internal) {
				if (eDocCount) {
					let newDocHTML = `<html><body>${divContainer.innerHTML}</body></html>`
					let url = URL.createObjectURL(new Blob([newDocHTML], { type: 'text/html' }))
					openNewWindow(url)
				}
				if (sender && !sender.isDestroyed)
					sender?.tazele()
			}
		}
	}
	static async eIslemSorgula(e) {
		let eYoneticiler = await this.getEYoneticiListe(e); delete e.eYoneticiler;
		let promises = []; for (let eYonetici of eYoneticiler ?? []) { promises.push(eYonetici.eIslemSorgula(e)) } await Promise.all(promises)
	}
	async eIslemSorgula(e) {
		let { eIslSinif: eIslAnaSinif } = this
		extend(e, {
			ps2SayacListe: this.ps2SayacListe || (() => this.class.getPS2SayacListe(e)),
			whereDuzenleyici: (
				eIslAnaSinif.gelenmi
					? null
					: ({ where: wh }) => wh.add(`fis.efatuuid <> ''`)
			)
		})
		let stm = eIslAnaSinif.getUUIDStm(e); for (let key of ['psTip2SayacListe', 'whereDuzenleyici']) { delete e[key] }
		if (!stm) { throw { isError: true, rc: 'bosUUIDStm', errorText: 'Filtre hatalı' } }
		let {sender, callback} = e, {eConf} = this, {eIslEkArgs} = eConf, recs = await app.sqlExecSelect(stm);
		let BlockSize = 50, ps2Recs = this.class.getPS2Recs({ recs }), uuid2Result = e.uuid2Result = e.uuid2Result || {}; let subUUID2Result = e.subUUID2Result = [], seq = 0;
		if (!empty(ps2Recs)) {
			let eConf = e.eConf ?? this.eConf
			let oe = eConf.getValue('ozelEntegrator')
			if (isObject(oe))
				oe = oe.char
			
			for (let psTip in ps2Recs) {
				let _recs = ps2Recs[psTip], eIslTip2Recs = {};
				for (let rec of _recs) { let efAyrimTipi = rec.efayrimtipi || 'A'; (eIslTip2Recs[efAyrimTipi] = eIslTip2Recs[efAyrimTipi] || []).push(rec) }
				for (let efAyrimTipi in eIslTip2Recs) {
					let savedToken = this.class.getTempToken(efAyrimTipi); let _recs = eIslTip2Recs[efAyrimTipi] || []; if (!_recs.length) { continue }
					for (let i = 0; i < _recs.length; i += BlockSize) {
						seq++; let subRecs = _recs.slice(i, i + BlockSize);
						let results = await app.wsEIslemYap({
							eIslemci: efAyrimTipi, oe,
							eIslemAPI: 'akibetSorgula', eLogin: toJSONStr(eConf.eLogin), eToken: savedToken || '',
							ekArgs: toJSONStr(eIslEkArgs), args: subRecs.map(rec => ({ gelenmi: false, uuid: rec.uuid }))
						});
						if (!savedToken && results?.length) { let {token} = results[0]; if (token != null && savedToken != token) { savedToken = token; this.class.setTempToken(efAyrimTipi, token) } }
						if (results) {
							for (let i = 0; i < subRecs.length; i++) {
								let result = results[i]; if (!result) { continue } let rec = subRecs[i], {uuid} = rec, sayac = rec.kaysayac;
								if (result?.statusCode == 0) { extend(result, { isError: false }) }
								extend(result, { islemZamani: now(), isError: result.isError ?? !result.result, psTip, sayac, uuid, rec, efAyrimTipi });
								uuid2Result[uuid] = subUUID2Result[uuid] = result
							}
							if (!empty(subUUID2Result)) { this.eIslemSorgula_sonucIsle(e); subUUID2Result = e.subUUID2Result = [] }
							if (window.progressManager) { window.progressManager.progressStep(results.length) } if (callback) { getFuncValue.call(this, callback, e) }
						}
					}
				}
			}
			if (window.progressManager) { window.progressManager.progressStep() } if (callback) { getFuncValue.call(this, callback, e) }
			if (!empty(subUUID2Result)) { this.eIslemSorgula_sonucIsle(e) }
			subUUID2Result = []; delete e.subUUID2Result
		}
		if (!e.internal) { if (sender && !sender.isDestroyed && sender.tazele) { sender.tazele() } }
	}
	async eIslemSorgula_sonucIsle(e) {
		let uuid2Result = e.subUUID2Result ?? e.uuid2Result; if (empty(uuid2Result)) { return }
		let gelenmi = e.gelen ?? e.gelenmi ?? false, toplu = new MQToplu().withDefTrn();
		for (let subResult of values(uuid2Result)) {
			let {psTip, uuid} = subResult, from = gelenmi ? 'efgecicialfatfis' : psTip == 'S' ? 'sipfis' : 'piffis';
			let uuidSaha = gelenmi ? 'efuuid' : 'efatuuid', onaySaha = gelenmi ? 'onaydurumu' : 'efatonaydurumu';
			let value = subResult.isError ? 'X' : subResult.onayDurumChar;
			if (value != null) { toplu.add(new MQIliskiliUpdate({ from, where: { degerAta: uuid, saha: uuidSaha }, set: { degerAta: value, saha: onaySaha } })) }
		}
		if (toplu?.liste?.length) { await app.sqlExecNone(toplu) }
	}
	static async eIslemIptal(e) {
		let eYoneticiler = await this.getEYoneticiListe(e); delete e.eYoneticiler; let uuid2Result = {};
		for (let eYonetici of eYoneticiler ?? []) {
			await eYonetici.eIslemIptal(e);
			let _uuid2Result = e.uuid2Result; if (!empty(_uuid2Result)) { extend(uuid2Result, _uuid2Result) }
		}
		e.uuid2Result = uuid2Result
	}
	async eIslemIptal(e) {
		let { sender } = e
		let { eConf, eIslSinif: eIslAnaSinif } = this
		extend(e, {
			ps2SayacListe: this.ps2SayacListe ?? (() => this.class.getPS2SayacListe(e)),
			whereDuzenleyici: (
				eIslAnaSinif.gelenmi
					? null
					: ({ where: wh }) => wh.add(`fis.efatuuid <> ''`)
			)
		})
		let stm = eIslAnaSinif.getUUIDStm(e); for (let key of ['psTip2SayacListe', 'whereDuzenleyici']) { delete e[key] }
		if (!stm) { throw { isError: true, rc: 'bosUUIDStm', errorText: 'Filtre hatalı' } }
		let recs = await app.sqlExecSelect(stm), ps2Recs = this.class.getPS2Recs({ recs });
		let {callback} = e, uuid2Result = e.uuid2Result = e.uuid2Result || {};
		if (!empty(ps2Recs)) {
			let eConf = e.eConf ?? this.eConf
			let oe = eConf.getValue('ozelEntegrator')
			if (isObject(oe))
				oe = oe.char
			
			for (let psTip in ps2Recs) {
				let _recs = ps2Recs[psTip], eIslTip2Recs = {}, duzgunUUIDListe = [], block_duzgunUUIDListe = [];
				let updateIslemi = async () => {
					if (!block_duzgunUUIDListe?.length) { return }
					let upd = new MQIliskiliUpdate({ 
						from: this.class.getPS2Table(psTip), set: [`efatuuid = ''`, `efimzats = NULL`, `efgonderimts = NULL`],
						where: [`(efimzats IS NOT NULL OR efgonderimts IS NOT NULL OR efatuuid <> '')`, { inDizi: block_duzgunUUIDListe, saha: 'efatuuid' }]
					});
					await app.sqlExecNone(upd)
				};
				for (let rec of _recs) { let efAyrimTipi = rec.efayrimtipi || 'A'; (eIslTip2Recs[efAyrimTipi] = eIslTip2Recs[efAyrimTipi] || []).push(rec) }
				for (let efAyrimTipi in eIslTip2Recs) {
					let _recs = eIslTip2Recs[efAyrimTipi] || []; if (!_recs.length) { continue }
					let savedToken = this.class.getTempToken(efAyrimTipi);
					try {
						let results = await app.wsEIslemYap({
							eIslemci: efAyrimTipi, oe,
							eIslemAPI: 'belgeIptal',
							eLogin: toJSONStr(eConf.eLogin),
							eToken: savedToken || '', args: _recs.map(rec => ({ uuid: rec.uuid }))
						});
						if (results) {
							for (let i = 0; i < _recs.length; i++) {
								let result = results[i]; if (!result) { continue } let _rec = _recs[i], {uuid} = _rec;
								extend(result, { islemZamani: now(), isError: false, rec: _rec, efAyrimTipi }); uuid2Result[uuid] = result;
								if (!savedToken) { let {token} = result; if (token != null && savedToken != token) { savedToken = token; this.class.setTempToken(efAyrimTipi, token) } }
								if (!result.isError) { duzgunUUIDListe.push(uuid); block_duzgunUUIDListe.push(uuid) }
								if (window.progressManager) { window.progressManager.progressStep() }
								if (keys(uuid2Result).length % 201 == 200) { await updateIslemi(); if (callback) { getFuncValue.call(this, callback, e) } }
							}
						}
					}
					catch (ex) {
						if (!ex.responseJSON && ex.responseText) { try { ex = JSON.parse(ex.responseText) } catch (_ex) { } }
						let errorText = getErrorText(ex); for (let rec of _recs) {
							let {uuid} = rec; if (!uuid) { continue }
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
		let eYoneticiler = await this.getEYoneticiListe(e)
		delete e.eYoneticiler
		
		let uuid2Result = {}
		for (let eYonetici of eYoneticiler ?? []) {
			await eYonetici.xmlKaldir(e)
			let { uuid2Result: _uuid2Result } = e
			if (!empty(_uuid2Result))
				extend(uuid2Result, _uuid2Result)
		}
		e.uuid2Result = uuid2Result
	}
	async xmlKaldir(e) {
		let { eIslSinif: eIslAnaSinif } = this
		extend(e, {
			ps2SayacListe: this.ps2SayacListe ?? (() => this.class.getPS2SayacListe(e)),
			whereDuzenleyici: (
				eIslAnaSinif.gelenmi
					? null
					: ({ where: wh }) => wh.add(`fis.efatuuid <> ''`)
			)
		})
		let stm = eIslAnaSinif.getUUIDStm(e)
		for (let key of ['psTip2SayacListe', 'whereDuzenleyici'])
			delete e[key]
		
		if (!stm)
			throw { isError: true, rc: 'bosUUIDStm', errorText: 'Filtre hatalı' }
		
		let { sender, callback } = e
		let { eConf = this.eConf } = e
		let { eIslEkArgs } = eConf
		
		let recs = await app.sqlExecSelect(stm)
		let ps2Recs = this.class.getPS2Recs({ recs })
		let uuid2Result = e.uuid2Result ??= {}
		if (!empty(ps2Recs)) {
			let duzgunUUIDListe = [], block_duzgunUUIDListe = []
			for (let psTip in ps2Recs) {
				let _recs = ps2Recs[psTip], eIslTip2Recs = {}
				for (let rec of _recs) {
					let efAyrimTipi = rec.efayrimtipi || 'A'
					;(eIslTip2Recs[efAyrimTipi] ??= [])
						.push(rec)
				}
				for (let efAyrimTipi in eIslTip2Recs) {
					let _recs = eIslTip2Recs[efAyrimTipi] ?? []
					if (empty(recs))
						continue
					
					let updateIslemi = async () => {
						if (empty(block_duzgunUUIDListe))
							return
						
						let upd = new MQIliskiliUpdate({ 
							from: this.class.getPS2Table(psTip),
							set: [`efatuuid = ''`, `efimzats = NULL`, `efgonderimts = NULL`],
							where: [`(efimzats IS NOT NULL OR efgonderimts IS NOT NULL OR efatuuid <> '')`, { inDizi: duzgunUUIDListe, saha: 'efatuuid' }]
						})
						await app.sqlExecNone(upd)
					}
					try {
						// let savedToken = this.class.getTempToken(efAyrimTipi)
						let oe = eConf.getValue('ozelEntegrator')
						if (isObject(oe))
							oe = oe.char
						
						let results = await app.wsEIslemYap({
							eIslemci: efAyrimTipi,
							oe,
							eIslemAPI: 'xmlKaldir',
							/*eLogin: toJSONStr(eConf.eLogin), eToken: savedToken || '',*/ eToken: true,
							ekArgs: toJSONStr(eIslEkArgs), args: _recs.map(rec => ({ uuid: rec.uuid }))
						})
						
						if (results) {
							for (let i = 0; i < results.length; i++) {
								let result = results[i]
								if (!result)
									continue
								
								let _rec = _recs[i], { uuid } = _rec
								extend(result, { islemZamani: now(), isError: false, rec: _rec, efAyrimTipi })
								uuid2Result[uuid] = result
								if (!result.isError) {
									duzgunUUIDListe.push(uuid)
									block_duzgunUUIDListe.push(uuid)
								}
								window.progressManager?.progressStep?.()
							}
						}
						window.progressManager?.progressStep?.()
						if (keys(uuid2Result).length % 201 == 200) {
							await updateIslemi()
							if (callback)
								getFuncValue.call(this, callback, e)
						}
					}
					catch (ex) {
						if (!ex.responseJSON && ex.responseText) { try { ex = JSON.parse(ex.responseText) } catch (_ex) { } }
						let errorText = getErrorText(ex); for (let rec of _recs) {
							let {uuid} = rec; if (!uuid) { continue }
							uuid2Result[uuid] = { islemZamani: now(), uuid, rec, isError: true, rc: ex?.rc ?? ex.code ?? '??', errorText, error: ex };
							console.error(ex)
						}
					}
					await updateIslemi()
					if (callback)
						getFuncValue.call(this, callback, e)
				}
			}
		}
		if (!e.internal) {
			if (sender && !sender.isDestroyed)
				sender.tazele?.()
		}
	}
	static async eIslemXMLOlustur(e) {
		let eYoneticiler = await this.getEYoneticiListe(e);
		delete e.eYoneticiler
		let uuid2Result = {}
		for (let eYonetici of eYoneticiler ?? []) {
			await eYonetici.eIslemXMLOlustur(e)
			let _uuid2Result = e.uuid2Result
			if (!empty(_uuid2Result))
				extend(uuid2Result, _uuid2Result)
		}
		e.uuid2Result = uuid2Result
	}
	async eIslemXMLOlustur(e = {}) {
		let {sender, callback, eConf = this.eConf} = e, {eIslSinif: eIslAnaSinif} = this
		extend(e, { ps2SayacListe: this.ps2SayacListe ?? this.class.getPS2SayacListe(e) })
		let stm = eIslAnaSinif.getUUIDStm(e)
		for (let key of ['psTip2SayacListe', 'whereDuzenleyici'])
			delete e[key]
		if (!stm)
			throw { isError: true, rc: 'bosUUIDStm', errorText: 'Filtre hatalı' }
		let efAyrimTipi2Arastirilacaklar = {}, olusacakPS2Sayaclar = {}
		let recs = await app.sqlExecSelect(stm)
		window.progressManager?.setProgressMax((window.progressManager?.progressMax || 0) + recs.length)
		for (let rec of recs) {
			let {pstip, fissayac, uuid} = rec
			if (!uuid) {
				(olusacakPS2Sayaclar[pstip] ??= []).push(fissayac)
				continue
			}
			let efAyrimTipi = rec.efayrimtipi ||= 'A'
			; (efAyrimTipi2Arastirilacaklar[efAyrimTipi] ??= []).push(rec)
		}
		if (!empty(efAyrimTipi2Arastirilacaklar)) {
			for (let efAyrimTipi in efAyrimTipi2Arastirilacaklar) {
				let arastirilacaklar = efAyrimTipi2Arastirilacaklar[efAyrimTipi]
				let eIslSinif = EIslemOrtak.getClass(efAyrimTipi), anaBolum = eConf.getAnaBolumFor(eIslSinif)
				if (!anaBolum)
					throw { isError: true, rc: 'eIslAnaBolumBelirsiz', errorText: `e-İşlem için Ana Bölüm belirsizdir` }
				let eksikUUID2Dosya = {}, dosyaAdiSet = {}
				for (let {uuid} of arastirilacaklar) {
					let dosyaAdi = `${uuid}.xml`
					eksikUUID2Dosya[uuid] = `${anaBolum}\\IMZALI\\${dosyaAdi}`
					dosyaAdiSet[dosyaAdi] = true
				}
				if (!empty(dosyaAdiSet)) {
					// toplu uuid2Dosya xml dosya kontrol
					let fileNames = keys(dosyaAdiSet)
					let pattern = `${'?'.repeat(newGUID().length)}.xml`
					let {recs} = await app.wsDosyaListe({ args: { dir: anaBolum, recursive: true, includeDirs: false, fileNames, pattern } }) || {}
					for (let rec of recs) {
						let {name: dosyaAdi} = rec
						let uuid = dosyaAdi.split('.')[0].trim()
						delete eksikUUID2Dosya[uuid]
						delete dosyaAdiSet[dosyaAdi]
					}
				}
				for (let [efAyrimTipi, recs] of entries(efAyrimTipi2Arastirilacaklar))
					for (let {uuid, pstip: psTip, fissayac: fisSayac} of recs) {
						if (eksikUUID2Dosya[uuid])
							(olusacakPS2Sayaclar[psTip] ??= []).push(fisSayac)
					}
			}
		}
		let {length: kalanSayi} = recs, eFisListe = []
		let uuid2Result = e.uuid2Result ??= {}
		if (!empty(olusacakPS2Sayaclar)) {
			for (let {length: sayi} of values(olusacakPS2Sayaclar)) {
				kalanSayi -= sayi
				window.progressManager?.progressStep(sayi)
			}
		}
		if (!empty(olusacakPS2Sayaclar)) {
			let _e = { ...e, ...this, ps2SayacListe: olusacakPS2Sayaclar, temps: {}, shared: {} }
			let stm = eIslAnaSinif.getEFisBaslikVeDetayStm(_e)
			if (!stm)
				return
			
			let recs = await app.sqlExecSelect(stm)
			let sevRecs = seviyelendirAttrGruplari({ source: recs, attrGruplari: [['pstip', 'fissayac']] })
			let ps2Sayac2EFis = _e.ps2Sayac2EFis = {}
			
			let { temps, shared } = _e
			let _today = today(), _now = now()
			for (let sev of sevRecs) {
				let { orjBilgi: rec } = sev
				if (rec.sevktarih === undefined) {
					rec.sevktarih = rec.sevktarihi
					delete rec.sevktarihi
				}
				let { pstip: psTip, fissayac: fisSayac, sevktarih } = rec
				let efAyrimTipi = rec.efayrimtipi ||= 'A'
				extend(rec, {
					tarihStr: asReverseDateString(rec.tarih),
					sevkTarihStr: asReverseDateString(sevktarih || _today),
					sevkSaatStr: timeToString(sevktarih || _now)
				})
				extend(sev, {
					orjBilgi: new EIslBaslik(sev.orjBilgi),
					detaylar: sev.detaylar.map(det => new EIslDetay(det))
				})
				let eFis = EIslemOrtak.newFor({ tip: efAyrimTipi, eConf })
				await eFis.baslikVeDetaylariYukle({ ..._e, baslik: sev.orjBilgi, detaylar: sev.detaylar, temps, shared })
				let sayac2EFis = ps2Sayac2EFis[psTip] ??= {}
				sayac2EFis[fisSayac] = eFis
			}
			await eIslAnaSinif.tipIcinFislerEkDuzenlemeYap(_e)
			let BlockSize = 100
			for (let psTip in ps2Sayac2EFis) {
				let sayac2EFis = ps2Sayac2EFis[psTip], fisSayacListe = keys(sayac2EFis);
				while (fisSayacListe.length) {
					let subFisSayacListe = fisSayacListe.splice(0, BlockSize), uuid2SubResult = {};
					let toplu = new MQToplu()
					let updCallback = _e.updCallback = ({ query }) => {
						if (query)
							toplu.add(query)
					}
					let promises = [], uploadList = []
					let commit = async () => {
						await promiseAll(promises)
						promises = []
						if (uploadList.length) {
							await app.wsMultiUpload({ data: uploadList })
							uploadList = []
						}
						if (toplu.liste.length) {
							await app.sqlExecNone(toplu)
							toplu.liste = []
						}
					}
					for (let fisSayac of subFisSayacListe) {
						promises.push(defer(async p => {
							let eFis = sayac2EFis[fisSayac], {baslik} = eFis, {efayrimtipi: efAyrimTipi} = baslik;
							let eIslSinif = EIslemOrtak.getClass({ tip: efAyrimTipi }), anaBolum = eConf.getAnaBolumFor({ eIslSinif });
							let uuid
							try {
								if (!anaBolum)
									throw { isError: true, rc: 'eIslAnaBolumBelirsiz', errorText: 'e-İşlem için Ana Bölüm belirlenemedi' }
								let args = { ..._e }
								let xmlStr = await eFis.xmlOlustur(args)
								if (!xmlStr)
									p.resolve()
								uuid = baslik.uuid
								uuid2Result[uuid] ??= { islemZamani: now(), isError: false, eFis, rec: baslik, efAyrimTipi }
								// let uuid2XML = e.uuid2XML = e.uuid2XML || {}; uuid2XML[uuid] = xmlStr
								let xmlDosya = `${anaBolum}\\IMZALI\\${uuid}.xml`
								//await app.wsUpload({ remoteFile: xmlDosya, args: xmlStr })
								uploadList.push({ name: xmlDosya, data: Base64.encode(xmlStr) })
								//if (config.dev) { let url = URL.createObjectURL(new Blob([xmlStr], { type: 'application/xml' })); openNewWindow(url) }
							}
							catch (ex) {
								uuid = baslik.uuid || uuid
								let rec = uuid2Result[uuid] ??= { islemZamani: now(), eFis, baslik, efAyrimTipi }
								extend(rec, { isError: true, message: getErrorText(ex) })
								console.error(ex)
							}
							p.resolve()
						}))
						if (promises.length == 1)
							await commit()
					}
					await commit()
					window.progressManager?.progressStep(subFisSayacListe?.length ?? 0)
					try {
						if (callback)
							getFuncValue.call(this, callback, e)
					}
					catch (ex) { }
				}
			}
			if (!e.internal) { if (sender && !sender.isDestroyed && sender.tazele) { sender.tazele() } }
		}
	}
	static async alimEIslemSil(e) {
		let eYoneticiler = await this.getEYoneticiListe(e)
		delete e.eYoneticiler
		let promises = []
		for (let eYonetici of eYoneticiler)
			promises.push(eYonetici.alimEIslemSil(e))
		await Promise.all(promises)
	}
	async alimEIslemSil(e) {
		let {sender, callback, recs} = e, fisSayacListe = recs.map(rec=>rec.fissayac), uuid2Result = e.uuid2Result = e.uuid2Result || {};
		let del = new MQIliskiliDelete({
			from: 'efgecicialfatfis',
			where: { inDizi: fisSayacListe, saha: 'kaysayac' }
		});
		let isError = !(await app.sqlExecNone(del));
		for (let rec of recs) {
			let efAyrimTipi = rec.efayrimtipi || 'A', {uuid} = rec;
			let result = { islemZamani: now(), isError, rec, efAyrimTipi };
			uuid2Result[uuid] = result; if (window.progressManager) { window.progressManager.progressStep() }
		}
		if (callback) { getFuncValue.call(this, callback, e) }
		if (!e.internal) { if (sender && !sender.isDestroyed && sender.tazele) { sender.tazele() } }
	}
	static async eIslemBekleyenleriGetir(e) {
		e = e || {}; let eConf = e.eConf ?? MQEConf.instance, eIslSiniflar = [EIslFatura, EIslIrsaliye];
		let eYoneticiler = e.eYoneticiler = eIslSiniflar.map(eIslSinif=>new EYonetici({ eConf, eIslSinif })), uuid2Result = {};
		for (let eYonetici of eYoneticiler ?? []) {
			await eYonetici.eIslemBekleyenleriGetir(e);
			let _uuid2Result = e.uuid2Result; if (!empty(_uuid2Result)) { extend(uuid2Result, _uuid2Result) }
		}
		e.uuid2Result = uuid2Result
	}

	async eIslemBekleyenleriGetir(e = {}) {
		e.eYonetici = this
		let { eIslSinif } = this
		let { callback, secimler } = e
		let sender = e.sender ?? callback?.parentPart
		let efAyrimTipi = eIslSinif.tip
		let eConf = e.eConf ?? this.eConf
		let { eIslEkArgs } = eConf
		let tarihBS = secimler?.tarih ?? {}
		let uuid2Result = e.uuid2Result ??= {}
		let savedToken = this.class.getTempToken(efAyrimTipi)
		let eIslemBlock = async (...rest) => {
			let oe = eConf.getValue('ozelEntegrator')
			if (isObject(oe))
				oe = oe.char
			let _e = {
				...rest,
				eIslemci: efAyrimTipi, oe,
				eIslemAPI: 'gelenBelgeleriGetir',
				eLogin: toJSONStr(eConf.eLogin), eToken: savedToken || '', ekArgs: toJSONStr(eIslEkArgs),
				args: { gelen: true, offset: 0, count: 5, tarihBS: { basi: dateToString(tarihBS.basi), sonu: dateToString(tarihBS.sonu) } }
			}
			let { argsDuzenleyici } = e
			if (argsDuzenleyici)
				getFuncValue.call(this, argsDuzenleyici, { ...e, ..._e })
			let result = await app.wsEIslemYap(_e)
			if (isArray(result))
				result = result[0]
			return result
		}
		
		let result = await eIslemBlock()
		if (savedToken != null) {
			let {token} = result
			if (token != null && savedToken != token /*&& asBoolQ(savedToken) == null*/) { savedToken = token; this.class.setTempToken(efAyrimTipi, token) }
		}
		let {parentDir} = result
		let seq = 0, {count} = result
		let subResults = e.subResults = result?.results ?? result?.subResults
		if (!subResults?.length)
			return
		let uuids = e.uuids = subResults?.map(result => result.uuid )
		if (count == null) { count = e.count = subResults?.length }
		if (window.progressManager) progressManager.progressMax = (progressManager.progressMax || 0) + (count || 1)
		let eIslAltBolum = eConf.getAnaBolumFor({ efAyrimTipi })
		if (!eIslAltBolum) { throw { isError: true, rc: 'eIslAnaBolumBelirsiz', errorText: 'e-İşlem için Ana Bölüm belirlenemedi' } }
		let BlockSize = 10; let blockSubResults = [];
		let kismiVeriIsleVeBosalt = async _e => {
			try { e.subResults = blockSubResults; await this.bekleyenleriGetir_veriIsle(e) } catch (ex) { console.error('Alım e-İşlem Veri İşle', { BlockSize, blockSubResults, subResults }) }
			if (window.progressManager) { window.progressManager.progressStep(blockSubResults.length) } if (callback) { getFuncValue.call(this, callback, e) } 
			blockSubResults = [];
		};
		for (let subResult of subResults) {
			let isError = false, errorText
			let {uuid} = subResult, xmlDosyaAdi = subResult.xmlDosyaAdi || subResult.xmlFileName || `${uuid}.xml`
			let xmlData = subResult.xmlData ?? subResult.xmlContent
			let xml, eFis;
			try {
				if (!xmlData) {
					let xmlDosya = `${parentDir || `${eIslAltBolum}\\ALINAN`}\\${xmlDosyaAdi}`
					xmlData = await app.wsDownloadAsStream({ remoteFile: xmlDosya, localFile: xmlDosyaAdi })
				}
				xml = result.xml = $.parseXML(xmlData)?.documentElement
				eFis = new EFis({ xml })
			}
			catch (ex) { isError = true; errorText = getErrorText(ex); console.error(ex) }
			extend(subResult, { islemZamani: now(), isError, errorText, uuid, eFis });
			if (eFis) { let {eIslTip: efAyrimTipi} = eFis, {tarih, fisNox} = eFis
			extend(subResult, { efAyrimTipi, tarih, fisNox }) }
			blockSubResults.push(subResult); uuid2Result[uuid] = subResult; seq++;
			if (blockSubResults.length >= BlockSize) { await kismiVeriIsleVeBosalt(e) }
		}
		await kismiVeriIsleVeBosalt(e)
	}
	static async eIslemAlimXMLYukle(e = {}) {
		let {xmlListe} = e;
		if (!xmlListe) {
			let fhList = await showOpenFilePicker({
				multiple: true, excludeAcceptAllOption: true,
				types: [{ accept: { 'application/xml': ['.xml'] }, description: 'XML Dosyaları' }]
			});
			if (fhList) {
				xmlListe = e.xmlListe = [];
				for (let fh of fhList) {
					let file = await fh.getFile(), sr = file.stream().getReader(); let data = '';
					while (true) { let enm = await sr.read(); data += new TextDecoder().decode(enm.value); if (enm.done) { break } }
					if (!data) { continue }
					let xml = $.parseXML(data); if (xml) { xml = xml.documentElement || xml }
					xmlListe.push(xml)
				}
			}
		}
		let {eConf} = e, eIslSiniflar = [], eYoneticiler = e.eYoneticiler = [ new EYonetici({ eConf }) ], uuid2Result = {};
		for (let eYonetici of eYoneticiler ?? []) {
			await eYonetici.eIslemAlimXMLYukle(e);
			let _uuid2Result = e.uuid2Result; if (!empty(_uuid2Result)) { extend(uuid2Result, _uuid2Result) }
		}
		e.uuid2Result = uuid2Result
	}
	async eIslemAlimXMLYukle(e = {}) {
		let BlockSize = 10; e.eYonetici = this
		let {eConf} = this, {eIslEkArgs} = eConf, {callback} = e
		let xmlListe = e.xmlListe || [], count = e.count = xmlListe.length;
		if (window.progressManager) { progressManager.progressMax = (progressManager.progressMax || 0) + (count || 1) }
		let uuid2Result = e.uuid2Result = e.uuid2Result || {}; e.subResults = [];
		let kismiVeriIsleVeBosalt = async e => {
			let { subResults } = e
			if (!subResults.length) { return }
			try { await this.bekleyenleriGetir_veriIsle(e) }
			catch (ex) { console.error('Alım e-İşlem Veri İşle', { blockSize: BlockSize, subResults: extend({}, subResults) }) }
			if (window.progressManager) { window.progressManager.progressStep(subResults.length) } if (callback) { getFuncValue.call(this, callback, e) }
			e.subResults = []
		};
		for (let _xml of xmlListe) {
			let xml = _xml; if (xml) { xml = xml.documentElement || xml } if (!xml) { continue }
			let eFis = new EFis({ xml }), efAyrimTipi = eFis.eIslTip, {uuid} = eFis, xmlDosyaAdi = `${uuid}.xml`;
			let eIslAltBolum = eConf.getAnaBolumFor({ efAyrimTipi }); if (!eIslAltBolum) { throw { isError: true, rc: 'eIslAnaBolumBelirsiz', errorText: 'e-İşlem için Ana Bölüm belirlenemedi' } }
			let xmlDosya = `${eIslAltBolum}\\ALINAN\\${xmlDosyaAdi}`; app.wsUpload({ remoteFile: xmlDosya, args: _xml?.outerHTML ?? _xml });
			let result = { islemZamani: now(), isError: false, efAyrimTipi, uuid: uuid, tarih: eFis.tarih, fisNox: eFis.fisNox, eFis };
			let {subResults} = e; subResults.push(result); uuid2Result[uuid] = result;
			if (subResults.length >= BlockSize) { await kismiVeriIsleVeBosalt(e) }
		}
		await kismiVeriIsleVeBosalt(e)
	}
	static async eIslemAlimTicariFiseDonustur(e = {}) {
		let {eConf} = e, eYoneticiler = e.eYoneticiler = [new EYonetici({ eConf })];
		for (let eYonetici of eYoneticiler ?? []) { await eYonetici.eIslemAlimTicariFiseDonustur(e) }
	}
	async eIslemAlimTicariFiseDonustur(e) {
		e.eYonetici = this; let {eConf} = this, {eIslEkArgs} = eConf;
		let {recs, callback} = e, count = e.count = recs.length; if (window.progressManager) { progressManager.progressMax = (progressManager.progressMax || 0) + (count || 1) }
		let uuid2Result = e.uuid2Result = e.uuid2Result || {}, uuid2Rec = e.uuid2Rec = {}; for (let rec of recs) { let {uuid} = rec; uuid2Rec[rec.uuid] = rec }
		for (let rec of recs) {
			extend(e, { rec }); uuid2Result[rec.uuid] = await this.eIslemAlimTicariFiseDonustur_tekil(e);
			if (window.progressManager) { window.progressManager.progressStep() }
			if (callback) { getFuncValue.call(this, callback, e) }
		}
		if (!e.internal) { let {sender} = e; if (sender && !sender.isDestroyed && sender.tazele); sender.tazele() }
	}
	async eIslemAlimTicariFiseDonustur_tekil(e) {
		e = e || {}; let wndProgress = progressManager?.wnd; if (wndProgress?.length) wndProgress.hide()
		try {
			let {rec} = e, {uuid} = rec, fisNox = rec.fisnox; let result = e.result = { islemZamani: now(), isError: false, uuid, fisNox, rec };
			let islemci = new EAlimTicariyeDonusturucu(e); extend(result, await islemci.ekranOlustur_onBilgi(e) || {});
			if (result?.reason == 'close') return result
			let {varmi, ayrimTipi} = await islemci.belgeKontrol(e);
			if (varmi) { extend(result, { isError: true, message: 'Bu fiş zaten var', detail: ayrimTipi }); return result }
			extend(result, await islemci.fisGirisiYap(e) || {});
			if (result && !result.isError) {
				let upd = new MQIliskiliUpdate({ from: 'efgecicialfatfis', where: { degerAta: uuid, saha: 'efuuid' }, set: `tamamlandi = '*'` });
				await app.sqlExecNone(upd)
			}
			return result
		}
		finally { if (wndProgress?.length) wndProgress.show() }
	}

	async bekleyenleriGetir_veriIsle(e) {
		let eYonetici = this
		let { eConf } = this
		let { subUUID2Results } = e
		let { subResults: results = e.results ?? values(subUUID2Results) } = e
		console.debug('bekleyenleriGetir_veriIsle', e)
		for (let res of results) {
			let { eFis } = res
			if (!eFis) {
				let { xml, xmlContent } = res
				if (!xml && xmlContent)
					xml = res.xml = $.parseXML(xmlContent)?.documentElement
				
				let { eIslSinif } = res
				if (!eIslSinif) {
					let efAyrimTipi = res.efAyrimTipi || 'A'
					eIslSinif = res.eIslSinif = EIslemOrtak.getClass(efAyrimTipi)
				}
				eFis = res.eFis = new EFis({ eConf, eIslSinif, xml })
			}
			
			if (!await this.bekleyenleriGetir_veriIsle_onKontrol({ ...e, res }))
				continue
			
			extend(res, eFis)
			console.debug('..', eFis)
		}
		
		await EFis.topluEkBilgileriBelirle({ eYonetici, liste: results.map(r => r.eFis) })
		await this.bekleyenleriGetir_veriIsle_sonrasi({ ...e, results })
	}
	async bekleyenleriGetir_veriIsle_onKontrol(e) {
		let { islemAdi = 'Gelen e-İşlem Belgesi' } = e
		let { result } = e
		let { eFis } = result
		
		// Alıcı VKN Kontrol
		let { aliciVKN } = eFis
		let isyeri_vknTckn = e._isyeri_vknTckn ??= app.params.isyeri.vergi.vknTckn
		let devamFlag = true
		if (isyeri_vknTckn && aliciVKN != isyeri_vknTckn) {
			devamFlag = e.rdlg_vkn
			if (devamFlag === undefined) {
				let rdlg
				let mesaj = (
					`<div>Alınan e-İşlem Belgesindeki <ul>` +
					`<li><u>Alıcı VKN bilgisi</u>: <b>${aliciVKN}</b></li>` +
					`<li><u>Bu İşyerine ait VKN</u>: <b>${isyeri_vknTckn}</b></li>` +
					`</ul> farklıdır.</div>` +
					`<div style="font-weight: bold; color: firebrick; margin-top: 5px; padding-left: 30px;">Yine de devam edilsin mi?</div>`
				)
				try { rdlg = await ehConfirm(mesaj, islemAdi) }
				catch (ex) { console.error(ex) }
				e.rdlg_vkn = devamFlag = rdlg
			}
		}
		if (!devamFlag) {
			extend(result, { isError: true, message: 'Farklı VKN nedeniyle işlem iptal edildi' })
			console.warn('X.', eFis)
			return false
		}
		
		// ...
		let { gondericiVKN, fisNox, eIslSinif } = eFis
		let { eIrsaliyemi } = eIslSinif
		let fisNo_tsn = TicariSeriliNo.fromText(fisNox)
		
		let uni = new MQUnionAll([
			new MQSent({
				from: 'efgecicialfatfis', sahalar: [`'*' gecicimi`, 'effatnox fisnox'],
				where: [{ degerAta: gondericiVKN, saha: 'vkno' }, { degerAta: fisNox, saha: 'effatnox' }, { degerAta: eIrsaliyemi ? 'IR' : '', saha: 'efbelge' }]
			}),
			new MQSent({
				from: 'piffis fis', sahalar: [`'' gecicimi`, 'fis.fisnox'],
				fromIliskiler: [{ from: 'carmst car', iliski: 'fis.must = car.must' }],
				where: [
					new MQOrClause([
						{ degerAta: gondericiVKN, saha: 'car.vnumara' },
						{ degerAta: gondericiVKN, saha: 'car.tckimlikno' }
					]),
					{ degerAta: eIrsaliyemi ? 'I' : 'F', saha: 'fis.piftipi' },
					{ ticariTSN: fisNo_tsn },
					{ ticariGC: true }
			]
			})
		])
		let stm = new MQStm({ sent: uni })
		let recs = await stm.execSelect()
		if (!empty(recs)) {
			let rec = recs[0]
			let gecicimi = asBool(rec.gecicimi)
			extend(result, { isError: true, message: `${rec.fisnox} numaralı belge ${gecicimi ? 'Geçici Listede ' : ''}tekrarlanıyor` });
			console.debug('X.', eFis)
			return false
		}
		return true
	}
	async bekleyenleriGetir_veriIsle_sonrasi(e) {
		let { results, sender } = e
		for (let result of results) {
			if (result.isError)
				continue
			let { eFis } = result
			let paramName_fisSayac = '@fisSayac'
			let fissayac = new MQSQLConst(paramName_fisSayac)
			let fisTable = 'efgecicialfatfis', harTable = 'efgecicialfatdetay'
			let basHV = eFis.alimGeciciBaslikHostVars(result)
			let sipHVListe = [], irsHVListe = []
			let detHVListe = eFis.detaylar.map(det =>
				({ fissayac, ...det.alimGeciciDetayHostVars(result) }))
			
			for (let { tsn, tarih } of eFis.siparisler ?? [])
				sipHVListe.push({ fissayac, efsipnobilgi: tsn.asText, efsiptarih: tarih, sipseri: tsn.seri, sipnoyil: tsn.noyil, sipno: tsn.no })
			for (let { tsn, tarih } of eFis.irsaliyeler ?? [])
				irsHVListe.push({ fissayac, efirsnobilgi: tsn.asText, efirstarih: tarih, irsseri: tsn.seri, irsnoyil: tsn.noyil, irsno: tsn.no })
			
			let toplu = new MQToplu({
				liste: [
					new MQInsert({ table: fisTable, hv: basHV }),
					new MQSent({ from: fisTable, sahalar: `${paramName_fisSayac} = MAX(kaysayac)` }),
					new MQInsert({ table: harTable, hvListe: detHVListe }),
					new MQInsert({ table: 'efgecicialfatsip', hvListe: sipHVListe }),
					new MQInsert({ table: 'efgecicialfatirs', hvListe: irsHVListe })
				],
				params: [
					{ name: paramName_fisSayac, type: 'int', direction: 'inputOutput', value: 0 }
				]
			}).withDefTrn()
			
			let _result; try { _result = ((await app.sqlExecNoneWithResult({ query: toplu })) || {})[0] }
			catch (ex) { extend(result, { isError: true, rc: 'sqlError', errorText: getErrorText(ex), error: ex }); console.error(ex) }
			if (_result) { _result = (_result?.params || {})[paramName_fisSayac]; result.fisSayac = asInteger(_result?.value) || null }
		}
		/* debugger */
		if (!e.internal) { if (sender && !sender.isDestroyed && sender.tazele) { sender.tazele() } }
	}
	static getPS2Table(e) {
		let psTip = isObject(e) ? e.psTip ?? e.tip ?? e.ps : e
		return (psTip == 'S' ? 'sipfis' : 'piffis')
	}
	static getEYoneticiListe(e) {
		let { eYoneticiler, recs, gelen = e.gelenmi } = e
		if (eYoneticiler)
			return eYoneticiler
		
		if (empty(recs))
			return recs ?? null
		
		let eIslAnaTip2PS2SayacListe = {}
		for (let rec of recs) {
			if (!rec)
				continue
			
			let psTip = rec.pstip ?? 'P'
			let efAyrimTipi = rec.efayrimtipi ?? rec.efbelge
			let { anaTip } = EIslemOrtak.getClass({ tip: efAyrimTipi, gelen }) ?? {}
			if (!anaTip)
				continue
			
			let ps2SayacListe = eIslAnaTip2PS2SayacListe[anaTip] ??= {}
			;(ps2SayacListe[psTip] ??= [])
				.push(rec.kaysayac ?? rec.fissayac)
		}
		
		let eConf = e.eConf ??= MQEConf.instance
		let result = []
		for (let [anaTip, ps2SayacListe] of entries(eIslAnaTip2PS2SayacListe)) {
			let eIslSinif = EIslemOrtak.getAnaClass({ anaTip, gelen })
			result.push(new EYonetici({ eConf, eIslSinif, ps2SayacListe }))
		}
		return result
	}
	static getPS2Recs(e = {}) {
		let recs = e.recs || e
		if (!recs)
			return null
		
		let result = {}
		for (let rec of recs) {
			let psTip = rec.pstip ?? rec.psTip
			;(result[psTip] ??= [])
				.push(rec)
		}
		
		return result
	}
	static getPS2SayacListe(e) {
		let recs = e?.recs ?? e
		if (!recs)
			return null
		
		let result = {}
		for (let r of recs) {
			let { psTip = r.pstip } = r
			let { sayac = r.fissayac ?? r.fisSayac ?? r.kaysayac ?? r.kaySayac } = e
			;(result[psTip] ??= [])
				.push(sayac)
		}
		return result
	}
	static getTempToken(e = {}) {
		let eIslTip = isObject(e) ? (e.eIslTip ?? e.tip ?? e.efAyrimTipi ?? e.efayrimtipi) : e
		return this.eIslTip2Token[eIslTip]
	}
	static setTempToken(e = {}, _v) {
		let isObj = isObject(e)
		let eIslTip = isObj ? e.eIslTip ?? e.tip ?? e.efAyrimTipi ?? e.efayrimtipi : e
		let v = isObj ? e.value ?? e.token : _v
		
		let { eIslTip2Token } = this
		eIslTip2Token[eIslTip] = v
		
		let eIslTip2TokenResetTimer = this._eIslTip2TokenResetTimer ??= {}
		clearTimeout(eIslTip2TokenResetTimer[eIslTip])
		eIslTip2TokenResetTimer[eIslTip] = setTimeout(() => {
			try { delete eIslTip2Token[eIslTip] }
			finally { delete eIslTip2TokenResetTimer[eIslTip] }
		} , 600_000)
		
		return this
	}
	
	static async testShow(efayrimtipi = 'E', pstip = 'P', kaysayac = null, seri = null, fisno = null) {
		// 0) bağlam
		if (!kaysayac && fisno) {
			seri ??= '';
			let sent = new MQSent(), { where: wh, sahalar } = sent;
			sent.fromAdd(EYonetici.getPS2Table(pstip));
			wh.degerAta(seri, 'seri').degerAta(fisno, 'no');
			sahalar.add('kaysayac');
			kaysayac = asInteger(await app.sqlExecTekilDeger(sent)) ?? null;
		}
		let recs = [{ pstip, efayrimtipi, kaysayac }];
		let internal = true, eYonetici = (await EYonetici.getEYoneticiListe({ recs }))?.[0];
		let { eConf, eIslSinif } = eYonetici, uuid_old;
		
		// 1) paths
		let rootDir = `${eConf.getAnaBolumFor({ eIslSinif })}\\IMZALI`;
		{
			let sent = new MQSent(), { where: wh, sahalar } = sent;
			sent.fromAdd(EYonetici.getPS2Table(pstip));
			wh.degerAta(kaysayac, 'kaysayac');
			sahalar.add('efatuuid');
			uuid_old = (await app.sqlExecTekilDeger(sent))?.trimEnd();
		}
		// 2) normalize (C14N) → server-side iki çıktı üret (old.c14n.xml / new.c14n.xml)
		let xmlDosya_old = `${rootDir}\\${uuid_old}.xml`;
		let oldC14N = `${rootDir}\\old.c14n.xml`;
		await app.shell(`DEL "${oldC14N}"`);
		await app.shell(`xmllint --c14n "${xmlDosya_old}" > "${oldC14N}"`);
		let oldText = await app.wsDownloadAsStream(oldC14N);

		// 3) XML Kaldır & Oluştur + Yeni Dosyayı belirle
		await eYonetici?.xmlKaldir({ internal });
		let uuid2Result = {}; await eYonetici?.eIslemXMLOlustur({ internal, uuid2Result });
		await new Promise(c => setTimeout(() => c(), 500));
		let uuid_new = keys(uuid2Result)[0];
		let xmlDosya_new = `${rootDir}\\${uuid_new}.xml`;
		
		// 4) normalize (C14N) → server-side iki çıktı üret (old.c14n.xml / new.c14n.xml)
		let newC14N = `${rootDir}\\new.c14n.xml`;
		await app.shell(`DEL "${newC14N}"`);
		await app.shell(`xmllint --c14n "${xmlDosya_new}" > "${newC14N}"`);
		
		// 5) normalize edilmiş xml’leri indir → JS tarafında satır bazlı filtre uygula
		let newText = await app.wsDownloadAsStream(newC14N);
	
		// 6) C14N tek satır olabilir → satırlaştır: '><' → '>\n<'
		let asLines = s => s.replace(/></g, '>\n<').split(/\r?\n/);
		let dropPatterns = [
		  /^<cbc:(UUID|ID)>[0-9a-f-]+<\/cbc:(UUID|ID)>$/i,
		  /^<cbc:IssueTime>/,
		  /^<cbc:EmbeddedDocumentBinaryObject /
		];
		let shouldDrop = line => dropPatterns.some(r => r.test(line.trimStart()));
		let oldData = asLines(oldText).filter(l => !shouldDrop(l)).join('\n');
		let newData = asLines(newText).filter(l => !shouldDrop(l)).join('\n');

		// 7) Diff HTML oluştur
		let diffHtml = await app.diff_html({ data1: oldData, data2: newData });
		
		// 8) HTML’i yeni pencerede aç
		let blob = new Blob([diffHtml], { type: 'text/html; charset=utf-8' });
		let url = URL.createObjectURL(blob); openNewWindow(url);
		setTimeout(() => URL.revokeObjectURL(url), 500_000);
	
		return {
			efayrimtipi, pstip, kaysayac,
			xmlDosya_old, xmlDosya_new,
			/* oldText, newText, */
			diffHtml, url
		}
	}
	static async __ipcTest() {
		let key = 'a', result;
		try {
			await app.wsBrowserIPC({ key });
			await app.wsWebSocket_write({ key, data: `e.callback(await ehConfirm(app.ipcKey))` });
			await new Promise(done => setTimeout(done(), 100));
			result = await app.wsWebSocket_read({ key });
			result = result?.result ?? result;
			console.table(result)
		}
		catch (ex) { console.error(getErrorText(ex)) }
	}
}


/*
	[ efat akıbet toplu update ]
try {
    let uuidList = app.activeWndPart.recs.map(rec => rec.efatuuid ?? rec.uuid);
    if (uuidList?.length) {
        let upd = new MQIliskiliUpdate({ from: 'piffis', where: [`efgonderimts IS NOT NULL`, `efatuuid <> ''`, { inDizi: uuidList, saha: 'efatuuid' }], set: { degerAta: '', saha: 'efatonaydurumu' } });
        console.info({ upd, result: await app.sqlExecNone(upd) })
    }
}
catch (ex) { console.error(ex) }

*/


/*

let bekleyenleriGetir = async ({ eConf, eIslSinif, tarihBS }) => {
	let { tip: efAyrimTipi } = eIslSinif
	eConf ??= MQEConf.instance
	let subDir = eConf.getAnaBolumFor(efAyrimTipi)
	let oe = eConf.getValue('ozelEntegrator')
	if (isObject(oe))
		oe = oe.char
	
	let eIslemAPI = 'gelenBelgeleriGetir'
	let eIslemci = efAyrimTipi
	let { eLogin, eIslEkArgs: ekArgs } = eConf
	eLogin = toJSONStr(eLogin)
	ekArgs = toJSONStr(ekArgs)
	let args = {
		gelen: true,
		eskilerAlinsin: true,
		xmlContentFlag: true,
		tarihBS: {
			basi: dateToString(tarihBS.basi),
			sonu: dateToString(tarihBS.sonu)
		}
	}
	let wsRes = await app.wsEIslemYap({ eIslemci, oe, eIslemAPI, eLogin, ekArgs, args })
	if (isArray(wsRes))
		wsRes = wsRes[0]
	wsRes = wsRes?.results ?? []
	
	let res = []
	for (let { uuid, xmlFileName: localFile, xmlContent } of wsRes) {
		if (!xmlContent) {
			let remoteFile = [subDir, 'ALINAN', localFile]
				.join('/')
				.replaceAll('\\', '/')
			xmlContent = await app.wsDownloadAsStream({ remoteFile, localFile })
		}
		let xml = xmlContent ? $.parseXML(xmlContent)?.documentElement : null
		if (xml)
			res.push({ uuid, eFis: new EFis({ eIslSinif, eConf, xml }) })
	}
	
	return res
}


let gelen = true
let { instance: eConf } = MQEConf
let res = await bekleyenleriGetir({
	eConf,
	eIslSinif: EIslFatura,
	tarihBS: new CBasiSonu({ basi: today().addDays(-5), sonu: today() })
})
await EFis.topluEkBilgileriBelirle(res.map(r => r.eFis))
for (let { eFis, uuid } of res) {
	console.info(eFis, uuid)
	let eYon = new EYonetici({ eConf, eIslSinif: EIslFatura })
	await eYon.eIslemIzle({ gelen, recs: [eFis] })
}
res


*/
