const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "text2image",
  aliases: ["t2i"],
  usage: "text2image <prompt>",
  description: "Generates an AI image from a text prompt.",
  version: "1.0.1",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send("✦ Please provide a prompt to generate an image.\n\nExample: text2image girl");
    }

    const prompt = args.join(" ");
    const apiUrl = `https://kaiz-apis.gleeze.com/api/text2image?prompt=${encodeURIComponent(prompt)}`;

    try {
      // Download generated image
      const tempPath = path.join(__dirname, "cache", `t2i_${Date.now()}.jpg`);
      await fs.ensureDir(path.dirname(tempPath));

      const imgRes = await axios.get(apiUrl, { responseType: "stream" });
      await new Promise((resolve, reject) => {
        const w = fs.createWriteStream(tempPath);
        imgRes.data.pipe(w);
        w.on("finish", resolve);
        w.on("error", reject);
      });

      // Send and cleanup
      await api.sendMessage(
        {
          body: `✅ Here’s your image for: "${prompt}"`,
          attachment: fs.createReadStream(tempPath),
        },
        threadID,
        () => fs.unlinkSync(tempPath),
        messageID
      );
    } catch (err) {
      console.error("❌ text2image error:", err);
      send("❌ An error occurred while generating the image. Please try again.");
    }
  },
};