const axios = require("axios");

module.exports = {
  name: "chatgpt",
  description: "Chat with AI using chatGPT API.",
  usage: "chatgpt <your question>",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage(
        "❌ Please enter a question.\n\nExample:\nchatgpt What is the capital of Japan?",
        threadID,
        messageID
      );
    }

    try {
      const url = `https://elevnnnx-rest-api.onrender.com/api/gpt?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url);

      if (response.data && response.data.result) {
        return api.sendMessage(response.data.result, threadID, messageID);
      } else {
        return api.sendMessage("❌ No response from GPT API.", threadID, messageID);
      }
    } catch (error) {
      console.error("GPT API error:", error);
      return api.sendMessage("❌ An error occurred while fetching the GPT response.", threadID, messageID);
    }
  },
};