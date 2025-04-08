const axios = require("axios");

module.exports = {
  name: "test",
  aliases: ["autoshare"],
  description: "Auto share a Facebook post using Graph API",
  usage: "shareboost <token> | <post_url> | <privacy>",
  version: "1.1.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length || !args.join(" ").includes("|")) {
      return send("❌ Incorrect format.\n\nUsage:\nshareboost <token> | <post_url> | <privacy>\nExample:\nshareboost EAA... | https://facebook.com/... | EVERYONE");
    }

    const [accessToken, shareUrl, privacy] = args.join(" ").split("|").map(i => i.trim());

    if (!accessToken || !shareUrl || !privacy) {
      return send("❌ Missing required parameters.\nMake sure you provide: token | post_url | privacy.");
    }

    const shareCount = 100; // Default: 100 shares
    const timeInterval = 1000; // 1 second between each
    const deleteAfter = 60 * 60; // 1 hour

    let sharedCount = 0;
    let lastPostId = null;

    send(`🚀 Starting Share Boost...\nShares: ${shareCount}\nPrivacy: ${privacy}`);

    const sharePost = async () => {
      try {
        const response = await axios.post(
          `https://graph.facebook.com/me/feed?access_token=${accessToken}`,
          {
            link: shareUrl,
            privacy: { value: privacy },
            no_story: true
          }
        );

        sharedCount++;
        const postId = response?.data?.id;
        lastPostId = postId;

        api.sendMessage(`✅ Shared\nPost ID: ${postId || 'Unknown'}`, threadID);

        if (sharedCount === shareCount) {
          clearInterval(timer);
          send("✅ Done sharing!");

          if (lastPostId) {
            setTimeout(() => deletePost(lastPostId), deleteAfter * 1000);
          }
        }
      } catch (err) {
        console.error("Share error:", err?.response?.data || err.message);
        send("❌ Failed to share post. Please check your token or permissions.");
      }
    };

    const deletePost = async (postId) => {
      try {
        await axios.delete(`https://graph.facebook.com/${postId}?access_token=${accessToken}`);
        send(`🗑️ Post deleted: ${postId}`);
      } catch (err) {
        console.error("Delete error:", err?.response?.data || err.message);
        send("❌ Failed to delete the post.");
      }
    };

    const timer = setInterval(sharePost, timeInterval);

    setTimeout(() => {
      clearInterval(timer);
      send("⏹️ Stopped due to timeout.");
    }, shareCount * timeInterval + 1000);
  },
};