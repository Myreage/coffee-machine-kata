import { instanciateBroker } from ".";

describe("Event broker", () => {
  it("A unique subscriber should be invoked when a message is received", () => {
    const { subscribe, publish } = instanciateBroker();

    const subscriber = jest.fn();

    subscribe(subscriber);

    publish({ type: "testEvent", payload: null });

    expect(subscriber).toHaveBeenCalled();
  });
  it("All subscribers should be invoked when a message is received", () => {
    const { subscribe, publish } = instanciateBroker();

    const subscriber1 = jest.fn();
    const subscriber2 = jest.fn();

    subscribe(subscriber1);
    subscribe(subscriber2);

    publish({ type: "testEvent", payload: null });

    expect(subscriber1).toHaveBeenCalled();
    expect(subscriber2).toHaveBeenCalled();
  });
});
