const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "fbcover",
  aliases: ["cover"],
  usage: "fbcover <name>|<subname>|<number>|<address>|<email>|<uid>|<color>",
  description: "Generate a Facebook cover using provided information.",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send(
        `✦ Please provide all the required details to generate a Facebook cover.\n\nExample:\nfbcover Mark | Zuckerberg | 12345 | USA | zuck@gmail.com | 10092939929 | Blue`
      );
    }

    const details = args.join(" ").split("|").map((d) => d.trim());
    if (details.length < 7) {
      return send(
        `✦ Invalid format. Make sure to use " | " to separate each field.\n\nExample:\nfbcover Mark | Zuckerberg | 12345 | USA | zuck@gmail.com | 10092939929 | Blue`
      );
    }

    const [name, subname, sdt, address, email, uid, color] = details.map((d) =>
      encodeURIComponent(d)
    );

    const apiUrl = `http://87.106.100.187:6312/canvas/fbcover?name=${name}&subname=${subname}&sdt=${sdt}&address=${address}&email=${email}&uid=${uid}&color=${color}`;

    try {
      const response = await axios.get(apiUrl, { responseType: "stream" });
      const filePath = path.join(__dirname, `fbcover_${Date.now()}.jpg`);
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