# Onaycı Akışı Notları

## Neden Yapıldı / Yapılmasaydı Ne Bozulurdu?
1. **Firma veritabanı eşleşmesi ve kural sözlüğü**: `loadServerDataDogrudan` içinde kurallar kullanıcıya göre okunup her bir veritabanıyla anahtarlandırılıyor. Bu adım olmazsa, aynı kullanıcı için birden fazla firma veritabanı varsa kurallar yanlış eşleşir ve listede onaylanabilir kayıt görünmez. 【F:app/onayci/classes/mqOnayci.js†L32-L149】
2. **Bekleyen onay aşamasının hesaplanması**: Kayıtlar, mevcut onay sütunlarına bakılarak bekleyen onay numarasıyla işaretleniyor ve kurala göre filtreleniyor. Bu olmazsa, önceki onayı olmayan kayıtlar üst aşama kurallarına takılmaz ve hatalı şekilde işlemeye açılır. 【F:app/onayci/classes/mqOnayci.js†L133-L148】
3. **İşlem öncesi kural ve önceki onay doğrulaması**: `onayRedIstendi` seçim listesinden uygun olmayanları ayıklıyor ve gerekçesini bildiriyor. Bu adım kaldırılırsa kullanıcı yanlış kayıtları onaylayabilir veya reddebilir; işlem sonrası veri tutarlılığı bozulur. 【F:app/onayci/classes/mqOnayci.js†L152-L213】

## Örnek Kural Yükleme Komutu
Aynı kullanıcı için eski kuralları silip yeni kuralları eklemek ve veritabanı eşleşmesinin üst/alt harf duyarlılığını korumak için:

```javascript
let { encUser: xuserkod } = config.session
let hvListe = [
  { xuserkod, firmaadi: 'YDDENIZ',  onayno: 1, tip: 'TF' },
  { xuserkod, firmaadi: 'YDDENIZ',  onayno: 2, tip: 'TF' },
  { xuserkod, firmaadi: 'YDCASTROL', onayno: 1, tip: 'AF' },
  { xuserkod, firmaadi: 'CNGAS',    onayno: 1, tip: 'TS' },
  { xuserkod, firmaadi: 'CNGAS',    onayno: 1, tip: 'TF' },
  { xuserkod, firmaadi: 'CNGAS',    onayno: 1, tip: 'AF' },
  { xuserkod, firmaadi: 'CNGAS',    onayno: 2, tip: 'AF' },
  { xuserkod, firmaadi: 'CNGAS',    onayno: 2, tip: 'TI' }
]
let table = 'ORTAK..firmaonayci'
let toplu = new MQToplu([
  new MQIliskiliDelete({ from: table, where: wh => wh.degerAta(xuserkod, 'xuserkod') }),
  new MQInsert({ table, hvListe })
]).withTrn()
await app.sqlExecNone(toplu)
```
Bu sürüm eski kayıtları yalnızca ilgili kullanıcı için temizler ve yeni kuralları tek tranzaksiyonla ekler; veritabanı adı içinde `firmaadi` alt dizesi bulunmadıkça kayıt listelenmeyeceğini unutmayın.
