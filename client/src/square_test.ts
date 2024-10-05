import * as assert from 'assert';
import { solid, split, toJson, fromJson, findSubTreeRoot, replaceSubTreeRoot } from './square';
import { nil, cons } from './list';


describe('square', function() {

  it('toJson', function() {
    assert.deepEqual(toJson(solid("white")), "white");
    assert.deepEqual(toJson(solid("green")), "green");

    const s1 = split(solid("blue"), solid("orange"), solid("purple"), solid("white"));
    assert.deepEqual(toJson(s1),
      ["blue", "orange", "purple", "white"]);

    const s2 = split(s1, solid("green"), s1, solid("red"));
    assert.deepEqual(toJson(s2),
      [["blue", "orange", "purple", "white"], "green",
       ["blue", "orange", "purple", "white"], "red"]);

    const s3 = split(solid("green"), s1, solid("yellow"), s1);
    assert.deepEqual(toJson(s3),
      ["green", ["blue", "orange", "purple", "white"],
       "yellow", ["blue", "orange", "purple", "white"]]);
  });

  it('fromJson', function() {
    assert.deepEqual(fromJson("white"), solid("white"));
    assert.deepEqual(fromJson("green"), solid("green"));

    const s1 = split(solid("blue"), solid("orange"), solid("purple"), solid("white"));
    assert.deepEqual(fromJson(["blue", "orange", "purple", "white"]), s1);

    assert.deepEqual(
        fromJson([["blue", "orange", "purple", "white"], "green",
                 ["blue", "orange", "purple", "white"], "red"]),
        split(s1, solid("green"), s1, solid("red")));

    assert.deepEqual(
        fromJson(["green", ["blue", "orange", "purple", "white"],
                  "yellow", ["blue", "orange", "purple", "white"]]),
        split(solid("green"), s1, solid("yellow"), s1));
  });

  it('findSubTreeRoot', function() {
    const s1 = split(solid("blue"), solid("orange"), solid("purple"), solid("white"));
    const s2 = split(s1, solid("orange"), s1, solid("white"));
    const s3 = split(s2, solid("orange"), s1, solid("white"));
    // base case: sq is solid and path is empty
    assert.deepEqual(findSubTreeRoot(solid("blue"), nil), solid("blue"));
    // base case: sq is solid and path is not empty
    assert.deepEqual(findSubTreeRoot(solid("blue"), cons("NE", nil)), undefined);
    // 1 rec case
    assert.deepEqual(findSubTreeRoot(s1, cons("NW", nil)), solid("blue"));
    assert.deepEqual(findSubTreeRoot(s1, cons("SE", nil)), solid("white"));
    // 2+ rec case
    assert.deepEqual(findSubTreeRoot(s2, cons("NW", cons("NE", nil))), solid("orange"));
    assert.deepEqual(findSubTreeRoot(s3, cons("NW", cons("SW", cons("SW", nil)))), solid("purple"));
  });

  it('replaceSubTreeRoot', function() {
    const s1 = split(solid("blue"), solid("orange"), solid("purple"), solid("white"));
    const s11 = split(solid("blue"), solid("orange"), solid("white"), solid("white"));
    const s13 = split(solid("blue"), solid("orange"), solid("purple"), s1);
    const s2 = split(s1, solid("orange"), s1, solid("white"));
    const s23 = split(s1, solid("orange"), s13, solid("white"));
    const s22 = split(s11, solid("orange"), s1, solid("white"));
    const s3 = split(s2, solid("orange"), s1, solid("white"));
    const s33 = split(s23, solid("orange"), s1, solid("white"));
    // base case: sq is solid and path is empty
    const s4 = solid("blue");
    assert.deepEqual(replaceSubTreeRoot(s4, nil, solid("white")), solid("white"));
    // base case: sq is solid and path is not empty
    // some test that catches the exception 
    // 1 rec case
    assert.deepEqual(replaceSubTreeRoot(s1, cons("NW", nil), solid("white")), split(solid("white"), solid("orange"), solid("purple"), solid("white")));
    assert.deepEqual(replaceSubTreeRoot(s1, cons("NE", nil), solid("white")), split(solid("blue"), solid("white"), solid("purple"), solid("white")));
    // 2+ rec case
    assert.deepEqual(replaceSubTreeRoot(s2, cons("NW", cons("SW", nil)), solid("white")), s22);
    assert.deepEqual(replaceSubTreeRoot(s3, cons("NW", cons("SW", cons("SE", nil))), s1), s33);
  });

});
