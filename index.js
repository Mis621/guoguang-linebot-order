const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  res.status(200).send('OK');
});

app.post('/order', async (req, res) => {
  const recipients = process.env.LINE_USER_ID_LIST.split(';');
  const { name, phone, address, message } = req.body;

  const fullMessage = `
📦 [新訂單通知]
👤 姓名：${name || '未填寫'}
📞 電話：${phone || '未填寫'}
🏠 地址：${address || '未填寫'}
📝 訂單內容：
${message || '無內容'}
`;

  try {
    for (const userId of recipients) {
      await axios.post('https://api.line.me/v2/bot/message/push', {
        to: userId.trim(),
        messages: [{ type: 'text', text: fullMessage }]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
        }
      });
    }
    res.status(200).send('Messages sent!');
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    res.status(500).send('Failed to send message');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
