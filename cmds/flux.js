const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "flux",
  aliases: [],
  usage: "flux <prompt>",
  description: "Generate a Flux Realism image using a custom prompt.",
  version: "1.0.1",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    const prompt = args.join(" ").trim();
    if (!prompt) {
      return send("⚠️ Please provide a prompt.\n\nExample: flux cat");
    }

    const apiUrl = `https://global-redwans-apis.onrender.com/api/fluxxx?p=${encodeURIComponent(prompt)}&mode=flux`;

    try {
      const response = await axios.get(apiUrl);
      const { html } = response.data.data;
      const matches = [...html.matchAll(/<a href="(https:\/\/aicdn\.picsart\.com\/[a-zA-Z0-9-]+\.jpg)"/g)];
      const imageUrls = matches.map((m) => m[1]);

      if (!imageUrls.length) {
        return send("❌ Image generation failed. Please try a different prompt.");
      }

      // Download first image
      const imgUrl = imageUrls[0];
      const tempPath = path.join(__dirname, "cache", `flux_${Date.now()}.jpg`);
      await fs.ensureDir(path.dirname(tempPath));

      const imgRes = await axios.get(imgUrl, { responseType: "stream" });
      await new Promise((resolve, reject) => {
        const w = fs.createWriteStream(tempPath);
        imgRes.data.pipe(w);
        w.on("finish", resolve);
        w.on("error", reject);
      });

      // Send and cleanup
      await api.sendMessage(
        {
          body: `✅ Flux image for: "${prompt}"`,
          attachment: fs.createReadStream(tempPath),
        },
        threadID,
        () => fs.unlinkSync(tempPath),
        messageID
      );
    } catch (err) {
      console.error("❌ Flux error:", err);
      send("❌ An error occurred while generating the image. Please try again.");
    }
  },
};