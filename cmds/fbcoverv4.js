const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "fbcoverv4",
  aliases: ["coverv4"],
  usage: "fbcoverv4 <name>|<id>|<subname>|<colorname>|<colorsub>",
  description: "Generate a Facebook cover with separate colors for name and subname.",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send(
        `❌ Please provide all required fields.\n\n` +
        `Usage:\n` +
        `fbcoverv4 <name> | <id>| <subname> |<colorname> | <colorsub>\n` +
        `Example:\n` +
        `fbcoverv4 Reiko | 2 | Midoriya | blue | red`
      );
    }

    const details = args.join(" ").split("|").map((d) => d.trim());
    if (details.length < 5) {
      return send(
        `❌ Invalid format. Use " | " to separate fields.\n\n` +
        `Example:\n` +
        `fbcoverv4 Reiko | 2| Midoriya | blue | red`
      );
    }

    const [name, id, subname, colorname, colorsub] = details.map((d) => encodeURIComponent(d));
    const apiUrl = `https://api.zetsu.xyz/canvas/fbcoverv4?name=${name}&id=${id}&subname=${subname}&colorname=${colorname}&colorsub=${colorsub}`;
    const filePath = path.join(__dirname, `fbcoverv4_${Date.now()}.jpg`);

    try {
      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: "✅ Here's your customized Facebook cover:",
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