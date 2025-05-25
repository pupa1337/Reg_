import express from 'express';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret_key';

app.use(session({
    secret: 'your_session_secret_key',
    resave: false,
    saveUninitialized: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    if (req.url.endsWith('.html')) {
        return res.status(403).send("Доступ запрещён")
    }
    next();
})
app.use(express.static('public'));

const users = [
    { username: 'Admin', password: 'admin123', role: 'admin' },
    { username: 'User', password: 'user123', role: 'user' },
    { username: 'Moderator', password: 'moderator123', role: 'moderator' }
];

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: false });

        return res.json({ message: `Успешно авторизован как ${user.role}`, role: user.role, username: user.username });
    }

    return res.status(401).json({ message: 'Неверные имя пользователя или пароль.' });
});

function checkRole(role) {
    return (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'Необходима аутентификация.' });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Неверный токен.' });
            }
            // Меняем условие здесь
            if (decoded.role !== role) {
                return res.status(403).json({ message: 'Доступ запрещен.' }); // статус запрещен
            }
            req.user = decoded;
            next();
        });
    };
}


app.get('/admin', checkRole('admin'), (req, res) => {
    console.log(`Администратор ${req.user.username} успешно получил доступ.`);
    res.json({ message: `Добро пожаловать, администратор ${req.user.username}!` }); // Оповещение о доступе
});


app.get('/moderator', checkRole('moderator'), (req, res) => {
    console.log(`Модератор ${req.user.username} успешно получил доступ.`);
    res.json({ message: `Добро пожаловать, модератор ${req.user.username}!` });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
