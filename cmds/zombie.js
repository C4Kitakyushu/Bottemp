const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "zombie",
  aliases: ["zombify"],
  usage: "zombie <reply to an image>",
  description: "Transform a replied image into zombie style.",
  version: "1.0.0",

  execute: async ({ api, event }) => {
    const { threadID, messageReply, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    // Validate image reply
    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return send("❌ Please reply to an image to apply the zombie effect.");
    }

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo") {
      return send("⚠️ Only image replies are supported.");
    }

    const imageUrl = encodeURIComponent(attachment.url);
    const apiUrl = `https://kaiz-apis.gleeze.com/api/zombie?url=${imageUrl}`;

    try {
      send("⌛ Converting image to Zombie Style, please wait...");

      const response = await axios.get(apiUrl, { responseType: "stream" });
      const filePath = path.join(__dirname, `zombie_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);
      writer.on("finish", () => {
        api.sendMessage(
          {
            body: "🧟 Here's your zombie-style image!",
            attachment: fs.createReadStream(filePath),
          },
          threadID,
          () => fs.unlinkSync(filePath),
          messageID
        );
      });

      writer.on("error", (err) => {
        console.error("File write error:", err);
        send("❌ Failed to process the zombie image.");
      });
    } catch (error) {
      console.error("Zombie API Error:", error);
      send("❌ An error occurred while processing the image.");
    }
  },
};