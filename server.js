const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use(session({
  secret: 'secret-key-123',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const users = [];

const caseItems = [
  { id: 1, name: "Rare Sword", rarity: "Rare", chance: 5 },
  { id: 2, name: "Epic Hat", rarity: "Epic", chance: 2 },
  { id: 3, name: "Common Shirt", rarity: "Common", chance: 50 },
  { id: 4, name: "Uncommon Pants", rarity: "Uncommon", chance: 20 },
  { id: 5, name: "Legendary Cape", rarity: "Legendary", chance: 1 },
  { id: 6, name: "Uncommon Shoes", rarity: "Uncommon", chance: 22 },
];

function getRandomItem() {
  const rand = Math.random() * 100;
  let sum = 0;
  for (const item of caseItems) {
    sum += item.chance;
    if (rand <= sum) return item;
  }
  return caseItems[0];
}

app.post('/register', async (req, res) => {
  const { username, password, age } = req.body;
  if (!username || !password || !age) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (age < 18) {
    return res.status(403).json({ error: 'Must be 18 or older' });
  }
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username taken' });
  }
  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed, inventory: [] });
  res.json({ success: true });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.user = username;
  res.json({ success: true });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

function authMiddleware(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.post('/open-case', authMiddleware, (req, res) => {
  const user = users.find(u => u.username === req.session.user);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const prize = getRandomItem();
  user.inventory.push(prize);
  res.json({ success: true, prize });
});

app.get('/inventory', authMiddleware, (req, res) => {
  const user = users.find(u => u.username === req.session.user);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ inventory: user.inventory });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));