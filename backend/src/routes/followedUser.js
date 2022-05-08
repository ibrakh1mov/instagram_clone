const checkToken = require('../middlewares/checkToken.js')
const controller = require('../controllers/followedUser.js')
const router = require('express').Router()

router.get('/following/', checkToken, controller.FOLLOWING)
router.get('/following/:userId', checkToken, controller.FOLLOWING)

router.get('/followers/', checkToken, controller.FOLLOWERS)
router.get('/followers/:userId', checkToken, controller.FOLLOWERS)

router.post('/', checkToken, controller.FOLLOW)
router.delete('/', checkToken, controller.UNFOLLOW)


module.exports = router