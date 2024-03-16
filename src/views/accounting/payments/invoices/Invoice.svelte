<script>
  import { urls } from "../../../../lib/utils/urls";
  import { salesTypes } from "../../../../lib/stores/stores";
  import { onMount } from "svelte";
  import {
    Button,
    Modal,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    PaginationItem,
    Search,
  } from "flowbite-svelte";

  export let invoice;
  export let invoiceNumber;
  export let openInvoiceModal = false;

  let invoicesObjects = {
    results: [],
  };
  let page = 1;
  let searchTerm = "";

  function getInvoices(page) {
    const token = JSON.parse(localStorage.getItem("token"));
    fetch(
      urls.backendRoute +
        urls.invoices_listEndPoint +
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

  function addSelected(invoiceID, number) {
    invoice = invoiceID;
    invoiceNumber = number;
    openInvoiceModal = false;
  }

  onMount(() => {
    getInvoices(1);
  });
</script>

<Modal
  title="Facturas encontrados"
  bind:open={openInvoiceModal}
  size="xl"
  autoclose={false}
>
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
  <Table
    shadow
    hoverable={true}
    divClass={"relative h-[18rem] xl:h-[22rem] 2xl:h-[40rem] overflow-y-auto mb-5 bg-white"}
  >
    <TableHead class={"sticky top-0 w-full"}>
      <TableHeadCell scope="col" class={"text-center"}>#</TableHeadCell>
      <TableHeadCell scope="col" class={"text-center"}>Fact. No.</TableHeadCell>
      <TableHeadCell scope="col" class={"text-center"}>Cliente</TableHeadCell>
      <TableHeadCell scope="col" class={"text-center"}
        >Comprobante</TableHeadCell
      >
      <TableHeadCell scope="col" class={"text-center"}>Venta</TableHeadCell>
      <TableHeadCell scope="col" class={"text-center"}>Total</TableHeadCell>
      <TableHeadCell scope="col" class={"text-center"}>Fecha</TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass={"divide-y min-h-full"}>
      {#each invoicesObjects.results as invoice, i}
        <TableBodyRow
          class="h-5 cursor-pointer"
          on:click={() => addSelected(invoice.id, invoice.number)}
        >
          <TableBodyCell class={"w-[3%] p-2 text-center"}
            >{(i += 1)}</TableBodyCell
          >
          <TableBodyCell class="w-[10%] p-2 text-center"
            >{invoice.number}</TableBodyCell
          >

          <TableBodyCell class={"w-[20%] p-2 text-center"}
            >{invoice.customer.name}</TableBodyCell
          >
          <TableBodyCell class={"w-[10%] p-2 text-center"}
            >{invoice?.receipt_sequence
              ? invoice?.receipt_sequence?.receipt?.name
              : "N/A"}</TableBodyCell
          >
          <TableBodyCell class={"w-[10%] p-2 text-center"}
            >{$salesTypes.find((e) => e.id === invoice?.sales_type)
              ?.name}</TableBodyCell
          >
          <TableBodyCell class={"w-[12%] p-2 text-center"}
            >{new Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP",
            }).format(Number(invoice.total))}</TableBodyCell
          >
          <TableBodyCell class={"w-[12%] p-2 text-center"}
            >{new Date(invoice.date_created).toLocaleString(
              "es-DO"
            )}</TableBodyCell
          >
        </TableBodyRow>
      {:else}
        <TableBodyRow>
          <TableBodyCell colspan="7" class={" text-center"}
            >NO HAY DATOS</TableBodyCell
          >
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
  <svelte:fragment slot="footer">
    <div class="flex mt-4 space-x-3 justify-end">
      <PaginationItem on:click={previousPage}>Previous</PaginationItem>
      <PaginationItem on:click={nextPage}>Next</PaginationItem>
    </div>
  </svelte:fragment>
</Modal>
