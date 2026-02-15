import './Header.css';

function Header({ showBeerList, onToggleView }) {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">🍺 Beer Brothers</h1>
        <p className="header-subtitle">
          {showBeerList
            ? <><a href="https://beer-brothers.ontap.pl/" target="_blank" rel="noopener noreferrer">ontap.pl</a> Featured Beers</>
            : <><a href="https://untappd.com/v/beer-brothers/9593498" target="_blank" rel="noopener noreferrer">untappd.com</a> Latest Check-ins</>
          }
        </p>
        <button onClick={onToggleView} className="toggle-button">
          {showBeerList ? '📋 Show Check-ins' : '🍺 Show Beer List'}
        </button>
      </div>
    </header>
  );
}

export default Header;

