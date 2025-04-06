const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "animeart",
  aliases: ["animefy"],
  usage: "anim [reply to image]",
  description: "Convert photo to anime style artwork.",
  version: "2.2",
  cooldowns: 10,

  execute: async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    // Check if user replied to an image
    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image!");
    }

    const imgUrl = messageReply.attachments[0].url;
    const processingMsg = await send("🛠️ Creating anime art...");

    try {
      // Get anime-style image URL
      const apiResponse = await axios.get(`http://45.134.39.193:6298/animirror?url=${encodeURIComponent(imgUrl)}`);
      if (!apiResponse.data?.image_url) throw new Error("Invalid API response format");

      const animeImgUrl = apiResponse.data.image_url;
      const imgPath = path.join(__dirname, "cache", `anime-${Date.now()}.jpg`);

      // Ensure cache directory exists
      await fs.ensureDir(path.dirname(imgPath));

      // Download and save the image
      const response = await axios.get(animeImgUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: "🎨 Your anime transformation is ready!",
          attachment: fs.createReadStream(imgPath),
        }, threadID, () => fs.unlinkSync(imgPath), messageID);

        // Unsend the "processing" message
        api.unsendMessage(processingMsg.messageID);
      });

      writer.on("error", (err) => {
        console.error("Stream error:", err);
        send("❌ Failed to process the image.");
      });

    } catch (err) {
      console.error("Error:", err);
      send("❌ Failed to create anime art. Please try another image.");
    }
  }
};