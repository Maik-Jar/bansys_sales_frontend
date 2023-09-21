<script>
  import { isNumeric } from "../../../lib/utils/functions";
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
    Spinner,
  } from "flowbite-svelte";

  export let quotationDetails = [];
  export let quotationActive = true;
  export let activeQuotationDetails = false;
  export let quotationDetailsToDelete = [];
  export let quotationHeaderDiscont = 0.0;
  export let totalAmount = 0;
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
            tax: addItem.tax,
          },
        },
      ];
    });
  };

  let multiselectOptions = $items.map((e) => {
    return {
      label: e.name + " / " + e.price,
      value: { id: e.id, name: e.name, price: e.price, tax: e.tax },
    };
  });
  let selectedItems = [];
  let itemID;
  let counter = 0;
  let defaultModal = false;
  let totalQuantity = 0;
  let totalTax = 0;
  let totalDiscount = 0.0;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  $: if (quotationDetails) {
    calculateTotalTax();
    calculateTotalQuantity();
    calculateTotalAmount();
    calulateTotalDiscount();
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

  function calculateTax(quotationDetailID) {
    const quotationDetailObject = quotationDetails.find(
      (e) => e.id === quotationDetailID
    );
    // prettier-ignore
    return ((quotationDetailObject.price * quotationDetailObject.quantity)-calculateDiscount(quotationDetailObject.price,quotationDetailObject.quantity,quotationDetailObject.discount)) * quotationDetailObject.tax;
  }

  function calculateAmount(quotationDetailID) {
    const quotationDetailObject = quotationDetails.find(
      (e) => e.id === quotationDetailID
    );

    return (
      calculateTax(quotationDetailID) +
      (quotationDetailObject.price * quotationDetailObject.quantity -
        calculateDiscount(
          quotationDetailObject.price,
          quotationDetailObject.quantity,
          quotationDetailObject.discount
        ))
    );
  }

  function calculateTotalQuantity() {
    let sumQuantity = 0;
    quotationDetails.map((e) => {
      sumQuantity += e.quantity;
    });
    totalQuantity = sumQuantity;
  }

  function calculateTotalTax() {
    let sumTaxes = 0;
    quotationDetails.map((e) => {
      sumTaxes += calculateTax(e.id);
    });
    totalTax = sumTaxes;
  }

  function calculateTotalAmount() {
    let sumAmounts = 0;
    quotationDetails.map((e) => {
      sumAmounts += calculateAmount(e.id);
    });
    totalAmount = sumAmounts;
  }

  function calulateTotalDiscount() {
    let sumDiscounts = 0;
    quotationDetails.map((e) => {
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
        if (!quotationDetails.find((i) => i.item.id == e.value.id)) {
          let invoiceDetail = {
            id: generateRowId(),
            item: { id: e.value.id, name: e.value.name },
            quantity: 1,
            price: e.value.price,
            tax: $taxes.find((i) => i.id == e.value.tax)?.percentage / 100,
            discount:
              quotationHeaderDiscont > 0 && quotationHeaderDiscont < 1
                ? quotationHeaderDiscont
                : 0,
          };
          quotationDetails = [...quotationDetails, invoiceDetail];
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
              quotationHeaderDiscont > 0 && quotationHeaderDiscont < 1
                ? quotationHeaderDiscont
                : 0,
          };
          quotationDetails = [...quotationDetails, invoiceDetail];
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
    const repeatItem = quotationDetails.find((e) => {
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
    quotationDetails = quotationDetails.map((e, index) => {
      if (e.id === rowId) {
        e.quantity = Number(value.value);
      }
      return e;
    });
  }

  function updateDiscount(rowId, value) {
    if (!value.value) {
      return;
    }
    quotationDetails = quotationDetails.map((e) => {
      if (e.id === rowId) {
        e.discount = Number.parseFloat(value.value);
      }
      return e;
    });
    quotationHeaderDiscont = 0;
  }

  function deleteRow(rowId, all = false) {
    if (all) {
      quotationHeaderDiscont = 0;
      quotationDetails.filter((e) => {
        if (isNumeric(e.id)) {
          quotationDetailsToDelete = [...quotationDetailsToDelete, e];
        }
      });

      quotationDetails = [];
    }

    if (typeof rowId === "object") {
      quotationDetails = quotationDetails.filter((e) => {
        if (isNumeric(e.id)) {
          quotationDetailsToDelete = [...quotationDetailsToDelete, e];
        }

        if (e?.item.id !== rowId?.value.id) {
          return e;
        }
      });
    } else {
      quotationDetails = quotationDetails.filter((e) => {
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
          quotationDetailsToDelete = [...quotationDetailsToDelete, e];
        }
      });
    }
    // prettier-ignore
    if (!(quotationHeaderDiscont > 0 && quotationHeaderDiscont < 1)){
        quotationDetails.map(e => {
            e.discount = quotationHeaderDiscont/quotationDetails.length
        })
    }
  }
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
<div
  class="h-[25rem] relative overflow-y-auto shadow-xl bg-white rounded-xl border-2 border-gray-300 mb-5"
>
  <Table hoverable={true} shadow>
    <TableHead>
      <TableHeadCell scope="col" class="text-center w-[3%]">#</TableHeadCell>
      <TableHeadCell scope="col" class="text-center w-[25%]">Item</TableHeadCell
      >
      <TableHeadCell scope="col" class="text-center w-[10%]"
        >Precio Und.</TableHeadCell
      >
      <TableHeadCell scope="col" class="text-center w-[11%]"
        >Cant.</TableHeadCell
      >
      <TableHeadCell scope="col" class="text-center w-[10%]">Imp.</TableHeadCell
      >
      <TableHeadCell scope="col" class="text-center w-[15%]"
        >Descto.</TableHeadCell
      >
      <TableHeadCell scope="col" class="text-center w-[10%]"
        >Monto</TableHeadCell
      >
      <TableHeadCell scope="col" class="text-center w-[3%]"
        >Acción</TableHeadCell
      >
    </TableHead>
    <TableBody tableBodyClass="divide-y">
      {#each quotationDetails as invoiceDetail, i}
        <TableBodyRow class="h-5">
          <TableBodyCell class="text-center w-[3%] py-1">{i + 1}</TableBodyCell>
          <TableBodyCell class=" w-[25%] py-1"
            >{invoiceDetail.item.name}</TableBodyCell
          >
          <TableBodyCell class="text-center w-[10%] py-1"
            >{new Intl.NumberFormat("es-DO").format(
              invoiceDetail.price
            )}</TableBodyCell
          >
          <TableBodyCell class="text-center w-[11%] py-1"
            ><Input
              size="sm"
              type="number"
              class="m-0 {customColorsClassDark.input}"
              value={invoiceDetail.quantity}
              on:input={(e) => updateQuantity(invoiceDetail.id, e.target)}
              required
              disabled={!quotationActive}
            /></TableBodyCell
          >
          <TableBodyCell class="text-center w-[10%] py-1">
            {new Intl.NumberFormat("es-DO").format(
              calculateTax(invoiceDetail.id)
            )}</TableBodyCell
          >
          <TableBodyCell class="text-center w-[15%] py-1"
            ><Input
              size="sm"
              type="number"
              step="any"
              class="m-0 {customColorsClassDark.input}"
              value={invoiceDetail.discount}
              on:blur={(e) => updateDiscount(invoiceDetail.id, e.target)}
              required
              disabled={!quotationActive}
            /></TableBodyCell
          >
          <TableBodyCell class="text-center w-[10%] py-1">
            {new Intl.NumberFormat("es-DO").format(
              calculateAmount(invoiceDetail.id)
            )}
          </TableBodyCell>
          <TableBodyCell class="text-center w-[3%] py-1">
            <Button
              class="m-0"
              size="xs"
              color="red"
              on:click={() => deleteRow(invoiceDetail.id)}
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
          <TableBodyCell colspan="8" class="text-center"
            >No hay items</TableBodyCell
          >
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
  <tfoot class="rounded-b-xl absolute inset-x-0 bottom-0">
    <tr class="font-semibold text-gray-900 dark:text-white dark:bg-gray-700">
      <th scope="row" class="py-3 px-6 text-left w-[38%]">Total</th>
      <td class="py-3 px-6 w-[11%] text-center">{totalQuantity}</td>
      <td class="py-3 px-6 w-[10%] text-center"
        >{new Intl.NumberFormat("es-DO", {
          style: "currency",
          currency: "DOP",
        }).format(totalTax)}</td
      >
      <td class="py-1 px-6 w-[15%] text-center flex-1">
        {new Intl.NumberFormat("es-DO", {
          style: "currency",
          currency: "DOP",
        }).format(totalDiscount)}
      </td>
      <td class="py-3 px-6 w-[13%] text-center"
        >{new Intl.NumberFormat("es-DO", {
          style: "currency",
          currency: "DOP",
        }).format(totalAmount)}</td
      >
      <td class="py-3 px-6 w-[3%]" />
    </tr>
  </tfoot>
</div>

<Modal title="Busqueda avanzada de items" bind:open={defaultModal} autoclose>
  <div class="h-[25rem]">
    {#await multiselectOptions}
      <Spinner />
    {:then response}
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
    {/await}
  </div>
  <svelte:fragment slot="footer">
    <Button color="red">Cerrar</Button>
  </svelte:fragment>
</Modal>
