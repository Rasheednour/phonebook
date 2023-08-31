require("dotenv").config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));

morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/", (request, response) => {
  response.send("<h1>Phonebook<h1>");
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      const info = `Phonebook has info for ${persons.length} people`;
      const date = new Date();
      response.send(`<p>${info}</p><p>${date}</p>`);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  let entry = request.body;

  if (!entry.name) {
    return response.status(400).json({ error: "name is missing" });
  }

  if (!entry.number) {
    return response.status(400).json({ error: "number is missing" });
  }

  const person = new Person({
    name: entry.name,
    number: entry.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  const person = {
    name: request.body.name,
    number: request.body.number,
  };
  Person.findByIdAndUpdate(id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT);
console.log(`Server listening on port ${PORT}`);
