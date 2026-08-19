# SACP - Arquitectura de datos y sistema

Este documento complementa el [Plan de diseño](Design_Plan.md) y define cómo se organiza la información y la lógica de la plataforma. No es un documento de implementación: define el modelo conceptual, no el motor técnico final (lenguaje, framework, base de datos concreta).

## Índice

1. [Principio general](#principio-general)
2. [Config file del consorcio](#config-file-del-consorcio)
3. [Bases de datos](#bases-de-datos)
4. [Roles y permisos](#roles-y-permisos)
5. [Autogestión](#autogestión)
6. [Planificación](#planificación)
7. [Notificaciones](#notificaciones)
8. [Documentos](#documentos)
9. [Integraciones](#integraciones)
10. [Seguridad, cumplimiento y accesibilidad](#seguridad-cumplimiento-y-accesibilidad)
11. [Concurrencia](#concurrencia)
12. [Temas que quedan pendientes de este documento](#temas-que-quedan-pendientes-de-este-documento)

## Principio general

La plataforma se divide en dos capas:

1. **Config files**: describen al consorcio en sí (identidad, estructura). Cambian con muy poca frecuencia, normalmente por una acción administrativa puntual (alta de un consorcio, alta/baja de una unidad funcional).
2. **Engine**: la lógica de la plataforma (reglas, permisos, flujos de casos, notificaciones). Es código, no dato, y es el mismo para todos los consorcios.

Entre ambas capas viven las **bases de datos**, que contienen la información que cambia con el uso diario de la plataforma.

Se elige un modelo de **datos estructurados tipo documento (JSON)** en lugar de tablas relacionales clásicas, porque:
- El MVP es de un solo consorcio, con volumen de datos chico y sin necesidad de consultas analíticas complejas.
- El formato documento es legible y versionable (se puede llevar en control de versiones como cualquier archivo de texto), lo cual encaja con la idea de "historia clínica del consorcio".
- Cada entidad puede evolucionar su esquema sin migraciones formales.

Esta decisión es conceptual: el motor de persistencia real (archivos `.json`, una base documental, o incluso una base relacional con columnas JSON) se define más adelante, en la etapa de implementación. Lo que este documento fija es el **modelo de datos**, no el motor.

## Config file del consorcio

Contiene la identidad y estructura fija del consorcio:
- Nombre y datos identificatorios del consorcio.
- Listado de unidades funcionales que lo componen (referencia, no el detalle completo — el detalle vive en la base de unidades funcionales).
- Espacios comunes.
- Parámetros generales de la plataforma para ese consorcio (a definir según necesidades futuras: por ejemplo moneda, zona horaria, textos institucionales).

Al ser un MVP de un solo consorcio, este archivo es único. Si en el futuro se soporta más de un consorcio, cada uno tendría su propio config file y su propio conjunto de bases de datos (aislamiento por consorcio).

## Bases de datos

### 1. Usuarios y roles

Registro de personas que interactúan con la plataforma (propietarios, inquilinos, consejo, administración), separado de las unidades funcionales.

- Cada usuario es una entidad independiente con datos de contacto y credenciales de acceso.
- La relación entre usuario y unidad funcional es muchos-a-muchos (una persona puede estar asociada a más de una unidad; una unidad puede tener más de un usuario asociado — ej. copropietarios).
- El rol (propietario, inquilino, consejo, administración) determina permisos; ver [Roles y permisos](#roles-y-permisos).
- Al modelar la relación como documentos (no tablas con FK), la referencia se guarda como IDs cruzados en ambos lados (usuario → unidades asociadas, unidad → usuarios asociados). El engine es responsable de mantener esa consistencia al crear o modificar asociaciones.

**Alta y validación**: el **Consejo** da de alta usuarios directamente (alta administrativa, sin validación adicional). El **Propietario** puede, mediante herramientas de autogestión, solicitar el alta de un nuevo inquilino asociado a su unidad; esa solicitud queda pendiente hasta que el Consejo la valide y confirme. El mismo patrón de "solicitud del propietario + validación del Consejo" aplica a la creación de nuevos casos por autogestión (ver [Casos o tickets](#3-casos-o-tickets)).

### 2. Unidades funcionales

Registro de las unidades del consorcio, según lo ya definido en el alcance del MVP:
- Identificación de la unidad.
- Coeficiente de copropiedad.
- Cocheras y bauleras asociadas.
- Estado de ocupación.
- Referencias a los usuarios asociados (propietarios, inquilinos) — ver relación en la base de usuarios.

Los espacios comunes del consorcio se consideran una extensión de este mismo store conceptual (no están atados a una unidad funcional particular).

**Datos públicos y privados**: cada unidad separa sus datos en dos grupos. Los **datos públicos** son visibles para cualquier propietario o inquilino del consorcio (ej. identificación de la unidad, coeficiente, estado de ocupación). Los **datos privados** solo son visibles para los usuarios asociados a esa unidad y para el Consejo/Administración (ej. datos de contacto, información sensible). Esta distinción es un atributo por campo dentro del documento de la unidad, no un store separado.

### 3. Casos o tickets

Registro de casos relacionados con unidades funcionales o espacios comunes:
- Estado del caso (nuevo, asignado, en progreso, pendiente, resuelto, cerrado).
- Responsable, fechas límite, presupuesto, proveedor, adjuntos, comentarios, evidencias fotográficas.
- Fecha de ejecución prevista y presupuesto asignado, usados para la planificación (ver [Planificación](#planificación)).
- Una o más **fechas de pago** asociadas al presupuesto asignado, independientes de la fecha de ejecución (un caso puede ejecutarse en un momento y pagarse en cuotas o en una fecha distinta).
- Referencia a la unidad funcional (o espacio común) involucrada.

**Tipo de caso**: reclamos, tareas, mantenimientos, reparaciones y mejoras no son stores separados: son el mismo store con un campo **tipo**. Todos comparten la misma estructura (estado, responsable, fechas, presupuesto, proveedor, adjuntos, comentarios, evidencias), priorizando simplicidad y accesibilidad por sobre modelar diferencias particulares de cada tipo. El campo tipo solo sirve para clasificar y filtrar, no habilita campos o flujos distintos por ahora.

**Historial y auditoría**: dado que un caso es, por naturaleza, algo que cambia de estado a lo largo del tiempo, se modela como un **registro de eventos** (event log) en lugar de un documento que se sobrescribe en cada cambio. Cada cambio de estado, comentario o adjunto se agrega como una entrada nueva asociada al caso, preservando el historial completo sin necesidad de un mecanismo de auditoría separado. El documento "caso" resume el estado actual; la lista de eventos reconstruye el historial.

**Transiciones de estado**: no hay un flujo estrictamente lineal ni restricciones de avance/retroceso entre los estados (nuevo, asignado, en progreso, pendiente, resuelto, cerrado); se permite retroceder un caso a un estado anterior (ej. de "resuelto" a "en progreso" si reaparece el problema). Cada cambio de estado, avance o retroceso, se registra como un evento en el log del caso (estado anterior, estado nuevo, quién lo hizo, cuándo y motivo si corresponde), de modo que la trazabilidad se mantiene sin importar la dirección del cambio.

**Gestión y aprobaciones**: por ahora, el **Consejo** es el único rol habilitado para gestionar casos (alta, modificación y cierre, incluyendo cambios de estado). No hay un flujo de aprobación adicional (de Administración o asamblea) sobre los casos en el MVP: la gestión del consejo es suficiente para cerrar un caso. Otros roles (Propietario, Inquilino, Administración) podrán tener acceso de lectura o de reporte, a definir en la matriz de acciones por rol.

**Alta por autogestión**: el Propietario puede solicitar la creación de un nuevo caso mediante herramientas de autogestión; la solicitud queda en un estado inicial pendiente de validación del Consejo antes de convertirse en un caso gestionado normalmente (mismo patrón que el alta de inquilinos, ver [Usuarios y roles](#1-usuarios-y-roles)).

## Roles y permisos

Roles base del MVP, tomados del glosario del Plan de diseño: **Propietario**, **Inquilino**, **Consejo** (miembro del consejo de propietarios) y **Administración**.

- Un usuario puede tener más de un rol simultáneamente (ej. un propietario que también es miembro del consejo). Por lo tanto, en el modelo de datos el rol no es un campo único del usuario sino una **lista de roles** asociada al usuario.
- Los roles pueden aplicar de forma general (ej. "Administración") o estar acotados a una o más unidades funcionales (ej. "Propietario" solo tiene sentido en relación a la unidad que le corresponde). El rol de Consejo y Administración son roles a nivel de consorcio, no de unidad.
- Los permisos por rol son **fijos y definidos por el engine** (parte del producto), no configurables por el consorcio. Esto simplifica el modelo: no hace falta una base de datos de permisos, solo una tabla/mapa fijo en el código que vincula rol → acciones permitidas.
- **Propietario e Inquilino**: acceso de lectura a todos los casos del consorcio, a todos los datos (públicos y privados) de su propia unidad, y solo a los datos públicos de las demás unidades. No gestionan casos (ver [gestión de casos](#3-casos-o-tickets)).
- Queda pendiente definir la **matriz concreta de acciones por rol** (qué puede hacer cada rol sobre casos, unidades, comunicados, etc.), una vez que se listen las acciones de gestión disponibles.

## Autogestión

La autogestión es la **interfaz entre Administración y Propietarios/Inquilinos**: un conjunto acotado de acciones que estos roles pueden ejecutar directamente sobre la plataforma, sin depender de que el Consejo lo haga por ellos. Para el MVP se arranca con el mínimo indispensable:

**Administración**:
- Adjuntar documentos a un caso existente (ej. presupuestos). Se agrega como un evento más en el log del caso (ver [Casos o tickets](#3-casos-o-tickets)), no modifica el estado del caso.
- Enviar comunicados o documentos al Consejo. Es un canal en sentido inverso al de comunicados del Consejo/Administración hacia propietarios (ya contemplado en el alcance del MVP); no está atado a un caso en particular.

**Propietarios**:
- Crear un caso para evaluar (ver [Alta por autogestión](#3-casos-o-tickets)): el propietario carga la solicitud, el Consejo la valida antes de que se convierta en un caso gestionado.

El resto de acciones de autogestión (para Inquilinos, y otras acciones de Administración o Propietarios más allá de este mínimo) quedan pendientes de definir a futuro.

## Planificación

Herramienta básica para el MVP: cada caso puede tener una **fecha de ejecución** y un **presupuesto asignado**, y este último puede tener una o más **fechas de pago** independientes de la ejecución (campos ya definidos en [Casos o tickets](#3-casos-o-tickets), no requieren un store nuevo). Un dashboard de planificación consulta estos campos para mostrar:
- Un **calendario** con las actividades (casos) según su fecha de ejecución.
- El **presupuesto requerido en un período** dado, sumando el presupuesto (o la porción de él) cuya fecha de pago cae en ese período — no la fecha de ejecución, ya que son independientes.

Este dashboard es una vista derivada de los casos existentes, no una base de datos separada.

**Finanzas (alcance mínimo)**: por ahora finanzas se limita a esto: saber **cuánto presupuesto se necesita en cada período**. El Consejo es quien, desde el mismo dashboard de planificación, define los **períodos** (ej. mensuales, coincidentes con los períodos de expensas) y consulta el presupuesto requerido en cada uno, calculado a partir de las fechas de pago de los casos. No hay, por ahora, gestión de cobros, pagos efectivos ni conciliación — eso queda pendiente para una definición futura de finanzas.

## Notificaciones

El canal de comunicación general del consorcio es un **boletín oficial**: un store de publicaciones, independiente de los casos. Cada publicación es, por ahora, solo **texto** (a futuro se contempla la posibilidad de publicaciones generadas automáticamente, ej. reportes, sin que eso cambie la estructura básica de una publicación).

- Las publicaciones se pueden ver dentro de la plataforma (listado del boletín oficial).
- Además, se **envían por mail** a los usuarios correspondientes, según dos criterios: la **naturaleza de la publicación** (a definir, ej. categorías o tipos de aviso) y los **roles destino** (a qué roles va dirigida cada publicación).
- El envío por mail es un efecto de la publicación, no un store aparte: cada publicación registra a quién correspondía notificar y por qué canal.

Queda pendiente definir las categorías/naturalezas de publicación concretas y el detalle de qué dispara un reporte automatizado a futuro.

## Documentos

Además de los adjuntos a casos (ver [Casos o tickets](#3-casos-o-tickets)) y las publicaciones del boletín oficial (ver [Notificaciones](#notificaciones)), el MVP contempla un **repositorio general de documentos** del consorcio, no atado a un caso particular. Para el MVP se limita a:
- **Reglamento de copropiedad / consorcio**.
- **Actas de asamblea**.

Cada documento es un registro simple (archivo + metadatos: tipo, fecha, descripción), visible según rol siguiendo el mismo criterio de datos públicos/privados ya usado en el resto del sistema. Otros tipos de documento (ej. balances) quedan pendientes para una definición futura de finanzas.

## Integraciones

Para el MVP, la única integración externa necesaria es el **envío de mail** para las notificaciones del boletín oficial (ver [Notificaciones](#notificaciones)). No se contempla ninguna otra integración externa (pagos, contabilidad, calendarios, etc.) por ahora.

## Seguridad, cumplimiento y accesibilidad

**Accesibilidad**: no se adopta un estándar formal (ej. WCAG) para el MVP. El criterio es el ya definido en la Visión del [Plan de diseño](Design_Plan.md): simplicidad de uso para un grupo heterogéneo en alfabetización tecnológica, y diseño responsive. El detalle de UI queda para [Design_Requirements.md](Design_Requirements.md).

**Seguridad**: mecanismos mínimos para el MVP:
- Autenticación con contraseña y verificación de mail al dar de alta un usuario.
- Cifrado de datos sensibles en reposo (aplica en particular a los datos privados definidos en [Unidades funcionales](#2-unidades-funcionales) y a los datos de contacto de [Usuarios y roles](#1-usuarios-y-roles)).
- Registro de accesos: quién vio qué dato privado, siguiendo el mismo patrón de event log ya usado para casos.

**Cumplimiento normativo**: la plataforma debe cumplir la Ley de Protección de Datos Personales (Ley 25.326, Argentina), dado que administra datos personales y de contacto de propietarios e inquilinos. Esto refuerza la necesidad de la distinción entre datos públicos y privados, el cifrado en reposo y el registro de accesos ya mencionados.

## Concurrencia

Para el MVP se asume uso mayormente secuencial (pocos usuarios del consejo, no ediciones simultáneas frecuentes). Aun así, se contempla un mecanismo simple de **interlock** (bloqueo) al editar un registro: cuando alguien abre un caso o unidad para editar, el engine marca ese registro como "en edición" y evita que otra persona lo modifique al mismo tiempo, liberándolo al guardar, cancelar, o tras un timeout. Esto evita condiciones de carrera sin necesidad de un motor transaccional complejo. El detalle de implementación (cómo se marca, cómo expira) queda pendiente para la etapa técnica.

## Temas que quedan pendientes de este documento

- Matriz concreta de acciones permitidas por rol (una vez definidas las acciones de gestión).
- Categorías/naturalezas concretas de publicación del boletín oficial.
- Detalle técnico del interlock de concurrencia (cómo se marca y expira un bloqueo).

## Documentos relacionados

- [Plan de diseño](Design_Plan.md)
- [Requerimientos de diseño](Design_Requirements.md)
