const express = require('express');
const RPC = require("discord-rpc");

const client = new RPC.Client({ transport: 'ipc' });
client.login({ clientId: '811855112929673246' });

client.once('ready', ()=>{
	const app = express();
	app.use(express.json());
	app.post("/", (request, response) => {
		let body = request.body;
		if (body.action == "set") {
			let presence = {
				state: body.state,
				details: body.details,
				largeImageKey: 'iotlogo',
				buttons: [
					{
						label: "Join me!",
						url: body.url
					}
				],
				instance: true
			};
			if (typeof body.smallimage !== 'undefined') {
				// the variable is defined
				presence.smallImageKey = body.smallimage;
				presence.smallImageText = body.smallimage.toUpperCase();
			}
			client.setActivity(presence);
		} else if (body.action == "clear") {
			client.clearActivity();
		}
		response.sendStatus(200);
	});
	app.listen(3000, () => console.log('Discord-Chrome-Presence is ready!'));
});
