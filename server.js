import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/obtenerCalculoMr360",(req,res) => {
    res.json({"users": ["userOne", "UserTwo", "UserThree"]})
})


app.listen(5000, () => {console.log("Server runing...")})