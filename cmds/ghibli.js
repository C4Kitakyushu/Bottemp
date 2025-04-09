const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "ghibli",
  aliases: ["ghibliold"],
  usage: "ghibliv1 (reply to an image)",
  description: "Transform a replied image into Ghibli-style using the V1 API.",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image to transform it.");
    }

    const imageUrl = encodeURIComponent(messageReply.attachments[0].url);
    const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/ghibli?imageUrl=${imageUrl}`;
    const imgPath = path.join(__dirname, "cache", `ghibli_v1_${Date.now()}.jpg`);

    try {
      await fs.ensureDir(path.dirname(imgPath));
      send("⏳ Transforming image into Ghibli-style (v1), please wait...");

      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await api.sendMessage(
          {
            body: "✅ Here's your Ghibli-style image (v1):",
            attachment: fs.createReadStream(imgPath),
          },
          threadID,
          () => fs.unlinkSync(imgPath),
          messageID
        );
      });

      writer.on("error", (err) => {
        console.error("File write error:", err);
        send("❌ Failed to save the transformed image.");
      });
    } catch (error) {
      console.error("API error:", error.message);
      send("❌ Failed to transform the image. Please try again later.");
    }
  },
};