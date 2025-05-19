// src/ssr-stubs/leaflet.js
// A minimal Leaflet stub so SSR never tries to touch `window`

module.exports = {
  map: () => ({
    remove: () => {}
  }),
  tileLayer: () => ({
    addTo: () => {}
  }),
  marker: () => ({
    addTo: () => {},
    bindPopup: () => {},
    on: () => {}
  }),
  layerGroup: () => ({
    addTo: () => {},
    clearLayers: () => {}
  }),
  polyline: () => ({
    addTo: () => {}
  }),
  icon: () => ({}),
  // If you use Routing Machine statically:
  Routing: {
    control: () => ({
      on: () => {},
      setWaypoints: () => {}
    }),
    osrmv1: () => ({})
  }
};
