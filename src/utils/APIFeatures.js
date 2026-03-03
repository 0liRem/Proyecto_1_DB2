class APIFeatures {
  constructor(collection, queryString) {
    this.collection = collection;
    this.queryString = queryString;
    this.mongoQuery = {};
    this.options = {};
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['sort', 'limit', 'page', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Operadores avanzados
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|regex)\b/g,
      match => `$${match}`
    );

    this.mongoQuery = JSON.parse(queryStr);

    return this;
  }

  search() {
    if (this.queryString.search) {
      this.mongoQuery.$text = { $search: this.queryString.search };
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.options.sort = this.queryString.sort
        .split(',')
        .reduce((acc, field) => {
          if (field.startsWith('-')) {
            acc[field.substring(1)] = -1;
          } else {
            acc[field] = 1;
          }
          return acc;
        }, {});
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;

    this.options.skip = skip;
    this.options.limit = limit;

    return this;
  }

  build() {
    //Soft Delete
     this.mongoQuery.eliminado = { $ne: true };
    return {
      filter: this.mongoQuery,
      options: this.options
    };
  }
}



module.exports = APIFeatures;