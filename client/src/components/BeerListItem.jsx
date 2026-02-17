import './BeerListItem.css';

function BeerListItem({ beer, number }) {
  const { tapNumber, brewery, beer: beerName, style, blg, abv, price, onTap, isNew, isPremiere, isEmpty } = beer;

  return (
    <div className={`beer-list-item${isEmpty ? ' beer-list-item--empty' : ''}`}>
      <div className="beer-number">{tapNumber || number}</div>
      <div className="beer-info-main">
        <div className="beer-brewery">{brewery}</div>
        <div className="beer-name-col">{beerName}</div>
      </div>
      <div className="beer-style">{style}</div>
      <div className="beer-specs">
        {blg && <span className="spec-item">BLG: <strong>{blg}°</strong></span>}
        {blg && abv && <span className="spec-divider">|</span>}
        {abv && <span className="spec-item">ABV: <strong>{abv}</strong></span>}
      </div>
      <div className="beer-meta">
        {price && <span className="beer-price">{price}</span>}
        <span className="beer-tags">
          {onTap && <span className="beer-ontap">{onTap}</span>}
          {isNew && <span className="beer-tag new">New</span>}
          {isPremiere && <span className="beer-tag premiere">Premiere</span>}
        </span>
      </div>
    </div>
  );
}

export default BeerListItem;
