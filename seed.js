require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

const DB_NAME = process.env.DB_NAME || "restaurantes_db";

function random(min,max){
return Math.floor(Math.random()*(max-min))+min;
}

function randomItem(arr){
return arr[Math.floor(Math.random()*arr.length)];
}

const comidas=[
"Pizza","Burger","Tacos","Pasta","Sushi","Ramen","Salad","Chicken","Steak","Sandwich"
];

async function seed(){

await client.connect();

const db = client.db(DB_NAME);

console.log("Conectado a MongoDB");

const restaurantes=[];
const usuarios=[];
const menuItems=[];
const ordenes=[];
const resenas=[];

console.log("Generando restaurantes...");

for(let i=0;i<200;i++){

restaurantes.push({
nombre:`Restaurante ${i}`,
direccion:`Zona ${random(1,20)}`,
ubicacion:{
type:"Point",
coordinates:[-90.5+Math.random(),14.6+Math.random()]
},
fechaRegistro:new Date(),
activo:true
});

}

await db.collection("restaurantes").insertMany(restaurantes);

const restaurantesDB=await db.collection("restaurantes").find().toArray();

console.log("Generando usuarios...");

for(let i=0;i<2000;i++){

usuarios.push({
nombre:`Usuario ${i}`,
email:`user${i}@mail.com`,
password:"123456",
tipo:"usuario",
fechaRegistro:new Date()
});

}

await db.collection("usuarios").insertMany(usuarios);

const usuariosDB=await db.collection("usuarios").find().toArray();

console.log("Generando menu_items...");

for(let i=0;i<5000;i++){

const r=randomItem(restaurantesDB);

menuItems.push({
nombre:randomItem(comidas),
descripcion:"Comida deliciosa",
precio:random(5,30),
categoria:"general",
restauranteId:r._id
});

}

await db.collection("menu_items").insertMany(menuItems);

const menuDB=await db.collection("menu_items").find().toArray();

console.log("Generando ordenes...");

for(let i=0;i<50000;i++){

const user=randomItem(usuariosDB);
const item=randomItem(menuDB);

ordenes.push({

usuarioId:user._id,
restauranteId:item.restauranteId,
estado:randomItem(["pendiente","preparando","entregada"]),
total:item.precio,

items:[
{
menuItemId:item._id,
cantidad:random(1,3),
precio:item.precio
}
],

fechaCreacion:new Date(Date.now()-random(0,1000000000))

});

if(ordenes.length===1000){

await db.collection("ordenes").insertMany(ordenes);

ordenes.length=0;

console.log("1000 ordenes insertadas");

}

}

console.log("Generando reseñas...");

for(let i=0;i<10000;i++){

const user=randomItem(usuariosDB);
const r=randomItem(restaurantesDB);

resenas.push({

usuarioId:user._id,
restauranteId:r._id,
calificacion:random(1,5),
comentario:"Muy buen restaurante",
fecha:new Date()

});

}

await db.collection("resenas").insertMany(resenas);

console.log("Seed terminado");

await client.close();

}

seed();