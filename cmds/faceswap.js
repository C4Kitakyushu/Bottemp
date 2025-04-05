const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "faceswap",
  aliases: ["fswap"],
  usage: "faceswap <reply to 2 images>",
  description: "Swap faces between two replied images.",
  version: "1.0.0",

  execute: async ({ api, event }) => {
    const { threadID, messageReply, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    // Check for 2 replied image attachments
    if (!messageReply || messageReply.attachments.length < 2) {
      return send("⚠️ Please reply to a message containing *two* images to swap faces.");
    }

    const [source, target] = messageReply.attachments;

    if (source.type !== "photo" || target.type !== "photo") {
      return send("⚠️ Both attachments must be images.");
    }

    const sourceUrl = encodeURIComponent(source.url);
    const targetUrl = encodeURIComponent(target.url);
    const apiUrl = `https://kaiz-apis.gleeze.com/api/faceswap-v2?targetUrl=${targetUrl}&sourceUrl=${sourceUrl}`;

    try {
      const response = await axios.get(apiUrl, { responseType: "stream" });

      const filePath = path.join(__dirname, `faceswap_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);
      writer.on("finish", () => {
        api.sendMessage(
          {
            body: "✅ Face swap completed!",
            attachment: fs.createReadStream(filePath),
          },
          threadID,
          () => fs.unlinkSync(filePath),
          messageID
        );
      });

      writer.on("error", (err) => {
        console.error("Error writing file:", err);
        send("❌ Failed to save or send the swapped image.");
      });
    } catch (error) {
      console.error("FaceSwap API Error:", error);
      send("❌ An error occurred while processing the face swap.");
    }
  },
};