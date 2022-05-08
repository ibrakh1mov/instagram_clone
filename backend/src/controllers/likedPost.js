const { ClientError } = require('../utils/error.js')

const GET = (req, res, next) => {
    try {
        const arrPosts = []
		const { postId } = req.params

        const users = req.select('users')
        const posts = req.select('posts')
		const userIndex = users.findIndex(user => user.userId == req.userId)

		const arr = users[userIndex].likedPosts

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

const LIKE = (req, res, next) => {
    try {
        let { postId } = req.body
        let users = req.select('users')
        const userIndex = users.findIndex(user => user.userId == req.userId)
        const posts = req.select('posts')
        const postIndex = posts.findIndex(post => post.postId == postId)

        if(postIndex == -1) {
            throw new ClientError(404, "There is no such post!")
        }
        users[userIndex].likedPosts.push(posts[postIndex].postId)
        posts[postIndex].likes += 1
        req.insert('users', users)
        req.insert('posts', posts)

        return res.status(201).json({
			post: posts[postIndex],
			message:"The post liked!"
		})
    } catch(error) {
		return next(error)
	}
}

const UNLIKE = (req, res, next) => {
    try {
		let { postId } = req.body

		if(!postId) {
			throw new ClientError(400, "postId is required!")
		}

        let users = req.select('users')
        let posts = req.select('posts')
        const userIndex = users.findIndex(user => user.userId == req.userId)
        const postIndex = posts.findIndex(post => post.postId == postId)

		const found = users[userIndex].likedPosts.findIndex(id => id == postId)

		if(found == -1) {
			throw new ClientError(404, "There is no such post!")
		}

        posts[postIndex].likes -= 1
		const [ unlikedpostId ] = users[userIndex].likedPosts.splice(found, 1)

        const unlikedpost = posts.find(post => post.postId == unlikedpostId)

		req.insert('users', users)
		req.insert('posts', posts)

		return res.status(201).json({
			post: unlikedpost,
			message:"The post unliked!"
		})

	} catch(error) {
		return next(error)
	}
}

module.exports = {
    GET,
    LIKE,
    UNLIKE
}