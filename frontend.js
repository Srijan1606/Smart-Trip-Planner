import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './src/auth/AuthContext.jsx';

const DEFAULT_BACKEND_PORT = 5000;
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== 'undefined'
    ? `http://${window.location.hostname}:${DEFAULT_BACKEND_PORT}`
    : `http://localhost:${DEFAULT_BACKEND_PORT}`);

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    window.clearTimeout(timer);
  }
}

const activitiesList = ['🏖️ Beach', '🥾 Hiking', '💼 Business', '🎿 Snow', '📸 Sightseeing'];
const popularDestinations = [
  'Tokyo, Japan',
  'Bali, Indonesia',
  'Paris, France',
  'Cape Town, South Africa',
  'Dubai, UAE',
  'New York, USA',
];

function clampInt(value, min, max) {
  const numberValue = Number.parseInt(String(value), 10);
  if (!Number.isFinite(numberValue)) return min;
  return Math.min(max, Math.max(min, numberValue));
}

function buildPackingData({ durationDays, selectedActivities }) {
  const days = clampInt(durationDays, 1, 60);

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

  return categories;
}

function BrandMark() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-cyan-400 to-emerald-300 shadow-[0_10px_30px_rgba(79,70,229,0.25)] grid place-items-center">
        <span className="text-white font-black">✈️</span>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-black tracking-tight text-white">PackPilot</div>
        <div className="text-[11px] font-extrabold tracking-widest uppercase text-white/60">
          Smart Packing
        </div>
      </div>
    </Link>
  );
}

function TopNav({ variant, onReset }) {
  const isDark = variant === 'dark';
  const { isAuthenticated, logout } = useAuth();
  return (
    <header className={`${isDark ? 'text-white' : 'text-slate-900'} w-full`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-10 py-5 flex items-center justify-between gap-4">
        <BrandMark />

        <nav className={`hidden md:flex items-center gap-7 text-sm font-black ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
          <Link className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition`} to="/explore">
            Explore
          </Link>
          <Link className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition`} to="/deals">
            Deals
          </Link>
          <Link className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition`} to="/support">
            Support
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black border transition ${
              isDark
                ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
            }`}
            onClick={() => {
              window.open('https://github.com/', '_blank', 'noopener,noreferrer');
            }}
          >
            <span aria-hidden="true">⭐</span>
            Star
          </button>
          {onReset ? (
            <button
              type="button"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition shadow ${
                isDark
                  ? 'bg-white text-slate-950 hover:bg-blue-50'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
              onClick={onReset}
            >
              <span aria-hidden="true">✨</span>
              New Trip
            </button>
          ) : (
            isAuthenticated ? (
              <button
                type="button"
                onClick={() => logout()}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black border transition ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <span aria-hidden="true">🚪</span>
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black border transition ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <span aria-hidden="true">👤</span>
                Login
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}

export default function HeroForm() {
  const { token } = useAuth();
  const location = useLocation();
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);

  // 'form' -> 'loading' -> 'results'
  const [appState, setAppState] = useState('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [packingData, setPackingData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPackedOnly, setShowPackedOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [weather, setWeather] = useState(null);
  const [aiTips, setAiTips] = useState([]);
  const [usedAI, setUsedAI] = useState(false);

  const timerRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || '');
      const dest = params.get('destination');
      if (dest) {
        setDestination(dest);
      }
    } catch {
      // ignore
    }
  }, [location.search]);

  const showToast = (message) => {
    setToastMessage(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(''), 2200);
  };

  const toggleActivity = (activity) => {
    setSelectedActivities((current) =>
      current.includes(activity) ? current.filter((a) => a !== activity) : [...current, activity],
    );
  };

  const totals = useMemo(() => {
    const total = packingData.reduce((sum, cat) => sum + cat.items.length, 0);
    const packed = packingData.reduce(
      (sum, cat) => sum + cat.items.filter((i) => i.packed).length,
      0,
    );
    return { total, packed, percent: total ? Math.round((packed / total) * 100) : 0 };
  }, [packingData]);

  const handleSubmit = (e) => {
    (async () => {
      e.preventDefault();
      setErrorMessage('');
      setWeather(null);
      setAiTips([]);
      setUsedAI(false);

      const durationDays = Number(duration);
      if (!Number.isFinite(durationDays) || durationDays < 1) {
        setErrorMessage('Please enter a valid trip length (at least 1 day).');
        return;
      }

      if (timerRef.current) window.clearTimeout(timerRef.current);

      try {
        const trip = {
          destination: String(destination || '').trim(),
          durationDays,
          activities: Array.isArray(selectedActivities) ? selectedActivities : [],
          createdAt: new Date().toISOString(),
        };
        window.localStorage.setItem('packpilot_last_trip', JSON.stringify(trip));
      } catch {
        // ignore storage failures
      }

      setAppState('loading');

      // Local fallback immediately.
      setPackingData(
        buildPackingData({
          durationDays,
          selectedActivities,
        }),
      );

      const minDelay = new Promise((r) => setTimeout(r, 650));

      try {
        const res = await fetchWithTimeout(
          `${BACKEND_URL}/api/generate-list`,
          {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            destination,
            duration: durationDays,
            activities: selectedActivities,
          }),
          },
          9000,
        );

        const data = await res.json().catch(() => ({}));
        await minDelay;

        if (!res.ok || !data?.ok) {
          throw new Error(data?.message || 'Backend failed');
        }

        if (Array.isArray(data?.packingData) && data.packingData.length) {
          setPackingData(data.packingData);
        }
        if (data?.weather) setWeather(data.weather);
        if (Array.isArray(data?.aiTips)) setAiTips(data.aiTips);
        setUsedAI(Boolean(data?.usedAI));

        if (data?.aiError) {
          showToast('AI failed — used fallback list');
        }
      } catch (err) {
        await minDelay;
        const msg =
          err?.name === 'AbortError'
            ? `Backend timed out (${BACKEND_URL})`
            : err?.message
              ? err.message
              : `Backend offline (${BACKEND_URL})`;
        showToast(`${msg} — using local list`);
      }

      setAppState('results');
    })();
  };

  const toggleItem = (categoryIndex, itemId) => {
    setPackingData((current) =>
      current.map((cat, idx) => {
        if (idx !== categoryIndex) return cat;
        return {
          ...cat,
          items: cat.items.map((it) => (it.id === itemId ? { ...it, packed: !it.packed } : it)),
        };
      }),
    );
  };

  const resetApp = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setAppState('form');
    setErrorMessage('');
    setDestination('');
    setDuration('');
    setSelectedActivities([]);
    setPackingData([]);
    setSearchQuery('');
    setShowPackedOnly(false);
    setWeather(null);
    setAiTips([]);
    setUsedAI(false);
  };

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-900">
        <TopNav variant="dark" />
        <div className="px-6 pb-14 pt-6 flex items-center justify-center">
          <div className="relative max-w-sm w-full">
            <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-indigo-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 flex flex-col items-center border border-white/15">
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 border-4 border-indigo-200/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-indigo-300 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">✈️</div>
          </div>
          <h3 className="text-2xl font-extrabold text-white text-center mb-2">
            Building your list
          </h3>
          <p className="text-indigo-100/80 text-center font-medium">
            {destination ? (
              <>
                Mapping <span className="font-bold text-indigo-100">{destination}</span>…
              </>
            ) : (
              'Cross-referencing activities…'
            )}
          </p>
          <div className="mt-8 w-full">
            <div className="flex items-center justify-between text-[11px] font-black text-indigo-100/70">
              <span>Preparing categories</span>
              <span>Almost there</span>
            </div>
            <div className="mt-2 h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-2.5 w-2/3 rounded-full bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300 animate-pulse" />
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'results') {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-950 font-sans">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="pointer-events-none absolute top-24 -right-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />

        <TopNav variant="dark" onReset={resetApp} />

        <div className="max-w-6xl mx-auto relative px-4 md:px-10 pb-14">
          <div className="rounded-[2rem] p-[1px] bg-gradient-to-r from-indigo-500/40 via-cyan-400/30 to-purple-500/40 shadow-2xl mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-blue-950/95 text-white p-8 rounded-[2rem] gap-8">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase text-blue-100/80">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_6px_rgba(52,211,153,0.15)]" />
                    Packing Dashboard
                  </span>
                  <span className="hidden sm:inline-flex text-xs font-bold text-blue-100/70">•</span>
                  <span className="hidden sm:inline-flex text-xs font-bold text-blue-100/70">
                    {clampInt(duration, 1, 60)} day(s)
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black break-words leading-tight">
                  {destination}
                </h2>

                {selectedActivities.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedActivities.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-extrabold text-blue-50"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-semibold text-blue-100/80">
                    No activities selected — essentials only.
                  </p>
                )}

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs font-extrabold text-blue-100/80">
                    <span>
                      Packed: {totals.packed}/{totals.total}
                    </span>
                    <span>{totals.percent}%</span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-white/15 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300"
                      style={{ width: `${totals.percent}%` }}
                    />
                  </div>
                </div>

                {totals.percent === 100 ? (
                  <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-100">
                    ✅ You’re fully packed. This is elite.
                  </div>
                ) : null}
              </div>

              <div className="w-full lg:w-auto">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-widest text-blue-100/70 font-black">
                      Remaining
                    </p>
                    <p className="text-2xl font-black text-white">
                      {Math.max(0, totals.total - totals.packed)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-widest text-blue-100/70 font-black">
                      Categories
                    </p>
                    <p className="text-2xl font-black text-white">{packingData.length}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white px-5 py-3 rounded-full font-black transition shadow-lg"
                  >
                    <span aria-hidden="true">🖨️</span>
                    Print / Save PDF
                  </button>
                  <button
                    onClick={async () => {
                      const text = `Packing list for ${destination} (${clampInt(duration, 1, 60)} day(s))\nActivities: ${
                        selectedActivities.length ? selectedActivities.join(', ') : 'None'
                      }\nPacked: ${totals.packed}/${totals.total}`;
                      try {
                        await navigator.clipboard.writeText(text);
                        showToast('Copied trip summary to clipboard');
                      } catch {
                        showToast('Copy failed — your browser blocked clipboard');
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-white text-blue-950 px-5 py-3 rounded-full font-black hover:bg-blue-50 transition shadow-lg"
                  >
                    <span aria-hidden="true">🔗</span>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <div className="bg-white/10 backdrop-blur border border-white/15 rounded-3xl shadow-2xl p-4 md:p-5 mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="flex-1">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-white/70 mb-2">
                      Find an item
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔎</span>
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Try: passport, socks, charger…"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/95 border border-white/10 focus:ring-4 focus:ring-indigo-300/40 focus:border-indigo-300/60 outline-none font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPackedOnly((v) => !v)}
                      className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black border transition ${
                        showPackedOnly
                          ? 'bg-indigo-500 text-white border-indigo-500'
                          : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
                      }`}
                    >
                      <span aria-hidden="true">✅</span>
                      Packed only
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPackingData((current) =>
                          current.map((cat) => ({
                            ...cat,
                            items: cat.items.map((it) => ({ ...it, packed: true })),
                          })),
                        );
                        showToast('Marked everything as packed');
                      }}
                      className="hidden md:inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black border bg-white/10 text-white border-white/15 hover:bg-white/15 transition"
                    >
                      <span aria-hidden="true">⚡</span>
                      Pack all
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packingData.map((category, catIndex) => {
                  const totalItems = category.items.length;
                  const packedItems = category.items.filter((i) => i.packed).length;
                  const categoryPercent = totalItems ? Math.round((packedItems / totalItems) * 100) : 0;

                  const visibleItems = category.items.filter((it) => {
                    if (showPackedOnly && !it.packed) return false;
                    if (!normalizedQuery) return true;
                    return it.name.toLowerCase().includes(normalizedQuery);
                  });

                  return (
                    <div
                      key={category.title}
                      className="group relative rounded-[1.75rem] p-[1px] bg-gradient-to-br from-white/15 via-white/5 to-white/10 hover:from-indigo-400/30 hover:via-white/5 hover:to-cyan-400/20 transition"
                    >
                      <div className="bg-white/10 backdrop-blur rounded-[1.75rem] p-6 shadow-2xl border border-white/15 hover:bg-white/12 transition">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <h3 className="text-lg md:text-xl font-black text-white">
                            {category.title}
                          </h3>
                          <span className="shrink-0 inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 text-xs font-black">
                            {packedItems}/{totalItems}
                          </span>
                        </div>

                        <div className="mb-5">
                          <div className="flex items-center justify-between text-[11px] font-black text-white/70">
                            <span>Progress</span>
                            <span>{categoryPercent}%</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                              style={{ width: `${categoryPercent}%` }}
                            />
                          </div>
                        </div>

                        {visibleItems.length ? (
                          <ul className="space-y-3">
                            {visibleItems.map((item) => (
                              <li
                                key={item.id}
                                onClick={() => toggleItem(catIndex, item.id)}
                                className="flex items-start group/item cursor-pointer select-none"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(ev) => {
                                  if (ev.key === 'Enter' || ev.key === ' ') toggleItem(catIndex, item.id);
                                }}
                              >
                                <div
                                  className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center mr-3 transition-all ${
                                    item.packed
                                      ? 'bg-indigo-600 border-indigo-600 shadow-[0_8px_20px_rgba(79,70,229,0.25)]'
                                      : 'border-white/25 group-hover/item:border-indigo-300 group-hover/item:bg-white/10'
                                  }`}
                                  aria-hidden="true"
                                >
                                  {item.packed && <span className="text-white text-sm font-black">✓</span>}
                                </div>
                                <span
                                  className={`text-sm md:text-base leading-snug transition-all ${
                                    item.packed
                                      ? 'text-gray-400 line-through'
                                      : 'text-white/90 group-hover/item:text-white'
                                  }`}
                                >
                                  {item.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-sm font-semibold text-white/70">
                            No matching items in this category.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-6 space-y-6">
                <div className="rounded-3xl bg-white/10 backdrop-blur border border-white/15 shadow-2xl p-6">
                  <p className="text-[11px] font-black uppercase tracking-widest text-white/70">Trip at a glance</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                      <div className="text-[11px] font-black uppercase tracking-widest text-white/70">Remaining</div>
                      <div className="text-2xl font-black text-white">{Math.max(0, totals.total - totals.packed)}</div>
                    </div>
                    <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                      <div className="text-[11px] font-black uppercase tracking-widest text-white/70">Completion</div>
                      <div className="text-2xl font-black text-white">{totals.percent}%</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white p-5 shadow-[0_18px_40px_rgba(59,130,246,0.25)]">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-black">Pro tip</div>
                      <div className="text-sm font-black">🧠</div>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white/90">
                      Aim to pack 80% the night before — leave the last 20% for chargers, meds, and “morning of” items.
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPackingData((current) =>
                          current.map((cat) => ({
                            ...cat,
                            items: cat.items.map((it) => ({ ...it, packed: false })),
                          })),
                        );
                        showToast('Reset all items');
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 px-4 py-3 text-sm font-black text-white transition"
                    >
                      <span aria-hidden="true">↺</span>
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPackedOnly(false);
                        setSearchQuery('');
                        showToast('Cleared filters');
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 px-4 py-3 text-sm font-black text-white transition"
                    >
                      <span aria-hidden="true">🧹</span>
                      Clear
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl bg-white/10 backdrop-blur border border-white/15 shadow-2xl p-6">
                  <p className="text-[11px] font-black uppercase tracking-widest text-white/70">Weather</p>
                  <div className="mt-3 space-y-3">
                    {weather ? (
                      <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-black text-white">
                              {weather.location?.name}
                              {weather.location?.country ? (
                                <span className="text-white/60"> • {weather.location.country}</span>
                              ) : null}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-white/70">
                              {weather.current?.text || 'Forecast'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-white">
                              <span className="mr-2" aria-hidden="true">
                                {weather.current?.icon || '🌡️'}
                              </span>
                              {typeof weather.current?.tempC === 'number'
                                ? `${Math.round(weather.current.tempC)}°C`
                                : '--'}
                            </div>
                            <div className="text-[11px] font-black uppercase tracking-widest text-white/60">
                              Today
                            </div>
                          </div>
                        </div>

                        {Array.isArray(weather.daily) && weather.daily.length ? (
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            {weather.daily.slice(0, 4).map((d) => (
                              <div
                                key={d.date}
                                className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2"
                              >
                                <div className="flex items-center justify-between text-xs font-black text-white/80">
                                  <span>{d.icon || '🌤️'}</span>
                                  <span>
                                    {typeof d.maxC === 'number' ? Math.round(d.maxC) : '--'}°/
                                    {typeof d.minC === 'number' ? Math.round(d.minC) : '--'}°
                                  </span>
                                </div>
                                <div className="mt-1 text-[11px] font-extrabold text-white/60">
                                  {d.date}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                        <div className="text-sm font-black text-white">No forecast yet</div>
                        <div className="text-sm font-semibold text-white/70">
                          Start a trip and we’ll fetch the forecast from the backend.
                        </div>
                      </div>
                    )}

                    {aiTips.length ? (
                      <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-black text-white">AI tips</div>
                          <div className="text-[11px] font-black uppercase tracking-widest text-white/60">
                            {usedAI ? 'Groq' : 'Fallback'}
                          </div>
                        </div>
                        <ul className="mt-2 space-y-2 text-sm font-semibold text-white/70">
                          {aiTips.slice(0, 4).map((t) => (
                            <li key={t} className="flex gap-2">
                              <span className="text-white/50" aria-hidden="true">
                                •
                              </span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                        <div className="text-sm font-black text-white">Save checklists</div>
                        <div className="text-sm font-semibold text-white/70">
                          Next: persist items to localStorage or your DB.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {toastMessage ? (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
              <div className="rounded-full bg-white text-slate-900 px-5 py-3 text-sm font-black shadow-2xl border border-white/20">
                {toastMessage}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-950 font-sans">
      <TopNav variant="dark" />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute top-10 -right-32 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 md:px-10 pt-10 pb-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-black tracking-widest uppercase text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Build a checklist in seconds
            </div>
            <h1 className="mt-5 text-5xl md:text-6xl font-black text-white leading-[1.02] tracking-tight">
              MakeMyTrip vibes.
              <br />
              <span className="text-indigo-200">But smarter.</span>
            </h1>
            <p className="mt-5 text-lg text-indigo-100/90 font-semibold max-w-xl">
              Tell us where you’re going and what you’ll do. PackPilot generates a clean, tappable checklist you can finish in one session.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-3xl bg-white/10 border border-white/15 p-4">
                <div className="text-white font-black">⚡ Fast</div>
                <div className="text-sm text-indigo-100/80 font-semibold mt-1">One form → full checklist.</div>
              </div>
              <div className="rounded-3xl bg-white/10 border border-white/15 p-4">
                <div className="text-white font-black">🎯 Focused</div>
                <div className="text-sm text-indigo-100/80 font-semibold mt-1">Progress + category stats.</div>
              </div>
              <div className="rounded-3xl bg-white/10 border border-white/15 p-4">
                <div className="text-white font-black">🧳 Practical</div>
                <div className="text-sm text-indigo-100/80 font-semibold mt-1">Carry-on friendly ratios.</div>
              </div>
            </div>

            <div className="mt-8">
              <div className="text-xs font-black uppercase tracking-widest text-white/60 mb-3">
                Popular right now
              </div>
              <div className="flex flex-wrap gap-2">
                {popularDestinations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDestination(d)}
                    className="rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 text-sm font-black text-white transition"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-[2rem] p-[1px] bg-gradient-to-br from-indigo-500/40 via-cyan-400/30 to-purple-500/40 shadow-2xl">
              <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-[2rem] shadow-2xl p-7 md:p-9">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-white/60">Trip Builder</div>
                    <div className="text-2xl font-black text-white">Plan your pack</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/15 px-3 py-2 text-xs font-black text-white/80">
                    Step 1 of 1
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-indigo-100 mb-2 uppercase tracking-widest">
                      Destination
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">📍</span>
                      <input
                        type="text"
                        placeholder="e.g., Tokyo, Japan"
                        className="w-full pl-10 pr-5 py-4 rounded-2xl bg-white/95 border-0 focus:ring-4 focus:ring-indigo-400 text-gray-900 placeholder-gray-400 font-semibold outline-none transition-all shadow-inner"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-indigo-100 mb-2 uppercase tracking-widest">
                      Duration (Days)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🗓️</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g., 7"
                        className="w-full pl-10 pr-5 py-4 rounded-2xl bg-white/95 border-0 focus:ring-4 focus:ring-indigo-400 text-gray-900 placeholder-gray-400 font-semibold outline-none transition-all shadow-inner"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-indigo-100 mb-3 uppercase tracking-widest">
                      Trip vibe
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {activitiesList.map((activity) => (
                        <button
                          type="button"
                          key={activity}
                          onClick={() => toggleActivity(activity)}
                          className={`px-5 py-2.5 rounded-full text-sm font-black transition-all duration-300 ${
                            selectedActivities.includes(activity)
                              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-[1.03] border border-indigo-400/40'
                              : 'bg-white/10 text-white border border-white/20 hover:bg-white/15 hover:scale-[1.03]'
                          }`}
                        >
                          {activity}
                        </button>
                      ))}
                    </div>
                  </div>

                  {errorMessage ? (
                    <div className="rounded-2xl border border-red-200/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 font-semibold">
                      {errorMessage}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-black text-lg py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
                  >
                    Generate My Custom List
                  </button>
                </form>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-indigo-100/70 font-semibold">
                    Tip: click items in the dashboard to mark them packed.
                  </p>
                  <div className="text-xs text-white/60 font-black tracking-widest uppercase">
                    v1.0 preview
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
