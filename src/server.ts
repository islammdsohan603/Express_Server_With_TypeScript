import express, { type Request, type Response } from "express";

const app = express();

app.use(express.json());

const port = process.env.PORT || 5000;

app.get("/", async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: "Server is Connected Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is Running on ${port}`);
});
