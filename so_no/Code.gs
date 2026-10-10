/**
 * SỔ NỢ — điểm đồng bộ Apps Script.
 * Dán file này vào: mở Google Sheets → Tiện ích mở rộng → Apps Script
 * → dán toàn bộ → Deploy → New deployment → Web app
 *   (Execute as: Me — Who has access: Anyone) → copy link /exec.
 */

const SHEET_NAME = 'SO_NO';

function sh_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET_NAME);
  if (!s) {
    s = ss.insertSheet(SHEET_NAME);
    s.appendRow(['id', 'ngay', 'gio', 'ten', 'loai',
                 'tien', 'ghi_chu', 'da_xoa']);
    s.getRange(1, 1, 1, 8).setFontWeight('bold');
  }
  return s;
}

// GET ?all=1  →  trả toàn bộ ghi dạng JSON
function doGet(e) {
  const s = sh_();
  const v = s.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < v.length; i++) {
    if (!v[i][0]) continue;
    rows.push({
      id: Number(v[i][0]), ngay: v[i][1], gio: v[i][2],
      ten: v[i][3], loai: v[i][4], tien: Number(v[i][5]),
      gc: v[i][6], xoa: v[i][7] ? 1 : 0,
    });
  }
  return ContentService.createTextOutput(JSON.stringify({rows}))
    .setMimeType(ContentService.MimeType.JSON);
}

// POST {rows:[...]} → ghi/cập nhật theo id
function doPost(e) {
  const s = sh_();
  const body = JSON.parse(e.postData.contents || '{}');
  const data = s.getDataRange().getValues();
  const pos = {};                       // id -> số dòng
  for (let i = 1; i < data.length; i++)
    if (data[i][0]) pos[String(data[i][0])] = i + 1;
  (body.rows || []).forEach(t => {
    const row = [t.id, t.ngay || '', t.gio || '', t.ten || '',
                 t.loai || '', t.tien || 0, t.gc || '', t.xoa ? 1 : ''];
    const r = pos[String(t.id)];
    if (r) s.getRange(r, 1, 1, 8).setValues([row]);
    else   s.appendRow(row);
  });
  return ContentService.createTextOutput('{"ok":1}')
    .setMimeType(ContentService.MimeType.JSON);
}
