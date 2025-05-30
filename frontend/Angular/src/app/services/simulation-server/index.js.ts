// index.js
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: '*' }
});

// In-memory map of ride rooms → simulation state
const sims = {};

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  // 1) Join a room: driver and customer will both call this
  socket.on('joinRoom', ({ driver, customer }) => {
    const room = `ride:${driver}:${customer}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined ${room}`);

    // If there's already state, sync it immediately
    if (sims[room]) {
      socket.emit('syncState', sims[room]);
    }
  });

  // 2) Start simulation
  socket.on('startSimulation', ({ driver, customer, path, realDuration }) => {
    const room = `ride:${driver}:${customer}`;
    sims[room] = {
      path,
      realDuration,
      startTimeMs: Date.now(),
      paused: false,
      pauseAtMs: 0,
      speedFactor: 1
    };
    io.to(room).emit('syncState', sims[room]);
  });

  // 3) Pause
  socket.on('pauseSimulation', ({ driver, customer }) => {
    const room = `ride:${driver}:${customer}`;
    const sim = sims[room];
    if (!sim || sim.paused) return;
    sim.pauseAtMs = Date.now();
    sim.paused = true;
    io.to(room).emit('syncState', sim);
  });

  // 4) Resume
  socket.on('resumeSimulation', ({ driver, customer }) => {
    const room = `ride:${driver}:${customer}`;
    const sim = sims[room];
    if (!sim || !sim.paused) return;
    const now = Date.now();
    sim.startTimeMs += now - sim.pauseAtMs;
    sim.paused = false;
    io.to(room).emit('syncState', sim);
  });

  // 5) Change speed
  socket.on('setSpeedFactor', ({ driver, customer, speedFactor }) => {
    const room = `ride:${driver}:${customer}`;
    const sim = sims[room];
    if (!sim) return;
    // adjust startTime so position remains consistent
    const now = Date.now();
    const elapsedRealMs = (now - sim.startTimeMs) * sim.speedFactor;
    sim.startTimeMs = now - elapsedRealMs / speedFactor;
    sim.speedFactor = speedFactor;
    io.to(room).emit('syncState', sim);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(3000, () => console.log('Socket.IO server listening on :3000'));
