const rolesPermissions = {

  administrador: {
    restaurantes: ['create', 'read', 'update', 'delete'],
    menu_items: ['create', 'read', 'update', 'delete'],
    ordenes: ['create', 'read', 'update'],
    usuarios: ['read']
  },

  caja: {
    ordenes: ['create', 'read', 'update'],
    menu_items: ['read']
  },

  repartidor: {
    ordenes: ['read', 'update']
  },

  usuario: {
    ordenes: ['create', 'read']
  }

};

module.exports = rolesPermissions;