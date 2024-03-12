<script>
  import { Router } from "svelte-router-spa";
  import { routes } from "./routes";
  import {
    providers,
    taxes,
    documentsTypes,
    items,
    receipts,
    paymentMethods,
    salesTypes,
  } from "./lib/stores/stores";

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
</script>

<Router {routes} />
