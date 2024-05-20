class MQTahsilSekli extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Tahsil Şekli' }
	static get table() { return 'tahsilsekli' } static get tableAlias() { return 'tsek' } static get kodSaha() { return 'kodno' }
	static get kodListeTipi() { return 'MRTAH' }

	constructor(e) {
		e = e || {}; super(e);
		const kullanim = this.kullanim = new (class extends CIO {
		    static { window[this.name] = this; this._key2Class[this.name] = this }
			static pTanimDuzenle(e) {
				super.pTanimDuzenle(e); const {pTanim} = e;
				$.extend(pTanim, {
					elTerminali: new PInstTrue('elterkullan'), magaza: new PInstBitTrue('bmagazakullan'),
					yazarKasa: new PInstBitTrue('byazarkasakullan'), eTicaret: new PInstTrue('eticaretkullan')
				})
			}
		})(e.kullanim)
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			tip: new PInstTekSecim('tahsiltipi', TahsilSekliTip), altTip: new PInstTekSecim('ahalttipi', TahsilSekliAltTip), kullanimSekli: new PInstStr('kullanimsekli'),
			kasaKod: new PInstStr('kasakod'), hizmetKod: new PInstStr('hizmetkod'),
			mevduatHesapKod: new PInstStr('mevduathesapkod'), posKosulKod: new PInstStr('poskosulkod'), mustKod: new PInstStr('mustkod'),
			sabitYemekBedeli: new PInstNum('sabityemekbedeli'), ekAciklama: new PInstStr('ekaciklama')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e);
		const getAltFormBuilder = e =>
			new FBuilderWithInitLayout($.extend({
				args: (e.args == null ? { tipSet: e.tipSet || asSet(e.tipListe || []) } : e.args),
				visibleKosulu: e =>
					((e.builder.args || {}).tipSet || {})[e.builder.inst.tip.char] ? true : 'jqx-hidden'
				/* buildEk: e => $(`<h5>${e.builder.id} form</h5>`).appendTo(e.builder.layout) */
			}, e));

		const {tanimFormBuilder} = e;
		tanimFormBuilder.add(new FBuilder_TanimFormTabs({ id: 'tabPanel' }).add(
			new FBuilder_TabPage({ id: 'genel', etiket: 'Genel' }).add(
				new FBuilderWithInitLayout().yanYana(2).add(
					new FBuilder_ModelKullan({ id: 'tip', etiket: 'Tip', source: e => TahsilSekliTip.instance.kaListe })
						.dropDown().kodGosterilmesin().noMF()
						.onChange(e => {
							const {builder} = e;
							const builder_tipAltForm = builder.parentBuilder.parentBuilder.id2Builder.tipAltForm;
							for (const builder of builder_tipAltForm.getBuilders())
								builder.updateVisible()
						}),
					new FBuilder_TextInput({ id: 'ekAciklama', etiket: 'Ek Açıklama' })
				),
				new FBuilderWithInitLayout({ id: 'tipAltForm' }).yanYana(2).add(
					getAltFormBuilder({ id: 'nakit', tipListe: ['NK'] }).add(
						new FBuilder_ModelKullan({ id: 'kasaKod', etiket: 'Kasa', mfSinif: MQKasa }).dropDown()
					),
					getAltFormBuilder({ id: 'pos', tipListe: ['PS'] }).add(
						new FBuilder_ModelKullan({ id: 'posKosulKod', etiket: 'POS Koşul', mfSinif: MQPosHesap }).dropDown()
					),
					getAltFormBuilder({ id: 'acikHesap', tipListe: [''] }).add(
						new FBuilder_ModelKullan({ id: 'altTip', etiket: 'Alt Tip', source: e => TahsilSekliAltTip.instance.kaListe })
							.dropDown().kodGosterilmesin().noMF()
					),
					getAltFormBuilder({ id: 'yemekCeki', tipListe: ['', 'YM'] }).add(
						new FBuilder_ModelKullan({ id: 'mustKod', etiket: 'Müşteri', mfSinif: MQCari }).dropDown()
					),
					getAltFormBuilder({ id: 'hizmetGideri', tipListe: ['HZ'] }).add(
						new FBuilder_ModelKullan({ id: 'hizmetKod', etiket: 'Hizmet', mfSinif: MQHizmet }).dropDown()
					),
					getAltFormBuilder({ id: 'gelenHavale', tipListe: ['HV'] }).add(
						new FBuilder_ModelKullan({ id: 'mevduatHesapKod', etiket: 'Banka Hesap', mfSinif: MQBankaHesap }).dropDown()
					)
				)
			)
		))
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);
		const {secimler} = e;
		secimler.grupTopluEkle([ { kod: 'tipIcinTanimlar', aciklama: 'Tip için Tanımlar', kapali: true } ]);
		secimler.secimTopluEkle({
			aktifFlag: new SecimBirKismi({
				etiket: 'Durum',
				kaListe: [
					new CKodVeAdi({ kod: 1, aciklama: 'Aktif olanlar', question: 'aktifmi' }),
					new CKodVeAdi({ kod: 0, aciklama: 'Aktif olmayanlar', question: 'devreDisimi' })
				]
			}),
			tip: new SecimBirKismi({ etiket: 'Tip', tekSecimSinif: TahsilSekliTip }),
			altTip: new SecimBirKismi({ etiket: 'Alt Tip', tekSecimSinif: TahsilSekliAltTip }),
			kullanimSekli: new SecimOzellik({ etiket: 'Kullanım Şekli' }),
			kasaKod: new SecimString({ mfSinif: MQKasa, grupKod: 'tipIcinTanimlar' }),
			kasaAdi: new SecimOzellik({ etiket: 'Kasa Adı', grupKod: 'tipIcinTanimlar' }),
			mevduatHesapKod: new SecimString({ mfSinif: MQBankaHesap, grupKod: 'tipIcinTanimlar' }),
			mevduatHesapAdi: new SecimOzellik({ etiket: 'Hesap Adı', grupKod: 'tipIcinTanimlar' }),
			posKosulKod: new SecimString({ mfSinif: MQPosHesap, grupKod: 'tipIcinTanimlar' }),
			posKosulAdi: new SecimOzellik({ etiket: 'POS Koşul Adı', grupKod: 'tipIcinTanimlar' }),
			mustKod: new SecimString({ mfSinif: MQCari, grupKod: 'tipIcinTanimlar' }),
			mustUnvan: new SecimOzellik({ etiket: 'Müşteri Ünvan', grupKod: 'tipIcinTanimlar' }),
			hizmetKod: new SecimString({ mfSinif: MQHizmet, grupKod: 'tipIcinTanimlar' }),
			hizmetAdi: new SecimOzellik({ etiket: 'Hizmet Adı', grupKod: 'tipIcinTanimlar' })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			if (secimler.aktifFlag.value != null)
				where.birKismi(secimler.aktifFlag.value, `${aliasVeNokta}baktifmi`);
			if (secimler.tip.value != null)
				where.birKismi(secimler.tip.value, `${aliasVeNokta}tahsiltipi`);
			if (secimler.altTip.value != null)
				where.birKismi(secimler.altTip.value, `${aliasVeNokta}ahalttipi`);
			where.ozellik(secimler.kullanimSekli, `${aliasVeNokta}kullanimsekli`);
			
			where.basiSonu(secimler.kasaKod, `${aliasVeNokta}kasakod`);
			where.ozellik(secimler.kasaAdi, `kas.aciklama`);
			where.basiSonu(secimler.mevduatHesapKod, `${aliasVeNokta}mevduathesapkod`);
			where.ozellik(secimler.mevduatHesapAdi, `bhes.aciklama`);
			where.basiSonu(secimler.posKosulKod, `${aliasVeNokta}poskosulkod`);
			where.ozellik(secimler.posKosulAdi, `bkos.aciklama`);
			where.basiSonu(secimler.mustKod, `${aliasVeNokta}mustkod`);
			where.ozellik(secimler.mustUnvan, `car.birunvan`);
			where.basiSonu(secimler.hizmetKod, `${aliasVeNokta}hizmetkod`);
			where.ozellik(secimler.hizmetAdi, `hiz.aciklama`);
		});
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {aliasVeNokta} = this,  {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'baktifmi', text: 'Aktif?', genislikCh: 10, sql: MQSQLOrtak.boolBitClause({ saha: `${aliasVeNokta}baktifmi`, styled: true }) }),
			new GridKolon({ belirtec: 'tahsiltiptext', text: 'Tip', genislikCh: 13, sql: TahsilSekliTip.getClause(`${aliasVeNokta}tahsiltipi`) }),
			new GridKolon({ belirtec: 'ahalttiptext', text: 'Alt Tip', genislikCh: 13, sql: TahsilSekliAltTip.getClause(`${aliasVeNokta}ahalttipi`) }),
			new GridKolon({ belirtec: 'kullanimsekli', text: 'Kullanım Şekli', genislikCh: 10 }),
			new GridKolon({ belirtec: 'kasakod', text: 'Kasa', genislikCh: 10 }),
			new GridKolon({ belirtec: 'kasaadi', text: 'Kasa Adı', genislikCh: 25, sql: 'kas.aciklama' }),
			new GridKolon({ belirtec: 'mevduathesapkod', text: 'Banka Hesap', genislikCh: 13 }),
			new GridKolon({ belirtec: 'mevduathesapadi', text: 'Hesap Adı', genislikCh: 30, sql: 'bhes.aciklama' }),
			new GridKolon({ belirtec: 'poskosulkod', text: 'POS Koşul', genislikCh: 13 }),
			new GridKolon({ belirtec: 'poskosuladi', text: 'POS Koşul Adı', genislikCh: 30, sql: 'bkos.aciklama' }),
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 20 }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Cari Ünvan', genislikCh: 30, sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'hizmetkod', text: 'Hizmet', genislikCh: 10 }),
			new GridKolon({ belirtec: 'hizmetadi', text: 'Hizmet Adı', genislikCh: 25, sql: 'hiz.aciklama' }),
			new GridKolon({ belirtec: 'sabityemekbedeli', text: 'Yemek Bedeli', genislikCh: 20 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'ekaciklama', text: 'Ek Açıklama' }),
		);
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta} = this, {sent} = e;
		sent.fromIliski('kasmst kas', `${aliasVeNokta}kasakod = kas.kod`);
		sent.fromIliski('banbizhesap bhes', `${aliasVeNokta}mevduathesapkod = bhes.kod`);
		sent.fromIliski('poskosul bkos', `${aliasVeNokta}poskosulkod = bkos.kod`);
		sent.fromIliski('carmst car', `${aliasVeNokta}mustkod = car.must`);
		sent.fromIliski('hizmst hiz', `${aliasVeNokta}hizmetkod = hiz.kod`);
		sent.sahalar.add(`${aliasVeNokta}tahsiltipi`, `${aliasVeNokta}ahalttipi`)
		/* sent.where.add(`${aliasVeNokta}baktifmi > 0`) */
	}
}
