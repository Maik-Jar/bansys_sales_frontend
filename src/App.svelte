<script>
  import { Router } from "svelte-router-spa";
  import { routes } from "./routes";
  import { providers } from "./lib/stores/stores";
  import { onMount } from "svelte";

  if (!localStorage.getItem("token")) {
    localStorage.setItem("token", "");
  }
  if (!localStorage.getItem("isLogin")) {
    localStorage.setItem("isLogin", "");
  }
  $providers;
</script>

<Router {routes} />
