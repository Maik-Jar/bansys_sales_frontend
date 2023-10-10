<script>
  import { isNumeric } from "../../../lib/utils/functions";
  import { onMount } from "svelte";
  import { urls } from "../../../lib/utils/urls";
  import { taxes, items } from "../../../lib/stores/stores";
  import Swal from "sweetalert2";
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
  } from "flowbite-svelte";

  export let invoiceDetails = [];
  export let invoiceActive = true;
  export let activeInvoiceDetails = false;
  export let invoiceDetailsToDelete = [];
  export let invoiceHeaderDiscont = 0.0;
  export let totalAmount = 0;
  export let calculateChange;
  export const addInvoiceDetailsAtSelectedItem = (invoice_details) => {
    invoice_details.map((e) => {
      const addItem = $items.find((i) => i.id == e?.item.id);
      selectedItems = [
        ...selectedItems,
        {
          label: addItem.name + " / " + addItem.price,
          value: {
            id: addItem.id,
            name: addItem.name,
            price: addItem.price,
            tax: addItem.tax,
          },
        },
      ];
    });
  };
  let multiselectOptions;
  //   let multiselectOptions = $items.map((e) => {
  //     return {
  //       label: e.name + " / " + e.price,
  //       value: { id: e.id, name: e.name, price: e.price, tax: e.tax },
  //     };
  //   });
  let selectedItems = [];
  let itemID;
  let counter = 0;
  let defaultModal = false;
  let quantityModal = false;
  let discountModal = false;
  let totalQuantity = 0;
  let totalTax = 0;
  let totalDiscount = 0;
  let rowDetail;
  let tempQuantity;
  let tempDiscount;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  $: if (invoiceDetails) {
    calculateTotalTax();
    calculateTotalQuantity();
    calculateTotalAmount();
    calulateTotalDiscount();
    calculateChange();
  }

  function getItems(page) {
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
              value: { id: e.id, name: e.name, price: e.price, tax: e.tax },
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

  function calculateDiscount(price, quantity, discount) {
    let amountForDiscount = 0;
    if (discount < 0 || discount == 0) {
      return amountForDiscount;
    }
    // prettier-ignore
    if (!Number.isInteger(discount) && (discount > 0 && discount < 1)) {
      // prettier-ignore
      amountForDiscount = ((price * quantity) * discount)
    } else {
      // prettier-ignore
      amountForDiscount = parseFloat(discount)
    }

    return amountForDiscount;
  }

  function calculateTax(invoiceDetailID) {
    const invoiceDetailObject = invoiceDetails.find(
      (e) => e.id === invoiceDetailID
    );
    // prettier-ignore
    return ((invoiceDetailObject.price * invoiceDetailObject.quantity)-calculateDiscount(invoiceDetailObject.price,invoiceDetailObject.quantity,invoiceDetailObject.discount)) * invoiceDetailObject.tax;
  }

  function calculateAmount(invoiceDetailID) {
    const invoiceDetailObject = invoiceDetails.find(
      (e) => e.id === invoiceDetailID
    );

    return (
      calculateTax(invoiceDetailID) +
      (invoiceDetailObject.price * invoiceDetailObject.quantity -
        calculateDiscount(
          invoiceDetailObject.price,
          invoiceDetailObject.quantity,
          invoiceDetailObject.discount
        ))
    );
  }

  function calculateTotalQuantity() {
    let sumQuantity = 0;
    invoiceDetails.map((e) => {
      sumQuantity += e.quantity;
    });
    totalQuantity = sumQuantity;
  }

  function calculateTotalTax() {
    let sumTaxes = 0;
    invoiceDetails.map((e) => {
      sumTaxes += calculateTax(e.id);
    });
    totalTax = sumTaxes;
  }

  function calculateTotalAmount() {
    let sumAmounts = 0;
    invoiceDetails.map((e) => {
      sumAmounts += calculateAmount(e.id);
    });
    totalAmount = sumAmounts;
  }

  function calulateTotalDiscount() {
    let sumDiscounts = 0;
    invoiceDetails.map((e) => {
      sumDiscounts += calculateDiscount(e.price, e.quantity, e.discount);
    });
    totalDiscount = sumDiscounts;
  }

  function generateRowId() {
    counter++;
    const id = "PID" + counter;
    return id;
  }

  function addRow(item) {
    if (Array.isArray(item)) {
      item.map((e) => {
        if (!invoiceDetails.find((i) => i.item.id == e.value.id)) {
          let invoiceDetail = {
            id: generateRowId(),
            item: { id: e.value.id, name: e.value.name },
            quantity: 1,
            price: e.value.price,
            tax: $taxes.find((i) => i.id == e.value.tax)?.percentage / 100,
            discount:
              invoiceHeaderDiscont > 0 && invoiceHeaderDiscont < 1
                ? invoiceHeaderDiscont
                : 0,
          };
          invoiceDetails = [...invoiceDetails, invoiceDetail];
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
            tax: $taxes.find((e) => insertItem.tax)?.percentage / 100,
            discount:
              invoiceHeaderDiscont > 0 && invoiceHeaderDiscont < 1
                ? invoiceHeaderDiscont
                : 0,
          };
          invoiceDetails = [...invoiceDetails, invoiceDetail];
          const addItem = $items.find((e) => e.id == item);
          selectedItems = [
            ...selectedItems,
            {
              label: addItem.name + " / " + addItem.price,
              value: {
                id: addItem.id,
                name: addItem.name,
                price: addItem.price,
                tax: addItem.tax,
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
    const repeatItem = invoiceDetails.find((e) => {
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

  function updateQuantity(rowId, value) {
    invoiceDetails = invoiceDetails.map((e, index) => {
      if (e.id === rowId) {
        e.quantity = value ? Number(value) : 1;
      }
      return e;
    });
  }

  function updateDiscount(rowId, value) {
    if (!value) {
      return;
    }
    invoiceDetails = invoiceDetails.map((e) => {
      if (e.id === rowId) {
        e.discount = Number.parseFloat(value);
      }
      return e;
    });
    invoiceHeaderDiscont = 0;
  }

  function deleteRow(rowId, all = false) {
    if (all) {
      invoiceHeaderDiscont = 0;
      invoiceDetails.filter((e) => {
        if (isNumeric(e.id)) {
          invoiceDetailsToDelete = [...invoiceDetailsToDelete, e];
        }
      });

      invoiceDetails = [];
    }

    if (typeof rowId === "object") {
      invoiceDetails = invoiceDetails.filter((e) => {
        if (e?.item.id !== rowId?.value.id) {
          return e;
        }

        if (isNumeric(e.id)) {
          invoiceDetailsToDelete = [...invoiceDetailsToDelete, e];
        }
      });
    } else {
      invoiceDetails = invoiceDetails.filter((e) => {
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
          invoiceDetailsToDelete = [...invoiceDetailsToDelete, e];
        }
      });
    }
    // prettier-ignore
    if (!(invoiceHeaderDiscont > 0 && invoiceHeaderDiscont < 1)){
        invoiceDetails.map(e => {
            e.discount = invoiceHeaderDiscont/invoiceDetails.length
        })
    }
  }

  function openQuantityModal(rowId) {
    rowDetail = invoiceDetails.find((e) => e.id === rowId);
    quantityModal = true;
  }

  function openDiscountModal(rowId) {
    rowDetail = invoiceDetails.find((e) => e.id === rowId);
    discountModal = true;
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
        disabled={!activeInvoiceDetails || !invoiceActive}
      />
    </ButtonGroup>
  </div>
  <Button
    color="blue"
    type="submit"
    disabled={!activeInvoiceDetails || !invoiceActive}>Agregar</Button
  >
</form>
<!-- <div
  class="h-[25rem] relative overflow-y-auto shadow-xl bg-white rounded-xl border-2 border-gray-300 mb-5"
> -->
<Table
  hoverable={true}
  shadow
  divClass={"relative h-[25rem] overflow-y-auto mb-5"}
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
    <TableHeadCell padding={"px-3 py-3"} class="text-center">Imp.</TableHeadCell
    >
    <TableHeadCell padding={"px-3 py-3"} class="text-center"
      >Descto.</TableHeadCell
    >
    <TableHeadCell padding={"px-3 py-3"} class="text-center"
      >Monto</TableHeadCell
    >
    <TableHeadCell padding={"px-3 py-3"} class="text-center"
      >Acción</TableHeadCell
    >
  </TableHead>
  <TableBody tableBodyClass="divide-y">
    {#each invoiceDetails as invoiceDetail, i}
      <TableBodyRow class="h-5">
        <TableBodyCell class="text-center py-1 px-3">{i + 1}</TableBodyCell>
        <TableBodyCell class="py-1 px-3"
          >{invoiceDetail.item.name}</TableBodyCell
        >
        <TableBodyCell class="text-center py-1 px-3"
          >{new Intl.NumberFormat("es-DO").format(
            invoiceDetail.price
          )}</TableBodyCell
        >
        <TableBodyCell
          class="text-center py-1 px-3 cursor-pointer"
          on:click={() => openQuantityModal(invoiceDetail.id)}
        >
          {invoiceDetail.quantity}
          <!-- <Input
              size="sm"
              type="number"
              class="m-0 {customColorsClassDark.input}"
              value={invoiceDetail.quantity}
              on:input={(e) => updateQuantity(invoiceDetail.id, e.target)}
              required
              disabled={!invoiceActive}
            /> -->
        </TableBodyCell>
        <TableBodyCell class="text-center py-1 px-3">
          {new Intl.NumberFormat("es-DO").format(
            calculateTax(invoiceDetail.id)
          )}</TableBodyCell
        >
        <TableBodyCell
          class="text-center py-1 px-3 cursor-pointer"
          on:click={() => openDiscountModal(invoiceDetail.id)}
        >
          {new Intl.NumberFormat("es-DO").format(invoiceDetail.discount)}
          <!-- <Input
              size="sm"
              type="number"
              step="any"
              class="m-0 {customColorsClassDark.input}"
              value={invoiceDetail.discount}
              on:blur={(e) => updateDiscount(invoiceDetail.id, e.target)}
              required
              disabled={!invoiceActive}
            /> -->
        </TableBodyCell>
        <TableBodyCell class="text-center py-1 px-3">
          {new Intl.NumberFormat("es-DO").format(
            calculateAmount(invoiceDetail.id)
          )}
        </TableBodyCell>
        <TableBodyCell class="text-center py-1 px-3">
          <Button
            class="m-0"
            size="xs"
            color="red"
            on:click={() => deleteRow(invoiceDetail.id)}
            disabled={!invoiceActive}
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
        <TableBodyCell colspan="8" class="text-center"
          >No hay items</TableBodyCell
        >
      </TableBodyRow>
    {/each}
  </TableBody>
  <tfoot class="sticky bottom-0">
    <tr class="font-semibold text-gray-900 dark:text-white dark:bg-gray-700">
      <th colspan="2" scope="row" class="py-3 px-6 text-left">Total</th>
      <th />
      <td class="py-3 px-6 text-center">{totalQuantity}</td>
      <td class="py-3 px-6 text-center"
        >{new Intl.NumberFormat("es-DO", {
          style: "currency",
          currency: "DOP",
        }).format(totalTax)}</td
      >
      <td class="py-1 px-6 text-center flex-1">
        {new Intl.NumberFormat("es-DO", {
          style: "currency",
          currency: "DOP",
        }).format(totalDiscount)}
      </td>
      <td class="py-3 px-6 text-center"
        >{new Intl.NumberFormat("es-DO", {
          style: "currency",
          currency: "DOP",
        }).format(totalAmount)}</td
      >
      <td class="py-3 px-6" />
    </tr>
  </tfoot>
</Table>

<!-- </div> -->

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
>
  <form
    id="form_quantity"
    on:submit|preventDefault|stopPropagation={() =>
      updateQuantity(rowDetail.id, tempQuantity?.value)}
  >
    <Input
      type="number"
      class="m-0 {customColorsClassDark.input}"
      value={rowDetail.quantity}
      on:input={(e) => (tempQuantity = e.target)}
      required
      disabled={!invoiceActive}
    />
  </form>
  <svelte:fragment slot="footer">
    <Button
      type="submit"
      form="form_quantity"
      color="green"
      on:click={() => (quantityModal = false)}>Aplicar</Button
    >
    <Button color="red" on:click={() => (quantityModal = false)}>Cerrar</Button>
  </svelte:fragment>
</Modal>

<Modal
  title="Descuento al item: {rowDetail?.item.name}"
  bind:open={discountModal}
  size="sm"
>
  <form
    id="form_discount"
    on:submit|preventDefault|stopPropagation={() =>
      updateDiscount(rowDetail.id, tempDiscount?.value)}
  >
    <Input
      type="number"
      step="0.01"
      class="m-0 {customColorsClassDark.input}"
      value={rowDetail.discount}
      on:input={(e) => (tempDiscount = e.target)}
      required
      disabled={!invoiceActive}
    />
  </form>
  <svelte:fragment slot="footer">
    <Button
      type="submit"
      form="form_discount"
      color="green"
      on:click={() => (discountModal = false)}>Aplicar</Button
    >
    <Button color="red" on:click={() => (discountModal = false)}>Cerrar</Button>
  </svelte:fragment>
</Modal>
