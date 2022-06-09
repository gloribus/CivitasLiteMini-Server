const MarafonParticipantService = require('../Services/marafonParticipant');
const { VK } = require('vk-io');
const { Op } = require('sequelize');

const vk = new VK({
	token: process.env.VK_YAVDELE_TOKEN,
	apiLimit: 5,
	apiMode: 'parallel',
});

async function collectMailingList(level = 'full') {
	try {
		let condition = { isDeleted: 0 };
		if (level === 'allowed') {
			condition = { isAllowedMsgVK: 1 };
		} else if (level === 'prevent') {
			condition = { isAllowedMsgVK: 0 };
		}

		const vkIDs = await MarafonParticipantService.getAll(
			{ isDeleted: 0, vkID: { [Op.lt]: 2147480000 } },
			['vkID']
		);
		const mailingList = [];

		const results = await Promise.all(
			vkIDs.map(async (participant) => {
				const vkID = participant.vkID;
				const check = await vk.api.messages.isMessagesFromGroupAllowed({
					group_id: process.env.VK_YAVDELE_GROUP_ID,
					user_id: vkID,
				});
				if (check.is_allowed === 1) {
					mailingList.push(vkID);
				}
			})
		);

		const isUpdated = await MarafonParticipantService.updateCustom(
			{ isAllowedMsgVK: 1 },
			{ vkID: mailingList },
			false
		);

		return Boolean(isUpdated);
	} catch (e) {
		console.log(e);
	}
}

module.exports = collectMailingList;
