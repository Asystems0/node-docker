const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
let RedisStore = require("connect-redis")(session);

// redis@v4
const { createClient } = require("redis");

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  // SESSION_SECRET,
} = require("./config/config");

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

//Mongo connect
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

// Try reconnect to Mongo if it's fail
const connectRetry = () => {
  mongoose
    .connect(mongoURL)
    .then(() => console.log("Successfully connectd to DB"))
    .catch((e) => {
      console.log(e);
      setTimeout(connectRetry, 5000);
    });
};
connectRetry();

//Redis connect
let redisClient = createClient({
  url: `redis://${REDIS_URL}:${REDIS_PORT}`,
  legacyMode: true,
});
redisClient.connect().catch(console.error);

app.enable("trust proxy");
app.use(cors({}));

// Use session
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: `${process.env.SESSION_SECRET}`,
    cookie: {
      resave: false,
      saveUninitialized: false,
      secure: false, // if true only transmit cookie over https
      httpOnly: false, // if true prevent client side JS from reading the cookie
      maxAge: 30000, // session max age in miliseconds
    },
  })
);

app.use(express.json());

app.get("/api/", (req, res) => {
  res.send("<h2>Hello to EC2</h2>");
});

app.get("/api/v1", (req, res) => {
  res.send("<h2>Hello World!!!</h2>");
  console.log("Yeah it ran!");
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

app.listen(PORT, () => {
  console.log(`App runnning in: http://localhost:${PORT}`);
});
