const timeConverter = require('../utils/timeConverter.js')
const { ClientError } = require('../utils/error.js')
const path = require('path')
const fs = require('fs')

const GET = (req, res, next) => {
	try {
		const { postId } = req.params
		const { 
			page = 1,
			limit = 100,
			userId
		} = req.query

		let posts = req.select('posts')
		posts = posts.map(post => {
			post.postCreatedAt = timeConverter(post.postCreatedAt)
			return post
		})

		if(postId) {
			return res.json( posts.find(post => post.postId == postId))
		} 

		posts = posts.slice(page * limit - limit, page * limit)
		posts = posts.filter(post => {
			let userFilter =  userId ? post.userId == userId : true

			return userFilter
		})

		return res.json(posts)

	} catch(error) {
		return next(error)
	}
}

const POST = (req, res, next) => {
	try {
		let { postTitle } = req.body

		if(!postTitle) {
			throw new ClientError(400, "postTitle is required!")
		}

		postTitle = postTitle.trim()

		if(postTitle.length < 1) {
			throw new ClientError(400, "postTitle is required!")
		}

		if(postTitle.length > 30) {
			throw new ClientError(413, "postTitle is too long!")
		}

		if(!req.file) {
			throw new ClientError(400, "The post argument is required!")
		}

		const { size, mimetype, buffer, originalname } = req.file

		if(size > (200 * 1024 * 1024)) {
			throw new ClientError(413, "The file larger than 200MB!")
		}
        
		if(!['image/png', 'image/jpeg', 'image/jpg', 'video/mp4'].includes(mimetype)) {
			throw new ClientError(415, "The file must be mp4!, jpg, jpeg or png!")
		}

		const fileName = Date.now() % 1000 + originalname.replace(/\s/g, '')
		const pathName = path.join(process.cwd(), 'files', 'posts', fileName)
		fs.writeFileSync(pathName, buffer)

		const posts = req.select('posts')

		const newpost = {
			postId: posts.length ? posts[posts.length - 1].postId + 1 : 1,
			userId: req.userId,
			postTitle,
			postUrl: '/posts/' + fileName,
			postsize: (size / (2 ** 20)).toFixed(1),
            likes: 0,
			postCreatedAt: Date()
		}

		posts.push(newpost)
		req.insert('posts', posts)

		return res.status(201).json({
			post: newpost,
			message: "The post has been added!"
		})

	} catch(error) {
		return next(error)
	}
}

const PUT = (req, res, next) => {
	try {
		let { postId, postTitle } = req.body
		postTitle = postTitle.trim()


		if(!postId) {
			throw new ClientError(400, "postId is required!")
		}

		if(postTitle.length < 1) {
			throw new ClientError(400, "postTitle is required!")
		}

		if(postTitle.length > 30) {
			throw new ClientError(413, "postTitle is too long!")
		}
        console.log(req.userId)

		const posts = req.select('posts')
		const found = posts.find(post => post.postId == postId && post.userId == req.userId)

		if(!found) {
			throw new ClientError(404, "There is no such post!")
		}

		found.postTitle = postTitle

		req.insert('posts', posts)

		return res.status(201).json({
			post: found,
			message:"The post updated!"
		})

	} catch(error) {
		return next(error)
	}
}

const DELETE = (req, res, next) => {
	try {
		let { postId } = req.body

		if(!postId) {
			throw new ClientError(400, "postId is required!")
		}

		const posts = req.select('posts')
		const found = posts.findIndex(post => post.postId == postId && post.userId == req.userId)

		if(found == -1) {
			throw new ClientError(404, "There is no such post!")
		}

		const [ deletedpost ] = posts.splice(found, 1)
		fs.unlinkSync(path.join(process.cwd(), 'files', deletedpost.postUrl))

		req.insert('posts', posts)

		return res.status(201).json({
			post: deletedpost,
			message:"The post is deleted!"
		})

	} catch(error) {
		return next(error)
	}
}


module.exports = {
	DELETE,
	POST,
	GET,
	PUT
}	