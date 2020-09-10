const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

const contact = new mongoose.Schema({
    id: String,
    name: String,
    number: String
})

console.log('connecting to', url)

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(result => {
		console.log('connected to MongoDB')
	})
	.catch(error => {
		console.log('error connecting to MongoDB:', error.message)
	})

contact.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// I dont know if this works, but its the only thing I can do right now to properly close the db connection on exit.
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected on app termination')
    process.exit(0)
  })
})

module.exports = mongoose.model('Contact', contact)
