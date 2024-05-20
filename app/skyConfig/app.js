class SkyConfigApp extends SkyApp {
	get defaultWSPath() { return `${super.superDefaultWSPath}/yonetim` }
	get wsPath_skyYedekleme() { return `${super.superDefaultWSPath}/skyBulutYedekleme` }
	static get isLoginRequired() { return true }
	get yedekMinSize() { return 10 * 1024 }
	
	constructor(e) {
		e = e || {};
		super(e)
	}
	initLayout(e) {
		this.fetchVioConfig(e);
		super.initLayout(e);
	}
	getAnaMenu(e) {
		const {yetki} = config.session;
		const menu_skyYedekleme = new FRMenuCascade({ mnemonic: 'SY', text: 'Sky Yedekleme' });
		menu_skyYedekleme.items.push(
			new FRMenuChoice({
				mnemonic: 'YT', text: 'Yedekleme Talebi',
				block: e => new YedeklemeTalebiPart().run()
			})
		);
		if (yetki == 'developer' || yetki == 'admin' || yetki == 'admin_readOnly') {
			menu_skyYedekleme.items.push(
				new FRMenuChoice({
					mnemonic: 'MY', text: 'Müşteri Yedekleri',
					block: e => MQMusteriYedekleri.listeEkraniAc(e)
				})
			)
		}
		return new FRMenu({ items: [menu_skyYedekleme] })
	}

	async tanitimIcinYedekListesi(e) {
		e = e || {};
		const args = e.args || {};
		const gunSayi = Math.max((e.gunSayi ?? 2) - 1, 0);
		$.extend(args, {
			/*pattern: '*.bw',*/ recursive: true,
			tarihBasi: dateToString(now().addDays(-gunSayi))
		});
		if (e.pattern)
			args.pattern = e.pattern

		const _recs = (await this.wsTumDosyaListesi(args))?.recs;
		let recs = [];
		let i = 0;
		for (const rec of _recs) {
			for (const key of ['creationTime', 'lastWriteTime', 'lastAccessTime']) {
				let value = rec[key];
				if (typeof value == 'string')
					value = rec[key] = asDate(value)
			}
			rec.seq = i;
			rec.sizeKB = roundToFra(rec.size / (1024), 2);
			rec.sizeMB = roundToFra(rec.size / (1024 * 1024), 2);
			let {relDir} = rec;
			if (relDir) {
				let parts = relDir.split('\\');
				if (!parts.length)
					parts = relDir.split('/')
				if (parts.length) {
					rec.tanitim = parts[0];
					rec.tarih = parts[1];
					relDir = rec.relDir = parts.slice(2).join('/')
				}
			}
			recs.push(rec);
			i++
		}
		recs = recs.sort((a, b) => a.lastWriteTime.getTime() < b.lastWriteTime.getTime() ? 1 : -1);
		return recs
	}
	async tanitimIcinYedekAnalizi(e) {
		e = e || {};
		const {yedekMinSize} = this;
		const args = e.args || {};
		const gunSayi = Math.max((e.gunSayi ?? 60) - 1, 0);
		$.extend(args, {
			/*pattern: '*.bw',*/ recursive: true,
			tarihBasi: dateToString(now().addDays(-gunSayi)),
		});
		for (const key of ['pattern', 'tanitimListe', 'mustUnvan']) {
			const value = e[key];
			if (value)
				args[key] = value
		}

		const _now = now(), _today = today();
		const tanitim2Rec = await app.wsTumYedeklemeTalebiListesi(args);
		const recs = Object.values(tanitim2Rec);
		const tanitim2SorunluRec = {}, sorunluRecs = [];
		// const matchMinCount = Math.max(gunSayi - 1, 1);
		for (const tanitim in tanitim2Rec) {
			const rec = tanitim2Rec[tanitim];
			let kurallar = rec.recs;
			if (kurallar)
				kurallar = rec.recs = kurallar.filter(_rec => _rec.durum != 'silindi')
			
			const errors = rec.errors = [];
			const _tarih2Dosyalar = rec.files || [];
			let tarih2Dosyalar = _tarih2Dosyalar;
			let maxTarih;
			if (_tarih2Dosyalar) {
				const tarihler = Object.keys(_tarih2Dosyalar).sort((a, b) => asReverseDate(a) < asReverseDate(b) ? 1 : -1);
				tarih2Dosyalar = rec.files = [];
				for (const tarihStr of tarihler) {
					let dosyalar = _tarih2Dosyalar[tarihStr];
					if (dosyalar) {
						for (const file of dosyalar) {
							const {size} = file;
							if (file.sizeKB == null)
								file.sizeKB = roundToFra(size / (1024), 2)
							if (file.sizeMB == null)
								file.sizeMB = roundToFra(size / (1024 * 1024), 2)
						}
					}
					tarih2Dosyalar[tarihStr] = dosyalar;
					const tarih = asReverseDate(tarihStr);
					if (!maxTarih || tarih > maxTarih)
						maxTarih = tarih
				}
			}
			const minTarihSayi = (_today - maxTarih) / Date_OneDayNum;
			// const farkGunSayi = tarihler.length - minTarihSayi;
			if (!maxTarih)
				errors.push(`<b>Yedekleme <u class="red">hiç yapılmamış</u>`)
			else if (minTarihSayi > 1)
				errors.push(`<b>Son ${minTarihSayi - 1} gün</b>'e ait <u class="red">eksik yedekleme</u> var`)
			
			let eksikGunSayi = 0, eksikDosyaSayi = 0;
			for (const tarih in tarih2Dosyalar) {
				const dosyalar = tarih2Dosyalar[tarih] || [];
				const dosyaSayi = dosyalar.length;
				// const dbNameSet = asSet(kurallar.map(x => x.db));
				// const kuralSayi = Object.keys(dbNameSet).length;
				const kuralSayi = kurallar.length;
				const farkDosyaSayi = dosyaSayi - kuralSayi;
				if (farkDosyaSayi < 0) {
					eksikGunSayi++;
					eksikDosyaSayi += -farkDosyaSayi;
					errors.push(`<b>${tarih}</b> için <b>${-farkDosyaSayi}</b> dosya <u class="red">eksiktir</u>`)
				}
				let bozukVeyaBosDosyaSayi = 0;
				for (const file of dosyalar) {
					if ((file.size || 0) < yedekMinSize) {
						file.invalid = true;
						bozukVeyaBosDosyaSayi++
					}
				}
				if (bozukVeyaBosDosyaSayi)
					errors.push(`<b>${tarih}</b> için <b>${bozukVeyaBosDosyaSayi}</b> dosya <u class="red">boş veya bozuk</u> olarak yüklenmiş`)
			}
			//if (eksikDosyaSayi)
			//	errors.push(`<b>${eksikGunSayi}</b> gün için <b>${eksikDosyaSayi}</b> dosya <u class="red">eksiktir</u>`)
			
			if (errors.length) {
				rec.isError = true;
				rec.errorText = `<ul class="full-wh flex-row">${errors.map(x => `<li class="item" style="width: 48%; text-wrap: wrap; margin-inline-end: 5px">${x}</li>`).join('')}</ul>`;
				tanitim2SorunluRec[tanitim] = rec;
				sorunluRecs.push(rec)
			}
		}
		return {
			tanitim2Rec: tanitim2Rec, tanitim2SorunluRec: tanitim2SorunluRec,
			recs: recs, sorunluRecs: sorunluRecs
		}
	}

	wsYedeklemeTalebiListesi(e) {
		e = e || {};
		const {args} = e;
		const data = e.data || {};
		delete e.data;
		const url = this.vioMerkez_getWSUrl({ wsPath: this.wsPath_skyYedekleme, api: 'yedeklemeTalebiListesi', args: args });
		return ajaxPost({ timeout: 20000, url: url })
	}
	wsYedeklemeTalebiOlustur(e) {
		e = e || {};
		const {args} = e;
		const data = e.data || {};
		delete e.data;
		const url = this.vioMerkez_getWSUrl({ wsPath: this.wsPath_skyYedekleme, api: 'yedeklemeTalebiOlustur', args: args });
		return ajaxPost({
			timeout: 20000, processData: false, ajaxContentType: wsContentType,
			url: url, data: toJSONStr(data)
		})
	}
	wsTumYedeklemeTalebiListesi(e) {
		e = e || {};
		const data = e.args || {};
		delete e.args;
		const url = this.getWSUrl({ wsPath: this.wsPath_skyYedekleme, api: 'tumYedeklemeTalebiListesi', args: e });
		return ajaxPost({
			timeout: 60000, processData: false, ajaxContentType: wsContentType,
			url: url, data: toJSONStr(data)
		})
	}
	wsTumDosyaListesi(e) {
		e = e || {};
		const data = e.args || {};
		delete e.args;
		const url = this.getWSUrl({ wsPath: this.wsPath_skyYedekleme, api: 'tumDosyaListesi', args: e });
		return ajaxPost({
			timeout: 60000, processData: false, ajaxContentType: wsContentType,
			url: url, data: toJSONStr(data)
		})
	}
}


/*
	const gunSayi = 5;
	const result = await app.tanitimIcinYedekAnalizi({ gunSayi: 5 }) || {};
	console.debug('- tüm yedekleme kayıtları -', { gunSayi: gunSayi });
	if (result.tanitim2Rec)
		console.table(result.tanitim2Rec)
	if (result.sorunluRecs.length) {
		console.warn('- sorunlu yedekleme kayıtları -', { gunSayi: gunSayi });
		console.table(result.sorunluRecs)
	};
	console.debug(result)
*/
