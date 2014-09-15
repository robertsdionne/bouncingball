
/**
 * Generates an exponentially scalable grid with properly connected seams.
 * The code is horrid but it works.
 * @param {number} width The number of subdivisions per level.
 * @param {level} The number of levels. Each level is 3x larger with a 1/3 hole in the center,
 *     except for the base case which has no hole. Each level has "width" subdivisions.
 */
bouncingball.createGrid = function(width, opt_levels) {
  var levels = opt_levels || 0;
  var mm = 0.00;
  var grid = [];
  for (var i = 0; i <= levels; ++i) {
    var scale = 10.0 * Math.pow(3, i);
    for (var j = 0; j < width; ++j) {
      for (var k = 0; k < width; ++k) {

        // Skip this iteration if we are the base case or if we are within the boundary of the
        // central hole.
        if (i > 0 &&
            width / 3.0 < j + 2 && j - 1 < 2.0 / 3.0 * width &&
            width / 3.0 < k + 2 && k - 1 < 2.0 / 3.0 * width) {
          continue;
        }

        // Generate the triangles for the grid cells in the remaining region of this level.

        // coordinates
        grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
        // barycentric
        grid.push(1.0, 0.0, 0.0);

        // coordinates
        grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
        // barycentric
        grid.push(0.0, 1.0, 0.0);

        // coordinates
        grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
        // barycentric
        grid.push(0.0, 0.0, 1.0);

        // coordinates
        grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
        // barycentric
        grid.push(1.0, 0.0, 0.0);

        // coordinates
        grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
        // barycentric
        grid.push(0.0, 0.0, 1.0);

        // coordinates
        grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
        // barycentric
        grid.push(0.0, 1.0, 0.0);

        // Generate the "top right" corner grid cell.
        if (i > 0 &&
            2.0 / 3.0 * width == j - 1 &&
            2.0 / 3.0 * width == k - 1) {
          // coordinates
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);
        }

        // Generate the "top left" corder grid cell.
        if (i > 0 &&
            1.0 / 3.0 * width == j + 2 &&
            2.0 / 3.0 * width == k - 1) {
          // coordinates
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);
        }

        // Generate the "bottom right" corner grid cell.
        if (i > 0 &&
            2.0 / 3.0 * width == j - 1 &&
            1.0 / 3.0 * width == k + 2) {
          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);
        }

        // Generate the "bottom left" corner grid cell.
        if (i > 0 &&
            1.0 / 3.0 * width == j + 2 &&
            1.0 / 3.0 * width == k + 2) {
          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);
        }

        // Generate the "rightmost" seam.
        if (i > 0 &&
            2.0 / 3.0 * width == j - 1 &&
            width / 3.0 < k + 1 && k < 2.0 / 3.0 * width) {
          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale - scale / width / 3.0, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale - scale / width / 3.0, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale - 2.0 * scale / width / 3.0, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale - 2.0 * scale / width / 3.0, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale - scale / width / 3.0, mm * scale, ((j - 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);
        }

        // Generate the "leftmost" seam.
        if (i > 0 &&
            1.0 / 3.0 * width == j + 2 &&
            width / 3.0 < k + 1 && k < 2.0 / 3.0 * width) {
          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale - scale / width / 3.0, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale - 2.0 * scale / width / 3.0, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale - scale / width / 3.0, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale - 2.0 * scale / width / 3.0, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale - scale / width / 3.0, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 2) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);
        }

        // Generate the "topmost" seam.
        if (i > 0 &&
            2.0 / 3.0 * width == k - 1 &&
            width / 3.0 < j + 1 && j < 2.0 / 3.0 * width) {
          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k + 0) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - 2.0 * scale / width / 3.0);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);


          // coordinates
          grid.push(((k) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k - 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);


          // coordinates
          grid.push(((k) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k-1) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k-1) / width - 0.5) * scale, mm * scale, ((j+1) / width - 0.5) * scale - 2.0 * scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);
        }

        // Generate the "bottommost" seam.
        if (i > 0 &&
            1.0 / 3.0 * width == k + 2 &&
            width / 3.0 < j + 1 && j < 2.0 / 3.0 * width) {
          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 0) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - 2.0 * scale / width / 3.0);
          // barycentric
          grid.push(0.0, 1.0, 0.0);


          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);

          // coordinates
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j + 1) / width - 0.5) * scale - scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);


          // coordinates
          grid.push(((k + 1) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(1.0, 0.0, 0.0);

          // coordinates
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j+1) / width - 0.5) * scale - 2.0 * scale / width / 3.0);
          // barycentric
          grid.push(0.0, 0.0, 1.0);

          // coordinates
          grid.push(((k + 2) / width - 0.5) * scale, mm * scale, ((j) / width - 0.5) * scale);
          // barycentric
          grid.push(0.0, 1.0, 0.0);
        }
      }
    }
  }
  return new Float32Array(grid);
};
