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
	static get gridHeight_bosluk() { return 90 }
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
				fatDurumSecim: new SecimBirKismi({ etiket: 'Fat. Durum', tekSecim: new KontorFatDurum().secimYok() }).birKismi().autoBind()
			})
			.addKA('must', MQLogin_Musteri, `${alias}.mustkod`, 'mus.aciklama')
			.addKA('bayi', MQLogin_Bayi, 'mus.bayikod', 'bay.aciklama')
			.addKA('il', MQVPIl, 'mus.ilkod', 'il.aciklama')
		sec.whereBlockEkle(({ secimler: sec, sent, where: wh }) => {
			let {fatDurumSecim} = sec;
			if (sent && !$.isEmptyObject(fatDurumSecim.value)) {
				let {from} = sent, {detayTable} = this;
				if (!from.aliasIcinTable('har')) { sent.fromIliski(`${detayTable} har`, `har.fissayac = ${alias}.kaysayac`) }
				wh.degerAta('A', 'har.ahtipi').add('har.kontorsayi > 0');
				wh.birKismi(fatDurumSecim, 'har.fatdurum')
			}
		})
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
			`$elementCSS { --header-height: 80px !important; --toolbarItem-top: -12px; --toolbarItem-leftEk: ${config.dev ? 210 : 0}px }
			$elementCSS .islemTuslari { overflow: hidden !important; margin-bottom: -15px !important }
		`);
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
				.addStyle(`$elementCSS { top: calc(0px - (var(--islemTuslari-height) + var(--toolbarItem-top))); left: calc(300px + var(--toolbarItem-leftEk))}`);
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
			form.addButton('kontorEkle', '+')
				.addStyle_wh(80).addStyle(`$elementCSS { min-width: unset !important }`)
				.onClick(async e => {
					try { await this.kontor_yeniIstendi(e) }
					catch (ex) { hConfirm(getErrorText(ex), 'Kontör Satışı'); throw ex }
			})
		}
		if ((login.adminmi || login.sefmi) && this.faturalastirmaYapilirmi) {
			rfb.addButton('faturalastir', 'FAT').setParent(islemTuslari)
				.addCSS('absolute').addStyle_wh(90)
				.addStyle(`$elementCSS { top: calc(0px - (var(--islemTuslari-height) + var(--toolbarItem-top) - 3px)); left: calc(230px + var(--toolbarItem-leftEk))}`)
				.onClick(async e => {
					try { await this.kontor_topluFaturalastirIstendi(e) }
					catch (ex) { hConfirm(getErrorText(ex), 'Kontör Faturalaştır'); throw ex }
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
		liste.push('mustkod', 'mustadi', 'bayikod', 'topalinan', 'topharcanan', 'topkalan')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); liste.push(...[
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 15 }),
			new GridKolon({ belirtec: 'mustadi', text: 'Müşteri Adı', genislikCh: 50, sql: 'mus.aciklama' }),
			new GridKolon({ belirtec: 'bayikod', text: 'Bayi', genislikCh: 13, sql: 'mus.bayikod' }),
			new GridKolon({ belirtec: 'bayiadi', text: 'Bayi Adı', genislikCh: 25, sql: 'bay.aciklama' }),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 20, sql: 'mus.yore' }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8, sql: 'mus.ilkod' }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 20, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'tanitim', text: 'Tanıtım', genislikCh: 43, sql: 'mus.tanitim' }),
			new GridKolon({ belirtec: 'topalinan', text: 'Top.Alınan', genislikCh: 13 }).tipDecimal(0),
			new GridKolon({ belirtec: 'topharcanan', text: 'Top.Harcanan', genislikCh: 13 }).tipDecimal(0),
			new GridKolon({ belirtec: 'topkalan', text: 'Top.Kalan', genislikCh: 18 }).tipDecimal(0)
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
		let form = e.fbd_form = rfb.addFormWithParent('form').yanYana();
		this.rootFormBuilderDuzenle_kontor(e); rfb = e.rfb; rfb.run();
		wnd = createJQXWindow({ title: islemAdi, content: rfb.layout, args: { width: 500, height: 200 } });
		return true
	}
	static async kontor_topluFaturalastirIstendi(e) {
		let islemAdi = e.islemAdi = 'Kontör Faturalaştır';
		let {part} = e.builder.rootBuilder, {current: login} = MQLogin;
		let recs = e.recs ?? part.selectedRecs;
		clearTimeout(this._hTimer_faturalastir); delete this._hTimer_faturalastir;
		if (!(login.adminmi || login.sefmi)) { hConfirm('<b>Kontör Faturalaştırma</b> yetkiniz yok', islemAdi); return false }
		if (!login.yetkiVarmi('degistir')) { hConfirm('Kayıt <b>Değiştirme</b> yetkiniz yok', islemAdi); return false }
		if (!recs?.length) { hConfirm('Faturalaşacak kayıtlar seçilmelidir', islemAdi); return false }
		if (!await ehConfirm('Seçilen kayıtlara ait <b>Alınan Faturalaşmamış</b> olan Kontörler için Faturalar kesilecektir, devam edilsin mi?', islemAdi)) { return false }
		let fisSayacListe = recs.map(rec => rec.kaysayac);
		let {table, detayTable, varsayilanKeyHostVars: defKeyHV, tipAdi} = this;
		let sent = new MQSent(), {where: wh, sahalar} = sent;
		sent.fisHareket(table, detayTable).fromIliski('musteri mus', 'fis.mustkod = mus.kod');
		wh.birlestirDict(defKeyHV, 'fis').inDizi(fisSayacListe, 'fis.kaysayac');
		wh.add(`har.ahtipi = 'A'`, 'har.kontorsayi > 0').inDizi(['', 'M', 'B'], 'har.fatdurum');
		sahalar.add('fis.mustkod', 'mus.vkn', 'mus.aciklama mustunvan', 'mus.bayikod', 'har.*');    /*.addWithAlias('har', 'tarih', 'fisnox', 'kontorsayi', 'vkn', 'tcsorguterminal', 'tcsorguanahtar');*/
		let orderBy = ['tarih', 'fisnox'], stm = new MQStm({ sent, orderBy });
		let kRecs = await app.sqlExecSelect(stm); 
		let abortFlag = false, abortCheck = () => { if (abortFlag) { throw { rc: 'userAbort' } } };
		let mesaj = `<p>Alınan ${tipAdi} Kontörler, faturalaştırılıyor...</p>`;
		let pm = showProgress(mesaj, null, true, ({ close }) => abortFlag = true, undefined, false).progressNoValue();
		pm.setProgressMax((kRecs.length * 3) + 3);
		pm.setProgressValue(0); pm.progressStep(3); abortCheck();
		if (!kRecs.length) {
			hConfirm('Faturalaşacak kontör kaydı bulanamadı', islemAdi);
			hideProgress(); delete this._hTimer_faturalastir;
			return false
		}
		let must2Tip2Recs = {}; for (let rec of kRecs) {
			abortCheck(); let {mustkod: mustKod, fatdurum: fatDurum} = rec;
			let tip2Recs = must2Tip2Recs[mustKod] = must2Tip2Recs[mustKod] ?? {};
			(tip2Recs[fatDurum] = tip2Recs[fatDurum] ?? []).push(rec);
			pm.progressStep()
		}
		let withFatDBDo = block => app.setCurrentDBAndDo('YI25SKYLOGFAT', '(local)\\SKYLOG', e => block(e));
		abortCheck(); let orjSeri, {vioHizmetKod: shKod} = this, hizRec = {};
		let vknSet = {}; for (let tip2Recs of Object.values(must2Tip2Recs)) {
			for (let [fatDurum, recs] of Object.entries(tip2Recs)) {
				let {vkn} = recs?.[0] ?? {};
				if (vkn) { vknSet[vkn] = true }
			}
		}
		let vknListe = Object.keys(vknSet), vkn2Must = {}, must2VKN = {}, efatVKNSet = {};
		await withFatDBDo(async e => {
			{
				let sent = new MQSent(), {where: wh, sahalar} = sent;
				sent.fromAdd('carmst'); wh.inDizi(vknListe, 'vkno');
				sahalar.add('must', 'efaturakullanirmi efatmi', 'vkno vkn');
				for (let {vkn, must, efatmi} of await app.sqlExecSelect(sent)) {
					vkn2Must[vkn] = must; must2VKN[must] = vkn;
					if (asBool(efatmi)) { efatVKNSet[vkn] = true }
				}
			}
			{
				let sent = new MQSent(), {where: wh, sahalar} = sent;
				sent.fromAdd('hizmst'); wh.degerAta(shKod, 'kod');
				sahalar.add('brm', 'birimfiyat fiyat', 'gelkdvhesapkod kdvKod');
				hizRec = await app.sqlExecTekil(sent)
			}
		});
		let fisSinif = SatisFaturaFis, detaySinif = TSHizmetDetay;
		let fisler = []; for (let [mustKod, tip2Recs] of Object.entries(must2Tip2Recs)) {
			for (let [fatDurum, recs] of Object.entries(tip2Recs)) {
				if (!recs?.length) { continue }
				let {mustunvan: mustUnvan, bayikod: bayiKod, vkn} = recs[0]; if (fatDurum == 'X') { continue }
				let eFatmi = efatVKNSet[vkn], tarih = today();
				let ozelIsaret = fatDurum == '' || fatDurum == 'M' ? '*' : '', islKod = `TF${ozelIsaret}`;
				let seriSelectorPostfix = ozelIsaret == '*' ? 'yildizli' : eFatmi ? 'eFat' : 'eArsiv';
				let seri = this[`vioSeri_${seriSelectorPostfix}`], efAyrimTipi = eFatmi ? 'E' : 'A';
				let fis = new fisSinif({ ozelIsaret, islKod, tarih, seri, mustKod, efAyrimTipi, baslikAciklama: `SkyPortal Kontör Satışı: [${mustKod}]` });
				fis._kontorBilgi = { mustUnvan, bayiKod, fatDurum };
				for (let rec of recs) {
					abortCheck(); let {kaysayac: sayac /*tarih,*/} = rec;
					let {fisnox: fisNox, kontorsayi: miktar} = rec, ekAciklama = `Ref.No: ${fisNox}`;
					let det = new detaySinif({ shKod, miktar, ...hizRec, ekAciklama });
					if (fis.ozelIsaret == '*') { det.kdvKod = '' }
					det._kontorBilgi = { sayac, fisNox, vkn }; det.bedelHesapla();
					fis.addDetay(det)
				}
				fisler.push(fis)
			}
		}
		if (!fisler?.length) {
			hConfirm('Faturalaşacak bilgi yok', islemAdi);
			hideProgress(); delete this._hTimer_faturalastir;
			return false
		}
		abortCheck(); let toplu = new MQToplu();
		try {
			await withFatDBDo(async e => {
				let _toplu = new MQToplu(); for (let fis of fisler) {
					let {mustKod: must, detaylar} = fis; if (!detaylar?.length) { continue }
					let {vkn} = detaylar[0]._kontorBilgi; if (vkn2Must[vkn]) { continue }
					let {mustUnvan} = fis._kontorBilgi, sahismi = vkn.length == 11;
					let vnumara = sahismi ? '' : vkn, tckimlikno = sahismi ? vkn : '';
					let unvan1 = `**SkyPortal Akt: ${must}`;
					_toplu.add(new MQInsert({ table: 'carmst', hv: { must, unvan1, sahismi: bool2FileStr(sahismi), vnumara, tckimlikno } }));
					must2VKN[must] = vkn; vkn2Must[vkn] = must
				}
				if (_toplu.liste.length) { await app.sqlExecNone(_toplu) } _toplu = null;
				for (let fis of fisler) {
					let {mustkod, detaylar} = fis, {vkn} = detaylar[0]._kontorBilgi;
					let refMustKod = vkn2Must[vkn]; if (!refMustKod) { continue }
					fis.mustKod = refMustKod; await fis.disKaydetIslemi();
					let sayacListe = fis.detaylar.map(({ _kontorBilgi: item }) => item.sayac).filter(x => !!x);
					if (sayacListe.length) {
						toplu.add(new MQIliskiliUpdate({
							from: detayTable, set: { degerAta: 'X', saha: 'fatdurum' },
							where: { inDizi: sayacListe, saha: 'kaysayac' }
						}))
					}
					pm.progressStep(); abortCheck()
				}
			})
		}
		finally {
			pm.hideAbortButton();
			let size = toplu?.liste?.length ?? 0;
			if (size) {
				await app.sqlExecNone(toplu);
				pm?.progressStep(size); toplu.liste = []
				part.tazele()
			}
		}
		/*pm.setText('Faturalaştırma işlemi tamamlandı!')*/
		pm.progressEnd().showAbortButton().setAbortText('TAMAM');
		delete this._hTimer_importRecords_progress; hideProgress();
		eConfirm('Faturalaştırma işlemi tamamlandı!', islemAdi);
		/* this._hTimer_importRecords_progress = setTimeout(() => { hideProgress(); delete this._hTimer_importRecords_progress }, 5000); */
		return true
	}
	static async importRecordsIstendi(e) {
		e = e ?? {}; let {tipAdi} = this, islemAdi = e.islemAdi = `${tipAdi} İçeri Al`, tarih = e.tarih = asDate('01.06.2025');
		let mesaj = `<p class="firebrick"><b>${dateKisaString(tarih)}</b> tarihinden itibaren olan ${tipAdi} Kayıtları içeri alınacak</p><p>Devam edilsin mi?</p>`;
		if (await ehConfirm(mesaj, islemAdi)) {
			try { await this.importRecords(e) }
			catch (ex) {
				hideProgress();
				if (ex.rc != 'userAbort') { hConfirm(getErrorText(ex), islemAdi) }
				throw ex
			}
		}
		return this
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
	static async importRecords(e) { return null }
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
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 11 }).tipDate().zorunlu(),
			new GridKolon({ belirtec: 'ahTipi', text: 'A/H Tip', genislikCh: 18 }).tipTekSecim({ tekSecimSinif: KontorAHTip }).kodsuz().autoBind().zorunlu(),
			new GridKolon({ belirtec: 'fisNox', text: 'Fiş No', genislikCh: 25 }).zorunlu(),
			new GridKolon({ belirtec: 'kontorSayi', text: 'Kontör', genislikCh: 9 }).tipDecimal(0).zorunlu(),
			new GridKolon({ belirtec: 'fatDurum', text: 'Fat.Durum', genislikCh: 20 }).tipTekSecim({ tekSecimSinif: KontorFatDurum }).kodsuz().autoBind().zorunlu(),
			new GridKolon({ belirtec: 'tcSorgu_anahtar', text: 'Turmob: Token', genislikCh: 35 }),
			new GridKolon({ belirtec: 'tcSorgu_vkn', text: 'Turmob: VKN', genislikCh: 14 }),
			new GridKolon({ belirtec: 'tcSorgu_terminal', text: 'Turmob: Terminal', genislikCh: 20 })
		])
	}
	geriYuklemeIcinUygunmu({ zorunluBelirtecler, detay: det, index: rowIndex, belirtec, focusTo }) {
		let zorunluAttrListe = Object.keys(zorunluBelirtecler), satirNo = rowIndex + 1
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
	/*static get vioSeri_eFat() { return 'KSE' } vioSeri_eArsiv() { return 'KSA' }
	static get vioSeri_yildizli() { return 'KSX' }*/ static get vioHizmetKod() { return 'H034' }
}
class MQKontorDetay_EBelge extends MQKontorDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class MQKontor_Turmob extends MQKontor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'TR' } static get detaySinif() { return MQKontorDetay_Turmob }
	static get vioSeri_eFat() { return 'KSE' } vioSeri_eArsiv() { return 'KSA' }
	static get vioSeri_yildizli() { return 'KSX' } static get vioHizmetKod() { return 'H035' }
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
		pm.setProgressMax(ProgressMax).progressNoValue();
		let remoteRecs = await ajaxPost({ url }); pm.setProgressValue(0); pm.progressStep(4); abortCheck();
		let mustKodListe = Object.keys(asSet(remoteRecs.map(({ mustKod }) => mustKod)));
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
			pm.progressMax++; abortCheck()
		}
		pm.progressStep(2); abortCheck();
		if ($.isEmptyObject(must2FisNox2HVYapi)) {
			hideProgress(); displayMessage('Yüklenecek bilgi bulunamadı', islemAdi);
			return null
		}
		let must2HVYapilar = [];
		for (let [mustKod, fisNox2HVYapi] of Object.entries(must2FisNox2HVYapi)) {
			let hvYapilar = must2HVYapilar[mustKod] = must2HVYapilar[mustKod] ?? [];
			hvYapilar.push(...Object.values(fisNox2HVYapi))
		}
		let toplu, topluOlustur = () => toplu = new MQToplu(['DECLARE @fisSayac INT']).withDefTrn();
		topluOlustur(); let BlockSize = 100, totalCount = 0;
		for (let [mustKod, hvYapilar] of Object.entries(must2HVYapilar)) {
			let {baslik: basHV} = hvYapilar[0];
			toplu.add(
				`IF NOT EXISTS (${getKontorBaslikSent(mustKod, '*')}) BEGIN`,
					new MQQueryInsert({ table, hv: basHV }), ' END',
				getKontorBaslikSent(mustKod, '@fisSayac = MAX(kaysayac)')
			);
			let topHarcanan = 0; for (let {detaylar: detHVListe} of hvYapilar) {
				abortCheck(); topHarcanan += topla(rec => rec.kontorsayi, detHVListe); 
				toplu.add( new MQQueryInsert({ table: detayTable, hvListe: detHVListe }))
			}
			toplu.add(
				new MQIliskiliUpdate({
					from: table, where: `kaysayac = @fisSayac`,
					set: `topharcanan = topharcanan + ${topHarcanan.sqlServerDegeri()}`
				})
			)
			if (++totalCount % (BlockSize + 1) == BlockSize) {
				pm.setEkBilgiText('VT Kayıt'); await app.sqlExecNone(toplu);
				pm.setEkBilgiText(''); topluOlustur(); pm.progressStep(BlockSize)
			}
		}
		pm.progressStep(2); abortCheck(); pm.hideAbortButton();
		pm.setEkBilgiText('VT Kayıt'); await app.sqlExecNone(toplu);
		pm.setEkBilgiText(''); pm.progressStep(5);
		pm.setText('Veri yükleme tamamlandı!').progressEnd().showAbortButton().setAbortText('TAMAM');
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
