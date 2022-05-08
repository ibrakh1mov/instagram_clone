const checkToken = require('../middlewares/checkToken.js')
const controller = require('../controllers/savedPost.js')
const router = require('express').Router()

router.get('/', checkToken, controller.GET)
router.get('/:postId', checkToken, controller.GET)
router.post('/', checkToken, controller.SAVE)
router.delete('/', checkToken, controller.UNSAVE)


module.exports = router