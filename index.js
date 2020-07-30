const Discord = require('discord.js');
const request = require('request');

const client = new Discord.Client();
const token = '<insert token here>';
const guild = '<insert guild id here>';
const verificationChannel = '<insert verification channel id here>';
const verifiedRole = '<insert verified role id here>';
const usersInProgress = {};

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

client.on('message', async message => {
	if (message.channel.id === verificationChannel && message.content == '>verify') {
		var id = makeid(7);
		message.author.send(
			'To verify, go to your spacemy profile (https://spacemy.xyz/manage.php) and set your status to: ' + id +
			'\nThen reply here with your spacemy username.'
		);
		usersInProgress[message.author.id] = id;
	} else if (
			message.author.id !== client.user.id &&
			message.channel.type === 'dm' &&
			typeof usersInProgress[message.author.id] != "undefined"
		) {
		var user = message.content;
		request({
			url: 'https://spacemy.xyz/api/getuser.php?name=' + user,
			json: true
		}, async (err, response, body) => {
			if (!err && response.statusCode === 200) {
				if (body.status === usersInProgress[message.author.id]) {
					var member = await client.guilds.resolve(guild).members.fetch(message.author.id);
					member.roles.add(verifiedRole);
					delete usersInProgress[message.author.id];
					message.channel.send('Verification successful!');
				} else {
					message.channel.send('Verification failed.');
				}
			} else {
				message.channel.send('Fatal error. Try again later.');
			}
		});
	}
});

client.login(token);
