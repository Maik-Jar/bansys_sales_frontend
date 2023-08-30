const backendRoute = {
  backendRoute: import.meta.env.VITE_BACKEND_SERVER_ROUTE,
};

const pointSales = {
  login: "point_of_sales/api/login",
  customersEndPoint: "point_of_sales/api/customers",
  providersEndPoint: "point_of_sales/api/providers",
  itemsEndPoint: "point_of_sales/api/items",
  invoicesEndPoint: "point_of_sales/api/invoices",
  documentsTypesEndPoint: "point_of_sales/api/documents_types",
  taxes: "point_of_sales/api/taxes",
  receipt: "point_of_sales/api/receipts",
  itemsList: "point_of_sales/api/items_list",
  salesTypesEndpoint: "point_of_sales/api/sales_types",
  paymentsMethodsEndpoint: "point_of_sales/api/payments_methods",
};

export const urls = {
  ...backendRoute,
  ...pointSales,
};
