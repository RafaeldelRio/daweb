// Importamos las bibliotecas necesarias.
// Concretamente el framework express.
const express = require("express");

// Inicializamos la aplicación
const app = express();

// Indicamos que la aplicación puede recibir JSON (API Rest)
app.use(express.json());

// Indicamos el puerto en el que vamos a desplegar la aplicación
const port = process.env.PORT || 8080;

// Arrancamos la aplicación
app.listen(port, () => {
  console.log(`Servidor desplegado en puerto: ${port}`);
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
  response.json(concesionarios);
});

// Endpoint para crear un nuevo concesionario
app.post("/concesionarios", (request, response) => {
  concesionarios.push(request.body);
  response.json({ message: "ok" });
});
// Endpoint para obtener un concesionario
app.get("/concesionarios/:id", (request, response) => {
  const id = request.params.id;
  const result = concesionarios[id];
  response.json({ result });
});
// Endpoint para actualizar un concesionario
app.put("/concesionarios/:id", (request, response) => {
  const id = request.params.id;
  concesionarios[id] = request.body;
  response.json({ message: "ok" });
});
// Endpoint para borrar un concesionario
app.delete("/concesionarios/:id", (request, response) => {
  const id = request.params.id;
  concesionarios = concesionarios.filter(
    (item) => concesionarios.indexOf(item) !== id
  );

  response.json({ message: "ok" });
});
// Endpoint para devolver todos los coches del concesionario pasado por id (solo los coches)
app.get("/concesionarios/:id/coches", (request, response) => {
  const id = request.params.id;
  const result = concesionarios[id].coches;
  response.json({ result });
});
// Endpoint para añade un nuevo coche al concesionario pasado por id
app.post("/concesionarios/:id/coches", (request, response) => {
  const id = request.params.id;
  const cocheCreado = request.body;
  concesionarios[id].coches.push(cocheCreado);
  response.json({ message: "Coche añadido" });
});
// Endpoint para obtiene el coche cuyo id sea cocheId, del concesionario pasado por id
app.get("/concesionarios/:id/coches/:cocheId", (request, response) => {
  const id = request.params.id;
  const cocheId = request.params.cocheId;
  const result = concesionarios[id].coches[cocheId];
  response.json({ result });
});
// Endpoint para actualizar el coche cuyo id sea cocheId, del concesionario pasado por id
app.put("/concesionarios/:id/coches/:cocheId", (request, response) => {
  const id = request.params.id;
  const cocheId = request.params.cocheId;
  concesionarios[id].coches[cocheId] = request.body;
  response.json({ message: "ok" });
});
// Endpoint para borrar el coche cuyo id sea cocheId, del concesionario pasado por id
app.delete("/concesionarios/:id/coches/:cocheId", (request, response) => {
  const id = request.params.id;
  const cocheId = request.params.cocheId;

  const concesionario = concesionarios[id].coches.filter(
    (coche) => coche.cocheId !== cocheId
  );

  response.json({ message: "Car deleted successfully" });
});
