const axios = require("axios");

module.exports = {
  name: "fbcreate",
  aliases: ["fbaccount", "createfb"],
  usage: "createfb",
  description: "Create a Facebook account (experimental/untested)",
  version: "1.0.0",
  cooldowns: 600, // 10 minutes in seconds

  execute: async ({ api, event }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    api.setMessageReaction("⏳", messageID, () => {}, true);
    send(`Creating & Generating Facebook Acc...\n⏳ Please wait...`);

    try {
      const res = await axios.get("http://naurwiegine.pythonanywhere.com/fbacc");
      const { birthday, email, first_name, last_name, password, status, token } = res.data;

      api.setMessageReaction("✅", messageID, () => {}, true);

      const output = `
✨ Facebook Account ✨

✅ Created Info: ${status}

Birthday: ${birthday}
Email: ${email}
Name: ${first_name} ${last_name}
Password: ${password}
Access Token: ${token}
      \n\n⚠️: It would be better if a new email was created for you to access.`.trim();

      return send(output);
    } catch (err) {
      console.error(err);
      api.setMessageReaction("🤷", messageID, () => {}, true);
      return send("An error occurred. The server may be limited. Please try again later.");
    }
  },
};