<?php $_partRoot = "$webRoot_rapor/dRapor/rapor" ?>
<script src="<?=$_partRoot?>/ticariBase.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/satislar.js?<?=$appVersion?>"></script> 
<script src="<?=$_partRoot?>/alimlar.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/siparisler.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/sonStok.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/muhasebeTotal.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/hizmetMuhKontrol.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/uretimBase.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/uretim.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/operBase.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/oper.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/mesBase.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/mes.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/pdksBase.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/pdks.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/pratikSatis.js?<?=$appVersion?>"></script>

<?php
/*let text = 'cbr00t', tmp = {}, r = {}
let fixedBuf = new Array(10).join('')
for (let n = 0; n < 10; n++) {
	for (let c = 'a'.charCodeAt(0); c <= 'z'.charCodeAt(0); c++) {
		let t0 = performance.now()
		let ch
		for (let i = 0; i < 15_000_000; i++) {
			ch = String.fromCharCode(c)
			let test = ch + fixedBuf
			if (test[0] == text[0])
				tmp[ch] = n * c % t0            // prevent optimizations
		}
		let t1 = performance.now()
		// console.log(ch, t1 - t0)
		r[t1 - t0] = ch
	}
	let sorted = keys(r).sort().reverse().map(k => r[k])
	let possibleLetter = sorted[0]
	console.log(n, 'possible letter', possibleLetter)
}*/
?>
