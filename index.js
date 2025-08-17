import express from "express";
import QRCode from "qrcode";
import { Mutex, Semaphore, withTimeout } from "async-mutex";
const app = express();
const port = process.env.PORT || 3000;
const mutex = new Mutex();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
var account = [{
  id: 1,
  amount: 1000000,
  bufferAmount: 0,
  buffer: [],
  cfr: false,
  username: "Admin"
}];
var whiteList = [];
var lastId = 2;
var buf = 1;
var usernameList = ["Admin"];
var bufId = 0;
setInterval(async () => {
  const now = Date.now()
  for (var i = 0; i < account.length; i++) {
    const self = account[i];
    const dueItems = self.buffer.filter((item) => {
      return now >=item.dueSec && item.status === "pending"
    })
    if (dueItems.length === 0 ) continue;
    await mutex.runExclusive(async () => {
      for(const item of dueItems){
        var b = Number(item.amount);
        if (item.next === "abort") {
          item.status = "abort";
          if (item.type === "in") {
            self.bufferAmount -= b;
          } else {
            self.amount += b;
          }
        } else {
          item.status = "success";
          if (item.type == "in") {
            self.bufferAmount -= b;
            self.amount += b;
          }
        }
      }
    });
  }
}, 1000);

app.get("/", (req, res) => {
  res.render("logging.ejs");
});
app.post("/mainpage", (req, res) => {
  const username = req.body.username;
  const cfr = (req.body.cfr === "true");
  const isWhiteList = req.body.whiteList;
  var index = usernameList.findIndex((item) => item === username)
  if (index === -1){
    const now = new Date();
    now.setTime(now.getTime() + 10 * 1000);
    const newAccount = {
      id: lastId,
      amount: 1000000,
      bufferAmount: 0,
      buffer: [],
      cfr: cfr,
      username: username,
    };
    if (isWhiteList === "true"){
      whiteList.push(lastId)
    }
    usernameList.push(username);
    account.push(newAccount);
    index = lastId - 1
  }
  res.render("index.ejs", {
    content: account[index],
    id: index + 1
  });

  lastId++;
})
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
    content: account[id - 1],
    id: id
  });
});
app.get("/scan/:id", async (req, res) => {
  const { id } = req.params;
    var target = Math.floor(Math.random() * account.length) + 1;
    while (target == id) {
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
        usernameList: usernameList,
        id: id,
      });
    } catch (err) {
      console.error(err);
    }
});
app.get("/transfer/:id", (req, res) => {
  const { id } = req.params;
  const { target } = req.query;
  const { process } = req.query;
  var cfr = false;
  if (account[target - 1]){
    cfr = account[target - 1].cfr;
  }
  var targetName = "";
  if (!isNaN(target)) targetName = account[target - 1].username;
  res.render("transfer.ejs", {
    content: account[id - 1],
    cfr: cfr,
    target: target,
    targetName: targetName,
    id: id,
    whiteList: whiteList.includes(target),
    process: process,
    usernameList: usernameList,
  });
});
app.get("/success/:id", async (req, res) => {
  const { id } = req.params;
  const { target } = req.query;
  const { buffer } = req.query;
  const  amount  = Number(req.query.amount);
  const { forced } = req.query;
  await mutex.runExclusive(async () => {
    if (buffer === "false") {
      account[id - 1].amount -= amount;
      account[target - 1] .amount += amount
    }
    else{
      const now = new Date();
      now.setTime(now.getTime() + 20 * 1000);
      account[id - 1].amount -= amount;
      account[target - 1].bufferAmount += amount;
      var next = (buf % 5 === 0) ? "abort" : "success";
      account[id - 1].buffer.push({
        type: "out",
        amount: amount,
        to: target,
        username: account[target - 1].username,
        time: new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
        due: now.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
        dueSec: Date.now() + 10 * 1000,
        status: "pending",
        forced: forced,
        next: next,
        bufferId: bufId
      });
      buf++;
      account[target - 1].buffer.push({
        type: "in",
        amount: amount,
        from: id,
        username: account[target - 1].username,
        time: new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
        due: now.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
        dueSec: Date.now() + 10 * 1000,
        status: "pending",
        forced: forced,
        next: next,
        bufferId: bufId
      });
      bufId++;
    }
  })
  res.render("success.ejs", {
    content: account[id - 1],
    id: id,
  });
});
app.get("/buffer/:id/:index", (req, res) =>{
  const { id } = req.params;
  const { index } = req.params;
  res.render("bufferDetail.ejs", {
    content: account[id - 1],
    id: id,
    index: index
  })
})
app.get('/amount/:id', (req, res) =>{
  const { id } = req.params;
  res.json({amount: account[id - 1].amount})
})
app.patch("/update/:id/:index", async(req, res) => {
  const { id, index } = req.params;
  const amount = account[id - 1].buffer[index].amount;
  const response = req.body;
  const bufferId = response.bufferId;
  const targetAccount = account[response.targetId - 1];
  await mutex.runExclusive(async () => {
    account[id - 1].buffer[index].status = "success";
    targetAccount.buffer[bufferId].status = "success";
    targetAccount.amount += amount;
    targetAccount.buffer[bufferId].bufferAmount -= amount;
  });
  res.json({ success: true });
})
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});