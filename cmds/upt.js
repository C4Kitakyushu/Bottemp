const os = require("os");
const pidusage = require("pidusage");

module.exports = {
  name: "uptime",
  usage: "uptime",
  description: "Displays bot uptime and system information.",
  version: "1.0.2",

  execute: async ({ api, event }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    const byte2mb = (bytes) => {
      const units = ["Bytes", "KB", "MB", "GB", "TB"];
      let l = 0,
        n = parseInt(bytes, 10) || 0;
      while (n >= 1024 && ++l) n = n / 1024;
      return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
    };

    const getUptime = () => {
      const seconds = process.uptime();
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `${days} day(s), ${hours} hour(s), ${minutes} minute(s), ${secs} second(s)`;
    };

    try {
      const usage = await pidusage(process.pid);
      const ping = Date.now();

      const msg = `
⏱ Bot Uptime: ${getUptime()}
❖ CPU Usage: ${usage.cpu.toFixed(1)}%
❖ RAM Usage: ${byte2mb(usage.memory)}
❖ CPU Cores: ${os.cpus().length}
❖ Ping: ${Date.now() - ping}ms
❖ OS Platform: ${os.platform()}
❖ CPU Architecture: ${os.arch()}
      `.trim();

      return send(msg);
    } catch (err) {
      console.error("Uptime command error:", err);
      return send("❌ Failed to fetch uptime info.");
    }
  },
};