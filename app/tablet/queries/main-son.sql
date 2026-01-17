
CREATE TABLE IF NOT EXISTS tabfis (
	id TEXT NOT NULL PRIMARY KEY,
	fisTipi TEXT NOT NULL DEFAULT '',
	silindi TEXT NOT NULL DEFAULT '',
	bizsubekod TEXT NOT NULL DEFAULT '',
	tarih TEXT NOT NULL DEFAULT '',
	seri TEXT NOT NULL DEFAULT '',
	noyil INTEGER NOT NULL DEFAULT 0,
	fisno INTEGER NOT NULL DEFAULT 0,
	cariaciklama TEXT NOT NULL DEFAULT '',
	brut REAL NOT NULL DEFAULT 0,
	topkdv REAL NOT NULL DEFAULT 0,
	sonuc REAL NOT NULL DEFAULT 0,
	gonderimts TEXT NOT NULL DEFAULT '',
-- ugrama fis
	nedenkod TEXT NOT NULL DEFAULT '',
-- stok/ticari fis
	must TEXT NOT NULL DEFAULT '',
	dipiskoran1 REAL NOT NULL DEFAULT 0,
	dipiskoran2 REAL NOT NULL DEFAULT 0,
	dipiskbedel REAL NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_tabfis_fisTipi ON tabfis (fisTipi);
CREATE INDEX IF NOT EXISTS idx_tabfis_tarih ON tabfis (tarih);
CREATE INDEX IF NOT EXISTS idx_tabfis_seri_no ON tabfis (seri, fisno);
CREATE INDEX IF NOT EXISTS idx_tabfis_must ON tabfis (must);

CREATE TABLE IF NOT EXISTS tabhar (
	fisid TEXT NOT NULL,
	seq INTEGER NOT NULL,
-- ticari/stok ortak fis
	barkod TEXT NOT NULL DEFAULT '',
	stokkod TEXT NOT NULL DEFAULT '',
	miktar REAL NOT NULL DEFAULT 0,
	fiyat REAL NOT NULL DEFAULT 0,
	kdvorani INTEGER NOT NULL DEFAULT 0,
	kdv REAL NOT NULL DEFAULT 0,
	brutbedel REAL NOT NULL DEFAULT '',
	dagitdipiskbedel REAL NOT NULL DEFAULT 0,
	ekaciklama TEXT NOT NULL DEFAULT '',
	fiyatkosulkod TEXT NOT NULL DEFAULT '',
	iskkosulkod TEXT NOT NULL DEFAULT '',
-- tahsilat fis
	tahseklino INTEGER NOT NULL DEFAULT '',
-- tahsilat, ticari/stok ortak fis
	bedel REAL NOT NULL DEFAULT 0,
	PRIMARY KEY (fisid, seq)
);
CREATE INDEX IF NOT EXISTS idx_tabhar_seq ON tabhar (seq);
