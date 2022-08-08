# Discord.js v14 Slash Commands Music Bot

## Bot Setup

[Click here for a setup video](https://youtu.be/LQ24tdW5d8k), but these instructions are up to date so make sure to follow them if the video is different.

- [Install node and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm)
- Clone this repository or download as a zip and extract the contents.
- Run `npm install`.
- Rename `token-example.js` to `token.js`
- Replace `YOUR TOKEN HERE` with your bot token from the Discord Developer Portal. (see the setup video above for how to set up a Discord bot and get your token)
- Other bot login: write to .env file is `TOKEN=YOUR BOT TOKEN`
- Then, you can either [run the bot normally](#run-normally) or you can [set it up in Windows Task Scheduler](#set-up-in-windows-task-scheduler).

### Notes on Discord Bot Setup
- Make sure to enable all intents in the Discord Developer Portal
![image](https://user-images.githubusercontent.com/4060573/181925950-0403ec46-f606-4ae2-bac8-6a2e30d10d9f.png)
- You will also need to invite the bot using the correct scope and permissions, which you can do here:
![image](https://user-images.githubusercontent.com/4060573/181926061-310e817a-97c5-48d8-adce-77a505c36336.png)


### Run Normally
- Rename `start.bat.example` to `start.bat`
- Open the Start Menu and type `cmd`, then open Command Prompt (PowerShell or Windows Terminal will also work)
- Change to your bot folder by doing `cd YOUR\BOT\FOLDER` (Note: Change your drive letter first if your bot is on another drive letter by typing `E:` (if E is your drive))

### Set up in Windows Task Scheduler
- Rename `schedule.bat.example` to `schedule.bat`
- Replace all `DRIVELETTER` with the drive that your bot folder is located on
- Change `\YOUR\BOT\DIRECTORY` to the exact directory your bot is located in (where you cloned or extracted in the first step above)
- Point your Windows Task Schedule to this `schedule.bat`

## Support/Contributing
- [Click here to join the Discord](https://discord.gg/Fy4WmSThRZ)

### Links

- [FİLTER COMMAND OTHER FİLTERS](https://discord-player.js.org/docs/main/master/typedef/AudioFilters)

- [Fork Replit](https://replit.com/)

- [Discord Developers](https://discord.dev)

- [Discord Permission](https://bit.ly/3L4RZpi)

- [Download Visual Studio Code](https://code.visualstudio.com/download)

- [Download NodeJS V17](https://nodejs.org/)
