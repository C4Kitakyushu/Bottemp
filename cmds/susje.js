const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "susje",
  aliases: [],
  usage: "susje <text>",
  description: "Generate a Jesus-style image",
  version: "1.0.0",
  cooldowns: 5,

  execute: async ({ api, event, args }) => {
    const text = args.join(" ");
    if (!text) {
      return api.sendMessage("Usage: susje <text>", event.threadID);
    }

    const encodedText = encodeURIComponent(text);
    const url = `https://api-canvass.vercel.app/jesus?text=${encodedText}`;
    const cachePath = path.join(__dirname, "cache");
    const imagePath = path.join(cachePath, `jesus_${Date.now()}.png`);

    try {
      await fs.ensureDir(cachePath);
      api.sendMessage("Generating your image, please wait...", event.threadID);

      const response = await axios({
        url,
        method: "GET",
        responseType: "stream"
      });

      const stream = fs.createWriteStream(imagePath);
      response.data.pipe(stream);

      stream.on("finish", async () => {
        await api.sendMessage(
          { attachment: fs.createReadStream(imagePath) },
          event.threadID
        );
        await fs.unlink(imagePath);
      });

      stream.on("error", (err) => {
        console.error("Stream writer error:", err);
        api.sendMessage("An error occurred while processing the image.", event.threadID);
      });
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("An error occurred while processing your request.", event.threadID);
    }
  },
};