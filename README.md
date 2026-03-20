# AI Resume Screener

An AI-powered tool that matches your resume to any job description and gives instant, actionable feedback.

![Deploy](https://img.shields.io/badge/deploy-Vercel-black)
![Gemini](https://img.shields.io/badge/built%20with-Gemini%20API-blue)

## Features

- **Match scoring** — Overall, skills, and experience match percentages
- **Skills gap analysis** — See exactly which skills you have vs. what's missing
- **Actionable tips** — Specific suggestions to improve your resume for the role
- **PDF upload** — Upload your resume as a PDF or paste the text directly
- **Zero backend** — Pure frontend + Vercel serverless function

## Tech Stack

- Vanilla HTML / CSS / JavaScript
- [Google Gemini API](https://aistudio.google.com) for AI analysis
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF parsing
- Deployed on [Vercel](https://vercel.com)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/vanshgurawalia/resume-screener.git
cd resume-screener
```

### 2. Get a free Gemini API key

- Go to [aistudio.google.com](https://aistudio.google.com)
- Click **Get API key** → **Create API key**
- Copy the key

### 3. Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Add environment variable:
   - Name: `GEMINI_API_KEY`
   - Value: your Gemini API key
5. Click **Deploy**

## Project Structure

```
resume-screener/
├── api/
│   └── analyze.js   # Serverless function (keeps API key safe)
├── index.html        # Main HTML structure
├── style.css         # All styles
├── app.js            # Frontend logic
├── vercel.json       # Vercel config
└── README.md         # This file
```

## License

MIT
