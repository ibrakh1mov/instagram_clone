const { ServerError } = require('./utils/error.js')
const PORT  = process.env.PORT || 4008
const express = require('express')
const app = express()
const path = require('path')

const modelMiddleware = require('./middlewares/model.js')

app.use(modelMiddleware)
app.use(express.json())
app.use(express.static(path.join(process.cwd(), 'files')))

const userRouter = require('./routes/users.js')
const messageRouter = require('./routes/messages.js')
const authRouter = require('./routes/auth.js')
const postRouter = require('./routes/posts.js')
const commentRouter = require('./routes/comments.js')
const savedPostRouter = require('./routes/savedPost.js')
const likedPostRouter = require('./routes/likedPost.js')
const followedUserRouter = require('./routes/followedUser.js')

app.use('/users', userRouter)
app.use('/auth', authRouter)
app.use('/posts', postRouter)
app.use('/savedPost', savedPostRouter)
app.use('/likedPost', likedPostRouter)
app.use('/followedUser', followedUserRouter)
app.use('/comments', commentRouter)
app.use('/messages', messageRouter)


app.use((error, req, res, next) => {
	console.log(error.status);
	if([400, 401, 404, 413, 415].includes(error.status)) {
		return res.status(error.status).send(error)
	} 

	return res.status(500).send(new ServerError(""))
})
console.log(new Date('05/04/2022 12:17'))
console.log(new Date())
console.log(Date.now())
console.log(86400000);

app.listen(PORT, () => console.log('server is running on http://localhost:' + PORT))