import e from "express";
import express from "express";
import QRCode from "qrcode";

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

var account = [];
var whiteList = [];
var lastId = 1;
setInterval(() => {
  const now = new Date().toISOString();
  for(var i=0; i<account.length; i++){
    const self = account[i];
    for(var j=0; j<self.buffer.length; j++){
      if (now >= self.buffer[j].due && self.buffer[j].status == "pending"){
        self.buffer[j].status = "success";
        if (self.buffer[j].type == "in"){
          self.bufferAmount -= self.buffer[j].amount;
          self.amount += self.buffer[j].amount;
        }
      }
    }
  }
}, 500);
app.get("/", (req, res) => {
  const cfr = lastId % 3 === 0 ? true : false;
  const now = new Date();
  now.setTime(now.getTime() + 10 * 1000);
  const newAccount = {
    id: lastId,
    amount: 1000000,
    bufferAmount: 500,
    buffer: [
      {
        type: "out",
        amount: 300,
        to: 0,
        time: new Date().toISOString(),
        due: now.toISOString(),
        status: "pending",
      },
      {
        type: "in",
        amount: 500,
        from: 0,
        time: new Date().toISOString(),
        due: now.toISOString(),
        status: "pending",
      },
      {
        type: "in",
        amount: 500,
        from: 0,
        time: new Date().toISOString(),
        due: now.toISOString(),
        status: "abort",
      },
      {
        type: "out",
        amount: 300,
        to: 0,
        time: new Date().toISOString(),
        due: now.toISOString(),
        status: "success",
      },
      {
        type: "out",
        amount: 300,
        to: 0,
        time: new Date().toISOString(),
        due: now.toISOString(),
        status: "pending",
      },
      {
        type: "out",
        amount: 300,
        to: 0,
        time: new Date().toISOString(),
        due: now.toISOString(),
        status: "success",
      },
    ],
    cfr: cfr,
  };
  if (lastId % 3 === 1){
    whiteList.push(lastId)
  }
  account.push(newAccount);
  res.render("logging.ejs", {
    content: newAccount,
    id: lastId,
  });
  lastId++;
});
app.get("/mainpage/:id", (req, res) => {
  const { id } = req.params;
  res.render("index.ejs", {
    content: account[id-1],
    id: id,
  });
});
app.get("/buffer/:id", (req, res) => {
  const { id } = req.params;
  res.render("buffer.ejs", {
    content: account[id-1],
    id: id
  });
});
app.get("/scan/:id", async (req, res) => {
  const { id } = req.params;
  if (account.length > 1) {
    var target = Math.floor(Math.random() * account.length) + 1;
    while (targetIndex == id) {
      target = Math.floor(Math.random() * account.length) + 1;
    }
    try {
      const qrCode = await QRCode.toDataURL(
        account[target - 1].id.toString(),
        {
          width: 600,
          margin: 2,
        }
      );
      res.render("scan.ejs", {
        content: account[id - 1],
        qrCodeImg: qrCode,
        target: account[target - 1].id,
        id: id,
      });
    } catch (err) {
      console.error(err);
    }
  } else {
    res.render("scan.ejs", {
      message: "ขออภัยตอนนี้มีผู้ใช้คนเดียว",
      id: id,
    });
    console.error("no selected target");
    return;
  }
});
app.get("/transfer/:id", (req, res) => {
  const { id } = req.params;
  const { target } = req.query;
  const { process } = req.query;
  res.render("transfer.ejs", {
    content: account[id - 1],
    target: target,
    id: id,
    whiteList: whiteList.includes(target),
    process: process
  });
});
app.get("/success/:id", (req, res) => {
  const { id } = req.params;
  const { target } = req.query;
  const { amount } = req.query;
  const { buffer } = req.query;
  if (!buffer) {
    account[id - 1].amount -= amount;
    account[target - 1] .amount += amount
  }
  else{
    const now = new Date();
    now.setTime(now.getTime() + 10 * 1000);
    account[id - 1].amount -= amount;
    account[target - 1].bufferAmount += amount;
    account[id - 1].buffer.push({
      type: "out",
      amount: amount,
      to: target,
      time: new Date().toISOString(),
      due: now.toISOString(),
      status: "pending"
    })
    account[target - 1].buffer.push({
      type: "in",
      amount: amount,
      from: id,
      time: new Date().toISOString(),
      due: now.toISOString(),
      status: "pending"
    })
  }
  res.render("success.ejs", {
    content: account[id - 1],
    id: id,
  });
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
