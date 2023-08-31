require('dotenv').config()
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require('./models/person')

app.use(cors());
app.use(express.json());
app.use(express.static('dist'))

morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Phonebook<h1>");
});

app.get("/api/persons", (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons);
  }).catch(error => next(error))
});

app.get("/info", (request, response) => {
  const info = `Phonebook has info for ${persons.length} people`;
  const date = new Date();
  response.send(`<p>${info}</p><p>${date}</p>`);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
});

app.post("/api/persons", (request, response, next) => {
  let entry = request.body;

  if (!entry.name) {
    return response.status(400).json({ error: "name is missing" });
  }

  if (!entry.number) {
    return response.status(400).json({ error: "number is missing" });
  }

  const person = new Person ({
    name: entry.name,
    number: entry.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson);
  }).catch(error => next(error))

  // const duplicate = persons.find((person) => person.name === entry.name);

  // if (duplicate) {
  //   return response.status(400).json({ error: "name must be unique" });
  // }
});


const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT;
app.listen(PORT);
console.log(`Server listening on port ${PORT}`);
