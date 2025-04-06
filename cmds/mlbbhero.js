const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  name: 'mlbbhero',
  usage: 'mlbbhero <heroName>',
  description: 'Get information about a Mobile Legends hero.',
  version: '1.0.1',

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg, attachment) =>
      api.sendMessage(
        attachment
          ? { body: msg, attachment }
          : { body: msg },
        threadID,
        messageID
      );

    if (!args.length) {
      return send(
        '✦ Please provide a Mobile Legends hero name.\n\nExample: mlbbhero suyou'
      );
    }

    const heroName = args.join(' ');
    const apiUrl = `https://kaiz-apis.gleeze.com/api/mlbb-heroes?name=${encodeURIComponent(
      heroName
    )}`;

    try {
      const { data } = await axios.get(apiUrl);
      const heroData = data.response;
      if (!heroData) throw new Error('Hero not found');

      const {
        heroName: name,
        alias,
        internalName,
        birthday,
        born,
        gender,
        species,
        affiliation,
        equipment,
        heroNumber,
        releaseDate,
        role,
        specialty,
        price,
        skillResource,
        damageType,
        basicAttackType,
        controlEffects,
        difficulty,
        thumbnail
      } = heroData;

      const info = `
🎮 MLBB Hero Info
🏆 Name: ${name}
🗡 Alias: ${alias}
📛 Internal Name: ${internalName}
🎂 Birthday: ${birthday}
🏞 Born in: ${born}
🚻 Gender: ${gender}
🧬 Species: ${species}
🏛 Affiliation: ${affiliation}
🔱 Equipment: ${equipment}
#️⃣ Hero Number: ${heroNumber}
📅 Release Date: ${releaseDate}
🎭 Role: ${role}
🔥 Specialty: ${specialty}
💰 Price: ${price}
⚡ Skill Resource: ${skillResource}
⚔ Damage Type: ${damageType}
🛡 Basic Attack: ${basicAttackType}
🎮 Control Effects: ${controlEffects}
🎯 Difficulty: ${difficulty}
      `.trim();

      // send text info
      await send(info);

      // send thumbnail if exists
      if (thumbnail) {
        const cacheDir = path.join(__dirname, 'cache');
        await fs.ensureDir(cacheDir);
        const imgPath = path.join(cacheDir, `mlbb_${Date.now()}.jpg`);

        const imgRes = await axios.get(thumbnail, { responseType: 'stream' });
        await new Promise((resolve, reject) => {
          const w = fs.createWriteStream(imgPath);
          imgRes.data.pipe(w);
          w.on('finish', resolve);
          w.on('error', reject);
        });

        await send('', fs.createReadStream(imgPath));
        await fs.unlink(imgPath);
      }
    } catch (err) {
      console.error('MLBB Hero Error:', err);
      send(
        '❌ An error occurred while fetching hero information. Please check the name and try again.'
      );
    }
  }
};