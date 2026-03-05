import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HeroForm from '../frontend.js';

import SiteLayout from './components/SiteLayout.jsx';
import Explore from './pages/Explore.jsx';
import Deals from './pages/Deals.jsx';
import Support from './pages/Support.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HeroForm />} />

      <Route element={<SiteLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/support" element={<Support />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
