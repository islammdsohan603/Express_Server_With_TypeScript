import dotenv from "dotenv";
import express from "express";
import { Pool } from "pg";
dotenv.config();
const app = express();
app.use(express.json()); // for parsing application/json
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
console.log(pool);
// Get port from environment variable
const port = process.env.PORT || 5000;
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Express with TypeScript Server is running",
        author: "SOHAN",
    });
});
app.post("/", async (req, res) => {
    const { name, age, password } = req.body;
    res.status(200).json({
        success: true,
        message: "Post method",
        data: { name, age },
    });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=server.js.map