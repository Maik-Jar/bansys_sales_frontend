import { writable } from "svelte/store";
import { urls } from "../utils/urls";

export const documentsTypes = writable([], (set) => {
  fetch(urls.backendRoute + urls.documentsTypesListEndPoint).then(
    async (res) => {
      const documentsTypes = await res.json();
      set(documentsTypes);
    }
  );
});

export const providers = writable([], (set) => {
  fetch(urls.backendRoute + urls.providersListEndPoint).then(async (res) => {
    const providers = await res.json();
    set(providers);
  });
});

export const taxes = writable([], (set) => {
  fetch(urls.backendRoute + urls.taxesListEndPoint).then(async (res) => {
    const taxes = await res.json();
    set(taxes);
  });
});

export const receipts = writable([], (set) => {
  fetch(urls.backendRoute + urls.receiptListEndPoint).then(async (res) => {
    const receipt = await res.json();
    set(receipt);
  });
});

export const items = writable([], (set) => {
  fetch(urls.backendRoute + urls.itemsListEndPoint).then(async (res) => {
    const items = await res.json();
    set(items);
  });
});

export const salesTypes = writable([], (set) => {
  fetch(urls.backendRoute + urls.salesTypesListEndpoint).then(async (res) => {
    const salesTypes = await res.json();
    set(salesTypes);
  });
});

export const paymentMethods = writable([], (set) => {
  fetch(urls.backendRoute + urls.paymentsMethodsListEndpoint).then(
    async (res) => {
      const paymentMethods = await res.json();
      set(paymentMethods);
    }
  );
});
