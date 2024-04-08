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
            const updatedProduct = await ProductModel.findOneAndUpdate({ _id: productDetails.productId, isDeleted: false }, productDetails, {
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
                    const product = await ProductModel.findOne({
                        _id: item.product._id,
                        isDeleted: false
                    });
                    const remainingUnit = product.unit - item.unit;
                    product.unit = remainingUnit;
                    await product.save();
                })
            )
            // return { success: true, message: "Product Inventory updated Successfully" };
            console.log("Product Inventory updated Successfully");
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async SubscribeEvents(payload) {
        // describe events here.
        const { data, event } = payload;

        switch (event) {
            case "UPDATE_PRODUCTS_INVENTORY":
                await this.updateProductsInventory(data);
                break;

            default:
                break;
        }
    }

}

module.exports = ProductService;