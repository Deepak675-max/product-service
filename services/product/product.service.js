const productModel = require("../../models/product/product.model");
const ProductModel = require("../../models/product/product.model");
const httpErrors = require('http-errors');

class ProductService {

    async createProduct(productInputs) {
        const newProduct = new ProductModel(productInputs);
        const savedProduct = await newProduct.save();
        return savedProduct;
    }

    async getProducts(queryDetails) {
        const { where, skip, pageSize, sort } = queryDetails;
        const products = await ProductModel
            .find(where)
            .skip(skip)
            .limit(pageSize)
            .sort(sort)
            .select("-isDeleted -createdAt -updatedAt")
            .lean()

        return products;
    }

    async getProductDetails(productId) {
        try {
            const product = await ProductModel.findOne({
                _id: productId,
                isDeleted: false
            }).select("-isDeleted -createdAt -updatedAt").lean();
            if (!product) throw httpErrors.NotFound(`Product not found`);
            return product;
        } catch (error) {
            throw error;
        }
    }

    async updateProduct(productDetails) {
        try {
            const updatedProduct = await productModel.findOneAndUpdate({ _id: productDetails.productId, isDeleted: false }, productDetails, {
                new: true
            });
            if (!updatedProduct) throw httpErrors.NotFound('Product not found');
            return updatedProduct;
        } catch (error) {
            throw error;
        }
    }

    async deleteProduct(productId) {
        try {
            const product = await ProductModel.findByIdAndUpdate(
                {
                    _id: productId,
                    isDeleted: false
                },
                {
                    $set: {
                        isDeleted: true
                    }
                },
                { new: true }
            );
            if (!product) throw httpErrors.NotFound("Product not found");
        } catch (error) {
            throw error;
        }
    }

    async updateProductsInventory(items) {
        try {
            await Promise.all(
                items.map(async (item) => {
                    const product = await this.getProductDetails(item.product._id);
                    const remainingUnit = product.unit - item.unit;
                    product.unit = remainingUnit;
                    await product.save();
                })
            )
        } catch (error) {
            throw error;
        }
    }

    async SubscribeEvents(payload) {
        // describe events here.
        const { items, event } = payload;

        switch (event) {
            case "UPDATE_PRODUCTS_INVENTORY":
                await this.updateProductsInventory(items);
                break;

            default:
                break;
        }
    }

}

module.exports = ProductService;