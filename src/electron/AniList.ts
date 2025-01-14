import { BrowserWindow, ipcMain } from 'electron';
import request from 'request';
import { format, parse } from 'url';
import Log from '../log';

const oauthConfig = {
  clientId: process.env.VUE_APP_CLIENT_ID,
  clientSecret: process.env.VUE_APP_CLIENT_SECRET,
  authorizationUrl: 'https://anilist.co/api/v2/oauth/authorize',
  tokenUrl: 'https://anilist.co/api/v2/oauth/token',
  useBasicAuthorizationHeader: true,
  redirectUri: 'http://localhost/',
};

const currentWindow = BrowserWindow.getFocusedWindow();

const windowParams: Electron.BrowserWindowConstructorOptions = {
  alwaysOnTop: true,
  autoHideMenuBar: true,
  webPreferences: {
    nodeIntegration: false,
    devTools: false,
    webSecurity: false,
  },
  parent: currentWindow || undefined,
  show: false,
};

/**
 * @event aniListOAuth
 * @description handles the authentication event sent by the app to authenticate to AniList
 */
ipcMain.on('aniListOAuth', (event: any, action: string) => {
  if (action === 'getToken') {
    const redirectUri = encodeURIComponent(oauthConfig.redirectUri);
    const url = format(`${oauthConfig.authorizationUrl}?client_id=${oauthConfig.clientId}&response_type=code&redirect_uri=${redirectUri}`);

    const window = new BrowserWindow(windowParams);
    window.loadURL(url);
    window.once('ready-to-show', () => {
      window.show();

      const oauthFunction = (windowEvent: any, oauthUrl: string) => {
        const params = parse(oauthUrl, true);
        if (!params.query || !params.query.code) {
          return;
        }

        const { code } = params.query;
        const tokenRequestOptions = {
          uri: oauthConfig.tokenUrl,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          json: {
            grant_type: 'authorization_code',
            client_id: oauthConfig.clientId,
            client_secret: oauthConfig.clientSecret,
            redirect_uri: oauthConfig.redirectUri,
            code,
          },
        };

        request(tokenRequestOptions, (error, response, body) => {
          if (!error && response.statusCode === 200) {
            event.sender.send('aniListOAuthReply', body.access_token);
            try {
              window.close();
            } catch (closingError) {
              Log.log(Log.getErrorSeverity(), ['electron', 'aniList', 'authorization', 'window-close'], closingError.message);
            }
          } else {
            Log.log(Log.getErrorSeverity(), ['electron', 'aniList', 'authorization'], error);
          }
        });
      };

      window.webContents.on('will-navigate', (windowEvent: any, oauthUrl: string) => oauthFunction(windowEvent, oauthUrl));
      window.webContents.on('will-redirect', (windowEvent: any, oauthUrl: string) => oauthFunction(windowEvent, oauthUrl));
    });
  }
});
