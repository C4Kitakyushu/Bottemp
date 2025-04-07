const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "dalle",
  description: "Generate an AI image based on a prompt using DALL·E.",
  usage: "dalle <prompt>",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage(
        "❌ Please provide a prompt.\n\nExample:\ndalle futuristic girl with blue eyes",
        threadID,
        messageID
      );
    }

    const apiUrl = `https://hazeyyyy-rest-apis.onrender.com/api/dalle?prompt=${encodeURIComponent(prompt)}`;
    const imgPath = path.join(__dirname, "cache", `dalle_${Date.now()}.png`);

    try {
      await fs.ensureDir(path.dirname(imgPath));
      api.sendMessage("⏳ Generating image, please wait...", threadID, messageID);

      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await api.sendMessage(
          {
            attachment: fs.createReadStream(imgPath),
          },
          threadID,
          () => fs.unlinkSync(imgPath),
          messageID
        );
      });

      writer.on("error", (err) => {
        console.error("File write error:", err);
        api.sendMessage("❌ Failed to save the generated image.", threadID, messageID);
      });
    } catch (error) {
      console.error("API error:", error);
      api.sendMessage("❌ An error occurred while generating the image.", threadID, messageID);
    }
  },
};