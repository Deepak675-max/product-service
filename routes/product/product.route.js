const express = require("express");

const authMiddleware = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/file.middleware');

const productController = require('../../controllers/product/product.controller');

const productServiceRouter = express.Router();

productServiceRouter.post('/create-product',
    authMiddleware.authenticateUser,
    upload.fields([
        { name: "productImages", maxCount: 5 },
        { name: "thumbnailImage", maxCount: 1 }
    ]),
    productController.createProduct
);

productServiceRouter.post('/get-products',
    authMiddleware.authenticateUser,
    productController.getProducts
);

productServiceRouter.get('/get-product/:id',
    authMiddleware.authenticateUser,
    productController.getProductDetails
);

productServiceRouter.put('/update-product',
    authMiddleware.authenticateUser,
    productController.updateProduct
);

productServiceRouter.delete('/delete-product/:id',
    authMiddleware.authenticateUser,
    productController.deleteProducts
);

module.exports = productServiceRouter;