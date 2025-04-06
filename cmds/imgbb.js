const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "imgbb",
  aliases: ["imgupload", "uploadimg"],
  usage: "imgbb [reply to image]",
  description: "Upload image to imgbb and get a shareable link.",
  version: "1.0.0",
  cooldowns: 5,

  execute: async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    // Check if image is replied to
    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image to upload.");
    }

    const imageUrl = messageReply.attachments[0].url;
    const encodedUrl = encodeURIComponent(imageUrl);
    const apiUrl = `https://kaiz-apis.gleeze.com/api/imgbb?url=${encodedUrl}`;

    try {
      send("⏳ Uploading image, please wait...");

      const res = await axios.get(apiUrl);

      if (!res.data?.url) {
        throw new Error("API did not return a valid URL.");
      }

      send(`✅ Image uploaded successfully!\nLink: ${res.data.url}`);
    } catch (err) {
      console.error("Error uploading image:", err);
      send("❌ Failed to upload image. Please try again later.");
    }
  },
};