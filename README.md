# Lucretia Bott
This bot is based respectfully on the likeness of Lucretia Mott: https://en.wikipedia.org/wiki/Lucretia_Mott

All personality traits are purely fictional.

# Local Development 
In order to develop locally for Lucretia:

## Configure Discord

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

## Authentication

1. Under Build-A-Bot, click to reveal the token, the copy the token.

1. Create a .env file by typing this into your terminal from the root directory of your cloned repo: `touch .env`

1. Go into your new `.env` file and add this, replacing `<your-token>` with the token you copied: 
    ```
    LOCAL=true
    DISCORD_TOKEN=<your-token>
    ```

## Start the bot 

1. If you do not have redis installed on your local machine, you will need to install and start a redis server: 

	```bash
	brew install redis 
	redis-server
	  # to check redis connection, you may run: 
	redis-cli ping
	  # expected response if working: => PONG
	```

1. When you're prepared, you may `npm install` and `npm run watch` into your bash console at the root directory in order to launch the app in non-detatched local-dev mode. Congrats, your bot should now be online! You may debug and test with effervescence and beauty. Changes to the code will be automatically reloaded by nodemon, no need to start and stop the app (this is what `watch` is for). 

1. Add any new commands to the `help` command in `command-map.js`. When making changes, please open a PR against `master` on a branch and send to / tag Emma Hyde for approval and merge.

# Documentation
This bot uses the Eris.js framework in order to communicate with Discord (send messages, read messages, etc.)

**Helpful Links:**
- Primary Documentation:
  - Eris: https://abal.moe/Eris/docs/getting-started
	- Most Helpful Classes:
  		- Guild (This is the original word used by discord for Server): https://abal.moe/Eris/docs/Guild
  		- Message: https://abal.moe/Eris/docs/Message
  		- Channel: https://abal.moe/Eris/docs/Channel
  		- Member: https://abal.moe/Eris/docs/Member
		- User: https://abal.moe/Eris/docs/User
  		- Role: https://abal.moe/Eris/docs/Role
  - Redis: https://redis.io/documentation
  - AsyncRedis (JS Client): https://openbase.io/js/async-redis/documentation

# Examples
When working to add a command in `lib/command-map.js`, the primary element we're working with is the message that triggered the command to fire. Let's use `petkitty` as an example, it is quite simple. When a member of a channel writes `!petkitty`, we enter the asynchronous execute function defined there.

## Params
```
{msg, args} =>
	msg: Eris Message Object 
	args: Array[String] of message arguments
```
`msg` is the Eris `Message` Object. See `Message` documentation above for available functionality.

`args` is an Array of strings representing the passed parameters. This contains all of all words *following the command* `petkitty`, delimited by a space. If a message says `!petkitty a b c`, `args` will contain `['a', 'b', 'c']`. 

## Getting Info From The Message
Just a few examples:
- `msg.channel` - get the Eris::Channel Object
- `msg.channel.id` - get the channelID (useful for storing per-channel in redis)
- `msg.guildID` - get the serverID
- `msg.author.mention` - @Mentions the user who wrote the message
- `msg.content` - body of the message

If you want everything following the command to be one argument, you can do an `args.join(' ')`.

If someone passes a Mention, you can get the user ID off of it with `args[0].replace(/<@!(.*?)>/, (match, id) => id)`. This helps when associating the SAME user with whatever nickname they have at the time

Look through `command-map.js` for other examples.

## Working With Redis
Redis is a persisted in-memory data structure. It is great for when you're not storing anything particularly important or large (everything in this app) and is a lot smaller and easier to handle. In this app, it acts as a database. It can store strings, hashes, lists, sets, sorted sets with range queries, bitmaps, hyperloglogs, geospatial indexes with radius queries and streams. We use it for strings and hashes, and also probably lists.

We use Async Redis (library) to communicate with Redis. 

In `command-map.js`, we use RedisClient to interact with it.

- `RedisClient.hset(<String> A, <String> B, <String> C): At hash named A, store key of B with value of C.`
- `RedisClient.hget(<String> A, <String> B): At hash named A, get value of key B.`

# Deploying CloudFormation Changes

The bash script that prepares the EC2 instance (installs node, etc.) is within the main.yml file.

AWS will pick up any and all changes of the actual JavaScript codebase, but unfortunately the current
configuration will not pickup changes to the CloudFormation templates. In order to push changes to these
stacks (including upgrading node), you need to run the deploy-infra.sh script in this directory after some enviornmental configuration:

1. With an AWS account configured locally (use the AWS cli tool to configure your profiles), run:
	```
	mkdir -p ~/.env; touch ~/.env/lucretia-bott-access-token ~/.env/cli-profile
	```
	This is a non-destructive way to ensure all are in existence.
2. Enter each file and insert:
  - `lucretia-bott-access-token`: a Personal Access Token (created @ https://github.com/settings/tokens)
  that has `admin:repo_hook` and `repo` permissions. You will need a personal access token for an account that
  has read + write access to the repository. 
  - `cli-profile`: this is the name of an aws profile configured through the aws cli tool (look for
  existing profiles at `~/.aws/config` & `~/.aws/credentials`) that has read + write access to the account
  running lucretia-bott.
3. Once your bash environment is set up, we can run the bash script `bash deploy-infra.sh`. It will print out
the env variables it was able to derive from your environment. Note that if any of these are blank, something
went wrong.
4. If there are errors, the AWS cli tool will walk you through them. If it says it was unable to find either
of the above created files, make sure they contain only one string with the needed key or profile name, and
ensure they're in the correct location.

You can watch the CloudFormation update occur at the CloudFormation/`lucretia-bott` and
CloudFormation/`lucretia-bott-setup` stacks. This is where you can see each resource get constructed and is
the likely location to find deploy resource failures.

# Logging

CloudWatch is running for the app and setup scripts. You can see the logging for either at the CloudWatch
page.
