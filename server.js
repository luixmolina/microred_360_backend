import express from "express";
import cors from "cors";
import  fetch from "node-fetch";
import mongoose from "mongoose";
import User from './models/user.model.js';
import jwt from 'jsonwebtoken';
import bycrypt from "bcryptjs";
import nodemailer from "nodemailer";
import * as dotenv from 'dotenv';



dotenv.config({path:'./.env'});

const puerto = process.env.PORT;
const url = process.env.Url_calculator;
const db_host = process.env.db_host;
const secret_code = process.env.SECRET_CODE;
const password_email = process.env.PASSWORD_EMAIL;

const app = express();

mongoose.connect(db_host)

app.use(express.json());

app.use(cors());

const encrypt = async (textPlain)  =>{
  const hash = await bycrypt.hash(textPlain,10);
  return hash
}

const compare = async (passwordPlain, hashPassword)   =>{
    const result = await bycrypt.compare(passwordPlain,hashPassword);
    return result
}



app.post("/obtenerCalculoMr360", async (req, res) => {

  let data = req.body;

  try {

    fetch(url, {

        method: "POST",
        headers: {"Content-type": "application/json;charset=UTF-8"},
        body: JSON.stringify(data)
    })
   .then(
     response => {
     if(response.ok){
     return response.json()
      } else {

        data = {status:"error"}
        return data
      }
     })
    .then(data =>{
      return res.json(data)
    })

  } catch (err){
   return res.json({status:"error"})
  }

  });

app.post("/registrarUsuario", async (req, res) => {

  try {
    const encrypted_password = await encrypt(req.body.password)

    const user = await User.create({
       nombre: req.body.nombre,
       correo: req.body.correo,
       institucion: req.body.institucion,
       cargo: req.body.cargo,
       telefono: req.body.telefono,
       password: encrypted_password,
       politicasGers: req.body.politicas,
    })

    res.json({status: "success"})

  } catch (err){
    res.json({status: "error"})
  }
});

const firmarToken = (nombre,correo, mantenerSeccion) =>{
 
  if(mantenerSeccion){
    const token = jwt.sign({
      nombre: nombre,
      correo: correo,
    }, secret_code, { expiresIn: "30d"})

    return token;
  } else{
      const token = jwt.sign({
        nombre: nombre,
        correo: correo,
      }, secret_code, { expiresIn: "60m"})
       return token;
    }
  }

app.post("/Login", async (req, res) => {

 try {
  const user = await User.findOne({correo: req.body.correo})
  const checkPassword = await compare(req.body.password, user.password);
  const mantenerSeccion = req.body.mantenerSeccion;
 
  if(checkPassword){
    const token =firmarToken(user.nombre, user.correo, mantenerSeccion);
    
    return res.json({status: "success", user: token})

  } else{
     return res.json({status: "error", user: false})
  }
 } catch (error) {

  return res.json({status: "error", user: false})
 }
});


app.get("/reviewToken", async (req, res) => {

  let data = req.body;
  const token = req.headers['x-access-token'];

  try {
    const decode = jwt.decode(token, secret_code);
    const correo = decode.correo
    
    const user = await User.findOne({ correo: correo})
  
    jwt.verify(token, secret_code, function(err, decoded) {
      if (err) {

       return res.json({status: "error", error: 'invalid token'});
      } else{
        return res.json({status: "success", user: user})
      }
    });
  } catch (error){

    res.json({status: "error", error: 'invalid token'})
  }
});


app.post("/forgot_password", async (req, res) => {

  let email = req.body;

  try {

    const oldUser = await User.findOne({ correo: email.correo });

    if(!oldUser){
      return res.send({status: "error"});
    }

    const secretToken = secret_code + oldUser.password;
    const token = jwt.sign({ correo: oldUser.correo, id: oldUser.id}, secretToken, { expiresIn: "20m"});

    const link = 'http://localhost:3000/reset-password/'+oldUser.id+'/'+token;


    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'microred360@gmail.com',
        pass: password_email
      }
    });

    var mailOptions = {
      from: 'microred360@gmail.com',
      to: oldUser.correo,
      subject: 'Recuperación de contraseña de acceso a MR360',
      html: 'Para restablecer la contraseña de su cuenta en el aplicativo MR360 ingrese al siguiente enlace: <a href="'+link+'">enlace de recuperación de contraseña</a>',
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {

        res.json({status: "Error"})

      } else {

        res.json({status: "success"})
      }
    });

  } catch (error){

    res.json({status: "error", error: ''})
  }
});


app.post('/reset-password', async (req, res) => {

  const {id, token} = req.body;

   const oldUser = await User.findOne({_id: id});

   if(!oldUser) {
     return res.json({status: "El usuario no existe"});
   }

   const secretToken = secret_code + oldUser.password;

   try {
     const verify = jwt.verify(token, secretToken);
    
     res.json({status: "Success", correo: verify.correo})
    
   }catch (err){
    res.json({status: "Error"})
   }
});


app.post('/cambiar_password', async (req, res) => {

  const {id, token, correo, password} = req.body;

   const oldUser = await User.findOne({_id: id});

   if(!oldUser) {
     return res.json({status: "El usuario no existe"});
   }

   const secretToken = secret_code + oldUser.password;

   try {
     const verify = jwt.verify(token, secretToken);
    
    const encryptedPassword =  await encrypt(password);

    await User.updateOne(
      {_id: id
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
      );
      res.json({status: "success"});

   }catch (err){
    res.json({status: "Error", error: err.message});
   }
});


app.listen(puerto, () => {console.log("Server runing on port " +puerto)})


