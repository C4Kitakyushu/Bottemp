const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "nigga",
  usage: "nigga <userID>",
  description: "Generate a meme-style image using a user ID.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);
    const userID = args[0];

    if (!userID) return send("❌ Please provide a user ID.\nUsage: nigga <userID>");

    const url = `https://api-canvass.vercel.app/nigga?userid=${encodeURIComponent(userID)}`;
    const imgPath = path.join(__dirname, "cache", `nigga_${Date.now()}.png`);

    try {
      await fs.ensureDir(path.dirname(imgPath));
      const response = await axios.get(url, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({ attachment: fs.createReadStream(imgPath) }, threadID, () => fs.unlinkSync(imgPath), messageID);
      });

      writer.on("error", (err) => {
        console.error("Error saving image:", err);
        send("❌ Failed to process the image.");
      });
    } catch (err) {
      console.error("API Error:", err.message);
      send("❌ Something went wrong while generating the image.");
    }
  },
};