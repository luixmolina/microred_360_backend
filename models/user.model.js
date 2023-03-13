import mongoose from "mongoose";

const User = new mongoose.Schema(
    {
    nombre: { type: String, required: true},
    correo: { type: String, required: true, unique: true },
    institucion: { type: String, required: false},
    cargo: {type: String, required: false},
    telefono: {type: String, required: true},
    password: { type: String, required: true}, 
    politicasGers: { type: Boolean, required: true},
    
    }, {collection: 'datos-usuario'}
)

const model = mongoose.model('DatosUsuario', User)



export default model