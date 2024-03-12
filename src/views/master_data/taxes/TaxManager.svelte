<script>
  import { urls } from "../../../lib/utils/urls";
  import { navigateTo } from "svelte-router-spa";
  import { onMount } from "svelte";
  import { hasPermission } from "../../../lib/utils/functions";
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
    Dropdown,
    DropdownItem,
    Badge,
  } from "flowbite-svelte";
  import { DotsHorizontalOutline } from "flowbite-svelte-icons";

  export let currentRoute;

  let searchTerm = "";
  let taxObjects = {
    results: [],
  };
  let page = 1;

  function getTaxes(page) {
    const token = JSON.parse(localStorage.getItem("token"));
    fetch(
      urls.backendRoute +
        urls.taxesEndPoint +
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
          taxObjects = data;
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
    if (taxObjects.next) {
      page++;
      getTaxes(page);
    }
  }

  function previousPage() {
    if (taxObjects.previous) {
      page--;
      getTaxes(page);
    }
  }

  onMount(() => {
    getTaxes(1);
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
        getTaxes(1);
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
  {#if hasPermission("point_of_sales.add_paymentmethod")}
    <Button
      size="sm"
      color="blue"
      pill
      on:click={() => navigateTo("master_data/tax_form?type=new")}
      >Nuevo Impuesto</Button
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
    <TableHeadCell scope="col" class={"text-center"}>Nombre</TableHeadCell>
    <TableHeadCell scope="col" class={"text-center"}>Porcentaje</TableHeadCell>
    <TableHeadCell scope="col" class={"text-center"}>Estado</TableHeadCell>
    <TableHeadCell scope="col" class={"text-center"}>Acción</TableHeadCell>
  </TableHead>
  <TableBody tableBodyClass={"divide-y min-h-full"}>
    {#each taxObjects.results as tax, i}
      <TableBodyRow class="h-5">
        <TableBodyCell class={"w-[3%] p-2 text-center"}
          >{(i += 1)}</TableBodyCell
        >
        <TableBodyCell class="w-[25%] p-2"
          >{tax.name.toUpperCase()}</TableBodyCell
        >
        <TableBodyCell class="w-[25%] p-2 text-center"
          >{tax.percentage * 100}%</TableBodyCell
        >
        <TableBodyCell class={"w-[10%] p-2 text-center"}
          >{#if tax.status}
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
                  navigateTo(`master_data/tax_form?type=update&id=${tax.id}`)}
              >
                Editar</DropdownItem
              >
            </Dropdown>
          </div>
        </TableBodyCell>
      </TableBodyRow>
    {:else}
      <TableBodyRow>
        <TableBodyCell colspan="5" class={" text-center"}
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
