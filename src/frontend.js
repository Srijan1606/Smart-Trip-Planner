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