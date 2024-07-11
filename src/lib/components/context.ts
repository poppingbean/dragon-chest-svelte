// context.ts
import { writable } from 'svelte/store';
import { Wallet } from '../components/wallet'; // Điều chỉnh đường dẫn tùy theo cấu trúc dự án của bạn

// Define writable store for signedAccountId
export const signedAccountId = writable<string>('');

// Define type for context
interface NearContext {
  wallet?: Wallet;
  signedAccountId: string;
}

// Initialize context
let context: NearContext = {
  wallet: undefined,
  signedAccountId: '',
};

// Function to set context values
export function setContext(values: Partial<NearContext>) {
  context = {
    ...context,
    ...values,
  };
}

// Function to get context values
export function getContext(): NearContext {
  return context;
}
export default context;
