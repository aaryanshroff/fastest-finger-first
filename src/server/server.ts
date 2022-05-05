import * as express from "express";
import * as path from "path";
import * as http from "http";
import { v4 as uuidv4 } from "uuid";
import { Server } from "socket.io";
import { IRTCIceCandidateData, IRTCSessionData } from "./types";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4001;

const io = new Server(server);
let rooms = {};

const randomLetter = () => {
  const letters = "ABCDEFGHIKLMNOPQRSTUVWXY";
  return letters.charAt(Math.random() * letters.length);
};

io.on("connection", (socket) => {
  // WebRTC relay functions
  // [ Emit received data to other participants in the room ]
  socket.on("create or join", (roomID) => {
    console.log(`${socket.id} wants to create or join room ${roomID}`);
    const room = io.of("/").adapter.rooms.get(roomID);
    // Allow no more than 2 people in a room
    if (room && room.size === 2) {
      socket.emit("error", {
        message: "Room is full",
      });
      return;
    }
    socket.join(roomID);
    socket.to(roomID).emit("other user");
  });

  socket.on("offer", (data: IRTCSessionData) => {
    console.log(`${socket.id} is making an offer to their room`);
    socket.to(data.roomID).emit("offer", data);
  });

  socket.on("answer", (data: IRTCSessionData) => {
    console.log(`${socket.id} is answering their offer`);
    socket.to(data.roomID).emit("answer", data);
  });

  socket.on("ice candidate", (data: IRTCIceCandidateData) => {
    socket.to(data.roomID).emit("ice candidate", data);
  });

  // Game functions
  socket.on("correct answer", (roomID: string) => {
    console.log(`${socket.id} answered corrected`);
    io.to(roomID).emit("new prompt", {
      letter: randomLetter(),
      answerer: socket.id,
    });
  });

  socket.on("ready", (roomID: string) => {
    io.to(roomID).emit("new prompt", {
      letter: randomLetter(),
      answerer: "",
    });
  });
});

const router = express.Router();

router.get("/:room", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// Redirect all GET requests to / to a random room
router.get("/", (req, res) => {
  const room = uuidv4();
  res.redirect(`/${room}`);
});

app.use("/", router);
app.use(express.static("public"));

server.listen(port, () => console.log(`Server listening on port ${port}`));
