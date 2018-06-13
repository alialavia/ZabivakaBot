// Make sure you update the following three values. Don't change any other part of the code, unless you know what your're doing.
// Refer to https://github.com/alialavia/ZabivakaBot to learn how to use this code.
var botToken = "YOUR_BOT_TOKEN"; 
var ssId = "SSID_OF_THE_SPREADSHEET";
var webAppUrl = "THIS_WEBAPP_URL";

var telegramUrl = "https://api.telegram.org/bot" + botToken;

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

// Convert entire sheet to an array
function sheetToArray(sheetName)
{
 var sheet = SpreadsheetApp.openById(ssId).getSheetByName(sheetName);
 try {
   return sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
 }
 catch (e) {  return [[]]; }
}

function listOfActiveGames()
{
 return sheetToArray("ActiveGames");
}

function showListOfActiveGames()
{
  var games = listOfActiveGames()
  s = ""
  for (var i in listOfActiveGames())
    s += games[i].join(" ") + '\n';
  return s;
}

function findGame(command) {
  var rows = listOfActiveGames();
  for (i in rows)
  {
    var gameData = rows[i];
    if (gameData[0] == command)
      return { command: gameData[0], team1: gameData[1], team2: gameData[2] };
  }
  return null;
}


/* STATE MACHINE HELPER */
var documentProperties = PropertiesService.getDocumentProperties();
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

/* MAIN */
function showHelp() {
  return "Send /list to see a list of active games.";
}

function stateUpdated(id, state) {
  switch (state) {
    case null:
      break;
    case "/help":
      sendText(id, showHelp());
      break;
    case "/list":
      sendText(id, showListOfActiveGames());
      break;
    default:
      // Other states are one of these three forms: /IranMorroco, /IranMorroco,1 , /IranMorroco,1,4
      var stateParts = state.split(",");
      var stateId = stateParts.length;
      var game = findGame(stateParts[0]);
      if (game == null) // Bad state => Clear the state and return
        setState(id, null);
      else
      {
        switch (stateId)
        {
          case 1:
          sendText(id, "Enter " + game.team1 + " goals.");
          break;
          case 2: 
          sendText(id, "Enter " + game.team2 + " goals.");
          break;
          case 3:
          sendText(id, "Your entry has been registered.");
          SpreadsheetApp.openById(ssId).getSheets()[0].appendRow([new Date(),id, documentProperties.getProperty("name_" + id)].concat(stateParts));
          setState(id, null);
          break;
        }
      }
  }
}

function doPost(e) {
  // this is where telegram works
  var data = JSON.parse(e.postData.contents);
  var text = data.message.text;
  var id = data.message.chat.id;
  var name = data.message.chat.first_name + " " + data.message.chat.last_name;
  
  documentProperties.setProperty("name_"+id, name);
  // A command received
  // Every command sets the state
  if (/^\//.test(text))
    setState(id, text);
  else
  {
    // If not a command, just concatenate it to the previous state
    // If previous state is null, it's an invalid input 
    
    var state = getState(id);
    // A non command received without a state is invalid. Do nothing.
    if (state != null)
      setState(id, state + "," + text);  
  }

return HtmlService.createHtmlOutput();

}
