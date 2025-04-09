const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "trash",
  aliases: [],
  usage: "trash <userid>",
  description: "Generate a trash meme image using a Facebook user ID.",
  version: "1.0.0",
  cooldowns: 5,

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send("❌ Usage: trashmeme <userid>\nExample: trashmeme 10007547984389");
    }

    const userid = args[0].trim();

    if (!userid) {
      return send("❌ Please provide a valid user ID.");
    }

    const url = `https://api-canvass.vercel.app/trash?userid=${userid}`;
    const imgPath = path.join(__dirname, "trashmeme_result.jpg");

    try {
      send("⏳ Generating meme, please wait...");

      const response = await axios.get(url, { responseType: "stream" });

      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await api.sendMessage({
          body: "✅ Here's your trash meme:",
          attachment: fs.createReadStream(imgPath),
        }, threadID, () => fs.unlinkSync(imgPath), messageID);
      });

      writer.on("error", (err) => {
        console.error("Stream writer error:", err);
        send("❌ Failed to process the image.");
      });
    } catch (error) {
      console.error("Fetch error:", error);
      return send("❌ An error occurred while generating the meme.");
    }
  },
};