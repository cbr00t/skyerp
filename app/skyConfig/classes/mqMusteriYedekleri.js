class MQMusteriYedekleri extends MQDetayli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Sky Müşteri Yedekleri' } static get detaySinif() { return MQMusteriYedekDosyalari } static get tanimUISinif() { return YedeklemeTalebiPart }
	static get kodListeTipi() { return 'MUSTERIYEDEKLERI' } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static get ozelTanimIslemi() { return e => this.tanimla(e) }
	
	constructor(e) { e = e || {}; super(e); this.tanitim = e.tanitim }
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); const {secimler} = e.sender, rfb = e.rootBuilder, layout = rfb.layout = e.layout;
		const fbd_header = rfb.addForm({ id: 'header', layout: layout.children('.header') });
		fbd_header.addNumberInput({ id: 'gunSayi', etiket: 'Gün Sayısı', min: 0, max: 60, value: secimler.gunSayi.value }).degisince(e => {
			const {builder} = e, {rootPart, input} = builder, timerKey = '_timer_gunSayiDegisti';
			clearTimeout(builder[timerKey]);
			builder[timerKey] = setTimeout(() => {
				try {
					input.attr('disabled', ''); rootPart.secimler.gunSayi.value = e.value;
					rootPart.tazele(); setTimeout(() => input.removeAttr('disabled'), 2000)
				}
				finally { delete builder[timerKey] }
			}, 700)
		}).onAfterRun(e => {
			const {builder} = e, {rootPart, layout} = builder; rootPart.fbd_gunSayi = builder;
			setTimeout(() => { const rootLayout = builder.rootPart.layout; rootLayout.css('--header-ek-height', `${layout.height() + 10}px`) }, 0)
		}).addStyle(...[
			e => `$elementCSS { width: 250px !important; margin: 6px 0 }`,
			e => `$elementCSS > label { margin-right: 15px; padding-top: 8px; color: #999 }`,
			e => `$elementCSS > input { width: 100px !important; height: 40px !important }`
		])
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);
		const sec = e.secimler;
		sec.secimTopluEkle({
			sadeceSorunlularmi: new SecimBool({ etiket: 'Sadece Sorunlar' }),
			tanitim: new SecimOzellik({ etiket: 'Tanıtım' }),
			mustUnvan: new SecimOzellik({ etiket: 'Müşteri Ünvan' }),
			gunSayi: new SecimTekilNumber({ etiket: 'Gün Sayı', value: 60 }),
			pattern: new SecimOzellik({ etiket: 'Dosya Deseni' }),
			uyari1: new SecimText({ value: `<div style="color: #999"><span class="bold" style="color: royalblue">BM23*.bw</span> gibi yazınız</div>` })
		})
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e);
		const {rec, result} = e;
		//if (rec.isError)
		//	result.push('bg-lightred-transparent')
	}
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e);
		const {args} = e;
		$.extend(args, { rowsHeight: 90 })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		e.liste.push(...[
			new GridKolon({ belirtec: 'tanitim', text: 'Tanıtım', genislikCh: 36 }),
			new GridKolon({
				belirtec: 'mustUnvan', text: 'Müşteri', genislikCh: 50,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const kod = rec.mustKod;
					const aciklama = rec.mustUnvan;
					value = `<span class="kod bold">(${kod})</span>`;
					if (aciklama)
						value += ` <span class="aciklama">${aciklama}</span>`
					return changeTagContent(html, value)
				}
			}),
			new GridKolon({
				belirtec: 'errorText', text: 'Sorunlar',
				cellClassName: (sender, rowIndex, belirtec, value, rec) => {
					let result = [belirtec];
					if (rec.isError)
						result.push('bold', 'bg-very-lightred')
					return result.join(' ')
				},
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) =>
					changeTagContent(html, `<div style="margin: -33px 0 0 0; padding: 0; line-height: 20px; overflow-y: auto; font-size: 95%">${html}</div>`)
			})
			/*new GridKolon({ belirtec: 'tarih', text: 'Tarih' }).tipDate(),
			new GridKolon({ belirtec: 'relDir', text: 'Klasör' }),
			new GridKolon({ belirtec: 'name', text: 'Dosya Adı' }),
			new GridKolon({ belirtec: 'sizeMB', text: 'Boyut (MB)' }).tipDecimal({ fra: 2 }),
			new GridKolon({ belirtec: 'lastWriteTime', text: 'Son Değiştirme' }).tipDate()*/
		])
	}
	static loadServerData(e) {
		const promise = new $.Deferred();
		const {secimler} = e;
		setTimeout(async e => {
			try {
				const result = await app.tanitimIcinYedekAnalizi($.extend({}, e, {
					tanitimListe: secimler.tanitim.value || '',
					mustUnvan: (secimler.mustUnvan.value || '').replaceAll('*', '%').replaceAll('?', '_'),
					gunSayi: secimler.gunSayi.value,
					pattern: secimler.pattern.value
				}));
				promise.resolve(result[secimler.sadeceSorunlularmi.value ? 'sorunluRecs' : 'recs'])
			}
			catch (ex) { promise.reject(ex) }
		}, 10, e);
		return promise
	}
	static loadServerData_detaylar(e) {
		return this.detaySinif.loadServerData(e)
	}
	static gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e);
		const {sender, grid} = e;
		// grid.jqxGrid('groups', ['tanitim']);
		const {fbd_gunSayi} = sender;
		if (fbd_gunSayi)
			fbd_gunSayi.value = sender.secimler.gunSayi.value
		grid.resize()
	}
	static async tanimla(e) {
		const {islem, rec, sender} = e;
		if (islem == 'sil')
			return null
		const {tanimUISinif} = this;
		if (!tanimUISinif)
			return null
		const tanitim = rec?.tanitim;
		let promise = new $.Deferred();
		const part = new tanimUISinif({
			sender: sender, islem: islem,
			rec: rec, tanitim: tanitim,
			tamamIslemi: e => {
				if (sender && sender.tazele)
					sender.tazele(e)
				if (promise)
					promise.resolve(e)
			},
			kapaninca: e => {
				if (promise)
					promise.resolve(e)
			}
		});
		part.run();
		const result = await promise;
		return { part: part, result: result }
	}
}

class MQMusteriYedekDosyalari extends MQDetay {
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const cellClassName_size = (sender, rowIndex, belirtec, value, rec) => {
			let result = [belirtec];
			if (rec.invalid)
				result.push('bold', 'red')
			return result.join(' ')
		};
		e.liste.push(...[
			new GridKolon({ belirtec: 'relDir', text: 'Klasör', genislikCh: 15 }),
			new GridKolon({
				belirtec: 'name', text: 'Dosya Adı', maxWidth: 50 * katSayi_ch2Px,
				cellClassName: cellClassName_size
			}),
			new GridKolon({
				belirtec: 'sizeKB', text: 'Boyut (KB)', genislikCh: 13,
				cellClassName: cellClassName_size
			}).tipDecimal({ fra: 2 }),
			new GridKolon({ belirtec: 'lastWriteTime', text: 'Son Değiştirme', genislikCh: 18 }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 8 }).tipDate()
		])
	}
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e);
		const {args} = e;
		args.showGroupsHeader = true
	}
	static loadServerData(e) {
		const {parentRec} = e;
		const recs = [];
		const tarih2Files = parentRec?.files || [];
		for (const files of Object.values(tarih2Files))
			recs.push(...files)
		return recs
	}
	static gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e);
		const {sender, grid} = e
		// grid.jqxGrid('groups', ['tarih'])
	}
}
