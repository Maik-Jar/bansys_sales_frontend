import { readable } from "svelte/store";
import { urls } from "../utils/urls";

export const documentsTypes = readable([], (set) => {
  fetch(urls.backendRoute + urls.documentsTypesEndPoint).then(async (res) => {
    const documentsTypes = await res.json();
    set(documentsTypes);
  });
});

export const providers = readable([], (set) => {
  const token = JSON.parse(localStorage.getItem("token"));
  fetch(urls.backendRoute + urls.providersEndPoint + `?not_paginated=true`, {
    headers: {
      Authorization: `Token ${token.token}`,
    },
  }).then(async (res) => {
    const providers = await res.json();
    set(providers);
  });
});

export const taxes = readable([], (set) => {
  fetch(urls.backendRoute + urls.taxes).then(async (res) => {
    const taxes = await res.json();
    set(taxes);
  });
});

export const receipt = readable([], (set) => {
  fetch(urls.backendRoute + urls.receipt).then(async (res) => {
    const receipt = await res.json();
    set(receipt);
  });
});

export const items = readable([], (set) => {
  fetch(urls.backendRoute + urls.itemsList).then(async (res) => {
    const items = await res.json();
    set(items);
  });
});

export const salesTypes = readable([], (set) => {
  fetch(urls.backendRoute + urls.salesTypesEndpoint).then(async (res) => {
    const salesTypes = await res.json();
    set(salesTypes);
  });
});

export const paymentMethods = readable([], (set) => {
  fetch(urls.backendRoute + urls.paymentsMethodsEndpoint).then(async (res) => {
    const paymentMethods = await res.json();
    set(paymentMethods);
  });
});
