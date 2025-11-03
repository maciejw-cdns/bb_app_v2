import CheckinItem from './CheckinItem';
import './CheckinGrid.css';

function CheckinGrid({ checkins }) {
  if (!checkins || checkins.length === 0) {
    return <div className="no-checkins">No check-ins available</div>;
  }

  return (
    <div className="checkin-grid">
      {checkins.map((checkin, index) => (
        <CheckinItem key={index} checkin={checkin} />
      ))}
    </div>
  );
}

export default CheckinGrid;

