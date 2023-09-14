<script>
  import { paymentMethods } from "../../../lib/stores/stores";
  import { isNumeric } from "../../../lib/utils/functions";
  import Swal from "sweetalert2";
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Input,
    Select,
    CloseButton,
    Button,
  } from "flowbite-svelte";

  export let payments = [];
  export let totalPayments = 0;
  export let calculateChange;
  export let invoiceDetails = [];
  export let invoiceHeader;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  let counter = 0;
  let activePayments;

  $: if (payments) {
    calculateTotalPayments();
    calculateChange();
  }

  $: if (
    invoiceHeader?.status &&
    invoiceDetails?.length > 0 &&
    !invoiceHeader?.id
  ) {
    activePayments = true;
  } else {
    activePayments = false;
  }

  function addRowPayment() {
    if (activePayments) {
      if (payments?.length >= 3) {
        Swal.fire(
          "No puede agregar más de 3 formas de pago por esta vía.",
          "",
          "warning"
        );
      } else {
        counter++;
        const id = "PID" + counter;

        const payment = {
          id: id,
          amount: 0.0,
          payment_method: 1,
        };

        payments = [...payments, payment];
      }
    }
  }

  function updateRowPaymentAmount(paymentId, value) {
    if (activePayments) {
      payments = payments.map((e) => {
        if (e.id === paymentId) {
          e.amount = Number.parseFloat(value.value);
        }
        return e;
      });
    }
  }

  function updateRowPaymentMethod(paymentId, value) {
    if (activePayments) {
      payments = payments.map((e) => {
        if (e.id === paymentId) {
          e.payment_method = Number(value.value);
        }
        return e;
      });
    }
  }

  function deleteRowPayment(rowId) {
    if (activePayments) {
      if (!isNumeric(rowId)) {
        payments = payments.filter((e) => e.id !== rowId);
      } else {
        Swal.fire(
          "No puedes eliminar pagos de una factura generada por esta vía.",
          "",
          "error"
        );
      }
    }
  }

  function calculateTotalPayments() {
    let sumPayments = 0;

    payments.map((e) => {
      sumPayments += Number.parseFloat(e.amount);
    });

    totalPayments = sumPayments;
  }
</script>

<div
  class="relative overflow-y-auto shadow-xl bg-white rounded-xl border-2 border-gray-300 col-start-4 row-span-3 row-start-1"
>
  <Table hoverable={true} shadow>
    <TableHead>
      <TableHeadCell colspan="2" class="text-center w-[90%]"
        >Pagos</TableHeadCell
      >
      <TableHeadCell class="p-1 text-center w-[2%]"
        ><Button
          color="blue"
          size="sm"
          on:click={addRowPayment}
          disabled={!activePayments}
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.3rem"
            height="1.3rem"
            viewBox="0 0 24 24"
            ><path
              fill="currentColor"
              d="M12 4a1 1 0 0 0-1 1v6H5a1 1 0 1 0 0 2h6v6a1 1 0 1 0 2 0v-6h6a1 1 0 1 0 0-2h-6V5a1 1 0 0 0-1-1Z"
            /></svg
          ></Button
        ></TableHeadCell
      >
    </TableHead>
    <TableBody tableBodyClass="divide-y">
      {#each payments as payment}
        <TableBodyRow class="h-5">
          <TableBodyCell class="px-2 py-1 w-[48%] text-center"
            ><Input
              size="sm"
              type="number"
              class={customColorsClassDark.input}
              value={payment.amount}
              on:blur={(e) => updateRowPaymentAmount(payment.id, e.target)}
              required={activePayments}
              disabled={!activePayments}
            /></TableBodyCell
          >
          <TableBodyCell class="p-1  w-[50%] text-right">
            <Select
              underline
              size="sm"
              id="paymentMethod"
              value={payment.payment_method}
              on:change={(e) => updateRowPaymentMethod(payment.id, e.target)}
              required={activePayments}
              disabled={!activePayments}
            >
              {#each $paymentMethods as { id, name }}
                <option value={id}>{name}</option>
              {/each}
            </Select>
          </TableBodyCell>
          <TableBodyCell class="p-1 w-[2%] text-center"
            ><CloseButton
              on:click={() => deleteRowPayment(payment.id)}
              disabled={!activePayments}
            /></TableBodyCell
          >
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>

  <tfoot class="rounded-b-xl absolute inset-x-0 bottom-0">
    <tr class="font-semibold text-gray-900 dark:text-white dark:bg-gray-700">
      <th scope="row" class="py-3 px-6 text-left w-[50%]">Total</th>
      <td class="py-3 px-6 w-[50%] text-center"
        >{new Intl.NumberFormat("es-DO", {
          style: "currency",
          currency: "DOP",
        }).format(totalPayments)}</td
      >
      <td />
    </tr>
  </tfoot>
</div>
