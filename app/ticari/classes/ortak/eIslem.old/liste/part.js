class EIslemListePart extends MasterListePart {
	static get partName() { return 'eIslemListe' }
	constructor(e) { e = e || {}; super(e); $.extend(this, { eConf: e.eConf ?? MQEConf.instance }); this.title = e.title == null ? ( 'e-İşlem Listesi' ) : e.title || '' }
	static async listele(e) {
		e = e || {}; let {eConf} = e; if (!(eConf || app.params.eIslem.kullanim.ozelConf)) { eConf = eConf ?? MQEConf.instance }
		if (!eConf) {
			let promise = new $.Deferred();
			MQEConf.listeEkraniAc({
				secince: e => promise.resolve(e),
				vazgecince: e => promise.reject({ isError: true, rc: 'userAbort' })
			});
			const {mfSinif, rec} = await promise; if (rec) { eConf = new mfSinif(); eConf.setValues({ rec }) }
		}
		const part = new this({ eConf }); return part.run()
	}
	getSecimler(e) { const {eConf} = this; return new EIslemFiltre({ eConf }) }
	islemTuslariDuzenle(e) {
		super.islemTuslariDuzenle(e); const {liste, part} = e;
		liste.unshift(
			{ id: 'eIslemGonder', handler: e => this.eIslemGonderIstendi(e) },
			{ id: 'eIslemIzle', handler: e => this.eIslemIzleIstendi(e) },
			{ id: 'eIslemSorgu', handler: e => this.eIslemSorguIstendi(e) },
			{ id: 'eIslemIptal', handler: e => this.eIslemIptalIstendi(e) }
		);
		$.extend(part.sagButonIdSet, asSet(['eIslemGonder', 'eIslemIzle', 'eIslemSorgu', 'eIslemIptal']))
	}
	gridArgsDuzenleDevam(e) {
		super.gridArgsDuzenleDevam(e); const {args} = e;
		$.extend(args, { columnsHeight: 55, rowsHeight: 45, showGroupsHeader: true, showFilterRow: true, filterMode: 'default', virtualMode: false })
	}
	get defaultTabloKolonlari() {
		const getCSSDuzenleyici = e => {
			e = e || {}; const {ekCSS, duzenleyici} = e;
			return ((sender, rowIndex, belirtec, value, rec) => {
				let result = [belirtec];
				const {efayrimtipi, efatonaydurumu, efatuuid, efgonderimts} = rec;
				if (!$.isEmptyObject(ekCSS)) { const _liste = $.isArray(ekCSS) ? ekCSS : [ekCSS]; result.push(..._liste) }
				if (efayrimtipi != null) result.push(`eIslTip-${efayrimtipi}`)
				if (efatonaydurumu != null) result.push(`akibet-${efatonaydurumu}`)
				if (efgonderimts) result.push('gonderildi')
				if (efatuuid) result.push('hasUUID')
				if (duzenleyici) { const _e = $.extend({}, e, { sender, rowIndex, belirtec, value, rec, result }); getFuncValue.call(this, duzenleyici, _e); result = _e.result }
				return result.join(' ')
			})
		};
		return $.merge(super.defaultTabloKolonlari, [
			new GridKolon({ belirtec: 'eIslTipText', text: 'e-İşlem', genislikCh: 9, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'belgeTipText', text: 'Belge<br/>Tipi', genislikCh: 12, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 7, filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }).tipDate(),
			new GridKolon({ belirtec: 'fisnox', text: 'Belge<br/>No', genislikCh: 16, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'akibetText', text: 'Akıbet', genislikCh: 12, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'efatuuid', text: 'UUID<br/>(ETTN)', genislikCh: 32, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'efgonderimts', text: 'Gönderim<br/>Zamanı', genislikCh: 15, cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'mustText', text: 'Müşteri', filterType: 'checkedlist', cellClassName: getCSSDuzenleyici() }),
			new GridKolon({ belirtec: 'sonucbedel', text: 'Sonuç<br/>Bedel', genislikCh: 14, cellClassName: getCSSDuzenleyici() }).tipDecimal_bedel()
		])
	}
	defaultLoadServerData(e) {
		const _e = $.extend({}, e, { alias: 'fis' }), {secimler} = this, query = _e.query = secimler.getQueryStm(_e);
		return MQCogul.loadServerData_querySonucu(_e).then(recs => { _e.recs = recs; this.loadServerData_veriDuzenle(_e); return _e.recs })
	}
	loadServerData_veriDuzenle(e) {
		const tSec_eIslTip = new EIslemTip(), tSec_akibet = new EIslemOnayDurum(), {secimler} = this, {recs} = e;
		for (const rec of recs) {
			const {efayrimtipi, efatonaydurumu} = rec;
			rec.eIslTipText = (tSec_eIslTip.kaDict[efayrimtipi] || {}).aciklama || efayrimtipi || 'A';
			rec.belgeTipText = secimler.class.getBelgeTipText({ rec: rec });
			rec.akibetText = (tSec_akibet.kaDict[efatonaydurumu] || {}).aciklama || efatonaydurumu;
			rec.mustText = `(<b>${rec.mustkod}</b>) ${rec.birunvan}`
		}
	}
	async eIslemGonderIstendi(e) {
		e = e || {}; const {gridWidget, eConf} = this;
		const recs = this.selectedRecs, _e = $.extend({}, e, { recs }); showProgress(`${recs.length} adet e-İşlem Belgesi gönderiliyor...`);
		try { await EYonetici.eIslemGonder(_e) } catch (ex) { displayMessage(getErrorText(ex), 'e-İşlem Gönder'); throw ex } finally { hideProgress() }
	}
	async eIslemIzleIstendi(e) {
		e = e || {}; const {gridWidget, eConf} = this;
		const recs = this.selectedRecs, _e = $.extend({}, e, { recs }); showProgress(`${recs.length} adet e-İşlem Belgesi için görüntü oluşturuluyor...`);
		try {
			_e.callback = e => {
				const {uuid2Result} = e;
				if (uuid2Result) {
					const getRecs =  e => {
						const recs = [];
						for (const uuid in uuid2Result) {
							const rec = uuid2Result[uuid], _rec = rec.rec;
							recs.push({
								islemZamaniText: rec.islemZamani.toISOString().split('T')[1].replace('Z', '').substr(0, 10), hataText: rec.isError ? 'HATA' : '',
								uuid: uuid, fisNox: (rec.isError ? getErrorText(rec) : _rec.fisnox),  eIslTipText: rec.eIslSinif.sinifAdi, xmlDosya: rec.xmlDosya
							})
						}
						return recs
					};
					let {logPart} = _e;
					if (logPart) { logPart.source = e => getRecs(e); logPart.tazele() }
					else {
						const cellClassName = (sender, rowIndex, belirtec, value, rec) => {
							let result = [];
							if (rec.isError) { result.push('bg-lightred-transparent') }
							result.push(`eIslTip-${rec.eIslTipText}`); return result.join(' ')
						};
						logPart = _e.logPart = new MasterListePart({
							title: `e-İşlem Görüntüleme Sonucu`,
							tabloKolonlari: [
								new GridKolon({ belirtec: 'islemZamaniText', text: 'İşlem Zamanı', genislikCh: 14, cellClassName: cellClassName }),
								new GridKolon({ belirtec: 'hataText', text: 'Hata?', genislikCh: 6, cellClassName: cellClassName }),
								new GridKolon({ belirtec: 'uuid', text: 'UUID', genislikCh: 40, cellClassName: cellClassName }),
								new GridKolon({ belirtec: 'eIslTipText', text: 'e-İşl. Tip', genislikCh: 13, cellClassName: cellClassName }),
								new GridKolon({ belirtec: 'fisNox', text: 'Belge No', genislikCh: 18, cellClassName: cellClassName }),
								new GridKolon({ belirtec: 'xmlDosya', text: 'XML Dosya', cellClassName: cellClassName })
							],
							source: e => getRecs(e)
						});
						logPart.run()
					}
				}
			};
			await EYonetici.eIslemIzle(_e)
		}
		catch (ex) { displayMessage(getErrorText(ex), 'e-İşlem İZLE'); throw ex } finally { hideProgress() }
	}
	async eIslemSorguIstendi(e) {
		e = e || {}; const {gridWidget, eConf} = this;
		const recs = this.selectedRecs, _e = $.extend({}, e, { recs }); showProgress(`${recs.length} adet e-İşlem Belgesi durumu sorgulanıyor...`);
		try {
			_e.callback = e => {
				const {uuid2Result} = e;
				if (uuid2Result) {
					const getRecs =  e => {
						const recs = [];
						for (const uuid in uuid2Result) {
							const rec = uuid2Result[uuid], {efAyrimTipi} = rec, _rec = rec.rec;
							recs.push($.extend({
								islemZamaniText: rec.islemZamani.toISOString().split('T')[1].replace('Z', '').substr(0, 10), hataText: rec.isError ? 'HATA' : '',
								uuid: uuid, fisNox: _rec.fisnox, eIslTipText: EIslemOrtak.getClass({ tip: efAyrimTipi })?.sinifAdi || efAyrimTipi
							}, rec))
						}
						return recs
					};
					let {logPart} = _e;
					if (logPart) { logPart.source = e => getRecs(e); logPart.tazele() }
					else {
						const cellClassName = (sender, rowIndex, belirtec, value, rec) => { if (rec.isError) { return 'bg-lightred-transparent' } };
						logPart = _e.logPart = new MasterListePart({
							title: `e-İşlem Sorgu Sonucu`,
							tabloKolonlari: [
								new GridKolon({ belirtec: 'islemZamaniText', text: 'İşlem Zamanı', genislikCh: 14, cellClassName: cellClassName }),
								new GridKolon({ belirtec: 'hataText', text: 'Hata?', genislikCh: 6, cellClassName: cellClassName }),
								new GridKolon({ belirtec: 'uuid', text: 'UUID', genislikCh: 40, cellClassName: cellClassName }),
								new GridKolon({ belirtec: 'eIslTipText', text: 'e-İşl. Tip', genislikCh: 13, cellClassName: cellClassName }),
								new GridKolon({ belirtec: 'fisNox', text: 'Belge No', genislikCh: 18, cellClassName: cellClassName }),
								new GridKolon({ belirtec: 'code', text: 'Durum', genislikCh: 8, cellClassName: cellClassName }),
								new GridKolon({ belirtec: 'message', text: 'Açıklama', cellClassName: cellClassName }),
								new GridKolon({ belirtec: 'detail', text: 'Detay Bilgi', minWidth: 0, cellClassName: cellClassName })
							],
							source: e => getRecs(e)
						});
						logPart.run()
					}
				}
			};
			await EYonetici.eIslemSorgula(_e)
		}
		catch (ex) { displayMessage(getErrorText(ex), 'e-İşlem Sorgula'); throw ex } finally { hideProgress() }
	}
	async eIslemIptalIstendi(e) {
		e = e || {}; const {gridWidget, eConf} = this;
		const recs = this.selectedRecs, _e = $.extend({}, e, { recs }); showProgress(`${recs.length} adet e-İşlem Belgesi iptal ediliyor...`);
		try { await EYonetici.eIslemIptal(_e) } catch (ex) { displayMessage(getErrorText(ex), 'e-İşlem İPTAL'); throw ex } finally { hideProgress() }
	}
}
