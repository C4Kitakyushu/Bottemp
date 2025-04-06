const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "fuck",
  aliases: [],
  usage: "fuck <uid1|uid2>",
  description: "Generate a 'fuck' meme image with two Facebook user IDs.",
  version: "1.0.1",
  cooldowns: 5,

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length || !args[0].includes("|")) {
      return send("❌ Usage: fuck <uid1|uid2>\nExample: fuck 1234567890|0987654321");
    }

    const [uid1, uid2] = args[0].split("|").map(item => item.trim());

    if (!uid1 || !uid2) {
      return send("❌ Please provide two valid user IDs separated by '|'.");
    }

    const url = `https://api-canvass.vercel.app/fuck?one=${uid1}&two=${uid2}`;
    const imgPath = path.join(__dirname, "fuck_result.png");

    try {
      send("⏳ Generating image, please wait...");

      const response = await axios.get(url, { responseType: "stream" });

      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await api.sendMessage({
          attachment: fs.createReadStream(imgPath),
        }, threadID, () => fs.unlinkSync(imgPath), messageID);
      });

      writer.on("error", (err) => {
        console.error("Stream writer error:", err);
        send("❌ Failed to process the image.");
      });
    } catch (error) {
      console.error("Fetch error:", error);
      return send("❌ An error occurred while generating the image.");
    }
  },
};