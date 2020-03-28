function doGet(e){
  notifyFromLine();
  return;
}

function sendHttpPost(message){

  //取得・更新対象のシートを選択。
  var ss = SpreadsheetApp.openById('112hbvHpRtZL9TkbaaprEnLlsfr2z6d8CUIkBpK-x4G0');
  var objSheet = ss.getSheetByName("購入株");
 
  //LINE tokenを取得。(q1p6Ert7J1nErr6PPzIb83houqt9eYU2PUWod1TVNT0)
  var ACCESS_TOKEN = objSheet.getRange(3,2).getValue();
  Logger.log(ACCESS_TOKEN);
  var options =
   {
     "method"  : "post",
     "payload" : "message=" + message,
     "headers" : {"Authorization" : "Bearer "+ ACCESS_TOKEN}
   };

   UrlFetchApp.fetch("https://notify-api.line.me/api/notify",options);
}

function notifyFromLine(){
  Logger.log("NotifyFromLine処理を開始します。");

  //環境変数を取得
  var today = new Date();
  var message = "\n\n      【 株価情報通知 】\n   " + Utilities.formatDate(today,"JST","yyyy/MM/dd HH:MM:SS") + "\n";
  
  //取得・更新対象のシートを選択。
  var ss = SpreadsheetApp.openById('112hbvHpRtZL9TkbaaprEnLlsfr2z6d8CUIkBpK-x4G0');
  var objSheet = ss.getSheetByName("購入株");
  
  Logger.log("対象シートの情報を取得します。");
  //Summaryを取得
  var summaryRange = objSheet.getRange(3,13,6,13);
  var detailRange = objSheet.getRange(9,1,36,14);
  var count = 0;
  while(detailRange.getValues().indexOf("NaN") >= 0){
    Utilities.sleep(1000);
    count++;
    detailRange = objSheet.getRange(9,1,28,14);
    Logger.log("情報取得をリトライします。");
    if(count>10){break;}; 
  };
  Logger.log("対象シートの情報取得が完了しました。");
  
  var summaryBuyStock = summaryRange.getValues();
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
  Logger.log("最終行取得を取得しました。(%s行)",lastRow);
  for(var i=0; i < lastRow; i++){
    message = message + "\n ======[ " + detailBuyStock[i][0] + " ]======\n" +
        "銘柄　　　: "+ detailBuyStock[i][1] + "\n" +
        "現在価格　: " + detailBuyStock[i][5] + "円\n" +
        "前日比　　: " + detailBuyStock[i][8] + "円 (" + Number(detailBuyStock[i][9]).toFixed(1) + "pct)\n" + 
        "損益　　　: "+ separate(parseInt(detailBuyStock[i][10],10)) + "円\n" +
        "損益率　　: " + (detailBuyStock[i][11]*100).toFixed(1) + " pct \n" +
        "目標まで　: "+ detailBuyStock[i][12] + " (" + detailBuyStock[i][13] + " )\n";
  }
  message = message + "\n               【 END 】";
  Logger.log("メッセージを格納しました。");
  sendHttpPost(message);
  Logger.log("メッセージを送信しました。");
}

function separate(num){
    return String(num).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}