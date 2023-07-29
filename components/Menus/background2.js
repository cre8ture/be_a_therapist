// 'use client'
// import React, { useEffect, useRef } from 'react';

// const PerlinNoiseGrid = () => {
//   const cnvsRef = useRef(null);

//   useEffect(() => {
//     const cnvs = cnvsRef.current;
//     const ctx = cnvs.getContext('2d');

//     // Define the Perlin noise functions
//     let perlin = {
//       rand_vect: function () {
//         let theta = Math.random() * 2 * Math.PI;
//         return { x: Math.cos(theta), y: Math.sin(theta) };
//       },
//       gradients: {},
//       memory: {},
//       dot_prod_grid: function (x, y, vx, vy) {
//         let g_vect;
//         let d_vect = { x: x - vx, y: y - vy };
//         if (this.gradients[[vx, vy]]) {
//           g_vect = this.gradients[[vx, vy]];
//         } else {
//           g_vect = this.rand_vect();
//           this.gradients[[vx, vy]] = g_vect;
//         }
//         return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
//       },
//       smootherstep: function (x) {
//         return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
//       },
//       interp: function (x, a, b) {
//         return a + this.smootherstep(x) * (b - a);
//       },
//       seed: function () {
//         this.gradients = {};
//         this.memory = {};
//       },
//       get: function (x, y) {
//         if (this.memory.hasOwnProperty([x, y])) return this.memory[[x, y]];
//         let xf = Math.floor(x);
//         let yf = Math.floor(y);
//         //interpolate
//         let tl = this.dot_prod_grid(x, y, xf, yf);
//         let tr = this.dot_prod_grid(x, y, xf + 1, yf);
//         let bl = this.dot_prod_grid(x, y, xf, yf + 1);
//         let br = this.dot_prod_grid(x, y, xf + 1, yf + 1);
//         let xt = this.interp(x - xf, tl, tr);
//         let xb = this.interp(x - xf, bl, br);
//         let v = this.interp(y - yf, xt, xb);
//         this.memory[[x, y]] = v;
//         return v;
//       },
//     };

//     perlin.seed();

//     const GRID_SIZE = 4;
//     const RESOLUTION = 128;
//     const COLOR_SCALE = 250;

//     const updateCanvasSize = () => {
//       // Set the canvas size to match the width of its parent container
//       const parent = cnvs.parentElement;
//       cnvs.width = parent.offsetWidth;
//       cnvs.height = parent.offsetHeight;
//     };

//     // Update canvas size initially and on window resize
//     updateCanvasSize();
//     window.addEventListener('resize', updateCanvasSize);

//     const pixel_size = cnvs.width / RESOLUTION;
//     const num_pixels = GRID_SIZE / RESOLUTION;

//     for (let y = 0; y < GRID_SIZE; y += num_pixels) {
//       for (let x = 0; x < GRID_SIZE; x += num_pixels) {
//         const v = parseInt(perlin.get(x, y) * COLOR_SCALE);
//         ctx.fillStyle = `hsl(${v}, 50%, 50%)`;
//         ctx.fillRect(
//           (x / GRID_SIZE) * cnvs.width,
//           (y / GRID_SIZE) * cnvs.width,
//           pixel_size,
//           pixel_size
//         );
//       }
//     }

//     return () => {
//       // Clean up the event listener when the component unmounts
//       window.removeEventListener('resize', updateCanvasSize);
//     };
//   }, []);

//   return <canvas ref={cnvsRef} style={{ width: '100%', height: '100%' }} />;
// };

// export default PerlinNoiseGrid;


import React, { useEffect, useRef } from 'react';

const PerlinNoiseGrid = () => {
  const cnvsRef = useRef(null);
  const requestIdRef = useRef(null);

  useEffect(() => {
    const cnvs = cnvsRef.current;
    const ctx = cnvs.getContext('2d');

    // Define the Perlin noise functions
    // ... (rest of the Perlin noise code)
// Define the Perlin noise functions
let perlin = {
  rand_vect: function () {
    let theta = Math.random() * 2 * Math.PI;
    return { x: Math.cos(theta), y: Math.sin(theta) };
  },
  gradients: {},
  memory: {},
  dot_prod_grid: function (x, y, vx, vy) {
    let g_vect;
    let d_vect = { x: x - vx, y: y - vy };
    if (this.gradients[[vx, vy]]) {
      g_vect = this.gradients[[vx, vy]];
    } else {
      g_vect = this.rand_vect();
      this.gradients[[vx, vy]] = g_vect;
    }
    return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
  },
  smootherstep: function (x) {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  },
  interp: function (x, a, b) {
    return a + this.smootherstep(x) * (b - a);
  },
  seed: function () {
    this.gradients = {};
    this.memory = {};
  },
  get: function (x, y) {
    if (this.memory.hasOwnProperty([x, y])) return this.memory[[x, y]];
    let xf = Math.floor(x);
    let yf = Math.floor(y);
    //interpolate
    let tl = this.dot_prod_grid(x, y, xf, yf);
    let tr = this.dot_prod_grid(x, y, xf + 1, yf);
    let bl = this.dot_prod_grid(x, y, xf, yf + 1);
    let br = this.dot_prod_grid(x, y, xf + 1, yf + 1);
    let xt = this.interp(x - xf, tl, tr);
    let xb = this.interp(x - xf, bl, br);
    let v = this.interp(y - yf, xt, xb);
    this.memory[[x, y]] = v;
    return v;
  },
};

    perlin.seed();
    // Function to render the grid
    const renderGrid = () => {
      const GRID_SIZE = 4;
      const RESOLUTION = 128;
      const COLOR_SCALE = 250;

      const pixel_size = cnvs.width / RESOLUTION;
      const num_pixels = GRID_SIZE / RESOLUTION;

      for (let y = 0; y < GRID_SIZE; y += num_pixels) {
        for (let x = 0; x < GRID_SIZE; x += num_pixels) {
          const v = parseInt(perlin.get(x, y) * COLOR_SCALE);
          ctx.fillStyle = `hsl(${v}, 50%, 50%)`;
          ctx.fillRect(
            (x / GRID_SIZE) * cnvs.width,
            (y / GRID_SIZE) * cnvs.height,
            pixel_size,
            pixel_size
          );
        }
      }
    };

    const animateGrid = () => {
      renderGrid();
      requestIdRef.current = requestAnimationFrame(animateGrid);
    };

    const updateCanvasSize = () => {
      // Set the canvas size to match the width of its parent container
      const parent = cnvs.parentElement;
      cnvs.width = parent.offsetWidth;
      cnvs.height = parent.offsetHeight;
      renderGrid();
    };

    // Update canvas size initially and on window resize
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Start the animation loop
    requestIdRef.current = requestAnimationFrame(animateGrid);

    return () => {
      // Clean up the event listener and animation frame when the component unmounts
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(requestIdRef.current);
    };
  }, []);

  return <canvas ref={cnvsRef} style={{ width: '100%', height: '100%' }} />;
};

export default PerlinNoiseGrid;