const Joi = require('joi')

const userValidation = Joi.object({
	// username: Joi.string().min(3).max(30).alphanum().required(),
	password: Joi.string().min(5).max(15).pattern(new RegExp(/(?=.*[A-Za-z]+)(?=.*[0-9]+)(?=.*[@$!%*#?&]+)/)).required()
})


const regValidation = (req, res, next) => {
	const { value, error } = userValidation.validate(req.body)

	if(error) return res.json({
		status: 400,
		message: error.message
	})

	return next()
}


module.exports = {
	regValidation
}