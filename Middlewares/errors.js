const ApiError = require('../Utils/api-error');

module.exports = function (err, req, res, next) {
	// TODO: in file
	console.log(err);
	if (err instanceof ApiError) {
		return res
			.status(err.status)
			.json({ message: err.message, errors: err.errors });
	} else {
		console.log(err.stack);
		const massage = err.message || 'Непредвиденная ошибка';
		const status = err.status || 500;
		return res.status(status).json({ massage, ...err });
	}
};
