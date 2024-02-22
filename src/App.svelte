<script>
  import { Router } from "svelte-router-spa";
  import { routes } from "./routes";
  import { providers } from "./lib/stores/stores";

  $providers;
</script>

<Router {routes} />
