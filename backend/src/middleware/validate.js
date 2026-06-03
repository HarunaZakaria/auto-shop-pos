// Validates req.body / req.query / req.params with a zod schema.
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    res.status(400);
    const err = new Error("Validation failed");
    err.issues = result.error.issues;
    return next(err);
  }
  req[source] = result.data;
  next();
};

module.exports = validate;
