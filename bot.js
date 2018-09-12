const Discord = require('discord.js');
const bot = new Discord.Client();
let options;
const fs = require("fs");
const path = require('path');
const GoogleAssistant = require('google-assistant');


let runBot = function () {
    console.log("Loading replies...");
    let replies;
    let commands = {
        "gassistant": options.core.prefix + "q"
    }
    fs.readFile("./replies.txt", 'UTF-8', function (e, text) {
        replies = text.split('\n');
        console.log("Replies loaded");
    });
    console.log("Welcome to AmyBot! 0w0");
    bot.on('ready', () => {
        console.log("I'm ready!");
        console.log('Token:', options.core.token);
        console.log('Prefix:', options.core.prefix);
        console.log('Developer Mode:', options.core.devMode);
    });

    bot.on('message', msg => {
        // Here's the bot "AI"
        if (msg.content.startsWith(options.core.prefix)) {
            //Handle Commands
            if (msg.content.startsWith(commands.gassistant)) {
                if (options.core.ga_secret == "") {
                    msg.reply("Google Assistant functionality is disabled. Please contact your server admin.");
                } else {
                    console.log("Hey, Google!");
                    let query = msg.content.substring(commands.gassistant.length + 1);
                    console.log("GA Query: " + query);
                    const config = {
                        auth: {
                            keyFilePath: path.resolve(__dirname, options.core.ga_secret),
                            savedTokensPath: path.resolve(__dirname, options.core.ga_tokens),
                        },
                        conversation: {
                            lang: 'en-US',
                            textQuery: query,
                        },
                    };
                    const assistant = new GoogleAssistant(config.auth);
                    const startConversation = (conversation) => {
                        conversation
                            .on('response', (text) => {
                                if (text != "") {
                                    console.log("GA Response: " + text);
                                    msg.reply(text + "\n`Powered by Google Assistant`");
                                } else {
                                    console.log("GA Response was blank.");
                                    msg.reply("Sorry, I'm unable to help you with that. :(");
                                }
                            });
                    }
                    assistant.on('ready', () => {
                        assistant.start(config.conversation);
                    });
                    assistant.on('started', startConversation);
                    assistant.on('error', (error) => {
                        console.log(error);
                    });
                }
            }
        } else if (msg.isMemberMentioned(bot.user)) {
            //Respond to mentions
            var rand = Math.floor((Math.random() * replies.length));
            msg.reply(replies[rand]);
        }
    });

    bot.login(options.core.token);
};

fs.stat("./options.json", function (err) {
    if (err) {
        console.log("Thank you for installing AmyBot");
        console.log("Since this is the first startup, you will now need to configure me.");
        let readline = require('readline');
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        let coreData = {
            "core": {
                "token": "",
                "prefix": "",
                "ga_secret": "",
                "ga_tokens": "",
                "devMode": ""
            }
        };
        rl.question("Please paste your bot token, then press 'Enter': ", function (answer) {
            coreData.core.token = answer;
            fs.writeFileSync("./options.json", JSON.stringify(coreData, "", " "));
            rl.question("Please tell me what you want the command prefix to be: ", function (answer) {
                coreData.core.prefix = answer;
                fs.writeFileSync("./options.json", JSON.stringify(coreData, "", " "));
                rl.question("File name for your Google Assistant API Client Secret JSON (Leave blank to disable Google Assistant.): ", function (answer) {
                    coreData.core.ga_secret = "./" + answer;
                    fs.writeFileSync("./options.json", JSON.stringify(coreData, "", " "));
                    rl.question("Name for file to save Google Assistant tokens (.json): ", function (answer) {
                        coreData.core.ga_tokens = answer + ".json";
                        fs.writeFileSync("./options.json", JSON.stringify(coreData, "", " "));
                        rl.question("Enable developer mode? (Enables more logging.) (y/N): ", function (answer) {
                            if (answer.toLowerCase() === 'y') {
                                coreData.core.devMode = true;
                                fs.writeFileSync("./options.json", JSON.stringify(coreData, "", " "));
                            } else {
                                coreData.core.devMode = false;
                                fs.writeFileSync("./options.json", JSON.stringify(coreData, "", " "));
                            }
                            options = require('./options.json');
                            console.log("Thank you. I will now start.");
                            runBot();
                        });
                    });
                });
            });
        });
    } else {
        options = require('./options.json');
        runBot();
    }
});