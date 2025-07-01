const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const ngrok = require('@ngrok/ngrok');
const User = require('./tables/user');
const Group = require('./tables/groups');
const { hashPassword } = require('./utils/auth');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app   = express();
const srv   = http.createServer(app);

const io = new Server(srv, {
cors: { origin: process.env.WEBSITENAME, methods: ['GET', 'POST'], credentials: true }
});

// ---------- middleware ----------
app.use(express.json());

const allowedOrigins = [process.env.WEBSITENAME];
app.use(cors({
origin: (o, cb) => (!o || allowedOrigins.includes(o) ? cb(null, true) : cb(new Error('CORS'))),
credentials: true
}));

// ---------- minimal route ----------
// app.post('/api/login', (req, res) => {
// const { username, password } = req.body;
// res.json(username && password
//   ? { success: true, username, availableGroups: ['Alpha', 'Bravo', 'Charlie'] }
//   : { success: false });
// });

const path = require('path');
app.use(express.static(path.join(__dirname, 'public'),
  {index: 'welcome.html'}));

// ---------- sockets ----------
io.on('connection', s => console.log('socket', s.id));


async function startServer() {
  try {
      await mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 20 });
      console.log('✅ MongoDB connected');

      // Create host group if not exists
      const groupName = 'The Dealer';
      let group = await Group.findOne({ groupName });
      if (!group) {
      group = await Group.create({ groupName, points: 0 });
      console.log('✅ Group created:', group);
      } else {
      console.log('ℹ️ Group already exists:', groupName);
      }

      // Create host user if not exists
      const existingHost = await User.findOne({ username: process.env.HOSTUSERNAME });
      if (!existingHost) {
      await User.create({
          username: process.env.HOSTUSERNAME,
          displayName: process.env.HOSTDISPLAYNAME,
          userType: 1,
          passwordHash: await hashPassword(process.env.HOSTPASSWORD),
          groupId: group._id,
      });
      console.log('✅ Host user created');
      } else {
      console.log('ℹ️ Host user already exists');
      }
      srv.listen(PORT, async () => {
      console.log(`🚀 House on http://localhost:${PORT}`);

      if (process.env.USE_NGROK === 'true') {
        try {
          const listener = await ngrok.forward({
            addr: PORT,
            authtoken: process.env.NGROK_AUTHTOKEN, // omit if already authed globally
            region: 'us'
          });
          const url = listener.url();
          console.log(`🌐 Public tunnel → ${url}`);

          // optional helper so the table can fetch the URL
          app.get('/ngrok-url', (_, r) => r.json({ url }));
        } catch (e) {
          console.error('❌ ngrok tunnel failed:', e.message || e);
        }
      }});
      } catch (err) {
        console.error('❌ Startup error:', err);
        process.exit(1);
      }
}
startServer();