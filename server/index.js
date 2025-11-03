import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from React app in production
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Function to convert timestamp to relative time
function getRelativeTime(timestamp) {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return diffSec <= 1 ? 'just now' : `${diffSec} seconds ago`;
    } else if (diffMin < 60) {
      return diffMin === 1 ? 'a minute ago' : `${diffMin} minutes ago`;
    } else if (diffHour < 24) {
      return diffHour === 1 ? 'an hour ago' : `${diffHour} hours ago`;
    } else if (diffDay < 7) {
      return diffDay === 1 ? 'a day ago' : `${diffDay} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  } catch (error) {
    return timestamp;
  }
}

// Function to scrape Untappd check-ins
async function scrapeCheckins() {
  try {
    const url = 'https://untappd.com/v/beer-brothers/9593498';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const checkins = [];

    // Find check-in items
    $('.item').each((index, element) => {
      if (index >= 4) return false; // Only get first 4

      const $element = $(element);
      
      // Extract user info
      const userName = $element.find('a.user').text().trim();
      const userAvatar = $element.find('.avatar img').attr('src') || '';

      // Extract time
      const timeRaw = $element.find('a.time').text().trim();
      const timeAgo = getRelativeTime(timeRaw);

      // Extract beer info from p.text
      const textElement = $element.find('p.text');
      const links = textElement.find('a');
      
      // Beer name is typically the second link (first is user, second is beer)
      let beerName = '';
      let breweryName = '';
      
      links.each((i, link) => {
        const href = $(link).attr('href') || '';
        if (href.includes('/b/') && !beerName) {
          beerName = $(link).text().trim();
        } else if (!href.includes('/user/') && !href.includes('/b/') && !href.includes('/v/') && !breweryName && beerName) {
          breweryName = $(link).text().trim();
        }
      });
      
      const beerIcon = $element.find('a.label img').attr('src') || '';

      // Extract rating
      let rating = '';
      const ratingElement = $element.find('.rating-serving .caps');
      if (ratingElement.length > 0) {
        const ratingAttr = ratingElement.attr('data-rating');
        rating = ratingAttr ? `${ratingAttr}` : '';
      }

      // Extract description - get text before badges
      let description = '';
      const commentDiv = $element.find('.checkin-comment');
      if (commentDiv.length > 0) {
        // Clone the element and remove badges and other elements
        const $clone = commentDiv.clone();
        $clone.find('.badge, .rating-serving, .translate').remove();
        description = $clone.text()
          .replace(/\s+/g, ' ')
          .replace('Translate', '')
          .trim();
      }

      // Extract beer photo
      const beerPhoto = $element.find('.photo img').attr('src') || '';

      checkins.push({
        userName,
        userAvatar,
        timeAgo,
        beerName,
        breweryName,
        beerIcon,
        rating,
        description,
        beerPhoto
      });
    });

    return checkins;
  } catch (error) {
    console.error('Error scraping Untappd:', error.message);
    throw error;
  }
}

// Function to parse beers from text file
async function parseBeersFile() {
  try {
    const beersFilePath = path.join(__dirname, '..', 'beers.txt');
    const fileContent = await fs.readFile(beersFilePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    const beers = lines.map(line => {
      // Parse format: "1. Brewery: <name> ; Beer: <name> ; Style: <style> ; Blg: <blg> ; ABV: <abv>"
      const match = line.match(/^\d+\.\s*Brewery:\s*(.+?)\s*;\s*Beer:\s*(.+?)\s*;\s*Style:\s*(.+?)\s*;\s*Blg:\s*(.+?)\s*;\s*ABV:\s*(.+?)$/);
      
      if (match) {
        return {
          brewery: match[1].trim(),
          beer: match[2].trim(),
          style: match[3].trim(),
          blg: match[4].trim(),
          abv: match[5].trim()
        };
      }
      return null;
    }).filter(beer => beer !== null);
    
    return beers;
  } catch (error) {
    console.error('Error reading beers file:', error.message);
    throw error;
  }
}

app.get('/api/checkins', async (req, res) => {
  try {
    const checkins = await scrapeCheckins();
    res.json(checkins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch check-ins' });
  }
});

app.get('/api/beers', async (req, res) => {
  try {
    const beers = await parseBeersFile();
    res.json(beers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch beers' });
  }
});

// Serve React app for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

