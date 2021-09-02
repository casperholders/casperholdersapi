const swaggerJsdoc = require('swagger-jsdoc');
const fs = require("fs");
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CasperHolders API',
            version: '1.0.0',
        },
    },
    apis: [path.resolve(__dirname, 'routes/*.js')],
};

const openapiSpecification = swaggerJsdoc(options);

console.log(JSON.stringify(openapiSpecification, null, 2))

try {
    fs.writeFileSync('swagger.json', JSON.stringify(openapiSpecification, null, 2))
} catch (e) {
    console.log("Failed to generate the swagger :(")
    console.log(e);
}