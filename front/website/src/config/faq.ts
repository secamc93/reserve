// Preguntas frecuentes: se muestran en la página y se publican como FAQPage (JSON-LD).
export const FAQ: { q: string; a: string }[] = [
  {
    q: '¿Qué es Rupü?',
    a: 'Rupü es un software de votaciones para asambleas de propiedad horizontal. Registra la asistencia, calcula el quórum por coeficiente, deja votar a cada unidad desde el celular y muestra el resultado en vivo apenas se cierra cada punto.',
  },
  {
    q: '¿Los propietarios tienen que instalar una aplicación?',
    a: 'No. Escanean el código QR que se proyecta en la asamblea, ingresan la contraseña de voto de su unidad y votan desde el navegador del celular.',
  },
  {
    q: '¿Cómo se calcula el resultado por coeficiente?',
    a: 'Cada voto pesa lo que pesa el coeficiente de copropiedad de la unidad. Rupü suma los coeficientes de cada opción y muestra el porcentaje sobre el total, como lo pide el régimen de propiedad horizontal.',
  },
  {
    q: '¿Qué pasa con los apoderados?',
    a: 'El administrador registra los poderes y el apoderado vota por cada unidad que representa. Su voto suma el coeficiente de todas esas unidades.',
  },
  {
    q: '¿Y si alguien no tiene celular?',
    a: 'El administrador puede registrar el voto de esa unidad desde el panel, y queda marcado en el detalle de la votación.',
  },
  {
    q: '¿Sirve para asambleas virtuales o mixtas?',
    a: 'Sí. Se vota igual desde la sala o desde la casa: lo único que hace falta es el enlace o el QR y la contraseña de la unidad.',
  },
  {
    q: '¿Se puede ver cómo votó cada vecino?',
    a: 'Los resultados que se proyectan muestran los totales por opción, no el voto de cada unidad. El detalle queda en el informe del administrador para soportar el acta.',
  },
  {
    q: '¿Cuánto cuesta?',
    a: 'Desde $50.000 COP por día de votación. Sin alquiler de controles, sin equipos y sin cobro por hora extra.',
  },
];
