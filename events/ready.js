const config = require("../config.js");
module.exports = async (client) => {

    const { REST } = require("@discordjs/rest");
    const { Routes } = require("discord-api-types/v10");
    const rest = new REST({ version: "10" }).setToken(config.TOKEN || process.env.TOKEN);
    (async () => {
        try {
            await rest.put(Routes.applicationCommands(client.user.id), {
                body: await client.commands,
            });
            console.log("Successfully reloaded application [/] commands.");
        } catch (err) {
            console.log("Error reloading application [/] commands: " + err);
        }
    })();

    console.log(client.user.username + " successfully connected.");
    console.log(`EN | ERROR EXAMPLE:IF THE BOT IS WORKING, RESPONDING TO COMMANDS BUT NO SOUND, FOLLOW THESE STEPS;
Enter the page of your project that you opened on replit.com.
Click on the one that says shell from the boxes that say console and shell above the opened box at the bottom right.
Type npm uni discord-player
Type npm i discord-player@5.3.0-dev.2
Type npm uni ytdl-core
Type npm i ytdl-core@4.10.0
Turn off and on the bot from the button that says "Stop" or "Run" in the middle of the replit screen


TR | HATA ÖRNEĞİ: BOT ÇALIŞIYOR, KOMUTLARA YANIT VERİYOR ANCAK SES YOKSA BU ADIMLARI TAKİP EDİN;
replit.com'da açtığınız projenizin sayfasına giriniz.
Sağ altta açılan kutunun üzerinde console ve shell yazan kutulardan shell yazana tıklayın.
npm uni discord-player yazın
npm i discord-player@5.3.0-dev.2 yazın
npm uni ytdl-core yazın
npm i ytdl-core@4.10.0 yazın
Ekranın ortasındaki "Stop" veya "Run" yazan butondan botu kapatıp açın.`)
    
client.user.setStatus('ONLINE');
client.user.setActivity(config.status)

}
