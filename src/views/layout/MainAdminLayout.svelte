<script>
  import { Route, navigateTo } from "svelte-router-spa";
  import { hasPermission } from "../../lib/utils/functions";
  import {
    DarkMode,
    Navbar,
    NavHamburger,
    NavBrand,
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    SidebarDropdownItem,
    SidebarDropdownWrapper,
    Breadcrumb,
    BreadcrumbItem,
    Avatar,
    Dropdown,
    DropdownHeader,
    DropdownItem,
    DropdownDivider,
  } from "flowbite-svelte";

  export let currentRoute;

  let colorIcon =
    localStorage.getItem("color-theme") == "dark"
      ? "/src/assets/bansys-sales-white.svg"
      : "/src/assets/bansys-sales.svg";

  $: userInfo = JSON.parse(localStorage.getItem("token"));
  $: activeUrl = currentRoute.path;

  function signout() {
    localStorage.setItem("isLogin", JSON.stringify(false));
    localStorage.setItem("token", "");
    navigateTo("login");
  }

  function goAdminSite() {
    if (hasPermission("admin.view_logentry")) {
      window.open("http://localhost:8000/admin");
    }
  }
</script>

<div
  class="h-screen max-h-screen bg-white dark:bg-gradient-to-b dark:from-zinc-900 dark:to-zinc-800"
>
  <Navbar
    let:hidden
    let:toggle
    fluid
    class={"bg-white dark:bg-zinc-900 print:hidden"}
  >
    <NavBrand href="/">
      <span
        class="ml-5 whitespace-nowrap text-2xl font-semibold dark:text-white"
        >Bansys | Sales</span
      >
    </NavBrand>

    <div class="flex space-x-4">
      <DarkMode />
      <Avatar id="avatar-menu" src="/user.svg" />
      <NavHamburger
        on:click={toggle}
        class1="w-full md:flex md:w-auto md:order-1"
      />
    </div>
    <Dropdown placement="bottom" triggeredBy="#avatar-menu">
      <DropdownHeader>
        <span class="block text-sm">{userInfo.username}</span>
        <span class="block truncate text-sm font-medium">name@flowbite.com</span
        >
      </DropdownHeader>
      {#if hasPermission("admin.view_logentry")}
        <DropdownItem on:click={goAdminSite}>Admin Panel</DropdownItem>
      {/if}
      <DropdownDivider />
      <DropdownItem on:click={signout}>Sign out</DropdownItem>
    </Dropdown>
  </Navbar>

  <div class=" flex h-[89%] 2xl:h-[93%] w-full">
    <Sidebar class="h-full w-72 print:hidden" {activeUrl}>
      <SidebarWrapper
        class={"h-full bg-white dark:bg-gradient-to-b dark:from-zinc-900 dark:to-zinc-800"}
      >
        <SidebarGroup>
          <SidebarItem label="/Dashboard">
            <svelte:fragment slot="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
                /><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
                /></svg
              >
            </svelte:fragment>
          </SidebarItem>
          {#if hasPermission("point_of_sales.view_invoiceheader")}
            <SidebarDropdownWrapper label="Facturación">
              <svelte:fragment slot="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.6em"
                  height="1.6em"
                  viewBox="0 0 24 24"
                  {...$$props}
                  ><path
                    fill="currentColor"
                    d="M11.025 21v-2.15q-1.325-.3-2.288-1.15t-1.412-2.4l1.85-.75q.375 1.2 1.113 1.825t1.937.625q1.025 0 1.738-.463t.712-1.437q0-.875-.55-1.387t-2.55-1.163q-2.15-.675-2.95-1.613t-.8-2.287q0-1.625 1.05-2.525t2.15-1.025V3h2v2.1q1.25.2 2.063.913t1.187 1.737l-1.85.8q-.3-.8-.85-1.2t-1.5-.4q-1.1 0-1.675.488T9.825 8.65q0 .825.75 1.3t2.6 1q1.725.5 2.613 1.588t.887 2.512q0 1.775-1.05 2.7t-2.6 1.15V21h-2Z"
                  /></svg
                >
              </svelte:fragment>
              <SidebarDropdownItem
                label="Gestión de facturas"
                href="/sales/invoices_list"
                active={activeUrl == "/sales/invoices_list"}
              />
              <SidebarDropdownItem
                label="Gestión de cotizaciones"
                href="/sales/quotations_list"
                active={activeUrl == "/sales/quotations_list"}
              />
              <SidebarDropdownItem
                label="Reporte de ventas"
                href="/sales/sales_report_form"
                active={activeUrl == "/sales/sales_report_form"}
              />
            </SidebarDropdownWrapper>
          {/if}
          {#if hasPermission("customers.view_customer")}
            <SidebarDropdownWrapper label="Clientes">
              <svelte:fragment slot="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.6em"
                  height="1.6em"
                  viewBox="0 0 24 24"
                  {...$$props}
                  ><path
                    fill="currentColor"
                    d="M2 20v-2.8q0-.85.425-1.563T3.6 14.55q1.5-.75 3.112-1.15T10 13q.625 0 1.25.088t1.25.212v1.575q-1.125.55-1.813 1.45T10 18.675V20H2Zm10 0v-1.4q0-.6.313-1.113t.887-.737q.9-.375 1.863-.563T17 16q.975 0 1.938.188t1.862.562q.575.225.888.738T22 18.6V20H12Zm5-5q-1.05 0-1.775-.725T14.5 12.5q0-1.05.725-1.775T17 10q1.05 0 1.775.725T19.5 12.5q0 1.05-.725 1.775T17 15Zm-7-3q-1.65 0-2.825-1.175T6 8q0-1.65 1.175-2.825T10 4q1.65 0 2.825 1.175T14 8q0 1.65-1.175 2.825T10 12Z"
                  /></svg
                >
              </svelte:fragment>
              <SidebarDropdownItem
                label="Gestión de clientes"
                href="/customers/customers_list"
                active={activeUrl == "/customers/customers_list"}
              />
            </SidebarDropdownWrapper>
          {/if}
          {#if hasPermission("purchases_and_providers.view_provider")}
            <SidebarDropdownWrapper label="Proveedores">
              <svelte:fragment slot="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.6em"
                  height="1.6em"
                  viewBox="0 0 24 24"
                  {...$$props}
                  ><path
                    fill="currentColor"
                    d="M6 20q-1.25 0-2.125-.875T3 17H1V6q0-.825.588-1.413T3 4h14v4h3l3 4v5h-2q0 1.25-.875 2.125T18 20q-1.25 0-2.125-.875T15 17H9q0 1.25-.875 2.125T6 20Zm0-2q.425 0 .713-.288T7 17q0-.425-.288-.713T6 16q-.425 0-.713.288T5 17q0 .425.288.713T6 18Zm12 0q.425 0 .713-.288T19 17q0-.425-.288-.713T18 16q-.425 0-.713.288T17 17q0 .425.288.713T18 18Zm-1-5h4.25L19 10h-2v3Z"
                  /></svg
                >
              </svelte:fragment>
              <SidebarDropdownItem
                label="Gestión de proveedores"
                href="/providers/providers_list"
                active={activeUrl == "/providers/providers_list"}
              />
            </SidebarDropdownWrapper>
          {/if}
          {#if hasPermission("products_and_services.view_item")}
            <SidebarDropdownWrapper label="Productos & Servicios">
              <svelte:fragment slot="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.6em"
                  height="1.6em"
                  viewBox="0 0 24 24"
                  {...$$props}
                  ><path
                    fill="currentColor"
                    d="M5 21q-.825 0-1.413-.588T3 19V6.525q0-.35.113-.675t.337-.6L4.7 3.725q.275-.35.687-.538T6.25 3h11.5q.45 0 .863.188t.687.537l1.25 1.525q.225.275.338.6t.112.675V19q0 .825-.588 1.413T19 21H5Zm.4-15h13.2l-.85-1H6.25L5.4 6ZM16 8H8v8l4-2l4 2V8Z"
                  /></svg
                >
              </svelte:fragment>
              <SidebarDropdownItem
                label="Gestión de items"
                href="/products_and_services/items_list"
                active={activeUrl == "/products_and_services/items_list"}
              />
            </SidebarDropdownWrapper>
          {/if}
          {#if hasPermission("accounting.view_payment")}
            <SidebarDropdownWrapper label="Cuentas por cobrar">
              <svelte:fragment slot="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.6em"
                  height="1.6em"
                  viewBox="0 0 24 24"
                  {...$$props}
                  ><path
                    fill="currentColor"
                    d="M11 8c0 2.21-1.79 4-4 4s-4-1.79-4-4s1.79-4 4-4s4 1.79 4 4m0 6.72V20H0v-2c0-2.21 3.13-4 7-4c1.5 0 2.87.27 4 .72M24 20H13V3h11zm-8-8.5a2.5 2.5 0 0 1 5 0a2.5 2.5 0 0 1-5 0M22 7a2 2 0 0 1-2-2h-3c0 1.11-.89 2-2 2v9a2 2 0 0 1 2 2h3c0-1.1.9-2 2-2z"
                  /></svg
                >
              </svelte:fragment>
              <SidebarDropdownItem
                label="Gestión de pagos"
                href="/accounts_receivable/payments_list"
                active={activeUrl == "/accounts_receivable/payments_list"}
              />
              <SidebarDropdownItem
                label="Saldo de clientes"
                href="/accounts_receivable/customer_balances_list"
                active={activeUrl ==
                  "/accounts_receivable/customer_balances_list"}
              />
            </SidebarDropdownWrapper>
          {/if}
          {#if hasPermission("inventory.view_input")}
            <SidebarDropdownWrapper label="Inventario">
              <svelte:fragment slot="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.6em"
                  height="1.6em"
                  viewBox="0 0 24 24"
                  {...$$props}
                  ><path
                    fill="currentColor"
                    d="M6 19h2v2H6zm6-16L2 8v13h2v-8h16v8h2V8zm-4 8H4V9h4zm6 0h-4V9h4zm6 0h-4V9h4zM6 15h2v2H6zm4 0h2v2h-2zm0 4h2v2h-2zm4 0h2v2h-2z"
                  /></svg
                >
              </svelte:fragment>
              <SidebarDropdownItem
                label="Entradas Inventario"
                href="/inventory/inputs_list"
                active={activeUrl == "/inventory/inputs_list"}
              />
              <SidebarDropdownItem
                label="Salidas Inventario"
                href="/inventory/outputs_list"
                active={activeUrl == "/inventory/outputs_list"}
              />
            </SidebarDropdownWrapper>
          {/if}
          {#if hasPermission("master_data.view_documenttype")}
            <SidebarDropdownWrapper label="Master Data">
              <svelte:fragment slot="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.6em"
                  height="1.6em"
                  viewBox="0 0 24 24"
                  {...$$props}
                  ><path
                    fill="currentColor"
                    d="M12 3C7.58 3 4 4.79 4 7s3.58 4 8 4s8-1.79 8-4s-3.58-4-8-4M4 9v3c0 2.21 3.58 4 8 4s8-1.79 8-4V9c0 2.21-3.58 4-8 4s-8-1.79-8-4m0 5v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3c0 2.21-3.58 4-8 4s-8-1.79-8-4"
                  /></svg
                >
              </svelte:fragment>
              <SidebarDropdownItem
                label="Tipos de documentos"
                href="/master_data/document_type_list"
                active={activeUrl == "/master_data/document_type_list"}
              />
              <SidebarDropdownItem
                label="Métodos de pago"
                href="/master_data/payments_methods_list"
                active={activeUrl == "/master_data/payments_methods_list"}
              />
              <SidebarDropdownItem
                label="Impuestos"
                href="/master_data/taxes_list"
                active={activeUrl == "/master_data/taxes_list"}
              />
              <SidebarDropdownItem
                label="Tipos de ventas"
                href="/master_data/sales_types_list"
                active={activeUrl == "/master_data/sales_types_list"}
              />
              <SidebarDropdownItem
                label="Comprobantes"
                href="/master_data/receipts_list"
                active={activeUrl == "/master_data/receipts_list"}
              />
            </SidebarDropdownWrapper>
          {/if}
        </SidebarGroup>
      </SidebarWrapper>
    </Sidebar>
    <!-- Contenido principal -->
    <span />
    <div
      class="flex-1 mx-4 p-6 bg-gray-200 dark:bg-gray-200 rounded-3xl h-full overflow-auto"
    >
      <Breadcrumb
        aria-label="Default breadcrumb example"
        class={"mb-5 dark:text-gray-500"}
      >
        <BreadcrumbItem home>Home</BreadcrumbItem>
        <BreadcrumbItem>Projects</BreadcrumbItem>
        <BreadcrumbItem>Flowbite Svelte</BreadcrumbItem>
      </Breadcrumb>

      <!-- Aquí coloca el contenido principal de tu página -->
      <Route {currentRoute} />
    </div>
  </div>
</div>
