import { useState, useEffect } from 'react';
import Header from './components/Header';
import CheckinGrid from './components/CheckinGrid';
import BeerList from './components/BeerList';
import './App.css';

function App() {
  const [checkins, setCheckins] = useState([]);
  const [beers, setBeers] = useState([]);
  const [loadingCheckins, setLoadingCheckins] = useState(false);
  const [loadingBeers, setLoadingBeers] = useState(false);
  const [error, setError] = useState(null);
  const [showBeerList, setShowBeerList] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetchCheckins();
    fetchBeers();
  }, []);

  useEffect(() => {
    // Toggle between views every 60 seconds
    const toggleInterval = setInterval(() => {
      setShowBeerList(prev => !prev);
    }, 60000);

    return () => {
      clearInterval(toggleInterval);
    };
  }, []);

  useEffect(() => {
    // Refresh data every 60 seconds
    const refreshInterval = setInterval(() => {
      if (showBeerList) {
        fetchBeers();
      } else {
        fetchCheckins();
      }
    }, 60000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [showBeerList]);

  const fetchCheckins = async () => {
    try {
      setLoadingCheckins(true);
      const response = await fetch('/api/checkins');
      if (!response.ok) {
        throw new Error('Failed to fetch check-ins');
      }
      const data = await response.json();
      setCheckins(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching check-ins:', err);
    } finally {
      setLoadingCheckins(false);
    }
  };

  const fetchBeers = async () => {
    try {
      setLoadingBeers(true);
      const response = await fetch('/api/beers');
      if (!response.ok) {
        throw new Error('Failed to fetch beers');
      }
      const data = await response.json();
      console.log('Fetched beers:', data);
      setBeers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching beers:', err);
    } finally {
      setLoadingBeers(false);
    }
  };

  const handleToggleView = () => {
    setShowBeerList(prev => !prev);
  };

  const isLoading = showBeerList ? loadingBeers : loadingCheckins;

  return (
    <div className="app">
      <Header showBeerList={showBeerList} onToggleView={handleToggleView} />
      <main className="main-content">
        {isLoading && <div className="loading">Loading...</div>}
        {error && <div className="error">Error: {error}</div>}
        {!isLoading && !error && (
          showBeerList ? <BeerList beers={beers} /> : <CheckinGrid checkins={checkins} />
        )}
      </main>
    </div>
  );
}

export default App;

