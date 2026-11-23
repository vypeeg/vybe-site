/*
  VYBE — Google Sheet webhook
  ===========================
  خطوات التشغيل (مرة واحدة فقط):
  1) اعمل Google Sheet جديد (مثلاً باسم VYBE Orders).
  2) من الجوجل شيت: Extensions ← Apps Script.
  3) احذف أي كود موجود والصق الكود ده كله.
  4) اضغط Save، وبعدين Deploy ← New deployment ← Web app.
     - Execute as: Me
     - Who has access: Anyone
  5) انسخ الرابط اللي هيطلع (بيبدأ بـ https://script.google.com/.../exec)
     والصقه في admin.html ← الإعدادات ← Google Sheet Webhook ← ثم "حفظ ونشر".
  6) الموقع هيبعت الطلبات تلقائي، ولو حبيت تعدّل حالة طلب من الأدمن
     اضغط "تحميل الطلبات" واختار الحالة من القائمة.

  ملاحظة: لو حبيت تستخدم شيت محدد، حط الـ ID في SHEET_ID.
*/

var SHEET_ID = ''; // اختياري: Spreadsheet ID. سيبه فاضي لو السكربت جوه الشيت نفسه.

var HEADERS = [
  'orderId', 'createdAt', 'name', 'phone', 'governorate', 'city', 'address',
  'delivery', 'payment', 'items', 'productsTotal', 'shipping', 'deposit',
  'remaining', 'total', 'notes', 'status', 'source'
];

function getSheet() {
  var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  return ss.getActiveSheet();
}

function ensureHeaders(sheet) {
  var last = sheet.getLastColumn();
  if (last === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    return;
  }
  var existing = sheet.getRange(1, 1, 1, last).getValues()[0];
  var missing = [];
  for (var i = 0; i < HEADERS.length; i++) {
    if (existing.indexOf(HEADERS[i]) < 0) missing.push(HEADERS[i]);
  }
  if (missing.length) {
    sheet.getRange(1, last + 1, 1, missing.length).setValues([missing]);
  }
}

function colMap(sheet) {
  var last = Math.max(1, sheet.getLastColumn());
  var row = sheet.getRange(1, 1, 1, last).getValues()[0];
  var map = {};
  for (var i = 0; i < row.length; i++) map[String(row[i]).trim()] = i;
  return map;
}

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var d = JSON.parse(raw);
    var sheet = getSheet();
    ensureHeaders(sheet);
    sheet.appendRow([
      d.orderId || '', d.createdAt || '', d.name || '', d.phone || '',
      d.governorate || '', d.city || '', d.address || '', d.delivery || '',
      d.payment || '', Array.isArray(d.items) ? d.items.join(' | ') : (d.items || ''),
      d.productsTotal || 0, d.shipping || 0, d.deposit || 0,
      d.remaining || 0, d.total || 0, d.notes || '', d.status || 'new', 'website'
    ]);
    return plain({ ok: true, orderId: d.orderId || '' });
  } catch (err) {
    return plain({ ok: false, error: String(err) });
  }
}

function listOrders() {
  var sheet = getSheet();
  if (sheet.getLastRow() < 2) return [];
  var map = colMap(sheet);
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  return rows.filter(function (r) { return r[map.orderId]; }).map(function (r) {
    var o = {};
    HEADERS.forEach(function (h) { o[h] = map[h] != null ? r[map[h]] : ''; });
    return o;
  });
}

function setStatus(orderId, status) {
  var sheet = getSheet();
  var map = colMap(sheet);
  var col = map.orderId;
  var statusCol = map.status;
  if (col == null || statusCol == null || sheet.getLastRow() < 2) return false;
  var ids = sheet.getRange(2, col + 1, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === String(orderId).trim()) {
      sheet.getRange(i + 2, statusCol + 1).setValue(status);
      return true;
    }
  }
  return false;
}

function doGet(e) {
  var p = e && e.parameter ? e.parameter : {};
  var cb = /^[A-Za-z0-9_]+$/.test(p.callback || '') ? p.callback : '';
  try {
    if (p.action === 'list') return output(cb, { orders: listOrders() });
    if (p.action === 'status' && p.id && p.status) {
      return output(cb, { ok: setStatus(p.id, p.status) });
    }
    return ContentService.createTextOutput('VYBE webhook OK. Use ?action=list');
  } catch (err) {
    return output(cb, { ok: false, error: String(err) });
  }
}

function output(cb, obj) {
  var text = JSON.stringify(obj);
  if (cb) text = cb + '(' + text + ');';
  return ContentService.createTextOutput(text)
    .setMimeType(cb ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function plain(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
