const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const { ipcMain } = require('electron');
const keySender = require('node-key-sender'); // Use robotjs to simulate keystrokes
const { exec } = require('child_process');
const axios = require('axios');
const xml2js = require('xml2js');


let mainWindow;

// Path to the bundled JRE
const jrePath = path.join(__dirname, 'resources', 'java', 'bin');

console.log(jrePath);
// Set the PATH environment variable to include the bundled JRE
const env = Object.assign({}, process.env, {
  PATH: `${jrePath}${path.delimiter}${process.env.PATH}`
});

console.log(env);



function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 150,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
    },
    alwaysOnTop: true, // Keeps the window on top
    frame: false, // Removes the window frame
  });

  mainWindow.loadFile('index.html');
  mainWindow.hide(); // Start hidden
}

app.whenReady().then(() => {
  createWindow();

  // Register the global hotkey
  //use ctrl shift right arrow
  globalShortcut.register('CommandOrControl+Shift+Right', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.handle('fetch-suggestions', async (event, query) => {
    // Implement your autocomplete logic here
    //search bgg web api GET for partial string match using axios
    const response = await axios.get(`https://api.geekdo.com/xmlapi/search?search=${query}`);
    const suggestionsXML = response.data;
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(suggestionsXML);
    console.log(result.boardgames.boardgame);
    const suggestions = result.boardgames.boardgame.map(game => ({
      id: game.$.objectid,
      name: game.name[0]._,
      yearPublished: game.yearpublished[0]
    }));

    //console.log(suggestions);


    return suggestions;


  });
  
  ipcMain.on('send-keystrokes', (event, text) => {
    // Simulate typing out the text
    //robot.typeString(text);
    keySender.sendText('Hello World');
  });
  
