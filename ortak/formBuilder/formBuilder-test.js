
class TestButton extends SubPartBuilder {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	build(e) {
		super.build(e);

		const {parent, args} = this;
		const layout = this.layout = $(`<div><button id="${args.id}" class="bold">TEST 2 ${args.text}</button></div>`);
		const buttons = layout.find('button');
		buttons.jqxButton({ theme: theme, width: 150, height: 50 });
		buttons.on('click', evt =>
			displayMessage(evt.currentTarget.id, 'buton tıklandı'));
		layout.appendTo(parent);
	}

	applyStylesDevam(e) {
		super.applyStylesDevam(e);

		const {layout, styles} = this;
		const buttons = layout.find('button');
		styles.push(
			`${this.getCSSElementSelector(buttons)} { color: green; }`
		);
	}
}


class TestButtonFormBuilder extends FormBuilder {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	build(e) {
		super.build(e);

		const {parent, args} = this;
		const layout = this.layout = $(`<div class="flex-row"></div>`);
		layout.appendTo(parent);
	}

	applyStylesDevam(e) {
		super.applyStylesDevam(e);

		const {layout, styles} = this;
		styles.push(
			`${this.getCSSElementSelector(layout)} > div:not(:first-child) {
				   margin-left: 20px;
		   }`
		);
	}


	static testRun() {
		/*let layout = app.layout.find('.container');
		if (layout.length)
			layout.remove();
		layout = $(`<div class="container" style="position: absolute; top: 100px; left: 300px; background-color: aqua; width: 400px; height: 200px;"><h4>Test Form</h4></div>`);
		layout.appendTo(app.layout);*/
		
		const rfb = new RootFormBuilder({
			id: 'root-form',
			superPartClass: ModelTanimPart,
			layout: $(
				`<div>
					<div class="header">
						 <div class="islemTuslari"/>
				   </div>
				   <div class="form">
					   <div id="tabPanel">
							<ul class="tabs">
								<li id="genel">Genel</li>
								<li id="satis">Satış</li>
								<li id="alim">Alım</li>
							</ul>
							<div id="genel"/>
						    <div id="satis"/>
							<div id="alim"/>
					   </div>
				   </div>
				</div>`
			),
			isWindow: true,
			partInit: e => {
				e.part.hasTabPages = true
			},
			wndArgs: {
				isModal: true
			},
			wndArgsDuzenle: e => {
				const {wndArgs} = e;
				$.extend(wndArgs, {
					width: 800,
					height: 600
				})
			},
			afterRun: e => {
				const {builder} = e;
				const {wnd} = builder;
				if (wnd && wnd.length) {
					wnd.on('close', evt =>
						displayMessage(`window kapatıldı: [<b>${evt.currentTarget.id}</b>]<br/>builder-id: [<b>${builder.id}</b>]`))
				}
			},
			builders: [
				new FormBuilder({
					id: 'tanim-form',
					builders: [
						new FormBuilder({
							id: 'kaForm',
							parent: e =>
								e.builder.rootPart.form,
							layout: e => {
								return $(
									`<div class="_row altform-layout" data-notabs data-class="MQKATanimAltFormPart">
										<div class="_row">
											<label class="etiket">Kod:</label>
											<input class="kod" type="textbox" maxlength="20" placeholder="Kod"></input>
										</div>
										<div class="_row">
											<label class="etiket">Açıklama:</label>
											<input class="aciklama" type="textbox" maxlength="60" placeholder="Açıklama"></input>
										</div>
									</div>`
								)
							}
						}).autoAppendMode_prepend(),
						new FormBuilder({
							id: 'tanim-form-ek',
							parent: e =>
								e.builder.rootPart.tabPanel,
							builders: [
								new FormBuilder({
									id: 'tanim-form-ek-genel',
									parent: e =>
										e.builder.parentLayout.find('div#genel'),
									builders: [
										new TestButtonFormBuilder({
											builders: [
												new TestButton({ args: { id: 'btn1', text: '1. buton' }}),
												new TestButton({ args: { id: 'btn2', text: '2. buton' }})
											]
										}),
										new TestButtonFormBuilder({
											builders: [
												new TestButton({ args: { id: 'btn1', text: '1. buton' }}),
												new TestButton({ args: { id: 'btn2', text: '2. buton' }})
											]
										})
									]
								})
							]
						})
					]
				})
			]
		});
		rfb.run();
		
		return rfb;
	}
}


class FormBuilderTest2 extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }

	static async run(e) {
		e = e || {};
		const inst = new MQVergi({ kod: 'TAH18' });
		await inst.yukle();
		
		const part = new ModelTanimPart({
			islem: 'degistir',
			inst: inst,
			builder: new RootFormBuilder({
				id: 'root',
				init: e => {
					const {builder} = e;
					const {layout} = builder;
					/*builder.styles.push(
						`${builder.getCSSElementSelector(layout)} > *:not(:first-child) {
						    margin-left: 15px;
						}`
					);*/
				},
				partInit: e => {
					const {wndArgs} = e.part;
					wndArgs.width = 800
				},
				builders: [
					new FormBuilder_TanimForm({
						builders: [
							new FBuilderWithInitLayout({
								builders: [
									new FBuilder_TextInput({ id: 'kod', etiket: 'Kod' }),
									new FBuilder_TextInput({ id: 'aciklama', etiket: 'Açıklama' }).etiketGosterim_placeholder(),
									new FBuilder_SwitchButton({ id: 'toggle1', etiket: 'Toggle Test' }),
									new FBuilder_CheckBox({ id: 'checkBox1', etiket: 'CheckBox Test' })
								]
							}).yanYana(),
							new FBuilderWithInitLayout({
								builders: [
									new FBuilder_SelectElement({
										ioAttr: 'oran', etiket: 'Select Test',
										altInst: e => e.builder.inst.kdvYapi,
										source: MQVergi.sabitKdvOranlari.map(x => new CKodVeAdi({ kod: x, aciklama: x })),
										value: 8
									}),
									new FBuilder_RadioButton({
										ioAttr: 'oran', etiket: 'Radio Test',
										altInst: e => e.builder.inst.kdvYapi,
										source: MQVergi.sabitKdvOranlari.map(x => new CKodVeAdi({ kod: x, aciklama: x })),
										value: 18
									})
								]
							}),
							new FBuilderWithInitLayout({
								id: 'buttonTestForm',
								builders: [
									new FBuilder_Button({
										id: 'buton1', value: 'Buton 1',
										afterRun: e => {
											e.builder.input.on('click', evt =>
												displayMessage(`${evt.target.innerHTML} tıklandı`));
										}
									}),
									new FBuilder_Button({
										id: 'buton2', value: 'Buton 2',
										afterRun: e => {
											e.builder.input.on('click', evt =>
												displayMessage(`${evt.target.innerHTML} tıklandı`));
										}
									}),
									new FBuilder_Button({
										id: 'buton3', value: 'Uzun Buton 3',
										afterRun: e => {
											e.builder.input.on('click', evt =>
												displayMessage(`${evt.target.innerHTML} tıklandı`));
										}
									})
								]
							}).yanYana(),
							new FBuilder_ModelKullan({
								id: 'oran', etiket: 'Oran', mfSinif: null,
								altInst: e => e.builder.inst.kdvYapi,
								widgetArgsDuzenle: e => {
									const {inst} = e.builder;
									$.extend(e.args, {
										source: $.merge([0], MQVergi.sabitKdvOranlari).map(x => {
											return new CKodVeAdi({ kod: x, aciklama: x.toString().padStart(2, ' ') })
										}),
										isDropDown: true, noAutoWidth: true, kodGosterilsin: false,
										ozelQueryDuzenle: e => {
											const ba = inst.ba.char;
											const {stm, alias} = e;
											stm.sentDo(sent => {
												sent.where.degerAta('KDV', `${alias}.vergitipi`);
												sent.where.degerAta(ba, `${alias}.ba`);
											})
										}
									})
								}
							})
						]
					})
				]
			})
		});
		part.run();
	}
}


class FormBuilderTest3 extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }

	static async run(e) {
		e = e || {};
		const inst = new MQHizmet({ kod: 'H01' });
		await inst.yukle();
		inst.grupKod = 'GEL';
		inst.tip.char = 'T';
		
		const part = new ModelTanimPart({
			islem: 'yeni',
			inst: inst,
			builder: new RootFormBuilder({
				id: 'root',
				partInit: e => {
					const {wndArgs} = e.part;
					wndArgs.width = 1000
				},
				builders: [
					new FBuilder_TanimForm({
						builders: [
							new FBuilderWithInitLayout({
								id: 'kaForm',
								builders: [
									new FBuilder_TextInput({ id: 'kod', etiket: 'Kod' }),
									new FBuilder_TextInput({ id: 'aciklama', etiket: 'Açıklama' })
								]
							}).yanYana(2),
							new FBuilder_TanimFormTabs({
								builders: [
									new FBuilder_TabPage({
										id: 'genel', etiket: 'Genel',
										builders: [
											new FBuilderWithInitLayout({
												builders: [
													new FBuilder_RadioButton({
														id: 'tip', etiket: 'Tip',
														source: HizmetTipi.instance.kaListe,
														degisince: e => {
															displayMessage(`Hizmet tip değişti işlemleri - <b>${e.value}</b>`);

															const {rootPart} = e.builder;
															const tabHeaders = rootPart.tabPanel.find('ul > li');

															tabHeaders.removeClass('jqx-hidden');
															switch ((e.value || '').trim()) {
																case '':
																	tabHeaders.filter('#gider').addClass('jqx-hidden');
																	break;
																case 'G':
																	tabHeaders.filter('#gelir').addClass('jqx-hidden');
																	break;
															}
															
															rootPart.tabPanelWidget.updatetabsheader();
														}
													}),
													new FBuilder_ModelKullan({
														id: 'grupKod', etiket: 'Grup',
														mfSinif: MQHizmetGrup
													}).dropDown(),
													new FBuilder_NumberInput({
														id: 'birimFiyat', etiket: 'Fiyat'
													})
												]
											}).yanYana(2),
											new FBuilder_Tabs({
												id: 'fiyatTabs',
												builders: [
													new FBuilder_TabPage({
														id: 'satis', etiket: 'Satış',
														builders: [
															new FBuilderWithInitLayout({
																builders: [
																	new FBuilder_Grid({
																		id: 'grid',
																		widgetArgsDuzenle: e => {
																			e.args.height = 160
																		},
																		tabloKolonlari: [
																			new GridKolon({ belirtec: 'etiket', text: ' ', genislikCh: 16 }).readOnly(),
																			new GridKolon({ belirtec: 'veri', text: ' ', genislikCh: 18 }).tipDecimal_bedel()
																		],
																		source: e => {
																			return [
																				{ etiket: 'Sat Fiyat 1', veri: 0 },
																				{ etiket: 'Sat Fiyat 1', veri: 0 },
																				{ etiket: 'Sat Fiyat 3', veri: 0 }
																			]
																		}
																	}).gridliGiris(),
																	new FBuilder_Grid({
																		id: 'grid',
																		widgetArgsDuzenle: e => {
																			e.args.height = 100
																		},
																		tabloKolonlari: [
																			new GridKolon({ belirtec: 'etiket', text: ' ', genislikCh: 16 }).readOnly(),
																			new GridKolon({ belirtec: 'veri', text: ' ', genislikCh: 18 }).tipDecimal_bedel()
																		],
																		source: e => {
																			return [
																				{ etiket: 'Sat Fiyat 1', veri: 0 }
																			]
																		}
																	}).gridliGiris()
																]
															}).yanYana(2)
														]
													}),
													new FBuilder_TabPage({
														id: 'alim', etiket: 'Alım',
														builders: [
															new FBuilderWithInitLayout({
																builders: [
																	new FBuilder_Grid({
																		id: 'grid',
																		widgetArgsDuzenle: e => {
																			e.args.height = 100
																		},
																		tabloKolonlari: [
																			new GridKolon({ belirtec: 'etiket', text: ' ', genislikCh: 16 }).readOnly(),
																			new GridKolon({ belirtec: 'veri', text: ' ', genislikCh: 18 }).tipDecimal_bedel()
																		],
																		source: e => {
																			return [
																				{ etiket: 'Alım Fiyat', veri: 0 }
																			]
																		}
																	}).gridliGiris()
																]
															})
														]
													})
												]
											})
										]
									}),
									new FBuilder_TabPage({
										id: 'gelir', etiket: 'Gelir'
									}),
									new FBuilder_TabPage({
										id: 'gider', etiket: 'Gider'
									})
								]
							})
						]
					})
				]
			})
		});
		part.run();
	}
}

