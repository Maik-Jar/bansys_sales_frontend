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
  let selected = 1;

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

    selected = 1;
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
          value={selected}
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
