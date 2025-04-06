const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "fbcoverv6",
  aliases: ["coverv6"],
  usage: "fbcoverv6 <uid>|<name>|<gender>|<birthday>|<love>|<follower>|<location>|<hometown>",
  description: "Generate a Facebook cover with detailed user information.",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send(
        `❌ Please provide all required fields.\n\n` +
        `Usage:\nfbcoverv6 <uid> | <name> | <gender> | <birthday> | <love> | <follower> |<location> | <hometown> \n` +
        `Example:\nfbcoverv6 4 | Mark Zuckerberg |Male|May 14, 1984 | Priscilla Chan | 119009952 |Palo Alto, California | Dobbs Ferry, New York`
      );
    }

    const details = args.join(" ").split("|").map((d) => d.trim());
    if (details.length < 8) {
      return send(
        `❌ Invalid format. Use " | " to separate fields.\n\n` +
        `Example:\nfbcoverv6 4|Mark Zuckerberg|Male|May 14, 1984|Priscilla Chan|119009952|Palo Alto, California|Dobbs Ferry, New York`
      );
    }

    const [uid, name, gender, birthday, love, follower, location, hometown] = details.map(encodeURIComponent);
    const apiUrl = `https://api.zetsu.xyz/canvas/fbcoverv6?uid=${uid}&name=${name}&gender=${gender}&birthday=${birthday}&love=${love}&follower=${follower}&location=${location}&hometown=${hometown}`;
    const filePath = path.join(__dirname, `fbcoverv6_${Date.now()}.jpg`);

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