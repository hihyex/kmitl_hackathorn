import express from "express";

const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
var account = [];
var lastPerson = 0;
app.get("/", (req, res) => {
  const newAccount = {
    username: lastPerson,
    amount: 1000000,
    buffer: 0
  };
  account.push(newAccount);
  res.render("index.ejs", {
    content: account[lastPerson++]
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
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
