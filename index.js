import express from "express";

const app =express();
const port=3005;

app.set("view engine", "hbs");
app.set("views", "src/views");
app.use(express.static("image"));
app.get("/", (req, res)=>{
    res.render("index");
});

app.listen(port, () =>{
    console.log(`Example app listening on port ${port}`);
});