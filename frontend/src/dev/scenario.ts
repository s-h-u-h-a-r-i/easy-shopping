import { createStore } from 'solid-js/store';

export type MockUser = {
  id: string;
  name: string;
  email: string;
};

export type NetworkMode = 'success' | 'error' | 'slow';

export type Scenario = {
  auth: {
    user: MockUser | null;
  };
  network: NetworkMode;
};

export const MOCK_USERS: MockUser[] = [
  { id: 'mock-user-1', name: 'Alice', email: 'alice@example.com' },
  { id: 'mock-user-2', name: 'Bob', email: 'bob@example.com' },
];

export const [scenario, setScenario] = createStore<Scenario>({
  auth: { user: MOCK_USERS[0] },
  network: 'success',
});
