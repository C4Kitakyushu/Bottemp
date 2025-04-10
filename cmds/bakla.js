const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "bakla",
  usage: "bakla <uid1> | <uid2>",
  description: "Generate a gay-themed image using two Facebook user IDs.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    const input = args.join(" ").split("|").map(item => item.trim());
    const [uid1, uid2] = input;

    if (!uid1 || !uid2) {
      return send("❌ Please provide two user IDs.\nUsage: bakla <uid1> | <uid2>");
    }

    const apiUrl = `https://api-canvass.vercel.app/gay?uid1=${encodeURIComponent(uid1)}&uid2=${encodeURIComponent(uid2)}`;
    const imgPath = path.join(__dirname, "cache", `gay_${Date.now()}.png`);

    try {
      await fs.ensureDir(path.dirname(imgPath));
      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: "🌈 Bayot image generated!",
          attachment: fs.createReadStream(imgPath),
        }, threadID, () => fs.unlinkSync(imgPath), messageID);
      });

      writer.on("error", (err) => {
        console.error("Write error:", err);
        send("❌ Failed to save the image.");
      });
    } catch (err) {
      console.error("API error:", err.message);
      send("❌ Something went wrong while generating the image.");
    }
  },
};