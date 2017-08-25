import {isEqual} from "lodash/fp";
import {property} from "jsverify";
import sinon from "sinon";

import {add, addOne} from "../lib";

describe("basic math", () => {
  property("adds two numbers", "nat", "nat", (a, b) =>
    isEqual(add(a, b), b + a)
  );

  property("can work asynchronously as well", "nat", x => {
    const stub = sinon.stub().resolves(x);
    return stub().then(isEqual(x));
  });

  xit("fails this chai test", () => addOne(1).should.equal(2));
});
