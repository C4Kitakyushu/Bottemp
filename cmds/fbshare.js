const axios = require("axios");

module.exports = {
  name: "fbshare",
  usage: "fbshare {postUrl} {cookieOrToken} {shareAmount} {privacy} {intervalSeconds}",
  description: "Shares a post on Facebook using a cookie or token.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;

    if (args.length < 5) {
      return api.sendMessage(
        "✦ Please provide all required parameters:\n\n" +
        "Example:\nfbshare {postUrl} {cookieOrToken} {shareAmount} {privacy} {intervalSeconds}",
        threadID,
        messageID
      );
    }

    const [postUrl, cookieOrToken, shareAmount, privacy, intervalSeconds] = args;

    const apiUrl = `https://haji-mix.up.railway.app/api/fbshare?postUrl=${encodeURIComponent(postUrl)}&cookieOrToken=${encodeURIComponent(cookieOrToken)}&shareAmount=${encodeURIComponent(shareAmount)}&privacy=${encodeURIComponent(privacy)}&intervalSeconds=${encodeURIComponent(intervalSeconds)}`;

    try {
      const response = await axios.get(apiUrl);
      const { message, postIds } = response.data;

      const shareInfo = `
🚀 Facebook Share Status
📢 Message: ${message}
🆔 Post IDs: ${postIds.join(", ")}
      `;

      await api.sendMessage(shareInfo.trim(), threadID, messageID);

    } catch (error) {
      console.error("Error sharing post on Facebook:", error);
      await api.sendMessage(
        "❌ Sorry, an error occurred while sharing the post. Please check the provided details and try again.",
        threadID,
        messageID
      );
    }
  },
};