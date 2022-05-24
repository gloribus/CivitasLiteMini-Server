module.exports = function (sequelize, Sequelize) {
	const MarafonIdea = sequelize.define('marafonIdea', {
		uuid: {
			type: Sequelize.UUID,
			primaryKey: true,
			allowNull: false,
			unique: true,
			defaultValue: Sequelize.UUIDV1,
		},
		title: {
			type: Sequelize.TEXT(),
			allowNull: false,
		},
		description: {
			type: Sequelize.TEXT(),
			allowNull: false,
		},
		problem: {
			type: Sequelize.TEXT(),
			allowNull: true,
		},
		audience: {
			type: Sequelize.TEXT(),
			allowNull: true,
		},
		attracting: {
			type: Sequelize.TEXT(),
			allowNull: true,
		},
		resources: {
			type: Sequelize.TEXT(),
			allowNull: true,
		},
		steps: {
			type: Sequelize.TEXT(),
			allowNull: true,
		},
		regionID: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		eventID: {
			type: Sequelize.STRING(255),
			allowNull: true,
		},
		isDeleted: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		},
	});

	MarafonIdea.associate = (models) => {
		MarafonIdea.belongsTo(models.event, {
			foreignKey: 'eventID',
			sourceKey: 'id',
		});
	};

	return MarafonIdea;
};
