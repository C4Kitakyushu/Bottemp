const axios = require("axios");

module.exports = {
  name: "testing",
  description: "Automatically generate command from image transformation API URL.",
  usage: "createcmd <api_url_with_prompt_param>",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send("❌ Please provide the API URL.");
    }

    const apiUrl = args[0];
    const commandName = apiUrl.split("/").pop().split("?")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    const content = `
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "${commandName}",
  aliases: ["${commandName}ify"],
  usage: "${commandName} [optional prompt] (reply to an image)",
  description: "Transform an image using ${commandName} API. Optionally add a prompt.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image.");
    }

    const imageUrl = messageReply.attachments[0].url;
    const prompt = args.join(" ").trim() || "";
    const apiUrl = \`${apiUrl}&imageUrl=\${encodeURIComponent(imageUrl)}&prompt=\${encodeURIComponent(prompt)}\`;

    const cacheDir = path.join(__dirname, "cache");
    const outputPath = path.join(cacheDir, `${commandName}_\${Date.now()}.jpg`);

    try {
      await fs.ensureDir(cacheDir);
      send("✨ Processing image, please wait...");

      const response = await axios.get(apiUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          { attachment: fs.createReadStream(outputPath) },
          threadID,
          () => fs.unlinkSync(outputPath),
          messageID
        );
      });

      writer.on("error", (err) => {
        console.error("File write error:", err);
        send("❌ Failed to save the image.");
      });
    } catch (err) {
      console.error("API error:", err.message);
      send("❌ Failed to process the image.");
    }
  },
};
    `.trim();

    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, `${commandName}.js`);
    fs.writeFileSync(filePath, content);

    send(`✅ Command created: ${commandName}.js`);
  },
};
