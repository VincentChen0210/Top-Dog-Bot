require('dotenv').config();

const Discord = require('discord.js');
//{ Client, WebhookClient, ReactionCollector, DiscordAPIError }
const ytdl = require('ytdl-core');
const search = require('youtube-search');
const options = {
    maxResults: 20,
    key: process.env.YOUTUBE_API,
    type: 'video'
};

const client = new Discord.Client({
    partials: ['MESSAGE', 'REACTION']
});

const webhookClient = new Discord.WebhookClient(
    process.env.WEBHOOK_ID,
    process.env.WEBHOOK_TOKEN,
)

const PREFIX = "$";
const queue = new Map();

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`)
})

client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
    if (!channel) return;

    channel.send(`Welcome, ${member}`);
})

client.on('message', async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;

    if (message.content.startsWith(PREFIX)) {
        const serverQueue = queue.get(message.guild.id);

        const [cmdName, ...args] = message.content
        .trim()
        .substring(PREFIX.length)
        .split(/\s+/);
    
        switch (cmdName) {
            case 'kick':
                botkick(message);
                console.log('in');
                break;
            case 'ban':
                botban(message);
                break;
            case 'announce':
                botannounce(args);
                break;
            /////// MUSIC BOT COMMANDS ////////
            case 'play':
                if (message.channel.id === '753374081486684270') {
                    execute(message, serverQueue);
                } else {
                    message.reply('Please use the music channel to use the music bot');
                }

                break;
            case 'skip':
                if (message.channel.id === '753374081486684270') {
                    skip(message, serverQueue);
                } else {
                    message.reply('Please use the music channel to use the music bot');
                }

                break;
            case 'stop':
                if (message.channel.id === '753374081486684270') {
                    stop(message, serverQueue);
                } else {
                    message.reply('Please use the music channel to use the music bot');
                }

                break;
            case 'viewqueue':
                if (message.channel.id === '753374081486684270') {
                    viewqueue(message, serverQueue, queue);
                } else {
                    message.reply('Please use the music channel to use the music bot');
                }
            case 'search':
                if (message.channel.id === '753374081486684270') {
                    youtubeSearch(message);
                } else {
                    message.reply('Please use the music channel to use the music bot');
                }
                
                break;
            ///// END OF MUSIC BOT COMMANDS //////
            case 'roll':
                roll(message, Number(args[0]));
                break;
        }
    }
})

async function youtubeSearch(message) {
    let embed = new Discord.MessageEmbed()
        .setColor("#ff54d1")
        .setDescription("Please enter a search query. Be specific as necessary")
        .setTitle("Youtube Search API");
    let embedMsg = await message.channel.send(embed);
    let filter = m =>m.author.id === message.author.id;
    let query = await message.channel.awaitMessages(filter, {max: 1});
    let results = await search(query.first().content, options).catch(err => console.log(err));
    if (results) {
        let youtubeResults = results.results;
        let i = 0;
        let titles = youtubeResults.map(result => {
            i++;
            return i + ") " + result.title;
        });

        message.channel.send({
            embed: {
                title: 'Select which song you want by typing the number:',
                description: "Note: only 1-20 can be selected" + "\n" + "Also note that you must type a valid number to clear the song selection. The bot will be waiting for a valid response before giving a selection." + "\n" + "\n" + titles.join("\n")
            }
        }).catch(err => console.log(err));

        filter = m => (m.author.id === message.author.id) && m.content >= 1 && m.content <= youtubeResults.length;
        let collected = await message.channel.awaitMessages(filter, {max: 1});
        console.log(collected);
        let selected = youtubeResults[collected.first().content -1];

        embed = new Discord.MessageEmbed()
            .setTitle(`${selected.title}`)
            .setURL(`${selected.link}`)
            .setDescription(`${selected.description}`)
            .setThumbnail(`${selected.thumbnails.default.url}`);
        message.channel.send(embed);
    }
}
function roll(message, args) {
    const invalid = isNaN(args);
    if (invalid) return message.reply('please enter a valid number!');
    if (!Number.isInteger(args)) return message.reply('please enter an integer!');
    if (args > 100 || args < 1) return message.reply('only numbers from 1 to 100 are supported');
    rollNum = Math.trunc(Math.random()*args) + 1;
    message.reply('your number is: ' + rollNum);
}

function botkick(message) {
    if (!message.member.hasPermission('KICK_MEMBERS')) return message.reply('You do not have permission to kick!');
    const user = message.mentions.users.first();
    if (user) {
        const member = message.guild.member(user);
        if (member) {
            member
            .kick()
            .then(() => {message.channel.send(`${user.tag} was kicked.`);})
            .catch(err => {message.channel.send('I cannot kick that user D:');});
        } else {
            message.channel.send('That user was not found');
        }
    } else {
        message.reply("you didn't mention a user to kick!");
    }
}

function botban(message) {
    if (!message.member.hasPermission('BAN_MEMBERS')) return message.reply('You do not have permission to ban!');
    const user = message.mentions.users.first();
    if (user) {
        const member = message.guild.member(user);
        if (member) {
            member
            .ban()
            .then(() => {message.channel.send(`${user.tag} was banned.`);})
            .catch(err => {message.channel.send('I cannot ban that user D:');});
        } else {
            message.channel.send('That user was not found');
        }
    } else {
        message.reply("you didn't mention a user to ban!");
    }
}

function botannounce(args){
    const msg = args.join(' ');
    webhookClient.send(msg);
}

client.on('messageReactionAdd', (reaction, user) => {
    const { name } = reaction.emoji;
    const member = reaction.message.guild.members.cache.get(user.id);
    if (reaction.message.id === '753107857645502465') {
        switch (name) {
            case '🥶':
                member.roles.add('753103693628309545');
                break;
            case '🐍':
                member.roles.add('753103784632385607');
                break;
            case '🤬':
                member.roles.add('753104197666472016');
                break;
            case '🤖':
                member.roles.add('753104223322898432');
                break;
        }
    }
})

client.on('messageReactionRemove', (reaction, user) => {
    const { name } = reaction.emoji;
    const member = reaction.message.guild.members.cache.get(user.id);
    if (reaction.message.id === '753107857645502465') {
        switch (name) {
            case '🥶':
                member.roles.remove('753103693628309545');
                break;
            case '🐍':
                member.roles.remove('753103784632385607');
                break;
            case '🤬':
                member.roles.remove('753104197666472016');
                break;
            case '🤖':
                member.roles.remove('753104223322898432');
                break;
        }
    }
})

async function execute(message, serverQueue) {
    const args = message.content.split(" ");
  
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }
  
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url
    };
  
    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
  
      queue.set(message.guild.id, queueContruct);
  
      queueContruct.songs.push(song);
  
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
}

function skip(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    if (!serverQueue)
      return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
}
  
function stop(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    message.channel.send('You have stopped the music! The queue will be removed.');
}

function viewqueue(message, serverQueue, queue) {
    if (!serverQueue) return message.channel.send('The queue is empty!');
    const queueLength = serverQueue.songs.length;

    for (var i=0; i < queueLength; i++) {
        message.channel.send(i+1 +  '. ' + serverQueue.songs[i].title);
    }
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
  
    const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }

client.login(process.env.TD_BOT_TOKEN);