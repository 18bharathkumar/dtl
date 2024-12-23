document.addEventListener("DOMContentLoaded", function () {
    // Initialize the map
    const map = L.map("map").setView([12.924257583928451, 77.50020973592544], 14);
  
    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  
    // Routes Data
    const routes = {
      route1: {
        name: "Route 1: RV College to MG Road",
        points: [
          { coords: [12.9263, 77.5033], name: "RV College Hub" },
          { coords: [12.9270, 77.5060], name: "IIMB Junction" },
          { coords: [12.9302, 77.5094], name: "Jayanagar 4th Block" },
          { coords: [12.9345, 77.5119], name: "Lalbagh" },
          { coords: [12.9442, 77.5907], name: "MG Road" },
        ],
        color: "blue",
      },
      route2: {
        name: "Route 2: RV College to Kengeri",
        points: [
          { coords: [12.9263, 77.5033], name: "RV College Hub" },
          { coords: [12.9193, 77.4901], name: "Banashankari" },
          { coords: [12.9144, 77.4730], name: "Uttarahalli" },
          { coords: [12.9062, 77.4599], name: "Kengeri" },
        ],
        color: "green",
      },
      route3: {
        name: "Route 3: RV College to Sarjapur",
        points: [
          { coords: [12.9263, 77.5033], name: "RV College Hub" },
          { coords: [12.9205, 77.5107], name: "BTM Layout" },
          { coords: [12.9101, 77.5275], name: "HSR Layout" },
          { coords: [12.8905, 77.5612], name: "Sarjapur Road" },
        ],
        color: "red",
      },
      route4: {
        name: "Route 4: Near Jayadeva",
        points: [
          { coords: [12.924257583928451, 77.50020973592544], name: "Your Location" },
          { coords: [12.9208, 77.5070], name: "Jayadeva Hospital" },
          { coords: [12.9135, 77.5175], name: "Dairy Circle" },
          { coords: [12.9076, 77.5228], name: "Koramangala" },
        ],
        color: "orange",
      },
      route5: {
        name: "Route 5: National College",
        points: [
          { coords: [12.924257583928451, 77.50020973592544], name: "Your Location" },
          { coords: [12.9299, 77.4964], name: "RV Teachers College" },
          { coords: [12.9335, 77.4911], name: "National College" },
        ],
        color: "purple",
      },
    };
  
    // Draw a route
    function drawRoute(route) {
      map.eachLayer((layer) => {
        if (layer instanceof L.Polyline || layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
  
      const polyline = L.polyline(route.points.map((point) => point.coords), {
        color: route.color,
      }).addTo(map);
  
      route.points.forEach((point) => {
        L.marker(point.coords).addTo(map).bindPopup(point.name);
      });
  
      map.fitBounds(polyline.getBounds());
    }
  
    // Handle route selection
    const routeSelect = document.getElementById("routeSelect");
    routeSelect.addEventListener("change", function () {
      const selectedRoute = routes[routeSelect.value];
      drawRoute(selectedRoute);
    });
  
    // Draw the first route by default
    drawRoute(routes.route1);
  });
  