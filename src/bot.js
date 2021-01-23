const Discord = require('discord.js');
const client = new Discord.Client();
const settings = require("./config/settings");
const tokens = require("./config/tokens");
const fs = require("fs");

let bot = {};
bot.commands = {};
bot.guilds = {};

console.log("loading commands...");
let commandsFolder = fs.readdirSync(`${__dirname}/commands`);
commandsFolder.forEach(folder => {
    files = fs.readdirSync(`${__dirname}/commands/${folder}`);
    files.forEach(file => {
        let commandName = file.split(".")[0];
        bot.commands[commandName] = require(`./commands/${folder}/${file}`);
    });
});
console.log(`${Object.keys(bot.commands).length} commands loaded`);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (!msg.content.startsWith(settings.prefix)) {
        return
    }
    let commandName = msg.content.toLowerCase().slice(settings.prefix.length).split(' ')[0];
    if (bot.commands.hasOwnProperty(commandName)) {
        if (
            msg.member.id != settings.owner
            && ((!bot.commands[commandName].properties.useBlacklistAsWhitelist && bot.commands[commandName].properties.blacklist.includes(msg.guild.id))
                || (bot.commands[commandName].properties.useBlacklistAsWhitelist && !bot.commands[commandName].properties.blacklist.includes(msg.guild.id)))
        ) {
            return
        }

        let currentdate = new Date()
        console.log(`${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()} ${msg.author.tag}: ${msg.content}`);
        let options = msg.content.toLowerCase().slice(settings.prefix.length).split(' ');
        options.shift();
        options = options.join("");
        msg.delete().then(() => {
            bot.commands[commandName].run(msg, bot, options);
        });
    } else {
        msg.delete().then(() => {
            msg.channel.send(`unknown command, try ${settings.prefix}help`).then(replyMsg => {
                setTimeout(() => {
                    replyMsg.delete();
                }, 5000);
            });
        });
    }
});

client.login(tokens.botToken);