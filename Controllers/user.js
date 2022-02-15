const Service = require('../Services/user');
const ApiError = require('../Utils/api-error');

/* const { validationResult } = require('express-validator'); */

class UserController {
	/* 	async create(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return next(
					ApiError.BadRequest(
						'Ошибка при валидации данных',
						errors.array()
					)
				);
			}

			const user = await UserService.create(req.body);

			return res.status(201).json(user);
		} catch (e) {
			next(e);
		}
	} */
	/* 
	async getAll(req, res, next) {
		try {
			//const posts = await PostService.getAll();
			//return res.json(posts);
			return res.status(201).json([123, 41]);
		} catch (e) {
			next(e);
		}
	} */

	/*   async create(req, res, next) {
      try {
          const post = await PostService.create(req.body, req.files.picture)
          res.json(post)
      } catch (e) {
          next(e);
      }
  }

  async getOne(req, res, next) {
      try {
          const post = await PostService.getOne(req.params.id)
          return res.json(post)
      } catch (e) {
          next(e);
      }
  }
  async update(req, res, next) {
      try {
          const updatedPost = await PostService.update(req.body);
          return res.json(updatedPost);
      } catch (e) {
          res.status(500).json(e.message)
      }
  }
  async delete(req, res, next) {
      try {
          const post = await PostService.create(req.params.id);
          return res.json(post)
      } catch (e) {
          next(e);
      }
  } */

	async update(req, res, next) {
		try {
			//const userAllowedRegions = JSON.parse(userDTO.allowedRegions);
			if (req.body.regionID) {
				if (
					!req.user.userAllowedRegions.includes(
						parseInt(req.body.regionID)
					)
				) {
					return next(ApiError.Forbidden());
				}
			}

			const condition = { status: 'coordinator' };
			const isUpdated = await Service.update(
				req.body,
				req.user.userID,
				condition
			);

			return res.json({ success: Boolean(Number(isUpdated)) });
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new UserController();
