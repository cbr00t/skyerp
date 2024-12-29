function applyExtensions() {
	Object.defineProperty(Date.prototype, 'haftaGunu', { get: function haftaGunu() { const dayOfWeek = this.getDay(); return dayOfWeek ? dayOfWeek : 7 } });
	Object.defineProperty(Date.prototype, 'ayGunSayisi', { get: function ayGunSayisi() { return this.getDaysInMonth() } });
	Object.defineProperty(Date.prototype, 'gun', { get: function gun() { return this.getDate() }, set: function gun (value) { this.setDate(value) } });
	Object.defineProperty(Date.prototype, 'ay', { get: function ay() { const ayNoZero = this.getMonth(); return ayNoZero ? ayNoZero + 1 : 12 }, set: function ay(value) { this.setMonth(value - 1) } });
	Object.defineProperty(Date.prototype, 'yil', { get: function yil() { return this.getFullYear() }, set: function yil(value) { this.setFullYear(value) } });
	Object.defineProperty(Date.prototype, 'yil2', { get: function yil2() { return yil4To2(this.yil) }, set: function yil2(value) { this.yil = yil2To4(value) } });
	Object.defineProperty(Date.prototype, 'gunAdi', { get: function gunAdi() { return this.getWeekName() } });
	Object.defineProperty(Date.prototype, 'ayAdi', { get: function ayAdi() { return this.getMonthName() } });
	Object.defineProperty(Date.prototype, 'haftaBasimi', { get: function haftaBasimi() { return this.haftaGunu == 1 } });
	Object.defineProperty(Date.prototype, 'haftaSonumu', { get: function haftaSonumu() { return this.haftaGunu == 7 } });
	const _setTime = Date.prototype.setTime; Date.prototype.setTime = function setTime(value) { _setTime.call(this, value); return this }
	Date.prototype.bugun = function bugun() { return this.setTime(new Date().getTime()) };
	Date.prototype.dun = function dun() { return this.addDays(-1) }; Date.prototype.yarin = function yarin() { return this.addDays(1) };
	Date.prototype.getGun = function getGun() { return this.gun }; Date.prototype.setGun = function setGun(value) { this.gun = value; return this };
	Date.prototype.getAy = function getAy() { return this.ay }; Date.prototype.setAy = function setAy(value) { this.ay = value; return this };
	Date.prototype.getYil = function getYil() { return this.yil }; Date.prototype.setYil = function setYil(value) { this.yil = value; return this };
	Date.prototype.getYil2 = function getYil2() { return this.yil2 }; Date.prototype.setYil2 = function setYil2(value) { this.yil2 = value; return this };
	Date.prototype.haftaBasi = function haftaBasi() { return this.addDays(1 - this.haftaGunu) }; Date.prototype.haftaSonu = function haftaSonu() { return this.addDays(7 - this.haftaGunu) };
	Date.prototype.ayBasi = function ayBasi() { return this.setGun(1) }; Date.prototype.aySonu = function aySonu() { return this.setGun(this.ayGunSayisi) }
	Date.prototype.yilBasi = function yilBasi() { return this.setGun(1).setAy(1) }; Date.prototype.yilSonu = function yilSonu() { return this.setGun(31).setAy(12) }
	String.prototype.sqlServerDegeri = function sqlServerDegeri() { return MQSQLOrtak.sqlServerDegeri(this.valueOf()) }
	String.prototype.sqliteDegeri = function sqlServerDegeri() { return MQSQLOrtak.sqliteDegeri(this.valueOf()) }
	String.prototype.sqlDegeri = function sqlDegeri() { return MQSQLOrtak.sqlDegeri(this.valueOf()) }
	String.prototype.sqlParamValue = function sqlParamValue() { return MQSQLOrtak.sqlParamValue(this.valueOf()) }
	String.prototype.sqlDegeri_unescaped = function sqlDegeri() { return MQSQLOrtak.sqlDegeri_unescaped(this.valueOf()) }
	for (const cls of [Number, Boolean, window.CObject]) {
		if (!cls) { continue }
		for (const key of ['sqlServerDegeri', 'sqlDegeri', 'sqliteDegeri', 'sqlParamValue', 'sqlDegeri_unescaped']) {
			if (!cls[key]) { cls.prototype[key] = String.prototype[key] }
		}
	}
	if (window.CObject) {
		CObject.prototype.sqlServerDegeri = function sqlServerDegeri() { return MQSQLOrtak.sqlServerDegeri(this.valueOf()) }
		CObject.prototype.sqliteDegeri = function sqlServerDegeri() { return MQSQLOrtak.sqliteDegeri(this.valueOf()) }
		CObject.prototype.sqlDegeri = function sqlDegeri() { return MQSQLOrtak.sqlDegeri(this.valueOf()) }
		CObject.prototype.sqlParamValue = function sqlParamValue() { return MQSQLOrtak.sqlParamValue(this.valueOf()) }
		CObject.prototype.sqlDegeri_unescaped = function sqlDegeri() { return MQSQLOrtak.sqlDegeri_unescaped(this.valueOf()) }
	}
	String.prototype.sqlConst = function sqlConst() { return new MQSQLConst(this.valueOf()) }
}
