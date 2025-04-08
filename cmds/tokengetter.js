const axios = require("axios");

module.exports = {
  name: "test",
  aliases: ["tokeninfo"],
  usage: "gettoken <username | password>",
  description: "Fetch session information using username and password from Hazeyyy API.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    const input = args.join(" ");
    const [username, password] = input.split("|").map((x) => x.trim());

    if (!username || !password) {
      return send("❌ Please provide a username and password.\nUsage: gettoken username | password");
    }

    const apiUrl = `https://hazeyyyy-rest-apis.onrender.com/api/token?username=${username}&password=${password}`;

    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (data?.status && data?.session_key) {
        const result = `
✅ Session Retrieved Successfully!

- Username: ${data.uid}
- Session Key: ${data.session_key}
- Access Token: ${data.access_token}
- Machine ID: ${data.machine_id}

Use this info responsibly.
        `.trim();

        send(result);
      } else {
        send("❌ Failed to retrieve session data. Please check your credentials.");
      }
    } catch (err) {
      console.error("API error:", err.message);
      send("❌ An error occurred while retrieving the session data.");
    }
  },
};