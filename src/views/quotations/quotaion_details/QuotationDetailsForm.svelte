<script>
  import { isNumeric } from "../../../lib/utils/functions";
  import { items } from "../../../lib/stores/stores";
  import Swal from "sweetalert2";
  import { urls } from "../../../lib/utils/urls";
  import { onMount } from "svelte";
  import MultiSelect from "svelte-multiselect";
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Input,
    Button,
    ButtonGroup,
    InputAddon,
    Modal,
    Textarea,
  } from "flowbite-svelte";

  export let quotationsDetails = [];
  export let quotationActive = true;
  export let activeQuotationDetails = false;
  export let quotationsDetailsToDelete = [];
  export const addQuotationDetailsAtSelectedItem = (quotation_details) => {
    quotation_details.map((e) => {
      const addItem = $items.find((i) => i.id == e?.item.id);
      selectedItems = [
        ...selectedItems,
        {
          label: addItem.name + " / " + addItem.price,
          value: {
            id: addItem.id,
            name: addItem.name,
            price: addItem.price,
          },
        },
      ];
    });
  };

  let multiselectOptions;
  let selectedItems = [];
  let itemID;
  let counter = 0;
  let defaultModal = false;
  let quantityModal = false;
  let rowDetail;
  let descriptionModal = false;
  let priceModal = false;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  function getItems() {
    const token = JSON.parse(localStorage.getItem("token"));
    fetch(urls.backendRoute + urls.itemsList, {
      method: "get",
      headers: {
        Authorization: `Token ${token.token}`,
      },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          multiselectOptions = data.map((e) => {
            return {
              label: e.name + " / " + e.price,
              value: { id: e.id, name: e.name, price: e.price },
            };
          });
        } else {
          const data = await res.json();
          console.log(data);
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  function calculateAmount(quotationDetailID) {
    const quotationDetailObject = quotationsDetails.find(
      (e) => e.id === quotationDetailID
    );

    return quotationDetailObject.price * quotationDetailObject.quantity;
  }

  function generateRowId() {
    counter++;
    const id = "PID" + counter;
    return id;
  }

  function addRow(item) {
    if (Array.isArray(item)) {
      item.map((e) => {
        if (!quotationsDetails.find((i) => i.item.id == e.value.id)) {
          let invoiceDetail = {
            id: generateRowId(),
            item: { id: e.value.id, name: e.value.name },
            quantity: 1,
            price: e.value.price,
          };
          quotationsDetails = [...quotationsDetails, invoiceDetail];
        }
      });
    } else {
      if (validNotRepeatItem(item)) {
        const insertItem = $items.find((e) => e?.id == item);

        if (insertItem) {
          let invoiceDetail = {
            id: generateRowId(),
            item: { id: insertItem.id, name: insertItem.name },
            quantity: 1,
            price: insertItem.price,
          };
          quotationsDetails = [...quotationsDetails, invoiceDetail];
          const addItem = $items.find((e) => e.id == item);
          selectedItems = [
            ...selectedItems,
            {
              label: addItem.name + " / " + addItem.price,
              value: {
                id: addItem.id,
                name: addItem.name,
                price: addItem.price,
              },
            },
          ];
        } else {
          Swal.fire(`No se encontró item ${item}`, "", "error");
        }
      }
    }
  }

  function validNotRepeatItem(item_id) {
    const repeatItem = quotationsDetails.find((e) => {
      if (e.item.id == item_id) {
        return e;
      }
    });
    if (repeatItem) {
      Swal.fire("Este item ya ha sido digitado.", "", "info");
      return false;
    }
    return true;
  }

  function updateQuantity(e, rowId) {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    quotationsDetails = quotationsDetails.map((el, index) => {
      if (el.id === rowId) {
        el.quantity = Number(data.quantity) > 0 ? Number(data.quantity) : 1;
      }
      return el;
    });

    quantityModal = false;
  }

  function updateDescription(e, rowId) {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    quotationsDetails = quotationsDetails.map((el, index) => {
      if (el.id === rowId) {
        el.description = data.description;
      }
      return el;
    });

    descriptionModal = false;
  }

  function updatePrice(e, rowId) {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    quotationsDetails = quotationsDetails.map((el, index) => {
      if (el.id === rowId) {
        el.price = Number(data.price) > 0 ? Number(data.price) : el.price;
      }
      return el;
    });

    priceModal = false;
  }

  function deleteRow(rowId, all = false) {
    if (all) {
      quotationsDetails.filter((e) => {
        if (isNumeric(e.id)) {
          quotationsDetailsToDelete = [...quotationsDetailsToDelete, e];
        }
      });

      quotationsDetails = [];
    }

    if (typeof rowId === "object") {
      quotationsDetails = quotationsDetails.filter((e) => {
        if (e?.item.id !== rowId?.value.id) {
          return e;
        }
        if (isNumeric(e.id)) {
          quotationsDetailsToDelete = [...quotationsDetailsToDelete, e];
        }
      });
    } else {
      quotationsDetails = quotationsDetails.filter((e) => {
        if (e.id == rowId) {
          selectedItems = selectedItems.filter((i) => {
            if (i.value.id !== e.item.id) {
              return i;
            }
          });
        }

        if (e.id !== rowId) {
          return e;
        }

        if (isNumeric(e.id)) {
          quotationsDetailsToDelete = [...quotationsDetailsToDelete, e];
        }
      });
    }
  }

  function openQuantityModal(rowId) {
    rowDetail = quotationsDetails.find((e) => e.id === rowId);
    quantityModal = true;
  }

  function openDescriptionModal(rowId) {
    rowDetail = quotationsDetails.find((e) => e.id === rowId);
    descriptionModal = true;
  }

  function openPriceModal(rowId) {
    rowDetail = quotationsDetails.find((e) => e.id === rowId);
    priceModal = true;
  }

  function hasDescription(rowId) {
    let row = quotationsDetails.find((e) => e.id === rowId);
    if (row?.description?.length > 0) {
      return true;
    }

    return false;
  }

  onMount(() => {
    getItems();
  });
</script>

<form
  class="flex space-x-2 w-2/5 items-center my-5"
  on:submit|preventDefault|stopPropagation={() => {
    if (!itemID) {
      defaultModal = true;
    } else {
      addRow(itemID);
      itemID = null;
    }
  }}
>
  <div>
    <ButtonGroup class="w-full">
      <InputAddon>Items</InputAddon>
      <Input
        type="number"
        bind:value={itemID}
        class="dark:bg-gray-50 dark:text-black"
        disabled={!activeQuotationDetails || !quotationActive}
      />
    </ButtonGroup>
  </div>
  <Button
    color="blue"
    type="submit"
    disabled={!activeQuotationDetails || !quotationActive}>Agregar</Button
  >
</form>
<Table
  hoverable={true}
  shadow
  divClass={"relative h-[25rem] overflow-y-auto mb-5 bg-white"}
>
  <TableHead class={"sticky top-0 w-full"}>
    <TableHeadCell padding={"px-3 py-3"} class="text-center">#</TableHeadCell>
    <TableHeadCell padding={"px-3 py-3"} class="text-center">Item</TableHeadCell
    >
    <TableHeadCell padding={"px-3 py-3"} class="text-center"
      >Precio Und.</TableHeadCell
    >
    <TableHeadCell padding={"px-3 py-3"} class="text-center"
      >Cant.</TableHeadCell
    >
    <TableHeadCell padding={"px-3 py-3"} class="text-center"
      >Monto</TableHeadCell
    >
    <TableHeadCell padding={"px-3 py-3"} class="text-center"
      >Acción</TableHeadCell
    >
  </TableHead>
  <TableBody tableBodyClass="divide-y">
    {#each quotationsDetails as quotationDetail, i}
      <TableBodyRow>
        <TableBodyCell class="text-center py-1 px-3">{i + 1}</TableBodyCell>
        <TableBodyCell
          class="py-1 px-3 cursor-pointer {hasDescription(quotationDetail.id)
            ? 'text-green-400 dark:text-green-400'
            : 'text-white'}"
          on:click={() => openDescriptionModal(quotationDetail.id)}
          >{quotationDetail.item.name}</TableBodyCell
        >
        <TableBodyCell
          class="text-center py-1 px-3 cursor-pointer"
          on:click={() => openPriceModal(quotationDetail.id)}
          >{new Intl.NumberFormat("es-DO").format(
            quotationDetail.price
          )}</TableBodyCell
        >
        <TableBodyCell
          class="text-center py-1 px-3 cursor-pointer"
          on:click={() => openQuantityModal(quotationDetail.id)}
        >
          {quotationDetail.quantity}
        </TableBodyCell>
        <TableBodyCell class="text-center py-1 px-3">
          {new Intl.NumberFormat("es-DO").format(
            calculateAmount(quotationDetail.id)
          )}
        </TableBodyCell>
        <TableBodyCell class="text-center py-1 px-3">
          <Button
            class="m-0"
            size="xs"
            color="red"
            on:click={() => deleteRow(quotationDetail.id)}
            disabled={!quotationActive}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.2em"
              height="1.2em"
              viewBox="0 0 16 16"
              {...$$props}
              ><path
                fill="currentColor"
                d="M2 5v10c0 .55.45 1 1 1h9c.55 0 1-.45 1-1V5H2zm3 9H4V7h1v7zm2 0H6V7h1v7zm2 0H8V7h1v7zm2 0h-1V7h1v7zm2.25-12H10V.75A.753.753 0 0 0 9.25 0h-3.5A.753.753 0 0 0 5 .75V2H1.75a.752.752 0 0 0-.75.75V4h13V2.75a.752.752 0 0 0-.75-.75zM9 2H6v-.987h3V2z"
              /></svg
            >
          </Button>
        </TableBodyCell>
      </TableBodyRow>
    {:else}
      <TableBodyRow>
        <TableBodyCell colspan="6" class="text-center "
          >No hay items</TableBodyCell
        >
      </TableBodyRow>
    {/each}
  </TableBody>
</Table>

<Modal title="Busqueda avanzada de items" bind:open={defaultModal} autoclose>
  <div class="h-[25rem]">
    <MultiSelect
      outerDivClass=" h-20"
      liOptionClass="dark:text-black"
      ulSelectedClass=" h-20"
      bind:selected={selectedItems}
      options={multiselectOptions}
      on:add={() => addRow(selectedItems)}
      on:remove={(e) => deleteRow(e?.detail.option)}
      on:removeAll={(e) => deleteRow(undefined, true)}
    />
  </div>
  <svelte:fragment slot="footer">
    <Button color="red">Cerrar</Button>
  </svelte:fragment>
</Modal>

<Modal
  title="Cantidad del item: {rowDetail?.item.name}"
  bind:open={quantityModal}
  size="sm"
  autoclose={false}
>
  <form
    id="form_quantity"
    on:submit|preventDefault|stopPropagation={(e) =>
      updateQuantity(e, rowDetail.id)}
  >
    <Input
      type="number"
      name="quantity"
      class="m-0 {customColorsClassDark.input}"
      value={rowDetail.quantity}
      required
      disabled={!quotationActive}
    />
  </form>
  <svelte:fragment slot="footer">
    <Button type="submit" form="form_quantity" color="green">Aplicar</Button>
    <Button color="alternative" on:click={() => (quantityModal = false)}
      >Cerrar</Button
    >
  </svelte:fragment>
</Modal>

<Modal
  title="Descripción del item: {rowDetail?.item.name}"
  bind:open={descriptionModal}
  size="sm"
  autoclose={false}
>
  <form
    id="form_description"
    on:submit|preventDefault|stopPropagation={(e) =>
      updateDescription(e, rowDetail.id)}
  >
    <Textarea
      class={customColorsClassDark.input}
      name="description"
      rows="9"
      bind:value={rowDetail.description}
      disabled={!quotationActive}
    />
  </form>
  <svelte:fragment slot="footer">
    <Button type="submit" form="form_description" color="green">Aplicar</Button>
    <Button color="alternative" on:click={() => (descriptionModal = false)}
      >Cerrar</Button
    >
  </svelte:fragment>
</Modal>

<Modal
  title="Precio Und. del item: {rowDetail?.item.name}"
  bind:open={priceModal}
  size="sm"
  autoclose={false}
>
  <form
    id="form_price"
    on:submit|preventDefault|stopPropagation={(e) =>
      updatePrice(e, rowDetail.id)}
  >
    <ButtonGroup class="w-full">
      <InputAddon>DOP$</InputAddon>
      <Input
        type="number"
        step="any"
        name="price"
        class={customColorsClassDark.input}
        value={rowDetail.price}
        required
        disabled={!quotationActive}
      />
    </ButtonGroup>
  </form>
  <svelte:fragment slot="footer">
    <Button type="submit" form="form_price" color="green">Aplicar</Button>
    <Button color="alternative" on:click={() => (priceModal = false)}
      >Cerrar</Button
    >
  </svelte:fragment>
</Modal>
