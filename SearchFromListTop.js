function searchFromList() {
  Logger.log("searchFromLlist処理を開始します。");
  
  //環境変数を取得。
  var today = new Date();
  
  //取得・更新対象のシートを選択。
  var ss = SpreadsheetApp.openById('112hbvHpRtZL9TkbaaprEnLlsfr2z6d8CUIkBpK-x4G0');
  var refSheet = ss.getSheetByName("評価対象検索");
  var objSheet = ss.getSheetByName("銘柄調査");
 
  //参照・更新対象の銘柄コードを定義。
  var refTickerSymbol = refSheet.getRange(6,2);
  var updateTickerSymbol = objSheet.getRange(5,2);
  
  //検索対象がない場合の処理。
  if(refTickerSymbol===""){
    Logger.log("リストに検索対象がありません。")
    return;
  }
  
  //検索する銘柄コードを取得し、検索対象にセット。
  var searchSymbol = refTickerSymbol.getValue();
  updateTickerSymbol.setValue(searchSymbol);
  
  //検索対象のシートへ移動。
  SpreadsheetApp.setActiveSheet(objSheet);
  
  Logger.log("I：銘柄調査シートへ遷移しました。");
  Logger.log("I：searchFromList処理を終了します。");
}