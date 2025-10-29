class MQRAdmin_RaspberryPiPico extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tumKolonlarGosterilirmi() { return true } 
	static get kodListeTipi() { return 'RADMIN_RASP' } static get sinifAdi() { return 'Cihaz Yönetimi: Raspberry Pi Pico' }
	static get tanimlanabilirmi() { return true } static get silinebilirmi() { return true }
	static get tanimUISinif() { return ModelTanimPart } static get ozelTanimIslemi() { return (e => this.ozelTanimla(e)) }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); $.extend(pTanim, {
			ipList: new PInst({ init: () => [] }), tezgahKod: new PInstStr(), tezgahAdi: new PInstStr(),
			hatKod: new PInstStr(), hatAdi: new PInstStr(), durumKod: new PInstStr(),
			code: new PInstStr()
		})
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e);
		let {liste} = e, excludeIdSet = asSet(['yeni', 'kopya', 'izle']);
		liste = e.liste = liste.filter(item => !excludeIdSet[item.id])
		liste.find(item => item.id == 'degistir').id = 'izle'
	}
	static rootFormBuilderDuzenle_listeEkrani({ seder: gridPart, rootBuilder: rfb }) {
		super.rootFormBuilderDuzenle_listeEkrani(...arguments);
		rfb.addStyle(`$elementCSS .islemTuslari button#izle { margin-left: 50px }`)
		/*this.fbd_listeEkrani_addButton(rfb, )
		if (!config.hatKod) {
			this.fbd_listeEkrani_addCheckBox(rfb, 'tumHatlariGoster', 'Tüm Hatları Göster').onAfterRun(e => {
				const {builder} = e, {rootPart, layout} = builder, input = layout.children('input'), {grid, gridWidget} = rootPart, args = rootPart.args = rootPart.args || {};
				input.prop('checked', args.tumHatlariGosterFlag);
				input.on('change', evt => { args.tumHatlariGosterFlag = $(evt.currentTarget).is(':checked'); rootPart.tazeleDefer() })
			})
		}*/
	}
	static rootFormBuilderDuzenle({ sender: tanimPart, rootBuilder: rfb, tanimFormBuilder: formBuilder, inst }) {
		super.rootFormBuilderDuzenle(...arguments);
		formBuilder.addForm('header', () => {
			return $(
			`<div class="parent">
				<div class="item flex-row">
					<div class="sub-item flex-row">
						<div class="etiket">IP</div>
						<div class="veri">${inst.ipList.join(' | ')}</div>
					</div>
					<div class="sub-item flex-row">
						<div class="etiket">Tezgah</div>
						<div class="veri"><span class="kod">${inst.tezgahKod}</span> <span class="adi">${inst.tezgahAdi}</span></div>
					</div>
				</div>
				<div class="item flex-row">
					<div class="sub-item flex-row">
						<div class="etiket">Hat</div>
						<div class="veri"><span class="kod">${inst.hatKod}</span> <span class="adi">${inst.hatAdi}</span></div>
					</div>
					<div class="sub-item flex-row">
						<div class="etiket">Durum</div>
						<div class="veri fs-130">${inst.durumKod}</div>
					</div>
				</div>
			</div>`)
		}).addStyle_fullWH(null, 'max-content')
			.addStyle(...[
				`$elementCSS { line-height: 30px; margin-bottom: 20px }
				 $elementCSS .item { gap: 100px } $elementCSS .item .etiket { width: 70px }
				 $elementCSS .etiket { color: gray } $elementCSS .veri { font-weight: bold; color: royalblue }
				 $elementCSS .kod { color: lightgray }`
			]);
		let fbd_content = formBuilder.addFormWithParent('content').altAlta()
		let form = fbd_content.addFormWithParent().altAlta()
		form.addTextArea('code', 'Python Code').setRows(8)
			.onAfterRun(({ builder: fbd }) => fbd.rootPart.fbd_code = fbd)
		form = fbd_content.addFormWithParent().altAlta().addStyle_wh('var(--full)')
			.addStyle(`$elementCSS { margin-top: 50px }`)
		form.addButton('run', 'ÇALIŞTIR').addCSS('center').addStyle_wh('70%', 80)
			.onClick(_e => this.execActionIstendi({ ..._e, ...arguments[0] }))
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments);
		liste.push(...[
			new GridKolon({ belirtec: 'ip', text: 'IP', genislikCh: 13 }),
			new GridKolon({ belirtec: 'tezgahKod', text: 'Tezgah', genislikCh: 10 }),
			new GridKolon({ belirtec: 'tezgahAdi', text: 'Tezgah Adı', genislikCh: 30 }),
			new GridKolon({ belirtec: 'hatKod', text: 'Hat', genislikCh: 10 }),
			new GridKolon({ belirtec: 'hatAdi', text: 'Hat Adı', genislikCh: 20 }),
			new GridKolon({ belirtec: 'durumKod', text: 'Durum', genislikCh: 13 })
		])
	}
	static async loadServerDataDogrudan({ wsArgs }) {
		let ip2Rec = await app.getTezgahIP2Rec()
		let ipList = (await app.wsWebSocket_conns())?.map(rec => rec.ip)
		return ipList.map(ip => ip2Rec[ip] ?? ({ ip }))
	}
	static async ozelTanimla({ sender: parentPart, islem, mfSinif }) {
		if (!(islem == 'degistir' || islem == 'izle')) { return false }
		let {selectedRecs: recs} = parentPart; if (!recs?.length) { return true }    /* default işleme devam etmesin */
		let ipList = recs.map(rec => rec.ip), inst = new mfSinif({ ...recs[0], ipList });
		let {tanimUISinif} = this, tanimPart = new tanimUISinif({ parentPart, islem, mfSinif, inst });
		await tanimPart.run();
		return true
	}
	static async execActionIstendi({ sender: tanimPart, rfb, inst }) {
		let {sinifAdi: islemAdi} = this, {ipList, code: data} = inst
		if (!ipList?.length)
			throw { errorText: '<b>IP Listesi</b> boş olamaz' }
		if (!data)
			throw { errorText: '<b>Python Code</b> belirtilmelidir' }
		showProgress(`<b>${ipList.length} adet</b> Cihaz ile iletişim kuruluyor...`, islemAdi, true)
		let pm = progressManager; pm.setProgressMax(ipList.length); pm.setProgressValue(0);
		let promises = [], errorsSet = {}, successCount = 0, failCount = 0
		for (let ip of ipList) {
			promises.push(new $.Deferred(async p => {
				try {
					let result = await app.wsSetExecCode({ ip, data })
					successCount++
				}
				catch (ex) {
					let errorText = getErrorText(ex) || 'Cihaz ile iletişim kurulamadı'
					errorsSet[errorText] = true
					failCount++
				}
				finally { p.resolve() }
			}))
		}
		await Promise.allSettled(promises);
		hideProgress(); tanimPart?.fbd_code?.input?.click()
		let result = [];
		if (successCount) { result.push(`<li class=green><b>${successCount} adet</b> Cihaza komut gönderildi</li>`) }
		if (failCount) { result.push(`<li class=red><b>${failCount} adet</b> Cihazda iletişiminde sorun oluştu</li>`) }
		if (!$.isEmptyObject(errorsSet)) { result.push(Object.keys(errorsSet).map(x => `<li class=firebrick><b>HATA:</b> ${x}</li>`)) }
		if (result.length) {
			let text = `<ul>${result.join(CrLf)}</ul>`;
			window[failCount ? 'hConfirm' : 'eConfirm'](text, islemAdi)
		}
	}
}
