
var localizationObj = initLocalization();

function initLocalization() {
	var ci = Date.CultureInfo || {
		dayNames: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
		abbreviatedDayNames: ['Pts', 'Sal', 'Çar', 'Per', 'Cuma', 'Cts', 'Pzr'],
		abbreviatedDayNames: ['Pts', 'Sal', 'Çar', 'Per', 'Cuma', 'Cts', 'Pzr'],
		monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
		abbreviatedMonthNames: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
	};

	var obj = {
		loadingtext: 'Yükleniyor...', loadtext: 'Yükleniyor...', emptydatastring: 'Gösterilecek veri yok',
		filterselectallstring: '(Tümünü Seç)', filterdeselectallstring: '(Tümünü Bırak)',
		pagershowrowsstring: 'Göster:', pagerrangestring: ' -> ', pagergotopagestring: 'Sayfaya Git:',
		pagerpreviousbuttonstring: 'Önceki', pagernextbuttonstring: 'Sonraki',
		groupsheaderstring: "Gruplanacak kolonu buraya sürükleyiniz",
		sortascendingstring: 'A-Z', sortdescendingstring: 'Z-A',
		sortremovestring: 'Sırama Yok', sortremovestring: "Sırama Kaldır",
		groupbystring: "Bu kolona göre Grupla", groupremovestring: "Gruplamadan Kaldır",
		everpresentrowplaceholder: ': ', addrowstring: 'Ekle',
		udpaterowstring: 'Güncelle', updaterowstring: 'Güncelle', resetrowstring: 'Sıfırla',
		todaystring: 'Bugün', clearstring: 'Temizle',
		filtersearchstring: '<p style="font-weight: bold; color: #777; padding: 8px 0 0 2px;">Bul</p>',
		filterstring: "Filtre", filterchoosestring: "Seçiniz:", filterselectstring: "---",
		filterclearstring: "Temizle", filtershowrowstring: 'Şu satırları göster:',
		filterorconditionstring: "VEYA", filterandconditionstring: "VE",
		filterstringcomparisonoperators: [
			'boş olan', 'boş olmayan',
			'içeren', 'içeren (büyük-küçük harf duyarlı)',
			'içermeyen', 'içermeyen (büyük-küçük harf duyarlı)',
			'... ile başlayan', '... ile başlayan (büyük-küçük harf duyarlı)',
			'... ile biten', '... ile biten (büyük-küçük harf duyarlı)',
			'aynı değer', 'aynı değer (büyük-küçük harf duyarlı)',
			'null', 'null olmayan'
		],
		filternumericcomparisonoperators: [
			'aynı değer', 'farklı olan',
			'küçüktür', 'küçük veya eşit', 'büyüktür', 'büyük veya eşit',
			'null', 'null olmayan'
		],
		filterdatecomparisonoperators: [
			'aynı değer', 'farklı olan',
			'küçüktür', 'küçük veya eşit', 'büyüktür', 'büyük veya eşit',
			'null', 'null olmayan'
		],
		percentsymbol: '%',
		currencysymbol: ' TL', currencysymbolposition: 'after',
		decimalseparator: ',', thousandsseparator: '.',
		firstDay: 1,
		days: {
			names: ci.dayNames,
			namesAbbr: ci.abbreviatedDayNames,
			namesShort: ci.abbreviatedDayNames
		},
		months: {
			names: ci.monthNames,
			namesAbbr: ci.abbreviatedMonthNames
		}
	};
	
	return obj;
}

/*
firstDay: 0,
days: {
    // full day names
    names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    // abbreviated day names
    namesAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    // shortest day names
    namesShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
},
months: {
    // full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
    names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", ""],
    // abbreviated month names
    namesAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""]
},
// AM and PM designators in one of these forms:
// The usual view, and the upper and lower case versions
//      [standard,lowercase,uppercase]
// The culture does not use AM or PM (likely all standard date formats use 24 hour time)
//      null
AM: ["AM", "am", "AM"],
PM: ["PM", "pm", "PM"],
eras: [
// eras in reverse chronological order.
// name: the name of the era in this culture (e.g. A.D., C.E.)
// start: when the era starts in ticks (gregorian, gmt), null if it is the earliest supported era.
// offset: offset in years from gregorian calendar
{"name": "A.D.", "start": null, "offset": 0 }
],
twoDigitYearMax: 2029,
patterns: {
    // short date pattern
    d: "M/d/yyyy",
    // long date pattern
    D: "dddd, MMMM dd, yyyy",
    // short time pattern
    t: "h:mm tt",
    // long time pattern
    T: "h:mm:ss tt",
    // long date, short time pattern
    f: "dddd, MMMM dd, yyyy h:mm tt",
    // long date, long time pattern
    F: "dddd, MMMM dd, yyyy h:mm:ss tt",
    // month/day pattern
    M: "MMMM dd",
    // month/year pattern
    Y: "yyyy MMMM",
    // S is a sortable format that does not vary by culture
    S: "yyyy\u0027-\u0027MM\u0027-\u0027dd\u0027T\u0027HH\u0027:\u0027mm\u0027:\u0027ss"
},
percentsymbol: "%",
currencysymbol: "$",
currencysymbolposition: "before",
decimalseparator: '.',
thousandsseparator: ',',
pagergotopagestring: "Go to:",
pagershowrowsstring: "Show rows:",
pagerrangestring: " of ",
pagerpreviousbuttonstring: "previous",
pagernextbuttonstring: "next",
groupsheaderstring: "Drag a column and drop it here to group by that column",
sortascendingstring: "Sort Ascending",
sortdescendingstring: "Sort Descending",
sortremovestring: "Remove Sort",
groupbystring: "Group By this column",
groupremovestring: "Remove from groups",
filterclearstring: "Clear",
filterstring: "Filter",
filtershowrowstring: "Show rows where:",
filterorconditionstring: "Or",
filterandconditionstring: "And",
filterstringcomparisonoperators: ['empty', 'not empty', 'contains', 'contains(match case)',
    'does not contain', 'does not contain(match case)', 'starts with', 'starts with(match case)',
    'ends with', 'ends with(match case)', 'equal', 'equal(match case)', 'null', 'not null'],
filternumericcomparisonoperators: ['equal', 'not equal', 'less than', 'less than or equal', 'greater than', 'greater than or equal', 'null', 'not null'],
filterdatecomparisonoperators: ['equal', 'not equal', 'less than', 'less than or equal', 'greater than', 'greater than or equal', 'null', 'not null']
*/
