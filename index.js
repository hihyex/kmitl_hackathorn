import express from "express";
import QRCode from "qrcode";
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

var account = [];

app.get("/", (req, res) => {
  let deviceId = req.cookies.device_id;
  if (!deviceId || isNaN(deviceId)) {
    deviceId = account.length;
    res.cookie("device_id", account.length, {
      maxAge: 1000 * 60 * 10,
      sameSite: "Lax",
    });
    const newAccount = {
      username: account.length,
      amount: 1000000,
      buffer: 0,
    };
    account.push(newAccount);
  }
  const idNum = parseInt(deviceId)
  res.render("index.ejs", {
    content: account[idNum],
    id: idNum
  });
});
app.get("/mainpage/:id", (req, res) => {
    const { id } = req.params;
      res.render("index.ejs", {
        content: account[id]
      });
})
app.get("/buffer/:id", (req, res) => {
    const { id } = req.params;
    res.render("buffer.ejs", {
      content: account[id]
    });
})
app.get("/scan/:id", async (req, res) => {
    const { id } = req.params;
    const text = "GG"
    try {
      const qrCode = await QRCode.toDataURL(text, {
        width: 600,
        margin: 2
    });
      res.render("scan.ejs", {
        qrCodeImg: qrCode
      });
    } catch(err) {
      console.error(err)
    }
})
app.get("/transfer/:id", (req, res) => {
  res.render("transfer.ejs")
})
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
