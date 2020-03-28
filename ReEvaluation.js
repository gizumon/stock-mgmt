function updateReEvaluation() {
  Logger.log("updateReEvaluation処理を開始します。");
  
  //環境変数を取得。
  var today = new Date();
  
  //取得・更新対象のシートを選択。
  var ss = SpreadsheetApp.openById('112hbvHpRtZL9TkbaaprEnLlsfr2z6d8CUIkBpK-x4G0');
  var refSheet = ss.getSheetByName("評価対象検索");
  var updateSheet = ss.getSheetByName("評価対象銘柄DB");
  
  //各シートの検索範囲を変数化。
  var refStartRow = 6;
  var refEndRow = 100;
  var updateStartRow = 5;
  var updateEndRow = 100;
  
  //検索列：参照は銘柄コードがB(2)列、再評価がH(8)列。
  var refEvaColumn = 8;
  var refCodeColumn = 2;
  var refCommentColumn = 9;

  //入力参照結果格納リスト。
  var resultReEvaluationList = [];
  var resultCodeList = [];
  var resultCommentList = [];
  
  //更新列：検索する銘柄コードがC(3)列、更新する評価がM(13)列。
  var updateEvaColumn = 13;
  var updateCodeColumn = 3;
  var updateDateColumn = 2;
  var updateCurrentValueColumn = 6;
  var updateEvaluateValueColumn = 8;
  var updateCommentColumn = 15;
  
  //評価フラグを作成。
  var refFirstEvaluationFlg = 0;
  
  
  //参照シート(refSheet)の再評価情報が入力されていない場合
  for(var i=refStartRow; i <= refEndRow; i++){
    if(!refSheet.getRange(i,refEvaColumn).getValue()){
      //何もしない。
    } else {
      //再評価情報を取得。(銘柄コード B6:B100, 再評価 H6:H100)
      resultReEvaluationList.push(refSheet.getRange(i,refEvaColumn).getValue());
      resultCodeList.push(refSheet.getRange(i,refCodeColumn).getValue());
      resultCommentList.push(refSheet.getRange(i,refCommentColumn).getValue());
      Logger.log("INFO:再評価情報を取得しました。");
      Logger.log("INFO:ループ回数：%s",i);
      Logger.log("INFO:評価結果：%s",resultReEvaluationList);
      Logger.log("INFO:評価対象：%s",resultCodeList);
      Logger.log("INFO:コメント：%s",resultCommentList);
      
      //セルの初期化。
      var initiateReEvaCell = refSheet.getRange(i,refEvaColumn);
      var initiateCommentCell = refSheet.getRange(i,refCommentColumn);
      initiateReEvaCell.setValue("");
      initiateCommentCell.setValue("");      
    }
  }
  
  //未評価フラグ検証
  var refFirstEvaluation = refSheet.getRange(2,3).getValue();
  if(refFirstEvaluation === "未評価"){refFirstEvaluationFlg = 1;}
  
  //更新対象シート(updateSheet)で、取得した銘柄コード(C5:C100)を検索。
  //for(var list in refCodeColumn){
  for(var j=updateStartRow; j <= updateEndRow; j++){
    if(resultCodeList.indexOf(updateSheet.getRange(j, updateCodeColumn).getValue()) < 0){
      //一致する銘柄コードがなかった場合、エラーメッセージを返却。
      //現状何もしない。
    }else{
      //一致する銘柄コードがあった場合、評価欄(M列)に該当の評価を書き込む。
      //更新対象のセルを定義。
      var updateEvaCell = updateSheet.getRange(j,updateEvaColumn);
      var updateDateCell = updateSheet.getRange(j,updateDateColumn);
      var updateCommentCell = updateSheet.getRange(j,updateCommentColumn);

      
      //更新日を現在日付けで更新。
      updateEvaCell.setValue(resultReEvaluationList[resultCodeList.indexOf(updateSheet.getRange(j, updateCodeColumn).getValue())]);
      updateDateCell.setValue(today);

      //コメントを追記する処理。
      var addedComment = resultCommentList[resultCodeList.indexOf(updateSheet.getRange(j, updateCodeColumn).getValue())]
      Logger.log("addedComent:%s",addedComment);
      if(addedComment !== ""){
        //新しく生成したコメントを入力。
        //更新内容を定義。
        var newComment = updateCommentCell.getValue() + "\n" 
                            + addedComment+ " [" + Utilities.formatDate(today, "JST", "yyyy/MM/dd") + "]";
        Logger.log("I:New コメント：%s",newComment);        
        //コメント追記。
        updateCommentCell.setValue(newComment);
      }else{
        //何もしない。
        Logger.log("I:空のコメントが入力されています。")
      }

      //現在値を評価時の価格として更新。
      if(refFirstEvaluationFlg===1){
        var updateEvaluateValue = updateSheet.getRange(j,updateEvaluateValueColumn);
        updateEvaluateValue.setValue(updateSheet.getRange(j, updateCurrentValueColumn).getValue());
        Logger.log("I:評価時価格：%s",updateSheet.getRange(j, updateCurrentValueColumn).getValue());
      }else{
        Logger.log("I:評価時価格：変更なし。");
      }
      
      Logger.log("I:更新処理が完了しました。");
      Logger.log("I:更新対象：%s",resultCodeList.indexOf(updateSheet.getRange(j, updateCodeColumn).getValue()));
      Logger.log("I:更新評価：%s",resultReEvaluationList[resultCodeList.indexOf(updateSheet.getRange(j, updateCodeColumn).getValue())]);
      Logger.log("I:更新日：%s",Date());
    }
  }
  Logger.log("I：updateReEvaluation処理を終了します。");
}