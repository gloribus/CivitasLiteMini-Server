const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const errorMiddleware = require('./Middlewares/errors');

//const passport   = require('passport');
//const session    = require('express-session');
const bodyParser = require('body-parser');

// Инициализация Helmet
app.use(helmet());
// Инициализация CORS
app.use(
	cors({
		credentials: true,
		origin: [
			'https://regioncaptains.ru',
			'https://bigbusinessgame.ru',
			'https://nastavniki.pro/',
			'http://localhost:3000',
			'https://xn--b1aeda3a0j.xn--p1ai',
		],
	})
);

// Для работы с Сookie
app.use(cookieParser());

// Поддержка JSON и кодировки URL
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('dotenv').config({ path: 'Config/' + process.env.NODE_ENV + '/.env' });
// Модели
const models = require('./Models');

// Маршрутизация
const authRouter = require('./Routes/auth');
const userRouter = require('./Routes/user');
const participantRouter = require('./Routes/participant');
const teamRouter = require('./Routes/team');
const logRouter = require('./Routes/log');
const MockRouter = require('./Routes/mock');
const handlerRouter = require('./Routes/handler');
const publicRouter = require('./Routes/public');

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/participant', participantRouter);
app.use('/team', teamRouter);
app.use('/log', logRouter);
app.use('/mock', MockRouter);
app.use('/handler', cors({ origin: '*' }), handlerRouter);
app.use('/public', cors({ origin: '*' }), publicRouter);

// Обработчик ошибок
app.use(errorMiddleware);

//Passport стратегии
//require('./app/config/passport/passport.js')(passport, models.user);

// Секретный ключ сессии
//app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized:true}));

// Инициализация Passport
//app.use(passport.initialize());
//app.use(passport.session());

app.get('/', function (req, res) {
	res.send('Welcome to Civitas');
});

// Синхронизация БД
//models.sequelize.sync({ force: true }).then(function() {
//models.sequelize.sync().then(function() {
models.sequelize
	.sync({
		/* alter: true */
	})
	.then(function () {
		// Запуск сервера
		app.listen(process.env.PORT, function (err) {
			if (!err) console.log('Server is alive - ' + process.env.PORT);
			else console.log(err);
		});
	})
	.catch(function (err) {
		console.log(err, 'Something went wrong with the Database Update!');
	});
