function myFunction() {
  var recordTime = Utilities.formatDate(new Date(), "Asia/Tokyo", "MM-dd-yyyy (E) HH:mm:ss");
  var configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('user_config');
  var textFinder = configSheet.createTextFinder("kanamaru");
  var results = textFinder.findAll();
  var userName = "";
  if (results.lenght == 0) {
    userName = user_name;
  } else {
   var rowIndex = results[0].getRowIndex();
   userName = configSheet.getRange(rowIndex, 2).getValue();
  }
  Logger.log(
    recordTime + userName
);
}

function test2() {
  var status = checkTrigger("スタート");
  Logger.log(status);
  var status = checkTrigger("Start");
  Logger.log(status);
  var status = checkTrigger("start");
  Logger.log(status);
  var status = checkTrigger("START");
  Logger.log(status);
  var status = checkTrigger("開始");
  Logger.log(status);
  var status = checkTrigger("おはよう");
  Logger.log(status);
  var status = checkTrigger("End");
  Logger.log(status);
  var status = checkTrigger("END");
  Logger.log(status);
  var status = checkTrigger("end");
  Logger.log(status);
  var status = checkTrigger("終了");
  Logger.log(status);
  var status = checkTrigger("上がります");
  Logger.log(status);
  var status = checkTrigger("終わり");
  Logger.log(status);
  var status = checkTrigger("Test");
  Logger.log(status);
}

function test3() {
  var options = setResponseData("金丸", "始業");
  Logger.log(options);
  var options = setResponseData("金丸", "終業");
  Logger.log(options);
  var options = setResponseData("浜岡", "始業");
  Logger.log(options);
  var options = setResponseData("浜岡", "終業");
  Logger.log(options);
  var options = setResponseData("大滝", "始業");
  Logger.log(options);
  var options = setResponseData("大滝", "終業");
  Logger.log(options);
}

function test4() {
  var date = Moment.moment.unix(1318781876);
  var day = Moment.moment().day();
  Logger.log(date.format("YYYY-MM-DD HH:mm:ss") + DAYOFWEEK[day]);
}

function test5() {
  var hours = calcWorkingHours(1318762256, 1318781876);
  Logger.log(hours);
}

function test6() {
  var options =
  {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : JSON.stringify(
      {
        "username": "ポケセラさん",
        "attachments": [
          {
            "pretext": "",
            "title": "",
            "text": "",
            "mrkdwn_in": [
                "text",
            ],
            "color": "#19a797",
          }
        ]
      }
    )
  };
          
  //if (status == TRIGGER.end && workingHours.minutes > 0) {
   var payload = JSON.parse(options.payload);
    var field = {
      "title": "今日の就業時間",
      "value": "",
      "short": false
    }
    payload.attachments[0].fields = [];
    payload.attachments[0].fields.push(field);
    options.payload = JSON.stringify(payload);
  //}
  Logger.log(options);
}
      
function test7() {
  var verificationToken = PropertiesService.getScriptProperties().getProperty('VERIFICATION_TOKEN');
  Logger.log(verificationToken);
  var url = "https://hooks.slack.com/services/" + PropertiesService.getScriptProperties().getProperty('ADDITIONAL_URL');
  Logger.log(url);
}
  
function test8() {
  var userName = getUser("testaaaa");
  Logger.log(userName);
}