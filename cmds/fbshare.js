const axios = require("axios");

const serverUrls = {
  server1: 'https://putanginamo-bogart-1.onrender.com',
  server2: 'https://putanginamo-bogart-2.onrender.com',
  server3: 'https://putanginamo-bogart-3.onrender.com'
};

module.exports = {
  name: "fbshare",
  aliases: ["autoboost"],
  usage: "fbshare fbstate | post_url | amount | interval_seconds | choose server server1/server2/server3",
  description: "Boost Facebook post shares using specified server.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send("Usage example:\nfbshare fbstate | post_url | amount | delay | choose server: server1/server2/server3");
    }

    const [cookie, url, amount, interval, serverKey] = args.join(" ").split("|").map(i => i.trim());

    if (!cookie || !url || !amount || !interval || !serverKey) {
      return send("❌ Missing input.\nUsage:\nfbshare fbstate | post_url | amount | delay | server");
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
