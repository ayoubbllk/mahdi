function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const data = (e && e.parameter) || {};
  if (data.name && data.phone) {
    try {
      appendOrder(data);
      return json_({ ok: true });
    } catch (err) {
      return json_({ ok: false, error: String(err) });
    }
  }
  return ContentService.createTextOutput("Sovidio orders ready");
}

function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (_) {
        data = (e.parameter) || {};
      }
    } else {
      data = (e && e.parameter) || {};
    }
    appendOrder(data);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function appendOrder(data) {
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
    data.fbclid ? ("meta-ads " + data.fbclid) : (data.source || "landing")
  ]);
}

function getMahdiSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Ouvre Apps Script depuis le Google Sheet mahdi, puis redéploie.");
  }
  let sheet = ss.getSheetByName("mahdi");
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName("mahdi");
  }
  return sheet;
}

function ensureHeaders(sheet) {
  const first = sheet.getRange(1, 1).getValue();
  if (first) return;
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
