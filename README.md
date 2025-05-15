# MCP-GoogleMaps
### An MCP Server using the Google Places API
----------
## Project Setup Instructions


* Get a Google Maps API key by following the instructions [here](https://developers.google.com/maps/documentation/javascript/get-api-key#create-api-keys).

* Clone the repository and enter the project folder:
   ```bash
   git clone https://github.com/Shaan6695/MCP-GoogleMaps.git
   ```
   ```
   cd MCP-GoogleMaps
   ```
* Install dependencies:
   ```bash
   npm install
   ```
* Create a `.env` file in the project root and add your API key:
   ```bash
   GOOGLE_MAPS_API_KEY = your_api_key_here  
   ```
* Build the TypeScript source file:
   ```bash
   npm run build
   ```
* If using Claude Desktop, add this to your claud_desktop_config.json file
  ```bash
  {
    "mcpServers": {
      "MCP-GoogleMaps": {
        "command": "node",
        "args": [
          "/Your_File_Path_Here/dist/index.js"
      ],
        "env": {
          "GOOGLE_MAPS_API_KEY": "your_api_key_here"
        }
      }
    }
  }

```


----------
## Available Tools

1. `maps_geocode`

   - Description : Convert an address into geographic coordinates
   - Input:
       - Required : `address` (string)
   - Returns: `location`, `formatted_address`, `place_id`
  
2. `geocode_to_address`

   - Description : Convert geo-coordinates into an Address
   - Input:
       - Required : `Latitude` & `Longitude` (Numbers)  
   - Returns: `formatted_address`, `place_id`, `address_components`
  
3. `maps_search_places`

   - Description : Search for places using the Google Places API
   - Input:
       - Required : `Search Query` (String)
       - Optional: Latitude & Longitude, and Radius (Numbers)
   - Returns: `name`, `formatted_address`, `location`, `place_id`, `rating`, `types`
  
4. `maps_place_details`

   - Description : Get detailed information about a specific place
   - Input:
       - Required : `place_id` (string)
   - Returns: `name`, `formatted_address`, `location`, `formatted_phone_number`, `website`, `rating`, `reviews`, `opening_hours`
  
5. `maps_place_ratings`

   - Description : Retrieves and summarizes up to 5 ratings for a specific place.
   - Input:
       - Required : `place_id` (String)
   - Returns: `author`, `rating`, `text`, `time`

### Helpful Links :
* [Typscript SDK for MCP](https://github.com/modelcontextprotocol/typescript-sdk)
