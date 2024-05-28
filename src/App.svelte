<script>
  import { Router } from "svelte-router-spa";
  import { navigateTo } from "svelte-router-spa";
  import { routes } from "./routes";
  import {
    providers,
    taxes,
    documentsTypes,
    items,
    receipts,
    paymentMethods,
    salesTypes,
    company,
  } from "./lib/stores/stores";
  import { onMount } from "svelte";

  if (!localStorage.getItem("token")) {
    localStorage.setItem("token", "");
  }
  if (!localStorage.getItem("isLogin")) {
    localStorage.setItem("isLogin", "");
  }

  $providers;
  $taxes;
  $documentsTypes;
  $items;
  $receipts;
  $paymentMethods;
  $salesTypes;
  $company;

  let timeout;

  function logout() {
    if (JSON.parse(localStorage.getItem("isLogin"))) {
      localStorage.setItem("isLogin", JSON.stringify(false));
      localStorage.setItem("token", "");
      navigateTo("login");
    }
  }

  function resetTimeout() {
    clearTimeout(timeout);
    timeout = setTimeout(logout, 600000);
  }

  onMount(() => {
    resetTimeout();
    document.addEventListener("mousemove", resetTimeout);
    document.addEventListener("mousedown", resetTimeout);
    document.addEventListener("keypress", resetTimeout);
  });
</script>

<Router {routes} />
