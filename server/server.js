import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket.js';
import Project from './models/Project.js';
import User from './models/User.js';
import { seedDatabase } from './scripts/seed.js';

dotenv.config();

const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // Auto-seed if database has no projects or users yet
    const projectCount = await Project.countDocuments();
    const userCount = await User.countDocuments();
    if (projectCount === 0 || userCount === 0) {
      console.log('[Server] Database needs initialization. Auto-seeding initial projects, users, and tasks...');
      await seedDatabase(false);
    }

    // 2. Create HTTP Server
    const httpServer = http.createServer(app);


    // 3. Initialize Socket.io
    initSocket(httpServer, CLIENT_URL);

    // 4. Start Listening
    httpServer.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`US-CODED Application Server`);
      console.log(`Tagline: Think Ahead. Build Smarter.`);
      console.log(`Status: Running on http://localhost:${PORT}`);
      console.log(`Socket.io: Enabled for origin ${CLIENT_URL}`);
      console.log(`Phase: 1 (Core Non-AI Foundation)`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('[Server Startup Failure]:', error.message);
    process.exit(1);
  }
};

startServer();
