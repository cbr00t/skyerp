class MQTabBarkodReferans extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'BARREF' } static get sinifAdi() { return 'Barkod Referans' }
	static get table() { return 'sbarref' } static get tableAlias() { return 'bref' }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			refKod: new PInstStr('refkod'),
			stokKod: new PInstStr('stokkod'),
			varsayilanmi: new PInstBool('varsayilan')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'refkod', text: 'Barkod', genislikCh: 25 }),
			new GridKolon({ belirtec: 'stokkod', text: 'Stok', genislikCh: 25 }),
			new GridKolon({ belirtec: 'stokadi', text: 'Stok Adı', genislikCh: 40, sql: 'stk.aciklama' }),
			new GridKolon({ belirtec: 'varsayilan', text: 'Varsayılan?', genislikCh: 10 }).tipBool()
		)
	}
	static loadServerData_queryDuzenle_son({ stm: { orderBy }, sent }) {
		super.loadServerData_queryDuzenle_son(...arguments)
		let {tableAlias: alias} = this
		sent.fromIliski('stkmst stk', `${alias}.stokkod = stk.kod`)
		orderBy.liste = []
		orderBy.add('refkod', 'varsayilan DESC', 'stokkod')
	}
}
class MQTabBarkodAyrisim extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'BARAYR' } static get sinifAdi() { return 'Ayrışım Barkod' }
	static get table() { return 'barayrim' } static get tableAlias() { return 'ayr' }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			refKod: new PInstStr('refkod'),
			stokKod: new PInstStr('stokkod'),
			varsayilanmi: new PInstBool('varsayilan')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'refkod', text: 'Barkod', genislikCh: 25 }),
			new GridKolon({ belirtec: 'stokkod', text: 'Stok', genislikCh: 25 }),
			new GridKolon({ belirtec: 'stokadi', text: 'Stok Adı', genislikCh: 40, sql: 'stk.aciklama' }),
			new GridKolon({ belirtec: 'varsayilan', text: 'Varsayılan?', genislikCh: 10 }).tipBool()
		)
	}
	static loadServerData_queryDuzenle_son({ stm: { orderBy }, sent }) {
		super.loadServerData_queryDuzenle_son(...arguments)
		let {tableAlias: alias} = this
		sent.fromIliski('stkmst stk', `${alias}.stokkod = stk.kod`)
		orderBy.liste = []
		orderBy.add('refkod', 'varsayilan DESC', 'stokkod')
	}
}

/*aciklama
: 
{name: 'aciklama', xtype: 175, length: 30}
ayiracsayi
: 
{name: 'ayiracsayi', xtype: 48, length: 1}
ayiracstr
: 
{name: 'ayiracstr', xtype: 175, length: 1}
barkodbas
: 
{name: 'barkodbas', xtype: 52, length: 2}
barkodhane
: 
{name: 'barkodhane', xtype: 52, length: 2}
bedenbas
: 
{name: 'bedenbas', xtype: 52, length: 2}
bedenhane
: 
{name: 'bedenhane', xtype: 52, length: 2}
bosformat
: 
{name: 'bosformat', xtype: 175, length: 55}
boybas
: 
{name: 'boybas', xtype: 52, length: 2}
boyhane
: 
{name: 'boyhane', xtype: 52, length: 2}
desenbas
: 
{name: 'desenbas', xtype: 52, length: 2}
desenhane
: 
{name: 'desenhane', xtype: 52, length: 2}
ekoz1bas
: 
{name: 'ekoz1bas', xtype: 52, length: 2}
ekoz1hane
: 
{name: 'ekoz1hane', xtype: 52, length: 2}
ekoz2bas
: 
{name: 'ekoz2bas', xtype: 52, length: 2}
ekoz2hane
: 
{name: 'ekoz2hane', xtype: 52, length: 2}
ekoz3bas
: 
{name: 'ekoz3bas', xtype: 52, length: 2}
ekoz3hane
: 
{name: 'ekoz3hane', xtype: 52, length: 2}
ekoz4bas
: 
{name: 'ekoz4bas', xtype: 52, length: 2}
ekoz4hane
: 
{name: 'ekoz4hane', xtype: 52, length: 2}
ekoz5bas
: 
{name: 'ekoz5bas', xtype: 52, length: 2}
ekoz5hane
: 
{name: 'ekoz5hane', xtype: 52, length: 2}
ekoz6bas
: 
{name: 'ekoz6bas', xtype: 52, length: 2}
ekoz6hane
: 
{name: 'ekoz6hane', xtype: 52, length: 2}
ekoz7bas
: 
{name: 'ekoz7bas', xtype: 52, length: 2}
ekoz7hane
: 
{name: 'ekoz7hane', xtype: 52, length: 2}
ekoz8bas
: 
{name: 'ekoz8bas', xtype: 52, length: 2}
ekoz8hane
: 
{name: 'ekoz8hane', xtype: 52, length: 2}
ekoz9bas
: 
{name: 'ekoz9bas', xtype: 52, length: 2}
ekoz9hane
: 
{name: 'ekoz9hane', xtype: 52, length: 2}
emirbas
: 
{name: 'emirbas', xtype: 52, length: 2}
emirhane
: 
{name: 'emirhane', xtype: 52, length: 2}
enbas
: 
{name: 'enbas', xtype: 52, length: 2}
enhane
: 
{name: 'enhane', xtype: 52, length: 2}
eoubas
: 
{name: 'eoubas', xtype: 52, length: 2}
eouhane
: 
{name: 'eouhane', xtype: 52, length: 2}
formattipi
: 
{name: 'formattipi', xtype: 175, length: 1}
garbitisaybas
: 
{name: 'garbitisaybas', xtype: 52, length: 2}
garbitisayhane
: 
{name: 'garbitisayhane', xtype: 52, length: 2}
garbitisgunbas
: 
{name: 'garbitisgunbas', xtype: 52, length: 2}
garbitisgunhane
: 
{name: 'garbitisgunhane', xtype: 52, length: 2}
garbitisyilbas
: 
{name: 'garbitisyilbas', xtype: 52, length: 2}
garbitisyilhane
: 
{name: 'garbitisyilhane', xtype: 52, length: 2}
garnibas
: 
{name: 'garnibas', xtype: 52, length: 2}
garnihane
: 
{name: 'garnihane', xtype: 52, length: 2}
hardetbas
: 
{name: 'hardetbas', xtype: 52, length: 2}
hardethane
: 
{name: 'hardethane', xtype: 52, length: 2}
kavalabas
: 
{name: 'kavalabas', xtype: 52, length: 2}
kavalahane
: 
{name: 'kavalahane', xtype: 52, length: 2}
kod
: 
{name: 'kod', xtype: 175, length: 10}
lotnobas
: 
{name: 'lotnobas', xtype: 52, length: 2}
lotnohane
: 
{name: 'lotnohane', xtype: 52, length: 2}
miktarbas
: 
{name: 'miktarbas', xtype: 52, length: 2}
miktarhane
: 
{name: 'miktarhane', xtype: 52, length: 2}
modelbas
: 
{name: 'modelbas', xtype: 52, length: 2}
modelhane
: 
{name: 'modelhane', xtype: 52, length: 2}
oemidbas
: 
{name: 'oemidbas', xtype: 52, length: 2}
oemidhane
: 
{name: 'oemidhane', xtype: 52, length: 2}
operasyonbas
: 
{name: 'operasyonbas', xtype: 52, length: 2}
operasyonhane
: 
{name: 'operasyonhane', xtype: 52, length: 2}
paketbas
: 
{name: 'paketbas', xtype: 52, length: 2}
pakethane
: 
{name: 'pakethane', xtype: 52, length: 2}
personelbas
: 
{name: 'personelbas', xtype: 52, length: 2}
personelhane
: 
{name: 'personelhane', xtype: 52, length: 2}
rafbas
: 
{name: 'rafbas', xtype: 52, length: 2}
rafhane
: 
{name: 'rafhane', xtype: 52, length: 2}
renkbas
: 
{name: 'renkbas', xtype: 52, length: 2}
renkhane
: 
{name: 'renkhane', xtype: 52, length: 2}
serinobas
: 
{name: 'serinobas', xtype: 52, length: 2}
serinohane
: 
{name: 'serinohane', xtype: 52, length: 2}
stokbas
: 
{name: 'stokbas', xtype: 52, length: 2}
stokbaslangicdanmi
: 
{name: 'stokbaslangicdanmi', xtype: 175, length: 1}
stokhane
: 
{name: 'stokhane', xtype: 52, length: 2}
tezgahbas
: 
{name: 'tezgahbas', xtype: 52, length: 2}
tezgahhane
: 
{name: 'tezgahhane', xtype: 52, length: 2}
utsbas
: 
{name: 'utsbas', xtype: 52, length: 2}
utshane
: 
{name: 'utshane', xtype: 52, length: 2}
yukseklikbas
: 
{name: 'yukseklikbas', xtype: 52, length: 2}
yukseklikhane
: 
{name: 'yukseklikhane', xtype: 52, length: 2}
*/
