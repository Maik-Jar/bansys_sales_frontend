<script>
  import { urls } from "../../../lib/utils/urls";
  import Swal from "sweetalert2";
  import {
    Label,
    Input,
    Button,
    Modal,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Radio,
  } from "flowbite-svelte";

  export let customer;
  export let invoiceActive;
  export const getCustomerForId = () => {
    const token = JSON.parse(localStorage.getItem("token"));
    fetch(
      urls.backendRoute +
        urls.customersEndPoint +
        `?customer_id=${customer.id}`,
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
          dataCustomer = data;
        } else {
          const data = await res.json();
          console.log(data);
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
  export let dataCustomer = {
    id: null,
    name: "",
    document_id: "",
    phone: "",
  };

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  let customersObject = [];
  let openModal = false;

  function getCustomer() {
    const dataToSearch =
      dataCustomer.name || dataCustomer.document_id || dataCustomer.phone;
    const token = JSON.parse(localStorage.getItem("token"));
    fetch(
      urls.backendRoute + urls.customersEndPoint + `?search=${dataToSearch}`,
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
          if (data?.results) {
            customersObject = data?.results;
            if (customersObject.length > 1) {
              openModal = true;
            } else if (customersObject.length == 0) {
              Swal.fire(
                "No se encontro clientes que coincidan con los datos suministrados.",
                "",
                "error"
              );
            } else {
              dataCustomer = customersObject[0];
              customer.id = dataCustomer?.id;
              customer.name = dataCustomer?.name;
            }
          }
        } else {
          const data = await res.json();
          console.log(data);
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  function addSelected(customerId) {
    const customerSelected = customersObject.find((e) => e.id == customerId);
    dataCustomer = customerSelected;
    customer.id = customerSelected.id;
    customer.name = customerSelected.name;
  }
</script>

<form
  id="form_search_customer"
  on:submit|preventDefault|stopPropagation={getCustomer}
>
  <div class="mb-3">
    <Label for="customer" class="block mb-2 {customColorsClassDark.label}"
      >Cliente</Label
    >
    <Input
      id="customer"
      class="capitalize {customColorsClassDark.input}"
      bind:value={dataCustomer.name}
      disabled={!invoiceActive}
      on:input={(e) => {
        dataCustomer.phone = "";
        dataCustomer.document_id = "";
        customer.id = null;
        customer.name = null;
      }}
    />
  </div>
  <div class="flex space-x-3 mb-4">
    <div class="w-full">
      <Label
        for="customerDocumentID"
        class="block mb-2 {customColorsClassDark.label}">No. Documento</Label
      >
      <Input
        id="customerDocumentID"
        class={customColorsClassDark.input}
        bind:value={dataCustomer.document_id}
        disabled={!invoiceActive}
        on:input={(e) => {
          dataCustomer.phone = "";
          dataCustomer.name = "";
          customer.id = null;
          customer.name = null;
        }}
      />
    </div>
    <div class="w-full">
      <Label
        for="customerContac"
        class="block mb-2 {customColorsClassDark.label}">Contacto</Label
      >
      <Input
        id="customerContac"
        class={customColorsClassDark.input}
        bind:value={dataCustomer.phone}
        disabled={!invoiceActive}
        on:input={(e) => {
          dataCustomer.name = "";
          dataCustomer.document_id = "";
          customer.id = null;
          customer.name = null;
        }}
      />
    </div>
  </div>
  <Button
    color="blue"
    type="submit"
    form="form_search_customer"
    disabled={!invoiceActive}>Buscar</Button
  >
</form>

<Modal title="Clientes encontrados" bind:open={openModal} autoclose>
  <Table hoverable={true}>
    <TableHead>
      <TableHeadCell class="!p-4" />
      <TableHeadCell>Cliente</TableHeadCell>
      <TableHeadCell>Tipo Doc.</TableHeadCell>
      <TableHeadCell>Documento</TableHeadCell>
      <TableHeadCell>Contacto</TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass="divide-y">
      {#each customersObject as customerObj}
        <TableBodyRow>
          <TableBodyCell class="!p-4">
            <Radio
              name="customer"
              on:click={() => addSelected(customerObj?.id)}
            />
          </TableBodyCell>
          <TableBodyCell>{customerObj?.name}</TableBodyCell>
          <TableBodyCell>{customerObj?.document_type}</TableBodyCell>
          <TableBodyCell>{customerObj?.document_id}</TableBodyCell>
          <TableBodyCell>{customerObj?.phone}</TableBodyCell>
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
  <svelte:fragment slot="footer">
    <Button color="red" on:click={() => (customersObject = [])}>Cerrar</Button>
  </svelte:fragment>
</Modal>
