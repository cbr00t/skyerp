class DRapor_PerTahakkukRaporuOrtak extends DRapor_BDRaporBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return this == DRapor_PerTahakkukRaporuOrtak }
	static get vioAdim() { return null }
}
class DRapor_PerTahakkukRaporuOrtak_Main extends DRapor_BDRaporBase_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_PerTahakkukRaporuOrtak }
	static get raporDosyaTanimlar() {
		return [
			...super.raporDosyaTanimlar,
			{ belirtec: 'VioPer.RaporEkSaha', section: 'TahRapor-TahDiger' },
			{ belirtec: 'VioPer.RaporEkSaha', section: 'IsvPrimMuaf' }
		]
	}
	secimlerDuzenle({ secimler: sec }) {
		let _today = today()
		sec.grupEkle('donemVeTarih', 'Dönem', false)
		sec.secimTopluEkle({
			yil: new SecimInteger({ etiket: 'Yıl', basiSonu: _today.yil }),
			ay: new SecimInteger({ etiket: 'Ay' })
		})
		super.secimlerDuzenle(...arguments)
		sec.whereBlockEkle(({ secimler, where: wh }) => {
			let {ay: sec_ay} = secimler, {yil: { basi: ylb, sonu: yls } = {}} = secimler
			let {basi: ayb, sonu: ays} = sec_ay
			if (ylb)
				wh.add(`pay.yilay >= (${ylb} * 100 + ${ayb || 0})`)
			if (yls)
				wh.add(`pay.yilay <= (${yls} * 100 + ${ays || 99})`)
			wh.basiSonu(sec_ay, 'dbo.ya2ay(pay.yilay)')
		})
	}
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments)
		result
			// .addKAPrefix('x', 'y')
			.addGrupBasit_numerik('YIL', 'Yıl', 'yil')
			.addGrupBasit_numerik('AY', 'Ay', 'ay')
	}
	loadServerData_queryDuzenle({ attrSet, stm }) {
		let e = arguments[0]
		super.loadServerData_queryDuzenle(e)
		for (let sent of stm) {
			let {where: wh, sahalar} = sent
			sent.fromAdd('pertahodeme pode')
			sent.fromIliski('pertahay pay', 'pode.peraysayac = pay.kaysayac')
			sent.fromIliski('personel per', 'pay.persayac = per.kaysayac')
			wh.add('pay.senaryono IS NULL')
			for (let key in attrSet) {
				switch (key) {
					case 'YIL':
						sahalar.add(`dbo.ya2yil(pay.yilay) yil`)
						break
					case 'AY':
						sahalar.add(`dbo.ya2ay(pay.yilay) ay`)
						break
				}
			}
		}
	}
}

class DRapor_PerTahakkukRaporu extends DRapor_PerTahakkukRaporuOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'PERTAH' } static get aciklama() { return 'Personel Tahakkuk' }
	static get uygunmu() { return app.params?.bGenel?.guleryuzOzel }
	static get vioAdim() { return null }
}
class DRapor_PerTahakkukRaporu_Main extends DRapor_PerTahakkukRaporuOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_PerTahakkukRaporu }
	static get raporDosyaTanimlar() {
		return [...super.raporDosyaTanimlar]
	}
	async ilkIslemler(e) {
		await super.ilkIslemler(e)
		/* ==> araSeviye.js kısmına alındı
		let {class: { raporDosyaTanimlar: dosyaTanimlar }} = this
		dosyaTanimlar ??= []
		{
			let results = await Promise.allSettled(
				dosyaTanimlar.map(({ belirtec, section }) =>
					TabloYapi.raporTanim_parseINI({ belirtec, section }))
			)
			this.iniYapilar = results
				.filter(_ => _.status == 'fulfilled')
				.map(_ => _.value)
		}*/
	}
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments)
		/*result
			.addKAPrefix('x', 'y')
			.addGrupBasit('X', 'X', 'x')  // xkod, xadi
			.addGrupBasit('Y', 'Y', 'y')  // ykod, yadi
			.addGrupBasit('SAHA3', 'Saha 3', 'saha3')
			.addGrupBasit('SAHA4', 'Saha 4', 'saha4')
			.addGrupBasit('SAHA5', 'Saha 5', 'saha5')
			.addGrupBasit('SAHA6', 'Saha 6', 'saha6')
		result
			.addToplamBasit('TOP1', 'Toplanabilir 1', 'top1')
			.addToplamBasit_bedel('TOP2', 'Toplanabilir 2', 'top2')
			.addToplamBasit_bedel('TOP3', 'Toplanabilir 3', 'top3')
			.addToplamBasit('TOP4', 'Toplanabilir 4', 'top4')*/
	}
	loadServerData_queryDuzenle({ attrSet, stm }) {
		super.loadServerData_queryDuzenle(...arguments)
		for (let sent of stm) {
			let {where: wh, sahalar} = sent
			wh.add(`pay.gyuzdonemrefid IS NULL`)
			for (let key in attrSet) {
				switch (key) {
					/*case 'X':
						sahalar.add('tah.xkod', 'x.aciklama xadi')
						break
					case 'Y':
						sahalar.add('tah.ykod', 'y.aciklama yadi')
						break
					case 'SAHA3':
						sahalar.add('tah.saha3')
						break
					case 'SAHA4':
						sahalar.add('tah.saha4')
						break
					case 'SAHA5':
						sahalar.add(`(case when ... end) saha5`)
						break
					case 'SAHA6':
						sahalar.add('... saha6')
						break
					case 'TOP1':
						sahalar.add(`SUM(...) top1`)
						break
					case 'TOP2':
						sahalar.add(`SUM(...) top2`)
						break
					case 'TOP3':
						sahalar.add(`SUM(...) top3`)
						break
					case 'TOP4':
						sahalar.add(`SUM(...) top4`)
						break*/
				}
			}
		}
	}
}

class DRapor_PerTarimTahakkukRaporu extends DRapor_PerTahakkukRaporuOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'TARTAH' } static get aciklama() { return 'Tarım Tahakkuk' }
	static get uygunmu() { return app.params?.bGenel?.guleryuzOzel }
	static get vioAdim() { return null }
}
class DRapor_PerTarimTahakkukRaporu_Main extends DRapor_PerTahakkukRaporuOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_PerTarimTahakkukRaporu }
	static get raporDosyaTanimlar() {
		return [
			...super.raporDosyaTanimlar,
			{ belirtec: 'VioPer.RaporEkSaha', section: 'TahRapor-Tarim' }
		]
	}
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		sec
			.addKA('goFirma', BDMQGOFirma, true)
			.addKA('goBolge', BDMQGOBolge, true)
	}
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments)
		result
			.addKAPrefix('gofirma', 'gobolge')
			.addGrupBasit('GOFIRMA', 'GO Firma', 'gofirma', BDMQGOFirma, null, ({ item }) => item.kodsuz())
			.addGrupBasit('GOBOLGE', 'GO Bölge', 'gobolge', BDMQGOBolge, null, ({ item }) => item.kodsuz())
		/*result
			.addKAPrefix('x', 'y')
			.addGrupBasit('X', 'X', 'x')  // xkod, xadi
			.addGrupBasit('Y', 'Y', 'y')  // ykod, yadi
			.addGrupBasit('SAHA3', 'Saha 3', 'saha3')
			.addGrupBasit('SAHA4', 'Saha 4', 'saha4')
			.addGrupBasit('SAHA5', 'Saha 5', 'saha5')
			.addGrupBasit('SAHA6', 'Saha 6', 'saha6')
		result
			.addToplamBasit('TOP1', 'Toplanabilir 1', 'top1')
			.addToplamBasit_bedel('TOP2', 'Toplanabilir 2', 'top2')
			.addToplamBasit_bedel('TOP3', 'Toplanabilir 3', 'top3')
			.addToplamBasit('TOP4', 'Toplanabilir 4', 'top4')*/
	}
	loadServerData_queryDuzenle({ attrSet, stm }) {
		let e = arguments[0]
		super.loadServerData_queryDuzenle(e)
		for (let sent of stm) {
			let {where: wh, sahalar} = sent
			wh.add(`pay.gyuzdonemrefid IS NOT NULL`)
			for (let key in attrSet) {
				switch (key) {
					case 'GOFIRMA':
						sent.fromIliski('gyuzfirma gfir', 'pay.gyuzfirmaid = gfir.webrefid')
						sahalar.add('pay.gyuzfirmaid gyuzfirmakod', 'gfir.aciklama gyuzfirmaadi')
						break
					case 'GOBOLGE':
						sent.fromIliski('gyuzbolge gbol', 'pay.gyuzbolgeid = gbol.webrefid')
						sahalar.add('pay.gyuzbolgeid gyuzbolgekod', 'gbol.aciklama gyuzbolgeadi')
						break
					/*case 'X':
						sahalar.add('tah.xkod', 'x.aciklama xadi')
						break
					case 'Y':
						sahalar.add('tah.ykod', 'y.aciklama yadi')
						break
					case 'SAHA3':
						sahalar.add('tah.saha3')
						break
					case 'SAHA4':
						sahalar.add('tah.saha4')
						break
					case 'SAHA5':
						sahalar.add(`(case when ... end) saha5`)
						break
					case 'SAHA6':
						sahalar.add('... saha6')
						break
					case 'TOP1':
						sahalar.add(`SUM(...) top1`)
						break
					case 'TOP2':
						sahalar.add(`SUM(...) top2`)
						break
					case 'TOP3':
						sahalar.add(`SUM(...) top3`)
						break
					case 'TOP4':
						sahalar.add(`SUM(...) top4`)
						break*/
				}
			}
		}
	}
}
