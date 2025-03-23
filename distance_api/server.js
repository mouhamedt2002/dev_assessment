const express = require("express");
const axios = require("axios");
const cors = require("cors");
const morgan = require("morgan");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = 5000;


app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Set up PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper function to calculate distance
const calculateDistance = (s_lat, s_lon, d_lat, d_lon) => {
    // Radius of the Earth in km
    const R = 6371; 
    const t = d_lat - s_lat;
    console.log(d_lat);
    const dLat = ((d_lat - s_lat) * Math.PI) / 180;
    console.log(s_lat);
    const dLon = ((d_lon - s_lon) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((s_lat * Math.PI) / 180) *
        Math.cos((d_lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return [R * c, R * c * 0.621371]; // Distance in km and miles
  
};

// validate source and destination
const validateAddress = (address) => {
    // checks if address is string, not empty, and doesn't have special characters
    return typeof address === "string" && address.trim().length > 0 && /^[a-zA-Z0-9\s,.-]+$/.test(address);
};
// Endpoint to get distance
app.post("/distance", async (req, res) => {
    const { source, destination } = req.body;
    try {
        // Validate source and destination
        if (!validateAddress(source)) {
            return res.status(400).json({ error: "Invalid source address" });
        }
        
        if (!validateAddress(destination)) {
            return res.status(400).json({ error: "Invalid destination address" });
        }
        
        // Get coordinates from source and destination
        const sourceCoordinates = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${source}`
        )
        
        const sourceData = sourceCoordinates.data[0];
        if (!sourceData) {
            return res.status(404).json({ error: "Source address not found" });
        }
        const destinationCoordinates = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${destination}`
        )
        const destinationData = destinationCoordinates.data[0];

        // console.log("sourceData: ", source, sourceData);
        // console.log("destinationData: ", destination, destinationData);

        if (!destinationData) {
            return res.status(404).json({ error: "Destination address not found" });
        }
        // Calculate distance
        const [distance_km, distance_mi] = calculateDistance(
            parseFloat(sourceData.lat),
            parseFloat(sourceData.lon),
            parseFloat(destinationData.lat),
            parseFloat(destinationData.lon)
        );
        console.log("distance_km: ", distance_km, "distance_mi: ", distance_mi);

        // Save query to database
        await pool.query(
            "INSERT INTO distance_queries (source, destination, distance_km, distance_mi) VALUES ($1, $2, $3, $4)",
            [source, destination, distance_km, distance_mi]
        );

        // Return distance
        res.json({ distance_km, distance_mi });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to calculate distance" });
    }
});

// Endpoint to get history
app.get("/history", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM distance_queries ORDER BY id DESC");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get history"})
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});