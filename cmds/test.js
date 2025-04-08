const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  name: "testing",
  usage: "createcmd <api_url>",
  description: "Auto-generate a command based on provided API URL.",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    const apiUrlInput = args[0];
    if (!apiUrlInput || !apiUrlInput.includes("?")) {
      return send("❌ Please provide a valid API URL.");
    }

    try {
      const baseUrl = apiUrlInput.split("?")[0];
      const name = baseUrl.split("/").pop();
      const cmdName = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

      const commandContent = `const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "${cmdName}",
  usage: "${cmdName} [optional prompt] (reply to an image)",
  description: "AI image generator using ${cmdName} API.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID, messageReply } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!messageReply?.attachments?.[0]?.url) {
      return send("❌ Please reply to an image to apply the AI effect.");
    }

    const imageUrl = messageReply.attachments[0].url;
    const prompt = args.join(" ").trim() || "";
    const apiUrl = \`${apiUrlInput}&imageUrl=\${encodeURIComponent(imageUrl)}&prompt=\${encodeURIComponent(prompt)}\`;

    const cacheDir = path.join(__dirname, "cache");
    const outputPath = path.join(cacheDir, `${cmdName}_\${Date.now()}.jpg`);

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
      send("❌ Failed to process the image. Please try again later.");
    }
  },
};`;

      const commandPath = path.join(__dirname, `${cmdName}.js`);
      await fs.outputFile(commandPath, commandContent);
      send(`✅ Command file '${cmdName}.js' created successfully.`);
    } catch (err) {
      console.error("Command creation error:", err);
      send("❌ Failed to create command file.");
    }
  },
};

