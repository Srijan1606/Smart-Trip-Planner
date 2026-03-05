const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const USERS_FILE = path.join(__dirname, 'users.json');

app.use(
    cors({
        origin: true,
        credentials: true,
    }),
);
app.use(express.json({ limit: '1mb' }));

function clampInt(value, min, max) {
    const numberValue = Number.parseInt(String(value), 10);
    if (!Number.isFinite(numberValue)) return min;
    return Math.min(max, Math.max(min, numberValue));
}

function buildPackingDataFallback({ durationDays, activities }) {
    const days = clampInt(durationDays, 1, 60);
    const selectedActivities = Array.isArray(activities) ? activities : [];

    const tops = Math.min(14, Math.max(2, Math.ceil(days * 0.7) + 1));
    const underwear = Math.min(14, Math.max(2, days + 1));
    const socks = Math.min(14, Math.max(2, days + 1));
    const bottoms = Math.max(1, Math.ceil(days / 3));

    let nextId = 1;
    const item = (name) => ({ id: nextId++, name, packed: false });

    const categories = [
        {
            title: '🛂 Essentials',
            items: [
                item('Passport / ID (and a photo copy)'),
                item('Wallet + payment method'),
                item('Tickets / itinerary (offline)'),
                item('Travel insurance details'),
                item('Medications (as needed)'),
            ],
        },
        {
            title: '👕 Clothing',
            items: [
                item(`Tops & shirts (${tops}x)`),
                item(`Bottoms (${bottoms}x)`),
                item(`Underwear (${underwear}x)`),
                item(`Socks (${socks}x)`),
                item('Comfortable shoes'),
                item('Light jacket / hoodie'),
            ],
        },
        {
            title: '🪥 Toiletries',
            items: [
                item('Toothbrush + toothpaste'),
                item('Deodorant'),
                item('Sunscreen'),
                item('Basic first-aid (bandages, pain relief)'),
            ],
        },
        {
            title: '💻 Tech',
            items: [item('Phone + charger'), item('Power bank'), item('Headphones')],
        },
    ];

    const has = (label) => selectedActivities.includes(label);

    if (has('🏖️ Beach')) {
        categories.push({
            title: '🌴 Beach Vibes',
            items: [item('Swimsuit'), item('Flip-flops'), item('After-sun lotion'), item('Sunglasses')],
        });
    }
    if (has('🥾 Hiking')) {
        categories.push({
            title: '⛰️ Hiking',
            items: [item('Hiking shoes/boots'), item('Daypack'), item('Hat'), item('Insect repellent')],
        });
    }
    if (has('💼 Business')) {
        const clothing = categories.find((c) => c.title.includes('Clothing'));
        const tech = categories.find((c) => c.title.includes('Tech'));
        clothing?.items.push(item('Business outfit'), item('Dress shoes'));
        tech?.items.push(item('Laptop (optional) + adapter'));
    }
    if (has('🎿 Snow')) {
        categories.push({
            title: '❄️ Snow / Cold',
            items: [item('Thermal base layers'), item('Gloves'), item('Beanie'), item('Warm socks')],
        });
    }
    if (has('📸 Sightseeing')) {
        categories.push({
            title: '🏙️ Sightseeing',
            items: [item('Small day bag'), item('Comfortable walking shoes'), item('Portable water bottle')],
        });
        const tech = categories.find((c) => c.title.includes('Tech'));
        tech?.items.push(item('Camera (optional) + spare battery'));
    }

    return { packingData: categories, aiTips: [] };
}

function weatherCodeToIconAndText(code) {
    // Open-Meteo WMO weather codes
    if (code === 0) return { icon: '☀️', text: 'Clear' };
    if (code === 1 || code === 2) return { icon: '🌤️', text: 'Mostly clear' };
    if (code === 3) return { icon: '☁️', text: 'Cloudy' };
    if (code === 45 || code === 48) return { icon: '🌫️', text: 'Fog' };
    if (code === 51 || code === 53 || code === 55) return { icon: '🌦️', text: 'Drizzle' };
    if (code === 61 || code === 63 || code === 65) return { icon: '🌧️', text: 'Rain' };
    if (code === 71 || code === 73 || code === 75) return { icon: '❄️', text: 'Snow' };
    if (code === 80 || code === 81 || code === 82) return { icon: '🌧️', text: 'Showers' };
    if (code === 95) return { icon: '⛈️', text: 'Thunderstorm' };
    return { icon: '🌡️', text: 'Weather' };
}

async function fetchWeather(destination) {
    const query = String(destination || '').trim();
    if (!query) return null;

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error('Geocoding failed');
    const geo = await geoRes.json();
    const place = geo?.results?.[0];
    if (!place) return null;

    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) throw new Error('Weather lookup failed');
    const forecast = await forecastRes.json();

    const currentCode = forecast?.current?.weather_code;
    const currentMap = weatherCodeToIconAndText(currentCode);

    const daily = [];
    const days = forecast?.daily?.time || [];
    for (let i = 0; i < Math.min(4, days.length); i += 1) {
        const code = forecast?.daily?.weather_code?.[i];
        const map = weatherCodeToIconAndText(code);
        daily.push({
            date: days[i],
            icon: map.icon,
            text: map.text,
            maxC: forecast?.daily?.temperature_2m_max?.[i],
            minC: forecast?.daily?.temperature_2m_min?.[i],
        });
    }

    return {
        location: {
            name: place.name,
            country: place.country,
            latitude: place.latitude,
            longitude: place.longitude,
        },
        current: {
            tempC: forecast?.current?.temperature_2m,
            icon: currentMap.icon,
            text: currentMap.text,
        },
        daily,
    };
}

async function groqGeneratePacking({ destination, durationDays, activities }) {
    if (!GROQ_API_KEY) return null;

    const payload = {
        model: GROQ_MODEL,
        temperature: 0.2,
        messages: [
            {
                role: 'system',
                content:
                    'You generate travel packing lists. Return STRICT JSON only (no markdown). Schema: {"categories":[{"title":string,"items":string[]}],"tips":string[]}. Keep titles short with emojis where appropriate. Items should be practical.',
            },
            {
                role: 'user',
                content: JSON.stringify({
                    destination,
                    durationDays,
                    activities,
                }),
            },
        ],
    };

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Groq request failed: ${res.status} ${text}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    // Defensive JSON extraction: some models return extra text.
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    const maybeJson = firstBrace !== -1 && lastBrace !== -1 ? content.slice(firstBrace, lastBrace + 1) : content;

    let parsed;
    try {
        parsed = JSON.parse(maybeJson);
    } catch {
        return null;
    }

    if (!parsed?.categories || !Array.isArray(parsed.categories)) return null;

    let nextId = 1;
    const packingData = parsed.categories.map((c) => ({
        title: String(c.title || 'Category'),
        items: Array.isArray(c.items)
            ? c.items.slice(0, 30).map((name) => ({
                    id: nextId++,
                    name: String(name),
                    packed: false,
                }))
            : [],
    }));

    const aiTips = Array.isArray(parsed.tips)
        ? parsed.tips.slice(0, 6).map((t) => String(t))
        : [];

    return { packingData, aiTips };
}

function issueToken({ email }) {
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
}

async function readUsers() {
    try {
        const raw = await fs.readFile(USERS_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function writeUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function hashPassword(password, saltHex) {
    const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
    const derived = crypto.scryptSync(String(password), salt, 32);
    return { saltHex: salt.toString('hex'), hashHex: derived.toString('hex') };
}

function verifyPassword(password, user) {
    if (!user?.saltHex || !user?.hashHex) return false;
    const { hashHex } = hashPassword(password, user.saltHex);
    return crypto.timingSafeEqual(Buffer.from(hashHex, 'hex'), Buffer.from(user.hashHex, 'hex'));
}

function getAuthUser(req) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
    if (!token) return null;
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'trip-planner-backend' });
});

app.post('/api/auth/login', (req, res) => {
    const identifierRaw = String(req.body?.email || '');
    const identifierEmail = normalizeEmail(identifierRaw);
    const password = String(req.body?.password || '');

    if (!identifierRaw.trim() || !password) {
        res.status(400).json({ ok: false, message: 'Email/ID and password required.' });
        return;
    }

    (async () => {
        const users = await readUsers();
        const found = users.find(
            (u) => u.id === identifierRaw.trim() || normalizeEmail(u.email) === identifierEmail,
        );

        if (found) {
            if (!verifyPassword(password, found)) {
                res.status(401).json({ ok: false, message: 'Invalid credentials.' });
                return;
            }
            const token = issueToken({ email: found.email });
            res.json({ ok: true, token, user: { id: found.id, email: found.email } });
            return;
        }

        // Admin fallback for early setup
        if (identifierEmail !== normalizeEmail(ADMIN_EMAIL) || password !== ADMIN_PASSWORD) {
            res.status(401).json({ ok: false, message: 'Invalid credentials.' });
            return;
        }

        const token = issueToken({ email: identifierEmail });
        res.json({ ok: true, token, user: { email: identifierEmail } });
    })().catch((err) => {
        res.status(500).json({ ok: false, message: err?.message || 'Login error' });
    });
});

app.post('/api/auth/register', (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!email || !email.includes('@')) {
        res.status(400).json({ ok: false, message: 'Valid email is required.' });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({ ok: false, message: 'Password must be at least 8 characters.' });
        return;
    }

    (async () => {
        const users = await readUsers();
        if (users.some((u) => normalizeEmail(u.email) === email)) {
            res.status(409).json({ ok: false, message: 'Account already exists.' });
            return;
        }

        const { saltHex, hashHex } = hashPassword(password);
        const now = new Date().toISOString();
        const id = crypto.randomUUID();
        users.push({
            id,
            email,
            saltHex,
            hashHex,
            createdAt: now,
        });
        await writeUsers(users);

        const token = issueToken({ email });
        res.json({ ok: true, token, user: { id, email } });
    })().catch((err) => {
        res.status(500).json({ ok: false, message: err?.message || 'Register error' });
    });
});

app.get('/api/auth/me', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
        res.status(401).json({ ok: false });
        return;
    }
    res.json({ ok: true, user: { email: user.email } });
});

app.get('/api/weather', async (req, res) => {
    try {
        const destination = req.query.destination || req.query.q;
        const weather = await fetchWeather(destination);
        res.json({ ok: true, weather });
    } catch (err) {
        res.status(500).json({ ok: false, message: err?.message || 'Weather error' });
    }
});

app.post('/api/generate-list', async (req, res) => {
    const destination = String(req.body?.destination || '').trim();
    const durationDays = clampInt(req.body?.duration, 1, 60);
    const activities = Array.isArray(req.body?.activities) ? req.body.activities : [];

    if (!destination) {
        res.status(400).json({ ok: false, message: 'Destination is required.' });
        return;
    }

    const startedAt = Date.now();
    try {
        const weatherPromise = fetchWeather(destination).catch(() => null);

        let aiResult = null;
        let aiError = null;
        try {
            aiResult = await groqGeneratePacking({ destination, durationDays, activities });
        } catch (e) {
            aiError = e?.message || String(e);
        }

        const fallback = buildPackingDataFallback({ durationDays, activities });
        const weather = await weatherPromise;

        res.json({
            ok: true,
            destination,
            durationDays,
            activities,
            packingData: aiResult?.packingData || fallback.packingData,
            aiTips: aiResult?.aiTips || fallback.aiTips,
            weather,
            usedAI: Boolean(aiResult),
            aiError,
            auth: Boolean(getAuthUser(req)),
            ms: Date.now() - startedAt,
        });
    } catch (err) {
        res.status(500).json({ ok: false, message: err?.message || 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Trip Planner Backend running on http://localhost:${PORT}`);
});