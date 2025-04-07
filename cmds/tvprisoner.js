const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "tvprisoner",
  aliases: ["prisoner"],
  usage: "tvprisoner (reply to an image)",
  description: "Put the replied image into a TV prisoner frame (GIF).",

  execute: async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image to use this command.");
    }

    const imageUrl = messageReply.attachments[0].url;
    send("⏳ Processing image, please wait...");

    try {
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/tv-prisoner?imageUrl=${encodeURIComponent(imageUrl)}`);
      const gifUrl = response.data?.url;

      if (!gifUrl) return send("❌ Failed to get the GIF URL from API.");

      const gifPath = path.join(__dirname, "cache", `tvprisoner_${Date.now()}.gif`);
      await fs.ensureDir(path.dirname(gifPath));

      const gifStream = await axios.get(gifUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(gifPath);
      gifStream.data.pipe(writer);

      writer.on("finish", async () => {
        await api.sendMessage(
          { attachment: fs.createReadStream(gifPath) },
          threadID,
          () => fs.unlinkSync(gifPath),
          messageID
        );
      });

      writer.on("error", (err) => {
        console.error("Stream error:", err);
        send("❌ Failed to save the GIF.");
      });
    } catch (error) {
      console.error("API error:", error);
      send("❌ An error occurred while processing the image.");
    }
  },
};