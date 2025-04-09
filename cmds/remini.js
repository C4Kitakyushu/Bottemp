const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "remini",
  aliases: ["enhance"],
  usage: "remini (reply to an image)",
  description: "Enhance an image using the Remini API.",

  execute: async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    // Ensure the user replied to an image
    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image to enhance it.");
    }

    const imageUrl = messageReply.attachments[0].url;
    send("⌛ Enhancing image, please wait...");

    const apiUrl = `https://kaiz-apis.gleeze.com/api/remini?url=${encodeURIComponent(imageUrl)}&stream=true`;
    const tmpDir = path.join(__dirname, "cache");
    const tmpFile = path.join(tmpDir, `remini_${Date.now()}.jpg`);

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
        console.error("File write error:", err);
        send("❌ Failed to save the enhanced image.");
      });
    } catch (err) {
      console.error("Enhance error:", err);
      send("❌ An error occurred while enhancing the image. Please try again later.");
    }
  },
};