import {isEqual} from "lodash/fp";
import {property} from "jsverify";
import sinon from "sinon";

describe("basic math", () => {
  property("adds two numbers", "nat", "nat", (a, b) => isEqual(a + b, b + a));

  property("can work asynchronously as well", "nat", x => {
    const stub = sinon.stub().resolves(x);
    return stub().then(isEqual(x));
  });

  xit("fails this chai test", () => (0 + 1).should.equal(2));
});
