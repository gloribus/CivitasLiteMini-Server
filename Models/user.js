module.exports = function (sequelize, Sequelize) {
	const User = sequelize.define('user', {
		userID: {
			type: Sequelize.UUID,
			primaryKey: true,
			allowNull: false,
			unique: true,
			defaultValue: Sequelize.UUIDV1,
		},

		invitedBy: {
			type: Sequelize.UUID,
			allowNull: false,
		},

		vkID: {
			type: Sequelize.INTEGER,
			allowNull: true,
			unique: 'vkID',
			defaultValue: null,
		},

		regionID: {
			type: Sequelize.INTEGER,
			allowNull: false,
			validate: {
				min: 0,
				max: 120,
			},
		},

		name: {
			type: Sequelize.STRING(255),
			allowNull: true,
			defaultValue: null,
			validate: {
				len: [1, 255],
			},
		},

		surname: {
			type: Sequelize.STRING(255),
			allowNull: true,
			defaultValue: null,
			validate: {
				len: [1, 255],
			},
		},

		allowedRegions: {
			type: Sequelize.TEXT('long'),
			defaultValue: null,
		},

		status: {
			type: Sequelize.ENUM(
				'active',
				'inactive',
				'admin',
				'frozen',
				'coordinator',
				'federal',
				'without_access'
			),
			defaultValue: 'without_access',
		},
	});

	return User;
};
