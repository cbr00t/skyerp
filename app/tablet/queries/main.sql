
CREATE TABLE IF NOT EXISTS yflaglar (
	kod TEXT NOT NULL PRIMARY KEY,
	tanim TEXT NOT NULL DEFAULT '',
	jsonstr TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS puserrol (
	kullanicikod TEXT NOT NULL,
	rolkod TEXT NOT NULL,
	tip TEXT NOT NULL DEFAULT '',
	ozelmi TEXT NOT NULL DEFAULT '',
	PRIMARY KEY (kullanicikod, rolkod, tip)
);
CREATE TABLE IF NOT EXISTS prolicerikana (
	userkod TEXT NOT NULL,
	kod TEXT NOT NULL DEFAULT '',
	seq INTEGER NOT NULL DEFAULT 0,
	ozelmi TEXT,
	islem TEXT,
	dahilharic TEXT NOT NULL DEFAULT '',
	adim TEXT,
	basi TEXT,
	sonu TEXT,
	deger TEXT,
	indis INTEGER,
	PRIMARY KEY (userkod, kod, seq)
);

CREATE TABLE IF NOT EXISTS isyeri (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT '',
	silindi TEXT NOT NULL DEFAULT '',
	isygrupkod TEXT NOT NULL DEFAULT ''
);
INSERT OR IGNORE INTO isyeri (kod) VALUES ('');
