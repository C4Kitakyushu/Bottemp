const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "ghibli",
  aliases: ["ghibliart"],
  usage: "ghibli [reply to image]",
  description: "Convert a photo into Studio Ghibli style artwork.",
  version: "2.2",

  execute: async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    // Check if user replied to an image
    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image!");
    }

    const imgUrl = messageReply.attachments[0].url;
    const processingMsg = await send("✨ Turning your image into Ghibli-style...");

    try {
      // Call Ghibli transformation API
      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/ghibli?imageUrl=${encodeURIComponent(imgUrl)}`;
      const response = await axios.get(apiUrl, { responseType: "stream" });

      const imgPath = path.join(__dirname, "cache", `ghibli-${Date.now()}.jpg`);
      await fs.ensureDir(path.dirname(imgPath));

      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: "✅ Here's your Ghibli-style artwork!",
          attachment: fs.createReadStream(imgPath),
        }, threadID, () => fs.unlinkSync(imgPath), messageID);

        api.unsendMessage(processingMsg.messageID);
      });

      writer.on("error", (err) => {
        console.error("Stream error:", err);
        send("❌ Failed to process the Ghibli-style image.");
      });

    } catch (err) {
      console.error("Error:", err);
      send("❌ Error generating the Ghibli image. Please try again.");
    }
  }
};