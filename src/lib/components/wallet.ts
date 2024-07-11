// src/lib/wallet.ts
import { keyStores, providers } from 'near-api-js';
import { distinctUntilChanged, map } from 'rxjs';
import '@near-wallet-selector/modal-ui/styles.css';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import type { WalletSelector, NetworkId } from '@near-wallet-selector/core';

const THIRTY_TGAS = '30000000000000';
const NO_DEPOSIT = '0';

type WalletOptions = {
  networkId: NetworkId;
  createAccessKeyFor?: string;
};

type ViewMethodOptions = {
  contractId: string;
  method: string;
  args?: Record<string, unknown>;
};

type CallMethodOptions = {
  contractId: string;
  method: string;
  args?: Record<string, unknown>;
  gas?: string;
  deposit?: string;
};

export class Wallet {
  createAccessKeyFor: string;
  networkId: NetworkId = 'testnet';
  selector: Promise<WalletSelector>;
  selectedWalletId: string | undefined | null;
  accounts: Array<{ accountId: string; active: boolean }> = [];

  constructor({ networkId = 'testnet', createAccessKeyFor = "blackdragonchest.testnet" }: WalletOptions) {
    this.createAccessKeyFor = createAccessKeyFor;
    this.networkId = networkId;
    this.selector = setupWalletSelector({
      network: this.networkId,
      modules: [setupMyNearWallet(), setupHereWallet(), setupMeteorWallet()]
    });
  }

  async startUp(accountChangeHook: (accountId: string) => void): Promise<string> {
    const walletSelector = await this.selector;
    const isSignedIn = walletSelector.isSignedIn();
    const accountId = isSignedIn ? walletSelector.store.getState().accounts[0].accountId : '';
    this.selectedWalletId = walletSelector.store.getState().selectedWalletId;
    this.accounts = walletSelector.store.getState().accounts;

    walletSelector.store.observable
      .pipe(
        map(state => state.accounts),
        distinctUntilChanged()
      )
      .subscribe(accounts => {
        const signedAccount = accounts.find(account => account.active)?.accountId;
        accountChangeHook(signedAccount || '');
      });

    return accountId;
  }

  async signIn(): Promise<void> {
    const modal = setupModal(await this.selector, { contractId: this.createAccessKeyFor });
    modal.show();
  }

  async signOut(): Promise<void> {
    const selectedWallet = await (await this.selector).wallet();
    await selectedWallet.signOut();
  }

  async viewMethod({ contractId, method, args = {} }: ViewMethodOptions): Promise<any> {
    const url = `https://rpc.${this.networkId}.near.org`;
    const provider = new providers.JsonRpcProvider({ url });

    const res = await provider.query({
      request_type: 'call_function',
      account_id: contractId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic',
    });
    // Access the result correctly
    if ('result' in res && typeof res.result === 'string') {
      return JSON.parse(Buffer.from(res.result).toString());
    } else {
      throw new Error('Unexpected response format');
    }
  }

  async callMethod({ contractId, method, args = {}, gas = THIRTY_TGAS, deposit = NO_DEPOSIT }: CallMethodOptions): Promise<any> {
    const selectedWallet = await (await this.selector).wallet();
    const outcome = await selectedWallet.signAndSendTransaction({
      receiverId: contractId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: method,
            args,
            gas,
            deposit,
          },
        },
      ],
    });
    if (outcome) {
      return providers.getTransactionLastResult(outcome);
    } else {
      throw new Error('Transaction failed');
    }
  }

  async getTransactionResult(txhash: string): Promise<any> {
    const walletSelector = await this.selector;
    const { network } = walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    const transaction = await provider.txStatus(txhash, 'unnused');
    return providers.getTransactionLastResult(transaction);
  }

  getSelectedWalletId(): string | null | undefined {
    return this.selectedWalletId;
  }

  getAccounts(): Array<{ accountId: string; active: boolean }> {
    return this.accounts;
  }

  getKeyStore(networkId: string, accountId: string): string {
    let storageKey = `near-api-js:keystore:${networkId}:${accountId}`;

    if (this.selectedWalletId === "meteor-wallet") {
      storageKey = `_meteor_wallet${accountId}:${networkId}`;
    }

    const keyData = localStorage.getItem(storageKey);
    if (!keyData) {
      throw new Error(`No key found in local storage for account: ${accountId}`);
    }

    return keyData;
  }
}
