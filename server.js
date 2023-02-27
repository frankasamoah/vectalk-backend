const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectToDB = require('./data/db')
const { notFound, errorHandler } = require('./middlewares/errorHandling')
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')

dotenv.config()
connectToDB()
const PORT = process.env.PORT || 3001

const app = express();
app.use(express.json());
app.use(cors());


app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
});

const io = require('socket.io')(server, {
  pingTime: 6000,
  cors: {
    origin: "http://localhost:3000"
  }
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

 
  socket.on("setup", (userData) => {
    socket.join(userData._id);
   
    socket.emit("connected");
  
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

socket.on("new message", (newMessageReceived) => {
  let chat = newMessageReceived.chat;

  if (!chat.users) return console.log("User of the chat, not defined");

  chat.users.forEach((user) => {
    if (user._id == newMessageReceived.sender._id) return;

    socket.in(user._id).emit("message received", newMessageReceived);
  });
});

  socket.off("setup", () => {
    console.log("Disconnected");
    socket.leave(userData._id);
  });
});