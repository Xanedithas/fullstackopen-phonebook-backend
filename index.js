const express = require("express")
const cors = require("cors")
const app = express()
const morgan = require("morgan")

const mongoose = require('mongoose')
const url = process.env.MONGODB_URI
const Contact = require("./models/contact")

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

console.log('connecting to', url)

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

/*app.get("/", morgan('tiny'), (req, res) => {
	res.send("<h1>Hello World!</h1>")
})*/

/*console.log("Phonebook:")
result.forEach((contact) => {
	console.log(`${contact.name} ${contact.number}`)
})*/

app.get("/test", (req, res) => {
	Contact.find({}).then((result) => {
		mongoose.connection.close()
		res.send(JSON.stringify(result))
	})
    .catch(error => {
		mongoose.connection.close()
		console.log(error)
		response.status(500).end()
    })
})

app.get("/info", (req, res) => {
	Contact.find({}).then((result) => {
		mongoose.connection.close()
		res.send(`
			<div>
				<p>There are currently ${result.length}
				entries in the phonebook.</p>
				<p>${new Date()}</p>
			</div>
		`)
	})
    .catch(error => {
		mongoose.connection.close()
		console.log(error)
		response.status(500).end()
    })
})

app.get("/api/persons", morgan('tiny'), (req, res) => {
	Contact.find({}).then((result) => {
		mongoose.connection.close()
		res.json(result)
	})
    .catch(error => {
		mongoose.connection.close()
		console.log(error)
		response.status(500).end()
    })
})

app.get("/api/persons/:id", morgan('tiny'), (req, res) => {
	if (req.params.id) {
		Contact.find({ _id: req.params.id }).then((result) => {
			mongoose.connection.close()
			if (result) {
				res.json(result)
			} else {
				return res.status(404).json({
					error: "person not found",
				})
			}
		})
		.catch(error => {
			mongoose.connection.close()
			console.log(error)
			response.status(500).end()
		})
	} else {
		mongoose.connection.close()
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
						mongoose.connection.close()
						return res.status(409).json({
							error: "name must be unique",
						})
					}
				}
			})
			.catch(error => {
				mongoose.connection.close()
				console.log(error)
				response.status(500).end()
			})
			const newContact = Contact({
				name: name,
				number: number
			})
			newContact.save().then((result) => {
				console.log(`Added ${contact.name} ${contact.number} to phonebook`)
				mongoose.connection.close()
			})
			res.json(newContact)
		} else {
			return res.status(400).json({
				error: "name and number are required",
			})
		}
	} else {
		mongoose.connection.close()
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
						mongoose.connection.close()
					}/*, error => {
						console.log(error)
						res.status(500).end()
						mongoose.connection.close()
					}*/)
					.catch(error => {
						mongoose.connection.close()
						console.log(error)
						response.status(500).end()
					})
				} else {
					mongoose.connection.close()
					return res.status(404).json({
						error: "person not found",
					})
				}
			}
		})
		.catch(error => {
			mongoose.connection.close()
			console.log(error)
			response.status(500).end()
		})
	} else {
		mongoose.connection.close()
		return res.status(400).json({
			error: "id missing",
		})
	}
})

const unknownEndpoint = (req, res) => {
	mongoose.connection.close()
	res.status(404).send({ error: "unknown endpoint" })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
