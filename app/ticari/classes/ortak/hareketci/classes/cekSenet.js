class CSHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { trfCikismi: e.trfCikis ?? e.trfCikismi ?? false }) }
	static get ortakHVYapilar() {
		let {_ortakHVYapilar: result} = this;
		if (result == null) { let e = { result: {} }; this.ortakHVYapilarDuzenle(e); result = this._ortakHVYapilar = e.result }
		return result
	}
	static get ortakUniDuzenleyiciler() {
		let {_ortakUniDuzenleyiciler: result} = this;
		if (result == null) { let e = { result: {} }; this.ortakUniDuzenleyicilerDuzenle(e); result = this._ortakUniDuzenleyiciler = e.result }
		return result
	}
	static ortakHVYapilarDuzenle({ result }) {
		let sqlEmpty = `''`; $.extend(result, {
			belgeOrtak: () => ({
				belsayac: 'bel.kaysayac', belgeyil: 'bel.belgeyil', bankakod: 'bel.bankakod',
				belgeno: 'bel.belgeno', belbanhesapkod: 'bel.banhesapkod'
			}),
			fisOrtak: () => ({
				bizsubekod: 'fis.bizsubekod', tarih: 'fis.tarih', fisnox: 'fis.fisnox', ozelisaret: 'fis.ozelisaret',
				dvkur: 'fis.dvkur', belgetipi: 'fis.belgetipi', fisaciklama: 'fis.aciklama', takipno: 'fis.takipno'
			}),
			sahis3DevirGirisIcinPortfoyBilgileri: () => ({ portfkod: 'bel.devirciranta', portfadi: 'devcir.birunvan', portdvkod: 'devcir.dvkod' }),
			sahis3DevirCikisIcinPortfoyBilgileri: () => ({ portfkod: sqlEmpty, portfadi: sqlEmpty, portdvkod: sqlEmpty }),
			sahis3IsiBittiCikisIcinPortfoyVeAnalizTipi: () => ({
				portftipi: `'C'`, portftiptext: (CSIslemler.getPortfoyTipAdi('C') ?? '').sqlServerDegeri(), portfkisatiptext: (CSIslemler.getPortfoyTipKisaAdi('C') ?? '').sqlServerDegeri(),
				portfkod: 'fis.fisciranta', portfadi: 'fiscar.birunvan', portdvkod: 'fiscar.dvkod', refportftipi: `'X3'`,
				refportftiptext: (CSIslemler.getPortfoyTipAdi('X3') ?? '').sqlServerDegeri(), refportfkisatiptext: (CSIslemler.getPortfoyTipKisaAdi('X3') ?? '').sqlServerDegeri(),
				refportfkod: sqlEmpty, refportfadi: `'3. Şahıs İşi Bitti'`, refportdvkod: sqlEmpty, finanaliztipi: sqlEmpty
			}),
			sahis3IsiBittiGirisIcinPortfoyVeAnalizTipi: ({ cikisAnalizTipi }) => {
				let keys = ['portftipi', 'portftiptext', 'portfkisatiptext', 'portfkod', 'portfadi', 'portdvkod'];
				let result = []; for (let key of keys) {
					let refKey = `ref${key}`;
					result[refKey] = cikisAnalizTipi?.[key];
					result[key] = cikisAnalizTipi?.[refKey]
				}
				result.finanaliztipi = cikisAnalizTipi?.finanaliztipi;
				return result
			}
		})
	}
	static ortakUniDuzenleyicilerDuzenle({ result }) {
		$.extend(result, {
			transfer: ({ cikismi }) => {
				return new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('csfis', 'csdigerhar')
							.fromIliski('csilkhar bel', 'har.ilksayac = bel.kaysayac')
							.pcsPortfoy2DigerBagla();
						let {where: wh} = sent; wh.fisSilindiEkle()
					}).hvDuzenleIslemi(({ hv, sqlEmpty }) => {
						let csIslemler = this.newCSIslemler(); $.extend(hv, {
							fissayac: 'fis.kaysayac', harsayac: 'har.kaysayac', ilk: sqlEmpty,
							ba: (cikismi ? 'A' : 'B').sqlServerDegeri(), bedel: 'har.bedel', dvbedel: 'har.dvbedel',
							detaciklama: 'har.aciklama', bankadekontnox: 'har.bankadekontnox',
							...csIslemler.getPortfoyVeReferansTanimlari(cikismi),
							islemadi: csIslemler.getFisTipiClauseIlkHareket(),
							...this.getOrtakHV('belgeOrtak'), ...this.getOrtakHV('fisOrtak')
						})
					})
			},
			sahis3_isiBitti: ({ cikismi, cikisAnalizDict }) => {
				return new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('csfis', 'csdigerhar')
							.fromIliski('csilkhar bel', 'har.ilksayac = bel.kaysayac')
							.pcsPortfoy2DigerBagla();
						let {where: wh} = sent; wh.fisSilindiEkle();
						wh.inDizi(['AC', 'AS'], 'fis.belgetipi').add(
							`fis.fistipi = '3S'`, `fis.iade = ''`,
							'bel.belgesonharseq = har.belgeharseq', 'bel.vade < getdate()'
						)
					}).hvDuzenleIslemi(({ hv, sqlNull, sqlEmpty }) => {
						let refHV = cikismi ? cikisAnalizDict : this.getOrtakHV('sahis3IsiBittiGirisIcinPortfoyVeAnalizTipi', { cikisAnalizDict });
						$.extend(hv, {
							fissayac: sqlNull, harsayac: sqlNull, ilk: sqlEmpty,
							ba: (cikismi ? 'A' : 'B').sqlServerDegeri(), bedel: 'har.bedel', dvbedel: 'har.dvbedel',
							detaciklama: 'har.aciklama', bankadekontnox: sqlEmpty, bizsubekod: 'fis.bizsubekod',
							tarih: '(bel.vade + 1)', fisnox: sqlEmpty, belgetipi: 'fis.belgetipi',
							...refHV, islemadi: `'3. Şahıs İşi Bitti'`,
							...this.getOrtakHV('belgeOrtak'), ...this.getOrtakHV('fisOrtak')
						})
					})
			},
			sahis3_devirdenIsiBitti: ({ cikismi, cikisAnalizDict }) => {
				return new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fromAdd('csfis fis')
							.fromIliski('csilkhar bel', 'fis.kaysayac = bel.fissayac')
							.pcsPortfoy2DigerBagla();
						let {where: wh} = sent; wh.fisSilindiEkle();
						wh.inDizi(['AC', 'AS'], 'fis.belgetipi').add(
							`fis.fistipi = '3'`, `fis.iade = ''`,
							'bel.belgesonharseq = 0', 'bel.vade < getdate()'
						)
					}).hvDuzenleIslemi(({ hv, sqlNull, sqlEmpty }) => {
						let refHV = cikismi ? cikisAnalizDict : this.getOrtakHV('sahis3IsiBittiGirisIcinPortfoyVeAnalizTipi', { cikisAnalizDict });
						{let ekRefHV = this.getOrtakHV(`sahis3Devir${cikismi ? 'Cikis' : 'Giris'}IcinPortfoyBilgileri`);
							for (let [key, value] of Object.entries(refHV)) { refHV[key] = ekRefHV[key] || value }
						}
						$.extend(hv, {
							fissayac: sqlNull, harsayac: sqlNull, ilk: sqlEmpty,
							ba: (cikismi ? 'A' : 'B').sqlServerDegeri(), bedel: 'har.bedel', dvbedel: 'har.dvbedel',
							detaciklama: 'har.aciklama', bankadekontnox: sqlEmpty, bizsubekod: 'fis.bizsubekod',
							tarih: '(bel.vade + 1)', fisnox: sqlEmpty, belgetipi: 'fis.belgetipi',
							...refHV, islemadi: `'3. Şahıs İşi Bitti'`,
							...this.getOrtakHV('belgeOrtak'), ...this.getOrtakHV('fisOrtak')
						})
					})
			}
		})
	}
    static getOrtakHV(selector, e) { e = e ?? {}; return getFuncValue.call(this, this.ortakHVYapilar[selector], e) }
	static ortakUniDuzenle_sent(selector, e) {    /* e: { sent, ... } */
		e = e ?? {}; let uniBilgi = getFuncValue.call(this, this.ortakUniDuzenleyiciler[selector], e);
		uniBilgi?.sentDuzenle?.(e); return this
	}
	static ortakUniDuzenle_hv(selector, e) {    /* e: { hv, ... } */
		e = e ?? {}; let uniBilgi = getFuncValue.call(this, this.ortakUniDuzenleyiciler[selector], e);
		uniBilgi?.hvDuzenle?.(e); return this
	}
	getOrtakHV(selector, e) { return this.class.getOrtakHV(selector, e) }
	ortakUniDuzenle_sent(selector, e) { return this.class.ortakUniDuzenle_sent(selector, e) }
	ortakUniDuzenle_hv(selector, e) { return this.class.ortakUniDuzenle_hv(selector, e) }
	/** Varsayılan değer atamaları (host vars) – temel sınıfa eklemeler.
		Hareketci.varsayilanHVDuzenle değerleri aynen alınır, sadece eksikler eklenir */
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
        /* super.varsayilanHVDuzenle(...arguments); */
		for (const key of ['ayadi', 'saat', 'bizsubekod', 'bankadekontnox']) { hv[key] = sqlEmpty }
    }
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
		let {trfCikismi} = this; $.extend(e, { trfCikismi }); super.uygunluk2UnionBilgiListeDuzenleDevam(e);
		this.uniDuzenle_transfer(e).uniDuzenle_sahis3(e).uniDuzenle_genelDekont(e)
	}
	uniDuzenle_transfer({ liste, trfCikismi: cikismi }) {
		$.extend(liste, {
			transfer: [
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						this.ortakUniDuzenle_sent('transfer', { sent, cikismi: false });
						if (cikismi) { this.ortakUniDuzenle_sent('transfer', { sent, cikismi: true }) }
					})
					.hvDuzenleIslemi(({ hv, sqlEmpty }) => {
						this.ortakUniDuzenle_hv('transfer', { hv, cikismi: false });
						if (cikismi) { this.ortakUniDuzenle_hv('transfer', { hv, cikismi: true }) }
					})
			]
		});
		return this
	}
	uniDuzenle_sahis3({ liste }) {
		let ortakSelectors = ['sahis3_isiBitti', 'sahis3_devirdenIsiBitti'];
		$.extend(liste, {
			sahis3: [
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => { for (let selector of ortakSelectors) { this.ortakUniDuzenle_sent(selector, { sent, cikismi }) } })
					.hvDuzenleIslemi(({ hv, sqlEmpty }) => { for (let selector of ortakSelectors) { this.ortakUniDuzenle_hv(selector, { sent, cikismi }) } })
			]
		});
		return this
	}
	uniDuzenle_genelDekont({ liste }) {
		$.extend(liste, {
			sahis3: [
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent }) => {
						sent.fisHareket('geneldekontfis', 'geneldekonthar')
							.leftJoin('har', 'csilkhar bel', '1 = 2')
							.leftJoin('bel', 'carmst belcir', 'bel.ciranta = belcir.must')
							.fromIliski('csportfoy prt', 'har.portfkod = prt.kod')
							.fromIliski('banbizhesap bhes', 'har.banhesapkod = bhes.kod');
						let {where: wh} = sent; wh.fisSilindiEkle();
						wh.add(`fis.ozeltip = ''`).inDizi(['PT', 'TC', 'TS', 'BC'], 'har.kayittipi')
					}).hvDuzenleIslemi(({ hv, sqlEmpty }) => {
						let csIslemler = this.newCSIslemler(), refDict = csIslemler.getPortfoyVeReferansTanimlari({ cikismi: false });
						$.extend(hv, {
							bizsubekod: 'fis.bizsubekod', fisnox: 'fis.fisnox', fissayac: 'fis.kaysayac', harsayac: 'har.kaysayac',
							ilk: sqlEmpty, ba: 'har.ba', bedel: 'har.bedel', dvbedel: 'har.dvbedel', dvkur: 'fis.dvkur',
							fisaciklama: 'fis.aciklama', detaciklama: 'har.aciklama', islemadi: `'Genel Dekont'`,
							...this.getOrtakHV('belgeOrtak'), ...this.getOrtakHV('fisOrtak')
						});
						for (let key in refDict) {
							let value = ''; switch (key) {
								case 'portftipi': value = `(case when har.kayittipi = 'PT' then 'P' else 'H' end)`; break
								case 'portfkod': value = `(case when har.kayittipi = 'PT' then har.portfkod else har.banhesapkod end)`; break
								case 'portftiptext': value = (
									`(case har.kayittipi when 'PT' then 'Portföy' when 'TC' then 'Takas Çek' when 'TS' then 'Takas Senet'` +
									 `when 'BC' then 'Borç Çek' else '' end)`
								); break
								case 'portfadi': value = `(case when har.kayittipi = 'PT' then prt.aciklama else bhes.aciklama end)`; break
								case 'portdvkod': value = `(case when har.kayittipi = 'PT' then prt.dvtipi else bhes.dvtipi end)`; break
							}
							hv[key] = value
						}
					})
			]
		});
		return this
	}
	static newCSIslemler(e) { return new CSIslemler(e) }
	newCSIslemler(e) { return this.class.newCSIslemler(e) }
	trfCikis() { this.trfCikismi = true; return this }
}
