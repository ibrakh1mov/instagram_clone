const { sign } = require('../utils/jwt.js')
const sha256 = require('sha256')
const path = require('path')
const fs = require('fs')


const LOGIN = (req, res, next) => {
	try {
		const { username, password } = req.body
		if(!username || !password) throw new Error("username and password are required!")

		const users = req.select('users')
		const user = users.find(user => user.username == username && user.password == sha256(password))

		if(!user) throw new Error("Wrong username or password!")

		delete user.password
		return res.status(200).json({
			user,
			message: "The user has successfully logged in!",
			token: sign({ userId: user.userId, agent: req.headers['user-agent'] })
		})
		
	} catch(error) {
		return res.json({
            status: 404,
            message: error.message
        })
	}
}

const REGISTER = (req, res, next) => {
	try {
		const users = req.select('users')
		const { username, password } = req.body

        if(!username || !password) throw new Error('username and password are required')
        if(password.length < 5) throw new Error('the length of the password must be at least 5')
		if(password.length > 15) throw new Error('the length of the password should not exceed 15')
		if(!(/[A-Za-z]/).test(password)) throw new Error('the password must contain a letter')
		if(!(/[0-9]/).test(password)) throw new Error('the password must contain a number')
		if(!(/[!@#$%^&*]/).test(password)) throw new Error('the password must contain a character(!@#$%^&*)')
		if(username.length > 50) throw new Error('the length of the userName should not exceed 50')
		if(username.length < 3) throw new Error('the length of the userName should not exceed 3')

		const found = users.find(user => user.username == username)

		if(found) {
			throw new Error("The user already exists!")
		}

		if(!req.file) {
			throw new Error("The file argument is required!")
		}

		const { size, mimetype, buffer, originalname } = req.file

		if(size > (10 * 1024 * 1024)) {
			throw new Error("The file larger than 10MB!")
		}

		if(!['image/png', 'image/jpeg', 'image/jpg'].includes(mimetype)) {
			throw new Error("The file must be jpg or png!")
		}

		const fileName = Date.now() % 1000 + originalname.replace(/\s/g, '')
		const pathName = path.join(process.cwd(), 'files', 'images', fileName)
		fs.writeFileSync(pathName, buffer)

		const newUser = {
			userId: users.length ? users[users.length - 1].userId + 1 : 1,
			username,
			profileImg: '/images/' + fileName,
			password: sha256(password),
            likedPosts: [],
            savedPosts: [],
            following: [],
            followers: []

		}

		users.push(newUser)
		req.insert('users', users)

		delete newUser.password
		res.status(201).json({
			user: newUser,
			message: "The user has successfully registered!",
			token: sign({ userId: newUser.userId, agent: req.headers['user-agent'] })
		})
		
	} catch(error) {
		return res.json({
            status: 404,
            message: error.message
        })
	}
}


module.exports = {
	REGISTER,
	LOGIN, 
}