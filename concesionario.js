const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
// Importamos las bibliotecas necesarias.
// Concretamente el framework express.
const express = require("express");

const { MongoClient, ObjectId } = require("mongodb");
// or as an es module:
// import { MongoClient } from 'mongodb'

// Inicializamos la aplicación

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
let _coches;

client
  .connect()
  .then(() => {
    console.log("Connected successfully to MongoDB server");

    const db = client.db(dbName);

    _concesionarios = db.collection("concesionarios");
    _coches = db.collection("coches");

    // Arrancamos la aplicación
    app.listen(port, () => {
      console.log(`Servidor desplegado en puerto: ${port}`);
    });
  })
  .catch((reason) => {
    console.log(`Conexión errornea a MongoDB: ${reason}`);
  });

// Endpoint para obtener todos los concesionarios
app.get("/concesionarios", async (request, response) => {
  try {
    const cursor = _concesionarios.find();
    const array = await cursor.toArray();
    const concesionarios = array.map((concesionario) => {
      const { _id, coches, ...apiConcesionario } = concesionario;
      return { id: _id, ...apiConcesionario };
    });
    response.json(concesionarios);
  } catch (error) {
    console.error("Error:", error);
    response
      .status(500)
      .json({ message: "Error al obtener los concesionarios" });
  }
});
// Endpoint para crear un nuevo concesionario
app.post("/concesionarios", (request, response) => {
  _concesionarios
    .insertOne(request.body)
    .then(() => {
      response.json({ message: "Concesionario creado correctamente" });
    })
    .catch((error) => {
      console.error("Error:", error);
      response.status(500).json({ message: "Error al crear el concesionario" });
    });
});
// Endpoint para obtener un concesionario
app.get("/concesionarios/:id", async (request, response) => {
  try {
    const id = request.params.id; // Obtener el ID desde los parámetros de la URL
    const concesionario = await _concesionarios.findOne({ _id: new ObjectId(id) });
    const { coches, ...apiConcesionario } = concesionario;
    if (apiConcesionario) {
      response.json(apiConcesionario);
    } else {
      response.status(404).json({ message: "Concesionario no encontrado" });
    }
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ message: "Error al obtener el concesionario" });
  }
});
// Actualizar un concesionario
app.put("/concesionarios/:id", async (request, response) => {
  try {
    const id = request.params.id;
    const updatedConcesionario = request.body;
    await _concesionarios.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedConcesionario }
    );
    response.json({ message: "Concesionario actualizado correctamente" });
  } catch (error) {
    console.error("Error:", error);
    response
      .status(500)
      .json({ message: "Error al actualizar el concesionario" });
  }
});

// Borrar un concesionario
app.delete("/concesionarios/:id", async (request, response) => {
  try {
    const id = request.params.id;
    await _concesionarios.deleteOne({ _id: new ObjectId(id) });
    response.json({ message: "Concesionario eliminado correctamente" });
  } catch (error) {
    console.error("Error:", error);
    response
      .status(500)
      .json({ message: "Error al eliminar el concesionario" });
  }
});

// Obtener todos los coches de un concesionario
app.get("/concesionarios/:id/coches", async (request, response) => {
  try {
    const id = request.params.id;
    const array = (await _coches.find({ _concesionario: id }).toArray()) || [];
    const coches = array.map((car) => {
      const { _concesionario, ...apiCar } = car;
      return apiCar;
    });
    response.json(coches);
  } catch (error) {
    console.error("Error:", error);
    response
      .status(500)
      .json({ message: "Error al obtener los coches del concesionario" });
  }
});

// Añadir un nuevo coche a un concesionario
app.post("/concesionarios/:id/coches", async (request, response) => {
  try {
    const id = request.params.id;
    const newCar = request.body;
    newCar._concesionario = id;
    const _idCoche = await _coches.insertOne(newCar);
    await _concesionarios.updateOne(
      { _id: new ObjectId(id) },
      { $push: { coches: _idCoche } }
    );
    response.json({ message: "Coche añadido correctamente al concesionario" });
  } catch (error) {
    console.error("Error:", error);
    response
      .status(500)
      .json({ message: "Error al añadir el coche al concesionario" });
  }
});

// Obtener un coche específico de un concesionario
app.get("/concesionarios/:id/coches/:cocheId", async (request, response) => {
  try {
    const id = request.params.id;
    const cocheId = request.params.cocheId;
    const concesionario = await _concesionarios.findOne({
      _id: new ObjectId(id),
    });
    if (concesionario) {
      const car = concesionario.coches.find((car) => car._id == cocheId);
      if (car) {
        response.json(car);
      } else {
        response
          .status(404)
          .json({ message: "Coche no encontrado en el concesionario" });
      }
    } else {
      response.status(404).json({ message: "Concesionario no encontrado" });
    }
  } catch (error) {
    console.error("Error:", error);
    response
      .status(500)
      .json({ message: "Error al obtener el coche del concesionario" });
  }
});

// Actualizar un coche específico de un concesionario
app.put("/concesionarios/:id/coches/:cocheId", async (request, response) => {
  try {
    const id = request.params.id;
    const cocheId = request.params.cocheId;
    const updatedCar = request.body;

    await _coches.updateOne(
      { _id: new ObjectId(cocheId) },
      { $set: updatedCar }
    );

    response.json({ message: "Coche actualizado correctamente" });
  } catch (error) {
    console.error("Error:", error);
    response
      .status(500)
      .json({ message: "Error al actualizar el coche del concesionario" });
  }
});
// Borrar un coche específico de un concesionario
app.delete("/concesionarios/:id/coches/:cocheId", async (request, response) => {
  try {
    const id = request.params.id;
    const cocheId = request.params.cocheId;

    await _coches.deleteOne({ _id: new ObjectId(cocheId) });

    await _concesionarios.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { coches: { _id: new ObjectId(cocheId) } } } 
    );
    response.json({
      message: "Coche eliminado correctamente del concesionario",
    });
  } catch (error) {
    console.error("Error:", error);
    response
      .status(500)
      .json({ message: "Error al eliminar el coche del concesionario" });
  }
});