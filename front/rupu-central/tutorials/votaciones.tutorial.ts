import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { caption, finish, hideImage, markReady, prepare, saveNarration, say, showImage, tap, write } from "./studio";

// Videos tutoriales del módulo de votaciones, en el orden real de una asamblea. Se graban sobre la
// propiedad de demostración (datos ficticios): pnpm tutorials -g votaciones
// Los subtítulos son cortos; la voz (TUTORIAL_VOICE=1) explica más con el texto de `say`/`caption`.
const API = process.env.E2E_API_URL ?? "http://localhost:3060/api/v1";
const DEMO_ID = Number(process.env.DEMO_BUSINESS_ID ?? 134);
const GROUP = "Asamblea ordinaria 2027";
const VOTING = "¿Aprueba los estados financieros 2026?";
const PRESENT = ["T1-101", "T1-102", "T1-103", "T1-201"];

async function apiToken(request: import("@playwright/test").APIRequestContext) {
  const login = await request.post(`${API}/auth/login`, { data: { email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD } });
  const main = (await login.json()).data.token;
  const bt = await request.post(`${API}/auth/business-token`, { headers: { Authorization: `Bearer ${main}` }, data: { business_id: 0 } });
  return (await bt.json()).data.token as string;
}

async function openVoting(page: Page) {
  await prepare(page);
  await page.goto(`/properties/${DEMO_ID}/voting-groups`);
  await expect(page.getByRole("heading", { name: "Grupos de votación" })).toBeVisible({ timeout: 30_000 });
  await page.getByText(/Tu asamblea en Rupü|¿Cómo funciona\?/).first().waitFor({ timeout: 30_000 });
  markReady(page);
  await page.waitForTimeout(800);
}

async function groupCard(page: Page) {
  const group = page.getByRole("region", { name: `Grupo ${GROUP}` });
  await expect(group).toBeVisible({ timeout: 30_000 });
  const expand = group.getByRole("button", { name: `Expandir grupo ${GROUP}` });
  if (await expand.isVisible()) await tap(expand, 400);
  return group;
}

/** Abre Asistencia desde la tarjeta del grupo. El clic a veces se pierde (la página aún se está
 *  acomodando) o el panel se cierra al recargar: se reintenta hasta que quede abierto y estable. */
async function openAttendance(page: Page, group: import("@playwright/test").Locator) {
  const attendance = page.getByRole("dialog", { name: "Asistencia" });
  const ready = attendance.getByRole("switch", { name: `Presente ${PRESENT[0]}` });
  for (let i = 0; i < 4; i++) {
    if (!(await attendance.isVisible())) await tap(group.getByRole("link", { name: "Asistencia" }), i ? 200 : 700);
    try {
      await expect(ready).toBeVisible({ timeout: 15_000 });
      await page.waitForTimeout(1500);
      if (await ready.isVisible()) return attendance;
    } catch {
      /* se reintenta */
    }
  }
  throw new Error("No se pudo abrir Asistencia");
}

test.describe.serial("votaciones", () => {
  test.afterEach(async ({ page }, info) => saveNarration(page, info));

  test.beforeAll(async ({ request }) => {
    if (process.env.TUTORIAL_KEEP_DATA === "1") return; // re-grabar escenas sueltas sin borrar la asamblea
    const token = await apiToken(request);
    const h = { Authorization: `Bearer ${token}` };
    const res = await request.get(`${API}/horizontal-properties/voting-groups?business_id=${DEMO_ID}`, { headers: h });
    for (const g of ((await res.json()).data ?? []) as { id: number }[]) {
      await request.delete(`${API}/horizontal-properties/voting-groups/${g.id}?business_id=${DEMO_ID}`, { headers: h });
    }
    await request.put(`${API}/horizontal-properties/voting-billing/exemption?business_id=${DEMO_ID}`, { headers: h, data: { exempt: true } });
  });

  test("1-crear-asamblea", async ({ page }) => {
    await openVoting(page);
    await caption(page, "En <b>Votaciones</b> creas cada asamblea de tu conjunto", 1500,
      "Hola. Te muestro lo fácil que es preparar una asamblea en Rupü. Todo empieza aquí, en Votaciones: cada asamblea de tu conjunto es un grupo, con sus propias votaciones.");
    await tap(page.getByRole("button", { name: "+ Nuevo grupo" }).first());
    const dialog = page.getByRole("dialog", { name: "Nuevo grupo" });
    await caption(page, "Ponle un nombre a la asamblea", 600,
      "Le das a Nuevo grupo y le pones un nombre que todos reconozcan, por ejemplo, Asamblea ordinaria dos mil veintisiete.");
    await write(dialog.getByLabel("Nombre"), GROUP);
    await say(page, "En la descripción puedes poner el orden del día, así queda a la mano de todos.");
    await write(dialog.getByLabel("Descripción"), "Estados financieros, presupuesto y elección del consejo");
    await caption(page, "Elige la <b>fecha y hora</b> en que se va a votar", 1500,
      "Después eliges la fecha y la hora de la asamblea, que es cuando se va a votar.");
    await caption(page, "El <b>quórum</b> viene en 51% del coeficiente; puedes cambiarlo", 1500,
      "El quórum viene en el cincuenta y uno por ciento de los coeficientes. Si tu reglamento pide otra cosa, lo ajustas aquí mismo.");
    await tap(dialog.getByRole("button", { name: "Crear grupo" }));
    await expect(dialog).toBeHidden();
    await caption(page, "¡Listo! La asamblea quedó creada ✓", 1800,
      "Y listo. La asamblea queda creada, con su fecha y su quórum, y la guía de arriba te va diciendo cuál es el siguiente paso.");
    await finish(page);
  });

  test("2-agregar-votaciones", async ({ page }) => {
    await openVoting(page);
    const group = await groupCard(page);
    await caption(page, "Agrega una <b>votación</b> por cada punto del orden del día", 1500,
      "Ahora agregamos los puntos que se van a votar. Cada punto del orden del día es una votación dentro de la asamblea.");
    await tap(group.getByRole("button", { name: "+ Nueva votación" }));
    const dialog = page.getByRole("dialog", { name: "Nueva votación" });
    await say(page, "Escribe la pregunta tal como la vas a leer en la asamblea, y si quieres, un poco de contexto.");
    await write(dialog.getByLabel("Título"), VOTING);
    await write(dialog.getByLabel("Descripción"), "Se presentan los estados financieros del año");
    await caption(page, "Elige cómo se aprueba: por <b>mayoría</b> u otra regla", 1200,
      "Luego escoges cómo se aprueba: por mayoría, o con otras reglas, como la unanimidad.");
    await tap(dialog.getByRole("radio", { name: "Mayoría" }));
    await caption(page, "Las opciones <b>Sí, No y Abstención</b> ya vienen listas; puedes cambiarlas", 1800,
      "Las opciones Sí, No y Abstención ya vienen creadas. Si necesitas otras, por ejemplo para elegir entre varios candidatos, las cambias.");
    await tap(dialog.getByRole("button", { name: "Guardar votación" }));
    await expect(dialog).toBeHidden({ timeout: 20_000 });
    await caption(page, "La votación queda <b>lista</b> para abrirla el día de la asamblea ✓", 1800,
      "Guardas, y la votación queda lista. Ojo, no se abre sola: tú decides cuándo iniciarla el día de la asamblea.");
    await finish(page);
  });

  test("3-asistencia-y-qr", async ({ page }) => {
    await openVoting(page);
    const group = await groupCard(page);
    await caption(page, "En <b>Asistencia</b> marcas quién llegó a la asamblea", 1200,
      "Empecemos por la asistencia. Cuando cada propietario llega, lo marcas presente aquí. Ojo: solo puede votar la unidad que tenga asistencia, vote con su QR o a mano.");
    const attendance = await openAttendance(page, group);
    for (const unit of PRESENT) {
      const sw = attendance.getByRole("switch", { name: `Presente ${unit}` });
      await tap(sw, 350);
      await expect(sw).toHaveAttribute("aria-busy", "false", { timeout: 20_000 });
    }
    await caption(page, "El <b>quórum</b> se actualiza solo con el coeficiente de cada unidad ✓", 1800,
      "Con cada unidad presente, el quórum se recalcula solo, según el coeficiente de cada apartamento. Así sabes en todo momento si ya pueden empezar a votar.");
    await caption(page, "Si alguien no puede ir, registras su <b>apoderado</b>", 1500,
      "Y si un propietario no puede asistir, registras aquí mismo a su apoderado, que vota por él.");
    await caption(page, "¿No vota con QR? Registras su voto <b>a mano</b> en el panel en vivo", 1800,
      "Y si alguien no vota con su QR, no pasa nada: tú registras su voto a mano desde el panel en vivo, como verás en el video de votación en vivo.");
    await finish(page);
    await tap(attendance.getByRole("button", { name: "Cerrar asistencia" }));
  });

  test("4-credenciales-qr", async ({ page }, info) => {
    await openVoting(page);
    const group = await groupCard(page);
    await caption(page, "Cada propietario vota desde su celular con un <b>código QR</b>", 1200,
      "Ahora la forma más cómoda: que cada propietario vote desde su propio celular con un código QR, sin instalar nada.");
    await tap(group.getByRole("button", { name: "QR" }));
    const qr = page.getByRole("dialog", { name: GROUP });
    await expect(qr.getByRole("img", { name: new RegExp(`Código QR para votar en ${GROUP}`) })).toBeVisible({ timeout: 20_000 });
    await caption(page, "El QR de la asamblea: proyéctalo o compártelo por WhatsApp", 1800,
      "Este es el QR de la asamblea. Lo puedes proyectar en el salón o mandarlo al grupo de WhatsApp del conjunto.");
    await tap(qr.getByRole("button", { name: "Cerrar" }));
    await say(page, "Para que nadie vote por otro, cada unidad tiene su propia contraseña de votación. Se genera desde Asistencia.");
    const attendance = await openAttendance(page, group);
    const generate = attendance.getByRole("button", { name: "Generar contraseñas" });
    await expect(generate).toBeVisible({ timeout: 30_000 });
    await caption(page, "<b>Genera las contraseñas</b> de todas las unidades con un clic", 1200,
      "Le das a Generar contraseñas, y Rupü crea una clave distinta para cada unidad del conjunto.");
    await tap(generate);
    await expect(attendance.getByRole("button", { name: /Contraseñas ya generadas/ })).toBeVisible({ timeout: 30_000 });
    await caption(page, "Descarga el <b>PDF con los QR</b>: una tarjeta por unidad", 600,
      "Luego descargas el PDF. Trae una tarjeta por unidad, con el código QR, el número del apartamento, el nombre del propietario y su contraseña. Son ocho por hoja, listas para imprimir y recortar.");
    const download = page.waitForEvent("download");
    await tap(attendance.getByRole("button", { name: "Descargar PDF con QR" }));
    const pdf = path.join(info.outputDir, "credenciales.pdf");
    await (await download).saveAs(pdf);
    execFileSync("pdftoppm", ["-png", "-r", "70", "-f", "1", "-l", "1", "-singlefile", pdf, pdf.replace(/\.pdf$/, "")]);
    const png = readFileSync(pdf.replace(/\.pdf$/, ".png")).toString("base64");
    await showImage(page, `data:image/png;base64,${png}`);
    await caption(page, "Entrégalas en la <b>mesa de asistencia</b>", 1800,
      "Las entregas en la mesa de asistencia, cuando cada propietario llega y lo marcas presente.");
    await caption(page, "Escanea el QR, elige su unidad, escribe la contraseña y vota ✓", 1800,
      "Con su tarjeta, el propietario escanea el QR, elige su unidad, escribe la contraseña y vota desde el celular. Así cada voto queda a nombre de la unidad correcta.");
    await finish(page);
    await hideImage(page);
  });

  test("5-votacion-en-vivo", async ({ page }) => {
    await openVoting(page);
    const group = await groupCard(page);
    await caption(page, "El día de la asamblea, <b>inicia</b> la votación", 1200,
      "Llegó el día de la asamblea. Cuando se lea el punto, le das a Iniciar.");
    await tap(group.getByRole("button", { name: `Iniciar: ${VOTING}` }));
    await expect(page).toHaveURL(/\/votings\/\d+\/live$/, { timeout: 30_000 });
    await expect(page.getByText("EN VIVO")).toBeVisible({ timeout: 30_000 });
    await caption(page, "Los votos llegan <b>en vivo</b>, con el peso de su coeficiente", 1500,
      "En esta pantalla ves cada unidad del conjunto. Los votos llegan en vivo, y los porcentajes se calculan por coeficiente, no por número de personas.");
    const votes: [string, string][] = [["T1-101", "Sí"], ["T1-102", "Sí"], ["T1-103", "No"]];
    for (const [unit, option] of votes) {
      await tap(page.getByRole("button", { name: new RegExp(`^${unit} ·.*clic para registrar voto`) }), 400);
      const dialog = page.getByRole("dialog", { name: "Registrar voto" });
      await tap(dialog.getByRole("radio", { name: option }), 300);
      await tap(dialog.getByRole("button", { name: `Guardar: ${option}` }), 300);
      await expect(dialog).toBeHidden({ timeout: 20_000 });
      if (unit === "T1-101") await caption(page, "Quien no tenga celular vota aquí, con el administrador", 600,
        "Si alguien no tiene celular, o se le complica, tú registras su voto desde aquí, con un clic en su unidad.");
    }
    await caption(page, "Al terminar, <b>cierra</b> la votación", 1000, "Cuando ya votaron todos, cierras la votación.");
    await tap(page.getByRole("button", { name: "Cerrar votación" }));
    await tap(page.getByRole("dialog", { name: "¿Cerrar la votación?" }).getByRole("button", { name: "Cerrar y ver resultado" }));
    await expect(page.getByText(/CERRADA/).first()).toBeVisible({ timeout: 20_000 });
    await caption(page, "El resultado sale al instante, calculado por <b>coeficiente</b> ✓", 1800,
      "Y el resultado sale al instante: cuánto votó Sí, cuánto No, y si se alcanzó el quórum. Si no se alcanza, Rupü te lo avisa en rojo, como aquí.");
    await caption(page, "Descarga el <b>informe PDF</b> para el acta", 1800,
      "Desde la asamblea descargas el informe en PDF, con el detalle de cada voto, listo para anexarlo al acta.");
    await finish(page);
  });

  test("6-dias-de-votacion", async ({ page, request }) => {
    const token = await apiToken(request);
    await request.put(`${API}/horizontal-properties/voting-billing/exemption?business_id=${DEMO_ID}`, { headers: { Authorization: `Bearer ${token}` }, data: { exempt: false } });
    try {
      await openVoting(page);
      await caption(page, "Para recibir votos, el día de la asamblea debe estar <b>cubierto</b>", 1800,
        "Un detalle importante: para recibir votos, el día de la asamblea tiene que estar cubierto. Rupü te avisa aquí cuáles fechas te faltan.");
      await tap(page.getByRole("button", { name: "Comprar días" }));
      const dialog = page.getByRole("dialog", { name: "Comprar días de votación" });
      await caption(page, "Las fechas de tus asambleas ya vienen marcadas: <b>$50.000 por día</b>", 1800,
        "Las fechas de tus asambleas ya vienen marcadas. Cada día cuesta cincuenta mil pesos y cubre todas las votaciones de ese día.");
      await caption(page, "Pagas con Nequi, PSE o tarjeta en Wompi y queda listo al instante", 1500,
        "Pagas con Nequi, PSE o tarjeta, a través de Wompi, y el día queda activo apenas se aprueba el pago.");
      await tap(dialog.getByRole("button", { name: "Cancelar" }));
      await caption(page, "Si haces varias asambleas, el <b>mes ilimitado</b> o un plan te sale mejor", 1500,
        "Si vas a hacer varias asambleas en el mes, te sale mejor el mes ilimitado, por doscientos mil pesos.");
      await tap(page.getByRole("link", { name: "Planes para administradoras" }));
      await expect(page.getByRole("heading", { name: "Planes de votaciones" })).toBeVisible({ timeout: 30_000 });
      await caption(page, "Las administradoras cubren <b>varios conjuntos</b> con un solo pago", 1800,
        "Y si administras varios conjuntos, con un plan de administradora los cubres todos con un solo pago: desde trescientos mil pesos al mes por tres conjuntos.");
      await finish(page);
    } finally {
      await request.put(`${API}/horizontal-properties/voting-billing/exemption?business_id=${DEMO_ID}`, { headers: { Authorization: `Bearer ${token}` }, data: { exempt: true } });
    }
  });
});
