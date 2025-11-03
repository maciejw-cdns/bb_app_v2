import './Header.css';

function Header({ showBeerList, onToggleView }) {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">🍺 Beer Brothers</h1>
        <p className="header-subtitle">{showBeerList ? 'Featured Beers' : 'Latest Check-ins'}</p>
        <button onClick={onToggleView} className="toggle-button">
          {showBeerList ? '📋 Show Check-ins' : '🍺 Show Beer List'}
        </button>
      </div>
    </header>
  );
}

export default Header;

