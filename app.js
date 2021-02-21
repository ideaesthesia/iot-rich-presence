const express = require('express');
const RPC = require("discord-rpc");
const { app, BrowserWindow, Tray, Menu } = require('electron')
const path = require('path');
const url = require('url');

const client = new RPC.Client({ transport: 'ipc' });
client.login({ clientId: '811855112929673246' });
const iconPath = path.join(__dirname, 'IOTLogo.ico')
var tray = null

var isQuitting

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
	icon: iconPath
  })

  win.loadFile('index.html')
  win.on('minimize', (event) => {
    event.preventDefault();
    win.hide();
  });

  win.on('close', (event) => {
    if(!isQuitting){
      event.preventDefault();
      win.hide();
    }
    return false;
  });
  tray = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([
	{ label: 'Show App', click:  function(){
        win.show();
		} 
	},
    { label: 'Quit', click:  function(){
        isQuitting = true;
        app.quit();
		}
	}
  ])
  tray.setToolTip('Rich Presence for IOT')
  tray.setContextMenu(contextMenu)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})


client.once('ready', ()=>{
	const app = express();
	app.use(express.json());
	app.post("/", (request, response) => {
		let body = request.body;
		if (body.action == "set") {
			let presence = {
				state: body.state,
				details: body.details,
				largeImageKey: 'iotlogo',
				buttons: [
					{
						label: "Join me!",
						url: body.url
					}
				],
				instance: true
			};
			if (typeof body.smallimage !== 'undefined') {
				// the variable is defined
				presence.smallImageKey = body.smallimage;
				presence.smallImageText = body.smallimage.toUpperCase();
			}
			client.setActivity(presence);
		} else if (body.action == "clear") {
			client.clearActivity();
		}
		response.sendStatus(200);
	});
	app.listen(3000, () => console.log('Discord-Chrome-Presence is ready!'));
});
