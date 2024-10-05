import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";


// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check

// Map to store saves 
const saves: Map<string, unknown> = new Map<string, unknown>();


/** Handles request for /api/save */
export const save = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.body.name;
  if (name === undefined || typeof name !== 'string') {
    res.status(400).send('required argument "name" was missing');
    return;
  }

  const value = req.body.value;
  if (value === undefined) {
    res.status(400).send('required argument "value" was missing');
    return;
  }

  if (saves.has(name)){
    saves.set(name, value);
    res.send({replaced: true});
  } else {
    saves.set(name, value);
    res.send({replaced: false});
  }
};

/** Handles request for /api/list */
export const list = (_req: SafeRequest, res: SafeResponse): void => {
  res.send({savesList: Array.from(saves.keys())});
};

/** Handles request for /api/load */
export const load = (req: SafeRequest, res: SafeResponse): void => {
  const fileName = first(req.query.name);
  if (fileName === undefined) {
    res.status(400).send('did not provide a valid name');
    return;
  }
  if (!saves.has(fileName)) {
    res.status(404).send('no saved file of the given name exists');
    return;
  } else {
    res.send({savedDrawing: saves.get(fileName)});
  }
};


// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
const first = (param: unknown): string|undefined => {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
};

/** Used in tests to set the saves map back to empty. */
export const resetSavesForTesting = (): void => {
  saves.clear();
};
