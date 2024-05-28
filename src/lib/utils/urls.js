const backendRoute = {
  backendRoute: import.meta.env.VITE_BACKEND_SERVER_ROUTE,
};

const accounting = {
  paymentsEndPoint: "accounting/api/payments",
  printPaymentInvoice: "accounting/api/print/payment_invoice_a4",
};

const customers = {
  customersEndPoint: "customers/api/customers",
};

const inventory = {
  inputsEndPoint: "inventory/api/inputs",
  outputsEndPoint: "inventory/api/outputs",
};

const master_data = {
  documentsTypesEndPoint: "master_data/api/documents_types",
  taxesEndPoint: "master_data/api/taxes",
  receiptEndPoint: "master_data/api/receipts",
  salesTypesEndpoint: "master_data/api/sales_types",
  paymentsMethodsEndpoint: "master_data/api/payments_methods",
  documentsTypesListEndPoint: "master_data/api/documents_types_list",
  taxesListEndPoint: "master_data/api/taxes_list",
  receiptListEndPoint: "master_data/api/receipts_list",
  salesTypesListEndpoint: "master_data/api/sales_types_list",
  paymentsMethodsListEndpoint: "master_data/api/payments_methods_list",
  companyListEndpoint: "master_data/api/company_list",
};

const products_and_services = {
  itemsEndPoint: "products_and_services/api/items",
  itemsListEndPoint: "products_and_services/api/items_list",
};

const purchases_and_providers = {
  providersEndPoint: "purchases_and_providers/api/providers",
  providersListEndPoint: "purchases_and_providers/api/providers_list",
};

const pointSales = {
  login: "point_of_sales/api/login",
  invoicesEndPoint: "point_of_sales/api/invoices",
  invoices_listEndPoint: "point_of_sales/api/invoices_list",
  quotationsEndPoint: "point_of_sales/api/quotations",
  printInvoiceEndpoint: "point_of_sales/api/invoice_print_data",
  printInvoice60mmEndpoint: "point_of_sales/api/print/print_invoice_60mm",
  printQuotationEndpoint: "point_of_sales/api/quotation_print_data",
  printQuotation60mmEndpoint: "point_of_sales/api/print/print_quotation_60mm",
  printSalesReportEndPoint: "point_of_sales/api/print/sales_report",
};

export const urls = {
  ...backendRoute,
  ...pointSales,
  ...customers,
  ...master_data,
  ...inventory,
  ...purchases_and_providers,
  ...products_and_services,
  ...accounting,
};
