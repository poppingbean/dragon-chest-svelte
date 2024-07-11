<script>
    export let message;
    export let type;
    import styles from '../static/chest-assets/togglenoti.module.css';
  </script>
  
  <style>
    .notification {
      /* Add your notification styles here */
    }
  
    /* Add other type-specific styles here */
  </style>
  
  {#if message}
    <div class={`${styles.notification} ${styles[type]}`}>
      {message}
    </div>
  {/if}
  