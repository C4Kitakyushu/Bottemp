const axios = require("axios");

module.exports = {
  name: "removebg",
  usage: "removebg (must be used with an image attachment or reply to an image)",
  description: "Remove the background from an image using an API.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID, messageReply } = event;
    let imageUrl;

    // If the message is a reply to another message containing an image
    if (messageReply && messageReply.attachments.length > 0) {
      const attachment = messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return api.sendMessage("⚠️ Please reply to an image to remove its background.", threadID, messageID);
      }
      imageUrl = attachment.url;
    } else {
      return api.sendMessage(
        "❌ Please send an image or reply to an image with the message `removebg` to remove its background.",
        threadID,
        messageID
      );
    }

    // Notify user that processing has started
    await api.sendMessage("⌛ Removing background, please wait...", threadID, messageID);

    try {
      const removeBgUrl = `https://xnilnew404.onrender.com/xnil/removebg?image=${encodeURIComponent(imageUrl)}`;

      await api.sendMessage(
        {
          attachment: await global.utils.getStreamFromURL(removeBgUrl)
        },
        threadID,
        messageID
      );
    } catch (error) {
      console.error("Error removing background:", error);
      await api.sendMessage(
        "❌ An error occurred while removing the background. Please try again later.",
        threadID,
        messageID
      );
    }
  },
};
