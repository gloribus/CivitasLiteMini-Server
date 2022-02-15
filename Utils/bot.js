//const UserModel = require('../Models').user;
const { VK } = require('vk-io');

const vk = new VK({
	token: process.env.VK_TOKEN
});

class Bot {
  async sendMsg(id, message) {
    await vk.api.messages.send({
      peer_ids: id,
      message,
      random_id: Math.floor(Math.random() * 10_000) * Date.now(),
    });
}}

module.exports = new Bot();
