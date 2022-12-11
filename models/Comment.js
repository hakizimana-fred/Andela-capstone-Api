const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	blog {		
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post'
	},
	content: {
		type: String, 
		required: true
	}
}, { timestamps: true})


module.exports = mongoose.model('Comment', commentSchema)