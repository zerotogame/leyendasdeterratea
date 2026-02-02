const express = require("express");
const http = require("http");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { Server } = require("socket.io");
const { users, characters } = require("./data");
const { auth, SECRET } = require("./auth");
const { getCharacter,getCharacters } = require("./db/character_db");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

/* LOGIN */
/*app.post("/login", (req, res) => {
  const user = users.find(u => u.email === req.body.email);
  if (!user) return res.sendStatus(401);

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET
  );

  res.json({ token });
});
*/

app.post("/login", (req, res) => {
  return res.json({ token: jwt.sign(
    { id: 1, role: "MASTER" },
    SECRET
  )});
});

/* GET CHARACTER */
app.get("/characters/:id", async (req, res) => {
  const char = await getCharacter(req.params.id);
  res.json(char);
});

app.get("/characters", async (req, res) => {
  //Añadir logs
  console.log("Fetching all characters");

  const chars = await getCharacters();
  
  res.json(chars);
});

/* SOCKET AUTH */
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    socket.user = jwt.verify(token, SECRET);
    next();
  } catch {
    next(new Error("unauthorized"));
  }
});

/* SOCKET EVENTS */
io.on("connection", socket => {
  socket.on("update-attribute", ({ charId, attr, value }) => {
    const char = characters.find(c => c.id === charId);

    const isOwner = char.ownerId === socket.user.id;
    const isMaster = socket.user.role === "MASTER";

    if (!isOwner && !isMaster) return;

    char.attributes[attr] = value;

    io.emit("character-updated", char);
  });
});

server.listen(3000, () =>
  console.log("Backend en http://localhost:3000")
);
