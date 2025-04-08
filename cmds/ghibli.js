const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "ghibli",
  aliases: ["ghiblify"],
  usage: "ghibli [optional prompt] (reply to an image)",
  description: "Transform an image into Ghibli-style art using AI. Optionally add a prompt.",
  
  execute: async ({ api, event, args }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image to apply the Ghibli style.");
    }

    const imageUrl = messageReply.attachments[0].url;
    const prompt = args.join(" ").trim() || "";
    const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/ghibli?imageUrl=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`;
    
    const cacheDir = path.join(__dirname, "cache");
    const outputPath = path.join(cacheDir, `ghibli_${Date.now()}.jpg`);

    try {
      await fs.ensureDir(cacheDir);
      send("✨ Processing Ghibli-style image, please wait...");

      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          { attachment: fs.createReadStream(outputPath) },
          threadID,
          () => fs.unlinkSync(outputPath),
          messageID
        );
      });

      writer.on("error", (err) => {
        console.error("File write error:", err);
        send("❌ Failed to save the image.");
      });
    } catch (err) {
      console.error("API error:", err.message);
      send("❌ Failed to transform the image. Please try again later.");
    }
  },
};