function applyExtensions() {
	Object.defineProperty(Date.prototype, 'haftaGunu', { get: function haftaGunu() { const dayOfWeek = this.getDay(); return dayOfWeek ? dayOfWeek : 7 } });
	Object.defineProperty(Date.prototype, 'ayGunSayisi', { get: function ayGunSayisi() { return this.getDaysInMonth() } });
	Object.defineProperty(Date.prototype, 'gun', { get: function gun() { return this.getDate() }, set: function gun (value) { this.setDate(value) } });
	Object.defineProperty(Date.prototype, 'ay', { get: function ay() { return this.getMonth() + 1 }, set: function ay(value) { this.setMonth(value - 1) } });
	Object.defineProperty(Date.prototype, 'yil', { get: function yil() { return this.getFullYear() }, set: function yil(value) { this.setFullYear(value) } });
	Object.defineProperty(Date.prototype, 'yil2', { get: function yil2() { return yil4To2(this.yil) }, set: function yil2(value) { this.yil = yil2To4(value) } });
	Object.defineProperty(Date.prototype, 'gunAdi', { get: function gunAdi() { return this.getWeekName() } });
	Object.defineProperty(Date.prototype, 'ayAdi', { get: function ayAdi() { return this.getMonthName() } });
	Object.defineProperty(Date.prototype, 'haftaBasimi', { get: function haftaBasimi() { return this.haftaGunu == 1 } });
	Object.defineProperty(Date.prototype, 'haftaSonumu', { get: function haftaSonumu() { return this.haftaGunu == 7 } });
	Date.prototype.setTime = function $setTime(value) { return setTime(this, value) }
	Date.prototype.bugun = function bugun() { return this.setTime(new Date().getTime()) };
	Date.prototype.dun = function dun() { return this.addDays(-1) }; Date.prototype.yarin = function yarin() { return this.addDays(1) };
	Date.prototype.getGun = function getGun() { return this.gun }; Date.prototype.setGun = function setGun(value) { this.gun = value; return this };
	Date.prototype.getAy = function getAy() { return this.ay }; Date.prototype.setAy = function setAy(value) { this.ay = value; return this };
	Date.prototype.getYil = function getYil() { return this.yil }; Date.prototype.setYil = function setYil(value) { this.yil = value; return this };
	Date.prototype.getYil2 = function getYil2() { return this.yil2 }; Date.prototype.setYil2 = function setYil2(value) { this.yil2 = value; return this };
	Date.prototype.haftaBasi = function haftaBasi() { return this.addDays(1 - this.haftaGunu) }; Date.prototype.haftaSonu = function haftaSonu() { return this.addDays(7 - this.haftaGunu) };
	Date.prototype.ayBasi = function ayBasi() { return this.setGun(1) }; Date.prototype.aySonu = function aySonu() { return this.setGun(this.ayGunSayisi) }
	Date.prototype.yilBasi = function yilBasi() { return this.setAy(1).setGun(1) }; Date.prototype.yilSonu = function yilSonu() { return this.setAy(12).setGun(31) }
	String.prototype.sifirlaDoldur = function $sifirlaDoldur(maxLength) { return sifirlaDoldur(this.valueOf(), maxLength) }
	String.prototype.sqlServerDegeri = function sqlServerDegeri() { return MQSQLOrtak.sqlServerDegeri(this.valueOf()) }
	String.prototype.sqliteDegeri = function sqlServerDegeri() { return MQSQLOrtak.sqliteDegeri(this.valueOf()) }
	String.prototype.sqlDegeri = function sqlDegeri() { return MQSQLOrtak.sqlDegeri(this.valueOf()) }
	String.prototype.sqlParamValue = function sqlParamValue() { return MQSQLOrtak.sqlParamValue(this.valueOf()) }
	String.prototype.sqlDegeri_unescaped = function sqlDegeri() { return MQSQLOrtak.sqlDegeri_unescaped(this.valueOf()) }
	String.prototype.sqlBosDegermi = function sqlDegeri() { return MQSQLOrtak.sqlBosDegermi(this.valueOf()) }
	String.prototype.sqlDoluDegermi = function sqlDegeri() { return MQSQLOrtak.sqlDoluDegermi(this.valueOf()) }
	String.prototype.tersBA = function $tersBA() { return tersBA(this.valueOf()) }
	String.prototype.tersDeger = function $tersDeger(bu, diger) { return tersDeger(this.valueOf(), bu, diger) }
	
	Date.prototype.sqlServerDegeri = function sqlServerDegeri() { return MQSQLOrtak.sqlServerDegeri(this) }
	Date.prototype.sqliteDegeri = function sqlServerDegeri() { return MQSQLOrtak.sqliteDegeri(this) }
	Date.prototype.sqlDegeri = function sqlDegeri() { return MQSQLOrtak.sqlDegeri(this) }
	Date.prototype.sqlParamValue = function sqlParamValue() { return MQSQLOrtak.sqlParamValue(this) }
	Date.prototype.sqlDegeri_unescaped = function sqlDegeri() { return MQSQLOrtak.sqlDegeri_unescaped(this) }
	
	String.prototype.sumOlmaksizin = function sumOlmaksizin() { return MQSQLOrtak.sumOlmaksizin(this.valueOf()) }
	String.prototype.asSumDeger = function asSumDeger() { return MQSQLOrtak.asSumDeger(this.valueOf()) }
	String.prototype.asSUMDeger = function asSUMDeger() { return MQSQLOrtak.asSUMDeger(this.valueOf()) }
	String.prototype.fastReplaceSplit = function $fastReplaceSplit(source, target) { return fastReplaceSplit(this.valueOf(), source, target) }
	for (const cls of [window.CObject, Number, Boolean]) {
		if (!cls) { continue }
		for (const key of ['sqlServerDegeri', 'sqlDegeri', 'sqliteDegeri', 'sqlParamValue', 'sqlDegeri_unescaped', 'sifirlaDoldur']) {
			if (!cls[key]) { cls.prototype[key] = String.prototype[key] }
		}
	}
	for (const cls of [window.CObject, Number, Boolean, Date]) {
		if (!cls) { continue }
		for (const key of []) {
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
	String.prototype._trim = String.prototype.trim;
	String.prototype._trimStart = String.prototype.trimStart;
	String.prototype._trimEnd = String.prototype.trimEnd;
	String.prototype.trim = function $trim(...chars) { return trim(this, ...chars) }
	String.prototype.trimStart = function $trimStart(...chars) { return trimStart(this, ...chars) }
	String.prototype.trimEnd = function $trimEnd(...chars) { return trimEnd(this, ...chars) }
	String.prototype.trim_slashes = function $trim_slashes() { return trim_slashes(this) }
	String.prototype.trimStart_slashes = function $trimStart_slashes() { return trimStart_slashes(this) }
	String.prototype.trimEnd_slashes = function $trimEnd_slashes() { return trimEnd_slashes(this) }
	String.prototype.asTRUpper = function $asTRUpper() { return asTRUpper(this) }
	String.prototype.asTRLower = function $asTRUpper() { return asTRLower(this) }
}
