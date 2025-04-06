const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "fbpfp",
  aliases: ["facebookpfp", "profilepic"],
  usage: "fbpfp <uid>",
  description: "Fetch Facebook profile picture using UID.",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send("❌ Please provide a Facebook UID to fetch the profile picture.");
    }

    const uid = args[0];
    const imageUrl = `https://kaiz-apis.gleeze.com/api/facebookpfp?uid=${encodeURIComponent(uid)}`;
    const imgPath = path.join(__dirname, "cache", `fbpfp-${uid}.jpg`);

    try {
      send("⏳ Fetching Facebook profile picture, please wait...");

      // Ensure the cache directory exists
      await fs.ensureDir(path.dirname(imgPath));

      // Fetch the image and save it
      const response = await axios.get(imageUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `✅ Here's the Facebook profile picture for UID: ${uid}`,
          attachment: fs.createReadStream(imgPath),
        }, threadID, () => fs.unlinkSync(imgPath), messageID);
      });

      writer.on("error", (err) => {
        console.error("File stream error:", err);
        send("❌ Failed to process the image.");
      });
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      send("❌ An error occurred while fetching the profile picture.");
    }
  },
};