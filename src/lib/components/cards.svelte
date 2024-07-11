<script>
    import { Link } from 'svelte-routing';
    import styles from '../../static/chest-assets/app.module.css';
  </script>
  
  <style>
    .grid {
      display: grid;
      /* Add your grid styles here */
    }
  
    .card {
      /* Add your card styles here */
    }
  </style>
  
  <div class={styles.grid}>
    <Link to="https://docs.near.org/build/web3-apps/quickstart" class={styles.card} target='_blank' rel="noopener noreferrer">
      <h2>
        Near Docs <span>-&gt;</span>
      </h2>
      <p>Learn how this application works, and what you can build on Near.</p>
    </Link>
  
    <Link to="/hello-near" class={styles.card} rel="noopener noreferrer">
      <h2>
        Near Integration <span>-&gt;</span>
      </h2>
      <p>Discover how simple it is to interact with a Near smart contract.</p>
    </Link>
  </div>
  