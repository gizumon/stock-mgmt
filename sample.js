function myFunction() {
  var ss = SpreadsheetApp.openById('112hbvHpRtZL9TkbaaprEnLlsfr2z6d8CUIkBpK-x4G0');
  var sh = ss.getSheetByName("test");
  var cell = sh.getRange(1,1);
  cell.setValue("Hello...");
}

function myFunction2() {
  var ss = SpreadsheetApp.openById('112hbvHpRtZL9TkbaaprEnLlsfr2z6d8CUIkBpK-x4G0');
  var sh = ss.getSheetByName("test");
  var cell = sh.getRange(1,1);
  cell.setValue("Hello2");
}

function test() {
  var url = "http://resource.ufocatch.com/atom/tdnetx/query/77790";
  var response = UrlFetchApp.fetch(url);
  var context = response.getContentText();
  Logger.log(context);
  
  var ss = SpreadsheetApp.openById('112hbvHpRtZL9TkbaaprEnLlsfr2z6d8CUIkBpK-x4G0');
  var sh = ss.getSheetByName("test");
  
  var cell = sh.getRange(1,1);
  cell.setValue(context);
  
  }