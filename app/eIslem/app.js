class EIslemApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	async run(e) { this.kisitlamalariUygula(e); await super.run(e) }
	getAnaMenu(e) {
		const {dev} = config, items = []; let subMenu;
		items.push(subMenu = new FRMenuCascade({ mnemonic: 'T', text: 'Satış', items: [
			new FRMenuChoice({ mnemonic: 'EI', text: `<span class="royalblue bold">Giden e-İşlem Listesi</span>`, block: e => GidenEIslemListePart.listele(e) }),
			new FRMenuChoice({ mnemonic: 'F', text: 'Satış Fatura', block: e => SatisFaturaFis.listeEkraniAc(e) }),
			new FRMenuChoice({ mnemonic: 'I', text: 'Satış İrsaliye', block: e => SatisIrsaliyeFis.listeEkraniAc(e) }),
			new FRMenuChoice({ mnemonic: 'FI', text: 'Satış İADE Fatura', block: e => SatisIadeFaturaFis.listeEkraniAc(e) })
		] }));
		if (dev) { subMenu.items.push(new FRMenuChoice({ mnemonic: 'EIP', text: 'e-İşlem Parametreleri', block: e => app.params.eIslem.tanimla(e) })) }
		items.push(subMenu = new FRMenuCascade({ mnemonic: 'A', text: 'Alım', items: [
			new FRMenuChoice({ mnemonic: 'EI', text: `<span class="green bold">Gelen e-İşlem Listesi</span>`, block: e => GelenEIslemListePart.listele(e) }),
			new FRMenuChoice({ mnemonic: 'F', text: 'Alım Fatura', block: e => AlimFaturaFis.listeEkraniAc(e) }),
			new FRMenuChoice({ mnemonic: 'I', text: 'Alım İrsaliye', block: e => AlimIrsaliyeFis.listeEkraniAc(e) }),
			new FRMenuChoice({ mnemonic: 'FI', text: 'Alım İADE Fatura', block: e => AlimIadeFaturaFis.listeEkraniAc(e) })
		] }));
		return new FRMenu({ items })
	}
	kisitlamalariUygula(e) {
		for (const selector of ['tanimlanabilirmi', 'silinebilirmi']) { Object.defineProperty(MQGenelFis, selector, { configurable: true, get() { return false } }) }
	}
}
