function doGet(e){
  // notifyFromLine();
  main();
  return;
}

function main() {
  var id = '112hbvHpRtZL9TkbaaprEnLlsfr2z6d8CUIkBpK-x4G0';
  var sheetName = '購入株';
  var today = new Date();
  var sheetObj = setSheetInformation(id, sheetName);
　var lastRow = getLastRow(sheetObj, 'A9:A36');

  var summaryRange = sheetObj.getRange(2,13,6,1);
  var detailRange = sheetObj.getRange(9,1,36,14);
  sendHeader(today);
  waitUntilGetValues(detailRange);
  sendSummary(summaryRange);
  sendDetails(detailRange, lastRow);
}

function sendHttpPost(message){
  //取得・更新対象のシートを選択。
  var id = '112hbvHpRtZL9TkbaaprEnLlsfr2z6d8CUIkBpK-x4G0';
  var sheetName = '購入株';
  var sheetObj = setSheetInformation(id, sheetName);
 
  //LINE tokenを取得。(q1p6Ert7J1nErr6PPzIb83houqt9eYU2PUWod1TVNT0)
  var ACCESS_TOKEN = sheetObj.getRange(3,2).getValue();
  // Logger.log(ACCESS_TOKEN);
  var options = {
     "method"  : "post",
     "payload" : "message=" + message,
     "headers" : {"Authorization" : "Bearer "+ ACCESS_TOKEN}
   };

   UrlFetchApp.fetch("https://notify-api.line.me/api/notify",options);
}

function notifyFromLine(){
  Logger.log("NotifyFromLine処理を開始します。");
  var count = 0;
  var limit = 10;
  var sleep = 1000;
  var today = new Date();
  var message = "\n\n      【 株価情報通知 】\n   " + Utilities.formatDate(today,"JST","yyyy/MM/dd HH:MM:SS") + "\n";
  
  //取得・更新対象のシートを選択。
  var ss = SpreadsheetApp.openById('112hbvHpRtZL9TkbaaprEnLlsfr2z6d8CUIkBpK-x4G0');
  var objSheet = ss.getSheetByName("購入株");
  
  Logger.log("対象シートの情報を取得します。");
  // サマリーを取得 (3行目から6行:13列目から13列)
  // 詳細を取得 (9行目から36行:1列から14列目)
  // var summaryRange = objSheet.getRange(3,13,6,1);
  var detailRange = objSheet.getRange(9,1,36,14);

  while(detailRange.getValues().indexOf("NaN") >= 0){
    Utilities.sleep(sleep);
    count++;
    detailRange = objSheet.getRange(9,1,28,14);
    Logger.log("情報取得をリトライします。");
    if(count > limit){
      Logger.log("INFO: Exceed retry count over 10 times");
      break;
    }; 
  };
  Logger.log("対象シートの情報取得が完了しました。");
  
  // var summaryBuyStock = summaryRange.getValues();
  var detailBuyStock = detailRange.getValues();
  
//  //詳細取得
//  var tickerCodes = objSheet.getRange('A9:A36').getValues();
//  var tickerNames = objSheet.getRange('B9:B36').getValues();
//  var purchaseAmounts = objSheet.getRange('C9:C36').getValues();
//  var purchasePrices = objSheet.getRange('D9:D36').getValues();
//  var purchaseDays = objSheet.getRange('E9:E36').getValues();
//  
//  var currentPrices = objSheet.getRange('F9:G36').getValues();
//  var buyTargetDays = objSheet.getRange('G9:G36').getValues();
//  var buyTargetPrices = objSheet.getRange('H9:H36').getValues();
//  var changes = objSheet.getRange('I9:I36').getValues();
//  var changeRatio = objSheet.getRange('J9:J36').getValues();
  
//  var profitAndLosses = objSheet.getRange('K9:K36').getValues();
//  var profitAndLossRates = objSheet.getRange('L9:L36').getValues();
//  var priceDifferences = objSheet.getRange('M9:M36').getValues();
//  var leftDays = objSheet.getRange('N9:N36').getValues();
  Logger.log("銘柄の取得確認：　" + detailBuyStock[0][1])
  Logger.log("現在価格の取得確認：　" + detailBuyStock[0][5])
  Logger.log("前日比の取得確認：　" + detailBuyStock[0][8])
  Logger.log("損益の取得確認：　" + detailBuyStock[0][10])
  
  //最終行取得
  var checkLastRows = objSheet.getRange('A9:A36').getValues();
  var lastRow = checkLastRows.filter(String).length;
  Logger.log("最終行取得: %s行",lastRow);
  for(var i=0; i < lastRow; i++){
    message = message + "\n ======[ " + detailBuyStock[i][0] + " ]======\n" +
        "銘柄　　　: "+ detailBuyStock[i][1] + "\n" +
        "現在価格　: " + detailBuyStock[i][5] + "円\n" +
        "前日比　　: " + detailBuyStock[i][8] + "円 (" + Number(detailBuyStock[i][9]).toFixed(1) + "pct)\n" + 
        "損益　　　: "+ separate(parseInt(detailBuyStock[i][10],10)) + "円\n" +
        "損益率　　: " + (detailBuyStock[i][11]*100).toFixed(1) + " \% \n" +
        "目標まで　: "+ detailBuyStock[i][12] + " (" + detailBuyStock[i][13] + " )\n";
  }
  message = message + "\n               【 END 】";
  Logger.log("メッセージを格納");
  sendHttpPost(message);
  Logger.log("メッセージを送信");
}

/**
 * シートオブジェクトの取得
 * @param String id '112hbvHpRtZL9TkbaaprEnLlsfr2z6d8CUIkBpK-x4G0'
 * @param String name '購入株'
 * @return {Object} シートオブジェクト
 */
function setSheetInformation(id, name) {
  //取得・更新対象のシートを選択。
  return SpreadsheetApp.openById(id).getSheetByName(name); 
}

function sendHeader(today) {
  Logger.log("sendHeader処理を開始");
  var message = "よっこいしょっと。\n"
                + "そろそろ" + Utilities.formatDate(today,"JST","MM月dd日") + "の株価をお知らせの時間ですな。\n";
  sendHttpPost(message);
}

/**
 * 指定したRangeに値が入るまでリトライ (最大10秒)
 * @param {*} targetRange 
 * @return {Boolean} 成功フラグ
 */
function waitUntilGetValues(targetRange) {
  var retryCount = 0;
  var retryLimit = 10;
  var sleep = 1000;
  var isSuccess = true;
  while(targetRange.getValues().indexOf("NaN") >= 0){
    Utilities.sleep(sleep);
    retryCount++;
    // detailRange = objSheet.getRange(9,1,28,14);
    Logger.log("INFO: Retry...");
    if(retryCount > retryLimit){
      Logger.log("INFO: Exceed retry count over 10 times");
      isSuccess = false;
      break;
    };
  };
  return isSuccess;
}

/**
 * 株価のサマリーを取得
 * ※ 取得不可な株価があるため、正しい結果が返らないため、使用なし。
 * @param {*} summaryRange 
 */
function sendSummary(summaryRange) {
  // サマリーを取得 (2行目から6行:13列目から13列)
  var summaryValues = summaryRange.getValues();
  var message = "まずは、株価のサマリーを送るんじゃ。\n";
  message = message +
      // "投資可能金額　: " + separate(parseInt(detailBuyStock[2][1],10)) + "円\n" +
      // "合計投資金額　: " + separate(parseInt(detailBuyStock[3][1],10)) + "円\n" +
      "現在評価額　　: " + separate(parseInt(summaryValues[4][1],10)) + "円\n" +
      "合計損益　　　: " + separate(parseInt(summaryValues[5][1],10)) + "円\n" +
      "損益率　　　　: " + (summaryValues[6][1]*100).toFixed(1) + " \% \n";
  sendHttpPost(message);
}

function　sendDetails(detailRange, lastRow) {
  var detailValues = detailRange.getValues();
  var message = "よっこいしょと。\n";
  for(var i=0; i < lastRow; i++){
    message = message + "\n ======[ " + detailValues[i][0] + " ]======\n" +
        "銘柄　　　: "+ detailValues[i][1] + "\n" +
        "現在価格　: " + detailValues[i][5] + "円\n" +
        "前日比　　: " + detailValues[i][8] + "円 (" + Number(detailBuyStock[i][9]).toFixed(1) + "pct)\n" + 
        "損益　　　: "+ separate(parseInt(detailValues[i][10],10)) + "円\n" +
        "損益率　　: " + (detailValues[i][11]*100).toFixed(1) + " \% \n" +
        "目標まで　: "+ detailValues[i][12] + " (" + detailValues[i][13] + " )\n\n";
    sendHttpPost(message);
  }
  message = "ふう、おつかれおつかれ。では、明日もがんばるんじゃぞ。";
  sendHttpPost(message);
}

function separate(num){
    return String(num).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}

/**
 * 最終行を取得
 * @param {*} sheetObj 
 * @param {*} range 
 */
function getLastRow(sheetObj, range) {
  var checkLastRows = sheetObj.getRange(range).getValues();
  var lastRow = checkLastRows.filter(String).length;
}