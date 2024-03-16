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
import QuotationsManager from "../../views/quotations/QuotationsManager.svelte";
import QuotationForm from "../../views/quotations/QuotationForm.svelte";
import DocumentTypeManager from "../../views/master_data/documentType/DocumentTypeManager.svelte";
import DocumentTypeForm from "../../views/master_data/documentType/DocumentTypeForm.svelte";
import PaymentMethodManager from "../../views/master_data/paymentMethods/PaymentMethodManager.svelte";
import PaymentMethodForm from "../../views/master_data/paymentMethods/PaymentMethodForm.svelte";
import SalesTypeManager from "../../views/master_data/salesType/SalesTypeManager.svelte";
import SalesTypeForm from "../../views/master_data/salesType/SalesTypeForm.svelte";
import TaxManager from "../../views/master_data/taxes/TaxManager.svelte";
import TaxForm from "../../views/master_data/taxes/TaxForm.svelte";
import ReceiptManager from "../../views/master_data/receipts/ReceiptManager.svelte";
import ReceiptForm from "../../views/master_data/receipts/ReceiptForm.svelte";
import PaymentsManager from "../../views/accounting/payments/PaymentsManager.svelte";
import PaymentForm from "../../views/accounting/payments/PaymentForm.svelte";
import { getItem } from "../utils/functions";

function isAuthenticated() {
  const isLogin = JSON.parse(getItem("isLogin"));
  const token = getItem("token");

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
    name: "/customers",
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
    nestedRoutes: [
      {
        name: "customers_list",
        component: CustomerManager,
      },
      {
        name: "customer_form",
        component: CustomerForm,
      },
    ],
  },
  {
    name: "/providers",
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
    nestedRoutes: [
      {
        name: "providers_list",
        component: ProvidersManager,
      },
      {
        name: "provider_form",
        component: ProviderForm,
      },
    ],
  },
  {
    name: "/products_and_services",
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
    nestedRoutes: [
      {
        name: "items_list",
        component: ItemsManager,
      },
      {
        name: "item_form",
        component: ItemForm,
      },
    ],
  },
  {
    name: "/sales",
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
    nestedRoutes: [
      {
        name: "invoices_list",
        component: InvociesManager,
      },
      {
        name: "invoice_form",
        component: InvoiceForm,
      },
      {
        name: "quotations_list",
        component: QuotationsManager,
      },
      {
        name: "quotation_form",
        component: QuotationForm,
      },
    ],
  },
  {
    name: "master_data",
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
    nestedRoutes: [
      {
        name: "document_type_list",
        component: DocumentTypeManager,
      },
      {
        name: "document_type_form",
        component: DocumentTypeForm,
      },
      {
        name: "payments_methods_list",
        component: PaymentMethodManager,
      },
      {
        name: "payment_method_form",
        component: PaymentMethodForm,
      },
      {
        name: "taxes_list",
        component: TaxManager,
      },
      {
        name: "tax_form",
        component: TaxForm,
      },
      {
        name: "sales_types_list",
        component: SalesTypeManager,
      },
      {
        name: "sales_type_form",
        component: SalesTypeForm,
      },
      {
        name: "receipts_list",
        component: ReceiptManager,
      },
      {
        name: "receipt_form",
        component: ReceiptForm,
      },
    ],
  },
  {
    name: "/accounts_receivable",
    layout: MainAdminLayout,
    onlyIf: { guard: isAuthenticated, redirect: "/login" },
    nestedRoutes: [
      {
        name: "payments_list",
        component: PaymentsManager,
      },
      {
        name: "payment_form",
        component: PaymentForm,
      },
      {
        name: "customer_balances_list",
        component: QuotationsManager,
      },
      {
        name: "customer_balance_form",
        component: QuotationForm,
      },
    ],
  },
];

export { protectedRoutes };
