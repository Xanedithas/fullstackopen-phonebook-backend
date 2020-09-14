const express = require("express")
const cors = require("cors")
const app = express()
const morgan = require("morgan")

require('dotenv').config()

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

const Contact = require("./models/contact")

/*app.get("*", (req, res, next) => {
	throw new Error("test")
})*/

app.get("/info", (req, res, next) => {
	Contact.find({})
		.then((result) => {
			if (!result) {
				return res.status(204).json({ error: "no data found" })
			}
			res.send(`
				<div>
					<p>There are currently ${result.length}
					entries in the phonebook.</p>
					<p>${new Date()}</p>
				</div>
			`)
		})
		.catch(next)
})

app.get("/api/persons", morgan('tiny'), (req, res, next) => {
	Contact.find({})
		.then(result => res.json(result))
		.catch(next)
})

app.get("/api/persons/:id", morgan('tiny'), (req, res, next) => {
	const { id } = req.params
	if (!id) {
		return res.status(400).json({ error: "id is required" })
	}
	Contact.findById(id)
		.then((result) => {
			if (result) {
				res.json(result)
			} else {
				return res.status(404).json({ error: "contact not found" })
				/*let x = Error("contact not found")
				x.code = 404
				next(x)*/
			}
		})
		.catch(next)
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

app.post("/api/persons", morganJson(), (req, res, next) => {
	const { name, number } = req.body
	if (!name || !number) {
		return res.status(400).json({
			error: "name and number are required",
		})
	}
	// Add data validation?
	// 
	/*Contact.find({ name })
		.then((result) => {
			if (result?.length) {
				if (result[0].name === name) {
					return res.status(409).json({
						error: "name must be unique",
					})
				}
			}
		})
		.catch(next)*/
	const contact = Contact({
		name,
		number
	})
	contact.save()
		.then((result) => {
			console.log(`Added ${contact.name} ${contact.number} to phonebook`)
			res.json(contact)
		})
		.catch(next)
})

app.put("/api/persons/:id", morganJson(), (req, res, next) => {
	const { id } = req.params
	const { name, number } = req.body
	if (!id || !name || !number) {
		return res.status(400).json({
			error: "id, name, and number are required",
		})
	}
	const contact = Contact({
		_id: id,
		name,
		number
	})
	// { new: true }, updatedContact with modifications, instead of without by default (new instead of old).
	Contact.findByIdAndUpdate(id, contact, { new: true })
		.then(updatedContact => {
			console.log(`Updated ${updatedContact.name} ${updatedContact.number} in phonebook`)
			res.json(updatedContact)
		})
		.catch(next)
})

app.delete("/api/persons/:id", morganJson(), (req, res, next) => {
	const { id } = req.params
	if (!id) {
		return res.status(400).json({ error: "id is required" })
	}
	Contact.findByIdAndRemove(id)
		// argument may be used to return the removed data
		.then((result) => {
			if (result) {
				res.status(204).end()
			} else {
				res.status(404).end()
			}
		})
		.catch(next)
})

// Unhandled request
app.use((req, res) => res.status(404).send({ error: "unknown endpoint" }))

const errorHandler = (err, req, res, next) => {
	console.error(err.message)

	if (err.name === 'CastError') {
		return res.status(400).send({ error: 'malformatted id' })
	}
	if (err.code) {
		return res.status(err.code).send({ error: err.message || 'internal server error' })
	}

	next(err)
}
app.use(errorHandler)

// Uncaught errors
app.use((err, req, res, next) => res.status(500).end())

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
