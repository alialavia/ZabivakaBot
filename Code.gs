// Make sure you update the following three values. Don't change any other part of the code, unless you know what your're doing.
// Refer to https://github.com/alialavia/ZabivakaBot to learn how to use this code.
var botToken = "YOUR_BOT_TOKEN"; 
var ssId = "SSID_OF_THE_SPREADSHEET";
var webAppUrl = "THIS_WEBAPP_URL";

var telegramUrl = "https://api.telegram.org/bot" + botToken;

// Unit test function
function test()
{
  Logger.log(findRowIndex("ActiveGames", "/IranMorocco"));
  Logger.log(findGame("Ali"));
  Logger.log('sanityCheck. Expected false, false, true, true, false, true, false, false');
  Logger.log(sanityCheck("Ali"));
  Logger.log(sanityCheck("&&"));
  Logger.log(sanityCheck("123"));
  Logger.log(sanityCheck("۱۲۳"));
  Logger.log(sanityCheck("00"));
  Logger.log(sanityCheck(""));
  Logger.log(sanityCheck("&&"));
  Logger.log('isUserRegistered. Expected true, true, false, true');
  Logger.log(isUserRegistered('84107284'));
  Logger.log(isUserRegistered('106147803'));
  Logger.log(isUserRegistered('1061478032'));
  Logger.log(isUserRegistered(22446225));

  var sheet = SpreadsheetApp.openById(ssId).getSheetByName("Results");
  Logger.log(sheet.getRange( 2, 5, 1, 2).getCell(1, 1).getValue());
  Logger.log(sheet.getRange( 2, 5, 1, 2).getCell(1, 2).getValue());
  Logger.log(findResult("84107284", "/IranMorocco"));
  Logger.log(findResult("84107284", "/BrazilArg"));
  Logger.log(showListOfFutureGames());
  recordResult("84107284", ["/IranMorocco", 3, 2]);
}

/* REST HELPERS */
function getMe() {
  var url = telegramUrl + "/getMe";
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function setWebhook() {
  var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function sendText(id,text) {
  var url = telegramUrl + "/sendMessage?chat_id=" + id + "&text=" + encodeURI(text);
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function doGet(e) {
  return HtmlService.createHtmlOutput("Hey there! Send POST request instead!");
}

/* SHEET HELPER */
function getRowCount(sheet) {
   return sheet.getLastRow();
}

function sheetToArray(sheetName)
{
   var sheet = SpreadsheetApp.openById(ssId).getSheetByName(sheetName);
  try {
   return sheet.getRange(1, 1, getRowCount(sheet), sheet.getLastColumn()).getValues();
  }
  catch (e) {  return [[]]; }
    
}

function findRowIndex(sheetname, key) {
  var rows = sheetToArray(sheetname);
  for (i in rows)
  {
    var row = rows[i];
    if (row[0] == key)
      return parseInt(i);
  }
  return -1;
}

function findRow(sheetname, key) {
  var rows = sheetToArray(sheetname);
  var rowIndex = findRowIndex(sheetname, key);
  if (rowIndex == -1)
    return [];
  return rows[rowIndex];
}

function findResult(id, key) {
  var rows = sheetToArray("Results");
  for (i in rows)
  {
    var row = rows[i];
    if (row[1] == id && row[3] == key)
      return parseInt(i);
  }
  return -1;
}

function showListOfFutureGames()
{
  var games = sheetToArray("ActiveGames");
  s = ""
  for (var i in games)
    s += games[i].slice(0,3).join(" ") + '\n';
  return s;
}

function findGame(command) {
  var row = findRow("ActiveGames", command);
  if (row == [])
    return null;
  return { command: row[0], team1: row[1], team2: row[2], knockOut: row[3] };
}

var documentProperties = PropertiesService.getDocumentProperties();
var global_states = {}, global_info = {};

/* STATE MACHINE HELPER */

function getState(id)
{
  return documentProperties.getProperty(id);
}

function setState(id, newState)
{
  var strVal = newState == null ? "" : newState;
  documentProperties.setProperty(id, strVal);
  stateUpdated(id, newState);
}

function recordResult(id, stateParts)
{
  var sheet = SpreadsheetApp.openById(ssId).getSheetByName("Results");
  var rowIndex = findResult(id, stateParts[0])+1;
  Logger.log(rowIndex);
  var newValue = [new Date(),id, documentProperties.getProperty("name_" + id)].concat(stateParts);
  Logger.log(newValue);
  Logger.log(newValue.length);

  if (rowIndex < 1)
    sheet.appendRow(newValue);
  else
    sheet.getRange( rowIndex, 1, 1, newValue.length).setValues([newValue]);

}
/* MAIN */
function showHelp() {
  return "Send /list to see the list of games.";
}

function stateUpdated(id, state) {
  switch (state) {
    case null:
      break;
    case "/help":
    case "/start":
      sendText(id, showHelp());
      break;
    case "/list":
      sendText(id, showListOfFutureGames());
      break;
    default:
      
      // Other states are one of these three forms: /IranMorroco, /IranMorroco,1 , /IranMorroco,1,4, /IranMorroco,1,4,0
      var stateParts = state.split(",");
      var stateId = stateParts.length;

      var game = findGame(stateParts[0]);
      if (game == null || game.command == null) // Bad state => Clear the state and return
        setState(id, null, null);
      else
      {
        var sheet = SpreadsheetApp.openById(ssId).getSheetByName("Results");
        switch (stateId)
        {
          case 1:
            var rowIndex = findResult(id, game.command)+1;
            if (rowIndex >= 1)
            {
              var oldResult = sheet.getRange( rowIndex, 5, 1, 3);
              var t1 = oldResult.getCell(1, 1).getValue();
              var t2 = oldResult.getCell(1, 2).getValue();
              var t3 = parseInt(oldResult.getCell(1, 3).getValue());
              sendText(id, "You previus prediction  " + game.team1 + ": " + t1);
              sendText(id, "You previus prediction  " + game.team2 + ": " + t2);
              if (t3 != 0)
                sendText(id, "Winner: " + ( t3 == 1 ? game.team1 : game.team2) );

            }
            sendText(id, "Enter " + game.team1 + " goals.");
            break;
          case 2: 
            sendText(id, "Enter " + game.team2 + " goals.");
            break;
          case 3:
            sendText(id, "Your prediction is registered: " + "\n" + game.team1 + ":" + stateParts[1] + " - " + game.team2 + ":" + stateParts[2]);
            var score1 = parseInt(stateParts[1]), 
                score2 = parseInt(stateParts[2]);
            if (game.knockOut && (score1 == score2))
              sendText(id, "Select the winner. For "  + game.team1 + " send 1 and for " + game.team2 + " send 2.");
            else { 
              if (score1 > score2)
                stateParts.push(1);
              else if (score1 < score2)
                stateParts.push(2);
              else
                stateParts.push(0);
                  
              recordResult(id, stateParts);
              setState(id, null, null);
            }
            break;
          case 4:
            sendText(id, "Your prediction is registered. Winner: " + (parseInt(stateParts[3]) == 1 ? game.team1 : game.team2) );
            recordResult(id, stateParts);
            setState(id, null, null);
            break;
        }
     }
}
}
function sanityCheck(text) {
  if(!isNaN(parseInt(text)) && isFinite(text) && parseInt(text) >= 0)
     return true;
  return false;
}
function isUserRegistered(id) {
  if (findRowIndex("Users", id) >= 0)
    return true;
  return false;
}
function doPost(e) {
  // this is where telegram works
  var data = JSON.parse(e.postData.contents);
  var text = data.message.text;
  var id = data.message.chat.id;
  var name = data.message.chat.first_name + " " + data.message.chat.last_name;
  documentProperties.setProperty("name_"+id, name);
  
  if (!isUserRegistered(id))
  {
    sendText(id, "You are not registered in the system. Please contact the admin.");
    SpreadsheetApp.openById(ssId).getSheetByName("Unregistered").appendRow([id, name]);      
     
    return HtmlService.createHtmlOutput();
  }
  // A command received
  // Every command sets the state
  if (/^\//.test(text))
  {
    setState(id, text, null);
    return HtmlService.createHtmlOutput();
  }
  
  // If not a command, it must be a number
  if (!sanityCheck(text))
  {
    sendText(id, "Please enter a positive number. Use `/list` to see a list of games.");
    return HtmlService.createHtmlOutput();
  }
  // we just concate the number to the previous state
  // If previous state is null, it's an invalid input 
  
  var state = getState(id);
  // A non command received without a state is invalid. Do nothing.
  if (state == null)
  {
    sendText(id, "Select a game from the list.");
    return HtmlService.createHtmlOutput();
  }
  setState(id, state+","+text, null);
  return HtmlService.createHtmlOutput();

}
