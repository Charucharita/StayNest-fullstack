const map = new mapboxgl.Map({
    accessToken: mapToken,
    container: 'map',
    style: 'mapbox://styles/mapbox/standard', // Use the standard style for the map
    zoom: 9, // initial zoom level, 0 is the world view, higher values zoom in
    center: listing.geometry.coordinates // center the map on this longitude and latitude
});

const marker = new mapboxgl.Marker({color: "red"})
    .setLngLat( listing.geometry.coordinates) //Listing.geometry.coordinates
    .setPopup(new mapboxgl.Popup({offset: 25})
    .setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after booking.</p>`)
    .setMaxWidth("300px"))
    .addTo(map)