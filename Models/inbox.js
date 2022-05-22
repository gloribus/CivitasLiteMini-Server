module.exports = function (sequelize, Sequelize) {
	const Inbox = sequelize.define(
		'inbox',
		{
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},
			method: {
				type: Sequelize.STRING(10),
			},
			path: {
				type: Sequelize.STRING(255),
			},
			hostname: {
				type: Sequelize.STRING(255),
			},
			ip: {
				type: Sequelize.STRING(255),
			},
			data: {
				type: Sequelize.JSON,
			},
		},
		{
			updatedAt: false,
		}
	);

	return Inbox;
};
