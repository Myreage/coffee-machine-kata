export type Drink = ClassicDrink | "orange";
type ClassicDrink = "tea" | "coffee" | "chocolate";
export type SugarAmount = 0 | 1 | 2;

type OrangeJuiceOrderInput = {
  drink: "orange";
  heat: "cold";
  sugar: 0;
  moneyAmountInCents: number;
};

type ClassicDrinkOrderInput = {
  drink: Drink;
  heat: "hot" | "extraHot";
  sugar: SugarAmount;
  moneyAmountInCents: number;
};

export type OrderInput = OrangeJuiceOrderInput | ClassicDrinkOrderInput;

export type MissingMoneyError = {
  error: "missing_money";
  amountInCents: number;
};

export type DrinkHeat = "cold" | "hot" | "extraHot";

export type OrderWithoutSugar = {
  drink: Drink;
  sugar: 0;
  withStick: false;
  heat: DrinkHeat;
};

export type OrderWithSugar = {
  drink: Drink;
  sugar: 1 | 2;
  withStick: true;
  heat: DrinkHeat;
};

export type Order = MissingMoneyError | ValidOrder;
export type ValidOrder = OrderWithSugar | OrderWithoutSugar;

type MachineProtocolType = string;

export type Dependencies = {
  formatOrderToMachineProtocol: (order: Order) => MachineProtocolType;
  publishOrderProcessedEvent: (orderWithMoney: { drink: Drink; moneyEarned: number }) => void;
};
