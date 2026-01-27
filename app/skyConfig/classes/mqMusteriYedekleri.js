class MQMusteriYedekleri extends MQDetayli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Sky Müşteri Yedekleri' } static get detaySinif() { return MQMusteriYedekDosyalari } static get tanimUISinif() { return YedeklemeTalebiPart }
	static get kodListeTipi() { return 'MUSTERIYEDEKLERI' } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static get ozelTanimIslemi() { return e => this.tanimla(e) }
	
	constructor(e) { e = e || {}; super(e); this.tanitim = e.tanitim }
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); let gridPart = e.gridPart ?? e.sender, {secimler, islemTuslari} = gridPart, rfb = e.rootBuilder, layout = rfb.layout = e.layout;
		let islemTuslari_sol = islemTuslari.children('.sol'); islemTuslari_sol.addClass('flex-row'); let fbd_islemTuslari_sol = rfb.addForm({ id: 'islemTuslari_sol', layout: islemTuslari_sol });
		fbd_islemTuslari_sol.addNumberInput({ id: 'gunSayi', etiket: 'Gün Sayısı', min: 0, max: 60, value: secimler.gunSayi.value }).etiketGosterim_yok()
			.degisince(e => {
				let {builder} = e, {rootPart, input} = builder, timerKey = '_timer_gunSayiDegisti';
				clearTimeout(builder[timerKey]); builder[timerKey] = setTimeout(() => {
					try {
						input.attr('disabled', ''); rootPart.secimler.gunSayi.value = e.value;
						rootPart.tazele(); setTimeout(() => input.removeAttr('disabled'), 2000)
					}
					finally { delete builder[timerKey] }
				}, 700)
			}).onAfterRun(e => {
				let {builder} = e, {rootPart, layout} = builder; rootPart.fbd_gunSayi = builder;
				setTimeout(() => { let rootLayout = builder.rootPart.layout; rootLayout.css('--header-ek-height', `8px`) }, 0)
			}).addCSS('center').addStyle(e => `$elementCSS { width: 250px !important; margin: 5px 0 0 10px } $elementCSS > input { width: 80px !important; height: 40px !important }`)
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); let sec = e.secimler;
		sec.secimTopluEkle({
			sadeceSorunlularmi: new SecimBool({ etiket: 'Sadece Sorunlar' }), tanitim: new SecimOzellik({ etiket: 'Tanıtım' }), mustUnvan: new SecimOzellik({ etiket: 'Müşteri Ünvan' }),
			gunSayi: new SecimTekilNumber({ etiket: 'Gün Sayı', value: 60 }), pattern: new SecimOzellik({ etiket: 'Dosya Deseni' }),
			uyari1: new SecimText({ value: `<div style="color: #999"><span class="bold" style="color: royalblue">BM23*.bw</span> gibi yazınız</div>` })
		})
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); let {args} = e; $.extend(args, { rowsHeight: 80 }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e)
		e.liste.push(...[
			new GridKolon({ belirtec: 'tanitim', text: 'Tanıtım', genislikCh: 36 }),
			new GridKolon({
				belirtec: 'mustUnvan', text: 'Müşteri', genislikCh: 60,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					let {mustKod: kod, mustUnvan: aciklama} = rec
					value = `<span class="kod bold">(${kod})</span>`
					if (aciklama)
						value += ` <span class="aciklama">${aciklama}</span>`
					return changeTagContent(html, value)
				}
			}),
			new GridKolon({
				belirtec: 'errorText', text: 'Sorunlar',
				cellClassName: (sender, rowIndex, belirtec, value, rec) => {
					let result = [belirtec]
					if (rec.isError)
						result.push('bold', 'bg-very-lightred')
					return result.join(' ')
				},
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) =>
					changeTagContent(html, `<div style="margin: -33px 0 0 0; padding: 0; line-height: 20px; overflow-y: auto; font-size: 95%">${html}</div>`)
			})
			/*new GridKolon({ belirtec: 'tarih', text: 'Tarih' }).tipDate(), new GridKolon({ belirtec: 'relDir', text: 'Klasör' }), new GridKolon({ belirtec: 'name', text: 'Dosya Adı' }),
			new GridKolon({ belirtec: 'sizeMB', text: 'Boyut (MB)' }).tipDecimal({ fra: 2 }), new GridKolon({ belirtec: 'lastWriteTime', text: 'Son Değiştirme' }).tipDate()*/
		])
	}
	static loadServerData({ secimler: sec }) {
		let promise = new $.Deferred()
		setTimeout(async e => {
			try {
				let result = await app.tanitimIcinYedekAnalizi($.extend({}, e, {
					tanitimListe: sec.tanitim.value || '', mustUnvan: (sec.mustUnvan.value || '').replaceAll('*', '%').replaceAll('?', '_'),
					gunSayi: sec.gunSayi.value, pattern: sec.pattern.value
				}));
				promise.resolve(result[sec.sadeceSorunlularmi.value ? 'sorunluRecs' : 'recs'])
			}
			catch (ex) { promise.reject(ex) }
		}, 10, e)
		return promise
	}
	static loadServerData_detaylar(e) { return this.detaySinif.loadServerData(e) }
	static gridVeriYuklendi({ grid, sender: { secimler: sec, fbd_gunSayi } }) {
		super.gridVeriYuklendi(...arguments)
		if (fbd_gunSayi)
			fbd_gunSayi.value = sec.gunSayi.value
		grid.resize()
	}
	static async tanimla({ islem, rec, sender }) {
		if (islem == 'sil')
			return null
		let {tanimUISinif} = this
		if (!tanimUISinif)
			return null
		let tanitim = rec?.tanitim, promise = new $.Deferred()
		let part = new tanimUISinif({
			sender, islem, rec, tanitim,
			tamamIslemi: e => {
				sender?.tazele?.(e)
				promise?.resolve(e)
			},
			kapaninca: e =>
				promise?.resolve(e)
		})
		part.run()
		let result = await promise
		return { part, result }
	}
}
class MQMusteriYedekDosyalari extends MQDetay {
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let cellClassName_size = (sender, rowIndex, belirtec, value, rec) => {
			let result = [belirtec]
			if (rec.invalid) { result.push('bold', 'red') }
			return result.join(' ')
		}
		liste.push(...[
			new GridKolon({ belirtec: 'relDir', text: 'Klasör', genislikCh: 15 }),
			new GridKolon({ belirtec: 'name', text: 'Dosya Adı', maxWidth: 50 * katSayi_ch2Px, cellClassName: cellClassName_size }),
			new GridKolon({ belirtec: 'sizeKB', text: 'Boyut (KB)', genislikCh: 13, cellClassName: cellClassName_size }).tipDecimal({ fra: 2 }),
			new GridKolon({ belirtec: 'lastWriteTime', text: 'Son Değiştirme', genislikCh: 18 }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 8 }).tipDate()
		])
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments);
		args.showGroupsHeader = true
	}
	static loadServerData(e) {
		let {parentRec} = e, recs = []
		let tarih2Files = parentRec?.files ?? []
		for (let files of values(tarih2Files))
			recs.push(...files)
		return recs
	}
	static gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e)
	}
}
