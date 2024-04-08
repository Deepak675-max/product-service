const amqplib = require("amqplib");
const ProductService = require("../../services/product/product.service");
const { PRODUCT_QUEUE, ORDER_PRODUCT_QUEUE, CART_PRODUCT_QUEUE } = require("../../config/index");
const { logger } = require("../error_logger/winston");

const connectToMessageBroker = async () => {
    try {
        const connection = await amqplib.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(PRODUCT_QUEUE);
        return { channel, connection };
    } catch (error) {
        console.log(error);
        logger.error(error.message, { status: error.status, path: __filename });
        throw error;
    }
}

const consumeMessage = (channel) => {
    try {
        channel.consume(PRODUCT_QUEUE, async (msg) => {
            const payload = JSON.parse(msg.content.toString());
            const productServiceInstance = new ProductService();
            // Retrieve data based on event
            const serviceResponse = await productServiceInstance.SubscribeEvents(payload);
            // Send service response
            if (serviceResponse) {
                if (payload.service == "Order")
                    channel.sendToQueue(ORDER_PRODUCT_QUEUE, Buffer.from(JSON.stringify(serviceResponse)));
                if (payload.service == "Cart")
                    channel.sendToQueue(CART_PRODUCT_QUEUE, Buffer.from(JSON.stringify(serviceResponse)));
            }
        }, { noAck: true });
    } catch (error) {
        console.log(error);
        logger.error(error.message, { status: error.status, path: __filename });
        throw error;
    }
}

module.exports = {
    connectToMessageBroker,
    consumeMessage
};