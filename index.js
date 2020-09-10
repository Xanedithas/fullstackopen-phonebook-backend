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

const Contact = require("./models/contact")

/*app.get("/", morgan('tiny'), (req, res) => {
	res.send("<h1>Hello World!</h1>")
})*/

/*console.log("Phonebook:")
result.forEach((contact) => {
	console.log(`${contact.name} ${contact.number}`)
})*/

app.get("/test", (req, res) => {
	Contact.find({}).then((result) => {
		res.send(JSON.stringify(result))
	})
		.catch(error => {
			console.log(error)
			response.status(500).end()
		})
})

app.get("/info", (req, res) => {
	Contact.find({}).then((result) => {
		res.send(`
			<div>
				<p>There are currently ${result.length}
				entries in the phonebook.</p>
				<p>${new Date()}</p>
			</div>
		`)
	})
		.catch(error => {
			console.log(error)
			response.status(500).end()
		})
})

app.get("/api/persons", morgan('tiny'), (req, res) => {
	Contact.find({}).then((result) => {
		res.json(result)
	})
		.catch(error => {
			console.log(error)
			response.status(500).end()
		})
})

app.get("/api/persons/:id", morgan('tiny'), (req, res) => {
	if (req.params.id) {
		Contact.find({ _id: req.params.id }).then((result) => {

			if (result) {
				res.json(result)
			} else {
				return res.status(404).json({
					error: "person not found",
				})
			}
		})
			.catch(error => {
				console.log(error)
				response.status(500).end()
			})
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

app.post("/api/persons", morganJson(), (req, res) => {
	if (req.body) {
		const { name, number } = req.body
		if (name && number) {
			// Add faulty data check?
			Contact.find({ name: name }).then((result) => {
				if (result) {
					if (result[0].name === name) {
						return res.status(409).json({
							error: "name must be unique",
						})
					}
				}
			})
				.catch(error => {
					console.log(error)
					response.status(500).end()
				})
			const newContact = Contact({
				name: name,
				number: number
			})
			newContact.save().then((result) => {
				console.log(`Added ${contact.name} ${contact.number} to phonebook`)
			})
			res.json(newContact)
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
}, error => {
	console.log(error)
})

app.delete("/api/persons/:id", morganJson(), (req, res) => {
	if (req.params.id) {
		Contact.find({ _id: req.params.id }).then((result) => {
			if (result) {
				if (result[0]._id == req.params.id) {
					Contact.deleteOne({ _id: req.params.id }).then(() => {
						res.status(204).end()

					}/*, error => {
						console.log(error)
						res.status(500).end()
						
					}*/)
						.catch(error => {

							console.log(error)
							response.status(500).end()
						})
				} else {

					return res.status(404).json({
						error: "person not found",
					})
				}
			}
		})
			.catch(error => {
				console.log(error)
				response.status(500).end()
			})
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
