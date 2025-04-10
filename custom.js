const cron = require('node-cron');

const scheduleTasks = (ownerID, api, config = { autoRestart: true, autoGreet: false }) => {
    console.log("✅ Auto-restart and auto-greet scheduler initialized.");

    // 📌 Auto-Restart at 6AM, 12PM, 6PM, 12AM
    if (config.autoRestart) {
        const restartTimes = ['0 6 * * *', '0 12 * * *', '0 18 * * *', '0 0 * * *'];

        restartTimes.forEach(time => {
            cron.schedule(time, () => {
                api.sendMessage("🔄 Bot is restarting automatically...", ownerID, () => {
                    console.log(`🔄 Scheduled restart at ${time}`);
                    process.exit(1);
                });
            }, { timezone: "Asia/Manila" }); // Change timezone as needed
        });

        console.log("✅ Auto-restart scheduler started.");
    } else {
        console.log("❌ Auto-restart is disabled.");
    }

        // Function to send greetings
        greetings.forEach(greet => {
            cron.schedule(greet.cronTime, () => {
                const message = greet.messages.join('\n');
                api.getThreadList(10, null, ["INBOX"], (err, threads) => {
                    if (err) return console.error("❌ Error fetching thread list:", err);
                    threads.forEach(thread => {
                        api.sendMessage(message, thread.threadID);
                    });
                });
                console.log(`📢 Sent scheduled message: ${message}`);
            }, { timezone: "Asia/Manila" });
        });

        console.log("✅ Auto-greet messages scheduled.");
    } else {
        console.log("❌ Auto-greet is disabled.");
    }
};

module.exports = scheduleTasks;