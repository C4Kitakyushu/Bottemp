const axios = require("axios");

module.exports = {
  name: "ww",
  usage: "wattpad <query>",
  description: "Search Wattpad stories by title or keyword.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    const query = args.join(" ");
    if (!query) {
      return send("❌ Please provide a search keyword.\nUsage: wattpad <query>");
    }

    const apiUrl = `https://jerome-web.gleeze.com/service/api/wattpad?type=search&query=${encodeURIComponent(query)}`;

    try {
      const res = await axios.get(apiUrl);
      const data = res.data?.data;

      if (!data || data.length === 0) {
        return send("⚠️ No results found for your query.");
      }

      let output = `📚 Wattpad Results for: "${query}"\n\n`;

      data.slice(0, 5).forEach((item, i) => {
        output += `• ${i + 1}. ${item.title}\n`;
        output += `Reads: ${item.reads || "?"}, Votes: ${item.votes || "?"}, Parts: ${item.parts || "?"}\n`;
        output += `Link: ${item.link}\n`;
        if (item.description) output += `Description: ${item.description.substring(0, 150)}...\n`;
        output += `\n`;
      });

      send(output.trim());
    } catch (err) {
      console.error("Error fetching Wattpad data:", err.message);
      send("❌ Failed to fetch Wattpad data. Please try again later.");
    }
  },
};