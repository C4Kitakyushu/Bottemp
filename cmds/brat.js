const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "brat",
  usage: "brat <text>",
  description: "Generate a Bratz-style image with your text.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    const text = args.join(" ");
    if (!text) {
      return send("❌ Please provide a text.\nUsage: brat <text>");
    }

    const apiUrl = `https://api.zetsu.xyz/gen/brat?text=${encodeURIComponent(text)}`;
    const imgPath = path.join(__dirname, "cache", `brat_${Date.now()}.png`);

    try {
      await fs.ensureDir(path.dirname(imgPath));
      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: "✨ Here's your Bratz-style image!",
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