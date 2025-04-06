const axios = require("axios");

module.exports = {
  name: "imgbb",
  aliases: ["imgupload", "uploadimg"],
  usage: "imgbb [reply to image]",
  description: "Upload image to imgbb and get a shareable link.",
  version: "1.0.0",

  execute: async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image to upload.");
    }

    const imageUrl = messageReply.attachments[0].url;
    const apiUrl = `https://kaiz-apis.gleeze.com/api/imgbb?url=${encodeURIComponent(imageUrl)}`;

    try {
      send("⏳ Uploading image, please wait...");

      const res = await axios.get(apiUrl);

      if (!res.data?.url) {
        throw new Error("API did not return a valid URL.");
      }

      send(`✅ Image uploaded successfully!\nLink: ${res.data.url}`);
    } catch (err) {
      console.error("Upload error:", err);
      send("❌ Failed to upload image. Please try again later.");
    }
  },
};