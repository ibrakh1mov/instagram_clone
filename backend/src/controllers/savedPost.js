const { ClientError } = require('../utils/error.js')

const GET = (req, res, next) => {
    try {
		const arrPosts = []
		const { postId } = req.params

        const users = req.select('users')
        const posts = req.select('posts')
		const userIndex = users.findIndex(user => user.userId == req.userId)

		const arr = users[userIndex].savedPosts

		for (let i of arr) {
			for (let j of posts) {
				if(j.postId == i) {
					arrPosts.push(j)
				}
			}
		}

		if(postId) {
			return res.json( arrPosts.find(post => post.postId == postId))
		}

		return res.json({
			posts: arrPosts,
		})
    } catch(error) {
		return next(error)
	}
}

const SAVE = (req, res, next) => {
    try {
        let { postId } = req.body
        let users = req.select('users')
        const userIndex = users.findIndex(user => user.userId == req.userId)
        const posts = req.select('posts')
        const post = posts.find(post => post.postId == postId)

        if(!post) {
            throw new ClientError(404, "There is no such post!")
        }
        users[userIndex].savedPosts.push(post.postId)
        req.insert('users', users)

        return res.status(201).json({
			post: post,
			message:"The post saved!"
		})
    } catch(error) {
		return next(error)
	}
}

const UNSAVE = (req, res, next) => {
    try {
		let { postId } = req.body

		if(!postId) {
			throw new ClientError(400, "postId is required!")
		}

        let users = req.select('users')
        let posts = req.select('posts')
        const userIndex = users.findIndex(user => user.userId == req.userId)

		const found = users[userIndex].savedPosts.findIndex(id => id == postId)

		if(found == -1) {
			throw new ClientError(404, "There is no such post!")
		}

		const [ unsavedpostId ] = users[userIndex].savedPosts.splice(found, 1)

		const unsavedpost = posts.find(post => post.postId == unsavedpostId)

		req.insert('users', users)

		return res.status(201).json({
			post: unsavedpost,
			message:"The post unsaved!"
		})

	} catch(error) {
		return next(error)
	}
}

module.exports = {
    GET,
    SAVE,
    UNSAVE
}