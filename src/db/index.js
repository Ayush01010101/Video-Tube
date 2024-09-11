import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
async function connect() {
  try {
    const connect = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`,
    );
    console.log("HOSTING START ON   : ",connect.connection.host);
  } catch (error) {
    console.log("error in connection ", error);
  }
}

export default connect;
