const axios = require("axios");

module.exports = {
  name: "remini",
  usage: "remini (must be used with an image attachment or reply to an image)",
  description: "Enhance an image using AI via the Remini API.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID, messageReply } = event;
    let imageUrl;

    // If the message is a reply to another message containing an image
    if (messageReply && messageReply.attachments.length > 0) {
      const attachment = messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return api.sendMessage("⚠️ Please reply to an image to enhance it.", threadID, messageID);
      }
      imageUrl = attachment.url;
    } else {
      return api.sendMessage(
        "❌ Please send an image or reply to an image with the message `remini` to enhance it.",
        threadID,
        messageID
      );
    }

    // Notify user the process is starting
    await api.sendMessage("⌛ Enhancing image, please wait...", threadID, messageID);

    try {
      const enhanceUrl = `https://xnilnew404.onrender.com/xnil/remini?imageUrl=${encodeURIComponent(imageUrl)}&method=enhance`;

      await api.sendMessage(
        {
          attachment: await global.utils.getStreamFromURL(enhanceUrl)
        },
        threadID,
        messageID
      );
    } catch (error) {
      console.error("Error enhancing image:", error);
      await api.sendMessage(
        "❌ An error occurred while enhancing the image. Please try again later.",
        threadID,
        messageID
      );
    }
  },
};