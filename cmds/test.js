const axios = require("axios");

const serverUrls = {
  server1: 'https://server1-u9fw.onrender.com',
  server2: 'https://server-2-aggj.onrender.com',
  server3: 'https://server-3-p6lg.onrender.com'
};

module.exports = {
  name: "test",
  aliases: ["autoboost"],
  usage: "boost <cookie> | <post_url> | <amount> | <interval_seconds> | <server1/server2/server3>",
  description: "Boost Facebook post shares using specified server.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send("Usage:\nboost <cookie> | <post_url> | <amount> | <interval_seconds> | <server1/server2/server3>");
    }

    const [cookie, url, amount, interval, serverKey] = args.join(" ").split("|").map(i => i.trim());

    if (!cookie || !url || !amount || !interval || !serverKey) {
      return send("❌ Missing input.\nUsage:\nboost <cookie> | <post_url> | <amount> | <interval_seconds> | <server>");
    }

    if (!serverUrls[serverKey]) {
      return send(`❌ Invalid server. Available: server1, server2, server3`);
    }

    send(`⏳ Boosting post...\nPost: ${url}\nAmount: ${amount}\nInterval: ${interval}s\nServer: ${serverKey}`);

    try {
      const res = await axios.post(`${serverUrls[serverKey]}/api/submit`, {
        cookie,
        url,
        amount: parseInt(amount),
        interval: parseInt(interval)
      }, {
        headers: { "Content-Type": "application/json" }
      });

      const data = res.data;

      if (data.status === 200) {
        send(`✅ Success:\n${data.message || "Boost submitted successfully!"}`);
      } else {
        send(`⚠️ Failed:\n${data.message || "Unknown error."}`);
      }
    } catch (err) {
      console.error("Boost error:", err.response?.data || err.message);
      send("❌ Error submitting boost. Please check your inputs or try again later.");
    }
  },
};