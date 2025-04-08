const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "upscale",
  description: "Upscale an image using Hazeyyy's API",
  usage: "upscale (reply to an image)",
  version: "1.0.0",

  execute: async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    // Ensure the user replied to an image
    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image you want to upscale.");
    }

    const imageUrl = encodeURIComponent(messageReply.attachments[0].url);
    const apiUrl = `https://hazeyyyy-rest-apis.onrender.com/api/upscale?imageUrl=${imageUrl}`;
    const imgPath = path.join(__dirname, "cache", `upscaled_${Date.now()}.jpg`);

    try {
      await fs.ensureDir(path.dirname(imgPath));
      send("⏳ Upscaling image, please wait...");

      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await api.sendMessage(
          { attachment: fs.createReadStream(imgPath) },
          threadID,
          () => fs.unlinkSync(imgPath),
          messageID
        );
      });

      writer.on("error", (err) => {
        console.error("File write error:", err);
        send("❌ Failed to save the upscaled image.");
      });
    } catch (error) {
      console.error("Upscale API error:", error.message);
      send("❌ An error occurred while upscaling the image.");
    }
  },
};