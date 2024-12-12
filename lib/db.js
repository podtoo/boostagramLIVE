class Database {
    async connect() {
      throw new Error("connect() method not implemented");
    }
  
    async get(collection, query) {
      throw new Error("get() method not implemented");
    }
  
    async insert(collection, data) {
      throw new Error("insert() method not implemented");
    }

    async update(collection, id, data) {
      throw new Error("update() method not implemented");
    }

    async remove(collection, id) {
      throw new Error("remove() method not implemented");
    }
  }
  
  export default Database;
  