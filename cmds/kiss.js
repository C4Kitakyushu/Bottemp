const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "kiss",
  usage: "kiss <userID1> | <userID2>",
  description: "Generate a kiss image using two user IDs.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    const [userID1, userID2] = args.join(" ").split("|").map(e => e.trim());

    if (!userID1 || !userID2) {
      return send("❌ Please provide two user IDs.\nUsage: kiss <userID1> | <userID2>");
    }

    const url = `https://api-canvass.vercel.app/kiss?userid1=${userID1}&userid2=${userID2}`;
    const imgPath = path.join(__dirname, "cache", `kiss_${Date.now()}.png`);

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