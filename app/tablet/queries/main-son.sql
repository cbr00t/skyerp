
CREATE TABLE IF NOT EXISTS tabfis (
	id TEXT NOT NULL PRIMARY KEY,
	silindi TEXT NOT NULL DEFAULT '',
	tarih TEXT NOT NULL DEFAULT '',
	seri TEXT NOT NULL DEFAULT '',
	noyil INTEGER NOT NULL DEFAULT 0,
	fisno INTEGER NOT NULL DEFAULT 0,
	cariaciklama TEXT NOT NULL DEFAULT '',
	brut REAL NOT NULL DEFAULT 0,
	topkdv REAL NOT NULL DEFAULT 0,
	sonuc REAL NOT NULL DEFAULT 0,
-- ugrama fis
	nedenkod TEXT NOT NULL DEFAULT '',
-- stok/ticari fis
	must TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_tabfis_tarih ON tabfis (tarih);
CREATE INDEX IF NOT EXISTS idx_tabfis_seri_no ON tabfis (seri, fisno);
CREATE INDEX IF NOT EXISTS idx_tabfis_must ON tabfis (must);

CREATE TABLE IF NOT EXISTS tabhar (
	fisid TEXT NOT NULL,
	seq INTEGER NOT NULL,
	barkod TEXT NOT NULL DEFAULT '',
	stokkod TEXT NOT NULL DEFAULT '',
	miktar REAL NOT NULL DEFAULT 0,
	fiyat REAL NOT NULL DEFAULT 0,
	kdvorani INTEGER NOT NULL DEFAULT 0,
	brutbedel TEXT NOT NULL DEFAULT '',
	bedel REAL NOT NULL DEFAULT 0,
	ekaciklama TEXT NOT NULL DEFAULT '',
-- tahsilat fis
	tahseklikodno INTEGER NOT NULL DEFAULT '',
	PRIMARY KEY (fisid, seq)
);
CREATE INDEX IF NOT EXISTS idx_tabhar_seq ON tabhar (seq);
