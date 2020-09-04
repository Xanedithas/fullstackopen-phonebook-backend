const mongoose = require('mongoose')

const contact = new mongoose.Schema({
    id: String,
    name: String,
    number: String
})

contact.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Contact', contact)
