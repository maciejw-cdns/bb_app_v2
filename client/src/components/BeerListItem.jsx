import './BeerListItem.css';

function BeerListItem({ beer, number }) {
  const { brewery, beer: beerName, style, blg, abv } = beer;

  return (
    <div className="beer-list-item">
      <div className="beer-number">{number}</div>
      <div className="beer-brewery">{brewery}</div>
      <div className="beer-name-col">{beerName}</div>
      <div className="beer-style">{style}</div>
      <div className="beer-specs">
        <span className="spec-item">BLG: <strong>{blg}</strong></span>
        <span className="spec-divider">|</span>
        <span className="spec-item">ABV: <strong>{abv}</strong></span>
      </div>
    </div>
  );
}

export default BeerListItem;

