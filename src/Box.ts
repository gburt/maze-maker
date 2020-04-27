export class Box {
  Start: boolean;
  End: boolean;
  Paths: {[index: string]: boolean};
  X: number;
  Y: number;
  triedDirections: {[index: string]: boolean};
  happyPath: boolean;
  diversion: boolean;
}
