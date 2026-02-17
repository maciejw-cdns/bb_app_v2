import CheckinItem from './CheckinItem';
import './CheckinGrid.css';

function CheckinGrid({ checkins, currentIndex }) {
  if (!checkins || checkins.length === 0) {
    return <div className="no-checkins">No check-ins available</div>;
  }

  const checkin = checkins[currentIndex] || checkins[0];

  return (
    <div className="checkin-grid">
      <CheckinItem checkin={checkin} />
      <div className="checkin-indicator">
        {checkins.map((_, index) => (
          <span
            key={index}
            className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

export default CheckinGrid;
