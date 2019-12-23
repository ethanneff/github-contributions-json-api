// libraries
const express = require("express");
const helmet = require("helmet");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const favicon = require("serve-favicon");

// server
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(morgan("tiny"));
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(favicon("favicon.ico"));

// routes
app.get("/", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const activity = {};
  const username = req.query.id || req.query.username;
  if (!username) {
    return res.status(400).json({
      error: "missing github username",
      example:
        "https://github-contributions-json-api.herokuapp.com/?username=gaearon"
    });
  }
  const url = `https://github.com/${username}`;
  const github = await axios.get(url);
  const $ = cheerio.load(github.data);
  $(".day").each((_, element) => {
    const item = $(element);
    const date = item.attr("data-date");
    const count = Number(item.attr("data-count"));
    if (date in activity) {
      activity[date] += count;
    } else {
      activity[date] = count;
    }
  });
  return res.json(activity);
});

// deploy
app.listen(port);
