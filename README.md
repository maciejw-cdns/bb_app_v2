# Beer Brothers Check-ins App

A React application that displays the last 4 check-ins from the Beer Brothers venue on Untappd in a beautiful 2x2 grid layout with a dark theme.

## Features

- 🍺 Displays 4 most recent check-ins from Beer Brothers venue
- 📱 Responsive 2x2 grid layout
- 🌙 Dark theme with modern UI
- 👤 User avatars and names
- ⭐ Beer ratings with star display
- 🖼️ Beer photos (scaled for optimal viewing)
- 💬 Check-in descriptions
- ⏰ Time stamps for each check-in
- 🔄 Auto-refresh every 60 seconds

## Tech Stack

### Backend
- Node.js with Express
- Axios for HTTP requests
- Cheerio for web scraping

### Frontend
- React 18
- Vite for fast development
- CSS with modern gradients and animations

## Installation

1. Install all dependencies (both backend and frontend):
```bash
npm run install-all
```

Or manually:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install
```

## Running the Application

### Option 1: Run both servers concurrently (Recommended)
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend development server on http://localhost:3000

### Option 2: Run servers separately

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

## Usage

Once both servers are running, open your browser and navigate to:
```
http://localhost:3000
```

The application will automatically fetch and display the latest check-ins from the Beer Brothers venue.

## Project Structure

```
bb_app_v2/
├── server/
│   └── index.js              # Express server with scraping logic
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx    # Header component
│   │   │   ├── Header.css
│   │   │   ├── CheckinGrid.jsx    # Grid layout component
│   │   │   ├── CheckinGrid.css
│   │   │   ├── CheckinItem.jsx    # Individual check-in card
│   │   │   └── CheckinItem.css
│   │   ├── App.jsx           # Main app component
│   │   ├── App.css
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json              # Backend package.json
└── README.md
```

## Build for Production

To build the frontend for production:
```bash
npm run build
```

The built files will be in `client/dist/`.

## Notes

- The application scrapes data from Untappd, which may be subject to rate limiting or changes in their HTML structure
- Images are scaled appropriately to ensure all 4 check-ins are visible on screen
- The app auto-refreshes data every 60 seconds
- Error handling is included for failed image loads and network requests

## Troubleshooting

**Server doesn't start:**
- Make sure port 3001 (backend) and 3000 (frontend) are not in use
- Check if all dependencies are installed

**No check-ins displayed:**
- Check browser console for errors
- Verify the backend server is running on port 3001
- Untappd may have changed their HTML structure

**Images not loading:**
- Some images may require authentication or may have CORS restrictions
- The app gracefully handles missing images with placeholders

## License

MIT

