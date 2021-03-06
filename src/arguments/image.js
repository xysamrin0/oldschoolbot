const { Argument } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Argument {
	async parseURL(imageURL) {
		const imageBuffer = await fetch(imageURL).then(result => result.buffer());
		return [imageBuffer, imageURL];
	}

	async run(arg, possible, msg) {
		// If theres nothing provided, search the channel for an image.
		if (typeof arg === 'undefined') {
			const messageBank = await msg.channel.messages.fetch({
				limit: 20
			});

			for (const message of messageBank.values()) {
				const fetchedAttachment = message.attachments.first();
				if (fetchedAttachment && fetchedAttachment.height) {
					return this.parseURL(fetchedAttachment.proxyURL);
				}
			}
		} else {
			// If they mentioned someone, return their avatar.
			const member = this.constructor.regex.userOrMember.test(arg)
				? await msg.guild.members
						.fetch(this.constructor.regex.userOrMember.exec(arg)[1])
						.catch(() => null)
				: null;

			if (member) {
				return this.parseURL(
					member.user.displayAvatarURL({
						format: 'png',
						size: 512
					})
				);
			}
		}

		// If we can't find any image, use the authors avatar.
		return this.parseURL(
			msg.author.displayAvatarURL({
				format: 'png',
				size: 512
			})
		);
	}
};
