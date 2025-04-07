const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "dalle",
  description: "Generate AI image using DALL·E 3.",
  usage: "dalle <your prompt>",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const prompt = args.join(" ").trim();

    if (!prompt) {
      return api.sendMessage(
        "❌ Please provide a prompt.\n\nExample:\ndalle3 a cyberpunk samurai riding a motorcycle",
        threadID,
        messageID
      );
    }

    await api.sendMessage("⏳ Generating image with DALL·E 3, please wait...", threadID, messageID);

    try {
      const apiUrl = `https://api.zetsu.xyz/api/dalle-3?prompt=${encodeURIComponent(prompt)}&apikey=80836f3451c2b3392b832988e7b73cdb`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.url) {
        return api.sendMessage("❌ Failed to generate image. No image URL received.", threadID, messageID);
      }

      const imgResponse = await axios.get(data.url, { responseType: "stream" });
      const imgPath = path.join(__dirname, `dalle3_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(imgPath);
      imgResponse.data.pipe(writer);

      writer.on("finish", async () => {
        await api.sendMessage(
          {
            body: "✅ Here's your DALL·E 3 image:",
            attachment: fs.createReadStream(imgPath),
          },
          threadID,
          messageID
        );
        fs.unlinkSync(imgPath);
      });

      writer.on("error", (err) => {
        console.error("File write error:", err);
        api.sendMessage("❌ Failed to save generated image.", threadID, messageID);
      });
    } catch (error) {
      console.error("DALL·E 3 API error:", error);
      return api.sendMessage("❌ An error occurred while generating the image.", threadID, messageID);
    }
  },
};