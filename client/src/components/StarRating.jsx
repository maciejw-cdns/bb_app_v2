import './StarRating.css';

function StarRating({ rating }) {
  if (!rating) return null;
  
  const ratingNum = parseFloat(rating);
  if (isNaN(ratingNum) || ratingNum === 0) return null;
  
  return (
    <div className="rating">
      <div className="stars">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          // Calculate how much of this star should be filled
          let fillAmount = Math.max(0, Math.min(1, ratingNum - (starIndex - 1)));
          
          // Apply visual calibration for partial fills
          // The star character (★) has uneven visual weight, so we adjust partial fills
          if (fillAmount > 0 && fillAmount < 1) {
            // Reduce partial fills by ~15% to compensate for visual weight on left side
            fillAmount = fillAmount * 0.85;
          }
          
          const fillPercentage = fillAmount * 100;
          
          return (
            <span key={starIndex} className="star-wrapper">
              <span className="star-empty">★</span>
              <span 
                className="star-filled" 
                style={{ width: `${fillPercentage}%` }}
              >
                ★
              </span>
            </span>
          );
        })}
      </div>
      <span className="rating-value">{ratingNum.toFixed(2)}</span>
    </div>
  );
}

export default StarRating;
