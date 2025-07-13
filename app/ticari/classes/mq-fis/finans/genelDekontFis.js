class GenelDekontFis extends FinansFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'geneldekontfis' }
	static get detaySinif() { return GenelDekontDetay } static get gridKontrolcuSinif() { return GenelDekontGridci }
	static get numTipKod() { return 'GENDEK' }
	static extYapilarDuzenle({ liste }) {
		super.extYapilarDuzenle(...arguments);
		liste.push(ExtFis_MuhIslem)
	}
	static rootFormBuilderDuzenle_ilk(e) {
		let {builders: baslikFormlar} = e.builders.baslikForm; baslikFormlar[0].yanYana(3);
		super.rootFormBuilderDuzenle_ilk(e)
	}
	static rootFormBuilderDuzenle_son({ builders }) {
		let {builders: baslikFormlar} = builders.baslikForm; super.rootFormBuilderDuzenle_son(...arguments);
		let form = baslikFormlar[1];
		form.addModelKullan('ozelIsaret', 'Özel İşaret').dropDown().kodsuz()
			.setMFSinif(MQOzelIsaret).addStyle_wh(150)
	}
	static secimlerDuzenleIlk({ secimler: sec }) {
		super.secimlerDuzenleIlk(...arguments);
		sec.secimTopluEkle({ ozelIsaret: new SecimBirKismi({ etiket: 'Özel İşaret', mfSinif: MQOzelIsaret }) })
		sec.whereBlockEkle(({ where: wh, secimler: sec }) => {
			let {aliasVeNokta} = this;
			wh.birKismi(sec.ozelIsaret, `${aliasVeNokta}ozelisaret`)
		})
	}
	static standartGorunumListesiDuzenle_son({ liste }) {
		super.standartGorunumListesiDuzenle_son(...arguments)
		// liste.push('fisaciklama')
	}
	static orjBaslikListesiDuzenle_son({ liste }) {
		super.orjBaslikListesiDuzenle_son(...arguments); let {aliasVeNokta} = this;
		// liste.push(new GridKolon({ belirtec: 'fisaciklama', text: 'Fiş Açıklama', genislikCh: 50, sql: 'fis.aciklama' }))
	}
}
class GenelDekontDetay extends FinansDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'geneldekonthar' } static get ticMustKullanilirmi() { return true }
	static get mfExtSinifYapilari() { return [] }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			ba: new PInstTekSecim('ba', BorcAlacak),
			gdvKod: new PInstStr(), cdvKod: new PInstStr(),
			dvBedel: new PInstNum('dvbedel'), bedel: new PInstNum('bedel'),
			aciklama: new PInstStr('aciklama')
		})
	}
	setValues({ rec }) {
		super.setValues(...arguments);
		this.setValues_dvKod(...arguments)
	}
	setValues_dvKod({ rec }) {
		/* cari için özel atama var */
		let {mfExtSinifYapilari} = this;
		for (let {belirtec} of mfExtSinifYapilari)
		for (let gc of ['g', 'c']) {
			let ioAttr = `${gc}dvKod`, rowAttr = `${gc}${belirtec}_dvkod`;
			this[ioAttr] = rec[rowAttr] || ''
		}
	}
	static getGridciTabloKolonlari_ek({ dvKodBelirtec: belirtec, dvKodEtiket: text }) { 
		return [ new GridKolon({ belirtec, text, genislikCh: 13 }).readOnly() ]
	}
	static asilColDef_stmDuzenle({ sent, alias, dvKodRowAttr }) {
		let {sahalar} = sent;
		sahalar.add(`${alias}.${dvKodRowAttr} dvkod`)
	}
	static async asilColDef_degisince({ gc, rec, gridWidget, rowIndex }) {
		/* cari için farklıdır */
		rec = await rec;
		gridWidget.setcellvalue(rowIndex, `${gc}dvKod`, rec.dvkod || '')
	}
	static extYapilarDuzenle({ liste }) {
		let {mfExtSinifYapilari} = this, extYapiSiniflar = [];
		for (let cikismi of [false, true]) {
			for (let yapi of mfExtSinifYapilari) {
				let {prefix} = yapi; $.extend(yapi, {
					gc: cikismi ? 'c' : 'g', gcAdi: cikismi ? 'Çıkış' : 'Giriş',
					className: `${prefix}_${cikismi ? 'Cikis' : 'Giris'}`
				});
				extYapiSiniflar.push(this.getMFExtClass(yapi))
			}
		}
		liste.push(...extYapiSiniflar);
		super.extYapilarDuzenle(...arguments)
	}
	static getMFExtClass({ className, gc, gcAdi, belirtec, ioAttr, ioAdiAttr, rowAttr, rowAdiAttr, etiket, mfSinif, baslikFormIndex, isComboBox, dvKodOzelmi, dvKodRowAttr }) {
		let {name: detaySinifAdi} = this;
		baslikFormIndex = baslikFormIndex ?? 0; etiket = etiket || mfSinif.sinifAdi;
		ioAttr = ioAttr || `${belirtec}Kod`; ioAdiAttr = ioAdiAttr || `${belirtec}Adi`;
		rowAttr = rowAttr || `${belirtec?.toLowerCase()}kod`; rowAdiAttr = rowAdiAttr || `${belirtec?.toLowerCase()}adi`;
		let gcUpper = gc.toUpperCase(), fullBelirtec = `${gc}${belirtec}`, fullEtiket = `${gcUpper}.${etiket}`;
		let fullIOAttr = `${gc}${ioAttr}`, fullIOAdiAttr = `${gc}${ioAdiAttr}`;
		let fullRowAttr = `${gc}${rowAttr}`, fullRowAdiAttr = `${gc}${rowAdiAttr}`;
		let {table: mstTable} = mfSinif, mstAlias = `${gc}${mfSinif.tableAlias}`;
		let {kodSaha, adiSaha, name: mfSinifAdi} = mfSinif;
		let dvKodBelirtec = `${gc}dvKod`, dvKodEtiket = `${gcUpper}.Dv`;
		// let ozelDvKodBelirtec = dvKodOzelmi ? `${fullBelirtec}DvKod` : null;
		dvKodRowAttr = dvKodRowAttr || 'dvkod';
		/*let dvKodBelirtec = dvKodOzelmi ? `${fullBelirtec}DvKod` : `${gc}DvKod`;
		  let dvKodEtiket = dvKodOzelmi ? `${fullEtiket} DvKod` : `${gcUpper}.DvKod`; */
	return eval(`(class Ext_${className} extends ExtFis {
		static { window[this.name] = this; this._key2Class[this.name] = this }
		static pTanimDuzenle({ pTanim }) {
			super.pTanimDuzenle(...arguments);
			$.extend(pTanim, { ${fullIOAttr}: new PInstStr('${fullRowAttr}'), ${fullIOAdiAttr}: new PInstStr() })
		}
		static rootFormBuilderDuzenle_ara({ builders }) {
			let baslikFormlar = builders.baslikForm.builders, form = baslikFormlar[${baslikFormIndex}];
			form.addModelKullan({ id: ${fullIOAttr}, mfSinif: ${mfSinifAdi} }).${isComboBox ? 'comboBox' : 'dropDown'}()
		}
		static secimlerDuzenle({ secimler: sec }) {
			sec.secimTopluEkle({ ${fullIOAttr}: new SecimString({ etiket: '${fullEtiket}', mfSinif: ${mfSinifAdi} }) });
			sec.whereBlockEkle(({ secimler: sec, where: wh}) => {
				let {aliasVeNokta} = ${mfSinifAdi};
				wh.basiSonu(sec.kasaKod, aliasVeNokta + ${fullRowAttr})
			})
		}
		static standartGorunumListesiDuzenle_ara({ liste }) {
			liste.push('${fullRowAttr}', '${fullRowAdiAttr}')
		}
		static orjBaslikListesiDuzenle_ilk({ liste }) {
			liste.push(
				new GridKolon({ belirtec: '${fullRowAttr}', text: '${fullEtiket} Kod', genislikCh: 16 }),
				new GridKolon({ belirtec: '${fullRowAdiAttr}', text: '${fullEtiket} Adı', genislikCh: 30, sql: '${mstAlias}.aciklama' })
			)
		}
		static tabloKolonlariDuzenle({ sender: gridci, tabloKolonlari: liste }) {
			let {mfSinif} = this;
			liste.push(
				...${mfSinifAdi}.getGridKolonlar({
					belirtec: '${fullBelirtec}', adiEtiket: \`${fullEtiket}\`,
					argsDuzenle: ({ kolonGrup }) => kolonGrup.stmDuzenleyiciEkle(e =>
						${detaySinifAdi}.asilColDef_stmDuzenle({
							...e, gridci, gc: '${gc}', belirtec: '${belirtec}', dvKodOzelmi: ${dvKodOzelmi},
							dvKodRowAttr: '${dvKodRowAttr}', dvKodAlias: '${fullBelirtec}_dvkod'
							})),
					degisince: e =>
						${detaySinifAdi}.asilColDef_degisince({
							...e, gridci, gc: '${gc}', belirtec: '${belirtec}', dvKodOzelmi: ${dvKodOzelmi},
							dvKodRowAttr: '${dvKodRowAttr}', dvKodAlias: '${fullBelirtec}_dvkod'
						})
				}),
				...${detaySinifAdi}.getGridciTabloKolonlari_ek({
					...arguments[0], gridci, gc: '${gc}', belirtec: '${belirtec}', dvKodOzelmi: ${dvKodOzelmi},
					dvKodBelirtec: '${dvKodBelirtec}', dvKodEtiket: \`${dvKodEtiket}\`
				})
			)
		}
		static loadServerData_queryDuzenle({ stm }) {
			let {mfSinif: callerMFSinif} = this, {aliasVeNokta} = callerMFSinif;    /* !! buradaki mfSinif  ext'i içeren asıl Fiş/Detay/Master sınıfıdır */
			for (let sent of stm) {
				let {sahalar} = sent;
				sent.fromIliski('${mstTable} ${mstAlias}', \`\${aliasVeNokta}${fullRowAttr} = ${mstAlias}.${kodSaha}\`);
				sahalar.add('${mstAlias}.${dvKodRowAttr} ${fullBelirtec}_dvkod')
			}
		}
		static tekilOku_queryDuzenle({ stm }) {
			for (let {sahalar} of stm) {
				sahalar.add('${mstAlias}.${adiSaha} ${fullRowAdiAttr}') }
		}
		setValues({ rec }) {
			let {inst} = this; $.extend(inst, { ${fullIOAdiAttr}: rec.${fullRowAdiAttr} })
		}
		async dataDuzgunmu(e) {
			let {inst} = this;
			return await ${mfSinifAdi}.kodYoksaMesaj(inst.${fullIOAttr})
		}
	})`)
	}
}
class GenelDekontGridci extends FinansGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ara({ tabloKolonlari: liste }) {
		super.tabloKolonlariDuzenle_ara(...arguments);
		let {class: fisSinif} = this.fis, {detaySinif} = fisSinif;
		detaySinif.forAltYapiClassesDo('tabloKolonlariDuzenle', { ...arguments[0], sender: this });
		let postfix = 'Kod', getLastIndex = gc =>
			liste.findLastIndex(({ belirtec }) => belirtec[0] == gc && belirtec.endsWith('Adi'));
		let e = { ...arguments[0], postfix, getLastIndex };
		this.tabloKolonlariDuzenle_ara_dvKod(e);
		liste.push(
			new GridKolon({ belirtec: 'ba', text: 'B/A', genislikCh: 8 }).tipTekSecim({ tekSecimSinif: BorcAlacak }),
			new GridKolon({ belirtec: 'dvBedel', text: 'Dv.Bedel', genislikCh: 18 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 18 }).tipDecimal_bedel()
		)
	}
	tabloKolonlariDuzenle_ara_dvKod({ tabloKolonlari: liste, postfix, getLastIndex }) {
		/*let gc2SonInd = Object.entries(['g', 'c'].map(gc => [gc, getLastIndex(gc)]));
		for (let [gc, sonInd] of gc2SonInd) {
			if (sonInd < 0) { continue }
			let belirtec = `${gc}dvKod`, text = `${gc.toUpperCase()}.DvKod`, genislikCh = 8;
			liste.push(new GridKolon({ belirtec, text, genislikCh }))
		}*/
	}
}

(function() {
	let classes = GenelDekontDetay.subClasses.filter(cls => !cls.araSeviyemi);
	for (let {name: detClsName} of classes) {
		let fisClsName = detClsName.replace('Detay', 'Fis');
		let code = [
			`class ${fisClsName} extends GenelDekontFis {`,
			`	static { window[this.name] = this; this._key2Class[this.name] = this }`,
			`	static get detaySinif() { return ${detClsName} } static get kodListeTipi() { return ${detClsName}.kodListeTipi }`,
			`	static get sinifAdi() { return ${detClsName}.sinifAdi } `,
			'}'
		].filter(x => !!x).join(CrLf);
		eval(code)
	}
})()
