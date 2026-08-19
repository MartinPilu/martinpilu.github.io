# SACP - Definicion visual

Este documento define el lenguaje visual inicial de SACP a partir de la referencia compartida: un panel de gestion administrativo, claro y denso, pensado para que el Consejo pueda revisar el estado del consorcio rapidamente.

La referencia se usa como direccion visual y de experiencia, no como una copia literal de marca, textos o contenido. Las decisiones de este documento complementan los requerimientos de [Design_Requirements.md](Design_Requirements.md).

## Direccion visual

SACP debe transmitir:

- claridad y control sobre la informacion del consorcio;
- seriedad institucional sin parecer un sistema contable antiguo;
- baja friccion para usuarios con distintos niveles de alfabetizacion tecnologica;
- densidad suficiente para gestionar muchos datos, manteniendo separacion y jerarquia;
- confianza mediante estados visibles, totales claros y acciones previsibles.

La interfaz es de tipo **backoffice operativo**. No se busca una experiencia de marketing ni una pantalla dominada por grandes ilustraciones: el contenido, los estados y las acciones de gestion son el foco.

## Estructura de la aplicacion

### Navegacion principal

El patron base es un **menu lateral izquierdo persistente** en escritorio y tablet ancha.

- Ancho de referencia: 208 px.
- Fondo blanco, borde derecho sutil y separadores entre grupos.
- Cada item combina icono lineal y etiqueta textual.
- El item activo usa fondo azul muy claro, texto azul oscuro y una marca lateral azul.
- Los contadores de pendientes se muestran como badges pequenos junto al item correspondiente.
- El menu se construye segun el rol; no se muestran acciones que el rol no puede ejecutar.
- En etapas posteriores, en celular se transformara en una barra superior con boton de menu o en un panel deslizable. Nunca debe reducir el area de trabajo a una columna ilegible.

Grupos sugeridos para el rol Consejo:

1. **Resumen**.
2. **Casos**: reclamos, tareas, mantenimientos, reparaciones y mejoras.
3. **Planificacion**: calendario y presupuesto por periodo.
4. **Unidades funcionales**.
5. **Comunicados** y boletin oficial.
6. **Documentos**.
7. **Usuarios** y solicitudes pendientes, solo si el rol tiene permiso.
8. **Ayuda** y configuracion secundaria.

El orden puede ajustarse con evidencia de uso, pero Resumen y Casos deben permanecer como accesos de alta prioridad para el Consejo.

### Dashboard de resumen

El dashboard es el punto de entrada neutro definido para SACP. La referencia sugiere esta composicion:

- cabecera compacta con nombre del consorcio, contexto de la vista y acciones globales;
- contenido en dos columnas en escritorio;
- columna principal para indicadores y trabajo proximo;
- columna secundaria para pendientes financieros, proveedores y avisos;
- paneles apilados con titulo, enlace contextual y filas de datos;
- fondo general gris muy claro para separar el area de trabajo de los paneles blancos.

El dashboard no reemplaza al listado de casos. Debe resumir actividad y pendientes, pero el acceso a **Casos** lleva directamente al listado plano con filtros definido en los requerimientos.

## Sistema de layout

- Contenedor de trabajo con padding de 24 px en escritorio.
- Grilla de dos columnas: aproximadamente 1fr 1fr, con separacion de 8 a 16 px.
- Los paneles pueden ocupar una o ambas columnas cuando la informacion lo requiera.
- La altura de filas, botones e inputs debe ser estable para que la carga de datos no produzca saltos visuales.
- El contenido debe poder desplazarse sin perder las acciones principales. El sidebar puede permanecer fijo en escritorio.

### Paneles

Los paneles son el componente principal del dashboard y de las vistas de consulta.

- Fondo blanco.
- Borde de 1 px en gris azulado claro.
- Radio pequeno, entre 6 y 8 px como maximo.
- Sin sombras fuertes ni tarjetas anidadas.
- Titulo de 14 a 16 px, peso semibold.
- Cabecera separada del contenido por una linea horizontal.
- Enlaces secundarios alineados a la derecha, con texto subrayado o affordance equivalente.
- Las filas usan separadores finos y padding vertical suficiente para lectura y toque.

No se deben usar paneles decorativos para envolver cada seccion de una pagina. En vistas operativas, un panel existe cuando ayuda a agrupar informacion o una accion concreta.

## Tipografia

La tipografia debe ser sans serif, legible y con buena distincion entre numeros y letras. Se recomienda definir una familia principal del producto y una alternativa local de respaldo, evitando depender de una tipografia del sistema sin declararla.

Escala inicial:

| Uso | Tamano | Peso |
| --- | ---: | ---: |
| Titulo de pagina | 24 px | 600 |
| Titulo de panel | 16 px | 600 |
| Texto principal | 14 px | 400 |
| Texto de fila y controles | 13-14 px | 400 |
| Texto auxiliar | 12 px | 400 |
| Totales y cifras destacadas | 14-16 px | 600 |

Los textos deben usar lenguaje directo y consistente con el glosario del proyecto. Las cifras monetarias se alinean a la derecha y usan separadores locales de miles, por ejemplo `$ 1.458.183`.

## Color

La paleta inicial toma de la referencia el contraste entre azul institucional, superficies blancas y un fondo neutro.

| Token | Valor inicial | Uso |
| --- | --- | --- |
| `brand-700` | `#123f97` | foco de marca, item activo y acciones primarias |
| `brand-600` | `#1d55b3` | enlaces, controles activos y foco |
| `brand-050` | `#eef4ff` | fondo de seleccion y estados informativos |
| `surface-0` | `#ffffff` | paneles, sidebar y controles |
| `surface-050` | `#f5f7f9` | fondo general de la aplicacion |
| `border` | `#d7dee8` | bordes y separadores |
| `text-900` | `#1b2738` | titulos y datos principales |
| `text-600` | `#65748a` | etiquetas y contenido secundario |
| `success` | `#257a52` | resuelto, confirmado y disponible |
| `warning` | `#a96800` | pendiente, atencion requerida |
| `danger` | `#d62828` | vencido, error o accion destructiva |

El color nunca debe ser la unica forma de comunicar un estado: siempre se acompana con texto, icono o ambos. El rojo queda reservado para situaciones que requieren atencion, como pagos vencidos o errores.

## Iconografia y controles

- Iconos lineales, simples y consistentes, preferentemente de una biblioteca existente.
- Los iconos de navegacion deben tener un tamano estable de 18 a 20 px.
- Los botones de accion usan icono cuando existe un simbolo reconocible y agregan texto cuando la accion puede ser ambigua.
- Los tooltips se reservan para iconos cuyo significado no sea evidente.
- Los filtros se presentan como controles visibles, no escondidos detras de menus innecesarios.
- Acciones irreversibles requieren confirmacion explicita y una descripcion clara del efecto.

## Estados visuales

### Casos

Los estados definidos en la arquitectura tienen etiquetas visibles en listados y detalle:

| Estado | Tratamiento |
| --- | --- |
| Nuevo | azul informativo |
| Asignado | azul medio |
| En progreso | amarillo/ambar |
| Pendiente | naranja |
| Resuelto | verde |
| Cerrado | gris neutro |

La etiqueta incluye el nombre completo del estado. El historial del caso se representa como una linea de tiempo con evento, persona, fecha y cambio realizado.

### Sistema y datos

Todas las vistas deben contemplar carga, vacio, error, exito, confirmacion y falta de permisos. Los mensajes son accionables y comprensibles. Por ejemplo, un estado vacio debe explicar que todavia no hay registros y ofrecer una accion solo cuando el rol pueda ejecutarla.

Los datos privados se marcan con candado y el texto `Dato privado` cuando corresponde informar que existen pero no son visibles para el usuario actual.

## Alcance responsive y accesibilidad practica

La etapa 1 se especifica para escritorio y tablet ancha, que son los formatos prioritarios para la operacion del Consejo. La adaptacion mobile queda prevista para una etapa posterior y no forma parte de los criterios de implementacion iniciales.

- La estructura debe conservar puntos claros de adaptacion para una futura version mobile.
- Objetivos tactiles de al menos 44 px para controles principales.
- Contraste suficiente entre texto, fondo, bordes y estados.
- Foco de teclado visible y orden de tabulacion coherente.
- Los textos largos deben envolver sin superponerse ni cortar informacion esencial en los formatos incluidos en esta etapa.
- Los numeros, totales y fechas deben conservar alineacion y formato en escritorio y tablet ancha.

## Aplicacion por pantalla

| Pantalla | Composicion visual |
| --- | --- |
| Resumen | Dashboard de dos columnas con paneles de pendientes, actividad, agenda y avisos |
| Casos | Listado plano, filtros visibles, estados, unidad, responsable y fecha |
| Detalle de caso | Cabecera con estado y acciones, datos principales, timeline y galeria de evidencias |
| Unidad funcional | Informacion general por secciones, datos privados marcados, casos y usuarios asociados |
| Planificacion | Calendario y resumen de presupuesto por periodo, con totales destacados |
| Boletin oficial | Feed cronologico de publicaciones completas, con filtros por naturaleza |
| Documentos | Lista simple agrupada por tipo, con descarga directa |
| Usuarios y pendientes | Listados de administracion con badges, filtros y confirmaciones |

## Criterio de aceptacion visual

Una implementacion cumple esta definicion cuando:

1. La persona puede identificar donde esta y que pendientes requieren atencion sin interpretar iconos aislados.
2. El dashboard permite acceder en un paso a Casos, Planificacion, Unidades, Boletin y Documentos segun el rol.
3. Los totales y estados se distinguen por jerarquia, texto y color.
4. La misma informacion sigue siendo legible en celular sin superposiciones ni controles imposibles de tocar.
5. Los estados de carga, vacio, error, exito y permisos tienen una respuesta visible y comprensible.

## Documentos relacionados

- [Plan de diseno](Design_Plan.md)
- [Requerimientos de diseno](Design_Requirements.md)
- [Arquitectura de datos y sistema](Architecture.md)