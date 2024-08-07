const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],  // No HTML tags are allowed
                    allowedAttributes: {},  // No HTML attributes are allowed
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value });
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().custom((value, helpers) => extension(Joi).rules.escapeHTML.validate(value, helpers)),
        price: Joi.number().required().greater(0),
        location: Joi.string().required().custom((value, helpers) => extension(Joi).rules.escapeHTML.validate(value, helpers)),
        description: Joi.string().required().custom((value, helpers) => extension(Joi).rules.escapeHTML.validate(value, helpers))
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required(),
        body: Joi.string().required().custom((value, helpers) => extension(Joi).rules.escapeHTML.validate(value, helpers))
    }).required()
});
