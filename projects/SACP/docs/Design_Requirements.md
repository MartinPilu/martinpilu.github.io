# SACP - Requerimientos de diseño

La definicion visual concreta de la plataforma, basada en la referencia del dashboard, vive en [Visual_Design.md](Visual_Design.md). Este documento conserva los requerimientos de experiencia, arquitectura de informacion y comportamiento.

Este documento reúne los requerimientos de diseño de la plataforma. Complementa el [Plan de diseño](Design_Plan.md), que contiene la visión, el glosario, los principios generales y el alcance inicial del MVP.

Los requerimientos de esta sección deberán traducir las necesidades generales del proyecto a decisiones concretas sobre la experiencia y la interfaz. Se definirán progresivamente a partir de los requerimientos funcionales y de las prioridades del MVP.

## Criterios a definir

- Valores concretos del sistema visual (paleta de colores, tipografía, iconografía) — definidos inicialmente en [Visual_Design.md](Visual_Design.md).
- Patrón visual de navegación — sidebar persistente en escritorio/tablet y navegación colapsable en celular, definido en [Visual_Design.md](Visual_Design.md).

## Arquitectura de información y navegación

La entrada a la plataforma es un **dashboard neutro**: no prioriza casos ni unidades funcionales como punto de partida único, sino que ofrece accesos directos a los módulos definidos en [Architecture.md](Architecture.md):
- Casos (listado y gestión).
- Unidades funcionales.
- Planificación (calendario y presupuesto por período).
- Boletín oficial.
- Documentos.
- Usuarios (solo visible para quien tiene permiso).

**El menú principal varía según el rol** (no es un único menú que oculta opciones):
- **Consejo**: acceso completo a todos los módulos, incluida la gestión de casos, unidades, usuarios, planificación/finanzas, boletín y documentos.
- **Administración**: menú acotado a sus herramientas de autogestión — adjuntar documentos a casos existentes y enviar comunicados al Consejo (ver [Architecture.md](Architecture.md#autogestión)).
- **Propietario / Inquilino**: menú reducido con su unidad, el listado de casos (lectura), el boletín oficial y los documentos públicos, más la acción de autogestión para crear un caso a evaluar (el Propietario, además, puede solicitar el alta de un inquilino).

El **patrón visual de navegación** (menú lateral, superior, u otro) queda pendiente de definir junto con el sistema visual, priorizando que funcione bien en celular.

## Pantallas y flujos principales del consejo de propietarios

Flujos prioritarios para el Consejo, en orden de frecuencia esperada de uso:

1. **Gestionar un caso**: alta, cambio de estado (incluyendo retrocesos), cierre, y agregar adjuntos/comentarios/evidencias. Punto de entrada: el **listado de casos** (no un dashboard de alertas); desde ahí se accede al detalle de un caso puntual o se crea uno nuevo.
2. **Revisar y validar solicitudes de autogestión**: altas de inquilino solicitadas por un Propietario, y casos creados por autogestión pendientes de validación (ver [Architecture.md](Architecture.md#autogestión)).
3. **Consultar una unidad funcional**: ver sus datos públicos y privados, y los casos asociados a esa unidad.
4. **Planificar**: ver el calendario de casos por fecha de ejecución, definir períodos y consultar el presupuesto requerido por período (ver [Architecture.md](Architecture.md#planificación)).
5. **Publicar en el boletín oficial**: redactar una publicación de texto, eligiendo naturaleza y roles destino (ver [Architecture.md](Architecture.md#notificaciones)).
6. **Dar de alta un usuario**: alta directa, sin necesidad de validación adicional (ver [Architecture.md](Architecture.md#1-usuarios-y-roles)).

El flujo más frecuente (gestión de casos) define el punto de entrada natural al entrar al módulo de Casos desde el dashboard: el listado, no un resumen de alertas. Las solicitudes de autogestión pendientes de validar sí deberían tener alguna señal visible (badge/contador) para que el Consejo no las pierda de vista, a definir en el detalle visual del dashboard.

## Jerarquía y visualización de casos o tickets

El listado principal de casos es una **lista plana con filtros** (por estado, tipo y unidad funcional), no agrupada visualmente en columnas ni por unidad — prioriza simplicidad sobre una vista tipo kanban.

- **Orden por defecto**: por estado, mostrando primero los casos abiertos/urgentes (ej. nuevo, asignado, en progreso, pendiente) antes que los resueltos o cerrados.
- **Datos visibles en cada fila/tarjeta** (sin entrar al detalle del caso): estado, tipo, unidad funcional asociada, responsable, y fecha de ejecución/vencimiento. El presupuesto no se muestra en el listado; se accede a él en el detalle del caso o desde el dashboard de planificación.
- Los filtros deben permitir combinar estado + tipo + unidad, dado que el Consejo puede necesitar ver, por ejemplo, todos los reclamos abiertos de una unidad puntual.

## Visualización de la información por unidad funcional

La vista de detalle de una unidad funcional se organiza en secciones, no en una lista plana de campos:
- **Información general**: datos públicos siempre visibles (identificación, coeficiente, estado de ocupación) y datos privados visibles solo para los usuarios asociados y el Consejo/Administración (ver [Architecture.md](Architecture.md#2-unidades-funcionales)). Los campos privados deben marcarse visualmente (ej. ícono de candado) para que quede claro qué información no ven otros.
- **Casos asociados**: listado de casos filtrado a esa unidad, reutilizando el mismo componente de listado definido en [Jerarquía y visualización de casos o tickets](#jerarquía-y-visualización-de-casos-o-tickets).
- **Usuarios asociados**: propietarios e inquilinos vinculados a la unidad.

## Diseño de comunicados, publicaciones y documentos

- **Boletín oficial**: se presenta como un **feed cronológico** de publicaciones (más reciente primero), filtrable por naturaleza/categoría. Cada publicación muestra su texto completo sin necesidad de navegar a otra pantalla (no es un listado de títulos que requiere abrir cada uno).
- **Documentos**: el repositorio general (reglamento de copropiedad, actas de asamblea) se presenta como una lista simple agrupada por tipo de documento, con descarga directa. No necesita jerarquía de carpetas para el MVP.

## Gestión visual de estados, responsables, fechas y evidencias

- El **estado** de un caso se muestra siempre como una etiqueta de color distintivo (ej. nuevo, en progreso, resuelto, cerrado con colores diferenciados), visible tanto en el listado como en el detalle.
- El **detalle de un caso** presenta el historial como una **línea de tiempo** (reflejo directo del event log definido en [Architecture.md](Architecture.md#3-casos-o-tickets)): cada evento muestra qué cambió, quién lo hizo y cuándo, incluyendo retrocesos de estado.
- Las **evidencias fotográficas** se muestran como una galería de miniaturas dentro del detalle del caso, no como enlaces de descarga.
- El **responsable** de un caso se identifica siempre por nombre visible (no solo un ID o iniciales), tanto en el listado como en el detalle.

## Flujos de alta, acceso y validación de usuarios

- **Acceso**: inicio de sesión con mail y contraseña; el alta de un usuario requiere verificación de mail antes de poder ingresar (ver [Architecture.md](Architecture.md#seguridad-cumplimiento-y-accesibilidad)).
- **Alta directa (Consejo)**: formulario simple para cargar un nuevo usuario y asociarlo a una o más unidades y roles.
- **Alta por autogestión (Propietario)**: formulario para solicitar un nuevo inquilino asociado a su unidad; la solicitud entra a una **cola de pendientes de validación** visible para el Consejo (con el badge/contador ya mencionado en [Pantallas y flujos principales del consejo de propietarios](#pantallas-y-flujos-principales-del-consejo-de-propietarios)), y el Consejo aprueba o rechaza desde ahí.

## Permisos visibles y protección de datos privados

- Los campos de datos privados (unidad, usuario) deben marcarse visualmente cuando existen pero no son accesibles para el usuario actual (ícono de candado + texto "dato privado"), en vez de simplemente omitirlos sin explicación — esto ayuda a que el usuario entienda que hay más información sin exponerla.
- Las acciones no permitidas para un rol (ej. cerrar un caso, para Propietario) no deben aparecer como botones deshabilitados confusos: directamente no se muestran, siguiendo el criterio ya definido de menú distinto por rol.

## Accesibilidad para usuarios con distintos niveles de alfabetización tecnológica

Sin adoptar un estándar formal (ver [Architecture.md](Architecture.md#seguridad-cumplimiento-y-accesibilidad)), se aplican estos criterios prácticos:
- Lenguaje simple y directo, evitando jerga técnica en textos de la interfaz.
- Tamaños de fuente y objetivos de toque (botones, links) grandes, pensando en usuarios de mayor edad.
- Acciones importantes (cerrar un caso, dar de alta un usuario) siempre confirmadas explícitamente antes de ejecutarse, nunca automáticas o irreversibles sin aviso.

## Diseño responsive para computadoras, tablets y celulares

Se prioriza **mobile-first** para Propietarios e Inquilinos (su uso más probable es desde el celular: ver el boletín, sus casos, su unidad). El Consejo y Administración necesitan que los flujos de gestión (listados con filtros, calendario de planificación) funcionen también en tablet y celular, aunque su uso más frecuente sea desde computadora.

## Estados de interfaz: carga, vacío, error, éxito, confirmación y falta de permisos

- **Carga**: indicador simple (spinner o esqueleto), sin bloquear el resto de la pantalla si no es necesario.
- **Vacío**: mensaje claro en lenguaje simple (ej. "Todavía no hay casos cargados"), con una acción sugerida si corresponde (ej. "Crear un caso").
- **Error**: mensaje en lenguaje simple, sin jerga técnica ni códigos de error, con una acción para reintentar.
- **Éxito**: confirmación visible y persistente (no solo un toast fugaz), dado el criterio de accesibilidad para usuarios con distinta alfabetización tecnológica.
- **Confirmación**: diálogo explícito antes de acciones importantes o irreversibles (cerrar un caso, dar de alta un usuario, rechazar una solicitud de autogestión).
- **Falta de permisos**: mensaje claro indicando que la acción o el dato no está disponible para el rol actual, no un error genérico.

## Reglas de diseño

Las reglas concretas se incorporarán cuando se definan los requerimientos funcionales de cada módulo. Cada regla debería indicar:

1. Qué problema de usuario resuelve.
2. A qué rol o roles afecta.
3. En qué pantalla o flujo aplica.
4. Qué comportamiento se espera.
5. Cómo se comprobará que el diseño cumple el requerimiento.

## Documentos relacionados

- [Plan de diseño](Design_Plan.md)
- [Requerimientos del proyecto SACP](../README.md)