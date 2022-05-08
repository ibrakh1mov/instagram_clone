const { ClientError } = require('../utils/error.js')

const FOLLOWING = (req, res, next) => {
    try {
        let arrUsers = []
        const { userId } = req.params
        const { search } = req.query

        const users = req.select('users')
		const userIndex = users.findIndex(user => user.userId == req.userId)

		let following = users[userIndex].following

        for (let i of following) {
			for (let j of users) {
				if(j.userId == i) {
					const obj = {
                        userId: j.userId,
                        username: j.username,
                        profileImg: j.profileImg,
                        following: j.following,
                        followers: j.followers
                    }
					arrUsers.push(obj)
				}
			}
		}

        if(userId) {
            return res.json( arrUsers.find(user => user.userId == userId))
        }

        arrUsers = arrUsers.filter(user => {
            let searchFilter = search ? user.username.toLowerCase().includes(search.toLowerCase().trim()) : true
            return searchFilter
        })

		return res.json({
			following: arrUsers,
		})
    } catch(error) {
		return next(error)
	}
}

const FOLLOWERS = (req, res, next) => {
    try {
        let arrUsers = []
        const { userId } = req.params
        const { search } = req.query

        const users = req.select('users')
		const userIndex = users.findIndex(user => user.userId == req.userId)

		let followers = users[userIndex].followers

        for (let i of followers) {
			for (let j of users) {
				if(j.userId == i) {
                    const obj = {
                        userId: j.userId,
                        username: j.username,
                        profileImg: j.profileImg,
                        following: j.following,
                        followers: j.followers
                    }
					arrUsers.push(obj)
				}
			}
		}

        if(userId) {
            return res.json( arrUsers.find(user => user.userId == userId))
        }

        arrUsers = arrUsers.filter(user => {
            let searchFilter = search ? user.username.toLowerCase().includes(search.toLowerCase().trim()) : true
            return searchFilter
        })

        console.log(arrUsers);

		return res.json({
			followers: arrUsers,
		})
    } catch(error) {
		return next(error)
	}
}

const FOLLOW = (req, res, next) => {
    try {
        let { userId } = req.body
        let users = req.select('users')
        const userIndex1 = users.findIndex(user => user.userId == userId)
        const userIndex2 = users.findIndex(user => user.userId == req.userId)

        
        if(userIndex1 == -1) {
            throw new ClientError(404, "There is no such user!")
        }

        users[userIndex1].followers.push(users[userIndex2].userId)
        users[userIndex2].following.push(users[userIndex1].userId)

        req.insert('users', users)

        return res.status(201).json({
			user: users[userIndex1],
			message:"Subscribed!"
		})
    } catch(error) {
		return next(error)
	}
}

const UNFOLLOW = (req, res, next) => {
    try {
		let { userId } = req.body

		if(!userId) {
			throw new ClientError(400, "postId is required!")
		}

        let users = req.select('users')
        const userIndex1 = users.findIndex(user => user.userId == userId)
        const userIndex2 = users.findIndex(user => user.userId == req.userId)

		const found1 = users[userIndex2].following.findIndex(user => user.userId == userId)

		if(found1 == -1) {
			throw new ClientError(404, "There is no such user!")
		}

        const found2 = users[userIndex1].followers.findIndex(user => user.userId == req.userId)

		const [ unfollowedUserId ] = users[userIndex2].following.splice(found1, 1)
        users[userIndex1].followers.splice(found2, 1)

        const unfollowedUser = users.find(user => user.userId == unfollowedUserId)

		req.insert('users', users)

		return res.status(201).json({
			user: unfollowedUser,
			message:"Subscription canceled!"
		})

	} catch(error) {
		return next(error)
	}
}

module.exports = {
    FOLLOWERS,
    FOLLOWING,
    FOLLOW,
    UNFOLLOW
}