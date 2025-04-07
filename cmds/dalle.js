const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "dalle",
  description: "Generate an AI image based on a prompt using DALL·E.",
  usage: "dalle <your prompt>",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const prompt = args.join(" ").trim();

    if (!prompt) {
      return api.sendMessage(
        "❌ Please provide a prompt.\n\nExample:\ndalle a girl walking in a futuristic city",
        threadID,
        messageID
      );
    }

    await api.sendMessage("⏳ Generating image, please wait...", threadID, messageID);

    try {
      const apiUrl = `https://hazeyyyy-rest-apis.onrender.com/api/dalle?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.image) {
        return api.sendMessage("❌ Failed to generate image. No image URL received.", threadID, messageID);
      }

      const imageResponse = await axios.get(response.data.image, { responseType: "stream" });
      const filePath = path.join(__dirname, `dalle_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(filePath);
      imageResponse.data.pipe(writer);

      writer.on("finish", async () => {
        await api.sendMessage({
          body: "✅ Here's your image:",
          attachment: fs.createReadStream(filePath)
        }, threadID, messageID);
        fs.unlinkSync(filePath);
      });

      writer.on("error", (err) => {
        console.error("File write error:", err);
        api.sendMessage("❌ Failed to save generated image.", threadID, messageID);
      });
    } catch (error) {
      console.error("DALL·E API error:", error);
      api.sendMessage("❌ An error occurred while generating the image.", threadID, messageID);
    }
  },
};