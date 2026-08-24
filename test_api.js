const axios = require('axios');
async function run() {
  try {
    const res = await axios.get('https://www.trygetseen.com/api/v1/advertiser/screens');
    console.log(JSON.stringify(res.data.data.screens.map(s => s.images).slice(0, 3), null, 2));
  } catch (e) {
    console.error(e.message);
  }
}
run();
