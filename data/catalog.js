/*
  VYBE catalogue
  --------------
  كل حاجة بتظهر في الموقع (الأسعار، رقم واتساب، الأقسام، التصاميم) بتتعدل من هنا
  أو من صفحة admin.html اللي بتطلع ملف catalog.js جاهز للنشر.

  الأقسام هي اللي بتجمع الصور: نيون / براويز ثلاثية / كورة / أنمي / رابرز إلخ.
  لإضافة قسم أو صورة جديدة: استخدم الأدمن، أو حط الصورة في مجلد images
  وضيف عنصر جديد في posters واختار له cat من الأقسام.
*/
(function () {
  var P = [1199, 1312]; // مقاس بوستر VYPE
  var T = [1536, 1024]; // مقاس البراويز الثلاثية

  function files(prefix, from, to) {
    var out = [];
    for (var i = from; i <= to; i++) out.push(prefix + i + ".png");
    return out;
  }

  function group(names, idPrefix, cat, arName, enName, tagAr, tagEn, dims, extra) {
    return names.map(function (file, i) {
      var p = {
        id: idPrefix + "-" + (i + 1),
        cat: cat,
        ar: arName + " " + (i + 1),
        en: enName + " " + (i + 1),
        tagAr: tagAr,
        tagEn: tagEn,
        img: "images/" + file,
        w: dims[0],
        h: dims[1]
      };
      if (extra) Object.keys(extra).forEach(function (k) { p[k] = extra[k]; });
      return p;
    });
  }

  var neon = {
    descAr: "توهج نيون يحط لمبة في أي حيطة. مثالي لغرفة نوم أو ركن مكتب.",
    descEn: "A neon glow that lights up any wall. Perfect for a bedroom or desk corner.",
    colorsAr: "أسود، أبيض، خشبي",
    colorsEn: "black, white, oak"
  };


  var neonList = group(files("VYPE POSTER n", 1, 8), "neon", "neon", "بوستر نيون", "Neon poster", "نيون", "Neon", P, neon);

  var curated = [
    { id: "barek", cat: "islamic", ar: "بارك اللهم هذا البيت", en: "Bless this home", tagAr: "هدية بيت جديد", tagEn: "New-home gift", img: "images/barek.jpg", w: 700, h: 932, featured: true },
    { id: "sobhan", cat: "islamic", ar: "سبحان الله والحمد لله", en: "SubhanAllah wa alhamdulillah", tagAr: "ذكر", tagEn: "Dhikr", img: "images/sobhan.jpg", w: 700, h: 932, featured: true },
    { id: "sea", cat: "islamic", ar: "وعسى أن تكرهوا شيئًا", en: "Perhaps you dislike a thing", tagAr: "غرفة وصالة", tagEn: "Living room", img: "images/sea.jpg", w: 700, h: 932 },
  ];

  var posters = neonList
    .concat(group(files("VYPE POSTER b", 1, 9), "football", "football", "بوستر كورة", "Football poster", "كورة", "Football", P))
    .concat(group(files("VYPE POSTER z", 1, 8), "anime", "anime", "بوستر أنمي", "Anime poster", "أنمي", "Anime", P))
    .concat(curated);

  /*
    الأكثر مبيعاً: المنتجات اللي علامتها featured هي اللي بتظهر في قسم «الأكثر مبيعاً».
    العروض: oldPrice هو السعر قبل الخصم لكل مقاس، والسعر الحالي في settings.prices
    هو السعر بعد الخصم. أي منتج له oldPrice بيظهر تلقائي في قسم «العروض».
  */
  ["neon-1", "neon-5", "football-1", "anime-1", "barek"].forEach(function (id) {
    var item = posters.filter(function (p) { return p.id === id; })[0];
    if (item) item.featured = true;
  });

  var OFFERS = {
    "neon-1":     { "20x30": 250, "30x40": 420 },
    "football-1": { "20x30": 240, "30x40": 400 },
    "anime-1":    { "20x30": 250, "30x40": 420 },
    "barek":      { "20x30": 250, "30x40": 420 },
    "sea":        { "20x30": 250, "30x40": 420 }
  };
  Object.keys(OFFERS).forEach(function (id) {
    var item = posters.filter(function (p) { return p.id === id; })[0];
    if (item) item.oldPrice = OFFERS[id];
  });

  /* كل منتج يحصل على سعرين (قبل/بعد الخصم) — عرض معمول على كل التصاميم */
  posters.forEach(function (p) {
    if (!p.oldPrice) {
      p.oldPrice = { "20x30": 250, "30x40": 420 };
    }
  });

  window.VYBE_CATALOG = {
    settings: {
      whatsapp: "201508016013",
      display: "01508016013",
      tiktok: "eg.vyb",
      instagram: "eg.vyb",
      prices: {
        "20x30": 200,
        "30x40": 330
      },
      shipping: {
        "القاهرة": 75, "الجيزة": 75, "القليوبية": 75,
        "الإسكندرية": 90, "الشرقية": 90, "الدقهلية": 90, "الغربية": 90,
        "المنوفية": 90, "البحيرة": 90, "كفر الشيخ": 90, "دمياط": 90,
        "بورسعيد": 90, "الإسماعيلية": 90, "السويس": 90, "الفيوم": 90, "بني سويف": 90,
        "شمال سيناء": 110, "جنوب سيناء": 110, "المنيا": 110, "أسيوط": 110,
        "سوهاج": 110, "قنا": 110, "الأقصر": 110, "أسوان": 110,
        "البحر الأحمر": 110, "الوادي الجديد": 110, "مطروح": 110
      },
      shippingDefault: 90,
      sheetWebhook: ""
    },
    categories: [
      { id: "poster3", ar: "3 بوسترات", en: "3 Posters" },
      { id: "neon", ar: "نيون", en: "Neon Poster" },
      { id: "cars", ar: "عربيات", en: "Cars" },
      { id: "motorcycle", ar: "دراجات نارية", en: "Motorcycle" },
      { id: "football", ar: "كورة", en: "Football" },
      { id: "singer", ar: "مغنيين", en: "Singers" },
      { id: "movies", ar: "أفلام وعروض", en: "Movies & Shows" },
      { id: "islamic", ar: "إسلامي وقرآن", en: "Islamic & Quran" },
      { id: "gaming", ar: "ألعاب", en: "Gaming" },
      { id: "anime", ar: "أنمي", en: "Anime" },
      { id: "decor", ar: "ديكور", en: "Decor" }
    ],
    posters: posters
  };
})();
