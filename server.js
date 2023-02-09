import express from "express";
import cors from "cors";

import  fetch from "node-fetch";
// const url = "https://reqres.in/api/users";

const url = "http://10.0.2.214:5000/calculator";


let text ='{"NivelRadiacion":2, "Estrato":6, "Comercializadora":1}';


  const myObject = JSON.parse(text);
  const myJSON = JSON.stringify(myObject);


const app = express();

app.use(cors());

app.get("/obtenerCalculoMr360", async (req, res) => {

//     fetch("https://pokeapi.co/api/v2/pokemon/pikachu")
// .then(response => response.json())
// .then(data => res.json(data))



// {
//     "NivelRadiacion": 5,
//     "Estrato": 3,
//     "Comercializadora": 4
// }

  fetch(url, {
      method: "POST",
      headers: {"Content-type": "application/json;charset=UTF-8"},
      body: myJSON
  })
 .then(
   response => response.json()
   )
 .then(data => res.json(data))

})


app.listen(5000, () => {console.log("Server runing...")})