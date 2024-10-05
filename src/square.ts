import { List, nil } from './list';


export type Color = "white" | "red" | "orange" | "yellow" | "green" | "blue" | "purple";

/** Converts a string to a color (or throws an exception if not a color). */
export const toColor = (s: string): Color => {
  switch (s) {
    case "white": case "red": case "orange": case "yellow":
    case "green": case "blue": case "purple":
      return s;

    default:
      throw new Error(`unknown color "${s}"`);
  }
};

export type Square =
    | {readonly kind: "solid", readonly color: Color}
    | {readonly kind: "split", readonly nw: Square, readonly ne: Square,
       readonly sw: Square, readonly se: Square};

/** Returns a solid square of the given color. */
export const solid = (color: Color): Square => {
  return {kind: "solid", color: color};
};

/** Returns a square that splits into the four given parts. */
export const split =
    (nw: Square, ne: Square, sw: Square, se: Square): Square => {
  return {kind: "split", nw: nw, ne: ne, sw: sw, se: se};
};


export type Dir = "NW" | "NE" | "SE" | "SW";

/** Describes how to get to a square from the root of the tree. */
export type Path = List<Dir>;


/** Returns JSON describing the given Square. */
export const toJson = (sq: Square): unknown => {
  if (sq.kind === "solid") {
    return sq.color;
  } else {
    return [toJson(sq.nw), toJson(sq.ne), toJson(sq.sw), toJson(sq.se)];
  }
};

/** Converts a JSON description to the Square it describes. */
export const fromJson = (data: unknown): Square => {
  if (typeof data === 'string') {
    return solid(toColor(data))
  } else if (Array.isArray(data)) {
    if (data.length === 4) {
      return split(fromJson(data[0]), fromJson(data[1]),
                   fromJson(data[2]), fromJson(data[3]));
    } else {
      throw new Error('split must have 4 parts');
    }
  } else {
    throw new Error(`type ${typeof data} is not a valid square`);
  }
}

/** Given a square and a path, retrieve the root of the subtree at that location (assuming it exists). */
export const findSubTreeRoot = (sq: Square, path: Path): Square | undefined =>{
  if (sq.kind === "solid"){
    if (path === nil){
      return sq;
    } else {
      return undefined;
    }
  }
  if (path === nil){
    return sq;
  }
  const x = path.hd;
  if (x === "NE"){
    return findSubTreeRoot(sq.ne, path.tl);
  } else if (x === "NW"){
    return findSubTreeRoot(sq.nw, path.tl);
  } else if (x === "SW"){
    return findSubTreeRoot(sq.sw, path.tl);
  } else {
    return findSubTreeRoot(sq.se, path.tl);
  }
}

/** Given a square, a path, and a second square, return a new square that is the same as the first one except
that the subtree whose root is at the given path is replaced by the second square. */
export const replaceSubTreeRoot = (sq: Square, path: Path, sq2: Square): Square => {
  if (path === nil){
    return sq2;
  }
  if (sq.kind === "solid") {
    throw new Error("path too long");
  } else if (path.hd === "NE"){
    return split(sq.nw, replaceSubTreeRoot(sq.ne, path.tl, sq2), sq.sw, sq.se);
  } else if (path.hd === "NW"){
    return split(replaceSubTreeRoot(sq.nw, path.tl, sq2), sq.ne, sq.sw, sq.se);
  } else if (path.hd === "SE"){
    return split(sq.nw, sq.ne, sq.sw, replaceSubTreeRoot(sq.se, path.tl, sq2));
  } else {
    return split(sq.nw, sq.ne, replaceSubTreeRoot(sq.sw, path.tl, sq2), sq.se);
  } 
}

/**
  * Determines whether the given value is a record.
  * @param val the value in question
  * @return true if the value is a record and false otherwise
  */
export const isRecord = (val: unknown): val is Record<string, unknown> => {
  return val !== null && typeof val === "object";
};