<script>
  import { Input, Label, Button, Hr, Heading, Card } from "flowbite-svelte";
  import { urls } from "../../../lib/utils/urls";
  import { onMount } from "svelte";

  export let currentRoute;

  let salesReport = Object.seal({
    from: "",
    to: "",
    user: 1,
  });

  let company_info;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  function getReport() {
    window.open(
      urls.backendRoute +
        urls.printSalesReportEndPoint +
        `?from=${salesReport.from}&to=${salesReport.to}&user_id=${salesReport.user}`,
      "_blank"
    );
  }

  function getCompany() {
    const token = JSON.parse(localStorage.getItem("token"));
    fetch(urls.backendRoute + urls.companyListEndpoint, {
      headers: {
        Authorization: `Token ${token.token}`,
      },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          company_info = data;
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  onMount(() => {
    getCompany();
  });
</script>

<div class="pl-0 p-4">
  <form
    class="flex space-x-4 items-center"
    on:submit|preventDefault|stopPropagation={getReport}
  >
    <div class="grid gap-6 mb-6 md:grid-cols-2">
      <div>
        <Label for="from" class="mb-2 {customColorsClassDark.label}"
          >Desde</Label
        >
        <Input
          class={customColorsClassDark.input}
          type="date"
          id="from"
          bind:value={salesReport.from}
          required
        />
      </div>
      <div>
        <Label for="to" class="mb-2 {customColorsClassDark.label}">Hasta</Label>
        <Input
          class={customColorsClassDark.input}
          type="date"
          id="to"
          bind:value={salesReport.to}
          required
        />
      </div>
    </div>
    <Button class="!p-2.5" type="submit" color="blue" pill
      >Generar Reporte</Button
    >
  </form>
</div>
<Hr classHr="h-1 mx-auto my-2 rounded" />
<div class="bg-white shadow-xl rounded-xl p-4">
  <Heading
    tag="h3"
    class="mb-4"
    color="text-gray-900"
    customSize="text-center text-4xl font-extrabold  md:text-5xl lg:text-6xl"
    >Reporte de ventas</Heading
  >
</div>
