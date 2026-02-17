import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
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

      // Extract description - only get the actual comment text
      let description = '';
      const commentDiv = $element.find('.checkin-comment');
      if (commentDiv.length > 0) {
        // Clone the comment div to work with
        const $clone = commentDiv.clone();
        
        // Remove ALL unwanted elements BEFORE extracting text
        $clone.find('a').remove(); // Remove all links (venue, user tags, etc.)
        $clone.find('span').remove(); // Remove all spans
        $clone.find('.badge').remove();
        $clone.find('.rating-serving').remove();
        $clone.find('.translate').remove();
        $clone.find('.tagged-friends').remove();
        $clone.find('.with-friends').remove();
        $clone.find('.comment-friends').remove();
        $clone.find('.check-in_details').remove();
        $clone.find('.venue').remove();
        
        // Get remaining text
        let text = $clone.text()
          .replace(/\s+/g, ' ')
          .trim();
        
        // Clean up any remaining metadata patterns that slipped through
        text = text
          .split(/(?:Purchased at|Drinking at|Tagged Friends|Translate)/i)[0] // Take only text BEFORE these phrases
          .replace(/\s+/g, ' ')
          .trim();
        
        // Only set description if there's actual content left (more than just a few chars)
        if (text && text.length > 10) {
          description = text;
        }
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

// Function to scrape beers from ontap.pl
async function scrapeOntapBeers() {
  try {
    const url = 'https://beer-brothers.ontap.pl/';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const beers = [];

    $('.panel.panel-default').each((index, element) => {
      const $el = $(element);
      const $body = $el.find('.panel-body.cml_semi');
      if (!$body.length) return;

      // Tap number
      const tapNumber = $body.find('h5 span.label-primary').text().trim();
      if (!tapNumber) return;

      // Brewery name (remove trailing " Brewery" or " Browar")
      const breweryRaw = $body.find('b.brewery').text().trim();
      const brewery = breweryRaw
        .replace(/\s*Brewery\s*$/, '')
        .replace(/\s*Browar\s*$/, '')
        .trim();

      // Beer name and ABV/BLG from h4.cml_shadow > span
      const $h4span = $body.find('h4.cml_shadow span');
      const h4Html = $h4span.html() || '';
      
      // Split by <br/> to get parts: [brewery, "beerName <img...>", "specs"]
      const parts = h4Html.split(/<br\s*\/?>/i).map(p => {
        // Remove HTML tags and decode entities
        return cheerio.load(`<span>${p}</span>`)('span').text().trim();
      });

      // Beer name is in parts[1] (after brewery)
      const beer = (parts[1] || '').replace(/Polska\s*$/i, '').trim();
      const isEmpty = !beer || beer === 'N/A';

      // ABV and BLG are in parts[2], e.g. "16°·6%" or "5%"
      const specsRaw = (parts[2] || '').replace(/\s+/g, '').replace(/&nbsp;/g, '');
      let blg = '';
      let abv = '';
      
      // Try to extract BLG (degrees) and ABV (percentage)
      const blgMatch = specsRaw.match(/([\d,.]+)°/);
      if (blgMatch) {
        blg = blgMatch[1].replace(',', '.');
      }
      const abvMatch = specsRaw.match(/([\d,.]+)%/);
      if (abvMatch) {
        abv = abvMatch[1].replace(',', '.') + '%';
      }

      // Style from span.cml_shadow > b
      const style = $body.find('span.cml_shadow b').text().trim().replace(/\s+/g, ' ');

      // Price from panel-footer
      const price = $el.find('.panel-footer .col-xs-7').text().trim().replace(/\s+/g, ' ');

      // On tap duration
      const onTapLabel = $body.find('span.label-default.label-small');
      const onTap = onTapLabel.find('span').text().trim();

      // Tags (New, Premiere)
      const tags = [];
      $body.find('span.label-warning.label-small').each((i, tag) => {
        tags.push($(tag).text().trim());
      });

      beers.push({
        tapNumber,
        brewery: isEmpty ? '' : brewery,
        beer: isEmpty ? 'N/A' : beer,
        style: isEmpty ? '' : style,
        blg: isEmpty ? '' : blg,
        abv: isEmpty ? '' : abv,
        price: isEmpty ? '' : price,
        onTap: isEmpty ? '' : onTap,
        isNew: isEmpty ? false : tags.includes('New'),
        isPremiere: isEmpty ? false : tags.includes('Premiere'),
        isEmpty
      });
    });

    // Ensure we always return exactly 16 taps
    const allTaps = [];
    for (let i = 1; i <= 16; i++) {
      const existing = beers.find(b => parseInt(b.tapNumber) === i);
      if (existing) {
        allTaps.push(existing);
      } else {
        allTaps.push({
          tapNumber: String(i),
          brewery: '',
          beer: 'N/A',
          style: '',
          blg: '',
          abv: '',
          price: '',
          onTap: '',
          isNew: false,
          isPremiere: false,
          isEmpty: true
        });
      }
    }

    return allTaps;
  } catch (error) {
    console.error('Error scraping ontap.pl:', error.message);
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
    const beers = await scrapeOntapBeers();
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

