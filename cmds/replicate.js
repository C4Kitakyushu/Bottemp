const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "replicate", // Changed command name here
  aliases: [],
  usage: "replicate <prompt>", // Changed usage here
  description: "Generate a Flux Realism image using a custom prompt.",
  version: "1.0.1",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    const prompt = args.join(" ").trim();
    if (!prompt) {
      return send("⚠️ Please provide a prompt.\n\nExample: replicate cat"); // Changed example usage here
    }

    const apiUrl = `https://kaiz-apis.gleeze.com/api/flux-replicate?prompt=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(apiUrl);
      const { imageUrl } = response.data; // Assuming the response contains an 'imageUrl' field.

      if (!imageUrl) {
        return send("❌ Image generation failed. Please try a different prompt.");
      }

      // Download image
      const tempPath = path.join(__dirname, "cache", `replicate_${Date.now()}.jpg`); // Changed filename here
      await fs.ensureDir(path.dirname(tempPath));

      const imgRes = await axios.get(imageUrl, { responseType: "stream" });
      await new Promise((resolve, reject) => {
        const w = fs.createWriteStream(tempPath);
        imgRes.data.pipe(w);
        w.on("finish", resolve);
        w.on("error", reject);
      });

      // Send and cleanup
      await api.sendMessage(
        {
          body: `✅ Replicate image for: "${prompt}"`, // Changed response message here
          attachment: fs.createReadStream(tempPath),
        },
        threadID,
        () => fs.unlinkSync(tempPath),
        messageID
      );
    } catch (err) {
      console.error("❌ Replicate error:", err);
      send("❌ An error occurred while generating the image. Please try again.");
    }
  },
};
