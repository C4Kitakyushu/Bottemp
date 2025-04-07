const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "tvprisoner",
  aliases: ["prisoner"],
  usage: "tvprisoner (reply to an image)",
  description: "Put the replied image into a TV prisoner frame.",

  execute: async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image to use this command.");
    }

    const imageUrl = messageReply.attachments[0].url;
    send("⏳ Processing image...");

    const apiUrl = `https://kaiz-apis.gleeze.com/api/tv-prisoner?imageUrl=${encodeURIComponent(imageUrl)}`;
    const cachePath = path.join(__dirname, "cache");
    const tempFile = path.join(cachePath, `tvprisoner_${Date.now()}.jpg`);

    try {
      await fs.ensureDir(cachePath);

      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(tempFile);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await api.sendMessage(
          { attachment: fs.createReadStream(tempFile) },
          threadID,
          () => fs.unlinkSync(tempFile),
          messageID
        );
      });

      writer.on("error", (err) => {
        console.error("Stream error:", err);
        send("❌ Failed to save the processed image.");
      });
    } catch (err) {
      console.error("API error:", err);
      send("❌ An error occurred while processing the image.");
    }
  },
};