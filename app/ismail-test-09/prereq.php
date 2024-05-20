<script src="<?=$webRoot?>/lib_external/etc/date.js"></script>

<script src="<?=$webRoot?>/app/ticari/classes/ortak/diger/rowluYapi.js"></script>
<script src="<?=$webRoot?>/classes/jsonXml/jsonXml.js"></script>
<script src="<?=$webRoot?>/classes/mq/param/mqOrtakParam.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/diger/ticariOrtakSiniflar.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/tekSecim/buDigerHepsi.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/tekSecim/ticariTekSecimSiniflar.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/diger/vergiVeyaTCKimlik.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-yerelParam/mqYerelParam-ticari.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-param/mqTicariParamBase.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-param/mqZorunluParam.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-param/mqTicariGenelParam.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-param/mqStokBirimParam.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-param/mqStokGenelParam.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-param/mqCariGenelParam.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-param/mqHizmetGenelParam.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-param/mqDemirbasGenelParam.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-param/mqBankaGenelParam.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-param/mqFiyatVeIskontoParam.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-param/eIslem/tekSecim.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-param/eIslem/param.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/kod/mqKod.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/kod/mqKA.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/fis/mqSayacli.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/fis/mqSayacliKA.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/detay/mqDetay.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqHMR.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/diger/hmrBilgi.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/mq-ozelSaha/mqOzelSaha.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/numarator/mqNumarator.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/numarator/mqTicNumarator.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/fis/mqDetayli.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqEConf.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/eIslem/tekSecim.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/eIslem/ekSiniflar.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/eIslem/eIslem_icmal.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/eIslem/islemci/eIslemOrtak.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/eIslem/islemci/eIslem_faturaArsivOrtak.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/eIslem/islemci/eIslem_fatura.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/eIslem/islemci/eIslem_arsiv.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/eIslem/islemci/eIslem_irsaliye.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/eIslem/islemci/eIslem_mustahsil.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/eIslem/islemci/eIslemSon.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/eIslem/islemci/eYonetici.js"></script>
<script src="<?=$webRoot?>/ortak/mq/fisGiris/fisBaslikOlusturucu.js"></script>
<script src="<?=$webRoot?>/ortak/mq/fisGiris/fisBaslikOlusturucu_templates.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/fis/mqOrtakFis.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/fis/mqGenelFis.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/fis/mqTicariGenelFis.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/yardimci/dip/dipSatir.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/yardimci/dip/dipIslemci.js"></script>

<?php
	require_once("$webRoot/ortak/barkod/include.php");
	require_once("$webRoot/ortak/login/include.php");
	require_once("$webRoot/ortak/login/layout.php");
	require_once("$webRoot/ortak/filtreForm/include.php");
	/*require_once("$webRoot/ortak/filtreForm/layout.php");*/
	require_once("$webRoot/ortak/gridKolonDuzenle/include.php");
	require_once("$webRoot/ortak/gridKolonDuzenle/layout.php");
	require_once("$webRoot/ortak/mq/masterListe/include.php");
	require_once("$webRoot/ortak/mq/masterListe/layout.php");
	require_once("$webRoot/ortak/mq/modelKullan/include.php");
	require_once("$webRoot/ortak/gridliKolonFiltre/include.php");
	require_once("$webRoot/ortak/gridliKolonFiltre/layout.php");
	require_once("$webRoot/classes/mq/secimler/include.php");
	require_once("$webRoot/classes/mq/secimler/part/include.php");
	require_once("$webRoot/classes/mq/secimler/part/layout.php");
	require_once("$webRoot/ortak/mq/fisListe/include.php");
	require_once("$webRoot/ortak/mq/fisListe/layout.php");
	require_once("$webRoot/ortak/mq/modelTanim/include.php");
	require_once("$webRoot/ortak/mq/modelTanim/layout.php");
	require_once("$webRoot/classes/mq/cogul/kod/tanim/include.php");
	require_once("$webRoot/classes/mq/cogul/kod/tanim/layout.php");
	require_once("$webRoot/ortak/mq/fisGiris/include.php");
	require_once("$webRoot/ortak/mq/fisGiris/layout.php");
	require_once("$webRoot/app/ticari/classes/ortak/raporcu/include.php");
	require_once("$webRoot/app/ticari/classes/ortak/raporcu/layout.php");
?>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/rapor/model/rRaporDetay.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/rapor/model/rRaporDetayEk.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/rapor/model/rRapor.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/rapor/model/rKolonKategori.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/rapor/model/modelRapor.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/rapor/mf/mfRapor.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/rapor/mf/masterRapor.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/ortak/rapor/mf/fisRapor.js"></script>

<?php
	require_once("$webRoot/app/ticari/classes/ortak/eIslem/liste/include.php");
	require_once("$webRoot/app/ticari/classes/ortak/eIslem/liste/layout.php");
?>

<script src="<?=$webRoot?>/app/ticari/classes/ortak/diger/unvanVeAdresYapi.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqSube.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqIsyeri.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqStokIslem.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqStokYer.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqStokDepartman.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqVergiGrup.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqVergi.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqStokAnaGrup.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqStokGrup.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqStokIstGrup.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqStok.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqHizmetGrup.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqHizmet.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqDemirbas.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqCari.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqPlasiyer.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqAltHesapGrup.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqAltHesap.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqKasa.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqBanka.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqBankaHesap.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqBankaKosul.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-master/mqTahsilSekli.js"></script>

<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/yardimci/ticIskYapi.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/yardimci/ekVergiYapi.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/yardimci/ticVergiYapi.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/tsDetay.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/tsAciklamaDetay.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/tsSHDDetay.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/tsStokHizmetDetay.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/tsStokDetay.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/tsHizmetDetay.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/tsDemirbasDetay.js"></script>

<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/tsOrtakFis.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/tsGridKontrolcu.js"></script>

<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/stok/stokGridKontrolcu.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/stok/stokFis.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/stok/stokGCFis.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/stok/stokTransferOrtakFis.js"></script>

<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/ticari/ticariGridKontrolcu.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/ticari/ticariFis.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/ticari/sevkiyatFis.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/ticari/faturaFis.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/ticari/irsaliyeFis.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/ticariStok/ticari/siparisFis.js"></script>

<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/finans/finansFis.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/finans/kasa/kasaCariKontrolcu.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/finans/kasa/kasaCariFis.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-fis/finans/kasa/kasaCariDetay.js"></script>

<script src="<?=$webRoot?>/app/ticari/classes/mq-rapor/stokRapor.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-rapor/cariRapor.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq-rapor/sonStokRapor.js"></script>



<script src="<?=$webRoot?>/app/ticari/classes/mq/mqAnaGrupListele.js"></script>
<script src="<?=$webRoot?>/app/ticari/classes/mq/mqStokGrup.js"></script>
<?php
?>


<div id="prefetch" class="jqx-hidden">
</div>






<script src="./classes/mq/mqAnaGrupListele.js"></script>
<script src="./classes/mq/mqStokGrup.js"></script>
<?php
?>

<div id="prefetch" class="jqx-hidden">
</div>
