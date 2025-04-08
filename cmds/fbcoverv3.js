const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "fbcoverv3",
  aliases: ["coverv3"],
  usage: "fbcoverv3 <name>|<uid>|<birthday>|<gender>|<love>|<location>|<hometown>|<followers>",
  description: "Generate a Facebook cover v3 with user details.",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send(
        `❌ Please provide all required fields.\n\nUsage:\nfbcoverv3 <name> | <uid> | <birthday> | <gender> | <love> | <location> | <hometown> |<followers>\nExample:\nfbcoverv3 Mark Zuckerberg | 4 | May 14, 1984 | male |Priscilla Chan | USA |California | 119000000`
      );
    }

    const details = args.join(" ").split("|").map(d => d.trim());
    if (details.length < 8) {
      return send(
        `❌ Invalid format. Use " | " to separate each field.\n\nExample:\nfbcoverv3 Mark Zuckerberg | 4 |May 14, 1984 | male | Priscilla Chan | USA | California | 119000000`
      );
    }

    const [name, uid, birthday, gender, love, location, hometown, followers] = details.map(encodeURIComponent);

    const apiUrl = `http://87.106.100.187:6312/canvas/fbcoverv3?uid=${uid}&birthday=${birthday}&love=${love}&location=${location}&hometown=${hometown}&name=${name}&follow=${followers}&gender=${gender}`;
    const filePath = path.join(__dirname, `fbcoverv3_${Date.now()}.jpg`);

    try {
      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: "✅ Here's your Facebook cover (v3):",
          attachment: fs.createReadStream(filePath),
        }, threadID, () => fs.unlinkSync(filePath), messageID);
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