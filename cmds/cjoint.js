const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "cjoint",
  aliases: ["uploadimage"],
  usage: "cjoint (reply to an image)",
  description: "Upload an image to the ccprojectapis service and return the link.",

  execute: async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    // Ensure the user replied to an image
    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image to upload.");
    }

    const imageUrl = messageReply.attachments[0].url;
    send("⌛ Uploading image, please wait...");

    const apiUrl = `https://ccprojectapis.ddns.net/api/cjoint?url=${encodeURIComponent(imageUrl)}`;
    const tmpDir = path.join(__dirname, "cache");
    const tmpFile = path.join(tmpDir, `cjoint_${Date.now()}.jpg`);

    try {
      await fs.ensureDir(tmpDir);

      const response = await axios.get(apiUrl);
      const { data } = response;

      if (data && data.url) {
        send(`✅ Image uploaded successfully: ${data.url}`);
      } else {
        send("❌ Failed to upload the image.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      send("❌ An error occurred while uploading the image. Please try again later.");
    }
  },
};