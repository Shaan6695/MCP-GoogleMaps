#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
//import fetch from 'node-fetch'; // Added this static import

// Response interface
interface GoogleMapsResponse {
  status: string;
  error_message?: string;
}

interface GeocodeResponse extends GoogleMapsResponse {
  results: Array<{
    place_id: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      }
    };
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
}

interface PlacesSearchResponse extends GoogleMapsResponse {
  results: Array<{
    name: string;
    place_id: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      }
    };
    rating?: number;
    types: string[];
  }>;
}

interface PlacesDetailsResponse extends GoogleMapsResponse {
  result: {
    name: string;
    place_id: string;
    formatted_address: string;
    formatted_phone_number?: string;
    website?: string;
    rating?: number;
    reviews?: Array<{
      author_name: string;
      rating: number;
      text: string;
      time: number;
    }>;
    opening_hours?: {
        weekday_text: string[];
        open_now: boolean;
    };
    geometry: {
      location: {
        lat: number;
        lng: number;
      }
    };
  };
};

function getApiKey(): string {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_MAPS_API_KEY environment variable is not set");
      process.exit(1);
    }
    return apiKey;
  }

const GOOGLE_MAPS_API_KEY = getApiKey();

// Tool definition for Geocode
const Geocode_Tool: Tool = {
    name: "maps_geocode",
    description: "Convert an address into geographic coordinates",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The address to geocode"
        }
      },
      required: ["address"]
    }
  };

  // API handler for Geocode
async function getGeocode(address: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.append("address", address);
  url.searchParams.append("key", GOOGLE_MAPS_API_KEY);

  const response = await fetch(url.toString());
  const data = await response.json() as GeocodeResponse;

  if (data.status !== "OK") {
    return {
      content: [{
        type: "text",
        text: `Geocoding failed: ${data.error_message || data.status}`
      }],
      isError: true
    };
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        location: data.results[0].geometry.location,
        formatted_address: data.results[0].formatted_address,
        place_id: data.results[0].place_id
      }, null, 2)
    }],
    isError: false
  };
}

// Tool definition for Geocode to Address
const Geocode_To_Address: Tool = {
  name: "geocode_to_address",
  description: "Convert geo-coordinates into an Address",
  inputSchema: {
    type: "object",
    properties: {
      latitude: {
        type: "number",
        description: "Latitude coordinate"
      },
      longitude: {
        type: "number",
        description: "Longitude coordinate"
      }
    },
    required: ["latitude", "longitude"]
  }
};

//Api handler for Geocode to Address
async function getGeocode_To_Address(latitude: number, longitude: number) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.append("latlng", `${latitude},${longitude}`);
  url.searchParams.append("key", GOOGLE_MAPS_API_KEY);

  const response = await fetch(url.toString());
  const data = await response.json() as GeocodeResponse;

  if (data.status !== "OK") {
    return {
      content: [{
        type: "text",
        text: `Reverse geocoding failed: ${data.error_message || data.status}`
      }],
      isError: true
    };
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        formatted_address: data.results[0].formatted_address,
        place_id: data.results[0].place_id,
        address_components: data.results[0].address_components
      }, null, 2)
    }],
    isError: false
  };
}

// Tool definition for Places Search
const Search_Places: Tool = {
  name: "maps_search_places",
  description: "Search for places using the Google Places API",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query"
      },
      location: {
        type: "object",
        properties: {
          latitude: { type: "number" },
          longitude: { type: "number" }
        },
        description: "Optional center point for the search"
      },
      radius: {
        type: "number",
        description: "Optional Search radius in meters (max 50000)"
      }
    },
    required: ["query"]
  }
};

// API handler for Places Search
async function getPlaceSearch(
  query: string,
  location?: { latitude: number; longitude: number },
  radius?: number
) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.append("query", query);
  url.searchParams.append("key", GOOGLE_MAPS_API_KEY);

  if (location) {
    url.searchParams.append("location", `${location.latitude},${location.longitude}`);
  }
  if (radius) {
    url.searchParams.append("radius", radius.toString());
  }

  const response = await fetch(url.toString());
  const data = await response.json() as PlacesSearchResponse;

  if (data.status !== "OK") {
    return {
      content: [{
        type: "text",
        text: `Place search failed: ${data.error_message || data.status}`
      }],
      isError: true
    };
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        places: data.results.map((place) => ({
          name: place.name,
          formatted_address: place.formatted_address,
          location: place.geometry.location,
          place_id: place.place_id,
          rating: place.rating,
          types: place.types
        }))
      }, null, 2)
    }],
    isError: false
  };
}

// Tool definition for Specific Place Details
const Specific_Place_Details: Tool = {
  name: "maps_place_details",
  description: "Get detailed information about a specific place",
  inputSchema: {
    type: "object",
    properties: {
      place_id: {
        type: "string",
        description: "The place ID to get details for"
      }
    },
    required: ["place_id"]
  }
};

// API handler for Specific Place Details
async function getPlaceDetails(place_id: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.append("place_id", place_id);
  url.searchParams.append("key", GOOGLE_MAPS_API_KEY);

  const response = await fetch(url.toString());
  const data = await response.json() as PlacesDetailsResponse;

  if (data.status !== "OK") {
    return {
      content: [{
        type: "text",
        text: `Place details request failed: ${data.error_message || data.status}`
      }],
      isError: true
    };
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        name: data.result.name,
        formatted_address: data.result.formatted_address,
        location: data.result.geometry.location,
        formatted_phone_number: data.result.formatted_phone_number,
        website: data.result.website,
        rating: data.result.rating,
        reviews: data.result.reviews,
        opening_hours: data.result.opening_hours
      }, null, 2)
    }],
    isError: false
  };
}

// List of all the tools
const MAPS_TOOLS = [
  Geocode_Tool,
  Geocode_To_Address,
  Search_Places,
  Specific_Place_Details,
  
] as const;

// Server setup
const server = new Server(
  {
    name: "mcp-server/google-places-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Set up request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: MAPS_TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "maps_geocode": {
        const { address } = request.params.arguments as { address: string };
        return await getGeocode(address);
      }

      case "maps_reverse_geocode": {
        const { latitude, longitude } = request.params.arguments as {
          latitude: number;
          longitude: number;
        };
        return await getGeocode_To_Address(latitude, longitude);
      }

      case "maps_search_places": {
        const { query, location, radius } = request.params.arguments as {
          query: string;
          location?: { latitude: number; longitude: number };
          radius?: number;
        };
        return await getPlaceSearch(query, location, radius);
      }

      case "maps_place_details": {
        const { place_id } = request.params.arguments as { place_id: string };
        return await getPlaceDetails(place_id);
      }

      default:
        return {
          content: [{
            type: "text",
            text: `Unknown tool: ${request.params.name}`
          }],
          isError: true
        };
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Maps MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});


