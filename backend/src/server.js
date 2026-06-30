import dotenv from 'dotenv';
import 'dotenv/config';
import app from "./app.js";
import connectDB from "./config/db.js";
import cloudinaryHealthCheck from "./config/cloudinaryHealthCheck.js";
import errorHandler from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";
import http from "http";

import { initSocket } from "./socket/socket.js";
import cron from "node-cron";
import { abandonedCartJob } from "./jobs/abandonedCartJob.js";

//----- Load environment variables

dotenv.config();

const startServer = async() => {
    try {
        await connectDB();

        await cloudinaryHealthCheck();

        const PORT = process.env.PORT || 3500;
        cron.schedule(
            "0 * * * *",
            async()=>{
                await abandonedCartJob();
        });
        const server = http.createServer(app);
        initSocket(server);
        app.use(errorHandler);
        server.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

    }catch(error) {
        logger.error(error);
        process.exitCode = 1;
    }
};

startServer();