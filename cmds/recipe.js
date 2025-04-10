const axios = require("axios");

module.exports = {
  name: "recipe",
  usage: "recipe <ingredient>",
  description: "Get a detailed recipe based on the ingredient you provide.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    const ingredient = args.join(" ");
    if (!ingredient) {
      return send("❌ Please provide an ingredient.\nUsage: recipe <ingredient>");
    }

    const apiUrl = `https://kaiz-apis.gleeze.com/api/recipe?ingredients=${encodeURIComponent(ingredient)}`;

    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data?.recipe) {
        return send("❌ No recipe found for that ingredient.");
      }

      let message = `👨‍🍳 Recipe for "${ingredient}"\n`;
      message += `Author: ${data.author || "Unknown"}\n\n`;
      message += `${data.recipe}`;

      // Split message if too long for Messenger
      const chunks = message.match(/[\s\S]{1,1900}/g);
      for (const chunk of chunks) {
        await send(chunk);
      }
    } catch (err) {
      console.error("Recipe API Error:", err.message);
      send("❌ Failed to fetch recipe. Try again later.");
    }
  },
};