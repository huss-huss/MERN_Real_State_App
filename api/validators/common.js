const { z } = require('zod')

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'must be a valid id')

const idParams = z.object({ id: objectId })

module.exports = { z, objectId, idParams }
