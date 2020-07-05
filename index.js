const express = require("express")
const cors = require("cors")
const app = express()
const morgan = require("morgan")

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

const requestLogger = (req, res, next) => {
	console.log("Method:", req.method)
	console.log("Path:  ", req.path)
	console.log("Body:  ", req.body)
	console.log("---")
	next()
}
//app.use(requestLogger)

let persons = [
	{
		name: "Ada Lovelace",
		number: "39-44-5323523",
		id: 2,
	},
	{
		name: "Dan Abramov",
		number: "12-43-234345",
		id: 3,
	},
	{
		name: "Mary Poppendieck",
		number: "39-23-6423122",
		id: 4,
	},
	{
		name: "Edsger Dijkstra",
		number: "09-87654321",
		id: 5,
	},
]

/*app.get("/", morgan('tiny'), (req, res) => {
	res.send("<h1>Hello World!</h1>")
})*/

app.get("/info", (req, res) => {
	res.send(`
        <div>
			<p>There are currently ${persons.length}
			entries in the phonebook.</p>
            <p>${new Date()}</p>
        </div>
    `)
})

app.get("/api/persons", morgan('tiny'), (req, res) => {
	res.json(persons)
})

app.get("/api/persons/:id", morgan('tiny'), (req, res) => {
	if (req.params.id) {
		const id = Number(req.params.id)
		const person = persons.find((p) => p.id === id)
		if (person) {
			res.json(person)
		} else {
			return res.status(404).json({
				error: "person not found",
			})
		}
	} else {
		return res.status(400).json({
			error: "id missing",
		})
	}
})

const morganJson = () => {
	return morgan((tokens, req, res) => {
		return [
			tokens.date(req, res, "iso"),
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, "content-length"),
			"-",
			tokens["response-time"](req, res),
			"ms",
			JSON.stringify(req.body),
		].join(" ")
	})
}

/*
// I used this, but I have to use Math.random().
const lastId = () => {
    // Array must be in order for this to work.
    if (persons.length) {
        return persons[persons.length-1].id
    } else {
        return 0
    }
}
// Could also use 'node-uuid'
*/

const random = () => {
	return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
}

app.post("/api/persons", morganJson(), (req, res) => {
	if (req.body) {
		const { name, number } = req.body
		if (name && number) {
			// Add faulty data check?
			if (persons.find((p) => p.name === name)) {
				return res.status(409).json({
					error: "name must be unique",
				})
			}
			const newPerson = {
				name,
				number,
				id: random(),
			}
			//lastId()+1
			persons = persons.concat(newPerson)
			res.json(newPerson)
		} else {
			return res.status(400).json({
				error: "name and number are required",
			})
		}
	} else {
		return res.status(400).json({
			error: "name and number are required",
		})
	}
})

app.delete("/api/persons/:id", morganJson(), (req, res) => {
	if (req.params.id) {
		const id = Number(req.params.id)
		persons = persons.filter((p) => p.id !== id)
		res.status(204).end()
	} else {
		return res.status(400).json({
			error: "id missing",
		})
	}
})

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: "unknown endpoint" })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
