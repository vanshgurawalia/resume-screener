# AI Resume Screener

An AI-powered tool that matches your resume to any job description and gives instant, actionable feedback.

![AI Resume Screener](https://img.shields.io/badge/built%20with-Anthropic%20API-blueviolet)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black)

## Features

- **Match scoring** — Overall, skills, and experience match percentages
- **Skills gap analysis** — See exactly which skills you have vs. what's missing
- **Actionable tips** — Specific suggestions to improve your resume for the role
- **PDF upload** — Upload your resume as a PDF or paste the text directly
- **Zero backend** — Pure frontend, runs entirely in the browser

## Tech Stack

- Vanilla HTML / CSS / JavaScript
- [Anthropic Claude API](https://anthropic.com) for AI analysis
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF parsing
- Deployed on [Vercel](https://vercel.com)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/resume-screener.git
cd resume-screener
```

### 2. Add your Anthropic API key

Open `app.js` and find this line inside the `analyze()` function:

```js
headers: { 'Content-Type': 'application/json' },
```

Add your API key header:

```js
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'YOUR_API_KEY_HERE',
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true'
},
```

> **Note:** For a production app, move the API key to a backend/serverless function so it's not exposed in the browser.

### 3. Run locally

Just open `index.html` in your browser — no build step needed.

Or use a local server:

```bash
npx serve .
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Click **Deploy** — that's it!

For the API key in production, add it as an **Environment Variable** in Vercel and use a serverless function (see `api/analyze.js` below for an example).

### Optional: Serverless function for API key safety

Create `api/analyze.js`:

```js
export default async function handler(req, res) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(req.body)
  });
  const data = await response.json();
  res.json(data);
}
```

Then in `app.js`, change the fetch URL from `https://api.anthropic.com/v1/messages` to `/api/analyze`.

## Project Structure

```
resume-screener/
├── index.html     # Main HTML structure
├── style.css      # All styles
├── app.js         # JavaScript logic + API calls
└── README.md      # This file
```

## License

MIT
