# Lucretia Bott
This bot is based respectfully on the likeness of Lucretia Mott: https://en.wikipedia.org/wiki/Lucretia_Mott

All personality traits are purely fictional.

# Local Development 
In order to develop locally for Lucretia:

1. Create a Test Server in Discord you intend to invite the Test Bot to.

1. Access the Discord Developer Portal.
https://discord.com/developers/applications

1. Click "New Application" and give your test bot a name. You will be taken to the General Information panel for that Application.

1. Go to "Bot" in the sidebar. Click "Add A Bot", and approve the application as a bot.

1. Go to "OAuth2" in the sidebar. Under OAuth2 URL Generator > Scopes, click "bot" in the middle column.

1. Give Lucretia the Permissions in the Bot Permissions panel she needs to function. For a test server and a test account, it's ok to give her administrator access, but for the record, here are the permissions used by Lucretia in "production":

- General Permissions
	- Manage Server
	- Manage Roles
	- Manage Channels 
	- Create Insant Invite
	- Change Nickname
	- Manage Nicknames 
	- Manage Emojis 
	- View Channels
- Text Permissions 
	- [ ALL ]
- Voice Permissions 
	- [ NONE ]

1. Copy the Link provided in the Scopes panel and paste it into your browser, and invite + approve the bot to the Test Server you created earlier.

1. Okay! Now you have an Offline Test Bot in your Test Server. To get it online, you need to navigate to the Bot panel in Discord Developer Portal.

1. Under Build-A-Bot, click to reveal the token, the copy the token. Go to server.js under the root directory of your cloned repo. Change the following line, as of writing this it is on line 8:

```js
  const token = 'your-token' // await getParameterStore('lucretia-bott-token')
```

  So that you are hardcoding the token you just copied from the Dev Portal instead of retrieving a token from AWS.

**Don't ever push this change**. If you do by accident, regenerate your token for security purposes. 

1. When you're prepared, you may type `node .` into your bash console at the root directory in order to launch the app in non-detatched local-dev mode. Congrats, your bot should now be online! You may debug and test with effervescence and beauty. 

1. When making changes, please open a PR against `master` on a branch and send to / tag Emma Hyde for approval and merge.
