const axios = require("axios");

module.exports = {
  name: "sim",
  aliases: ["Sim"],
  usage: "sim <message>",
  description: "Talk to SimSimi",
  version: "1.0.0",
  cooldowns: 0,

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send("Bakit ba?? kupal kaba?.");
    }

    const content = encodeURIComponent(args.join(" "));

    try {
      const res = await axios.get(`https://simsimi-api-pro.onrender.com/sim?query=${content}`);
      if (res.data.error) {
        return send(`Error: ${res.data.error}`);
      }

      return send(res.data.respond);
    } catch (error) {
      console.error("Sim command error:", error);
      return send("❌ An error occurred while trying to talk to Sim.");
    }
  },
};