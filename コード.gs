var TRIGGER = { start : "始業", end: "終業", shoulderPain: "肩こり" };
var DAYOFWEEK = { 0: "日", 1: "月", 2: "火", 3: "水", 4: "木", 5: "金", 6: "土" };

function doPost(e) {
  var verificationToken = e.parameter.token;
  
  // 認証Tokenのチェック
  if (verificationToken != PropertiesService.getScriptProperties().getProperty('VERIFICATION_TOKEN')) {
     throw new Error('Invalid token');
  }
  
  // botのメッセージによる再帰的な呼び出しの場合は終了
  if (e.parameter.user_name == "slackbot") {
    return;
  }
  
  var keyword = e.parameter.text;
  var status = checkTrigger(keyword);
  
  // 状態が取得できない場合は終了
  if (status == null) {
    return;
  }
  
  var userName = getUser(e.parameter.user_name);
  var timestamp = e.parameter.timestamp;
  var workingHours = getWorkingHours(userName, timestamp);

  var options = setResponseData(userName, status, workingHours);
  
  // Slackでbotがメッセージを送信
  var url = "https://hooks.slack.com/services/" + PropertiesService.getScriptProperties().getProperty('ADDITIONAL_URL');
  UrlFetchApp.fetch(url, options);
  
  if (status == TRIGGER.shoulderPain) {
    return;
  }
  
  // スプレッドシートに出力
  outputRecord(userName, status, timestamp, workingHours);  
}
          
          
function getUser(user_name) {
  var configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('user_config');
  var textFinder = configSheet.createTextFinder(user_name);
  var results = textFinder.findAll();
  var userName = "";
  if (results.lenght == 0) {
    userName = user_name;
  } else {
   var rowIndex = results[0].getRowIndex();
   userName = configSheet.getRange(rowIndex, 2).getValue();
  }
  return userName;
}
      
function setResponseData(userName, status, workingHours) {
  var text = status == TRIGGER.start ? userName + "さん、おはようございます！\n今日も1日頑張りましょう！" : userName + "さん、お疲れ様でした！\nゆっくり休んでね!";
  var title = status == TRIGGER.start ? "Let’s enjoy our work!" : "Good job!";
  var pretext = status == TRIGGER.start ? userName + "さんが仕事を開始しました。" : userName　+ "さんが仕事を終了しました。";
  
  // お遊びコード（後で消す）
  if (status == TRIGGER.shoulderPain) {
    text = "もみもみもみもみもみもみもみもみもみもみもみもみもみもみもみもみ";
    title = "Refresh!";
    pretext = userName + "さん、承りました！"
  }

  var options =
  {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : JSON.stringify(
      {
        "username": "ポケセラさん",
        "attachments": [
          {
            "pretext": pretext,
            "title": title,
            "text": text,
            "mrkdwn_in": [
                "text",
            ],
            "color": "#19a797",
          }
        ]
      }
    )
  };
          
  if (status == TRIGGER.end && workingHours.minutes > 0) {
    var payload = JSON.parse(options.payload);
    var field = {
      "title": "今日の就業時間",
      "value": workingHours.displayTime,
      "short": false
    }
    payload.attachments[0].fields = [];
    payload.attachments[0].fields.push(field);
    options.payload = JSON.stringify(payload);
  }
          
  return options;
}
  
function checkTrigger(keyword) {
 var trrigerSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('trigger_keywords');
 var textFinder = trrigerSheet.createTextFinder(keyword.toLowerCase());
 var results = textFinder.findAll();
 var status = "";
 if (results.length > 0) {
   var rowIndex = results[0].getRowIndex();
   status = trrigerSheet.getRange(rowIndex, 2).getValue();
 } else {
   // お遊びコード（後で消す）
   if (keyword.indexOf("肩") != -1 || keyword.indexOf("かた") != -1) {
     status = "shoulderPain";
   }
 }
  
 return TRIGGER[status] != null ? TRIGGER[status] : null; 
}
      
function outputRecord(userName, status, timestamp, workingHours) {
  var targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('2019年10月'); //シートを取得
  var lastRowIndex = targetSheet.getDataRange().getLastRow(); //シートの使用範囲のうち最終行を取得
    
  var date = Moment.moment.unix(timestamp);
  var day = DAYOFWEEK[date.day()];
  
  // 出力
  targetSheet.getRange(lastRowIndex + 1, 1).setValue(date.format("MM/DD"));　// 日付
  targetSheet.getRange(lastRowIndex + 1, 2).setValue(day);　// 曜日
  targetSheet.getRange(lastRowIndex + 1, 3).setValue(date.format("HH:mm:ss"));　// 時間
  targetSheet.getRange(lastRowIndex + 1, 4).setValue(userName);　// 氏名
  targetSheet.getRange(lastRowIndex + 1, 5).setValue(status);　// 勤怠状況
  targetSheet.getRange(lastRowIndex + 1, 6).setValue(timestamp);　// timestamp
  if (workingHours) {
    targetSheet.getRange(lastRowIndex + 1, 7).setValue(workingHours.displayTime);　// 就業時間（HH:mm）
    targetSheet.getRange(lastRowIndex + 1, 8).setValue(workingHours.minutes);　// 就業時間（分)
  }
}
  
function calcWorkingHours(startTimestamp, endTimestamp) {
  var startDate = Moment.moment.unix(startTimestamp);
  var endDate = Moment.moment.unix(endTimestamp);
  var minute = endDate.diff(startDate, "minutes");
  return { 
    displayTime: Utilities.formatString("%sh%smin",Math.floor(minute/60), minute%60),
    minutes: minute
  };
}
  
function getWorkingHours(userName, endTimestamp) {
  var targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('2019年10月');
  var textFinder = targetSheet.createTextFinder(userName);
  var results = textFinder.findAll();
  if (results.length == 0) {
    return null;
  }
  
  var lastRowIndex = results[results.length - 1].getRowIndex();
  
  var status = targetSheet.getRange(lastRowIndex, 5).getValue();
  var workingHours = null;
  if (status == TRIGGER.start) {
    var startTimestamp = targetSheet.getRange(lastRowIndex, 6).getValue();
    workingHours = calcWorkingHours(startTimestamp, endTimestamp);
  }
  return workingHours;
}