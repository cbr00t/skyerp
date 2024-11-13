class IsmailTest10App extends TicariApp {
	paramsDuzenle(e) {
		super.paramsDuzenle(e);		
		const {params} = e;
		$.extend(params, {
			zorunlu: IK_MQZorunluParam.getInstance(),
			ticariGenel: IK_MQTicariGenelParam.getInstance(),
			cariGenel: IK_MQCariGenelParam.getInstance(),
			hizmetGenel: MQHizmetGenelParam.getInstance(),
			stokGenel: IK_MQStokGenelParam.getInstance(),
			alimGenel: IK_MQAlimGenelParam.getInstance(),
			satisGenel: IK_MQSatisGenelParam.getInstance()
		})
	}
	getAnaMenu(e) {
		return new FRMenu({ items: [
			new FRMenuChoice({ mnemonic: 'D', text: 'Döviz Listesi', block: e => MQDoviz.listeEkraniAc() }),
			new FRMenuCascade({
				mnemonic: 'CR', text: 'Cari', items: [
					new FRMenuChoice({ mnemonic: 'CAB', text: 'Cari Ana Bölge Listele', block: e => MQCariAnaBolge.listeEkraniAc() }),
					new FRMenuChoice({ mnemonic: 'CB', text: 'Cari Bölge Listele', block: e => MQCariBolge.listeEkraniAc() }),
					new FRMenuChoice({ mnemonic: 'CT', text: 'Cari Tip Listele', block: e => MQCariTip.listeEkraniAc() }),
					new FRMenuChoice({ mnemonic: 'CHL', text: 'Cari Hesap Listesi', block: e => MQCari.listeEkraniAc() })
				]
			}),
			new FRMenuCascade({
				mnemonic: 'ST', text: 'Stok', items: [
					new FRMenuChoice({ mnemonic: 'K', text: 'Stok Listesi', block: e => MQStok.listeEkraniAc() }),
					new FRMenuChoice({ mnemonic: 'B', text: 'Barkod Referans Listesi', block: e => MQBarkodReferans.listeEkraniAc() }),
				]
			}),
			new FRMenuCascade({
				mnemonic: 'HI', text: 'Hizmet', items: [
					new FRMenuChoice({ mnemonic: 'K', text: 'Hizmet Listesi', block: e => MQHizmet.listeEkraniAc() }),
					new FRMenuChoice({ mnemonic: 'CHF', text: 'Cari Hizmet Fişleri', block: e => IK_MQCariHizmetFisleri.listeEkraniAc() }),
					
				]
			}),
			new FRMenuCascade({
				mnemonic: 'KA', text: 'Kasa', items: [
					new FRMenuChoice({ mnemonic: 'KAS', text: 'Kasa Listesi', block: e => MQKasa.listeEkraniAc() }),
					new FRMenuCascade({
						mnemonic: 'F', text: 'Fişler', items: [
							new FRMenuChoice({ mnemonic: 'KTOF', text: 'Kasa/Cari Fişleri', block: e => KasaCariFis.listeEkraniAc() }),
							new FRMenuChoice({ mnemonic: 'KHF', text: 'Kasa Hizmet Fişleri', block: e => KasaHizmetFis.listeEkraniAc() }),
							new FRMenuChoice({ mnemonic: 'KBYCF', text: 'Kasa Banka Yatan/Çeken Fişleri', block: e => MQKasaBankaFis.listeEkraniAc() }),
							new FRMenuChoice({ mnemonic: 'KVF', text: 'Kasa Virman Fişleri', block: e => MQKasaVirmanFis.listeEkraniAc() }),
							new FRMenuChoice({ mnemonic: 'KDF', text: 'Kasa Devir Fişleri', block: e => KasaDevirFis.listeEkraniAc() }),
							new FRMenuChoice({ mnemonic: 'CTI', text: 'Cari Toplu İşlem Fişleri', block: e => CariTopluIslemFis.listeEkraniAc() })
						]
					})
				]
			}),
			new FRMenuCascade({
				mnemonic: 'BA', text: 'Banka', items: [
					new FRMenuChoice({ mnemonic: 'BAN', text: 'Banka Listesi', block: e => MQBanka.listeEkraniAc() }),
					new FRMenuChoice({ mnemonic: 'BHES', text: 'Banka Hesap Listesi', block: e => MQBankaHesap.listeEkraniAc() }),
					new FRMenuChoice({ mnemonic: 'BKYCF', text: 'Kasa Banka Yatan/Çeken Fişleri', block: e => IK_MQKasaBankaYatanCekenFisleri.listeEkraniAc() }),
					new FRMenuChoice({ mnemonic: 'BMDF', text: 'Banka Mevduat Devir Fişleri', block: e => IK_MQBankaMevduatDevirFis.listeEkraniAc() })
				]
			}),
			new FRMenuCascade({
				mnemonic: 'CS', text: 'Çek/Senet', items: [
					new FRMenuChoice({ mnemonic: 'CSP', text: 'Çek/Senet Portföy', block: e => MQCekSenetPortfoy.listeEkraniAc() })
				]
			}),
			new FRMenuCascade({
				mnemonic: 'PR', text: 'Parametreler', items: [
					new FRMenuChoice({ mnemonic: 'ZR', text: 'Zorunlu Parametreler', block: e => app.params.zorunlu.tanimla() }),
					new FRMenuChoice({ mnemonic: 'TC', text: 'Ticari Genel Parametreler', block: e => app.params.ticariGenel.tanimla() }),
					new FRMenuChoice({ mnemonic: 'CG', text: 'Cari Genel Parametreler', block: e => app.params.cariGenel.tanimla() }),
					new FRMenuChoice({ mnemonic: 'ST', text: 'Stok Genel Parametreler', block: e => app.params.stokGenel.tanimla() }),
					new FRMenuChoice({ mnemonic: 'AG', text: 'Alım Genel Parametreler', block: e => app.params.alimGenel.tanimla() }),
					new FRMenuChoice({ mnemonic: 'SG', text: 'Satış Genel Parametreler', block: e => app.params.satisGenel.tanimla() })
				]
			})
			
		] })
	}
}
