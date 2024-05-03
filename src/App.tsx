import React, { useState } from 'react';
import { useApiData } from './state/ApiDataContext';
import './App.css';
import Loader from './assets/Loader.svg';


const App = () => {
  const { apiData, loading } = useApiData();
  const [searchTerm, setSearchTerm] = useState('');

  const findMatches = (wordToMatch: string | RegExp) => {
    return apiData.characters.filter((character) => {
      const regex = typeof wordToMatch === 'string' ? new RegExp(wordToMatch, 'gi') : wordToMatch;
      const speciesName = character.species.length > 0 ? character.species.map(speciesUrl => getSpeciesName([speciesUrl])).join(', ') : 'Human';
      return (
        character.name.match(regex) ||
        getPlanetName(character.homeworld).match(regex) ||
        speciesName.match(regex) ||
        (wordToMatch === 'Human' && character.species.length === 0)
      );
    });
  }
  
  const getPlanetName = (planetUrl: string) => {
    const planetId = planetUrl.split('/').slice(-2, -1)[0];
    const numberPlanets = Number(planetId) - 1
    return apiData.planets[numberPlanets] ? apiData.planets[numberPlanets].name : '';
  }

  const getSpeciesName = (speciesUrls: string[]) => {
    if (speciesUrls.length === 0) {
      return 'Human';
    }
  
    return speciesUrls.map(speciesUrl => {
      const speciesId = speciesUrl.split('/').slice(-2, -1)[0];
      const numberSpecies = Number(speciesId) - 1;
      return apiData.species[numberSpecies] ? apiData.species[numberSpecies].name : 'Human';
    }).join(', ');
  }
  
  const displayMatches = () => {
    const matchedCharacters = findMatches(searchTerm);
    if (matchedCharacters.length === 0) {
      return <li className="noResults">No results found</li>;
    }
  
    return matchedCharacters.map((character, index) => {
      const name = character.name;
      const planet = getPlanetName(character.homeworld);
      const species = character.species.length > 0
        ? character.species.map(speciesUrl => getSpeciesName([speciesUrl])).join(', ')
        : 'Human';
  
      const regex = new RegExp(searchTerm, 'gi');
  
      const highlightedName = highlightText(name, regex);
      const highlightedPlanet = highlightText(planet, regex);
      const highlightedSpecies = highlightText(species, regex);
  
      return (
        <li key={index} className="characterListItem">
          <span className="name">{highlightedName}</span>
          <span className="homeworld">{highlightedPlanet}</span>
          <span className="species">{highlightedSpecies}</span>
        </li>
      );
    });
  }
  
  const highlightText = (text: string, regex: RegExp) => {
    const parts = text.split(regex);
    return parts.map((part, i) => (
      <React.Fragment key={i}>
        {i > 0 ? <span className="highlight">{regex.exec(text)}</span> : null}
        {part}
      </React.Fragment>
    ));
  }
  
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }
  
  return (
    <div className="App">
      {loading ? (
        <div className="loaderContainer">
          <img src={Loader} className="loaderWheel" alt="loader" />
        </div>
        ) : (
      <form className="searchForm">
        <input
          type="text"
          className="search"
          placeholder="Search by name, homeworld, or species"
          onChange={handleSearch}
        />
        
          <ul className="suggestions">
            {displayMatches()}
          </ul>
      </form>
      )}
    </div>
  );
}

export default App;
