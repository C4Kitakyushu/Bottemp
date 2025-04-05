const axios = require("axios");

module.exports = {
  name: "flux",
  aliases: [],
  usage: "flux <prompt>",
  description: "Generate a Flux Realism image using a custom prompt.",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    const prompt = args.join(" ").trim();
    if (!prompt) {
      return send("⚠️ Please provide a prompt.\n\nExample: flux cat");
    }

    const apiUrl = `https://global-redwans-apis.onrender.com/api/fluxxx?p=${encodeURIComponent(prompt)}&mode=flux`;

    try {
      const response = await axios.get(apiUrl);
      const { html } = response.data.data;

      const matches = [...html.matchAll(/<a href="(https:\/\/aicdn\.picsart\.com\/[a-zA-Z0-9-]+\.jpg)"/g)];
      const imageUrls = matches.map(match => match[1]);

      if (!imageUrls || imageUrls.length < 2) {
        return send("❌ Image generation failed. Please try a different prompt.");
      }

      await api.sendMessage(
        {
          body: `✅ Here is your Flux image for: "${prompt}"`,
          attachment: await global.utils.getStreamFromURL(imageUrls[0]),
        },
        threadID,
        messageID
      );

    } catch (error) {
      console.error("❌ Error generating Flux image:", error);
      send("❌ An error occurred while generating the image. Please try again.");
    }
  },
};