class MQKontor extends MQDetayliMaster {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return this != MQKontor }
	static get tip() { return null } static get tipAdi() { return KontorTip.kaDict[this.tip]?.aciklama ?? '' }
	static get kodListeTipi() { return `KNT-${this.tip}` } static get sinifAdi() { return `${this.tipAdi} Kontör` }
	static get table() { return 'muskontor' } static get tableAlias() { return 'knt' } static get sayacSaha() { return 'kaysayac' }
	static get detaySinif() { return MQKontorDetay } static get gridKontrolcuSinif() { return MQKontorGridci }
	static get tumKolonlarGosterilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get raporKullanilirmi() { return false } static get noAutoFocus() { return true }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.class?.adminmi && config.dev }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.class?.adminmi }
	static get gridHeight_bosluk() { return 90 }
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
		let gridPart = e.gridPart ?? e.sender, {header, islemTuslariPart} = gridPart, {layout: islemTuslari, sol} = islemTuslariPart;
		let {current: login} = MQLogin, {musterimi: loginMusterimi} = login?.class;
		let mustKod = gridPart.mustKod = gridPart.mustKod ?? (loginMusterimi ? login.kod : qs.mustKod ?? qs.must);
		let {rootBuilder: rfb} = e; rfb.setInst(gridPart).addStyle(
			`$elementCSS { --header-height: 80px !important }
			$elementCSS .islemTuslari { overflow: hidden !important; margin-bottom: -15px !important }`);
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
			rfb.addForm('must').setParent(header)
				.setLayout(({ builder: fbd }) => $(`<div class="${fbd.id}">${mustKod}</div>`))
				.addStyle(`$elementCSS { font-size: 130%; color: royalblue; margin: 15px 0 5px 0 !important; padding: 8px 10px !important }`)
				.onAfterRun(({ builder: fbd }) => setKA(fbd, mustKod, MQLogin_Musteri.getGloKod2Adi(mustKod)))
		}
		else {
			rfb.addModelKullan('mustKod', 'Müşteri').comboBox().setMFSinif(MQLogin_Musteri)
				.autoBind().setParent(header).etiketGosterim_placeHolder()
				.degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
				.ozelQueryDuzenleHandler(({ stm, aliasVeNokta, mfSinif }) => {
					let {kodSaha} = mfSinif, clauses = { musteri: `${aliasVeNokta}${kodSaha}`, bayi: `${aliasVeNokta}bayikod` };
					for (let sent of stm) { login.yetkiClauseDuzenle({ sent, clauses }) }
				})
		}
		if (login.adminmi || login.bayimi) {
			let form = rfb.addFormWithParent('kontor').setParent(islemTuslari).yanYana()
				.addCSS('absolute').addStyle_wh(300)
				.addStyle(`$elementCSS { top: calc(0px - var(--islemTuslari-height) + 12px); left: ${config.dev ? 510 : 300}px }`);
			form.addNumberInput('kontorSayi', 'Kontör Satışı').etiketGosterim_yok()
				.addStyle_wh(130).addCSS('center')
				.onAfterRun(({ builder: fbd }) =>
					fbd.input.on('keyup', ({ key }) => {
						key = key.toLowerCase();
						if (key == 'enter' || key == 'linefeed') {
							let {kontorEkle: fbd_kontorEkle} = fbd.parentBuilder.id2Builder;
							fbd_kontorEkle.input.click()
						}
					})
				);
			form.addButton('kontorEkle', '+').addStyle_wh(90).onClick(async e => {
				try { await this.kontor_yeniIstendi(e) }
				catch (ex) { hConfirm(getErrorText(ex), 'Kontör Satışı'); throw ex }
			})
		}
	}
	static rootFormBuilderDuzenle({ sender, inst, rootBuilder: rfb, tanimFormBuilder: tanimForm }) {
		super.rootFormBuilderDuzenle(...arguments);
		let form = tanimForm.addFormWithParent();
			form.addModelKullan('mustKod', 'Müşteri').comboBox().autoBind().setMFSinif(MQLogin_Musteri)
	}
	static rootFormBuilderDuzenle_grid(e) {
		super.rootFormBuilderDuzenle_grid(e); let {fbd_gridParent, fbd_grid} = e;
		fbd_grid.noEmptyRow()
	}
	static rootFormBuilderDuzenle_kontor(e) { this.detaySinif.rootFormBuilderDuzenle_kontor(e) }
	static standartGorunumListesiDuzenle({ liste }) {
		super.standartGorunumListesiDuzenle(...arguments);
		liste.push('mustkod', 'mustadi', 'bayikod', 'topalinan', 'topharcanan', 'topkalan')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); liste.push(...[
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 16 }),
			new GridKolon({ belirtec: 'mustadi', text: 'Müşteri Adı', genislikCh: 45, sql: 'mus.aciklama' }),
			new GridKolon({ belirtec: 'bayikod', text: 'Bayi', genislikCh: 15, sql: 'mus.bayikod' }),
			new GridKolon({ belirtec: 'bayiadi', text: 'Bayi Adı', genislikCh: 30, sql: 'bay.aciklama' }),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 25, sql: 'mus.yore' }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 13, sql: 'mus.ilkod' }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 25, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'tanitim', text: 'Tanıtım', genislikCh: 43, sql: 'mus.tanitim' }),
			new GridKolon({ belirtec: 'topalinan', text: 'Top.Alınan', genislikCh: 15 }).tipDecimal(0),
			new GridKolon({ belirtec: 'topharcanan', text: 'Top.Harcanan', genislikCh: 15 }).tipDecimal(0),
			new GridKolon({ belirtec: 'topkalan', text: 'Top.Kalan', genislikCh: 15 }).tipDecimal(0)
		])
	}
	static loadServerData_queryDuzenle({ sender, stm, sent, basit, tekilOku, modelKullanmi }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {tableAlias: alias} = this, {mustKod} = sender ?? {}, {where: wh} = sent, {orderBy} = stm;
		sent.fromIliski('musteri mus', `${alias}.mustkod = mus.kod`)
			.fromIliski(`${MQLogin_Bayi.table} bay`, `mus.bayikod = bay.kod`)
			.fromIliski(`${MQVPIl.table} il`, `mus.ilkod = il.kod`);
		if (!basit) {
			let clauses = { bayi: 'mus.bayikod', musteri: `${alias}.mustkod` };
			if (mustKod) { wh.degerAta(mustKod, `${alias}.mustkod`) }
			MQLogin.current.yetkiClauseDuzenle({ sent, clauses });
			//if (!(tekilOku || modelKullanmi)) { orderBy.liste = ['kaysayac DESC'] }
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
	static kontor_yeniIstendi(e) {
		let islemAdi = e.islemAdi = 'Kontör Satışı', {part} = e.builder.rootBuilder, {mustKod, kontorSayi} = part, {current: login} = MQLogin;
		if (!mustKod) { hConfirm('Müşteri seçilmelidir', islemAdi); return false }
		if (!(login.adminmi || login.sefmi)) { hConfirm('<b>Kontör İşlemi Yapma</b> yetkiniz yok', islemAdi); return false }
		if (!login.yetkiVarmi('degistir')) { hConfirm('Kayıt <b>Değiştirme</b> yetkiniz yok', islemAdi); return false }
		/* if ((kontorSayi ?? 0) <= 0) { hConfirm('Kontör Sayısı geçersizdir', islemAdi); return false } */
		let {detaySinif} = this, inst = new detaySinif({ mustKod, kontorSayi });
		$.extend(e, { part, inst });
		let rfb = e.rfb = new RootFormBuilder('kontorTanim'); /*.asWindow('Kontör Satışı')*/
		rfb.setInst(inst).addCSS(rfb.id);
		let wnd, fbd_islemTuslari = e.fbd_islemTuslari = rfb.addIslemTuslari('islemTuslari')
			.setTip('tamamVazgec').addStyle_wh(null, 'var(--islemTuslari-height)')
			.setId2Handler({
				tamam: async _e => {
					let args = { ...e, ..._e };
					try { if (await this.kontor_ekle(args) != false) { wnd?.jqxWindow('close') } }
					catch (ex) { hConfirm(getErrorText(ex), islemAdi); throw ex }
				},
				vazgec: _e => wnd?.jqxWindow('close')
			});
		let form = e.fbd_form = rfb.addFormWithParent('form').yanYana();
		this.rootFormBuilderDuzenle_kontor(e); rfb = e.rfb; rfb.run();
		wnd = createJQXWindow({ title: islemAdi, content: rfb.layout, args: { width: 500, height: 200 } });
		return true
	}
	static async kontor_ekle({ islemAdi, inst, part }) {
		let {mustKod, kontorSayi, fatDurum} = inst;
		if ((kontorSayi ?? 0) <= 0) {  hConfirm('<b>Kontör Sayısı</b> geçersizdir', islemAdi); return false }
		let {tip, table, detayTable} = this;
		let ahtipi = 'A', tarih = today(), mustkod = mustKod, _now = now();
		let kontorsayi = kontorSayi, fatdurum = fatDurum.char ?? fatDurum;
		let fisnox = `SKY${_now.toString('yyyyMMddHHmmss')}`;
		let sayacSent = new MQSent({
			from: table, sahalar: '@fisSayac = MAX(kaysayac)',
			where: [{ degerAta: tip, saha: 'tip' }, { degerAta: mustKod, saha: 'mustkod' }]
		});
		let query = new MQToplu([
			sayacSent,
			`IF @fisSayac IS NULL BEGIN`,
				new MQInsert({ table, hv: { tip, mustkod } }),
				sayacSent,
			`END`,
			new MQIliskiliUpdate({ from: table, set: `topalinan = topalinan + ${kontorSayi.sqlServerDegeri()}`, where: `kaysayac = @fisSayac` }),
			new MQInsert({ table: detayTable, hv: { fissayac: '@fisSayac'.sqlConst(), ahtipi, tarih, fisnox, kontorsayi, fatdurum } })
		]).withDefTrn();
		let params = [{ name: '@fisSayac', type: 'int', direction: 'output' }];
		let result = await app.sqlExecNoneWithResult({ query, params }); part?.tazele();
		return result
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
			fatDurum: new PInstTekSecim('fatdurum', KontorFatDurum),
			/* ek değerler */
			fisSayac: new PInst(), mustKod: new PInstStr()
		})
	}
	static orjBaslikListesi_argsDuzenle({ gridPart, sender, args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments); gridPart = gridPart ?? sender;
		$.extend(args, { showGroupsHeader: true, groupsExpandedByDefault: false })
	}
	static ekCSSDuzenle({ rec, result, dataField: belirtec }) {
		super.ekCSSDuzenle(...arguments);
		switch (belirtec) {
			/*case 'ahtipitext':
				switch (rec.ahtipi) {
					case 'A': result.push('green'); break
					case 'H': result.push('firebrick'); break
				}
				break*/
			case 'kontorsayi':
				if ((rec[belirtec] ?? 0) < 0) { result.push('bold red') }
				break
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {tableAlias: alias} = this, {current: login} = MQLogin;
		if (login.yetkiVarmi('degistir')) {
			liste.push(new GridKolon({ belirtec: 'degistir', text: ' ', genislikCh: 5 }).noSql().tipButton('D').onClick(e => this.kontor_degistirIstendi(e))) }
		if (login.yetkiVarmi('sil') || login.sefmi) {
			liste.push(new GridKolon({ belirtec: 'sil', text: ' ', genislikCh: 5 }).noSql().tipButton('X').onClick(e => this.kontor_silIstendi(e))) }
		liste.push(...[
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'ahtipitext', text: 'A/H Tip', genislikCh: 13, sql: KontorAHTip.getClause(`${alias}.ahtipi`) }),
			new GridKolon({ belirtec: 'fisnox', text: 'Fiş No', genislikCh: 23 }),
			new GridKolon({ belirtec: 'kontorsayi', text: 'Kontör', genislikCh: 10 }).tipDecimal(0),
			new GridKolon({
				belirtec: 'fatdurumtext', text: 'Fat.Durum', genislikCh: 15, sql: KontorFatDurum.getClause(`${alias}.fatdurum`),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					let {ahtipi: ahTipi, fatdurum: fatDurum} = rec;
					if (!(fatDurum || ahTipi == 'A')) { html = changeTagContent(html, (value = '')) }
					return html
				}
			})
		])
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {tableAlias: alias} = this, {sahalar, where: wh} = sent, {orderBy} = stm;
		sahalar.add(`${alias}.ahtipi`, `${alias}.fatdurum`);
		orderBy.liste = ['tarih DESC', 'fisnox DESC']
	}
	static rootFormBuilderDuzenle_kontor({ rfb, fbd_form: form, inst }) {
		let {fatDurum} = inst;
		form.addNumberInput('kontorSayi', 'Kontör Sayı').addStyle_wh(130)
			.degisince(({ builder: fbd }) => fbd.parentBuilder.id2Builder.fatDurum.updateVisible())
			.onAfterRun(({ builder: fbd }) => fbd.input.focus());
		form.addModelKullan('fatDurum', 'Fatura Durum').listedenSecilmez().addStyle_wh(250)
			.dropDown().noMF().kodsuz().autoBind().setSource(fatDurum.kaListe)
			.setVisibleKosulu(({ builder: fbd }) => fbd.altInst.ahTipi.alinanmi ? true : 'jqx-hidden');
		rfb.onAfterRun(({ builder: rfb }) => {
			rfb.layout.on('keyup', evt => {
				let key = evt.key.toLowerCase(), {islemTuslari} = rfb.id2Builder;
				if (key == 'enter' || key == 'linefeed') { islemTuslari.layout.find('button#tamam').click() }
			})
		})
	}
	static kontor_degistirIstendi(e) {
		let islemAdi = e.islemAdi = 'Kontör Düzenle', {sender: part, parentRec, rec, inst} = e, {parentPart} = part, detaySinif = this;
		if (!MQLogin.current.yetkiVarmi('degistir')) { hConfirm('Kayıt <b>Değiştirme</b> yetkiniz yok', islemAdi); return false }
		if (parentRec == null) { parentRec = e.parentRec = parentPart.selectedRec }
		if (inst == null) {
			e.inst = inst = new detaySinif(); inst.setValues({ rec });
			let {kaysayac: fisSayac, mustkod: mustKod} = parentRec; $.extend(inst, { fisSayac, mustKod })
		}
		inst.prevKontorSayi = inst.kontorSayi; $.extend(e, { part, inst });
		let rfb = e.rfb = new RootFormBuilder('kontorTanim'); /*.asWindow('Kontör Satışı')*/
		rfb.setInst(inst).addCSS(rfb.id);
		let wnd, fbd_islemTuslari = e.fbd_islemTuslari = rfb.addIslemTuslari('islemTuslari')
			.setTip('tamamVazgec').addStyle_wh(null, 'var(--islemTuslari-height)')
			.setId2Handler({
				tamam: async _e => {
					let args = { ...e, ..._e };
					try { if (await this.kontor_degistir(args) != false) { wnd?.jqxWindow('close') } }
					catch (ex) { hConfirm(getErrorText(ex), islemAdi); throw ex }
				},
				vazgec: _e => wnd?.jqxWindow('close')
			});
		let form = e.fbd_form = rfb.addFormWithParent('form').yanYana();
		this.rootFormBuilderDuzenle_kontor(e); rfb = e.rfb; rfb.run();
		wnd = createJQXWindow({ title: islemAdi, content: rfb.layout, args: { width: 500, height: 200 } });
		return true
	}
	static async kontor_degistir({ islemAdi, inst, part }) {
		let {fisSayac, okunanHarSayac: sayac, prevKontorSayi, kontorSayi, fatDurum} = inst, {tip, table} = MQKontor, {table: detayTable} = this;
		let kontorFark = kontorSayi - (prevKontorSayi ?? 0); fatDurum = fatDurum?.char ?? fatDurum;
		let query = new MQToplu([
			new MQIliskiliUpdate({
				from: table, set: `topalinan = topalinan + ${kontorFark.sqlServerDegeri()}`,
				where: { degerAta: fisSayac, saha: 'kaysayac' }
			}),
			new MQIliskiliUpdate({
				from: detayTable, set: [
					{ degerAta: kontorSayi, saha: 'kontorsayi' },
					{ degerAta: fatDurum, saha: 'fatdurum' }
				],
				where: { degerAta: sayac, saha: 'kaysayac' }
			})
		]).withDefTrn();
		let result = await app.sqlExecNoneWithResult(query); part?.tazele();
		return result
	}
	static async kontor_silIstendi(e) {
		let islemAdi = e.islemAdi = 'Kontör SİL', {sender: part, parentRec, recs, sayacListe} = e, {parentPart} = part, {current: login} = MQLogin;
		if (!(login.yetkiVarmi('sil') || login.sefmi)) { hConfirm('Kayıt <b>SİLME</b> yetkiniz yok', islemAdi); return false }
		if (parentRec == null) { parentRec = e.parentRec = parentPart.selectedRec }
		let {kaysayac: fisSayac} = parentRec; if (recs == null) { recs = $.makeArray(e.rec) }
		if (sayacListe == null) { sayacListe = e.sayacListe = recs.map(rec => rec.kaysayac) }
		let rdlg = await ehConfirm(`Seçilen <b>${recs.length} adet Kontör</b> kaydı <b class=firebrick>SİLİNSİN Mİ?</b>`, islemAdi);
		if (rdlg != true) { return rdlg } $.extend(e, { fisSayac, part, parentPart });
		try { return await this.kontor_sil(e) }
		catch (ex) { hConfirm(getErrorText(ex), islemAdi); throw ex }
	}
	static async kontor_sil({ islemAdi, fisSayac, sayacListe, part }) {
		if (!sayacListe?.length) { return false }
		let {tip, table} = MQKontor, {table: detayTable} = this;
		let query = new MQToplu([
			'DECLARE @dusulecek_alinan INT = 0',
			'DECLARE @dusulecek_harcanan INT = 0',
			new MQSent({
				from: detayTable, where: [
					{ inDizi: sayacListe, saha: 'kaysayac' },
					{ degerAta: 'A', saha: 'ahtipi' }
				],
				sahalar: `@dusulecek_alinan = SUM(kontorsayi)`,
			}),
			new MQSent({
				from: detayTable, where: [
					{ inDizi: sayacListe, saha: 'kaysayac' },
					{ degerAta: 'H', saha: 'ahtipi' }
				],
				sahalar: `@dusulecek_harcanan = 0 - SUM(kontorsayi)`,
			}),
			new MQIliskiliDelete({ from: detayTable, where: { inDizi: sayacListe, saha: 'kaysayac' } }),
			`IF EXISTS (`, new MQSent({ from: detayTable, where: { degerAta: fisSayac, saha: 'fissayac' }, sahalar: '*' }), ') BEGIN ' ,
				new MQIliskiliUpdate({
					from: table, where: { degerAta: fisSayac, saha: 'kaysayac' },
					set: [
						'topalinan = topalinan - COALESCE(@dusulecek_alinan, 0)',
						'topharcanan = topharcanan - COALESCE(@dusulecek_harcanan, 0)'
					]
				}),
			`END ELSE `,
				new MQIliskiliDelete({ from: table, where: { degerAta: fisSayac, saha: 'kaysayac' } })
		]).withDefTrn();
		let result = await app.sqlExecNoneWithResult(query); part?.tazele();
		return result
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
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 11 }).tipDate(),
			new GridKolon({ belirtec: 'ahTipi', text: 'A/H Tip', genislikCh: 18 }).tipTekSecim({ tekSecimSinif: KontorAHTip }).kodsuz().autoBind(),
			new GridKolon({ belirtec: 'fisNox', text: 'Fiş No', genislikCh: 25 }),
			new GridKolon({ belirtec: 'kontorSayi', text: 'Kontör', genislikCh: 9 }).tipDecimal(0),
			new GridKolon({ belirtec: 'tcSorgu_anahtar', text: 'Turmob: Token', genislikCh: 35 }),
			new GridKolon({ belirtec: 'tcSorgu_vkn', text: 'Turmob: VKN', genislikCh: 14 }),
			new GridKolon({ belirtec: 'tcSorgu_terminal', text: 'Turmob: Terminal', genislikCh: 20 })
		])
	}
}

class MQKontor_EBelge extends MQKontor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'BL' } static get detaySinif() { return MQKontorDetay_EBelge }
}
class MQKontorDetay_EBelge extends MQKontorDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class MQKontor_Turmob extends MQKontor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'TR' } static get detaySinif() { return MQKontorDetay_Turmob }
}
class MQKontorDetay_Turmob extends MQKontorDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			tcSorgu_terminal: new PInstStr('tcsorguterminal'), tcSorgu_token: new PInstStr('tcsorguanahtar'),
			tcSorgu_vkn: new PInstStr('tcsorguvkn')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {tableAlias: alias} = this;
		liste.push(...[
			new GridKolon({ belirtec: 'tcsorguvkn', text: 'Turmob: VKN', genislikCh: 14 }),
			new GridKolon({ belirtec: 'tcsorguanahtar', text: 'Turmob: Token', genislikCh: 35 }),
			new GridKolon({ belirtec: 'tcsorguterminal', text: 'Turmob: Terminal', genislikCh: 20 })
		])
	}
}
