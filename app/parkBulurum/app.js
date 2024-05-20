class ParkBulurumApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'CYON' }
	get defaultWSPath() { return `${super.superDefaultWSPath}/parkBulurum` }
	async run(e) { await super.run(e) }
	paramsDuzenle(e) { super.paramsDuzenle(e); const {params} = e; $.extend(params, { yerel: MQYerelParam.getInstance() }) }
	getAnaMenu(e) {
		const {dev} = config, items = [
			new FRMenuChoice({ mnemonic: 'CYON', text: 'Cihaz Yönetimi', block: e => MQCihazYonetimi.listeEkraniAc(e) }),
			new FRMenuChoice({ mnemonic: 'YKO', text: 'Yakındaki Otoparklar', block: e => MQYakindakiOtoparklar.tanimla($.extend({}, e, { islem: 'yeni' })) }),
			new FRMenuChoice({ mnemonic: 'REZ', text: `Rezervasyon`, block: e => MQRezervasyon.listeEkraniAc(e) }),
			new FRMenuChoice({ mnemonic: 'PAR', text: `Park İşlemi`, block: e => MQParkIslem.listeEkraniAc(e) }),
			new FRMenuCascade({
				mnemonic: 'TAN', text: 'Tanımlar', items: [
					new FRMenuChoice({ mnemonic: 'MOB', text: 'Mobil Cihazlar', block: e => MQMobil.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'KRT', text: 'Mobil Kartlar', block: e => MQMobilKart.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'CIH', text: 'Cihazlar', block: e => MQCihaz.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'PBL', text: 'Otopark Bölümleri', block: e => MQParkBolum.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'ALN', text: 'Otopark Alanları', block: e => MQAlan.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'SOZ', text: 'Sözleşmeler', block: e => MQSozlesme.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'UCR', text: 'Ücretlendirme', block: e => MQUcretlendirme.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'YER', text: 'Yerleşimler', block: e => MQYerlesim.listeEkraniAc(e) }),
					new FRMenuChoice({ mnemonic: 'NED', text: 'DevreDışı Nedenleri', block: e => MQArizaNedeni.listeEkraniAc(e) })
				].filter(x => !!x)
			})
		].filter(x => !!x);
		return new FRMenu({ items })
	}
	buildAjaxArgs(e) {
		e = e || {}; const {args} = e; if (!args) { return }
		super.buildAjaxArgs(e); const {sonSyncTS} = this; if (sonSyncTS) { args.sonSyncTS = dateTimeToString(sonSyncTS) }
	}
	wsYakindakiOtoparklar(e) { return ajaxPost({ contentType: wsContentTypeVeCharSet, processData: false, url: app.getWSUrl({ api: 'yakindakiOtoparklar', args: e }) }) }
	wsOtoparkCihazlari(e) { return ajaxPost({ contentType: wsContentTypeVeCharSet, processData: false, url: app.getWSUrl({ api: 'otoparkCihazlari', args: e }) }) }
}
