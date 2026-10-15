import { describe, expect, it } from "vitest";
import { BUSINESS_TYPE_CONFIG, getBusinessTypeConfig } from "./business-type-config";

describe("BUSINESS_TYPE_CONFIG", () => {
  it("solo define el tipo horizontal_property (Rupü quedó enfocado en propiedad horizontal)", () => {
    expect(Object.keys(BUSINESS_TYPE_CONFIG)).toEqual(["horizontal_property"]);
  });

  it("propiedad horizontal tiene home en /properties y la entrada de Votaciones", () => {
    const config = BUSINESS_TYPE_CONFIG.horizontal_property;
    expect(config.label).toBe("Propiedad Horizontal");
    expect(config.homeRoute).toBe("/properties");
    const voting = config.sidebarItems.find((item) => item.label === "Votaciones");
    expect(voting?.href).toBe("/properties/{businessId}/voting-groups");
  });

  it("todas las rutas del sidebar cuelgan de /properties/{businessId} y tienen icono", () => {
    for (const item of BUSINESS_TYPE_CONFIG.horizontal_property.sidebarItems) {
      expect(item.href.startsWith("/properties/{businessId}")).toBe(true);
      expect(item.iconPath.length).toBeGreaterThan(0);
    }
  });

  it("no repite etiquetas ni rutas en el sidebar", () => {
    const items = BUSINESS_TYPE_CONFIG.horizontal_property.sidebarItems;
    expect(new Set(items.map((i) => i.label)).size).toBe(items.length);
    expect(new Set(items.map((i) => i.href)).size).toBe(items.length);
  });
});

describe("getBusinessTypeConfig", () => {
  it("devuelve la config de horizontal_property", () => {
    expect(getBusinessTypeConfig("horizontal_property")).toBe(BUSINESS_TYPE_CONFIG.horizontal_property);
  });

  it.each(["restaurant", "sport_training", "", "HORIZONTAL_PROPERTY"])(
    "devuelve undefined para el tipo no soportado %j",
    (code) => {
      expect(getBusinessTypeConfig(code)).toBeUndefined();
    },
  );
});
