class MQDemirbas extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get shTip() { return 'D' } static get hizmetmi() { return true } static get sinifAdi() { return 'Demirbaş' }
	static get table() { return 'demmst' } static get tableAlias() { return 'dem' } static get kodListeTipi() { return 'DEM' }
	static get demirbasmi() { return true } static get ayrimTipKod() { return 'DMAYR' } static get ayrimTableAlias() { return 'dayr' } static get ozelSahaTipKod() { return 'DEM' }
	static get vergiBelirtecler() { return ['kdv'] }
	
	constructor(e) {
		e = e || {};
		super(e);
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		/*$.extend(pTanim, {
			tip: new PInstTekSecim('tip', HizmetTipi),
			grupKod: new PInstStr('grupkod'),
			birimFiyat: new PInstNum('birimfiyat'),
			gelirKdvHesapKod: new PInstStr('gelkdvhesapkod'),
			giderKdvHesapKod: new PInstStr('gidkdvhesapkod')
		});*/
	}

	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);

		const {tanimFormBuilder} = e;
		tanimFormBuilder.add(new FBuilder_TanimFormTabs({ id: 'tabPanel' }).add(
			new FBuilder_TabPage({ id: 'genel', etiket: 'Genel' })
		))
	}

	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);
		
		const {secimler} = e;
		/*secimler.grupTopluEkle([
			{ kod: 'grup', aciklama: 'Grup', renk: '#555', zeminRenk: 'lightgreen' },
		]);
		secimler.secimTopluEkle({
			tip: new SecimBirKismi({
				etiket: 'Tip',
				tekSecimSinif: HizmetTipi
			}),
			grupKod: new SecimString({ mfSinif: MQHizmetGrup, grupKod: 'grup' }),
			grupAdi: new SecimOzellik({ etiket: 'Grup Adı', grupKod: 'grup' })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			where.basiSonu(secimler.grupKod, `${aliasVeNokta}grupkod`);
			where.ozellik(secimler.grupAdi, `hgrp.aciklama`);
			if (secimler.tip.value)
				where.birKismi(secimler.tip.value, `hiz.tip`);
		});
	}

	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		
		const {liste} = e;
		/*liste.push(
			new GridKolon({ belirtec: 'tip', text: 'Tip', genislikCh: 13, sql: HizmetTipi.getClause('hiz.tip') }),
			new GridKolon({ belirtec: 'grupkod', text: 'Grup', genislikCh: 6 }),
			new GridKolon({ belirtec: 'grupadi', text: 'Grup Adı', genislikCh: 25, sql: 'hgrp.aciklama' }),
			new GridKolon({ belirtec: 'birimfiyat', text: 'Fiyat', genislikCh: 18 }).tipDecimal({ fra: 5 }),
			new GridKolon({ belirtec: 'gelkdvoran', text: 'Gel.KDV', genislikCh: 10, sql: 'gelver.kdvorani' }).tipNumerik(),
			new GridKolon({ belirtec: 'gidkdvoran', text: 'Gid.KDV', genislikCh: 10, sql: 'gidver.kdvorani' }).tipNumerik()
		);*/
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		/*sent.fromIliski('hizgrup hgrp', 'hiz.grupkod = hgrp.kod');
		sent.fromIliski('vergihesap gelver', 'hiz.gelkdvhesapkod = gelver.kod');
		sent.fromIliski('vergihesap gidver', 'hiz.gidkdvhesapkod = gidver.kod');*/
	}
}

