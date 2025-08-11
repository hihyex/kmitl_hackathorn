import express from "express";
import QRCode from "qrcode";

const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

var account = [];

app.get("/", (req, res) => {
    const newAccount = {
      id: account.length,
      amount: 1000000,
      buffer: 0,
    };
    account.push(newAccount);
  res.render("logging.ejs", {
    content: account[account.length - 1],
    id: account.length - 1,
  });
});
app.get("/mainpage/:id", (req, res) => {
    const { id } = req.params;
    console.log("ID", id);
      res.render("index.ejs", {
        content: account[id],
        id: id
      });
})
app.get("/buffer/:id", (req, res) => {
    const { id } = req.params;
    res.render("buffer.ejs", {
      content: account[id],
      id: id
    });
})
app.get("/scan/:id", async (req, res) => {
    const { id } = req.params;
    if (account.length > 1){
      var targetIndex = Math.floor(Math.random() * account.length)
      while(targetIndex == id){
        console.log("LOOP")
        targetIndex = Math.floor(Math.random() * account.length);
      }
      console.log("targetIndex", targetIndex)
      console.log(account[targetIndex].id)
      try {
        const qrCode = await QRCode.toDataURL(account[targetIndex].id.toString(), {
          width: 600,
          margin: 2,
        });
        res.render("scan.ejs", {
          content: account[id],
          qrCodeImg: qrCode,
          target: account[targetIndex].id,
          id: id

        });

      } catch(err) {
        console.error(err)
      }

    } else{
      res.render("scan.ejs", {
        message: "ขออภัยตอนนี้มีผู้ใช้คนเดียว",
        id: id
      });
      console.error("no selected target")
      return;
    }
})
app.get("/transfer/:id", (req, res) => {
  const { id } = req.params;
  const { target } = req.query;
  res.render("transfer.ejs", {
    content: account[id],
    target: target,
    id: id
  })
})
app.get("/success:id", (req, res) => {
  const { id } = req.params;
  res.render("success.ejs", {
    content: account[id],
    id: id
  })
})
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
