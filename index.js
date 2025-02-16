// Study notes

// init everything

import express from "express";
const app = express();
const port = process.env.PROJECT_PORT;

import markdownit from "markdown-it";
const md = markdownit();
import { readFileSync } from "fs";
import fs from "fs";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

import bodyParser from "body-parser";

app.use(express.static("public"));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// load list of available md files

let completeIndex = JSON.parse(readFileSync(`public/index.json`, "utf-8"));
console.log("Loaded completeIndex");
let keys = Object.keys(completeIndex);

// create list off links from json file

let completeTopics = [];

for (let i = 0; i < keys.length; i++) {
  let currentTopic = completeIndex[keys[i]];
  completeTopics.push(`<h4>${keys[i]}</h4>`);
  for (let x = 0; x < currentTopic.length; x++) {
    completeTopics.push(
      `<a href="view?file=${currentTopic[x]}">${currentTopic[x]}.md</a><br>`
    );
  }
}

completeTopics = completeTopics.join("");

function timestamp() {
  return new Date(Date.now()).toLocaleString();
}

app.get("/", (req, res) => {
  res.render("home.ejs", { data: completeTopics });
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/download-:filename", function (req, res) {
  // handles file downloads
  let fileName = req.params.filename;
  try {
    let file = `${__dirname}/public/md/${fileName}`;
    console.log(`${timestamp()}: DOWNLOADING ${fileName}`);
    res.download(file);
  } catch (error) {
    console.log(
      `${timestamp()}: Attempted downloading nonexistent file ${fileName}`
    );
  }
});

app.get("/view", (req, res) => {
  let fileName = req.query.file;
  let pageStyle = req.query.style;

  console.log(
    `${timestamp()}: requested file ${fileName} with style ${pageStyle}`
  );

  const availableStyles = ["light", "book", "tty", "dark"];

  // if no specific style was requested / if a bad style was requested then set it to light theme
  if (pageStyle === undefined || !availableStyles.includes(pageStyle)) {
    pageStyle = "light";
  }

  // attempt loading markdown file, convert to markdown, finally serve page
  try {
    let document = readFileSync(`public/md/${fileName}.md`, "utf-8");
    let result = md.render(document);
    // add requested style to response object
    let bakedPage = {
      style: pageStyle,
      title: fileName,
      page: Buffer.from(result),
    };
    res.render("detail.ejs", { data: bakedPage });
  } catch (error) {
    console.log(
      `${timestamp()}: Attempted opening nonexistent file ${fileName}`
    );
    //console.log(error)
    res.send("Questo file non esiste.");
  }
});

app.listen(port, () => {
  if (process.env.NODE_ENV === "production") {
    console.log("SMILE! you're in production");
  }
  console.log(`MD STUDY NOTES is listening on port ${port}`);
});
