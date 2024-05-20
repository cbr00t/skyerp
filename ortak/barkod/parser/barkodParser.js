class BarkodParser extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }

	constructor(e) {
		e = e || {};
		super(e);

		this.setGlobals(e)
	}

	static get aciklama() { return '' }
	static getKuralSinif(e) { return BarkodKurali }

	async parse(e) {
		let result = await this.parseDevam(e);
		return result ? await this.parseSonrasi(e) : result
	}

	parseDevam(e) {
		this.setGlobals(e);
		return false
	}

	parseSonrasi(e) {
		let {carpan} = this;
		if (carpan && carpan != 1)
			this.miktar = (this.miktar || 1) * carpan

		/*const {app} = sky;
		const {tip2EkOzellik} = app;
		if (tip2EkOzellik) {
			const uni = new MQUnionAll();
			const stm = new MQStm({ sent: uni });
			for (const tip in tip2EkOzellik) {
				const ekOzellik = tip2EkOzellik[tip];
				const {tipAdi, idSaha, kodsuzmu, mbTable, mbKodSaha, mbAdiSaha} = ekOzellik;
				if (ekOzellik.class.ozellikTip == 'ka' && mbTable && (kodsuzmu ? mbAdiSaha : mbKodSaha)) {
					const value = this[idSaha];
					if (value) {
						const sent = new MQSent({
							from: mbTable,
							where: [{ degerAta: value, saha: kodsuzmu ? mbAdiSaha : mbKodSaha }],
							sahalar: [`'${tip}' tip`, `'${tipAdi}' tipAdi`, `${MQSQLOrtak.sqlDegeri(value)} value`, `COUNT(*) sayi`]
						});
						uni.add(sent)
					}
				}
			}

			if (!$.isEmptyObject(uni.liste)) {
				const recs = await app.sqlExecSelect(stm);
				const hataListe = [];
				for (const rec of recs) {
					if (!_rec.sayi)
						hataListe.push(`<li><b>${_rec.tipAdi}</b> için <u class="bold">${_rec.value}</u> değeri geçersizdir</li>`);
				}
				if (!$.isEmptyObject(hataListe))
					throw { isError: true, rc: 'barkodParseError', errorText: `<ul>${hataListe.join(CrLf)}</ul>` }
			}
		}*/
		
		return true
	}

	setGlobals(e) {
		e = e || {};
		let barkod = e.barkod || this.barkod || this.okunanBarkod;
		if (barkod) {
			const carpan = e.carpan || 1;
			$.extend(this, { okunanBarkod: barkod, barkod: barkod, carpan: carpan })
		}
	}

	async shEkBilgileriBelirle(e) {
		e = e || {};
		let shKod = this.shKod = e.shKod || this.shKod;
		if (!shKod)
			return false

		if (e.basitmi)
			return true
		
		const {fis} = e;
		const brmFiyatSaha = 'satfiyat1';
		// const stokKdvSaha = (e.stokKdvSaha || (fis ? fis.class.kdvHesapKodPrefix_stok : 'sat') || '') + 'kdvhesapkod';
		// const stokKdvDegiskenmiSaha = e.stokKdvDegiskenmiSaha || (fis ? fis.class.stokKdvDegiskenmiSaha : null);
		let sent = new MQSent({
			from: 'stkmst stk',
			/*fromIliskiler: [
				{ from: 'vergihesap kver', iliski: `stk.${stokKdvSaha} = kver.kod` }
			],*/
			where: [
				new MQOrClause([
					{ degerAta: shKod, saha: 'stk.tartireferans' },
					{ degerAta: shKod, saha: 'stk.kod' },
					{ degerAta: '0'   + shKod, saha: `stk.kod`},
					{ degerAta: '00'   + shKod, saha: `stk.kod` },
					{ degerAta: '000'  + shKod, saha: `stk.kod` },
					{ degerAta: '0000' + shKod, saha: `stk.kod` }
				])
			],
			sahalar: [
				'stk.kod shKod', 'stk.aciklama shAdi', 'stk.brm', `stk.${brmFiyatSaha} fiyat`
				/*`kver.kdvorani kdvOrani`,
				`${stokKdvDegiskenmiSaha ? stokKdvDegiskenmiSaha : 'satkdvdegiskenmi'} kdvDegiskenmi`,
				'stk.boyuttipi boyutTipi', 'stk.rbkbedenkategorikod bedenKategoriKod'*/
			]
		});
		const stm = new MQStm({ sent: sent });

		const rec = e.shRec = await app.sqlExecTekil(stm);
		if (!rec)
			return false
		
		for (const key in rec) {
			const value = rec[key];
			if (value != null)
				this[key] = value
		}
		
		return true
	}
}
