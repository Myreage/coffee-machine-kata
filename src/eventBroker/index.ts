type BrokerEvent<Type, Payload> = {
  type: Type;
  payload: Payload;
};

export type Broker = {
  subscribe: <Type, Payload>(subscriber: (event: BrokerEvent<Type, Payload>) => void) => void;
  publish: <Type, Payload>(event: BrokerEvent<Type, Payload>) => void;
};

export const instanciateBroker = (): Broker => {
  const subscribers = [];

  const subscribe = <Type, Payload>(subscriber: (event: BrokerEvent<Type, Payload>) => void): void => {
    subscribers.push(subscriber);
  };

  const publish = <Type, Payload>(event: BrokerEvent<Type, Payload>): void => {
    subscribers.forEach((subscriber) => subscriber(event));
  };

  return { subscribe, publish };
};
