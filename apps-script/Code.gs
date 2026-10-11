function doGet() {
  return ContentService.createTextOutput("Sovidio orders ready");
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getMahdiSheet();
    ensureHeaders(sheet);
    sheet.appendRow([
      new Date(),
      data.name || "",
      "'" + String(data.phone || ""),
      data.wilaya || "",
      data.address || "",
      data.color || "",
      Number(data.qty) || 1,
      Number(data.total) || 0,
      data.offer || "لانش بوكس مجاني",
      "landing"
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getMahdiSheet() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  const ss = active || openOrCreateMahdiFile();
  let sheet = ss.getSheetByName("mahdi");
  if (!sheet) {
    const first = ss.getSheets()[0];
    if (first.getLastRow() === 0) {
      first.setName("mahdi");
      sheet = first;
    } else {
      sheet = ss.insertSheet("mahdi");
    }
  }
  return sheet;
}

function openOrCreateMahdiFile() {
  const files = DriveApp.getFilesByName("mahdi");
  return files.hasNext()
    ? SpreadsheetApp.open(files.next())
    : SpreadsheetApp.create("mahdi");
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow([
    "التاريخ",
    "الاسم",
    "الهاتف",
    "الولاية",
    "العنوان",
    "اللون",
    "الكمية",
    "المجموع (دج)",
    "العرض",
    "المصدر"
  ]);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 10);
}
