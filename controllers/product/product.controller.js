const joiProduct = require('../../utils/joi/product/product.joi_validation');
const { logger } = require("../../utils/error_logger/winston.js");
const ProductService = require("../../services/product/product.service");
const FileModel = require("../../models/file/file.model.js");
const { DEFAULT_LIMIT, DEFAULT_OFFSET, DEFAULT_SORT_BY, DEFAULT_SORT_ORDER, APP_BACKEND_BASE_URL } = require("../../config/index.js");

const productService = new ProductService();

const createProduct = async (req, res, next) => {
    try {
        const productDetails = await joiProduct.createProductSchema.validateAsync(req.body);

        const filesDetails = await joiProduct.createProductFileSchema.validateAsync(req.files);

        const newProduct = await productService.createProduct(productDetails);

        await Promise.all(
            filesDetails.productImages.map(async (productImage) => {
                await FileModel.create({ ...productImage, productId: newProduct._id });
            })
        )

        await FileModel.create({ ...filesDetails.thumbnailImage[0], productId: newProduct._id });

        if (res.headersSent === false) {
            res.status(201).send({
                error: false,
                data: {
                    productDetails: newProduct,
                    message: "Product is created successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }

}

const getProducts = async (req, res, next) => {
    try {
        const querySchema = await joiProduct.getProductsSchema.validateAsync(req.body);
        const page = querySchema.metaData?.offset || DEFAULT_OFFSET;
        const pageSize = querySchema.metaData?.limit || DEFAULT_LIMIT;
        const sort = {};
        sort[DEFAULT_SORT_BY] = DEFAULT_SORT_ORDER;

        const queryDetails = {
            skip: (page - 1) * pageSize,
            limit: pageSize,
            sort: sort,
            where: {}
        };

        if (querySchema.category) {
            queryDetails.where.category = querySchema.category;
        }
        if (querySchema.available) {
            queryDetails.where.available = querySchema.available;
        }

        if (querySchema.search) {
            queryDetails.where.$or = [
                { description: { $regex: searchValue } },
                { category: { $regex: searchValue } }
            ];
        }

        const products = await productService.getProducts(queryDetails);

        const processedProducts = await Promise.all(
            products.map(async (product) => {
                const productThumbnailImage = await FileModel.findOne({
                    productId: product._id,
                    fieldname: "thumbnailImage",
                    isDeleted: false
                });
                if (productThumbnailImage)
                    product.thumbnailImage = `${APP_BACKEND_BASE_URL}/files/${productThumbnailImage.filename}`
                else
                    product.thumbnailImage = null;
                return product;
            })
        )

        // Send the response
        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    products: processedProducts,
                    message: "Products fetched successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }
}

const getProductDetails = async (req, res, next) => {
    try {
        const { id: productId } = await joiProduct.getProductDetailsSchema.validateAsync(req.params);

        const product = await productService.getProductDetails(productId);

        const productThumbnailImage = await FileModel.findOne({
            productId: product._id,
            fieldname: "thumbnailImage",
            isDeleted: false
        });

        if (productThumbnailImage) {
            product.thumbnailImage = `${APP_BACKEND_BASE_URL}/files/${productThumbnailImage.filename}`;
        } else {
            product.thumbnailImage = null; // Set image to null if not found
        }

        // Send the response
        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    product: product,
                    message: "Product fetched successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }
}

const updateProduct = async (req, res, next) => {
    try {
        const productDetails = await joiProduct.updateProductSchema.validateAsync(req.body);

        const updatedProduct = await productService.updateProduct(productDetails);

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    product: updatedProduct,
                    message: "Product is updated successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }
}

const deleteProducts = async (req, res, next) => {
    try {
        const { id: productId } = await joiProduct.deleteProductsSchema.validateAsync(req.params);

        await productService.deleteProduct(productId);

        if (res.headersSent === false) {
            res.status(201).send({
                error: false,
                data: {
                    message: "Products deleted successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }
}

module.exports = {
    createProduct,
    getProducts,
    getProductDetails,
    updateProduct,
    deleteProducts,
}