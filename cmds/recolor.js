const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "recolor",
  usage: "recolor (must be used with an image attachment or reply to an image)",
  description: "Enhance an image using AI via the Recolor API.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID, messageReply } = event;
    let imageUrl;

    // If the message is a reply to another message containing an image
    if (messageReply && messageReply.attachments.length > 0) {
      const attachment = messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return api.sendMessage("⚠️ Please reply to an image to recolor it.", threadID, messageID);
      }
      imageUrl = attachment.url;
    } else {
      return api.sendMessage(
        "❌ Please send an image or reply to an image with the message `recolor` to enhance it.",
        threadID,
        messageID
      );
    }

    await api.sendMessage("⌛ Recoloring image, please wait...", threadID, messageID);

    try {
      const enhanceUrl = `https://xnilnew404.onrender.com/xnil/remini?imageUrl=${encodeURIComponent(imageUrl)}&method=recolor`;

      // Download enhanced image
      const tempPath = path.join(__dirname, `enhanced_${Date.now()}.jpg`);
      const response = await axios.get(enhanceUrl, { responseType: "stream" });

      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        const readStream = fs.createReadStream(tempPath);
        await api.sendMessage({ attachment: readStream }, threadID, messageID);
        fs.unlink(tempPath); // cleanup temp file
      });

      writer.on("error", async (err) => {
        console.error("❌ Error saving enhanced image:", err);
        await api.sendMessage("❌ Failed to process the image.", threadID, messageID);
      });
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