# MCP-GoogleMaps
### An MCP Server using the Google Places API
----------
## Project Setup Instructions


1. Get a Google Maps API key by following the instructions [here](https://developers.google.com/maps/documentation/javascript/get-api-key#create-api-keys).

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
