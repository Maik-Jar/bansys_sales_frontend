<script>
  import { urls } from "../../lib/utils/urls";
  import { navigateTo } from "svelte-router-spa";
  import { onMount } from "svelte";
  import { receipt } from "../../lib/stores/stores";
  import { hasPermission } from "../../lib/utils/functions";
  import {
    Button,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    PaginationItem,
    Search,
    A,
    Badge,
  } from "flowbite-svelte";

  export let currentRoute;

  let searchTerm = "";
  let invoicesObjects = {
    results: [],
  };
  let page = 1;

  function getInvoices(page) {
    const token = JSON.parse(localStorage.getItem("token"));
    fetch(
      urls.backendRoute +
        urls.invoicesEndPoint +
        `?search=${searchTerm}&page=${page}`,
      {
        method: "get",
        headers: {
          Authorization: `Token ${token.token}`,
        },
      }
    )
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          invoicesObjects = data;
        } else {
          const data = await res.json();
          console.log(data);
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  function nextPage() {
    if (invoicesObjects.next) {
      page++;
      getInvoices(page);
    }
  }

  function previousPage() {
    if (invoicesObjects.previous) {
      page--;
      getInvoices(page);
    }
  }

  function calculateDiscount(price, quantity, discount) {
    let amountForDiscount = 0;
    if (discount < 0) {
      return amountForDiscount;
    }
    // prettier-ignore
    if (!Number.isInteger(discount) && (discount > 0 && discount < 1)) {
      // prettier-ignore
      amountForDiscount = ((price * quantity) * discount)
    } else {
      // prettier-ignore
      amountForDiscount = discount
    }

    return amountForDiscount;
  }

  function calculateTax(invoiceDetail, invoiceDetailID) {
    const invoiceDetailObject = invoiceDetail.find(
      (e) => e.id === invoiceDetailID
    );
    // prettier-ignore
    return ((invoiceDetailObject.price * invoiceDetailObject.quantity)-calculateDiscount(invoiceDetailObject.price,invoiceDetailObject.quantity,invoiceDetailObject.discount)) * invoiceDetailObject.tax;
  }

  function calculateAmount(invoiceDetail, invoiceDetailID) {
    const invoiceDetailObject = invoiceDetail.find(
      (e) => e.id === invoiceDetailID
    );

    return (
      calculateTax(invoiceDetail, invoiceDetailID) +
      (invoiceDetailObject.price * invoiceDetailObject.quantity -
        calculateDiscount(
          invoiceDetailObject.price,
          invoiceDetailObject.quantity,
          invoiceDetailObject.discount
        ))
    );
  }

  function calculateTotalAmount(invoiceDetails) {
    let sumAmounts = 0;
    invoiceDetails.map((e) => {
      sumAmounts += calculateAmount(invoiceDetails, e.id);
    });
    return sumAmounts;
  }

  onMount(() => {
    getInvoices(1);
  });
</script>

<div class="flex pl-0 p-4 space-x-3 items-center justify-between">
  <form
    class="flex gap-2 w-2/5 items-center"
    on:submit|preventDefault|stopPropagation
  >
    <Search
      size="md"
      bind:value={searchTerm}
      class="dark:bg-gray-50 dark:text-black"
    />
    <Button
      class="!p-2.5"
      on:click={() => {
        page = 1;
        getInvoices(1);
      }}
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        /></svg
      >
    </Button>
  </form>
  {#if hasPermission("point_of_sales.add_invoiceheader")}
    <Button
      size="sm"
      color="blue"
      pill
      on:click={() => navigateTo("/invoice_form")}>Nueva factura</Button
    >
  {/if}
</div>
<Table
  shadow
  hoverable={true}
  divClass={"relative h-[18rem] xl:h-[22rem] 2xl:h-[40rem] overflow-y-auto mb-5"}
>
  <TableHead class={"sticky top-0 w-full"}>
    <TableHeadCell scope="col" class={"text-center"}>#</TableHeadCell>
    <TableHeadCell scope="col" class={"text-center"}>Fact. No.</TableHeadCell>
    <TableHeadCell scope="col" class={"text-center"}>Cliente</TableHeadCell>
    <TableHeadCell scope="col" class={"text-center"}>Comprobante</TableHeadCell>
    <TableHeadCell scope="col" class={"text-center"}>Total</TableHeadCell>
    <TableHeadCell scope="col" class={"text-center"}>Fecha</TableHeadCell>
    <TableHeadCell scope="col" class={"text-center"}>Estado</TableHeadCell>
    <TableHeadCell scope="col" class={"text-center"}>Acción</TableHeadCell>
  </TableHead>
  <TableBody tableBodyClass={"divide-y min-h-full"}>
    {#each invoicesObjects.results as invoice, i}
      <TableBodyRow class="h-5">
        <TableBodyCell class={"w-[3%] p-2 text-center"}
          >{(i += 1)}</TableBodyCell
        >
        <TableBodyCell class="w-[10%] p-2">{invoice.number}</TableBodyCell>

        <TableBodyCell class={"w-[20%] p-2 text-center"}
          >{invoice.customer.name}</TableBodyCell
        >
        <TableBodyCell class={"w-[10%] p-2 text-center"}
          >{invoice?.receipt_sequence
            ? $receipt.find((e) => e.id === invoice?.receipt_sequence?.receipt)
                ?.name
            : "N/A"}</TableBodyCell
        >
        <TableBodyCell class={"w-[12%] p-2 text-center"}
          >{new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
          }).format(
            calculateTotalAmount(invoice.invoice_detail)
          )}</TableBodyCell
        >
        <TableBodyCell class={"w-[12%] p-2 text-center"}
          >{new Date(invoice.date_created).toLocaleString(
            "es-DO"
          )}</TableBodyCell
        >
        <TableBodyCell class={"w-[10%] p-2 text-center"}
          ><Badge rounded color={invoice.status ? "green" : "red"}
            >{invoice.status ? "Activo" : "Inactivo"}</Badge
          ></TableBodyCell
        >
        <TableBodyCell class={"w-[10%] p-2 text-center"}>
          <A
            class="!text-amber-500 hover:!text-amber-600"
            on:click={() => navigateTo("/invoice_form/" + invoice.id)}>Editar</A
          >
        </TableBodyCell>
      </TableBodyRow>
    {:else}
      <TableBodyRow>
        <TableBodyCell colspan="8" class={" text-center"}
          >NO HAY DATOS</TableBodyCell
        >
      </TableBodyRow>
    {/each}
  </TableBody>
</Table>
<div class="flex mt-4 space-x-3 justify-end">
  <PaginationItem on:click={previousPage}>Previous</PaginationItem>
  <PaginationItem on:click={nextPage}>Next</PaginationItem>
</div>
