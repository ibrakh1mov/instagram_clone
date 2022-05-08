const timeConverter = require('../utils/timeConverter.js')
const { ClientError } = require('../utils/error.js')

const GET = (req, res) => {
    try {
        const { postId } = req.query
        const { page = 1, limit = 50 } = req.query
    
        let comments = req.select('comments')
        comments = comments.map(comment => {
            comment.commentCreatedAt = timeConverter(comment.commentCreatedAt)
            return comment
        })
    
        comments = comments.filter(comment => {
            let postFilter = postId ? comment.postId == postId : true
    
            return postFilter
        })

        comments = comments.slice(page * limit - limit, page * limit)
    
        return res.json(comments)
    } catch(error) {
		return next(error)
	}
}

const POST = (req, res) => {
    try {
		let { commentTitle, postId } = req.body
		commentTitle = commentTitle.trim()

		if(commentTitle.length < 1) {
			throw new ClientError(400, "commentTitle is required!")
		}

		if(commentTitle.length > 30) {
			throw new ClientError(413, "commentTitle is too long!")
		}

		const comments = req.select('comments')

		const newcomment = {
			commentId: comments.length ? comments[comments.length - 1].commentId + 1 : 1,
			userId: req.userId,
			postId: postId,
            commentTitle: commentTitle,
			commentCreatedAt: Date()
		}


		comments.push(newcomment)
		req.insert('comments', comments)

		return res.status(201).json({
			comment: newcomment,
			message: "The comment has been added!"
		})

	} catch(error) {
		return next(error)
	}
}

const DELETE = (req, res) => {
    try {
		let { commentId } = req.body

		if(!commentId) {
			throw new ClientError(400, "commentId is required!")
		}

		const comments = req.select('comments')
		const found = comments.findIndex(comment => comment.commentId == commentId && comment.userId == req.userId)

		if(found == -1) {
			throw new ClientError(404, "There is no such comment!")
		}

		const [ deletedcomment ] = comments.splice(found, 1)

		req.insert('comments', comments)

		return res.status(201).json({
			comment: deletedcomment,
			message:"The comment is deleted!"
		})

	} catch(error) {
		return next(error)
	}
}

module.exports = {
    GET,
    POST,
    DELETE
}