import { app, coffeeMachine, computeOrder } from ".";
import { createPublishOrderProcessedEvent, formatOrderToMachineProtocol, initiateState } from "./dependencies";
import { instanciateBroker } from "./eventBroker";
import { Order, OrderInput } from "./types";

describe("Coffee machine", () => {
  it("Ask for a coffee with sugar", () => {
    const orderInput: OrderInput = {
      drink: "coffee",
      sugar: 1,
      moneyAmountInCents: 5000,
      heat: "hot",
    };

    const expectedOutput: string = "C:1:0";
    const publishMock = jest.fn();
    expect(
      coffeeMachine({ formatOrderToMachineProtocol, publishOrderProcessedEvent: publishMock })(orderInput)
    ).toEqual(expectedOutput);
  });

  it("Ask for a coffee with sugar with not enough money", () => {
    const orderInput: OrderInput = {
      drink: "coffee",
      heat: "hot",
      sugar: 1,
      moneyAmountInCents: 5,
    };

    const expectedOutput: string = "M:Missing 55 cents";
    const publishMock = jest.fn();
    expect(
      coffeeMachine({ formatOrderToMachineProtocol, publishOrderProcessedEvent: publishMock })(orderInput)
    ).toEqual(expectedOutput);
  });
});

describe("Order computation", () => {
  it("Ask for a no-sugar chocolate", () => {
    const orderInput: OrderInput = {
      drink: "chocolate",
      heat: "hot",
      sugar: 0,
      moneyAmountInCents: 50,
    };

    const expectedOutput: Order = {
      heat: "hot",
      drink: "chocolate",
      sugar: 0,
      withStick: false,
    };

    const publishMock = jest.fn();
    expect(computeOrder(publishMock)(orderInput)).toEqual(expectedOutput);
  });

  it("Ask for a no-sugar tea", () => {
    const orderInput: OrderInput = {
      heat: "hot",
      drink: "tea",
      sugar: 0,
      moneyAmountInCents: 40,
    };

    const expectedOutput: Order = {
      heat: "hot",
      drink: "tea",
      sugar: 0,
      withStick: false,
    };

    const publishMock = jest.fn();
    expect(computeOrder(publishMock)(orderInput)).toEqual(expectedOutput);
  });

  it("Ask for a coffee with 1 sugar", () => {
    const orderInput: OrderInput = {
      heat: "hot",
      drink: "coffee",
      sugar: 1,
      moneyAmountInCents: 60,
    };

    const expectedOutput: Order = {
      heat: "hot",
      drink: "coffee",
      sugar: 1,
      withStick: true,
    };

    const publishMock = jest.fn();
    expect(computeOrder(publishMock)(orderInput)).toEqual(expectedOutput);
  });

  it("Ask for a tea with 2 sugar", () => {
    const orderInput: OrderInput = {
      drink: "tea",
      heat: "hot",
      sugar: 2,
      moneyAmountInCents: 40,
    };

    const expectedOutput: Order = {
      drink: "tea",
      heat: "hot",
      sugar: 2,
      withStick: true,
    };

    const publishMock = jest.fn();
    expect(computeOrder(publishMock)(orderInput)).toEqual(expectedOutput);
  });

  it("Ask for a tea with no sugar with the right amount of money", () => {
    const orderInput: OrderInput = {
      drink: "tea",
      heat: "hot",
      sugar: 0,
      moneyAmountInCents: 40,
    };

    const expectedOutput: Order = {
      drink: "tea",
      sugar: 0,
      heat: "hot",
      withStick: false,
    };

    const publishMock = jest.fn();
    expect(computeOrder(publishMock)(orderInput)).toEqual(expectedOutput);
  });

  it("Ask for a tea with no sugar with not enough money", () => {
    const orderInput: OrderInput = {
      drink: "tea",
      heat: "hot",
      sugar: 0,
      moneyAmountInCents: 10,
    };

    const expectedOutput: Order = {
      error: "missing_money",
      amountInCents: 30,
    };

    const publishMock = jest.fn();
    expect(computeOrder(publishMock)(orderInput)).toEqual(expectedOutput);
  });

  it("Ask for a coffee with no sugar with not enough money", () => {
    const orderInput: OrderInput = {
      drink: "coffee",
      heat: "hot",
      sugar: 0,
      moneyAmountInCents: 20,
    };

    const expectedOutput: Order = {
      error: "missing_money",
      amountInCents: 40,
    };

    const publishMock = jest.fn();
    expect(computeOrder(publishMock)(orderInput)).toEqual(expectedOutput);
  });

  it("Ask for a coffee with no sugar with too much money", () => {
    const orderInput: OrderInput = {
      drink: "coffee",
      heat: "hot",
      sugar: 0,
      moneyAmountInCents: 2000,
    };

    const expectedOutput: Order = {
      drink: "coffee",
      heat: "hot",
      sugar: 0,
      withStick: false,
    };

    const publishMock = jest.fn();
    expect(computeOrder(publishMock)(orderInput)).toEqual(expectedOutput);
  });

  it("Ask for an orange juice", () => {
    const orderInput: OrderInput = {
      drink: "orange",
      heat: "hot",
      sugar: 0,
      moneyAmountInCents: 60,
    };

    const expectedOutput: Order = {
      drink: "orange",
      heat: "hot",
      sugar: 0,
      withStick: false,
    };

    const publishMock = jest.fn();

    expect(computeOrder(publishMock)(orderInput)).toEqual(expectedOutput);
  });

  it("Ask for an extra hot coffee", () => {
    const orderInput: OrderInput = {
      drink: "coffee",
      heat: "extraHot",
      sugar: 0,
      moneyAmountInCents: 60,
    };

    const expectedOutput: Order = {
      drink: "coffee",
      sugar: 0,
      withStick: false,
      heat: "extraHot",
    };

    const publishMock = jest.fn();

    expect(computeOrder(publishMock)(orderInput)).toEqual(expectedOutput);
  });
});

describe("reporting", () => {
  it("an event is emitted after an order is processed", () => {
    const orderInput: OrderInput = {
      drink: "coffee",
      sugar: 1,
      moneyAmountInCents: 60,
      heat: "hot",
    };

    const broker = instanciateBroker();
    const statistics = initiateState(broker);
    app(broker)(orderInput);
    expect(statistics.readReporting()).toEqual({
      drinks: { chocolate: 0, tea: 0, orange: 0, coffee: 1 },
      moneyEarned: 60,
    });
  });
});
