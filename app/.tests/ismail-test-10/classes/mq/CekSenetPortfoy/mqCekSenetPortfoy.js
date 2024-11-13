class MQCekSenetPortfoy extends MQKA{
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'CekSenetPortfoy' }
	static get table() { return 'csportfoy' }
	static get tableAlias() { return 'prt' }
	static get kodListeTipi() { return 'CEKSENETPORTFOY' }
	static get zeminRenkDesteklermi() { return false }
	
	
	constructor(e) {
		e = e || {};
		super(e);
	}
	

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			aciklama: new PInstStr('aciklama'),
			dvTipi: new PInstStr('dvtipi'),
			muhHesap: new PInstStr('muhhesap'),
			finAnalizKullanilmaz: new PInstStr('finanalizkullanilmaz'),
			csTip: new PInstTekSecim('cstip', IK_BelgeTipi),
		})
	}
	static formBuildersDuzenle_ka(e) {
		super.formBuildersDuzenle_ka(e);

		const {kaForm} = e;
		const builder_aciklama = kaForm.id2Builder.aciklama;
		if (builder_aciklama)
			builder_aciklama.setVisibleKosulu(false)
	}
	
	
	/*==================Form Düzenlemesi Yaptığımız Kısım=====================*/
	
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		const {tanimFormBuilder} = e;

		let form = tanimFormBuilder.addFormWithParent().yanYana(4);
		
		const checkboxStyle = e => {
			return (
				`$elementCSS > label { color: #888 !important }
				 $elementCSS > input:checked + label { font-weight: bold; color: cadetblue !important }`
			)
		};
		form.addTextInput({id: 'aciklama', etiket: 'Açıklama'}).onAfterRun(e=>e.builder.input.attr('maxlength', 100));
		form.addModelKullan({id: 'dvTipi', etiket: 'Döviz',	mfSinif: MQDoviz}).dropDown().kodsuz();
		//form.addModelKullan({id: 'subeGecerlilik', etiket: 'Şube Geçerlilik', source: e => e.builder.inst.subeGecerlilik.kaListe}).dropDown().kodsuz();
		form.addModelKullan({id: 'muhHesap', etiket: 'Muhasebe Kodu', mfSinif: MQMuhHesap}).dropDown().kodsuz();
		form.addCheckBox({id: 'finAnalizKullanilmaz', etiket: 'Finansal Analizlerde Gösterilir' }).addStyle(checkboxStyle);
		form.addModelKullan({id: 'csTip', etiket: 'Belge Tipi', source: e => e.builder.inst.csTip.kaListe}).noMF().dropDown().kodsuz();
	}
	/*========================================================================*/

	/*====================Filtre Ekranı Yaptığımız Kısım======================*/
	static secimlerDuzenle(e){
		//Burası filtreleme ekranı yaptığımız alan.
		super.secimlerDuzenle(e);
		const {secimler} = e;
	}
	/*========================================================================*/

	/*===================Listeleme Ekranı Yaptığımız Kısım====================*/
	
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		
		const {liste} = e;
		liste.push(
			new GridKolon({belirtec: 'kod', text: 'Kod', genislikCh: 10 }),
			new GridKolon({belirtec: 'aciklama', text: 'Açıklama', genislikCh: 50}),
			new GridKolon({belirtec: 'ozelisaret', text: 'Özel İşaret', genislikCh: 5}),
			new GridKolon({belirtec: 'dvtipi', text: 'Döviz Tipi', genislikCh: 10}),
			new GridKolon({belirtec: 'teminatmi', text: 'Teminat mı?', genislikCh: 5}),
			new GridKolon({belirtec: 'cstip', text: 'CS Tip', genislikCh: 10}),
			new GridKolon({belirtec: 'finanalizkullanilmaz', text: 'Fin. Analiz Kullanılmaz', genislikCh: 5}),
			new GridKolon({belirtec: 'bizsubekod', text: 'Biz. Sube Kod', genislikCh: 10}),
			new GridKolon({belirtec: 'muhhesap', text: 'Muh. Hesap Kod', genislikCh: 10}),
			//new GridKolon({belirtec: 'muhHesap', text: 'Muhasebe Hesap Adı', genislikCh: 20, sql: 'muh.kod'}),
		);
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
	}
	/*========================================================================*/
}

