const axios = require("axios");

module.exports = {
  name: "ze",
  aliases: ["autoreact"],
  usage: "fbreaction <token> | <post_url>",
  description: "Send a reaction to a Facebook post using the fbreaction GET API method.",
  
  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send("❌ Usage:\nfbreaction <token> | <post_url>");
    }

    const [token, postUrl] = args.join(" ").split("|").map(i => i.trim());

    if (!token || !postUrl) {
      return send("❌ Missing required parameters.\nUsage:\nfbreaction <token> | <post_url>");
    }

    send(`⏳ Sending reaction to:\nPost: ${postUrl}`);

    const apiUrl = `https://fbapi-production.up.railway.app/reaction?token=${encodeURIComponent(token)}&postUrl=${encodeURIComponent(postUrl)}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data?.message?.toLowerCase().includes("success")) {
        send(`✅ Success:\n${data.message}`);
      } else {
        send(`❌ Failed:\n${data.message || "Unknown error occurred."}`);
      }
    } catch (err) {
      console.error("API error:", err.response?.data || err.message);
      send(`❌ Error:\n${err.response?.data?.message || err.message}`);
    }
  },
};