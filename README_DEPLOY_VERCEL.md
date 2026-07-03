# Deploying Alumni Bridge to Vercel

## 1. Install Vercel CLI (Optional)

If you want to deploy from your terminal:
```bash
npm install -g vercel
```

## 2. Create a Vercel Account

Go to: https://vercel.com/

Sign in with GitHub, GitLab, or email.

## 3. Prepare the Project

Make sure your project has:
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `vercel.json`

### package.json scripts
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview"
}
```

## 4. Add Environment Variables

If you are using Supabase, add these variables to Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

If you want demo/mocked mode in production, set:
- `VITE_USE_MOCK_DATA=true`

## 5. Deploy with Vercel CLI

From the project root:
```bash
cd c:\Users\Welcome\Downloads\project-bolt-sb1-5kf3cmb2\project
vercel
```

Follow the prompts:
- Select your scope
- Link or create a new project
- Confirm build settings

## 6. Deploy from GitHub (Recommended)

1. Push your repository to GitHub.
2. Go to Vercel dashboard and click **New Project**.
3. Import your GitHub repo.
4. Set the environment variables on the Vercel project settings.
5. Deploy.

## 7. Confirm Build Settings

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

## 8. Post-Deploy

- Open the assigned Vercel URL
- Verify the site loads
- Check pages and links

## 9. Troubleshooting

### If you see `404` on refresh
Make sure `vercel.json` has this route configuration:
```json
"routes": [
  {
    "src": "/(.*)",
    "dest": "/index.html"
  }
]
```

### If environment variables are missing
Add them in Vercel dashboard under Project Settings > Environment Variables.

### If build fails
Check the Vercel deployment logs and verify `npm run build` passes locally.

---

## Notes

- Vercel automatically installs dependencies and runs the build.
- If you do not want Supabase in the deployed version, leave env vars blank and use `VITE_USE_MOCK_DATA=true`.
- Keep the project root clean and do not nest the app under another directory.
