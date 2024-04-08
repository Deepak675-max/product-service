const express = require('express');
const httpErrors = require("http-errors");
const cors = require("cors");
const path = require("path");
const productServiceBackendApp = express();
const http = require('http');
const cookieParser = require('cookie-parser');
require("./utils/database/init_mongodb");
const server = http.createServer(productServiceBackendApp);
const { APP_PORT } = require("./config/index");
const { connectToMessageBroker, consumeMessage } = require("./utils/message_broker/rabbitmq");

productServiceBackendApp.use(cors());
productServiceBackendApp.use(cookieParser());
productServiceBackendApp.use(express.json());
productServiceBackendApp.use(express.urlencoded({ extended: true }));
productServiceBackendApp.use(express.static(path.join(__dirname, 'public')));

connectToMessageBroker().then(async (data) => {
    consumeMessage(data.channel);
});

const productServiceRoutes = require("./routes/product/product.route");
productServiceBackendApp.use("/api", productServiceRoutes);

productServiceBackendApp.use(async (req, _res, next) => {
    next(httpErrors.NotFound(`Route not Found for [${req.method}] ${req.url}`));
});

// Common Error Handler
productServiceBackendApp.use((error, req, res, next) => {
    const responseStatus = error.status || 500;
    const responseMessage =
        error.message || `Cannot resolve request [${req.method}] ${req.url}`;
    if (res.headersSent === false) {
        res.status(responseStatus);
        res.send({
            error: {
                status: responseStatus,
                message: responseMessage,
            },
        });
    }
    next();
});

const port = APP_PORT;

server.listen(port, () => {
    console.log("Product Service is running on the port " + port)
})




