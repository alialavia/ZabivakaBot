# ZabivakaBot
Google Sheet Telegram bot integration, for predicting WorldCup 2018 games. Create a Bot and invite your friends to predict WorldCup games, and track their results in Google Sheets.

# Setup
## Bot setup
1. Use Telegram @BotFather to create a bot. Note down the token provided to you by the BotFather. You need it later.
2. Define two commands for your bot: /list, /help.

## Spreadsheet setup
1. Create a new spreadsheet in Google Sheets. Create two sheets, and name them Results and ActiveGames.
2. Results sheet would be automatically filled. You need to fill the ActiveGames sheet with the games you want the user to predict. It should have three columns. First column should be a command, starting with **/**. Second column is the name of the first team and third column is the name of the second team. For example:

| A           | B    | C      |
| ----------- | ---- | ------ |
| /IranSpain  | Iran | Spain  |

### Code setup
Perform the following in the spreadsheet you created in the above steps:

1. From Tools, click on ScriptEditor, and copy the content of [Code.gs](Code.gs) there. 
2. Set the value of botToken to your Bot token. Like so: `var botToken = "AZuhs.....";`
3. Set the value of the ssId to the SSID of your spreadsheet. If you don't know that, go back to your spreadsheet, and take a look into the address bar of the browser. Everything after `d/` and before the next `/` is the SSID. For example, if this is the address you see in the address bar, `https://docs.google.com/spreadsheets/d/16asdfaskldjasidflaskdjflaksdjf56/edit#gid=0`, set the ssId to "16asdfaskldjasidflaskdjflaksdjf56": `var ssId = "16asdfaskldjasidflaskdjflaksdjf56";'.
4. From the *Deploy* menu on the top right of the spreadsheet, click on *New Deployment*. In the windows that opens, select the type `Web App`, and **make sure you have the `Who has access to the app` set as `Anyone, even anonymous`, and `Project version` to `New`**. Keep other settings as they are. Click on Update.
5. Copy the *Current web app URL* and set the *webAppUrl* to it. For example, `var webAppUrl = "https://script.google.com/macros/s/Absadfasdflillk_wedqwerqwef/exec";`.
6. Perform step 5 one more time. Again, **make sure you have the `Who has access to the app` set as `Anyone, even anonymous`, and `Project version` to `New`**.
7. From toolbar in Script Editor, select the function `setWebhook` and click on `Run`. See below:
        <img width="276" alt="Screen Shot 2021-06-10 at 11 21 50 PM" src="https://user-images.githubusercontent.com/1111939/121626197-fe6ada80-ca42-11eb-9ecb-b37027f934f0.png">
