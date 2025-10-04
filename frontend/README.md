## React Frontend Plan

This document outlines the React frontend structure, pages, and how each page consumes the existing backend endpoints.

### Tech stack
- React (Vite or Create React App)
- React Router
- Axios (or Fetch API)
- Context or Redux for auth/user state
- TailwindCSS/SCSS or plain CSS (up to preference)

### Project structure (proposed)
```
frontend/
  src/
    api/
      axiosClient.ts
      auth.ts
      tours.ts
      reviews.ts
      users.ts
    components/
      Header.tsx
      Footer.tsx
      TourCard.tsx
      ProtectedRoute.tsx
    pages/
      Home.tsx
      TourList.tsx
      TourDetails.tsx
      Login.tsx
      Signup.tsx
      Account.tsx
      UpdatePassword.tsx
      AdminDashboard.tsx
      AdminTours.tsx
      AdminUsers.tsx
      AdminReviews.tsx
    providers/
      AuthProvider.tsx
    hooks/
      useAuth.ts
    styles/
      index.css
    main.tsx
    App.tsx
  index.html
  package.json
  tsconfig.json
  vite.config.ts
```

---

### API base
- Base URL: `/api/v1`
- Auth: JWT via `Authorization: Bearer <token>`

Create a shared Axios instance with interceptors to inject token and handle 401 redirects.

```ts
// src/api/axiosClient.ts
import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosClient;
```

---

## Pages and endpoint coverage

### 1) Home (`/`)
- Purpose: Landing with featured tours, links to browse.
- Endpoints:
  - `GET /tours?limit=3&sort=-ratingsAverage,price` — fetch featured tours.

### 2) Tour list (`/tours`)
- Purpose: Browse/search/sort/paginate tours.
- Endpoints:
  - `GET /tours` — supports query params: `page`, `limit`, `sort`, `fields`, `duration[lte|gte]`, `price[lte|gte]`, `ratingsAverage[gte]`.

### 3) Tour details (`/tours/:id`)
- Purpose: Show tour info, images, map, reviews; allow adding review when logged in.
- Endpoints:
  - `GET /tours/:id` — single tour detail (populated with guides and virtual reviews if API exposes it).
  - `GET /tours/:id/reviews` or `GET /reviews?tour=:id` — list reviews for the tour.
  - `POST /reviews` — create review `{ tour, rating, review }` (auth required).
  - `PATCH /reviews/:id` — edit own review (auth required).
  - `DELETE /reviews/:id` — delete own review (auth required).

### 4) Auth: Login (`/login`) and Signup (`/signup`)
- Purpose: Authenticate and store JWT; update user context.
- Endpoints:
  - `POST /users/signup` — create account.
  - `POST /users/login` — obtain token.
  - `GET /users/logout` (if implemented) — clear cookie/session.

### 5) Account (`/account`)
- Purpose: View/update profile data and photo.
- Endpoints:
  - `GET /users/me` (or `GET /users/:id`) — fetch current user.
  - `PATCH /users/updateMe` — update name/email/photo (multipart if photo).
  - `DELETE /users/deleteMe` — deactivate account.

### 6) Update password (`/account/password`)
- Purpose: Change current password.
- Endpoints:
  - `PATCH /users/updateMyPassword` — body: `{ passwordCurrent, password, passwordConfirm }`.

### 7) Admin dashboard (`/admin`)
- Purpose: Admin summary; guard route with role check.
- Endpoints:
  - `GET /tours` — counts, stats (or a dedicated stats endpoint if available).
  - `GET /users` — list users.
  - `GET /reviews` — list reviews.

### 8) Admin tours CRUD (`/admin/tours`)
- Purpose: Create/edit/delete tours.
- Endpoints:
  - `POST /tours` — create tour.
  - `PATCH /tours/:id` — update tour.
  - `DELETE /tours/:id` — delete tour.

### 9) Admin users CRUD (`/admin/users`)
- Purpose: Manage users.
- Endpoints:
  - `POST /users` — create user (if allowed).
  - `PATCH /users/:id` — update user.
  - `DELETE /users/:id` — delete user.

### 10) Admin reviews CRUD (`/admin/reviews`)
- Purpose: Moderate reviews.
- Endpoints:
  - `PATCH /reviews/:id`
  - `DELETE /reviews/:id`

---

## Component notes
- `ProtectedRoute` checks auth and optional role before rendering pages like Account/Admin.
- `TourCard` displays name, price, duration, difficulty, `ratingsAverage`, `ratingsQuantity`.
- Global error boundary and toast notifications recommended.

---

## Auth flow
1. On login/signup success, store `token` in `localStorage`.
2. Axios adds `Authorization` on each request.
3. On 401, clear token and redirect to `/login`.

---

## Setup
```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm i axios react-router-dom
npm i -D @types/react-router-dom
npm run dev
```

Configure proxy to backend in `vite.config.ts` if backend runs on another port, e.g. 3000:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## Minimal API wrappers
```ts
// src/api/tours.ts
import axiosClient from './axiosClient';
export const getTours = (params?: Record<string, unknown>) => axiosClient.get('/tours', { params });
export const getTour = (id: string) => axiosClient.get(`/tours/${id}`);

// src/api/reviews.ts
import axiosClient from './axiosClient';
export const getReviewsByTour = (tourId: string) => axiosClient.get('/reviews', { params: { tour: tourId } });
export const createReview = (data: { tour: string; rating: number; review: string }) => axiosClient.post('/reviews', data);
export const updateReview = (id: string, data: Partial<{ rating: number; review: string }>) => axiosClient.patch(`/reviews/${id}`, data);
export const deleteReview = (id: string) => axiosClient.delete(`/reviews/${id}`);

// src/api/auth.ts
import axiosClient from './axiosClient';
export const login = (data: { email: string; password: string }) => axiosClient.post('/users/login', data);
export const signup = (data: { name: string; email: string; password: string; passwordConfirm: string }) => axiosClient.post('/users/signup', data);
export const updateMyPassword = (data: { passwordCurrent: string; password: string; passwordConfirm: string }) => axiosClient.patch('/users/updateMyPassword', data);

// src/api/users.ts
import axiosClient from './axiosClient';
export const me = () => axiosClient.get('/users/me');
export const updateMe = (data: FormData) => axiosClient.patch('/users/updateMe', data);
export const deleteMe = () => axiosClient.delete('/users/deleteMe');
```

---

## Routing sketch
```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TourList from './pages/TourList';
import TourDetails from './pages/TourDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Account from './pages/Account';
import UpdatePassword from './pages/UpdatePassword';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tours" element={<TourList />} />
        <Route path="/tours/:id" element={<TourDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/account"
          element={<ProtectedRoute><Account /></ProtectedRoute>}
        />
        <Route
          path="/account/password"
          element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Notes
- Map exact endpoints to your backend if names differ; adjust wrappers accordingly.
- If your backend sends cookies instead of Authorization header, configure Axios with `withCredentials: true` and rely on cookie-based auth.
- For deployment, ensure both backend and frontend agree on base URLs and CORS.


