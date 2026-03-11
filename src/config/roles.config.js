const rolesPermissions = {

  administrador: {
    restaurantes: ['create', 'read', 'update', 'delete'],
    menu_items: ['create', 'read', 'update', 'delete'],
    ordenes: ['create', 'read', 'update'],
    usuarios: ['read'],
    promociones: ['create', 'read', 'update', 'delete'],
    resenas: ['read']
  },

  caja: {
    ordenes: ['create', 'read', 'update'],
    menu_items: ['read'],
    restaurantes: ['read']
  },

  repartidor: {
    ordenes: ['read', 'update']
  },

  usuario: {
    restaurantes: ['read'],
    menu_items: ['read'],
    ordenes: ['create', 'read'],
    promociones: ['read'],
    resenas: ['read', 'create']
  }

};

module.exports = rolesPermissions;