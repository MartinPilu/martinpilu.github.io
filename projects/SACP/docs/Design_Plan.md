# SACP - Sistema de Administración de Consorcio de Propietarios
# Plan de diseño

## Glosario
1. Consorcio: Un consorcio de propietarios es la persona jurídica que forman los dueños de departamentos o locales en un edificio o complejo.

2. Administrador: Persona humana o jurídica elegida en asamblea para representar legalmente al consorcio, cobrar expensas y mantener el lugar. En la Ciudad de Buenos Aires, debe estar anotado en el Registro Público de Administradores.

3. Consejo de propietarios: Grupo de vecinos que ayuda a controlar las cuentas y vigila el trabajo del administrador.

4. Usuarios: Personas que interactúan con la plataforma. Inicialmente se consideran propietarios, inquilinos, miembros del consejo de propietarios y personas vinculadas con la administración del consorcio.

5. Gestión: Actividades necesarias para dar seguimiento y solución a casos del consorcio.

6. Acciones de gestión: Funcionalidades provistas por la plataforma para llevar adelante la gestión.

## Vision
Crear una plataforma para consorcios de propietarios que permita gestionar, registrar y comunicar las actividades del consorcio de manera transparente y accesible para la comunidad.

La gestión de tareas del consorcio, como reclamos, trabajos de mantenimiento y reparación, mejoras, finanzas y acuerdos, conlleva una gran responsabilidad por parte del consejo y la administración. En muchas ocasiones, el consejo que interactúa con la administración no posee los conocimientos ni las herramientas para representar al consorcio en la gestión. Por ello, esta plataforma tiene como pilares principales la accesibilidad a herramientas de gestión y la comunicación clara.

Accesibilidad: Se basa en proveer una base de funcionalidades que pueda ser utilizada por un grupo heterogéneo en edad y alfabetización tecnológica, según la complejidad de cada acción de gestión.

Comunicación clara: Se basa en proveer acceso y distribución de información actualizada a los usuarios de manera accesible.

## Requerimientos generales
1. Debe ser una plataforma web.
2. Debe permitir la gestión de información ordenada por unidad funcional.
3. Debe permitir la gestión de acciones relacionadas con unidades funcionales.
4. Debe contar con niveles de acceso según el rol para diferentes acciones de gestión.
5. Debe permitir la gestión de comunicados y publicaciones.
6. Debe proveer herramientas de autogestión para determinadas acciones de gestión.
7. Debe proveer herramientas de gestión para la planificación de actividades.

## MVP

El MVP contempla un único consorcio y está orientado principalmente al consejo de propietarios como veedor de la gestión del consorcio.

El sistema debe funcionar como una historia clínica del consorcio: un registro organizado de sus unidades, situaciones, decisiones, actividades y antecedentes. La administración y las demás partes podrán interactuar con la plataforma, pero el MVP no busca ofrecer un producto comercial para administradores externos.

Se prioriza la gestión interna, la organización de la información y la protección de los datos privados.

El uso de la plataforma por parde de propietarios e inquilinos es opcional y no debe bloquear la capcidad de gestion por parte del consejo. 

### Alcance inicial
- Plataforma web.
- Registro de información organizada por unidad funcional.
- Registro de usuarios separado de las unidades funcionales, contemplando que una persona pueda estar asociada a más de una unidad.
- Información básica de las unidades funcionales: identificación, propietarios, inquilinos, coeficiente de copropiedad, cocheras, bauleras, datos de contacto y estado de ocupación.
- Consideración de espacios comunes del consorcio.
- Registro de casos o tickets relacionados con unidades funcionales.
- Estados para el seguimiento de casos, tomando como referencia: nuevo, asignado, en progreso, pendiente, resuelto y cerrado.
- Registro de responsables, fechas límite, presupuesto, proveedor, adjuntos, comentarios y evidencias fotográficas cuando corresponda.
- Gestión de comunicados y publicaciones por mail y en la plataforma web.
- Herramientas iniciales de autogestión para acciones que se definirán posteriormente.
- Herramientas para planificar actividades del consorcio.
- Protección de la información privada como prioridad de diseño.

### Temas a definir posteriormente

- ~~Roles, permisos y acciones disponibles para cada tipo de usuario~~ → roles base definidos en [Architecture.md](Architecture.md#roles-y-permisos); falta la matriz concreta de acciones por rol.
- ~~Alcance de la participación de propietarios, inquilinos y administración~~ → propietarios e inquilinos ven todos los casos, todos los datos (públicos y privados) de su unidad, y solo los públicos de otras unidades (ver [Architecture.md](Architecture.md#roles-y-permisos) y [Architecture.md](Architecture.md#2-unidades-funcionales)).
- ~~Diferencias entre casos, reclamos, tareas, mantenimientos, reparaciones y mejoras~~ → resuelto en [Architecture.md](Architecture.md#3-casos-o-tickets): mismo store, distinguido por campo tipo.
- ~~Reglas de transición entre estados y condiciones para cerrar un caso~~ → se permiten retrocesos, con trazabilidad completa vía event log; el Consejo puede cerrar un caso sin aprobación adicional (ver [Architecture.md](Architecture.md#3-casos-o-tickets)).
- ~~Necesidad, alcance y complejidad del historial de cambios y la auditoría~~ → resuelto conceptualmente en [Architecture.md](Architecture.md#3-casos-o-tickets) (event log por caso).
- ~~Alta, validación y administración de usuarios y su relación con las unidades~~ → el Consejo da de alta usuarios directamente; el Propietario puede solicitar alta de inquilinos por autogestión, sujeta a validación del Consejo (ver [Architecture.md](Architecture.md#1-usuarios-y-roles)).
- ~~Aprobaciones del consejo, de la administración o de una asamblea~~ → para el MVP, solo el Consejo gestiona casos (alta, modificación, cierre); sin aprobación adicional de Administración o asamblea (ver [Architecture.md](Architecture.md#3-casos-o-tickets)).
- ~~Funcionalidades concretas de autogestión y planificación~~ → resuelto el mínimo: autogestión en [Architecture.md](Architecture.md#autogestión); planificación básica —calendario y presupuesto por período— en [Architecture.md](Architecture.md#planificación).
- ~~Alcance de documentos, finanzas, notificaciones e integraciones~~ → finanzas: presupuesto necesario por período, definido/consultado por el Consejo en el dashboard de planificación (ver [Architecture.md](Architecture.md#planificación)). Notificaciones: boletín oficial de publicaciones de texto, visibles en la plataforma y enviadas por mail según naturaleza y roles destino (ver [Architecture.md](Architecture.md#notificaciones)). Documentos: repositorio general (reglamento de copropiedad, actas de asamblea) separado de los casos (ver [Architecture.md](Architecture.md#documentos)). Integraciones: solo envío de mail por ahora (ver [Architecture.md](Architecture.md#integraciones)).
- Requisitos detallados de accesibilidad, seguridad y cumplimiento normativo → resuelto en su alcance MVP: accesibilidad sin estándar formal (simplicidad + responsive); seguridad con autenticación por contraseña y verificación de mail, cifrado en reposo de datos sensibles y registro de accesos; cumplimiento de la Ley de Protección de Datos Personales (Ley 25.326, Argentina) (ver [Architecture.md](Architecture.md#seguridad-cumplimiento-y-accesibilidad)).

Ver también: [Arquitectura de datos y sistema](Architecture.md) y [Definición visual](Visual_Design.md).

## Estado de la documentación

Todos los temas de este documento están resueltos en su alcance MVP. Los requerimientos funcionales y de datos completos viven en [Architecture.md](Architecture.md); los de experiencia e interfaz, en [Design_Requirements.md](Design_Requirements.md). Los únicos puntos abiertos son de detalle, no bloquean el inicio de la implementación:

- Matriz concreta de acciones permitidas por rol (ver [Architecture.md](Architecture.md#roles-y-permisos)).
- Categorías/naturalezas concretas de publicación del boletín oficial (ver [Architecture.md](Architecture.md#notificaciones)).
- Detalle técnico del interlock de concurrencia (ver [Architecture.md](Architecture.md#concurrencia)).
- Valores concretos del sistema visual y patrón de navegación (ver [Visual_Design.md](Visual_Design.md)).

## Etapas de implementación

La implementación no se aborda de una sola vez: se divide en etapas incrementales, cada una con una demo funcional acotada. El alcance completo del MVP (ver [Alcance inicial](#alcance-inicial)) se va cubriendo a lo largo de varias etapas; las que siguen a la Etapa 2 se definirán más adelante.

### Etapa 1

Objetivo: primera demo funcional, acceso exclusivo del rol **Consejo**.

- Login/autenticación del rol Consejo (ver [Architecture.md](Architecture.md#seguridad-cumplimiento-y-accesibilidad)).
- Creación del config file del consorcio (ver [Architecture.md](Architecture.md#config-file-del-consorcio)), para que el consorcio exista como entidad.
- Alta de unidades funcionales (identificador mínimo), como parte de esa configuración inicial.
- Crear un caso.
- Asignar el caso a una unidad funcional.

No incluye estado, presupuesto, fechas, adjuntos ni ningún otro campo del caso más allá de su asociación a una unidad — eso queda para la Etapa 2.

### Etapa 2

Objetivo: sigue siendo acceso exclusivo del rol **Consejo**, ampliando el caso creado en la Etapa 1 con más propiedades.

- Adjuntar documentación a un caso.
- Definir fecha (de ejecución) del caso.
- Definir presupuesto asignado del caso.