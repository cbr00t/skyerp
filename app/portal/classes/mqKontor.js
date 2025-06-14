class MQKontor extends MQDetayliMaster {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return this != MQKontor }
	static get tip() { return null } static get tipAdi() { return KontorTip.kaDict[this.tip]?.aciklama ?? '' }
	static get kodListeTipi() { return `KNT-${this.tip}` } static get sinifAdi() { return `${this.tipAdi} Kontör` }
	static get table() { return 'muskontor' } static get tableAlias() { return 'knt' } static get sayacSaha() { return 'kaysayac' }
	static get detaySinif() { return MQKontorDetay } static get gridKontrolcuSinif() { return MQKontorGridci }
	static get tumKolonlarGosterilirmi() { return true } static get kolonFiltreKullanilirmi() { return false } static get raporKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.class?.adminmi }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.class?.adminmi }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			mustKod: new PInstStr('mustkod'), topAlinan: new PInstNum('topalinan'),
			topHarcanan: new PInstNum('topharcanan'), topKalan: new PInstNum('topkalan')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); let {tableAlias: alias} = this;
		sec.addKA('must', MQLogin_Musteri, `${alias}.mustkod`, 'mus.aciklama')
	}
	static listeEkrani_init({ gridPart, sender }) {
		super.listeEkrani_init(...arguments); gridPart = gridPart ?? sender
		/* gridPart.tarih = today(); gridPart.rowNumberOlmasin() */
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e);
		let gridPart = e.gridPart ?? e.sender, {header, islemTuslariPart} = gridPart, {layout, sol} = islemTuslariPart;
		let {current: login} = MQLogin, {musterimi: loginMusterimi} = login?.class;
		let mustKod = gridPart.mustKod = loginMusterimi ? session.kod : qs.mustKod ?? qs.must;
		let {rootBuilder: rfb} = e; rfb.setInst(gridPart).addStyle(
			`$elementCSS { --header-height: 80px !important } $elementCSS
			.islemTuslari { overflow: hidden !important; margin-bottom: -15px !important }`);
		let setKA = async (fbdOrLayout, kod, aciklama) => {
			let elm = fbdOrLayout?.layout ?? fbdOrLayout; if (!elm?.length) { return }
			if (kod) {
				aciklama = await aciklama; if (!aciklama) { return }
				let text = aciklama?.trim(); if (kod && typeof kod == 'string') {
					text = `<span class="kod bold gray">${kod}</b> <span class="aciklama royalblue normal">${aciklama}</span>` }
				elm.html(text.trim()); elm.removeClass('jqx-hidden basic-hidden')
			}
			else { elm.addClass('jqx-hidden') }
		};
		if (mustKod) {
			rfb.addForm('must', ({ builder: fbd }) => $(`<div class="${fbd.id}">${mustKod}</div>`)).setParent(header)
				.onAfterRun(({ builder: fbd }) => setKA(fbd, mustKod, MQSCari.getGloKod2Adi(mustKod)))
		}
		else {
			rfb.addModelKullan('mustKod', 'Müşteri').comboBox().setMFSinif(MQLogin_Musteri)
				.autoBind().setParent(header).etiketGosterim_placeHolder()
				.degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
		}
		let form = rfb.addFormWithParent('kontor').setParent(header).yanYana();
		form.addNumberInput('kontorSayi', 'Kontör Sayı').etiketGosterim_yok().addStyle_wh(130).addCSS('center');
		form.addButton('kontorEkle', '+').addStyle_wh(90).onClick(async e => {
			try { await this.kontorEkleIstendi(e) }
			catch (ex) { hConfirm(getErrorText(ex), 'Kontör Ekle'); throw ex }
		})
	}
	static async kontorEkleIstendi({ builder: fbd }) {
		let islemAdi = 'Kontör Ekle', {rootBuilder: rfb} = fbd, {part} = rfb, {mustKod, kontorSayi} = part;
		if (!mustKod) { hConfirm('Müşteri seçilmelidir', islemAdi); return false }
		if ((kontorSayi ?? 0) <= 0) { hConfirm('Kontör Sayısı geçersizdir', islemAdi); return false }
		let {tip, table, detaySinif} = this, {table: detayTable} = detaySinif;
		let ahtipi = 'A', tarih = today(), mustkod = mustKod;
		let kontorsayi = kontorSayi, fisnox = newGUID().replaceAll('-', '').slice(-16);
		let sayacSent = new MQSent({
			from: table, sahalar: '@fisSayac = MAX(kaysayac)',
			where: [
				{ degerAta: tip, saha: 'tip' },
				{ degerAta: mustKod, saha: 'mustkod' }
			]
		});
		let query = new MQToplu([
			sayacSent,
			`IF @fisSayac IS NULL BEGIN`,
				new MQInsert({ table, hv: { tip, mustkod } }),
				sayacSent,
			`END`,
			new MQIliskiliUpdate({ from: table, set: `topalinan = topalinan + 1`, where: `kaysayac = @fisSayac` }),
			new MQInsert({ table: detayTable, hv: { fissayac: '@fisSayac'.sqlConst(), ahtipi, tarih, fisnox, kontorsayi } })
		]).withDefTrn();
		let params = [{ name: '@fisSayac', type: 'int', direction: 'output' }];
		let result = await app.sqlExecNoneWithResult({ query, params });
		part.tazele(); return true
	}
	static rootFormBuilderDuzenle({ sender, inst, rootBuilder: rfb, tanimFormBuilder: tanimForm }) {
		super.rootFormBuilderDuzenle(...arguments)
	}
	static rootFormBuilderDuzenle_grid(e) {
		super.rootFormBuilderDuzenle_grid(e); let {fbd_gridParent, fbd_grid} = e;
		fbd_gridParent.addStyle(`$elementCSS { height: calc(var(--full) - 10px) !important }`);
		fbd_grid.noEmptyRow()
	}
	static ekCSSDuzenle({ rec, result }) {
		super.ekCSSDuzenle(...arguments);
		switch (rec.ahtipi) {
			case 'A': result.push('lightgreen'); break
			case 'H': result.push('lightred'); break
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); liste.push(...[
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 16 }),
			new GridKolon({ belirtec: 'mustadi', text: 'Bayi Adı', genislikCh: 45, sql: 'mus.aciklama' }),
			new GridKolon({ belirtec: 'bayikod', text: 'Bayi', genislikCh: 10, sql: 'mus.bayikod' }),
			new GridKolon({ belirtec: 'bayiadi', text: 'Bayi Adı', genislikCh: 30, sql: 'bay.aciklama' }),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 25, sql: 'mus.yore' }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8, sql: 'mus.ilkod' }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 25, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'tanitim', text: 'Tanıtım', genislikCh: 43, sql: 'mus.tanitim' }),
			new GridKolon({ belirtec: 'topalinan', text: 'Top.Alınan', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'topharcanan', text: 'Top.Harcanan', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'topkalan', text: 'Top.Kalan', genislikCh: 10 }).tipNumerik()
		])
	}
	static loadServerData_queryDuzenle({ sender, stm, sent, basit: basitmi }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {tableAlias: alias} = this, {mustKod} = sender ?? {}, {where: wh} = sent;
		sent.fromIliski('musteri mus', `${alias}.mustkod = mus.kod`)
			.fromIliski(`${MQLogin_Bayi.table} bay`, `mus.bayikod = bay.kod`)
			.fromIliski(`${MQVPIl.table} il`, `mus.ilkod = il.kod`);
		if (!basitmi) {
			let clauses = { bayi: 'mus.bayikod', musteri: `${alias}.mustkod` };
			if (mustKod) { wh.degerAta(mustKod, `${alias}.mustkod`) }
			MQLogin.current.yetkiClauseDuzenle({ sent, clauses })
		}
	}
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments);
		hv.tip = this.tip
	}
	alternateKeyHostVarsDuzenle({ hv }) {
		super.alternateKeyHostVarsDuzenle(...arguments);
		hv.mustkod = this.mustKod
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments);
		delete hv.topkalan
	}
}
class MQKontorDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'muskontordetay' } static get seqSaha() { return null }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			ahTipi: new PInstTekSecim('ahtipi', KontorAHTip), fisNox: new PInstStr('fisnox'),
			tarih: new PInstDateToday('tarih'), kontorSayi: new PInstNum('kontorsayi'),
			tcSorgu_terminal: new PInstStr('tcsorguterminal'), tcSorgu_token: new PInstStr('tcsorguanahtar'),
			tcSorgu_vkn: new PInstStr('tcsorguvkn')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
			super.orjBaslikListesiDuzenle(...arguments); let {tableAlias: alias} = this;
		liste.push(...[
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'ahtipitext', text: 'A/H Tip', genislikCh: 8, sql: KontorAHTip.getClause(`${alias}.ahtipi`) }),
			new GridKolon({ belirtec: 'fisnox', text: 'Fiş No', genislikCh: 18 }),
			new GridKolon({ belirtec: 'kontorsayi', text: 'Kontör', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'tcsorguterminal', text: 'Turmob: Terminal', genislikCh: 30 }),
			new GridKolon({ belirtec: 'tcsorguanahtar', text: 'Turmob: Token', genislikCh: 36 }),
			new GridKolon({ belirtec: 'tcsorguvkn', text: 'Turmob: VKN', genislikCh: 15 })
		])
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {tableAlias: alias} = this, {sahalar, where: wh} = sent;
		sahalar.add(`${alias}.ahtipi`)
	}
}
class MQKontorGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	gridArgsDuzenle({ gridPart, sender, args }) {
		super.gridArgsDuzenle(...arguments); gridPart = gridPart ?? sender;
		$.extend(args, { groupsExpandedByDefault: true, editMode: 'click' })
	}
	tabloKolonlariDuzenle_ilk({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ilk(...arguments);
		tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'ahTipi', text: 'A/H Tip', genislikCh: 18 }).tipTekSecim({ tekSecimSinif: KontorAHTip }).kodsuz().autoBind(),
			new GridKolon({ belirtec: 'fisNox', text: 'Fiş No', genislikCh: 18 }),
			new GridKolon({ belirtec: 'kontorSayi', text: 'Kontör', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'tcSorgu_terminal', text: 'Turmob: Terminal', genislikCh: 30 }),
			new GridKolon({ belirtec: 'tcSorgu_anahtar', text: 'Turmob: Token', genislikCh: 36 }),
			new GridKolon({ belirtec: 'tcSorgu_vkn', text: 'Turmob: VKN', genislikCh: 15 })
		])
	}
}

class MQKontor_EBelge extends MQKontor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'BL' }
}
class MQKontor_Turmob extends MQKontor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'TR' }
}
