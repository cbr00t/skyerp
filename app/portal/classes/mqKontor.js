class MQKontor extends MQDetayliMaster {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return this != MQKontor }
	static get tip() { return null } static get tipAdi() { return KontorTip.kaDict[this.tip]?.aciklama ?? '' }
	static get kodListeTipi() { return `KNT-${this.tip}` } static get sinifAdi() { return `${this.tipAdi} Kontör` }
	static get table() { return 'muskontor' } static get tableAlias() { return 'knt' } static get sayacSaha() { return 'kaysayac' }
	static get detaySinif() { return MQKontorDetay } static get gridKontrolcuSinif() { return MQKontorGridci }
	static get vioSeri() { return null } static get vioHizmetKod() { return null }
	static get tumKolonlarGosterilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get raporKullanilirmi() { return false } static get noAutoFocus() { return true }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.class?.adminmi && config.dev }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.class?.adminmi }
	static get gridHeight_bosluk() { return 90 } static get newFisNox() { return `SKY${now().toString('yyyyMMddHHmmss')}` }
	static get vioSeri_eFat() { return 'KSE' } static get vioSeri_eArsiv() { return 'KSA' } static get vioSeri_yildizli() { return 'KSX' }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			mustKod: new PInstStr('mustkod'), topAlinan: new PInstNum('topalinan'),
			topHarcanan: new PInstNum('topharcanan'), topKalan: new PInstNum('topkalan')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		let {tableAlias: alias} = this;
		sec.grupTopluEkle([ { kod: 'genel', etiket: 'Genel', kapali: false } ]);
		sec
			.secimTopluEkle({
				// ahTipiSecim: new SecimBirKismi({ etiket: 'Alınan/Harcanan', tekSecim: new KontorAHTip().alinanYap() }).birKismi().autoBind(),
				fatDurumSecim: new SecimBirKismi({ etiket: 'Fat. Durum', tekSecim: new KontorFatDurum().secimYok() }).birKismi().autoBind(),
				tamamlandiSecim: new SecimTekSecim({
					etiket: 'ERP Durumu',
					tekSecim: new BuDigerVeHepsi(['<span class=forestgreen>Tamamlananlar</span>', '<span class=firebrick>TamamlanMAyanlar</span>'])
				}).autoBind()
			})
			.addKA('must', MQLogin_Musteri, `${alias}.mustkod`, 'mus.aciklama')
			.addKA('bayi', MQLogin_Bayi, 'mus.bayikod', 'bay.aciklama')
			.addKA('anaBayi', MQVPAnaBayi, 'bay.anabayikod', 'abay.aciklama')
			.addKA('il', MQVPIl, 'mus.ilkod', 'il.aciklama')
		sec.whereBlockEkle(({ secimler: sec, sent, where: wh }) => {
			let {ahTipiSecim, fatDurumSecim} = sec, {tekSecim: tamamlandiSecim} = sec.tamamlandiSecim;
			if (sent) {
				/*if (!$.isEmptyObject(ahTipiSecim.value)) { wh.birKismi(ahTipiSecim, 'har.ahtipi') }*/
				if (!$.isEmptyObject(fatDurumSecim.value)) {
					// wh.degerAta('A', 'har.ahtipi');
					wh.add('har.kontorsayi > 0');
					wh.birKismi(fatDurumSecim, 'har.fatdurum')
				}
				if (!tamamlandiSecim.hepsimi) {
					wh.add(tamamlandiSecim.getBoolBitClause('har.btamamlandi')) }
			}
		})
	}
	static listeEkrani_init({ gridPart, sender }) {
		super.listeEkrani_init(...arguments); gridPart = gridPart ?? sender
		/* gridPart.tarih = today(); gridPart.rowNumberOlmasin() */
	}
	static listeEkrani_afterRun({ gridPart, sender }) {
		super.listeEkrani_afterRun(...arguments); gridPart = gridPart ?? sender;
		if (gridPart.mustKod) {
			let {bindingCompleteBlock: oldHandler} = gridPart;
			gridPart.veriYuklenince(() => { gridPart.veriYuklenince(oldHandler); gridPart.tazele() })
		}
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e);
		let gridPart = e.gridPart ?? e.sender, {header, islemTuslariPart} = gridPart, {layout: islemTuslari, sol} = islemTuslariPart;
		let {current: login} = MQLogin, {musterimi: loginMusterimi} = login?.class;
		let mustKod = gridPart.mustKod = gridPart.mustKod ?? (loginMusterimi ? login.kod : qs.mustKod ?? qs.must);
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
		let {rootBuilder: rfb} = e; rfb.setInst(gridPart).addStyle(
			`$elementCSS .islemTuslari { overflow: hidden hidden !important; margin-bottom: -23px !important }`);
		let form_ek = rfb.addFormWithParent('ekForm').yanYana().setParent(islemTuslari).addStyle(
			`$elementCSS { position: absolute !important; width: max-content !important; left: 300px !important }
			 $elementCSS button { min-width: unset !important }`);
		if (login.adminmi || login.bayimi) {
			let form = form_ek.addFormWithParent('kontor').yanYana().addStyle_fullWH('max-content');
			form.addNumberInput('kontorSayi', 'Kontör Satışı').setAltInst(gridPart)
				.etiketGosterim_yok().addStyle_wh(130).addCSS('center')
				.onAfterRun(({ builder: fbd }) =>
					fbd.input.on('keyup', ({ key }) => {
						key = key.toLowerCase();
						if (key == 'enter' || key == 'linefeed') {
							let {kontorEkle: fbd_kontorEkle} = fbd.parentBuilder.id2Builder;
							fbd_kontorEkle.input.click()
						}
					})
				);
			form.addButton('kontorEkle', '+').addStyle_wh(80)
				.onClick(async _e => {
					try { await this.kontor_yeniIstendi(({ ..._e, ...e })) }
					catch (ex) { hConfirm(getErrorText(ex), 'Kontör Satışı'); throw ex }
			})
		}
		if ((login.adminmi || login.sefmi) && this.faturalastirmaYapilirmi) {
			form_ek.addButton('faturalastir', 'FAT').addStyle_wh(90)
				.addStyle(`$elementCSS { left: 50px !important }`)
				.onClick(async _e => {
					try { await this.kontor_topluFaturalastirIstendi({ ..._e, ...e }) }
					catch (ex) { hConfirm(getErrorText(ex), 'Kontör Faturalaştır'); throw ex }
				})
		}
		if (mustKod) {
			rfb.addForm('must').setParent(header).setAltInst(gridPart)
				.setLayout(({ builder: fbd }) => $(`<div class="${fbd.id}">${mustKod}</div>`))
				.addStyle(`$elementCSS { font-size: 130%; color: royalblue; margin: 15px 0 5px 0 !important; padding: 8px 10px !important }`)
				.onAfterRun(({ builder: fbd }) => setKA(fbd, mustKod, MQLogin_Musteri.getGloKod2Adi(mustKod)))
		}
		else {
			rfb.addModelKullan('mustKod', 'Müşteri').comboBox().setMFSinif(MQLogin_Musteri)
				.autoBind().setParent(header).etiketGosterim_placeHolder()
				.degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
				.ozelQueryDuzenleHandler(({ stm, aliasVeNokta, mfSinif }) => {
					let {kodSaha} = mfSinif, clauses = { musteri: `${aliasVeNokta}${kodSaha}`, bayi: `${aliasVeNokta}bayikod`, anaBayi: 'bay.anabayikod' };
					for (let sent of stm) {
						let {where: wh} = sent;
						wh.add(`${aliasVeNokta}aktifmi <> ''`);
						MQLogin.current.yetkiClauseDuzenle({ sent, clauses })
					}
				})
		}
	}
	static rootFormBuilderDuzenle({ sender, inst, rootBuilder: rfb, tanimFormBuilder: tanimForm }) {
		super.rootFormBuilderDuzenle(...arguments);
		let form = tanimForm.addFormWithParent();
			form.addModelKullan('mustKod', 'Müşteri').comboBox().autoBind().setMFSinif(MQLogin_Musteri)
				.ozelQueryDuzenleHandler(({ stm, aliasVeNokta, mfSinif }) => {
					let {kodSaha} = mfSinif, clauses = { musteri: `${aliasVeNokta}${kodSaha}`, bayi: `${aliasVeNokta}bayikod` };
					for (let sent of stm) {
						let {where: wh} = sent;
						wh.add(`${aliasVeNokta}aktifmi <> ''`);
						MQLogin.current.yetkiClauseDuzenle({ sent, clauses })
					}
				})
	}
	static rootFormBuilderDuzenle_grid(e) {
		super.rootFormBuilderDuzenle_grid(e); let {fbd_gridParent, fbd_grid} = e;
		fbd_grid.noEmptyRow()
	}
	static rootFormBuilderDuzenle_kontor(e) { this.detaySinif.rootFormBuilderDuzenle_kontor(e) }
	static ekCSSDuzenle({ rec, result, dataField: belirtec }) {
		super.ekCSSDuzenle(...arguments); let value = rec[belirtec];
		switch (belirtec) {
			case 'topkalan':
				if (value) {
					if (value > 0) { result.push('kontor-var green') }
					else { result.push('kontor-yok orangered') }
					result.push('bold fs-150')
				}
				break
			case 'topalinan': case 'topharcanan':
				if (value) {
					if (belirtec == 'topharcanan') { value = -value }
					result.push(value > 0 ? 'forestgreen' : 'bold red')
				}
				break
		}
	}
	static orjBaslikListesi_argsDuzenle({ gridPart, sender, args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments); gridPart = gridPart ?? sender;
		$.extend(args, { rowsHeight: 40 })
	}
	static standartGorunumListesiDuzenle({ liste }) {
		super.standartGorunumListesiDuzenle(...arguments);
		liste.push('mustkod', 'mustadi', 'bayikod', 'anabayikod', 'topalinan', 'topharcanan', 'topkalan', 'tanitim')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); liste.push(...[
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 15 }),
			new GridKolon({ belirtec: 'mustadi', text: 'Müşteri Adı', genislikCh: 50, sql: 'mus.aciklama' }),
			new GridKolon({
				belirtec: 'topalinan', text: 'Top.Alınan', genislikCh: 13,
				sql: `SUM(case when har.ahtipi = 'A' then har.kontorsayi else 0 end)`
			}).tipDecimal(0),
			new GridKolon({
				belirtec: 'topharcanan', text: 'Top.Harcanan', genislikCh: 13,
				sql: `SUM(case when har.ahtipi <> 'A' then har.kontorsayi else 0 end)`
			}).tipDecimal(0),
			new GridKolon({
				belirtec: 'topkalan', text: 'Top.Kalan', genislikCh: 15,
				sql: `SUM(case when har.ahtipi = 'A' then har.kontorsayi else 0 - har.kontorsayi end)`
			}).tipDecimal(0),
			new GridKolon({ belirtec: 'bayikod', text: 'Bayi', genislikCh: 13, sql: 'mus.bayikod', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'bayiadi', text: 'Bayi Adı', genislikCh: 25, sql: 'bay.aciklama', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'anabayikod', text: 'Ana Bayi', genislikCh: 13, sql: 'bay.anabayikod', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'anabayiadi', text: 'Ana Bayi Adı', genislikCh: 20, sql: 'abay.aciklama', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 20, sql: 'mus.yore', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8, sql: 'mus.ilkod', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 20, sql: 'il.aciklama', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'tanitim', text: 'Tanıtım', genislikCh: 43, sql: 'mus.tanitim' })
		])
	}
	static loadServerData_queryDuzenle({ sender, stm, sent, basit, tekilOku, modelKullanmi }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {tableAlias: alias, detayTable} = this, {mustKod} = sender ?? {};
		let {where: wh, sahalar, alias2Deger} = sent, {orderBy} = stm;
		sent
			.fromIliski(`${detayTable} har`, `har.fissayac = ${alias}.kaysayac`)
			.fromIliski('musteri mus', `${alias}.mustkod = mus.kod`)
			.fromIliski(`${MQLogin_Bayi.table} bay`, `mus.bayikod = bay.kod`)
			.leftJoin('bay', `${MQVPAnaBayi.table} abay`, `bay.anabayikod = abay.kod`)
			.fromIliski(`${MQVPIl.table} il`, `mus.ilkod = il.kod`);
		if (!alias2Deger.kaysayac) { sahalar.add(`${alias}.kaysayac`) }
		if (!alias2Deger.bayikod) { sahalar.add('mus.bayikod') }
		if (!alias2Deger.anabayikod) { sahalar.add('bay.anabayikod') }
		if (!alias2Deger.mustkod) { sahalar.add('fis.mustkod') }
		if (!basit) {
			let clauses = { anaBayi: 'bay.anabayikod', bayi: 'mus.bayikod', musteri: `${alias}.mustkod` };
			if (mustKod) { wh.degerAta(mustKod, `${alias}.mustkod`) }
			MQLogin.current.yetkiClauseDuzenle({ sent, clauses });
			if (!alias2Deger.onmuhmustkod) { sahalar.add('abay.onmuhmustkod') }
			//if (!(tekilOku || modelKullanmi)) { orderBy.liste = ['kaysayac DESC'] }
		}
		sent.groupByOlustur()
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
	static orjBaslikListesi_satirCiftTiklandi({ sender: gridPart }) {
		super.orjBaslikListesi_satirCiftTiklandi(...arguments);
		gridPart.islemTuslariPart.layout.find('button#degistir')?.click()
	}
	static kontor_yeniIstendi(e) {
		let islem = e.islem = 'yeni', islemAdi = e.islemAdi = 'Kontör Satışı';
		let part = e.gridPart ?? e.sender ?? e.builder?.rootBuilder;
		let {mustKod, kontorSayi} = part, {current: login} = MQLogin;
		/* if (!mustKod) { hConfirm('Müşteri seçilmelidir', islemAdi); return false } */
		if (!(login.adminmi || login.bayimi)) { hConfirm('<b>Kontör İşlemi Yapma</b> yetkiniz yok', islemAdi); return false }
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
		let form = e.fbd_form = rfb.addFormWithParent('form').altAlta();
		this.rootFormBuilderDuzenle_kontor(e); rfb = e.rfb; rfb.run();
		wnd = createJQXWindow({ title: islemAdi, content: rfb.layout, args: { isModal: false, width: 800, height: 290 } });
		return true
	}
	static async kontor_topluFaturalastirIstendi(e) {
		let islemAdi = e.islemAdi = 'Kontör Faturalaştır'
		let part = e.part = e.builder.rootBuilder.part, login = e.login = MQLogin.current
		let {recs} = e, sayacListe = recs?.map(rec => rec.kaysayac)
		recs = e.recs = recs ?? part.selectedRecs
		if (!(login.adminmi || login.sefmi)) {
			hConfirm('<b>Kontör Faturalaştırma</b> yetkiniz yok', islemAdi)
			return false
		}
		if (!login.yetkiVarmi('degistir')) {
			hConfirm('Kayıt <b>Değiştirme</b> yetkiniz yok', islemAdi)
			return false
		}
		if (!recs?.length) {
			hConfirm('Faturalaşacak kayıtlar seçilmelidir', islemAdi)
			return false
		}
		if (!await ehConfirm('Seçilen kayıtlara ait <b>Alınan Faturalaşmamış</b> olan Kontörler için Faturalar kesilecektir, devam edilsin mi?', islemAdi))
			return false
		let fisSayacListe = recs.map(rec => rec.fissayac ?? rec.kaysayac)
		let {table, detayTable, tipAdi} = this, defKeyHV = this.varsayilanKeyHostVars(e)
		let sent = new MQSent(), {where: wh, sahalar} = sent
		sent.fisHareket(table, detayTable)
			.fromIliski('musteri mus', 'fis.mustkod = mus.kod')
			.fromIliski('bayi bay', 'mus.bayikod = bay.kod')
			.fromIliski('anabayi abay', 'bay.anabayikod = abay.kod')
		wh.birlestirDict(defKeyHV, 'fis');
		if (sayacListe?.length) { wh.inDizi(sayacListe, 'har.kaysayac') }
		else { wh.inDizi(fisSayacListe, 'fis.kaysayac') }
		wh.add(`har.ahtipi = 'A'`, 'har.kontorsayi > 0', `har.fatdurum <> 'X'`, 'har.btamamlandi = 0')
		// wh.inDizi(['', 'M', 'A', 'B'], 'har.fatdurum')
		sahalar.add('fis.mustkod', 'mus.vkn', 'mus.aciklama mustunvan', 'mus.bayikod', 'bay.anabayikod', 'abay.onmuhmustkod', 'har.*')
		/*.addWithAlias('har', 'tarih', 'fisnox', 'kontorsayi', 'vkn', 'tcsorguterminal', 'tcsorguanahtar')*/
		let orderBy = ['tarih', 'fisnox'], stm = new MQStm({ sent, orderBy })
		let kRecs = e.kRecs = await app.sqlExecSelect(stm)
		e.abortFlag = false
		let abortCheck = e.abortCheck = () => {
			if (e.abortFlag)
				throw { rc: 'userAbort' }
		}
		let mesaj = `<p>Alınan ${tipAdi} Kontörler, faturalaştırılıyor...</p>`;
		let pm = e.pm = showProgress(mesaj, null, true,
			 ({ close }) => e.abortFlag = true, undefined, false
		).progressNoValue()
		pm?.setProgressMax((kRecs.length * 3) + 3)
		pm?.setProgressValue(0); pm?.progressStep(3); abortCheck?.()
		if (!kRecs.length) {
			hConfirm(`ERP'ye işlenecek kontör kaydı bulanamadı`, islemAdi)
			hideProgress(); delete this._hTimer_faturalastir
			return false
		}
		clearTimeout(this._hTimer_faturalastir); delete this._hTimer_faturalastir
		let db2Tip2Must2Recs = {}, vknSet = {}, kontrolVKNSet = {}, errors = e.errors ??= []
		$.extend({ vknSet, kontrolVKNSet })
		for (let rec of kRecs) {
			abortCheck?.(); let {mustkod: mustKod, mustunvan: mustUnvan, fatdurum: fatDurum, vkn} = rec
			let {anabayikod: anaBayiKod, onmuhmustkod: onMuhMustKod} = rec
			if (fatDurum == 'A') {
				if (!onMuhMustKod) {
					errors.push(
						`<b><span class=lightgray>(${mustKod})</span> ` +
						`<span class=royalblue>${mustUnvan}</span></b> müşterisine ait ` +
							`<b class=orangered>${anaBayiKod}</b> kodlu Ana Bayi tanımında `
							`<b class=firebrick>Ön Muh. Cari kodu</b> değeri boş durumdadır`
					)
					continue
				}
			}
			else {
				if (!vkn) {
					errors.push(
						`<b><span class=lightgray>(${mustKod})</span> ` +
						`<span class=royalblue>${mustUnvan}</span></b> müşterisi için ` +
							`<b class=firebrick>VKN</b> değeri boş durumdadır`
					);
					continue
				}
			}
			let {dbNames} = app
			let db = dbNames[fatDurum == 'B' ? 'skylog' : 'polen']
			let tip2Must2Recs = db2Tip2Must2Recs[db] = db2Tip2Must2Recs[db] ?? {}
			let must2Recs = tip2Must2Recs[fatDurum] = tip2Must2Recs[fatDurum] ?? {}
			; (must2Recs[mustKod] = must2Recs[mustKod] ?? []).push(rec)
			vknSet[vkn] = true
			if (fatDurum != 'A')
				kontrolVKNSet[vkn] = true
			pm?.progressStep()
		}
		abortCheck?.()
		$.extend(e, { vknListe: keys(vknSet), kontrolVKNListe: keys(kontrolVKNSet) })
		let ekMesaj = errors?.length ? `<p/><hr/><h5>Ek Bilgiler:</h5><ul>${errors.map(x => `<li>${x}</li>`)}</ul>` : ''
		let tumFisler = [], totalCount = 0
		try {
			for (let [db, tip2Must2Recs] of entries(db2Tip2Must2Recs)) {
				let _e = { ...e, db, tip2Must2Recs, tumFisler, totalCount }
				await this.kontor_topluFaturalastir(_e)
				totalCount = _e.totalCount
			}
			if (!tumFisler?.length) {
				hConfirm(`<br/><b class=red>ERP'ye işlenecek bilgi yok</b>${ekMesaj}`, islemAdi)
				hideProgress(); delete this._hTimer_faturalastir
				return false
			}
		}
		finally { part.tazele() }
		pm?.progressEnd().showAbortButton().setAbortText('TAMAM')
		delete this._hTimer_importRecords_progress; hideProgress();
		eConfirm((
			`<br/><ul>` +
			`<li><b class=royalblue>${totalCount}</b> adet <b class=royalblue>Kontör Alım Hareketi</b> için<p/></li>` +
			`<li>ERP tarafında <b class=forestgreen>${tumFisler?.length ?? 0}</b> adet <b class=forestgreen>Belge</b> oluşturuldu</li>` +
			`</ul>${ekMesaj}`
		), islemAdi)
		/* this._hTimer_importRecords_progress = setTimeout(() => { hideProgress(); delete this._hTimer_importRecords_progress }, 5000) */
		return true
	}
	static async kontor_topluFaturalastir(e) {
		let {db, tip2Must2Recs, tumFisler, kontrolVKNListe, pm, abortCheck, errors} = e
		let {vioHizmetKod: shKod, acikIslKodPrefix, detayTable} = this
		let kontrolMustKodSet = {}
		for (let [fatDurum, must2Recs] of entries(tip2Must2Recs)) {
			if (fatDurum == 'X' || fatDurum == 'A')
				continue
			for (let [rec] of values(must2Recs)) {
				let {onmuhmustkod: kod} = rec
				if (kod)
					kontrolMustKodSet[kod] = true
			}
		}
		let kontrolMustKodListe = keys(kontrolMustKodSet)
		let vkn2Must = {}, must2VKN = {}, efatVKNSet = {}, hizRec = {};
		let withFatDBDo = block => app.onMuhDBDo(db, block);
		await withFatDBDo(async e => {
			;{
				let sent = new MQSent(), {where: wh, sahalar} = sent
				sent.fromAdd('carmst')
				wh.add(new MQOrClause()
					.inDizi(kontrolVKNListe, 'vkno')
					.inDizi(kontrolMustKodListe, 'must')
				)
				wh.add(`must <> ''`, `silindi = ''`, `calismadurumu <> ''`, `vkno <> ''`)
				sahalar.add('must', 'efaturakullanirmi efatmi', 'vkno vkn')
				for (let {vkn, must, efatmi} of await app.sqlExecSelect(sent)) {
					vkn2Must[vkn] = must; must2VKN[must] = vkn
					if (asBool(efatmi))
						efatVKNSet[vkn] = true
				}
			;}
			{
				let sent = new MQSent(), {where: wh, sahalar} = sent
				sent.fromAdd('hizmst'); wh.degerAta(shKod, 'kod')
				sahalar.add('brm', 'birimfiyat fiyat', 'gelkdvhesapkod kdvKod')
				hizRec = await app.sqlExecTekil(sent)
			}
		});

		let fisler = e.fisler = []
		let fis
		for (let [fatDurum, must2Recs] of entries(tip2Must2Recs)) {
			if (fatDurum == 'X')
				continue
			let aciktanmi = fatDurum != 'B'    /* 'Fatura Edilecek' dışındakiler */
			for (let [mustKod, recs] of entries(must2Recs)) {
				if (!recs?.length)
					continue
				let tRec = recs[0], {vkn} = tRec
				let {mustunvan: mustUnvan, bayikod: bayiKod, anabayikod: anaBayiKod, onmuhmustkod: onMuhMustKod} = tRec
				let eFatmi = efatVKNSet[vkn] ?? false, tarih = today()
				let ozelIsaret = aciktanmi ? '*' : '', islKod = aciktanmi ? `BK${acikIslKodPrefix}` : `TF${ozelIsaret}`
				let seriSelectorPostfix = ozelIsaret == '*' ? 'yildizli' : eFatmi ? 'eFat' : 'eArsiv'
				let efAyrimTipi = eFatmi ? 'E' : 'A'
				let seri = this[`vioSeri_${seriSelectorPostfix}`]
				seri = this.getConvertedVIOSeri(seri, db)
				let fisSinif = aciktanmi ? CariTopluIslemFis : SatisFaturaFis
				let detaySinif = aciktanmi ? fisSinif.detaySinif : TSHizmetDetay
				let ackPrefix = 'SkyKontör', ackInnerMaxLength = 50 - (ackPrefix.length + 4)
				let baslikAciklama = aciktanmi ? ackPrefix : `${ackPrefix}: ${`${mustKod}-${mustUnvan}`.slice(0, ackInnerMaxLength)}`
				let fisKontorBilgiDuzenle = () =>
					fis._kontorBilgi = { aciktanmi, fatDurum, mustKod, mustUnvan, vkn, bayiKod, anaBayiKod, onMuhMustKod }
				abortCheck?.()
				if (aciktanmi) {
					/* !! Açıktan için Tüm Müşteriler aynı fiş içindedir */
					if (fis == null) {
						fis = new fisSinif({ ozelIsaret, islKod, tarih, baslikAciklama })
						fisKontorBilgiDuzenle()
					}
				}
				else {
					fis = new fisSinif({ ozelIsaret, islKod, tarih, seri, efAyrimTipi, baslikAciklama })
					fisKontorBilgiDuzenle()
				}
				for (let rec of recs) {
					abortCheck?.()
					let {kaysayac: sayac} = rec, {fisnox: fisNox, kontorsayi: miktar} = rec
					let {fiyat} = hizRec, bedel = aciktanmi ? roundToBedelFra(miktar * fiyat) : null
					let detAciklama = aciktanmi
						? `${ackPrefix}: ${`${mustKod}-${mustUnvan}`.slice(0, ackInnerMaxLength)}`
						: `Ref.No: ${fisNox}`
					let det = aciktanmi
						? new detaySinif({ bedel, detAciklama })
						: new detaySinif({ shKod, miktar, ...hizRec, detAciklama })
					det._kontorBilgi = { ...fis._kontorBilgi, sayac, fisNox }
					if (!aciktanmi) {
						if (fis.ozelIsaret == '*')
							det.kdvKod = ''
						det.bedelHesapla?.()
					}
					fis.addDetay(det)
					e.totalCount++
				}
				fisler.push(fis)
				tumFisler?.push(fis)
			}
		}
		abortCheck?.()
		let toplu = e.toplu = new MQToplu()
		try {
			await withFatDBDo(async () => {
				let _toplu = new MQToplu()
				for (let fis of fisler) {
					let {fatDurum, mustKod: must, mustUnvan, vkn} = fis._kontorBilgi
					if (fatDurum == 'X' || fatDurum == 'A' || !fis?.detaylar?.length)
						continue
					if (!vkn || vkn2Must[vkn])
						continue
					let sahismi = vkn?.length == 11
					let vnumara = sahismi ? '' : vkn, tckimlikno = sahismi ? vkn : ''
					let unvan1 = `**SkyPortal Akt: ${must}`
					let unvan2 = mustUnvan.slice(0, 50)
					_toplu.add(new MQInsert({
						table: 'carmst',
						hv: {
							must, unvan1, unvan2,
							sahismi: bool2FileStr(sahismi), vnumara, tckimlikno
						}
					}))
					must2VKN[must] = vkn
					vkn2Must[vkn] = must
					errors.push(
						`<b><span class=lightgray>(${must})</span> <span class=royalblue>${mustUnvan}</span></b> müşterisi ` + 
						`<b class=forestgreen>${vkn}</b> VKN ile ERP Veritabanında <u>yeni cari kaydı</u> açıldı`
					)
				}
				if (_toplu.liste.length)
					await app.sqlExecNone(_toplu)
				_toplu = null

				for (let fis of fisler) {
					let {detaylar} = fis
					if (!detaylar?.length)
						continue
					let {aciktanmi, fatDurum, mustKod, onMuhMustKod, vkn} = fis._kontorBilgi
					if (fatDurum == 'X')
						continue
					let refMustKod = fatDurum == 'A' ? onMuhMustKod : vkn2Must[vkn]
					if (!refMustKod)
						continue
					if (aciktanmi) {
						for (let det of fis.detaylar)
							det.mustKod = refMustKod
					}
					else
						fis.mustKod = refMustKod
					await fis.disKaydetIslemi()
					let sayacListe = fis.detaylar
						.map(({ _kontorBilgi: _ }) => _.sayac)
						.filter(Boolean)
					if (sayacListe.length) {
						toplu.add(new MQIliskiliUpdate({
							from: detayTable, set: `btamamlandi = 1`,
							/* set: { degerAta: 'X', saha: 'fatdurum' }, */
							where: { inDizi: sayacListe, saha: 'kaysayac' }
						}))
					}
					pm?.progressStep()
					abortCheck?.()
				}
			})
		}
		finally {
			pm?.hideAbortButton()
			let size = toplu?.liste?.length ?? 0
			if (size) {
				await app.sqlExecNone(toplu)
				pm?.progressStep(size)
				toplu.liste = []
			}
		}
		return true
	}
	static async importRecordsIstendi(e = {}) {
		let {tipAdi} = this
		let islemAdi = e.islemAdi = `${tipAdi} İçeri Al`
		let tarih = e.tarih = asDate('01.06.2025')
		let mesaj = `<p class="firebrick"><b>${dateKisaString(tarih)}</b> tarihinden itibaren olan ${tipAdi} Kayıtları içeri alınacak</p><p>Devam edilsin mi?</p>`
		if (await ehConfirm(mesaj, islemAdi)) {
			try { await this.importRecords(e) }
			catch (ex) {
				hideProgress();
				if (ex.rc != 'userAbort')
					hConfirm(getErrorText(ex), islemAdi)
				throw ex
			}
		}
		return this
	}
	static async kontor_ekle({ islemAdi, inst, part }) {
		let {mustKod, kontorSayi, fatDurum, tamamlandimi} = inst;  /*, tahseklino = inst.tahSekliNo || 0 */
		if (!mustKod) { hConfirm('<b>Müşteri</b> belirtilmelidir', islemAdi); return false }
		let mesaj = await MQLogin_Musteri.kodYoksaMesaj(mustKod); if (mesaj) { hConfirm(mesaj, islemAdi); return false }
		if ((kontorSayi ?? 0) <= 0) { hConfirm('<b>Kontör Sayısı</b> geçersizdir', islemAdi); return false }
		let {tip, table, detayTable} = this;
		let ahtipi = 'A', tarih = today(), mustkod = mustKod;
		let kontorsayi = kontorSayi, fatdurum = fatDurum.char ?? fatDurum, btamamlandi = bool2Int(tamamlandimi);
		let {newFisNox: fisnox} = this;
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
			new MQInsert({ table: detayTable, hv: { fissayac: '@fisSayac'.sqlConst(), ahtipi, tarih, fisnox, kontorsayi, fatdurum, btamamlandi /* tahseklino */ } })
		]).withDefTrn();
		let params = [{ name: '@fisSayac', type: 'int', direction: 'output' }];
		let result = await app.sqlExecNoneWithResult({ query, params }); part?.tazele();
		return result
	}
	static async importRecords(e) { return null }
	static getConvertedVIOSeri(seri, db) {
		if (seri?.length == 3) {
			let {polen: postfix} = app.dbNames
			postfix = postfix.slice(4)
			if (db?.endsWith(postfix))
				return `${seri[0]}P${seri[2]}`
		}
		return seri
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
			tamamlandimi: new PInstBitBool('btamamlandi'), /* tahSekliNo: new PInstNum('tahseklino'), */
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
		if (rec.btamamlandi) { result.push('tamamlandi') }
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {tableAlias: alias} = this, {current: login} = MQLogin;
		if (login.yetkiVarmi('degistir')) {
			liste.push(new GridKolon({ belirtec: 'degistir', text: ' ', genislikCh: 5 }).noSql().tipButton('D').onClick(e => this.kontor_degistirIstendi(e))) }
		if (login.yetkiVarmi('sil') || login.sefmi) {
			liste.push(new GridKolon({ belirtec: 'sil', text: ' ', genislikCh: 5 }).noSql().tipButton('X').onClick(e => this.kontor_silIstendi(e))) }
		liste.push(...[
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 15 }).tipDate(),
			new GridKolon({
				belirtec: 'ahtipitext', text: 'A/H Tip', genislikCh: 13, filterType: 'checkedlist',
				sql: KontorAHTip.getClause(`${alias}.ahtipi`)
			}),
			new GridKolon({ belirtec: 'fisnox', text: 'Fiş No', genislikCh: 23 }),
			new GridKolon({ belirtec: 'kontorsayi', text: 'Kontör', genislikCh: 10 }).tipDecimal(0),
			new GridKolon({ belirtec: 'btamamlandi', text: 'Tamam?', genislikCh: 10 }).tipBool(),
			new GridKolon({
				belirtec: 'fatdurumtext', text: 'Fat.Durum', genislikCh: 18, filterType: 'checkedlist',
				sql: KontorFatDurum.getClause(`${alias}.fatdurum`),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					let {ahtipi: ahTipi, fatdurum: fatDurum} = rec;
					if (!(fatDurum || ahTipi == 'A')) { html = changeTagContent(html, (value = '')) }
					return html
				}
			}),
			/*new GridKolon({ belirtec: 'tahseklino', text: 'Tah.No', genislikCh: 8 }).tipNumerik().sifirGosterme(),
			new GridKolon({ belirtec: 'tahsekliadi', text: 'Tah. Şekli Adı', genislikCh: 15, sql: 'tsek.aciklama' })*/
		].filter(x => !!x))
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {tableAlias: alias} = this, {sahalar, where: wh} = sent, {orderBy} = stm;
		sent.har2TahSekliBagla();
		sahalar.add(`${alias}.ahtipi`, `${alias}.fatdurum`, `${alias}.btamamlandi`);  /*, `${alias}.tahseklino`)*/
		orderBy.liste = ['ahtipi', 'tarih DESC', 'fisnox DESC']
	}
	static rootFormBuilderDuzenle_kontor({ rfb, fbd_form: parentForm, inst, islem }) {
		let {fatDurum, tamamlandimi} = inst, degistirmi = islem == 'degistir';
		let form = parentForm.addFormWithParent().altAlta();
		let fbd_must = form.addModelKullan('mustKod', 'Müşteri').comboBox().setMFSinif(MQLogin_Musteri).autoBind()
			.ozelQueryDuzenleHandler(({ stm, aliasVeNokta, mfSinif }) => {
				let {kodSaha} = mfSinif, clauses = { musteri: `${aliasVeNokta}${kodSaha}`, bayi: `${aliasVeNokta}bayikod` };
				for (let sent of stm) {
					let {where: wh} = sent;
					wh.add(`${aliasVeNokta}aktifmi <> ''`);
					MQLogin.current.yetkiClauseDuzenle({ sent, clauses })
				}
			});
		if (degistirmi) { fbd_must.disable() }
		form = parentForm.addFormWithParent().yanYana();
		form.addNumberInput('kontorSayi', 'Kontör Sayı').addStyle_wh(130)
			.degisince(({ builder: fbd }) => fbd.parentBuilder.id2Builder.fatDurum.updateVisible())
			.onAfterRun(({ builder: fbd }) => fbd.input.focus());
		let fbd_fatDurum = form.addModelKullan('fatDurum', 'Fatura Durum').listedenSecilmez().addStyle_wh(250)
			.dropDown().noMF().kodsuz().bosKodAlinmaz().autoBind().setSource(fatDurum.kaListe)
			.setVisibleKosulu(({ builder: fbd }) => fbd.altInst.ahTipi.alinanmi);
		let fbd_chkTamamlandi = form.addCheckBox('tamamlandimi', 'Tamamlandı')
			.addStyle(`$elementCSS { margin: 37px 0 0 30px !important } $elementCSS > input:checked + label { font-weight: bold !important; color: firebrick !important }`);
		if (tamamlandimi && !MQLogin.current.adminmi) {
			fbd_fatDurum.veriYukleninceBlock(({ builder: fbd }) => fbd.part.disable());
			fbd_chkTamamlandi.readOnly()
		}
		/*let fbd_tahSekli = form.addModelKullan('tahSekliNo', 'Tahsilat Şekli').listedenSecilmez().addStyle_wh(250)
			.dropDown().setMFSinif(MQVPTahSekli).kodsuz().autoBind()
			.setVisibleKosulu(({ builder: fbd }) => fbd.altInst.ahTipi.alinanmi && config.dev);*/
		rfb.onAfterRun(({ builder: rfb }) => {
			rfb.layout.on('keyup', evt => {
				let key = evt.key.toLowerCase(), {islemTuslari} = rfb.id2Builder;
				if (key == 'enter' || key == 'linefeed') { islemTuslari.layout.find('button#tamam').click() }
			})
		})
	}
	static kontor_degistirIstendi(e) {
		let islem = e.islem = 'degistir', islemAdi = e.islemAdi = 'Kontör Düzenle';
		let {sender: part, parentRec, rec, inst} = e, parentPart = e.parentPart ?? part.parentPart, detaySinif = this;
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
		let form = e.fbd_form = rfb.addFormWithParent('form').altAlta();
		this.rootFormBuilderDuzenle_kontor(e); rfb = e.rfb; rfb.run();
		wnd = createJQXWindow({ title: islemAdi, content: rfb.layout, args: { isModal: false, width: 800, height: 290 } });
		return true
	}
	static async kontor_degistir({ islemAdi, inst, part }) {
		let {fisSayac, okunanHarSayac: sayac, prevKontorSayi, kontorSayi, fatDurum, tamamlandimi} = inst;  /*, tahSekliNo = inst.tahSekliNo || 0*/
		let {tip, table} = MQKontor, {table: detayTable} = this;
		let kontorFark = kontorSayi - (prevKontorSayi ?? 0); fatDurum = fatDurum?.char ?? fatDurum;
		let query = new MQToplu([
			new MQIliskiliUpdate({
				from: table, set: `topalinan = topalinan + ${kontorFark.sqlServerDegeri()}`,
				where: { degerAta: fisSayac, saha: 'kaysayac' }
			}),
			new MQIliskiliUpdate({
				from: detayTable, set: [
					{ degerAta: kontorSayi, saha: 'kontorsayi' },
					{ degerAta: fatDurum, saha: 'fatdurum' },
					{ degerAta: tamamlandimi, saha: 'btamamlandi' }
					// { degerAta: tahSekliNo, saha: 'tahseklino' }
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
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 11 }).tipDate().zorunlu(),
			new GridKolon({ belirtec: 'ahTipi', text: 'A/H Tip', genislikCh: 18, filterType: 'checkedlist' }).tipTekSecim({ tekSecimSinif: KontorAHTip }).kodsuz().autoBind().zorunlu(),
			new GridKolon({ belirtec: 'fisNox', text: 'Fiş No', genislikCh: 25 }).zorunlu(),
			new GridKolon({ belirtec: 'kontorSayi', text: 'Kontör', genislikCh: 9 }).tipDecimal(0).zorunlu(),
			new GridKolon({ belirtec: 'fatDurum', text: 'Fat.Durum', genislikCh: 20 }).tipTekSecim({ tekSecimSinif: KontorFatDurum }).kodsuz().autoBind().zorunlu(),
			new GridKolon({ belirtec: 'tcSorgu_anahtar', text: 'Turmob: Token', genislikCh: 35 }),
			new GridKolon({ belirtec: 'tcSorgu_vkn', text: 'Turmob: VKN', genislikCh: 14 }),
			new GridKolon({ belirtec: 'tcSorgu_terminal', text: 'Turmob: Terminal', genislikCh: 20 })
		])
	}
	geriYuklemeIcinUygunmu({ zorunluBelirtecler, detay: det, index: rowIndex, belirtec, focusTo }) {
		let zorunluAttrListe = keys(zorunluBelirtecler), satirNo = rowIndex + 1
		for (let belirtec of zorunluAttrListe) {
			if (det[belirtec]) { continue }
			return { isError: true, errorText: `<b>${satirNo}.</b> satırdaki <b>${belirtec}</b> bilgisi boş olamaz`, returnAction: e => e.focusTo({ rowIndex, belirtec }) }
		}
		return super.geriYuklemeIcinUygunmu(...arguments)
	}
}

class MQKontor_EBelge extends MQKontor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'BL' } static get detaySinif() { return MQKontorDetay_EBelge }
	static get acikIslKodPrefix() { return 'BL' } static get vioHizmetKod() { return 'H034' }
}
class MQKontorDetay_EBelge extends MQKontorDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class MQKontor_Turmob extends MQKontor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'TR' } static get detaySinif() { return MQKontorDetay_Turmob }
	static get acikIslKodPrefix() { return 'TC' } static get vioHizmetKod() { return 'H035' }
	static get faturalastirmaYapilirmi() { return true }
	static async importRecords({ islemAdi, tarih }) {
		await super.importRecords(...arguments);
		clearTimeout(this._hTimer_importRecords_progress); delete this._hTimer_importRecords_progress;
		let ProgressMax = 14, {tip, tipAdi} = this, {table, detayTable} = this;
		let tokens = config.getWSUrlBase().split(':'); tokens[tokens.length - 1] = 8119;
		let url = `${tokens.join(':').trim(' ', '\t', '/')}/ws/turmob/log/?tarihBasi=${asReverseDateString(tarih)}`;
		let abortFlag = false, abortCheck = () => { if (abortFlag) { throw { rc: 'userAbort' } } };
		let mesaj = `<p>${tipAdi} Servisinden veri yükleniyor...</p><p style="margin-left: 20px"><b class="royalblue" font-size: "80%">${url}</b></p>`;
		let pm = showProgress(mesaj, null, true, ({ close }) => abortFlag = true, undefined, false);
		pm?.setProgressMax(ProgressMax).progressNoValue();
		let remoteRecs = await ajaxPost({ url }); pm?.setProgressValue(0); pm?.progressStep(4); abortCheck?.();
		let mustKodListe = keys(asSet(remoteRecs.map(({ mustKod }) => mustKod)));
		let getKontorBaslikSent = (mustKodListe, sahalar) =>
			new MQSent({
				from: `${table} fis`, sahalar,
				where: [`fis.tip = '${tip}'`, { inDizi: $.makeArray(mustKodListe), saha: 'fis.mustkod' }]
			});
		let sent = getKontorBaslikSent(mustKodListe, ['fis.mustkod', 'har.fisnox']).distinctYap();
		sent.fromIliski(`${detayTable} har`, 'har.fissayac = fis.kaysayac');
		let portalRecs = await app.sqlExecSelect(sent), portalMust2FisNoxSet = {};
		for (let {mustkod, fisnox} of portalRecs) {
			let fisNoxSet = portalMust2FisNoxSet[mustkod] = portalMust2FisNoxSet[mustkod] ?? {};
			fisNoxSet[fisnox] = true
		}
		let must2FisNox2HVYapi = {}, fissayac = '@fisSayac'.sqlConst();
		for (let rec of remoteRecs) {
			let {mustKod: mustkod} = rec; if (!mustkod) { continue }
			let portalFisNoxSet = portalMust2FisNoxSet[mustkod] = portalMust2FisNoxSet[mustkod] ?? {};
			let ahtipi = 'H', kontorsayi = 1, tarih = asDate(rec.sorguTS), {remoteIP: tcsorguterminal, turmobToken: tcsorguanahtar, vkn: tcsorguvkn} = rec;
			let fisnox = `TH1${tarih.toString('yyyyMMddHHmmss')}`;
			if (portalFisNoxSet[fisnox]) { continue }
			let fisNox2HVYapi = must2FisNox2HVYapi[mustkod] ?? {};
			let hvYapi = fisNox2HVYapi[fisnox] ?? { baslik: { tip, mustkod }, detaylar: [] };
			let {detaylar} = hvYapi; if (portalFisNoxSet[fisnox]) { continue }
			detaylar.push({ fissayac, ahtipi, tarih, fisnox, kontorsayi, tcsorguterminal, tcsorguanahtar, tcsorguvkn });
			portalFisNoxSet[fisnox] = true; fisNox2HVYapi[fisnox] = fisNox2HVYapi[fisnox] ?? hvYapi;
			must2FisNox2HVYapi[mustkod] = must2FisNox2HVYapi[mustkod] ?? fisNox2HVYapi;
			if (pm) { pm.progressMax++ } abortCheck?.()
		}
		pm?.progressStep(2); abortCheck?.();
		if ($.isEmptyObject(must2FisNox2HVYapi)) {
			hideProgress(); displayMessage('Yüklenecek bilgi bulunamadı', islemAdi);
			return null
		}
		let must2HVYapilar = [];
		for (let [mustKod, fisNox2HVYapi] of entries(must2FisNox2HVYapi)) {
			let hvYapilar = must2HVYapilar[mustKod] = must2HVYapilar[mustKod] ?? [];
			hvYapilar.push(...values(fisNox2HVYapi))
		}
		let toplu, topluOlustur = () => toplu = new MQToplu(['DECLARE @fisSayac INT']).withDefTrn();
		topluOlustur(); let BlockSize = 100, totalCount = 0;
		for (let [mustKod, hvYapilar] of entries(must2HVYapilar)) {
			let {baslik: basHV} = hvYapilar[0];
			toplu.add(
				`IF NOT EXISTS (${getKontorBaslikSent(mustKod, '*')}) BEGIN`,
					new MQQueryInsert({ table, hv: basHV }), ' END',
				getKontorBaslikSent(mustKod, '@fisSayac = MAX(kaysayac)')
			);
			let topHarcanan = 0; for (let {detaylar: detHVListe} of hvYapilar) {
				abortCheck?.(); topHarcanan += topla(rec => rec.kontorsayi, detHVListe); 
				toplu.add( new MQQueryInsert({ table: detayTable, hvListe: detHVListe }))
			}
			toplu.add(
				new MQIliskiliUpdate({
					from: table, where: `kaysayac = @fisSayac`,
					set: `topharcanan = topharcanan + ${topHarcanan.sqlServerDegeri()}`
				})
			)
			if (++totalCount % (BlockSize + 1) == BlockSize) {
				pm?.setEkBilgiText('VT Kayıt'); await app.sqlExecNone(toplu);
				pm?.setEkBilgiText(''); topluOlustur(); pm?.progressStep(BlockSize)
			}
		}
		pm?.progressStep(2); abortCheck?.(); pm?.hideAbortButton();
		pm?.setEkBilgiText('VT Kayıt'); await app.sqlExecNone(toplu);
		pm?.setEkBilgiText(''); pm?.progressStep(5);
		pm?.setText('Veri yükleme tamamlandı!')?.progressEnd()?.showAbortButton()?.setAbortText('TAMAM');
		this._hTimer_importRecords_progress = setTimeout(() => { hideProgress(); delete this._hTimer_importRecords_progress }, 5000);
		return remoteRecs
	}
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
