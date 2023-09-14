import Login from "../../views/login/Login.svelte";
import MainAdminLayout from "../../views/layout/MainAdminLayout.svelte";
import Dashboard from "../../views/dashboard/Dashboard.svelte";
import CustomerManager from "../../views/customers/CustomerManager.svelte";
import CustomerForm from "../../views/customers/CustomerForm.svelte";
import ProvidersManager from "../../views/providers/ProvidersManager.svelte";
import ProviderForm from "../../views/providers/ProviderForm.svelte";
import ItemsManager from "../../views/items/ItemsManager.svelte";
import ItemForm from "../../views/items/ItemForm.svelte";
import InvociesManager from "../../views/invoices/InvociesManager.svelte";
import InvoiceForm from "../../views/invoices/InvoiceForm.svelte";

function isAuthenticated() {
  const isLogin = JSON.parse(localStorage.getItem("isLogin"));
  const token = localStorage.getItem("token");

  if (isLogin && token.length > 0) {
    return true;
  }
  return false;
}

const protectedRoutes = [
  {
    name: "login",
    component: Login,
  },
  {
    name: "/",
    component: Dashboard,
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
  },
  {
    name: "/customers_manager",
    component: CustomerManager,
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
  },
  {
    name: "/customer_form/:id",
    component: CustomerForm,
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
  },
  {
    name: "/providers_manager",
    component: ProvidersManager,
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
  },
  {
    name: "/provider_form/:id",
    component: ProviderForm,
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
  },
  {
    name: "/items_manager",
    component: ItemsManager,
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
  },
  {
    name: "/item_form/:id",
    component: ItemForm,
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
  },
  {
    name: "/invoices_manager",
    component: InvociesManager,
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
  },
  {
    name: "/invoice_form/:id",
    component: InvoiceForm,
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
  },
];

export { protectedRoutes };
