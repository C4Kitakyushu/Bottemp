const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "bogart",
  aliases: [],
  usage: "bogart <text>",
  description: "Generate a bogart-style image with your text.",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    const text = args.join(" ");
    if (!text) {
      return send("❌ Please provide some text.\n\nUsage: bogart <text>");
    }

    const encodedText = encodeURIComponent(text);
    const apiUrl = `https://api-canvass.vercel.app/bogart?text=${encodedText}`;
    const imgPath = path.join(__dirname, "cache", `bogart_${Date.now()}.png`);

    try {
      await fs.ensureDir(path.dirname(imgPath));
      send("⏳ Generating image, please wait...");

      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            attachment: fs.createReadStream(imgPath),
          },
          threadID,
          () => fs.unlinkSync(imgPath),
          messageID
        );
      });

      writer.on("error", (err) => {
        console.error("Writer error:", err);
        send("❌ Error while saving the image.");
      });
    } catch (err) {
      console.error("API error:", err);
      send("❌ Failed to generate the image. Please try again later.");
    }
  },
};