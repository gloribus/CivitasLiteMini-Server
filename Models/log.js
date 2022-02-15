module.exports = function (sequelize, Sequelize) {
	const Log = sequelize.define(
		'log',
		{
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},
			userID: {
				type: Sequelize.UUID,
				required: true,
			},
			aimModel: {
				type: Sequelize.STRING(255),
				required: true,
			},
			aimID: {
				type: Sequelize.STRING(255),
				required: true,
			},
			action: {
				type: Sequelize.ENUM('create', 'update', 'delete', 'click'),
				required: true,
			},
			previousValue: {
				type: Sequelize.JSON,
			},
			newValue: {
				type: Sequelize.JSON,
			},
		},
		{
			updatedAt: false,
		}
	);

	return Log;
};
