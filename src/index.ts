import { createPublishOrderProcessedEvent, formatOrderToMachineProtocol } from "./dependencies";
import { Broker, instanciateBroker } from "./eventBroker";
import { Dependencies, Drink, Order, OrderInput } from "./types";

type Output = string;

const mapDrinkToPrice: Record<Drink, number> = {
  chocolate: 50,
  coffee: 60,
  tea: 40,
  orange: 60,
};

const computeMissingAmountInCents = (drink: Drink, moneyAmountInCents: number): number => {
  return mapDrinkToPrice[drink] - moneyAmountInCents;
};

export const computeOrder =
  (publishOrderProcessedEvent: Dependencies["publishOrderProcessedEvent"]) =>
  (order: OrderInput): Order => {
    const missingMoneyAmountInCents = computeMissingAmountInCents(order.drink, order.moneyAmountInCents);
    if (missingMoneyAmountInCents > 0) {
      return {
        error: "missing_money",
        amountInCents: missingMoneyAmountInCents,
      };
    }

    publishOrderProcessedEvent({ drink: order.drink, moneyEarned: order.moneyAmountInCents });

    if (order.sugar) {
      return {
        drink: order.drink,
        withStick: true,
        sugar: order.sugar,
        heat: order.heat,
      };
    }

    return {
      drink: order.drink,
      withStick: false,
      heat: order.heat,
      sugar: 0,
    };
  };

export const coffeeMachine =
  ({ formatOrderToMachineProtocol, publishOrderProcessedEvent }: Dependencies) =>
  (orderInput: OrderInput): Output => {
    const order = computeOrder(publishOrderProcessedEvent)(orderInput);

    return formatOrderToMachineProtocol(order);
  };

export const app =
  (broker: Broker) =>
  (orderInput: OrderInput): Output => {
    const dependencies: Dependencies = {
      formatOrderToMachineProtocol: formatOrderToMachineProtocol,
      publishOrderProcessedEvent: createPublishOrderProcessedEvent(broker.publish),
    };
    return coffeeMachine(dependencies)(orderInput);
  };
