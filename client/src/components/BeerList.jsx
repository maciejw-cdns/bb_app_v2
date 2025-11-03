import BeerListItem from './BeerListItem';
import './BeerList.css';

function BeerList({ beers }) {
  if (!beers || beers.length === 0) {
    return <div className="no-beers">No beers available</div>;
  }

  return (
    <div className="beer-list-container">
      <div className="beer-list-table">
        {beers.map((beer, index) => (
          <BeerListItem key={index} beer={beer} number={index + 1} />
        ))}
      </div>
    </div>
  );
}

export default BeerList;

