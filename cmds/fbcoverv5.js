const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "fbcoverv5",
  aliases: ["coverv5"],
  usage: "fbcoverv5 <name>|<id>|<subname>|<color>",
  description: "Generate a Facebook cover using name, ID, subname, and color.",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send(
        `❌ Please provide all required fields.\n\n` +
        `Usage:\nfbcoverv5 <name> | <id> |<subname> | <color>\n` +
        `Example:\nfbcoverv5 Deku | 4 | Midoriya | blue`
      );
    }

    const details = args.join(" ").split("|").map((d) => d.trim());
    if (details.length < 4) {
      return send(
        `❌ Invalid format. Use " | " to separate fields.\n\n` +
        `Example:\nfbcoverv5 Deku| 4 | Midoriya | blue`
      );
    }

    const [name, id, subname, color] = details.map(encodeURIComponent);
    const apiUrl = `https://api.zetsu.xyz/canvas/fbcoverv5?name=${name}&id=${id}&subname=${subname}&color=${color}`;
    const filePath = path.join(__dirname, `fbcoverv5_${Date.now()}.jpg`);

    try {
      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: "✅ Here's your Facebook cover:",
            attachment: fs.createReadStream(filePath),
          },
          threadID,
          () => fs.unlinkSync(filePath),
          messageID
        );
      });

      writer.on("error", (error) => {
        console.error("File write error:", error);
        send("❌ Failed to generate the Facebook cover.");
      });
    } catch (error) {
      console.error("Error generating Facebook cover:", error);
      send("❌ An error occurred while generating the Facebook cover. Please try again.");
    }
  },
};