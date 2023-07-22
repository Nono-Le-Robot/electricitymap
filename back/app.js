require("./config/db.js");
const bodyParser = require("body-parser");
const express = require("express");
const authRoutes = require("./routes/auth.routes");
const dataRoutes = require("./routes/data.routes");
const app = express();
const cors = require("cors");
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw({ type: "application/octet-stream", limit: "1000mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);

app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});
