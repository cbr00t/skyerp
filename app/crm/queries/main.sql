CREATE TABLE IF NOT EXISTS yflaglar (
	kod TEXT NOT NULL PRIMARY KEY,
	sonviots TEXT NOT NULL DEFAULT '',
	sonskyts TEXT NOT NULL DEFAULT '',
	tanim TEXT NOT NULL DEFAULT '',
	jsonstr TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS crmgorev (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmgorev_aciklama ON crmgorev (aciklama);

CREATE TABLE IF NOT EXISTS crmcagrikaynak (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmcagrikaynak_aciklama ON crmcagrikaynak (aciklama);

CREATE TABLE IF NOT EXISTS crmislemturu (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmislemturu_aciklama ON crmislemturu (aciklama);

CREATE TABLE IF NOT EXISTS crmziyaretkonu (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmziyaretkonu_aciklama ON crmziyaretkonu (aciklama);

CREATE TABLE IF NOT EXISTS crmziyaretsonuc (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmziyaretsonuc_aciklama ON crmziyaretsonuc (aciklama);

CREATE TABLE IF NOT EXISTS caril (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_caril_aciklama ON caril (aciklama);

CREATE TABLE IF NOT EXISTS personel (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT '',
	gorevkod TEXT NOT NULL DEFAULT '',
	email TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_personel_aciklama ON personel (aciklama);
CREATE INDEX IF NOT EXISTS idx_personel_gorev ON personel (gorevkod);

CREATE TABLE IF NOT EXISTS carmst (
	must TEXT NOT NULL PRIMARY KEY,
	birunvan TEXT NOT NULL DEFAULT '',
	yore TEXT NOT NULL DEFAULT '',
	ilkod TEXT NOT NULL DEFAULT '',
	email TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_cari2_birunvan ON carmst (birunvan);
CREATE INDEX IF NOT EXISTS idx_cari2_yore ON carmst (yore);
CREATE INDEX IF NOT EXISTS idx_cari2_ilkod ON carmst (ilkod);

CREATE TABLE IF NOT EXISTS crmziyaretplani (
	kaysayac INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	plantarih TEXT NOT NULL DEFAULT '',
	plansaat TEXT NOT NULL DEFAULT '',
	mustkod TEXT NOT NULL DEFAULT '',
	gorevlikullanicikod TEXT NOT NULL DEFAULT '',
	konukod TEXT NOT NULL DEFAULT '',
	teyitkisi TEXT NOT NULL DEFAULT '',
	teyitzamani TEXT,
	kisabilgi TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmziyaretplani_plantarih ON crmziyaretplani (plantarih);
CREATE INDEX IF NOT EXISTS idx_crmziyaretplani_gorevlikullanicikod ON crmziyaretplani (gorevlikullanicikod);

CREATE TABLE IF NOT EXISTS crmziyaret (
	kaysayac INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	plansayac INTEGER,
	ziyaretzamani TEXT NOT NULL DEFAULT '',
	mustkod TEXT NOT NULL DEFAULT '',
	gorevlikullanicikod TEXT NOT NULL DEFAULT '',
	konukod TEXT NOT NULL DEFAULT '',
	sonuckod TEXT NOT NULL DEFAULT '',
	kisiler TEXT NOT NULL DEFAULT '',
	gorusmenotu TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmziyaret_ziyaretzamani ON crmziyaret (ziyaretzamani);
CREATE INDEX IF NOT EXISTS idx_crmziyaret_mustkod ON crmziyaret (mustkod);
CREATE INDEX IF NOT EXISTS idx_crmziyaret_gorevlikullanicikod ON crmziyaret (gorevlikullanicikod);

CREATE TABLE IF NOT EXISTS crmmusislem (
	kaysayac INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	seri TEXT NOT NULL DEFAULT '',
	fisno TEXT NOT NULL DEFAULT '',
	mustkod TEXT NOT NULL DEFAULT '',
	zamants TEXT NOT NULL DEFAULT '',
	termints TEXT,
	bitists TEXT,
	gorevlikullanicikod TEXT NOT NULL DEFAULT '',
	islemturkod TEXT NOT NULL DEFAULT '',
	refsatissayac INT,
	refsipsayac INT,
	teslimkullanicikod TEXT NOT NULL DEFAULT '',
	yapilacakis TEXT NOT NULL DEFAULT '',
	bitisaciklama TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmmusislem_zamants ON crmmusislem (zamants);
CREATE INDEX IF NOT EXISTS idx_crmmusislem_bitists ON crmmusislem (bitists);
CREATE INDEX IF NOT EXISTS idx_crmmusislem_fisnox ON crmmusislem (seri, fisno);
CREATE INDEX IF NOT EXISTS idx_crmmusislem_islemturkod ON crmmusislem (islemturkod);
CREATE INDEX IF NOT EXISTS idx_crmmusislem_gorevlikullanicikod ON crmmusislem (gorevlikullanicikod);
CREATE INDEX IF NOT EXISTS idx_crmmusislem_mustkod ON crmmusislem (mustkod);
