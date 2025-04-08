const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "cjoint",
  aliases: ["uploadimg"],
  usage: "cjoint (reply to an image)",
  description: "Upload an image to cjoint via ccprojectapis and get a shareable link.",

  execute: async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image to upload.");
    }

    const imageUrl = messageReply.attachments[0].url;
    send("⏳ Uploading image, please wait...");

    const apiUrl = `https://ccprojectapis.ddns.net/api/cjoint?url=${encodeURIComponent(imageUrl)}`;

    try {
      const response = await axios.get(apiUrl);
      const { url } = response.data;

      if (url) {
        send(`✅ Image uploaded successfully!\n\nLink: ${url}`);
      } else {
        send("❌ Failed to retrieve uploaded image URL.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      send("❌ An error occurred while uploading the image.");
    }
  },
};