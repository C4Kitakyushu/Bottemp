const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "removebg",
  aliases: ["rmbg"],
  usage: "removebg (reply to an image)",
  description: "Remove the background from an image.",

  execute: async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image to remove its background.");
    }

    const imageUrl = messageReply.attachments[0].url;
    send("⌛ Removing background, please wait...");

    const apiUrl = `https://kaiz-apis.gleeze.com/api/removebgv2?url=${encodeURIComponent(imageUrl)}&stream=true`;
    const tmpDir = path.join(__dirname, "cache");
    const tmpFile = path.join(tmpDir, `no_bg_${Date.now()}.png`);

    try {
      await fs.ensureDir(tmpDir);

      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(tmpFile);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await api.sendMessage(
          { attachment: fs.createReadStream(tmpFile) },
          threadID,
          () => fs.unlinkSync(tmpFile),
          messageID
        );
      });

      writer.on("error", (err) => {
        console.error("File stream error:", err);
        send("❌ Failed to save the image.");
      });
    } catch (err) {
      console.error("API error:", err);
      send("❌ An error occurred while processing the image. Please try again.");
    }
  },
};