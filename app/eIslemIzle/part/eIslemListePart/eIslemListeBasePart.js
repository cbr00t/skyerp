class EIslemListePart_Ortak extends CObject {
	static afterRun(e) {
		// const {sender} = e;
	}
	static islemTuslariDuzenle(e) {
		const {liste} = e;
		const idSet = asSet(['eIslemIzle', 'eIslemSorgu', 'basliklariDuzenle', 'kolonFiltre', 'secimler', 'tazele', 'vazgec']);
		e.liste = liste.filter(e => idSet[e.id])
	}
	static getSecilenSatirlar_oncesi(e) {
		e.kosul = e =>
			!!(e.rec.uuid ?? e.rec.efatuuid)
	}
	static tbWhereClauseDuzenle(e) {
		const wh = e.where;
		if (!wh)
			return
		const aliasVeNokta = e.aliasVeNokta ?? (e.alias ? `${e.alias}.` : '');
		wh.add(`${aliasVeNokta}efatuuid <> ''`)
	}
}


class Ext_GidenEIslemFiltre extends GidenEIslemFiltre {
	tbWhereClauseDuzenle(e) {
		e = e || {};
		super.tbWhereClauseDuzenle(e);
		e.sender = this;
		EIslemListePart_Ortak.tbWhereClauseDuzenle(e)
	}
}
class Ext_GelenEIslemFiltre extends GelenEIslemFiltre {
	tbWhereClauseDuzenle(e) {
		e = e || {};
		super.tbWhereClauseDuzenle(e);
		e.sender = this;
		EIslemListePart_Ortak.tbWhereClauseDuzenle(e)
	}
}

class Ext_GidenEIslemListePart extends GidenEIslemListePart {
	static get filtreSinif() { return Ext_GidenEIslemFiltre }
	run(e) {
		e = e || {};
		super.run(e);
		e.sender = this;
		EIslemListePart_Ortak.afterRun(e)
	}
	islemTuslariDuzenle(e) {
		e = e || {};
		super.islemTuslariDuzenle(e);
		e.sender = this;
		EIslemListePart_Ortak.islemTuslariDuzenle(e)
	}
	getSecilenSatirlar(e) {
		e = e || {};
		e.sender = this;
		EIslemListePart_Ortak.getSecilenSatirlar_oncesi(e);
		return super.getSecilenSatirlar(e)
	}
}
class Ext_GelenEIslemListePart extends GelenEIslemListePart {
	static get filtreSinif() { return Ext_GelenEIslemFiltre }
	run(e) {
		e = e || {};
		super.run(e);
		e.sender = this;
		EIslemListePart_Ortak.afterRun(e)
	}
	islemTuslariDuzenle(e) {
		e = e || {};
		super.islemTuslariDuzenle(e);
		e.sender = this;
		EIslemListePart_Ortak.islemTuslariDuzenle(e)
	}
	getSecilenSatirlar(e) {
		e = e || {};
		e.sender = this;
		EIslemListePart_Ortak.getSecilenSatirlar_oncesi(e);
		return super.getSecilenSatirlar(e)
	}
}
