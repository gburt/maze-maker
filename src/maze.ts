import {Box} from './Box';

export class Maze {
  Width: number;
  Height: number;
  Boxes: Box[][];
  Attempts: Box[][];
}

export type Direction = 'up' | 'down' | 'left' | 'right';

const directions: Direction[] = ['up', 'down', 'left', 'right'];

const opposite: {[index: string]: Direction} = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * Math.floor(max)); // tslint:disable-line:insecure-random
};

export const NewMaze = (width: number, height: number) => {
  const maze = new Maze();
  maze.Width = width;
  maze.Height = height;
  maze.Boxes = [];
  maze.Attempts = [];

  // instantiate (create) all the boxes
  for (let y = 0; y < height; y++) {
    maze.Boxes[y] = [];
    for (let x = 0; x < width; x++) {
      const newBox = new Box();
      newBox.X = x;
      newBox.Y = y;
      newBox.Paths = {};
      newBox.triedDirections = {};
      maze.Boxes[y][x] = newBox;
    }
  }

  // pick the starting point from an Box on the edge
  const startX = 0; // getRandomInt(width);
  const startY = 0; // getRandomInt(height);

  const startBox = maze.Boxes[startY][startX];
  startBox.Start = true;
  startBox.happyPath = true;

  const endX = width - 1;
  const endY = height - 1;

  const endBox = maze.Boxes[endY][endX];
  endBox.End = true;

  // starting at the start, make a path to the end without revisiting any prior box
  let box = startBox;
  let count = 0;
  const happyPath: Box[] = [];
  while (box !== endBox) {
    // what are our options?  find the adjacent boxes w/ the fewest paths on them, then pick randomly between them
    const allOptions = directions
      .map((dir) => ({dir, box: adjacent(maze, box, dir)}))
      .filter((opt) => !!opt.box)
      .filter((opt) => !box.triedDirections[opt.dir])
      .filter((opt) => !opt.box!.happyPath);

    let fewestPaths = 4;
    allOptions.forEach((opt) => {
      const num = Object.keys(opt.box!.Paths).length;
      if (num < fewestPaths) {
        fewestPaths = num;
      }
    });
    const options = allOptions.filter(
      (opt) => Object.keys(opt.box!.Paths).length === fewestPaths,
    );

    if (options.length === 0) {
      maze.Attempts.push(happyPath.concat([]));
      // console.log(`pushing attempt with  ${happyPath.length} entries`);
      box.happyPath = false;
      box.Paths = {};
      if (box === startBox) {
        console.log('trying to pop start box!', happyPath);
      }

      happyPath.pop();
      box = happyPath[happyPath.length - 1];
      continue;
    }

    // pick a random direction
    const option = options[getRandomInt(options.length)];
    const newBox = option.box!;
    box.triedDirections[option.dir] = true;

    // console.log(
    //   `box:  ${box.X}, ${box.Y} with ${
    //     options.length
    //   } options, tried options = ${
    //     Object.keys(box.triedDirections).length
    //   }; trying`,
    //   newBox
    // );
    // we've found a path! add paths in both directions
    box.Paths[option.dir] = true;
    newBox.Paths[opposite[option.dir]] = true;
    box = newBox;
    box.happyPath = true;
    happyPath.push(box);

    count++;
    if (count > 5000) {
      console.log('out of total moves :(', maze, happyPath);
      break;
    }
  }

  // along the happy path, make some diversions!
  console.log('maze built!!');
  const tenPercent = 0.2 * happyPath.length;
  happyPath.forEach((happyBox, i) => {
    if (getRandomInt(happyPath.length) < tenPercent) {
      makeDiversion(maze, happyBox);
    }
  });

  startBox.Paths.left = true;
  endBox.Paths.right = true;

  return maze;
};

const makeDiversion = (maze: Maze, box: Box) => {
  // what are our options?  find the adjacent boxes w/ the fewest paths on them, then pick randomly between them
  const allOptions = directions
    .map((dir) => ({dir, box: adjacent(maze, box, dir)}))
    .filter((opt) => !!opt.box)
    .filter((opt) => !opt.box!.happyPath && !opt.box!.diversion)
    .filter((opt) => Object.keys(opt.box!.Paths).length <= 2);

  if (allOptions.length === 0) {
    return;
  }

  const options = allOptions;
  options.sort(() => getRandomInt(3) - 2);

  // follow one branch plus 20% of other branches
  let optionsTaken = 0;
  options.forEach((option) => {
    if (optionsTaken === 0 || getRandomInt(10) === 0) {
      optionsTaken++;
      const newBox = option.box!;

      box.Paths[option.dir] = true;
      newBox.Paths[opposite[option.dir]] = true;
      newBox.diversion = true;
      makeDiversion(maze, newBox);
    }
  });
};

const adjacent = (
  maze: Maze,
  box: Box,
  direction: Direction,
): Box | undefined => {
  let newX = box.X;
  let newY = box.Y;
  if (direction === 'up') {
    newY--;
  } else if (direction === 'down') {
    newY++;
  } else if (direction === 'left') {
    newX--;
  } else if (direction === 'right') {
    newX++;
  } else {
    throw new Error(`Unknown direction`);
  }

  const newRow = maze.Boxes[newY];
  if (newRow) {
    return newRow[newX];
  }
  return undefined;
};
