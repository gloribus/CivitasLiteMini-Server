const modelName = 'event';
const Model = require('../Models').event;
const ApiError = require('../Utils/api-error');
const allowedProperties = require('../Utils/allowed-properties');

class EventService {
	async get(condition, include = []) {
		const exclude = ['createdAt', 'updatedAt' /*, 'isDeleted'*/];
		const baseCondition = {
			/*isDeleted: false*/
		};
		const finalCondition = { ...condition, ...baseCondition };
		let attributes;
		if (include && include.length > 0) {
			attributes = include;
		} else {
			attributes = { exclude };
		}

		const data = await Model.findAll({
			where: finalCondition,
			attributes,
			order: [['updatedAt', 'DESC']],
		});

		return data;
	}

	async create(object) {
		let data = allowedProperties(object, [
			'regionID',
			'userID',
			'locality',
			'school',
		]);

		if (!data.regionID || !data.userID) {
			throw ApiError.BadRequest('Не указан регион или автор события');
		}

		async function generateCode(regionID) {
			const regionEventsQuantity = await Model.count({
				where: { regionID },
			});

			let serial = regionEventsQuantity + 1;

			// Уникальные код Регион (-) последотовательный символ алфавита или число (33-1 33-a 33-b 33-c 33-1a 33-1b)
			// Последотовательный номер, как номер символа в unicode
			function generateSymbol(serial) {
				let code = '',
					remainder;

				while (serial > 0) {
					remainder = (serial - 1) % 35;
					if (remainder < 9) {
						code += remainder + 1;
					} else {
						code += String.fromCharCode(88 + remainder);
					}

					serial = ((serial - remainder) / 35) | 0;
				}

				return code;
			}

			return regionID + generateSymbol(serial);
		}

		data.id = await generateCode(data.regionID);

		try {
			const created = await Model.create(data);

			const UserService = require('../Services/user');
			await UserService.updateStats(data.userID, 'eventsCNT', 1);

			return created;
		} catch (e) {
			if (e?.original?.errno === 1062) {
				data.id = await generateCode(data.regionID);
				return await Model.create(data);
			} else {
				throw ApiError.DBError(e);
			}
		}
	}

	/* 	async update(data, id, condition) {
		if (!id) {
			throw ApiError.BadRequest('Не указан ID');
		}

		let allowedData = allowedProperties(data, ['score']);

		const baseCondition = { uuid: id };
		const finalCondition = { ...condition, ...baseCondition };

		const isUpdated = await Model.update(allowedData, {
			where: finalCondition,
		});

		return isUpdated;
	} */

	/* 	async delete(id, condition) {
		if (!id) {
			throw ApiError.BadRequest('Не указан ID');
		}

		const baseCondition = { uuid: id };
		const finalCondition = { ...condition, ...baseCondition };

		const isDeleted = await Model.update(
			{ isDeleted: 1 },
			{
				where: finalCondition,
			}
		);

		console.log(isDeleted);

		return isDeleted;
	} */

	// await Service.updateStats('14-1', 'participantsCNT', 10);
	async updateStats(id, aim, value) {
		if (!id) {
			throw ApiError.BadRequest('Не указан ID');
		}

		if (!aim || !value) {
			throw ApiError.BadRequest('Не указаны данные для обновления');
		}

		if (!['participantsCNT', 'ideasCNT'].includes(aim)) {
			throw ApiError.BadRequest('Неверное значение aim');
		}
		const isUpdated = await Model.increment(aim, {
			by: value,
			where: { id },
		});

		return Boolean(isUpdated[0][1]);
	}

	async getStats() {
		const CNT = await Model.count({
			attributes: ['regionID'],
			group: 'regionID',
			where: { isDeleted: 0 },
		});

		return CNT;
	}

}

module.exports = new EventService();
