# 🍽️ SIGR - Exquisito al Paladar

**Sistema Integral de Gestión de Restaurante (SIGR)**

Una aplicación web frontend diseñada para optimizar y gestionar los procesos operativos y administrativos del restaurante **Exquisito al Paladar**. Este sistema facilita el control de pedidos, la gestión de usuarios, la administración del menú digital y el seguimiento de procesos internos de manera intuitiva y eficiente.

---

## 🚀 Funcionalidades Principales (Módulos)

* **Autenticación de Usuarios:** Sistema de login y registro para simular diferentes niveles de acceso (Clientes, Meseros, Administrador).
* **Menú Digital Interactivo:** Catálogo organizado por categorías (Entradas, Platos Fuertes, Bebidas, Postres) con interfaz para agregar productos al pedido.
* **Gestión de Pedidos:** Carrito de compras dinámico y seguimiento de los pedidos realizados.
* **Sistema de Reservas:** Formulario interactivo para agendar mesas según fecha, hora y cantidad de comensales.
* **Cierre de Caja y Reportes:** Módulo administrativo para la consolidación de ventas diarias y resumen de operaciones.

## 🛠️ Tecnologías Utilizadas

* **Estructura y Diseño:** HTML5, CSS3
* **Lógica e Interactividad:** JavaScript (Vanilla JS)
* **Persistencia de Datos:** `localStorage` (Web Storage API)
* **Control de Versiones:** Git y GitHub

## 📂 Estructura del Proyecto


exquisito-al-paladar/
│
├── assets/         # Imágenes, logos y recursos gráficos del restaurante
├── css/            # Hojas de estilo y diseño de la interfaz
├── js/             # Scripts de interactividad y lógica de negocio
├── index.html      # Punto de entrada principal de la aplicación
└── README.md       # Documentación técnica del proyecto
⚙️ Manual de Despliegue (Instalación Local)
El proyecto está diseñado para ejecutarse completamente en el lado del cliente (Frontend), por lo que no requiere la configuración de servidores de backend o bases de datos externas.

Clonar el repositorio:

Bash
git clone https://github.com/JEIMYJJ/Restaurante.git](https://github.com/JEIMYJJ/Restaurante.git
Navegar al directorio del proyecto:

Bash
cd sigr
Ejecutar la aplicación:

Opción A (Básica): Abre el archivo index.html haciendo doble clic sobre él. Se abrirá en tu navegador web predeterminado.

Opción B (Recomendada para desarrollo): Abre el proyecto en Visual Studio Code y utiliza la extensión Live Server para habilitar la recarga dinámica.

💾 Estructura de Datos (Almacenamiento Local)
Durante esta fase del proyecto (Línea Base), la persistencia de datos se gestiona mediante el localStorage del navegador. A continuación, se presenta un esquema en formato JSON que ilustra cómo se estructura un pedido en la memoria del sistema:


JSON
{
  "idPedido": "PED-001",
  "cliente": "Usuario Estándar",
  "items": [
    {
      "producto": "Limonada de Coco",
      "precio": 11500,
      "cantidad": 2
    },
    {
      "producto": "Limonada Natural",
      "precio": 9000,
      "cantidad": 1
    }
  ],
  "totalCalculado": 32000,
  "estado": "En preparación"
}

👥 Equipo de Desarrollo
Jeimy Julieth Jimenez Sierra,
Adriana del Pilar Martinez Bautista,
Omar Santiago Vallejo Rodriguez,
Jorge Stiven Ramirez Valbuena
