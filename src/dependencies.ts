import { Broker } from "./eventBroker";
import {
  Order,
  OrderWithSugar,
  OrderWithoutSugar,
  SugarAmount,
  Drink,
  MissingMoneyError,
  DrinkHeat,
  ValidOrder,
} from "./types";

const isValidOrder = (order: Order): order is OrderWithSugar | OrderWithoutSugar => "drink" in order;

type OutputStick = "" | "0";
const mapOrderToStick = (sugarAmount: SugarAmount): OutputStick => (sugarAmount ? "0" : "");

type OutputSugar = "" | "1" | "2";
const mapOrderToSugar: Record<SugarAmount, OutputSugar> = {
  0: "",
  1: "1",
  2: "2",
};

type OutputDrink = "T" | "C" | "H" | "O";
const mapOrderToDrink: Record<Drink, OutputDrink> = {
  chocolate: "H",
  coffee: "C",
  tea: "T",
  orange: "O",
};

type OutputHeat = "h" | "";
const mapOrderToHeat: Record<DrinkHeat, OutputHeat> = {
  cold: "",
  extraHot: "h",
  hot: "",
};

export const formatOrderToMachineProtocol = (order: OrderWithSugar | OrderWithoutSugar | MissingMoneyError): string => {
  if (isValidOrder(order)) {
    const sugar = mapOrderToSugar[order.sugar];
    const drink = mapOrderToDrink[order.drink];
    const stick = mapOrderToStick(order.sugar);
    const extraHot = mapOrderToHeat[order.heat];
    return `${drink}${extraHot}:${sugar}:${stick}`;
  }

  if (order.error === "missing_money") {
    return `M:Missing ${order.amountInCents} cents`;
  }
};

export const createPublishOrderProcessedEvent =
  (publish: (event) => void) => (orderWithMoney: { drink: Drink; moneyEarned: number }) => {
    const event = {
      type: "orderProcessed",
      payload: {
        drink: orderWithMoney.drink,
        moneyEarned: orderWithMoney.moneyEarned,
      },
    };
    publish(event);
  };

export const initiateState = (broker: Broker) => {
  type State = {
    drinks: { coffee: number; chocolate: number; tea: number; orange: number };
    moneyEarned: number;
  };
  let state: State = {
    drinks: { coffee: 0, chocolate: 0, tea: 0, orange: 0 },
    moneyEarned: 0,
  };

  const reportingReducer =
    ({ drink, moneyEarned }: { drink: Drink; moneyEarned: number }) =>
    (state: State): State => ({
      drinks: {
        ...state.drinks,
        [drink]: state.drinks[drink] + 1,
      },
      moneyEarned: state.moneyEarned + moneyEarned,
    });

  const reportingSubscriber = (event: {
    type: "orderProcessed";
    payload: {
      drink: Drink;
      moneyEarned: number;
    };
  }) => {
    state = reportingReducer(event.payload)(state);
  };

  const readReporting = () => state;

  broker.subscribe(reportingSubscriber);

  return { incrementReporting: reportingReducer, readReporting };
};
