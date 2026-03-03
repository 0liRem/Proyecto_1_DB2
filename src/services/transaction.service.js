//Global service for transactions.
const { getDB } = require('../config/db.js');

async function withTransaction(callback) {
  const db = getDB(); //Connect DB
  const session = db.client.startSession();
//Tries to make a transactions
  try {
    session.startTransaction();

    const result = await callback(session);

    await session.commitTransaction();
    return result;

  } catch (error) {
    await session.abortTransaction();
    throw error;

  } finally {
    await session.endSession();
  }
}

module.exports = { withTransaction };