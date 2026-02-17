import BeerListItem from './BeerListItem';
import './BeerList.css';

const TOTAL_SLOTS = 16;

const emptyBeer = {
  tapNumber: '-',
  brewery: '',
  beer: 'N/A',
  style: '',
  blg: '',
  abv: '',
  price: '',
  onTap: '',
  isNew: false,
  isPremiere: false,
  isEmpty: true,
};

function BeerList({ beers }) {
  // Pad or trim to exactly TOTAL_SLOTS items
  const displayBeers = [];
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    if (beers && beers[i]) {
      displayBeers.push(beers[i]);
    } else {
      displayBeers.push({ ...emptyBeer, tapNumber: `${i + 1}` });
    }
  }

  return (
    <div className="beer-list-container">
      <div className="beer-list-table">
        {displayBeers.map((beer, index) => (
          <BeerListItem key={index} beer={beer} number={index + 1} />
        ))}
      </div>
    </div>
  );
}

export default BeerList;
