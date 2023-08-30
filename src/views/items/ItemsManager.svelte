<script>
  import { urls } from "../../lib/utils/urls";
  import { navigateTo } from "svelte-router-spa";
  import { onMount } from "svelte";
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
  } from "flowbite-svelte";

  export let currentRoute;

  let searchTerm = "";
  let itemsObject = {
    results: [],
  };
  let page = 1;

  function getItems(page) {
    const token = JSON.parse(localStorage.getItem("token"));
    fetch(
      urls.backendRoute +
        urls.itemsEndPoint +
        `?search=${searchTerm}&page=${page}`,
      {
        method: "get",
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    )
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          itemsObject = data;
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
    if (itemsObject.next) {
      page++;
      getItems(page);
    }
  }

  function previousPage() {
    if (itemsObject.previous) {
      page--;
      getItems(page);
    }
  }

  onMount(() => {
    getItems(1);
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
        getItems(1);
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
  <Button size="sm" color="blue" pill on:click={() => navigateTo("/item_form")}
    >Nuevo item</Button
  >
</div>
<div class="h-[35rem]">
  <Table shadow hoverable={true}>
    <TableHead>
      <TableHeadCell scope="col" class={"text-center"}>#</TableHeadCell>
      <TableHeadCell scope="col" class={"text-center"}>Nombre</TableHeadCell>
      <TableHeadCell scope="col" class={"text-center"}>Marca</TableHeadCell>
      <TableHeadCell scope="col" class={"text-center"}>Precio</TableHeadCell>
      <TableHeadCell scope="col" class={"text-center"}>Stock</TableHeadCell>
      <TableHeadCell scope="col" class={"text-center"}>Acción</TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass={"divide-y min-h-full"}>
      {#each itemsObject.results as item, i}
        <TableBodyRow class="h-5">
          <TableBodyCell class={"w-[3%] p-2 text-center"}
            >{(i += 1)}</TableBodyCell
          >
          <TableBodyCell class="w-[25%] p-2"
            >{item.name.toUpperCase()}</TableBodyCell
          >

          <TableBodyCell class={"w-[10%] p-2 text-center"}
            >{item.brand ? item.brand.toUpperCase() : "---"}</TableBodyCell
          >
          <TableBodyCell class={"w-[10%] p-2 text-center"}
            >{item.price}</TableBodyCell
          >
          <TableBodyCell class={"w-[12%] p-2 text-center"}
            >{item.stock}</TableBodyCell
          >
          <TableBodyCell class={"w-[10%] p-2 text-center"}>
            <A
              class="!text-amber-500 hover:!text-amber-600"
              on:click={() => navigateTo("/item_form/" + item.id)}>Editar</A
            >
          </TableBodyCell>
        </TableBodyRow>
      {:else}
        <TableBodyRow>
          <TableBodyCell colspan="6" class={" text-center"}
            >NO HAY DATOS</TableBodyCell
          >
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
</div>
<div class="flex mt-4 space-x-3 justify-end">
  <PaginationItem on:click={previousPage}>Previous</PaginationItem>
  <PaginationItem on:click={nextPage}>Next</PaginationItem>
</div>
