const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "cjoint",
  description: "Upload an image URL to cjoint and return the result link.",
  usage: "cjoint <image URL>",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const imageUrl = args[0];

    if (!imageUrl) {
      return api.sendMessage(
        "❌ Please provide an image",
        threadID,
        messageID
      );
    }

    const apiUrl = `https://ccprojectapis.ddns.net/api/cjoint?url=${encodeURIComponent(imageUrl)}`;

    try {
      api.sendMessage("⏳ Uploading image to Cjoint, please wait...", threadID, messageID);

      const response = await axios.get(apiUrl);

      if (response.data && response.data.result) {
        return api.sendMessage(`✅ Uploaded:\n${response.data.result}`, threadID, messageID);
      } else {
        return api.sendMessage("❌ Failed to get a valid response from the API.", threadID, messageID);
      }
    } catch (error) {
      console.error("Cjoint API error:", error);
      return api.sendMessage("❌ An error occurred while uploading the image.", threadID, messageID);
    }
  },
};