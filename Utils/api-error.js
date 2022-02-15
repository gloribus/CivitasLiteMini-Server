module.exports = class ApiError extends Error {
	status;
	errors;

	constructor(status, message, errors = []) {
		super(message);
		this.status = status;
		this.errors = errors;
		this.message = message || 'Ошибка';
	}

	static UnauthorizedError() {
		return new ApiError(401, 'Пользователь не авторизован');
	}

	static Forbidden() {
		return new ApiError(403, 'Нет прав на данный запрос');
	}

	static BadRequest(message, errors = []) {
		return new ApiError(400, message, errors);
	}

	static NotFound(message, errors = []) {
		return new ApiError(404, message, errors);
	}

	static DBError(errors = []) {
		return new ApiError(500, 'Ошибка при запросе к базе данных', errors);
	}
};
