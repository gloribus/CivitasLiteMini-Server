const ApiError = require('../Utils/api-error');

module.exports = function (err, req, res, next) {
	// TODO: in file
	if (err.status !== 401) {
		console.log('UTC-0:', new Date());
		console.log(err);
		console.log(req.user || 'Пользователь не найден');
	}

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
