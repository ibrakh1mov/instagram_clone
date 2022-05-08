const GET = (req, res) => {
    try {
        let arrUsers = []
        const { userId } = req.params
        const { search, page = 1, limit = 100, } = req.query

        const users = req.select('users')

        for (let j of users) {
            const obj = {
                userId: j.userId,
                username: j.username,
                profileImg: j.profileImg,
                following: j.following,
                followers: j.followers
            }
            arrUsers.push(obj)
        }

        if(userId) {
            return res.json( arrUsers.find(user => user.userId == userId))
        }

        arrUsers = arrUsers.slice(page * limit - limit, page * limit)
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

module.exports = {
    GET
}