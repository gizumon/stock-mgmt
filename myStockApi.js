var _sheetId;
var _sheetName;
var _today;
var _sheetObj;
var _lastRow;
var _summaryRange;
var _detailRange;
var _registRange;

function doGet(e){
  // リクエスト取得
  console.log(e);
  var action = e.parameter.action;
  var param = e.parameter.param;

  var data;
  var output = ContentService.createTextOutput();

  // シート情報のセット
  init();
  
  switch (action) {
    case 'daily':
      data = resDailyReport();
      break;
    case 'all':
      data = resAll(param);
      break;
    case 'summary':
      data = resSummary();
      break;
    case 'detail':
      data = resDetail(param);
      break;
    case 'codes':
      data = resCodes();
      break;
    case 'fiscalPeriod':
      data = resFiscalPeriod();
      break;
    default:
      data = resError();
      break;
  }

  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(JSON.stringify(data));
  return output;
}

function init() {
  _sheetId = '112hbvHpRtZL9TkbaaprEnLlsfr2z6d8CUIkBpK-x4G0';
  _sheetName = '購入株';
  _today = new Date();
  _sheetObj = getSheetInformation(_sheetId, _sheetName);
　_lastRow = getLastRow(_sheetObj, 'A9:A36');

  _registRange = _sheetObj.getRange(3,19,1,1);
  _summaryRange = _sheetObj.getRange(2,13,6,1);
  _detailRange = _sheetObj.getRange(9,1,36,15);
  _detailValues = _detailRange.getValues();
  waitUntilGetValues(_detailRange);
  _stockObj = getStockObj(_detailRange, _lastRow);
}

function resDailyReport() {
  const thresholdVal = 10;
  let data = [];
  data.push(getHeader(_today));
  data.push(getNearClosingDate(_today, thresholdVal));
  data.push(getSummary(_today, _summaryRange));
  var detailObj = getDetails(_today);
  Object.keys(detailObj).forEach((key) => {
    data.push(detailObj[key]);
  });
  data.push(getFooter());
  return data;
}

function resAll(param) {
  var data = [];
  var isAll = !param || param === 'all';
  data.push(getSummary(_today, _summaryRange));
  var detailObj = getDetails(_today);
  Object.keys(detailObj).forEach((key) => {
    if (isAll || param === key) {
      data.push(detailObj[key]);
    }
  });
  return data;
}

function resSummary() {
  var data = [];
  data.push(getSummary(_today, _summaryRange));
  return data;
}

function resDetail(param) {
  var data = [];
  var isAll = !param || param === 'all';
  var detailObj = getDetails(_today);
  Object.keys(detailObj).forEach((key) => {
    if (isAll || param === key) {
      data.push(detailObj[key]);
    }
  });
  return data;
}

function resCodes() {
  var data = [];
  Object.keys(_stockObj).forEach((code) => {
    data.push(`${_stockObj[code].name}(${code})`);
  });
  return data;
}

function resFiscalPeriod() {
  var data = [];
  Object.keys(_stockObj).forEach((code) => {
    data.push(`${_stockObj[code].code}\n  ${_stockObj[code].name}\n  ${_stockObj[code].closingDate}`);
  });
  return data;
}

function resError() {
  return ['失敗。。。ありゃりゃ、、おかしいぞ。'];
}

/**
 * シートオブジェクトの取得
 * @param String id '112hbvHpRtZL9TkbaaprEnLlsfr2z6d8CUIkBpK-x4G0'
 * @param String name '購入株'
 * @return {Object} シートオ  ブジェクト
 */
function getSheetInformation(id, name) {
  //取得・更新対象のシートを選択。
  return SpreadsheetApp.openById(id).getSheetByName(name); 
}

function getHeader(date) {
  Logger.log("sendHeader処理を開始");
  var message = "\nよっこいしょっと。\n"
                + "そろそろ" + Utilities.formatDate(date,"JST","MM月dd日") + "の株価をお知らせの時間ですな。\n";
  return message;
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
    // detailRange = objSheet.getRange(9,1,28,15);
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
function getSummary(today, summaryRange) {
  // サマリーを取得 (2行目から6行:13列目から13列)
  var lastTimeResult = _registRange.getValue();
  var summaryValues = summaryRange.getValues();
  var todayStr = Utilities.formatDate(today,"JST","MM/dd");
  var message = "\n" + todayStr + "の株価のサマリーを送るんじゃ。\n";

  message = message + "\n======[ 株サマリー ]======\n" +
      // "投資可能金額　: " + separate(parseInt(detailBuyStock[0][0],10)) + "円\n" +
      // "合計投資金額　: " + separate(parseInt(detailBuyStock[1][1],10)) + "円\n" +
      "現在評価額　　: " + separate(parseInt(summaryValues[2][0],10)) + "円\n" +
      "合計損益　　　: " + separate(parseInt(summaryValues[3][0],10)) + "円\n" +
      "損益率　　　　: " + (summaryValues[4][0] * 100).toFixed(1) + "％ \n" +
      "前日比　　　　: " + separate(parseInt(summaryValues[3][0],10) - parseInt(lastTimeResult,10)) + "円\n" +
      "======================\n";

  Logger.log(`Last time value: ${lastTimeResult}, Update to ${parseInt(summaryValues[3][0],10)}`);
  _registRange.setValue(parseInt(summaryValues[3][0],10));
  return message;
}

/**
 * 
 * @param {*} detailRange 
 * @param {*} lastRow 
 */
function　getDetails(today) {
  var dataObj = {};
  // var message = "\nよっこいしょと。\n";
  Object.keys(_stockObj).forEach((code) => {
    var message = "\n" +
        "========[ "  + _stockObj[code].code + " ]========\n" +
        "銘柄　　　: " + _stockObj[code].name + "\n" +
        "現在価格　: " + _stockObj[code].currency + "円\n" +
        "前日比　　: " + _stockObj[code].difference + "円 (" + _stockObj[code].differenceRate + "％)\n" + 
        "損益　　　: " + _stockObj[code].valance + "円\n" +
        "損益率　　: " + _stockObj[code].valanceRate + "％ \n" +
        "目標まで　: " + _stockObj[code].targetDate + " (" + _stockObj[code].targetVal + " )\n" +
        "決算日　　: " + _stockObj[code].closingDate + "\n" +
        "======================\n";
    dataObj[_stockObj[code].code] = message;
  });
  return dataObj;
}

function getNearClosingDate(today, thresholdVal) {
  var hasNearClosingDate = false;
  var message = `\nおよ👴👴👴、決算が ${thresholdVal}日以内 の銘柄があるぞい\n`;
  Object.keys(_stockObj).forEach((code) => {
    if (!isDate(_stockObj[code].closingDate)) return;
    var closingDate = new Date(_stockObj[code].closingDate);
    var dateDiff = convertTimeToDate(closingDate.getTime() - _today.getTime());
    if (dateDiff > 0 && dateDiff < thresholdVal) {
      hasNearClosingDate = true;
      message = message + 
        "========[ "  + _stockObj[code].code + " ]========\n" +
        "銘柄　　　: " + _stockObj[code].name + "\n" +
        "決算日　　: " + _stockObj[code].closingDate + "\n";
    }
  });
  
  if (!hasNearClosingDate) { return '';}
  return message + "======================\n";
}

function getStockObj(detailRange, lastRow) {
  var dataObj = {};
  var detailValues = detailRange.getValues();

  for(var i=0; i < lastRow; i++){
    var stockCode = String(detailValues[i][0]);
    dataObj[stockCode] = {
      'code': stockCode,
      'name': detailValues[i][1],
      'currency': detailValues[i][5],
      'difference': detailValues[i][8],
      'differenceRate': Number(detailValues[i][9]).toFixed(1),
      'valance': separate(parseInt(detailValues[i][10],10)),
      'valanceRate': (detailValues[i][11]*100).toFixed(1),
      'targetVal': detailValues[i][12],
      'targetDate': detailValues[i][13],
      'closingDate': isDate(detailValues[i][14]) ? Utilities.formatDate(new Date(detailValues[i][14]),"JST","YYYY/MM/dd") : detailValues[i][14]
    };
  }
  return dataObj;
}

/**
 * 
 */
function getFooter() {
  var message = "\nふう、おつかれおつかれ。明日もがんばるんじゃぞ。";
  return message;
}

/**
 * 
 * @param {*} num 
 */
function separate(num){
    return String(num).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}

/**
 * 最終行を取得
 * @param {*} sheetObj 
 * @param {*} range 
 * @return {Number}
 */
function getLastRow(sheetObj, range) {
  var checkLastRows = sheetObj.getRange(range).getValues();
  return checkLastRows.filter(String).length;
}

function isDate(val) {
  if (!val) { return false; }
  var date = new Date(val);
  return date.getDate() > 0;
}

function convertTimeToDate(time) {
  return time / (1000 * 60 * 60 * 24);
}