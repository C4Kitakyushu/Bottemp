const axios = require("axios");

module.exports = {
  name: "text2image",
  aliases: ["t2i"],
  usage: "text2image <prompt>",
  description: "Generates an AI image from a text prompt.",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args || args.length === 0) {
      return send("✦ Please provide a prompt to generate an image.\n\nExample: text2image girl");
    }

    const prompt = args.join(" ");
    const apiUrl = `https://kaiz-apis.gleeze.com/api/text2image?prompt=${encodeURIComponent(prompt)}`;

    try {
      await api.sendMessage(
        {
          body: `✅ Here is your generated image for: "${prompt}"`,
          attachment: await global.utils.getStreamFromURL(apiUrl),
        },
        threadID,
        messageID
      );
    } catch (error) {
      console.error("❌ Error generating text2image:", error);
      send("❌ An error occurred while generating the image. Please try again.");
    }
  },
};