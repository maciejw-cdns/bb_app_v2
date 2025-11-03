import './CheckinItem.css';
import StarRating from './StarRating';

function CheckinItem({ checkin }) {
  const {
    userName,
    userAvatar,
    timeAgo,
    beerName,
    breweryName,
    beerIcon,
    rating,
    description,
    beerPhoto
  } = checkin;


  return (
    <div className="checkin-item">
      <div className="checkin-header">
        <div className="user-info">
          {userAvatar && (
            <img 
              src={userAvatar} 
              alt={userName} 
              className="user-avatar"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          {!userAvatar && (
            <div className="user-avatar-placeholder">
              {userName ? userName.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          <div className="user-details">
            <span className="user-name">{userName || 'Anonymous'}</span>
            {timeAgo && <span className="time-ago">{timeAgo}</span>}
          </div>
        </div>
      </div>

      <div className="checkin-body">
        {beerPhoto && (
          <div className="beer-photo-container">
            <img 
              src={beerPhoto} 
              alt={beerName} 
              className="beer-photo"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        <div className="beer-info">
          <div className="beer-header">
            {beerIcon && (
              <img 
                src={beerIcon} 
                alt={beerName} 
                className="beer-icon"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="beer-name-wrapper">
              <h3 className="beer-name">{beerName || 'Unknown Beer'}</h3>
              {breweryName && <p className="brewery-name">{breweryName}</p>}
            </div>
          </div>

          <StarRating rating={rating} />

          {description && (
            <p className="description">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckinItem;

