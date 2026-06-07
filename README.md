# spare pos

This repository is split into two projects for separate hosting:

- `frontend/` — React + Vite UI app
- `backend/` — Express API server

## Local Development

From the repository root, bootstrap the workspace once:

```bash
npm install
```

Then run the apps separately:

```bash
npm run dev:frontend
npm run dev:backend
```

This uses npm workspaces and runs each app from its own folder.

## Frontend

Folder: `frontend`

Available scripts:

```bash
npm --workspace frontend run dev
npm --workspace frontend run build
npm --workspace frontend run preview
```

### Hosting

The frontend can be deployed to platforms such as:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages (static build only)

If deploying to a static host, run `npm --workspace frontend run build` and publish the generated `dist` output.

## Backend

Folder: `backend`

Available scripts:

```bash
npm --workspace backend run dev
npm --workspace backend start
npm --workspace backend run seed
```

### Environment

Create a `.env` file in `backend/` with:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret
CORS_ORIGIN=http://localhost:5173
```

### Hosting

The backend can be deployed to Node-compatible hosting such as:

- Render
- Railway
- Fly.io
- Heroku
- AWS Elastic Beanstalk
- DigitalOcean App Platform

Make sure to set `MONGO_URI` and `JWT_SECRET` in the host environment.

## Notes

- The root `package.json` defines workspace scripts for running frontend and backend separately.
- `.env` is ignored by git.
- If you want a production-ready split, deploy `frontend` and `backend` independently and point the frontend API calls at the backend URL.

## Frontend / Backend Deployment

1. Deploy the backend first and note its public API URL, for example:
   - `https://api.spare-pos.example.com/api`

2. Deploy the frontend separately as a static or server-rendered app.

3. Set `VITE_API_URL` in the frontend deployment environment to the backend API base URL.
   - Example: `VITE_API_URL=https://api.spare-pos.example.com/api`

4. Build the frontend with that environment variable in place:

```bash
npm --workspace frontend run build
```

5. Ensure the backend allows requests from the frontend origin in `CORS_ORIGIN`.
   - Example: `CORS_ORIGIN=https://spare-pos.example.com`

6. On the backend host, configure the normal backend environment variables:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-production-secret
CORS_ORIGIN=https://spare-pos.example.com
```

### Why this works

The frontend uses `frontend/src/lib/api.ts`, which reads `VITE_API_URL` at build time. If that variable is set, API requests will go to the backend URL instead of the local default `http://localhost:5000/api`.
