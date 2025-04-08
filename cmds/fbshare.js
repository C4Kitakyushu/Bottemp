const axios = require("axios");

module.exports = {
  name: "fbshare",
  aliases: ["autoshare"],
  usage: "fbshare <token|cookie> | <post_url> | <privacy> | <share_count> | <interval_seconds>",
  description: "Share a Facebook post using the fbshare GET API method.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send(" Usage:\nfbshare token or cookie | post_url | privacy | share_count | interval_seconds");
    }

    const [cookieOrToken, postUrl, privacy, shareAmount, intervalSeconds] = args.join(" ").split("|").map(i => i.trim());

    if (!cookieOrToken || !postUrl || !privacy || !shareAmount || !intervalSeconds) {
      return send("❌ Missing required parameters.\nUsage:\nfbshare token or cookie | post_url | privacy | share_count | interval_seconds");
    }

    send(`⏳ Sharing post...\nPost: ${postUrl}\nShares: ${shareAmount}\nInterval: ${intervalSeconds}s`);

    const apiUrl = `https://haji-mix.up.railway.app/api/fbshare?postUrl=${encodeURIComponent(postUrl)}&cookieOrToken=${encodeURIComponent(cookieOrToken)}&shareAmount=${encodeURIComponent(shareAmount)}&privacy=${encodeURIComponent(privacy)}&intervalSeconds=${encodeURIComponent(intervalSeconds)}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data?.success) {
        send(`✅ Success:\n${data.message || "Post shared successfully!"}`);
      } else {
        send(`✅ Success:\n${data.message || "Unknown error occurred."}`);
      }
    } catch (err) {
      console.error("API error:", err.response?.data || err.message);
      send(`❌ Error:\n${err.response?.data?.message || err.message}`);
    }
  },
};