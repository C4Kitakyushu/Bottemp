const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

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

    await api.sendMessage("⌛ Removing background, please wait...", threadID, messageID);

    try {
      const removeBgUrl = `https://xnilnew404.onrender.com/xnil/removebg?image=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(removeBgUrl, { responseType: "arraybuffer" });

      const filePath = path.join(__dirname, "cache", `removed-bg-${Date.now()}.png`);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, response.data);

      await api.sendMessage(
        {
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        messageID
      );

      // Clean up
      setTimeout(() => fs.unlink(filePath), 10 * 1000);
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