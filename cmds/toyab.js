const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "toyab",
  usage: "toyab <userID>",
  description: "Generate a Toyab-style image from a user ID.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);
    const userID = args[0];

    if (!userID) return send("❌ Please provide a user ID.\nUsage: toyab <userID>");

    const url = `https://api-canvass.vercel.app/toyab?userid=${encodeURIComponent(userID)}`;
    const imgPath = path.join(__dirname, "cache", `toyab_${Date.now()}.png`);

    try {
      await fs.ensureDir(path.dirname(imgPath));
      const response = await axios.get(url, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({ attachment: fs.createReadStream(imgPath) }, threadID, () => fs.unlinkSync(imgPath), messageID);
      });

      writer.on("error", (err) => {
        console.error("Stream error:", err);
        send("❌ Failed to download the image.");
      });
    } catch (err) {
      console.error("API Error:", err.message);
      send("❌ An error occurred while generating the image.");
    }
  },
};