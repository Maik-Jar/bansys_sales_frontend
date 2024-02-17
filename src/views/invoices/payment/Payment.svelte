<script>
  import { paymentMethods } from "../../../lib/stores/stores";
  import { isNumeric } from "../../../lib/utils/functions";
  import Swal from "sweetalert2";
  import {
    Card,
    Input,
    Select,
    CloseButton,
    Button,
    Modal,
    Label,
  } from "flowbite-svelte";

  export let payments = [];
  export let totalPayments = 0;
  export let calculatePending;
  export let invoiceDetails = [];
  export let invoiceHeader;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  let counter = 0;
  let activePayments;
  let open = false;
  let tempAmount;
  let paymentRow;

  $: if (payments) {
    calculateTotalPayments();
    calculatePending();
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

  function addRowPayment(e) {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

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
          amount: data?.amount,
          payment_method: data?.paymentMethod,
        };

        payments = [...payments, payment];
      }
    }

    e.target.reset();
  }

  function updateRowPaymentAmount(paymentId, value) {
    if (activePayments) {
      payments = payments.map((e) => {
        if (e.id === paymentId) {
          e.amount = Number.parseFloat(value);
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

  function openModal(paymentRowId) {
    paymentRow = payments.find((e) => e.id === paymentRowId);
    open = true;
  }

  function calculateTotalPayments() {
    let sumPayments = 0;

    payments.map((e) => {
      sumPayments += Number.parseFloat(e.amount);
    });

    totalPayments = sumPayments;
  }
</script>

<!-- <div class="col-start-4 row-span-3 row-start-1">
  <Table
    hoverable={true}
    shadow
    divClass={"relative overflow-y-auto h-full bg-white"}
  >
    <TableHead class={"sticky top-0 w-full"}>
      <TableHeadCell colspan="2" class="px-3 text-center">Pagos</TableHeadCell>
      <TableHeadCell class="text-right px-3"
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
          <TableBodyCell
            class="px-3 py-1 text-center cursor-pointer"
            on:click={() => openModal(payment.id)}
          >
            {new Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP",
            }).format(payment.amount)}
          </TableBodyCell>
          <TableBodyCell class="px-3 py-1 text-center">
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
          <TableBodyCell class="px-3 py-1 text-right"
            ><CloseButton
              on:click={() => deleteRowPayment(payment.id)}
              disabled={!activePayments}
            /></TableBodyCell
          >
        </TableBodyRow>
      {/each}
    </TableBody>
    <tfoot class="absolute inset-x-0 bottom-0">
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
  </Table>
</div> -->

<Modal title="Monto pagado" bind:open size="sm">
  <form
    id="form_amount"
    on:submit|preventDefault|stopPropagation={() =>
      updateRowPaymentAmount(paymentRow.id, tempAmount?.value)}
  >
    <Input
      size="sm"
      type="number"
      step="0.01"
      class={customColorsClassDark.input}
      value={paymentRow.amount}
      on:blur={(e) => (tempAmount = e.target)}
      required={activePayments}
      disabled={!activePayments}
    />
    <!-- <Input
      type="number"
      step="0.01"
      class="m-0 {customColorsClassDark.input}"
      value={rowDetail.discount}
      on:input={(e) => (tempDiscount = e.target)}
      required
      disabled={!quotationActive}
    /> -->
  </form>
  <svelte:fragment slot="footer">
    <Button
      type="submit"
      form="form_amount"
      color="green"
      on:click={() => (open = false)}>Aplicar</Button
    >
    <Button color="red" on:click={() => (open = false)}>Cerrar</Button>
  </svelte:fragment>
</Modal>

<div class="w-full p-5">
  <div class="flex justify-between">
    <form
      id="paymentForm"
      class="flex space-x-4"
      on:submit|preventDefault|stopPropagation={addRowPayment}
    >
      <div>
        <Label for="amount" class="mb-2">Monto</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          class={customColorsClassDark.input}
          on:blur={(e) => (tempAmount = e.target)}
          required={activePayments}
          disabled={!activePayments}
        />
      </div>
      <div>
        <Label for="paymentMethod" class="mb-2">Metodo</Label>
        <Select
          id="paymentMethod"
          name="paymentMethod"
          required={activePayments}
          disabled={!activePayments}
        >
          {#each $paymentMethods as { id, name }}
            <option value={id}>{name}</option>
          {/each}
        </Select>
      </div>
    </form>
    <Button
      color="blue"
      type="submit"
      form="paymentForm"
      disabled={!activePayments}>Agregar</Button
    >
  </div>
  <div
    class="flex flex-col place-items-center space-y-3 p-3 border border-1 bg-gray-200 dark:bg-white border-gray-400 rounded-lg mt-5 min-h-40"
  >
    {#each payments as payment}
      <Card size="xl">
        <div class="flex justify-between min-w-72">
          <div>
            <h5
              class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
            >
              {new Intl.NumberFormat("es-DO", {
                style: "currency",
                currency: "DOP",
              }).format(payment.amount)}
            </h5>
            <p
              class="font-normal text-gray-700 dark:text-gray-400 leading-tight"
            >
              {$paymentMethods.find((e) => e.id == payment.payment_method)
                ?.name}
            </p>
          </div>
          <CloseButton
            on:click={() => deleteRowPayment(payment.id)}
            disabled={!activePayments}
          />
        </div>
      </Card>
    {/each}
  </div>
</div>
