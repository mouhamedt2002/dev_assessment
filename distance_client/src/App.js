import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // Define state variables
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [distance_km, setDistanceKm] = useState(null);
  const [distance_mi, setDistanceMi] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState('km');
  const [showHistory, setShowHistory] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDistanceKm(null);
    setDistanceMi(null);

    if (!source) {
      setError("Source address is not provided");
      return;
    }
    if (!destination) {
      setError("Destination address is not provided");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/distance", {source, destination});
      setDistanceKm(response.data.distance_km);
      setDistanceMi(response.data.distance_mi);
    } catch (error) {
      setError("Failed to calculate distance. Please try again");
    }
  };

  // Get history from the server
  const getHistory = async () => {
    console.log("testing get history")
    try {
      const response = await axios.get("http://localhost:5000/history");
      setHistory(response.data);
      setShowHistory((prev) => !prev);
    } catch (error) {
      setError("Failed to get past queries. Please try again");
    }
    
  };

  const getDistance = () => {
    if (distance_km == null || distance_mi == null) return null;
    switch (unit) {
      case 'km':
        return <p>Distance: {distance_km} km</p>;
      case 'miles':
        return <p>Distance: {distance_mi} miles</p>;
      case 'both':
        return <p>Distance: {distance_km} km / {distance_mi} miles</p>
      default:
        return null;
    }
  };

  // useEffect(() => {
  //   getHistory();
  // }, []);

  return (
    <div className="App">
      {/* Title and history button */}
      <div className="header">
        <h1 className="title">Distance Calculator</h1>
        <button className="history-button" onClick={getHistory}>{!showHistory ? 'View Historical Queries' : 'Back to Calculator'}</button>
      </div>
      
      {/* Subtitle */}
      <h2 className="subtitle">Prototype web application for calculating the distance between two addresses.</h2>
  
      {!showHistory ? (
      <div>
        {/* Form for inputing source and destination */}
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <div className="input-group">
              <label htmlFor="source" className="input-label">Source Address:</label>
              <input type="text" id="source" className="text-input" placeholder="Enter source" value={source} onChange={(e)=> setSource(e.target.value)} />
            </div>

            <div className="input-group">
              <label htmlFor="destination" className="input-label">Destination Address:</label>
              <input type="text" id="destination" className="text-input" placeholder="Enter destination"  value={destination} onChange={(e)=> setDestination(e.target.value)} />
            </div>

            {/* Unit Selector Radio Button */}
            <div className="unit-selector">
              <p className="input-label">Distance Unit:</p>
              <label className="radio-option">
                <input
                  type="radio"
                  name="unit"
                  value="km"
                  checked={unit === 'km'}
                  onChange={(e) => setUnit(e.target.value)}
                />
                km
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="unit"
                  value="miles"
                  checked={unit === 'miles'}
                  onChange={(e) => setUnit(e.target.value)}
                />
                miles
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="unit"
                  value="both"
                  checked={unit === 'both'}
                  onChange={(e) => setUnit(e.target.value)}
                />
                both
              </label>
            </div>
          </div>
          
          {/* Calculate button */}
          <div className="footer">
            <button className="calculate-button" type="submit">Calculate Distance</button>
          </div>
        </form>

        <div className="footer">
          {error && <p style={{ color: "red" }}>{error}</p>}
          {getDistance()}
        </div>
      </div>
      
      ) : (
      <div className="history">
        {/* History of all queries */}
        <h3>History</h3>
        <ul>
          {history.map((query, index) => (
            <li key={index}>
              {query.source} to {query.destination}: {query.distance_km} km / {query.distance_mi} miles
            </li>
          ))}
        </ul>
      </div>
      )}

    </div>


  );
}

export default App;
