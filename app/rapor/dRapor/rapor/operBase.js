class DRapor_OperBase extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'URETIM' } static get kategoriAdi() { return 'Üretim' }
	static get uygunmu() { return app.params.ticariGenel.kullanim.uretim && !!app.sqlTables?.operemri }
}
class DRapor_OperBase_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	onInit(e) {
		super.onInit(e); let {yatayTip2Bilgi} = DRapor_AraSeviye_Main;
		$.extend(yatayTip2Bilgi, {
			HT: { kod: 'HAT', belirtec: 'hat', text: 'Hat' },
			TZ: { kod: 'TEZGAH', belirtec: 'tezgah', text: 'Tezgah' },
			TZ: { kod: 'OPER', belirtec: 'op', text: 'Operasyon' }
		})
		$.extend(DRapor_AraSeviye_Main, { yatayTip2Bilgi })
	}
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments);
		result
			.addKAPrefix('hat', 'tezgah', 'per', 'stok', 'op')
			.addGrupBasit('HAT', 'Hat', 'hat', DMQHat)
			.addGrupBasit('TEZGAH', 'Tezgah', 'tezgah', DMQTezgah)
			.addGrupBasit('PER', 'Personel', 'per', DMQPersonel)
			.addGrupBasit('STOK', 'Ürün', 'stok', DMQStok)
			.addGrupBasit('FISNOX', 'Belge No', 'fisnox')
			.addGrupBasit('OPER', 'Operasyon', 'op', DMQOperasyon)
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {stm, attrSet} = e, {sent} = stm;
		$.extend(e, { sent }); this.loadServerData_queryDuzenle_ek(e)
	}
	loadServerData_queryDuzenle_ek(e) {
		let {stm, attrSet} = e; for (let sent of stm) {
			let {sahalar, where: wh} = sent; $.extend(e, { sent });
			this.loadServerData_queryDuzenle_gerDetayBagla({ ...e, sent });
			if (attrSet.HAT || attrSet.TEZGAH) { sent.fromIliski('tekilmakina tez', 'gdet.tezgahkod = tez.kod') }
			if (attrSet.STOK) { this.loadServerData_queryDuzenle_formulBagla({ ...e, sent }) }
			for (const key in attrSet) {
				switch (key) {
					case 'HAT':
						sent.fromIliski('ismerkezi hat', 'tez.ismrkkod = hat.kod');
						sahalar.add('hat.kod hatkod', 'hat.aciklama hatadi');
						wh.icerikKisitDuzenle_x({ ...e, belirtec: 'hat', saha: 'hat.kod' });
						break
					case 'TEZGAH':
						let tezgahKodClause = e.tezgahKodClause ?? 'gdet.tezgahkod';
						sahalar.add(`${tezgahKodClause} tezgahkod`, 'tez.aciklama tezgahadi');
						wh.icerikKisitDuzenle_x({ ...e, belirtec: 'tezgah', saha: 'gdet.tezgahkod' });
						break
					case 'PER':
						sent.fromIliski('personel per', 'gdet.perkod = per.kod');
						sahalar.add('gdet.perkod perkod', 'per.aciklama peradi');
						wh.icerikKisitDuzenle_x({ ...e, belirtec: 'personel', saha: 'gdet.perkod' });
						break
					case 'STOK':
						sent.fromIliski('stkmst stk', 'frm.formul = stk.kod');
						sahalar.add('frm.formul stokkod', 'stk.aciklama stokadi');
						wh.icerikKisitDuzenle_stok({ ...e, saha: 'frm.formul' });
						break
					case 'OPER':
						sent.fromIliski('operasyon op', 'oem.opno = op.opno'); sahalar.add('op.opno opkod', 'op.aciklama opadi');
						wh.icerikKisitDuzenle_x({ ...e, belirtec: 'operasyon', saha: 'op.opno' });
						break
					case 'FISNOX':
						sahalar.add('emr.fisnox'); break
				}
			}
		}
	}
	loadServerData_queryDuzenle_operOrtakBagla(e) {
		this.loadServerData_queryDuzenle_emirEkle(e);
		this.loadServerData_queryDuzenle_emirDetayVeOEMBagla(e);
		return this
	}
	loadServerData_queryDuzenle_emirEkle({ stm, sent }) {
		sent = sent ?? stm.sent; sent.fromAdd('isemri emr');
		return this
	}
	loadServerData_queryDuzenle_emirDetayVeOEMBagla({ stm, sent }) {
		sent = sent ?? stm.sent;
		sent.fromIliski('emirdetay edet', 'edet.fissayac = emr.kaysayac');
		sent.fromIliski('operemri oem', 'oem.emirdetaysayac = edet.kaysayac');
		return this
	}
	loadServerData_queryDuzenle_gerDetayBagla({ stm, sent }) {
		sent = sent ?? stm.sent; sent.fromIliski('opergerdetay gdet', 'gdet.fissayac = oem.kaysayac');
		return this
	}
	loadServerData_queryDuzenle_formulBagla({ stm, sent }) {
		sent = sent ?? stm.sent; sent.fromIliski('urtfrm frm', 'frm.kaysayac = edet.formulsayac');
		return this
	}
	loadServerData_queryDuzenle_duraksamaBagla({ stm, sent }) {
		sent = sent ?? stm.sent; sent.fromIliski('makduraksama mdur', 'mdur.opergersayac = gdet.kaysayac');
		return this
	}
}
