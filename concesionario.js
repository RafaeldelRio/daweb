// Importamos las bibliotecas necesarias.
// Concretamente el framework express.
const express = require("express");

const { MongoClient } = require("mongodb");
// or as an es module:
// import { MongoClient } from 'mongodb'

// Inicializamos la aplicación

const app = express();

// Indicamos que la aplicación puede recibir JSON (API Rest)
app.use(express.json());

// Indicamos el puerto en el que vamos a desplegar la aplicación
const port = process.env.PORT || 8080;

// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "BaseDeDatos";

let _concesionarios;

client
  .connect()
  .then(() => {
    console.log("Connected successfully to MongoDB server");

    const db = client.db(dbName);

    _concesionarios = db.collection("concesionarios");

    // Arrancamos la aplicación
    app.listen(port, () => {
      console.log(`Servidor desplegado en puerto: ${port}`);
    });
  })
  .catch((reason) => {
    console.log(`Conexión errornea a MongoDB: ${reason}`);
  });

// Definimos una estructura de datos
// (temporal hasta incorporar una base de datos)
let concesionarios = [
  {
    id: 0,
    nombre: "Concesionario A",
    direccion: "Dirección 1",
    coches: [
      { cocheId: 0, modelo: "Clio", cv: 145, precio: 20860 },
      { cocheId: 1, modelo: "Skyline R34", cv: 280, precio: 34450 },
    ],
  },
];

// Endpoint para obtener todos los concesionarios
app.get("/concesionarios", (request, response) => {
  //Obtener una coleccion de concesionarios
  //  const concesionarios = response.json(concesionarios);
  const cursor = _concesionarios.find();
  const array = cursor.toArray();
  response.json(array.lenght >= 0 ? array : []);
});

// Endpoint para crear un nuevo concesionario
app.post("/concesionarios", (request, response) => {
  _concesionarios.insertOne(request.body);
  //concesionarios.push(request.body);
  then(() => {
    response.json({ message: "Concesionario creado correctamente" });
  });
});
// Endpoint para obtener un concesionario
app.get("/concesionarios/:id", async (request, response) => {
  const id = request.params.id;
  try {
    const result = await _concesionarios.findOne({ id: parseInt(id) });
    if (result) {
      response.json(result);
    } else {
      response.status(404).json({ message: "Concesionario no encontrado" });
    }
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ message: "Error al obtener el concesionario" });
  }
});

// Endpoint para actualizar un concesionario
app.put("/concesionarios/:id", async (request, response) => {
  const id = request.params.id;
  try {
    const updatedResult = await _concesionarios.updateOne(
      { id: parseInt(id) },
      { $set: request.body }
    );
    response.json({ message: "Concesionario actualizado correctamente" });
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ message: "Error al actualizar el concesionario" });
  }
});
// Endpoint para borrar un concesionario
app.delete("/concesionarios/:id", async (request, response) => {
  const id = request.params.id;
  try {
    const deletionResult = await _concesionarios.deleteOne({ id: parseInt(id) });
    response.json({ message: "Concesionario eliminado correctamente" });
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ message: "Error al eliminar el concesionario" });
  }
});
// Endpoint para devolver todos los coches del concesionario pasado por id (solo los coches)
app.get("/concesionarios/:id/coches", async (request, response) => {
  const id = request.params.id;
  try {
    const result = await _concesionarios.findOne({ id: parseInt(id) });
    if (result && result.coches) {
      response.json(result.coches);
    } else {
      response.status(404).json({ message: "No se encontraron coches para este concesionario" });
    }
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ message: "Error al obtener los coches del concesionario" });
  }
});
// Endpoint para añade un nuevo coche al concesionario pasado por id
app.post("/concesionarios/:id/coches", async (request, response) => {
  const id = request.params.id;
  const cocheCreado = request.body;
  try {
    const updateResult = await _concesionarios.updateOne(
      { id: parseInt(id) },
      { $push: { coches: cocheCreado } }
    );
    response.json({ message: "Coche añadido correctamente" });
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ message: "Error al añadir el coche al concesionario" });
  }
});
// Endpoint para obtiene el coche cuyo id sea cocheId, del concesionario pasado por id
app.get("/concesionarios/:id/coches/:cocheId", async (request, response) => {
  const id = request.params.id;
  const cocheId = request.params.cocheId;
  try {
    const result = await _concesionarios.findOne({ id: parseInt(id) });
    if (result && result.coches && result.coches.length > cocheId) {
      response.json(result.coches[cocheId]);
    } else {
      response.status(404).json({ message: "No se encontró el coche para este concesionario" });
    }
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ message: "Error al obtener el coche del concesionario" });
  }
});
// Endpoint para actualizar el coche cuyo id sea cocheId, del concesionario pasado por id
app.put("/concesionarios/:id/coches/:cocheId", async (request, response) => {
  const id = request.params.id;
  const cocheId = request.params.cocheId;
  try {
    const updateResult = await _concesionarios.updateOne(
      { id: parseInt(id), "coches.cocheId": parseInt(cocheId) },
      { $set: { "coches.$": request.body } }
    );
    response.json({ message: "Coche actualizado correctamente" });
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ message: "Error al actualizar el coche del concesionario" });
  }
});
// Endpoint para borrar el coche cuyo id sea cocheId, del concesionario pasado por id
app.delete("/concesionarios/:id/coches/:cocheId", async (request, response) => {
  const id = request.params.id;
  const cocheId = request.params.cocheId;
  try {
    const updateResult = await _concesionarios.updateOne(
      { id: parseInt(id) },
      { $pull: { coches: { cocheId: parseInt(cocheId) } } }
    );
    response.json({ message: "Coche eliminado correctamente" });
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ message: "Error al eliminar el coche del concesionario" });
  }
});