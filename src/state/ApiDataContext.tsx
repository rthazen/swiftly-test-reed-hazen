import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiData } from '../types/ApiData';

interface ApiDataContext {
  apiData: ApiData;
  setApiData: React.Dispatch<React.SetStateAction<ApiData>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ApiDataContext = createContext<ApiDataContext | undefined>(undefined);

export const useApiData = () => {
  const context = useContext(ApiDataContext);
  if (!context) {
    throw new Error('useApiData must be used within an ApiDataProvider');
  }
  return context;
};

export const ApiDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => { 
  const saveToLocalStorage = (data: ApiData) => {
    localStorage.setItem('apiData', JSON.stringify(data));
  };
  
  const loadFromLocalStorage = (): ApiData | null => {
    const storedData = localStorage.getItem('apiData');
    return storedData ? JSON.parse(storedData) : null;
  };

  const initialData = loadFromLocalStorage();
  const [apiData, setApiData] = useState<ApiData>(initialData || { characters: [], planets: [], species: [] });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!initialData) {
      fetchData();
    } else {
      setLoading(false); 
    }
  }, []);

  const fetchAllPages = async (url: string): Promise<any[]> => {
    let allData: any[] = [];

    const fetchData = async (url: string) => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        allData = [...allData, ...data.results];

        if (data.next) {
          await fetchData(data.next);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    await fetchData(url);

    return allData;
  };

  const fetchData = async () => {
    try {
      const [charactersData, planetsData, speciesData] = await Promise.all([
        fetchAllPages('https://swapi.dev/api/people/'),
        fetchAllPages('https://swapi.dev/api/planets/'),
        fetchAllPages('https://swapi.dev/api/species/')
      ]);
  
      const newData: ApiData = {
        characters: charactersData,
        planets: planetsData,
        species: speciesData
      };
  
      setApiData(newData);
      saveToLocalStorage(newData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    saveToLocalStorage(apiData);
  }, [apiData]);

  return (
    <ApiDataContext.Provider value={{ apiData, setApiData, loading, setLoading }}>
      {children}
    </ApiDataContext.Provider>
  );
};
