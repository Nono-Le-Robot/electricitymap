require("./config/db.js");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const express = require("express");
const authRoutes = require("./routes/auth.routes");
const dataRoutes = require("./routes/data.routes");
const pointReportRoutes = require("./routes/reportPoint.routes");

const app = express();
const cors = require("cors");
app.use(cors());

app.use(cookieParser());
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw({ type: "application/octet-stream", limit: "1000mb" }));


app.use("/backend/api/auth", authRoutes);
app.use("/backend/api/data", dataRoutes);
app.use("/backend/api/report", pointReportRoutes);

app.listen(process.env.PORT, () => {
  console.log(`API server listening on port ${process.env.PORT}`);
});
