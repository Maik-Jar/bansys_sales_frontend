<script>
  import { urls } from "../../../lib/utils/urls";
  import { navigateTo } from "svelte-router-spa";
  import { onMount } from "svelte";
  import { paymentMethods } from "../../../lib/stores/stores";
  import { hasPermission } from "../../../lib/utils/functions";
  import {
    Button,
    Badge,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    PaginationItem,
    Search,
    Dropdown,
    DropdownItem,
  } from "flowbite-svelte";
  import { DotsHorizontalOutline } from "flowbite-svelte-icons";

  export let currentRoute;

  let searchTerm = "";
  let paymentsObject = {
    results: [],
  };
  let page = 1;

  function getPayments(page) {
    const token = JSON.parse(localStorage.getItem("token"));
    fetch(
      urls.backendRoute +
        urls.paymentsEndPoint +
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
          paymentsObject = data;
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
    if (paymentsObject.next) {
      page++;
      getPayments(page);
    }
  }

  function previousPage() {
    if (paymentsObject.previous) {
      page--;
      getPayments(page);
    }
  }

  function printInvoicePayment(paymentID, status) {
    if (status) {
      window.open(
        urls.backendRoute +
          urls.printPaymentInvoice +
          `?payment_id=${paymentID}&papel_size="60mm"`,
        "_blank"
      );
    }
  }

  onMount(() => {
    getPayments(1);
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
        getPayments(1);
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
  {#if hasPermission("point_of_sales.add_payment")}
    <Button
      size="sm"
      color="blue"
      pill
      on:click={() => navigateTo("/accounts_receivable/payment_form?type=new")}
      >Nuevo pago</Button
    >
  {/if}
</div>
<Table
  shadow
  hoverable={true}
  divClass={"relative h-[18rem] xl:h-[22rem] 2xl:h-[40rem] overflow-y-auto mb-5 bg-white"}
>
  <TableHead class={"sticky top-0 w-full"}>
    <TableHeadCell scope="col" class={"text-center"}>#</TableHeadCell>
    <TableHeadCell scope="col" class={"text-center"}>Factura</TableHeadCell>
    <TableHeadCell scope="col" class={"text-center"}>Monto</TableHeadCell>
    <TableHeadCell scope="col" class={"text-center"}
      >Forma de pago</TableHeadCell
    >
    <TableHeadCell scope="col" class={"text-center"}>Aplicado por</TableHeadCell
    >
    <TableHeadCell scope="col" class={"text-center"}
      >Fecha de creación</TableHeadCell
    >
    <TableHeadCell scope="col" class={"text-center"}>status</TableHeadCell>
    <TableHeadCell scope="col" class={"text-center"}>Acción</TableHeadCell>
  </TableHead>
  <TableBody tableBodyClass={"divide-y min-h-full"}>
    {#each paymentsObject.results as payment, i}
      <TableBodyRow class="h-5">
        <TableBodyCell class={"w-[3%] p-2 text-center"}
          >{(i += 1)}</TableBodyCell
        >
        <TableBodyCell class="w-[15%] p-2 text-center"
          >{payment.invoice_number}</TableBodyCell
        >
        <TableBodyCell class={"w-[10%] p-2 text-center"}
          >{new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
          }).format(payment.amount)}</TableBodyCell
        >
        <TableBodyCell class={"w-[12%] p-2 text-center"}
          >{$paymentMethods.find((e) => e.id == payment?.payment_method)
            ?.name}</TableBodyCell
        >
        <TableBodyCell class={"w-[10%] p-2 text-center"}
          >{payment.user_created.first_name.toUpperCase()}
          {payment.user_created.last_name.toUpperCase()}</TableBodyCell
        >
        <TableBodyCell class={"w-[10%] p-2 text-center"}
          >{new Date(payment.date_created).toLocaleDateString(
            "es-DO"
          )}</TableBodyCell
        >
        <TableBodyCell class={"w-[10%] p-2 text-center"}>
          {#if payment.status}
            <Badge color="green">Activo</Badge>
          {:else}
            <Badge color="red">Inactivo</Badge>
          {/if}
        </TableBodyCell>
        <TableBodyCell class={"w-[10%] p-2 text-center"}>
          <div class="flex justify-center">
            <DotsHorizontalOutline />
            <Dropdown>
              <DropdownItem
                on:click={() =>
                  navigateTo(
                    `accounts_receivable/payment_form?type=update&id=${payment.id}`
                  )}
              >
                Editar</DropdownItem
              >

              <DropdownItem
                disabled={!payment.status}
                on:click={() => printInvoicePayment(payment.id, payment.status)}
                >Imprimir recibo</DropdownItem
              >
              <DropdownItem>Ver factura</DropdownItem>
            </Dropdown>
          </div>
        </TableBodyCell>
      </TableBodyRow>
    {:else}
      <TableBodyRow>
        <TableBodyCell colspan="9" class={" text-center"}
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
