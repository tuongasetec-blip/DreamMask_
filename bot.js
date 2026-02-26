const http = require('http');
const mineflayer = require('mineflayer');

http.createServer((req, res) => {
  res.write("Bot is alive!");
  res.end();
}).listen(process.env.PORT || 8080, () => {
  console.log(`HTTP server đang chạy ở port ${process.env.PORT || 8080}`);
});

const CONFIG = {
  host: 'pe.notmc.net',
  port: 25565,
  username: 'DreamMask_',
  version: '1.21.10',
  auth: 'offline',
  serverCommand: '/server earth'
};

// Danh sách username được phép gửi lệnh
const ALLOWED_USERS = ['Hypnos'];

function createBot() {
  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    auth: CONFIG.auth,
    checkTimeoutInterval: 90000,
  });

  let delayLong = false;

  // 1. XỬ LÝ TIN NHẮN CHAT
  bot.on('message', (jsonMsg) => {
    const message = jsonMsg.toString();
    console.log(`[CHAT] ${message}`);

    // Tạo bản tin đã loại bỏ ký tự màu để kiểm tra dễ hơn
    const cleanMessage = message.replace(/§[0-9a-fklmnor]/g, '').toLowerCase();

    // Kiểm tra tin nhắn từ Discord và từ user được phép
    const isFromAllowedUser = ALLOWED_USERS.some(user => message.includes(user));

    // DETECT LỆNH CHAT "offline" - CHỈ từ ALLOWED_USERS
    if (isFromAllowedUser && message.includes('[Discord | Member]') && cleanMessage.includes('offline')) {
      console.log(`[COMMAND] Thấy chat "offline" từ Hypnos → Bot tự disconnect!`);
      delayLong = true;
      bot.quit('Tắt theo lệnh chat từ Hypnos');
      return;
    }

    // Xử lý các lệnh khác từ Discord user được phép
    if (message.includes('[Discord | Member]') && isFromAllowedUser) {
      const msgLower = message.toLowerCase();

      if (msgLower.includes('inv')) {
        setTimeout(() => bot.chat('[inv]'), 2000);
        console.log(`[COMMAND] Nhận lệnh [inv] từ Discord`);
      } 
      else if (msgLower.includes('ping')) {
        setTimeout(() => bot.chat('[ping]'), 2000);
        console.log(`[COMMAND] Nhận lệnh [ping] từ Discord`);
      } 
      else if (msgLower.includes('item')) {
        setTimeout(() => bot.chat('[i]'), 2000);
        console.log(`[COMMAND] Nhận lệnh [i] từ Discord`);
      }
      else if (msgLower.includes('money')) {
        setTimeout(() => bot.chat('[m]'), 2000);
        console.log(`[COMMAND] Nhận lệnh [m] từ Discord`);
      }
    }

    // Tự động quay lại Earth khi bị văng về Lobby
    if (message.toLowerCase().includes('[thông báo]')) {
      console.log(`[SYSTEM] Phát hiện bị văng về Lobby. Đang quay lại Earth...`);
      setTimeout(() => {
        bot.chat(CONFIG.serverCommand);
      }, 5000);
    }

    // Xác nhận đã join Earth và warp afk
    if (cleanMessage.includes('overhaul era')) {
      setTimeout(() => {
        bot.chat('/warp afk');
        console.log(`[LOG] Đã gửi lệnh /warp afk`);
      }, 3000);
    }

    // Check inventory full thì gọi Hypnos
    if (bot.inventory.emptySlotCount() === 0) {
      setTimeout(() => {
        bot.chat('@Hypnos');
        console.log(`[LOG] Inventory full. Đã gọi @Hypnos`);
      }, 1000);
    }
  });

  // 2. LOGIN & CHUYỂN SERVER
  bot.once('spawn', () => {
    console.log(`[LOG] Đã kết nối. Đang đợi 2s để Login...`);
    setTimeout(() => {
      bot.chat('/login hung2312');
      console.log(`[LOG] Đã gửi lệnh Login.`);
      setTimeout(() => {
        bot.chat(CONFIG.serverCommand);
        console.log(`[LOG] Đang chuyển sang Earth... Bot sẽ AFK tại đây.`);
      }, 5000);
    }, 2000);
  });

  // 3. XỬ LÝ DISCONNECT
  bot.on('end', () => {
    bot.removeAllListeners();
    let reconnectDelay = 5000;
    if (delayLong) {
      reconnectDelay = 60000;
      console.log(`[DISCONNECT] Do lệnh chat offline từ Hypnos. Reconnect sau 60 giây...`);
      delayLong = false;
    } else {
      console.log(`[DISCONNECT] Bình thường. Reconnect sau 5 giây...`);
    }
    setTimeout(createBot, reconnectDelay);
  });

  bot.on('error', (err) => console.log(`[ERROR] ${err.message}`));
}

// Khởi chạy Bot
createBot();
