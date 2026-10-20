class EYonetici extends CObject {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get eIslTip2Token() {
		let { _eIslTip2Token: res } = this
		if (res === undefined)
			res = this._eIslTip2Token = {}
		return res
	}
	static set eIslTip2Token(value) { this._eIslTip2Token = value }
	get eIslTip() { return this.eIslSinif?.tip }
	get uuidSaha() { return this.gelenmi ? 'efuuid' : 'efatuuid' }
	
	constructor(e = {}) {
		super(e)
		let { parentPart, eConf, gelenmi = e.gelen, filtre = e.secimler, callback, eIslSinif, table2IDListe, whereDuzenleyici } = e
		gelenmi ??= filtre?.gelenmi ?? parentPart?.gelenmi ?? eIslSinif?.gelenmi
		eConf ??= filtre?.eConf ?? parentPart?.eConf ?? MQEConf.getInstance()
		filtre ??= EIslemFiltre[gelenmi ? 'gelenEmpty' : 'gidenEmpty']({ eConf })
		extend(this, { parentPart, filtre, gelenmi, eConf, callback, eIslSinif, table2IDListe, whereDuzenleyici })
	}

	static async mukellefSorgula(e = {}) {
		// Cari kartı, henüz belge oluşturmadan doğrudan VKN sorgulayabilir.
		if (e.vknListe != null || e.vkn != null) {
			let eIslSinif = e.eIslSinif ?? EIslemOrtak.getClass({ tip: e.eIslTip ?? 'E' })
			return new this({ ...e, eIslSinif }).mukellefSorgula(e)
		}
		let res = await this.eIslemListeYap('mukellefSorgula', 'Mükellef Sorgula', e)
		return { ...res, vkn2Result: res?.uuid2Result ?? {} }
	}
	async mukellefSorgula(e = {}) {
		let vknListe = e.vknListe ?? e.vkn
		let dogrudanmi = vknListe != null
		let recs = dogrudanmi ? makeArray(vknListe).map(vkn => ({ _table: 'carmst', vknTckn: String(vkn).trim() })) : undefined
		if (dogrudanmi && !recs.length)
			throw { isError: true, rc: 'emptyArgument', errorText: 'VKN Liste(vknListe) belirtilmelidir' }
		return this.eIslemYap({
			...e, kosul: false,
			...(dogrudanmi ? { stm: false, recs } : {}),
			proc: async ({ table2Recs, eIslSinif, efAyrimTipi, oe, eToken, setToken, eLogin, eIslEkArgs: ekArgs, callback }) => {
				let vkn2Recs = {}, vkn2Result = e.uuid2Result ?? {}
				for (let rec of values(table2Recs).flat()) {
					let vkn = rec.vknTckn?.trim()
					if (vkn)
						(vkn2Recs[vkn] ??= []).push(rec)
				}
				let vknListe = keys(vkn2Recs)
				if (!vknListe.length)
					throw { isError: true, rc: 'emptyVKN', errorText: 'Seçilen belgelerde Vergi veya TC Kimlik No bulunamadı' }
				for (let i = 0; i < vknListe.length; i += 8) {
					let subListe = vknListe.slice(i, i + 8), results = {}, error
					try {
						results = (await app.wsEIslemYap({ eIslemci: efAyrimTipi, oe, eIslemAPI: 'mukellefDurumu', eLogin, eToken, ekArgs: toJSONStr(ekArgs), args: { vknTckn: subListe } }))?.[0] ?? {}
						setToken(results.token)
						eToken = this.class.getTempToken(efAyrimTipi) ?? eToken
					}
					catch (ex) { error = ex }
					for (let vkn of subListe) {
						let result = results[vkn]
						let hata = error ?? (results.isError ? results : null)
						let isError = !!hata || (result?.isError ?? empty(result))
						let message = hata ? getErrorText(hata) : result?.errorText ?? result?.message ?? `${eIslSinif.sinifAdi} ${isError ? 'mükellefi değil' : 'MÜKELLEFİ'}`
						vkn2Result[vkn] = { islemZamani: now(), isError, vkn, efAyrimTipi, message, rec: result, recs: vkn2Recs[vkn] }
					}
					globalThis.progressManager?.progressStep(subListe.length)
					if (callback)
						await getFuncValue.call(this, callback, { ...e, uuid2Result: vkn2Result, vkn2Result })
				}
				return { uuid2Result: vkn2Result, vkn2Result }
			}
		})
	}
	static async eIslemGonder(e) { return this.eIslemListeYap('eIslemGonder', 'e-İşlem Gönder', e) }
	async eIslemGonder(e = {}) {
		return this.eIslemYap({
			...e, autoXML: true, dirCheck: true, kosul: 'uuid',
			proc: async ({ table2Recs, efAyrimTipi, rootDir, uuidSaha, oe, eToken, setToken, eLogin, eIslEkArgs: ekArgs, callback }) => {
				const BlockSize = 20
				let uuid2Result = e.uuid2Result ?? {}
				for (let [table, recs] of entries(table2Recs)) {
					for (let i = 0; i < recs.length; i += BlockSize) {
						let subRecs = recs.slice(i, i + BlockSize)
						let results, error
						try {
							results = await app.wsEIslemYap({
								eIslemci: efAyrimTipi,
								oe, eIslemAPI: 'belgeGonder',
								eLogin, eToken,
								ekArgs: toJSONStr(ekArgs),
								args: subRecs.map(({ 
									uuid, seri, senaryoTipi, fisNox: belgeNox,
									gibAlias: receiverGIBAlias, vknTckn: receiverVKN, eMail
								}) => ({
									uuid, seri, senaryoTipi, belgeNox, receiverGIBAlias, receiverVKN,
									eMails: (
										eMail
											? eMail
												.split(';')
												.map(v => v.trim())
												.filter(v => v.length > 4 && v.includes('@') && v.includes('.'))
											: null
									)
								}))
							})
						}
						catch (ex) { error = ex }
						
						let basariliRecs = []
						for (let j = 0; j < subRecs.length; j++) {
							let rec = subRecs[j]
							let { uuid } = rec
							let result = results?.[j] ?? { isError: true, errorText: error ? getErrorText(error) : 'Gönderim sonucu alınamadı' }
							setToken(result.token)
							
							extend(result, {
								islemZamani: now(), isError: result.isError ?? !result.code,
								message: result.message ?? result.errorText,
								rec, uuid, efAyrimTipi,
								xmlDosya: `${rootDir}\\IMZALI\\${uuid}.xml`
							})
							uuid2Result[uuid] = result
							if (!result.isError)
								basariliRecs.push(rec)
						}
						
						if (basariliRecs.length) {
							let upd = new MQIliskiliUpdate({
								from: table,
								set: ['efgonderimts = GETDATE()']
							}), { where: wh } = upd
							wh
								.inDizi(basariliRecs.map(r => r.id), 'id')
								.inDizi(basariliRecs.map(r => r.uuid), uuidSaha)
							await upd.execute()
						}
						eToken = this.class.getTempToken(efAyrimTipi) ?? eToken
						
						globalThis.progressManager?.progressStep(subRecs.length)
						if (callback)
							await getFuncValue.call(this, callback, { ...e, uuid2Result })
					}
				}
				return { uuid2Result }
			}
		})
	}
	static async eIslemIzle(e) { return this.eIslemYap('eIslemIzle', 'e-İşlem İZLE', e) }
	async eIslemIzle(e) {
		return await this.eIslemYap({
			...e,
			// islemAdi: 'e-İşlem İZLE',
			dirCheck: true, autoXML: true,
			kosul: 'uuid',                            // 'uuid' dolu olan kayıtlar
			proc: async ({
				islemAdi, parentPart, gelenmi, eConf, filtre, table2Recs,
				eIslSinif, efAyrimTipi, rootDir, uuidSaha,
				oe, eToken, eLogin, eIslEkArgs: ekArgs, callback, toplu, internal
			}) => {
				let uuid2Result = {}
				if (!globalThis.XSLTProcessor) {
					showProgress('XSLT İşleyicisi modülü yükleniyor...')
					try { await loadLib_xslt() }
					catch (ex) { cerr(ex) }
					finally { hideProgress() }
				}
				
				let divContainer = toplu ? $(`<div/>`)[0] : null
				let eDocCount = 0
				for (let [tbl, recs] of entries(table2Recs)) {
					for (let r of recs) {
						let { uuid } = r
						let fn = `${uuid}.xml`
						let file = `${rootDir}\\${gelenmi ? 'ALINAN' : 'IMZALI'}\\${fn}`
						let res = uuid2Result[uuid] ??= {}
						extend(res, {
							islemZamani: now(), isError: false, eIslSinif, efAyrimTipi,
							rec: r, anaBolum: rootDir, xmlDosya: file
						})
						try {
							let xmlData = uuid2Result[uuid]?.xmlData
							if (!xmlData)
								xmlData = uuid2Result[uuid].xmlData = await app.wsDownloadAsStream({ remoteFile: file, localFile: fn })
							if (!xmlData)
								throw { isError: true, rc: 'noXML', errorText: 'XML (e-İşlem Belge İçeriği) bilgisi belirlenemedi' }
							
							let xml = $.parseXML(xmlData)
							let docRefs = Array.from(xml.documentElement.querySelectorAll(`AdditionalDocumentReference`))
							
							let xsltData
							;{
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
								// throw null    // API XSLT Debug için
								;(xsltProcessor = new XSLTProcessor()).importStylesheet(xslt)
								eDoc = xsltProcessor.transformToFragment(xml, document)
							}
							catch (ex) {
								xsltProcessor = 'api'
								// let xmlURL = remoteFile
								let data = { xmlData, xsltData }
								let html = await app.wsXSLTTransformAsStream({ data })
								if (html?.trim()) {
									let htmlDoc = new DOMParser().parseFromString(html, 'text/html')
									eDoc = document.createDocumentFragment()
									// Native XSLT sonucu gibi head ve body içeriğini aynı DOM fragment'inde tut.
									for (let node of [...htmlDoc.head.childNodes, ...htmlDoc.body.childNodes])
										eDoc.append(document.importNode(node, true))
								}
							}
							if (!eDoc?.hasChildNodes())
								throw { isError: true, rc: 'xsltTransform', errorText: 'XSLT Görüntüsü oluşturulamadı', source: xsltProcessor }
	
							let _container = toplu ? divContainer : $(`<div/>`)[0]
							if (toplu && eDocCount) {
								let elmPageBreak = $(`
									<div style="float: none">
										<div style="page-break-after: always"></div>
									</div>`
								)[0]
								_container.append(elmPageBreak)
							}
							_container.append(eDoc)
							
							eDocCount++
							extend(res, { xmlData, xml, xsltData, xslt, xsltProcessor, eDoc, divContainer: _container })
							globalThis.progressManager?.progressStep()
							
							if (callback && keys(uuid2Result).length % 201 == 200)
								getFuncValue.call(this, callback, e)
							
							if (!(toplu || internal) && _container) {
								let html = `<html><body>${_container.innerHTML}</body></html>`
								let url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
								openNewWindow(url)
							}
						}
						catch (ex) {
							if (!ex.responseJSON && ex.responseText) {
								try { ex = JSON.parse(ex.responseText) }
								catch (_ex) { }
							}
	
							let errorText = getErrorText(ex)
							extend(res, { isError: true, rc: ex?.rc ?? ex.code ?? '??', errorText, error: ex })
							console.error(ex, errorText)
						}
					}
				}
				callback?.call?.(this, e)
				
				if (!internal && toplu && eDocCount) {
					let newDocHTML = `<html><body>${divContainer.innerHTML}</body></html>`
					let url = URL.createObjectURL(new Blob([newDocHTML], { type: 'text/html' }))
					openNewWindow(url)
				}
		
				return { uuid2Result }
			}
		})
	}
	static async eIslemSorgula(e) { return this.eIslemListeYap('eIslemSorgula', 'e-İşlem Sorgula', e) }
	async eIslemSorgula(e = {}) {
		return this.eIslemYap({
			...e, kosul: 'uuid',
			proc: async ({ table2Recs, gelenmi, uuidSaha, efAyrimTipi, oe, eToken, setToken, eLogin, eIslEkArgs: ekArgs, callback }) => {
				let uuid2Result = e.uuid2Result ?? {}
				for (let [table, recs] of entries(table2Recs)) {
					for (let i = 0; i < recs.length; i += 50) {
						let subRecs = recs.slice(i, i + 50), results, error, subUUID2Result = {}
						try {
							results = await app.wsEIslemYap({
								eIslemci: efAyrimTipi, oe,
								eIslemAPI: 'akibetSorgula', eLogin, eToken,
								ekArgs: toJSONStr(ekArgs),
								args: subRecs.map(({ uuid }) => ({ gelenmi: !!gelenmi, uuid }))
							})
						}
						catch (ex) { error = ex }
						
						for (let j = 0; j < subRecs.length; j++) {
							let rec = subRecs[j]
							let { uuid } = rec
							let result = results?.[j] ?? { isError: true, errorText: error ? getErrorText(error) : 'Sorgulama sonucu alınamadı' }
							setToken(result.token)
							
							let isError = result.isError ?? (result.statusCode == 0 ? false : !result.result)
							extend(result, { islemZamani: now(), isError, message: result.message ?? result.errorText, table, uuid, rec, efAyrimTipi })
							
							uuid2Result[uuid] = subUUID2Result[uuid] = result
						}
						
						await this.eIslemSorgula_sonucIsle({ gelenmi, uuidSaha, subUUID2Result })
						eToken = this.class.getTempToken(efAyrimTipi) ?? eToken
						
						globalThis.progressManager?.progressStep(subRecs.length)
						if (callback)
							await getFuncValue.call(this, callback, { ...e, uuid2Result })
					}
				}
				return { uuid2Result }
			}
		})
	}
	async eIslemSorgula_sonucIsle(e) {
		let uuid2Result = e.subUUID2Result ?? e.uuid2Result ?? {}
		let { gelenmi = this.gelenmi } = e
		let { uuidSaha = this.uuidSaha } = e
		let onaySaha = gelenmi ? 'onaydurumu' : 'efatonaydurumu'
		let toplu = new MQToplu().withDefTrn()
		for (let result of values(uuid2Result)) {
			// Token/iletişim hatası, belgenin gerçek akıbetini değiştirmez
			if (result.isError || result.onayDurumChar == null)
				continue
			
			let { rec, uuid, table = rec?._table } = result
			if (!(table && rec?.id && uuid))
				continue

			let { id } = rec
			let upd = new MQIliskiliUpdate({
				from: table,
				where: [
					{ degerAta: id, saha: 'id' },
					{ degerAta: uuid, saha: uuidSaha }
				],
				set: { degerAta: result.onayDurumChar, saha: onaySaha }
			})
			toplu.add(upd)
		}
		if (!empty(toplu.liste))
			await toplu.execute()
	}
	static async gonderildiDurumAyarla(e) { return this.eIslemListeYap('gonderildiDurumAyarla', 'Gönderildi Durum Ayarla', e) }
	async gonderildiDurumAyarla(e = {}) {
		return this.eIslemYap({ ...e, kosul: false, proc: async ({ table2Recs }) => {
			let { action, ts } = e
			if (!['', 'X', 'T'].includes(action) || (action == 'T' && !(ts instanceof Date && !isNaN(ts))))
				throw { isError: true, errorText: 'Gönderim durumu veya tarihi geçersiz' }
			let tsClause = action == 'X' ? 'COALESCE(efimzats, GETDATE())'.sqlConst() : action == 'T' ? ts : null
			let toplu = new MQToplu().withTrn(), uuid2Result = {}
			for (let [table, recs] of entries(table2Recs)) {
				let upd = new MQIliskiliUpdate({ from: table, set: { degerAta: tsClause, saha: 'efgonderimts' } })
				upd.where.inDizi(recs.map(r => r.id), 'id')
				toplu.add(upd)
				for (let rec of recs)
					uuid2Result[rec.uuid || rec.id] = { rec, isError: false, message: 'Gönderim durumu ayarlandı' }
			}
			if (toplu.liste.length)
				await toplu.execute()
			return { uuid2Result }
		} })
	}
	static async eIslemUUIDDegistir(e) { return this.eIslemListeYap('eIslemUUIDDegistir', 'e-İşlem UUID Değiştir', e) }
	async eIslemUUIDDegistir(e = {}) {
		return this.eIslemYap({ ...e, kosul: false, proc: async ({ table2Recs, uuidSaha }) => {
			let recs = values(table2Recs).flat()
			if (recs.length != 1)
				throw { isError: true, errorText: 'UUID değişimi için tek belge seçilmelidir' }
			let [rec] = recs, uuid = rec.uuid?.toLowerCase() ?? ''
			let newUUID = (await jqxPrompt({ etiket: 'Yeni UUID değerini giriniz', title: 'UUID Değiştir', value: uuid }))?.trim()?.toLowerCase()
			if (!newUUID || newUUID == uuid)
				return { uuid2Result: {} }
			if (!isGUID(newUUID))
				throw { isError: true, errorText: 'Geçerli bir UUID girilmelidir' }
			let upd = new MQIliskiliUpdate({ from: rec._table })
			upd.where.degerAta(rec.id, 'id').degerAta(rec.uuid, uuidSaha)
			upd.set.degerAta(newUUID, uuidSaha).add(`efimzats = NULL`, `efgonderimts = NULL`, `efatonaydurumu = ''`)
			if (rec._table != 'topmakbuzara')
				upd.set.add(`zorunluguidstr = ''`)
			await upd.execute()
			return { uuid2Result: { [newUUID]: { rec, uuid: newUUID, isError: false } } }
		} })
	}
	static async eIslemIptal(e) { return this.eIslemYap('eIslemIptal', 'e-İşlem İPTAL', e) }
	async eIslemIptal(e) {
		return await this.eIslemYap({
			...e,
			// dirCheck: false, autoXML: false,
			kosul: 'uuid',                            // 'uuid' dolu olan kayıtlar
			proc: async ({
				islemAdi, parentPart, gelenmi, eConf, filtre, table2Recs,
				eIslSinif, efAyrimTipi, rootDir, uuidSaha,
				oe, eToken, setToken, eLogin, eIslEkArgs: ekArgs, callback, toplu, internal
			}) => {
				ekArgs = toJSONStr(ekArgs)
				let { progressManager: pm } = globalThis
				let uuid2Result = {}
				for (let [tbl, recs] of entries(table2Recs)) {
					let uuid2Rec = fromEntries(recs.map(r => [r.uuid, r]))
					let uuidListe = keys(uuid2Rec)
					let args = recs.map(({ uuid }) => ({ uuid }))
					
					// SQL Update
					let pr_upd
					;{
						let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
						upd.fromAdd(tbl)
						wh.inDizi(uuidListe, uuidSaha)
						set.add(...[
							`${uuidSaha} = ''`,
							( gelenmi ? null : `efimzats = NULL` ),
							( gelenmi ? null : `efgonderimts = NULL` ),
							( gelenmi ? null : `efatonaydurumu = ''` )
						].filter(Boolean))
						pr_upd = upd.execute()
					}
						
					// XML Dosyaları kaldır
					;{
						let eIslemci = efAyrimTipi
						let apiResults = await app.wsEIslemYap({
							eIslemci, oe,
							eIslemAPI: 'belgeIptal',
							eLogin, eToken,
							ekArgs, args
						}) ?? []
						for (let res of apiResults.filter(r => r.uuid)) {
							let { uuid } = res
							let rec = uuid2Rec[uuid]
							extend(res, { islemZamani: now(), rec, efAyrimTipi })
							uuid2Result[uuid] = res
							setToken?.(res)
							pm?.progressStep()
						}
					}
					await pr_upd
				}

				return { uuid2Result }
			}
		})
	}
	static async eIslemXMLKaldir(e) { return this.eIslemYap('eIslemXMLKaldir', 'e-İşlem XML Kaldır', e) }
	async eIslemXMLKaldir(e) {
		return await this.eIslemYap({
			...e,
			// dirCheck: false, autoXML: false,
			kosul: 'uuid',                            // 'uuid' dolu olan kayıtlar
			proc: async ({
				islemAdi, parentPart, gelenmi, eConf, filtre, table2Recs,
				eIslSinif, efAyrimTipi, rootDir, uuidSaha,
				oe, eToken, setToken, eLogin, eIslEkArgs: ekArgs, callback, toplu, internal
			}) => {
				ekArgs = toJSONStr(ekArgs)
				let { progressManager: pm } = globalThis
				let uuid2Result = {}
				for (let [tbl, recs] of entries(table2Recs)) {
					let uuid2Rec = fromEntries(recs.map(r => [r.uuid, r]))
					let uuidListe = keys(uuid2Rec)
					let args = recs.map(({ uuid }) => ({ uuid }))
					
					// SQL Update
					let pr_upd
					;{
						let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
						upd.fromAdd(tbl)
						wh.inDizi(uuidListe, uuidSaha)
						set.add(...[
							`${uuidSaha} = ''`,
							( gelenmi ? null : `efimzats = NULL` ),
							( gelenmi ? null : `efgonderimts = NULL` ),
							( gelenmi ? null : `efatonaydurumu = ''` )
						].filter(Boolean))
						pr_upd = upd.execute()
					}
						
					// XML Dosyaları kaldır
					;{
						let eIslemci = efAyrimTipi
						let apiResults = await app.wsEIslemYap({
							eIslemci, oe,
							eIslemAPI: 'xmlKaldir',
							eToken: true,            // true: bu işlem için login/token gerekmez
							ekArgs, args
						}) ?? []
						for (let res of apiResults.filter(r => r.uuid)) {
							let { uuid } = res
							let rec = uuid2Rec[uuid]
							extend(res, { islemZamani: now(), rec, efAyrimTipi })
							uuid2Result[uuid] = res
							pm?.progressStep()
						}
					}
					await pr_upd
				}

				return { uuid2Result }
			}
		})
	}
	static async eIslemXMLOlustur(e) {
		let eYoneticiler = await this.getEYoneticiler(e) ?? []
		let uuid2Result = {}
		for (let eYon of eYoneticiler) {
			let args = { ...e }
			let { uuid2Result: res } = await eYon.eIslemXMLOlustur(args) ?? {}
			extend(uuid2Result, res)
		}
		return { eYoneticiler, uuid2Result }
	}
	async eIslemXMLOlustur(e = {}) {
		let { internal } = e
		let { filtre, table2IDListe, eIslTip, eConf, eIslSinif, parentPart, callback } = this

		let recs
		;{
			let { querySinif: cls } = filtre
			let queryci = new cls({ table2IDListe, filtre })
			let stm = queryci.getQuery()
			if (!empty(stm.sent.liste))
				recs = await stm.execSelect()
		}
		if (empty(recs))
			return null

		let rootDir = eConf.getAnaBolumFor(eIslSinif)
		if (!rootDir)
			throw error('e-İşlem için Ana Bölüm belirsizdir')

		let { progressManager: pm } = globalThis
		pm?.setProgressMax((pm?.progressMax || 0) + recs.length)
		
		let yeniTable2IDListe = {}
		let arastirRecs = []
		for (let r of recs) {
			let { _table: tbl, id, uuid } = r
			if (!empty(table2IDListe)) {
				let idListe = table2IDListe[tbl] ?? []
				if (!idListe.includes(id))
					continue
			}
			
			if (!uuid) {
				;(yeniTable2IDListe[tbl] ??= [])
					.push(id)
				continue
			}
			arastirRecs.push(r)
		}
		
		if (!empty(arastirRecs)) {
			let eksikUUID2Dosya = {}
			let eksikDosyaAdiSet = {}
			;arastirRecs.forEach(({ uuid }) => {
				let fn = `${uuid}.xml`
				eksikUUID2Dosya[uuid] = `${rootDir}\\IMZALI\\${fn}`
				eksikDosyaAdiSet[fn] = true
			})
				
			if (!empty(eksikDosyaAdiSet)) {
				// toplu xml dosya kontrol
				let fileNames = keys(eksikDosyaAdiSet)
				let pattern = `${'?'.repeat(newGUID().length)}.xml`
				let args = {
					dir: rootDir, recursive: true,
					includeDirs: false, fileNames,
					pattern
				}
				
				let { recs } = await app.wsDosyaListe({ args }) ?? []
				;recs.forEach(({ name: fn }) => {
					let uuid = fn.split('.')[0].trim()
					delete eksikUUID2Dosya[uuid]
					delete eksikDosyaAdiSet[fn]
				})
			}

			arastirRecs
				.filter(({ uuid }) => eksikUUID2Dosya[uuid])
				.forEach(({ _table: tbl, id }) => {
					;(yeniTable2IDListe[tbl] ??= [])
						.push(id)
				})
		}
		
		let eFisListe = [], uuid2Result = {}
		if (!empty(yeniTable2IDListe)) {
			let table2IDListe = yeniTable2IDListe
			let args = { ...e, table2IDListe, temps: {}, shared: {} }

			let queryci = new EIslemQuery_XML({ table2IDListe })
			let stm = queryci.getQuery()
			// let stm = eIslSinif.getEFisBaslikVeDetayStm(args)
			if (!stm)
				return
			
			let _today = today(), _now = now()
			let recs = await stm.execSelect()
			let table2Id2EFis = args.table2Id2EFis = {}
			let sevRecs = seviyelendirAttrGruplari({ source: recs, attrGruplari: [['_table', 'id']] })
			for (let sev of sevRecs) {
				let { orjBilgi: rec, detaylar } = sev
				if (rec.sevkTarih === undefined)
					delete rec.sevkTarih
				
				let { _table: tbl, id, sevkTarih } = rec
				extend(rec, {
					tarihStr: asReverseDateString(asDate(rec.tarih)),
					sevkTarihStr: asReverseDateString(asDate(sevkTarih) || _today),
					sevkSaatStr: timeToString(asDate(rec.sevkSaat) || _now)
				})
				extend(sev, {
					orjBilgi: new EIslBaslik(rec),
					detaylar: detaylar.map(r => new EIslDetay(r))
				})
				
				let eFis = EIslemOrtak.newFor({ tip: eIslTip, eConf })
				let id2EFis = table2Id2EFis[tbl] ??= {}
				id2EFis[id] = eFis
				
				await eFis.baslikVeDetaylariYukle({
					...args,
					baslik: sev.orjBilgi,
					detaylar: sev.detaylar
				})
			}
			
			await eIslSinif.tipIcinFislerEkDuzenlemeYap(args)
			
			let BlockSize = 100
			let { temps, shared } = args
			for (let [tbl, id2EFis] of entries(table2Id2EFis)) {
				let idListe = keys(id2EFis)
				while (!empty(idListe)) {
					let subList = idListe.splice(0, BlockSize)
					let uuid2SubResult = {}
					let toplu = new MQToplu()
					let updCallback = args.updCallback = ({ query }) => {
						if (query)
							toplu.add(query)
					}
					
					let promises = [], uploadList = []
					let commit = async () => {
						await promiseAll(promises)
						promises = []

						await promiseAll([
							(async () => {
								if (!empty(uploadList)) {
									await app.wsMultiUpload({ data: uploadList })
									uploadList = []
								}
							})(),
							(async () => {
								if (!empty(toplu.liste)) {
									await toplu.execute()
									toplu.liste = []
								}
							})()
						])
					}
					
					for (let id of subList) {
						promises.push(defer(async p => {
							let eFis = id2EFis[id]
							extend(eFis, { temps, shared })
							let { baslik } = eFis, { eIslTip } = baslik
							let uuid
							try {
								/////////////////////////////////////////////////////////
								let xmlStr = await eFis.xmlOlustur({ ...args })
								if (!xmlStr)
									p.resolve()
								/////////////////////////////////////////////////////////
								
								uuid = baslik.uuid
								uuid2Result[uuid] ??= { islemZamani: now(), isError: false, eFis, rec: baslik, efAyrimTipi: eIslTip }
								
								// let uuid2XML = e.uuid2XML = e.uuid2XML || {}; uuid2XML[uuid] = xmlStr
								let xmlDosya = `${rootDir}\\IMZALI\\${uuid}.xml`
								//await app.wsUpload({ remoteFile: xmlDosya, args: xmlStr })
								uploadList.push({ name: xmlDosya, data: Base64.encode(xmlStr) })
								//if (config.dev) { let url = URL.createObjectURL(new Blob([xmlStr], { type: 'application/xml' })); openNewWindow(url) }
							}
							catch (ex) {
								uuid = baslik.uuid || uuid
								let rec = uuid2Result[uuid] ??= { islemZamani: now(), eFis, baslik, efAyrimTipi: eIslTip }
								extend(rec, { isError: true, message: getErrorText(ex) })
								console.error(ex)
							}
							p.resolve()
						}))
						if (promises.length == 1)
							await commit()
					}
					await commit()
					globalThis.progressManager?.progressStep(subList?.length ?? 0)
					try {
						if (callback)
							getFuncValue.call(this, callback, e)
					}
					catch (ex) { }
				}
			}
			if (!internal) {
				if (parentPart?.tazele && !parentPart?.isDestroyed)
					parentPart.tazele()
			}
		}

		return { uuid2Result }
	}

	
	static async alimEIslemSil(e) {
		let eYoneticiler = await this.getEYoneticiler({ ...e }) ?? []
		await promiseAll(
			eYoneticiler.map(eYon =>
				eYon.alimEIslemSil(e))
		)
	}
	async alimEIslemSil(e) {
		let { sender, callback, recs } = e
		let fisSayacListe = recs.map(rec=>rec.fissayac), uuid2Result = e.uuid2Result = e.uuid2Result || {};
		let del = new MQIliskiliDelete({
			from: 'efgecicialfatfis',
			where: { inDizi: fisSayacListe, saha: 'kaysayac' }
		});
		let isError = !(await del.execute())
		for (let rec of recs) {
			let efAyrimTipi = rec.efayrimtipi || 'A', {uuid} = rec;
			let result = { islemZamani: now(), isError, rec, efAyrimTipi };
			uuid2Result[uuid] = result; if (globalThis.progressManager) { globalThis.progressManager.progressStep() }
		}
		if (callback) { getFuncValue.call(this, callback, e) }
		if (!e.internal) { if (sender && !sender.isDestroyed && sender.tazele) { sender.tazele() } }
	}
	
	static async eIslemBekleyenleriGetir(e = {}) {
		let eConf = e.eConf ?? MQEConf.getInstance()
		let eYoneticiler = [EIslFatura, EIslIrsaliye]
			.map(eIslSinif =>
				new EYonetici({ eConf, eIslSinif }))
		
		let uuid2Result = {}
		for (let eYon of eYoneticiler) {
			let args = { ...e }
			await eYon.eIslemBekleyenleriGetir(args)
			extend(uuid2Result, args.uuid2Result)
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
		if (globalThis.progressManager) progressManager.progressMax = (progressManager.progressMax || 0) + (count || 1)
		let eIslAltBolum = eConf.getAnaBolumFor({ efAyrimTipi })
		if (!eIslAltBolum) { throw { isError: true, rc: 'eIslAnaBolumBelirsiz', errorText: 'e-İşlem için Ana Bölüm belirlenemedi' } }
		let BlockSize = 10; let blockSubResults = [];
		let kismiVeriIsleVeBosalt = async _e => {
			try { e.subResults = blockSubResults; await this.bekleyenleriGetir_veriIsle(e) } catch (ex) { console.error('Alım e-İşlem Veri İşle', { BlockSize, blockSubResults, subResults }) }
			if (globalThis.progressManager) { globalThis.progressManager.progressStep(blockSubResults.length) } if (callback) { getFuncValue.call(this, callback, e) } 
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
		let { xmlListe } = e
		if (!xmlListe) {
			let fhList = await showOpenFilePicker({
				multiple: true, excludeAcceptAllOption: true,
				types: [
					{
						accept: { 'application/xml': ['.xml'] },
						description: 'XML Dosyaları'
					}
				]
			})
			if (fhList) {
				xmlListe = e.xmlListe = []
				for (let fh of fhList) {
					let file = await fh.getFile()
					let sr = file.stream().getReader()
					let data = ''
					while (true) {
						let enm = await sr.read()
						data += new TextDecoder().decode(enm.value)
						if (enm.done)
							break
					}
					if (!data)
						continue
					
					let xml = $.parseXML(data)
					xml = xml?.documentElement ?? xml
					xmlListe.push(xml)
				}
			}
		}
		
		let { eConf } = e
		let eIslSiniflar = []
		let eYoneticiler = e.eYoneticiler = [ new EYonetici({ eConf }) ]
		let uuid2Result = {}
		for (let eYon of eYoneticiler) {
			let args = { ...e }
			await eYon.eIslemAlimXMLYukle(args)
			extend(uuid2Result, args.uuid2Result)
		}
		e.uuid2Result = uuid2Result
	}
	async eIslemAlimXMLYukle(e = {}) {
		let BlockSize = 10
		e.eYonetici = this
		let { eConf } = this, { eIslEkArgs } = eConf
		let { callback, xmlListe = [] } = e
		let { count = xmlListe.length } = e
		let { progressManager: pm } = globalThis
		if (pm)
			pm.progressMax = (pm.progressMax || 0) + (count || 1)
		
		let uuid2Result = e.uuid2Result ??= {}
		e.subResults = []
		let kismiVeriIsleVeBosalt = async e => {
			let { subResults } = e
			if (empty(subResults))
				return
			
			try { await this.bekleyenleriGetir_veriIsle(e) }
			catch (ex) {
				console.error('Alım e-İşlem Veri İşle', { blockSize: BlockSize, subResults: { ...subResults } })
			}
			pm?.progressStep(subResults.length)
			callback?.call(this, e)
			e.subResults = []
		}
		
		for (let xml of xmlListe) {
			xml = xml?.documentElement ?? xml
			if (!xml)
				continue
			
			let eFis = new EFis({ xml })
			let { eIslTip: efAyrimTipi, uuid, tarih, fisNox } = eFis
			let xmlDosyaAdi = `${uuid}.xml`
			let eIslAltBolum = eConf.getAnaBolumFor({ efAyrimTipi })
			if (!eIslAltBolum)
				throw { isError: true, rc: 'eIslAnaBolumBelirsiz', errorText: 'e-İşlem için Ana Bölüm belirlenemedi' }
			
			let xmlDosya = `${eIslAltBolum}\\ALINAN\\${xmlDosyaAdi}`
			await app.wsUpload({ remoteFile: xmlDosya, args: _xml?.outerHTML ?? _xml })
			let result = {
				islemZamani: now(), isError: false,
				efAyrimTipi, uuid, tarih, fisNox, eFis
			}
			let { subResults } = e
			subResults.push(result)
			uuid2Result[uuid] = result
			if (subResults.length >= BlockSize)
				await kismiVeriIsleVeBosalt(e)
		}
		await kismiVeriIsleVeBosalt(e)
	}
	static async eIslemAlimTicariFiseDonustur(e = {}) {
		let { eConf } = e
		let eYoneticiler = e.eYoneticiler = [ new EYonetici({ eConf }) ]
		for (let eYon of eYoneticiler)
			await eYonetici.eIslemAlimTicariFiseDonustur({ ...e })
	}
	async eIslemAlimTicariFiseDonustur(e) {
		e.eYonetici = this
		let { eConf } = this, { eIslEkArgs } = eConf
		let { parentPart = e.sender } = e
		let { recs, callback, internal } = e
		let { count = recs.length } = e
		let { progressManager: pm } = globalThis
		if (pm)
			pm.progressMax = (pm.progressMax || 0) + (count || 1)
		
		let uuid2Result = e.uuid2Result ??= {}
		let uuid2Rec = e.uuid2Rec ??= {}
		for (let rec of recs) {
			let { uuid } = rec
			uid2Rec[rec.uuid] = rec
		}
		
		for (let rec of recs) {
			extend(e, { rec })
			uuid2Result[rec.uuid] = await this.eIslemAlimTicariFiseDonustur_tekil(e)
			pm?.progressStep()
			callback?.call(this, e)
		}
		if (!internal) {
			if (parentPart?.tazele && !parentPart?.isDestroyed)
				parentPart.tazele()
		}
	}
	async eIslemAlimTicariFiseDonustur_tekil(e = {}) {
		let wndProgress = progressManager?.wnd
		if (wndProgress?.length)
			wndProgress.hide()
		
		try {
			let {rec} = e, {uuid} = rec, fisNox = rec.fisnox; let result = e.result = { islemZamani: now(), isError: false, uuid, fisNox, rec };
			let islemci = new EAlimTicariyeDonusturucu(e); extend(result, await islemci.ekranOlustur_onBilgi(e) || {});
			if (result?.reason == 'close') return result
			let {varmi, ayrimTipi} = await islemci.belgeKontrol(e);
			if (varmi) { extend(result, { isError: true, message: 'Bu fiş zaten var', detail: ayrimTipi }); return result }
			extend(result, await islemci.fisGirisiYap(e) || {});
			if (result && !result.isError) {
				let upd = new MQIliskiliUpdate({ from: 'efgecicialfatfis', where: { degerAta: uuid, saha: 'efuuid' }, set: `tamamlandi = '*'` });
				await upd.execute()
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
			
			let _result
			try { _result = await toplu?.execResult()?.[0] }
			catch (ex) {
				extend(result, { isError: true, rc: 'sqlError', errorText: getErrorText(ex), error: ex })
				cerr(ex)
			}
			if (_result) {
				_result = _result?.params?.[paramName_fisSayac]
				result.fisSayac = asInteger(_result?.value) || null
			}
		}
		
		if (!e.internal) {
			if (sender?.tazele && !sender.isDestroyed)
				sender.tazele()
		}
	}

	
	static getEYoneticiler(e = {}) {
		let { tip2Table2IDListe, recs } = e
		if (tip2Table2IDListe == null && e.table2IDListe && e.eIslTip != null)
			tip2Table2IDListe = { [e.eIslTip]: e.table2IDListe }
		if (tip2Table2IDListe == null && recs != null)
			tip2Table2IDListe = this.getTip2Table2IDListe(recs)
		
		if (empty(tip2Table2IDListe))
			return []
		
		let { parentPart = e.sender, filtre, gelenmi = e.gelen, eConf, callback, whereDuzenleyici } = e
		let res = []
		for (let [tip, table2IDListe] of entries(tip2Table2IDListe)) {
			let eIslSinif = EIslemOrtak.getClass({ tip, gelen: gelenmi })
			if (!eIslSinif)
				continue

			let args = {
				parentPart, filtre, gelenmi, eIslSinif,
				eConf, callback, table2IDListe, whereDuzenleyici
			}
			res.push(new EYonetici(args))
		}
		
		return res
	}
	static getTip2Table2Recs(e = {}) {
		let { recs = e } = e
		if (!recs)
			return null
		
		let res = {}
		for (let r of recs) {
			let { eIslTip: tip, _table: tbl, id } = r
			tip ||= 'A'
			if (!(tbl && id))
				continue

			let table2IDListe = res[tip] ??= {}
			;(table2IDListe[tbl] ??= [])
				.push(r)
		}
		
		return res
	}
	static getTip2Table2IDListe(e = {}) {
		let { recs = e } = e
		if (!recs)
			return null
		
		let res = {}
		for (let r of recs) {
			let { eIslTip: tip, _table: tbl, id } = r
			tip ||= 'A'
			if (!(tbl && id))
				continue

			let table2IDListe = res[tip] ??= {}
			;(table2IDListe[tbl] ??= [])
				.push(id)
		}
		
		return res
	}
	static getTempToken(e = {}) {
		let eIslTip = e.eIslTip ?? e.tip ?? e.efAyrimTipi ?? e.efayrimtipi ?? e
		return this.eIslTip2Token[eIslTip]
	}
	static setTempToken(e = {}, _v) {
		let isObj = isObject(e)
		let eIslTip = e.eIslTip ?? e.tip ?? e.efAyrimTipi ?? e.efayrimtipi ?? e
		let v = e.value ?? e.token ?? _v
		
		let { eIslTip2Token: t2t } = this
		t2t[eIslTip] = v
		
		let t2RT = this._eIslTip2TokenResetTimer ??= {}
		clearTimeout(t2RT[eIslTip])
		t2RT[eIslTip] = setTimeout(() => {
			try { delete t2t[eIslTip] }
			finally { delete t2RT[eIslTip] }
		} , 600_000)
		
		return this
	}

	static async eIslemListeYap(selector, islemAdi, e = {}) {
		let { parentPart = e.sender, eConf = parentPart?.eConf ?? MQEConf.getInstance() } = e
		let gelenmi = e.gelenmi ?? e.gelen ?? parentPart?.gelenmi
		let filtre = e.filtre ?? EIslemFiltre[gelenmi ? 'gelenEmpty' : 'gidenEmpty']({ eConf })
		let table2IDListe = {}
		for (let map of values(e.tip2Table2IDListe ?? (e.table2IDListe ? { _: e.table2IDListe } : {}))) {
			for (let [table, ids] of entries(map))
				(table2IDListe[table] ??= []).push(...ids)
		}
		if (empty(table2IDListe)) {
			for (let { _table: table, id } of e.recs ?? []) {
				if (table && id)
					(table2IDListe[table] ??= []).push(id)
			}
		}
		let { querySinif } = filtre
		// Yönetici tipi de grid'den değil, kimliklerle yeniden okunan listeden gelir.
		let recs = empty(table2IDListe) ? [] : await new querySinif({ filtre, table2IDListe }).getQuery().execSelect()
		let tip2Table2IDListe = this.getTip2Table2IDListe(recs)
		return this.eIslemYap(selector, islemAdi, { ...e, parentPart, eConf, filtre, gelenmi, recs, tip2Table2IDListe, uuid2Result: {} })
	}
	static async eIslemYap(procOrSelector, islemAdi, ...args) {
		let e = args?.[0] ?? {}
		if (islemAdi !== undefined)
			e.islemAdi = islemAdi
		
		let eYoneticiler = await this.getEYoneticiler({ ...e }) ?? []
		let uuid2Result = e.uuid2Result ?? {}
		for (let eYon of eYoneticiler ?? []) {
			let _e = { ...e, eYonetici: eYon }
			let res = await (
				isFunction(procOrSelector) ? procOrSelector.call(this, _e, ...args.slice(1)) :
				isString(procOrSelector) ? eYon[procOrSelector](...args) :
				procOrSelector
			)
			if (res == null)
				continue

			let { uuid2Result: _uuid2Result } = res
			if (_uuid2Result)
				extend(uuid2Result, _uuid2Result)
		}
		
		return { eYoneticiler, uuid2Result }
	}
	static async eIslemYapAsync(procOrSelector, islemAdi, ...args) {
		let e = args?.[0] ?? {}
		if (islemAdi !== undefined)
			e.islemAdi = islemAdi
		
		let eYoneticiler = await this.getEYoneticiler(e) ?? []
		let promises = []
		for (let eYon of eYoneticiler) {
			promises.push((async () => {
				return await (
					isFunction(procOrSelector) ? procOrSelector.call(eYon, ...args) :
					isString(procOrSelector) ? eYon[procOrSelector](...args) :
					procOrSelector
				)
			})())
		}
		
		return await promiseAll(promises)
	}
	async eIslemYap(e = {}) {
		let { islemAdi, eConf = this.eConf, filtre = this.filtre, uuidSaha = this.uuidSaha } = e
		let { gelenmi = e.gelen ?? this.gelenmi, autoXML, dirCheck, stm, recs } = e
		let { parentPart = this.parentPart, callback = this.callback, toplu, internal, kosul, proc } = e
		if (autoXML && !gelenmi)
			await this.eIslemXMLOlustur({ ...e, internal: true })
		
		let { eIslTip, eIslSinif, table2IDListe } = this
		let rootDir = eConf.getAnaBolumFor({ eIslSinif })
		if (dirCheck && !rootDir)
			throw { isError: true, errorText: 'e-İşlem için Ana Bölüm belirlenemedi' }
		
		;{
			if (isFunction(stm))
				stm = stm.call(this, { ...e, eYonetici: this, table2IDListe })
			else if (stm == null) {
				let { querySinif: cls } = filtre
				let queryci = new cls({ table2IDListe, filtre })
				stm = queryci.getQuery()
			}
		}
		recs = stm ? await stm.execSelect() : recs
		if (empty(recs))
			return null

		if (kosul === undefined)
			kosul = 'uuid'

		let efAyrimTipi = eIslTip || (gelenmi ? 'E' : 'A')
		let table2Recs = {}
		for (let r of recs) {
			if (kosul) {
				let uygunmu = true
				if (isString(kosul)) {
					let k = kosul, not = false
					if (k[0] == '!') {
						k = k.slice(1)
						not = true
					}
					let v = r[k]
					let ok = Boolean(v) != not
					if (!ok)
						continue
				}
				else if (isFunction(kosul) && !(await kosul.call(this, { ...e, rec: r })))
					continue
				else if (isObject(kosul)) {
					let { key: k, not = false } = kosul
					let v = r[k]
					let ok = Boolean(v) != not
					if (!ok)
						continue
				}
			}
			
			let { _table: tbl } = r
			;(table2Recs[tbl] ??= []).push(r)
		}

		if (empty(table2Recs))
			return null

		let { eLogin, eIslEkArgs } = eConf
		let oe = eConf.getValue('ozelEntegrator')
		if (isObject(oe))
			oe = oe.char

		let eToken = this.class.getTempToken(efAyrimTipi) ?? ''
		if (eLogin)
			eLogin = toJSONStr(eLogin)

		let setToken = resOrToken => {
			let _token = resOrToken?.token ?? resOrToken
			if (!(_token == null || eToken == _token)) {
				eToken = _token
				this.class.setTempToken(efAyrimTipi, _token)
			}
		}
		
		let vars = {
			islemAdi, parentPart, gelenmi, filtre,
			eConf, filtre, eIslTip, eIslSinif, efAyrimTipi,
			stm, recs, table2IDListe, table2Recs,
			rootDir, callback, toplu, internal,
			dirCheck, autoXML, kosul, eLogin,
			oe, eToken, setToken, eLogin, eIslEkArgs, uuidSaha
		}
		
		let res = vars
		if (proc)
			res = await proc?.call(this, vars)
		
		if (!internal && parentPart?.tazele && !parentPart?.isDestroyed)
			parentPart.tazele()

		return res
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
        console.info({ upd, result: await upd.execute() })
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
