// src/declarations.d.ts
declare module 'togpx' {
  function togpx(
    geojson: any,
    options?: { featureTitle?: string; creator?: string; indent?: number }
  ): string;
  export default togpx;
}
