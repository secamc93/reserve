import { expect, test, type APIRequestContext } from "@playwright/test";
import { API, apiBusinessToken, login } from "./helpers";

// Rediseño de Accesos (IAM): crear un usuario con rol, encontrarlo por rol, ver qué puede hacer
// y cambiar los permisos del rol desde la matriz. Prepara sus propios datos por la API, con un
// sufijo para no chocar con otras corridas.

const SUFFIX = Date.now().toString(36);
const ROLE = `E2E rol ${SUFFIX}`;
const RESOURCE = `E2E módulo ${SUFFIX}`;
const USER = `E2E usuario ${SUFFIX}`;
const EMAIL = `e2e-${SUFFIX}@rupu.test`;

interface Setup {
  businessName: string;
  roleId: number;
  updatePermissionId: number;
  readPermissionId: number;
}

async function setup(request: APIRequestContext): Promise<Setup> {
  const token = await apiBusinessToken(request);
  const headers = { Authorization: `Bearer ${token}` };
  // Respuestas del back sin tipo: cada paso lee solo los campos que necesita.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = async (r: Awaited<ReturnType<APIRequestContext["get"]>>, what: string): Promise<any> => {
    expect(r.ok(), `${what}: ${r.status()} ${await r.text()}`).toBeTruthy();
    return r.json();
  };

  const types: { id: number; code: string }[] = (await json(await request.get(`${API}/business-types`, { headers }), "tipos de negocio")).data;
  const typeId = types.find((t) => t.code === "horizontal_property")?.id;
  expect(typeId, "tipo de negocio horizontal_property").toBeTruthy();

  const businesses: { id: number; name: string; business_type_id: number }[] = (
    await json(await request.get(`${API}/businesses`, { headers, params: { page: 1, per_page: 100 } }), "propiedades")
  ).data;
  const business = businesses.find((b) => b.business_type_id === typeId);
  expect(business, "una propiedad horizontal en la BD").toBeTruthy();

  // Acciones Read y Update (se crean si la BD no las tiene).
  const actions: { id: number; name: string }[] = (await json(await request.get(`${API}/actions`, { headers, params: { page_size: 200 } }), "acciones")).data.actions;
  const actionId = async (name: string) =>
    actions.find((a) => a.name === name)?.id ?? (await json(await request.post(`${API}/actions`, { headers, data: { name } }), `crear acción ${name}`)).data.id;
  const readId = await actionId("Read");
  const updateId = await actionId("Update");

  const resource = (await json(await request.post(`${API}/resources`, { headers, data: { name: RESOURCE, business_type_id: typeId } }), "crear recurso")).data;
  // El alta de permisos no devuelve el id: se busca por nombre en la lista del tipo de negocio.
  const permission = async (action: number, name: string) => {
    await json(
      await request.post(`${API}/permissions`, { headers, data: { name, resource_id: resource.id, action_id: action, scope_id: 2, business_type_id: typeId } }),
      `crear permiso ${name}`,
    );
    const list: { id: number; name: string }[] = (await json(await request.get(`${API}/permissions`, { headers, params: { business_type_id: typeId! } }), "listar permisos")).data;
    const id = list.find((p) => p.name === name)?.id;
    expect(id, `id del permiso ${name}`).toBeTruthy();
    return id!;
  };
  const readPermissionId = await permission(readId, `Ver ${RESOURCE}`);
  const updatePermissionId = await permission(updateId, `Editar ${RESOURCE}`);

  const role = (
    await json(
      await request.post(`${API}/roles`, { headers, data: { name: ROLE, description: "Rol de prueba e2e", level: 5, scope_id: 2, business_type_id: typeId } }),
      "crear rol",
    )
  ).data;
  await json(await request.post(`${API}/roles/${role.id}/permissions`, { headers, data: { permission_ids: [readPermissionId] } }), "permisos del rol");

  return { businessName: business!.name, roleId: role.id, updatePermissionId, readPermissionId };
}

test("crear usuario con rol, encontrarlo por rol y cambiar los permisos del rol", async ({ page, request }) => {
  test.setTimeout(180_000);
  const data = await setup(request);
  await login(page);

  // 2d · Crear usuario con propiedad y rol.
  await page.goto("/iam/users");
  await page.getByRole("button", { name: "Crear usuario" }).click();
  const form = page.getByRole("dialog", { name: "Crear usuario" });
  await form.getByLabel("Nombre completo").fill(USER);
  await form.getByLabel("Correo").fill(EMAIL);
  await form.getByLabel("Propiedad (opcional)").selectOption({ label: data.businessName });
  await form.getByRole("radio", { name: new RegExp(ROLE) }).check();
  await form.getByRole("button", { name: "Crear usuario" }).click();

  const created = page.getByRole("dialog", { name: "Usuario creado" });
  await expect(created).toBeVisible({ timeout: 30_000 });
  await expect(created).toContainText(EMAIL);
  await expect(created).not.toContainText("no se pudo asignar el rol");
  await created.getByRole("button", { name: "Listo, ya la copié" }).click();

  // 2a · Filtrar por rol (queda en la URL) y abrir la ficha.
  await page.getByLabel("Filtrar por rol").selectOption({ label: ROLE });
  await expect(page).toHaveURL(/rol=\d+/);
  const row = page.getByRole("row", { name: new RegExp(USER) });
  await expect(row).toContainText(`${ROLE} · ${data.businessName}`, { timeout: 30_000 });
  await expect(page.getByRole("table", { name: "Usuarios" }).getByRole("row")).toHaveCount(2); // encabezado + el usuario
  await row.getByText(USER).click();
  const panel = page.getByRole("dialog", { name: USER });
  await expect(panel.getByRole("region", { name: "Qué puede hacer" })).toContainText(RESOURCE);
  await expect(panel.getByRole("region", { name: "Qué puede hacer" })).toContainText("Solo ver");
  await panel.getByRole("button", { name: "Cerrar" }).click();

  // 2b · Matriz: dar "Editar" y guardar.
  await page.goto(`/iam/roles?rol=${data.roleId}`);
  const matrix = page.getByRole("region", { name: `Permisos del rol ${ROLE}` });
  await expect(matrix.getByRole("link", { name: "1 usuario con este rol" })).toBeVisible({ timeout: 30_000 });
  await expect(matrix.getByRole("checkbox", { name: `${RESOURCE}: ver` })).toBeChecked();
  await matrix.getByRole("checkbox", { name: `${RESOURCE}: editar` }).check();
  const bar = page.getByRole("region", { name: "Cambios sin guardar" });
  await expect(bar).toContainText("1 cambio sin guardar · afecta a 1 usuario");
  await bar.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(matrix).toContainText(`Permisos de ${ROLE} guardados`);

  // Quedó guardado en el back.
  const token = await apiBusinessToken(request);
  const saved = await request.get(`${API}/roles/${data.roleId}/permissions`, { headers: { Authorization: `Bearer ${token}` } });
  const ids: number[] = ((await saved.json()).permissions as { id: number }[]).map((p) => p.id);
  expect(ids.sort()).toEqual([data.readPermissionId, data.updatePermissionId].sort());
});
