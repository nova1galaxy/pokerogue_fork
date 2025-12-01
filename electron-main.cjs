const { app, BrowserWindow, session } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(__dirname, "public/favicon.ico"), // Icône du jeu
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true, // Cache la barre de menu (Fichier, etc.) pour l'immersion
  });

  // Charge le jeu une fois compilé
  win.loadFile(path.join(__dirname, "dist/index.html"));
}

app.whenReady().then(() => {
  // On configure le cache pour que la sauvegarde reste bien sur le PC
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: details.responseHeaders });
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
