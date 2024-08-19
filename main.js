const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const { ipcMain } = require('electron');
const keySender = require('node-key-sender'); // Use robotjs to simulate keystrokes
const { exec } = require('child_process');
const axios = require('axios');
const xml2js = require('xml2js');
const koffi = require('koffi');

// Load the user32.dll library
const user32 = koffi.load('user32.dll');

const GetForegroundWindow = user32.func('int __stdcall GetForegroundWindow()');
const SetForegroundWindow = user32.func('bool __stdcall SetForegroundWindow(int hWnd)');
// Get the active window handle


// Do something with the active window handle
// ...


// console.log('initing user32');
// const user32 =  ffi.dlopen('user32', {
//   'GetTopWindow': ['long', ['long']],
//   'FindWindowA': ['long', ['string', 'string']],
//   'SetActiveWindow': ['long', ['long']],
//   'SetForegroundWindow': ['bool', ['long']],
//   'BringWindowToTop': ['bool', ['long']],
//   'ShowWindow': ['bool', ['long', 'int']],
//   'SwitchToThisWindow': ['void', ['long', 'bool']],
//   'GetForegroundWindow': ['long', []],
//   'AttachThreadInput': ['bool', ['int', 'long', 'bool']],
//   'GetWindowThreadProcessId': ['int', ['long', 'int']],
//   'SetWindowPos': ['bool', ['long', 'long', 'int', 'int', 'int', 'int', 'uint']],
//   'SetFocus': ['long', ['long']]
// });

let mainWindow;
var previousWindowHwd;

// Path to the bundled JRE
const jrePath = path.join(__dirname, 'resources', 'java', 'bin');

// Set the PATH environment variable to include the bundled JRE
const env = Object.assign({}, process.env, {
  PATH: `${jrePath}${path.delimiter}${process.env.PATH}`
});



function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      

    },
    alwaysOnTop: true, // Keeps the window on top
    frame: true, // Removes the window frame
  });

  // mainWindow.webContents.openDevTools();
  mainWindow.loadFile('index.html');
  mainWindow.hide(); // Start hidden
}

app.whenReady().then(() => {
  createWindow();

  // Register the global hotkey
  //use ctrl shift right arrow
  globalShortcut.register('CommandOrControl+Shift+Right', async () => {
    if (mainWindow.isVisible()) {
      if (previousWindowHwd) {
        
      }
      mainWindow.hide();
    } else {

      console.log('Getting active window ptr');


      // Call the GetActiveWindow function
       previousWindowHwd = GetForegroundWindow();
      
      console.log(`The handle of the active window is: ${previousWindowHwd}`);


  
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
    
    
    if(!result.boardgames || !result.boardgames.boardgame || result.boardgames.boardgame.length == 0)
      return;

    console.log(`Result count: ${result.boardgames.boardgame.length}`);
    const suggestions = result.boardgames.boardgame.map(game => ({
      id: game.$.objectid,
      name: game.name[0]._,
      yearPublished: game.yearpublished && game.yearpublished.length > 0 ? game.yearpublished[0] : 0
    }));

    //console.log(suggestions);


    return suggestions;


  });

  ipcMain.handle('fetch-game-details', async (event, id) => {
    // Implement your game details logic here
    //search bgg web api GET for partial string match using axios
    const response = await axios.get(`https://api.geekdo.com/xmlapi/boardgame/${id}`);
    const gameDetailsXML = response.data;
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(gameDetailsXML);
    
    console.log(result.boardgames.boardgame[0]);

    //console.log(result);
    const gameDetails = {
      name: result.boardgames.boardgame[0].name[0]._,
      description: result.boardgames.boardgame[0].description[0],
      yearPublished: result.boardgames.boardgame[0].yearpublished[0],
      minPlayers: result.boardgames.boardgame[0].minplayers[0],
      maxPlayers: result.boardgames.boardgame[0].maxplayers[0],
      playingTime: result.boardgames.boardgame[0].playingtime[0],
      thumbnail: result.boardgames.boardgame[0].thumbnail[0]
    };

    return gameDetails;
  });

  ipcMain.on('send-keystrokes', (event, text) => {

    mainWindow.hide();
    let result  = SetForegroundWindow(previousWindowHwd);
    console.log('SetActiveWindow Result:', result);
    setTimeout(() => {
      console.log(`Sending text: ${text}`);
      keySender.sendText(text);
    }
    , 250);
  
    

    return "Sent Text";
  });
  
