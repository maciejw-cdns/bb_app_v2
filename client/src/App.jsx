import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import CheckinGrid from './components/CheckinGrid';
import BeerList from './components/BeerList';
import './App.css';

const CHECKIN_ROTATE_INTERVAL = 25000; // 25 seconds per checkin

function App() {
  const [checkins, setCheckins] = useState([]);
  const [beers, setBeers] = useState([]);
  const [error, setError] = useState(null);
  const [showBeerList, setShowBeerList] = useState(false);
  const [currentCheckinIndex, setCurrentCheckinIndex] = useState(0);
  const checkinTimerRef = useRef(null);
  const checkinsRef = useRef(checkins);

  // Keep ref in sync with state
  useEffect(() => {
    checkinsRef.current = checkins;
  }, [checkins]);

  const fetchCheckins = useCallback(async () => {
    try {
      const response = await fetch('/api/checkins');
      if (!response.ok) throw new Error('Failed to fetch check-ins');
      const data = await response.json();
      setCheckins(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching check-ins:', err);
      return null;
    }
  }, []);

  const fetchBeers = useCallback(async () => {
    try {
      const response = await fetch('/api/beers');
      if (!response.ok) throw new Error('Failed to fetch beers');
      const data = await response.json();
      setBeers(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching beers:', err);
      return null;
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchCheckins();
    fetchBeers();
  }, [fetchCheckins, fetchBeers]);

  // Start checkin rotation timer when in checkin view
  const startCheckinRotation = useCallback(() => {
    if (checkinTimerRef.current) clearInterval(checkinTimerRef.current);

    checkinTimerRef.current = setInterval(() => {
      const total = checkinsRef.current.length;
      if (total === 0) return;

      setCurrentCheckinIndex(prev => {
        const nextIndex = prev + 1;
        // When we've shown all checkins, switch to beer list
        if (nextIndex >= total) {
          // Fetch fresh beer data then switch to beer list
          fetchBeers().then(() => {
            setShowBeerList(true);
          });
          clearInterval(checkinTimerRef.current);
          return prev;
        }
        return nextIndex;
      });
    }, CHECKIN_ROTATE_INTERVAL);
  }, [fetchBeers]);

  // Handle view transitions
  useEffect(() => {
    if (!showBeerList) {
      // Entering checkin view — start rotation
      setCurrentCheckinIndex(0);
      startCheckinRotation();
    } else {
      // Entering beer list view — schedule switch back to checkins
      if (checkinTimerRef.current) clearInterval(checkinTimerRef.current);

      // Show beer list for duration equal to total checkin time (num checkins * 25s)
      const beerListDuration = Math.max(checkinsRef.current.length, 4) * CHECKIN_ROTATE_INTERVAL;

      checkinTimerRef.current = setTimeout(async () => {
        // Fetch fresh checkin data before switching
        await fetchCheckins();
        setShowBeerList(false);
      }, beerListDuration);
    }

    return () => {
      if (checkinTimerRef.current) {
        clearInterval(checkinTimerRef.current);
        clearTimeout(checkinTimerRef.current);
      }
    };
  }, [showBeerList, startCheckinRotation, fetchCheckins]);

  const handleToggleView = () => {
    if (showBeerList) {
      // Switching to checkins — fetch fresh data first
      fetchCheckins().then(() => setShowBeerList(false));
    } else {
      // Switching to beer list — fetch fresh data first
      fetchBeers().then(() => setShowBeerList(true));
    }
  };

  return (
    <div className="app">
      <Header showBeerList={showBeerList} onToggleView={handleToggleView} />
      <main className="main-content">
        {error && <div className="error">Error: {error}</div>}
        {!error && (
          showBeerList
            ? <BeerList beers={beers} />
            : <CheckinGrid checkins={checkins} currentIndex={currentCheckinIndex} />
        )}
      </main>
    </div>
  );
}

export default App;
