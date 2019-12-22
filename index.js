const express = require("express");
const helmet = require("helmet");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(morgan("tiny"));
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes
app.get("/", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const activity = {};
  const username = req.query.id || req.query.username;
  if (!username) {
    return res
      .status(400)
      .json({ error: "missing github username", example: "?username=gaearon" });
  }
  const url = `https://github.com/${username}`;
  const github = await axios.get(url);
  const $ = cheerio.load(github.data);
  $(".day").each((_, element) => {
    const item = $(element);
    const date = item.attr("data-date") || "";
    const unix = new Date(date).valueOf();
    const count = Number(item.attr("data-count"));
    activity[unix] = count;
  });
  return res.json(activity);
});

// server
app.listen(port);
