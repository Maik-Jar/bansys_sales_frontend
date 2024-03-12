<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../../lib/utils/urls";
  import { onMount } from "svelte";
  import { hasPermission } from "../../../lib/utils/functions";
  import { Heading, Label, Input, Select, Button, Span } from "flowbite-svelte";

  export let currentRoute;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  const paymentMethod = Object.seal({
    id: null,
    name: null,
    status: true,
  });

  let isEditable = false;

  function getPaymentMethod() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.paymentsMethodsEndpoint +
          `?payment_method_id=${currentRoute.queryParams.id}`,
        {
          headers: {
            Authorization: `Token ${token.token}`,
          },
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            paymentMethod.id = data.id;
            paymentMethod.name = data.name;
            paymentMethod.status = data.status;
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }

  function createPaymentMethod() {
    Swal.fire({
      title: "¿Quieres crear este nuevo método de pago?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(urls.backendRoute + urls.paymentsMethodsEndpoint, {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token.token}`,
          },
          body: JSON.stringify(paymentMethod),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              paymentMethod.id = data.id;

              Swal.fire("¡Nuevo método de pago creado!", "", "success");
              isEditable = true;
            } else {
              const message = await res.json();
              Swal.fire("Solicitud incorrecta.", `${message.detail}`, "error");
              console.log(message);
            }
          })
          .catch((error) => {
            Swal.fire("Error interno", `${error.message}`, "error");
            console.log(error.message);
          });
      } else if (result.isDenied) {
        Swal.fire("Operación descartada.", "", "info");
      }
    });
  }

  function updatePaymentMethod() {
    Swal.fire({
      title: "¿Quieres guardar los datos?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(
          urls.backendRoute +
            urls.paymentsMethodsEndpoint +
            `?payment_method_id=${paymentMethod.id}`,
          {
            method: "put",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Token ${token.token}`,
            },
            body: JSON.stringify(paymentMethod),
          }
        )
          .then(async (res) => {
            if (res.ok) {
              Swal.fire("¡Datos guardados!", "", "success");
            } else {
              const message = await res.json();
              Swal.fire("Solicitud incorrecta.", `${message.detail}`, "error");
              console.log(message);
            }
          })
          .catch((error) => {
            Swal.fire("Error interno", `${error.message}`, "error");
          });
      } else if (result.isDenied) {
        Swal.fire("Operación descartada.", "", "info");
      }
    });
  }

  onMount(async () => {
    isEditable =
      (await currentRoute.queryParams.type) == "update" ? true : false;
    getPaymentMethod();
  });
</script>

<form
  id="form_paymentMethod"
  class="pl-0 p-4 relative"
  on:submit|preventDefault|stopPropagation={isEditable
    ? updatePaymentMethod
    : createPaymentMethod}
>
  <div
    class="flex justify-start pb-5 mb-2 border-b-4 border-gray-100 dark:border-gray-400"
  >
    <Heading tag="h4" class="w-1/2 {customColorsClassDark.label} self-end"
      >Código: <Span highlight>{paymentMethod.id ? paymentMethod.id : ""}</Span
      ></Heading
    >
  </div>
  <Heading tag="h3" class={"dark:text-black"}>Información General</Heading>
  <div
    class="grid grid-cols-2 gap-4 py-5 my-2 border-y-4 border-gray-100 dark:border-gray-400"
  >
    <div>
      <Label for="name" class="block mb-2 {customColorsClassDark.label}"
        >Nombre</Label
      >
      <Input
        id="name"
        class="capitalize {customColorsClassDark.input}"
        bind:value={paymentMethod.name}
        required
      />
    </div>
    <Label class={customColorsClassDark.label}
      >Status
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={paymentMethod.status}
        required
      >
        <option value={true}>Activo</option>
        <option value={false}>Inactivo</option>
      </Select>
    </Label>
  </div>
</form>
<div class="flex space-x-3 mt-3">
  <Button
    color="dark"
    on:click={() => navigateTo("master_data/payments_methods_list")}
    >Volver</Button
  >
  {#if hasPermission("master_data.add_paymentmethod") || hasPermission("master_data.change_paymentmethod")}
    <Button color="green" type="submit" form="form_paymentMethod"
      >Guardar</Button
    >
  {/if}
</div>
