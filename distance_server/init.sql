CREATE TABLE IF NOT EXISTS distance_history (
  id SERIAL PRIMARY KEY,
  source VARCHAR(255),
  destination VARCHAR(255),
  distance_km FLOAT,
  distance_mi FLOAT
);