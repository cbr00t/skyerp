CREATE TABLE IF NOT EXISTS yflaglar (
	kod TEXT NOT NULL PRIMARY KEY,
	sonviots TEXT NOT NULL DEFAULT '',
	sonskyts TEXT NOT NULL DEFAULT '',
	tanim TEXT NOT NULL DEFAULT '',
	jsonstr TEXT NOT NULL DEFAULT '',
	gonderimts TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS crmgorev (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT '',
	gonderimts TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmgorev_gonderimts ON crmgorev (gonderimts);
CREATE INDEX IF NOT EXISTS idx_crmgorev_aciklama ON crmgorev (aciklama);

CREATE TABLE IF NOT EXISTS crmcagrikaynak (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT '',
	gonderimts TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmcagrikaynak_aciklama ON crmcagrikaynak (aciklama);
CREATE INDEX IF NOT EXISTS idx_crmcagrikaynak_gonderimts ON crmcagrikaynak (gonderimts);

CREATE TABLE IF NOT EXISTS crmislemturu (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT '',
	gonderimts TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmislemturu_aciklama ON crmislemturu (aciklama);
CREATE INDEX IF NOT EXISTS idx_crmislemturu_gonderimts ON crmislemturu (gonderimts);

CREATE TABLE IF NOT EXISTS crmziyaretkonu (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT '',
	gonderimts TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmziyaretkonu_aciklama ON crmziyaretkonu (aciklama);
CREATE INDEX IF NOT EXISTS idx_crmziyaretkonu_gonderimts ON crmziyaretkonu (gonderimts);

CREATE TABLE IF NOT EXISTS crmziyaretsonuc (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT '',
	gonderimts TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmziyaretsonuc_aciklama ON crmziyaretsonuc (aciklama);
CREATE INDEX IF NOT EXISTS idx_crmziyaretsonuc_gonderimts ON crmziyaretsonuc (gonderimts);

CREATE TABLE IF NOT EXISTS caril (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT '',
	gonderimts TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_caril_aciklama ON caril (aciklama);
CREATE INDEX IF NOT EXISTS idx_caril_gonderimts ON caril (gonderimts);

CREATE TABLE IF NOT EXISTS personel (
	kod TEXT NOT NULL PRIMARY KEY,
	aciklama TEXT NOT NULL DEFAULT '',
	gorevkod TEXT NOT NULL DEFAULT '',
	email TEXT NOT NULL DEFAULT '',
	gonderimts TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_personel_aciklama ON personel (aciklama);
CREATE INDEX IF NOT EXISTS idx_personel_gorev ON personel (gorevkod);
CREATE INDEX IF NOT EXISTS idx_personel_gonderimts ON personel (gonderimts);

CREATE TABLE IF NOT EXISTS carmst (
	must TEXT NOT NULL PRIMARY KEY,
	birunvan TEXT NOT NULL DEFAULT '',
	yore TEXT NOT NULL DEFAULT '',
	ilkod TEXT NOT NULL DEFAULT '',
	email TEXT NOT NULL DEFAULT '',
	biradres TEXT NOT NULL DEFAULT '',
	gonderimts TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_carmst_birunvan ON carmst (birunvan);
CREATE INDEX IF NOT EXISTS idx_carmst_yore ON carmst (yore);
CREATE INDEX IF NOT EXISTS idx_carmst_ilkod ON carmst (ilkod);
CREATE INDEX IF NOT EXISTS idx_carmst_gonderimts ON carmst (gonderimts);

CREATE TABLE IF NOT EXISTS crmziyaretplani (
	kaysayac INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	plantarih TEXT NOT NULL DEFAULT '',
	plansaat TEXT NOT NULL DEFAULT '',
	mustkod TEXT NOT NULL DEFAULT '',
	gorevlikullanicikod TEXT NOT NULL DEFAULT '',
	konukod TEXT NOT NULL DEFAULT '',
	teyitkisi TEXT NOT NULL DEFAULT '',
	teyitzamani TEXT,
	kisabilgi TEXT NOT NULL DEFAULT '',
	gonderimts TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmziyaretplani_plantarih ON crmziyaretplani (plantarih);
CREATE INDEX IF NOT EXISTS idx_crmziyaretplani_gonderimts ON crmziyaretplani (gonderimts);

CREATE TABLE IF NOT EXISTS crmziyaret (
	kaysayac INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	plansayac INTEGER,
	ziyaretzamani TEXT NOT NULL DEFAULT '',
	mustkod TEXT NOT NULL DEFAULT '',
	gorevlikullanicikod TEXT NOT NULL DEFAULT '',
	konukod TEXT NOT NULL DEFAULT '',
	sonuckod TEXT NOT NULL DEFAULT '',
	kisiler TEXT NOT NULL DEFAULT '',
	gorusmenotu TEXT NOT NULL DEFAULT '',
	gonderimts TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmziyaret_ziyaretzamani ON crmziyaret (ziyaretzamani);
CREATE INDEX IF NOT EXISTS idx_crmziyaret_mustkod ON crmziyaret (mustkod);
CREATE INDEX IF NOT EXISTS idx_crmziyaret_gonderimts ON crmziyaret (gonderimts);

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
	bitisaciklama TEXT NOT NULL DEFAULT '',
	gonderimts TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_crmmusislem_zamants ON crmmusislem (zamants);
CREATE INDEX IF NOT EXISTS idx_crmmusislem_bitists ON crmmusislem (bitists);
CREATE INDEX IF NOT EXISTS idx_crmmusislem_mustkod ON crmmusislem (mustkod);
CREATE INDEX IF NOT EXISTS idx_crmmusislem_gonderimts ON crmmusislem (gonderimts);

CREATE TABLE IF NOT EXISTS crmmusislemdetay (
	fissayac INTEGER NOT NULL,
	seq INTEGER NOT NULL,
	detayts TEXT NOT NULL DEFAULT '',
	detaykullanicikod TEXT NOT NULL DEFAULT '',
	detayaciklama TEXT NOT NULL DEFAULT '',
	gonderimts TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crmmusislemdetay_fissayac_seq ON crmmusislemdetay (fissayac, seq);
CREATE INDEX IF NOT EXISTS idx_crmmusislemdetay_gonderimts ON crmmusislemdetay (gonderimts);

CREATE TABLE IF NOT EXISTS kapanmayan_hesaplar (
	tarih TEXT NOT NULL DEFAULT '',
	belgeNox TEXT NOT NULL DEFAULT '',
	vade TEXT,
	must TEXT NOT NULL DEFAULT '',
	isladi TEXT NOT NULL DEFAULT '',
	bedel REAL NOT NULL DEFAULT 0,
	acikkisim REAL NOT NULL DEFAULT 0,
	gecikmegun REAL NOT NULL DEFAULT 0,
	gelecekgun REAL NOT NULL DEFAULT 0,
	takipno TEXT NOT NULL DEFAULT '',
	takipadi TEXT NOT NULL DEFAULT '',
	takiptext TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_kapanmayan_hesaplar_tarih ON kapanmayan_hesaplar (tarih);

CREATE TABLE IF NOT EXISTS cari_ekstre (
	iceriktablotipi TEXT NOT NULL DEFAULT '',
	icerikfissayac INTEGER,
	tarih TEXT NOT NULL DEFAULT '',
	must TEXT NOT NULL DEFAULT '',
	fisnox TEXT NOT NULL DEFAULT '',
	vade TEXT,
	isladi TEXT NOT NULL DEFAULT '',
	refkod TEXT NOT NULL DEFAULT '',
	refadi TEXT NOT NULL DEFAULT '',
	miktar REAL NOT NULL DEFAULT 0,
	brm TEXT NOT NULL DEFAULT '',
	sonuciskoran REAL NOT NULL DEFAULT 0,
	borcbedel REAL,
	alacakbedel REAL,
	bakiye REAL,
	devoncelik INTEGER NOT NULL DEFAULT 0,
	takipno TEXT NOT NULL DEFAULT '',
	takipadi TEXT NOT NULL DEFAULT '',
	takiptext TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_cari_ekstre_icerikfissayac ON cari_ekstre (icerikfissayac);
CREATE INDEX IF NOT EXISTS idx_cari_ekstre_tarih ON cari_ekstre (tarih);
CREATE INDEX IF NOT EXISTS idx_cari_ekstre_must ON cari_ekstre (must);

CREATE TABLE IF NOT EXISTS cari_ekstre_icerik (
	iceriktipi TEXT NOT NULL DEFAULT '',
	icerikfissayac INTEGER,
	shkod TEXT NOT NULL DEFAULT '',
	stokadi TEXT NOT NULL DEFAULT '',
	miktar REAL NOT NULL DEFAULT 0,
	fiyat REAL NOT NULL DEFAULT 0,
	sonuciskoran REAL NOT NULL DEFAULT 0,
	bedel REAL NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_cari_ekstre_icerik_icerikfissayac ON cari_ekstre_icerik (icerikfissayac);
