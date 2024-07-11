<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { Wallet } from '../lib/components/wallet';
  import Context from '../lib/components/context';
  import { NetworkId, BlackDragonChestContract } from '../lib/components/config';

  // Define a writable store for signedAccountId
  const signedAccountId = writable('');

  let wallet;

  onMount(async () => {
    const accountChangeHook = (accountId) => signedAccountId.set(accountId);
    wallet = new Wallet({ createAccessKeyFor: BlackDragonChestContract, networkId: NetworkId });
    await wallet.startUp(accountChangeHook);
  });
</script>

<style>
  @import '/static/chest-assets/globals.css';
  @import '/static/chest-assets/app.module.css';
</style>

<svelte:head>
  <title>Black Dragon Chest Game</title>
  <meta name="description" content="Black Dragon Chest Game" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/favicon.ico" />
</svelte:head>

<div class="root">
  <!-- Pass wallet and signedAccountId directly to Context component -->
  <context {wallet} {signedAccountId} />
</div>
