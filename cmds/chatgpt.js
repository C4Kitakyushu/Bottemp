const axios = require("axios");

module.exports = {
  name: "chatgpt",
  description: "Interact with GPT-4 AI.",
  usage: "ai <your question>",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ").trim() || "Hello";

    if (!query) {
      return api.sendMessage(
        "❌ Please enter a question.\n\nExample:\nchatgpt What is artificial intelligence?",
        threadID,
        messageID
      );
    }

    try {
      const url = `https://jonell01-ccprojectsapihshs.hf.space/api/gpt4?ask=${encodeURIComponent(query)}&id=${encodeURIComponent(senderID)}`;
      const response = await axios.get(url);
      const result = response.data || "No response from the AI.";

      const maxLength = 2000;
      if (result.length > maxLength) {
        const parts = result.match(new RegExp(`.{1,${maxLength}}`, "g"));
        for (const part of parts) {
          await new Promise((r) => setTimeout(r, 500));
          await api.sendMessage(part, threadID, messageID);
        }
      } else {
        return api.sendMessage(result, threadID, messageID);
      }
    } catch (error) {
      console.error("GPT-4 API error:", error);
      return api.sendMessage("❌ An error occurred while contacting the AI.", threadID, messageID);
    }
  },
};