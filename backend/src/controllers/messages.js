const timeConverter = require('../utils/timeConverter.js')
const { ClientError } = require('../utils/error.js')
const path = require('path')
const fs = require('fs')

const GET = (req, res) => {
    try {
		const { messageId } = req.params
		const { 
			page = 1,
			limit = 100,
			userId
		} = req.query

		let messages = req.select('messages')
		messages = messages.map(message => {
			message.messageCreatedAt = timeConverter(message.messageCreatedAt)
			return message
		})

        messages = messages.slice(page * limit - limit, page * limit)
        messages = messages.filter(message => {
			let userFilter =  userId ? (message.fromuserId == userId || message.fromuserId == req.userId) && (message.touserId == userId || message.touserId == req.userId) : true

			return userFilter
		})

		if(messageId) {
			return res.json( messages.find(message => message.messageId == messageId))
		} 

		return res.json(messages)

	} catch(error) {
		return res.json({
            status: error.status,
            message: error.message
        })
	}
}

const POST = (req, res) => {
    try {
        const { messagebody, touserId } = req.body
        if(messagebody) {
            const users = req.select('users')
            const found = users.findIndex(user => user.userId == touserId)

            if(found == -1) {
                throw new ClientError(404, "There is no such user!")
            }

            if(messagebody.length < 1) {
                throw new ClientError(400, "messagebody is required!")
            }
    
            if(messagebody.length > 30) {
                throw new ClientError(413, "messagebody is too long!")
            }

            const messages = req.select('messages')

            const newmessage = {
                messageId: messages.length ? messages[messages.length - 1].messageId + 1 : 1,
                messagebody: messagebody,
                touserId: touserId,
                fromuserId: req.userId,
                messageCreatedAt: Date()
            }

            messages.push(newmessage)

            req.insert('messages',messages)

            return res.status(201).json({
                post: newmessage,
                message: "The message has been sended!"
            })
        } else {
            const messages = req.select('messages')
            const { size, mimetype, buffer, originalname } = req.file

            if(size > (200 * 1024 * 1024)) {
                throw new ClientError(413, "The file larger than 200MB!")
            }
            
            if(!['image/png', 'image/jpeg', 'image/jpg', 'video/mp4'].includes(mimetype)) {
                throw new ClientError(415, "The file must be mp4!, jpg, jpeg or png!")
            }
    
            const fileName = Date.now() % 1000 + originalname.replace(/\s/g, '')
            const pathName = path.join(process.cwd(), 'files', 'messages', fileName)

            fs.writeFileSync(pathName, buffer)

            const newmessage = {
                messageId: messages.length ? messages[messages.length - 1].messageId + 1 : 1,
                messagepath: '/messages/' + fileName,
                touserId: parseInt(touserId),
                fromuserId: req.userId,
                messageCreatedAt: Date()
            }

            messages.push(newmessage)

            req.insert('messages',messages)

            return res.status(201).json({
                post: newmessage,
                message: "The message has been sended!"
            })
        }
    } catch (error) {
        return res.json({
            status: error.status,
            message: error.message
        })
    }
}

const DELETE = (req, res) => {
    try {
		let { messageId } = req.body

		if(!messageId) {
			throw new ClientError(400, "postId is required!")
		}

		const messages = req.select('messages')
		const found = messages.findIndex(message => message.messageId == messageId && message.fromuserId == req.userId)

		if(found == -1) {
			throw new ClientError(404, "There is no such message!")
		}

        if(messages[found].messagebody) {
            const [ deletedmessage ] = messages.splice(found, 1)

		    req.insert('messages', messages)

		    return res.status(201).json({
		    	post: deletedmessage,
		    	message:"The message is deleted!"
		    })
        } else {
            const [ deletedmessage ] = messages.splice(found, 1)
            fs.unlinkSync(path.join(process.cwd(), 'files', deletedmessage.messagepath))
    
            req.insert('messages', messages)
    
            return res.status(201).json({
                post: deletedmessage,
                message:"The post is deleted!"
            })
        }


	} catch(error) {
        console.log(error);
        return res.json({
            status: error.status,
            message: error.message
        })
	}
}

module.exports = {
    GET,
    POST,
    DELETE
}