const joi = require('joi');
const { fileSchema } = require("../file/file.joi_validation");

const createProductSchema = joi.object({
    name: joi.string().trim().required(),
    description: joi.string().trim().required(),
    category: joi.string().trim().required(),
    price: joi.string().trim().required(),
    unit: joi.number().integer().required(),
    supplier: joi.string().trim().hex().length(24).required(),
    available: joi.boolean().optional().default(true),
});
const createProductFileSchema = joi.object({
    productImages: joi.array().items(fileSchema).required(),
    thumbnailImage: joi.array().items(fileSchema).required(),
})

const getProductsSchema = joi.object({
    category: joi.string().trim().optional().default(null),
    available: joi.boolean().optional().default(null),
    search: joi.string().trim().optional().allow('').default(null),
    metaData: joi.object({
        sortBy: joi.string().trim().optional().default(null),
        sortOn: joi.string().trim().optional().default(null),
        offset: joi.number().optional().default(null),
        limit: joi.number().optional().default(null),
    }).optional().default(null)
})

const getProductDetailsSchema = joi.object({
    id: joi.string().trim().hex().length(24).required()
})


const updateProductSchema = joi.object({
    productId: joi.string().trim().hex().length(24).required(),
    name: joi.string().trim().optional().required(),
    description: joi.string().trim().optional().required(),
    category: joi.string().trim().optional().required(),
    price: joi.string().trim().optional().required(),
    unit: joi.number().integer().optional().required(),
    available: joi.boolean().optional().default(true),
})

const updateProductFileSchema = joi.object({
    productImages: joi.array().items(fileSchema).optional().default(null),
    thumbnailImage: joi.array().items(fileSchema).optional().default(null),
})

const deleteProductsSchema = joi.object({
    id: joi.string().trim().hex().length(24).required()
});

module.exports = {
    createProductSchema,
    getProductsSchema,
    updateProductSchema,
    deleteProductsSchema,
    getProductDetailsSchema,
    createProductFileSchema
};
