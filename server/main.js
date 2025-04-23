const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8000;
const SAVE_PATH = path.join(__dirname, "../data/");

app.use("/", express.static(path.join(__dirname, "../public/")))


app.listen(PORT, () => {
    console.log(`Server started at "http://localhost:${PORT}"`);
});
