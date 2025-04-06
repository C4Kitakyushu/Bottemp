const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "fbpfp",
  aliases: ["facebookpfp", "pfp"],
  usage: "fbpfp <uid>",
  description: "Fetch Facebook profile picture using UID",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg, file) =>
      api.sendMessage(
        file
          ? { body: msg, attachment: fs.createReadStream(file) }
          : msg,
        threadID,
        () => file && fs.unlinkSync(file),
        messageID
      );

    if (!args[0]) return send("❌ Please provide a Facebook UID.");

    const uid = encodeURIComponent(args[0]);
    const imageUrl = `https://kaiz-apis.gleeze.com/api/facebookpfp?uid=${uid}`;
    const fileName = path.join(__dirname, "cache", `${uid}.jpg`);

    try {
      await send("⏳ Fetching Facebook profile picture...");

      const response = await axios.get(imageUrl, { responseType: "stream" });
      await fs.ensureDir(path.dirname(fileName));

      const writer = fs.createWriteStream(fileName);
      response.data.pipe(writer);

      writer.on("finish", () => send("✅ Here's the profile picture:", fileName));
      writer.on("error", (err) => {
        console.error(err);
        send("❌ Failed to save the profile picture.");
      });
    } catch (err) {
      console.error("Error fetching profile picture:", err);
      send("❌ An error occurred. Please try again later.");
    }
  },
};